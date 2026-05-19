"""
Module 1: Domain Intelligence
Clean console output - no logos, no lines, just text
"""

import whois
import dns.resolver
import json
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

class DomainIntelligence:
    """Domain intelligence with clean console output"""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.cache_dir = Path("data/cache/module1")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Risk thresholds
        self.age_thresholds = {
            'critical': 7,
            'high': 30,
            'medium': 90,
            'low': 365
        }
        
        # Registrar reputation database
        self.registrar_reputation = {
            'trusted': ['namecheap', 'godaddy', 'cloudflare', 'google', 'aws', 'name.com', 'hover', 'gandi'],
            'neutral': ['porkbun', 'namesilo', 'internet.bs', 'dynadot', 'networksolutions'],
            'suspicious': ['nic.ru', 'alibaba', 'webnic', 'xinnet', '22.cn', 'west263']
        }
        
        # Privacy indicators
        self.privacy_indicators = [
            'privacy protect', 'whoisguard', 'protected', 'redacted',
            'private', 'proxy', 'anonymize', 'domains by proxy'
        ]
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console print without decorations"""
        if not self.verbose:
            return
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        if level == "ERROR":
            print(f"[{timestamp}] ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] SUCCESS: {message}")
        else:
            print(f"[{timestamp}] {message}")
    
    def _get_cache(self, key: str) -> Optional[Dict]:
        """Get from cache"""
        cache_file = self.cache_dir / f"{hashlib.md5(key.encode()).hexdigest()}.json"
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    data = json.load(f)
                    # Check if cache is less than 24 hours old
                    cache_time = datetime.fromisoformat(data['timestamp'])
                    if (datetime.now() - cache_time).seconds < 86400:
                        return data['value']
            except:
                pass
        return None
    
    def _set_cache(self, key: str, value: Dict):
        """Save to cache"""
        cache_file = self.cache_dir / f"{hashlib.md5(key.encode()).hexdigest()}.json"
        try:
            with open(cache_file, 'w') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'value': value
                }, f)
        except:
            pass
    
    def get_whois_info(self, domain: str) -> Dict:
        """Get WHOIS information"""
        
        self._print(f"Checking WHOIS for {domain}")
        
        cache_key = f"whois_{domain}"
        cached = self._get_cache(cache_key)
        if cached:
            self._print(f"Using cached WHOIS data for {domain}")
            return cached
        
        try:
            w = whois.whois(domain)
            
            # Parse dates
            creation_date = w.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            
            expiration_date = w.expiration_date
            if isinstance(expiration_date, list):
                expiration_date = expiration_date[0]
            
            # Calculate age
            age_days = None
            if creation_date:
                age_days = (datetime.now() - creation_date).days
            
            result = {
                'domain': domain,
                'registrar': str(w.registrar) if w.registrar else None,
                'creation_date': creation_date.isoformat() if creation_date else None,
                'expiration_date': expiration_date.isoformat() if expiration_date else None,
                'age_days': age_days,
                'name_servers': w.name_servers if w.name_servers else [],
                'org': str(w.org) if w.org else None,
                'emails': w.emails if w.emails else []
            }
            
            self._set_cache(cache_key, result)
            self._print(f"Successfully retrieved WHOIS for {domain}", "SUCCESS")
            
            return result
            
        except Exception as e:
            self._print(f"Failed to get WHOIS for {domain}: {str(e)}", "ERROR")
            return {'domain': domain, 'error': str(e)}
    
    def check_domain_age(self, domain: str, whois_info: Dict) -> Dict:
        """Check domain age and return risk"""
        
        age_days = whois_info.get('age_days')
        
        if not age_days:
            self._print(f"Could not determine age for {domain}", "WARNING")
            return {
                'risk_score': 50,
                'risk_level': 'UNKNOWN',
                'message': 'Could not determine domain age'
            }
        
        self._print(f"Domain {domain} is {age_days} days old")
        
        if age_days < self.age_thresholds['critical']:
            risk_score = 100
            risk_level = 'CRITICAL'
            message = f'Domain is only {age_days} days old - EXTREMELY RECENT (major red flag)'
            self._print(message, "WARNING")
            
        elif age_days < self.age_thresholds['high']:
            risk_score = 80
            risk_level = 'HIGH'
            message = f'Domain is {age_days} days old - Very recent (suspicious)'
            self._print(message, "WARNING")
            
        elif age_days < self.age_thresholds['medium']:
            risk_score = 50
            risk_level = 'MEDIUM'
            message = f'Domain is {age_days} days old - Relatively new'
            self._print(message)
            
        elif age_days < self.age_thresholds['low']:
            risk_score = 20
            risk_level = 'LOW'
            message = f'Domain is {age_days} days old - Established'
            self._print(message)
            
        else:
            risk_score = 0
            risk_level = 'SAFE'
            message = f'Domain is {age_days} days old - Well established'
            self._print(message, "SUCCESS")
        
        return {
            'age_days': age_days,
            'creation_date': whois_info.get('creation_date'),
            'risk_score': risk_score,
            'risk_level': risk_level,
            'message': message
        }
    
    def check_whois_privacy(self, domain: str, whois_info: Dict) -> Dict:
        """Check WHOIS privacy status"""
        
        self._print(f"Checking WHOIS privacy for {domain}")
        
        # Check fields for privacy indicators
        fields_to_check = [
            whois_info.get('org', ''),
            whois_info.get('registrar', ''),
            str(whois_info.get('emails', []))
        ]
        
        indicators_found = []
        for field in fields_to_check:
            field_lower = str(field).lower()
            for indicator in self.privacy_indicators:
                if indicator in field_lower:
                    indicators_found.append(indicator)
        
        privacy_enabled = len(indicators_found) > 0
        
        if privacy_enabled:
            self._print(f"WHOIS privacy is ENABLED for {domain} - hides owner identity", "WARNING")
            risk_score = 40
            risk_level = 'MEDIUM'
            message = 'WHOIS privacy enabled - hides domain owner information'
        else:
            self._print(f"WHOIS privacy is DISABLED for {domain} - owner information visible", "SUCCESS")
            risk_score = 0
            risk_level = 'SAFE'
            message = 'WHOIS privacy disabled - owner information is public'
        
        return {
            'privacy_enabled': privacy_enabled,
            'indicators_found': indicators_found,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'message': message
        }
    
    def check_registrar_reputation(self, domain: str, whois_info: Dict) -> Dict:
        """Check registrar reputation"""
        
        registrar = whois_info.get('registrar', '')
        
        if not registrar:
            self._print(f"Could not identify registrar for {domain}", "WARNING")
            return {
                'registrar': 'unknown',
                'risk_score': 50,
                'risk_level': 'MEDIUM',
                'message': 'Could not identify registrar'
            }
        
        self._print(f"Registrar for {domain}: {registrar}")
        
        registrar_lower = registrar.lower()
        risk_score = 30
        reputation = 'unknown'
        
        # Check reputation
        for trusted in self.registrar_reputation['trusted']:
            if trusted in registrar_lower:
                risk_score = 10
                reputation = 'trusted'
                self._print(f"Registrar {registrar} is trusted", "SUCCESS")
                break
        else:
            for neutral in self.registrar_reputation['neutral']:
                if neutral in registrar_lower:
                    risk_score = 35
                    reputation = 'neutral'
                    self._print(f"Registrar {registrar} is neutral")
                    break
            else:
                for suspicious in self.registrar_reputation['suspicious']:
                    if suspicious in registrar_lower:
                        risk_score = 75
                        reputation = 'suspicious'
                        self._print(f"Registrar {registrar} is suspicious - associated with scams", "WARNING")
                        break
        
        if risk_score >= 70:
            risk_level = 'HIGH'
            message = f'High-risk registrar: {registrar}'
        elif risk_score >= 50:
            risk_level = 'MEDIUM'
            message = f'Suspicious registrar: {registrar}'
        elif risk_score >= 30:
            risk_level = 'LOW'
            message = f'Neutral registrar: {registrar}'
        else:
            risk_level = 'SAFE'
            message = f'Trusted registrar: {registrar}'
        
        return {
            'registrar': registrar,
            'reputation': reputation,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'message': message
        }
    
    def get_domain_history(self, domain: str, whois_info: Dict) -> Dict:
        """Get domain history indicators"""
        
        self._print(f"Checking domain history for {domain}")
        
        history = {
            'changes_detected': [],
            'suspicious_changes': [],
            'risk_score': 0
        }
        
        # Check for recent updates
        if whois_info.get('creation_date') and whois_info.get('expiration_date'):
            try:
                created = datetime.fromisoformat(whois_info['creation_date'])
                expires = datetime.fromisoformat(whois_info['expiration_date'])
                
                days_until_expiry = (expires - datetime.now()).days
                
                if days_until_expiry < 30:
                    history['suspicious_changes'].append({
                        'type': 'soon_to_expire',
                        'details': f'Domain expires in {days_until_expiry} days',
                        'risk': 30
                    })
                    self._print(f"Domain expires in {days_until_expiry} days - scammers often let domains expire", "WARNING")
                
                # Check if domain is very old but recently updated
                domain_age = (datetime.now() - created).days
                if domain_age > 365 and days_until_expiry < 90:
                    history['suspicious_changes'].append({
                        'type': 'possible_abandoned',
                        'details': f'Old domain ({domain_age} days) with short expiry',
                        'risk': 40
                    })
                    
            except Exception as e:
                self._print(f"Could not analyze domain history: {e}", "WARNING")
        
        history['risk_score'] = sum(change.get('risk', 0) for change in history['suspicious_changes'])
        history['risk_level'] = 'HIGH' if history['risk_score'] > 50 else 'MEDIUM' if history['risk_score'] > 20 else 'LOW'
        
        if history['suspicious_changes']:
            self._print(f"Found {len(history['suspicious_changes'])} suspicious history indicators", "WARNING")
        else:
            self._print(f"No suspicious history detected for {domain}", "SUCCESS")
        
        return history
    
    def check_mx_records(self, domain: str) -> Dict:
        """Check MX records"""
        
        self._print(f"Checking MX records for {domain}")
        
        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            mx_list = [str(mx.exchange).rstrip('.') for mx in mx_records]
            
            # Identify provider
            providers = []
            for mx in mx_list:
                if 'google' in mx or 'gmail' in mx:
                    providers.append('Google Workspace')
                elif 'outlook' in mx or 'microsoft' in mx:
                    providers.append('Microsoft 365')
                elif 'amazon' in mx or 'aws' in mx:
                    providers.append('AWS')
                else:
                    providers.append('Custom')
            
            unique_providers = list(set(providers))
            
            self._print(f"Found MX records for {domain}: {', '.join(unique_providers)}", "SUCCESS")
            
            return {
                'has_mx': True,
                'mx_records': mx_list[:5],
                'providers': unique_providers,
                'risk_score': 0,
                'message': f'Email service: {", ".join(unique_providers)}'
            }
            
        except dns.resolver.NXDOMAIN:
            self._print(f"No MX records found for {domain} - domain may not receive email", "WARNING")
            return {
                'has_mx': False,
                'mx_records': [],
                'providers': [],
                'risk_score': 20,
                'message': 'No MX records - domain cannot receive email'
            }
        except Exception as e:
            self._print(f"Could not check MX records for {domain}: {str(e)}", "ERROR")
            return {
                'has_mx': False,
                'mx_records': [],
                'providers': [],
                'risk_score': 10,
                'message': f'MX check failed: {str(e)[:50]}'
            }
    
    def investigate_domain(self, domain: str) -> Dict:
        """Complete investigation for one domain"""
        
        self._print(f"Starting investigation for domain: {domain}")
        self._print("-" * 40)
        
        # Get WHOIS info
        whois_info = self.get_whois_info(domain)
        
        if whois_info.get('error'):
            self._print(f"Investigation failed for {domain}: {whois_info['error']}", "ERROR")
            return {
                'domain': domain,
                'error': whois_info['error'],
                'overall_risk_score': 50,
                'overall_risk_level': 'UNKNOWN'
            }
        
        # Run all checks
        age_result = self.check_domain_age(domain, whois_info)
        privacy_result = self.check_whois_privacy(domain, whois_info)
        registrar_result = self.check_registrar_reputation(domain, whois_info)
        history_result = self.get_domain_history(domain, whois_info)
        mx_result = self.check_mx_records(domain)
        
        # Calculate overall risk (weighted)
        weights = {
            'age': 0.35,
            'privacy': 0.20,
            'registrar': 0.25,
            'history': 0.10,
            'mx': 0.10
        }
        
        total_risk = (
            age_result.get('risk_score', 0) * weights['age'] +
            privacy_result.get('risk_score', 0) * weights['privacy'] +
            registrar_result.get('risk_score', 0) * weights['registrar'] +
            history_result.get('risk_score', 0) * weights['history'] +
            mx_result.get('risk_score', 0) * weights['mx']
        )
        
        overall_risk = int(total_risk)
        
        if overall_risk >= 80:
            overall_level = 'CRITICAL'
        elif overall_risk >= 60:
            overall_level = 'HIGH'
        elif overall_risk >= 40:
            overall_level = 'MEDIUM'
        elif overall_risk >= 20:
            overall_level = 'LOW'
        else:
            overall_level = 'SAFE'
        
        # Collect red flags
        red_flags = []
        if age_result.get('risk_score', 0) >= 80:
            red_flags.append(age_result['message'])
        if privacy_result.get('privacy_enabled'):
            red_flags.append(privacy_result['message'])
        if registrar_result.get('risk_score', 0) >= 60:
            red_flags.append(registrar_result['message'])
        if history_result.get('suspicious_changes'):
            for change in history_result['suspicious_changes']:
                red_flags.append(change['details'])
        
        # Final summary
        self._print("-" * 40)
        self._print(f"Investigation complete for {domain}")
        self._print(f"Overall Risk: {overall_level} ({overall_risk}/100)")
        
        if red_flags:
            self._print(f"Red flags found: {len(red_flags)}", "WARNING")
            for flag in red_flags[:3]:
                self._print(f"  - {flag[:80]}", "WARNING")
        
        self._print("-" * 40)
        
        return {
            'domain': domain,
            'overall_risk_score': overall_risk,
            'overall_risk_level': overall_level,
            'red_flags': red_flags,
            'details': {
                'age': {
                    'days': age_result.get('age_days'),
                    'creation_date': age_result.get('creation_date'),
                    'risk': age_result.get('risk_score')
                },
                'privacy': {
                    'enabled': privacy_result.get('privacy_enabled'),
                    'risk': privacy_result.get('risk_score')
                },
                'registrar': {
                    'name': registrar_result.get('registrar'),
                    'reputation': registrar_result.get('reputation'),
                    'risk': registrar_result.get('risk_score')
                },
                'history': {
                    'suspicious_count': len(history_result.get('suspicious_changes', [])),
                    'risk': history_result.get('risk_score')
                },
                'mx': {
                    'has_records': mx_result.get('has_mx'),
                    'provider': mx_result.get('providers', ['Unknown'])[0],
                    'risk': mx_result.get('risk_score')
                }
            }
        }
    
    def investigate_multiple(self, domains: List[str]) -> Dict:
        """Investigate multiple domains"""
        
        if not domains:
            return {'error': 'No domains provided'}
        
        self._print(f"Starting batch investigation for {len(domains)} domains")
        
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
                    if 'overall_risk_score' in result:
                        risks.append(result['overall_risk_score'])
                except Exception as e:
                    self._print(f"Error investigating {domain}: {str(e)}", "ERROR")
                    results[domain] = {'domain': domain, 'error': str(e)}
        
        # Summary
        self._print("=" * 50)
        self._print("BATCH INVESTIGATION SUMMARY")
        self._print(f"Total domains: {len(domains)}")
        self._print(f"Successfully investigated: {len(risks)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            
            self._print(f"Highest risk score: {max_risk}/100")
            self._print(f"Average risk score: {int(avg_risk)}/100")
            
            if max_risk >= 80:
                self._print("CRITICAL: One or more domains are high risk", "WARNING")
            elif max_risk >= 60:
                self._print("HIGH: Some domains show suspicious indicators", "WARNING")
            elif max_risk >= 40:
                self._print("MEDIUM: Domains have some risk factors")
            else:
                self._print("LOW: Domains appear generally safe", "SUCCESS")
        
        self._print("=" * 50)
        
        return {
            'summary': {
                'total': len(domains),
                'investigated': len(risks),
                'max_risk': max(risks) if risks else 0,
                'avg_risk': int(sum(risks) / len(risks)) if risks else 0
            },
            'results': results
        }


# Standalone execution
if __name__ == "__main__":
    import sys
    
    # Test with domains
    di = DomainIntelligence(verbose=True)
    
    if len(sys.argv) > 1:
        domains = sys.argv[1:]
    else:
        domains = ["google.com", "example.com"]
    
    results = di.investigate_multiple(domains)
    
    # Print JSON output for potential piping
    print("\nJSON OUTPUT:")
    print(json.dumps(results, indent=2, default=str))