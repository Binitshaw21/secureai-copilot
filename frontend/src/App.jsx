import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  const handleScan = async (e) => {
    e.preventDefault()
    if (!url) return;

    setLoading(true)
    setError('')
    setReport(null)

    try {
      const response = await axios.post('https://secureai-copilot-exnr.vercel.app/api/scan/start/',  {
        domain_url: url
      })
      setReport(response.data)
    } catch (err) {
      setError('Failed to scan. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>🛡️ SecureAI Copilot</h1>
        <p>Enterprise-grade cybersecurity, simplified for small businesses.</p>
      </header>

      <main className="main-content">
        <form className="scan-form" onSubmit={handleScan}>
          <input 
            type="url" 
            placeholder="Enter your website URL (e.g., http://neverssl.com)" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="url-input"
          />
          <button type="submit" className="scan-btn" disabled={loading}>
            {loading ? 'Scanning...' : 'Scan Now'}
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}

        {report && (
          <div className="report-card">
            <h2>Scan Complete</h2>
            <p className="status-text">Target: {url}</p>
            
            <div className="vulnerabilities-list">
              {report.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className={`threat-item ${vuln.severity.toLowerCase()}`}>
                  <div className="threat-header">
                    <h3>{vuln.technical_name}</h3>
                    <span className="severity-badge">{vuln.severity}</span>
                  </div>
                  <p className="plain-language">{vuln.plain_language_alert}</p>
                </div>
              ))}
              
              {report.vulnerabilities.length === 0 && (
                <p className="safe-text">✅ No obvious vulnerabilities found on this initial scan.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App