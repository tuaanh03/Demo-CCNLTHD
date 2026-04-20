package com.example.cinema_booking.controller;


import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.HoldSeatRequest;
import com.example.cinema_booking.dto.response.HoldSeatResponse;
import com.example.cinema_booking.service.SeatHoldService;
import com.example.cinema_booking.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seat-holds")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatHoldController {

    SeatHoldService seatHoldService;

    /**
     * Hold ghế tại bước thanh toán
     * POST /home/seat-holds/reserve
     */
    @PostMapping("/reserve")
    public APIResponse<HoldSeatResponse> holdSeats(@Valid @RequestBody HoldSeatRequest request) {
        // Force userId from authenticated JWT (prevents spoofing & removes hardcode)
        request.setUserId(SecurityUtils.getCurrentUserId());

        HoldSeatResponse response = seatHoldService.createHoldSeat(request);
        return APIResponse.<HoldSeatResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Release hold thủ công (user hủy thanh toán)
     * DELETE /home/seat-holds/release
     */
    @PostMapping("/release")
    public APIResponse<String> releaseHold(@RequestBody List<String> seatShowTimeIds) {
        seatHoldService.releaseHoldSeat(seatShowTimeIds);
        return APIResponse.<String>builder()
                .result("OK")
                .message("Ghế đã được giải phóng")
                .build();
    }

    /**
     * Check xem hold còn valid không
     * GET /home/seat-holds/{seatShowTimeId}/valid
     */
    @GetMapping("/{seatShowTimeId}/valid")
    public APIResponse<Boolean> isHoldValid(@PathVariable String seatShowTimeId) {
        boolean valid = seatHoldService.isHoldSeatValid(seatShowTimeId);
        return APIResponse.<Boolean>builder()
                .result(valid)
                .build();
    }
}
