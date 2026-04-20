package com.example.cinema_booking.repository;

import com.example.cinema_booking.entity.Movie;
import com.example.cinema_booking.enums.MovieStatus;
import com.example.cinema_booking.enums.ShowTimeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface MovieRepository  extends JpaRepository<Movie, String> {
    List<Movie> findByStatus(MovieStatus movieStatus);
    List<Movie> findByStatusAndReleaseDateLessThanEqual(MovieStatus movieStatus, LocalDate releaseDate);

        @Query("""
                        SELECT m FROM Movie m
                        WHERE m.status = :movieStatus
                            AND EXISTS (
                                SELECT 1 FROM ShowTime s
                                WHERE s.movie = m
                                    AND s.startTime > :currentTime
                                    AND s.status = :showTimeStatus
                            )
                        """)
        List<Movie> findByStatusWithFutureShowTimes(@Param("movieStatus") MovieStatus movieStatus,
                                                                                                @Param("currentTime") LocalDateTime currentTime,
                                                                                                @Param("showTimeStatus") ShowTimeStatus showTimeStatus);

    List<Movie> findByTitleContainingIgnoreCase(String keyword);

    // Tìm phim theo genreId (using ManyToMany join)
    @Query("SELECT DISTINCT m FROM Movie m JOIN m.genres g WHERE g.id = :genreId")
    List<Movie> findByGenreId(String genreId);
}
