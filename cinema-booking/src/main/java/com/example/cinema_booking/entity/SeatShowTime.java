package com.example.cinema_booking.entity;


import com.example.cinema_booking.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(
        name = "seat_showtime",
        uniqueConstraints = @UniqueConstraint(columnNames = {"showtime_id", "seat_id"})
)
public class SeatShowTime {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id")
    private ShowTime showtime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id")
    private Seat seat;

    private Double price;

    @Enumerated(EnumType.STRING)
    private SeatStatus status; // AVAILABLE, HOLD, BOOKED

    private LocalDateTime holdStartTime;     // Khi bắt đầu hold
    private LocalDateTime holdExpireTime;    // Khi hết hạn hold

    @ManyToOne(optional = true)
    private User heldByUser;
}
