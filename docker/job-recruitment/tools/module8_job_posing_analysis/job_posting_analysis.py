"""
Module 8: Job Posting NLP & Pattern Analysis
Complete job posting analysis including:
- Feature extraction (readability, sentiment, urgency, money terms, personal info requests)
- Generic job title detection
- Salary anomaly detection
- Template fingerprinting (simhash, TF-IDF, phrase extraction)
- Language inconsistency detection
"""

import re
import json
import hashlib
import requests
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Set
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import math
from collections import Counter
from urllib.parse import urlparse

# Try to import NLP libraries (with fallbacks)
try:
    from textstat import flesch_kincaid_grade, flesch_reading_ease
    HAS_TEXTSTAT = True
except ImportError:
    HAS_TEXTSTAT = False
    print("Warning: textstat not installed. Readability scores will be limited.")

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    HAS_VADER = True
except ImportError:
    HAS_VADER = False
    print("Warning: vaderSentiment not installed. Sentiment analysis will be limited.")

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("JobAnalyzer")

class JobAnalyzer:
    """Complete job posting analysis with NLP and template fingerprinting"""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/job_analysis")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        
        # Initialize sentiment analyzer if available
        if HAS_VADER:
            self.sentiment_analyzer = SentimentIntensityAnalyzer()
        
        # Urgency keywords
        self.urgency_keywords = {
            'immediately': 10, 'immediate': 10, 'asap': 10, 'urgent': 10,
            'today': 8, 'now': 8, 'right away': 8, 'quickly': 6,
            'fast': 5, 'soon': 5, 'start now': 10, 'hiring now': 8,
            'immediate start': 10, 'immediate hire': 10, 'need now': 8
        }
        
        # Money-related keywords (scam indicators)
        self.money_keywords = {
            'fee': 15, 'deposit': 15, 'processing fee': 20, 'background check fee': 20,
            'training fee': 20, 'application fee': 15, 'registration fee': 15,
            'bitcoin': 25, 'crypto': 25, 'ethereum': 25, 'usdt': 25,
            'wire transfer': 20, 'western union': 25, 'moneygram': 25,
            'paypal': 10, 'gift card': 20, 'itunes card': 20, 'google play card': 20,
            'refundable': 10, 'security deposit': 20, 'equipment fee': 15
        }
        
        # Personal info requests (identity theft indicators)
        self.personal_info_keywords = {
            'ssn': 25, 'social security': 25, 'national insurance': 20,
            'passport': 20, 'driver license': 15, 'drivers license': 15,
            'bank account': 25, 'bank account number': 25, 'routing number': 20,
            'credit card': 20, 'debit card': 20, 'cvv': 25,
            'mother maiden name': 15, 'date of birth': 10, 'dob': 10,
            'tax id': 15, 'ein': 15, 'tin': 15
        }
        
        # High-risk generic job titles
        self.generic_titles = {
            'virtual assistant': 30, 'data entry': 25, 'customer service': 15,
            'admin assistant': 15, 'administrative assistant': 15,
            'warehouse associate': 10, 'package handler': 10,
            'mystery shopper': 40, 'secret shopper': 40, 'reshipping': 50,
            'package forwarding': 50, 'envelope stuffing': 45,
            'work from home': 20, 'remote worker': 15, 'online worker': 15,
            'freelance writer': 10, 'transcriptionist': 10
        }
        
        # Known scam phrases (high confidence)
        self.scam_phrases = {
            'no experience needed': 10, 'no experience required': 10,
            'earn up to': 15, 'make money fast': 20,
            'unlimited earning potential': 20, 'get paid daily': 15,
            'start today': 8, 'immediate opening': 8,
            'urgent hiring': 10, 'apply now': 5
        }
        
        # Known scam templates (simhash database)
        self.scam_template_hashes = {}  # Would be loaded from database
        
        # Common words to ignore in fingerprinting
        self.stop_words = {
            'a', 'an', 'and', 'the', 'of', 'to', 'for', 'in', 'on', 'at',
            'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
            'but', 'or', 'so', 'for', 'nor', 'yet', 'not', 'only'
        }
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] JOB ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] JOB WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] JOB SUCCESS: {message}")
        else:
            print(f"[{timestamp}] JOB: {message}")
    
    # =========================================================
    # 1. FETCH JOB POSTING (Passive)
    # =========================================================
    
    def fetch_job_posting(self, url: str) -> Dict:
        """
        Fetch job posting content from URL (passive, respectful user-agent)
        
        Args:
            url: Job posting URL
        
        Returns:
            Dictionary with content and metadata
        """
        
        self._print(f"Fetching job posting: {url}")
        
        cache_key = f"job_content_{hashlib.md5(url.encode()).hexdigest()}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        result = {
            'url': url,
            'title': None,
            'description': None,
            'salary': None,
            'company': None,
            'location': None,
            'fetch_success': False,
            'error': None
        }
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                result['fetch_success'] = True
                content = response.text
                
                # Try to extract job description using common patterns
                # This is simplified - in production you'd use a proper parser
                
                # Look for job description in common containers
                desc_patterns = [
                    r'<div[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)</div>',
                    r'<div[^>]*id="[^"]*description[^"]*"[^>]*>(.*?)</div>',
                    r'<section[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)</section>',
                    r'<meta[^>]*name="description"[^>]*content="([^"]+)"'
                ]
                
                for pattern in desc_patterns:
                    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
                    if match:
                        # Clean HTML tags
                        clean_text = re.sub(r'<[^>]+>', ' ', match.group(1))
                        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                        result['description'] = clean_text
                        break
                
                # Extract title
                title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE)
                if title_match:
                    result['title'] = title_match.group(1).strip()
                
                # Extract salary (common patterns)
                salary_patterns = [
                    r'\$[\d,]+(?:\s*-\s*\$?[\d,]+)?(?:\s*(?:per|an?|p\.?a\.?|year|hour|hr|month|week))?',
                    r'(?:salary|pay|compensation)[:\s]*\$?[\d,]+'
                ]
                
                for pattern in salary_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    if matches:
                        result['salary'] = matches[0]
                        break
                
                self._print(f"Successfully fetched job posting", "SUCCESS")
                
            else:
                result['error'] = f"HTTP {response.status_code}"
                self._print(f"Failed to fetch: HTTP {response.status_code}", "ERROR")
                
        except Exception as e:
            result['error'] = str(e)
            self._print(f"Fetch error: {str(e)}", "ERROR")
        
        self.cache.set(cache_key, result, ttl_seconds=3600)  # 1 hour
        return result
    
    # =========================================================
    # 2. READABILITY SCORE (Flesch-Kincaid)
    # =========================================================
    
    def calculate_readability(self, text: str) -> Dict:
        """
        Calculate readability scores
        - Flesch-Kincaid Grade Level
        - Flesch Reading Ease
        - Scams often too simple or gibberish
        """
        
        if not text or len(text) < 100:
            return {'score': 0, 'grade_level': 0, 'risk_score': 0, 'warning': None}
        
        result = {
            'flesch_reading_ease': None,
            'flesch_kincaid_grade': None,
            'readability_level': 'Unknown',
            'risk_score': 0,
            'warning': None
        }
        
        if HAS_TEXTSTAT:
            try:
                result['flesch_reading_ease'] = flesch_reading_ease(text)
                result['flesch_kincaid_grade'] = flesch_kincaid_grade(text)
                
                # Interpret scores
                if result['flesch_reading_ease'] > 80:
                    result['readability_level'] = 'Very Easy'
                elif result['flesch_reading_ease'] > 60:
                    result['readability_level'] = 'Easy'
                elif result['flesch_reading_ease'] > 40:
                    result['readability_level'] = 'Moderate'
                elif result['flesch_reading_ease'] > 20:
                    result['readability_level'] = 'Difficult'
                else:
                    result['readability_level'] = 'Very Difficult'
                
                # Risk assessment: Very Easy is suspicious for professional jobs
                if result['readability_level'] == 'Very Easy' and result['flesch_kincaid_grade'] < 6:
                    result['risk_score'] = 30
                    result['warning'] = 'Job description is very simple (grade school level) - unusual for professional roles'
                    self._print("Very low readability - suspicious", "WARNING")
                
                # Gibberish detection (very long words or no spaces)
                words = text.split()
                avg_word_len = sum(len(w) for w in words) / len(words) if words else 0
                if avg_word_len > 12:
                    result['risk_score'] += 40
                    result['warning'] = 'Unusually long words - possible gibberish'
                    self._print("Gibberish pattern detected", "WARNING")
                    
            except Exception as e:
                self._print(f"Readability calculation failed: {str(e)}", "WARNING")
        else:
            # Fallback: simple word/sentence counting
            sentences = re.split(r'[.!?]+', text)
            words = text.split()
            if words and sentences:
                avg_words_per_sentence = len(words) / len(sentences)
                if avg_words_per_sentence < 8:
                    result['risk_score'] = 20
                    result['warning'] = 'Very short sentences - possibly simplistic content'
        
        return result
    
    # =========================================================
    # 3. SENTIMENT ANALYSIS
    # =========================================================
    
    def analyze_sentiment(self, text: str) -> Dict:
        """
        Analyze sentiment of job posting
        - Overly positive = suspicious
        - Use VADER sentiment analyzer
        """
        
        result = {
            'positive_score': 0,
            'negative_score': 0,
            'neutral_score': 0,
            'compound_score': 0,
            'sentiment': 'Neutral',
            'risk_score': 0,
            'warning': None
        }
        
        if HAS_VADER and text:
            try:
                scores = self.sentiment_analyzer.polarity_scores(text)
                result['positive_score'] = scores['pos']
                result['negative_score'] = scores['neg']
                result['neutral_score'] = scores['neu']
                result['compound_score'] = scores['compound']
                
                if scores['compound'] >= 0.5:
                    result['sentiment'] = 'Very Positive'
                    result['risk_score'] = 30
                    result['warning'] = 'Excessively positive language - common in scam postings'
                    self._print("Excessively positive sentiment detected", "WARNING")
                elif scores['compound'] >= 0.2:
                    result['sentiment'] = 'Positive'
                elif scores['compound'] <= -0.2:
                    result['sentiment'] = 'Negative'
                else:
                    result['sentiment'] = 'Neutral'
                    
            except Exception as e:
                self._print(f"Sentiment analysis failed: {str(e)}", "WARNING")
        
        return result
    
    # =========================================================
    # 4. KEYWORD ANALYSIS (Urgency, Money, Personal Info)
    # =========================================================
    
    def analyze_keywords(self, text: str) -> Dict:
        """
        Analyze text for various keyword categories
        - Urgency words
        - Money-related terms
        - Personal info requests
        """
        
        text_lower = text.lower()
        
        result = {
            'urgency': {
                'keywords_found': [],
                'count': 0,
                'total_score': 0
            },
            'money': {
                'keywords_found': [],
                'count': 0,
                'total_score': 0
            },
            'personal_info': {
                'keywords_found': [],
                'count': 0,
                'total_score': 0
            },
            'risk_score': 0,
            'warnings': []
        }
        
        # Check urgency keywords
        for keyword, score in self.urgency_keywords.items():
            if keyword in text_lower:
                count = text_lower.count(keyword)
                result['urgency']['keywords_found'].append(keyword)
                result['urgency']['count'] += count
                result['urgency']['total_score'] += score * count
        
        # Check money keywords
        for keyword, score in self.money_keywords.items():
            if keyword in text_lower:
                count = text_lower.count(keyword)
                result['money']['keywords_found'].append(keyword)
                result['money']['count'] += count
                result['money']['total_score'] += score * count
        
        # Check personal info keywords
        for keyword, score in self.personal_info_keywords.items():
            if keyword in text_lower:
                count = text_lower.count(keyword)
                result['personal_info']['keywords_found'].append(keyword)
                result['personal_info']['count'] += count
                result['personal_info']['total_score'] += score * count
        
        # Calculate risk
        if result['urgency']['total_score'] > 20:
            result['risk_score'] += 20
            result['warnings'].append(f"High urgency language detected ({result['urgency']['count']} instances)")
            self._print(f"Urgent language detected", "WARNING")
        
        if result['money']['total_score'] > 10:
            result['risk_score'] += 40
            result['warnings'].append(f"Money requests detected - potential payment scam")
            self._print(f"Money-related keywords detected", "ERROR")
        
        if result['personal_info']['total_score'] > 5:
            result['risk_score'] += 50
            result['warnings'].append(f"Personal information requested - identity theft risk")
            self._print(f"Personal info requests detected", "ERROR")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 5. GENERIC JOB TITLE DETECTION
    # =========================================================
    
    def detect_generic_title(self, title: str, description: str) -> Dict:
        """
        Detect generic or high-risk job titles
        - Virtual Assistant, Data Entry (high risk)
        """
        
        result = {
            'title': title,
            'is_generic': False,
            'matched_title': None,
            'risk_score': 0,
            'warning': None
        }
        
        if not title:
            return result
        
        title_lower = title.lower()
        
        for generic_title, risk in self.generic_titles.items():
            if generic_title in title_lower:
                result['is_generic'] = True
                result['matched_title'] = generic_title
                result['risk_score'] = risk
                result['warning'] = f"Generic/high-risk job title: '{generic_title}'"
                self._print(f"Generic job title detected: {generic_title}", "WARNING")
                break
        
        # Also check description for generic roles
        if description and not result['is_generic']:
            desc_lower = description.lower()
            for generic_title, risk in self.generic_titles.items():
                if generic_title in desc_lower and risk > 20:
                    result['is_generic'] = True
                    result['matched_title'] = generic_title
                    result['risk_score'] = risk // 2
                    result['warning'] = f"Job description mentions generic role: '{generic_title}'"
                    break
        
        return result
    
    # =========================================================
    # 6. SALARY ANOMALY DETECTION
    # =========================================================
    
    def detect_salary_anomaly(self, salary_text: str, job_title: str = None) -> Dict:
        """
        Detect unrealistic or suspicious salary offers
        - Hourly rate > $100 for entry level = unrealistic
        - Extremely high salary for simple jobs
        """
        
        result = {
            'salary_text': salary_text,
            'parsed_amount': None,
            'period': None,
            'is_unrealistic': False,
            'risk_score': 0,
            'warning': None
        }
        
        if not salary_text:
            return result
        
        # Extract numbers
        numbers = re.findall(r'\$?([\d,]+(?:\.\d+)?)', salary_text)
        if not numbers:
            return result
        
        amounts = [float(n.replace(',', '')) for n in numbers]
        max_amount = max(amounts) if amounts else 0
        
        # Determine period
        period = 'unknown'
        if 'hour' in salary_text.lower() or 'hr' in salary_text.lower() or '/h' in salary_text.lower():
            period = 'hourly'
        elif 'year' in salary_text.lower() or 'annually' in salary_text.lower() or '/y' in salary_text.lower():
            period = 'yearly'
        elif 'month' in salary_text.lower() or '/m' in salary_text.lower():
            period = 'monthly'
        elif 'week' in salary_text.lower() or '/w' in salary_text.lower():
            period = 'weekly'
        
        result['parsed_amount'] = max_amount
        result['period'] = period
        
        # Risk assessment
        if period == 'hourly' and max_amount > 100:
            result['is_unrealistic'] = True
            result['risk_score'] = 40
            result['warning'] = f"Unrealistic hourly rate: ${max_amount}/hour"
            self._print(f"Unrealistic hourly rate detected", "ERROR")
        elif period == 'hourly' and max_amount > 50:
            result['risk_score'] = 20
            self._print(f"Suspiciously high hourly rate: ${max_amount}/hour", "WARNING")
        
        if period == 'yearly' and max_amount > 200000:
            result['is_unrealistic'] = True
            result['risk_score'] = 30
            result['warning'] = f"Unrealistic annual salary: ${max_amount:,.0f}"
            self._print(f"Unrealistic salary detected", "WARNING")
        
        if period == 'weekly' and max_amount > 5000:
            result['is_unrealistic'] = True
            result['risk_score'] = 35
            result['warning'] = f"Unrealistic weekly pay: ${max_amount:,.0f}/week"
        
        return result
    
    # =========================================================
    # 7. TEMPLATE FINGERPRINTING (SimHash)
    # =========================================================
    
    def generate_simhash(self, text: str) -> int:
        """
        Generate SimHash fingerprint for text
        Used for comparing job postings to known scam templates
        """
        
        if not text:
            return 0
        
        # Tokenize and clean
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())
        # Remove stop words
        words = [w for w in words if w not in self.stop_words]
        
        # Count word frequencies
        word_counts = Counter(words)
        
        # SimHash algorithm
        vector = [0] * 64
        
        for word, count in word_counts.items():
            # Get hash of word
            word_hash = hashlib.md5(word.encode()).hexdigest()
            # Convert to binary
            binary = bin(int(word_hash[:8], 16))[2:].zfill(32)
            binary = binary + bin(int(word_hash[8:16], 16))[2:].zfill(32)
            
            for i, bit in enumerate(binary[:64]):
                if bit == '1':
                    vector[i] += count
                else:
                    vector[i] -= count
        
        # Build fingerprint
        fingerprint = 0
        for i in range(64):
            if vector[i] > 0:
                fingerprint |= (1 << i)
        
        return fingerprint
    
    def calculate_similarity(self, hash1: int, hash2: int) -> float:
        """Calculate Hamming distance similarity between two SimHashes"""
        
        if hash1 == 0 or hash2 == 0:
            return 0.0
        
        # XOR and count bits (Hamming distance)
        xor = hash1 ^ hash2
        hamming_distance = bin(xor).count('1')
        
        # Similarity = 1 - (distance / 64)
        similarity = 1 - (hamming_distance / 64)
        
        return similarity
    
    def check_template_match(self, description: str) -> Dict:
        """
        Check if job description matches known scam templates
        Using SimHash fingerprinting
        """
        
        result = {
            'fingerprint': None,
            'matches_found': 0,
            'matched_templates': [],
            'highest_similarity': 0,
            'risk_score': 0,
            'warning': None
        }
        
        if not description or len(description) < 200:
            return result
        
        # Generate fingerprint for current job
        fingerprint = self.generate_simhash(description)
        result['fingerprint'] = fingerprint
        
        # Compare against known scam templates
        # In production, this would query a database
        # For now, we'll check against a built-in list of common scam phrases
        
        scam_indicators = 0
        description_lower = description.lower()
        
        # Check for known scam phrases
        for phrase, weight in self.scam_phrases.items():
            if phrase in description_lower:
                scam_indicators += weight
                result['matched_templates'].append(phrase)
        
        if scam_indicators > 20:
            result['matches_found'] = len(result['matched_templates'])
            result['highest_similarity'] = min(100, scam_indicators)
            result['risk_score'] = min(80, scam_indicators)
            result['warning'] = f"Matches known scam patterns: {', '.join(result['matched_templates'][:3])}"
            self._print(f"Matches {len(result['matched_templates'])} scam patterns", "WARNING")
        
        return result
    
    # =========================================================
    # 8. LANGUAGE INCONSISTENCY DETECTION
    # =========================================================
    
    def detect_language_inconsistency(self, text: str) -> Dict:
        """
        Detect abrupt changes in language style
        - Switching between formal and informal
        - Multiple languages or scripts
        """
        
        result = {
            'has_inconsistency': False,
            'style_changes': 0,
            'language_switches': 0,
            'risk_score': 0,
            'warning': None
        }
        
        if not text:
            return result
        
        # Check for multiple scripts (Cyrillic, Arabic, etc in Latin text)
        scripts = set()
        for char in text:
            if '\u0400' <= char <= '\u04FF':  # Cyrillic
                scripts.add('cyrillic')
            elif '\u0600' <= char <= '\u06FF':  # Arabic
                scripts.add('arabic')
            elif '\u4e00' <= char <= '\u9fff':  # CJK
                scripts.add('cjk')
            elif 'a' <= char.lower() <= 'z':
                scripts.add('latin')
        
        if len(scripts) > 1:
            result['has_inconsistency'] = True
            result['language_switches'] = len(scripts) - 1
            result['risk_score'] += 30
            result['warning'] = f"Multiple scripts detected: {', '.join(scripts)}"
            self._print(f"Multiple scripts detected", "WARNING")
        
        # Check for formality shifts (capitalization patterns)
        sentences = re.split(r'[.!?]+', text)
        formal_sentences = 0
        informal_sentences = 0
        
        for sentence in sentences[:20]:  # Check first 20 sentences
            if len(sentence.strip()) < 5:
                continue
            # Check for contractions (informal)
            if re.search(r"\b(can't|won't|don't|doesn't|i'm|you're|it's)\b", sentence.lower()):
                informal_sentences += 1
            # Check for formal indicators
            elif re.search(r"\b(however|therefore|furthermore|consequently)\b", sentence.lower()):
                formal_sentences += 1
        
        if formal_sentences > 0 and informal_sentences > 0:
            ratio = informal_sentences / (formal_sentences + informal_sentences)
            if 0.3 < ratio < 0.7:
                result['has_inconsistency'] = True
                result['style_changes'] = 1
                result['risk_score'] += 15
                result['warning'] = 'Inconsistent formality - mixes formal and casual language'
                self._print("Language inconsistency detected", "WARNING")
        
        # Check for ALL CAPS sections
        caps_pattern = r'[A-Z]{5,}'
        caps_matches = re.findall(caps_pattern, text)
        if len(caps_matches) > 3:
            result['risk_score'] += 15
            result['warning'] = 'Excessive use of ALL CAPS - unusual for professional postings'
            self._print("Excessive capitalization detected", "WARNING")
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 9. UNIQUE PHRASE EXTRACTION & GOOGLE SEARCH
    # =========================================================
    
    def extract_unique_phrases(self, 1: str, min_length: int = 15) -> List[str]:
        """
        Extract unique phrases for cross-referencing
        """
        
        if not description:
            return []
        
        # Extract sentences
        sentences = re.split(r'[.!?]+', description)
        # Filter by length and uniqueness
        phrases = [s.strip() for s in sentences if len(s.strip()) > min_length]
        
        # Remove duplicates (case insensitive)
        seen = set()
        unique_phrases = []
        for phrase in phrases:
            phrase_lower = phrase.lower()
            if phrase_lower not in seen:
                seen.add(phrase_lower)
                unique_phrases.append(phrase)
        
        return unique_phrases[:10]  # Return top 10
    
    def google_search_phrase(self, phrase: str) -> int:
        """
        Search phrase on Google to check if it's from a known template
        Returns number of results (approximate)
        """
        
        # This would use Google Custom Search API
        # For passive analysis, we'd check cache
        # Placeholder implementation
        return 0
    
    # =========================================================
    # 10. COMPLETE JOB ANALYSIS
    # =========================================================
    
    def analyze_job(self, job_data: Dict) -> Dict:
        """
        Complete job posting analysis
        
        Args:
            job_data: Dictionary with title, description, salary, url
        
        Returns:
            Dictionary with all analysis results
        """
        
        self._print(f"")
        self._print(f"Starting complete job analysis")
        self._print("-" * 60)
        
        title = job_data.get('title', '')
        description = job_data.get('description', '')
        salary_text = job_data.get('salary', '')
        url = job_data.get('url')
        
        # If URL provided but no description, fetch it
        if url and not description:
            fetched = self.fetch_job_posting(url)
            if fetched.get('fetch_success'):
                description = fetched.get('description', description)
                title = fetched.get('title', title)
                salary_text = fetched.get('salary', salary_text)
        
        if not description:
            return {
                'error': 'No job description provided',
                'risk_score': 50,
                'risk_level': 'MEDIUM'
            }
        
        results = {}
        overall_risk = 0
        all_warnings = []
        
        # Run all analyses
        results['readability'] = self.calculate_readability(description)
        results['sentiment'] = self.analyze_sentiment(description)
        results['keywords'] = self.analyze_keywords(description)
        results['generic_title'] = self.detect_generic_title(title, description)
        results['salary_anomaly'] = self.detect_salary_anomaly(salary_text, title)
        results['template_match'] = self.check_template_match(description)
        results['language_inconsistency'] = self.detect_language_inconsistency(description)
        
        # Calculate overall risk with weights
        weights = {
            'readability': 0.10,
            'sentiment': 0.10,
            'keywords': 0.30,
            'generic_title': 0.15,
            'salary_anomaly': 0.15,
            'template_match': 0.10,
            'language_inconsistency': 0.10
        }
        
        for key, weight in weights.items():
            if key in results:
                score = results[key].get('risk_score', 0)
                overall_risk += score * weight
                warnings = results[key].get('warning')
                if warnings:
                    all_warnings.append(f"[{key}] {warnings}")
        
        overall_risk = int(overall_risk)
        
        # Collect red flags
        red_flags = []
        for warning in all_warnings[:10]:
            red_flags.append(warning)
        
        # Add specific red flags from keyword analysis
        if results['keywords']['money']['total_score'] > 0:
            red_flags.append(f"Payment requests found: {', '.join(results['keywords']['money']['keywords_found'][:3])}")
        
        if results['keywords']['personal_info']['total_score'] > 0:
            red_flags.append(f"Personal info requests: {', '.join(results['keywords']['personal_info']['keywords_found'][:3])}")
        
        # Generate recommendations
        recommendations = self._get_recommendations(overall_risk, red_flags)
        
        final_result = {
            'job_title': title,
            'salary_mentioned': salary_text if salary_text else None,
            'analysis_results': results,
            'risk_score': min(100, overall_risk),
            'risk_level': self._get_risk_level(overall_risk),
            'red_flags': red_flags[:10],
            'recommendations': recommendations
        }
        
        self._print("-" * 60)
        self._print(f"Job analysis complete")
        self._print(f"Overall Risk: {final_result['risk_level']} ({overall_risk}/100)")
        
        if red_flags:
            self._print(f"Red flags found: {len(red_flags)}", "WARNING")
        
        self._print("-" * 60)
        
        return final_result
    
    def analyze_multiple(self, jobs: List[Dict]) -> Dict:
        """Analyze multiple job postings"""
        
        self._print(f"Starting batch analysis for {len(jobs)} jobs")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_job = {
                executor.submit(self.analyze_job, job): job.get('title', f"Job_{i}")
                for i, job in enumerate(jobs)
            }
            
            for future in as_completed(future_to_job):
                job_title = future_to_job[future]
                try:
                    result = future.result()
                    results[job_title] = result
                    risks.append(result['risk_score'])
                    self._print(f"Completed: {job_title}")
                except Exception as e:
                    self._print(f"Error analyzing {job_title}: {str(e)}", "ERROR")
                    results[job_title] = {'error': str(e)}
        
        self._print("")
        self._print("JOB ANALYSIS BATCH SUMMARY")
        self._print(f"Total jobs: {len(jobs)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest risk: {max_risk}/100")
            self._print(f"Average risk: {int(avg_risk)}/100")
        
        return {
            'summary': {
                'total': len(jobs),
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
            recommendations.append("CRITICAL: Job posting shows strong scam indicators")
            recommendations.append("Do NOT apply or respond")
            recommendations.append("Report to job board and anti-fraud authorities")
        elif risk_score >= 60:
            recommendations.append("Job posting has major red flags of scam")
            recommendations.append("Verify company independently before applying")
            recommendations.append("Never pay fees or share personal information")
        elif risk_score >= 40:
            recommendations.append("Job posting has suspicious elements")
            recommendations.append("Research company thoroughly before proceeding")
        elif risk_score >= 20:
            recommendations.append("Minor concerns detected - proceed with caution")
        else:
            recommendations.append("Job posting appears legitimate based on analysis")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    ja = JobAnalyzer(verbose=True)
    
    test_job = {
        'title': "Virtual Assistant - Work From Home",
        'description': """
        URGENT HIRING! We are looking for a Virtual Assistant to join our team immediately.
        No experience needed! You can earn up to $5000 per week working from home.
        
        Send $50 for background check and training materials to get started today.
        We accept Bitcoin, PayPal, and Western Union.
        
        Please provide your SSN, bank account number, and driver's license for verification.
        Apply now! This position will fill quickly.
        """,
        'salary': "$5000/week"
    }
    
    result = ja.analyze_job(test_job)
    
    print("\n" + json.dumps(result, indent=2, default=str))