package com.example.cinema_booking.entity;

import com.example.cinema_booking.enums.BookingStatus;
import com.example.cinema_booking.enums.QrStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    Long total_price;

    LocalDateTime bookingTime;

    @Enumerated(EnumType.STRING)
    BookingStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id")
    ShowTime showTime;

    @JsonIgnore
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @Builder.Default
    List<BookingSeat> bookingSeats = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @Builder.Default
    List<Payment> payments = new ArrayList<>();

    @Version
    Long version;

    @Column(columnDefinition = "TEXT")
    String qrToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    QrStatus qrStatus;

    Integer qrExpired; // Số phút hiệu lực QR code
}
