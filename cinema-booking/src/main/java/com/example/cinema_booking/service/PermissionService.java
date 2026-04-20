package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.PermissionCreateRequest;
import com.example.cinema_booking.dto.request.PermissionUpdateRequest;
import com.example.cinema_booking.dto.response.PermissionResponse;

import java.util.List;

public interface PermissionService {
    PermissionResponse create(PermissionCreateRequest request);
    PermissionResponse update(String name, PermissionUpdateRequest request);
    void delete(String name);
    PermissionResponse getByName(String name);
    List<PermissionResponse> getAll();
}

