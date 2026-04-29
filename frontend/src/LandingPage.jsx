import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";

// Premium Swiper UI Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards, Autoplay } from 'swiper/modules';

export default function LandingPage() {
    const [init, setInit] = useState(false);
    const navigate = useNavigate();

    // Boot up the background physics
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    // Your App's Features for the Flashcards
    const features = [
        { title: "AI Threat Detection", desc: "Scan URLs and instantly identify zero-day vulnerabilities using custom ML models." },
        { title: "Real-Time Alerts", desc: "Get notified the millisecond a breach attempt or vulnerability is discovered." },
        { title: "Confidence Scoring", desc: "Eliminate false positives with our proprietary 95% accuracy scoring engine." },
        { title: "Automated Reports", desc: "Generate compliance-ready security audits instantly with one click." }
    ];

    return (
        // Changed to minHeight so we can scroll down to the cards!
        <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#0a0a0a", color: "white", fontFamily: "system-ui, sans-serif" }}>
            
            {init && (
                <Particles
                    id="tsparticles"
                    options={{
                        background: { color: { value: "transparent" } },
                        fpsLimit: 120,
                        interactivity: {
                            events: { onHover: { enable: true, mode: "grab" } },
                            modes: { grab: { distance: 150, links: { opacity: 0.8 } } },
                        },
                        particles: {
                            color: { value: "#00ffcc" },
                            links: { color: "#00ffcc", distance: 150, enable: true, opacity: 0.2, width: 1 },
                            move: { enable: true, speed: 0.8 },
                            number: { density: { enable: true, area: 800 }, value: 60 },
                            opacity: { value: 0.4 },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 2 } },
                        },
                        detectRetina: true,
                    }}
                    style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
                />
            )}

            {/* Glass Navigation Bar */}
            <nav style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 5vw", background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h2 style={{ margin: 0, color: "#fff", fontWeight: "800", letterSpacing: "1px" }}>
                    SecureAI <span style={{ color: "#00ffcc" }}>Copilot</span>
                </h2>
                <div>
                    <button onClick={() => navigate('/login')} style={{ background: "transparent", color: "white", border: "none", padding: "10px 20px", marginRight: "15px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>
                        Log In
                    </button>
                    <button onClick={() => navigate('/signup')} style={{ background: "#00ffcc", color: "#000", border: "none", padding: "10px 25px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", boxShadow: "0 0 15px rgba(0, 255, 204, 0.4)" }}>
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Main Content Area: Split into Hero (Top) and Flashcards (Bottom) */}
            <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "10vh", paddingBottom: "10vh" }}>
                
                {/* Hero Text */}
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    style={{ fontSize: "4.5rem", margin: "0 0 20px 0", fontWeight: "900", lineHeight: "1.1", textAlign: "center" }}
                >
                    Next-Gen <br /> 
                    <span style={{ color: "#00ffcc", textShadow: "0 0 30px rgba(0, 255, 204, 0.3)" }}>Threat Intelligence</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
                    style={{ fontSize: "1.2rem", color: "#888", maxWidth: "600px", marginBottom: "50px", textAlign: "center", lineHeight: "1.6" }}
                >
                    Deploy advanced machine learning models to scan, detect, and neutralize vulnerabilities across your digital assets in real-time.
                </motion.p>

                {/* The 3D Swipeable Flashcards */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                    style={{ width: "320px", height: "420px" }}
                >
                    <Swiper
                        effect={'cards'}
                        grabCursor={true}
                        modules={[EffectCards, Autoplay]}
                        autoplay={{ delay: 3000, disableOnInteraction: true }}
                        style={{ width: "100%", height: "100%" }}
                    >
                        {features.map((feature, index) => (
                            <SwiperSlide key={index} style={{ 
                                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", 
                                borderRadius: "18px", backgroundColor: "#1e1e1e", border: "1px solid #333", 
                                padding: "30px", textAlign: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.5)" 
                            }}>
                                <h3 style={{ color: "#00ffcc", fontSize: "1.8rem", marginBottom: "15px" }}>{feature.title}</h3>
                                <p style={{ color: "#ccc", fontSize: "1.1rem", lineHeight: "1.5" }}>{feature.desc}</p>
                                <div style={{ marginTop: "auto", fontSize: "0.9rem", color: "#666" }}>Swipe to explore →</div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>

            </div>
        </div>
    );
}