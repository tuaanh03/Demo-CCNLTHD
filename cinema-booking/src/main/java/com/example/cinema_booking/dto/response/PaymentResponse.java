package com.example.cinema_booking.dto.response;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse implements Serializable {
    private String status;
    private String message;
    private String url;
}
