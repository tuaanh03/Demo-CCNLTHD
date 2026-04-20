import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    Movie, Screening, Seat, Booking, BookingRequest, APIResponse, Genre,
    AuthenticationRequest, AuthenticationResult, RefreshRequest, LogoutRequest,
    ShowTimeResponse, SeatShowTimeResponse, HoldSeatRequest, HoldSeatResponse
} from '../types';

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

// Separate instance for file uploads (no JSON content-type)
const axiosFileInstance = axios.create({ baseURL: API_BASE_URL });

// ========== Request/Response Types ==========
export interface MovieCreateRequest {
    title: string;
    description: string;
    director?: string;
    actors?: string;
    duration: number;
    genreIds?: string[];          // Danh sách ID thể loại
    genreNames?: string[];        // Danh sách tên thể loại
    releaseDate: string;
    imageUrl: string;
    trailerUrl: string;
    status: string;
}

export interface MovieUpdateRequest extends MovieCreateRequest {
}

// ========== Service Definitions ===========
export const movieService = {
    getAllMovies: (): Promise<AxiosResponse<APIResponse<Movie[]>>> => axiosInstance.get<APIResponse<Movie[]>>('/movies'),
    getMovieById: (id: string): Promise<AxiosResponse<APIResponse<Movie>>> => axiosInstance.get<APIResponse<Movie>>(`/movies/${id}`),
    getMovieScreenings: (movieId: string): Promise<AxiosResponse<APIResponse<Screening[]>>> => axiosInstance.get<APIResponse<Screening[]>>(`/screenings/movie/${movieId}`),
    getMoviesByGenre: (genreId: string): Promise<AxiosResponse<APIResponse<Movie[]>>> => axiosInstance.get<APIResponse<Movie[]>>(`/movies/genre/${genreId}`),
    getMoviesByStatus: (status: string): Promise<AxiosResponse<APIResponse<Movie[]>>> => axiosInstance.get<APIResponse<Movie[]>>('/movies/status', { params: { status } }),
    searchMovies: (keyword: string): Promise<AxiosResponse<APIResponse<Movie[]>>> => axiosInstance.get<APIResponse<Movie[]>>('/movies/search', { params: { keyword } }),
    createMovie: (data: MovieCreateRequest): Promise<AxiosResponse<APIResponse<Movie>>> => axiosInstance.post<APIResponse<Movie>>('/movies', data),
    updateMovie: (id: string, data: MovieUpdateRequest): Promise<AxiosResponse<APIResponse<Movie>>> => axiosInstance.put<APIResponse<Movie>>(`/movies/${id}`, data),
    deleteMovie: (id: string): Promise<AxiosResponse<void>> => axiosInstance.delete(`/movies/${id}`),
};

export const genreService = {
    getAllGenres: (): Promise<AxiosResponse<APIResponse<Genre[]>>> => axiosInstance.get<APIResponse<Genre[]>>('/genres'),
    createGenre: (name: string): Promise<AxiosResponse<APIResponse<Genre>>> => axiosInstance.post<APIResponse<Genre>>('/genres', { name }),
};

export const showtimeService = {
    getAllShowtimes: (): Promise<AxiosResponse<APIResponse<ShowTimeResponse[]>>> =>
        axiosInstance.get<APIResponse<ShowTimeResponse[]>>('/showtimes'),

    getShowtimeById: (id: string): Promise<AxiosResponse<APIResponse<ShowTimeResponse>>> =>
        axiosInstance.get<APIResponse<ShowTimeResponse>>(`/showtimes/${id}`),

    createShowtime: (data: any): Promise<AxiosResponse<APIResponse<ShowTimeResponse>>> =>
        axiosInstance.post<APIResponse<ShowTimeResponse>>('/showtimes', data),

    getSeatsByShowtime: (showtimeId: string): Promise<AxiosResponse<APIResponse<SeatShowTimeResponse[]>>> =>
        axiosInstance.get<APIResponse<SeatShowTimeResponse[]>>(`/seat-showtimes/${showtimeId}`),

    updateSeatPrice: (
        showtimeId: string,
        seatType: 'NORMAL' | 'VIP',
        price: number
    ): Promise<AxiosResponse<APIResponse<void>>> =>
        axiosInstance.patch<APIResponse<void>>(`/seat-showtimes/${showtimeId}`, {
            seatType,
            price
        }),
};

export const cloudinaryService = {
    uploadImage: (file: File): Promise<AxiosResponse<string>> => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosFileInstance.post<string>('/upload', formData);
    }
};

export const screeningService = {
    getAllScreenings: (): Promise<AxiosResponse<APIResponse<Screening[]>>> => axiosInstance.get<APIResponse<Screening[]>>('/screenings'),
    getScreeningById: (id: string): Promise<AxiosResponse<APIResponse<Screening>>> => axiosInstance.get<APIResponse<Screening>>(`/screenings/${id}`),
    getAvailableSeats: (screeningId: string): Promise<AxiosResponse<APIResponse<Seat[]>>> => axiosInstance.get<APIResponse<Seat[]>>(`/screenings/${screeningId}/seats`),
};

export const bookingService = {
    createBooking: (data: BookingRequest): Promise<AxiosResponse<APIResponse<Booking>>> => axiosInstance.post<APIResponse<Booking>>('/bookings', data),
    getBookingById: (id: string): Promise<AxiosResponse<APIResponse<Booking>>> => axiosInstance.get<APIResponse<Booking>>(`/bookings/${id}`),
    cancelBooking: (id: string): Promise<AxiosResponse<void>> => axiosInstance.delete(`/bookings/${id}`),

    // Legacy endpoint (requires userId in path)
    getBookingsByUser: (userId: string): Promise<AxiosResponse<APIResponse<Booking[]>>> => axiosInstance.get<APIResponse<Booking[]>>(`/bookings/user/${userId}`),

    // Token-based endpoint (backend derives user_id from JWT). Adjust path if your BE uses a different route.
    getMyBookings: (): Promise<AxiosResponse<APIResponse<Booking[]>>> => axiosInstance.get<APIResponse<Booking[]>>('/bookings/me'),

    reserveSeat: (screeningId: string, seatId: string): Promise<AxiosResponse<APIResponse<boolean>>> =>
        axiosInstance.post<APIResponse<boolean>>(`/bookings/screenings/${screeningId}/seats/${seatId}/reserve`),
    releaseSeatReservation: (screeningId: string, seatId: string): Promise<AxiosResponse<APIResponse<boolean>>> =>
        axiosInstance.post<APIResponse<boolean>>(`/bookings/screenings/${screeningId}/seats/${seatId}/release`),
    confirmBooking: (id: string): Promise<AxiosResponse<APIResponse<void>>> => axiosInstance.patch<APIResponse<void>>(`/bookings/${id}/confirm`)
};

export interface PaymentGatewayResponse {
    status: string;
    message: string;
    url: string;
}

export const paymentService = {
    checkoutPayment: (
        data: Pick<BookingRequest, 'showTimeId' | 'seatShowTimeIds'>
    ): Promise<AxiosResponse<APIResponse<PaymentGatewayResponse>>> =>
        axiosInstance.post<APIResponse<PaymentGatewayResponse>>('/api/v1/payment/checkout', data)
};

export const holdService = {
    holdSeats: (request: HoldSeatRequest): Promise<AxiosResponse<APIResponse<HoldSeatResponse>>> =>
        axiosInstance.post<APIResponse<HoldSeatResponse>>('/seat-holds/reserve', request),

    releaseHold: (seatShowTimeIds: string[]): Promise<AxiosResponse<APIResponse<void>>> =>
        axiosInstance.post<APIResponse<void>>('/seat-holds/release', seatShowTimeIds),

    isHoldValid: (seatShowTimeId: string): Promise<AxiosResponse<APIResponse<boolean>>> =>
        axiosInstance.get<APIResponse<boolean>>(`/seat-holds/${seatShowTimeId}/valid`)
};

export const userService = {
    register: (data: { name: string; email: string; password: string; phone: string }): Promise<AxiosResponse<APIResponse<any>>> =>
        axiosInstance.post<APIResponse<any>>('/users', data, { skipAuth: true } as any)
};

// NOTE: user_id is now taken from JWT claims on the backend; FE no longer uses a test-user endpoint.
