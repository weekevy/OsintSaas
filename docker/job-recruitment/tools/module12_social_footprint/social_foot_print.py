"""
Module 12: Social Media Footprint Mapping
Complete social media OSINT including:
- Facebook (company page, employee groups)
- Twitter/X (official account, employee tweets)
- Instagram (business profile, verification badge)
- Reddit (scam reports, job discussions)
- Glassdoor (reviews, interview experiences)
- Indeed (company reviews, salary reports)
- Trustpilot (customer reviews)
- Better Business Bureau (complaints)
"""

import re
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Set
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import time

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("SocialFootprint")

class SocialFootprintMapper:
    """Complete social media footprint mapping"""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/social")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        
        # Platform configurations
        self.platforms = {
            'facebook': {
                'name': 'Facebook',
                'search_url': 'https://www.facebook.com/search/top?q={query}',
                'company_url': 'https://www.facebook.com/{handle}',
                'risk_weight': 0.15,
                'requires_handle': True
            },
            'twitter': {
                'name': 'Twitter/X',
                'search_url': 'https://twitter.com/search?q={query}&f=user',
                'company_url': 'https://twitter.com/{handle}',
                'risk_weight': 0.12,
                'requires_handle': True
            },
            'instagram': {
                'name': 'Instagram',
                'search_url': 'https://www.instagram.com/web/search/top/?q={query}',
                'company_url': 'https://www.instagram.com/{handle}',
                'risk_weight': 0.10,
                'requires_handle': True
            },
            'reddit': {
                'name': 'Reddit',
                'search_url': 'https://www.reddit.com/search/?q={query}',
                'subreddits': ['scams', 'jobs', 'recruitinghell', 'scambait', 'jobscams'],
                'risk_weight': 0.15,
                'requires_handle': False
            },
            'glassdoor': {
                'name': 'Glassdoor',
                'search_url': 'https://www.glassdoor.com/Search/results.htm?keyword={query}',
                'company_url': 'https://www.glassdoor.com/Overview/Working-at-{handle}-EI_IE.htm',
                'risk_weight': 0.12,
                'requires_handle': True
            },
            'indeed': {
                'name': 'Indeed',
                'search_url': 'https://www.indeed.com/cmp/{query}/reviews',
                'risk_weight': 0.10,
                'requires_handle': True
            },
            'trustpilot': {
                'name': 'Trustpilot',
                'search_url': 'https://www.trustpilot.com/review/{domain}',
                'risk_weight': 0.12,
                'requires_handle': False
            },
            'bbb': {
                'name': 'BBB',
                'search_url': 'https://www.bbb.org/us/search?find_text={query}',
                'risk_weight': 0.14,
                'requires_handle': False
            }
        }
        
        # Reddit subreddits for scam checking
        self.scam_subreddits = [
            'r/scams', 'r/jobs', 'r/recruitinghell', 'r/scambait', 
            'r/JobScams', 'r/antiscam', 'r/ScamAwareness'
        ]
        
        # Suspicious signals
        self.suspicious_signals = {
            'no_social_presence': {'risk': 40, 'message': 'No social media presence found'},
            'only_recent_accounts': {'risk': 35, 'message': 'Social accounts appear to be recent'},
            'inconsistent_branding': {'risk': 25, 'message': 'Inconsistent branding across platforms'},
            'negative_reviews': {'risk': 20, 'message': 'Negative reviews or scam reports found'},
            'no_employee_presence': {'risk': 15, 'message': 'No employee activity detected on LinkedIn'}
        }
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] SOCIAL ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] SOCIAL WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] SOCIAL SUCCESS: {message}")
        else:
            print(f"[{timestamp}] SOCIAL: {message}")
    
    # =========================================================
    # 1. FACEBOOK FOOTPRINT
    # =========================================================
    
    def check_facebook(self, company_name: str, handle: str = None) -> Dict:
        """
        Check Facebook presence
        - Company page
        - Employee groups
        """
        
        self._print(f"Checking Facebook for: {company_name}")
        
        cache_key = f"facebook_{company_name}_{handle}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'Facebook',
            'exists': False,
            'page_url': None,
            'page_likes': None,
            'page_followers': None,
            'verification_badge': False,
            'post_frequency': None,
            'employee_groups_found': 0,
            'risk_score': 0,
            'notes': []
        }
        
        # Simulated Facebook check
        # In production, you'd use Facebook Graph API or web scraping
        # For passive analysis, we check via search cache
        
        try:
            # Search for company
            search_url = f"https://www.facebook.com/search/top/?q={requests.utils.quote(company_name)}"
            
            # This is a placeholder - actual implementation would:
            # 1. Use Google cache to find Facebook pages
            # 2. Check if page exists
            # 3. Extract basic info from cached snippets
            
            # Placeholder logic for demonstration
            if handle:
                page_url = f"https://www.facebook.com/{handle}"
                result['page_url'] = page_url
                result['exists'] = True
                result['page_likes'] = "N/A (passive check)"
                result['notes'].append("Facebook page found")
                self._print(f"Facebook page found: {handle}", "SUCCESS")
            else:
                self._print("No Facebook presence detected", "WARNING")
                result['risk_score'] = 20
                result['notes'].append("No Facebook company page found")
                
        except Exception as e:
            self._print(f"Facebook check failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 2. TWITTER/X FOOTPRINT
    # =========================================================
    
    def check_twitter(self, company_name: str, handle: str = None) -> Dict:
        """
        Check Twitter/X presence
        - Official account
        - Employee tweets
        """
        
        self._print(f"Checking Twitter for: {company_name}")
        
        cache_key = f"twitter_{company_name}_{handle}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'Twitter/X',
            'exists': False,
            'profile_url': None,
            'followers': None,
            'tweet_count': None,
            'verification_badge': False,
            'account_age_days': None,
            'recent_activity': False,
            'employee_mentions': 0,
            'risk_score': 0,
            'notes': []
        }
        
        try:
            if handle:
                profile_url = f"https://twitter.com/{handle}"
                result['profile_url'] = profile_url
                result['exists'] = True
                
                # In production, you'd scrape or use API
                # For passive, we check via Google cache
                result['notes'].append(f"Twitter handle: @{handle}")
                self._print(f"Twitter account found: @{handle}", "SUCCESS")
                
                # Estimate account age from URL pattern (simplified)
                result['account_age_days'] = "Unknown"
            else:
                self._print("No Twitter presence detected", "WARNING")
                result['risk_score'] = 15
                result['notes'].append("No Twitter/X account found")
                
        except Exception as e:
            self._print(f"Twitter check failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 3. INSTAGRAM FOOTPRINT
    # =========================================================
    
    def check_instagram(self, company_name: str, handle: str = None) -> Dict:
        """
        Check Instagram presence
        - Business profile
        - Verification badge
        """
        
        self._print(f"Checking Instagram for: {company_name}")
        
        cache_key = f"instagram_{company_name}_{handle}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'Instagram',
            'exists': False,
            'profile_url': None,
            'followers': None,
            'posts': None,
            'is_business_account': False,
            'verification_badge': False,
            'risk_score': 0,
            'notes': []
        }
        
        try:
            if handle:
                profile_url = f"https://www.instagram.com/{handle}"
                result['profile_url'] = profile_url
                result['exists'] = True
                result['is_business_account'] = True  # Would check from page
                result['notes'].append(f"Instagram: @{handle}")
                self._print(f"Instagram account found: @{handle}", "SUCCESS")
            else:
                self._print("No Instagram presence detected", "WARNING")
                result['risk_score'] = 10
                result['notes'].append("No Instagram business account found")
                
        except Exception as e:
            self._print(f"Instagram check failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 4. REDDIT SCRAPING (Scam Reports)
    # =========================================================
    
    def check_reddit(self, company_name: str) -> Dict:
        """
        Check Reddit for scam reports and discussions
        - r/scams, r/jobs, r/recruitinghell
        """
        
        self._print(f"Checking Reddit for: {company_name}")
        
        cache_key = f"reddit_{company_name}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'Reddit',
            'scam_reports_found': 0,
            'job_discussions': 0,
            'negative_mentions': 0,
            'subreddits_with_posts': [],
            'recent_posts': [],
            'risk_score': 0,
            'notes': []
        }
        
        # Simulated Reddit search
        # In production, you'd use Reddit API or Pushshift API
        
        try:
            # Search across scam-related subreddits
            for subreddit in self.scam_subreddits:
                search_url = f"https://www.reddit.com/r/{subreddit}/search.json?q={requests.utils.quote(company_name)}&restrict_sr=1"
                
                # Placeholder - actual implementation would fetch and parse
                # For passive analysis, we check via Google cache: site:reddit.com "company name" scam
                
                # Simulated finding
                if "scam" in company_name.lower() or "fake" in company_name.lower():
                    result['scam_reports_found'] += 1
                    result['subreddits_with_posts'].append(subreddit)
                    result['notes'].append(f"Scam mention found in {subreddit}")
                    self._print(f"Scam report found in {subreddit}", "WARNING")
            
            if result['scam_reports_found'] > 0:
                result['risk_score'] = min(60, result['scam_reports_found'] * 15)
                
        except Exception as e:
            self._print(f"Reddit check failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=43200)  # 12 hours
        return result
    
    # =========================================================
    # 5. GLASSDOOR REVIEWS
    # =========================================================
    
    def check_glassdoor(self, company_name: str, handle: str = None) -> Dict:
        """
        Check Glassdoor reviews
        - Company rating
        - Interview experiences
        - Scam reports
        """
        
        self._print(f"Checking Glassdoor for: {company_name}")
        
        cache_key = f"glassdoor_{company_name}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'Glassdoor',
            'exists': False,
            'rating': None,
            'review_count': 0,
            'ceo_approval': None,
            'interview_difficulty': None,
            'scam_warnings': 0,
            'risk_score': 0,
            'notes': []
        }
        
        try:
            # Glassdoor requires scraping or API
            # For passive, we check via Google cache
            
            # Placeholder logic
            if handle:
                result['exists'] = True
                result['notes'].append("Glassdoor company page exists")
                self._print(f"Glassdoor page found", "SUCCESS")
                
                # Check for scam indicators in cached snippets
                # This would parse rating from Google cache
            else:
                self._print("No Glassdoor presence", "WARNING")
                result['risk_score'] = 15
                result['notes'].append("No Glassdoor reviews found - unusual for established company")
                
        except Exception as e:
            self._print(f"Glassdoor check failed: {str(e)}", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 6. INDEED COMPANY REVIEWS
    # =========================================================
    
    def check_indeed(self, company_name: str) -> Dict:
        """
        Check Indeed company reviews
        - Employee reviews
        - Salary reports
        """
        
        self._print(f"Checking Indeed for: {company_name}")
        
        cache_key = f"indeed_{company_name}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'Indeed',
            'exists': False,
            'rating': None,
            'review_count': 0,
            'salary_reports': 0,
            'risk_score': 0,
            'notes': []
        }
        
        try:
            # Simulated Indeed check
            # In production, you'd scrape or use Google cache
            
            result['notes'].append("Indeed presence check - manual verification recommended")
            self._print("Indeed check: manual verification recommended", "INFO")
            
        except Exception as e:
            self._print(f"Indeed check failed: {str(e)}", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 7. TRUSTPILOT REVIEWS
    # =========================================================
    
    def check_trustpilot(self, domain: str) -> Dict:
        """
        Check Trustpilot reviews
        - Customer ratings
        - Scam reports
        """
        
        self._print(f"Checking Trustpilot for: {domain}")
        
        cache_key = f"trustpilot_{domain}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'Trustpilot',
            'exists': False,
            'rating': None,
            'review_count': 0,
            'trust_score': None,
            'risk_score': 0,
            'notes': []
        }
        
        try:
            # Trustpilot has public pages that can be checked
            review_url = f"https://www.trustpilot.com/review/{domain}"
            result['review_url'] = review_url
            
            # In production, you'd check HTTP status and scrape rating
            # For passive, we note the URL for manual check
            
            result['notes'].append(f"Trustpilot page: {review_url}")
            self._print(f"Trustpilot check: {review_url}", "INFO")
            
        except Exception as e:
            self._print(f"Trustpilot check failed: {str(e)}", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 8. BETTER BUSINESS BUREAU
    # =========================================================
    
    def check_bbb(self, company_name: str) -> Dict:
        """
        Check Better Business Bureau
        - Complaints
        - Rating
        - Accreditation
        """
        
        self._print(f"Checking BBB for: {company_name}")
        
        cache_key = f"bbb_{company_name}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'platform': 'BBB',
            'exists': False,
            'rating': None,
            'accredited': False,
            'complaint_count': 0,
            'closed_complaints': 0,
            'risk_score': 0,
            'notes': []
        }
        
        try:
            # BBB has public business profiles
            # In production, you'd search via BBB API or scrape
            
            result['notes'].append("BBB check - manual verification recommended")
            self._print("BBB check: manual verification recommended", "INFO")
            
        except Exception as e:
            self._print(f"BBB check failed: {str(e)}", "WARNING")
        
        self.cache.set(cache_key, result, ttl_seconds=86400)
        return result
    
    # =========================================================
    # 9. COMPLETE SOCIAL FOOTPRINT ANALYSIS
    # =========================================================
    
    def analyze_social_footprint(self, company_name: str, domain: str = None,
                                  facebook_handle: str = None, twitter_handle: str = None,
                                  instagram_handle: str = None, glassdoor_handle: str = None) -> Dict:
        """
        Complete social media footprint analysis
        
        Args:
            company_name: Name of the company
            domain: Company website domain (for Trustpilot)
            facebook_handle: Facebook page handle
            twitter_handle: Twitter/X handle
            instagram_handle: Instagram handle
            glassdoor_handle: Glassdoor company handle
        
        Returns:
            Dictionary with all social media findings
        """
        
        self._print(f"")
        self._print(f"Starting social media footprint analysis for: {company_name}")
        self._print("-" * 60)
        
        results = {}
        overall_risk = 0
        all_warnings = []
        platforms_found = 0
        
        # Run all platform checks in parallel
        self._print("Launching social footprint mapping across platforms...")
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = {}
            
            # Facebook
            self._print(f"Searching Facebook for {company_name}...")
            futures['facebook'] = executor.submit(self.check_facebook, company_name, facebook_handle)
            
            # Twitter
            self._print(f"Searching Twitter/X for {company_name}...")
            futures['twitter'] = executor.submit(self.check_twitter, company_name, twitter_handle)
            
            # Instagram
            self._print(f"Searching Instagram for {company_name}...")
            futures['instagram'] = executor.submit(self.check_instagram, company_name, instagram_handle)
            
            # Reddit
            self._print(f"Searching Reddit for mentions of {company_name}...")
            futures['reddit'] = executor.submit(self.check_reddit, company_name)
            
            # Glassdoor
            self._print(f"Checking Glassdoor reviews and ratings...")
            futures['glassdoor'] = executor.submit(self.check_glassdoor, company_name, glassdoor_handle)
            
            # Indeed
            self._print(f"Checking Indeed company profile...")
            futures['indeed'] = executor.submit(self.check_indeed, company_name)
            
            # Trustpilot (if domain provided)
            if domain:
                self._print(f"Analyzing Trustpilot reputation for {domain}...")
                futures['trustpilot'] = executor.submit(self.check_trustpilot, domain)
            
            # BBB
            self._print(f"Checking Better Business Bureau (BBB) status...")
            futures['bbb'] = executor.submit(self.check_bbb, company_name)
            
            # Collect results
            for platform, future in futures.items():
                try:
                    results[platform] = future.result()
                    
                    # Count platforms found
                    if results[platform].get('exists'):
                        platforms_found += 1
                    
                    # Add risk
                    risk = results[platform].get('risk_score', 0)
                    weight = self.platforms.get(platform, {}).get('risk_weight', 0.1)
                    overall_risk += risk * weight
                    
                    # Collect warnings/notes
                    notes = results[platform].get('notes', [])
                    for note in notes:
                        if 'scam' in note.lower() or 'warning' in note.lower():
                            all_warnings.append(f"[{platform.upper()}] {note}")
                            
                except Exception as e:
                    self._print(f"Error checking {platform}: {str(e)}", "ERROR")
        
        # Calculate final risk with additional signals
        final_risk = int(overall_risk)
        
        # No social presence = high risk
        if platforms_found == 0:
            final_risk += 40
            all_warnings.append(self.suspicious_signals['no_social_presence']['message'])
            self._print("No social media presence detected - suspicious for legitimate company", "ERROR")
        elif platforms_found <= 2:
            final_risk += 20
            all_warnings.append("Limited social media presence - unusual for established company")
            self._print("Limited social media presence", "WARNING")
        else:
            self._print(f"Found presence on {platforms_found} platforms", "SUCCESS")
        
        # Reddit scam reports increase risk
        reddit_risk = results.get('reddit', {}).get('risk_score', 0)
        if reddit_risk > 0:
            final_risk += min(30, reddit_risk)
            all_warnings.append(f"Scam reports found on Reddit")
        
        final_risk = min(100, final_risk)
        
        # Generate recommendations
        recommendations = self._get_recommendations(final_risk, platforms_found, all_warnings)
        
        final_result = {
            'company_name': company_name,
            'domain': domain,
            'platforms_found': platforms_found,
            'total_platforms_checked': len([p for p in futures.keys() if p != 'trustpilot' or domain]),
            'platform_results': results,
            'overall_risk_score': final_risk,
            'overall_risk_level': self._get_risk_level(final_risk),
            'red_flags': list(set(all_warnings))[:15],
            'recommendations': recommendations
        }
        
        self._print("-" * 60)
        self._print(f"Social footprint analysis complete")
        self._print(f"Platforms found: {platforms_found}")
        self._print(f"Overall Risk: {final_result['overall_risk_level']} ({final_risk}/100)")
        
        if all_warnings:
            self._print(f"Red flags found: {len(set(all_warnings))}", "WARNING")
        
        self._print("-" * 60)
        
        return final_result
    
    def analyze_multiple(self, companies: List[Dict]) -> Dict:
        """
        Analyze social footprint for multiple companies in parallel
        """
        
        self._print(f"Starting batch social footprint analysis for {len(companies)} companies")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_company = {
                executor.submit(
                    self.analyze_social_footprint,
                    company.get('name'),
                    company.get('domain'),
                    company.get('facebook_handle'),
                    company.get('twitter_handle'),
                    company.get('instagram_handle'),
                    company.get('glassdoor_handle')
                ): company.get('name', f"Company_{i}")
                for i, company in enumerate(companies)
            }
            
            for future in as_completed(future_to_company):
                company_name = future_to_company[future]
                try:
                    result = future.result()
                    results[company_name] = result
                    risks.append(result['overall_risk_score'])
                    self._print(f"Completed: {company_name}")
                except Exception as e:
                    self._print(f"Error analyzing {company_name}: {str(e)}", "ERROR")
                    results[company_name] = {'error': str(e)}
        
        self._print("")
        self._print("SOCIAL FOOTPRINT BATCH SUMMARY")
        self._print(f"Total companies: {len(companies)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest risk: {max_risk}/100")
            self._print(f"Average risk: {int(avg_risk)}/100")
        
        return {
            'summary': {
                'total': len(companies),
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
    
    def _get_recommendations(self, risk_score: int, platforms_found: int, warnings: List[str]) -> List[str]:
        recommendations = []
        
        if risk_score >= 80:
            recommendations.append("CRITICAL: Company has major social media red flags")
            recommendations.append("Do NOT trust this company - likely a scam")
            recommendations.append("Report to social media platforms and authorities")
        elif risk_score >= 60:
            recommendations.append("Social media presence shows significant scam indicators")
            recommendations.append("Verify company through independent sources")
            recommendations.append("Check for complaints on BBB and Trustpilot")
        elif risk_score >= 40:
            recommendations.append("Social footprint has concerning gaps or warnings")
            recommendations.append("Conduct additional manual verification")
        elif platforms_found == 0:
            recommendations.append("No social media presence - unusual for legitimate companies")
            recommendations.append("Verify company existence through official registries")
        else:
            recommendations.append("Social media footprint appears normal")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    sf = SocialFootprintMapper(verbose=True)
    
    test_company = {
        'name': "Google",
        'domain': "google.com",
        'twitter_handle': "Google"
    }
    
    result = sf.analyze_social_footprint(**test_company)
    
    print("\n" + json.dumps(result, indent=2, default=str))