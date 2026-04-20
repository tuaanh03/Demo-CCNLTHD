package com.example.cinema_booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

import com.example.cinema_booking.enums.PaymentStatus;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    private Long amount; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status; // PENDING, SUCCESS, FAILED, INVALID_SIGNATURE

    @Column(name = "txn_ref", nullable = false, length = 100)
    private String txnRef; // gửi sang vnp_TxnRef

    @Column(name = "gateway_txn_no", length = 100)
    private String gatewayTxnNo; // vnp_TransactionNo (nếu có)

    @Column(name = "response_code", length = 10)
    private String responseCode;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
}
