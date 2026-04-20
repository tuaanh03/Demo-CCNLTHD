package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.BookingRequest;
import com.example.cinema_booking.dto.response.PaymentResponse;

import java.util.Map;

public interface PaymentService {
    PaymentResponse createCheckoutPayment(BookingRequest request, String ipAddress);

    String buildVnpayReturnRedirectUrl(Map<String, String> vnpParams);

    Map<String, String> handleVnpayIpn(Map<String, String> vnpParams);
}
