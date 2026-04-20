package com.example.cinema_booking.mapper;

import com.example.cinema_booking.dto.request.PermissionCreateRequest;
import com.example.cinema_booking.dto.request.PermissionUpdateRequest;
import com.example.cinema_booking.dto.response.PermissionResponse;
import com.example.cinema_booking.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toEntity(PermissionCreateRequest request);
    PermissionResponse toResponse(Permission permission);

    void updateEntity(PermissionUpdateRequest request, @MappingTarget Permission permission);
}

