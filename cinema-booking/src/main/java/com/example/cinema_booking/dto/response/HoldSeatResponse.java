package com.example.cinema_booking.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data  //@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoldSeatResponse {

    List<String> heldSeatCodes;  // Danh sách mã ghế đang hold
     String showTimeId;       // ID của suất chiếu liên quan
     String userEmail;       // Email của user đang hold (nếu cần hiển thị)
     Integer holdDurationSeconds; // Thời gian hold còn lại (tính từ thời điểm trả về)
    Double totalPrice;         // Tổng giá tiền của các ghế đang hold (nếu cần hiển thị)

}
