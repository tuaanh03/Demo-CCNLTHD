package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.response.SeatShowTimeResponse;
import com.example.cinema_booking.entity.Room;
import com.example.cinema_booking.entity.ShowTime;
import com.example.cinema_booking.enums.SeatType;

import java.util.List;

public interface SeatShowTimeService {
    void createSeatShowTime(ShowTime showTime, Room room);
    List<SeatShowTimeResponse> getSeatStatusByShowTimeId(String showTimeId);
    void updateSeatPrice(String showtimeId, SeatType type, Double price);
}
