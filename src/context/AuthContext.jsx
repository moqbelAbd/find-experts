import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const res = await axiosClient.get('/Auth/me');
                    if (res.data?.success) {
                        setUser(res.data.data);
                    }
                } catch {
                    logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await axiosClient.post('/Auth/login', { email, password });
        const result = response.data;

        if (result.success && result.data?.token) {
            const jwtToken = result.data.token;
            localStorage.setItem('token', jwtToken);
            setToken(jwtToken);
            return result;
        }
        throw new Error(result.message || 'Login failed');
    };

    const register = async (fullName, email, password) => {
        const response = await axiosClient.post('/Auth/register', {
            fullName,
            email,
            password,
        });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);