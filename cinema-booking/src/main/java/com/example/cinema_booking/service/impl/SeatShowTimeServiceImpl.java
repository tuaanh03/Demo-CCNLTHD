package com.example.cinema_booking.service.impl;


import com.example.cinema_booking.dto.response.SeatShowTimeResponse;
import com.example.cinema_booking.dto.response.ShowTimeResponse;
import com.example.cinema_booking.entity.Room;
import com.example.cinema_booking.entity.Seat;
import com.example.cinema_booking.entity.SeatShowTime;
import com.example.cinema_booking.entity.ShowTime;
import com.example.cinema_booking.enums.SeatStatus;
import com.example.cinema_booking.enums.SeatType;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.SeatRepository;
import com.example.cinema_booking.repository.SeatShowTimeRepository;
import com.example.cinema_booking.service.SeatService;
import com.example.cinema_booking.service.SeatShowTimeService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatShowTimeServiceImpl  implements SeatShowTimeService {

    SeatRepository seatRepository;
    SeatShowTimeRepository seatShowTimeRepository;


    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void createSeatShowTime(ShowTime showTime, Room room){

        // tránh tạo trùng
        if (seatShowTimeRepository.existsByShowtimeId(showTime.getId())) {
            throw new AppException(ErrorCode.SEAT_SHOWTIME_EXISTED);
        }

        List<Seat> seats = seatRepository.findByRoomId(room.getId());

        List<SeatShowTime> list= seats.stream().map(seat -> SeatShowTime.builder()
                .id(UUID.randomUUID().toString())
                .seat(seat)
                .showtime(showTime)
                .status(SeatStatus.AVAILABLE)
                .price(
                        switch(seat.getType()) {
                            case VIP ->  100000.0;
                            case NORMAL -> 150000.0;
                        }
                )
                .build()).toList();

        seatShowTimeRepository.saveAll(list);
    }

    @Cacheable(value = "seat-availability", key = "#showTimeId")
    public List<SeatShowTimeResponse> getSeatStatusByShowTimeId(String showTimeId){
        List<SeatShowTime> seatShowTimes = seatShowTimeRepository.findByShowTimeIdOptimized(showTimeId);

        return seatShowTimes.stream()
                .map(sst ->{
                    Seat seat = sst.getSeat();
                    String seatCode = seat.getSeatRow() + seat.getSeatNumber();
                    return SeatShowTimeResponse.builder()
                            .id(sst.getId())
                            .status(sst.getStatus().name())
                            .seatCode(seatCode)
                            .seatType(seat.getType().name())
                            .price(sst.getPrice())
                            .holdExpireTime(sst.getHoldExpireTime())
                            .heldByUserEmail(sst.getHeldByUser() != null ? sst.getHeldByUser().getEmail() : null)
                            .build();
                })
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateSeatPrice(String showtimeId, SeatType type, Double price){
        List<SeatShowTime> seatShowTimes = seatShowTimeRepository.findByShowtimeId(showtimeId);


        for(SeatShowTime sst : seatShowTimes){
            if(sst.getSeat().getType() == type){
                sst.setPrice(price);
            }
        }
        seatShowTimeRepository.saveAll(seatShowTimes);
    }




}
