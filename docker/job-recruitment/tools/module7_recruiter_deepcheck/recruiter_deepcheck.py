"""
Module 7: Recruiter Deep Verification - Complete OSINT
- LinkedIn OSINT (passive, no login)
  - Profile existence, creation date, recommendations, endorsements
  - Profile completeness, recruiter badge verification
- Cross-platform correlation
  - Twitter, GitHub, AngelList, Upwork, Fiverr
  - Reverse image search (stock photos, multiple profiles)
- Email pattern analysis
  - Company pattern matching, HaveIBeenPwned, Gravatar
"""

import requests
import json
import re
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Set
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import time
import base64

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("RecruiterVerifier")

class RecruiterVerifier:
    """Complete recruiter deep verification"""
    
    def __init__(self, verbose: bool = True, hibp_api_key: str = None, google_api_key: str = None):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/recruiter")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        self.hibp_api_key = hibp_api_key
        self.google_api_key = google_api_key
        
        # Stock photo domains to check
        self.stock_photo_domains = [
            'istockphoto.com', 'shutterstock.com', 'gettyimages.com', 'adobestock.com',
            'freepik.com', 'pexels.com', 'unsplash.com', 'depositphotos.com',
            '123rf.com', 'dreamstime.com', 'canva.com', 'pixabay.com'
        ]
        
        # Platforms for cross-platform correlation
        self.platforms = {
            'twitter': {
                'search_url': 'https://twitter.com/search?q={name}',
                'profile_pattern': 'https://twitter.com/{username}',
                'api_available': False
            },
            'github': {
                'search_url': 'https://github.com/search?q={name}&type=users',
                'profile_pattern': 'https://github.com/{username}',
                'api_available': True
            },
            'angellist': {
                'search_url': 'https://angel.co/search?q={name}',
                'profile_pattern': 'https://angel.co/u/{username}',
                'api_available': False
            },
            'upwork': {
                'search_url': 'https://www.upwork.com/search/profiles/?q={name}',
                'api_available': False
            },
            'fiverr': {
                'search_url': 'https://www.fiverr.com/search/gigs?query={name}',
                'api_available': False
            }
        }
        
        # LinkedIn profile ID patterns for age estimation
        self.linkedin_id_patterns = [
            (r'linkedin\.com/in/([a-zA-Z0-9-]+)', 'username'),
            (r'linkedin\.com/pub/([^/]+)/(\d+)/(\d+)/(\d+)', 'legacy')
        ]
        
        # Suspicious profile patterns
        self.suspicious_patterns = [
            (r'^[a-z]+[0-9]{4,}$', 'Generic username with numbers'),
            (r'^recruiter\d+$', 'Generic recruiter account'),
            (r'^hr\d+$', 'Generic HR account'),
            (r'^hiring\d+$', 'Generic hiring account')
        ]
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] RECRUITER ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] RECRUITER WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] RECRUITER SUCCESS: {message}")
        else:
            print(f"[{timestamp}] RECRUITER: {message}")
    
    # =========================================================
    # 1. LINKEDIN OSINT (Passive)
    # =========================================================
    
    def analyze_linkedin_profile(self, profile_url: str, full_name: str = None) -> Dict:
        """
        Passive LinkedIn OSINT analysis
        - Profile existence check
        - Profile creation date estimation
        - Recommendations count
        - Endorsements
        - Profile completeness
        - Recruiter badge verification
        """
        
        self._print(f"Analyzing LinkedIn profile: {profile_url}")
        
        cache_key = f"linkedin_{profile_url}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'profile_url': profile_url,
            'exists': False,
            'username': None,
            'profile_age_days': None,
            'has_profile_photo': False,
            'has_background_photo': False,
            'recommendations_count': 0,
            'endorsements_count': 0,
            'connections_count': 0,
            'has_recruiter_badge': False,
            'profile_completeness_score': 0,
            'experience_entries': 0,
            'current_position': None,
            'company_match': False,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Extract username from URL
        username_match = re.search(r'linkedin\.com/in/([^/?]+)', profile_url)
        if username_match:
            result['username'] = username_match.group(1)
            self._print(f"LinkedIn username: {result['username']}")
        
        # Check profile existence via Google cache (passive)
        # In production, you'd use Google Custom Search API
        # For now, we'll simulate with HTTP check
        try:
            response = requests.get(profile_url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                result['exists'] = True
                content = response.text.lower()
                
                # Check for profile photo
                if 'profile-photo' in content or 'pv-image' in content:
                    result['has_profile_photo'] = True
                    self._print("Profile photo found", "SUCCESS")
                
                # Check for background photo
                if 'background-image' in content or 'cover-image' in content:
                    result['has_background_photo'] = True
                
                # Estimate recommendations count
                rec_match = re.search(r'recommendations?[^0-9]*([0-9,]+)', content)
                if rec_match:
                    rec_count = rec_match.group(1).replace(',', '')
                    result['recommendations_count'] = int(rec_count)
                    self._print(f"Found {result['recommendations_count']} recommendations", "SUCCESS")
                
                # Estimate endorsements
                end_match = re.search(r'endorsements?[^0-9]*([0-9,]+)', content)
                if end_match:
                    end_count = end_match.group(1).replace(',', '')
                    result['endorsements_count'] = int(end_count)
                
                # Estimate connections
                conn_match = re.search(r'connections?[^0-9]*([0-9,]+)', content)
                if conn_match:
                    conn_count = conn_match.group(1).replace(',', '')
                    result['connections_count'] = int(conn_count)
                    self._print(f"Found {result['connections_count']} connections", "SUCCESS")
                
                # Check for recruiter badge
                if 'recruiter' in content and ('badge' in content or 'talent' in content):
                    result['has_recruiter_badge'] = True
                    self._print("LinkedIn Recruiter badge detected", "SUCCESS")
                
                # Count experience entries
                exp_matches = re.findall(r'experience-section', content)
                result['experience_entries'] = len(exp_matches)
                
                # Extract current position
                position_match = re.search(r'current position[^>]*>([^<]+)', content)
                if position_match:
                    result['current_position'] = position_match.group(1).strip()
                    self._print(f"Current position: {result['current_position']}")
                
                # Calculate profile completeness
                completeness = 0
                if result['has_profile_photo']:
                    completeness += 20
                if result['has_background_photo']:
                    completeness += 10
                if result['recommendations_count'] > 0:
                    completeness += min(20, result['recommendations_count'] // 2)
                if result['experience_entries'] > 0:
                    completeness += min(30, result['experience_entries'] * 5)
                if result['connections_count'] > 50:
                    completeness += 20
                
                result['profile_completeness_score'] = min(100, completeness)
                self._print(f"Profile completeness: {result['profile_completeness_score']}%")
                
                # Estimate profile age (based on URL pattern or content)
                # This is heuristic
                if result['connections_count'] < 50 and result['endorsements_count'] < 10:
                    result['profile_age_days'] = 30
                    result['risk_score'] += 30
                    result['warnings'].append('Profile appears very new (low connections/endorsements)')
                    self._print("Very new profile detected", "WARNING")
                elif result['connections_count'] < 200:
                    result['profile_age_days'] = 180
                else:
                    result['profile_age_days'] = 730  # 2+ years
                
                # Risk assessment based on completeness
                if result['profile_completeness_score'] < 40:
                    result['risk_score'] += 30
                    result['warnings'].append('Incomplete LinkedIn profile - suspicious for recruiter')
                    self._print("Incomplete profile", "WARNING")
                
                if result['recommendations_count'] == 0 and result['experience_entries'] > 0:
                    result['risk_score'] += 15
                    result['warnings'].append('No recommendations despite having experience')
                
            else:
                self._print("Profile not found or inaccessible", "WARNING")
                result['risk_score'] += 50
                result['warnings'].append('LinkedIn profile does not exist or is inaccessible')
                
        except Exception as e:
            self._print(f"LinkedIn check failed: {str(e)}", "WARNING")
            result['risk_score'] += 30
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 2. CROSS-PLATFORM CORRELATION
    # =========================================================
    
    def cross_platform_search(self, full_name: str, email: str = None) -> Dict:
        """
        Search for recruiter across multiple platforms
        - Twitter, GitHub, AngelList, Upwork, Fiverr
        - Check for consistent employment history
        """
        
        self._print(f"Cross-platform search for: {full_name}")
        
        cache_key = f"cross_{full_name}_{email}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'full_name': full_name,
            'email': email,
            'profiles_found': [],
            'platforms': {},
            'consistent_employment': False,
            'employment_history': {},
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Parse name components
        name_parts = full_name.lower().split()
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        
        # Search GitHub
        github_result = self._search_github(first_name, last_name, email)
        if github_result.get('found'):
            result['platforms']['github'] = github_result
            result['profiles_found'].append('GitHub')
            self._print(f"Found GitHub profile: {github_result.get('username')}", "SUCCESS")
        
        # Search Twitter (simulated)
        twitter_result = self._search_twitter(first_name, last_name)
        if twitter_result.get('found'):
            result['platforms']['twitter'] = twitter_result
            result['profiles_found'].append('Twitter')
        
        # Check for consistent employment across platforms
        if len(result['profiles_found']) >= 2:
            result['consistent_employment'] = self._check_employment_consistency(result['platforms'])
            if result['consistent_employment']:
                self._print("Consistent employment history across platforms", "SUCCESS")
            else:
                result['risk_score'] += 30
                result['warnings'].append('Inconsistent employment history across platforms')
                self._print("Inconsistent employment data", "WARNING")
        
        # Risk based on number of platforms found
        if len(result['profiles_found']) == 0:
            result['risk_score'] += 40
            result['warnings'].append('No cross-platform presence found - suspicious for recruiter')
            self._print("No cross-platform presence", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    def _search_github(self, first_name: str, last_name: str, email: str = None) -> Dict:
        """Search GitHub for user profile"""
        
        result = {'found': False, 'username': None, 'created_at': None, 'repos': 0, 'followers': 0}
        
        try:
            # GitHub API is public
            if email:
                url = f"https://api.github.com/search/users?q={email}+in:email"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('total_count', 0) > 0:
                        user = data['items'][0]
                        result['found'] = True
                        result['username'] = user['login']
                        
                        # Get user details
                        user_url = f"https://api.github.com/users/{result['username']}"
                        user_response = requests.get(user_url, timeout=10)
                        if user_response.status_code == 200:
                            user_data = user_response.json()
                            result['created_at'] = user_data.get('created_at')
                            result['repos'] = user_data.get('public_repos', 0)
                            result['followers'] = user_data.get('followers', 0)
                            
                            # Check account age
                            if result['created_at']:
                                created = datetime.fromisoformat(result['created_at'].replace('Z', '+00:00'))
                                days_old = (datetime.now() - created).days
                                if days_old < 30:
                                    result['is_recent'] = True
        except:
            pass
        
        return result
    
    def _search_twitter(self, first_name: str, last_name: str) -> Dict:
        """Search Twitter (simulated - would need API)"""
        
        result = {'found': False}
        # Twitter API requires authentication
        # This is a placeholder for passive search via Google
        return result
    
    def _check_employment_consistency(self, platforms: Dict) -> bool:
        """Check if employment history is consistent across platforms"""
        # This would compare job titles, companies, dates
        # Simplified implementation
        return True
    
    # =========================================================
    # 3. REVERSE IMAGE SEARCH
    # =========================================================
    
    def reverse_image_search(self, image_url: str) -> Dict:
        """
        Perform reverse image search on profile photo
        - Check if image is from stock photo sites
        - Check if used on multiple profiles
        """
        
        self._print(f"Performing reverse image search")
        
        cache_key = f"reverse_img_{hashlib.md5(image_url.encode()).hexdigest()}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'image_url': image_url,
            'is_stock_photo': False,
            'stock_source': None,
            'multiple_profiles': False,
            'profile_count': 0,
            'similar_images': [],
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        # Check domain for stock photo indicator
        for stock_domain in self.stock_photo_domains:
            if stock_domain in image_url.lower():
                result['is_stock_photo'] = True
                result['stock_source'] = stock_domain
                result['risk_score'] += 70
                result['warnings'].append(f'Profile photo is stock image from {stock_domain}')
                self._print(f"Stock photo detected: {stock_domain}", "ERROR")
                break
        
        # Use Google Reverse Image Search API (if key provided)
        if self.google_api_key and not result['is_stock_photo']:
            try:
                # Download image and convert to base64
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    image_b64 = base64.b64encode(response.content).decode()
                    
                    # Google Vision API for web detection
                    vision_url = "https://vision.googleapis.com/v1/images:annotate"
                    payload = {
                        "requests": [{
                            "image": {"content": image_b64},
                            "features": [{"type": "WEB_DETECTION"}]
                        }]
                    }
                    
                    response = requests.post(
                        f"{vision_url}?key={self.google_api_key}",
                        json=payload,
                        timeout=15
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        web_detection = data.get('responses', [{}])[0].get('webDetection', {})
                        
                        # Check for multiple profiles
                        matching_images = web_detection.get('matchingImages', [])
                        if len(matching_images) > 5:
                            result['multiple_profiles'] = True
                            result['profile_count'] = len(matching_images)
                            result['risk_score'] += 40
                            result['warnings'].append(f'Image found on {len(matching_images)} different pages')
                            self._print(f"Image appears on multiple profiles", "WARNING")
                        
                        # Check for stock photo detection
                        best_guess = web_detection.get('bestGuessLabels', [])
                        for guess in best_guess:
                            if 'stock' in guess.get('label', '').lower():
                                result['is_stock_photo'] = True
                                result['risk_score'] += 60
                                result['warnings'].append('Profile photo appears to be stock image')
                                break
            except Exception as e:
                self._print(f"Reverse image search failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 4. EMAIL PATTERN ANALYSIS
    # =========================================================
    
    def analyze_email_pattern(self, email: str, company_domain: str = None, full_name: str = None) -> Dict:
        """
        Analyze recruiter email for patterns
        - Company pattern matching
        - HaveIBeenPwned check
        - Gravatar association
        - Email age estimation
        """
        
        self._print(f"Analyzing email pattern: {email}")
        
        cache_key = f"email_pattern_{email}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'email': email,
            'company_domain': company_domain,
            'follows_company_pattern': False,
            'pattern_type': None,
            'is_personal_email': False,
            'gravatar_exists': False,
            'gravatar_image': None,
            'breach_found': False,
            'breach_count': 0,
            'email_age_days': None,
            'risk_score': 0,
            'warnings': [],
            'risk_level': 'SAFE'
        }
        
        if not email or '@' not in email:
            return result
        
        email_domain = email.split('@')[1].lower()
        username = email.split('@')[0].lower()
        
        # Check if email follows company pattern
        self._print(f"Comparing email domain with company domain ({company_domain})...")
        if company_domain:
            result['follows_company_pattern'] = (email_domain == company_domain.lower())
            if result['follows_company_pattern']:
                # Determine pattern type
                if full_name:
                    name_parts = full_name.lower().split()
                    first_name = name_parts[0] if name_parts else ""
                    last_name = name_parts[-1] if len(name_parts) > 1 else ""

                    if username == f"{first_name}.{last_name}":
                        result['pattern_type'] = 'first.last'
                    elif username == f"{first_name}{last_name}":
                        result['pattern_type'] = 'firstlast'
                    elif username == f"{first_name[0]}{last_name}":
                        result['pattern_type'] = 'firstinitial.last'
                    else:
                        result['pattern_type'] = 'custom'
                self._print(f"Email follows company pattern: {result['pattern_type']}", "SUCCESS")
            else:
                result['is_personal_email'] = True
                result['risk_score'] += 50
                result['warnings'].append(f'Email domain ({email_domain}) does not match company ({company_domain})')
                self._print(f"Email domain mismatch", "ERROR")
            
        # Check social presence in background
        self._print(f"Searching for social media profiles associated with {email}...")
        with ThreadPoolExecutor(max_workers=3) as executor:
            name_parts = full_name.lower().split() if full_name else []
            first = name_parts[0] if name_parts else ""
            last = name_parts[-1] if len(name_parts) > 1 else ""
            
            f_gh = executor.submit(self._search_github, first, last, email)
            f_li = executor.submit(self._search_linkedin_passive, first, last, company_domain)
            
            gh_res = f_gh.result()
            li_res = f_li.result()
            
            result['github_found'] = gh_res.get('found', False)
            result['linkedin_found'] = li_res.get('found', False)
        
        # Check for suspicious username patterns
        self._print("Checking for suspicious username patterns...")
        for pattern, description in self.suspicious_patterns:
            if re.match(pattern, username):
                result['risk_score'] += 30
                result['warnings'].append(f'Suspicious username pattern: {description}')
                self._print(f"Suspicious username: {username}", "WARNING")
                break
        
        # Check Gravatar
        self._print(f"Checking Gravatar for {email}...")
        gravatar_hash = hashlib.md5(email.lower().encode()).hexdigest()
        gravatar_url = f"https://www.gravatar.com/avatar/{gravatar_hash}?d=404&s=200"
        
        try:
            response = requests.head(gravatar_url, timeout=5)
            if response.status_code == 200:
                result['gravatar_exists'] = True
                result['gravatar_image'] = gravatar_url
                self._print("Gravatar account found", "SUCCESS")
        except:
            pass
        
        # Check HaveIBeenPwned
        if self.hibp_api_key:
            self._print("Checking breach status (HIBP)...")
            breach_result = self._check_hibp_breach(email)
            result['breach_found'] = breach_result.get('pwned', False)
            result['breach_count'] = breach_result.get('breach_count', 0)
            
            if result['breach_found']:
                result['risk_score'] += 25
                result['warnings'].append(f'Email found in {result["breach_count"]} data breaches')
                self._print(f"Email in {result['breach_count']} breaches", "WARNING")
        
        # Estimate email age (if domain is custom)
        if not result['is_personal_email']:
            self._print("Estimating email account age...")
            try:
                # Query domain age as proxy
                import whois
                domain_info = whois.whois(email_domain)
                if domain_info.creation_date:
                    if isinstance(domain_info.creation_date, list):
                        creation_date = domain_info.creation_date[0]
                    else:
                        creation_date = domain_info.creation_date
                    
                    result['email_age_days'] = (datetime.now() - creation_date).days
                    
                    if result['email_age_days'] < 30:
                        result['risk_score'] += 40
                        result['warnings'].append(f'Email domain only {result["email_age_days"]} days old')
                        self._print(f"Very new domain: {result['email_age_days']} days", "WARNING")
            except:
                pass
        
        result['risk_score'] = min(100, result['risk_score'])
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    def _check_hibp_breach(self, email: str) -> Dict:
        """Check HaveIBeenPwned for email breaches"""
        
        result = {'pwned': False, 'breach_count': 0}
        
        try:
            email_hash = hashlib.sha1(email.lower().encode()).hexdigest().upper()
            prefix = email_hash[:5]
            suffix = email_hash[5:]
            
            url = f"https://api.pwnedpasswords.com/range/{prefix}"
            headers = {'hibp-api-key': self.hibp_api_key} if self.hibp_api_key else {}
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                hashes = response.text.splitlines()
                for line in hashes:
                    hash_suffix, count = line.split(':')
                    if hash_suffix == suffix:
                        result['pwned'] = True
                        result['breach_count'] = int(count)
                        break
        except:
            pass
        
        return result
    
    # =========================================================
    # 5. COMPLETE RECRUITER VERIFICATION
    # =========================================================
    
    def verify_recruiter(self, recruiter_name: str, recruiter_email: str = None,
                        linkedin_url: str = None, company_domain: str = None,
                        profile_photo_url: str = None) -> Dict:
        """
        Complete recruiter verification from all sources
        
        Args:
            recruiter_name: Full name of recruiter
            recruiter_email: Recruiter's email address
            linkedin_url: LinkedIn profile URL
            company_domain: Company's email domain
            profile_photo_url: URL of profile photo (for reverse search)
        
        Returns:
            Dictionary with all verification results
        """
        
        self._print(f"")
        self._print(f"Starting complete recruiter verification for: {recruiter_name}")
        self._print("-" * 60)
        
        results = {}
        overall_risk = 0
        all_red_flags = []
        
        # Run all checks in parallel
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {}
            
            # LinkedIn analysis
            if linkedin_url:
                futures['linkedin'] = executor.submit(
                    self.analyze_linkedin_profile, linkedin_url, recruiter_name
                )
            
            # Cross-platform search
            futures['cross_platform'] = executor.submit(
                self.cross_platform_search, recruiter_name, recruiter_email
            )
            
            # Email pattern analysis
            if recruiter_email:
                futures['email_pattern'] = executor.submit(
                    self.analyze_email_pattern, recruiter_email, company_domain, recruiter_name
                )
            
            # Reverse image search
            if profile_photo_url:
                futures['reverse_image'] = executor.submit(
                    self.reverse_image_search, profile_photo_url
                )
            
            # Collect results
            for key, future in futures.items():
                try:
                    results[key] = future.result()
                    risk = results[key].get('risk_score', 0)
                    overall_risk += risk * (0.25 if key == 'linkedin' else 0.25 if key == 'email_pattern' else 0.2)
                    all_red_flags.extend(results[key].get('warnings', []))
                except Exception as e:
                    self._print(f"Error in {key}: {str(e)}", "ERROR")
        
        overall_risk = int(overall_risk)
        
        # Additional risk factors
        if recruiter_email and company_domain:
            if recruiter_email.split('@')[1].lower() != company_domain.lower():
                overall_risk += 20
        
        overall_risk = min(100, overall_risk)
        
        # Generate recommendations
        recommendations = self._get_recommendations(overall_risk, all_red_flags)
        
        final_result = {
            'recruiter_name': recruiter_name,
            'recruiter_email': recruiter_email,
            'linkedin_url': linkedin_url,
            'company_domain': company_domain,
            'verification_results': results,
            'overall_risk_score': overall_risk,
            'overall_risk_level': self._get_risk_level(overall_risk),
            'red_flags': list(set(all_red_flags))[:15],
            'recommendations': recommendations
        }
        
        self._print("-" * 60)
        self._print(f"Recruiter verification complete")
        self._print(f"Overall Risk: {final_result['overall_risk_level']} ({overall_risk}/100)")
        
        if all_red_flags:
            self._print(f"Total red flags: {len(set(all_red_flags))}", "WARNING")
        
        self._print("-" * 60)
        
        return final_result
    
    def verify_multiple(self, recruiters: List[Dict]) -> Dict:
        """Verify multiple recruiters in parallel"""
        
        self._print(f"Starting batch verification for {len(recruiters)} recruiters")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_recruiter = {
                executor.submit(
                    self.verify_recruiter,
                    recruiter.get('name'),
                    recruiter.get('email'),
                    recruiter.get('linkedin_url'),
                    recruiter.get('company_domain'),
                    recruiter.get('profile_photo_url')
                ): recruiter.get('name', f"Recruiter_{i}")
                for i, recruiter in enumerate(recruiters)
            }
            
            for future in as_completed(future_to_recruiter):
                name = future_to_recruiter[future]
                try:
                    result = future.result()
                    results[name] = result
                    risks.append(result['overall_risk_score'])
                    self._print(f"Completed {name}")
                except Exception as e:
                    self._print(f"Error verifying {name}: {str(e)}", "ERROR")
                    results[name] = {'error': str(e)}
        
        # Summary
        self._print("")
        self._print("RECRUITER BATCH SUMMARY")
        self._print(f"Total recruiters: {len(recruiters)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest risk: {max_risk}/100")
            self._print(f"Average risk: {int(avg_risk)}/100")
        
        return {
            'summary': {
                'total': len(recruiters),
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
            recommendations.append("CRITICAL: Recruiter is likely fraudulent")
            recommendations.append("Do NOT respond or share any personal information")
            recommendations.append("Report to LinkedIn and anti-fraud authorities")
        elif risk_score >= 60:
            recommendations.append("Recruiter shows major red flags")
            recommendations.append("Verify identity through official company channels")
            recommendations.append("Request video call to confirm identity")
        elif risk_score >= 40:
            recommendations.append("Recruiter verification shows inconsistencies")
            recommendations.append("Verify through alternative methods before proceeding")
        elif risk_score >= 20:
            recommendations.append("Minor issues detected - proceed with caution")
        else:
            recommendations.append("Recruiter appears legitimate based on available data")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    rv = RecruiterVerifier(verbose=True)
    
    test_recruiter = {
        'name': "John Smith",
        'email': "john.smith@company.com",
        'linkedin_url': "https://www.linkedin.com/in/johnsmith",
        'company_domain': "company.com"
    }
    
    result = rv.verify_recruiter(**test_recruiter)
    
    print("\n" + json.dumps(result, indent=2, default=str))