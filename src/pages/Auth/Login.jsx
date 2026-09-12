import { jwtDecode } from "jwt-decode";
import { useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import authImg from '../../assets/login image.jpeg';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // 1. Await the login result
            const result = await login(formData.email, formData.password);

            // 2. Decode the token to find the role
            const token = result.data.token;
            const decodedToken = jwtDecode(token);

            // ASP.NET Core usually maps roles to this long URL key, or occasionally just 'role'
            const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
            const userRoles = decodedToken[roleClaimKey] || decodedToken.role || [];

            // Check if we have a redirect parameter in the URL (from Axios 401)
            const urlRedirect = searchParams.get('redirect');
            const stateRedirect = location.state?.from?.pathname;
            const finalRedirect = urlRedirect || stateRedirect;

            // 3. Navigate based on the role
            // (Handle both single string role or array of roles)
            const isAdmin = Array.isArray(userRoles) ? userRoles.includes('Admin') : userRoles === 'Admin';
            const isExpert = Array.isArray(userRoles) ? userRoles.includes('Expert') : userRoles === 'Expert';
            if (isAdmin) {
                // Admins always go to their specific dashboard
                navigate('/admin-dashboard');
            } else if (finalRedirect) {
                // Normal user with a saved redirect destination
                navigate(finalRedirect);
            } else {
                // Normal user who logged in directly -> send to default home/dashboard
                navigate('/user-dashboard');
            }
        } catch (err) {
            const apiMessage = err.response?.data?.message || err.message || 'Failed to authenticate.';
            setError(apiMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side: Image */}
            <div className="auth-image-side">
                <img src={authImg} alt="Authentication Background" />
            </div>

            {/* Right Side: Form */}
            <div className="auth-form-side">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Welcome Back</h2>
                        <p>Please enter your details to sign in</p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="primary-btn auth-btn" disabled={submitting}>
                            {submitting ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}