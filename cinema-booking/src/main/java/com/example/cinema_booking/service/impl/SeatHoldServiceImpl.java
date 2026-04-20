package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.HoldSeatRequest;
import com.example.cinema_booking.dto.response.HoldSeatResponse;
import com.example.cinema_booking.entity.SeatShowTime;
import com.example.cinema_booking.entity.User;
import com.example.cinema_booking.enums.SeatStatus;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.SeatShowTimeRepository;
import com.example.cinema_booking.repository.UserRepository;
import com.example.cinema_booking.service.SeatHoldService;
import com.example.cinema_booking.utils.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatHoldServiceImpl implements SeatHoldService {
    SeatShowTimeRepository seatShowTimeRepository;
    UserRepository userRepository;
    CacheManager cacheManager;


    @Transactional
    @Override
    public HoldSeatResponse createHoldSeat(HoldSeatRequest request) {
        if(request.getSeatShowTimeIds() ==null || request.getSeatShowTimeIds().isEmpty()){
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        log.info("Hold request received - Seat IDs: {}, User ID: {}", request.getSeatShowTimeIds(), request.getUserId());

        LocalDateTime now = LocalDateTime.now();
        // Convert minutes to seconds: holdDuration is in minutes
        int holdDurationSeconds = request.getHoldDuration() * 60;
        LocalDateTime expireTime = now.plusSeconds(holdDurationSeconds);

        // get user
        User currentUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<SeatShowTime> seatsToCheck = seatShowTimeRepository.findByShowTimeIdForUpdate(request.getShowTimeId());
        log.info("Found {} seats in showtime, looking for {} specific seats", seatsToCheck.size(), request.getSeatShowTimeIds().size());

        //Fitter
        List<SeatShowTime> seatsToHold= seatsToCheck.stream()
                .filter(s -> request.getSeatShowTimeIds().contains(s.getId()))
                .toList();

        if (seatsToHold.size() != request.getSeatShowTimeIds().size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        log.info("Filtered to {} seats to hold", seatsToHold.size());

        // Release any EXPIRED holds (from any user) first
        List<SeatShowTime> expiredHolds = seatsToCheck.stream()
                .filter(s -> s.getStatus().equals(SeatStatus.HOLD) &&
                            s.getHoldExpireTime() != null &&
                            s.getHoldExpireTime().isBefore(now))
                .toList();

        if (!expiredHolds.isEmpty()) {
            expiredHolds.forEach(seat -> {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHoldStartTime(null);
                seat.setHoldExpireTime(null);
                seat.setHeldByUser(null);
            });
            seatShowTimeRepository.saveAll(expiredHolds);
            log.info("Auto-released {} expired holds", expiredHolds.size());
        }

        // Release ALL existing holds for this user on this showtime (including seats they're trying to hold again)
        // This allows users to resume their booking or switch seats
        List<SeatShowTime> userAllHolds = seatsToCheck.stream()
                .filter(s -> s.getStatus().equals(SeatStatus.HOLD) &&
                            s.getHeldByUser() != null &&
                            s.getHeldByUser().getId().equals(currentUser.getId()))
                .toList();

        if (!userAllHolds.isEmpty()) {
            userAllHolds.forEach(seat -> {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHoldStartTime(null);
                seat.setHoldExpireTime(null);
                seat.setHeldByUser(null);
            });
            seatShowTimeRepository.saveAll(userAllHolds);
            log.info("Released {} old holds for user {} to allow re-holding or switching seats", userAllHolds.size(), currentUser.getEmail());
        }

        // Re-fetch seats after cleanup
        seatsToCheck = seatShowTimeRepository.findByShowTimeIdForUpdate(request.getShowTimeId());
        seatsToHold = seatsToCheck.stream()
                .filter(s -> request.getSeatShowTimeIds().contains(s.getId()))
                .toList();

        if (seatsToHold.size() != request.getSeatShowTimeIds().size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        seatsToHold.forEach(seat -> {
            if (!seat.getStatus().equals(SeatStatus.AVAILABLE)) {
                String seatCode = seat.getSeat().getSeatRow() + seat.getSeat().getSeatNumber();
                throw new AppException(  ErrorCode.SEAT_ALREADY_HELD);
            }
        });

        // Update all to HOLD
        seatsToHold.forEach(seat -> {
            seat.setStatus(SeatStatus.HOLD);
            seat.setHoldStartTime(now);
            seat.setHoldExpireTime(expireTime);
            seat.setHeldByUser(currentUser);
        });

        seatShowTimeRepository.saveAll(seatsToHold);

        // Invalidate cache to ensure frontend gets fresh data
        var cache = cacheManager.getCache("seat-availability");
        if (cache != null) {
            cache.evict(request.getShowTimeId());
            log.info("Cache invalidated for showTimeId: {}", request.getShowTimeId());
        }

        // Calculate total price
        Double totalPrice = seatsToHold.stream()
                .map(SeatShowTime::getPrice)
                .mapToDouble(d -> d != null ? d : 0.0)
                .sum();

        log.info("User {} held {} seats until {}", currentUser.getEmail(), seatsToHold.size(), expireTime);

        return HoldSeatResponse.builder()
                .heldSeatCodes(seatsToHold.stream()
                        .map(SeatShowTime::getId)
                        .toList())
                .holdDurationSeconds(holdDurationSeconds)
                .totalPrice(totalPrice)
                .build();
    }

    @Override
    @Transactional
    public void releaseHoldSeat(List<String> seatShowTimeIds) {
        if (seatShowTimeIds == null || seatShowTimeIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        String currentUserId = SecurityUtils.getCurrentUserId();
        List<SeatShowTime> seats = seatShowTimeRepository.findAllById(seatShowTimeIds);

        if (seats.size() != seatShowTimeIds.size()) {
            throw new AppException(ErrorCode.INVALID_SEAT_IDS);
        }

        seats.forEach(seat -> {
            if (seat.getStatus().equals(SeatStatus.HOLD)) {
                if (seat.getHeldByUser() == null || !seat.getHeldByUser().getId().equals(currentUserId)) {
                    throw new AppException(ErrorCode.SEAT_HOLD_USER_MISMATCH);
                }
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHoldStartTime(null);
                seat.setHoldExpireTime(null);
                seat.setHeldByUser(null);
            }
        });
        seatShowTimeRepository.saveAll(seats);
        log.info("Released {} held seats", seats.size());
        }

    @Override
    public boolean isHoldSeatValid(String seatShowTimeId) {
        return seatShowTimeRepository.findById(seatShowTimeId)
                .map(seat -> seat.getStatus().equals(SeatStatus.HOLD) &&
                        seat.getHoldExpireTime() != null &&
                        seat.getHoldExpireTime().isAfter(LocalDateTime.now()))
                .orElse(false);
    }
}
