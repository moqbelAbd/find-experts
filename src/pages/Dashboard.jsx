import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div style={{ maxWidth: '800px', margin: '60px auto', padding: '24px' }}>
            <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginBottom: '12px' }}>Dashboard Overview</h2>
                <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                    Authenticated as: <strong>{user?.fullName || user?.email}</strong>
                </p>
                <button
                    onClick={logout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#1a1d20',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                    }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}