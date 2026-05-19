"""
Module 14: Temporal & Geospatial Analysis
Complete analysis including:
- Time-based anomaly detection (job posting time, response time, domain registration delta)
- Location consistency (IP geolocation, timezone mismatch, address verification)
- Virtual office detection (Regus, WeWork, etc)
- Phone area code vs address state comparison
"""

import re
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import time
import pytz
from dateutil import parser
import phonenumbers
from phonenumbers import geocoder, carrier

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("GeoTemporalAnalyzer")

class GeoTemporalAnalyzer:
    """Complete temporal and geospatial analysis"""
    
    def __init__(self, verbose: bool = True, google_maps_api_key: str = None, ipinfo_api_key: str = None):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/geo")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        self.google_maps_api_key = google_maps_api_key
        self.ipinfo_api_key = ipinfo_api_key
        
        # Business hours by industry (approximate)
        self.business_hours = {
            'default': {'start': 9, 'end': 17},
            'tech': {'start': 10, 'end': 18},
            'retail': {'start': 9, 'end': 20},
            'finance': {'start': 8, 'end': 17},
            'healthcare': {'start': 8, 'end': 18}
        }
        
        # Virtual office keywords
        self.virtual_office_keywords = [
            'regus', 'wework', 'servcorp', 'virtual office', 'business center',
            'coworking', 'shared space', 'executive suite', 'office suite',
            'regus business centre', 'we work', 'space', 'the office group'
        ]
        
        # Suspicious time patterns
        self.suspicious_hours = [0, 1, 2, 3, 4, 5]  # 12 AM - 5 AM
        
        # Timezone risk scores
        self.high_risk_timezones = {
            'Asia/Kolkata': {'risk': 20, 'name': 'India'},
            'Africa/Lagos': {'risk': 25, 'name': 'Nigeria'},
            'Africa/Accra': {'risk': 25, 'name': 'Ghana'},
            'Asia/Manila': {'risk': 15, 'name': 'Philippines'},
            'Europe/Kiev': {'risk': 15, 'name': 'Ukraine'},
            'Europe/Moscow': {'risk': 15, 'name': 'Russia'},
            'Asia/Dubai': {'risk': 10, 'name': 'UAE'},
            'Asia/Karachi': {'risk': 20, 'name': 'Pakistan'}
        }
        
        # Country codes for matching
        self.country_codes = {
            'US': 'United States', 'CA': 'Canada', 'UK': 'United Kingdom',
            'AU': 'Australia', 'DE': 'Germany', 'FR': 'France', 'IN': 'India',
            'NG': 'Nigeria', 'GH': 'Ghana', 'PH': 'Philippines', 'UA': 'Ukraine'
        }
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] GEO ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] GEO WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] GEO SUCCESS: {message}")
        else:
            print(f"[{timestamp}] GEO: {message}")
    
    # =========================================================
    # 1. TIME-BASED ANOMALY DETECTION
    # =========================================================
    
    def analyze_job_posting_time(self, posting_time: datetime, company_timezone: str = None) -> Dict:
        """
        Analyze job posting time vs local business hours
        - Posted 3AM = suspicious
        """
        
        self._print(f"Analyzing job posting time: {posting_time}")
        
        result = {
            'posting_time': posting_time.isoformat() if posting_time else None,
            'posting_hour': posting_time.hour if posting_time else None,
            'is_during_business_hours': False,
            'is_suspicious_hour': False,
            'business_hours_range': None,
            'risk_score': 0,
            'warning': None
        }
        
        if not posting_time:
            return result
        
        # Check if during suspicious hours (12 AM - 5 AM)
        if posting_time.hour in self.suspicious_hours:
            result['is_suspicious_hour'] = True
            result['risk_score'] += 30
            result['warning'] = f"Job posted at {posting_time.strftime('%I:%M %p')} - unusual for legitimate business"
            self._print(f"Suspicious posting hour: {posting_time.hour}:00", "WARNING")
        
        # Determine business hours based on company timezone or default
        biz_hours = self.business_hours['default']
        if company_timezone:
            try:
                tz = pytz.timezone(company_timezone)
                local_time = posting_time.astimezone(tz)
                local_hour = local_time.hour
                
                if biz_hours['start'] <= local_hour < biz_hours['end']:
                    result['is_during_business_hours'] = True
                    self._print(f"Posted during business hours in {company_timezone}", "SUCCESS")
                else:
                    result['risk_score'] += 20
                    result['warning'] = f"Posted outside business hours in {company_timezone}"
                    self._print("Posted outside business hours", "WARNING")
            except:
                pass
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    def analyze_response_time(self, application_time: datetime, response_time: datetime) -> Dict:
        """
        Analyze response time to application
        - Instant reply = automated scam
        """
        
        self._print(f"Analyzing response time")
        
        result = {
            'application_time': application_time.isoformat() if application_time else None,
            'response_time': response_time.isoformat() if response_time else None,
            'response_minutes': None,
            'is_instant': False,
            'is_automated_suspected': False,
            'risk_score': 0,
            'warning': None
        }
        
        if not application_time or not response_time:
            return result
        
        delta = response_time - application_time
        minutes = delta.total_seconds() / 60
        result['response_minutes'] = round(minutes, 1)
        
        # Instant response (< 1 minute) = likely automated
        if minutes < 1:
            result['is_instant'] = True
            result['is_automated_suspected'] = True
            result['risk_score'] += 40
            result['warning'] = f"Instant response ({minutes:.0f} seconds) - likely automated scam"
            self._print(f"Instant response detected - automated system", "ERROR")
        elif minutes < 5:
            result['risk_score'] += 20
            result['warning'] = f"Very fast response ({minutes:.0f} minutes) - could be automated"
            self._print(f"Very fast response: {minutes:.0f} minutes", "WARNING")
        elif minutes < 30:
            self._print(f"Normal response time: {minutes:.0f} minutes", "SUCCESS")
        else:
            self._print(f"Response time: {minutes:.0f} minutes")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    def analyze_domain_registration_delta(self, domain_registration_date: datetime, 
                                          job_posting_date: datetime) -> Dict:
        """
        Analyze time between domain registration and job posting
        - <7 days = 🔴
        """
        
        self._print(f"Analyzing domain registration delta")
        
        result = {
            'domain_registration': domain_registration_date.isoformat() if domain_registration_date else None,
            'job_posting_date': job_posting_date.isoformat() if job_posting_date else None,
            'days_difference': None,
            'risk_level': None,
            'risk_score': 0,
            'warning': None
        }
        
        if not domain_registration_date or not job_posting_date:
            return result
        
        delta = job_posting_date - domain_registration_date
        days = delta.days
        result['days_difference'] = days
        
        if days < 0:
            result['warning'] = "Domain registered AFTER job posting - unusual"
            result['risk_score'] += 30
            self._print("Domain registered after job posting", "ERROR")
        elif days < 7:
            result['risk_level'] = 'CRITICAL'
            result['risk_score'] += 50
            result['warning'] = f"Domain registered only {days} days before job posting - HIGH RISK"
            self._print(f"Domain registered {days} days before posting - scam indicator", "ERROR")
        elif days < 30:
            result['risk_level'] = 'HIGH'
            result['risk_score'] += 30
            result['warning'] = f"Domain registered {days} days before job posting - suspicious"
            self._print(f"Recent domain registration: {days} days", "WARNING")
        elif days < 90:
            result['risk_level'] = 'MEDIUM'
            result['risk_score'] += 15
            result['warning'] = f"Domain registered {days} days before job posting"
        else:
            result['risk_level'] = 'SAFE'
            self._print(f"Domain established: {days} days before posting", "SUCCESS")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    def analyze_ssl_certificate_vs_domain(self, ssl_issue_date: datetime, 
                                          domain_registration_date: datetime) -> Dict:
        """
        Analyze SSL certificate issuance vs domain registration
        - Same day = rushed setup
        """
        
        self._print(f"Analyzing SSL vs domain registration timing")
        
        result = {
            'ssl_issue_date': ssl_issue_date.isoformat() if ssl_issue_date else None,
            'domain_registration': domain_registration_date.isoformat() if domain_registration_date else None,
            'days_difference': None,
            'is_same_day': False,
            'risk_score': 0,
            'warning': None
        }
        
        if not ssl_issue_date or not domain_registration_date:
            return result
        
        delta = ssl_issue_date - domain_registration_date
        days = delta.days
        result['days_difference'] = days
        
        if abs(days) <= 1:
            result['is_same_day'] = True
            result['risk_score'] += 35
            result['warning'] = "SSL certificate issued same day as domain registration - rushed setup"
            self._print("SSL issued same day as domain - rushed scam setup", "ERROR")
        elif days < 7:
            result['risk_score'] += 20
            result['warning'] = f"SSL issued {days} days after domain registration - quick setup"
            self._print(f"SSL issued quickly: {days} days after domain", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 2. LOCATION CONSISTENCY
    # =========================================================
    
    def get_ip_geolocation(self, ip_address: str) -> Dict:
        """
        Get IP geolocation (passive via ipinfo.io or similar)
        """
        
        self._print(f"Getting geolocation for IP: {ip_address}")
        
        cache_key = f"ip_geo_{ip_address}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'ip': ip_address,
            'country': None,
            'country_code': None,
            'city': None,
            'region': None,
            'timezone': None,
            'latitude': None,
            'longitude': None,
            'organization': None,
            'risk_score': 0
        }
        
        # Use ipinfo.io (free tier)
        try:
            token_param = f"?token={self.ipinfo_api_key}" if self.ipinfo_api_key else ""
            url = f"https://ipinfo.io/{ip_address}/json{token_param}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                result['country'] = data.get('country')
                result['country_code'] = data.get('country')
                result['city'] = data.get('city')
                result['region'] = data.get('region')
                result['timezone'] = data.get('timezone')
                result['organization'] = data.get('org')
                
                loc = data.get('loc', '').split(',')
                if len(loc) == 2:
                    result['latitude'] = float(loc[0])
                    result['longitude'] = float(loc[1])
                
                self._print(f"IP located in {result['country']}, {result['city']}", "SUCCESS")
            else:
                self._print(f"IP geolocation failed: {response.status_code}", "WARNING")
                
        except Exception as e:
            self._print(f"IP geolocation error: {str(e)}", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    def check_location_consistency(self, ip_country: str, company_country: str, 
                                   ip_timezone: str = None, company_timezone: str = None) -> Dict:
        """
        Check consistency between IP location and company location
        - Mismatch = high risk
        """
        
        self._print(f"Checking location consistency")
        
        result = {
            'ip_country': ip_country,
            'company_country': company_country,
            'countries_match': False,
            'timezone_match': False,
            'risk_score': 0,
            'warnings': []
        }
        
        # Country match
        if ip_country and company_country:
            if ip_country.upper() == company_country.upper():
                result['countries_match'] = True
                self._print("Countries match", "SUCCESS")
            else:
                result['risk_score'] += 40
                result['warnings'].append(f"Country mismatch: IP ({ip_country}) vs Company ({company_country})")
                self._print(f"Country mismatch detected", "ERROR")
        
        # Timezone match
        if ip_timezone and company_timezone:
            try:
                ip_tz = pytz.timezone(ip_timezone)
                company_tz = pytz.timezone(company_timezone)
                
                if ip_tz.zone == company_tz.zone:
                    result['timezone_match'] = True
                    self._print("Timezones match", "SUCCESS")
                else:
                    result['risk_score'] += 20
                    result['warnings'].append(f"Timezone mismatch: {ip_tz.zone} vs {company_tz.zone}")
                    self._print("Timezone mismatch detected", "WARNING")
            except:
                pass
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    def check_timezone_mismatch(self, recruiter_timezone: str, company_timezone: str) -> Dict:
        """
        Check for suspicious timezone mismatch
        - Recruiter in Nigeria, company in NYC = red flag
        """
        
        self._print(f"Checking timezone mismatch")
        
        result = {
            'recruiter_timezone': recruiter_timezone,
            'company_timezone': company_timezone,
            'is_mismatch': False,
            'recruiter_risk': 0,
            'risk_score': 0,
            'warning': None
        }
        
        if not recruiter_timezone or not company_timezone:
            return result
        
        if recruiter_timezone != company_timezone:
            result['is_mismatch'] = True
            
            # Check if recruiter timezone is high risk
            for tz, info in self.high_risk_timezones.items():
                if tz in recruiter_timezone:
                    result['recruiter_risk'] = info['risk']
                    result['risk_score'] += info['risk']
                    result['warning'] = f"Recruiter in {info['name']} but company in {company_timezone} - common scam pattern"
                    self._print(f"High-risk timezone mismatch: {info['name']} vs {company_timezone}", "ERROR")
                    break
            
            if not result['warning']:
                result['risk_score'] += 20
                result['warning'] = f"Timezone mismatch: {recruiter_timezone} vs {company_timezone}"
                self._print(f"Timezone mismatch detected", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 3. ADDRESS VERIFICATION (Google Maps)
    # =========================================================
    
    def verify_address(self, address: str, company_name: str = None) -> Dict:
        """
        Verify address using Google Maps API
        - Check if address exists
        - Detect virtual office
        - Check if residential
        """
        
        self._print(f"Verifying address: {address}")
        
        cache_key = f"address_verify_{hashlib.md5(address.encode()).hexdigest()}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'address': address,
            'is_valid': False,
            'formatted_address': None,
            'location': None,
            'place_type': None,
            'is_virtual_office': False,
            'is_residential': False,
            'is_commercial': False,
            'confidence': 0,
            'risk_score': 0,
            'warnings': []
        }
        
        if not self.google_maps_api_key:
            result['warning'] = "Google Maps API key required for address verification"
            self._print("Address verification requires API key", "WARNING")
            return result
        
        try:
            # Geocoding API
            encoded_addr = requests.utils.quote(address)
            url = f"https://maps.googleapis.com/maps/api/geocode/json?address={encoded_addr}&key={self.google_maps_api_key}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data['status'] == 'OK' and data['results']:
                    result['is_valid'] = True
                    location = data['results'][0]
                    result['formatted_address'] = location.get('formatted_address')
                    result['location'] = location.get('geometry', {}).get('location')
                    
                    self._print(f"Address validated: {result['formatted_address']}", "SUCCESS")
                    
                    # Check address type from address components
                    for component in location.get('address_components', []):
                        types = component.get('types', [])
                        if 'premise' in types:
                            result['is_commercial'] = True
                        elif 'subpremise' in types:
                            result['is_commercial'] = True
                    
                    # Check for virtual office keywords
                    addr_lower = result['formatted_address'].lower()
                    for keyword in self.virtual_office_keywords:
                        if keyword in addr_lower:
                            result['is_virtual_office'] = True
                            result['risk_score'] += 25
                            result['warnings'].append(f"Virtual office detected: {keyword}")
                            self._print(f"Virtual office detected: {keyword}", "WARNING")
                            break
                    
                    # Check for residential indicators
                    residential_keywords = ['apartment', 'apt', 'unit', 'house', 'home', 'residential']
                    for keyword in residential_keywords:
                        if keyword in addr_lower:
                            result['is_residential'] = True
                            result['risk_score'] += 30
                            result['warnings'].append(f"Residential address - unusual for legitimate company")
                            self._print("Residential address detected", "WARNING")
                            break
                    
                    # Places API for business verification
                    if company_name and result['location']:
                        lat = result['location']['lat']
                        lng = result['location']['lng']
                        places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=50&key={self.google_maps_api_key}"
                        places_response = requests.get(places_url, timeout=10)
                        
                        if places_response.status_code == 200:
                            places_data = places_response.json()
                            if places_data.get('results'):
                                for place in places_data['results'][:5]:
                                    place_name = place.get('name', '').lower()
                                    if company_name.lower() in place_name:
                                        result['confidence'] = 80
                                        result['warnings'].append(f"Business confirmed on Google Maps: {place.get('name')}")
                                        self._print(f"Business confirmed on Google Maps", "SUCCESS")
                                        break
                else:
                    self._print(f"Address not found: {address}", "WARNING")
                    result['risk_score'] += 40
                    result['warnings'].append("Address could not be verified")
            else:
                self._print(f"Google Maps API error: {response.status_code}", "WARNING")
                
        except Exception as e:
            self._print(f"Address verification failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 4. PHONE AREA CODE VS ADDRESS STATE
    # =========================================================
    
    def check_phone_vs_address(self, phone: str, address_state: str, address_country: str = None) -> Dict:
        """
        Compare phone area code to company address state
        """
        
        self._print(f"Checking phone vs address consistency")
        
        result = {
            'phone': phone,
            'phone_state': None,
            'phone_country': None,
            'address_state': address_state,
            'address_country': address_country,
            'are_consistent': False,
            'risk_score': 0,
            'warning': None
        }
        
        if not phone:
            return result
        
        try:
            parsed = phonenumbers.parse(phone, None)
            if phonenumbers.is_valid_number(parsed):
                # Get country
                country_code = phonenumbers.region_code_for_number(parsed)
                result['phone_country'] = self.country_codes.get(country_code, country_code)
                
                # Get location (area code to region mapping - simplified)
                location = geocoder.description_for_number(parsed, "en")
                if location:
                    # Extract state from location (simplified for US)
                    if ' ' in location:
                        parts = location.split(', ')
                        if len(parts) >= 2:
                            result['phone_state'] = parts[-1].strip()
                
                # Compare with address state
                if address_state and result['phone_state']:
                    if address_state.lower() in result['phone_state'].lower() or result['phone_state'].lower() in address_state.lower():
                        result['are_consistent'] = True
                        self._print("Phone area code matches address state", "SUCCESS")
                    else:
                        result['risk_score'] += 25
                        result['warning'] = f"Phone location ({result['phone_state']}) does not match address state ({address_state})"
                        self._print("Phone location mismatch", "WARNING")
                
                # Compare country
                if address_country and result['phone_country']:
                    if address_country.lower() in result['phone_country'].lower():
                        result['are_consistent'] = True
                    else:
                        result['risk_score'] += 30
                        result['warning'] = f"Phone country ({result['phone_country']}) does not match address country ({address_country})"
                        self._print("Phone country mismatch", "ERROR")
                        
        except Exception as e:
            self._print(f"Phone analysis failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 5. COMPLETE TEMPORAL & GEOSPATIAL ANALYSIS
    # =========================================================
    
    def analyze_geo_temporal(self, analysis_data: Dict) -> Dict:
        """
        Complete temporal and geospatial analysis
        
        Args:
            analysis_data: Dictionary with:
                - job_posting_time: datetime of job posting
                - application_time: datetime of application
                - response_time: datetime of response
                - domain_registration_date: datetime
                - ssl_issue_date: datetime
                - company_timezone: string
                - company_country: string
                - company_address: string
                - company_name: string
                - recruiter_timezone: string
                - ip_address: string
                - phone: string
        """
        
        self._print(f"")
        self._print(f"Starting complete temporal & geospatial analysis")
        self._print("-" * 60)
        
        results = {}
        overall_risk = 0
        all_warnings = []
        
        # Run analyses in parallel
        self._print("Launching temporal and geospatial forensic checks...")
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = {}
            
            # Time-based analyses
            if analysis_data.get('job_posting_time'):
                self._print("Analyzing job posting timestamp patterns...")
                futures['posting_time'] = executor.submit(
                    self.analyze_job_posting_time,
                    analysis_data['job_posting_time'],
                    analysis_data.get('company_timezone')
                )
            
            if analysis_data.get('application_time') and analysis_data.get('response_time'):
                self._print("Analyzing response time latency...")
                futures['response_time'] = executor.submit(
                    self.analyze_response_time,
                    analysis_data['application_time'],
                    analysis_data['response_time']
                )
            
            if analysis_data.get('domain_registration_date') and analysis_data.get('job_posting_time'):
                self._print("Comparing domain registration with job posting date...")
                futures['domain_delta'] = executor.submit(
                    self.analyze_domain_registration_delta,
                    analysis_data['domain_registration_date'],
                    analysis_data['job_posting_time']
                )
            
            if analysis_data.get('ssl_issue_date') and analysis_data.get('domain_registration_date'):
                self._print("Analyzing SSL certificate issuance timing...")
                futures['ssl_delta'] = executor.submit(
                    self.analyze_ssl_certificate_vs_domain,
                    analysis_data['ssl_issue_date'],
                    analysis_data['domain_registration_date']
                )
            
            # Location-based analyses
            if analysis_data.get('ip_address'):
                self._print(f"Performing geolocation lookup for IP: {analysis_data['ip_address']}...")
                futures['ip_geo'] = executor.submit(
                    self.get_ip_geolocation,
                    analysis_data['ip_address']
                )
                
                # Wait for IP result to check consistency
                # This is handled in collection
                ip_future = futures['ip_geo']
            
            if analysis_data.get('recruiter_timezone') and analysis_data.get('company_timezone'):
                self._print("Analyzing timezone consistency...")
                futures['timezone_mismatch'] = executor.submit(
                    self.check_timezone_mismatch,
                    analysis_data['recruiter_timezone'],
                    analysis_data['company_timezone']
                )
            
            if analysis_data.get('company_address'):
                self._print("Verifying corporate office location...")
                futures['address'] = executor.submit(
                    self.verify_address,
                    analysis_data['company_address'],
                    analysis_data.get('company_name')
                )
            
            if analysis_data.get('phone') and analysis_data.get('company_address'):
                futures['phone_vs_address'] = executor.submit(
                    self.check_phone_vs_address,
                    analysis_data['phone'],
                    analysis_data.get('address_state', ''),
                    analysis_data.get('company_country')
                )
            
            # Collect results
            for key, future in futures.items():
                try:
                    results[key] = future.result()
                    risk = results[key].get('risk_score', 0)
                    
                    # Apply weights
                    if key in ['posting_time', 'response_time']:
                        weight = 0.15
                    elif key in ['domain_delta', 'ssl_delta']:
                        weight = 0.20
                    elif key == 'timezone_mismatch':
                        weight = 0.20
                    elif key == 'phone_vs_address':
                        weight = 0.15
                    elif key == 'address':
                        weight = 0.15
                    else:
                        weight = 0.10
                    
                    overall_risk += risk * weight
                    
                    warning = results[key].get('warning')
                    if warning:
                        all_warnings.append(f"[{key.upper()}] {warning}")
                        
                except Exception as e:
                    self._print(f"Error in {key}: {str(e)}", "ERROR")
        
        # Additional location consistency if both IP and country available
        if results.get('ip_geo') and analysis_data.get('company_country'):
            ip_country = results['ip_geo'].get('country')
            ip_timezone = results['ip_geo'].get('timezone')
            consistency = self.check_location_consistency(
                ip_country, 
                analysis_data.get('company_country', ''),
                ip_timezone,
                analysis_data.get('company_timezone')
            )
            results['location_consistency'] = consistency
            overall_risk += consistency.get('risk_score', 0) * 0.15
            all_warnings.extend(consistency.get('warnings', []))
        
        overall_risk = int(overall_risk)
        
        # Generate recommendations
        recommendations = self._get_recommendations(overall_risk, all_warnings)
        
        final_result = {
            'analysis_results': results,
            'overall_risk_score': min(100, overall_risk),
            'overall_risk_level': self._get_risk_level(overall_risk),
            'red_flags': list(set(all_warnings))[:15],
            'recommendations': recommendations
        }
        
        self._print("-" * 60)
        self._print(f"Temporal & geospatial analysis complete")
        self._print(f"Overall Risk: {final_result['overall_risk_level']} ({overall_risk}/100)")
        
        if all_warnings:
            self._print(f"Red flags found: {len(set(all_warnings))}", "WARNING")
        
        self._print("-" * 60)
        
        return final_result
    
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
    
    def _get_recommendations(self, risk_score: int, warnings: List[str]) -> List[str]:
        recommendations = []
        
        if risk_score >= 80:
            recommendations.append("CRITICAL: Multiple temporal/spatial anomalies detected")
            recommendations.append("This is almost certainly a scam based on timing/location inconsistencies")
            recommendations.append("Do NOT engage and report immediately")
        elif risk_score >= 60:
            recommendations.append("Major inconsistencies in time and location data")
            recommendations.append("Recruiter likely operating from different country than claimed")
            recommendations.append("Verify identity through video call before proceeding")
        elif risk_score >= 40:
            recommendations.append("Suspicious timing or location patterns detected")
            recommendations.append("Request additional verification before sharing information")
        elif risk_score >= 20:
            recommendations.append("Minor anomalies detected - proceed with caution")
        else:
            recommendations.append("Timing and location data appear consistent")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    gta = GeoTemporalAnalyzer(verbose=True)
    
    test_data = {
        'job_posting_time': datetime(2026, 5, 19, 3, 30),
        'company_timezone': 'America/New_York',
        'company_country': 'US',
        'company_address': '1600 Amphitheatre Parkway, Mountain View, CA',
        'company_name': 'Google',
        'phone': '+16502530000'
    }
    
    result = gta.analyze_geo_temporal(test_data)
    
    print("\n" + json.dumps(result, indent=2, default=str, ensure_ascii=False))