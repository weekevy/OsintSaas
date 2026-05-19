"""
Module 7: Recruiter Deep Verification
LinkedIn OSINT, cross-platform correlation, email pattern analysis
"""

from .recruiter_verifier import RecruiterVerifier
from .main import verify_recruiter

__version__ = "1.0.0"
__author__ = "Job Scam Investigator"
__all__ = ['RecruiterVerifier', 'verify_recruiter']