package com.example.cinema_booking.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatTypeUpdateRequest {
    @NotBlank(message = "NOT_NULL")
    String seatType;

    @NotNull
    @DecimalMin(value = "1.0", message = "INVALID_REQUEST")
    Double price;

}
