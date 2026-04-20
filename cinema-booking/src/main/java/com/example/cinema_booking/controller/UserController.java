package com.example.cinema_booking.controller;


import com.example.cinema_booking.config.TestUserConfig;
import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.UserRegisterRequest;
import com.example.cinema_booking.dto.request.UserUpdateRequest;
import com.example.cinema_booking.dto.response.UserResponse;
import com.example.cinema_booking.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;
    TestUserConfig testUserConfig;

    @PostMapping
    APIResponse<UserResponse> registerUser(@RequestBody  @Valid UserRegisterRequest request){
        log.info("registerUser");


       return APIResponse.<UserResponse>builder()
               .result(userService.createUser(request))
               .build();

    }

    @PutMapping("/{userId}")
    APIResponse<UserResponse> updateUser(@RequestBody @Valid UserUpdateRequest request, @PathVariable("userId") String userId){
        log.info("updateUser");

        return APIResponse.<UserResponse>builder()
                .result(userService.updateUser(request, userId))
                .build();
    }

    @GetMapping("/{userId}")
    APIResponse<UserResponse> getUserById(@PathVariable("userId") String userId){
        log.info("getUserById");

        return APIResponse.<UserResponse>builder()
                .result(userService.getUserById(userId))
                .build();
    }

    @GetMapping
    APIResponse<List<UserResponse>> getAllUser(){
        log.info("getAllUser");

        return APIResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GetMapping("/myInfo")
    APIResponse<UserResponse> getMyInfo(){
        log.info("myInfo");

        return APIResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @GetMapping("/test-user/id")
    public APIResponse<String> getTestUserId(){
        log.info("getTestUserId");
        return APIResponse.<String>builder()
                .result(testUserConfig.getId())
                .message("Test user ID")
                .build();
    }
}
