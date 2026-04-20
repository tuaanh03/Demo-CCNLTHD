package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.response.SeatResponse;
import com.example.cinema_booking.entity.Room;
import com.example.cinema_booking.entity.Seat;
import com.example.cinema_booking.enums.SeatType;
import com.example.cinema_booking.repository.SeatRepository;
import com.example.cinema_booking.service.SeatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatServiceImpl  implements SeatService {

    SeatRepository seatRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public void createSeatsForRoom(Room room) {

        if (seatRepository.existsByRoomId(room.getId())) {
            throw new RuntimeException("Seats already exist for this room");
        }

        List<Seat> seats = new ArrayList<>();

        int totalRows = room.getTotalRows();

        for (int i = 0; i < totalRows; i++) {
            String row = String.valueOf((char) ('A' + i));

            for (int j = 1; j <= room.getTotalColumns(); j++) {

                Seat seat = new Seat();
                seat.setSeatRow(row);
                seat.setSeatNumber(j);
                seat.setRoom(room);

                // 👉 LOGIC PHÂN LOẠI GHẾ
                if (i >= totalRows / 3 && i <= (totalRows * 2 / 3)) {
                    seat.setType(SeatType.VIP); // hàng giữa
                } else {
                    seat.setType(SeatType.NORMAL); // hàng ngoài
                }

                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);
    }

    @Override
    public List<SeatResponse> getSeatsByRoomId(String roomId) {
        return List.of();
    }
}
