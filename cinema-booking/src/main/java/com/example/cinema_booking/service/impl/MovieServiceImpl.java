package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.MovieCreateRequest;
import com.example.cinema_booking.dto.request.MovieUpdateRequest;
import com.example.cinema_booking.dto.response.MovieResponse;
import com.example.cinema_booking.dto.response.PageResponse;
import com.example.cinema_booking.entity.Genre;
import com.example.cinema_booking.entity.Movie;
import com.example.cinema_booking.enums.MovieStatus;
import com.example.cinema_booking.enums.ShowTimeStatus;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.mapper.MovieMapper;
import com.example.cinema_booking.repository.MovieRepository;
import com.example.cinema_booking.service.CloudinaryService;
import com.example.cinema_booking.service.GenreService;
import com.example.cinema_booking.service.MovieService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieServiceImpl implements MovieService {
     MovieRepository movieRepository;
     GenreService genreService;
     MovieMapper movieMapper;
     CloudinaryService cloudinaryService;

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    @Transactional
    public MovieResponse createMovie(MovieCreateRequest request) {

        // Tìm hoặc tạo genres từ genreIds và genreNames
        var genres = genreService.findOrCreateGenres(request.getGenreIds(), request.getGenreNames());

        Movie movie = movieMapper.toMovie(request);
        movie.setGenres(genres);

         // 🔥 xử lý status
         if (request.getStatus() != null && !request.getStatus().isBlank()) {
             movie.setStatus(parseMovieStatus(request.getStatus()));
         } else {
             movie.setStatus(MovieStatus.COMING_SOON); // default
         }

        Movie save = movieRepository.save(movie);
         // ép Hibernate load genres
         save.getGenres().size();

        return movieMapper.toMovieResponse(save);
    }

    public List<MovieResponse> getAllMovies() {
        List<Movie> movies = movieRepository.findAll();
        return movies.stream()
                .map(movieMapper::toMovieResponse)
                .toList();
    }
    public MovieResponse getMovieById(String id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_EXIST));
        return movieMapper.toMovieResponse(movie);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    public MovieResponse updateMovie(String id, MovieUpdateRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_EXIST));

        movieMapper.updateMovieFromRequest(request, movie);

        // Cập nhật genres nếu có genreIds hoặc genreNames
        if ((request.getGenreIds() != null && !request.getGenreIds().isEmpty()) ||
            (request.getGenreNames() != null && !request.getGenreNames().isEmpty())) {
            var genres = genreService.findOrCreateGenres(request.getGenreIds(), request.getGenreNames());
            movie.setGenres(genres);
        }

        // xử lý status (enum)
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            movie.setStatus(parseMovieStatus(request.getStatus()));
        }

        Movie updatedMovie = movieRepository.save(movie);
        return movieMapper.toMovieResponse(updatedMovie);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    @Transactional
    public void updateStatus(String id, String status) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_EXIST));

        movie.setStatus(parseMovieStatus(status));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
     public void deleteMovie(String id) {
         Movie movie = movieRepository.findById(id)
                 .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_EXIST));
         movieRepository.delete(movie);
     }


    public PageResponse<MovieResponse> getMovies(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Movie> moviePage = movieRepository.findAll(pageable);

        return PageResponse.<MovieResponse>builder()
                .content(moviePage.getContent().stream().map(movieMapper::toMovieResponse).toList())
                .page(moviePage.getNumber())
                .size(moviePage.getSize())
                .totalElements(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .build();
    }

    public List<MovieResponse> getMovieByStatus(String status) {
        MovieStatus movieStatus = parseMovieStatus(status);

        List<Movie> movies = movieRepository.findByStatusWithFutureShowTimes(
                movieStatus,
                LocalDateTime.now(),
                ShowTimeStatus.ACTIVE
        );

        return movies.stream()
                .map(movieMapper::toMovieResponse)
                .toList();
    }

    private MovieStatus parseMovieStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new AppException(ErrorCode.INVALID_MOVIE_STATUS);
        }

        try {
            return MovieStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_MOVIE_STATUS);
        }
    }

    public List<MovieResponse> searchMovies(String keyword) {
        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(keyword);
        return movieMapper.toMovieResponseList(movies);
    }

    public List<MovieResponse> getMoviesByGenre(String genreId) {
        List<Movie> movies = movieRepository.findByGenreId(genreId);
        return movieMapper.toMovieResponseList(movies);
    }



}
