#!/usr/bin/env python0
"""
Job Recruitment Risk Assessment Tool
Analyzes job postings and returns risk scores
"""

import json
import sys
import re
from datetime import datetime
from urllib.parse import urlparse

class JobRiskAssessor:
    def __init__(self):
        self.suspicious_domains = [
            'bit.ly', 'tinyurl', 'short.link', 'rb.gy', 'tiny.cc',
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'
        ]
        
        self.suspicious_keywords = [
            'urgent', 'immediate hire', 'no experience needed', 'work from home',
            'earn quick money', 'get rich fast', 'sign up bonus', 'pay to apply',
            'deposit required', 'training fee', 'background check fee'
        ]
        
        self.legitimate_domains = [
            'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
            'careerbuilder.com', 'ziprecruiter.com', 'dice.com'
        ]

    def assess_job_url(self, job_url):
        """Assess risk based on job URL"""
        risk = 0
        reasons = []
        
        if not job_url:
            return 50, ["No job URL provided"]
        
        try:
            parsed = urlparse(job_url)
            domain = parsed.netloc.lower()
            
            # Check for suspicious domains
            for suspicious in self.suspicious_domains:
                if suspicious in domain:
                    risk += 25
                    reasons.append(f"Suspicious domain detected: {domain}")
                    break
            
            # Check for legitimate job platforms (reduce risk)
            for legit in self.legitimate_domains:
                if legit in domain:
                    risk -= 15
                    reasons.append(f"Job posted on legitimate platform: {legit}")
                    break
            
            # Check for HTTPS
            if parsed.scheme != 'https':
                risk += 10
                reasons.append("Website does not use HTTPS")
            
            # Check for URL length (phishing detection)
            if len(job_url) > 100:
                risk += 5
                reasons.append("Unusually long URL")
                
        except Exception as e:
            risk += 30
            reasons.append(f"Invalid URL format: {str(e)}")
        
        return min(100, max(0, risk)), reasons

    def assess_company(self, company_name, company_website):
        """Assess risk based on company information"""
        risk = 0
        reasons = []
        
        if not company_name:
            risk += 20
            reasons.append("Company name not provided")
        
        if company_website:
            try:
                parsed = urlparse(company_website)
                domain = parsed.netloc.lower()
                
                # Check for free hosting services
                free_hosting = ['wordpress', 'blogspot', 'wixsite', 'weebly', 'godaddysites']
                for host in free_hosting:
                    if host in domain:
                        risk += 20
                        reasons.append(f"Company uses free hosting: {domain}")
                        break
                
                # Check if company website matches job URL domain
                if job_url and hasattr(self, 'job_domain'):
                    if domain != self.job_domain:
                        risk += 15
                        reasons.append("Company website domain differs from job posting domain")
                        
            except:
                risk += 10
                reasons.append("Invalid company website format")
        else:
            risk += 15
            reasons.append("No company website provided")
        
        return min(100, max(0, risk)), reasons

    def assess_job_title(self, job_title):
        """Assess risk based on job title"""
        risk = 0
        reasons = []
        
        if not job_title:
            risk += 10
            reasons.append("Job title not provided")
            return risk, reasons
        
        title_lower = job_title.lower()
        
        # Check for suspicious keywords in job title
        for keyword in self.suspicious_keywords:
            if keyword in title_lower:
                risk += 15
                reasons.append(f"Suspicious keyword in job title: '{keyword}'")
                break
        
        # Check for unrealistic promises
        unrealistic = ['millionaire', 'billionaire', 'retire early', 'passive income']
        for word in unrealistic:
            if word in title_lower:
                risk += 25
                reasons.append(f"Unrealistic promise detected: '{word}'")
                break
        
        # Legitimate job titles reduce risk
        legitimate_titles = ['engineer', 'developer', 'manager', 'analyst', 'specialist']
        for legit in legitimate_titles:
            if legit in title_lower:
                risk -= 10
                reasons.append(f"Legitimate job title detected")
                break
        
        return min(100, max(0, risk)), reasons

    def assess_recruiter(self, recruiter_email, recruiter_phone):
        """Assess risk based on recruiter contact information"""
        risk = 0
        reasons = []
        
        if recruiter_email:
            email_lower = recruiter_email.lower()
            
            # Check for personal email domains
            personal_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
            for domain in personal_domains:
                if domain in email_lower:
                    risk += 25
                    reasons.append(f"Recruiter using personal email: {domain}")
                    break
            
            # Check email format
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, recruiter_email):
                risk += 15
                reasons.append("Invalid email format")
        
        if recruiter_phone:
            # Check phone number length
            phone_digits = re.sub(r'\D', '', recruiter_phone)
            if len(phone_digits) < 10:
                risk += 10
                reasons.append("Phone number appears incomplete")
            elif len(phone_digits) > 15:
                risk += 5
                reasons.append("Unusually long phone number")
        
        return min(100, max(0, risk)), reasons

    def assess_job_description(self, description):
        """Assess risk based on job description content"""
        risk = 0
        reasons = []
        
        if not description:
            return 0, reasons
        
        desc_lower = description.lower()
        
        # Count suspicious keywords
        suspicious_count = 0
        for keyword in self.suspicious_keywords:
            if keyword in desc_lower:
                suspicious_count += 1
        
        if suspicious_count > 0:
            risk += min(30, suspicious_count * 5)
            reasons.append(f"Found {suspicious_count} suspicious keywords in description")
        
        # Check for payment requests
        payment_keywords = ['fee', 'deposit', 'payment', 'wire transfer', 'send money']
        for keyword in payment_keywords:
            if keyword in desc_lower:
                risk += 20
                reasons.append(f"Payment request detected: '{keyword}'")
                break
        
        # Check for urgency tactics
        urgency_keywords = ['immediately', 'today', 'asap', 'urgent hire']
        for keyword in urgency_keywords:
            if keyword in desc_lower:
                risk += 5
                reasons.append(f"Urgency tactic detected")
                break
        
        return min(100, max(0, risk)), reasons

    def assess_all(self, data):
        """Run all assessments and return overall risk score"""
        total_risk = 0
        all_reasons = []
        
        # Assess job URL
        url_risk, url_reasons = self.assess_job_url(data.get('job_url', ''))
        total_risk += url_risk * 0.3
        all_reasons.extend(url_reasons)
        
        # Assess company
        company_risk, company_reasons = self.assess_company(
            data.get('company_name', ''),
            data.get('company_website', '')
        )
        total_risk += company_risk * 0.25
        all_reasons.extend(company_reasons)
        
        # Assess job title
        title_risk, title_reasons = self.assess_job_title(data.get('job_title', ''))
        total_risk += title_risk * 0.2
        all_reasons.extend(title_reasons)
        
        # Assess recruiter
        recruiter_risk, recruiter_reasons = self.assess_recruiter(
            data.get('recruiter_email', ''),
            data.get('recruiter_phone', '')
        )
        total_risk += recruiter_risk * 0.15
        all_reasons.extend(recruiter_reasons)
        
        # Assess job description
        desc_risk, desc_reasons = self.assess_job_description(data.get('job_description', ''))
        total_risk += desc_risk * 0.1
        all_reasons.extend(desc_reasons)
        
        # Calculate final risk score
        final_risk = round(total_risk)
        
        # Determine risk level
        if final_risk >= 70:
            risk_level = 'critical'
        elif final_risk >= 50:
            risk_level = 'high'
        elif final_risk >= 25:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'risk_score': final_risk,
            'risk_level': risk_level,
            'risk_factors': all_reasons[:5],  # Top 5 reasons
            'recommendations': self.generate_recommendations(all_reasons, final_risk)
        }
    
    def generate_recommendations(self, reasons, risk_score):
        """Generate recommendations based on findings"""
        recommendations = []
        
        if risk_score >= 70:
            recommendations.append("DO NOT PROCEED - This job posting shows strong scam indicators")
            recommendations.append("Report this job posting to the platform administrators")
        elif risk_score >= 50:
            recommendations.append("Exercise extreme caution - Verify company registration independently")
            recommendations.append("Do not share personal information or make any payments")
        
        if any('personal email' in r for r in reasons):
            recommendations.append("Contact the company directly using their official website to verify the recruiter")
        
        if any('free hosting' in r for r in reasons):
            recommendations.append("Legitimate companies typically have professional websites - verify through LinkedIn or other sources")
        
        if any('payment' in r for r in reasons):
            recommendations.append("Never pay for job applications - legitimate employers never ask for money")
        
        if not recommendations:
            recommendations.append("Proceed with standard verification - cross-reference company information")
            recommendations.append("Save all communication for reference")
        
        return recommendations[:3]

def main():
    """Main entry point for CLI usage"""
    if len(sys.argv) > 1:
        # Read JSON input from command line argument
        try:
            data = json.loads(sys.argv[1])
        except:
            data = {}
    else:
        # Read JSON input from stdin
        try:
            data = json.load(sys.stdin)
        except:
            data = {}
    
    # Run assessment
    assessor = JobRiskAssessor()
    result = assessor.assess_all(data)
    
    # Output result as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
