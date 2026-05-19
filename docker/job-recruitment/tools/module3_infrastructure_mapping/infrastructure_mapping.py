"""
Module 3: Infrastructure Mapping
Complete passive infrastructure analysis including:
- Hosting Provider Detection
- Name Server Analysis
- ASN & BGP Information
- Historical DNS Records
- Subdomain Enumeration
- DNS Reconnaissance
"""

import dns.resolver
import dns.reversename
import socket
import requests
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import ipaddress

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("InfrastructureMapping")

class InfrastructureMapping:
    """Complete infrastructure mapping with passive techniques"""
    
    def __init__(self, verbose: bool = True, securitytrails_api_key: str = None):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/infrastructure")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        self.securitytrails_api_key = securitytrails_api_key  # Optional for historical DNS
        
        # Hosting provider fingerprints
        self.hosting_providers = {
            # Major cloud providers
            'aws.amazon.com': {'name': 'AWS', 'risk': 10, 'patterns': ['amazon', 'aws', 'ec2']},
            'google.com': {'name': 'Google Cloud', 'risk': 10, 'patterns': ['google', 'gcp']},
            'microsoft.com': {'name': 'Azure', 'risk': 10, 'patterns': ['azure', 'microsoft', 'msn']},
            'cloudflare.com': {'name': 'Cloudflare', 'risk': 5, 'patterns': ['cloudflare']},
            
            # Common hosting providers (neutral)
            'digitalocean.com': {'name': 'DigitalOcean', 'risk': 20, 'patterns': ['digitalocean']},
            'linode.com': {'name': 'Linode', 'risk': 20, 'patterns': ['linode']},
            'vultr.com': {'name': 'Vultr', 'risk': 20, 'patterns': ['vultr']},
            'ovh.com': {'name': 'OVH', 'risk': 20, 'patterns': ['ovh']},
            
            # Bulletproof hosting (high risk for scams)
            'flokinet.is': {'name': 'Flokinet', 'risk': 85, 'patterns': ['flokinet']},
            'alexhost.com': {'name': 'AlexHost', 'risk': 85, 'patterns': ['alexhost']},
            'porkbun.com': {'name': 'Porkbun', 'risk': 70, 'patterns': ['porkbun']},
            'namecheap.com': {'name': 'Namecheap', 'risk': 40, 'patterns': ['namecheap']},
        }
        
        # High-risk ASNs (known for hosting scams)
        self.high_risk_asns = {
            20473: 'Choopa/Vultr - Known for bulletproof hosting',
            13335: 'Cloudflare - Often abused for proxy',
            16509: 'AWS - Legit but abused',
            15169: 'Google Cloud',
            8075: 'Microsoft Azure',
            16276: 'OVH - Used by many scammers',
            14061: 'DigitalOcean - Common for phishing',
            63473: 'Hostinger - Frequent abuse',
            47583: 'Hostinger International',
        }
        
        # Common subdomains to check
        self.common_subdomains = [
            'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'ns2',
            'admin', 'blog', 'shop', 'forum', 'support', 'dev', 'test', 'staging',
            'api', 'app', 'secure', 'login', 'account', 'portal', 'dashboard',
            'hr', 'careers', 'jobs', 'recruiting', 'apply', 'career',
            'vpn', 'remote', 'exchange', 'owa', 'autodiscover'
        ]
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] INFRA ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] INFRA WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] INFRA SUCCESS: {message}")
        else:
            print(f"[{timestamp}] INFRA: {message}")
    
    # =========================================================
    # 1. HOSTING PROVIDER DETECTION
    # =========================================================
    
    def detect_hosting_provider(self, domain: str, ip: str = None) -> Dict:
        """Detect hosting provider from IP address and DNS records"""
        
        self._print(f"Detecting hosting provider for {domain}")
        
        cache_key = f"hosting_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'ip_address': ip,
            'hosting_provider': None,
            'provider_risk': 0,
            'confidence': 0,
            'is_bulletproof': False,
            'details': {}
        }
        
        # Get IP if not provided
        if not ip:
            try:
                ip = socket.gethostbyname(domain)
                result['ip_address'] = ip
                self._print(f"Resolved {domain} -> {ip}")
            except socket.gaierror:
                self._print(f"Cannot resolve {domain}", "ERROR")
                result['error'] = 'Cannot resolve domain'
                return result
        
        # Check IP against hosting provider databases via DNS PTR record
        try:
            rev_name = dns.reversename.from_address(ip)
            ptr_records = dns.resolver.resolve(rev_name, 'PTR')
            for ptr in ptr_records:
                ptr_value = str(ptr).lower()
                result['details']['ptr_record'] = ptr_value
                
                # Match against known hosting patterns
                for provider_key, provider_info in self.hosting_providers.items():
                    for pattern in provider_info['patterns']:
                        if pattern in ptr_value:
                            result['hosting_provider'] = provider_info['name']
                            result['provider_risk'] = provider_info['risk']
                            result['confidence'] = 80
                            result['is_bulletproof'] = provider_info['risk'] >= 70
                            self._print(f"Detected hosting: {provider_info['name']} (risk: {provider_info['risk']})")
                            break
                    if result['hosting_provider']:
                        break
        except:
            pass
        
        # If not found via PTR, try RDAP/WHOIS lookup
        if not result['hosting_provider']:
            try:
                # Query whois for IP (passive)
                import whois
                ip_whois = whois.whois(ip)
                if ip_whois and ip_whois.org:
                    org = str(ip_whois.org).lower()
                    for provider_key, provider_info in self.hosting_providers.items():
                        for pattern in provider_info['patterns']:
                            if pattern in org:
                                result['hosting_provider'] = provider_info['name']
                                result['provider_risk'] = provider_info['risk']
                                result['confidence'] = 70
                                self._print(f"Detected hosting via WHOIS: {provider_info['name']}")
                                break
                        if result['hosting_provider']:
                            break
            except:
                pass
        
        if not result['hosting_provider']:
            result['hosting_provider'] = 'Unknown/Independent'
            result['provider_risk'] = 30
            self._print(f"Could not identify hosting provider", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 2. NAME SERVER ANALYSIS
    # =========================================================
    
    def analyze_nameservers(self, domain: str) -> Dict:
        """Analyze name servers for patterns and risks"""
        
        self._print(f"Analyzing name servers for {domain}")
        
        cache_key = f"nameservers_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'nameservers': [],
            'ns_count': 0,
            'providers': [],
            'is_cloudflare': False,
            'is_route53': False,
            'risk_score': 0,
            'anomalies': []
        }
        
        try:
            ns_records = dns.resolver.resolve(domain, 'NS')
            for ns in ns_records:
                ns_name = str(ns).rstrip('.')
                result['nameservers'].append(ns_name)
                
                # Detect provider
                if 'cloudflare' in ns_name.lower():
                    result['is_cloudflare'] = True
                    result['providers'].append('Cloudflare')
                elif 'awsdns' in ns_name.lower() or 'amazon' in ns_name.lower():
                    result['is_route53'] = True
                    result['providers'].append('AWS Route53')
                elif 'google' in ns_name.lower():
                    result['providers'].append('Google Cloud DNS')
                elif 'microsoft' in ns_name.lower():
                    result['providers'].append('Microsoft DNS')
            
            result['ns_count'] = len(result['nameservers'])
            
            # Risk assessment
            if result['ns_count'] < 2:
                result['anomalies'].append('Less than 2 name servers - single point of failure')
                result['risk_score'] += 20
                self._print(f"Only {result['ns_count']} name server(s) - unusual", "WARNING")
            
            if result['is_cloudflare']:
                self._print(f"Using Cloudflare DNS - common but can hide origin", "WARNING")
                result['risk_score'] += 10
            
            # Check for suspicious TTL patterns (would need additional queries)
            
        except dns.resolver.NXDOMAIN:
            self._print(f"No NS records found for {domain}", "ERROR")
            result['risk_score'] = 50
        except Exception as e:
            self._print(f"NS check failed: {str(e)}", "ERROR")
        
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 3. ASN & BGP INFORMATION
    # =========================================================
    
    def get_asn_info(self, ip: str) -> Dict:
        """Get ASN (Autonomous System Number) and BGP information"""
        
        self._print(f"Getting ASN info for {ip}")
        
        cache_key = f"asn_{ip}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'ip': ip,
            'asn': None,
            'asn_name': None,
            'asn_org': None,
            'country': None,
            'prefix': None,
            'risk_score': 0,
            'is_high_risk': False
        }
        
        # Use free ASN lookup API (passive, no auth)
        try:
            # Multiple free APIs
            apis = [
                f"https://ipinfo.io/{ip}/json",
                f"https://api.iptoasn.com/v1/asn/{ip}",
                f"http://ip-api.com/json/{ip}"
            ]
            
            for api_url in apis:
                try:
                    response = requests.get(api_url, timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        
                        if 'asn' in data:
                            result['asn'] = data.get('asn')
                        if 'asn_name' in data:
                            result['asn_name'] = data.get('asn_name')
                        if 'org' in data:
                            result['asn_org'] = data.get('org')
                        if 'country' in data:
                            result['country'] = data.get('country')
                        if 'prefix' in data:
                            result['prefix'] = data.get('prefix')
                        
                        # Check if ASN is known high-risk
                        if result['asn'] and isinstance(result['asn'], int):
                            if result['asn'] in self.high_risk_asns:
                                result['is_high_risk'] = True
                                result['risk_score'] = 70
                                self._print(f"High-risk ASN detected: {result['asn']} - {self.high_risk_asns[result['asn']]}", "ERROR")
                            else:
                                result['risk_score'] = 10
                        
                        break  # Success, stop trying APIs
                except:
                    continue
                    
        except Exception as e:
            self._print(f"ASN lookup failed: {str(e)}", "WARNING")
        
        if not result['asn']:
            result['risk_score'] = 30
            self._print(f"Could not determine ASN for {ip}", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 4. HISTORICAL DNS RECORDS
    # =========================================================
    
    def get_historical_dns(self, domain: str) -> Dict:
        """Get historical DNS records from SecurityTrails (passive)"""
        
        self._print(f"Checking historical DNS for {domain}")
        
        cache_key = f"historical_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'has_history': False,
            'historical_a_records': [],
            'historical_ns_records': [],
            'historical_mx_records': [],
            'first_seen': None,
            'last_seen': None,
            'change_count': 0,
            'risk_score': 0,
            'anomalies': []
        }
        
        # Method 1: Use SecurityTrails API (if key provided)
        if self.securitytrails_api_key:
            try:
                url = f"https://api.securitytrails.com/v1/domain/{domain}/history/a"
                headers = {'APIKEY': self.securitytrails_api_key}
                response = requests.get(url, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('records'):
                        result['has_history'] = True
                        for record in data.get('records', [])[:10]:
                            result['historical_a_records'].append({
                                'ip': record.get('ip'),
                                'first_seen': record.get('first_seen'),
                                'last_seen': record.get('last_seen')
                            })
                        result['change_count'] = len(result['historical_a_records'])
                        self._print(f"Found {result['change_count']} historical DNS records")
                        
                        # Check for suspicious changes
                        if result['change_count'] > 5:
                            result['anomalies'].append('Frequent IP changes - potential fast-flux')
                            result['risk_score'] += 30
                            self._print("Frequent DNS changes detected - suspicious", "WARNING")
            except:
                pass
        
        # Method 2: Use Censys or other free sources (simplified)
        # In production, you'd use more sources like: DNSDB, ViewDNS.info, etc.
        
        if not result['has_history']:
            self._print("No historical DNS data available (API key may be required)", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 5. SUBDOMAIN ENUMERATION
    # =========================================================
    
    def enumerate_subdomains(self, domain: str) -> Dict:
        """Enumerate subdomains using passive techniques"""
        
        self._print(f"Enumerating subdomains for {domain}")
        
        cache_key = f"subdomains_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'subdomains_found': [],
            'total_found': 0,
            'live_subdomains': [],
            'suspicious_subdomains': [],
            'risk_score': 0
        }
        
        found_subdomains = set()
        
        # Method 1: DNS brute force with common subdomains
        self._print(f"Checking {len(self.common_subdomains)} common subdomains")
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            def check_subdomain(sub):
                full_domain = f"{sub}.{domain}"
                try:
                    dns.resolver.resolve(full_domain, 'A')
                    return full_domain
                except:
                    return None
            
            futures = [executor.submit(check_subdomain, sub) for sub in self.common_subdomains]
            
            for future in as_completed(futures):
                result_future = future.result()
                if result_future:
                    found_subdomains.add(result_future)
                    self._print(f"Found subdomain: {result_future}", "SUCCESS")
        
        # Method 2: Certificate Transparency logs (via crt.sh)
        try:
            url = f"https://crt.sh/?q=%.{domain}&output=json"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                try:
                    certs = response.json()
                    for cert in certs[:50]:  # Limit to 50 results
                        name = cert.get('name_value', '').lower()
                        if domain in name:
                            # Extract subdomains from certificate names
                            for sub in name.split('\n'):
                                sub = sub.strip()
                                if sub.endswith(f".{domain}") and sub not in found_subdomains:
                                    found_subdomains.add(sub)
                                    self._print(f"Found subdomain from certificate: {sub}", "SUCCESS")
                except:
                    pass
        except:
            pass
        
        # Method 3: SecurityTrails API (if available)
        if self.securitytrails_api_key:
            try:
                url = f"https://api.securitytrails.com/v1/domain/{domain}/subdomains"
                headers = {'APIKEY': self.securitytrails_api_key}
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    for sub in data.get('subdomains', [])[:50]:
                        full_domain = f"{sub}.{domain}"
                        if full_domain not in found_subdomains:
                            found_subdomains.add(full_domain)
            except:
                pass
        
        # Check which subdomains are live
        result['subdomains_found'] = list(found_subdomains)
        result['total_found'] = len(found_subdomains)
        
        # Check live status for found subdomains
        with ThreadPoolExecutor(max_workers=10) as executor:
            def check_live(subdomain):
                try:
                    socket.gethostbyname(subdomain)
                    return subdomain
                except:
                    return None
            
            futures = [executor.submit(check_live, sub) for sub in found_subdomains]
            for future in as_completed(futures):
                live = future.result()
                if live:
                    result['live_subdomains'].append(live)
        
        # Detect suspicious subdomains
        suspicious_keywords = ['admin', 'dev', 'test', 'staging', 'backup', 'old', 'temp', 'secure', 'login']
        for sub in result['subdomains_found']:
            for keyword in suspicious_keywords:
                if keyword in sub.lower():
                    result['suspicious_subdomains'].append(sub)
                    break
        
        # Risk assessment
        if result['suspicious_subdomains']:
            result['risk_score'] += 20
            self._print(f"Found {len(result['suspicious_subdomains'])} suspicious subdomains", "WARNING")
        
        if result['total_found'] > 20:
            self._print(f"Large attack surface: {result['total_found']} subdomains", "WARNING")
        
        self._print(f"Total subdomains found: {result['total_found']}")
        self._print(f"Live subdomains: {len(result['live_subdomains'])}")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 6. DNS RECONNAISSANCE (Complete DNS records)
    # =========================================================
    
    def dns_reconnaissance(self, domain: str) -> Dict:
        """Complete DNS reconnaissance - fetch all record types"""
        
        self._print(f"Running DNS reconnaissance for {domain}")
        
        cache_key = f"dns_recon_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'a_records': [],
            'aaaa_records': [],
            'cname_records': [],
            'mx_records': [],
            'txt_records': [],
            'ns_records': [],
            'soa_record': None,
            'ptr_records': [],
            'has_security_records': False
        }
        
        record_types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA']
        
        for record_type in record_types:
            try:
                records = dns.resolver.resolve(domain, record_type)
                for record in records:
                    record_str = str(record)
                    if record_type == 'A':
                        result['a_records'].append(record_str)
                    elif record_type == 'AAAA':
                        result['aaaa_records'].append(record_str)
                    elif record_type == 'CNAME':
                        result['cname_records'].append(record_str)
                    elif record_type == 'MX':
                        result['mx_records'].append(record_str)
                    elif record_type == 'TXT':
                        result['txt_records'].append(record_str[:200])  # Truncate long TXT
                        # Check for security records
                        if 'v=spf1' in record_str.lower():
                            result['has_security_records'] = True
                        if 'v=dmarc1' in record_str.lower():
                            result['has_security_records'] = True
                    elif record_type == 'NS':
                        result['ns_records'].append(record_str.rstrip('.'))
                    elif record_type == 'SOA':
                        result['soa_record'] = record_str
            except:
                pass
        
        self._print(f"DNS records collected: A:{len(result['a_records'])} MX:{len(result['mx_records'])} NS:{len(result['ns_records'])}")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 7. COMPLETE INFRASTRUCTURE INVESTIGATION
    # =========================================================
    
    def investigate_domain(self, domain: str) -> Dict:
        """Complete infrastructure investigation for a domain"""
        
        self._print(f"Starting infrastructure investigation for {domain}")
        
        # Get IP address first
        ip_address = None
        try:
            ip_address = socket.gethostbyname(domain)
            self._print(f"Resolved IP: {ip_address}")
        except:
            self._print(f"Cannot resolve domain", "ERROR")
        
        # Run all checks in parallel where possible
        self._print("Launching infrastructure analysis checks...")
        with ThreadPoolExecutor(max_workers=5) as executor:
            self._print("Detecting hosting provider...")
            future_hosting = executor.submit(self.detect_hosting_provider, domain, ip_address)
            
            self._print("Analyzing nameservers...")
            future_nameservers = executor.submit(self.analyze_nameservers, domain)
            
            self._print("Fetching ASN information...")
            future_asn = executor.submit(self.get_asn_info, ip_address) if ip_address else None
            
            self._print("Getting historical DNS records...")
            future_historical = executor.submit(self.get_historical_dns, domain)
            
            self._print("Enumerating subdomains...")
            future_subdomains = executor.submit(self.enumerate_subdomains, domain)
            
            self._print("Running DNS reconnaissance...")
            future_dns_recon = executor.submit(self.dns_reconnaissance, domain)
            
            hosting_result = future_hosting.result()
            nameserver_result = future_nameservers.result()
            asn_result = future_asn.result() if future_asn else {}
            historical_result = future_historical.result()
            subdomain_result = future_subdomains.result()
            dns_recon_result = future_dns_recon.result()
        
        # Calculate overall risk
        risk_score = 0
        red_flags = []
        
        # Hosting provider risk
        provider_risk = hosting_result.get('provider_risk', 0)
        if provider_risk >= 70:
            risk_score += provider_risk * 0.4
            red_flags.append(f"Hosting on {hosting_result.get('hosting_provider')} - known for scam hosting")
            self._print(f"High-risk hosting provider detected", "ERROR")
        elif provider_risk >= 40:
            risk_score += provider_risk * 0.3
            red_flags.append(f"Hosting on {hosting_result.get('hosting_provider')} - moderate risk")
        
        # Name server issues
        if nameserver_result.get('risk_score', 0) > 20:
            risk_score += nameserver_result['risk_score'] * 0.2
            for anomaly in nameserver_result.get('anomalies', []):
                red_flags.append(anomaly)
        
        # ASN risk
        if asn_result.get('is_high_risk'):
            risk_score += 30
            red_flags.append(f"High-risk ASN: {asn_result.get('asn_name', 'Unknown')}")
        
        # Historical anomalies
        if historical_result.get('change_count', 0) > 5:
            risk_score += 20
            red_flags.append(f"Frequent DNS changes - possible fast-flux network")
        
        # Suspicious subdomains
        if subdomain_result.get('suspicious_subdomains'):
            risk_score += 15
            red_flags.append(f"Suspicious subdomains found: {', '.join(subdomain_result['suspicious_subdomains'][:3])}")
        
        # Single IP address (shared hosting risk)
        if len(dns_recon_result.get('a_records', [])) == 1:
            risk_score += 5
        
        risk_score = min(100, int(risk_score))
        
        result = {
            'domain': domain,
            'ip_address': ip_address,
            'hosting': hosting_result,
            'nameservers': nameserver_result,
            'asn_info': asn_result,
            'historical_dns': historical_result,
            'subdomains': subdomain_result,
            'dns_records': dns_recon_result,
            'risk_score': risk_score,
            'risk_level': self._get_risk_level(risk_score),
            'red_flags': red_flags,
            'recommendations': self._get_recommendations(risk_score, red_flags)
        }
        
        self._print(f"Infrastructure investigation complete: Risk {result['risk_level']} ({risk_score}/100)")
        
        return result
    
    def investigate_multiple(self, domains: List[str]) -> Dict:
        """Investigate multiple domains in parallel"""
        
        self._print(f"Starting batch infrastructure investigation for {len(domains)} domains")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_domain = {
                executor.submit(self.investigate_domain, domain): domain
                for domain in domains if domain
            }
            
            for future in as_completed(future_to_domain):
                domain = future_to_domain[future]
                try:
                    result = future.result()
                    results[domain] = result
                    risks.append(result['risk_score'])
                    self._print(f"Completed {domain}: Risk {result['risk_level']}")
                except Exception as e:
                    self._print(f"Error investigating {domain}: {str(e)}", "ERROR")
                    results[domain] = {'domain': domain, 'error': str(e)}
        
        # Summary
        self._print("")
        self._print("INFRASTRUCTURE BATCH SUMMARY")
        self._print(f"Total domains: {len(domains)}")
        self._print(f"Successfully investigated: {len(risks)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest infrastructure risk: {max_risk}/100")
            self._print(f"Average infrastructure risk: {int(avg_risk)}/100")
            
            if max_risk >= 70:
                self._print("CRITICAL: Infrastructure indicates scam hosting", "WARNING")
        
        return {
            'summary': {
                'total': len(domains),
                'investigated': len(risks),
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
            recommendations.append("CRITICAL: Infrastructure strongly indicates scam/hostile hosting")
            recommendations.append("Do NOT interact with this domain")
            recommendations.append("Report the IP and ASN to abuse databases")
        elif risk_score >= 60:
            recommendations.append("Infrastructure shows high-risk patterns")
            recommendations.append("Verify company independently through official channels")
            recommendations.append("Check if IP is associated with other scams")
        elif risk_score >= 40:
            recommendations.append("Infrastructure has suspicious elements")
            recommendations.append("Proceed with caution and verify thoroughly")
        else:
            recommendations.append("Infrastructure appears legitimate")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    im = InfrastructureMapping(verbose=True)
    
    test_domains = [
        "google.com",
        "suspicious-job-site.top"
    ]
    
    results = im.investigate_multiple(test_domains)
    
    print("\n" + json.dumps(results, indent=2, default=str))