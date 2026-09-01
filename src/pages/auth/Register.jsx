import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

export default function Register() {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [errorsList, setErrorsList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
        setErrorsList([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setErrorsList([]);

        try {
            const res = await register(formData.fullName, formData.email, formData.password);
            if (res.success) {
                navigate('/login');
            }
        } catch (err) {
            const resData = err.response?.data;
            setError(resData?.message || 'Registration failed.');
            if (resData?.errors && Array.isArray(resData.errors)) {
                setErrorsList(resData.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Register as a new user</p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        <div>{error}</div>
                        {errorsList.length > 0 && (
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                {errorsList.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className="form-control"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />
                    </div>

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
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}