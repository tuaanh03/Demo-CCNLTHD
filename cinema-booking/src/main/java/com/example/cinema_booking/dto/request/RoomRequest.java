package com.example.cinema_booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequest {

    @NotBlank(message = "NOT_NULL")
    private String roomName;
    @Min(5)
    @NotNull(message = "NOT_NULL")
    private Integer totalRows;
    @Min(5)
    @NotNull(message = "NOT_NULL")
    private Integer totalColumns;
}
