package com.example.cinema_booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleCreateRequest {
    @NotBlank
    String name;
    
    String description;

    // permission names
    Set<String> permissions;
}

