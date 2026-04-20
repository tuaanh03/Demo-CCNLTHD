package com.example.cinema_booking.controller;

import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.RevenueStatisticsRequest;
import com.example.cinema_booking.dto.response.RevenueStatisticsResponse;
import com.example.cinema_booking.service.BookingService;
import com.example.cinema_booking.service.StatisticService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class AdminStatisticsController {
    StatisticService statisticsService;

    @PostMapping("/statistics")
    public APIResponse<RevenueStatisticsResponse> getRevenueStatistics(@RequestBody RevenueStatisticsRequest request) {
        return APIResponse.<RevenueStatisticsResponse>builder()
                .result(statisticsService.getRevenueStatistics(request))
                .build();
    }
}

