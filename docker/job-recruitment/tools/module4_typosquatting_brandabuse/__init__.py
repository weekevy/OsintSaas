"""
Module 4: Typosquatting & Brand Abuse Detection
Detects domain variations, homograph attacks, and brand impersonation
"""

from .typosquatting_detector import TyposquattingDetector
from .main import investigate_typosquatting

__version__ = "1.0.0"
__author__ = "Job Scam Investigator"
__all__ = ['TyposquattingDetector', 'investigate_typosquatting']