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

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("ScannerEngine")


# ══════════════════════════════════════════════════════════════════════════════
#  CONSTANTS & THREAT INTELLIGENCE
# ══════════════════════════════════════════════════════════════════════════════

SCAM_KEYWORDS = [
    "urgent", "wire transfer", "payment required", "bitcoin", "easy money",
    "guaranteed income", "no experience needed", "work from home", "make money fast",
    "crypto payment", "western union", "moneygram", "gift card", "advance fee",
    "nigerian prince", "lottery winner", "congratulations you have been selected",
    "click here immediately", "limited time offer", "act now", "verify your account",
    "suspended account", "unusual activity", "confirm your identity",
]

PHISHING_PATTERNS = [
    r"paypa[l1]", r"g[o0]{2}gle", r"[a4]mazon", r"micros[o0]ft",
    r"[il1]nked[il1]n", r"[il1]nstagram", r"[a4]pple[- ]support",
    r"[a4]ccount[- ][il1]ssue", r"secur[il1]ty[- ]alert",
]

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".online", ".site", ".website",
    ".info", ".biz", ".cc", ".tk", ".ml", ".ga", ".cf",
}

LEGIT_FREE_EMAIL = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "protonmail.com", "icloud.com", "aol.com", "mail.com",
}

HTTP_HEADERS_SECURITY = [
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
]

SEVERITY_WEIGHTS = {"critical": 40, "high": 25, "medium": 15, "low": 5, "info": 1}


# ══════════════════════════════════════════════════════════════════════════════
#  SCANNER ENGINE
# ══════════════════════════════════════════════════════════════════════════════

class ScannerEngine:
    def __init__(self, scan_id: int, target: str, user_id: int):
        self.scan_id   = scan_id
        self.target    = target.strip()
        self.user_id   = user_id
        self.started_at = datetime.now(timezone.utc)

        self.db_config = {
            "host":     os.getenv("MARIADB_HOST",     "mariadb"),
            "user":     os.getenv("MARIADB_USER",     "root"),
            "password": os.getenv("MARIADB_PASSWORD", "rootpassword123"),
            "db":       os.getenv("MARIADB_DATABASE", "osint_db"),
        }

        # Derived targets
        parsed        = urlparse(self.target if "://" in self.target else f"http://{self.target}")
        self.hostname = parsed.netloc or parsed.path.split("/")[0]
        ext           = tldextract.extract(self.target)
        self.domain   = f"{ext.domain}.{ext.suffix}" if ext.suffix else self.hostname
        self.base_url = f"{parsed.scheme or 'http'}://{self.hostname}"

        self.results = {
            "findings":   [],   # [{title, severity, category}]
            "risk_score": 0,
            "status":     "running",
            "metadata":   {},   # any structured data collected
        }

        # Shared HTTP session (created in run())
        self._session: aiohttp.ClientSession | None = None

    # ── DB helpers ────────────────────────────────────────────────────────────

    async def _db_conn(self):
        return await aiomysql.connect(**self.db_config)

    async def update_progress(self, progress: int, status: str = "running",
                               findings_count: int | None = None):
        try:
            conn = await self._db_conn()
            async with conn.cursor() as cur:
                if status == "completed":
                    await cur.execute(
                        "UPDATE scans SET progress=%s, status=%s, findings_count=%s, completed_at=NOW() WHERE id=%s",
                        (progress, status, findings_count, self.scan_id),
                    )
                else:
                    await cur.execute(
                        "UPDATE scans SET progress=%s, status=%s WHERE id=%s",
                        (progress, status, self.scan_id),
                    )
                await conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"DB progress update failed: {e}")

    async def add_finding(self, title: str, description: str,
                          severity: str = "medium", category: str = "general",
                          evidence: str = ""):
        tag = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢", "info": "🔵"}.get(severity, "⚪")
        logger.info(f"{tag} [{category.upper()}] {title}: {description[:120]}")

        try:
            conn = await self._db_conn()
            async with conn.cursor() as cur:
                await cur.execute(
                    """INSERT INTO findings
                       (scan_id, target_id, project_id, finding_type, severity,
                        title, description, evidence, created_at)
                       SELECT s.id, s.target_id, t.project_id,
                              %s, %s, %s, %s, %s, NOW()
                       FROM scans s
                       JOIN targets t ON s.target_id = t.id
                       WHERE s.id = %s""",
                    (category, severity, title, description, evidence, self.scan_id),
                )
                await conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to save finding '{title}': {e}")

        self.results["findings"].append({"title": title, "severity": severity, "category": category})

    async def finalize_and_save(self):
        score = sum(SEVERITY_WEIGHTS.get(f["severity"], 0) for f in self.results["findings"])
        final_score = min(score, 100)
        risk_level  = (
            "critical" if final_score >= 75 else
            "high"     if final_score >= 50 else
            "medium"   if final_score >= 25 else
            "low"
        )

        self.results["risk_score"] = final_score

        try:
            conn = await self._db_conn()
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE job_recruitment_scans SET risk_score=%s, risk_level=%s WHERE scan_id=%s",
                    (final_score, risk_level, self.scan_id),
                )
                # Persist full metadata blob for frontend access
                await cur.execute(
                    "UPDATE scans SET metadata=JSON_SET(COALESCE(metadata,'{}'), '$.risk_score', %s, '$.risk_level', %s) WHERE id=%s",
                    (final_score, risk_level, self.scan_id),
                )
                await conn.commit()
            conn.close()
            logger.info(f"📊 Final risk: {final_score}/100 ({risk_level.upper()})")
        except Exception as e:
            logger.error(f"Failed to persist final risk score: {e}")

        return final_score, risk_level

    # ── HTTP helper ───────────────────────────────────────────────────────────

    async def _get(self, url: str, timeout: int = 12) -> tuple[int, dict, str]:
        """Returns (status_code, headers_dict, body_text). Never raises."""
        try:
            async with self._session.get(
                url,
                timeout=aiohttp.ClientTimeout(total=timeout),
                allow_redirects=True,
                ssl=False,             # we check SSL separately
            ) as resp:
                body = await resp.text(errors="replace")
                return resp.status, dict(resp.headers), body
        except asyncio.TimeoutError:
            logger.warning(f"Timeout fetching {url}")
            return 0, {}, ""
        except Exception as e:
            logger.warning(f"GET {url} failed: {e}")
            return 0, {}, ""

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 1 — DOMAIN / WHOIS INTELLIGENCE
    # ══════════════════════════════════════════════════════════════════════════

    async def module_domain(self):
        logger.info("📡 [MOD-1] Domain & WHOIS analysis …")
        try:
            loop = asyncio.get_event_loop()
            w    = await loop.run_in_executor(None, whois.whois, self.domain)

            # ── Domain age ──
            creation = w.creation_date
            if isinstance(creation, list):
                creation = creation[0]
            if creation:
                if creation.tzinfo is None:
                    creation = creation.replace(tzinfo=timezone.utc)
                age_days = (datetime.now(timezone.utc) - creation).days
                if age_days < 30:
                    await self.add_finding(
                        "Newly Registered Domain",
                        f"Domain '{self.domain}' is only {age_days} day(s) old — a major red flag for recruitment fraud.",
                        "critical", "domain",
                        evidence=str(creation),
                    )
                elif age_days < 180:
                    await self.add_finding(
                        "Recently Registered Domain",
                        f"Domain is {age_days} days old. Legitimate employers typically have older domains.",
                        "high", "domain",
                    )
                else:
                    await self.add_finding(
                        "Domain Age OK",
                        f"Domain has been active for {age_days} days ({age_days // 365} yrs).",
                        "info", "domain",
                    )
                self.results["metadata"]["domain_age_days"] = age_days

            # ── Expiry ──
            expiry = w.expiration_date
            if isinstance(expiry, list):
                expiry = expiry[0]
            if expiry:
                if expiry.tzinfo is None:
                    expiry = expiry.replace(tzinfo=timezone.utc)
                days_left = (expiry - datetime.now(timezone.utc)).days
                if days_left < 30:
                    await self.add_finding(
                        "Domain Expiring Soon",
                        f"Domain expires in {days_left} days — may indicate abandonment or temporary scam operation.",
                        "high", "domain",
                    )

            # ── Registrar ──
            registrar = w.registrar or "Unknown"
            await self.add_finding(
                "Registrar Info",
                f"Registered via: {registrar}",
                "info", "domain",
                evidence=registrar,
            )
            self.results["metadata"]["registrar"] = registrar

            # ── Privacy-protected registration ──
            raw = str(w.text or "").lower()
            if any(kw in raw for kw in ["privacy", "redacted", "withheld", "protected"]):
                await self.add_finding(
                    "WHOIS Privacy Protection Enabled",
                    "Registrant identity is hidden behind a privacy service — common with scam sites.",
                    "medium", "domain",
                )

            # ── Country mismatch ──
            country = (w.country or "").upper()
            if country and country not in ("US", "GB", "CA", "AU", "DE", "FR"):
                await self.add_finding(
                    f"Unusual Registration Country: {country}",
                    f"Domain registered in {country}. Cross-check with claimed company location.",
                    "medium", "domain",
                )

        except Exception as e:
            await self.add_finding(
                "WHOIS Lookup Failed",
                f"Could not retrieve WHOIS data: {e}",
                "medium", "domain",
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 2 — SSL / TLS CERTIFICATE
    # ══════════════════════════════════════════════════════════════════════════

    async def module_ssl(self):
        logger.info("🔒 [MOD-2] SSL/TLS certificate check …")
        loop = asyncio.get_event_loop()

        def _check_ssl():
            ctx = ssl.create_default_context()
            try:
                with ctx.wrap_socket(
                    socket.create_connection((self.hostname, 443), timeout=8),
                    server_hostname=self.hostname,
                ) as s:
                    cert = s.getpeercert()
                    return cert, None
            except ssl.SSLCertVerificationError as e:
                return None, f"Certificate verification failed: {e}"
            except ssl.SSLError as e:
                return None, f"SSL error: {e}"
            except (socket.timeout, ConnectionRefusedError, OSError) as e:
                return None, f"Connection error: {e}"

        cert, error = await loop.run_in_executor(None, _check_ssl)

        if error:
            await self.add_finding(
                "SSL/TLS Issue",
                error,
                "high" if "verification" in error.lower() else "medium",
                "ssl",
            )
            return

        # ── Expiry ──
        not_after_str = cert.get("notAfter", "")
        if not_after_str:
            try:
                exp = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                days_left = (exp - datetime.now(timezone.utc)).days
                if days_left < 0:
                    await self.add_finding("SSL Certificate Expired", f"Certificate expired {abs(days_left)} days ago.", "critical", "ssl")
                elif days_left < 14:
                    await self.add_finding("SSL Certificate Expiring", f"Certificate expires in {days_left} days.", "high", "ssl")
                else:
                    await self.add_finding("SSL Certificate Valid", f"Certificate valid for {days_left} more days.", "info", "ssl")
                self.results["metadata"]["ssl_days_left"] = days_left
            except ValueError:
                pass

        # ── Issuer ──
        issuer = dict(x[0] for x in cert.get("issuer", []))
        issuer_name = issuer.get("organizationName", "Unknown")
        self.results["metadata"]["ssl_issuer"] = issuer_name

        free_issuers = {"let's encrypt", "zerossl", "buypass"}
        if issuer_name.lower() in free_issuers:
            await self.add_finding(
                "Free SSL Certificate",
                f"Certificate issued by '{issuer_name}'. Free certs are common on scam sites — not conclusive alone.",
                "low", "ssl",
            )
        else:
            await self.add_finding("Paid SSL Certificate", f"Issued by: {issuer_name}", "info", "ssl")

        # ── Subject matches domain ──
        subject = dict(x[0] for x in cert.get("subject", []))
        cn      = subject.get("commonName", "")
        if cn and self.domain not in cn and not cn.startswith("*."):
            await self.add_finding(
                "SSL Certificate Domain Mismatch",
                f"Cert CN '{cn}' does not match target domain '{self.domain}'.",
                "high", "ssl",
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 3 — HTTP SECURITY HEADERS
    # ══════════════════════════════════════════════════════════════════════════

    async def module_headers(self):
        logger.info("📋 [MOD-3] HTTP security headers …")
        status, headers, _ = await self._get(self.base_url)

        if status == 0:
            await self.add_finding("Site Unreachable", f"Could not connect to {self.base_url}", "high", "headers")
            return

        headers_lower = {k.lower(): v for k, v in headers.items()}
        missing = [h for h in HTTP_HEADERS_SECURITY if h not in headers_lower]

        if missing:
            await self.add_finding(
                "Missing Security Headers",
                f"The following security headers are absent: {', '.join(missing)}",
                "medium" if len(missing) >= 3 else "low",
                "headers",
                evidence=", ".join(missing),
            )
        else:
            await self.add_finding("Security Headers Present", "All recommended HTTP security headers are set.", "info", "headers")

        # ── Server fingerprint leakage ──
        server = headers_lower.get("server", "")
        if server:
            await self.add_finding(
                "Server Banner Exposed",
                f"Server header reveals: '{server}'. Fingerprinting aids attackers.",
                "low", "headers",
                evidence=server,
            )

        # ── Clickjacking ──
        if "x-frame-options" not in headers_lower and "content-security-policy" not in headers_lower:
            await self.add_finding(
                "Clickjacking Risk",
                "No X-Frame-Options or CSP frame-ancestors directive found.",
                "medium", "headers",
            )

        self.results["metadata"]["http_status"] = status

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 4 — CONTENT ANALYSIS
    # ══════════════════════════════════════════════════════════════════════════

    async def module_content(self):
        logger.info("🌐 [MOD-4] Content & keyword analysis …")
        status, headers, html = await self._get(self.base_url)
        if not html:
            return

        soup     = BeautifulSoup(html, "html.parser")
        text_low = html.lower()

        # ── Scam keywords ──
        hits = [kw for kw in SCAM_KEYWORDS if kw in text_low]
        if hits:
            await self.add_finding(
                "Scam-Related Language Detected",
                f"Found {len(hits)} suspicious phrase(s): {', '.join(hits[:8])}",
                "high" if len(hits) >= 3 else "medium",
                "content",
                evidence=", ".join(hits),
            )

        # ── Phishing pattern matching ──
        phish_hits = [p for p in PHISHING_PATTERNS if re.search(p, text_low)]
        if phish_hits:
            await self.add_finding(
                "Possible Brand Impersonation",
                f"Content matches known brand-spoofing patterns: {', '.join(phish_hits)}",
                "critical", "content",
                evidence=", ".join(phish_hits),
            )

        # ── Forms (data harvesting) ──
        forms = soup.find_all("form")
        password_inputs = soup.find_all("input", {"type": "password"})
        if password_inputs:
            await self.add_finding(
                "Login / Password Form Present",
                f"Site contains {len(password_inputs)} password field(s) across {len(forms)} form(s). Risk of credential harvesting.",
                "high", "content",
            )
        elif forms:
            await self.add_finding(
                "Data Collection Forms",
                f"Site contains {len(forms)} form(s) — check what personal data is requested.",
                "medium", "content",
            )

        # ── External links ──
        all_links  = [a.get("href", "") for a in soup.find_all("a", href=True)]
        ext_links  = [l for l in all_links if l.startswith("http") and self.domain not in l]
        if len(ext_links) > 20:
            await self.add_finding(
                "Excessive External Links",
                f"Found {len(ext_links)} outbound links — common in SEO spam / link-farming scam sites.",
                "medium", "content",
            )

        # ── Email addresses harvested ──
        emails = list(set(re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", html)))
        if emails:
            free_emails = [e for e in emails if e.split("@")[-1].lower() in LEGIT_FREE_EMAIL]
            self.results["metadata"]["emails_found"] = emails[:10]
            if free_emails:
                await self.add_finding(
                    "Personal/Free Email Addresses Found",
                    f"Found {len(free_emails)} free-provider email(s) on-site: {', '.join(free_emails[:5])}. "
                    "Legitimate companies use corporate email domains.",
                    "high", "content",
                    evidence=", ".join(free_emails[:5]),
                )
            else:
                await self.add_finding(
                    "Corporate Email(s) Found",
                    f"Found {len(emails)} email address(es) using non-free domain(s).",
                    "info", "content",
                )

        # ── Phone numbers ──
        phones = list(set(re.findall(
            r"(?:\+?\d[\d\s\-().]{7,}\d)",
            html,
        )))[:10]
        if phones:
            self.results["metadata"]["phones_found"] = phones
            await self.add_finding(
                "Phone Numbers Detected",
                f"Found {len(phones)} phone number(s). Cross-reference with official company listings.",
                "info", "content",
                evidence=", ".join(phones[:5]),
            )

        # ── Social media presence ──
        social_patterns = {
            "LinkedIn":  r"linkedin\.com/(company|in)/",
            "Twitter/X": r"(twitter|x)\.com/",
            "Facebook":  r"facebook\.com/",
            "Instagram": r"instagram\.com/",
        }
        found_social = [name for name, pat in social_patterns.items() if re.search(pat, html)]
        if found_social:
            await self.add_finding(
                "Social Media Links Present",
                f"Found links to: {', '.join(found_social)}. Verify these accounts are genuine and not newly created.",
                "info", "content",
            )
            self.results["metadata"]["social_media"] = found_social
        else:
            await self.add_finding(
                "No Social Media Presence",
                "Legitimate companies typically link to verified social profiles.",
                "medium", "content",
            )

        # ── Page title & meta description ──
        title = soup.find("title")
        title_text = title.get_text(strip=True) if title else ""
        if title_text:
            self.results["metadata"]["page_title"] = title_text
            if any(kw in title_text.lower() for kw in ["job", "hiring", "careers", "recruit"]):
                await self.add_finding(
                    "Recruitment-Themed Page Title",
                    f"Title: '{title_text}' — confirms job/recruitment context.",
                    "info", "content",
                )

        # ── Obfuscated / hidden elements ──
        hidden = soup.find_all(style=re.compile(r"display\s*:\s*none|visibility\s*:\s*hidden"))
        if len(hidden) > 5:
            await self.add_finding(
                "Multiple Hidden Elements",
                f"Found {len(hidden)} hidden DOM elements — possible content cloaking or hidden redirects.",
                "medium", "content",
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 5 — TYPOSQUATTING & DOMAIN SIMILARITY
    # ══════════════════════════════════════════════════════════════════════════

    async def module_typosquatting(self):
        logger.info("🔤 [MOD-5] Typosquatting & TLD analysis …")
        ext = tldextract.extract(self.domain)

        # ── Suspicious TLD ──
        tld = f".{ext.suffix}" if ext.suffix else ""
        if tld in SUSPICIOUS_TLDS:
            await self.add_finding(
                f"Suspicious TLD Detected: {tld}",
                f"The TLD '{tld}' is frequently abused by scam and phishing sites.",
                "high", "domain",
            )

        # ── Lookalike of well-known brands ──
        name = ext.domain.lower()
        brand_targets = {
            "google": ["g00gle", "gooogle", "googIe"],
            "linkedin": ["1inkedin", "linkedln", "llnkedin"],
            "amazon": ["amaz0n", "arnazon", "amazoon"],
            "microsoft": ["micros0ft", "micosoft", "microsofft"],
            "apple": ["appIe", "aple", "applle"],
            "paypal": ["paypa1", "paypa-l", "paypall"],
        }
        for brand, variants in brand_targets.items():
            if name == brand:
                continue  # it's the real one (unlikely but skip)
            # Levenshtein distance of 1–2 catches most typosquats
            if _levenshtein(name, brand) <= 2 or name in variants:
                await self.add_finding(
                    f"Possible Typosquatting of '{brand.capitalize()}'",
                    f"Domain name '{name}' closely resembles '{brand}' (edit distance ≤ 2).",
                    "critical", "domain",
                    evidence=f"Domain: {self.domain}",
                )

        # ── Excessive hyphens / numbers ──
        if name.count("-") >= 2:
            await self.add_finding(
                "Multiple Hyphens in Domain",
                f"Domain contains {name.count('-')} hyphens — common pattern in spam domains.",
                "medium", "domain",
            )
        if re.search(r"\d{3,}", name):
            await self.add_finding(
                "Numeric Sequence in Domain",
                "Long numeric strings in domain names are often associated with auto-generated scam domains.",
                "medium", "domain",
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 6 — REDIRECT CHAIN ANALYSIS
    # ══════════════════════════════════════════════════════════════════════════

    async def module_redirects(self):
        logger.info("↪️  [MOD-6] Redirect chain analysis …")
        try:
            chain = []
            async with self._session.get(
                self.base_url,
                timeout=aiohttp.ClientTimeout(total=15),
                allow_redirects=True,
                ssl=False,
            ) as resp:
                for hist in resp.history:
                    chain.append(str(hist.url))
                chain.append(str(resp.url))

            if len(chain) > 2:
                await self.add_finding(
                    f"Redirect Chain Detected ({len(chain) - 1} hops)",
                    f"Request passed through: {' → '.join(chain)}",
                    "medium" if len(chain) <= 4 else "high",
                    "network",
                    evidence=" → ".join(chain),
                )
                self.results["metadata"]["redirect_chain"] = chain

                # ── Final destination different domain ──
                final_domain = tldextract.extract(chain[-1]).registered_domain
                if final_domain and final_domain != self.domain:
                    await self.add_finding(
                        "Redirect to Different Domain",
                        f"Final destination '{final_domain}' differs from target '{self.domain}'.",
                        "high", "network",
                    )
        except Exception as e:
            logger.warning(f"Redirect analysis failed: {e}")

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 7 — ROBOTS / SITEMAP RECON
    # ══════════════════════════════════════════════════════════════════════════

    async def module_recon(self):
        logger.info("🗺️  [MOD-7] Robots.txt / sitemap recon …")

        # ── robots.txt ──
        _, _, robots = await self._get(f"{self.base_url}/robots.txt")
        if robots and "disallow" in robots.lower():
            hidden_paths = re.findall(r"Disallow:\s*(/[^\s]+)", robots, re.IGNORECASE)
            if hidden_paths:
                await self.add_finding(
                    "Hidden Paths in robots.txt",
                    f"robots.txt disallows {len(hidden_paths)} path(s): {', '.join(hidden_paths[:8])}. "
                    "These may reveal admin panels or sensitive directories.",
                    "low", "recon",
                    evidence=", ".join(hidden_paths[:8]),
                )

        # ── Common sensitive paths ──
        sensitive_paths = [
            "/admin", "/wp-admin", "/wp-login.php", "/.env",
            "/config.php", "/backup", "/db", "/.git/HEAD",
            "/phpinfo.php", "/server-status",
        ]
        exposed = []
        checks = [self._get(f"{self.base_url}{p}") for p in sensitive_paths]
        results = await asyncio.gather(*checks, return_exceptions=True)

        for path, res in zip(sensitive_paths, results):
            if isinstance(res, tuple) and res[0] in (200, 403):
                exposed.append(path)

        if exposed:
            await self.add_finding(
                "Sensitive Paths Accessible / Returning Non-404",
                f"The following paths returned 200/403: {', '.join(exposed)}",
                "high" if ".env" in exposed or ".git/HEAD" in exposed else "medium",
                "recon",
                evidence=", ".join(exposed),
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  MODULE 8 — TECHNOLOGY FINGERPRINTING
    # ══════════════════════════════════════════════════════════════════════════

    async def module_fingerprint(self):
        logger.info("🛠️  [MOD-8] Technology fingerprinting …")
        _, headers, html = await self._get(self.base_url)
        if not html:
            return

        tech_signatures = {
            "WordPress":     [r"wp-content/", r"wp-includes/", r"/wp-json/"],
            "Joomla":        [r"/components/com_", r"Joomla!"],
            "Drupal":        [r"Drupal\.settings", r"/sites/default/"],
            "Wix":           [r"wix\.com/", r"static\.parastorage\.com"],
            "Squarespace":   [r"squarespace\.com"],
            "Shopify":       [r"cdn\.shopify\.com", r"Shopify\.theme"],
            "React":         [r"react(?:\.min)?\.js", r"__REACT_DEVTOOLS"],
            "jQuery":        [r"jquery(?:\.min)?\.js"],
            "Bootstrap":     [r"bootstrap(?:\.min)?\.css"],
            "Google Analytics": [r"google-analytics\.com/analytics\.js", r"gtag\("],
            "Facebook Pixel":   [r"connect\.facebook\.net"],
        }

        detected = []
        for name, patterns in tech_signatures.items():
            if any(re.search(p, html) for p in patterns):
                detected.append(name)

        if detected:
            await self.add_finding(
                "Technology Stack Identified",
                f"Detected: {', '.join(detected)}",
                "info", "fingerprint",
                evidence=", ".join(detected),
            )
            self.results["metadata"]["technologies"] = detected

            if "WordPress" in detected:
                # Look for outdated WordPress
                ver_match = re.search(r'<meta name="generator" content="WordPress ([0-9.]+)"', html)
                if ver_match:
                    wp_ver = ver_match.group(1)
                    await self.add_finding(
                        "WordPress Version Exposed",
                        f"WordPress version '{wp_ver}' is publicly visible.",
                        "low", "fingerprint",
                        evidence=wp_ver,
                    )

        # ── Tracking pixels / excessive ad scripts ──
        ad_networks = ["doubleclick.net", "adnxs.com", "amazon-adsystem.com",
                       "moatads.com", "criteo.com"]
        found_ads = [n for n in ad_networks if n in html]
        if found_ads:
            await self.add_finding(
                "Ad-Network / Tracking Scripts Present",
                f"Found {len(found_ads)} ad/tracking network(s): {', '.join(found_ads)}. "
                "Unusual for a legitimate company careers page.",
                "medium", "fingerprint",
            )

    # ══════════════════════════════════════════════════════════════════════════
    #  ORCHESTRATOR
    # ══════════════════════════════════════════════════════════════════════════

    async def run(self):
        logger.info("🚀 " + "=" * 60)
        logger.info(f"🚀  SCAN #{self.scan_id} | TARGET: {self.target}")
        logger.info("🚀 " + "=" * 60)

        conn_kwargs = dict(
            connector=aiohttp.TCPConnector(ssl=False, limit=10),
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0 Safari/537.36"
                ),
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            timeout=aiohttp.ClientTimeout(total=60),
        )

        async with aiohttp.ClientSession(**conn_kwargs) as session:
            self._session = session

            await self.update_progress(5, "running")

            # ── Phase 1: Independent network modules (parallel) ──
            await asyncio.gather(
                self.module_domain(),
                self.module_ssl(),
                self.module_typosquatting(),
            )
            await self.update_progress(35, "running")

            # ── Phase 2: HTTP-dependent modules (parallel) ──
            await asyncio.gather(
                self.module_headers(),
                self.module_redirects(),
            )
            await self.update_progress(60, "running")

            # ── Phase 3: Deep content analysis (sequential — shares session) ──
            await self.module_content()
            await self.update_progress(80, "running")

            # ── Phase 4: Recon & fingerprinting ──
            await asyncio.gather(
                self.module_recon(),
                self.module_fingerprint(),
            )
            await self.update_progress(95, "running")

        self._session = None

        # ── Finalize ──
        final_score, risk_level = await self.finalize_and_save()
        total_findings = len(self.results["findings"])

        await self.update_progress(100, "completed", total_findings)

        # ── Summary ──
        by_severity: dict[str, int] = {}
        for f in self.results["findings"]:
            by_severity[f["severity"]] = by_severity.get(f["severity"], 0) + 1

        logger.info("=" * 65)
        logger.info(f"✅  SCAN #{self.scan_id} COMPLETE")
        logger.info(f"    Risk Score : {final_score}/100  ({risk_level.upper()})")
        logger.info(f"    Findings   : {total_findings} total — " +
                    " | ".join(f"{v} {k}" for k, v in sorted(by_severity.items())))
        logger.info(f"    Duration   : {(datetime.now(timezone.utc) - self.started_at).seconds}s")
        logger.info("=" * 65)

        return self.results


# ══════════════════════════════════════════════════════════════════════════════
#  UTILITY
# ══════════════════════════════════════════════════════════════════════════════

def _levenshtein(a: str, b: str) -> int:
    """Simple iterative Levenshtein distance."""
    if a == b:
        return 0
    if len(a) < len(b):
        a, b = b, a
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        curr = [i]
        for j, cb in enumerate(b, 1):
            curr.append(min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = curr
    return prev[-1]


# ══════════════════════════════════════════════════════════════════════════════
#  PUBLIC ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def start_scan(scan_id: int, target: str, user_id: int) -> dict:
    """Synchronous entry point — called by api_server or a worker process."""
    engine = ScannerEngine(scan_id, target, user_id)
    return asyncio.run(engine.run())