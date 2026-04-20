package com.example.cinema_booking.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Set;

// Nhớ vẽ thêm entity cho phần role quan hệ vơới user, permission
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Role {
    @Id
    String name;
    String description;

    @ManyToMany
    Set<Permission> permissions;

}
