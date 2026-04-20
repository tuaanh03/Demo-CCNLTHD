package com.example.cinema_booking.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data  //@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomResponse {
    String id;
    String roomName;
    Integer totalRows;
    Integer totalColumns;
}
