package com.example.cinema_booking.controller;

import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.entity.Genre;

import com.example.cinema_booking.service.GenreService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/genres")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenreController {

    GenreService genreService;

    @GetMapping
    public APIResponse<List<Genre>> findAllGenres() {
        List<Genre> genres = genreService.findAllGenres();
        return APIResponse.<List<Genre>>builder()
                .result(genres)
                .build();
    }

    @PostMapping
    public APIResponse<Genre> createGenre(@RequestBody Genre genre) {
        Genre createdGenre = genreService.createGenre(genre.getName());
        return APIResponse.<Genre>builder()
                .result(createdGenre)
                .build();
    }
}
