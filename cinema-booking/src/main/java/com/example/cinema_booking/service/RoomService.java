package com.example.cinema_booking.service;


import com.example.cinema_booking.dto.request.RoomRequest;
import com.example.cinema_booking.dto.response.RoomResponse;
import java.util.List;

public interface RoomService {

    RoomResponse createRoom(RoomRequest request);
    
    List<RoomResponse> getAllRooms();
}
