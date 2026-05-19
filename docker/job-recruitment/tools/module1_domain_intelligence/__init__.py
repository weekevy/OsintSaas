"""
Module 1: Domain Intelligence
Passive DNS/WHOIS/Reputation investigation

This module provides domain investigation capabilities including:
- Domain age checking
- WHOIS privacy detection
- Registrar reputation analysis
- Domain history tracking
- MX record verification
"""

from .domain_intelligence import DomainIntelligence
# from .main import investigate_domains, extract_domains_from_input

__version__ = "1.0.0"
__author__ = "Job Scam Investigator"
__all__ = [
    'DomainIntelligence',
    'investigate_domains',
    'extract_domains_from_input'
]

# Module metadata
MODULE_NAME = "Domain Intelligence"
MODULE_DESCRIPTION = "Passive domain investigation for scam detection"
MODULE_VERSION = "1.0.0"