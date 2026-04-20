package com.example.cinema_booking.task;

import com.example.cinema_booking.entity.Movie;
import com.example.cinema_booking.enums.MovieStatus;
import com.example.cinema_booking.repository.MovieRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MovieStatusTask {

    MovieRepository movieRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void updateMovieStatus() {
        LocalDate today = LocalDate.now();
        List<Movie> movies = movieRepository.findByStatusAndReleaseDateLessThanEqual(
                MovieStatus.COMING_SOON,
            today
        );

        if (movies.isEmpty()) {
            return;
        }

        movies.forEach(movie -> movie.setStatus(MovieStatus.NOW_SHOWING));

        movieRepository.saveAll(movies);
        log.info("Auto-updated {} movies to NOW_SHOWING by releaseDate check", movies.size());
    }
}
