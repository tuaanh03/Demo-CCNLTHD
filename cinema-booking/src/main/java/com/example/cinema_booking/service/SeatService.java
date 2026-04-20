package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.response.SeatResponse;
import com.example.cinema_booking.entity.Room;

import java.util.List;

public interface SeatService {
    void createSeatsForRoom(Room room);
    List<SeatResponse> getSeatsByRoomId(String roomId);
}
