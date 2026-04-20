package com.example.cinema_booking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoldSeatRequest {
    @NotEmpty(message = "INVALID_REQUEST")
    List<@NotBlank(message = "NOT_NULL") String> seatShowTimeIds;

    @NotBlank(message = "NOT_NULL")
    String showTimeId;  // ShowTime ID (not SeatShowTime ID)

    @Null(message = "INVALID_REQUEST")
    String userId;

    @NotNull(message = "NOT_NULL")
    @Min(value = 1, message = "INVALID_REQUEST")
    @Max(value = 15, message = "INVALID_REQUEST")
    Integer holdDuration; // in minutes
}
