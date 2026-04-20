package com.example.cinema_booking.dto.request;


import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data // tạo getter, setter, toString, equals, hashCode
@Builder //cho phép sử dụng setter trên  dòng ko cần tạo 1 object rồi mới set
@NoArgsConstructor //tạo constructor ko tham số
@AllArgsConstructor //tạo constructor có tham số
@FieldDefaults(level = AccessLevel.PRIVATE) //gán AccessLevel.PRIVATE cho tất cả các field
public class LogoutRequest {

    @NotBlank(message = "NOT_NULL")
    String token;

}
