package com.example.cinema_booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovieUpdateRequest {

    private String title;

    private String description;

    private String director;

    private String actors;

    private Integer duration;
    private String status;
    private LocalDate releaseDate;
    private List<String> genreIds;        // Danh sách ID thể loại
    private List<String> genreNames;      // Danh sách tên thể loại
    private String imageUrl;
    private String trailerUrl;
}