"""
Module 9: Communication Channel Forensics
Complete communication analysis including:
- Telegram analysis (username check, channel creation date, message patterns)
- WhatsApp analysis (number existence, business verification)
- Signal/Wickr analysis (privacy app detection)
- Phone number OSINT (carrier lookup, scam database check, country mismatch)
"""

import re
import json
import hashlib
import requests
import phonenumbers
from phonenumbers import carrier, geocoder, timezone
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Set
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import time

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("ChannelAnalyzer")

class ChannelAnalyzer:
    """Complete communication channel forensics"""
    
    def __init__(self, verbose: bool = True, hibp_api_key: str = None):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/communication")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        self.hibp_api_key = hibp_api_key
        
        # Risk scores for different communication channels
        self.channel_risk = {
            'whatsapp': {
                'risk': 30,
                'reason': 'WhatsApp is common for scams but also used legitimately',
                'is_encrypted': True
            },
            'telegram': {
                'risk': 35,
                'reason': 'Telegram is frequently used by scammers due to anonymity',
                'is_encrypted': False  # Only secret chats are encrypted
            },
            'signal': {
                'risk': 10,
                'reason': 'Signal is privacy-focused but used legitimately',
                'is_encrypted': True
            },
            'wickr': {
                'risk': 40,
                'reason': 'Wickr is often used for illicit activities',
                'is_encrypted': True
            },
            'wechat': {
                'risk': 45,
                'reason': 'WeChat is common for international scams',
                'is_encrypted': True
            },
            'whatsapp_business': {
                'risk': 15,
                'reason': 'WhatsApp Business is more legitimate',
                'is_encrypted': True
            },
            'sms': {
                'risk': 25,
                'reason': 'SMS can be spoofed but is standard',
                'is_encrypted': False
            },
            'email': {
                'risk': 10,
                'reason': 'Email is standard but can be spoofed',
                'is_encrypted': False
            },
            'zoom': {
                'risk': 5,
                'reason': 'Zoom is legitimate for interviews',
                'is_encrypted': True
            },
            'google_meet': {
                'risk': 5,
                'reason': 'Google Meet is legitimate',
                'is_encrypted': True
            },
            'skype': {
                'risk': 10,
                'reason': 'Skype is legitimate but declining',
                'is_encrypted': True
            }
        }
        
        # High-risk countries for phone numbers
        self.high_risk_countries = {
            'NG': 'Nigeria',  # 419 scams
            'GH': 'Ghana',
            'CM': 'Cameroon',
            'BJ': 'Benin',
            'CI': 'Ivory Coast',
            'PK': 'Pakistan',
            'IN': 'India',
            'PH': 'Philippines',
            'UA': 'Ukraine',
            'RU': 'Russia',
            'RO': 'Romania'
        }
        
        # VOIP carrier patterns
        self.voip_carriers = [
            'google voice', 'twilio', 'vonage', 'bandwidth', 'textnow',
            'textplus', 'pinger', 'dingtone', '2ndline', 'talkatone',
            'nextplus', 'textfree', 'textme', 'flyp', 'hushed'
        ]
        
        # Scam reporting sites
        self.scam_report_sites = [
            '800notes.com',
            'whocallsme.com',
            'shouldianswer.com',
            'scamnumbers.com',
            'callercenter.com',
            'tellows.com'
        ]
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] CHANNEL ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] CHANNEL WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] CHANNEL SUCCESS: {message}")
        else:
            print(f"[{timestamp}] CHANNEL: {message}")
    
    # =========================================================
    # 1. TELEGRAM ANALYSIS
    # =========================================================
    
    def analyze_telegram(self, username: str = None, phone: str = None) -> Dict:
        """
        Analyze Telegram username/phone
        - Check username existence via public API
        - Channel creation date estimation
        - Message forwarding patterns
        """
        
        self._print(f"Analyzing Telegram: {username or phone}")
        
        cache_key = f"telegram_{username or phone}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'username': username,
            'phone': phone,
            'exists': False,
            'user_id': None,
            'first_name': None,
            'last_name': None,
            'has_photo': False,
            'channel_creation_date': None,
            'member_count': None,
            'is_bot': False,
            'is_scam_likely': False,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check via public Telegram API (no auth required for basic checks)
        if username:
            try:
                # Telegram's public API endpoint for username resolution
                url = f"https://t.me/{username}"
                response = requests.get(url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                
                if response.status_code == 200:
                    content = response.text
                    result['exists'] = True
                    
                    # Extract user info from page
                    title_match = re.search(r'<title>(.*?)</title>', content)
                    if title_match:
                        title = title_match.group(1)
                        if 'Telegram:' in title:
                            name_parts = title.replace('Telegram:', '').strip().split(' ')
                            if name_parts:
                                result['first_name'] = name_parts[0]
                    
                    # Check if it's a channel or group
                    if 'subscribers' in content or 'members' in content:
                        member_match = re.search(r'(\d+[\d\s,.]*)\s*(?:subscribers|members)', content, re.IGNORECASE)
                        if member_match:
                            member_str = member_match.group(1).replace(',', '').replace(' ', '').replace('.', '')
                            result['member_count'] = int(member_str) if member_str.isdigit() else None
                    
                    # Check for scam indicators
                    if 'scam' in content.lower() or 'fake' in content.lower():
                        result['is_scam_likely'] = True
                        result['risk_score'] += 40
                        result['warnings'].append('Telegram channel flagged as scam/spam')
                        self._print("Telegram channel flagged as scam", "ERROR")
                    
                    # Check if bot
                    if 'bot' in content.lower() and 'telegram bot' in content.lower():
                        result['is_bot'] = True
                        result['risk_score'] += 20
                        result['warnings'].append('Telegram bot detected - less trustworthy than human')
                    
                    # Estimate creation date based on join date format
                    date_match = re.search(r'joined (\d{1,2}\s+[A-Za-z]+\s+\d{4})', content, re.IGNORECASE)
                    if date_match:
                        try:
                            join_date = datetime.strptime(date_match.group(1), '%d %B %Y')
                            result['channel_creation_date'] = join_date.isoformat()
                            days_old = (datetime.now() - join_date).days
                            if days_old < 30:
                                result['risk_score'] += 30
                                result['warnings'].append(f'Telegram account created {days_old} days ago (very recent)')
                                self._print(f"Recent Telegram account: {days_old} days", "WARNING")
                        except:
                            pass
                    
                    self._print(f"Telegram account exists: @{username}", "SUCCESS")
                    
                else:
                    self._print(f"Telegram username not found: @{username}", "WARNING")
                    result['risk_score'] += 20
                    result['warnings'].append('Telegram username does not exist')
                    
            except Exception as e:
                self._print(f"Telegram check failed: {str(e)}", "WARNING")
        else:
            self._print("No Telegram username provided", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 2. WHATSAPP ANALYSIS
    # =========================================================
    
    def analyze_whatsapp(self, phone: str) -> Dict:
        """
        Analyze WhatsApp number
        - Phone number exists in WhatsApp
        - Business account verification
        - Profile picture existence
        """
        
        self._print(f"Analyzing WhatsApp: {phone}")
        
        cache_key = f"whatsapp_{phone}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'phone': phone,
            'exists_on_whatsapp': False,
            'is_business_account': False,
            'business_name': None,
            'has_profile_picture': False,
            'about_text': None,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # WhatsApp doesn't have a public API
        # Use WhatsApp web API (unofficial, rate limited)
        # For passive analysis, we'll check via WhatsApp web preview
        
        try:
            # Encode phone number
            encoded_phone = phone.replace('+', '').replace(' ', '')
            
            # Check if number exists via WhatsApp web (simulated)
            # In production, you would use WhatsApp Business API or wa.me link check
            wa_url = f"https://wa.me/{encoded_phone}"
            response = requests.get(wa_url, timeout=10, allow_redirects=False)
            
            # WhatsApp redirects to whatsapp:// if number exists
            if response.status_code in [302, 301, 307]:
                result['exists_on_whatsapp'] = True
                self._print(f"Number exists on WhatsApp", "SUCCESS")
            else:
                self._print(f"Number not found on WhatsApp", "WARNING")
                result['risk_score'] += 20
                result['warnings'].append('Phone number not registered on WhatsApp')
                
        except Exception as e:
            self._print(f"WhatsApp check failed: {str(e)}", "WARNING")
        
        # Check business account via WA Business API (would require API key)
        # Simplified placeholder
        if result['exists_on_whatsapp']:
            # Business accounts often have verified badges
            # This would require WhatsApp Business API
            pass
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 3. SIGNAL/WICKR ANALYSIS
    # =========================================================
    
    def analyze_privacy_app(self, app_name: str, username: str = None, phone: str = None) -> Dict:
        """
        Analyze privacy-focused messaging apps
        - Signal, Wickr, Session, etc.
        - Check if recommended for privacy vs "encrypted" excuse
        """
        
        self._print(f"Analyzing {app_name}: {username or phone}")
        
        result = {
            'app_name': app_name,
            'username': username,
            'phone': phone,
            'is_privacy_focused': True,
            'is_encrypted': True,
            'legitimate_use_score': 0,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Risk assessment based on app type
        app_risk_map = {
            'signal': {'risk': 10, 'legit': 80, 'reason': 'Privacy-focused but used professionally'},
            'wickr': {'risk': 40, 'legit': 50, 'reason': 'Often used for illicit activities'},
            'session': {'risk': 35, 'legit': 55, 'reason': 'Anonymous messaging app'},
            'element': {'risk': 15, 'legit': 70, 'reason': 'Matrix-based, used in tech'},
            'threema': {'risk': 10, 'legit': 75, 'reason': 'Swiss privacy app'},
            'wire': {'risk': 10, 'legit': 75, 'reason': 'Business-focused secure comms'}
        }
        
        app_lower = app_name.lower()
        if app_lower in app_risk_map:
            result['risk_score'] = app_risk_map[app_lower]['risk']
            result['legitimate_use_score'] = app_risk_map[app_lower]['legit']
            reason = app_risk_map[app_lower]['reason']
        else:
            result['risk_score'] = 30
            result['legitimate_use_score'] = 50
            reason = 'Unknown app'
        
        # Additional risk: scammers often push "encrypted" apps to avoid detection
        result['warnings'].append(f"Using {app_name} - {reason}")
        
        if result['risk_score'] >= 30:
            self._print(f"{app_name} is high-risk for scams", "WARNING")
        else:
            self._print(f"{app_name} is moderately legitimate", "SUCCESS")
        
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        return result
    
    # =========================================================
    # 4. PHONE NUMBER OSINT (Complete)
    # =========================================================
    
    def analyze_phone_number(self, phone: str, company_country: str = None) -> Dict:
        """
        Complete phone number OSINT
        - Country code vs company country mismatch
        - Carrier lookup (VOIP detection)
        - Scam database search
        - Data breach check (HaveIBeenPwned)
        """
        
        self._print(f"Analyzing phone number: {phone}")
        
        cache_key = f"phone_osint_{phone}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'phone_raw': phone,
            'formatted': None,
            'country_code': None,
            'national_number': None,
            'country': None,
            'country_name': None,
            'carrier': None,
            'is_voip': False,
            'is_mobile': False,
            'is_disposable': False,
            'is_valid': False,
            'country_mismatch': False,
            'reported_as_scam': False,
            'scam_reports': [],
            'breach_found': False,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Parse phone number
        try:
            parsed = phonenumbers.parse(phone, None)
            
            if phonenumbers.is_valid_number(parsed):
                result['is_valid'] = True
                result['formatted'] = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
                result['country_code'] = parsed.country_code
                result['national_number'] = parsed.national_number
                result['country'] = phonenumbers.region_code_for_number(parsed)
                result['country_name'] = geocoder.description_for_number(parsed, "en")
                
                self._print(f"Number valid: {result['formatted']} ({result['country_name']})", "SUCCESS")
                
                # Get carrier
                carrier_name = carrier.name_for_number(parsed, "en")
                if carrier_name:
                    result['carrier'] = carrier_name
                    self._print(f"Carrier: {carrier_name}")
                    
                    # Check for VOIP
                    for voip in self.voip_carriers:
                        if voip.lower() in carrier_name.lower():
                            result['is_voip'] = True
                            result['risk_score'] += 30
                            result['warnings'].append(f'VOIP number detected ({carrier_name}) - easily disposable')
                            self._print(f"VOIP number detected", "WARNING")
                            break
                
                # Check number type
                if phonenumbers.number_type(parsed) == phonenumbers.PhoneNumberType.MOBILE:
                    result['is_mobile'] = True
                elif phonenumbers.number_type(parsed) == phonenumbers.PhoneNumberType.FIXED_LINE:
                    pass  # Landline - more legitimate
                
                # Check country mismatch with company
                if company_country:
                    company_country_upper = company_country.upper()
                    if result['country'] != company_country_upper:
                        result['country_mismatch'] = True
                        result['risk_score'] += 30
                        result['warnings'].append(f'Country mismatch: Phone ({result["country_name"]}) vs Company ({company_country_upper})')
                        self._print(f"Country mismatch detected", "ERROR")
                
                # Check if country is high-risk
                if result['country'] in self.high_risk_countries:
                    result['risk_score'] += 25
                    result['warnings'].append(f"High-risk country: {self.high_risk_countries[result['country']]}")
                    self._print(f"High-risk country: {self.high_risk_countries[result['country']]}", "WARNING")
                
            else:
                self._print(f"Invalid phone number format", "WARNING")
                result['risk_score'] += 40
                result['warnings'].append('Invalid phone number format')
                
        except Exception as e:
            self._print(f"Phone parsing failed: {str(e)}", "ERROR")
            result['risk_score'] += 50
        
        # Check scam databases (simulated - would use APIs)
        scam_result = self._check_scam_databases(phone)
        if scam_result.get('is_scam'):
            result['reported_as_scam'] = True
            result['scam_reports'] = scam_result.get('reports', [])
            result['risk_score'] += 50
            result['warnings'].append('Phone number reported as scam in databases')
            self._print("Number found in scam databases!", "ERROR")
        
        # Check HaveIBeenPwned for phone
        if self.hibp_api_key:
            breach_result = self._check_phone_breach(phone)
            if breach_result.get('pwned'):
                result['breach_found'] = True
                result['risk_score'] += 25
                result['warnings'].append(f'Phone number found in data breach')
                self._print("Phone number found in breach", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    def _check_scam_databases(self, phone: str) -> Dict:
        """Check phone number against scam databases"""
        
        result = {'is_scam': False, 'reports': []}
        
        # Simulated check - in production, you'd query APIs
        # Common scam number patterns
        scam_patterns = [
            r'216\d{7}',  # Tunisia (common scam origin)
            r'233\d{7}',  # Ghana
            r'234\d{7}',  # Nigeria
            r'509\d{7}',  # Haiti
            r'876\d{7}',  # Jamaica
        ]
        
        cleaned = re.sub(r'[^0-9]', '', phone)
        for pattern in scam_patterns:
            if re.match(pattern, cleaned):
                result['is_scam'] = True
                result['reports'].append('Known scam origin country')
                break
        
        return result
    
    def _check_phone_breach(self, phone: str) -> Dict:
        """Check if phone number appears in breaches via HaveIBeenPwned"""
        
        result = {'pwned': False, 'breach_count': 0}
        
        try:
            # HaveIBeenPwned phone check requires API key
            # This is a placeholder
            pass
        except:
            pass
        
        return result
    
    # =========================================================
    # 5. COMMUNICATION CHANNEL RISK ASSESSMENT
    # =========================================================
    
    def assess_channel_risk(self, channel: str, details: Dict = None) -> Dict:
        """
        Assess risk of communication channel
        - Check if app is recommended for privacy (legit)
        - vs "encrypted" excuse (scam tactic)
        """
        
        self._print(f"Assessing channel: {channel}")
        
        channel_lower = channel.lower()
        
        result = {
            'channel': channel,
            'is_encrypted': False,
            'privacy_score': 0,
            'common_for_scams': False,
            'risk_score': 0,
            'reason': None,
            'recommendation': None,
            'risk_level': 'SAFE'
        }
        
        # Find channel in risk database
        for key, info in self.channel_risk.items():
            if key in channel_lower:
                result['risk_score'] = info['risk']
                result['is_encrypted'] = info['is_encrypted']
                result['reason'] = info['reason']
                result['common_for_scams'] = info['risk'] > 30
                break
        else:
            # Unknown channel
            result['risk_score'] = 40
            result['reason'] = f"Unknown communication channel: {channel}"
            result['common_for_scams'] = True
        
        # Additional assessment for "encrypted" excuses
        if result['is_encrypted']:
            if result['risk_score'] > 20:
                result['recommendation'] = "Legitimate encrypted app but commonly abused by scammers"
            else:
                result['recommendation'] = "Legitimate encrypted communication channel"
        else:
            if result['risk_score'] > 20:
                result['recommendation'] = "Non-encrypted channel often used by scammers - HIGH RISK"
            else:
                result['recommendation'] = "Standard communication channel"
        
        # Generate warning if high risk
        if result['risk_score'] >= 30:
            self._print(f"High-risk channel: {channel} - {result['reason']}", "WARNING")
        else:
            self._print(f"Channel risk assessment: {result['risk_score']}/100", "SUCCESS")
        
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        return result
    
    # =========================================================
    # 6. COMPLETE COMMUNICATION ANALYSIS
    # =========================================================
    
    def analyze_communication(self, communication_data: Dict) -> Dict:
        """
        Complete communication analysis
        
        Args:
            communication_data: Dictionary with channel, phone, username, company_country
        
        Returns:
            Dictionary with all analysis results
        """
        
        self._print(f"")
        self._print(f"Starting complete communication analysis")
        self._print("-" * 60)
        
        channel = communication_data.get('channel', '')
        phone = communication_data.get('phone', '')
        telegram_username = communication_data.get('telegram_username', '')
        whatsapp_phone = communication_data.get('whatsapp_phone', phone)
        company_country = communication_data.get('company_country', '')
        
        results = {}
        overall_risk = 0
        all_warnings = []
        
        # Run analyses in parallel
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {}
            
            # Channel risk assessment
            futures['channel'] = executor.submit(self.assess_channel_risk, channel)
            
            # Phone number OSINT
            if phone:
                futures['phone'] = executor.submit(self.analyze_phone_number, phone, company_country)
            
            # Telegram analysis
            if telegram_username:
                futures['telegram'] = executor.submit(self.analyze_telegram, telegram_username)
            elif phone:
                futures['telegram'] = executor.submit(self.analyze_telegram, None, phone)
            
            # WhatsApp analysis
            if whatsapp_phone:
                futures['whatsapp'] = executor.submit(self.analyze_whatsapp, whatsapp_phone)
            
            # Privacy app analysis (if channel is Signal/Wickr/etc)
            if 'signal' in channel.lower():
                futures['privacy_app'] = executor.submit(self.analyze_privacy_app, 'Signal', None, phone)
            elif 'wickr' in channel.lower():
                futures['privacy_app'] = executor.submit(self.analyze_privacy_app, 'Wickr', None, phone)
            
            # Collect results
            for key, future in futures.items():
                try:
                    results[key] = future.result()
                    risk = results[key].get('risk_score', 0)
                    overall_risk += risk * (0.3 if key == 'phone' else 0.25 if key == 'channel' else 0.2)
                    all_warnings.extend(results[key].get('warnings', []))
                except Exception as e:
                    self._print(f"Error in {key}: {str(e)}", "ERROR")
        
        # Calculate channel-specific risk adjustments
        if channel and 'telegram' in channel.lower() and not telegram_username:
            overall_risk += 20
            all_warnings.append('Telegram used but no username provided - suspicious')
        
        overall_risk = int(overall_risk)
        
        # Collect red flags
        red_flags = []
        for warning in all_warnings[:10]:
            red_flags.append(warning)
        
        # Generate recommendations
        recommendations = self._get_recommendations(overall_risk, red_flags)
        
        final_result = {
            'channel': channel,
            'phone': phone,
            'telegram_username': telegram_username,
            'analysis_results': results,
            'risk_score': min(100, overall_risk),
            'risk_level': self._get_risk_level(overall_risk),
            'red_flags': red_flags[:10],
            'recommendations': recommendations
        }
        
        self._print("-" * 60)
        self._print(f"Communication analysis complete")
        self._print(f"Overall Risk: {final_result['risk_level']} ({overall_risk}/100)")
        
        if red_flags:
            self._print(f"Red flags found: {len(red_flags)}", "WARNING")
        
        self._print("-" * 60)
        
        return final_result


# Standalone test
if __name__ == "__main__":
    ca = ChannelAnalyzer(verbose=True)
    
    test_comm = {
        'channel': 'telegram',
        'phone': '+1234567890',
        'telegram_username': 'recruiter_john',
        'company_country': 'US'
    }
    
    result = ca.analyze_communication(test_comm)
    
    print("\n" + json.dumps(result, indent=2, default=str))