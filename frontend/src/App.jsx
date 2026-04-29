import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// We will build these beautiful pages next!
import LandingPage from './LandingPage'; 
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';

// THE BOUNCER: Checks if the user has a VIP pass (JWT token) in their browser
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <Router>
            <Routes>
                {/* 🌍 PUBLIC ROUTES (Anyone can see these) */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* 🔒 PREMIUM LOCKED ROUTES (Must be logged in) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}