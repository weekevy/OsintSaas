"""
Main entry point for Module 2: Email Forensics
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from email_forensics import EmailForensics

def investigate_emails(emails: List[str], hibp_api_key: str = None, verbose: bool = True) -> Dict:
    """Investigate one or more email addresses"""
    if not emails:
        return {'error': 'No emails provided'}
    
    ef = EmailForensics(verbose=verbose, hibp_api_key=hibp_api_key)
    results = ef.analyze_multiple(emails)
    
    return results

def investigate_from_job_data(job_data: Dict, hibp_api_key: str = None, verbose: bool = True) -> Dict:
    """Extract emails from job data and investigate"""
    
    emails_to_check = []
    
    if job_data.get('recruiter_email'):
        emails_to_check.append(job_data['recruiter_email'])
    
    if job_data.get('company_email'):
        emails_to_check.append(job_data['company_email'])
    
    if not emails_to_check:
        return {'error': 'No emails found in job data'}
    
    ef = EmailForensics(verbose=verbose, hibp_api_key=hibp_api_key)
    results = ef.analyze_multiple(emails_to_check)
    
    # Also check domain match
    if job_data.get('recruiter_email') and job_data.get('company_email_domain'):
        match_result = ef.check_email_match(
            job_data['recruiter_email'],
            job_data['company_email_domain']
        )
        results['domain_match_check'] = match_result
    
    return results


if __name__ == "__main__":
    print("Module 2: Email Forensics")
    print("Starting email analysis...")
    print()
    
    # Optional: Read API key from environment or config
    hibp_key = None
    
    if len(sys.argv) > 1:
        emails = sys.argv[1:]
        results = investigate_emails(emails, hibp_api_key=hibp_key, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, dict):
                results = investigate_from_job_data(data, hibp_api_key=hibp_key, verbose=True)
            elif isinstance(data, list):
                results = investigate_emails(data, hibp_api_key=hibp_key, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py email1@example.com email2@example.com")
            print("Or pipe JSON: echo '{\"recruiter_email\":\"hr@example.com\"}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"email_forensics_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")