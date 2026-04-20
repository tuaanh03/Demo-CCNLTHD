package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.ShowTimeCreateRequest;
import com.example.cinema_booking.dto.response.ShowTimeResponse;
import com.example.cinema_booking.entity.Room;
import com.example.cinema_booking.entity.ShowTime;

import java.util.List;

public interface ShowTimeService {
    ShowTimeResponse createScreening(ShowTimeCreateRequest request);
    ShowTimeResponse getShowTimeById(String showTimeId);
    List<ShowTimeResponse> getAllShowTimes();
    List<ShowTimeResponse> getAllShowTimesForUser();
    void deleteShowTime(String showTimeId);
    ShowTimeResponse updateShowTime(String showTimeId, ShowTimeCreateRequest request);
}
