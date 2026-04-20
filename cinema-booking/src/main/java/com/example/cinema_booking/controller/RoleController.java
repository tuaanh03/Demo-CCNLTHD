package com.example.cinema_booking.controller;

import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.RoleCreateRequest;
import com.example.cinema_booking.dto.request.RoleUpdateRequest;
import com.example.cinema_booking.dto.response.RoleResponse;
import com.example.cinema_booking.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
    RoleService roleService;

    @PostMapping
    APIResponse<RoleResponse> create(@RequestBody RoleCreateRequest request) {
        return APIResponse.<RoleResponse>builder()
                .result(roleService.create(request))
                .build();
    }

    @PutMapping("/{name}")
    APIResponse<RoleResponse> update(@PathVariable String name, @RequestBody RoleUpdateRequest request) {
        return APIResponse.<RoleResponse>builder()
                .result(roleService.update(name, request))
                .build();
    }

    @DeleteMapping("/{role}")
    APIResponse<Void> delete(@PathVariable String role) {
        roleService.delete(role);
        return APIResponse.<Void>builder().build();
    }

//    @GetMapping("/{name}")
//    APIResponse<RoleResponse> getByName(@PathVariable String name) {
//        return APIResponse.<RoleResponse>builder()
//                .result(roleService.getByName(name))
//                .build();
//    }

    @GetMapping
    APIResponse<List<RoleResponse>> getAll() {
        return APIResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }
}

