package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.MovieCreateRequest;
import com.example.cinema_booking.dto.request.MovieUpdateRequest;
import com.example.cinema_booking.dto.response.MovieResponse;
import com.example.cinema_booking.dto.response.PageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MovieService {
    MovieResponse createMovie(MovieCreateRequest request);
    List<MovieResponse> getAllMovies();
    MovieResponse getMovieById(String id);
    MovieResponse updateMovie(String id, MovieUpdateRequest request);
    void deleteMovie(String id);
    void updateStatus(String id, String status);
    PageResponse<MovieResponse> getMovies(int page, int size);
    List<MovieResponse> getMovieByStatus(String status);
    List<MovieResponse> searchMovies(String keyword);
    List<MovieResponse> getMoviesByGenre(String genreId);


}
