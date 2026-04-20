package com.example.cinema_booking.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    String bookingId;
    String userId;
    String showTimeId;
    LocalDateTime bookingTime;
    String status;
    Long totalPrice;
    String qrToken;
    String qrStatus;
    Integer qrExpired;
    List<String> seatShowTimeIds;
    List<String> seatCodes;
}

