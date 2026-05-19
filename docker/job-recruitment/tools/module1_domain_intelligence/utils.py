"""
Utilities for Module 1: Domain Intelligence
Shared functions for caching, logging, validation, and rate limiting
"""

import json
import hashlib
import logging
import sys
import time
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional, Dict, List
from collections import defaultdict
from threading import Lock
from urllib.parse import urlparse

# ============================================
# LOGGER SETUP
# ============================================

def setup_logger(name: str, log_file: str = None, level: int = logging.INFO) -> logging.Logger:
    """
    Setup logger with console output (no decorations)
    
    Args:
        name: Logger name (usually __name__)
        log_file: Optional path to log file
        level: Logging level (default: INFO)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatter (simple, no fancy characters)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        try:
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except Exception as e:
            logger.warning(f"Could not create log file: {e}")
    
    return logger


# ============================================
# CACHE MANAGER
# ============================================

class CacheManager:
    """
    Simple file-based cache with TTL (Time To Live)
    Stores data in JSON files for reuse between scans
    """
    
    def __init__(self, cache_dir: str = "data/cache", default_ttl: int = 86400):
        """
        Initialize cache manager
        
        Args:
            cache_dir: Directory to store cache files
            default_ttl: Default cache lifetime in seconds (24 hours)
        """
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.default_ttl = default_ttl
    
    def _get_cache_path(self, key: str) -> Path:
        """Generate cache file path from key"""
        key_hash = hashlib.md5(key.encode()).hexdigest()
        return self.cache_dir / f"{key_hash}.json"
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get cached value if not expired
        
        Args:
            key: Cache key string
        
        Returns:
            Cached value or None if not found/expired
        """
        cache_path = self._get_cache_path(key)
        
        if not cache_path.exists():
            return None
        
        try:
            with open(cache_path, 'r') as f:
                data = json.load(f)
            
            # Check expiration
            cached_time = datetime.fromisoformat(data['timestamp'])
            ttl = data.get('ttl', self.default_ttl)
            
            if datetime.now() - cached_time > timedelta(seconds=ttl):
                cache_path.unlink()  # Delete expired cache
                return None
            
            return data['value']
        
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # Corrupted cache, delete it
            cache_path.unlink()
            return None
        except Exception:
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = None) -> bool:
        """
        Store value in cache
        
        Args:
            key: Cache key string
            value: Value to cache (must be JSON serializable)
            ttl_seconds: Time to live in seconds (default: 86400)
        
        Returns:
            True if successful, False otherwise
        """
        cache_path = self._get_cache_path(key)
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'ttl': ttl,
            'value': value
        }
        
        try:
            with open(cache_path, 'w') as f:
                json.dump(data, f, default=str, indent=2)
            return True
        except Exception:
            return False
    
    def clear(self, pattern: str = None) -> int:
        """
        Clear cache files
        
        Args:
            pattern: Optional pattern to match (e.g., "google" to clear google-related cache)
        
        Returns:
            Number of files deleted
        """
        deleted = 0
        
        if pattern:
            for cache_file in self.cache_dir.glob("*.json"):
                try:
                    with open(cache_file, 'r') as f:
                        data = json.load(f)
                        value_str = json.dumps(data.get('value', ''))
                        if pattern.lower() in value_str.lower():
                            cache_file.unlink()
                            deleted += 1
                except:
                    pass
        else:
            for cache_file in self.cache_dir.glob("*.json"):
                cache_file.unlink()
                deleted += 1
        
        return deleted
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        files = list(self.cache_dir.glob("*.json"))
        return {
            'cache_dir': str(self.cache_dir),
            'total_files': len(files),
            'default_ttl_hours': self.default_ttl / 3600
        }


# ============================================
# RATE LIMITER
# ============================================

class RateLimiter:
    """
    Rate limiter to prevent hitting API limits
    Tracks last call time per key and enforces minimum interval
    """
    
    def __init__(self, calls_per_second: float = 1.0):
        """
        Initialize rate limiter
        
        Args:
            calls_per_second: Maximum number of calls per second
        """
        self.min_interval = 1.0 / calls_per_second
        self.last_call_time = defaultdict(float)
        self.lock = Lock()
    
    def wait_if_needed(self, key: str = "default"):
        """
        Wait if rate limit would be exceeded
        
        Args:
            key: Identifier for different rate limit contexts
        """
        with self.lock:
            now = time.time()
            time_since_last = now - self.last_call_time[key]
            
            if time_since_last < self.min_interval:
                sleep_time = self.min_interval - time_since_last
                time.sleep(sleep_time)
            
            self.last_call_time[key] = time.time()
    
    def __call__(self, func):
        """Decorator version for automatic rate limiting"""
        def wrapper(*args, **kwargs):
            self.wait_if_needed(func.__name__)
            return func(*args, **kwargs)
        return wrapper
    
    def reset(self, key: str = None):
        """Reset rate limit tracking"""
        if key:
            self.last_call_time[key] = 0
        else:
            self.last_call_time.clear()


# ============================================
# DOMAIN VALIDATORS
# ============================================

def validate_domain(domain: str) -> bool:
    """
    Validate domain name format
    
    Args:
        domain: Domain name to validate
    
    Returns:
        True if valid domain format, False otherwise
    """
    if not domain or not isinstance(domain, str):
        return False
    
    # Basic domain regex pattern
    pattern = re.compile(
        r'^(?:[a-zA-Z0-9]'
        r'(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+'
        r'[a-zA-Z]{2,}$'
    )
    
    return bool(pattern.match(domain))


def extract_domain_from_url(url: str) -> Optional[str]:
    """
    Extract domain name from URL
    
    Args:
        url: Full URL (e.g., https://www.example.com/path)
    
    Returns:
        Domain name or None if invalid
    """
    if not url:
        return None
    
    try:
        # Add scheme if missing
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path
        
        # Remove www prefix
        domain = domain.replace('www.', '')
        
        # Remove port if present
        if ':' in domain:
            domain = domain.split(':')[0]
        
        # Remove trailing slashes
        domain = domain.rstrip('/')
        
        return domain if validate_domain(domain) else None
    
    except Exception:
        return None


def extract_domain_from_email(email: str) -> Optional[str]:
    """
    Extract domain name from email address
    
    Args:
        email: Email address (e.g., user@example.com)
    
    Returns:
        Domain name or None if invalid
    """
    if not email or '@' not in email:
        return None
    
    domain = email.split('@')[1].lower().strip()
    return domain if validate_domain(domain) else None


def extract_domains_from_text(text: str) -> List[str]:
    """
    Extract all domain names from text
    
    Args:
        text: Text containing potential domains
    
    Returns:
        List of unique domain names found
    """
    if not text:
        return []
    
    # Pattern to match domain names
    pattern = r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b'
    
    domains = set()
    matches = re.findall(pattern, text)
    
    for match in matches:
        if validate_domain(match):
            domains.add(match.lower())
    
    return list(domains)


# ============================================
# FILE UTILITIES
# ============================================

def ensure_directory(path: str) -> Path:
    """
    Ensure directory exists, create if not
    
    Args:
        path: Directory path
    
    Returns:
        Path object
    """
    dir_path = Path(path)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path


def save_json(data: Any, filepath: str, indent: int = 2) -> bool:
    """
    Save data as JSON file
    
    Args:
        data: Data to save (must be JSON serializable)
        filepath: Output file path
        indent: JSON indentation level
    
    Returns:
        True if successful, False otherwise
    """
    try:
        file_path = Path(filepath)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=indent, default=str)
        return True
    except Exception:
        return False


def load_json(filepath: str) -> Optional[Any]:
    """
    Load data from JSON file
    
    Args:
        filepath: Input file path
    
    Returns:
        Loaded data or None if error
    """
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except Exception:
        return None


# ============================================
# STRING UTILITIES
# ============================================

def sanitize_string(text: str) -> str:
    """
    Sanitize string for safe display/logging
    
    Args:
        text: Input string
    
    Returns:
        Sanitized string
    """
    if not text:
        return ""
    
    # Remove control characters
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    
    # Limit length
    if len(text) > 500:
        text = text[:500] + "..."
    
    return text


def extract_similarity(text1: str, text2: str) -> float:
    """
    Calculate similarity between two strings (simple ratio)
    
    Args:
        text1: First string
        text2: Second string
    
    Returns:
        Similarity score between 0 and 1
    """
    if not text1 or not text2:
        return 0.0
    
    set1 = set(text1.lower().split())
    set2 = set(text2.lower().split())
    
    if not set1 or not set2:
        return 0.0
    
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    
    return len(intersection) / len(union) if union else 0.0


# ============================================
# TIME UTILITIES
# ============================================

def format_timedelta(seconds: int) -> str:
    """
    Format time delta as human readable string
    
    Args:
        seconds: Number of seconds
    
    Returns:
        Human readable string (e.g., "2 days, 5 hours")
    """
    if seconds < 0:
        return "0 seconds"
    
    days = seconds // 86400
    hours = (seconds % 86400) // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    parts = []
    if days > 0:
        parts.append(f"{days} day{'s' if days != 1 else ''}")
    if hours > 0:
        parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
    if minutes > 0:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
    if secs > 0 and not parts:
        parts.append(f"{secs} second{'s' if secs != 1 else ''}")
    
    return ", ".join(parts) if parts else "0 seconds"


# ============================================
# RISK CALCULATION
# ============================================

def calculate_weighted_risk(scores: List[int], weights: List[float]) -> int:
    """
    Calculate weighted average risk score
    
    Args:
        scores: List of risk scores (0-100)
        weights: List of corresponding weights (should sum to 1.0)
    
    Returns:
        Weighted risk score (0-100)
    """
    if not scores or not weights:
        return 50
    
    # Ensure weights sum to 1.0
    weight_sum = sum(weights[:len(scores)])
    if weight_sum == 0:
        return 50
    
    weighted_sum = sum(s * w for s, w in zip(scores, weights))
    result = weighted_sum / weight_sum
    
    return min(100, max(0, int(result)))


def get_risk_level(score: int) -> str:
    """
    Convert numeric risk score to risk level string
    
    Args:
        score: Risk score (0-100)
    
    Returns:
        Risk level: CRITICAL, HIGH, MEDIUM, LOW, or SAFE
    """
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


# ============================================
# CONSOLE OUTPUT (No decorations)
# ============================================

class ConsolePrinter:
    """Simple console printer with clean output"""
    
    @staticmethod
    def info(message: str):
        print(f"[INFO] {message}")
    
    @staticmethod
    def warning(message: str):
        print(f"[WARNING] {message}")
    
    @staticmethod
    def error(message: str):
        print(f"[ERROR] {message}")
    
    @staticmethod
    def success(message: str):
        print(f"[SUCCESS] {message}")
    
    @staticmethod
    def debug(message: str, enabled: bool = False):
        if enabled:
            print(f"[DEBUG] {message}")
    
    @staticmethod
    def result(label: str, value: str):
        print(f"{label}: {value}")


# ============================================
# EXPORTS
# ============================================

__all__ = [
    # Logging
    'setup_logger',
    
    # Cache
    'CacheManager',
    
    # Rate Limiting
    'RateLimiter',
    
    # Domain validation
    'validate_domain',
    'extract_domain_from_url',
    'extract_domain_from_email',
    'extract_domains_from_text',
    
    # File utilities
    'ensure_directory',
    'save_json',
    'load_json',
    
    # String utilities
    'sanitize_string',
    'extract_similarity',
    
    # Time utilities
    'format_timedelta',
    
    # Risk calculation
    'calculate_weighted_risk',
    'get_risk_level',
    
    # Console output
    'ConsolePrinter'
]