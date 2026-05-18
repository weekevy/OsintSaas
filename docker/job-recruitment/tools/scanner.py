import asyncio
import aiohttp
import aiomysql
import json
import os
import re
import ssl
import socket
import logging
import hashlib
from datetime import datetime, timezone
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import tldextract
import whois
from typing import Optional, List, Dict, Any

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("ScannerEngine")

# ══════════════════════════════════════════════════════════════════════════════
#  THREAT INTELLIGENCE CONSTANTS
# ══════════════════════════════════════════════════════════════════════════

SCAM_KEYWORDS = {
    "high": ["wire transfer", "payment required", "bitcoin", "easy money", "crypto payment", "western union", "moneygram", "gift card", "advance fee"],
    "medium": ["guaranteed income", "no experience needed", "work from home", "make money fast", "urgent", "congratulations"],
    "low": ["limited time offer", "act now", "verify your account", "identity verification"]
}

PHISHING_PATTERNS = [
    r"paypa[l1]", r"g[o0]{2}gle", r"[a4]mazon", r"micros[o0]ft",
    r"[il1]nked[il1]n", r"[il1]nstagram", r"[a4]pple[- ]support",
    r"[a4]ccount[- ][il1]ssue", r"secur[il1]ty[- ]alert",
]

SUSPICIOUS_TLDS = {".xyz", ".top", ".club", ".online", ".site", ".website", ".info", ".biz", ".cc", ".tk", ".ml", ".ga", ".cf"}
LEGIT_FREE_EMAIL = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com", "icloud.com", "aol.com"}
SEVERITY_WEIGHTS = {"critical": 45, "high": 25, "medium": 15, "low": 5, "info": 0}

# ══════════════════════════════════════════════════════════════════════════════
#  SCANNER ENGINE (REFACTORED)
# ══════════════════════════════════════════════════════════════════════════════

class ScannerEngine:
    def __init__(self, scan_id: int, target: str, user_id: int):
        self.scan_id = scan_id
        self.target = target.strip()
        self.user_id = user_id
        self.started_at = datetime.now(timezone.utc)
        
        # State & Cache
        self.assets = {}
        self.raw_data = {
            "html": "",
            "headers": {},
            "status": 0,
            "whois": None,
            "ssl": None,
            "soup": None
        }
        self.findings = []
        self.metadata = {}
        
        # Config
        self.db_config = {
            "host": os.getenv("MARIADB_HOST", "mariadb"),
            "user": os.getenv("MARIADB_USER", "root"),
            "password": os.getenv("MARIADB_PASSWORD", "rootpassword123"),
            "db": os.getenv("MARIADB_DATABASE", "osint_db"),
        }
        
        self._parse_target(self.target)

    def _parse_target(self, target_str):
        is_url = bool(re.match(r'^https?://', target_str)) or '.' in target_str
        if is_url:
            parsed = urlparse(target_str if "://" in target_str else f"http://{target_str}")
            self.hostname = parsed.netloc or parsed.path.split("/")[0]
            ext = tldextract.extract(target_str)
            self.domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else self.hostname
            self.base_url = f"{parsed.scheme or 'http'}://{self.hostname}"
        else:
            self.hostname = self.domain = self.base_url = None

    async def _db_conn(self):
        return await aiomysql.connect(**self.db_config)

    async def add_finding(self, title: str, description: str, severity: str = "medium", category: str = "general", evidence: str = ""):
        self.findings.append({"title": title, "description": description, "severity": severity, "category": category})
        logger.info(f"[{severity.upper()}] {title}")
        
        try:
            conn = await self._db_conn()
            async with conn.cursor() as cur:
                await cur.execute(
                    \"\"\"INSERT INTO findings (scan_id, target_id, project_id, finding_type, severity, title, description, evidence, created_at)
                       SELECT s.id, s.target_id, t.project_id, %s, %s, %s, %s, %s, NOW()
                       FROM scans s JOIN targets t ON s.target_id = t.id WHERE s.id = %s\"\"\",
                    (category, severity, title, description, evidence, self.scan_id),
                )
                await conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"DB Error saving finding: {e}")

    async def update_progress(self, progress: int, status: str = "running"):
        try:
            conn = await self._db_conn()
            async with conn.cursor() as cur:
                await cur.execute("UPDATE scans SET progress=%s, status=%s WHERE id=%s", (progress, status, self.scan_id))
                await conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"DB Progress Error: {e}")

    # ── PHASE 1: DISCOVERY ──────────────────────────────────────────────────

    async def discovery_phase(self, session: aiohttp.ClientSession):
        logger.info("📡 Starting Discovery Phase...")
        tasks = []
        
        # 1. Fetch Assets from DB
        tasks.append(self._fetch_assets_task())
        
        # 2. Web Data (if URL exists)
        if self.base_url:
            tasks.append(self._fetch_web_data_task(session))
            tasks.append(self._fetch_whois_task())
            tasks.append(self._fetch_ssl_task())
            
        await asyncio.gather(*tasks)

    async def _fetch_assets_task(self):
        try:
            conn = await self._db_conn()
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM job_recruitment_scans WHERE scan_id = %s", (self.scan_id,))
                self.assets = await cur.fetchone() or {}
            conn.close()
            if not self.base_url:
                potential_url = self.assets.get('job_url') or self.assets.get('company_website')
                if potential_url: self._parse_target(potential_url)
        except Exception as e: logger.error(f"Asset fetch failed: {e}")

    async def _fetch_web_data_task(self, session: aiohttp.ClientSession):
        try:
            async with session.get(self.base_url, timeout=15, ssl=False) as resp:
                self.raw_data["status"] = resp.status
                self.raw_data["headers"] = dict(resp.headers)
                self.raw_data["html"] = await resp.text(errors="replace")
                self.raw_data["soup"] = BeautifulSoup(self.raw_data["html"], "html.parser")
        except Exception as e: logger.warning(f"Web fetch failed: {e}")

    async def _fetch_whois_task(self):
        try:
            loop = asyncio.get_event_loop()
            self.raw_data["whois"] = await loop.run_in_executor(None, whois.whois, self.domain)
        except Exception: pass

    async def _fetch_ssl_task(self):
        if not self.hostname: return
        loop = asyncio.get_event_loop()
        def _check():
            try:
                with ssl.create_default_context().wrap_socket(socket.create_connection((self.hostname, 443), timeout=5), server_hostname=self.hostname) as s:
                    return s.getpeercert()
            except: return None
        self.raw_data["ssl"] = await loop.run_in_executor(None, _check)

    # ── PHASE 2: ANALYSIS ───────────────────────────────────────────────────

    async def analysis_phase(self):
        logger.info("🧠 Starting Analysis Phase...")
        tasks = [self.analyze_assets()]
        if self.base_url:
            tasks.extend([
                self.analyze_domain(),
                self.analyze_ssl(),
                self.analyze_content(),
                self.analyze_headers()
            ])
        await asyncio.gather(*tasks)

    async def analyze_assets(self):
        # 1. Text Analysis
        text = " ".join([str(v) for k, v in self.assets.items() if v and isinstance(v, str)]).lower()
        for sev, keywords in SCAM_KEYWORDS.items():
            hits = [kw for kw in keywords if kw in text]
            if hits:
                await self.add_finding(f"Suspicious Terms in Assets ({sev})", f"Found: {', '.join(hits)}", sev, "content")

        # 2. Recruiter Check
        email = self.assets.get('recruiter_email')
        if email:
            dom = email.split('@')[-1].lower()
            if dom in LEGIT_FREE_EMAIL:
                await self.add_finding("Recruiter using Free Email", f"Using {dom} is unusual for major firms.", "high", "assets")

    async def analyze_domain(self):
        w = self.raw_data["whois"]
        if not w: return
        
        # Domain Age
        creation = w.creation_date
        if isinstance(creation, list): creation = creation[0]
        if creation:
            age = (datetime.now(timezone.utc) - creation.replace(tzinfo=timezone.utc) if creation.tzinfo else datetime.now() - creation).days
            if age < 90: await self.add_finding("New Domain", f"Domain is only {age} days old.", "critical", "domain")
            self.metadata["domain_age"] = age

    async def analyze_ssl(self):
        cert = self.raw_data["ssl"]
        if not cert:
            if self.base_url: await self.add_finding("Missing/Invalid SSL", "No valid SSL certificate found.", "high", "ssl")
            return
        issuer = dict(x[0] for x in cert.get("issuer", []))
        if "Let's Encrypt" in issuer.get("organizationName", ""):
            await self.add_finding("Free SSL Certificate", "Using Let's Encrypt - common for temporary scam sites.", "low", "ssl")

    async def analyze_content(self):
        soup = self.raw_data["soup"]
        if not soup: return
        
        # Phishing check
        text = self.raw_data["html"].lower()
        for p in PHISHING_PATTERNS:
            if re.search(p, text):
                await self.add_finding("Brand Impersonation Detected", f"Matches pattern: {p}", "critical", "content")

        # Form check
        if soup.find_all("input", {"type": "password"}):
            await self.add_finding("Credential Harvesting Risk", "Found password fields on an unverified site.", "high", "content")

    async def analyze_headers(self):
        h = self.raw_data["headers"]
        if not h: return
        missing = [x for x in ["strict-transport-security", "content-security-policy"] if x not in {k.lower(): v for k, v in h.items()}]
        if missing: await self.add_finding("Weak Security Headers", f"Missing: {', '.join(missing)}", "medium", "headers")

    # ── PHASE 3: CORRELATION ────────────────────────────────────────────────

    async def correlation_phase(self):
        logger.info("🔗 Starting Correlation Phase...")
        
        # 1. Domain vs Email Consistency
        email = self.assets.get('recruiter_email')
        if email and self.domain:
            email_dom = email.split('@')[-1].lower()
            if email_dom not in LEGIT_FREE_EMAIL and email_dom != self.domain:
                await self.add_finding("Domain Inconsistency", f"Recruiter email domain ({email_dom}) does not match website ({self.domain}).", "critical", "correlation")

        # 2. Information Density
        asset_count = len([v for v in self.assets.values() if v])
        if asset_count < 3:
            await self.add_finding("Low Information Density", "Very few assets provided. Common in bulk-generated scams.", "medium", "correlation")

    # ── EXECUTION ───────────────────────────────────────────────────────────

    async def run(self):
        logger.info(f"🚀 Starting High-Performance Scan #{self.scan_id}")
        
        async with aiohttp.ClientSession(headers={"User-Agent": "Mozilla/5.0 OSINT-Analyzer/2.0"}) as session:
            await self.discovery_phase(session)
            await self.update_progress(40)
            
            await self.analysis_phase()
            await self.update_progress(80)
            
            await self.correlation_phase()
            
        await self.finalize_and_save()
        await self.update_progress(100, "completed")
        logger.info(f"✅ Scan #{self.scan_id} Completed.")

    async def finalize_and_save(self):
        score = sum(SEVERITY_WEIGHTS.get(f["severity"], 0) for f in self.findings)
        final_score = min(score, 100)
        risk_level = "critical" if final_score >= 75 else "high" if final_score >= 50 else "medium" if final_score >= 25 else "low"
        
        summary = f"Risk Score: {final_score}/100 ({risk_level.upper()}). Total Findings: {len(self.findings)}."
        
        try:
            conn = await self._db_conn()
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE job_recruitment_scans SET risk_score=%s, risk_level=%s, analysis_status='completed', findings_summary=%s WHERE scan_id=%s",
                    (final_score, risk_level, summary, self.scan_id)
                )
                await cur.execute(
                    "UPDATE scans SET metadata=JSON_SET(COALESCE(metadata,'{}'), '$.final_score', %s, '$.findings_count', %s) WHERE id=%s",
                    (final_score, len(self.findings), self.scan_id)
                )
                await conn.commit()
            conn.close()
        except Exception as e: logger.error(f"Finalize failed: {e}")

def start_scan(scan_id: int, target: str, user_id: int):
    asyncio.run(ScannerEngine(scan_id, target, user_id).run())
