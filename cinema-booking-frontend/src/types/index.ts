export interface Genre {
    id: string;
    name: string;
}

export interface APIResponse<T> {
    result: T;
    code?: string;
    message?: string;
}

export interface AdminPermission {
    name: string;
    description: string;
}

export interface AdminRole {
    name: string;
    description: string;
    permissions: AdminPermission[];
}

export interface AdminRoleCreateRequest {
    name: string;
    description: string;
    permissions: string[];
}

export interface AdminRoleUpdateRequest {
    description: string;
    permissions: string[];
}

export interface AdminPermissionCreateRequest {
    name: string;
    description: string;
}

export interface AdminPermissionUpdateRequest {
    description: string;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    roles: AdminRole[];
}

export interface AdminUserUpdateRequest {
    name: string;
    password?: string;
    phone: string;
    roles: string[];
}

export interface Movie {
    id: string;
    title: string;
    description: string;
    director?: string;
    actors?: string;
    duration: string;
    imageUrl: string;
    trailerUrl: string;
    genreIds?: string[];          // Danh sách ID thể loại
    genreNames?: string[];        // Danh sách tên thể loại
    status: 'COMING_SOON' | 'NOW_SHOWING' | 'ENDED';
    releaseDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface Screening {
    id: string;
    movie: Movie;
    screeningTime: string;
    totalSeats: number;
    availableSeats: number;
}

export interface Seat {
    id: string;
    seatRow: string;
    seatNumber: string;
    status: 'AVAILABLE' | 'BOOKED' | 'RESERVED';
    version: number;
}

export interface Booking {
    bookingId: string;
    userId: string;
    showTimeId: string;
    bookingTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    qrToken?: string;
    qrStatus?: 'NOT_CREATED' | 'ACTIVE' | 'USED' | 'INVALID';
    qrExpired?: number;
    totalPrice: number;
    seatShowTimeIds: string[];
    seatCodes: string[];
}

export interface BookingRequest {
    userId: string;
    showTimeId: string;
    seatShowTimeIds: string[];
}

export interface ErrorResponse {
    message: string;
    status: number;
    timestamp: string;
}

// ===== Authentication Related =====
export interface AuthenticationRequest {
    email: string;
    password: string;
}

export interface RefreshRequest {
    token: string;
}

export interface LogoutRequest {
    token?: string;
}

export interface AuthenticationResult {
    token: string;
    isAuthenticated: boolean;
}

// ===== ShowTime Related =====
export interface ShowTimeCreateRequest {
    movieId: string;
    roomId: string;
    startTime: string;  // ISO DateTime: "2024-12-31T14:00:00"
    // endTime được tính tự động bởi backend dựa vào duration phim + 10 phút nghỉ
}

export interface ShowTimeResponse {
    id: string;
    movieId: string;
    roomId: string;
    roomName: string;
    startTime: string;
    endTime: string;
    status: 'ACTIVE' | 'CANCELLED';
}

export interface Room {
    id: string;
    roomName: string;
    totalRows: number;
    totalColumns: number;
}

export interface ShowTimeDetail extends ShowTimeResponse {
    movie?: Movie;
    room?: Room;
}

// ===== Seat ShowTime Related =====
export interface SeatShowTimeResponse {
    id: string;
    seatCode: string;
    status: 'AVAILABLE' | 'BOOKED' | 'HOLD';
    seatType: 'NORMAL' | 'VIP';
    price: number;
    holdExpireTime?: string;
    heldByUserEmail?: string;
}

export interface SeatShowTimeSummary {
    row: string;
    seats: SeatShowTimeResponse[];
}

// ===== Hold Seat Related =====
export interface HoldSeatRequest {
    seatShowTimeIds: string[];
    showTimeId: string;
    userId: string;
    holdDuration: number;
}

export interface HoldSeatResponse {
    heldSeatCodes: string[];
    holdDurationSeconds: number;
    totalPrice: number;
    showTimeId?: string;
    userEmail?: string;
    holdStartTime?: number;
}