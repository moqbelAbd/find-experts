import { createContext, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate} from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const navigate = useNavigate();

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
        navigate ("/")
    };

    return (
        <AuthContext.Provider value={{  token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);