package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.*;
import com.example.cinema_booking.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRegisterRequest request);
    UserResponse updateUser(UserUpdateRequest request, String userId);
    List<UserResponse> getUsers();
    UserResponse getUserById(String userId);

    UserResponse getMyInfo();
}
