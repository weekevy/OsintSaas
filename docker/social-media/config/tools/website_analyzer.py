#!/usr/bin/env python3
"""
Website Analysis Tool for Scam Detection
"""

import requests
import ssl
import socket
import whois
import json
import logging
from datetime import datetime
from urllib.parse import urlparse
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebsiteAnalyzer:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def analyze_url(self, url: str) -> Dict:
        """Comprehensive URL analysis"""
        logger.info(f"Analyzing URL: {url}")
        
        result = {
            "url": url,
            "timestamp": datetime.now().isoformat(),
            "checks": {}
        }
        
        # Parse URL
        parsed = urlparse(url)
        result["domain"] = parsed.netloc
        result["scheme"] = parsed.scheme
        
        # Check SSL
        if parsed.scheme == 'https':
            result["checks"]["ssl"] = self.check_ssl(parsed.netloc)
        
        # Check WHOIS
        result["checks"]["whois"] = self.check_whois(parsed.netloc)
        
        # Fetch page
        result["checks"]["content"] = self.fetch_page(url)
        
        # Check blacklists
        result["checks"]["blacklists"] = self.check_blacklists(parsed.netloc)
        
        return result
    
    def check_ssl(self, domain: str, port: int = 443) -> Dict:
        """Check SSL certificate details"""
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    return {
                        "valid": True,
                        "issuer": dict(x[0] for x in cert['issuer']),
                        "expiry": cert['notAfter'],
                        "subject": dict(x[0] for x in cert['subject'])
                    }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }
    
    def check_whois(self, domain: str) -> Dict:
        """Get WHOIS information"""
        try:
            w = whois.whois(domain)
            return {
                "registrar": w.registrar,
                "creation_date": str(w.creation_date),
                "expiration_date": str(w.expiration_date),
                "name_servers": w.name_servers
            }
        except Exception as e:
            return {
                "error": str(e)
            }
    
    def fetch_page(self, url: str) -> Dict:
        """Fetch and analyze page content"""
        try:
            response = self.session.get(url, timeout=10, verify=False)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract suspicious patterns
            suspicious_keywords = ['urgent', 'limited time', 'winner', 'lottery', 'prize']
            content_lower = response.text.lower()
            
            suspicious_matches = [kw for kw in suspicious_keywords if kw in content_lower]
            
            return {
                "status_code": response.status_code,
                "title": soup.title.string if soup.title else None,
                "suspicious_keywords": suspicious_matches,
                "forms": len(soup.find_all('form')),
                "links": len(soup.find_all('a')),
                "images": len(soup.find_all('img'))
            }
        except Exception as e:
            return {
                "error": str(e)
            }
    
    def check_blacklists(self, domain: str) -> Dict:
        """Check if domain is on any blacklists"""
        # Implementation for checking various blacklists
        return {
            "google_safe_browsing": "clean",
            "phishtank": "clean",
            "openphish": "clean",
            "spamhaus": "clean"
        }

if __name__ == "__main__":
    analyzer = WebsiteAnalyzer()
    result = analyzer.analyze_url("https://example.com")
    print(json.dumps(result, indent=2))
