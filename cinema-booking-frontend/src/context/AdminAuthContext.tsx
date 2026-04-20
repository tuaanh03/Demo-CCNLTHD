import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { AuthenticationResult } from '../types';
import { adminAuthService, adminTokenStorage } from '../services/adminApi';
import { AUTH_TOKEN_CLEARED_EVENT } from '../services/api';

const parseJwtPayload = (token: string): Record<string, any> | null => {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const extractRoleValue = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (!value || typeof value !== 'object') return [];

    const obj = value as Record<string, unknown>;
    const raw = [obj.authority, obj.role, obj.name, obj.value].find(
        (item) => typeof item === 'string' && item.trim().length > 0
    );
    return typeof raw === 'string' ? [raw] : [];
};

const extractRolesFromToken = (token: string): string[] => {
    const payload = parseJwtPayload(token);
    if (!payload) return [];

    const candidates = [payload.roles, payload.role, payload.authorities, payload.scope];
    const normalized = candidates.flatMap((candidate) => {
        if (Array.isArray(candidate)) return candidate.flatMap(extractRoleValue);
        if (typeof candidate === 'string') return candidate.split(/[\s,]+/);
        return extractRoleValue(candidate);
    });

    return normalized
        .map((r) => String(r || '').trim())
        .filter(Boolean);
};

const normalizeRoleName = (role: string): string => role.replace(/^ROLE_/i, '').toUpperCase();

const hasAdminRole = (token: string): boolean => {
    const roles = extractRolesFromToken(token);
    return roles.some((role) => {
        const normalized = normalizeRoleName(role);
        return normalized === 'ADMIN' || normalized.startsWith('ADMIN_');
    });
};

interface AdminAuthContextType {
    isAdminLoggedIn: boolean;
    adminAccessToken: string | null;
    isAdminInitialized: boolean;
    adminEmail: string | null;
    loginAdmin: (email: string, password: string) => Promise<AuthenticationResult>;
    logoutAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [adminAccessToken, setAdminAccessToken] = useState<string | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isAdminInitialized, setIsAdminInitialized] = useState(false);
    const [adminEmail, setAdminEmail] = useState<string | null>(null);

    useEffect(() => {
        const token = adminTokenStorage.get();
        const email = localStorage.getItem('adminEmail');
        if (token && hasAdminRole(token)) {
            setAdminAccessToken(token);
            setIsAdminLoggedIn(true);
            if (email) {
                setAdminEmail(email);
            }
        } else if (token) {
            adminTokenStorage.clear();
            localStorage.removeItem('adminEmail');
        }
        setIsAdminInitialized(true);
    }, []);

    useEffect(() => {
        const handleTokenCleared = (event: Event) => {
            const customEvent = event as CustomEvent<{ tokenKey?: string }>;
            if (customEvent.detail?.tokenKey !== adminTokenStorage.key) {
                return;
            }

            setAdminAccessToken(null);
            setIsAdminLoggedIn(false);
            setAdminEmail(null);
            localStorage.removeItem('adminEmail');
        };

        window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
        return () => {
            window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
        };
    }, []);

    const loginAdmin = async (email: string, password: string) => {
        const res = await adminAuthService.login({ email, password });
        const result = res.data.result;

        if (!result?.token || !hasAdminRole(result.token)) {
            adminTokenStorage.clear();
            localStorage.removeItem('adminEmail');
            setAdminAccessToken(null);
            setIsAdminLoggedIn(false);
            setAdminEmail(null);
            throw new Error('Tài khoản không có quyền truy cập trang quản trị.');
        }

        adminTokenStorage.set(result.token);
        setAdminAccessToken(result.token);
        setIsAdminLoggedIn(true);
        setAdminEmail(email);
        localStorage.setItem('adminEmail', email);

        return result;
    };

    const logoutAdmin = async () => {
        const token = adminTokenStorage.get();
        try {
            await adminAuthService.logout(token ? { token } : undefined);
        } catch {
            // ignore
        } finally {
            adminTokenStorage.clear();
            setAdminEmail(null);
            localStorage.removeItem('adminEmail');
            setAdminAccessToken(null);
            setIsAdminLoggedIn(false);
        }
    };

    const value = useMemo(
        () => ({ isAdminLoggedIn, adminAccessToken, isAdminInitialized, adminEmail, loginAdmin, logoutAdmin }),
        [isAdminLoggedIn, adminAccessToken, isAdminInitialized, adminEmail]
    );

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return ctx;
};
