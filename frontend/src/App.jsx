import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';

import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

// 🛑 PASTE YOUR CLERK KEY HERE!
const clerkPubKey = "pk_test_aGVhbHRoeS1nb3NoYXdrLTU1LmNsZXJrLmFjY291bnRzLmRldiQ";

export default function App() {
    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            <Router>
                <Routes>
                    {/* 🌍 PUBLIC ROUTE: The Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* 🔐 CLERK'S PREMIUM AUTH PAGES */}
                    <Route 
                        path="/login/*" 
                        element={
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0a0a' }}>
                                <SignIn routing="path" path="/login" signUpUrl="/signup" forceRedirectUrl="/dashboard" appearance={{ baseTheme: 'dark' }} />
                            </div>
                        } 
                    />
                    <Route 
                        path="/signup/*" 
                        element={
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0a0a' }}>
                                <SignUp routing="path" path="/signup" signInUrl="/login" forceRedirectUrl="/dashboard" appearance={{ baseTheme: 'dark' }} />
                            </div>
                        } 
                    />

                    {/* 🛡️ CLERK PROTECTED ROUTE: The Dashboard */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <>
                                <SignedIn>
                                    <Dashboard />
                                </SignedIn>
                                <SignedOut>
                                    <RedirectToSignIn />
                                </SignedOut>
                            </>
                        } 
                    />
                </Routes>
            </Router>
        </ClerkProvider>
    );
}