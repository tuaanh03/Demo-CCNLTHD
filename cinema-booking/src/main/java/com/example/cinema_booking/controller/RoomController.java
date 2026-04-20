package com.example.cinema_booking.controller;


import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.RoomRequest;
import com.example.cinema_booking.dto.response.RoomResponse;
import com.example.cinema_booking.service.RoomService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomController {

    RoomService roomService;

    @GetMapping
    public APIResponse<List<RoomResponse>> getAllRooms(){
        return APIResponse.<List<RoomResponse>>builder()
                .result(roomService.getAllRooms())
    
                .build();
    }

    @PostMapping
    public APIResponse<RoomResponse> createRoom(@RequestBody RoomRequest request){
        return APIResponse.<RoomResponse>builder()
                .result(roomService.createRoom(request))
                .build();
    }

}
