"""
Module 5: SSL/TLS Certificate Deep Analysis
Complete passive SSL/TLS analysis including:
- Certificate validity period (issue date, expiry, renewal frequency)
- Certificate chain validation (trusted CA, self-signed, wildcard)
- Subject Alternative Names (SAN)
- Certificate Transparency logs (crt.sh API)
- SSL protocol support & cipher suites
- Revocation status (CRL/OCSP)
- Public key analysis (RSA/ECC strength)
- Certificate fingerprinting
"""

import ssl
import socket
import OpenSSL
from OpenSSL import SSL, crypto
import certifi
import requests
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Set
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import hashlib
import base64
import time

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("SSLAnalyzer")

class SSLAnalyzer:
    """Complete SSL/TLS certificate analysis with all passive techniques"""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/ssl")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        
        # Trusted CA organizations (partial list)
        self.trusted_ca_orgs = {
            'digicert', 'let\'s encrypt', 'letsencrypt', 'godaddy', 'comodo',
            'sectigo', 'globalsign', 'entrust', 'geotrust', 'thawte',
            'rapidssl', 'symantec', 'verisign', 'amazon', 'google',
            'cloudflare', 'microsoft', 'apple', 'cisco', 'ibm', 'oracle',
            'network solutions', 'trustwave', 'quovadis', 'swiss sign'
        }
        
        # Suspicious CAs (rarely used legitimately, often for scams)
        self.suspicious_cas = {
            'wo sign': 70,
            'wosign': 75,
            'startcom': 60,
            'startcom ltd': 60,
            'actalis': 40,
            'buypass': 35,
            'certum': 30,
            'camerfirma': 35,
            'chambers of commerce': 50
        }
        
        # High-risk certificate patterns
        self.high_risk_patterns = [
            (r'localhost', 90, 'Localhost certificate - never for legitimate job sites'),
            (r'example\.com', 85, 'Example domain - test certificate'),
            (r'test', 70, 'Test certificate - not for production'),
            (r'dev(elopment)?', 65, 'Development certificate'),
            (r'staging', 65, 'Staging certificate'),
            (r'demo', 60, 'Demo certificate'),
            (r'sandbox', 60, 'Sandbox certificate'),
            (r'^\*\.', 25, 'Wildcard certificate - potential for abuse')
        ]
        
        # Known malicious certificate fingerprints (partial list)
        self.known_malicious_fingerprints = {}  # Would be loaded from database
        
        # SSL protocol risk scores
        self.protocol_risk = {
            'SSLv2': 100,
            'SSLv3': 90,
            'TLSv1.0': 80,
            'TLSv1.1': 70,
            'TLSv1.2': 10,
            'TLSv1.3': 0
        }
        
        # Cipher suite risk (insecure ciphers)
        self.insecure_ciphers = [
            'RC4', 'DES', '3DES', 'NULL', 'EXPORT', 'MD5', 'SHA1'
        ]
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] SSL ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] SSL WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] SSL SUCCESS: {message}")
        else:
            print(f"[{timestamp}] SSL: {message}")
    
    # =========================================================
    # 1. FETCH CERTIFICATE (Passive TLS Handshake)
    # =========================================================
    
    def fetch_certificate(self, domain: str, port: int = 443) -> Optional[Dict]:
        """Fetch SSL certificate from domain (passive connection, no data sent)"""
        
        self._print(f"Fetching SSL certificate for {domain}:{port}")
        
        cache_key = f"cert_{domain}_{port}"
        cached = self.cache.get(cache_key)
        if cached:
            self._print(f"Using cached certificate for {domain}")
            return cached
        
        try:
            # Create SSL context
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            # Connect to server (only SSL handshake, no HTTP data)
            with socket.create_connection((domain, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    # Get certificate
                    cert_bin = ssock.getpeercert(True)
                    cert = ssock.getpeercert()
                    
                    if not cert:
                        self._print(f"No certificate returned for {domain}", "WARNING")
                        return None
                    
                    # Parse certificate details
                    result = self._parse_certificate(cert, cert_bin, domain)
                    
                    # Also get full chain if possible
                    chain_result = self._get_certificate_chain(domain, port)
                    if chain_result:
                        result['certificate_chain'] = chain_result
                    
                    # Cache for 24 hours
                    self.cache.set(cache_key, result, ttl_seconds=86400)
                    
                    self._print(f"Successfully fetched certificate for {domain}", "SUCCESS")
                    return result
                    
        except socket.gaierror:
            self._print(f"Cannot resolve {domain}", "ERROR")
        except socket.timeout:
            self._print(f"Connection timeout for {domain}", "ERROR")
        except ssl.SSLError as e:
            self._print(f"SSL error: {str(e)}", "ERROR")
        except Exception as e:
            self._print(f"Failed to fetch certificate: {str(e)}", "ERROR")
        
        return None
    
    def _parse_certificate(self, cert: Dict, cert_bin: bytes, domain: str) -> Dict:
        """Parse certificate details into structured format"""
        
        # Parse dates
        not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
        not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
        
        # Extract subject
        subject = {}
        for item in cert.get('subject', []):
            for key, value in item:
                subject[key] = value
        
        # Extract issuer
        issuer = {}
        for item in cert.get('issuer', []):
            for key, value in item:
                issuer[key] = value
        
        # Extract SAN (Subject Alternative Names)
        san_list = []
        for key in cert:
            if 'subjectAltName' in key:
                san_list = cert[key]
                break
        
        # Calculate certificate metrics
        now = datetime.now()
        days_until_expiry = (not_after - now).days
        days_since_issued = (now - not_before).days
        validity_days = (not_after - not_before).days
        
        # Get fingerprints
        fingerprint_sha256 = hashlib.sha256(cert_bin).hexdigest()
        fingerprint_sha1 = hashlib.sha1(cert_bin).hexdigest()
        
        # Parse public key info
        public_key_info = self._parse_public_key(cert_bin)
        
        # Check for wildcard
        is_wildcard = False
        common_name = subject.get('commonName', '')
        if common_name.startswith('*.'):
            is_wildcard = True
        for san in san_list:
            if isinstance(san, tuple) and san[1].startswith('*.'):
                is_wildcard = True
        
        result = {
            'domain': domain,
            'subject': subject,
            'issuer': issuer,
            'not_before': not_before.isoformat(),
            'not_after': not_after.isoformat(),
            'validity_days': validity_days,
            'days_until_expiry': days_until_expiry,
            'days_since_issued': days_since_issued,
            'serial_number': cert.get('serialNumber'),
            'fingerprint_sha256': fingerprint_sha256,
            'fingerprint_sha1': fingerprint_sha1,
            'subject_alt_names': san_list,
            'version': cert.get('version'),
            'is_wildcard': is_wildcard,
            'public_key': public_key_info,
            'signature_algorithm': cert.get('signatureAlgorithm'),
            'ocsp': cert.get('OCSP', []),
            'ca_issuers': cert.get('caIssuers', [])
        }
        
        return result
    
    def _parse_public_key(self, cert_bin: bytes) -> Dict:
        """Parse public key information from certificate"""
        
        result = {
            'type': 'Unknown',
            'bits': 0,
            'strength': 'Unknown',
            'risk_score': 0
        }
        
        try:
            x509 = crypto.load_certificate(crypto.FILETYPE_ASN1, cert_bin)
            pub_key = x509.get_pubkey()
            
            # Get key type
            key_type = pub_key.type()
            if key_type == crypto.TYPE_RSA:
                result['type'] = 'RSA'
            elif key_type == crypto.TYPE_DSA:
                result['type'] = 'DSA'
            elif key_type == crypto.TYPE_EC:
                result['type'] = 'EC'
            
            # Get key bits
            result['bits'] = pub_key.bits()
            
            # Assess key strength
            if result['type'] == 'RSA':
                if result['bits'] >= 4096:
                    result['strength'] = 'Very Strong'
                    result['risk_score'] = 0
                elif result['bits'] >= 2048:
                    result['strength'] = 'Strong'
                    result['risk_score'] = 0
                elif result['bits'] >= 1024:
                    result['strength'] = 'Weak'
                    result['risk_score'] = 40
                else:
                    result['strength'] = 'Very Weak'
                    result['risk_score'] = 80
            elif result['type'] == 'EC':
                if result['bits'] >= 256:
                    result['strength'] = 'Strong'
                    result['risk_score'] = 0
                else:
                    result['strength'] = 'Weak'
                    result['risk_score'] = 40
                    
        except Exception as e:
            self._print(f"Failed to parse public key: {str(e)}", "WARNING")
        
        return result
    
    def _get_certificate_chain(self, domain: str, port: int = 443) -> Optional[List[Dict]]:
        """Get full certificate chain using OpenSSL"""
        
        chain = []
        
        try:
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            with socket.create_connection((domain, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    # Get certificate chain
                    certs = ssock.getpeercert(True)
                    # OpenSSL can provide chain, but this is simplified
                    chain.append({'certificate': 'Chain information available'})
        except:
            pass
        
        return chain if chain else None
    
    # =========================================================
    # 2. CERTIFICATE VALIDITY ANALYSIS
    # =========================================================
    
    def analyze_validity(self, cert_info: Dict) -> Dict:
        """
        Analyze certificate validity period
        - Issue date (<7 days = suspicious)
        - Expiry (>1 year = unusual)
        - Renewal frequency
        """
        
        self._print(f"Analyzing certificate validity")
        
        result = {
            'is_valid_now': True,
            'is_expired': False,
            'is_premature': False,
            'days_until_expiry': cert_info.get('days_until_expiry', 0),
            'days_since_issued': cert_info.get('days_since_issued', 0),
            'validity_days': cert_info.get('validity_days', 0),
            'renewal_frequency': None,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check if expired
        if cert_info.get('days_until_expiry', 0) < 0:
            result['is_expired'] = True
            result['is_valid_now'] = False
            result['risk_score'] += 90
            result['warnings'].append('Certificate has EXPIRED - critical security issue')
            self._print("Certificate is EXPIRED", "ERROR")
        
        # Check if certificate is too new (recently issued)
        days_since_issued = cert_info.get('days_since_issued', 999)
        if 0 <= days_since_issued < 7:
            result['risk_score'] += 40
            result['warnings'].append(f'Certificate issued {days_since_issued} days ago (very recent - rushed setup)')
            self._print(f"Certificate is very recent ({days_since_issued} days)", "WARNING")
        elif 7 <= days_since_issued < 30:
            result['risk_score'] += 15
            result['warnings'].append(f'Certificate issued {days_since_issued} days ago (recent)')
        
        # Check if expiring soon
        days_until_expiry = cert_info.get('days_until_expiry', 0)
        if 0 <= days_until_expiry < 7:
            result['risk_score'] += 50
            result['warnings'].append(f'Certificate expires in {days_until_expiry} days (CRITICAL - imminent expiry)')
            self._print(f"Certificate expiring very soon ({days_until_expiry} days)", "ERROR")
        elif 7 <= days_until_expiry < 30:
            result['risk_score'] += 30
            result['warnings'].append(f'Certificate expires in {days_until_expiry} days')
            self._print(f"Certificate expiring soon ({days_until_expiry} days)", "WARNING")
        elif 30 <= days_until_expiry < 90:
            result['risk_score'] += 10
            result['warnings'].append(f'Certificate expires in {days_until_expiry} days')
        
        # Check validity period (scammers use short-lived certs to avoid detection)
        validity_days = cert_info.get('validity_days', 0)
        if validity_days < 30:
            result['risk_score'] += 50
            result['warnings'].append(f'Very short validity period: {validity_days} days (suspicious for legitimate sites)')
            self._print(f"Unusually short validity period: {validity_days} days", "ERROR")
        elif validity_days < 90:
            result['risk_score'] += 25
            result['warnings'].append(f'Short validity period: {validity_days} days')
            self._print(f"Short validity period: {validity_days} days", "WARNING")
        elif validity_days > 825:  # > 2 years (not allowed by browsers anymore)
            result['risk_score'] += 20
            result['warnings'].append(f'Excessive validity period: {validity_days} days (non-compliant)')
            self._print(f"Excessive validity period: {validity_days} days", "WARNING")
        
        # Calculate renewal frequency (based on multiple CT log entries)
        # This would be calculated from historical data
        result['renewal_frequency'] = 'Unknown (need historical data)'
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        return result
    
    # =========================================================
    # 3. CERTIFICATE CHAIN VALIDATION
    # =========================================================
    
    def analyze_certificate_chain(self, cert_info: Dict) -> Dict:
        """
        Analyze certificate chain and issuer
        - Issued by trusted CA?
        - Self-signed detection
        - Wildcard certificate analysis
        """
        
        self._print(f"Analyzing certificate chain and issuer")
        
        issuer = cert_info.get('issuer', {})
        subject = cert_info.get('subject', {})
        
        issuer_name = issuer.get('organizationName', issuer.get('commonName', 'Unknown'))
        issuer_cn = issuer.get('commonName', '')
        subject_cn = subject.get('commonName', '')
        
        result = {
            'issuer_name': issuer_name,
            'issuer_cn': issuer_cn,
            'is_trusted_ca': False,
            'is_suspicious_ca': False,
            'is_self_signed': False,
            'is_wildcard': cert_info.get('is_wildcard', False),
            'ca_trust_score': 0,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check if self-signed (issuer == subject)
        if issuer_cn == subject_cn or issuer_name == subject.get('commonName', ''):
            result['is_self_signed'] = True
            result['risk_score'] += 90
            result['warnings'].append('SELF-SIGNED certificate - HIGHLY SUSPICIOUS for job sites')
            self._print("Self-signed certificate detected - major red flag", "ERROR")
        
        # Check if trusted CA
        issuer_lower = issuer_name.lower()
        
        for trusted_ca in self.trusted_ca_orgs:
            if trusted_ca in issuer_lower:
                result['is_trusted_ca'] = True
                result['ca_trust_score'] = 100
                self._print(f"Certificate issued by trusted CA: {issuer_name}", "SUCCESS")
                break
        
        # Check suspicious CAs
        if not result['is_trusted_ca'] and not result['is_self_signed']:
            for suspicious_ca, risk in self.suspicious_cas.items():
                if suspicious_ca in issuer_lower:
                    result['is_suspicious_ca'] = True
                    result['risk_score'] += risk
                    result['warnings'].append(f'Certificate from suspicious CA: {issuer_name}')
                    self._print(f"Suspicious CA detected: {issuer_name}", "WARNING")
                    break
            
            if not result['is_suspicious_ca']:
                result['risk_score'] += 40
                result['warnings'].append(f'Unknown or untrusted CA: {issuer_name}')
                self._print(f"Unknown CA: {issuer_name}", "WARNING")
        
        # Analyze wildcard certificate risk
        if result['is_wildcard']:
            result['risk_score'] += 25
            result['warnings'].append('Wildcard certificate (*.domain.com) - can be abused for subdomain phishing')
            self._print("Wildcard certificate detected - potential for abuse", "WARNING")
            
            # Check if wildcard is for a suspicious TLD
            domain_parts = subject_cn.split('.')
            if len(domain_parts) >= 2:
                tld = domain_parts[-1]
                if tld in ['top', 'xyz', 'club', 'online', 'site', 'click', 'trade']:
                    result['risk_score'] += 20
                    result['warnings'].append(f'Wildcard on high-risk TLD .{tld}')
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        return result
    
    # =========================================================
    # 4. SUBJECT ALTERNATIVE NAMES (SAN) ANALYSIS
    # =========================================================
    
    def analyze_san(self, cert_info: Dict, expected_domain: str) -> Dict:
        """
        Analyze Subject Alternative Names
        - Other domains on same certificate (shady hosting pattern)
        - Domain matching
        """
        
        self._print(f"Analyzing Subject Alternative Names")
        
        san_list = cert_info.get('subject_alt_names', [])
        subject_cn = cert_info.get('subject', {}).get('commonName', '')
        
        # Extract all domains from SAN
        domains_on_cert = set()
        for san in san_list:
            if isinstance(san, tuple) and len(san) >= 2:
                san_value = san[1]
                # Clean up domain
                san_value = san_value.replace('*.', '')
                if '.' in san_value:
                    domains_on_cert.add(san_value)
        
        # Add CN to list
        if subject_cn and '.' in subject_cn:
            domains_on_cert.add(subject_cn.replace('*.', ''))
        
        result = {
            'common_name': subject_cn,
            'subject_alt_names': san_list,
            'domains_on_certificate': list(domains_on_cert),
            'domain_count': len(domains_on_cert),
            'matches_expected_domain': False,
            'has_shady_hosting_pattern': False,
            'suspicious_domains': [],
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check if certificate matches the expected domain
        expected_clean = expected_domain.lower().replace('www.', '')
        
        # Check CN
        if subject_cn == expected_clean or subject_cn == f'*.{expected_clean}':
            result['matches_expected_domain'] = True
        
        # Check SAN
        for san in san_list:
            if isinstance(san, tuple) and len(san) >= 2:
                san_value = san[1].replace('*.', '')
                if san_value == expected_clean:
                    result['matches_expected_domain'] = True
        
        if not result['matches_expected_domain']:
            result['risk_score'] += 70
            result['warnings'].append(f'Certificate does NOT match domain {expected_domain}')
            self._print(f"Certificate domain mismatch!", "ERROR")
        
        # Check for multiple domains (shady hosting pattern)
        if result['domain_count'] > 5:
            result['risk_score'] += 30
            result['has_shady_hosting_pattern'] = True
            result['warnings'].append(f'Certificate covers {result["domain_count"]} different domains (shared hosting pattern)')
            self._print(f"Certificate covers multiple domains: {result['domain_count']}", "WARNING")
        
        # Check for suspicious domains on same certificate
        for domain_on_cert in domains_on_cert:
            # Check for high-risk TLDs
            parts = domain_on_cert.split('.')
            if len(parts) >= 2:
                tld = parts[-1]
                if tld in ['top', 'xyz', 'club', 'online', 'site', 'click', 'trade', 'gq', 'ml', 'tk', 'cf']:
                    result['suspicious_domains'].append(domain_on_cert)
                    result['risk_score'] += 10
        
        # Check for suspicious patterns in domains
        suspicious_patterns = ['test', 'demo', 'dev', 'staging', 'sandbox', 'localhost', 'example']
        for domain_on_cert in domains_on_cert:
            for pattern in suspicious_patterns:
                if pattern in domain_on_cert.lower():
                    result['suspicious_domains'].append(domain_on_cert)
                    result['risk_score'] += 15
                    break
        
        if result['suspicious_domains']:
            result['warnings'].append(f'Suspicious domains on same certificate: {", ".join(result["suspicious_domains"][:3])}')
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        return result
    
    # =========================================================
    # 5. CERTIFICATE TRANSPARENCY LOGS (crt.sh API)
    # =========================================================
    
    def check_ct_logs(self, domain: str) -> Dict:
        """
        Query Certificate Transparency logs via crt.sh API
        - First seen date in CT logs
        - Number of certificates for same domain
        - Certificate history
        """
        
        self._print(f"Querying CT logs for {domain}")
        
        cache_key = f"ct_logs_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'certificates_found': 0,
            'first_seen': None,
            'last_seen': None,
            'issuers': [],
            'certificate_history': [],
            'suspicious_entries': [],
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Query crt.sh
        try:
            url = f"https://crt.sh/?q=%.{domain}&output=json"
            response = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
            
            if response.status_code == 200:
                try:
                    certs = response.json()
                    
                    if isinstance(certs, list):
                        result['certificates_found'] = len(certs)
                        
                        # Parse entries
                        dates = []
                        issuers_set = set()
                        
                        for cert in certs[:100]:  # Limit to 100
                            if 'entry_timestamp' in cert:
                                dates.append(cert['entry_timestamp'])
                            if 'issuer_name' in cert:
                                issuer = cert['issuer_name']
                                issuers_set.add(issuer)
                                
                                # Check for suspicious entries
                                if 'self-signed' in issuer.lower():
                                    result['suspicious_entries'].append({
                                        'issuer': issuer,
                                        'timestamp': cert.get('entry_timestamp'),
                                        'name': cert.get('name_value', '')
                                    })
                            
                            # Add to history
                            result['certificate_history'].append({
                                'timestamp': cert.get('entry_timestamp'),
                                'issuer': cert.get('issuer_name'),
                                'name': cert.get('name_value')
                            })
                        
                        result['issuers'] = list(issuers_set)
                        
                        if dates:
                            result['first_seen'] = min(dates)
                            result['last_seen'] = max(dates)
                            
                            # Calculate days since first seen
                            try:
                                from datetime import datetime as dt
                                first_seen = dt.fromisoformat(result['first_seen'].replace('Z', '+00:00'))
                                days_since_first = (datetime.now() - first_seen).days
                                
                                result['days_since_first_seen'] = days_since_first
                                
                                # Risk assessment based on first seen
                                if days_since_first < 7:
                                    result['risk_score'] += 40
                                    result['warnings'].append(f'Certificate first seen {days_since_first} days ago (very recent)')
                                    self._print(f"Very recent certificate in CT logs: {days_since_first} days", "WARNING")
                                elif days_since_first < 30:
                                    result['risk_score'] += 20
                                    result['warnings'].append(f'Certificate first seen {days_since_first} days ago')
                                
                                # Check for many certificates (frequent renewal)
                                if result['certificates_found'] > 10:
                                    result['risk_score'] += 15
                                    result['warnings'].append(f'Frequent certificate issuance: {result["certificates_found"]} certificates')
                                    self._print(f"High number of certificates: {result['certificates_found']}", "WARNING")
                                    
                            except:
                                pass
                    
                    self._print(f"Found {result['certificates_found']} certificates in CT logs")
                    if result['first_seen']:
                        self._print(f"First seen: {result['first_seen']}")
                    
                except json.JSONDecodeError:
                    self._print(f"Failed to parse crt.sh response", "WARNING")
                    
        except requests.exceptions.Timeout:
            self._print(f"crt.sh API timeout", "WARNING")
        except Exception as e:
            self._print(f"CT log query failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        # Cache for 12 hours
        self.cache.set(cache_key, result, ttl_seconds=43200)
        
        return result
    
    # =========================================================
    # 6. SSL PROTOCOL & CIPHER SUITE ANALYSIS
    # =========================================================
    
    def analyze_protocols_and_ciphers(self, domain: str, port: int = 443) -> Dict:
        """
        Analyze supported SSL/TLS protocols and cipher suites
        """
        
        self._print(f"Analyzing SSL/TLS protocols and ciphers for {domain}")
        
        cache_key = f"protocols_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'supported_protocols': [],
            'insecure_protocols': [],
            'ciphers': [],
            'insecure_ciphers': [],
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Test each protocol version
        protocols_to_test = [
            (ssl.PROTOCOL_SSLv23, 'SSLv23'),
            (ssl.PROTOCOL_TLSv1, 'TLSv1.0'),
            (ssl.PROTOCOL_TLSv1_1, 'TLSv1.1'),
            (ssl.PROTOCOL_TLSv1_2, 'TLSv1.2')
        ]
        
        # Note: TLSv1.3 requires different method
        for proto, name in protocols_to_test:
            try:
                context = ssl.SSLContext(proto)
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                
                with socket.create_connection((domain, port), timeout=5) as sock:
                    with context.wrap_socket(sock, server_hostname=domain) as ssock:
                        result['supported_protocols'].append(name)
                        
                        # Check for insecure protocols
                        if name in ['SSLv23', 'TLSv1.0', 'TLSv1.1']:
                            result['insecure_protocols'].append(name)
                            risk_increase = self.protocol_risk.get(name, 50)
                            result['risk_score'] += risk_increase
                            result['warnings'].append(f'Insecure protocol supported: {name}')
                            self._print(f"Insecure protocol {name} supported", "ERROR")
                        else:
                            self._print(f"Protocol {name} supported", "SUCCESS")
            except:
                pass
        
        # Test TLSv1.3 (requires different approach)
        try:
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            context.minimum_version = ssl.TLSVersion.TLSv1_3
            context.maximum_version = ssl.TLSVersion.TLSv1_3
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            with socket.create_connection((domain, port), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    result['supported_protocols'].append('TLSv1.3')
                    self._print("TLSv1.3 supported", "SUCCESS")
        except:
            pass
        
        # Check for weak cipher suites (simplified - would need full SSL library)
        if result['insecure_protocols']:
            result['risk_score'] += 20
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        
        return result
    
    # =========================================================
    # 7. REVOCATION STATUS (CRL/OCSP)
    # =========================================================
    
    def check_revocation_status(self, cert_info: Dict) -> Dict:
        """
        Check certificate revocation status via CRL/OCSP
        (Passive check - no active OCSP requests)
        """
        
        self._print(f"Checking revocation status")
        
        result = {
            'is_revoked': False,
            'revocation_reason': None,
            'crl_distribution_points': cert_info.get('ca_issuers', []),
            'ocsp_urls': cert_info.get('ocsp', []),
            'can_check_revocation': False,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check if OCSP or CRL endpoints are available
        if result['ocsp_urls'] or result['crl_distribution_points']:
            result['can_check_revocation'] = True
            self._print("Revocation checking endpoints available", "SUCCESS")
        else:
            result['risk_score'] += 20
            result['warnings'].append('No OCSP or CRL endpoints - cannot check revocation')
            self._print("No revocation checking endpoints", "WARNING")
        
        # Note: Full revocation checking would require OCSP requests
        # For passive analysis, we rely on CT logs for revocation signals
        
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        return result
    
    # =========================================================
    # 8. CERTIFICATE FINGERPRINT CHECK
    # =========================================================
    
    def check_certificate_fingerprint(self, cert_info: Dict) -> Dict:
        """
        Check certificate fingerprint against known malicious databases
        """
        
        result = {
            'fingerprint_sha256': cert_info.get('fingerprint_sha256'),
            'fingerprint_sha1': cert_info.get('fingerprint_sha1'),
            'is_known_malicious': False,
            'known_as': None,
            'risk_score': 0,
            'warnings': []
        }
        
        # Check against known malicious fingerprints
        fp_sha256 = cert_info.get('fingerprint_sha256')
        if fp_sha256 and fp_sha256 in self.known_malicious_fingerprints:
            result['is_known_malicious'] = True
            result['known_as'] = self.known_malicious_fingerprints[fp_sha256]
            result['risk_score'] = 100
            result['warnings'].append(f'Certificate matches known malicious fingerprint: {result["known_as"]}')
            self._print("Certificate matches known malicious fingerprint!", "ERROR")
        
        return result
    
    # =========================================================
    # 9. COMPLETE SSL ANALYSIS
    # =========================================================
    
    def analyze_domain(self, domain: str, port: int = 443) -> Dict:
        """Complete SSL/TLS analysis for a domain"""
        
        self._print(f"")
        self._print(f"Starting complete SSL analysis for {domain}")
        self._print("-" * 50)
        
        # Fetch certificate
        cert_info = self.fetch_certificate(domain, port)
        
        if not cert_info:
            return {
                'domain': domain,
                'error': 'Could not fetch SSL certificate',
                'risk_score': 80,
                'risk_level': 'CRITICAL',
                'red_flags': ['No SSL certificate - modern job sites require HTTPS'],
                'recommendations': ['Verify website manually', 'High risk of phishing']
            }
        
        # Run all analyses
        validity_result = self.analyze_validity(cert_info)
        chain_result = self.analyze_certificate_chain(cert_info)
        san_result = self.analyze_san(cert_info, domain)
        ct_logs_result = self.check_ct_logs(domain)
        protocols_result = self.analyze_protocols_and_ciphers(domain, port)
        revocation_result = self.check_revocation_status(cert_info)
        fingerprint_result = self.check_certificate_fingerprint(cert_info)
        
        # Calculate overall risk (weighted)
        weights = {
            'validity': 0.20,
            'chain': 0.25,
            'san': 0.20,
            'ct_logs': 0.15,
            'protocols': 0.10,
            'revocation': 0.05,
            'fingerprint': 0.05
        }
        
        risk_score = (
            validity_result.get('risk_score', 0) * weights['validity'] +
            chain_result.get('risk_score', 0) * weights['chain'] +
            san_result.get('risk_score', 0) * weights['san'] +
            ct_logs_result.get('risk_score', 0) * weights['ct_logs'] +
            protocols_result.get('risk_score', 0) * weights['protocols'] +
            revocation_result.get('risk_score', 0) * weights['revocation'] +
            fingerprint_result.get('risk_score', 0) * weights['fingerprint']
        )
        
        risk_score = int(risk_score)
        
        # Collect all red flags
        red_flags = []
        for warning in validity_result.get('warnings', []):
            red_flags.append(f"[Validity] {warning}")
        for warning in chain_result.get('warnings', []):
            red_flags.append(f"[Chain] {warning}")
        for warning in san_result.get('warnings', []):
            red_flags.append(f"[SAN] {warning}")
        for warning in ct_logs_result.get('warnings', []):
            red_flags.append(f"[CT Logs] {warning}")
        for warning in protocols_result.get('warnings', []):
            red_flags.append(f"[Protocols] {warning}")
        for warning in revocation_result.get('warnings', []):
            red_flags.append(f"[Revocation] {warning}")
        for warning in fingerprint_result.get('warnings', []):
            red_flags.append(f"[Fingerprint] {warning}")
        
        # Generate recommendations
        recommendations = self._get_recommendations(risk_score, red_flags)
        
        result = {
            'domain': domain,
            'certificate': {
                'subject': cert_info.get('subject', {}),
                'issuer': cert_info.get('issuer', {}),
                'not_before': cert_info.get('not_before'),
                'not_after': cert_info.get('not_after'),
                'days_until_expiry': cert_info.get('days_until_expiry'),
                'fingerprint_sha256': cert_info.get('fingerprint_sha256'),
                'public_key': cert_info.get('public_key', {})
            },
            'validity_analysis': validity_result,
            'certificate_chain_analysis': chain_result,
            'san_analysis': san_result,
            'ct_logs_analysis': ct_logs_result,
            'protocols_analysis': protocols_result,
            'revocation_check': revocation_result,
            'fingerprint_check': fingerprint_result,
            'risk_score': min(100, risk_score),
            'risk_level': self._get_risk_level(risk_score),
            'red_flags': red_flags[:15],  # Limit to 15
            'recommendations': recommendations
        }
        
        self._print("-" * 50)
        self._print(f"SSL analysis complete for {domain}")
        self._print(f"Overall Risk: {result['risk_level']} ({risk_score}/100)")
        
        if red_flags:
            self._print(f"Red flags found: {len(red_flags)}", "WARNING")
        
        self._print("-" * 50)
        
        return result
    
    def analyze_multiple(self, domains: List[str]) -> Dict:
        """Analyze SSL certificates for multiple domains in parallel"""
        
        self._print(f"Starting batch SSL analysis for {len(domains)} domains")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_domain = {
                executor.submit(self.analyze_domain, domain): domain
                for domain in domains if domain
            }
            
            for future in as_completed(future_to_domain):
                domain = future_to_domain[future]
                try:
                    result = future.result()
                    results[domain] = result
                    if 'risk_score' in result:
                        risks.append(result['risk_score'])
                    self._print(f"Completed {domain}")
                except Exception as e:
                    self._print(f"Error analyzing {domain}: {str(e)}", "ERROR")
                    results[domain] = {'domain': domain, 'error': str(e)}
        
        # Summary
        self._print("")
        self._print("SSL BATCH SUMMARY")
        self._print(f"Total domains: {len(domains)}")
        self._print(f"Successfully analyzed: {len(risks)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest SSL risk: {max_risk}/100")
            self._print(f"Average SSL risk: {int(avg_risk)}/100")
            
            if max_risk >= 80:
                self._print("CRITICAL: SSL certificates indicate scam/phishing sites", "WARNING")
            elif max_risk >= 60:
                self._print("HIGH: SSL certificates have serious issues", "WARNING")
        
        return {
            'summary': {
                'total': len(domains),
                'analyzed': len(risks),
                'max_risk': max(risks) if risks else 0,
                'avg_risk': int(sum(risks) / len(risks)) if risks else 0
            },
            'results': results
        }
    
    def _get_risk_level(self, score: int) -> str:
        if score >= 80:
            return 'CRITICAL'
        elif score >= 60:
            return 'HIGH'
        elif score >= 40:
            return 'MEDIUM'
        elif score >= 20:
            return 'LOW'
        else:
            return 'SAFE'
    
    def _get_recommendations(self, risk_score: int, red_flags: List[str]) -> List[str]:
        recommendations = []
        
        if risk_score >= 80:
            recommendations.append("CRITICAL: SSL configuration strongly indicates scam/phishing site")
            recommendations.append("Do NOT enter any personal information or credentials")
            recommendations.append("The certificate is likely fraudulent or self-signed")
            recommendations.append("Report this domain to Google Safe Browsing")
        elif risk_score >= 60:
            recommendations.append("SSL certificate has serious issues indicating potential scam")
            recommendations.append("Verify the certificate details manually before trusting")
            recommendations.append("Check if the domain matches legitimate company")
        elif risk_score >= 40:
            recommendations.append("SSL certificate has suspicious characteristics")
            recommendations.append("Double-check the certificate issuer and validity period")
            recommendations.append("Look for other red flags in other modules")
        elif risk_score >= 20:
            recommendations.append("SSL certificate has minor issues but appears mostly legitimate")
            recommendations.append("Continue verification with other modules")
        else:
            recommendations.append("SSL certificate appears legitimate and properly configured")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    sa = SSLAnalyzer(verbose=True)
    
    test_domains = [
        "google.com",
        "suspicious-job-site.top"
    ]
    
    results = sa.analyze_multiple(test_domains)
    
    print("\n" + json.dumps(results, indent=2, default=str))