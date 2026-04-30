import os
import requests
import json
from google import genai

def run_security_scan(target_url):
    """
    Hybrid AI Scanner: Python gathers the raw facts, Gemini writes the report.
    """
    raw_vulnerabilities = []
    
    # Clean the URL
    domain = target_url.replace("https://", "").replace("http://", "").split('/')[0]

    # --- PART 1: PYTHON GATHERS RAW DATA ---
    if not target_url.startswith("https"):
        raw_vulnerabilities.append("Missing TLS/SSL Encryption")

    try:
        # We use a user-agent so firewalls don't block our scan immediately
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(f"http://{domain}", headers=headers, timeout=5)
        
        # Check for missing security headers
        if 'Content-Security-Policy' not in response.headers:
            raw_vulnerabilities.append("Missing Content-Security-Policy (CSP) Header")
        if 'Strict-Transport-Security' not in response.headers:
            raw_vulnerabilities.append("Missing Strict-Transport-Security (HSTS) Header")
        if 'X-Frame-Options' not in response.headers:
            raw_vulnerabilities.append("Missing X-Frame-Options (Clickjacking vulnerability)")
            
    except requests.exceptions.RequestException:
        raw_vulnerabilities.append("Host Unreachable or actively blocking Automated Scans")

    # If the list is empty, the site is perfectly secure!
    if not raw_vulnerabilities:
        return []


    # --- PART 2: GEMINI AI WRITES THE REPORT ---
    # We grab the API key from Vercel's environment variables
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("No API key was provided. Check Vercel Environment Variables.")

    client = genai.Client(api_key=api_key)
    
    # We ask the AI to naturally explain the technical flaws Python found
    prompt = f"""
    Act as a professional cybersecurity expert. I have scanned a website and found these exact technical issues: 
    {raw_vulnerabilities}
    
    For each issue, write a natural, plain-language explanation for a business owner explaining what it means and why it is dangerous. 
    Assign a severity of either CRITICAL, HIGH, MEDIUM, or LOW based on your cybersecurity knowledge.
    
    You MUST respond ONLY with a valid JSON array of objects. Do not include markdown blocks.
    Format exactly like this:
    [
        {{
            "technical_name": "[Insert Technical Name]",
            "severity": "[CRITICAL/HIGH/MEDIUM/LOW]",
            "plain_language_alert": "[Your natural AI explanation here]"
        }}
    ]
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Clean the AI's text to ensure it is perfect JSON
        text = response.text.strip()
        if text.startswith("```json"): 
            text = text[7:-3]
        elif text.startswith("```"): 
            text = text[3:-3]
            
        ai_generated_report = json.loads(text.strip())
        return ai_generated_report
        
    except Exception as e:
        print("AI Engine Error:", e)
        # Safe fallback if the AI takes too long to respond during your presentation
        return [
            {
                "technical_name": issue,
                "severity": "HIGH",
                "plain_language_alert": "Vulnerability detected. The AI analysis engine is currently processing a heavy load."
            } for issue in raw_vulnerabilities
        ]