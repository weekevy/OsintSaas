"""
Module 2: Complete Email Forensics
Includes: SPF/DKIM/DMARC, Catch-all detection, Email reputation, HaveIBeenPwned
"""

import dns.resolver
import dns.query
import dns.zone
import re
import hashlib
import requests
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import smtplib
import socket

# Import utilities
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("EmailForensics")

class EmailForensics:
    """Complete email forensics with all passive techniques"""
    
    def __init__(self, verbose: bool = True, hibp_api_key: str = None):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/email")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        self.hibp_api_key = hibp_api_key  # Optional: Get from https://haveibeenpwned.com/API/Key
        
        # Free email providers database
        self.free_email_providers = {
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com',
            'proton.me', 'aol.com', 'icloud.com', 'mail.com', 'yandex.com',
            'zoho.com', 'gmx.com', 'tutanota.com', 'fastmail.com', 'msn.com',
            'live.com', 'inbox.com', 'mail.ru', 'bk.ru', 'list.ru', 'rambler.ru',
            'seznam.cz', 'wp.pl', 'o2.pl', 'interia.pl', 'onet.pl'
        }
        
        # Known malicious domains (partial)
        self.malicious_domains = {
            'tempmail.com', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org'
        }
        
        # DKIM selector patterns to try
        self.dkim_selectors = ['default', 'google', 'selector1', 'selector2', 
                               '20161025', '2017', 'dkim', 'mail', 'k1', 'k2']
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] EMAIL ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] EMAIL WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] EMAIL SUCCESS: {message}")
        else:
            print(f"[{timestamp}] EMAIL: {message}")
    
    # =========================================================
    # 1. SPF RECORD ANALYSIS
    # =========================================================
    
    def check_spf(self, domain: str) -> Dict:
        """Check SPF (Sender Policy Framework) record"""
        
        self._print(f"Checking SPF for {domain}")
        
        cache_key = f"spf_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'exists': False,
            'record': None,
            'mechanisms': [],
            'all_mechanism': None,
            'is_weak': False,
            'risk_score': 0,
            'details': {}
        }
        
        try:
            txt_records = dns.resolver.resolve(domain, 'TXT')
            for record in txt_records:
                txt = str(record).lower()
                if 'v=spf1' in txt:
                    result['exists'] = True
                    result['record'] = txt[:300]
                    
                    # Parse mechanisms
                    mechanisms = txt.split()
                    result['mechanisms'] = [m for m in mechanisms if m.startswith(('+', '~', '-', '?'))]
                    
                    # Check ~all or -all (good) vs ?all or +all (weak)
                    if '~all' in txt:
                        result['all_mechanism'] = 'softfail'
                        result['risk_score'] = 10
                        self._print(f"SPF has ~all (softfail) - moderate protection", "WARNING")
                    elif '-all' in txt:
                        result['all_mechanism'] = 'fail'
                        result['risk_score'] = 0
                        self._print(f"SPF has -all (fail) - good protection", "SUCCESS")
                    elif '?all' in txt:
                        result['all_mechanism'] = 'neutral'
                        result['risk_score'] = 30
                        result['is_weak'] = True
                        self._print(f"SPF has ?all (neutral) - weak protection", "WARNING")
                    elif '+all' in txt:
                        result['all_mechanism'] = 'pass'
                        result['risk_score'] = 50
                        result['is_weak'] = True
                        self._print(f"SPF has +all (pass) - ALLOW ANYONE to send!", "ERROR")
                    else:
                        result['risk_score'] = 20
                    
                    break
                    
        except dns.resolver.NXDOMAIN:
            self._print(f"No TXT records found for {domain}", "WARNING")
        except Exception as e:
            self._print(f"SPF check failed: {str(e)}", "ERROR")
        
        if not result['exists']:
            result['risk_score'] = 40
            self._print(f"No SPF record for {domain} - domain can be spoofed", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 2. DKIM RECORD ANALYSIS
    # =========================================================
    
    def check_dkim(self, domain: str) -> Dict:
        """Check DKIM (DomainKeys Identified Mail) records"""
        
        self._print(f"Checking DKIM for {domain}")
        
        cache_key = f"dkim_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'exists': False,
            'selectors_found': [],
            'records': [],
            'risk_score': 0
        }
        
        # Try common selectors
        for selector in self.dkim_selectors:
            dkim_domain = f"{selector}._domainkey.{domain}"
            try:
                txt_records = dns.resolver.resolve(dkim_domain, 'TXT')
                for record in txt_records:
                    txt = str(record).lower()
                    if 'v=dkim1' in txt or 'k=rsa' in txt:
                        result['exists'] = True
                        result['selectors_found'].append(selector)
                        result['records'].append({
                            'selector': selector,
                            'record': txt[:200]
                        })
                        self._print(f"DKIM record found with selector: {selector}", "SUCCESS")
                        break
            except:
                continue
        
        if not result['exists']:
            result['risk_score'] = 20
            self._print(f"No DKIM records found for {domain}", "WARNING")
        else:
            result['risk_score'] = 0
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 3. DMARC RECORD ANALYSIS
    # =========================================================
    
    def check_dmarc(self, domain: str) -> Dict:
        """Check DMARC (Domain-based Message Authentication) record"""
        
        self._print(f"Checking DMARC for {domain}")
        
        cache_key = f"dmarc_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'exists': False,
            'record': None,
            'policy': None,
            'subdomain_policy': None,
            'pct': 100,
            'rua': None,  # Reporting URI for aggregate reports
            'ruf': None,  # Reporting URI for forensic reports
            'risk_score': 0,
            'is_weak': False
        }
        
        dmarc_domain = f"_dmarc.{domain}"
        
        try:
            txt_records = dns.resolver.resolve(dmarc_domain, 'TXT')
            for record in txt_records:
                txt = str(record).lower()
                if 'v=dmarc1' in txt:
                    result['exists'] = True
                    result['record'] = txt[:300]
                    
                    # Extract policy
                    if 'p=reject' in txt:
                        result['policy'] = 'reject'
                        result['risk_score'] = 0
                        self._print(f"DMARC reject policy - best protection", "SUCCESS")
                    elif 'p=quarantine' in txt:
                        result['policy'] = 'quarantine'
                        result['risk_score'] = 10
                        self._print(f"DMARC quarantine policy - good protection")
                    elif 'p=none' in txt:
                        result['policy'] = 'none'
                        result['risk_score'] = 30
                        result['is_weak'] = True
                        self._print(f"DMARC none policy - monitoring only (weak)", "WARNING")
                    
                    # Check subdomain policy
                    if 'sp=reject' in txt:
                        result['subdomain_policy'] = 'reject'
                    elif 'sp=quarantine' in txt:
                        result['subdomain_policy'] = 'quarantine'
                    elif 'sp=none' in txt:
                        result['subdomain_policy'] = 'none'
                    
                    # Extract percentage
                    pct_match = re.search(r'pct=(\d+)', txt)
                    if pct_match:
                        result['pct'] = int(pct_match.group(1))
                        if result['pct'] < 100:
                            self._print(f"DMARC only applies to {result['pct']}% of emails", "WARNING")
                    
                    # Extract reporting URIs
                    rua_match = re.search(r'rua=mailto:([^\s]+)', txt)
                    if rua_match:
                        result['rua'] = rua_match.group(1)
                    
                    ruf_match = re.search(r'ruf=mailto:([^\s]+)', txt)
                    if ruf_match:
                        result['ruf'] = ruf_match.group(1)
                    
                    break
                    
        except dns.resolver.NXDOMAIN:
            self._print(f"No DMARC record for {domain}", "WARNING")
        except Exception as e:
            self._print(f"DMARC check failed: {str(e)}", "ERROR")
        
        if not result['exists']:
            result['risk_score'] = 40
            self._print(f"No DMARC record - domain has no email authentication policy", "ERROR")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 4. CATCH-ALL DETECTION (Does domain accept any email?)
    # =========================================================
    
    def check_catch_all(self, domain: str) -> Dict:
        """
        Check if domain accepts emails to any address (catch-all)
        This is a passive check using DNS and SMTP without sending actual emails
        """
        
        self._print(f"Checking catch-all status for {domain}")
        
        cache_key = f"catchall_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'is_catch_all': False,
            'confidence': 0,
            'method': None,
            'risk_score': 0,
            'details': {}
        }
        
        # Method 1: Check MX records existence
        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            if not mx_records:
                result['details']['no_mx'] = True
                result['is_catch_all'] = False
                self._print(f"No MX records - domain cannot receive email", "WARNING")
                return result
        except:
            result['details']['mx_error'] = True
            return result
        
        # Method 2: Check for common catch-all patterns via DNS
        # Some domains publish catch-all info in TXT records
        try:
            txt_records = dns.resolver.resolve(domain, 'TXT')
            for record in txt_records:
                txt = str(record).lower()
                if 'catch-all' in txt or 'catchall' in txt:
                    result['is_catch_all'] = True
                    result['confidence'] = 70
                    result['method'] = 'dns_record'
                    self._print(f"Domain explicitly indicates catch-all in DNS", "WARNING")
        except:
            pass
        
        # Method 3: Infer from MX provider (some providers are catch-all by default)
        mx_providers = []
        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            for mx in mx_records:
                mx_str = str(mx.exchange).lower()
                if 'google' in mx_str or 'gmail' in mx_str:
                    mx_providers.append('google')
                elif 'outlook' in mx_str or 'microsoft' in mx_str:
                    mx_providers.append('microsoft')
                elif 'amazon' in mx_str or 'aws' in mx_str:
                    mx_providers.append('aws')
            
            # Google Workspace and Microsoft 365 can be configured as catch-all
            # This is NOT definitive but indicates possibility
            if mx_providers:
                result['details']['mx_provider'] = mx_providers
                result['is_catch_all'] = True
                result['confidence'] = 30
                result['method'] = 'mx_provider_inference'
                self._print(f"MX provider {mx_providers[0]} may support catch-all")
        except:
            pass
        
        # Risk: Catch-all domains are suspicious for job scams
        # Legitimate companies rarely use catch-all (except for specific use cases)
        if result['is_catch_all']:
            if result['confidence'] > 50:
                result['risk_score'] = 50
                self._print(f"High confidence catch-all detected - suspicious", "WARNING")
            else:
                result['risk_score'] = 25
                self._print(f"Possible catch-all configuration", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 5. EMAIL REPUTATION CHECK
    # =========================================================
    
    def check_email_reputation(self, email: str) -> Dict:
        """Check email reputation using multiple sources"""
        
        self._print(f"Checking reputation for {email}")
        
        cache_key = f"reputation_{email}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        domain = email.split('@')[1].lower()
        
        result = {
            'email': email,
            'domain': domain,
            'is_disposable': False,
            'is_temp_email': False,
            'is_role_account': False,
            'reputation_score': 0,
            'risk_score': 0,
            'flags': []
        }
        
        # Check disposable email domains
        if domain in self.malicious_domains:
            result['is_disposable'] = True
            result['is_temp_email'] = True
            result['flags'].append('disposable_email')
            result['risk_score'] += 60
            self._print(f"Email uses disposable/temporary domain: {domain}", "ERROR")
        
        # Check role-based accounts (admin@, info@, etc)
        username = email.split('@')[0].lower()
        role_accounts = ['admin', 'info', 'support', 'contact', 'sales', 'hr', 
                        'jobs', 'careers', 'recruiting', 'noreply', 'no-reply']
        
        if username in role_accounts:
            result['is_role_account'] = True
            result['flags'].append('role_account')
            result['risk_score'] += 15
            self._print(f"Role-based account: {username}@ - may not be a real person", "WARNING")
        
        # Check for suspicious patterns
        suspicious_patterns = [
            (r'^[a-z0-9]{8,}$', 'random_string', 20),
            (r'^[a-z]+[0-9]{4,}$', 'word_with_numbers', 15),
            (r'^hr[0-9]+$', 'generic_hr', 25),
            (r'^hiring[0-9]*$', 'generic_hiring', 25),
        ]
        
        for pattern, flag, score in suspicious_patterns:
            if re.match(pattern, username):
                result['flags'].append(flag)
                result['risk_score'] += score
                self._print(f"Suspicious username pattern: {username}", "WARNING")
                break
        
        # Calculate reputation score (0 = good, 100 = bad)
        result['reputation_score'] = min(100, result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=43200)  # 12 hours
        return result
    
    # =========================================================
    # 6. HAVEIBEENPWNED BREACH CHECK
    # =========================================================
    
    def check_breach_status(self, email: str) -> Dict:
        """
        Check if email appears in known data breaches using HaveIBeenPwned API
        Uses k-anonymity model (only sends first 5 chars of SHA1 hash)
        """
        
        self._print(f"Checking breach status for {email}")
        
        cache_key = f"hibp_{email}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'email': email,
            'pwned': False,
            'breach_count': 0,
            'breaches': [],
            'paste_count': 0,
            'risk_score': 0,
            'error': None
        }
        
        # Skip if no API key
        if not self.hibp_api_key:
            self._print("HaveIBeenPwned API key not provided - skipping breach check", "WARNING")
            result['error'] = 'API key required'
            return result
        
        try:
            # Create SHA1 hash of email
            email_hash = hashlib.sha1(email.lower().encode()).hexdigest().upper()
            prefix = email_hash[:5]
            suffix = email_hash[5:]
            
            # Query HIBP API (k-anonymity)
            url = f"https://api.pwnedpasswords.com/range/{prefix}"
            headers = {
                'hibp-api-key': self.hibp_api_key,
                'User-Agent': 'Job-Scam-Investigator/1.0'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Check if our suffix is in the response
                hashes = response.text.splitlines()
                for line in hashes:
                    hash_suffix, count = line.split(':')
                    if hash_suffix == suffix:
                        result['pwned'] = True
                        result['breach_count'] = int(count)
                        result['risk_score'] = min(40, result['breach_count'] / 10)
                        self._print(f"Email found in {result['breach_count']} breaches!", "ERROR")
                        break
                else:
                    self._print(f"Email not found in known breaches", "SUCCESS")
            
            elif response.status_code == 401:
                self._print("Invalid HIBP API key", "ERROR")
                result['error'] = 'Invalid API key'
            else:
                self._print(f"HIBP API returned {response.status_code}", "WARNING")
                
        except requests.exceptions.Timeout:
            self._print("HIBP API timeout", "WARNING")
            result['error'] = 'Timeout'
        except Exception as e:
            self._print(f"HIBP check failed: {str(e)}", "ERROR")
            result['error'] = str(e)
        
        self.cache.set(cache_key, result, ttl_seconds=43200)  # 12 hours
        return result
    
    # =========================================================
    # 7. DOMAIN REPUTATION (Spamhaus, etc)
    # =========================================================
    
    def check_domain_blacklist(self, domain: str) -> Dict:
        """Check if domain is blacklisted"""
        
        self._print(f"Checking blacklist status for {domain}")
        
        cache_key = f"blacklist_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'listed': False,
            'lists': [],
            'risk_score': 0
        }
        
        # Check against known DNSBLs
        dnsbl_servers = [
            'zen.spamhaus.org',
            'bl.spamcop.net',
            'dnsbl.sorbs.net',
            'b.barracudacentral.org'
        ]
        
        try:
            # Get IP address
            ip = socket.gethostbyname(domain)
            reversed_ip = '.'.join(reversed(ip.split('.')))
            
            for dnsbl in dnsbl_servers:
                query = f"{reversed_ip}.{dnsbl}"
                try:
                    dns.resolver.resolve(query, 'A')
                    result['listed'] = True
                    result['lists'].append(dnsbl)
                    self._print(f"Domain listed on {dnsbl}", "ERROR")
                except dns.resolver.NXDOMAIN:
                    pass
                except Exception:
                    pass
                    
        except socket.gaierror:
            self._print(f"Cannot resolve IP for {domain}", "WARNING")
        
        if result['listed']:
            result['risk_score'] = 70
            self._print(f"Domain blacklisted on {len(result['lists'])} lists", "ERROR")
        else:
            self._print(f"Domain not found in blacklists", "SUCCESS")
        
        self.cache.set(cache_key, result, ttl_seconds=3600)  # 1 hour
        return result
    
    # =========================================================
    # 8. COMPLETE EMAIL ANALYSIS
    # =========================================================
    
    def analyze_email(self, email: str) -> Dict:
        """Complete analysis of a single email address"""
        
        self._print(f"Analyzing email: {email}")
        
        if not email or '@' not in email:
            return {'error': 'Invalid email format', 'email': email}
        
        domain = email.split('@')[1].lower()
        username = email.split('@')[0]
        
        # Run all checks
        self._print(f"Checking if {domain} is a free email provider...")
        is_free = domain in self.free_email_providers

        self._print(f"Analyzing SPF records for {domain}...")
        spf_result = self.check_spf(domain)

        self._print(f"Analyzing DKIM records for {domain}...")
        dkim_result = self.check_dkim(domain)

        self._print(f"Analyzing DMARC records for {domain}...")
        dmarc_result = self.check_dmarc(domain)

        self._print(f"Testing for catch-all email behavior on {domain}...")
        catch_all_result = self.check_catch_all(domain)

        self._print(f"Checking email reputation for {email}...")
        reputation_result = self.check_email_reputation(email)

        self._print(f"Checking breach status for {email}...")
        breach_result = self.check_breach_status(email)

        self._print(f"Checking domain blacklist status for {domain}...")
        blacklist_result = self.check_domain_blacklist(domain)        
        # Calculate overall risk
        risk_score = 0
        red_flags = []
        
        # Free email provider
        if is_free:
            risk_score += 40
            red_flags.append(f"Free email provider ({domain}) - legitimate companies use custom domains")
        
        # SPF issues
        if spf_result.get('risk_score', 0) >= 30:
            risk_score += spf_result['risk_score']
            red_flags.append(f"SPF issue: {spf_result.get('all_mechanism', 'missing')}")
        
        # DKIM missing
        if not dkim_result.get('exists'):
            risk_score += 15
            red_flags.append("Missing DKIM - email authenticity cannot be verified")
        
        # DMARC missing or weak
        if dmarc_result.get('risk_score', 0) >= 30:
            risk_score += dmarc_result['risk_score']
            red_flags.append(f"DMARC issue: {dmarc_result.get('policy', 'missing')}")
        
        # Catch-all detection
        if catch_all_result.get('is_catch_all'):
            risk_score += catch_all_result.get('risk_score', 0)
            red_flags.append("Domain uses catch-all email - accepts any address")
        
        # Reputation issues
        if reputation_result.get('risk_score', 0) > 30:
            risk_score += reputation_result['risk_score'] * 0.5
            for flag in reputation_result.get('flags', []):
                red_flags.append(f"Reputation flag: {flag}")
        
        # Breach found
        if breach_result.get('pwned'):
            risk_score += breach_result.get('risk_score', 20)
            red_flags.append(f"Email found in {breach_result.get('breach_count', 0)} data breaches")
        
        # Blacklisted
        if blacklist_result.get('listed'):
            risk_score += blacklist_result.get('risk_score', 50)
            red_flags.append(f"Domain blacklisted on {len(blacklist_result.get('lists', []))} lists")
        
        risk_score = min(100, int(risk_score))
        
        result = {
            'email': email,
            'username': username,
            'domain': domain,
            'is_free_provider': is_free,
            'spf': spf_result,
            'dkim': dkim_result,
            'dmarc': dmarc_result,
            'catch_all': catch_all_result,
            'reputation': reputation_result,
            'breach_check': breach_result,
            'blacklist_check': blacklist_result,
            'risk_score': risk_score,
            'risk_level': self._get_risk_level(risk_score),
            'red_flags': red_flags,
            'recommendations': self._get_recommendations(risk_score, red_flags)
        }
        
        self._print(f"Analysis complete: Risk {result['risk_level']} ({risk_score}/100)")
        
        return result
    
    def analyze_multiple(self, emails: List[str]) -> Dict:
        """Analyze multiple email addresses in parallel"""
        
        self._print(f"Starting batch analysis for {len(emails)} emails")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_email = {
                executor.submit(self.analyze_email, email): email 
                for email in emails if email
            }
            
            for future in as_completed(future_to_email):
                email = future_to_email[future]
                try:
                    result = future.result()
                    results[email] = result
                    if 'risk_score' in result:
                        risks.append(result['risk_score'])
                except Exception as e:
                    self._print(f"Error analyzing {email}: {str(e)}", "ERROR")
                    results[email] = {'email': email, 'error': str(e)}
        
        # Summary
        self._print("")
        self._print("EMAIL BATCH SUMMARY")
        self._print(f"Total emails: {len(emails)}")
        self._print(f"Successfully analyzed: {len(risks)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest risk: {max_risk}/100")
            self._print(f"Average risk: {int(avg_risk)}/100")
        
        return {
            'summary': {
                'total': len(emails),
                'analyzed': len(risks),
                'max_risk': max(risks) if risks else 0,
                'avg_risk': int(sum(risks) / len(risks)) if risks else 0
            },
            'results': results
        }
    
    def check_email_match(self, recruiter_email: str, company_domain: str) -> Dict:
        """Check if recruiter email domain matches company domain"""
        
        self._print(f"Checking email domain match: {recruiter_email} vs {company_domain}")
        
        if not recruiter_email or not company_domain:
            return {
                'match': False,
                'risk_score': 50,
                'risk_level': 'MEDIUM',
                'message': 'Cannot verify - missing information'
            }
        
        recruiter_domain = recruiter_email.split('@')[1].lower()
        company_domain = company_domain.lower()
        
        match = recruiter_domain == company_domain
        
        if match:
            self._print(f"Email domain matches: {recruiter_domain}", "SUCCESS")
            return {
                'match': True,
                'risk_score': 0,
                'risk_level': 'SAFE',
                'message': f'Email domain matches company'
            }
        else:
            self._print(f"Domain MISMATCH: {recruiter_domain} vs {company_domain}", "ERROR")
            return {
                'match': False,
                'risk_score': 80,
                'risk_level': 'CRITICAL',
                'message': f'Domain mismatch - recruiter email uses {recruiter_domain}'
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
            recommendations.append("DO NOT respond - email shows strong scam indicators")
            recommendations.append("Report this email to anti-phishing databases")
        elif risk_score >= 60:
            recommendations.append("High risk - verify recruiter through official channels")
            recommendations.append("Do not click any links or send personal information")
        elif risk_score >= 40:
            recommendations.append("Medium risk - proceed with caution")
            recommendations.append("Verify recruiter identity through LinkedIn or phone")
        else:
            recommendations.append("Email appears legitimate - continue verification")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    ef = EmailForensics(verbose=True, hibp_api_key="YOUR_API_KEY_HERE")
    
    test_emails = [
        "john.doe@google.com",
        "hr@gmail.com",
        "recruiter@suspicious-domain.top"
    ]
    
    results = ef.analyze_multiple(test_emails)
    
    print("\n" + json.dumps(results, indent=2, default=str))