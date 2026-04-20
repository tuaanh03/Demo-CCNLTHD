package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.RoleCreateRequest;
import com.example.cinema_booking.dto.request.RoleUpdateRequest;
import com.example.cinema_booking.dto.response.RoleResponse;
import com.example.cinema_booking.entity.Permission;
import com.example.cinema_booking.entity.Role;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.mapper.RoleMapper;
import com.example.cinema_booking.repository.PermissionRepository;
import com.example.cinema_booking.repository.RoleRepository;
import com.example.cinema_booking.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;
    PermissionRepository permissionRepository;


    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public RoleResponse create(RoleCreateRequest request) {

        var role = roleMapper.toEntity(request);

        if (role == null || role.getName() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (roleRepository.existsById(request.getName())) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        Set<Permission> permissions = resolvePermissions(request.getPermissions());
        role.setPermissions(permissions);

        return roleMapper.toResponse(roleRepository.save(role));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public RoleResponse update(String name, RoleUpdateRequest request) {
        Role role = roleRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        if (request.getPermissions() != null) {
            role.setPermissions(resolvePermissions(request.getPermissions()));
        }

        return roleMapper.toResponse(roleRepository.save(role));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public void delete(String name) {
        if (!roleRepository.existsById(name)) {
            throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        }
        roleRepository.deleteById(name);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    @Override
    public RoleResponse getByName(String name) {
        Role role = roleRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        return roleMapper.toResponse(role);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    @Override
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    private Set<Permission> resolvePermissions(Set<String> permissionNames) {
        if (permissionNames == null || permissionNames.isEmpty()) {
            return new HashSet<>();
        }

        Set<Permission> permissions = new HashSet<>();
        for (String permissionName : permissionNames) {
            Permission permission = permissionRepository.findById(permissionName)
                    .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));
            permissions.add(permission);
        }
        return permissions;
    }

}

