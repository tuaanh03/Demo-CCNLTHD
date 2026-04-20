package com.example.cinema_booking.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieResponse {
    private String id;
    private String title;
    private String description;
    private String director;
    private String actors;
    private String duration;
    private String status;
    private LocalDate releaseDate;
    private List<String> genreIds;        // Danh sách ID thể loại
    private List<String> genreNames;      // Danh sách tên thể loại
    private String imageUrl;
    private String trailerUrl;
}
