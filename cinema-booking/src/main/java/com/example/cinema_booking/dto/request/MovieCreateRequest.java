package com.example.cinema_booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovieCreateRequest {

    @NotBlank(message = "NOT_NULL")
    private String title;

    private String description;

    private String director;

    private String actors;

    @NotNull(message = "NOT_NULL")
    @Min(value = 1, message = "INVALID_REQUEST")
    private Integer duration;

    @NotBlank(message = "NOT_NULL")
    private String status;

    @NotNull(message = "NOT_NULL")
    private LocalDate releaseDate;

    private List<@NotBlank(message = "NOT_NULL") String> genreIds;        // Danh sách ID thể loại (có sẵn)
    private List<@NotBlank(message = "NOT_NULL") String> genreNames;      // Danh sách tên thể loại (tạo mới nếu chưa có)

    @NotBlank(message = "NOT_NULL")
    private String imageUrl;              // URL của ảnh đại diện

    @NotBlank(message = "NOT_NULL")
    private String trailerUrl;            // URL của trailer
}
