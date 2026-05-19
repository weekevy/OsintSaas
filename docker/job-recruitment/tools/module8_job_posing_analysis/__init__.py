"""
Module 8: Job Posting NLP & Pattern Analysis
Feature extraction, readability scoring, sentiment analysis, template fingerprinting
"""

from .job_analyzer import JobAnalyzer
from .main import analyze_job_posting

__version__ = "1.0.0"
__author__ = "Job Scam Investigator"
__all__ = ['JobAnalyzer', 'analyze_job_posting']