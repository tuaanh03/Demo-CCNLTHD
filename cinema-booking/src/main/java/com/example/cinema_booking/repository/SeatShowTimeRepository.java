package com.example.cinema_booking.repository;


import com.example.cinema_booking.entity.SeatShowTime;
import com.example.cinema_booking.enums.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SeatShowTimeRepository  extends JpaRepository<SeatShowTime, String> {
    boolean existsByShowtimeId(String id);

    List<SeatShowTime> findByShowtimeId(String showTimeId);

    @Query("""
    SELECT sst FROM SeatShowTime sst
    JOIN FETCH sst.seat s
    WHERE sst.showtime.id = :showTimeId
    """)
    List<SeatShowTime> findByShowTimeIdOptimized(@Param("showTimeId") String showTimeId);

    @Query("""
    SELECT sst FROM SeatShowTime sst
    WHERE sst.status = :status AND sst.holdExpireTime < :now
""")
    List<SeatShowTime> findByStatusAndHoldExpireTimeBefore(
            @Param("status") SeatStatus status,
            @Param("now") LocalDateTime now
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT sst FROM SeatShowTime sst
    WHERE sst.showtime.id = :showtimeId
    """)
    List<SeatShowTime> findByShowTimeIdForUpdate(@Param("showtimeId") String showtimeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT sst FROM SeatShowTime sst
    WHERE sst.id IN :ids
    """)
    List<SeatShowTime> findByIdInForUpdate(@Param("ids") List<String> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT sst FROM SeatShowTime sst
    WHERE sst.showtime.id = :showtimeId AND sst.seat.id IN :seatIds
    """)
    List<SeatShowTime> findByShowtimeIdAndSeatIdInForUpdate(
            @Param("showtimeId") String showtimeId,
            @Param("seatIds") List<String> seatIds
    );

    @Query("""
    SELECT sst FROM SeatShowTime sst
    WHERE sst.showtime.id = :showtimeId AND sst.seat.id IN :seatIds
    """)
    List<SeatShowTime> findByShowtimeIdAndSeatIdIn(
            @Param("showtimeId") String showtimeId,
            @Param("seatIds") List<String> seatIds
    );
}
