import requests
import json

# The URL of your local Django API
api_url = "http://127.0.0.1:8000/api/scan/start/"

# The fake data that your React frontend will eventually send
payload = {
    "domain_url": "http://neverssl.com"  # We use this site because we know it has no security!
}

print("Sending target URL to SecureAI Copilot API...")

# Send the POST request
response = requests.post(api_url, json=payload)

# Print the beautiful JSON report that comes back!
print("\n--- SCAN COMPLETE ---")
print(json.dumps(response.json(), indent=4))