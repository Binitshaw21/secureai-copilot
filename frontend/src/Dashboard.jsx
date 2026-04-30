import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, Settings, Zap, User, AlertTriangle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

// 1. CLERK IMPORTS
import { useUser, UserButton } from '@clerk/clerk-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('scanner');
    const [targetUrl, setTargetUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    const [historyLogs, setHistoryLogs] = useState([]);
    
    // State to track which history item is clicked/expanded
    const [expandedLogId, setExpandedLogId] = useState(null);
    
    const { user } = useUser(); 

    // THE ENGINE: Fetches Scanner Results
    const handleScan = async () => {
        if (!targetUrl) {
            setError("Please enter a URL to scan.");
            return;
        }

        setIsScanning(true);
        setError('');
        setScanResult(null);

        try {
            const response = await axios.post(
                'https://secureai-copilot-exnr.vercel.app/api/scan/', 
                { domain_url: targetUrl }
            );
            setScanResult(response.data);
        } catch (err) {
            setError("Scan failed. Ensure your backend is running and the URL is correct.");
        } finally {
            setIsScanning(false);
        }
    };

    // THE HISTORIAN: Fetches past scans
    useEffect(() => {
        if (activeTab === 'history') {
            const fetchHistory = async () => {
                try {
                    const response = await axios.get(
                        'https://secureai-copilot-exnr.vercel.app/api/history/'
                    );
                    setHistoryLogs(response.data);
                } catch (err) {
                    console.error("Failed to load history");
                }
            };
            fetchHistory();
        }
    }, [activeTab]);

    // THE CASH REGISTER: Razorpay Integration
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            alert('Razorpay failed to load. Please check your internet connection.');
            return;
        }

        try {
            const response = await axios.post(
                'https://secureai-copilot-exnr.vercel.app/api/subscribe/',
                {}
            );
            const orderData = response.data;

            const options = {
                key: orderData.key_id, 
                amount: orderData.amount,
                currency: orderData.currency,
                name: "SecureAI Copilot",
                description: "Premium Lifetime Access",
                order_id: orderData.order_id,
                theme: { color: "#00ffcc" },
                handler: function (response) {
                    alert("Payment Successful! Welcome to Premium! Payment ID: " + response.razorpay_payment_id);
                },
                prefill: {
                    name: user?.fullName || "SecureAI User",
                    email: user?.primaryEmailAddress?.emailAddress || "user@example.com",
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error("Payment setup failed:", err);
            alert("Could not initialize payment. Ensure your backend is running!");
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* LEFT SIDEBAR */}
            <aside style={{ width: '260px', backgroundColor: '#0b1120', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
                <div style={{ padding: '0 25px', marginBottom: '40px' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', letterSpacing: '1px' }}>
                        SecureAI <span style={{ color: '#3b82f6' }}>Copilot</span>
                    </h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px' }}>
                    <SidebarButton icon={<Shield />} label="New Scan" active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
                    <SidebarButton icon={<Clock />} label="Scan History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                    <SidebarButton icon={<Settings />} label="Account Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div style={{ marginTop: 'auto', padding: '0 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: '40px', height: '40px' } } }} />
                    <span style={{ fontWeight: 'bold', color: '#9ca3af' }}>Log Out</span>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    
                    {/* TAB: NEW SCANNER */}
                    {activeTab === 'scanner' && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Threat Intelligence Scanner</h1>
                                <p style={{ color: '#9ca3af' }}>Welcome back, <span style={{color: '#3b82f6'}}>{user?.firstName || 'Admin'}</span>! Deploy AI models to detect vulnerabilities in your web assets.</p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                                <input 
                                    type="url" 
                                    placeholder="http://example.com" 
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    style={{ flex: 1, padding: '15px 20px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#1e293b', color: 'white', fontSize: '1.1rem', outline: 'none' }} 
                                />
                                <button 
                                    onClick={handleScan}
                                    disabled={isScanning}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 30px', backgroundColor: isScanning ? '#334155' : '#3b82f6', color: isScanning ? '#9ca3af' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isScanning ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                                >
                                    {isScanning ? <Loader className="animate-spin" size={20} /> : <Shield size={20} />}
                                    {isScanning ? 'Analyzing...' : 'Scan Now'}
                                </button>
                            </div>
                            {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

                            {/* EXCACT REPLICA RESULTS PANEL */}
                            {scanResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '12px', maxWidth: '800px', margin: '0 auto' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ marginTop: 0, color: '#fff', fontSize: '1.8rem', fontWeight: 'bold' }}>Scan Complete</h2>
                                        <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: '5px 0 0 0' }}>Target: {scanResult.asset?.domain_url || targetUrl}</p>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {scanResult.vulnerabilities?.map((vuln, idx) => {
                                            // Exact colors from your screenshot
                                            let borderColor = '#475569'; 
                                            let badgeBg = '#334155';
                                            
                                            if (vuln.severity === 'CRITICAL') {
                                                borderColor = '#ef4444'; // Red border
                                                badgeBg = '#334155';     // Gray badge background
                                            } else if (vuln.severity === 'HIGH') {
                                                borderColor = '#9ca3af'; // Gray border
                                                badgeBg = '#334155';     // Gray badge background
                                            }

                                            return (
                                                <div key={idx} style={{ padding: '25px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: `4px solid ${borderColor}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                            {vuln.technical_name}
                                                        </h3>
                                                        <span style={{ padding: '4px 12px', backgroundColor: badgeBg, color: '#fff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                                                            {vuln.severity || 'UNKNOWN'}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, color: '#9ca3af', lineHeight: '1.6', fontSize: '1rem' }}>
                                                        {vuln.plain_language_alert}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* TAB: HISTORY */}
                    {activeTab === 'history' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Scan History</h1>
                                <p style={{ color: '#9ca3af' }}>Review your past security audits and reports.</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {historyLogs.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #334155', borderRadius: '12px', color: '#9ca3af' }}>
                                        Loading past scans... (or no scans exist yet!)
                                    </div>
                                ) : (
                                    historyLogs.map((log, index) => {
                                        const scanDate = log.created_at || log.timestamp ? new Date(log.created_at || log.timestamp).toLocaleString() : 'Recent Scan';
                                        const isExpanded = expandedLogId === log.id;

                                        return (
                                            <div 
                                                key={index} 
                                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                                style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>
                                                            Target: {log.asset?.domain_url || `Security Scan #${log.id}`}
                                                        </h3>
                                                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>
                                                            Date: {scanDate} | Status: <span style={{ color: log.status === 'COMPLETED' ? '#3b82f6' : '#f59e0b' }}>{log.status}</span>
                                                        </p>
                                                    </div>
                                                    <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                        {isExpanded ? 'Hide Details ▲' : 'View Results ▼'}
                                                    </div>
                                                </div>

                                                {/* History Dropdown showing exact replica design */}
                                                {isExpanded && log.vulnerabilities && (
                                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                        {log.vulnerabilities.length === 0 ? (
                                                            <p style={{ color: '#3b82f6', margin: 0 }}>No vulnerabilities found. Asset is secure.</p>
                                                        ) : (
                                                            log.vulnerabilities.map((vuln, idx) => {
                                                                let borderColor = '#475569'; 
                                                                let badgeBg = '#334155';
                                                                if (vuln.severity === 'CRITICAL') borderColor = '#ef4444';
                                                                if (vuln.severity === 'HIGH') borderColor = '#9ca3af';

                                                                return (
                                                                    <div key={idx} style={{ padding: '20px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: `4px solid ${borderColor}` }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{vuln.technical_name}</h4>
                                                                            <span style={{ padding: '3px 10px', backgroundColor: badgeBg, color: '#fff', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>{vuln.severity}</span>
                                                                        </div>
                                                                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>{vuln.plain_language_alert}</p>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: SETTINGS & SUBSCRIPTION */}
                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Account Settings</h1>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                
                                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '30px', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}><User size={20} /> Verified Profile</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                        <input type="text" value={user?.fullName || ''} readOnly style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#9ca3af', cursor: 'not-allowed' }} />
                                        <input type="email" value={user?.primaryEmailAddress?.emailAddress || ''} readOnly style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#9ca3af', cursor: 'not-allowed' }} />
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Managed securely via Clerk. Click your avatar in the sidebar to edit.</p>
                                    </div>
                                </div>
                                
                                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '30px', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6' }}><Zap size={20} /> Subscription Plan</h3>
                                    <h1 style={{ margin: '10px 0', fontSize: '2.5rem', color: '#fff' }}>Free Tier</h1>
                                    <p style={{ color: '#9ca3af', marginBottom: '25px', lineHeight: '1.5' }}>
                                        You are currently on the free plan. Upgrade to Premium for advanced AI analysis, API access, and automated weekly audits.
                                    </p>
                                    <button onClick={handleUpgrade} style={{ width: '100%', padding: '15px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
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

function SidebarButton({ icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px', 
                backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                color: active ? '#3b82f6' : '#9ca3af', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
                borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if(!active) e.currentTarget.style.color = 'white' }}
            onMouseOut={(e) => { if(!active) e.currentTarget.style.color = '#9ca3af' }}
        >
            {icon} {label}
        </button>
    );
}