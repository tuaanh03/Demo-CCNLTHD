package com.example.cinema_booking.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueStatisticsItemResponse {
    String key;
    String label;
    String movieId;
    String movieTitle;
    LocalDate fromDate;
    LocalDate toDate;
    Long bookingCount;
    Long ticketCount;
    Long revenue;
}

