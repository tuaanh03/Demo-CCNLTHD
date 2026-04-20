package com.example.cinema_booking.controller;


import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.SeatTypeUpdateRequest;
import com.example.cinema_booking.dto.response.SeatShowTimeResponse;
import com.example.cinema_booking.enums.SeatType;
import com.example.cinema_booking.service.SeatShowTimeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seat-showtimes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatShowTimeController {

    SeatShowTimeService seatShowTimeService;

    @GetMapping("/{showTimeId}")
    public APIResponse<List<SeatShowTimeResponse>> getSeatStatusByShowTimeId(@PathVariable String showTimeId){
        return APIResponse.<List<SeatShowTimeResponse>>builder()
                .result(seatShowTimeService.getSeatStatusByShowTimeId(showTimeId))
                .build();
    }

    @PatchMapping("/{showTimeId}")
    public APIResponse<Void> updateSeatPriceByShowTimeId(
            @PathVariable String showTimeId,
            @Valid @RequestBody SeatTypeUpdateRequest request){

        SeatType seatType = SeatType.valueOf(request.getSeatType().toUpperCase());

        seatShowTimeService.updateSeatPrice(
                showTimeId,
                seatType,
                request.getPrice()
        );

        return APIResponse.<Void>builder()
                .message("Seat price updated successfully")
                .build();
    }


}
