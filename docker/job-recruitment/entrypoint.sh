#!/bin/bash

echo "========================================="
echo "Job Recruitment OSINT Tool Container"
echo "========================================="
echo "Tools available:"
echo "  - LinkedIn Scraper"
echo "  - Company Checker"
echo "  - Email Validator"
echo "  - Phone Validator"
echo "  - Website Analyzer"
echo "  - Shodan Integration"
echo "  - Censys Integration"
echo "  - VirusTotal Integration"
echo "========================================="
echo ""

# Check if API keys are set
if [ -z "$SHODAN_API_KEY" ]; then
    echo "⚠️  SHODAN_API_KEY not set"
fi

if [ -z "$CENSYS_API_ID" ]; then
    echo "⚠️  CENSYS_API_ID not set"
fi

if [ -z "$VIRUSTOTAL_API_KEY" ]; then
    echo "⚠️  VIRUSTOTAL_API_KEY not set"
fi

echo ""
echo "Container is ready!"
echo ""

# Execute the command passed to docker run
exec "$@"
