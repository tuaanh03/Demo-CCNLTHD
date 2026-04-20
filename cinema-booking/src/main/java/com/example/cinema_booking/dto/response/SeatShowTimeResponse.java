package com.example.cinema_booking.dto.response;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;


@Data  //@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatShowTimeResponse {
     String id;

     String seatCode;

    String status;
    String seatType;
    Double price;

    // Hold info for frontend
    LocalDateTime holdExpireTime;  // Để frontend tính countdown nếu cần
    String heldByUserEmail;         // Optional - hiển thị user nào hold (privacy-safe)
}
