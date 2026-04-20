package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.*;
import com.example.cinema_booking.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRegisterRequest request);
    UserResponse updateUser(UserUpdateRequest request, String userId);
    List<UserResponse> getUsers();
    UserResponse getUserById(String userId);

//    void assignRoleToUser(UserAssignRoleRequest request, String userId, String role);

    void updateUserStatus(UserUpdateStatusRequest request, String userId);

    UserResponse getMyInfo();
}
