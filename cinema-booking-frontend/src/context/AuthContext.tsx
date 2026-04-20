import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, tokenStorage } from '../services/api';
import { AUTH_TOKEN_CLEARED_EVENT } from '../services/api';
import { AuthenticationResult } from '../types';

interface User {
    email: string;
    fullName?: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    accessToken: string | null;
    loginWithPassword: (email: string, password: string) => Promise<AuthenticationResult>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        const storedName = localStorage.getItem('userName');
        const token = tokenStorage.get();

        if (token) {
            setAccessToken(token);
            setIsLoggedIn(true);
            if (storedEmail) {
                setUser({ email: storedEmail, fullName: storedName || undefined });
            }
        }
    }, []);

    useEffect(() => {
        const handleTokenCleared = (event: Event) => {
            const customEvent = event as CustomEvent<{ tokenKey?: string }>;
            if (customEvent.detail?.tokenKey !== tokenStorage.key) {
                return;
            }

            setAccessToken(null);
            setUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('isLoggedIn');
        };

        window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
        return () => {
            window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
        };
    }, []);

    const loginWithPassword = async (email: string, password: string) => {
        const res = await authService.login({ email, password });
        const result = res.data.result;

        tokenStorage.set(result.token);
        setAccessToken(result.token);
        setIsLoggedIn(!!result.isAuthenticated);

        // Lưu email để các màn khác dùng (vd booking history)
        setUser({ email });
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isLoggedIn', 'true');

        return result;
    };

    const logout = async () => {
        const token = tokenStorage.get();
        try {
            // Logout field phụ thuộc BE; gửi token nếu có
            await authService.logout(token ? { token } : undefined);
        } catch {
            // ignore logout errors (still clear local state)
        } finally {
            tokenStorage.clear();
            setAccessToken(null);
            setUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('isLoggedIn');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, accessToken, loginWithPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
