"""
Main entry point for Module 3: Infrastructure Mapping
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from infrastructure_mapping import InfrastructureMapping

def investigate_infrastructure(domains: List[str], securitytrails_api_key: str = None, verbose: bool = True) -> Dict:
    """Investigate infrastructure for one or more domains"""
    
    if not domains:
        return {'error': 'No domains provided'}
    
    im = InfrastructureMapping(verbose=verbose, securitytrails_api_key=securitytrails_api_key)
    results = im.investigate_multiple(domains)
    
    return results


if __name__ == "__main__":
    print("Module 3: Infrastructure Mapping")
    print("Starting infrastructure investigation...")
    print()
    
    securitytrails_key = None  # Add your key here or from env
    
    if len(sys.argv) > 1:
        domains = sys.argv[1:]
        results = investigate_infrastructure(domains, securitytrails_api_key=securitytrails_key, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, dict) and 'domains' in data:
                results = investigate_infrastructure(data['domains'], securitytrails_api_key=securitytrails_key, verbose=True)
            elif isinstance(data, list):
                results = investigate_infrastructure(data, securitytrails_api_key=securitytrails_key, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py domain1.com domain2.com")
            print("Or pipe JSON: echo '{\"domains\":[\"example.com\"]}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"infrastructure_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")