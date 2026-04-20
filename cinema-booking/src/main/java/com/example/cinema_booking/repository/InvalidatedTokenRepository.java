package com.example.cinema_booking.repository;

import com.example.cinema_booking.entity.InvalidatedToken;
import com.example.cinema_booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
