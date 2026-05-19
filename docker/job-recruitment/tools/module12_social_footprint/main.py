"""
Main entry point for Module 12: Social Media Footprint Mapping
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from social_footprint import SocialFootprintMapper

def analyze_social_footprint(company_data: Dict, verbose: bool = True) -> Dict:
    """
    Analyze social media footprint for a company
    
    Args:
        company_data: Dictionary with name, domain, handles
        verbose: Print console output
    
    Returns:
        Analysis results
    """
    
    if not company_data.get('name'):
        return {'error': 'Company name is required'}
    
    sf = SocialFootprintMapper(verbose=verbose)
    
    result = sf.analyze_social_footprint(
        company_name=company_data.get('name'),
        domain=company_data.get('domain'),
        facebook_handle=company_data.get('facebook_handle'),
        twitter_handle=company_data.get('twitter_handle'),
        instagram_handle=company_data.get('instagram_handle'),
        glassdoor_handle=company_data.get('glassdoor_handle')
    )
    
    return result

def analyze_multiple_companies(companies: List[Dict], verbose: bool = True) -> Dict:
    """Analyze social footprint for multiple companies"""
    
    if not companies:
        return {'error': 'No companies provided'}
    
    sf = SocialFootprintMapper(verbose=verbose)
    results = sf.analyze_multiple(companies)
    
    return results


if __name__ == "__main__":
    print("Module 12: Social Media Footprint Mapping")
    print("Starting social footprint analysis...")
    print()
    
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
            if isinstance(data, dict):
                results = analyze_social_footprint(data, verbose=True)
            elif isinstance(data, list):
                results = analyze_multiple_companies(data, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            # Assume company name as string
            results = analyze_social_footprint({'name': ' '.join(sys.argv[1:])}, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, dict):
                results = analyze_social_footprint(data, verbose=True)
            elif isinstance(data, list):
                results = analyze_multiple_companies(data, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py '{\"name\":\"Google\",\"domain\":\"google.com\"}'")
            print("Or pipe JSON: echo '{\"name\":\"Google\"}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"social_footprint_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")