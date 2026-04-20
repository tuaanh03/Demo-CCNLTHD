package com.example.cinema_booking.task;


import com.example.cinema_booking.entity.SeatShowTime;
import com.example.cinema_booking.enums.SeatStatus;
import com.example.cinema_booking.repository.SeatShowTimeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HoldReleaseTask {

    SeatShowTimeRepository seatShowTimeRepository;
    CacheManager cacheManager;

    /**
     * Chạy mỗi 5 giây để release ghế hold hết hạn (faster for testing)
     */
    @Scheduled(fixedRate = 5000)  // 5 seconds
    public void releaseExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();

        // Tìm tất cả ghế HOLD mà hết hạn
        List<SeatShowTime> expiredHolds = seatShowTimeRepository
                .findByStatusAndHoldExpireTimeBefore(SeatStatus.HOLD, now);

        if (expiredHolds.isEmpty()) {
            return;  // Không có ghế hết hạn
        }

        // Release tất cả ghế hết hạn
        expiredHolds.forEach(seat -> {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setHoldStartTime(null);
            seat.setHoldExpireTime(null);
            seat.setHeldByUser(null);
        });

        seatShowTimeRepository.saveAll(expiredHolds);

        // Invalidate cache for all expired holds
        expiredHolds.stream()
                .map(s -> s.getShowtime().getId())
                .distinct()
                .forEach(showTimeId -> {
                    var cache = cacheManager.getCache("seat-availability");
                    if (cache != null) {
                        cache.evict(showTimeId);
                        log.info("Cache invalidated for showTimeId: {}", showTimeId);
                    }
                });

        log.info("Auto-released {} expired holds", expiredHolds.size());
    }
}
