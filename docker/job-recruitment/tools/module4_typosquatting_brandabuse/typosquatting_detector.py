"""
Module 4: Typosquatting & Brand Abuse Detection
Complete domain similarity analysis including:
- Homograph attacks (Unicode/IDN)
- Character omission/addition/swap
- Bit flipping (bitsquatting)
- Hyphenation attacks
- TLD substitution
- Pluralization
- Prefix/Suffix addition
"""

import re
import string
import Levenshtein
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import socket
import dns.resolver
import json

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("TyposquattingDetector")

class TyposquattingDetector:
    """Complete typosquatting and brand abuse detection"""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/typosquatting")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        
        # Common TLDs for substitution
        self.common_tlds = [
            'com', 'net', 'org', 'io', 'co', 'us', 'uk', 'de', 'fr', 'eu',
            'info', 'biz', 'me', 'tv', 'app', 'dev', 'ai', 'cloud', 'tech',
            'online', 'site', 'top', 'xyz', 'club', 'shop', 'store'
        ]
        
        # High-risk TLDs (scammers love these)
        self.high_risk_tlds = {
            'top': 70, 'xyz': 65, 'club': 60, 'online': 55, 'site': 55,
            'shop': 60, 'store': 60, 'buzz': 65, 'click': 70, 'trade': 75
        }
        
        # Homograph characters (Latin vs Cyrillic vs other)
        self.homograph_map = {
            'a': ['а', 'ɑ', 'α'],  # Cyrillic a, alpha
            'c': ['с', 'ϲ', '¢'],  # Cyrillic s
            'e': ['е', 'ё', 'ε'],  # Cyrillic e, epsilon
            'i': ['і', 'ɪ', 'ï'],  # Cyrillic i, Latin small i
            'o': ['о', 'ο', 'σ'],  # Cyrillic o, omicron, sigma
            'p': ['р', 'ρ'],        # Cyrillic r, rho
            's': ['ѕ', 's'],        # Cyrillic s
            'x': ['х', '×'],        # Cyrillic h, multiplication
            'y': ['у', 'γ'],        # Cyrillic u, gamma
            'k': ['κ'],             # kappa
            'h': ['н'],             # Cyrillic n
            'm': ['м'],             # Cyrillic m
            't': ['т'],             # Cyrillic t
            'b': ['в'],             # Cyrillic v
            'u': ['υ']              # upsilon
        }
        
        # Common typo patterns
        self.typo_patterns = {
            'double_char': self._generate_double_char,
            'missing_char': self._generate_missing_char,
            'swap_char': self._generate_swap_char,
            'adjacent_key': self._generate_adjacent_key,
            'replace_vowel': self._generate_replace_vowel
        }
        
        # QWERTY adjacency map for common typos
        self.qwerty_adjacent = {
            'q': ['w', 'a', 's'],
            'w': ['q', 'e', 's', 'd'],
            'e': ['w', 'r', 'd', 'f'],
            'r': ['e', 't', 'f', 'g'],
            't': ['r', 'y', 'g', 'h'],
            'y': ['t', 'u', 'h', 'j'],
            'u': ['y', 'i', 'j', 'k'],
            'i': ['u', 'o', 'k', 'l'],
            'o': ['i', 'p', 'l'],
            'p': ['o', 'l'],
            'a': ['q', 'w', 's', 'z'],
            's': ['a', 'w', 'e', 'd', 'x', 'z'],
            'd': ['s', 'e', 'r', 'f', 'c', 'x'],
            'f': ['d', 'r', 't', 'g', 'v', 'c'],
            'g': ['f', 't', 'y', 'h', 'b', 'v'],
            'h': ['g', 'y', 'u', 'j', 'n', 'b'],
            'j': ['h', 'u', 'i', 'k', 'm', 'n'],
            'k': ['j', 'i', 'o', 'l', 'm'],
            'l': ['k', 'o', 'p'],
            'z': ['a', 's', 'x'],
            'x': ['z', 's', 'd', 'c'],
            'c': ['x', 'd', 'f', 'v'],
            'v': ['c', 'f', 'g', 'b'],
            'b': ['v', 'g', 'h', 'n'],
            'n': ['b', 'h', 'j', 'm'],
            'm': ['n', 'j', 'k']
        }
        
        # Suspicious suffixes scammers add
        self.suspicious_suffixes = [
            'jobs', 'career', 'hire', 'recruit', 'staff', 'hr', 'work',
            'apply', 'vacancy', 'opportunity', 'placement', 'hiring'
        ]
        
        # Suspicious prefixes scammers add
        self.suspicious_prefixes = [
            'get', 'apply', 'join', 'work', 'start', 'click', 'now'
        ]
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] TYPO ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] TYPO WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] TYPO SUCCESS: {message}")
        else:
            print(f"[{timestamp}] TYPO: {message}")
    
    # =========================================================
    # 1. HOMOGRAPH ATTACK DETECTION (IDN/Unicode)
    # =========================================================
    
    def detect_homograph_attack(self, domain: str, original_domain: str) -> Dict:
        """Detect homograph attacks using Unicode characters"""
        
        self._print(f"Checking homograph attack for {domain}")
        
        result = {
            'is_homograph': False,
            'original_domain': original_domain,
            'suspected_domain': domain,
            'confused_chars': [],
            'unicode_chars': [],
            'risk_score': 0
        }
        
        # Check if domain contains non-ASCII characters
        for char in domain:
            if ord(char) > 127:
                result['unicode_chars'].append({
                    'char': char,
                    'unicode': f"U+{ord(char):04X}",
                    'name': self._get_unicode_char_name(char)
                })
        
        if result['unicode_chars']:
            result['is_homograph'] = True
            result['risk_score'] = 80
            
            # Compare with original domain to find confused characters
            domain_ascii = self._normalize_to_ascii(domain)
            if domain_ascii == original_domain:
                result['risk_score'] = 95
                self._print(f"HOMOGRAPH DETECTED: {domain} looks like {original_domain} but uses Unicode", "ERROR")
        
        return result
    
    def _normalize_to_ascii(self, text: str) -> str:
        """Convert Unicode homograph characters to ASCII approximation"""
        result = text
        for ascii_char, unicode_chars in self.homograph_map.items():
            for unicode_char in unicode_chars:
                result = result.replace(unicode_char, ascii_char)
        return result
    
    def _get_unicode_char_name(self, char: str) -> str:
        """Get Unicode character name"""
        names = {
            'а': 'Cyrillic a',
            'с': 'Cyrillic s',
            'е': 'Cyrillic e',
            'р': 'Cyrillic r',
            'о': 'Cyrillic o',
            'х': 'Cyrillic h',
            'у': 'Cyrillic u',
            'і': 'Cyrillic i',
            'ѕ': 'Cyrillic s (dze)'
        }
        return names.get(char, 'Unknown')
    
    # =========================================================
    # 2. TYPO VARIATION GENERATION
    # =========================================================
    
    def generate_typo_variations(self, domain: str) -> Set[str]:
        """Generate all possible typo variations of a domain"""
        
        variations = set()
        
        # Remove TLD
        parts = domain.split('.')
        if len(parts) >= 2:
            name = parts[0]
            tld = parts[-1] if len(parts) > 1 else ''
        else:
            name = domain
            tld = ''
        
        # Character omission
        for i in range(len(name)):
            variation = name[:i] + name[i+1:] + ('.' + tld if tld else '')
            variations.add(variation)
        
        # Character addition (common typos)
        for i in range(len(name) + 1):
            for char in 'abcdefghijklmnopqrstuvwxyz':
                variation = name[:i] + char + name[i:] + ('.' + tld if tld else '')
                variations.add(variation)
        
        # Character swap
        for i in range(len(name) - 1):
            name_list = list(name)
            name_list[i], name_list[i+1] = name_list[i+1], name_list[i]
            variation = ''.join(name_list) + ('.' + tld if tld else '')
            variations.add(variation)
        
        # Double character
        for i in range(len(name)):
            variation = name[:i] + name[i] + name[i] + name[i+1:] + ('.' + tld if tld else '')
            variations.add(variation)
        
        # Adjacent key errors
        for i, char in enumerate(name):
            if char in self.qwerty_adjacent:
                for adj in self.qwerty_adjacent[char]:
                    variation = name[:i] + adj + name[i+1:] + ('.' + tld if tld else '')
                    variations.add(variation)
        
        # Remove duplicate
        variations = {v for v in variations if len(v) > 3}
        
        return variations
    
    def _generate_double_char(self, name: str) -> Set[str]:
        """Generate double character typos"""
        variations = set()
        for i in range(len(name)):
            variations.add(name[:i] + name[i] + name[i] + name[i+1:])
        return variations
    
    def _generate_missing_char(self, name: str) -> Set[str]:
        """Generate missing character typos"""
        variations = set()
        for i in range(len(name)):
            variations.add(name[:i] + name[i+1:])
        return variations
    
    def _generate_swap_char(self, name: str) -> Set[str]:
        """Generate swapped character typos"""
        variations = set()
        for i in range(len(name) - 1):
            name_list = list(name)
            name_list[i], name_list[i+1] = name_list[i+1], name_list[i]
            variations.add(''.join(name_list))
        return variations
    
    def _generate_adjacent_key(self, name: str) -> Set[str]:
        """Generate adjacent key typos (QWERTY)"""
        variations = set()
        for i, char in enumerate(name):
            if char in self.qwerty_adjacent:
                for adj in self.qwerty_adjacent[char]:
                    variations.add(name[:i] + adj + name[i+1:])
        return variations
    
    def _generate_replace_vowel(self, name: str) -> Set[str]:
        """Generate vowel replacement typos"""
        vowels = 'aeiou'
        variations = set()
        for i, char in enumerate(name):
            if char in vowels:
                for vowel in vowels:
                    if vowel != char:
                        variations.add(name[:i] + vowel + name[i+1:])
        return variations
    
    # =========================================================
    # 3. TLD SUBSTITUTION
    # =========================================================
    
    def generate_tld_variations(self, domain: str) -> Set[str]:
        """Generate TLD substitution variations"""
        
        variations = set()
        parts = domain.split('.')
        
        if len(parts) >= 2:
            name = parts[0]
            current_tld = parts[-1]
            
            for tld in self.common_tlds:
                if tld != current_tld:
                    variations.add(f"{name}.{tld}")
                    
                    # Also try with hyphens and common prefixes
                    for suffix in self.suspicious_suffixes:
                        variations.add(f"{name}-{suffix}.{tld}")
                        variations.add(f"{suffix}-{name}.{tld}")
        
        return variations
    
    # =========================================================
    # 4. PREFIX/SUFFIX ADDITION DETECTION
    # =========================================================
    
    def generate_prefix_suffix_variations(self, domain: str) -> Set[str]:
        """Generate variations with suspicious prefixes/suffixes"""
        
        variations = set()
        parts = domain.split('.')
        
        if len(parts) >= 2:
            name = parts[0]
            tld = parts[-1]
            
            # Add suffixes
            for suffix in self.suspicious_suffixes:
                variations.add(f"{name}{suffix}.{tld}")
                variations.add(f"{name}-{suffix}.{tld}")
                variations.add(f"{suffix}{name}.{tld}")
            
            # Add prefixes
            for prefix in self.suspicious_prefixes:
                variations.add(f"{prefix}{name}.{tld}")
                variations.add(f"{prefix}-{name}.{tld}")
        
        return variations
    
    # =========================================================
    # 5. SIMILARITY SCORING
    # =========================================================
    
    def calculate_similarity(self, domain1: str, domain2: str) -> Dict:
        """Calculate similarity between two domains"""
        
        # Normalize domains
        d1 = domain1.lower().replace('www.', '')
        d2 = domain2.lower().replace('www.', '')
        
        # Levenshtein distance
        levenshtein_dist = Levenshtein.distance(d1, d2)
        max_len = max(len(d1), len(d2))
        similarity_ratio = (max_len - levenshtein_dist) / max_len if max_len > 0 else 0
        
        # Jaro-Winkler similarity
        jaro_winkler = Levenshtein.jaro_winkler(d1, d2)
        
        # Check if one contains the other
        contains = d1 in d2 or d2 in d1
        
        result = {
            'domain1': d1,
            'domain2': d2,
            'levenshtein_distance': levenshtein_dist,
            'similarity_ratio': round(similarity_ratio * 100, 2),
            'jaro_winkler': round(jaro_winkler * 100, 2),
            'contains_other': contains,
            'risk_score': 0
        }
        
        # Risk based on similarity
        if similarity_ratio > 0.9:
            result['risk_score'] = 80
        elif similarity_ratio > 0.8:
            result['risk_score'] = 60
        elif similarity_ratio > 0.7:
            result['risk_score'] = 40
        
        if contains and similarity_ratio > 0.5:
            result['risk_score'] = min(90, result['risk_score'] + 20)
        
        return result
    
    # =========================================================
    # 6. CHECK DOMAIN AVAILABILITY (Passive)
    # =========================================================
    
    def check_domain_exists(self, domain: str) -> Dict:
        """Check if domain exists (passive - no WHOIS query)"""
        
        result = {
            'domain': domain,
            'exists': False,
            'has_a_record': False,
            'has_mx_record': False,
            'has_website': False,
            'risk_score': 0
        }
        
        # Check A record
        try:
            dns.resolver.resolve(domain, 'A')
            result['has_a_record'] = True
            result['exists'] = True
        except:
            pass
        
        # Check MX record
        try:
            dns.resolver.resolve(domain, 'MX')
            result['has_mx_record'] = True
            result['exists'] = True
        except:
            pass
        
        # Check website (HTTP/HTTPS)
        for protocol in ['https', 'http']:
            try:
                import requests
                response = requests.get(f"{protocol}://{domain}", timeout=3, verify=False)
                if response.status_code < 500:
                    result['has_website'] = True
                    result['exists'] = True
                    break
            except:
                pass
        
        # Risk: If domain exists and is suspicious
        if result['exists']:
            # Check TLD risk
            tld = domain.split('.')[-1]
            if tld in self.high_risk_tlds:
                result['risk_score'] = self.high_risk_tlds[tld]
                self._print(f"Domain {domain} exists with high-risk TLD .{tld}", "WARNING")
        
        return result
    
    # =========================================================
    # 7. COMPLETE TYPOSQUATTING INVESTIGATION
    # =========================================================
    
    def investigate_brand(self, brand_domain: str, check_existing: bool = True) -> Dict:
        """
        Complete typosquatting investigation for a brand domain
        
        Args:
            brand_domain: The legitimate brand domain (e.g., "google.com")
            check_existing: Whether to check if generated domains actually exist
        
        Returns:
            Dictionary with all typosquatting variations and risks
        """
        
        self._print(f"Starting typosquatting investigation for {brand_domain}")
        
        # Generate all variations
        self._print("Generating typo variations...")
        typo_variations = self.generate_typo_variations(brand_domain)

        self._print("Generating TLD variations...")
        tld_variations = self.generate_tld_variations(brand_domain)

        self._print("Generating prefix/suffix variations...")
        prefix_suffix_variations = self.generate_prefix_suffix_variations(brand_domain)

        all_variations = typo_variations | tld_variations | prefix_suffix_variations
        all_variations = {v for v in all_variations if v != brand_domain and len(v) > 3}

        self._print(f"Generated {len(all_variations)} potential typosquatting domains")

        # Check homograph possibilities (just for the brand name)
        self._print("Checking for homograph attack possibilities...")
        homograph_result = self.detect_homograph_attack(brand_domain, brand_domain)        
        # Check existing domains if requested
        existing_domains = []
        if check_existing:
            self._print(f"Checking which variations exist...")
            
            with ThreadPoolExecutor(max_workers=10) as executor:
                future_to_domain = {
                    executor.submit(self.check_domain_exists, domain): domain
                    for domain in list(all_variations)[:100]  # Limit to 100
                }
                
                for future in as_completed(future_to_domain):
                    domain = future_to_domain[future]
                    try:
                        result = future.result()
                        if result['exists']:
                            # Calculate similarity
                            similarity = self.calculate_similarity(brand_domain, domain)
                            result['similarity'] = similarity
                            existing_domains.append(result)
                            self._print(f"Found existing typosquat: {domain} (similarity: {similarity['similarity_ratio']}%)", "WARNING")
                    except:
                        pass
        
        # Calculate overall risk
        risk_score = 0
        high_risk_domains = []
        
        for domain_info in existing_domains:
            if domain_info.get('similarity', {}).get('risk_score', 0) > 60:
                high_risk_domains.append(domain_info)
                risk_score = max(risk_score, domain_info['similarity']['risk_score'])
        
        if high_risk_domains:
            risk_score += 20
            self._print(f"Found {len(high_risk_domains)} high-risk typosquatting domains", "ERROR")
        
        if homograph_result.get('is_homograph'):
            risk_score = max(risk_score, 80)
        
        result = {
            'brand_domain': brand_domain,
            'total_variations_generated': len(all_variations),
            'existing_typosquat_domains': existing_domains,
            'high_risk_domains': high_risk_domains,
            'homograph_attack': homograph_result,
            'risk_score': min(100, risk_score),
            'risk_level': self._get_risk_level(risk_score),
            'recommendations': self._get_recommendations(risk_score, high_risk_domains)
        }
        
        self._print(f"Typosquatting investigation complete: Risk {result['risk_level']} ({risk_score}/100)")
        
        return result
    
    def investigate_multiple(self, domains: List[str]) -> Dict:
        """Investigate multiple brand domains"""
        
        self._print(f"Starting batch typosquatting investigation for {len(domains)} domains")
        
        results = {}
        risks = []
        
        for domain in domains:
            result = self.investigate_brand(domain)
            results[domain] = result
            risks.append(result['risk_score'])
            self._print(f"Completed {domain}: {len(result.get('existing_typosquat_domains', []))} typosquat domains found")
        
        # Summary
        self._print("")
        self._print("TYPOSQUATTING BATCH SUMMARY")
        self._print(f"Total brands: {len(domains)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest risk: {max_risk}/100")
            self._print(f"Average risk: {int(avg_risk)}/100")
        
        return {
            'summary': {
                'total': len(domains),
                'max_risk': max(risks) if risks else 0,
                'avg_risk': int(sum(risks) / len(risks)) if risks else 0
            },
            'results': results
        }
    
    def compare_domains(self, domain1: str, domain2: str) -> Dict:
        """Compare two specific domains for similarity and potential abuse"""
        
        self._print(f"Comparing {domain1} vs {domain2}")
        
        similarity = self.calculate_similarity(domain1, domain2)
        
        # Check if homograph
        homograph = self.detect_homograph_attack(domain2, domain1)
        
        result = {
            'domain_a': domain1,
            'domain_b': domain2,
            'similarity': similarity,
            'is_likely_typosquat': similarity['similarity_ratio'] > 80,
            'is_homograph': homograph['is_homograph'],
            'risk_score': similarity['risk_score'],
            'risk_level': self._get_risk_level(similarity['risk_score']),
            'recommendation': 'Potential brand abuse detected' if similarity['risk_score'] > 60 else 'Domains are distinct'
        }
        
        return result
    
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
    
    def _get_recommendations(self, risk_score: int, high_risk_domains: List) -> List[str]:
        recommendations = []
        
        if risk_score >= 80:
            recommendations.append("CRITICAL: Active typosquatting/brand abuse detected")
            recommendations.append("Consider legal action to take down impersonating domains")
            recommendations.append("Warn users about similar-looking domains")
        elif risk_score >= 60:
            recommendations.append("High-risk typosquatting detected")
            recommendations.append("Monitor these domains for phishing activity")
            recommendations.append("Add to email filtering blocklist")
        elif risk_score >= 40:
            recommendations.append("Medium-risk - some similar domains exist")
            recommendations.append("Verify if these domains are legitimate subsidiaries")
        else:
            recommendations.append("No significant typosquatting detected")
        
        return recommendations


# Standalone test
if __name__ == "__main__":
    td = TyposquattingDetector(verbose=True)
    
    # Test with a brand
    result = td.investigate_brand("google.com", check_existing=True)
    
    # Test comparison
    comparison = td.compare_domains("google.com", "go0gle.com")
    
    print("\n" + json.dumps(result, indent=2, default=str))
    print("\n" + json.dumps(comparison, indent=2, default=str))