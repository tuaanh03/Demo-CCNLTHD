package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.PermissionCreateRequest;
import com.example.cinema_booking.dto.request.PermissionUpdateRequest;
import com.example.cinema_booking.dto.response.PermissionResponse;
import com.example.cinema_booking.entity.Permission;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.mapper.PermissionMapper;
import com.example.cinema_booking.repository.PermissionRepository;
import com.example.cinema_booking.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public PermissionResponse create(PermissionCreateRequest request) {
        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (permissionRepository.existsById(request.getName())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Permission permission = permissionMapper.toEntity(request);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

   @PreAuthorize("hasRole('ADMIN')")
    @Override
    public PermissionResponse update(String name, PermissionUpdateRequest request) {
        if (name == null || name.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Permission permission = permissionRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));

        permissionMapper.updateEntity(request, permission);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public void delete(String permissionId) {
        if (permissionId == null || permissionId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (!permissionRepository.existsById(permissionId)) {
            throw new AppException(ErrorCode.PERMISSION_NOT_EXISTED);
        }
        permissionRepository.deleteById(permissionId);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    @Override
    public PermissionResponse getByName(String name) {
        if (name == null || name.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Permission permission = permissionRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));
        return permissionMapper.toResponse(permission);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    @Override
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll().stream()
                .map(permissionMapper::toResponse)
                .toList();
    }
}

