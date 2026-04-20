package com.example.cinema_booking.repository;

import com.example.cinema_booking.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, String> {
    List<BookingSeat> findByBookingId(String bookingId);

    long countByBookingId(String bookingId);
}

