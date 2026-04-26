import requests
import socket
import ssl

def run_security_scan(target_url):
    """
    Performs basic, non-intrusive security checks on a target URL.
    Returns a list of detected vulnerabilities.
    """
    vulnerabilities = []
    
    # 1. Strip the URL down to just the domain (e.g., from https://google.com to google.com)
    domain = target_url.replace("https://", "").replace("http://", "").split('/')[0]

    # --- CHECK 1: Missing HTTPS / SSL Security ---
    if not target_url.startswith("https"):
        vulnerabilities.append({
            "technical_name": "Missing TLS/SSL Encryption",
            "plain_language_alert": "Your website is not using a secure HTTPS connection. Hackers can easily intercept passwords or customer data entered on your site.",
            "severity": "CRITICAL"
        })

    # --- CHECK 2: Missing Security Headers ---
    try:
        response = requests.get(f"https://{domain}", timeout=5)
        headers = response.headers
        
        if 'Content-Security-Policy' not in headers:
            vulnerabilities.append({
                "technical_name": "Missing Content-Security-Policy (CSP)",
                "plain_language_alert": "Your site is vulnerable to malicious code injection. If a hacker leaves a bad link in your comments, it could steal data from other visitors.",
                "severity": "MEDIUM"
            })
            
        if 'Strict-Transport-Security' not in headers:
            vulnerabilities.append({
                "technical_name": "Missing HSTS Header",
                "plain_language_alert": "Your website doesn't force visitors to use a secure connection, leaving a loophole for attackers to downgrade your security.",
                "severity": "MEDIUM"
            })
            
    except requests.exceptions.RequestException:
        vulnerabilities.append({
            "technical_name": "Host Unreachable",
            "plain_language_alert": "We could not reach your website to scan it. It might be down or blocking automated bots.",
            "severity": "LOW"
        })

    return vulnerabilities