package com.example.cinema_booking.dto.request;

import com.example.cinema_booking.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data // tạo getter, setter, toString, equals, hashCode
@Builder //cho phép sử dụng setter trên  dòng ko cần tạo 1 object rồi mới set
@NoArgsConstructor //tạo constructor ko tham số
@AllArgsConstructor //tạo constructor có tham số
@FieldDefaults(level = AccessLevel.PRIVATE) //gán AccessLevel.PRIVATE cho tất cả các field


public class UserAssignRoleRequest {
    String id;

    @NotNull(message = "NOT_NULL")
    Role role;
}
