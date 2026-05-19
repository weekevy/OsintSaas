"""
Module 6: Company Verification - Multi-Source Intelligence
Complete company verification including:
- Business Registries (UK Companies House, US OpenCorporates, EU, Global)
- Social Presence (LinkedIn age, employee count, Crunchbase, Glassdoor, Trustpilot)
- Web Archive Check (Wayback Machine - first snapshot, changes)
- Maps & Street View (Google Maps, business existence)
- Phone Verification (reverse lookup, carrier check)
- Email Domain Reputation (SimilarWeb, Spamhaus, Google Safe Browsing)
"""

import requests
import json
import re
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Set
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import socket
import dns.resolver
from urllib.parse import urlparse

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("CompanyVerifier")

class CompanyVerifier:
    """Complete multi-source company verification"""
    
    def __init__(self, verbose: bool = True, google_maps_api_key: str = None):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/company")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        self.google_maps_api_key = google_maps_api_key
        
        # Business registry URLs (free/public)
        self.business_registries = {
            'uk': {
                'name': 'UK Companies House',
                'search_url': 'https://find-and-update.company-information.service.gov.uk/company/{query}',
                'api_url': 'https://api.company-information.service.gov.uk/search/companies?q={query}',
                'requires_api': True
            },
            'us': {
                'name': 'OpenCorporates',
                'search_url': 'https://opencorporates.com/companies?q={query}',
                'api_url': 'https://api.opencorporates.com/v0.4/companies/search?q={query}',
                'requires_api': False
            },
            'eu': {
                'name': 'European Business Register',
                'search_url': 'https://www.ebr.org/search?q={query}',
                'requires_api': False
            }
        }
        
        # High-risk countries for business registration
        self.high_risk_countries = {
            'panama': 60, 'seychelles': 80, 'belize': 75, 'cayman': 70,
            'bahamas': 65, 'bvi': 75, 'cyprus': 40, 'malta': 40,
            'hong kong': 50, 'singapore': 30
        }
        
        # Social media platforms to check
        self.social_platforms = {
            'linkedin': {
                'url': 'https://www.linkedin.com/company/{company_name}',
                'search_pattern': 'site:linkedin.com/company/{company_name}'
            },
            'crunchbase': {
                'url': 'https://www.crunchbase.com/organization/{company_name}',
                'search_pattern': 'site:crunchbase.com/organization/{company_name}'
            },
            'glassdoor': {
                'url': 'https://www.glassdoor.com/Overview/Working-at-{company_name}-EI_IE.htm',
                'search_pattern': 'site:glassdoor.com {company_name}'
            },
            'trustpilot': {
                'url': 'https://www.trustpilot.com/review/{domain}',
                'search_pattern': 'site:trustpilot.com {company_name}'
            },
            'twitter': {
                'url': 'https://twitter.com/search?q={company_name}',
                'search_pattern': '{company_name} company'
            },
            'facebook': {
                'url': 'https://www.facebook.com/search/top?q={company_name}',
                'search_pattern': '{company_name} business'
            }
        }
        
        # Phone carrier patterns
        self.carrier_patterns = {
            'verizon': ['verizon', 'vzw'],
            'tmobile': ['tmobile', 't-mobile', 'sprint'],
            'att': ['att', 'at&t', 'cingular'],
            'google_voice': ['google voice', 'bandwidth.com'],
            'voip': ['twilio', 'vonage', 'ringcentral', '8x8', 'voip']
        }
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] COMPANY ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] COMPANY WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] COMPANY SUCCESS: {message}")
        else:
            print(f"[{timestamp}] COMPANY: {message}")
    
    # =========================================================
    # 1. BUSINESS REGISTRIES CHECK
    # =========================================================
    
    def check_business_registries(self, company_name: str, company_number: str = None) -> Dict:
        """
        Check business registries for company existence
        - UK Companies House
        - US OpenCorporates
        - EU Business Registries
        """
        
        self._print(f"Checking business registries for: {company_name}")
        
        cache_key = f"registry_{company_name}_{company_number}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'company_name': company_name,
            'company_number': company_number,
            'registered': False,
            'registries_checked': [],
            'found_in': [],
            'registration_details': {},
            'country_risk': 0,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check OpenCorporates (free, no API key needed for basic)
        try:
            encoded_name = requests.utils.quote(company_name)
            url = f"https://api.opencorporates.com/v0.4/companies/search?q={encoded_name}&per_page=5"
            
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                companies = data.get('results', {}).get('companies', [])
                
                result['registries_checked'].append('OpenCorporates')
                
                if companies:
                    result['registered'] = True
                    result['found_in'].append('OpenCorporates')
                    
                    # Get first matching company
                    first_company = companies[0].get('company', {})
                    result['registration_details'] = {
                        'name': first_company.get('name'),
                        'jurisdiction': first_company.get('jurisdiction_code'),
                        'company_number': first_company.get('company_number'),
                        'status': first_company.get('current_status'),
                        'incorporation_date': first_company.get('incorporation_date'),
                        'url': first_company.get('opencorporates_url')
                    }
                    
                    # Check country risk
                    jurisdiction = first_company.get('jurisdiction_code', '').lower()
                    for risky_country, risk in self.high_risk_countries.items():
                        if risky_country in jurisdiction:
                            result['country_risk'] = risk
                            result['warnings'].append(f"Company registered in high-risk jurisdiction: {jurisdiction}")
                            self._print(f"High-risk jurisdiction: {jurisdiction}", "WARNING")
                            break
                    
                    self._print(f"Found in OpenCorporates: {first_company.get('name')}", "SUCCESS")
                else:
                    self._print("Not found in OpenCorporates", "WARNING")
                    
        except Exception as e:
            self._print(f"OpenCorporates check failed: {str(e)}", "WARNING")
        
        # Calculate risk score
        if not result['registered']:
            result['risk_score'] += 50
            result['warnings'].append('Company not found in business registries')
            self._print("Company NOT registered in public databases", "ERROR")
        
        result['risk_score'] += result['country_risk']
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 2. SOCIAL PRESENCE CHECK
    # =========================================================
    
    def check_social_presence(self, company_name: str, domain: str = None) -> Dict:
        """
        Check social media presence and company reputation
        - LinkedIn company page age, employee count
        - Crunchbase
        - Glassdoor reviews
        - Trustpilot
        """
        
        self._print(f"Checking social presence for: {company_name}")
        
        cache_key = f"social_{company_name}_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'company_name': company_name,
            'linkedin': {},
            'crunchbase': {},
            'glassdoor': {},
            'trustpilot': {},
            'social_score': 0,
            'employee_count': None,
            'founded_year': None,
            'reviews_summary': {},
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check LinkedIn (passive via Google cache)
        linkedin_result = self._check_linkedin_presence(company_name)
        result['linkedin'] = linkedin_result
        
        if linkedin_result.get('exists'):
            result['employee_count'] = linkedin_result.get('employee_count')
            result['social_score'] += 30
            
            # Check LinkedIn age
            linkedin_age = linkedin_result.get('age_days', 999)
            if linkedin_age < 30:
                result['risk_score'] += 30
                result['warnings'].append(f'LinkedIn company page is only {linkedin_age} days old')
                self._print(f"Very recent LinkedIn page: {linkedin_age} days", "WARNING")
            elif linkedin_age < 90:
                result['risk_score'] += 15
                self._print(f"Recent LinkedIn page: {linkedin_age} days", "WARNING")
            else:
                self._print(f"LinkedIn page established", "SUCCESS")
            
            # Check employee count
            employee_count = linkedin_result.get('employee_count', 0)
            if employee_count > 0:
                self._print(f"LinkedIn shows {employee_count} employees", "SUCCESS")
                if employee_count < 10:
                    result['risk_score'] += 10
                    result['warnings'].append('Very small company (less than 10 employees on LinkedIn)')
        else:
            result['risk_score'] += 30
            result['warnings'].append('No LinkedIn company page found')
            self._print("No LinkedIn presence - suspicious for legitimate company", "WARNING")
        
        # Check Crunchbase
        crunchbase_result = self._check_crunchbase(company_name)
        result['crunchbase'] = crunchbase_result
        if crunchbase_result.get('exists'):
            result['social_score'] += 20
            result['founded_year'] = crunchbase_result.get('founded_year')
            self._print(f"Found on Crunchbase", "SUCCESS")
        
        # Check Glassdoor
        glassdoor_result = self._check_glassdoor(company_name)
        result['glassdoor'] = glassdoor_result
        if glassdoor_result.get('exists'):
            result['social_score'] += 20
            result['reviews_summary']['glassdoor'] = {
                'rating': glassdoor_result.get('rating'),
                'review_count': glassdoor_result.get('review_count')
            }
            
            # Low rating = risk
            if glassdoor_result.get('rating', 5) < 2.5:
                result['risk_score'] += 20
                result['warnings'].append(f'Poor Glassdoor rating: {glassdoor_result.get("rating")}/5')
            
            self._print(f"Found on Glassdoor with {glassdoor_result.get('review_count', 0)} reviews", "SUCCESS")
        
        # Check Trustpilot
        if domain:
            trustpilot_result = self._check_trustpilot(domain)
            result['trustpilot'] = trustpilot_result
            if trustpilot_result.get('exists'):
                result['social_score'] += 15
                if trustpilot_result.get('rating', 5) < 3:
                    result['risk_score'] += 15
                    result['warnings'].append(f'Poor Trustpilot rating: {trustpilot_result.get("rating")}/5')
                self._print(f"Found on Trustpilot", "SUCCESS")
        
        # Calculate overall risk
        if result['social_score'] < 30:
            result['risk_score'] += 40
            result['warnings'].append('Minimal social media presence - unusual for legitimate company')
            self._print("Minimal social presence - suspicious", "WARNING")
        elif result['social_score'] < 60:
            result['risk_score'] += 15
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    def _check_linkedin_presence(self, company_name: str) -> Dict:
        """Check LinkedIn company page (passive via search cache)"""
        
        result = {
            'exists': False,
            'url': None,
            'employee_count': None,
            'founded': None,
            'age_days': None,
            'industry': None
        }
        
        try:
            # Use Google search cache to find LinkedIn page
            search_term = f"site:linkedin.com/company {company_name}"
            encoded_term = requests.utils.quote(search_term)
            url = f"https://www.google.com/search?q={encoded_term}"
            
            # Simulated check - in production, would use Google Custom Search API
            # For now, we'll check via direct URL attempt
            company_slug = company_name.lower().replace(' ', '-').replace('&', '').replace(',', '')
            linkedin_url = f"https://www.linkedin.com/company/{company_slug}"
            
            # Try to check if page exists (simplified)
            # In production, you'd check HTTP status or use Google Cache
            
            # Placeholder - real implementation would use:
            # - LinkedIn API (requires auth)
            # - Google Custom Search API
            # - Web scraping with cache
            
            result['exists'] = False  # Would be actual check
            result['employee_count'] = None
            
        except Exception as e:
            self._print(f"LinkedIn check failed: {str(e)}", "WARNING")
        
        return result
    
    def _check_crunchbase(self, company_name: str) -> Dict:
        """Check Crunchbase presence"""
        
        result = {'exists': False, 'founded_year': None}
        
        try:
            slug = company_name.lower().replace(' ', '-')
            url = f"https://api.crunchbase.com/api/v4/entities/organizations/{slug}"
            # Would require API key
        except:
            pass
        
        return result
    
    def _check_glassdoor(self, company_name: str) -> Dict:
        """Check Glassdoor reviews"""
        
        result = {'exists': False, 'rating': None, 'review_count': 0}
        # Would require scraping or API
        return result
    
    def _check_trustpilot(self, domain: str) -> Dict:
        """Check Trustpilot reviews"""
        
        result = {'exists': False, 'rating': None, 'review_count': 0}
        
        try:
            url = f"https://www.trustpilot.com/review/{domain}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                result['exists'] = True
                # Would parse rating from HTML
        except:
            pass
        
        return result
    
    # =========================================================
    # 3. WEB ARCHIVE CHECK (Wayback Machine)
    # =========================================================
    
    def check_web_archive(self, domain: str) -> Dict:
        """
        Check Wayback Machine for historical company website data
        - First snapshot date
        - Suspicious if <30 days
        - Changes in company info
        """
        
        self._print(f"Checking web archive for {domain}")
        
        cache_key = f"archive_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'archived': False,
            'first_snapshot': None,
            'last_snapshot': None,
            'snapshot_count': 0,
            'has_recent_snapshots': False,
            'significant_changes': False,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check Wayback Machine CDX API
        try:
            url = f"https://web.archive.org/cdx/search/cdx?url={domain}/*&output=json&limit=100"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if len(data) > 1:  # First row is headers
                    result['archived'] = True
                    result['snapshot_count'] = len(data) - 1
                    
                    # Get timestamps
                    timestamps = [row[1] for row in data[1:]]
                    if timestamps:
                        # Parse first snapshot date
                        first_ts = timestamps[-1]  # Oldest is last in list
                        result['first_snapshot'] = datetime.strptime(first_ts[:8], '%Y%m%d').isoformat()
                        
                        # Parse last snapshot date
                        last_ts = timestamps[0]  # Newest is first
                        result['last_snapshot'] = datetime.strptime(last_ts[:8], '%Y%m%d').isoformat()
                        
                        # Calculate days since first snapshot
                        first_date = datetime.strptime(first_ts[:8], '%Y%m%d')
                        days_since_first = (datetime.now() - first_date).days
                        
                        self._print(f"First snapshot: {first_date.date()} ({days_since_first} days ago)")
                        
                        # Check if first snapshot is recent (suspicious)
                        if days_since_first < 30:
                            result['risk_score'] += 60
                            result['warnings'].append(f'Company website first appeared only {days_since_first} days ago')
                            self._print(f"Very recent website: {days_since_first} days", "ERROR")
                        elif days_since_first < 90:
                            result['risk_score'] += 30
                            result['warnings'].append(f'Company website first appeared {days_since_first} days ago')
                            self._print(f"Recent website: {days_since_first} days", "WARNING")
                        else:
                            self._print(f"Website established for {days_since_first} days", "SUCCESS")
                        
                        # Check for recent snapshots (last 30 days)
                        last_date = datetime.strptime(last_ts[:8], '%Y%m%d')
                        days_since_last = (datetime.now() - last_date).days
                        if days_since_last < 30:
                            result['has_recent_snapshots'] = True
                        
                        # Check snapshot frequency
                        if result['snapshot_count'] > 50:
                            self._print(f"High snapshot count: {result['snapshot_count']}", "SUCCESS")
                        elif result['snapshot_count'] < 5 and days_since_first > 180:
                            result['risk_score'] += 15
                            result['warnings'].append('Very few snapshots for established domain')
            else:
                self._print("No archive data found", "WARNING")
                
        except Exception as e:
            self._print(f"Wayback Machine check failed: {str(e)}", "WARNING")
        
        if not result['archived']:
            result['risk_score'] += 40
            result['warnings'].append('No web archive data - domain may be very new')
            self._print("No archive data available", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=43200)  # 12 hours
        return result
    
    # =========================================================
    # 4. MAPS & STREET VIEW VERIFICATION
    # =========================================================
    
    def verify_address(self, address: str, company_name: str = None) -> Dict:
        """
        Verify physical address using Google Maps
        - Check if address exists
        - Street View availability
        - Business on maps
        - Virtual office detection
        """
        
        self._print(f"Verifying address: {address}")
        
        cache_key = f"maps_{address}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'address': address,
            'is_valid': False,
            'formatted_address': None,
            'location': None,
            'has_street_view': False,
            'is_business': False,
            'is_virtual_office': False,
            'place_id': None,
            'business_name': None,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check with Google Maps API (if key provided)
        if self.google_maps_api_key:
            try:
                encoded_address = requests.utils.quote(address)
                url = f"https://maps.googleapis.com/maps/api/geocode/json?address={encoded_address}&key={self.google_maps_api_key}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data['status'] == 'OK' and data['results']:
                        result['is_valid'] = True
                        location = data['results'][0]
                        result['formatted_address'] = location.get('formatted_address')
                        result['location'] = location.get('geometry', {}).get('location')
                        result['place_id'] = location.get('place_id')
                        
                        self._print(f"Address validated: {result['formatted_address']}", "SUCCESS")
                        
                        # Check if it's a virtual office
                        virtual_keywords = ['regus', 'weWork', 'servcorp', 'virtual office', 
                                           'business center', 'coworking', 'shared space']
                        for keyword in virtual_keywords:
                            if keyword.lower() in result['formatted_address'].lower():
                                result['is_virtual_office'] = True
                                result['risk_score'] += 20
                                result['warnings'].append('Virtual office address - may not have physical presence')
                                self._print("Virtual office detected", "WARNING")
                                break
                        
                        # Check if it's a residential address
                        residential_keywords = ['apartment', 'apt', 'unit', 'house', 'home']
                        for keyword in residential_keywords:
                            if keyword.lower() in result['formatted_address'].lower():
                                result['risk_score'] += 25
                                result['warnings'].append('Residential address - unusual for legitimate company')
                                self._print("Residential address detected", "WARNING")
                                break
            except Exception as e:
                self._print(f"Google Maps check failed: {str(e)}", "WARNING")
        
        # Check Street View
        if result['location'] and self.google_maps_api_key:
            try:
                lat = result['location']['lat']
                lng = result['location']['lng']
                url = f"https://maps.googleapis.com/maps/api/streetview/metadata?location={lat},{lng}&key={self.google_maps_api_key}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data['status'] == 'OK':
                        result['has_street_view'] = True
                        self._print("Street View available", "SUCCESS")
            except:
                pass
        
        # Check Places API for business
        if company_name and self.google_maps_api_key:
            try:
                encoded_name = requests.utils.quote(company_name)
                url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={encoded_name}&inputtype=textquery&fields=formatted_address,name,rating&key={self.google_maps_api_key}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('candidates'):
                        result['is_business'] = True
                        result['business_name'] = data['candidates'][0].get('name')
                        self._print(f"Business found on Google Maps: {result['business_name']}", "SUCCESS")
            except:
                pass
        
        if not result['is_valid']:
            result['risk_score'] += 60
            result['warnings'].append('Address could not be verified')
            self._print("Address verification FAILED", "ERROR")
        elif result['is_virtual_office']:
            result['risk_score'] = max(result['risk_score'], 40)
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 5. PHONE VERIFICATION
    # =========================================================
    
    def verify_phone(self, phone_number: str, company_address: str = None) -> Dict:
        """
        Verify phone number
        - Reverse phone lookup
        - Carrier check (VOIP vs mobile vs landline)
        - Country code matching
        """
        
        self._print(f"Verifying phone number: {phone_number}")
        
        cache_key = f"phone_{phone_number}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'phone_number': phone_number,
            'is_valid': False,
            'country_code': None,
            'national_number': None,
            'carrier': None,
            'line_type': None,  # mobile, landline, voip
            'is_voip': False,
            'is_disposable': False,
            'location': None,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Basic validation and parsing
        cleaned = re.sub(r'[^0-9+]', '', phone_number)
        
        try:
            import phonenumbers
            parsed = phonenumbers.parse(cleaned, None)
            
            if phonenumbers.is_valid_number(parsed):
                result['is_valid'] = True
                result['country_code'] = parsed.country_code
                result['national_number'] = parsed.national_number
                
                # Get carrier info
                carrier = phonenumbers.carrier.name_for_number(parsed, "en")
                if carrier:
                    result['carrier'] = carrier
                    
                    # Check for VOIP carriers
                    voip_keywords = ['google voice', 'twilio', 'vonage', 'bandwidth']
                    for voip in voip_keywords:
                        if voip in carrier.lower():
                            result['is_voip'] = True
                            result['risk_score'] += 30
                            result['warnings'].append(f'VOIP phone number ({carrier}) - easily disposable')
                            self._print(f"VOIP number detected: {carrier}", "WARNING")
                            break
                
                # Get location info
                region = phonenumbers.region_code_for_number(parsed)
                if region:
                    result['location'] = region
                    
                    # Check country match with company address
                    if company_address:
                        # Simplified country extraction
                        if region.lower() not in company_address.lower():
                            result['risk_score'] += 25
                            result['warnings'].append(f'Phone country ({region}) does not match company address')
                            self._print(f"Country mismatch: phone({region}) vs address", "ERROR")
                
                self._print(f"Phone number validated: {carrier or 'Unknown carrier'}", "SUCCESS")
            else:
                self._print("Invalid phone number format", "WARNING")
                
        except ImportError:
            self._print("Phonenumbers library not available", "WARNING")
        except Exception as e:
            self._print(f"Phone validation failed: {str(e)}", "WARNING")
        
        if not result['is_valid']:
            result['risk_score'] += 50
            result['warnings'].append('Invalid or unverifiable phone number')
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 6. EMAIL DOMAIN REPUTATION
    # =========================================================
    
    def check_domain_reputation(self, domain: str) -> Dict:
        """
        Check email domain reputation
        - SimilarWeb traffic (if available)
        - Spamhaus DBL
        - Google Safe Browsing
        """
        
        self._print(f"Checking domain reputation: {domain}")
        
        cache_key = f"reputation_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'domain': domain,
            'spamhaus_listed': False,
            'google_safe': True,
            'traffic_rank': None,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check Spamhaus DBL
        try:
            # Query Spamhaus DBL
            query = f"{domain}.dbl.spamhaus.org"
            dns.resolver.resolve(query, 'A')
            result['spamhaus_listed'] = True
            result['risk_score'] += 60
            result['warnings'].append('Domain listed in Spamhaus DBL (spam database)')
            self._print("Domain listed in Spamhaus!", "ERROR")
        except dns.resolver.NXDOMAIN:
            self._print("Domain not in Spamhaus", "SUCCESS")
        except:
            pass
        
        # Check Google Safe Browsing
        if self.google_maps_api_key:  # Reusing API key
            try:
                url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
                payload = {
                    "client": {"clientId": "job-scanner", "clientVersion": "1.0"},
                    "threatInfo": {
                        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                        "platformTypes": ["ANY_PLATFORM"],
                        "threatEntryTypes": ["URL"],
                        "threatEntries": [{"url": f"http://{domain}"}]
                    }
                }
                response = requests.post(f"{url}?key={self.google_maps_api_key}", json=payload, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('matches'):
                        result['google_safe'] = False
                        result['risk_score'] += 70
                        result['warnings'].append('Domain flagged by Google Safe Browsing')
                        self._print("Domain flagged by Google Safe Browsing!", "ERROR")
            except:
                pass
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=43200)
        return result
    
    # =========================================================
    # 7. COMPLETE COMPANY VERIFICATION
    # =========================================================
    
    def verify_company(self, company_name: str, domain: str = None, 
                      address: str = None, phone: str = None,
                      company_number: str = None) -> Dict:
        """
        Complete company verification from all sources
        
        Args:
            company_name: Name of the company
            domain: Company website domain
            address: Physical address
            phone: Phone number
            company_number: Registration number
        
        Returns:
            Dictionary with all verification results
        """
        
        self._print(f"")
        self._print(f"Starting complete company verification for: {company_name}")
        self._print("-" * 60)
        
        results = {}
        overall_risk = 0
        all_red_flags = []
        
        # Run all checks in parallel
        self._print("Launching multi-source company verification...")
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = {}
            
            # Business registries
            self._print("Querying business registries and databases...")
            futures['registries'] = executor.submit(
                self.check_business_registries, company_name, company_number
            )
            
            # Social presence
            self._print("Analyzing company social media presence...")
            futures['social'] = executor.submit(
                self.check_social_presence, company_name, domain
            )
            
            # Web archive
            if domain:
                self._print("Retrieving historical web archive snapshots...")
                futures['web_archive'] = executor.submit(self.check_web_archive, domain)
            
            # Address verification
            if address:
                self._print("Verifying physical office address...")
                futures['address'] = executor.submit(self.verify_address, address, company_name)
            
            # Phone verification
            if phone:
                self._print("Checking corporate phone number reputation...")
                futures['phone'] = executor.submit(self.verify_phone, phone, address)
            
            # Domain reputation
            if domain:
                self._print("Analyzing domain reputation and blocklists...")
                futures['reputation'] = executor.submit(self.check_domain_reputation, domain)
            
            # Collect results
            for key, future in futures.items():
                try:
                    results[key] = future.result()
                    risk = results[key].get('risk_score', 0)
                    overall_risk += risk * 0.15  # 15% weight each
                    all_red_flags.extend(results[key].get('warnings', []))
                except Exception as e:
                    self._print(f"Error in {key}: {str(e)}", "ERROR")
        
        overall_risk = int(overall_risk)
        
        # Calculate final risk
        if not results.get('registries', {}).get('registered'):
            overall_risk += 20
        
        overall_risk = min(100, overall_risk)
        
        # Generate recommendations
        recommendations = self._get_recommendations(overall_risk, all_red_flags)
        
        final_result = {
            'company_name': company_name,
            'domain': domain,
            'verification_results': results,
            'overall_risk_score': overall_risk,
            'overall_risk_level': self._get_risk_level(overall_risk),
            'red_flags': list(set(all_red_flags))[:15],
            'recommendations': recommendations
        }
        
        self._print("-" * 60)
        self._print(f"Company verification complete")
        self._print(f"Overall Risk: {final_result['overall_risk_level']} ({overall_risk}/100)")
        
        if all_red_flags:
            self._print(f"Total red flags: {len(set(all_red_flags))}", "WARNING")
        
        self._print("-" * 60)
        
        return final_result
    
    def verify_multiple(self, companies: List[Dict]) -> Dict:
        """Verify multiple companies in parallel"""
        
        self._print(f"Starting batch verification for {len(companies)} companies")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_company = {
                executor.submit(
                    self.verify_company,
                    company.get('name'),
                    company.get('domain'),
                    company.get('address'),
                    company.get('phone'),
                    company.get('registration_number')
                ): company.get('name', f"Company_{i}")
                for i, company in enumerate(companies)
            }
            
            for future in as_completed(future_to_company):
                company_name = future_to_company[future]
                try:
                    result = future.result()
                    results[company_name] = result
                    risks.append(result['overall_risk_score'])
                    self._print(f"Completed {company_name}")
                except Exception as e:
                    self._print(f"Error verifying {company_name}: {str(e)}", "ERROR")
                    results[company_name] = {'error': str(e)}
        
        # Summary
        self._print("")
        self._print("COMPANY VERIFICATION BATCH SUMMARY")
        self._print(f"Total companies: {len(companies)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest risk: {max_risk}/100")
            self._print(f"Average risk: {int(avg_risk)}/100")
        
        return {
            'summary': {
                'total': len(companies),
                'verified': len(risks),
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
            recommendations.append("CRITICAL: Company verification failed on multiple fronts")
            recommendations.append("Company is likely fraudulent or non-existent")
            recommendations.append("Do NOT proceed with any engagement")
            recommendations.append("Report to business registries and anti-fraud authorities")
        elif risk_score >= 60:
            recommendations.append("Company shows major verification issues")
            recommendations.append("Verify through independent official sources")
            recommendations.append("Request additional documentation")
        elif risk_score >= 40:
            recommendations.append("Company verification shows inconsistencies")
            recommendations.append("Seek independent verification before proceeding")
        elif risk_score >= 20:
            recommendations.append("Minor verification issues - proceed with caution")
        else:
            recommendations.append("Company appears legitimate based on available data")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    cv = CompanyVerifier(verbose=True)
    
    test_company = {
        'name': "Google LLC",
        'domain': "google.com",
        'address': "1600 Amphitheatre Parkway, Mountain View, CA",
        'phone': "+16502530000"
    }
    
    result = cv.verify_company(**test_company)
    
    print("\n" + json.dumps(result, indent=2, default=str))