"""
Main entry point for Module 5: SSL/TLS Certificate Deep Analysis
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from ssl_analyzer import SSLAnalyzer

def analyze_ssl_certificate(domains: List[str], verbose: bool = True) -> Dict:
    """Analyze SSL certificates for domains"""
    
    if not domains:
        return {'error': 'No domains provided'}
    
    sa = SSLAnalyzer(verbose=verbose)
    results = sa.analyze_multiple(domains)
    
    return results


if __name__ == "__main__":
    print("Module 5: SSL/TLS Certificate Deep Analysis")
    print("Starting SSL analysis...")
    print()
    
    if len(sys.argv) > 1:
        domains = sys.argv[1:]
        results = analyze_ssl_certificate(domains, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, dict) and 'domains' in data:
                results = analyze_ssl_certificate(data['domains'], verbose=True)
            elif isinstance(data, list):
                results = analyze_ssl_certificate(data, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py google.com example.com")
            print("Or pipe JSON: echo '{\"domains\":[\"google.com\"]}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"ssl_analysis_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")