package com.example.cinema_booking.service;

import com.example.cinema_booking.entity.Genre;

import java.util.List;
import java.util.Set;

public interface GenreService {
    Genre findOrCreateGenre(String genreId, String genreName);
    Set<Genre> findOrCreateGenres(List<String> genreIds, List<String> genreNames);
    List<Genre> findAllGenres();
    Genre createGenre(String genreName);
}
