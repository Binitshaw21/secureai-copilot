import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const navigate = useNavigate();
    const [targetUrl, setTargetUrl] = useState('');
    const [scanResult, setScanResult] = useState('');
    const [loading, setLoading] = useState(false);

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        // Destroy the digital ID cards
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Kick them back to the login screen
        navigate('/login');
    };

    // --- SCANNER LOGIC ---
    const handleScan = async (e) => {
        e.preventDefault();
        setLoading(true);
        setScanResult('');

        try {
            // Grab the user's secure token
            const token = localStorage.getItem('access_token');
            
            // Send the scan request with the token attached!
            const response = await axios.post('http://127.0.0.1:8000/api/scan/', 
                { url: targetUrl },
                { headers: { Authorization: `Bearer ${token}` } } 
            );
            
            setScanResult(response.data.report || "Scan complete. No vulnerabilities found.");
        } catch (error) {
            setScanResult("Error running scan. Please check the backend connection.");
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
            
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#007bff' }}>SecureAI Copilot</h1>
                <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Logout
                </button>
            </div>

            {/* Main Scanner Section */}
            <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', maxWidth: '800px', margin: '0 auto' }}>
                <h2>Start a New Scan</h2>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>Enter a target URL to analyze for security vulnerabilities.</p>
                
                <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="url" 
                        placeholder="https://example.com" 
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        required
                        style={{ flex: 1, padding: '15px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white', fontSize: '16px' }}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                    >
                        {loading ? 'Scanning...' : 'Analyze'}
                    </button>
                </form>

                {/* Results Section */}
                {scanResult && (
                    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '5px', borderLeft: '5px solid #007bff' }}>
                        <h3 style={{ marginTop: 0 }}>AI Analysis Report</h3>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{scanResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
}