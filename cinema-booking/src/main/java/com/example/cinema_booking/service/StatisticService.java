package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.RevenueStatisticsRequest;
import com.example.cinema_booking.dto.response.RevenueStatisticsResponse;



public interface StatisticService {
    RevenueStatisticsResponse getRevenueStatistics(RevenueStatisticsRequest request);
}
