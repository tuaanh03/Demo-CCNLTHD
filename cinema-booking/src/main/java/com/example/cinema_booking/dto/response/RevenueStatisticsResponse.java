package com.example.cinema_booking.dto.response;

import com.example.cinema_booking.enums.StatisticGroupBy;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueStatisticsResponse {
    LocalDate fromDate;
    LocalDate toDate;
    String movieId;
    StatisticGroupBy groupBy;
    Long totalRevenue;
    Long totalBookings;
    Long totalTickets;
    List<RevenueStatisticsItemResponse> items;
}

