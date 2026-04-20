package com.example.cinema_booking.controller;

import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.PermissionCreateRequest;
import com.example.cinema_booking.dto.request.PermissionUpdateRequest;
import com.example.cinema_booking.dto.response.PermissionResponse;
import com.example.cinema_booking.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {
    PermissionService permissionService;

    @PostMapping
    APIResponse<PermissionResponse> create(@RequestBody PermissionCreateRequest request) {
        return APIResponse.<PermissionResponse>builder()
                .result(permissionService.create(request))
                .build();
    }

    @PutMapping("/{name}")
    APIResponse<PermissionResponse> update(@PathVariable String name, @RequestBody PermissionUpdateRequest request) {
        return APIResponse.<PermissionResponse>builder()
                .result(permissionService.update(name, request))
                .build();
    }

    @DeleteMapping("/{permissionId}")
    APIResponse<Void> delete(@PathVariable String permissionId) {
        permissionService.delete(permissionId);
        return APIResponse.<Void>builder().build();
    }

//    @GetMapping("/{name}")
//    APIResponse<PermissionResponse> getByName(@PathVariable String name) {
//        return APIResponse.<PermissionResponse>builder()
//                .result(permissionService.getByName(name))
//                .build();
//    }

    @GetMapping
    APIResponse<List<PermissionResponse>> getAll() {
        return APIResponse.<List<PermissionResponse>>builder()
                .result(permissionService.getAll())
                .build();
    }
}


