package com.example.cinema_booking.controller;

import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.MovieCreateRequest;
import com.example.cinema_booking.dto.request.MovieUpdateRequest;
import com.example.cinema_booking.dto.response.MovieResponse;
import com.example.cinema_booking.dto.response.PageResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import com.example.cinema_booking.service.MovieService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieController {

    MovieService movieService;


    @PostMapping
        public APIResponse<MovieResponse> createMovie(@Valid @RequestBody MovieCreateRequest request){
        log.info("createMovie");

        return APIResponse.<MovieResponse>builder()
                .result(movieService.createMovie(request))
                .build();
    }

    @GetMapping
    public APIResponse<List<MovieResponse>> getAllMovies(){
        return APIResponse.<List<MovieResponse>>builder()
                .result(movieService.getAllMovies())
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<MovieResponse> getMovieById(@PathVariable String id) {
        return APIResponse.<MovieResponse>builder()
                .result(movieService.getMovieById(id))
                .build();
    }
    @PutMapping("/{id}")
        public APIResponse<MovieResponse> updateMovie(@PathVariable String id, @Valid @RequestBody MovieUpdateRequest request){
        return APIResponse.<MovieResponse>builder()
                .result(movieService.updateMovie(id, request))
                .build();
    }
    @PutMapping("/{id}/status/{status}")
    public APIResponse<Void> updateStatus(@PathVariable String id, @PathVariable String status) {
        movieService.updateStatus(id, status);
        return APIResponse.<Void>builder()
                .message("update success")
                .build();
    }

    @DeleteMapping("/{id}")
    public APIResponse<Void> deleteMovie(@PathVariable String id) {
        movieService.deleteMovie(id);
        return APIResponse.<Void>builder()
                .message("delete success")
                .build();
    }

     @GetMapping("/page")
    public APIResponse<PageResponse<MovieResponse>> getMovies(@RequestParam int page, @RequestParam int size) {
         return APIResponse.<PageResponse<MovieResponse>>builder()
                 .result(movieService.getMovies(page, size))
                 .build();
     }

    @GetMapping("/status")
    public APIResponse<List<MovieResponse>> getMovieByStatus(@RequestParam String status) {
            return APIResponse.<List<MovieResponse>>builder()
                    .result(movieService.getMovieByStatus(status))
                    .build();
    }

    @GetMapping("/search")
    public APIResponse<List<MovieResponse>> searchMovies(@RequestParam String keyword) {
        return APIResponse.<List<MovieResponse>>builder()
                .result(movieService.searchMovies(keyword))
                .build();
    }

    @GetMapping("/genre/{genreId}")
    public APIResponse<List<MovieResponse>> getMoviesByGenre(@PathVariable String genreId) {
        return APIResponse.<List<MovieResponse>>builder()
                .result(movieService.getMoviesByGenre(genreId))
                .build();
    }

}
