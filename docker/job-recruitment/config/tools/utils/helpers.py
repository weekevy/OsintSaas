"""
Utility functions for job recruitment tools
"""

import json
import csv
import yaml
import logging
from datetime import datetime
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

def load_config(config_path: str = "/app/config/tools_config.yaml") -> Dict:
    """Load configuration from YAML file"""
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.error(f"Error loading config: {e}")
        return {}

def save_results(data: Dict, filename: str = None) -> str:
    """Save results to file"""
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"/app/output/results_{timestamp}.json"
    
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        logger.info(f"Results saved to {filename}")
        return filename
    except Exception as e:
        logger.error(f"Error saving results: {e}")
        return ""

def export_to_csv(data: List[Dict], filename: str = None) -> str:
    """Export data to CSV"""
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"/app/output/export_{timestamp}.csv"
    
    try:
        if data:
            keys = data[0].keys()
            with open(filename, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(data)
        logger.info(f"Data exported to {filename}")
        return filename
    except Exception as e:
        logger.error(f"Error exporting to CSV: {e}")
        return ""

def validate_input(data: Any, expected_type: type) -> bool:
    """Validate input data type"""
    return isinstance(data, expected_type)

def format_report(data: Dict, format_type: str = "json") -> str:
    """Format data as report"""
    if format_type == "json":
        return json.dumps(data, indent=2, default=str)
    elif format_type == "yaml":
        return yaml.dump(data, default_flow_style=False)
    else:
        return str(data)
