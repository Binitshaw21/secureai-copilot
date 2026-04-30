import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // 📱 MOBILE RESPONSIVENESS STATE 📱
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Listen for screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) setIsSidebarOpen(false); // Close mobile menu if expanded to desktop
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ----------------------------------------------------
    // API FUNCTIONS (Unchanged)
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

    // Helper to change tabs and close mobile sidebar automatically
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        if (isMobile) setIsSidebarOpen(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
            
            {/* 📱 MOBILE HEADER WITH HAMBURGER MENU 📱 */}
            {isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#0b1120', borderBottom: '1px solid #1e293b', zIndex: 40 }}>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        <Menu size={28} />
                    </button>
                    <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px' }}>
                        SecureAI <span style={{ color: '#3b82f6' }}>Copilot</span>
                    </h2>
                    <div style={{ width: '28px' }}></div> {/* Spacer to perfectly center the logo */}
                </div>
            )}

            {/* 🌑 DARK OVERLAY FOR MOBILE (When menu is open) 🌑 */}
            {isMobile && isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 45 }}
                />
            )}

            {/* 🧭 SIDEBAR (Responsive) 🧭 */}
            <aside style={{ 
                width: '260px', backgroundColor: '#0b1120', borderRight: '1px solid #1e293b', 
                display: 'flex', flexDirection: 'column', padding: '20px 0',
                position: isMobile ? 'fixed' : 'relative',
                top: 0, left: isMobile ? (isSidebarOpen ? '0' : '-260px') : '0',
                height: '100vh', zIndex: 50, transition: 'left 0.3s ease-in-out'
            }}>
                {isMobile && (
                    <button onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                )}

                <div style={{ padding: '0 25px', marginBottom: '40px', marginTop: isMobile ? '10px' : '0' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', letterSpacing: '1px' }}>
                        SecureAI <span style={{ color: '#3b82f6' }}>Copilot</span>
                    </h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px' }}>
                    <SidebarButton icon={<Shield />} label="New Scan" active={activeTab === 'scanner'} onClick={() => handleTabSwitch('scanner')} />
                    <SidebarButton icon={<Clock />} label="Scan History" active={activeTab === 'history'} onClick={() => handleTabSwitch('history')} />
                    <SidebarButton icon={<Settings />} label="Account Settings" active={activeTab === 'settings'} onClick={() => handleTabSwitch('settings')} />
                    <SidebarButton icon={<HelpCircle />} label="Help & Support" active={activeTab === 'help'} onClick={() => handleTabSwitch('help')} />
                </nav>

                <div style={{ marginTop: 'auto', padding: '0 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: '40px', height: '40px' } } }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{user?.firstName || 'User'}</span>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Manage Account</span>
                    </div>
                </div>
            </aside>

            {/* 🖥️ MAIN CONTENT AREA 🖥️ */}
            <main style={{ flex: 1, padding: isMobile ? '20px' : '40px 60px', overflowY: 'auto', boxSizing: 'border-box' }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    
                    {/* --- SCANNER TAB --- */}
                    {activeTab === 'scanner' && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '10px' }}>Threat Intelligence Scanner</h1>
                                <p style={{ color: '#9ca3af', fontSize: isMobile ? '0.9rem' : '1rem' }}>Deploy AI models to detect vulnerabilities in your web assets.</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
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
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '15px 30px', backgroundColor: isScanning ? '#334155' : '#3b82f6', color: isScanning ? '#9ca3af' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isScanning ? 'not-allowed' : 'pointer', transition: 'all 0.2s', width: isMobile ? '100%' : 'auto' }}
                                >
                                    {isScanning ? <Loader className="animate-spin" size={20} /> : <Shield size={20} />}
                                    {isScanning ? 'Analyzing...' : 'Scan Now'}
                                </button>
                            </div>
                            {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

                            {scanResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: '#1e293b', padding: isMobile ? '20px' : '40px', borderRadius: '12px', maxWidth: '800px', margin: '0 auto' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ marginTop: 0, color: '#fff', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 'bold' }}>Scan Complete</h2>
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
                                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', marginBottom: '15px' }}>
                                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                            {vuln.technical_name}
                                                        </h3>
                                                        <span style={{ padding: '4px 12px', backgroundColor: badgeBg, color: '#fff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                            {vuln.severity || 'UNKNOWN'}
                                                        </span>
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
                                <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '10px' }}>Scan History</h1>
                                <p style={{ color: '#9ca3af', fontSize: isMobile ? '0.9rem' : '1rem' }}>Review your past security audits and reports.</p>
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
                                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px' }}>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.1rem', wordBreak: 'break-all' }}>Target: {log.domain_url || 'Unknown URL'}</h3>
                                                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Date: {scanDate} | Status: <span style={{ color: log.status === 'COMPLETED' ? '#3b82f6' : '#f59e0b' }}>{log.status}</span></p>
                                                    </div>
                                                    <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>{isExpanded ? 'Hide Details ▲' : 'View Results ▼'}</div>
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
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{vuln.technical_name}</h4>
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

                    {/* --- SETTINGS & SUBSCRIPTION TAB --- */}
                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '10px' }}>Account Settings</h1>
                            </div>
                            {/* Changed Grid to Stack on Mobile! */}
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>
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
                                <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '10px' }}>Help & Support</h1>
                                <p style={{ color: '#9ca3af' }}>We are here to help keep your business secure.</p>
                            </div>
                            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '40px', borderRadius: '12px' }}>
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
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px', 
                backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                color: active ? '#3b82f6' : '#9ca3af', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
                borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
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