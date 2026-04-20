package com.example.cinema_booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Null;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    @Null(message = "INVALID_REQUEST")
    String userId;

    @NotBlank(message = "NOT_NULL")
    String showTimeId;

    @NotEmpty(message = "INVALID_REQUEST")
    List<@NotBlank(message = "NOT_NULL") String> seatShowTimeIds;
}

