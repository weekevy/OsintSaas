"""
Main entry point for Module 4: Typosquatting & Brand Abuse
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from typosquatting_detector import TyposquattingDetector

def investigate_typosquatting(brand_domains: List[str], check_existing: bool = True, verbose: bool = True) -> Dict:
    """Investigate typosquatting for brand domains"""
    
    if not brand_domains:
        return {'error': 'No brand domains provided'}
    
    td = TyposquattingDetector(verbose=verbose)
    results = td.investigate_multiple(brand_domains)
    
    return results


if __name__ == "__main__":
    print("Module 4: Typosquatting & Brand Abuse Detection")
    print("Starting typosquatting investigation...")
    print()
    
    if len(sys.argv) > 1:
        domains = sys.argv[1:]
        results = investigate_typosquatting(domains, check_existing=True, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, dict) and 'brand_domains' in data:
                results = investigate_typosquatting(data['brand_domains'], check_existing=True, verbose=True)
            elif isinstance(data, list):
                results = investigate_typosquatting(data, check_existing=True, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py google.com microsoft.com")
            print("Or pipe JSON: echo '{\"brand_domains\":[\"google.com\"]}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"typosquatting_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")