package com.example.cinema_booking.mapper;

import com.example.cinema_booking.dto.request.RoomRequest;
import com.example.cinema_booking.dto.response.RoomResponse;
import com.example.cinema_booking.entity.Room;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    Room toRoom(RoomRequest request);
    RoomResponse toRoomResponse(Room room);
}
