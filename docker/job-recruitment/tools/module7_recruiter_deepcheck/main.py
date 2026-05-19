"""
Main entry point for Module 7: Recruiter Deep Verification
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from recruiter_verifier import RecruiterVerifier

def verify_recruiter(recruiter_data: Dict, hibp_api_key: str = None, 
                     google_api_key: str = None, verbose: bool = True) -> Dict:
    """
    Verify a single recruiter
    
    Args:
        recruiter_data: Dictionary with name, email, linkedin_url, company_domain
        hibp_api_key: HaveIBeenPwned API key
        google_api_key: Google API key for reverse image search
        verbose: Print console output
    
    Returns:
        Verification results
    """
    
    if not recruiter_data.get('name'):
        return {'error': 'Recruiter name is required'}
    
    rv = RecruiterVerifier(verbose=verbose, hibp_api_key=hibp_api_key, 
                          google_api_key=google_api_key)
    
    result = rv.verify_recruiter(
        recruiter_name=recruiter_data.get('name'),
        recruiter_email=recruiter_data.get('email'),
        linkedin_url=recruiter_data.get('linkedin_url'),
        company_domain=recruiter_data.get('company_domain'),
        profile_photo_url=recruiter_data.get('profile_photo_url')
    )
    
    return result

def verify_multiple_recruiters(recruiters: List[Dict], hibp_api_key: str = None,
                               google_api_key: str = None, verbose: bool = True) -> Dict:
    """Verify multiple recruiters"""
    
    if not recruiters:
        return {'error': 'No recruiters provided'}
    
    rv = RecruiterVerifier(verbose=verbose, hibp_api_key=hibp_api_key,