package com.example.cinema_booking.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowTimeCreateRequest {

    @NotNull
    String movieId;

    @NotNull
    String roomId;

    @NotNull(message = "NOT_NULL")
    LocalDateTime startTime;

}
