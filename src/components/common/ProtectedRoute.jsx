import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();
    // console.log("Protected Route Check:", { token, loading })
    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading application...</div>;
    }

    if (!token) {

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;}