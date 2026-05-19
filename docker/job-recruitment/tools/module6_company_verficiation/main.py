"""
Main entry point for Module 6: Company Verification
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from company_verifier import CompanyVerifier

def verify_company(company_data: Dict, google_maps_key: str = None, verbose: bool = True) -> Dict:
    """
    Verify a single company
    
    Args:
        company_data: Dictionary with name, domain, address, phone, registration_number
        google_maps_key: Optional Google Maps API key
        verbose: Print console output
    
    Returns:
        Verification results
    """
    
    if not company_data.get('name'):
        return {'error': 'Company name is required'}
    
    cv = CompanyVerifier(verbose=verbose, google_maps_api_key=google_maps_key)
    result = cv.verify_company(
        company_name=company_data.get('name'),
        domain=company_data.get('domain'),
        address=company_data.get('address'),
        phone=company_data.get('phone'),
        company_number=company_data.get('registration_number')
    )
    
    return result

def verify_multiple_companies(companies: List[Dict], google_maps_key: str = None, verbose: bool = True) -> Dict:
    """Verify multiple companies"""
    
    if not companies:
        return {'error': 'No companies provided'}
    
    cv = CompanyVerifier(verbose=verbose, google_maps_api_key=google_maps_key)
    results = cv.verify_multiple(companies)
    
    return results


if __name__ == "__main__":
    print("Module 6: Company Verification (Multi-Source)")
    print("Starting company verification...")
    print()
    
    google_key = None  # Add your key here
    
    if len(sys.argv) > 1:
        # Parse JSON input
        try:
            data = json.loads(sys.argv[1])
            if isinstance(data, dict):
                results = verify_company(data, google_maps_key=google_key, verbose=True)
            elif isinstance(data, list):
                results = verify_multiple_companies(data, google_maps_key=google_key, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            # Assume company name as string
            results = verify_company({'name': ' '.join(sys.argv[1:])}, google_maps_key=google_key, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, dict):
                results = verify_company(data, google_maps_key=google_key, verbose=True)
            elif isinstance(data, list):
                results = verify_multiple_companies(data, google_maps_key=google_key, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py '{\"name\":\"Google LLC\",\"domain\":\"google.com\"}'")
            print("Or pipe JSON: echo '{\"name\":\"Google LLC\"}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"company_verification_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")