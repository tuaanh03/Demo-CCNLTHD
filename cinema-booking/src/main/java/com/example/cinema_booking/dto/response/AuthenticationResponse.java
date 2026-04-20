package com.example.cinema_booking.dto.response;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data // tạo getter, setter, toString, equals, hashCode
@Builder //cho phép sử dụng setter trên  dòng ko cần tạo 1 object rồi mới set
@NoArgsConstructor //tạo constructor ko tham số
@AllArgsConstructor //tạo constructor có tham số
@FieldDefaults(level = AccessLevel.PRIVATE) //gán AccessLevel.PRIVATE cho tất cả các field
public class AuthenticationResponse {

    String token;

    @JsonProperty("isAuthenticated")
    boolean isAuthenticated; //  nếu user cung cấp username và password đúng thì authenticated sẽ là true, ngược lại sẽ là false

}
