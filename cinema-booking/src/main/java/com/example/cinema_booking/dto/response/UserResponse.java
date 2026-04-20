package com.example.cinema_booking.dto.response;

import com.example.cinema_booking.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data  //@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String name;
    String email;
    //Khi test mã hóa password thì add password attribute vào dđây, nhưng khi trả về response thì ko nên trả về password
    // String password;
    String phone;
    Set<RoleResponse> roles;
}
