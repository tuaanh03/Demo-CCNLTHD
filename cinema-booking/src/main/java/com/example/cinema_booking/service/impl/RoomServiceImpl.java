package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.RoomRequest;
import com.example.cinema_booking.dto.response.RoomResponse;
import com.example.cinema_booking.entity.Room;
import com.example.cinema_booking.mapper.RoomMapper;
import com.example.cinema_booking.repository.RoomRepository;
import com.example.cinema_booking.service.RoomService;
import com.example.cinema_booking.service.SeatService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomServiceImpl implements RoomService {
    RoomRepository roomRepository;
    RoomMapper roomMapper;
    SeatService seatService;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.existsByRoomName(request.getRoomName())) {
            throw new RuntimeException("Room name already exists!");
        }
        Room  room =roomMapper.toRoom(request);


        Room save = roomRepository.save(room);

        seatService.createSeatsForRoom(save);
        return roomMapper.toRoomResponse(save);
    }

    @Override
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toRoomResponse)
                .toList();
    }
}
