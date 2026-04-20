package com.example.cinema_booking.repository;

import com.example.cinema_booking.entity.ShowTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ShowTimeRepository  extends JpaRepository<ShowTime,String> {

    @Query("SELECT COUNT(s) > 0 FROM ShowTime s WHERE s.room.id = :roomId AND " +
            "((s.startTime < :endTime AND s.endTime > :startTime))")
    boolean existsOverlap(@Param("roomId") String roomId,
                          @Param("startTime") LocalDateTime startTime,
                          @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(s) > 0 FROM ShowTime s WHERE s.room.id = :roomId AND " +
            "s.id != :showTimeId AND " +
            "((s.startTime < :endTime AND s.endTime > :startTime))")
    boolean existsOverlapExcluding(@Param("roomId") String roomId,
                                   @Param("showTimeId") String showTimeId,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);
}
