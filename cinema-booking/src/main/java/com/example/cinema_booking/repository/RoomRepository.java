package com.example.cinema_booking.repository;

import com.example.cinema_booking.entity.Room;
import com.example.cinema_booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    boolean existsByRoomName(String roomName);
    Room findByRoomName(String roomName);
}
