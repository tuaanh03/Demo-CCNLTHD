package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.BookingRequest;
import com.example.cinema_booking.dto.response.BookingResponse;
import com.example.cinema_booking.entity.Booking;
import com.example.cinema_booking.entity.BookingSeat;
import com.example.cinema_booking.entity.SeatShowTime;
import com.example.cinema_booking.entity.ShowTime;
import com.example.cinema_booking.entity.User;
import com.example.cinema_booking.enums.BookingStatus;
import com.example.cinema_booking.enums.QrStatus;
import com.example.cinema_booking.enums.SeatStatus;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.BookingRepository;
import com.example.cinema_booking.repository.BookingSeatRepository;
import com.example.cinema_booking.repository.SeatShowTimeRepository;
import com.example.cinema_booking.repository.ShowTimeRepository;
import com.example.cinema_booking.repository.UserRepository;
import com.example.cinema_booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import java.security.SecureRandom;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final ShowTimeRepository showTimeRepository;
    private final SeatShowTimeRepository seatShowTimeRepository;
    private final UserRepository userRepository;
    private final BookingSeatRepository bookingSeatRepository;


    @NonFinal
    @Value("${qr.scan-early-minutes:30}")
    protected int QR_SCAN_EARLY_MINUTES;

    private static final String TICKET_CODE_PREFIX = "TCK_";
    private static final int TICKET_CODE_LENGTH = 20;
    private static final String TICKET_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest bookingRequest) {
        if (bookingRequest.getSeatShowTimeIds() == null || bookingRequest.getSeatShowTimeIds().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ShowTime showTime = showTimeRepository.findById(bookingRequest.getShowTimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_EXIST));

        List<SeatShowTime> seatShowTimes = seatShowTimeRepository.findByIdInForUpdate(
                bookingRequest.getSeatShowTimeIds()
        );
        if (seatShowTimes.size() != bookingRequest.getSeatShowTimeIds().size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        LocalDateTime now = LocalDateTime.now();
        for (SeatShowTime seatShowTime : seatShowTimes) {
            if (!seatShowTime.getShowtime().getId().equals(showTime.getId())) {
                throw new AppException(ErrorCode.INVALID_SEAT_IDS);
            }
            if (seatShowTime.getStatus() != SeatStatus.HOLD) {
                throw new AppException(ErrorCode.SEAT_NOT_AVAILABLE);
            }
            if (seatShowTime.getHoldExpireTime() == null || seatShowTime.getHoldExpireTime().isBefore(now)) {
                throw new AppException(ErrorCode.HOLD_EXPIRED);
            }
            if (seatShowTime.getHeldByUser() == null || !seatShowTime.getHeldByUser().getId().equals(user.getId())) {
                throw new AppException(ErrorCode.SEAT_HOLD_USER_MISMATCH);
            }
        }

        long totalPrice = seatShowTimes.stream()
                .mapToLong(s -> s.getPrice() != null ? s.getPrice().longValue() : 0L)
                .sum();

        log.info("Creating booking - User ID: {}, ShowTime ID: {}, SeatShowTime IDs: {}, Total Price: {}",
                user.getId(), showTime.getId(), bookingRequest.getSeatShowTimeIds(), totalPrice);

        Booking booking = Booking.builder()
                .user(user)
                .showTime(showTime)
                .bookingTime(LocalDateTime.now())
                .status(BookingStatus.PENDING)
                .qrStatus(QrStatus.NOT_CREATED)
                .total_price(totalPrice)
                .bookingSeats(new ArrayList<>())
                .payments(new ArrayList<>())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        for (SeatShowTime seatShowTime : seatShowTimes) {
            BookingSeat bookingSeat = BookingSeat.builder()
                    .booking(savedBooking)
                    .seat(seatShowTime.getSeat())
                    .build();

            // Keep hold metadata intact until payment callback confirms the booking.
            // Clearing holdExpireTime/heldByUser here causes payment confirmation to fail.
            seatShowTime.setStatus(SeatStatus.HOLD);
            seatShowTimeRepository.save(seatShowTime);
            bookingSeatRepository.save(bookingSeat);
            savedBooking.getBookingSeats().add(bookingSeat);
        }


        return toResponse(savedBooking, seatShowTimes);
    }

    @Override
    @Transactional
    public void cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CONFIRMED);
        }

        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(bookingId);
        List<String> seatIds = bookingSeats.stream()
                .map(bs -> bs.getSeat().getId())
                .toList();

        if (!seatIds.isEmpty()) {
            List<SeatShowTime> seatShowTimes = seatShowTimeRepository.findByShowtimeIdAndSeatIdInForUpdate(
                    booking.getShowTime().getId(),
                    seatIds
            );
            for (SeatShowTime seatShowTime : seatShowTimes) {
                if (seatShowTime.getStatus() == SeatStatus.HOLD) {
                    seatShowTime.setStatus(SeatStatus.AVAILABLE);
                    seatShowTime.setHoldStartTime(null);
                    seatShowTime.setHoldExpireTime(null);
                    seatShowTime.setHeldByUser(null);
                }
            }
            seatShowTimeRepository.saveAll(seatShowTimes);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setQrStatus(QrStatus.INVALID);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public void confirmBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CONFIRMED);
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_NOT_PENDING);
        }

        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(bookingId);
        List<String> seatIds = bookingSeats.stream()
                .map(bs -> bs.getSeat().getId())
                .toList();

        if (seatIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        List<SeatShowTime> seatShowTimes = seatShowTimeRepository.findByShowtimeIdAndSeatIdInForUpdate(
                booking.getShowTime().getId(),
                seatIds
        );

        if (seatShowTimes.size() != seatIds.size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        LocalDateTime now = LocalDateTime.now();
        for (SeatShowTime seatShowTime : seatShowTimes) {
            if (seatShowTime.getStatus() != SeatStatus.HOLD) {
                throw new AppException(ErrorCode.SEAT_NOT_AVAILABLE);
            }
            if (seatShowTime.getHoldExpireTime() == null || seatShowTime.getHoldExpireTime().isBefore(now)) {
                throw new AppException(ErrorCode.HOLD_EXPIRED);
            }
            if (seatShowTime.getHeldByUser() == null || !seatShowTime.getHeldByUser().getId().equals(booking.getUser().getId())) {
                throw new AppException(ErrorCode.SEAT_HOLD_USER_MISMATCH);
            }
        }

        for (SeatShowTime seatShowTime : seatShowTimes) {
            seatShowTime.setStatus(SeatStatus.BOOKED);
            seatShowTime.setHoldStartTime(null);
            seatShowTime.setHoldExpireTime(null);
            seatShowTime.setHeldByUser(null);
        }
        seatShowTimeRepository.saveAll(seatShowTimes);

        booking.setStatus(BookingStatus.CONFIRMED);
        // Lưu số phút hiệu lực QR code (duration của phim)
        int durationMinutes = booking.getShowTime().getMovie().getDuration();
        booking.setQrExpired(durationMinutes);
        booking.setQrStatus(QrStatus.ACTIVE);
        booking.setQrToken(generateShortTicketCode());
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public List<BookingResponse> getBookingsByUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Booking> bookings = bookingRepository.findByUserOrderByBookingTimeDesc(user);
        return bookings.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookingsForAdmin() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private BookingResponse toResponse(Booking booking) {
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());
        List<String> seatIds = bookingSeats.stream()
                .map(bs -> bs.getSeat().getId())
                .toList();

        List<SeatShowTime> seatShowTimes = seatIds.isEmpty()
                ? List.of()
                : seatShowTimeRepository.findByShowtimeIdAndSeatIdIn(
                booking.getShowTime().getId(),
                seatIds
        );
        return toResponse(booking, seatShowTimes);
    }

    private BookingResponse toResponse(Booking booking, List<SeatShowTime> seatShowTimes) {
        List<String> seatShowTimeIds = seatShowTimes.stream()
                .map(SeatShowTime::getId)
                .toList();

        List<String> seatCodes = seatShowTimes.stream()
                .map(SeatShowTime::getSeat)
                .map(seat -> seat.getSeatRow() + seat.getSeatNumber())
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .userId(booking.getUser().getId())
                .showTimeId(booking.getShowTime().getId())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus().name())
                .totalPrice(booking.getTotal_price())
                .qrToken(booking.getQrToken())
                .qrStatus(booking.getQrStatus() != null ? booking.getQrStatus().name() : null)
                .qrExpired(booking.getQrExpired())
                .seatShowTimeIds(seatShowTimeIds)
                .seatCodes(seatCodes)
                .build();
    }

    private String generateShortTicketCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder code = new StringBuilder(TICKET_CODE_PREFIX);
            for (int i = 0; i < TICKET_CODE_LENGTH; i++) {
                code.append(TICKET_ALPHABET.charAt(SECURE_RANDOM.nextInt(TICKET_ALPHABET.length())));
            }
            String ticketCode = code.toString();
            if (!bookingRepository.existsByQrToken(ticketCode)) {
                return ticketCode;
            }
        }
        throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Transactional
    public Void scanQr(String token) {
        if (token == null || token.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Booking booking = bookingRepository.findByQrToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.QR_TOKEN_INVALID));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_INVALID_FOR_SCAN);
        }

        if (booking.getQrStatus() != QrStatus.ACTIVE) {
            throw new AppException(ErrorCode.QR_USED);
        }

        LocalDateTime startTime = booking.getShowTime().getStartTime();
        int validMinutes = booking.getQrExpired() != null
                ? booking.getQrExpired()
                : booking.getShowTime().getMovie().getDuration();
        LocalDateTime scanStartTime = startTime.minusMinutes(QR_SCAN_EARLY_MINUTES);
        LocalDateTime expireTime = startTime.plusMinutes(validMinutes);
        LocalDateTime now = LocalDateTime.now();

//        if (now.isBefore(scanStartTime)) {
//            throw new AppException(ErrorCode.BOOKING_INVALID_FOR_SCAN);
//        }
//        if (now.isAfter(expireTime)) {
//            throw new AppException(ErrorCode.QR_TOKEN_EXPIRED);
//        }

        // update
        booking.setQrStatus(QrStatus.USED);
        bookingRepository.save(booking);

        return null;
    }

}
