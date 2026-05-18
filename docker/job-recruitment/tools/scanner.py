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
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import tldextract
import whois
from typing import Optional, List, Dict, Any, Set

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("ScannerEngine")

# ══════════════════════════════════════════════════════════════════════════════
#  THREAT INTELLIGENCE CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════

# Scam keywords with minimum word-boundary matching (avoids substring false positives)
SCAM_KEYWORDS: Dict[str, List[str]] = {
    "critical": ["wire transfer", "western union", "moneygram", "advance fee", "processing fee required"],
    "high":     ["bitcoin payment", "crypto payment", "gift card payment", "send money urgently"],
    "medium":   ["guaranteed income", "no experience needed", "make money fast", "earn from home today"],
    "low":      ["limited time offer", "act now", "verify your account"],
}

# Phishing patterns — compiled once at module load for performance
PHISHING_PATTERNS: List[re.Pattern] = [re.compile(p, re.IGNORECASE) for p in [
    r"\bpaypa[l1](?!\.com)\b",
    r"\bg[o0]{2}gle(?!\.com)\b",
    r"\b[a4]mazon(?!\.com)\b",
    r"\bmicros[o0]ft(?!\.com)\b",
    r"\b[il1]nstagram(?!\.com)\b",
    r"\b[a4]pple[- ]support\b",
    r"\baccount[- ](?:suspended|locked|verified)\b",
    r"\bsecurity[- ]alert\b",
    r"\bverify[- ](?:your|account|identity)\b",
    r"\bpassword[- ]reset[- ]required\b",
]]

# TLDs considered high-risk in the context of recruitment scams
HIGH_RISK_TLDS: Set[str] = {
    ".xyz", ".top", ".club", ".online", ".site", ".website",
    ".info", ".biz", ".cc", ".tk", ".ml", ".ga", ".cf", ".pw",
}

# Legitimate enterprise email domains — not suspicious for recruiters
LEGIT_ENTERPRISE_EMAIL: Set[str] = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "protonmail.com", "icloud.com", "aol.com",
}

# Known certificate authorities that signal a professional deployment
TRUSTED_CA_ORGS: Set[str] = {
    "DigiCert", "Sectigo", "GlobalSign", "Entrust", "Comodo",
    "Amazon", "Google Trust Services", "Microsoft",
}

# Severity → numeric weight for final risk score
SEVERITY_WEIGHTS: Dict[str, int] = {
    "critical": 40,
    "high":     20,
    "medium":   10,
    "low":       5,
    "info":      0,
}

# Minimum domain age (days) to be considered non-suspicious
DOMAIN_AGE_THRESHOLDS = {"critical": 30, "high": 90, "medium": 180}

# Minimum number of assets before declaring "low information density"
MIN_ASSET_DENSITY = 4


# ══════════════════════════════════════════════════════════════════════════════
#  HELPER UTILITIES
# ══════════════════════════════════════════════════════════════════════════════

def _word_boundary_search(text: str, phrase: str) -> bool:
    """True if `phrase` appears as a complete phrase in `text` (not as a substring)."""
    escaped = re.escape(phrase)
    return bool(re.search(rf"(?<!\w){escaped}(?!\w)", text))


def _normalise_header_keys(headers: Dict) -> Dict[str, str]:
    return {k.lower(): v for k, v in headers.items()}


def _safe_datetime(dt_val) -> Optional[datetime]:
    """Normalise WHOIS date values (may be list or single value)."""
    if isinstance(dt_val, list):
        dt_val = dt_val[0]
    return dt_val if isinstance(dt_val, datetime) else None


def _domain_age_days(creation: datetime) -> int:
    now = datetime.now(timezone.utc)
    if creation.tzinfo is None:
        creation = creation.replace(tzinfo=timezone.utc)
    return (now - creation).days


# ══════════════════════════════════════════════════════════════════════════════
#  SCANNER ENGINE
# ══════════════════════════════════════════════════════════════════════════════

class ScannerEngine:
    """
    Multi-phase OSINT scanner for job-recruitment fraud detection.

    Phases:
        1. Discovery  — asset retrieval, web fetch, WHOIS, SSL
        2. Analysis   — domain, SSL, content, headers, asset text
        3. Correlation — cross-signal consistency checks
        4. Finalization — risk scoring and DB persistence
    """

    def __init__(self, scan_id: int, target: str, user_id: int):
        self.scan_id   = scan_id
        self.target    = target.strip()
        self.user_id   = user_id
        self.started_at = datetime.now(timezone.utc)

        # State
        self.assets:   Dict[str, Any] = {}
        self.raw_data: Dict[str, Any] = {
            "html": "", "headers": {}, "status": 0,
            "whois": None, "ssl": None, "soup": None,
        }
        self.findings: List[Dict] = []
        self.metadata: Dict[str, Any] = {}

        # Deduplication — prevents noisy duplicate findings
        self._finding_fingerprints: Set[str] = set()

        # DB
        self.db = None
        self.db_lock = asyncio.Lock()
        self.db_config = {
            "host":     os.getenv("MARIADB_HOST",     "mariadb"),
            "user":     os.getenv("MARIADB_USER",     "root"),
            "password": os.getenv("MARIADB_PASSWORD", "rootpassword123"),
            "db":       os.getenv("MARIADB_DATABASE", "osint_db"),
        }

        # Target decomposition
        self.hostname: Optional[str] = None
        self.domain:   Optional[str] = None
        self.base_url: Optional[str] = None
        self._parse_target(self.target)
        
        # Pausing mechanism
        self.is_paused = False
        self.is_stopped = False
        self._pause_condition = asyncio.Condition()

    async def pause(self):
        """Request the engine to pause."""
        async with self._pause_condition:
            self.is_paused = True
            logger.info(f"   ⏸ Scan #{self.scan_id} PAUSED requested.")
            await self.update_progress(None, "paused")

    async def resume(self):
        """Request the engine to resume."""
        async with self._pause_condition:
            self.is_paused = False
            self._pause_condition.notify_all()
            logger.info(f"   ▶ Scan #{self.scan_id} RESUMED.")
            await self.update_progress(None, "running")

    async def stop(self):
        """Request the engine to stop entirely."""
        async with self._pause_condition:
            self.is_stopped = True
            self.is_paused = False
            self._pause_condition.notify_all()
            logger.info(f"   🛑 Scan #{self.scan_id} STOP requested.")
            await self.update_progress(None, "stopped")

    async def _check_paused(self):
        """Internal check to halt execution if paused or stopped."""
        async with self._pause_condition:
            if self.is_stopped:
                raise asyncio.CancelledError("Scan stopped by user")
            while self.is_paused:
                logger.info(f"   💤 Scan #{self.scan_id} is waiting (paused)…")
                await self._pause_condition.wait()
                if self.is_stopped:
                    raise asyncio.CancelledError("Scan stopped by user")

    # ── Target Parsing ───────────────────────────────────────────────────────

    def _parse_target(self, raw: str) -> None:
        if not raw:
            return
        url = raw if "://" in raw else f"http://{raw}"
        parsed = urlparse(url)
        self.hostname = parsed.netloc or parsed.path.split("/")[0]
        ext = tldextract.extract(raw)
        self.domain   = f"{ext.domain}.{ext.suffix}" if ext.suffix else self.hostname
        self.base_url = f"{parsed.scheme}://{self.hostname}"

    # ── Database Helpers ─────────────────────────────────────────────────────

    async def _db_conn(self) -> aiomysql.Connection:
        if not self.db or self.db.closed:
            self.db = await aiomysql.connect(**self.db_config)
        return self.db

    async def _close_db(self) -> None:
        async with self.db_lock:
            if self.db:
                try:
                    self.db.close()
                    self.db = None
                    logger.info("   ↳ Database connection closed cleanly.")
                except Exception as exc:
                    logger.warning(f"   ↳ Non-fatal error closing database connection: {exc}")

    # ── Finding Management ───────────────────────────────────────────────────

    async def add_finding(
        self,
        title:       str,
        description: str,
        severity:    str = "medium",
        category:    str = "general",
        evidence:    str = "",
        confidence:  str = "high",   # high | medium | low
    ) -> None:
        """
        Persist a finding, with deduplication and confidence-gating.
        Low-confidence findings are downgraded one severity level to reduce false positives.
        """
        # Downgrade severity for low-confidence signals
        severity_order = ["info", "low", "medium", "high", "critical"]
        if confidence == "low" and severity in severity_order:
            idx = severity_order.index(severity)
            severity = severity_order[max(0, idx - 1)]

        # Deduplicate by (category, normalised title)
        fp = hashlib.md5(f"{category}:{title.lower()}".encode()).hexdigest()
        if fp in self._finding_fingerprints:
            return
        self._finding_fingerprints.add(fp)

        self.findings.append({
            "title": title, "description": description,
            "severity": severity, "category": category, "confidence": confidence,
        })

        icon = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🔵", "info": "⚪"}.get(severity, "⚪")
        logger.info(f"   {icon} [{severity.upper()}] [{confidence.upper()} CONFIDENCE] {title}")

        async with self.db_lock:
            try:
                conn = await self._db_conn()
                async with conn.cursor() as cur:
                    await cur.execute(
                        """INSERT INTO findings
                               (scan_id, target_id, project_id, finding_type, severity,
                                title, description, evidence, created_at)
                           SELECT s.id, s.target_id, t.project_id,
                                  %s, %s, %s, %s, %s, NOW()
                           FROM   scans s
                           JOIN   targets t ON s.target_id = t.id
                           WHERE  s.id = %s""",
                        (category, severity, title, description, evidence, self.scan_id),
                    )
                    await conn.commit()

                if severity in ("high", "critical"):
                    async with conn.cursor() as cur:
                        await cur.execute(
                            """INSERT INTO notifications
                                   (user_id, title, message, type, scan_id)
                               VALUES (%s, %s, %s, %s, %s)""",
                            (self.user_id, f"Threat Detected: {title}",
                             description[:250], "threat", self.scan_id),
                        )
                        await conn.commit()
            except Exception as exc:
                logger.error(f"   ↳ Failed to persist finding to database: {exc}")

    async def update_progress(self, progress: Optional[int], status: str = "running") -> None:
        async with self.db_lock:
            try:
                conn = await self._db_conn()
                async with conn.cursor() as cur:
                    if progress is not None:
                        await cur.execute(
                            "UPDATE scans SET progress=%s, status=%s WHERE id=%s",
                            (progress, status, self.scan_id),
                        )
                    else:
                        await cur.execute(
                            "UPDATE scans SET status=%s WHERE id=%s",
                            (status, self.scan_id),
                        )
                    await conn.commit()
            except Exception as exc:
                logger.error(f"   ↳ Progress update failed: {exc}")

    async def finalize_and_save(self) -> None:
        raw_score  = sum(SEVERITY_WEIGHTS.get(f["severity"], 0) for f in self.findings)
        final_score = min(raw_score, 100)
        risk_level  = (
            "critical" if final_score >= 75 else
            "high"     if final_score >= 50 else
            "medium"   if final_score >= 25 else
            "low"
        )
        finding_counts = {}
        for f in self.findings:
            finding_counts[f["severity"]] = finding_counts.get(f["severity"], 0) + 1

        summary = (
            f"Risk Score: {final_score}/100 ({risk_level.upper()}). "
            f"Total Findings: {len(self.findings)} "
            f"({', '.join(f'{v} {k}' for k, v in finding_counts.items())})."
        )

        logger.info(f"\n{'═'*60}")
        logger.info(f"  SCAN #{self.scan_id} — FINAL ASSESSMENT")
        logger.info(f"{'═'*60}")
        logger.info(f"  Target      : {self.target}")
        logger.info(f"  Risk Score  : {final_score}/100")
        logger.info(f"  Risk Level  : {risk_level.upper()}")
        logger.info(f"  Findings    : {len(self.findings)}")
        for sev, count in sorted(finding_counts.items(), key=lambda x: SEVERITY_WEIGHTS.get(x[0], 0), reverse=True):
            logger.info(f"                {count}× {sev}")
        logger.info(f"{'═'*60}\n")

        async with self.db_lock:
            try:
                conn = await self._db_conn()
                async with conn.cursor() as cur:
                    await cur.execute(
                        """UPDATE job_recruitment_scans
                           SET    risk_score=%s, risk_level=%s, findings_summary=%s
                           WHERE  scan_id=%s""",
                        (final_score, risk_level, summary, self.scan_id),
                    )
                    await cur.execute(
                        """UPDATE scans
                           SET    findings_count = %s,
                                  metadata = JSON_SET(
                                      COALESCE(metadata, '{}'),
                                      '$.final_score',    %s,
                                      '$.findings_count', %s,
                                      '$.risk_level',     %s
                                  )
                           WHERE  id = %s""",
                        (len(self.findings), final_score, len(self.findings),
                         risk_level, self.scan_id),
                    )
                    await conn.commit()
            except Exception as exc:
                logger.error(f"   ↳ Finalization write failed: {exc}")

    # ══════════════════════════════════════════════════════════════════════════
    #  PHASE 1 — DISCOVERY
    # ══════════════════════════════════════════════════════════════════════════

    async def discovery_phase(self, session: aiohttp.ClientSession) -> None:
        logger.info(f"\n{'─'*60}")
        logger.info("  PHASE 1 — DISCOVERY")
        logger.info(f"{'─'*60}")

        # Assets must be fetched first so base_url can be resolved from DB if needed
        await self._fetch_assets_task()

        if self.base_url:
            await asyncio.gather(
                self._fetch_web_data_task(session),
                self._fetch_whois_task(),
                self._fetch_ssl_task(),
            )
            logger.info(f"  Discovery complete. HTTP {self.raw_data['status']} | "
                        f"SSL {'present' if self.raw_data['ssl'] else 'absent'} | "
                        f"WHOIS {'available' if self.raw_data['whois'] else 'unavailable'}")
        else:
            logger.warning("  No resolvable URL found — web-based checks will be skipped.")

    async def _fetch_assets_task(self) -> None:
        logger.info("  Retrieving scan assets from database…")
        async with self.db_lock:
            try:
                conn = await self._db_conn()
                async with conn.cursor(aiomysql.DictCursor) as cur:
                    await cur.execute(
                        "SELECT * FROM job_recruitment_scans WHERE scan_id = %s",
                        (self.scan_id,),
                    )
                    self.assets = await cur.fetchone() or {}

                if not self.base_url:
                    fallback = self.assets.get("job_url") or self.assets.get("company_website")
                    if fallback:
                        self._parse_target(fallback)
                        logger.info(f"  Resolved target URL from asset record: {self.base_url}")
            except Exception as exc:
                logger.error(f"  Asset retrieval failed: {exc}")

    async def _fetch_web_data_task(self, session: aiohttp.ClientSession) -> None:
        logger.info(f"  Fetching {self.base_url}…")
        try:
            async with session.get(
                self.base_url,
                timeout=aiohttp.ClientTimeout(total=20, connect=8),
                ssl=False,
                allow_redirects=True,
                max_redirects=5,
            ) as resp:
                self.raw_data["status"]  = resp.status
                self.raw_data["headers"] = dict(resp.headers)
                self.raw_data["html"]    = await resp.text(errors="replace")
                self.raw_data["soup"]    = BeautifulSoup(self.raw_data["html"], "html.parser")

                content_length = len(self.raw_data["html"])
                logger.info(f"  Response: HTTP {resp.status} | {content_length:,} bytes")
        except asyncio.TimeoutError:
            logger.warning(f"  Request to {self.base_url} timed out — site may be offline or rate-limiting.")
        except Exception as exc:
            logger.warning(f"  Web fetch failed: {exc}")

    async def _fetch_whois_task(self) -> None:
        if not self.domain:
            return
        logger.info(f"  Querying WHOIS for {self.domain}…")
        try:
            loop = asyncio.get_event_loop()
            result = await asyncio.wait_for(
                loop.run_in_executor(None, whois.whois, self.domain),
                timeout=15,
            )
            self.raw_data["whois"] = result
            logger.info(f"  WHOIS resolved. Registrar: {getattr(result, 'registrar', 'unknown')}")
        except asyncio.TimeoutError:
            logger.warning("  WHOIS query timed out.")
        except Exception:
            logger.warning("  WHOIS data unavailable for this domain.")

    async def _fetch_ssl_task(self) -> None:
        if not self.hostname:
            return
        logger.info(f"  Probing SSL/TLS for {self.hostname}:443…")

        def _check_ssl() -> Optional[dict]:
            ctx = ssl.create_default_context()
            try:
                with socket.create_connection((self.hostname, 443), timeout=8) as sock:
                    with ctx.wrap_socket(sock, server_hostname=self.hostname) as tls:
                        return tls.getpeercert()
            except (ssl.SSLError, socket.timeout, ConnectionRefusedError, OSError):
                return None

        loop = asyncio.get_event_loop()
        self.raw_data["ssl"] = await loop.run_in_executor(None, _check_ssl)

    # ══════════════════════════════════════════════════════════════════════════
    #  PHASE 2 — ANALYSIS
    # ══════════════════════════════════════════════════════════════════════════

    async def analysis_phase(self) -> None:
        logger.info(f"\n{'─'*60}")
        logger.info("  PHASE 2 — ANALYSIS")
        logger.info(f"{'─'*60}")

        tasks = [self._analyze_assets()]
        if self.base_url:
            tasks += [
                self._analyze_domain(),
                self._analyze_ssl(),
                self._analyze_content(),
                self._analyze_headers(),
            ]
        await asyncio.gather(*tasks)

    # ── 2a. Asset Text Analysis ──────────────────────────────────────────────

    async def _analyze_assets(self) -> None:
        logger.info("\n  [2a] Asset Text Analysis")

        # Build a corpus from all string-valued asset fields
        corpus = " ".join(
            str(v) for k, v in self.assets.items()
            if v and isinstance(v, str)
        ).lower()

        if not corpus.strip():
            logger.info("   ↳ No textual asset data available for analysis.")
            return

        # Keyword matching with word-boundary enforcement
        for severity, keywords in SCAM_KEYWORDS.items():
            hits = [kw for kw in keywords if _word_boundary_search(corpus, kw)]
            if hits:
                await self.add_finding(
                    title=f"High-Risk Language Detected in Submission Data",
                    description=(
                        f"The following {severity}-severity terms were identified in the "
                        f"submitted asset fields: {', '.join(f'«{h}»' for h in hits)}. "
                        f"These phrases are strongly associated with fraudulent recruitment activity."
                    ),
                    severity=severity,
                    category="content",
                    evidence=", ".join(hits),
                    confidence="high",
                )

        # Recruiter email domain check (free-provider heuristic, with context)
        email: str = self.assets.get("recruiter_email", "")
        if email and "@" in email:
            email_domain = email.split("@")[-1].lower()
            if email_domain in LEGIT_ENTERPRISE_EMAIL:
                company = self.assets.get("company_name", "")
                # Only flag if a company name is present (suggests they should have a corporate domain)
                if company and len(company) > 3:
                    await self.add_finding(
                        title="Recruiter Using Personal Email for Corporate Outreach",
                        description=(
                            f"The listed recruiter ({email}) is using a personal email provider "
                            f"(@{email_domain}) while representing '{company}'. Established companies "
                            f"consistently use their own domain for official correspondence."
                        ),
                        severity="high",
                        category="assets",
                        evidence=f"recruiter_email={email}, company_name={company}",
                        confidence="medium",   # context-dependent; avoid overclaiming
                    )
                else:
                    logger.info(f"   ↳ Recruiter email on free provider (@{email_domain}) — no company name to correlate against; skipping flag.")

    # ── 2b. Domain Registration Analysis ────────────────────────────────────

    async def _analyze_domain(self) -> None:
        logger.info("\n  [2b] Domain Registration Analysis")
        w = self.raw_data["whois"]
        ext = tldextract.extract(self.domain or "")
        tld = f".{ext.suffix}" if ext.suffix else ""

        # TLD risk check — only flag if TLD is high-risk AND domain is also new or other signals exist
        if tld.lower() in HIGH_RISK_TLDS:
            logger.info(f"   ↳ Domain uses a high-risk TLD: {tld}")
            # Elevate confidence if combined with a missing/young registration
            await self.add_finding(
                title="High-Risk Top-Level Domain",
                description=(
                    f"The domain '{self.domain}' uses the TLD '{tld}', which is "
                    f"disproportionately associated with fraudulent and throwaway registrations. "
                    f"Legitimate employers rarely use these extensions for corporate sites."
                ),
                severity="medium",
                category="domain",
                evidence=f"tld={tld}",
                confidence="medium",
            )

        if not w:
            logger.info("   ↳ WHOIS data unavailable — domain age and registrar checks skipped.")
            await self.add_finding(
                title="WHOIS Data Unavailable",
                description=(
                    f"No WHOIS record could be retrieved for '{self.domain}'. "
                    f"Legitimate organisations rarely operate with opaque domain registration records."
                ),
                severity="low",
                category="domain",
                confidence="low",   # privacy-proxy registrations are common; don't overclaim
            )
            return

        # Domain age
        creation = _safe_datetime(w.creation_date)
        if creation:
            age_days = _domain_age_days(creation)
            self.metadata["domain_age_days"] = age_days
            age_display = f"{age_days} day{'s' if age_days != 1 else ''}"

            if age_days < DOMAIN_AGE_THRESHOLDS["critical"]:
                logger.info(f"   ↳ CRITICAL: Domain registered only {age_display} ago.")
                await self.add_finding(
                    title="Newly Registered Domain — Extreme Risk",
                    description=(
                        f"'{self.domain}' was registered just {age_display} ago. "
                        f"Domains under 30 days old are a primary indicator of disposable "
                        f"scam infrastructure created for targeted fraud campaigns."
                    ),
                    severity="critical",
                    category="domain",
                    evidence=f"creation_date={creation.date()}, age={age_days}d",
                    confidence="high",
                )
            elif age_days < DOMAIN_AGE_THRESHOLDS["high"]:
                logger.info(f"   ↳ WARNING: Domain is relatively new — {age_display}.")
                await self.add_finding(
                    title="Recently Registered Domain",
                    description=(
                        f"'{self.domain}' was registered {age_display} ago. "
                        f"Domains under 90 days old warrant heightened scrutiny, "
                        f"particularly when other risk signals are present."
                    ),
                    severity="high",
                    category="domain",
                    evidence=f"creation_date={creation.date()}, age={age_days}d",
                    confidence="high",
                )
            elif age_days < DOMAIN_AGE_THRESHOLDS["medium"]:
                logger.info(f"   ↳ NOTICE: Domain is {age_display} old — borderline.")
                await self.add_finding(
                    title="Domain Age Below Recommended Threshold",
                    description=(
                        f"'{self.domain}' is {age_display} old. While not immediately alarming, "
                        f"established companies typically operate on domains with multi-year histories."
                    ),
                    severity="low",
                    category="domain",
                    evidence=f"creation_date={creation.date()}, age={age_days}d",
                    confidence="medium",
                )
            else:
                logger.info(f"   ↳ Domain age verified: {age_display} — within acceptable range.")
        else:
            logger.info("   ↳ Domain creation date not available in WHOIS record.")

    # ── 2c. SSL/TLS Certificate Analysis ────────────────────────────────────

    async def _analyze_ssl(self) -> None:
        logger.info("\n  [2c] SSL/TLS Certificate Analysis")
        cert = self.raw_data["ssl"]

        if not cert:
            if self.base_url and self.base_url.startswith("https"):
                await self.add_finding(
                    title="Invalid or Missing SSL Certificate on HTTPS Site",
                    description=(
                        f"'{self.hostname}' advertises HTTPS but its certificate could not be "
                        f"validated. This indicates an expired, self-signed, or misconfigured "
                        f"certificate — unacceptable for any credible employer."
                    ),
                    severity="high",
                    category="ssl",
                    confidence="high",
                )
            else:
                logger.info("   ↳ Site does not use HTTPS — SSL analysis not applicable.")
            return

        issuer   = dict(x[0] for x in cert.get("issuer", []))
        subject  = dict(x[0] for x in cert.get("subject", []))
        org      = issuer.get("organizationName", "Unknown")
        cn       = subject.get("commonName",       "Unknown")

        logger.info(f"   ↳ Certificate Issuer : {org}")
        logger.info(f"   ↳ Certificate CN     : {cn}")

        # Certificate expiry
        not_after_str = cert.get("notAfter")
        if not_after_str:
            try:
                not_after = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                days_remaining = (not_after - datetime.now(timezone.utc)).days
                self.metadata["cert_days_remaining"] = days_remaining
                if days_remaining < 0:
                    await self.add_finding(
                        title="SSL Certificate Has Expired",
                        description=f"The certificate for '{cn}' expired {abs(days_remaining)} days ago.",
                        severity="high", category="ssl", confidence="high",
                    )
                elif days_remaining < 14:
                    logger.info(f"   ↳ Certificate expiring imminently: {days_remaining} days.")
                    await self.add_finding(
                        title="SSL Certificate Expiring Imminently",
                        description=f"Certificate for '{cn}' expires in {days_remaining} days.",
                        severity="medium", category="ssl", confidence="high",
                    )
                else:
                    logger.info(f"   ↳ Certificate valid for {days_remaining} more days.")
            except ValueError:
                logger.warning("   ↳ Could not parse certificate expiry date.")

        # CA reputation
        is_trusted_ca   = any(t in org for t in TRUSTED_CA_ORGS)
        is_lets_encrypt = "Let's Encrypt" in org

        if is_lets_encrypt:
            # Let's Encrypt is free and automated — common on legitimate sites too
            # Only flag if combined with other risk signals (keep confidence low)
            logger.info("   ↳ Certificate issued by Let's Encrypt (free/automated CA).")
            await self.add_finding(
                title="Free Automated SSL Certificate",
                description=(
                    f"The SSL certificate for '{self.hostname}' was issued by Let's Encrypt. "
                    f"While widely used by legitimate sites, this CA is also the default for "
                    f"rapidly-deployed scam infrastructure. Evaluate alongside other signals."
                ),
                severity="low",
                category="ssl",
                confidence="low",   # Not meaningful in isolation
            )
        elif not is_trusted_ca:
            logger.info(f"   ↳ Certificate from unrecognised CA: {org}")
            await self.add_finding(
                title="Certificate Issued by Unrecognised Authority",
                description=(
                    f"The SSL certificate for '{self.hostname}' was issued by '{org}', "
                    f"which is not in the list of well-known enterprise CAs. "
                    f"This warrants additional scrutiny."
                ),
                severity="medium",
                category="ssl",
                confidence="medium",
            )
        else:
            logger.info(f"   ↳ Certificate issued by trusted CA: {org} ✓")

    # ── 2d. Content & Phishing Analysis ─────────────────────────────────────

    async def _analyze_content(self) -> None:
        logger.info("\n  [2d] Content & Phishing Pattern Analysis")
        soup = self.raw_data["soup"]
        if not soup:
            logger.info("   ↳ No HTML content available for analysis.")
            return

        html_lower = self.raw_data["html"].lower()

        # Brand impersonation — phishing patterns
        matched_patterns: List[str] = []
        for pattern in PHISHING_PATTERNS:
            if pattern.search(html_lower):
                matched_patterns.append(pattern.pattern)

        if matched_patterns:
            logger.info(f"   ↳ ALERT: {len(matched_patterns)} brand-impersonation pattern(s) matched.")
            await self.add_finding(
                title="Brand Impersonation Indicators Detected",
                description=(
                    f"The page content contains {len(matched_patterns)} pattern(s) consistent with "
                    f"known brand-spoofing techniques. Matched patterns: "
                    f"{', '.join(matched_patterns)}. This is a strong indicator of a phishing page."
                ),
                severity="critical",
                category="content",
                evidence="; ".join(matched_patterns),
                confidence="high",
            )
        else:
            logger.info("   ↳ No brand-spoofing patterns detected in page content.")

        # Credential harvesting — password fields
        pass_fields = soup.find_all("input", {"type": "password"})
        if pass_fields:
            logger.info(f"   ↳ ALERT: {len(pass_fields)} password input field(s) found on unverified site.")
            await self.add_finding(
                title="Credential Harvesting Infrastructure Present",
                description=(
                    f"The page contains {len(pass_fields)} password input field(s). "
                    f"An unverified recruitment site collecting credentials is a "
                    f"textbook phishing or data-harvesting operation."
                ),
                severity="high",
                category="content",
                evidence=f"{len(pass_fields)} password field(s)",
                confidence="high",
            )

        # Excessive external link redirection
        all_links = soup.find_all("a", href=True)
        external_links = [
            a["href"] for a in all_links
            if a["href"].startswith("http") and self.domain and self.domain not in a["href"]
        ]
        if len(external_links) > 20:
            logger.info(f"   ↳ High external link density: {len(external_links)} outbound links.")
            await self.add_finding(
                title="Abnormally High External Link Density",
                description=(
                    f"The page contains {len(external_links)} links to external domains. "
                    f"This is atypical for a legitimate company landing or recruitment page, "
                    f"and may indicate a link-farm or affiliate fraud site."
                ),
                severity="low",
                category="content",
                evidence=f"{len(external_links)} external links",
                confidence="medium",
            )

        # Hidden or obfuscated text (common in SEO spam / content cloaking)
        hidden_elements = soup.find_all(style=re.compile(r"display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0", re.I))
        if len(hidden_elements) > 5:
            await self.add_finding(
                title="Content Cloaking Detected",
                description=(
                    f"Found {len(hidden_elements)} hidden HTML elements. "
                    f"Excessive hidden content is a common technique in phishing pages to "
                    f"embed fraudulent text while displaying something innocuous visually."
                ),
                severity="medium",
                category="content",
                evidence=f"{len(hidden_elements)} hidden elements",
                confidence="medium",
            )

    # ── 2e. HTTP Security Header Analysis ───────────────────────────────────

    async def _analyze_headers(self) -> None:
        logger.info("\n  [2e] HTTP Security Header Audit")
        headers = _normalise_header_keys(self.raw_data.get("headers", {}))
        if not headers:
            logger.info("   ↳ No response headers available for analysis.")
            return

        # Only flag missing headers if this is an HTTPS site — meaningless for HTTP
        is_https = self.base_url and self.base_url.startswith("https")

        required_headers = {
            "strict-transport-security": "HSTS (forces HTTPS for returning visitors)",
            "content-security-policy":   "CSP (mitigates XSS and data injection)",
            "x-frame-options":           "Clickjacking protection",
            "x-content-type-options":    "MIME-sniffing prevention",
        }
        missing = [f"{h} [{desc}]" for h, desc in required_headers.items() if h not in headers]

        if missing and is_https:
            logger.info(f"   ↳ Missing security headers: {len(missing)}/{len(required_headers)}")
            severity = "medium" if len(missing) >= 3 else "low"
            await self.add_finding(
                title="Security Headers Not Implemented",
                description=(
                    f"The server response is missing {len(missing)} standard security header(s): "
                    f"{', '.join(missing)}. While not a definitive fraud indicator, "
                    f"legitimate employers operating professional web properties typically implement these."
                ),
                severity=severity,
                category="headers",
                evidence=", ".join(missing),
                confidence="medium",
            )
        elif missing:
            logger.info("   ↳ Site is HTTP-only; security header checks not applicable.")
        else:
            logger.info("   ↳ All core security headers are present and configured.")

        # Server software disclosure
        server = headers.get("server", "")
        if re.search(r"\d+\.\d+", server):
            await self.add_finding(
                title="Server Version Disclosed in Response Headers",
                description=(
                    f"The 'Server' header reveals detailed version information: '{server}'. "
                    f"This is a minor operational security issue indicating the infrastructure "
                    f"has not been hardened — common in hastily-deployed scam sites."
                ),
                severity="info",
                category="headers",
                evidence=f"Server: {server}",
                confidence="high",
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  PHASE 3 — CORRELATION
    # ══════════════════════════════════════════════════════════════════════════

    async def correlation_phase(self) -> None:
        logger.info(f"\n{'─'*60}")
        logger.info("  PHASE 3 — CROSS-SIGNAL CORRELATION")
        logger.info(f"{'─'*60}")

        await asyncio.gather(
            self._correlate_email_domain(),
            self._correlate_information_density(),
            self._correlate_ssl_domain_age(),
            self._correlate_tld_and_new_domain(),
        )

    async def _correlate_email_domain(self) -> None:
        email = self.assets.get("recruiter_email", "")
        if not (email and "@" in email and self.domain):
            return

        email_domain = email.split("@")[-1].lower()
        logger.info(f"  Correlating recruiter email domain against target: {email_domain} ↔ {self.domain}")

        if email_domain not in LEGIT_ENTERPRISE_EMAIL and email_domain != self.domain:
            await self.add_finding(
                title="Recruiter Email Domain Inconsistent with Company Website",
                description=(
                    f"The recruiter's email domain (@{email_domain}) does not match the "
                    f"company's stated website domain ({self.domain}). "
                    f"This inconsistency is a hallmark of spoofed corporate identities where "
                    f"threat actors impersonate known firms using look-alike or unrelated domains."
                ),
                severity="critical",
                category="correlation",
                evidence=f"recruiter_email={email}, company_domain={self.domain}",
                confidence="high",
            )
        else:
            logger.info("   ↳ Email domain consistency verified.")

    async def _correlate_information_density(self) -> None:
        populated = [k for k, v in self.assets.items() if v and str(v).strip()]
        count = len(populated)
        logger.info(f"  Information density: {count} populated asset field(s).")

        if count < MIN_ASSET_DENSITY:
            await self.add_finding(
                title="Insufficient Submission Data — Possible Bulk-Generated Listing",
                description=(
                    f"Only {count} of the expected asset fields contain data. "
                    f"Fraudulent job postings are frequently auto-generated with minimal "
                    f"details to maximise distribution volume while avoiding scrutiny."
                ),
                severity="medium",
                category="correlation",
                evidence=f"populated_fields={count}",
                confidence="medium",
            )
        else:
            logger.info(f"   ↳ Adequate data present for analysis ({count} fields).")

    async def _correlate_ssl_domain_age(self) -> None:
        """
        Combined check: a new domain + free SSL together is significantly more suspicious
        than either signal alone.
        """
        domain_age = self.metadata.get("domain_age_days")
        cert = self.raw_data["ssl"]
        if domain_age is None or not cert:
            return

        issuer = dict(x[0] for x in cert.get("issuer", []))
        ca_org = issuer.get("organizationName", "")

        if domain_age < 90 and "Let's Encrypt" in ca_org:
            logger.info("  Correlation: new domain + free SSL — elevated compound risk.")
            await self.add_finding(
                title="High-Risk Signal Compound: New Domain with Automated Free Certificate",
                description=(
                    f"The domain is only {domain_age} days old and uses an automated free SSL "
                    f"certificate (Let's Encrypt). While each signal has modest individual weight, "
                    f"their combination is a reliable compound indicator of short-lived scam "
                    f"infrastructure — set up quickly, used briefly, then discarded."
                ),
                severity="high",
                category="correlation",
                evidence=f"domain_age={domain_age}d, ca={ca_org}",
                confidence="high",
            )

    async def _correlate_tld_and_new_domain(self) -> None:
        """
        High-risk TLD combined with a domain younger than 180 days — amplified compound risk.
        """
        domain_age = self.metadata.get("domain_age_days")
        if not (domain_age and self.domain):
            return

        ext = tldextract.extract(self.domain)
        tld = f".{ext.suffix}".lower() if ext.suffix else ""

        if tld in HIGH_RISK_TLDS and domain_age < 180:
            logger.info(f"  Correlation: high-risk TLD ({tld}) + domain age {domain_age}d.")
            await self.add_finding(
                title="Compound Risk: Suspicious TLD and Short Domain History",
                description=(
                    f"The domain '{self.domain}' combines a high-risk TLD ('{tld}') "
                    f"with a relatively short registration history ({domain_age} days). "
                    f"This pattern is consistent with disposable domains used in "
                    f"scalable phishing and recruitment fraud campaigns."
                ),
                severity="high",
                category="correlation",
                evidence=f"tld={tld}, domain_age={domain_age}d",
                confidence="high",
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  MAIN EXECUTION
    # ══════════════════════════════════════════════════════════════════════════

    async def run(self) -> None:
        logger.info(f"\n{'═'*60}")
        logger.info(f"  OSINT SCAN #{self.scan_id} INITIATED")
        logger.info(f"  Target  : {self.target}")
        logger.info(f"  User ID : {self.user_id}")
        logger.info(f"  Started : {self.started_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        logger.info(f"{'═'*60}")

        try:
            connector = aiohttp.TCPConnector(ssl=False, limit=10)
            async with aiohttp.ClientSession(
                connector=connector,
                headers={"User-Agent": "Mozilla/5.0 (compatible; OSINT-Analyzer/3.0; +https://example.com/scanner)"},
            ) as session:
                # Phase 1 — Discovery
                await self._check_paused()
                await self.update_progress(10)
                await self.discovery_phase(session)
                await self._check_paused()
                await self.update_progress(30)

                # Phase 2 — Analysis
                await self._check_paused()
                await self.update_progress(45)
                await self.analysis_phase()
                await self._check_paused()
                await self.update_progress(70)

                # Phase 3 — Correlation
                await self._check_paused()
                await self.update_progress(80)
                await self.correlation_phase()
                await self._check_paused()
                await self.update_progress(95)

                # Phase 4 — Finalization
                await self._check_paused()
                await self.finalize_and_save()
                await self.update_progress(100, "completed")
            # Completion notification
            async with self.db_lock:
                try:
                    conn = await self._db_conn()
                    async with conn.cursor() as cur:
                        finding_summary = f"{len(self.findings)} finding(s) recorded."
                        await cur.execute(
                            """INSERT INTO notifications (user_id, title, message, type, scan_id)
                               VALUES (%s, %s, %s, %s, %s)""",
                            (
                                self.user_id,
                                f"Scan #{self.scan_id} Completed",
                                f"OSINT analysis for '{self.target}' is complete. {finding_summary}",
                                "success",
                                self.scan_id,
                            ),
                        )
                        await conn.commit()
                except Exception as exc:
                    logger.error(f"   ↳ Failed to dispatch completion notification: {exc}")

        except Exception as exc:
            logger.error(f"  SCAN FAILED: {exc}", exc_info=True)
            try:
                await self.update_progress(0, "failed")
            except Exception:
                pass
            raise
        finally:
            await self._close_db()
            elapsed = (datetime.now(timezone.utc) - self.started_at).total_seconds()
            logger.info(f"\n  Scan #{self.scan_id} completed in {elapsed:.1f}s.\n")


# ══════════════════════════════════════════════════════════════════════════════
#  ENTRYPOINT
# ══════════════════════════════════════════════════════════════════════════════

def start_scan(scan_id: int, target: str, user_id: int) -> None:
    """Synchronous entrypoint for spawning a scan from a worker process."""
    engine = ScannerEngine(scan_id, target, user_id)
    asyncio.run(engine.run())