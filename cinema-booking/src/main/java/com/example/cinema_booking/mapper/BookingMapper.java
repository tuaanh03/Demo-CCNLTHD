package com.example.cinema_booking.mapper;

import com.example.cinema_booking.dto.request.BookingRequest;
import com.example.cinema_booking.entity.Booking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    Booking toBooking(BookingRequest request);
}
