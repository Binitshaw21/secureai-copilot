/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://YOUR-BACKEND-URL.vercel.app/api/login/', formData);
            
            // SECURITY: Save the JWT Tokens directly into the browser's local vault!
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            // Send them to the main scanner dashboard
            navigate('/');
        } catch (err) {
            setError('Invalid username or password.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '10px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Secure Login</h2>
                {error && <p style={{ color: '#ff4c4c', textAlign: 'center' }}>{error}</p>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" name="username" placeholder="Username" onChange={handleChange} required 
                           style={{ padding: '12px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white' }} />
                    
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
                           style={{ padding: '12px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white' }} />
                    
                    <button type="submit" style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        Access Dashboard
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa' }}>
                    Need an account? <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign Up</span>
                </p>
            </div>
        </div>
    );
}*/