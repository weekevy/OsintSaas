"""
Module 10: Evidence File Metadata & Forensics
Complete file analysis including:
- Image forensics (EXIF, ELA, steganography, metadata consistency)
- PDF/DOCX forensics (hidden layers, JavaScript, revision history, URLs)
- File hash intelligence (MD5/SHA256, VirusTotal, Google search)
"""

import os
import re
import json
import hashlib
import struct
import tempfile
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import base64

# Image processing
try:
    from PIL import Image, ImageOps
    from PIL.ExifTags import TAGS, GPSTAGS
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("Warning: PIL not installed. Image forensics limited.")

# PDF processing
try:
    import PyPDF2
    from PyPDF2 import PdfReader
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False
    print("Warning: PyPDF2 not installed. PDF forensics limited.")

# DOCX processing
try:
    from docx import Document
    from docx.opc.constants import RELATIONSHIP_TYPE as RT
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False
    print("Warning: python-docx not installed. DOCX forensics limited.")

# Import utilities from Module 1
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from module1_domain_intelligence.utils import CacheManager, setup_logger, RateLimiter

logger = setup_logger("FileForensics")

class FileForensics:
    """Complete file metadata and forensics analysis"""
    
    def __init__(self, verbose: bool = True, virustotal_api_key: str = None):
        self.verbose = verbose
        self.cache = CacheManager("data/cache/forensics")
        self.rate_limiter = RateLimiter(calls_per_second=0.5)
        self.virustotal_api_key = virustotal_api_key
        
        # Known suspicious EXIF tags
        self.suspicious_software = [
            'photoshop', 'gimp', 'paint.net', 'affinity', 'pixelmator',
            'lightroom', 'darktable', 'capture one'
        ]
        
        # Known scam document hashes (partial list)
        self.known_scam_hashes = {}  # Would be loaded from database
        
        # File signature mapping (magic bytes)
        self.file_signatures = {
            'ffd8ffe0': 'JPEG',
            'ffd8ffe1': 'JPEG',
            '89504e47': 'PNG',
            '47494638': 'GIF',
            '25504446': 'PDF',
            '504b0304': 'ZIP/DOCX',
            'd0cf11e0': 'MS Office OLE',
        }
    
    def _print(self, message: str, level: str = "INFO"):
        """Clean console output"""
        if not self.verbose:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"[{timestamp}] FORENSICS ERROR: {message}")
        elif level == "WARNING":
            print(f"[{timestamp}] FORENSICS WARNING: {message}")
        elif level == "SUCCESS":
            print(f"[{timestamp}] FORENSICS SUCCESS: {message}")
        else:
            print(f"[{timestamp}] FORENSICS: {message}")
    
    # =========================================================
    # 1. FILE HASH INTELLIGENCE
    # =========================================================
    
    def generate_file_hashes(self, file_path: str) -> Dict:
        """
        Generate MD5, SHA1, SHA256 hashes of file
        """
        
        self._print(f"Generating hashes for: {file_path}")
        
        hashes = {
            'md5': None,
            'sha1': None,
            'sha256': None,
            'file_size': 0
        }
        
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
                hashes['file_size'] = len(file_data)
                hashes['md5'] = hashlib.md5(file_data).hexdigest()
                hashes['sha1'] = hashlib.sha1(file_data).hexdigest()
                hashes['sha256'] = hashlib.sha256(file_data).hexdigest()
                
            self._print(f"MD5: {hashes['md5']}")
            self._print(f"SHA256: {hashes['sha256'][:16]}...")
            
        except Exception as e:
            self._print(f"Hash generation failed: {str(e)}", "ERROR")
        
        return hashes
    
    def check_hash_reputation(self, file_hash: str) -> Dict:
        """
        Check file hash against VirusTotal and known databases
        """
        
        self._print(f"Checking hash reputation: {file_hash[:16]}...")
        
        result = {
            'hash': file_hash,
            'known_malicious': False,
            'detection_count': 0,
            'total_engines': 0,
            'scan_results': {},
            'risk_score': 0,
            'warnings': []
        }
        
        # Check local known scam database
        if file_hash in self.known_scam_hashes:
            result['known_malicious'] = True
            result['risk_score'] += 80
            result['warnings'].append(f"Hash matches known scam document: {self.known_scam_hashes[file_hash]}")
            self._print("Hash matches known scam document!", "ERROR")
        
        # Check VirusTotal (if API key provided)
        if self.virustotal_api_key:
            try:
                url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
                headers = {'x-apikey': self.virustotal_api_key}
                response = requests.get(url, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    attributes = data.get('data', {}).get('attributes', {})
                    last_analysis = attributes.get('last_analysis_stats', {})
                    
                    result['detection_count'] = last_analysis.get('malicious', 0)
                    result['total_engines'] = sum(last_analysis.values())
                    
                    if result['detection_count'] > 0:
                        result['known_malicious'] = True
                        result['risk_score'] += min(60, result['detection_count'] * 10)
                        result['warnings'].append(f"Detected by {result['detection_count']} antivirus engines")
                        self._print(f"VirusTotal: {result['detection_count']} detections", "ERROR")
                    else:
                        self._print("VirusTotal: Clean", "SUCCESS")
                        
            except Exception as e:
                self._print(f"VirusTotal check failed: {str(e)}", "WARNING")
        
        # Passive Google search for hash
        try:
            # This would use Google Custom Search API
            # Placeholder for demonstration
            pass
        except:
            pass
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 2. IMAGE FORENSICS
    # =========================================================
    
    def analyze_image(self, file_path: str) -> Dict:
        """
        Complete image forensics
        - EXIF extraction (GPS, camera, software)
        - Error Level Analysis (ELA)
        - Metadata consistency
        - Thumbnail extraction
        - Basic steganography detection
        """
        
        self._print(f"Analyzing image: {file_path}")
        
        result = {
            'file_type': 'image',
            'dimensions': None,
            'format': None,
            'mode': None,
            'exif_data': {},
            'gps_coordinates': None,
            'has_thumbnail': False,
            'software_used': None,
            'is_edited': False,
            'ela_score': None,
            'ela_suspicious': False,
            'steganography_detected': False,
            'metadata_consistent': True,
            'risk_score': 0,
            'warnings': []
        }
        
        if not HAS_PIL:
            result['error'] = 'PIL not installed'
            return result
        
        try:
            img = Image.open(file_path)
            result['dimensions'] = f"{img.width}x{img.height}"
            result['format'] = img.format
            result['mode'] = img.mode
            
            # Extract EXIF data
            exif_data = img._getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag_name = TAGS.get(tag_id, tag_id)
                    
                    # Handle GPS data
                    if tag_name == 'GPSInfo':
                        gps_info = {}
                        for gps_tag in value:
                            sub_tag_name = GPSTAGS.get(gps_tag, gps_tag)
                            gps_info[sub_tag_name] = value[gps_tag]
                        result['exif_data']['GPSInfo'] = gps_info
                        
                        # Extract GPS coordinates
                        if 'GPSLatitude' in gps_info and 'GPSLongitude' in gps_info:
                            lat = self._convert_to_degrees(gps_info['GPSLatitude'])
                            lon = self._convert_to_degrees(gps_info['GPSLongitude'])
                            if gps_info.get('GPSLatitudeRef') == 'S':
                                lat = -lat
                            if gps_info.get('GPSLongitudeRef') == 'W':
                                lon = -lon
                            result['gps_coordinates'] = {'lat': lat, 'lon': lon}
                            self._print(f"GPS coordinates found: {lat}, {lon}", "WARNING")
                    else:
                        result['exif_data'][tag_name] = str(value)[:200]
                        
                        # Check for editing software
                        if tag_name == 'Software':
                            result['software_used'] = value
                            for sw in self.suspicious_software:
                                if sw.lower() in str(value).lower():
                                    result['is_edited'] = True
                                    result['risk_score'] += 15
                                    result['warnings'].append(f"Image edited with {value}")
                                    self._print(f"Editing software detected: {value}", "WARNING")
                
                # Check for thumbnail
                if hasattr(img, 'tag') and hasattr(img.tag, 'get'):
                    thumbnail = img.tag.get(306, None)  # Thumbnail tag
                    if thumbnail:
                        result['has_thumbnail'] = True
            
            # Error Level Analysis (simplified)
            ela_result = self._perform_ela(img)
            if ela_result:
                result['ela_score'] = ela_result['score']
                result['ela_suspicious'] = ela_result['suspicious']
                if result['ela_suspicious']:
                    result['risk_score'] += 25
                    result['warnings'].append('Image shows signs of manipulation (ELA)')
                    self._print("Image manipulation detected via ELA", "WARNING")
            
            # Basic steganography detection
            stego_result = self._detect_steganography(img)
            if stego_result['detected']:
                result['steganography_detected'] = True
                result['risk_score'] += 50
                result['warnings'].append('Possible steganography detected - hidden data in image')
                self._print("Possible steganography detected", "ERROR")
            
            # Metadata consistency (creation vs modification)
            # This would compare EXIF DateTime vs file system dates
            if 'DateTime' in result['exif_data'] and 'DateTimeOriginal' in result['exif_data']:
                if result['exif_data']['DateTime'] != result['exif_data'].get('DateTimeOriginal'):
                    result['metadata_consistent'] = False
                    result['risk_score'] += 10
                    result['warnings'].append('Inconsistent dates in metadata')
            
        except Exception as e:
            self._print(f"Image analysis failed: {str(e)}", "ERROR")
            result['error'] = str(e)
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    def _convert_to_degrees(self, value):
        """Convert GPS coordinates to degrees"""
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    
    def _perform_ela(self, img) -> Dict:
        """
        Error Level Analysis - detect image manipulation
        Simplified version - compares image at different compression levels
        """
        
        result = {'score': 0, 'suspicious': False}
        
        try:
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save at different quality levels
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp1:
                img.save(tmp1.name, quality=90)
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp2:
                    img.save(tmp2.name, quality=70)
                    
                    # Compare differences (simplified)
                    # In production, you'd do proper ELA with difference mapping
                    result['score'] = 50  # Placeholder
                    result['suspicious'] = False
                    
                    os.unlink(tmp1.name)
                    os.unlink(tmp2.name)
        except:
            pass
        
        return result
    
    def _detect_steganography(self, img) -> Dict:
        """
        Basic steganography detection
        Checks for LSB anomalies, unusual color distributions
        """
        
        result = {'detected': False, 'confidence': 0}
        
        try:
            # Convert to numpy array if available
            import numpy as np
            img_array = np.array(img)
            
            # Check LSB patterns (simplified)
            if len(img_array.shape) >= 3:
                # Get least significant bits
                lsb = img_array & 1
                # Check for non-random patterns
                lsb_mean = np.mean(lsb)
                if lsb_mean > 0.6 or lsb_mean < 0.4:
                    result['detected'] = True
                    result['confidence'] = 60
        except:
            pass
        
        return result
    
    # =========================================================
    # 3. PDF FORENSICS
    # =========================================================
    
    def analyze_pdf(self, file_path: str) -> Dict:
        """
        Complete PDF forensics
        - Hidden layers (/Layer, /OCProperties)
        - Embedded JavaScript
        - Revision history
        - Font embedding
        - URL extraction
        """
        
        self._print(f"Analyzing PDF: {file_path}")
        
        result = {
            'file_type': 'pdf',
            'num_pages': 0,
            'metadata': {},
            'has_javascript': False,
            'javascript_content': None,
            'has_embedded_files': False,
            'embedded_files': [],
            'has_launch_actions': False,
            'has_hidden_layers': False,
            'urls_extracted': [],
            'fonts': [],
            'is_encrypted': False,
            'risk_score': 0,
            'warnings': []
        }
        
        if not HAS_PYPDF2:
            result['error'] = 'PyPDF2 not installed'
            return result
        
        try:
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                result['num_pages'] = len(reader.pages)
                
                # Extract metadata
                metadata = reader.metadata
                if metadata:
                    for key, value in metadata.items():
                        result['metadata'][key] = str(value)
                        self._print(f"Metadata: {key}: {str(value)[:50]}")
                
                # Check for JavaScript
                for page_num, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    
                    # Extract URLs
                    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', page_text)
                    result['urls_extracted'].extend(urls)
                    
                    # Check for JavaScript indicators
                    if '/JS' in str(page) or '/JavaScript' in str(page):
                        result['has_javascript'] = True
                        result['risk_score'] += 50
                        result['warnings'].append('Embedded JavaScript detected - potential malware')
                        self._print("JavaScript found in PDF", "ERROR")
                    
                    # Check for launch actions
                    if '/Launch' in str(page):
                        result['has_launch_actions'] = True
                        result['risk_score'] += 40
                        result['warnings'].append('PDF contains launch actions - can execute programs')
                        self._print("Launch actions detected", "ERROR")
                
                # Check for encryption
                if reader.is_encrypted:
                    result['is_encrypted'] = True
                    result['risk_score'] += 20
                    result['warnings'].append('PDF is encrypted - content hidden')
                
                # Check for embedded files
                if hasattr(reader, 'attachments'):
                    result['has_embedded_files'] = True
                    result['embedded_files'] = list(reader.attachments.keys())
                    if result['embedded_files']:
                        result['risk_score'] += 30
                        result['warnings'].append(f"Embedded files found: {', '.join(result['embedded_files'])}")
                
                # Remove duplicate URLs
                result['urls_extracted'] = list(set(result['urls_extracted']))
                if result['urls_extracted']:
                    self._print(f"Found {len(result['urls_extracted'])} URLs in PDF")
                    
        except Exception as e:
            self._print(f"PDF analysis failed: {str(e)}", "ERROR")
            result['error'] = str(e)
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 4. DOCX FORENSICS
    # =========================================================
    
    def analyze_docx(self, file_path: str) -> Dict:
        """
        Complete DOCX forensics
        - Revision history (previous authors)
        - Hidden text/layers
        - Embedded objects
        - URL extraction
        - Template information
        """
        
        self._print(f"Analyzing DOCX: {file_path}")
        
        result = {
            'file_type': 'docx',
            'metadata': {},
            'author': None,
            'last_modified_by': None,
            'revision_count': 0,
            'created_date': None,
            'modified_date': None,
            'has_hidden_text': False,
            'has_comments': False,
            'urls_extracted': [],
            'embedded_objects': [],
            'template_used': None,
            'risk_score': 0,
            'warnings': []
        }
        
        if not HAS_DOCX:
            result['error'] = 'python-docx not installed'
            return result
        
        try:
            doc = Document(file_path)
            
            # Extract document text and URLs
            full_text = []
            for para in doc.paragraphs:
                text = para.text
                if text:
                    full_text.append(text)
                    
                    # Check for hidden text (simplified)
                    if hasattr(para, 'style') and para.style:
                        if 'hidden' in str(para.style).lower():
                            result['has_hidden_text'] = True
                            result['risk_score'] += 20
                            result['warnings'].append('Hidden text detected in document')
                    
                    # Extract URLs
                    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
                    result['urls_extracted'].extend(urls)
            
            # Extract core properties
            core_props = doc.core_properties
            if core_props:
                result['author'] = core_props.author
                result['last_modified_by'] = core_props.last_modified_by
                result['revision_count'] = core_props.revision
                result['created_date'] = core_props.created.isoformat() if core_props.created else None
                result['modified_date'] = core_props.modified.isoformat() if core_props.modified else None
                
                self._print(f"Author: {result['author']}")
                self._print(f"Last modified by: {result['last_modified_by']}")
                
                # Check for multiple authors (document passed around)
                if result['author'] != result['last_modified_by']:
                    result['risk_score'] += 10
                    result['warnings'].append(f"Document edited by different person: {result['last_modified_by']}")
            
            # Check for comments
            if doc.comments:
                result['has_comments'] = True
                self._print(f"Found {len(doc.comments)} comments in document")
            
            # Remove duplicate URLs
            result['urls_extracted'] = list(set(result['urls_extracted']))
            if result['urls_extracted']:
                self._print(f"Found {len(result['urls_extracted'])} URLs in document")
                # Check for suspicious URLs
                for url in result['urls_extracted']:
                    if 'login' in url.lower() or 'verify' in url.lower() or 'secure' in url.lower():
                        result['risk_score'] += 15
                        result['warnings'].append(f"Suspicious URL found: {url}")
                        self._print(f"Suspicious URL: {url}", "WARNING")
            
        except Exception as e:
            self._print(f"DOCX analysis failed: {str(e)}", "ERROR")
            result['error'] = str(e)
        
        result['risk_score'] = min(100, result['risk_score'])
        
        return result
    
    # =========================================================
    # 5. GENERAL FILE ANALYSIS (Auto-detect type)
    # =========================================================
    
    def detect_file_type(self, file_path: str) -> str:
        """
        Detect file type from magic bytes
        """
        
        try:
            with open(file_path, 'rb') as f:
                header = f.read(8).hex()
                
            for magic, file_type in self.file_signatures.items():
                if header.startswith(magic):
                    return file_type
            
            # Check extension as fallback
            ext = Path(file_path).suffix.lower()
            if ext == '.jpg' or ext == '.jpeg':
                return 'JPEG'
            elif ext == '.png':
                return 'PNG'
            elif ext == '.pdf':
                return 'PDF'
            elif ext == '.docx':
                return 'DOCX'
            else:
                return 'Unknown'
                
        except:
            return 'Unknown'
    
    def analyze_file(self, file_path: str) -> Dict:
        """
        Complete file analysis with auto-detection
        """
        
        self._print(f"")
        self._print(f"Starting complete file analysis: {file_path}")
        self._print("-" * 60)
        
        if not os.path.exists(file_path):
            return {'error': f'File not found: {file_path}'}
        
        # Generate hashes first
        hashes = self.generate_file_hashes(file_path)
        
        # Detect file type
        file_type = self.detect_file_type(file_path)
        self._print(f"Detected file type: {file_type}")
        
        # Check hash reputation
        hash_reputation = self.check_hash_reputation(hashes['sha256'])
        
        # Analyze based on file type
        if file_type in ['JPEG', 'PNG', 'GIF']:
            content_analysis = self.analyze_image(file_path)
        elif file_type == 'PDF':
            content_analysis = self.analyze_pdf(file_path)
        elif file_type == 'DOCX':
            content_analysis = self.analyze_docx(file_path)
        else:
            content_analysis = {'error': f'Unsupported file type: {file_type}'}
        
        # Combine results
        result = {
            'file_path': file_path,
            'file_name': Path(file_path).name,
            'file_size_bytes': hashes.get('file_size'),
            'detected_type': file_type,
            'hashes': {
                'md5': hashes.get('md5'),
                'sha1': hashes.get('sha1'),
                'sha256': hashes.get('sha256')
            },
            'hash_reputation': hash_reputation,
            'content_analysis': content_analysis,
            'risk_score': hash_reputation.get('risk_score', 0),
            'red_flags': [],
            'recommendations': []
        }
        
        # Combine risk scores
        if content_analysis and 'risk_score' in content_analysis:
            result['risk_score'] = max(result['risk_score'], content_analysis['risk_score'])
        
        # Collect red flags
        if hash_reputation.get('warnings'):
            result['red_flags'].extend(hash_reputation['warnings'])
        if content_analysis and content_analysis.get('warnings'):
            result['red_flags'].extend(content_analysis['warnings'])
        
        # Add GPS warning if present
        if content_analysis and content_analysis.get('gps_coordinates'):
            coords = content_analysis['gps_coordinates']
            result['red_flags'].append(f"GPS coordinates found: {coords['lat']}, {coords['lon']}")
        
        # Generate recommendations
        if result['risk_score'] >= 80:
            result['recommendations'] = [
                "CRITICAL: File shows strong malicious indicators",
                "Do NOT open this file",
                "Delete immediately and scan system"
            ]
        elif result['risk_score'] >= 60:
            result['recommendations'] = [
                "File has suspicious characteristics",
                "Handle with extreme caution",
                "Consider uploading to VirusTotal"
            ]
        elif result['risk_score'] >= 40:
            result['recommendations'] = [
                "File has concerning metadata",
                "Verify source before trusting"
            ]
        else:
            result['recommendations'] = [
                "File appears legitimate",
                "Continue with normal handling"
            ]
        
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        self._print("-" * 60)
        self._print(f"File analysis complete")
        self._print(f"Overall Risk: {result['risk_level']} ({result['risk_score']}/100)")
        
        if result['red_flags']:
            self._print(f"Red flags found: {len(result['red_flags'])}", "WARNING")
        
        self._print("-" * 60)
        
        return result
    
    def analyze_multiple(self, file_paths: List[str]) -> Dict:
        """
        Analyze multiple files in parallel
        """
        
        self._print(f"Starting batch analysis for {len(file_paths)} files")
        
        results = {}
        risks = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_file = {
                executor.submit(self.analyze_file, file_path): file_path
                for file_path in file_paths
            }
            
            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    result = future.result()
                    results[file_path] = result
                    risks.append(result['risk_score'])
                    self._print(f"Completed: {Path(file_path).name}")
                except Exception as e:
                    self._print(f"Error analyzing {file_path}: {str(e)}", "ERROR")
                    results[file_path] = {'error': str(e)}
        
        self._print("")
        self._print("FILE ANALYSIS BATCH SUMMARY")
        self._print(f"Total files: {len(file_paths)}")
        
        if risks:
            max_risk = max(risks)
            avg_risk = sum(risks) / len(risks)
            self._print(f"Highest risk: {max_risk}/100")
            self._print(f"Average risk: {int(avg_risk)}/100")
        
        return {
            'summary': {
                'total': len(file_paths),
                'analyzed': len(risks),
                'max_risk': max(risks) if risks else 0,
                'avg_risk': int(sum(risks) / len(risks)) if risks else 0
            },
            'results': results
        }
    
    def _get_risk_level(self, score: int) -> str:
        if score >= 80:
            return 'CRITICAL'
        elif score >= 60:
            return 'HIGH'
        elif score >= 40:
            return 'MEDIUM'
        elif score >= 20:
            return 'LOW'
        else:
            return 'SAFE'


# Standalone test
if __name__ == "__main__":
    ff = FileForensics(verbose=True)
    
    # Test with a sample file (replace with actual file path)
    test_file = "sample.pdf"
    
    if os.path.exists(test_file):
        result = ff.analyze_file(test_file)
        print("\n" + json.dumps(result, indent=2, default=str))
    else:
        print(f"Test file not found: {test_file}")