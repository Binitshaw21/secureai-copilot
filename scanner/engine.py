import requests
import json
import os
from dotenv import load_dotenv
from google import genai

# Load the secret key from your .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

def run_security_scan(target_url):
    # --- MOVED INSIDE THE FUNCTION ---
    # This prevents the server from crashing on boot if the key loads a millisecond late!
    client = genai.Client()
    
    domain = target_url.replace("https://", "").replace("http://", "").split('/')[0]
    raw_findings = []
    
    # --- 1. Perform the raw technical checks ---
    if not target_url.startswith("https"):
        raw_findings.append("Missing TLS/SSL Encryption")
        
    try:
        response = requests.get(f"https://{domain}", timeout=5)
        if 'Content-Security-Policy' not in response.headers:
            raw_findings.append("Missing Content-Security-Policy (CSP) Header")
        if 'Strict-Transport-Security' not in response.headers:
            raw_findings.append("Missing HSTS Header")
    except:
        raw_findings.append("Host Unreachable or Blocking Automated Scans")

    if not raw_findings:
        return []

    # --- 2. Inject the AI to translate for the user ---
    prompt = f"""
    You are a cybersecurity expert consulting for a small business. 
    We scanned their website ({domain}) and found these technical issues: {', '.join(raw_findings)}.
    
    Return a JSON array of objects. Each object must have exactly these keys:
    - "technical_name": The exact technical name of the issue.
    - "plain_language_alert": A 1-2 sentence explanation of the risk written for a non-technical small business owner. Be helpful, not terrifying.
    - "severity": "CRITICAL", "HIGH", "MEDIUM", or "LOW".
    
    Only output valid JSON. Do not include markdown formatting like ```json.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:-3]
            
        return json.loads(text_response)
        
    except Exception as e:
        print(f"AI Error: {e}")
        return [{
            "technical_name": "Raw Vulnerabilities Detected", 
            "plain_language_alert": f"We found: {', '.join(raw_findings)}. AI generation temporarily unavailable.", 
            "severity": "MEDIUM"
        }]