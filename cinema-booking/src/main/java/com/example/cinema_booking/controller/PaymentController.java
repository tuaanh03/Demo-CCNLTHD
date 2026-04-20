package com.example.cinema_booking.controller;


import com.example.cinema_booking.config.VNPayConfig;
import com.example.cinema_booking.dto.request.APIResponse;
import com.example.cinema_booking.dto.request.BookingRequest;
import com.example.cinema_booking.dto.response.PaymentResponse;
import com.example.cinema_booking.service.PaymentService;
import com.example.cinema_booking.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;

    @PostMapping("/checkout")
    public APIResponse<PaymentResponse> checkout(@Valid @RequestBody BookingRequest request, HttpServletRequest httpServletRequest)
    {
        request.setUserId(SecurityUtils.getCurrentUserId());
        String ipAddress = VNPayConfig.getIpAddress(httpServletRequest);

        return APIResponse.<PaymentResponse>builder()
                .result(paymentService.createCheckoutPayment(request, ipAddress))
                .build();
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> vnpParams) {
        String redirectUrl = paymentService.buildVnpayReturnRedirectUrl(vnpParams);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    @GetMapping("/vnpay-ipn")
    public Map<String, String> vnpayIpn(@RequestParam Map<String, String> vnpParams) {
        return paymentService.handleVnpayIpn(vnpParams);
    }
}
