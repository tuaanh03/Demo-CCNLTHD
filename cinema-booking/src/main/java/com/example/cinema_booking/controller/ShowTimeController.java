package com.example.cinema_booking.controller;

import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.ShowTimeCreateRequest;
import com.example.cinema_booking.dto.response.ShowTimeResponse;
import com.example.cinema_booking.service.ShowTimeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/showtimes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeController {
    ShowTimeService showTimeService;

    @PostMapping
    public APIResponse<ShowTimeResponse> createShowTime(@RequestBody ShowTimeCreateRequest request){
        return APIResponse.<ShowTimeResponse>builder()
                .result(showTimeService.createScreening(request))
                .message("ShowTime created successfully")
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<ShowTimeResponse> getShowTimeById(@PathVariable String id) {
        return APIResponse.<ShowTimeResponse>builder()
                .result(showTimeService.getShowTimeById(id))
                .build();
    }

    @GetMapping()
    public APIResponse<List<ShowTimeResponse>> getAllShowTimesForUser() {
        return APIResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getAllShowTimesForUser())
                .build();
    }

    @GetMapping("/all")
    public APIResponse<List<ShowTimeResponse>> getAllShowTimes() {
        return APIResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getAllShowTimes())
                .build();
    }

    @DeleteMapping("/{id}")
    public APIResponse<Void> deleteShowTime(@PathVariable String id) {
        showTimeService.deleteShowTime(id);
        return APIResponse.<Void>builder()
                .message("ShowTime deleted successfully")
                .build();
    }

    @PutMapping("/{id}")
    public APIResponse<ShowTimeResponse> updateShowTime(
            @PathVariable String id,
            @RequestBody ShowTimeCreateRequest request) {
        return APIResponse.<ShowTimeResponse>builder()
                .result(showTimeService.updateShowTime(id, request))
                .message("ShowTime updated successfully")
                .build();
    }
}
