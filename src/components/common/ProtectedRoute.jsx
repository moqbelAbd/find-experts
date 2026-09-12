import {Navigate, Outlet, useLocation} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const {token, loading} = useAuth();
    const location = useLocation();
    // console.log("Protected Route Check:", { token, loading })
    if (loading) {
        return <div style={{padding: '40px', textAlign: 'center'}}>Loading application...</div>;
    }

    if (!token) {

        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return children ? children : <Outlet/>;
}