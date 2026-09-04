import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import UserProfile from "./pages/Profile/UserProfile.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import HowItWorks from "./pages/LandingPage/HowItWorks.jsx";
import BecomeExpert from "./pages/Profile/ExpertProfile/BecomeExpert/BecomeExpert.jsx";

export default function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <BrowserRouter>
                <Routes>
                    {/* Auth pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Main layout wrapper */}
                    <Route element={<Layout />}>

                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/how-it-works" element={<HowItWorks />} />

                        {/* Protected Routes Group */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/become-expert" element={<BecomeExpert />} />
                        </Route>

                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}