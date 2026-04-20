package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.HoldSeatRequest;
import com.example.cinema_booking.dto.response.HoldSeatResponse;

import java.util.List;

public interface SeatHoldService {

    HoldSeatResponse createHoldSeat(HoldSeatRequest holdSeatRequest);
    void releaseHoldSeat(List<String> seatShowTimeIds);
     boolean isHoldSeatValid(String seatShowtimeId);
}
