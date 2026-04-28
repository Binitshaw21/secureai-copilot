import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';

// 🛑 THE BOUNCER: This function checks for the JWT ID card
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    
    // If they have a token, open the door (render the children). 
    // If they don't, kick them back to the login page!
    return token ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Public Doors */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* The VIP Room (Protected by the Bouncer) */}
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}