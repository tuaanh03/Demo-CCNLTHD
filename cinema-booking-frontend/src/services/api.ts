import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIResponse, AuthenticationRequest, AuthenticationResult, RefreshRequest, LogoutRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/home';
export const AUTH_TOKEN_CLEARED_EVENT = 'app:auth-token-cleared';

// ========== Token Storage ==========
export const createTokenStorage = (tokenKey: string) => ({
    key: tokenKey,
    get: (): string | null => localStorage.getItem(tokenKey),
    set: (token: string) => localStorage.setItem(tokenKey, token),
    clear: () => localStorage.removeItem(tokenKey),
});

// ========== API Client Factory ==========
export const  createApiClient = ({ tokenStorage }: { tokenStorage: ReturnType<typeof createTokenStorage> }) => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        headers: { 'Content-Type': 'application/json' },
    });

    const clearTokenAndNotify = (reason: string) => {
        tokenStorage.clear();
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent(AUTH_TOKEN_CLEARED_EVENT, {
                    detail: { tokenKey: tokenStorage.key, reason },
                })
            );
        }
    };

    // --- Auth helpers (401 -> refresh -> retry) ---
    let isRefreshing = false;
    let refreshQueue: Array<(token: string | null) => void> = [];

    const resolveRefreshQueue = (token: string | null) => {
        refreshQueue.forEach(cb => cb(token));
        refreshQueue = [];
    };

    instance.interceptors.request.use((config) => {
        const cfg: any = config;
        const url: string = cfg.url ?? '';
        const isPublicAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout');

        if (cfg.skipAuth || isPublicAuthEndpoint) {
            if (cfg.headers) delete cfg.headers.Authorization;
            return config;
        }

        const token = tokenStorage.get();
        if (token) {
            cfg.headers = cfg.headers ?? {};
            cfg.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const auth = {
        login: (data: AuthenticationRequest): Promise<AxiosResponse<APIResponse<AuthenticationResult>>> =>
            instance.post<APIResponse<AuthenticationResult>>('/auth/login', data, { skipAuth: true } as any),
        refresh: (data: RefreshRequest): Promise<AxiosResponse<APIResponse<AuthenticationResult>>> =>
            instance.post<APIResponse<AuthenticationResult>>('/auth/refresh', data, { skipAuth: true } as any),
        logout: (data?: LogoutRequest): Promise<AxiosResponse<APIResponse<any>>> =>
            instance.post<APIResponse<any>>('/auth/logout', data ?? {}, { skipAuth: true } as any),
    };

    instance.interceptors.response.use(
        response => response,
        async (error: AxiosError) => {
            const status = error.response?.status;
            const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean });

            // Handle seat conflict
            if (status === 409) {
                throw new Error('This seat has just been taken by another customer. Please select a different seat.');
            }

            const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
            if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
                originalRequest._retry = true;

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        refreshQueue.push((newToken) => {
                            if (!newToken) {
                                reject(error);
                                return;
                            }
                            originalRequest.headers = originalRequest.headers ?? {};
                            (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
                            resolve(instance(originalRequest));
                        });
                    });
                }

                isRefreshing = true;
                try {
                    const currentToken = tokenStorage.get();
                    if (!currentToken) {
                        clearTokenAndNotify('missing-token-before-refresh');
                        resolveRefreshQueue(null);
                        throw error;
                    }

                    const refreshRes = await auth.refresh({ token: currentToken });
                    const newToken = refreshRes.data?.result?.token;
                    if (!newToken) {
                        clearTokenAndNotify('empty-refresh-token');
                        resolveRefreshQueue(null);
                        throw error;
                    }

                    tokenStorage.set(newToken);
                    resolveRefreshQueue(newToken);

                    originalRequest.headers = originalRequest.headers ?? {};
                    (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
                    return instance(originalRequest);
                } catch (e) {
                    clearTokenAndNotify('refresh-failed');
                    resolveRefreshQueue(null);
                    throw e;
                } finally {
                    isRefreshing = false;
                }
            }

            throw error;
        }
    );

    return { instance, auth };
};

// ========== Default User Client ==========
const TOKEN_KEY = 'accessToken';
export const tokenStorage = createTokenStorage(TOKEN_KEY);

const userApi = createApiClient({ tokenStorage });
export const axiosInstance = userApi.instance;
export const authService = userApi.auth;

export const userService = {
    register: (data: { name: string; email: string; password: string; phone: string }): Promise<AxiosResponse<APIResponse<any>>> =>
        axiosInstance.post<APIResponse<any>>('/users', data, { skipAuth: true } as any)
};
