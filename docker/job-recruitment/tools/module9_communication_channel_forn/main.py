"""
Main entry point for Module 9: Communication Channel Forensics
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from channel_analyzer import ChannelAnalyzer

def analyze_communication(comm_data: Dict, hibp_api_key: str = None, verbose: bool = True) -> Dict:
    """
    Analyze communication channel
    
    Args:
        comm_data: Dictionary with channel, phone, telegram_username, company_country
        hibp_api_key: HaveIBeenPwned API key
        verbose: Print console output
    
    Returns:
        Analysis results
    """
    
    ca = ChannelAnalyzer(verbose=verbose, hibp_api_key=hibp_api_key)
    result = ca.analyze_communication(comm_data)
    
    return result


if __name__ == "__main__":
    print("Module 9: Communication Channel Forensics")
    print("Starting communication analysis...")
    print()
    
    hibp_key = None  # Add your key here
    
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
            results = analyze_communication(data, hibp_api_key=hibp_key, verbose=True)
        except:
            print("Usage: python main.py '{\"channel\":\"telegram\",\"phone\":\"+1234567890\"}'")
            sys.exit(1)
    else:
        try:
            data = json.loads(sys.stdin.read())
            results = analyze_communication(data, hibp_api_key=hibp_key, verbose=True)
        except:
            print("Usage: echo '{\"channel\":\"telegram\"}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"communication_analysis_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")