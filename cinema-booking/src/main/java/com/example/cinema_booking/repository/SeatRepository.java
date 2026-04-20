package com.example.cinema_booking.repository;

import com.example.cinema_booking.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {

    boolean existsByRoomId(String id);


    List<Seat> findByRoomId(String id);
}
