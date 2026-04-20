package com.example.cinema_booking.entity;

import com.example.cinema_booking.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Seat {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "seat_row")
    String seatRow;
    @Column(name = "seat_number")
    Integer seatNumber;
//    Long price;
    @Enumerated(EnumType.STRING)
    SeatType type;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    Room room;

    @Version
    Long version;
}
