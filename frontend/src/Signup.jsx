// 1. ALL IMPORTS GO AT THE VERY TOP!
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send data to your live Vercel backend
            await axios.post('https://secureai-copilot-exnr.vercel.app/api/signup/', formData);
            
            // 2. Trigger the premium success message!
            toast.success('Account created successfully! Redirecting...', {
                theme: "dark",
                position: "top-right"
            });

            // Wait 2 seconds so they can read the message, then teleport them
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            toast.error('That username is already taken!', { theme: "dark" });
            setError('That username is already taken.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '10px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Account</h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" name="username" placeholder="Username" onChange={handleChange} required 
                           style={{ padding: '12px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white' }} />
                    
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required 
                           style={{ padding: '12px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white' }} />
                    
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
                           style={{ padding: '12px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white' }} />
                    
                    <button type="submit" style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        Sign Up
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa' }}>
                    Already have an account? <span style={{ color: '#28a745', cursor: 'pointer' }} onClick={() => navigate('/login')}>Log In</span>
                </p>
            </div>
            
            {/* 3. The Toast Container must be at the bottom of the return statement */}
            <ToastContainer />
        </div>
    );
}