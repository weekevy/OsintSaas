"""
Module 12: Social Media Footprint Mapping
Passive social media OSINT across Facebook, Twitter, Instagram, Reddit, Glassdoor, Indeed, Trustpilot, BBB
"""

from .social_footprint import SocialFootprintMapper
from .main import analyze_social_footprint

__version__ = "1.0.0"
__author__ = "Job Scam Investigator"
__all__ = ['SocialFootprintMapper', 'analyze_social_footprint']