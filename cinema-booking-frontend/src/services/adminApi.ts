import axios, { AxiosResponse } from 'axios';
import {
    AdminPermission,
    AdminPermissionCreateRequest,
    AdminPermissionUpdateRequest,
    AdminRole,
    AdminRoleCreateRequest,
    AdminRoleUpdateRequest,
    AdminUser,
    AdminUserUpdateRequest,
    APIResponse,
    Movie,
    Screening,
    Seat,
    Booking,
    BookingRequest,
    Genre,
    Room,
    ShowTimeResponse,
    SeatShowTimeResponse,
} from '../types';
import { createApiClient, createTokenStorage } from './api';

const API_BASE_URL = 'http://localhost:8080/home';

// Token admin tách biệt user
const ADMIN_TOKEN_KEY = 'adminAccessToken';

export const adminTokenStorage = createTokenStorage(ADMIN_TOKEN_KEY);

export const adminApiClient = createApiClient({ tokenStorage: adminTokenStorage });

export const adminAuthService = adminApiClient.auth;
export const adminAxios = adminApiClient.instance;

export const adminUserService = {
    getAllUsers: (): Promise<AxiosResponse<APIResponse<AdminUser[]>>> =>
        adminAxios.get<APIResponse<AdminUser[]>>('/users'),
    getUserById: (userId: string): Promise<AxiosResponse<APIResponse<AdminUser>>> =>
        adminAxios.get<APIResponse<AdminUser>>(`/users/${userId}`),
    updateUser: (userId: string, payload: AdminUserUpdateRequest): Promise<AxiosResponse<APIResponse<AdminUser>>> =>
        adminAxios.put<APIResponse<AdminUser>>(`/users/${userId}`, payload),
};

export const adminRoleService = {
    getAllRoles: (): Promise<AxiosResponse<APIResponse<AdminRole[]>>> =>
        adminAxios.get<APIResponse<AdminRole[]>>('/roles'),
    createRole: (payload: AdminRoleCreateRequest): Promise<AxiosResponse<APIResponse<AdminRole>>> =>
        adminAxios.post<APIResponse<AdminRole>>('/roles', payload),
    updateRole: (roleName: string, payload: AdminRoleUpdateRequest): Promise<AxiosResponse<APIResponse<AdminRole>>> =>
        adminAxios.put<APIResponse<AdminRole>>(`/roles/${encodeURIComponent(roleName)}`, payload),
    deleteRole: (roleName: string): Promise<AxiosResponse<APIResponse<void>>> =>
        adminAxios.delete<APIResponse<void>>(`/roles/${encodeURIComponent(roleName)}`),
};

export const adminPermissionService = {
    getAllPermissions: (): Promise<AxiosResponse<APIResponse<AdminPermission[]>>> =>
        adminAxios.get<APIResponse<AdminPermission[]>>('/permissions'),
    createPermission: (payload: AdminPermissionCreateRequest): Promise<AxiosResponse<APIResponse<AdminPermission>>> =>
        adminAxios.post<APIResponse<AdminPermission>>('/permissions', payload),
    updatePermission: (permissionName: string, payload: AdminPermissionUpdateRequest): Promise<AxiosResponse<APIResponse<AdminPermission>>> =>
        adminAxios.put<APIResponse<AdminPermission>>(`/permissions/${encodeURIComponent(permissionName)}`, payload),
    deletePermission: (permissionName: string): Promise<AxiosResponse<APIResponse<void>>> =>
        adminAxios.delete<APIResponse<void>>(`/permissions/${encodeURIComponent(permissionName)}`),
};

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

export interface MovieUpdateRequest extends MovieCreateRequest {}

export const adminMovieService = {
    getAllMovies: (): Promise<AxiosResponse<APIResponse<Movie[]>>> => adminAxios.get<APIResponse<Movie[]>>('/movies'),
    getMovieById: (id: string): Promise<AxiosResponse<APIResponse<Movie>>> => adminAxios.get<APIResponse<Movie>>(`/movies/${id}`),
    createMovie: (data: MovieCreateRequest): Promise<AxiosResponse<APIResponse<Movie>>> => adminAxios.post<APIResponse<Movie>>('/movies', data),
    updateMovie: (id: string, data: MovieUpdateRequest): Promise<AxiosResponse<APIResponse<Movie>>> => adminAxios.put<APIResponse<Movie>>(`/movies/${id}`, data),
    deleteMovie: (id: string): Promise<AxiosResponse<void>> => adminAxios.delete(`/movies/${id}`),
};

export const adminGenreService = {
    getAllGenres: (): Promise<AxiosResponse<APIResponse<Genre[]>>> => adminAxios.get<APIResponse<Genre[]>>('/genres'),
    createGenre: (name: string): Promise<AxiosResponse<APIResponse<Genre>>> => adminAxios.post<APIResponse<Genre>>('/genres', { name }),
};

export const adminScreeningService = {
    getScreeningById: (id: string): Promise<AxiosResponse<APIResponse<Screening>>> => adminAxios.get<APIResponse<Screening>>(`/screenings/${id}`),
    getAvailableSeats: (screeningId: string): Promise<AxiosResponse<APIResponse<Seat[]>>> => adminAxios.get<APIResponse<Seat[]>>(`/screenings/${screeningId}/seats`),
};

export const adminBookingService = {
    createBooking: (data: BookingRequest): Promise<AxiosResponse<APIResponse<Booking>>> => adminAxios.post<APIResponse<Booking>>('/bookings', data),
    getBookingById: (id: string): Promise<AxiosResponse<APIResponse<Booking>>> => adminAxios.get<APIResponse<Booking>>(`/bookings/${id}`),
    cancelBooking: (id: string): Promise<AxiosResponse<void>> => adminAxios.delete(`/bookings/${id}`),
    getBookingsByUser: (userId: string): Promise<AxiosResponse<APIResponse<Booking[]>>> => adminAxios.get<APIResponse<Booking[]>>(`/bookings/user/${userId}`),
    // Backward-compatible alias for existing callers.
    getBookingsByEmail: (email: string): Promise<AxiosResponse<APIResponse<Booking[]>>> => adminAxios.get<APIResponse<Booking[]>>(`/bookings/user/${email}`),
    reserveSeat: (screeningId: string, seatId: string): Promise<AxiosResponse<APIResponse<boolean>>> =>
        adminAxios.post<APIResponse<boolean>>(`/bookings/screenings/${screeningId}/seats/${seatId}/reserve`),
    releaseSeatReservation: (screeningId: string, seatId: string): Promise<AxiosResponse<APIResponse<boolean>>> =>
        adminAxios.post<APIResponse<boolean>>(`/bookings/screenings/${screeningId}/seats/${seatId}/release`),
    confirmBooking: (id: string): Promise<AxiosResponse<APIResponse<Booking>>> => adminAxios.post<APIResponse<Booking>>(`/bookings/${id}/confirm`),
    getAllBooking: (): Promise<AxiosResponse<APIResponse<Booking[]>>> => adminAxios.get<APIResponse<Booking[]>>('/bookings/admin'),
    scanQr: (token: string): Promise<AxiosResponse<APIResponse<void>>> =>
        adminAxios.post<APIResponse<void>>('/bookings/scanQr', { token }),
};

export const adminRoomService = {
    getAllRooms: (): Promise<AxiosResponse<APIResponse<Room[]>>> => adminAxios.get<APIResponse<Room[]>>('/rooms'),
    getRoomById: (id: string): Promise<AxiosResponse<APIResponse<Room>>> => adminAxios.get<APIResponse<Room>>(`/rooms/${id}`),
    createRoom: (data: any): Promise<AxiosResponse<APIResponse<Room>>> => adminAxios.post<APIResponse<Room>>('/rooms', data),
    updateRoom: (id: string, data: any): Promise<AxiosResponse<APIResponse<Room>>> => adminAxios.put<APIResponse<Room>>(`/rooms/${id}`, data),
    deleteRoom: (id: string): Promise<AxiosResponse<void>> => adminAxios.delete(`/rooms/${id}`),
};

export const adminShowtimeService = {
    getAllShowtimes: (): Promise<AxiosResponse<APIResponse<ShowTimeResponse[]>>> =>
        adminAxios.get<APIResponse<ShowTimeResponse[]>>('/showtimes/all'),

    getShowtimeById: (id: string): Promise<AxiosResponse<APIResponse<ShowTimeResponse>>> =>
        adminAxios.get<APIResponse<ShowTimeResponse>>(`/showtimes/${id}`),

    createShowtime: (data: any): Promise<AxiosResponse<APIResponse<ShowTimeResponse>>> =>
        adminAxios.post<APIResponse<ShowTimeResponse>>('/showtimes', data),

    getSeatsByShowtime: (showtimeId: string): Promise<AxiosResponse<APIResponse<SeatShowTimeResponse[]>>> =>
        adminAxios.get<APIResponse<SeatShowTimeResponse[]>>(`/seat-showtimes/${showtimeId}`),

    updateSeatPrice: (
        showtimeId: string,
        seatType: 'NORMAL' | 'VIP',
        price: number
    ): Promise<AxiosResponse<APIResponse<void>>> =>
        adminAxios.patch<APIResponse<void>>(`/seat-showtimes/${showtimeId}`, {
            seatType,
            price
        }),

    deleteShowtime: (id: string): Promise<AxiosResponse<APIResponse<void>>> =>
        adminAxios.delete<APIResponse<void>>(`/showtimes/${id}`),

    updateShowtime: (id: string, data: any): Promise<AxiosResponse<APIResponse<ShowTimeResponse>>> =>
        adminAxios.put<APIResponse<ShowTimeResponse>>(`/showtimes/${id}`, data),
};

// ========== Admin File Upload Instance (with token interceptor) ==========
const adminFileInstance = axios.create({ baseURL: API_BASE_URL });

// Add token interceptor to file instance
adminFileInstance.interceptors.request.use((config) => {
    const cfg: any = config;
    const token = adminTokenStorage.get();
    if (token) {
        cfg.headers = cfg.headers ?? {};
        cfg.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ========== Admin Cloudinary Service ==========
export const adminCloudinaryService = {
    uploadImage: (file: File): Promise<AxiosResponse<string>> => {
        const formData = new FormData();
        formData.append('file', file);
        return adminFileInstance.post<string>('/upload', formData);
    }
};

