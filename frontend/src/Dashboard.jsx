import { useState } from 'react';
import { Shield, Clock, Settings, Zap, User, AlertTriangle, Loader, Menu, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// CLERK IMPORTS
import { useUser, UserButton } from '@clerk/clerk-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('scanner');
    const [targetUrl, setTargetUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    const [historyLogs, setHistoryLogs] = useState([]);
    
    const [expandedLogId, setExpandedLogId] = useState(null);
    const { user } = useUser(); 

    // UNIVERSAL SIDEBAR STATE (Hidden by default on all devices)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ----------------------------------------------------
    // API FUNCTIONS
    // ----------------------------------------------------
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

    const fetchHistory = async () => {
        try {
            const response = await axios.get('https://secureai-copilot-exnr.vercel.app/api/history/');
            setHistoryLogs(response.data);
        } catch (err) {
            console.error("Failed to load history");
        }
    };

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
            const response = await axios.post('https://secureai-copilot-exnr.vercel.app/api/subscribe/', {});
            const orderData = response.data;
            const options = {
                key: orderData.key_id, 
                amount: orderData.amount,
                currency: orderData.currency,
                name: "SecureAI Copilot",
                description: "Premium Access",
                order_id: orderData.order_id,
                theme: { color: "#3b82f6" },
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

    // Helper to change tabs and close sidebar automatically
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false); // Always close menu after clicking a tab
        if (tab === 'history') fetchHistory();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
            
            {/* 🌐 UNIVERSAL TOP HEADER (Always Visible) 🌐 */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 25px', backgroundColor: '#0b1120', borderBottom: '1px solid #1e293b', zIndex: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Menu size={28} />
                    </button>
                    <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '1px' }}>
                        SecureAI <span style={{ color: '#3b82f6' }}>Copilot</span>
                    </h2>
                </div>
                {/* User Profile in Top Right for easy access */}
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: '35px', height: '35px' } } }} />
            </header>

            {/* 🌑 DARK OVERLAY (Click to close menu) 🌑 */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)} 
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 45 }}
                    />
                )}
            </AnimatePresence>

            {/* 🧭 SLIDE-IN SIDEBAR (Works on all devices) 🧭 */}
            <aside style={{ 
                width: '280px', backgroundColor: '#0b1120', borderRight: '1px solid #1e293b', 
                display: 'flex', flexDirection: 'column', padding: '20px 0',
                position: 'fixed', top: 0, bottom: 0,
                left: isSidebarOpen ? '0' : '-300px',
                zIndex: 50, transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSidebarOpen ? '4px 0 25px rgba(0,0,0,0.5)' : 'none'
            }}>
                <div style={{ padding: '0 25px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '1px' }}>
                        Menu
                    </h2>
                    <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 15px' }}>
                    <SidebarButton icon={<Shield />} label="New Scan" active={activeTab === 'scanner'} onClick={() => handleTabSwitch('scanner')} />
                    <SidebarButton icon={<Clock />} label="Scan History" active={activeTab === 'history'} onClick={() => handleTabSwitch('history')} />
                    <SidebarButton icon={<Settings />} label="Account Settings" active={activeTab === 'settings'} onClick={() => handleTabSwitch('settings')} />
                    <SidebarButton icon={<HelpCircle />} label="Help & Support" active={activeTab === 'help'} onClick={() => handleTabSwitch('help')} />
                </nav>

                <div style={{ marginTop: 'auto', padding: '20px 25px', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid #1e293b' }}>
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: '40px', height: '40px' } } }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{user?.firstName || 'User'}</span>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Manage Account</span>
                    </div>
                </div>
            </aside>

            {/* 🖥️ MAIN CONTENT AREA 🖥️ */}
            <main style={{ flex: 1, padding: '30px 20px', overflowY: 'auto', boxSizing: 'border-box' }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    
                    {/* --- SCANNER TAB --- */}
                    {activeTab === 'scanner' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Threat Intelligence Scanner</h1>
                                <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Deploy AI models to detect vulnerabilities in your web assets.</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', sm: {flexDirection: 'row'}, gap: '15px', marginBottom: '40px' }}>
                                <input 
                                    type="url" 
                                    placeholder="http://example.com" 
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    style={{ flex: 1, padding: '15px 20px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#1e293b', color: 'white', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} 
                                />
                                <button 
                                    onClick={handleScan}
                                    disabled={isScanning}
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '15px 30px', backgroundColor: isScanning ? '#334155' : '#3b82f6', color: isScanning ? '#9ca3af' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isScanning ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: '100%' }}
                                >
                                    {isScanning ? <Loader className="animate-spin" size={20} /> : <Shield size={20} />}
                                    {isScanning ? 'Analyzing...' : 'Scan Now'}
                                </button>
                            </div>
                            {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

                            {scanResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ marginTop: 0, color: '#fff', fontSize: '1.6rem', fontWeight: 'bold' }}>Scan Complete</h2>
                                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '5px 0 0 0', wordBreak: 'break-all' }}>Target: {scanResult.domain_url || targetUrl}</p>
                                    </div>
                                    
                                    {scanResult.vulnerabilities?.length === 0 && (
                                        <div style={{ padding: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', textAlign: 'center' }}>
                                            <p style={{ color: '#10b981', margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>
                                                ✅ No vulnerabilities detected. This asset appears to be secure.
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {scanResult.vulnerabilities?.map((vuln, idx) => {
                                            let borderColor = '#475569'; let badgeBg = '#334155';
                                            if (vuln.severity === 'CRITICAL') borderColor = '#ef4444'; 
                                            else if (vuln.severity === 'HIGH' || vuln.severity === 'MEDIUM') borderColor = '#f59e0b'; 
                                            else if (vuln.severity === 'LOW') borderColor = '#10b981'; 

                                            return (
                                                <div key={idx} style={{ padding: '20px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: `4px solid ${borderColor}` }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                                {vuln.technical_name}
                                                            </h3>
                                                            <span style={{ padding: '4px 12px', backgroundColor: badgeBg, color: '#fff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                                                {vuln.severity || 'UNKNOWN'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p style={{ margin: 0, color: '#9ca3af', lineHeight: '1.6', fontSize: '0.95rem' }}>
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

                    {/* --- HISTORY TAB --- */}
                    {activeTab === 'history' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Scan History</h1>
                                <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Review your past security audits and reports.</p>
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
                                            <div key={index} onClick={() => setExpandedLogId(isExpanded ? null : log.id)} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.1rem', wordBreak: 'break-all', paddingRight: '10px' }}>Target: {log.domain_url || 'Unknown URL'}</h3>
                                                        <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', marginTop: '3px' }}>{isExpanded ? 'Hide ▲' : 'View ▼'}</div>
                                                    </div>
                                                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Date: {scanDate} | Status: <span style={{ color: log.status === 'COMPLETED' ? '#3b82f6' : '#f59e0b' }}>{log.status}</span></p>
                                                </div>
                                                
                                                {isExpanded && log.vulnerabilities && (
                                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                        {log.vulnerabilities.length === 0 ? (
                                                            <p style={{ color: '#10b981', margin: 0 }}>✅ No vulnerabilities found. Asset is secure.</p>
                                                        ) : (
                                                            log.vulnerabilities.map((vuln, idx) => {
                                                                let borderColor = '#475569'; let badgeBg = '#334155';
                                                                if (vuln.severity === 'CRITICAL') borderColor = '#ef4444';
                                                                if (vuln.severity === 'HIGH' || vuln.severity === 'MEDIUM') borderColor = '#f59e0b';
                                                                if (vuln.severity === 'LOW') borderColor = '#10b981';
                                                                return (
                                                                    <div key={idx} style={{ padding: '15px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: `4px solid ${borderColor}` }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', paddingRight: '10px' }}>{vuln.technical_name}</h4>
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

                    {/* --- SETTINGS TAB --- */}
                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Account Settings</h1>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '30px', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}><User size={20} /> Verified Profile</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                        <input type="text" value={user?.fullName || ''} readOnly style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#9ca3af', cursor: 'not-allowed', width: '100%', boxSizing: 'border-box' }} />
                                        <input type="email" value={user?.primaryEmailAddress?.emailAddress || ''} readOnly style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#9ca3af', cursor: 'not-allowed', width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '30px', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6' }}><Zap size={20} /> Subscription Plan</h3>
                                    <h1 style={{ margin: '10px 0', fontSize: '2.5rem', color: '#fff' }}>Free Tier</h1>
                                    <button onClick={handleUpgrade} style={{ width: '100%', padding: '15px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '20px' }}>
                                        Upgrade with Razorpay
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- HELP TAB --- */}
                    {activeTab === 'help' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Help & Support</h1>
                                <p style={{ color: '#9ca3af' }}>We are here to help keep your business secure.</p>
                            </div>
                            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '40px 20px', borderRadius: '12px' }}>
                                <HelpCircle size={48} color="#3b82f6" style={{ marginBottom: '20px' }} />
                                <h2 style={{ color: '#fff', marginTop: 0 }}>Need Assistance?</h2>
                                <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '30px' }}>
                                    If you are experiencing issues with a scan, need help understanding a vulnerability report, or have billing questions, please reach out to our dedicated security engineering team.
                                </p>
                                <a href="mailto:support@secureaicopilot.com" style={{ display: 'inline-block', padding: '15px 30px', backgroundColor: '#334155', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                                    Contact Support
                                </a>
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
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 20px', 
                backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                color: active ? '#3b82f6' : '#9ca3af', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1.05rem',
                borderLeft: active ? '4px solid #3b82f6' : '4px solid transparent',
                transition: 'all 0.2s',
                textAlign: 'left'
            }}
            onMouseOver={(e) => { if(!active) e.currentTarget.style.color = 'white' }}
            onMouseOut={(e) => { if(!active) e.currentTarget.style.color = '#9ca3af' }}
        >
            {icon} {label}
        </button>
    );
}