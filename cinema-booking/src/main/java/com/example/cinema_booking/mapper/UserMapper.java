package com.example.cinema_booking.mapper;

import com.example.cinema_booking.dto.request.*;
import com.example.cinema_booking.dto.response.UserResponse;
import com.example.cinema_booking.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")

public interface UserMapper {
    User toUser(UserRegisterRequest request);
    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUserFromRequest(UserUpdateRequest request, @MappingTarget User user);

    void updateUserStatusFromRequest(UserUpdateStatusRequest request, @MappingTarget User user);
    void assignUserRoleFromRequest(UserAssignRoleRequest request, @MappingTarget User user);
}
