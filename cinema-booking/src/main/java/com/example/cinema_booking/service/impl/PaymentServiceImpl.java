package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.config.VNPayConfig;
import com.example.cinema_booking.dto.request.BookingRequest;
import com.example.cinema_booking.dto.response.BookingResponse;
import com.example.cinema_booking.dto.response.PaymentResponse;
import com.example.cinema_booking.entity.Booking;
import com.example.cinema_booking.entity.Payment;
import com.example.cinema_booking.enums.BookingStatus;
import com.example.cinema_booking.enums.PaymentStatus;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.BookingRepository;
import com.example.cinema_booking.repository.PaymentRepository;
import com.example.cinema_booking.service.BookingService;
import com.example.cinema_booking.service.PaymentService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {

    static final int PAYMENT_TIMEOUT_MINUTES = 5;

    BookingRepository bookingRepository;
    VNPayConfig vnPayConfig;
    PaymentRepository paymentRepository;
    BookingService bookingService;

    @Override
    @Transactional(rollbackOn = Exception.class)
    public PaymentResponse createCheckoutPayment(BookingRequest request, String ipAddress) {
        BookingResponse bookingResponse = bookingService.createBooking(request);
        return createPaymentByBookingId(bookingResponse.getBookingId(), ipAddress);
    }

    private PaymentResponse createPaymentByBookingId(String bookingId, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        String vnp_TxnRef = "BK" + System.currentTimeMillis();
        String vnp_OrderInfo = "BOOKING_" + booking.getId();

        long bookingAmount = booking.getTotal_price() != null ? booking.getTotal_price() : 0L;
        if (bookingAmount <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        long vnp_Amount = bookingAmount * 100;

        if (paymentRepository.existsByBooking_IdAndStatus(booking.getId(), PaymentStatus.PENDING)) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_EXISTS);
        }

        Payment payment = Payment.builder()
                .amount(bookingAmount)
                .status(PaymentStatus.PENDING)
                .txnRef(vnp_TxnRef)
                .booking(booking)
                .build();
        paymentRepository.save(payment);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.getVersion());
        vnp_Params.put("vnp_Command", vnPayConfig.getCommand());
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_OrderType", vnPayConfig.getOrderType() != null ? vnPayConfig.getOrderType() : "other");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 5);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;




        return PaymentResponse.builder()
                .url(paymentUrl)
                .status("Ok")
                .message("Successfully created payment url")
                .build();
    }

    @Override
    public String buildVnpayReturnRedirectUrl(Map<String, String> vnpParams) {
        PaymentProcessResult result = processPaymentResult(vnpParams);
        String status = result.success ? "SUCCESS" : "FAILED";

        String frontendReturnUrl = vnPayConfig.getFrontendReturnUrl();
        if (frontendReturnUrl == null || frontendReturnUrl.isBlank()) {
            frontendReturnUrl = "http://localhost:3000/booking-history";
        }

        return buildRedirectUrl(frontendReturnUrl, status, result.message, result.bookingId);
    }

    @Override
    public Map<String, String> handleVnpayIpn(Map<String, String> vnpParams) {
        Map<String, String> response = new HashMap<>();
        try {
            PaymentProcessResult result = processPaymentResult(vnpParams);
            if (!result.validSignature) {
                response.put("RspCode", "97");
                response.put("Message", "Invalid signature");
                return response;
            }

            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
            return response;
        } catch (Exception ex) {
            log.error("VNPay IPN processing error", ex);
            response.put("RspCode", "99");
            response.put("Message", "Unknown error");
            return response;
        }
    }

    private PaymentProcessResult processPaymentResult(Map<String, String> vnpParams) {
        String vnpSecureHash = vnpParams.get("vnp_SecureHash");
        if (vnpSecureHash == null || vnpSecureHash.isBlank()) {
            return PaymentProcessResult.invalid("Missing signature");
        }

        Map<String, String> fieldsForHash = new HashMap<>(vnpParams);
        fieldsForHash.remove("vnp_SecureHash");
        fieldsForHash.remove("vnp_SecureHashType");

        String calculatedHash = VNPayConfig.hashAllFields(fieldsForHash, vnPayConfig.getSecretKey());
        if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
            return PaymentProcessResult.invalid("Invalid VNPay signature");
        }

        String txnRef = vnpParams.get("vnp_TxnRef");
        if (txnRef == null || txnRef.isBlank()) {
            return PaymentProcessResult.fail("Missing transaction reference", null);
        }

        Payment payment = paymentRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        Booking booking = payment.getBooking();

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return PaymentProcessResult.success("Payment already confirmed.", booking.getId());
        }

        if (payment.getStatus() == PaymentStatus.FAILED) {
            cancelPendingBookingQuietly(booking);
            return PaymentProcessResult.fail("Payment already finalized.", booking.getId());
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime paymentDeadline = booking.getBookingTime() != null
                ? booking.getBookingTime().plusMinutes(PAYMENT_TIMEOUT_MINUTES)
                : now.minusMinutes(1);

        if (now.isAfter(paymentDeadline)) {
            cancelPendingBookingQuietly(booking);
            markPaymentFailed(payment, "TIMEOUT", now);
            return PaymentProcessResult.fail("Payment session expired.", booking.getId());
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            markPaymentFailed(payment, "BOOKING_NOT_PENDING", now);
            return PaymentProcessResult.fail("Booking is no longer pending.", booking.getId());
        }

        long paidAmount = parseLongSafe(vnpParams.get("vnp_Amount"));
        long expectedAmount = (payment.getAmount() != null ? payment.getAmount() : 0L) * 100;
        if (paidAmount <= 0 || paidAmount != expectedAmount) {
            payment.setGatewayTxnNo(vnpParams.get("vnp_TransactionNo"));
            markPaymentFailed(payment, vnpParams.getOrDefault("vnp_ResponseCode", "AMOUNT_MISMATCH"), now);
            cancelPendingBookingQuietly(booking);
            return PaymentProcessResult.fail("Amount mismatch", booking.getId());
        }

        String responseCode = vnpParams.getOrDefault("vnp_ResponseCode", "");
        String transactionStatus = vnpParams.getOrDefault("vnp_TransactionStatus", "");
        boolean paymentSuccess = "00".equals(responseCode) && "00".equals(transactionStatus);

        payment.setResponseCode(responseCode);
        payment.setGatewayTxnNo(vnpParams.get("vnp_TransactionNo"));

        if (!paymentSuccess) {
            markPaymentFailed(payment, responseCode, now);
            cancelPendingBookingQuietly(booking);
            return PaymentProcessResult.fail("Payment failed.", booking.getId());
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentTime(now);
        paymentRepository.save(payment);

        try {
            bookingService.confirmBooking(booking.getId());
        } catch (AppException ex) {
            if (ex.getErrorCode() != ErrorCode.BOOKING_ALREADY_CONFIRMED) {
                throw ex;
            }
        }

        return PaymentProcessResult.success("Payment success. Booking confirmed.", booking.getId());
    }

    private void markPaymentFailed(Payment payment, String responseCode, LocalDateTime paymentTime) {
        payment.setStatus(PaymentStatus.FAILED);
        payment.setResponseCode(responseCode);
        payment.setPaymentTime(paymentTime);
        paymentRepository.save(payment);
    }

    private void cancelPendingBookingQuietly(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            return;
        }

        try {
            bookingService.cancelBooking(booking.getId());
        } catch (AppException ex) {
            if (ex.getErrorCode() != ErrorCode.BOOKING_ALREADY_CANCELLED
                    && ex.getErrorCode() != ErrorCode.BOOKING_ALREADY_CONFIRMED
                    && ex.getErrorCode() != ErrorCode.BOOKING_NOT_FOUND) {
                throw ex;
            }
        }
    }

    private long parseLongSafe(String value) {
        try {
            return Long.parseLong(value);
        } catch (Exception ex) {
            return -1L;
        }
    }

    private String buildRedirectUrl(String baseUrl, String status, String message, String bookingId) {
        StringBuilder sb = new StringBuilder(baseUrl);
        sb.append(baseUrl.contains("?") ? "&" : "?");
        sb.append("paymentStatus=")
                .append(URLEncoder.encode(status, StandardCharsets.UTF_8));
        sb.append("&message=")
                .append(URLEncoder.encode(message != null ? message : "", StandardCharsets.UTF_8));

        if (bookingId != null && !bookingId.isBlank()) {
            sb.append("&bookingId=")
                    .append(URLEncoder.encode(bookingId, StandardCharsets.UTF_8));
        }

        return sb.toString();
    }

    private static class PaymentProcessResult {
        private final boolean success;
        private final boolean validSignature;
        private final String message;
        private final String bookingId;

        private PaymentProcessResult(boolean success, boolean validSignature, String message, String bookingId) {
            this.success = success;
            this.validSignature = validSignature;
            this.message = message;
            this.bookingId = bookingId;
        }

        private static PaymentProcessResult success(String message, String bookingId) {
            return new PaymentProcessResult(true, true, message, bookingId);
        }

        private static PaymentProcessResult fail(String message, String bookingId) {
            return new PaymentProcessResult(false, true, message, bookingId);
        }

        private static PaymentProcessResult invalid(String message) {
            return new PaymentProcessResult(false, false, message, null);
        }
    }



}
