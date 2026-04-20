package com.example.cinema_booking.repository;

import com.example.cinema_booking.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, String> {
    Optional<Genre> findByNameIgnoreCase(String name);

}
