package com.example.cinema_booking.mapper;

import com.example.cinema_booking.dto.response.SeatResponse;
import com.example.cinema_booking.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SeatMapper {

    @Mapping(target = "seatCode", expression = "java(seat.getSeatRow() + seat.getSeatNumber())")
    SeatResponse toSeatResponse(Seat seat);

    List<SeatResponse> toSeatResponses(List<Seat> seats);
}
