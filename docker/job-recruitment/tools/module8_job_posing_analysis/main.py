"""
Main entry point for Module 8: Job Posting NLP & Pattern Analysis
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from job_analyzer import JobAnalyzer

def analyze_job_posting(job_data: Dict, verbose: bool = True) -> Dict:
    """
    Analyze a job posting
    
    Args:
        job_data: Dictionary with title, description, salary, url
        verbose: Print console output
    
    Returns:
        Analysis results
    """
    
    ja = JobAnalyzer(verbose=verbose)
    result = ja.analyze_job(job_data)
    
    return result

def analyze_multiple_jobs(jobs: List[Dict], verbose: bool = True) -> Dict:
    """Analyze multiple job postings"""
    
    if not jobs:
        return {'error': 'No jobs provided'}
    
    ja = JobAnalyzer(verbose=verbose)
    results = ja.analyze_multiple(jobs)
    
    return results


if __name__ == "__main__":
    print("Module 8: Job Posting NLP & Pattern Analysis")
    print("Starting job analysis...")
    print()
    
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
            if isinstance(data, dict):
                results = analyze_job_posting(data, verbose=True)
            elif isinstance(data, list):
                results = analyze_multiple_jobs(data, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            # Assume file path
            file_path = sys.argv[1]
            with open(file_path, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    results = analyze_job_posting(data, verbose=True)
                else:
                    results = analyze_multiple_jobs(data, verbose=True)
    else:
        try:
            data = json.loads(sys.stdin.read())
            if isinstance(data, dict):
                results = analyze_job_posting(data, verbose=True)
            elif isinstance(data, list):
                results = analyze_multiple_jobs(data, verbose=True)
            else:
                results = {'error': 'Invalid input format'}
        except:
            print("Usage: python main.py '{\"title\":\"Job Title\",\"description\":\"Job description\"}'")
            print("Or pipe JSON: echo '{\"title\":\"Job\"}' | python main.py")
            sys.exit(1)
    
    # Save output
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"job_analysis_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to {output_file}")