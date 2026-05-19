"""
Main entry point for Module 10: Evidence File Metadata & Forensics
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from file_forensics import FileForensics

def analyze_evidence_file(file_paths, virustotal_api_key: str = None, verbose: bool = True) -> Dict:
    """
    Analyze evidence file(s)
    
    Args:
        file_paths: Single file path or list of file paths
        virustotal_api_key: VirusTotal API key (optional)
        verbose: Print console output
    
    Returns:
        Analysis results
    """
    
    ff = FileForensics(verbose=verbose, virustotal_api_key=virustotal_api_key)
    
    if isinstance(file_paths, str):
        file_paths = [file_paths]
    
    if len(file_paths) == 1:
        result = ff.analyze_file(file_paths[0])
    else:
        result = ff.analyze_multiple(file_paths)
    
    return result


if __name__ == "__main__":
    print("Module 10: Evidence File Metadata & Forensics")
    print("Starting file analysis...")
    print()
    
    vt_key = None  # Add your VirusTotal API key here
    
    if len(sys.argv) > 1:
        file_paths = sys.argv[1:]
        results = analyze_evidence_file(file_paths, virustotal_api_key=vt_key, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, list):
                results = analyze_evidence_file(data, virustotal_api_key=vt_key, verbose=True)
            elif isinstance(data, dict) and 'files' in data:
                results = analyze_evidence_file(data['files'], virustotal_api_key=vt_key, verbose=True)
            elif isinstance(data, str):
                results = analyze_evidence_file(data, virustotal_api_key=vt_key, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py file1.pdf file2.jpg")
            print("Or pipe JSON: echo '[\"file1.pdf\",\"file2.jpg\"]' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"file_forensics_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")
    