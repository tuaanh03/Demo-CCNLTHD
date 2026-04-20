package com.example.cinema_booking.task;

import com.example.cinema_booking.entity.Booking;
import com.example.cinema_booking.entity.Payment;
import com.example.cinema_booking.enums.BookingStatus;
import com.example.cinema_booking.enums.PaymentStatus;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.BookingRepository;
import com.example.cinema_booking.repository.PaymentRepository;
import com.example.cinema_booking.service.BookingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingPaymentTimeoutTask {

    static final int PAYMENT_TIMEOUT_MINUTES = 5;

    BookingRepository bookingRepository;
    PaymentRepository paymentRepository;
    BookingService bookingService;

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void cancelExpiredPendingBookings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusMinutes(PAYMENT_TIMEOUT_MINUTES);

        List<Booking> expiredBookings = bookingRepository
                .findByStatusAndBookingTimeBefore(BookingStatus.PENDING, cutoff);

        if (expiredBookings.isEmpty()) {
            return;
        }

        for (Booking booking : expiredBookings) {
            try {
                bookingService.cancelBooking(booking.getId());
            } catch (AppException ex) {
                if (ex.getErrorCode() != ErrorCode.BOOKING_ALREADY_CANCELLED
                        && ex.getErrorCode() != ErrorCode.BOOKING_ALREADY_CONFIRMED
                        && ex.getErrorCode() != ErrorCode.BOOKING_NOT_FOUND) {
                    throw ex;
                }
            }

            List<Payment> pendingPayments = paymentRepository
                    .findByBooking_IdAndStatus(booking.getId(), PaymentStatus.PENDING);

            if (!pendingPayments.isEmpty()) {
                for (Payment payment : pendingPayments) {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setResponseCode("TIMEOUT");
                    payment.setPaymentTime(now);
                }
                paymentRepository.saveAll(pendingPayments);
            }
        }

        log.info("Auto-cancelled {} expired pending bookings", expiredBookings.size());
    }
}
