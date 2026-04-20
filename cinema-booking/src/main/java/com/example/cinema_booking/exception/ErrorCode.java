package com.example.cinema_booking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // 9xxx - System
    UNCATEGORIZED_EXCEPTION(9000, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),

    // 10xx - Common validation and authentication
    INVALID_KEY(1001, "Khóa thông báo không hợp lệ", HttpStatus.BAD_REQUEST),
    NOT_NULL(1002, "Vui lòng điền vào tất cả các trường", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(1003, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    PHONENUMBER_INVALID(1004, "Số điện thoại không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1010, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1011, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1012, "Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),

    // 11xx - User
    USER_NOT_EXISTED(1101, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    USER_EXISTED(1102, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1103, "Tên đăng nhập phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1104, "Mật khẩu phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    INVALID_DOB(1105, "Tuổi của bạn phải ít nhất {min}", HttpStatus.NOT_FOUND),
    USER_EMAIL_EXISTED(1106, "Email đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),

    // 12xx - Role and permission
    INVALID_ROLE(1201, "Vai trò không hợp lệ", HttpStatus.BAD_REQUEST),
    ROLE_EXISTED(1202, "Vai trò đã tồn tại", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1203, "Vai trò không tồn tại", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_EXISTED(1204, "Quyền không tồn tại", HttpStatus.NOT_FOUND),

    // 13xx - Genre and movie
    GENRE_NOT_EXIST(1301, "Thể loại không tồn tại", HttpStatus.NOT_FOUND),
    INVALID_GENRE(1302, "Thể loại không hợp lệ", HttpStatus.BAD_REQUEST),
    GENRE_ALREADY_EXIST(1303, "Thể loại đã tồn tại", HttpStatus.BAD_REQUEST),
    MOVIE_NOT_EXIST(1304, "Phim không tồn tại", HttpStatus.NOT_FOUND),
    INVALID_MOVIE_STATUS(1305, "Trạng thái phim không hợp lệ", HttpStatus.BAD_REQUEST),

    // 14xx - Room and showtime
    ROOM_NOT_EXIST(1401, "Phòng chiếu không tồn tại", HttpStatus.NOT_FOUND),
    SHOWTIME_NOT_EXIST(1402, "Suất chiếu không tồn tại", HttpStatus.NOT_FOUND),
    SHOWTIME_ALREADY_PASSED(1403, "Suất chiếu đã diễn ra", HttpStatus.BAD_REQUEST),
    SHOWTIME_BEFORE_MOVIE_RELEASE(1404, "Suất chiếu phải sau ngày khởi chiếu của phim", HttpStatus.BAD_REQUEST),
    SHOWTIME_END_BEFORE_START(1405, "Thời gian kết thúc suất chiếu phải sau thời gian bắt đầu", HttpStatus.BAD_REQUEST),
    SHOWTIME_OVERLAP(1406, "Suất chiếu bị trùng với suất chiếu hiện có", HttpStatus.BAD_REQUEST),
    SHOWTIME_HAS_BOOKINGS(1407, "Không thể xóa hoặc cập nhật suất chiếu đã có đặt vé", HttpStatus.BAD_REQUEST),
    MOVIE_ENDED(1408,"Phim đã  ngừng chiếu" ,  HttpStatus.BAD_REQUEST),

    // 15xx - Seat and hold
    SEAT_ALREADY_EXIST(1501, "Ghế đã tồn tại", HttpStatus.BAD_REQUEST),
    SEAT_SHOWTIME_EXISTED(1502, "Ghế đã tồn tại trong suất chiếu này", HttpStatus.BAD_REQUEST),
    INVALID_SEAT_ID(1503, "Mã ghế không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_SEAT_IDS(1504, "Danh sách mã ghế không hợp lệ", HttpStatus.BAD_REQUEST),
    SEAT_ALREADY_HELD(1505, "Ghế đã được giữ", HttpStatus.BAD_REQUEST),
    HOLD_EXPIRED(1506, "Thời gian giữ ghế đã hết hạn", HttpStatus.BAD_REQUEST),
    SEAT_NOT_AVAILABLE(1507, "Ghế không khả dụng", HttpStatus.BAD_REQUEST),
    SEAT_HOLD_USER_MISMATCH(1508, "Người giữ ghế không khớp", HttpStatus.BAD_REQUEST),

    // 16xx - Booking and payment
    BOOKING_NOT_FOUND(1601, "Không tìm thấy đặt vé", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED(1602, "Đặt vé đã bị hủy", HttpStatus.BAD_REQUEST),
    BOOKING_ALREADY_CONFIRMED(1603, "Đặt vé đã được xác nhận", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_PENDING(1604, "Đặt vé không ở trạng thái chờ", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_EXISTS(1605, "Đã tồn tại thanh toán cho đặt vé này", HttpStatus.BAD_REQUEST),
    QR_TOKEN_INVALID(1606, "QR không hợp lệ", HttpStatus.BAD_REQUEST),
    QR_TOKEN_EXPIRED(1607, "QR đã hết hạn", HttpStatus.BAD_REQUEST),
    QR_USED(1608, "QR đã được sử dụng", HttpStatus.BAD_REQUEST),
    BOOKING_INVALID_FOR_SCAN(1609, "Đặt vé không hợp lệ để quét", HttpStatus.BAD_REQUEST),
    ;



    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
    }
}
