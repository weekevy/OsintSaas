"""
Module 10: Evidence File Metadata & Forensics
Image forensics (EXIF, ELA, metadata consistency, steganography)
PDF/DOCX forensics (hidden layers, JS, revision history, URLs)
File hash intelligence (MD5/SHA256, VirusTotal, Google search)
"""

from .evidence_file_metadata import FileForensics
# from .main import analyze_evidence_file

__version__ = "1.0.0"
__author__ = "Job Scam Investigator"
__all__ = ['FileForensics', 'analyze_evidence_file']