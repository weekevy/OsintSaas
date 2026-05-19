"""
Main entry point for Module 14: Temporal & Geospatial Analysis
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict
from dateutil import parser

sys.path.insert(0, str(Path(__file__).parent))
from geo_temporal_analyzer import GeoTemporalAnalyzer

def parse_datetime(dt_str):
    """Parse datetime string to datetime object"""
    if isinstance(dt_str, datetime):
        return dt_str
    if isinstance(dt_str, str):
        try:
            return parser.parse(dt_str)
        except:
            return None
    return None

def analyze_geo_temporal(analysis_data: Dict, google_maps_key: str = None, 
                         ipinfo_key: str = None, verbose: bool = True) -> Dict:
    """
    Analyze temporal and geospatial data
    
    Args:
        analysis_data: Dictionary with time and location data
        google_maps_key: Google Maps API key
        ipinfo_key: IPinfo API key
        verbose: Print console output
    
    Returns:
        Analysis results
    """
    
    # Parse datetime fields
    for field in ['job_posting_time', 'application_time', 'response_time', 
                  'domain_registration_date', 'ssl_issue_date']:
        if field in analysis_data:
            analysis_data[field] = parse_datetime(analysis_data[field])
    
    gta = GeoTemporalAnalyzer(verbose=verbose, 
                              google_maps_api_key=google_maps_key,
                              ipinfo_api_key=ipinfo_key)
    
    result = gta.analyze_geo_temporal(analysis_data)
    
    return result


if __name__ == "__main__":
    print("Module 14: Temporal & Geospatial Analysis")
    print("Starting analysis...")
    print()
    
    google_key = None  # Add your Google Maps API key
    ipinfo_key = None  # Add your IPinfo API key
    
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
            results = analyze_geo_temporal(data, google_maps_key=google_key, 
                                          ipinfo_key=ipinfo_key, verbose=True)
        except:
            print("Usage: python main.py '{\"job_posting_time\":\"2026-05-19T03:30:00\",\"company_country\":\"US\"}'")
            sys.exit(1)
    else:
        try:
            data = json.loads(sys.stdin.read())
            results = analyze_geo_temporal(data, google_maps_key=google_key,
                                          ipinfo_key=ipinfo_key, verbose=True)
        except:
            print("Usage: echo '{\"job_posting_time\":\"2026-05-19T03:30:00\"}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"geo_temporal_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str, ensure_ascii=False)
    
    print(f"\nResults saved to {output_file}")