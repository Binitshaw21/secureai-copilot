import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, Settings, LogOut, Zap, User, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('scanner');
    const [targetUrl, setTargetUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // THE ENGINE: This calls your Python backend!
    const handleScan = async () => {
        if (!targetUrl) {
            setError("Please enter a URL to scan.");
            return;
        }

        setIsScanning(true);
        setError('');
        setScanResult(null);

        try {
            // Grab the VIP pass to prove we are logged in
            const token = localStorage.getItem('access_token');
            
            const response = await axios.post(
                'https://secureai-copilot-exnr.vercel.app/api/scan/', // Replace /api/scan/ with your actual backend url route if different!
                { domain_url: targetUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Save the results from Python to display them!
            setScanResult(response.data);
        } catch (err) {
            setError("Scan failed. Ensure your backend is running and the URL is correct.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0a0a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* LEFT SIDEBAR */}
            <aside style={{ width: '260px', backgroundColor: '#121212', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
                <div style={{ padding: '0 25px', marginBottom: '40px' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', letterSpacing: '1px' }}>
                        SecureAI <span style={{ color: '#00ffcc' }}>Copilot</span>
                    </h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px' }}>
                    <SidebarButton icon={<Shield />} label="New Scan" active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
                    <SidebarButton icon={<Clock />} label="Scan History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                    <SidebarButton icon={<Settings />} label="Account Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div style={{ marginTop: 'auto', padding: '0 15px' }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px', backgroundColor: 'transparent', color: '#ff4c4c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 76, 76, 0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    
                    {/* TAB: NEW SCANNER */}
                    {activeTab === 'scanner' && (
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Threat Intelligence Scanner</h1>
                            <p style={{ color: '#888', marginBottom: '40px' }}>Deploy AI models to detect vulnerabilities in your web assets.</p>
                            
                            <div style={{ backgroundColor: '#161616', border: '1px solid #333', padding: '30px', borderRadius: '12px', marginBottom: '30px' }}>
                                <h3 style={{ marginTop: 0 }}>Target URL</h3>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <input 
                                        type="url" 
                                        placeholder="https://example.com" 
                                        value={targetUrl}
                                        onChange={(e) => setTargetUrl(e.target.value)}
                                        style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#0a0a0a', color: 'white', fontSize: '1.1rem' }} 
                                    />
                                    <button 
                                        onClick={handleScan}
                                        disabled={isScanning}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 30px', backgroundColor: isScanning ? '#333' : '#00ffcc', color: isScanning ? '#888' : '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isScanning ? 'not-allowed' : 'pointer', boxShadow: isScanning ? 'none' : '0 0 15px rgba(0, 255, 204, 0.3)' }}
                                    >
                                        {isScanning ? <Loader className="animate-spin" size={20} /> : <Shield size={20} />}
                                        {isScanning ? 'Analyzing...' : 'Launch Scan'}
                                    </button>
                                </div>
                                {error && <p style={{ color: '#ff4c4c', marginTop: '15px' }}>{error}</p>}
                            </div>

                            {/* RESULTS PANEL */}
                            {scanResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', padding: '30px', borderRadius: '12px' }}>
                                    <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#00ffcc' }}>
                                        <CheckCircle /> Scan Complete
                                    </h2>
                                    <p style={{ color: '#aaa', marginBottom: '20px' }}>Target: {scanResult.asset?.domain_url || targetUrl}</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {scanResult.vulnerabilities?.map((vuln, idx) => (
                                            <div key={idx} style={{ padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '8px', borderLeft: vuln.severity === 'HIGH' ? '4px solid #ff4c4c' : '4px solid #f39c12' }}>
                                                <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px', color: vuln.severity === 'HIGH' ? '#ff4c4c' : '#f39c12' }}>
                                                    <AlertTriangle size={18} /> {vuln.technical_name}
                                                </h3>
                                                <p style={{ margin: 0, color: '#ccc' }}>{vuln.plain_language_alert}</p>
                                                <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>Confidence Score: {vuln.ml_confidence_score * 100}%</small>
                                            </div>
                                        ))}
                                        
                                        {(!scanResult.vulnerabilities || scanResult.vulnerabilities.length === 0) && (
                                            <div style={{ padding: '20px', backgroundColor: 'rgba(0, 255, 204, 0.1)', borderRadius: '8px', color: '#00ffcc' }}>
                                                No vulnerabilities detected! The asset appears secure against our current model parameters.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* TAB: HISTORY (Placeholder) */}
                    {activeTab === 'history' && (
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Scan History</h1>
                            <p style={{ color: '#888', marginBottom: '40px' }}>Review your past security audits and reports.</p>
                            <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #444', borderRadius: '12px', color: '#666' }}>
                                History module locked. Run more scans to populate data!
                            </div>
                        </div>
                    )}

                    {/* TAB: SETTINGS & SUBSCRIPTION */}
                    {activeTab === 'settings' && (
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Account Settings</h1>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div style={{ backgroundColor: '#161616', border: '1px solid #333', padding: '30px', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><User size={20} /> Profile Details</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                        <input type="text" defaultValue="admin_binit" placeholder="Username" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#0a0a0a', color: 'white' }} />
                                        <input type="email" placeholder="Email Address" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#0a0a0a', color: 'white' }} />
                                        <button style={{ padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(0, 255, 204, 0.05)', border: '1px solid rgba(0, 255, 204, 0.2)', padding: '30px', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#00ffcc' }}><Zap size={20} /> Subscription Plan</h3>
                                    <h1 style={{ margin: '10px 0', fontSize: '2.5rem' }}>Free Tier</h1>
                                    <p style={{ color: '#aaa', marginBottom: '25px', lineHeight: '1.5' }}>
                                        You are currently on the free plan. Upgrade to Premium for advanced AI analysis, API access, and automated weekly audits.
                                    </p>
                                    <button style={{ width: '100%', padding: '15px', backgroundColor: '#00ffcc', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                                        Upgrade with Razorpay
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </motion.div>
            </main>
        </div>
    );
}

// Reusable Button Component for the Sidebar
function SidebarButton({ icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px', 
                backgroundColor: active ? 'rgba(0, 255, 204, 0.1)' : 'transparent', 
                color: active ? '#00ffcc' : '#888', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
                borderLeft: active ? '3px solid #00ffcc' : '3px solid transparent',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if(!active) e.currentTarget.style.color = 'white' }}
            onMouseOut={(e) => { if(!active) e.currentTarget.style.color = '#888' }}
        >
            {icon} {label}
        </button>
    );
}