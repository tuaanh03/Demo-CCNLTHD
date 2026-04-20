package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.ShowTimeCreateRequest;
import com.example.cinema_booking.dto.response.ShowTimeResponse;
import com.example.cinema_booking.entity.Movie;
import com.example.cinema_booking.entity.Room;
import com.example.cinema_booking.entity.ShowTime;
import com.example.cinema_booking.enums.MovieStatus;
import com.example.cinema_booking.enums.ShowTimeStatus;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.mapper.MovieMapper;
import com.example.cinema_booking.mapper.ShowTimeMapper;
import com.example.cinema_booking.repository.MovieRepository;
import com.example.cinema_booking.repository.RoomRepository;
import com.example.cinema_booking.repository.SeatRepository;
import com.example.cinema_booking.repository.ShowTimeRepository;
import com.example.cinema_booking.service.SeatShowTimeService;
import com.example.cinema_booking.service.ShowTimeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cglib.core.Local;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowTimeServiceImpl  implements ShowTimeService {
    private final ShowTimeRepository showTimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final ShowTimeMapper showTimeMapper;
    private  final SeatShowTimeService seatShowTimeService;
    private final com.example.cinema_booking.repository.BookingRepository bookingRepository;
    private final com.example.cinema_booking.repository.SeatShowTimeRepository seatShowTimeRepository;


    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ShowTimeResponse createScreening(ShowTimeCreateRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_EXIST));

        if(movie.getStatus().equals(MovieStatus.ENDED)) {
            throw new AppException(ErrorCode.MOVIE_ENDED);
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXIST));

        // tự động tính thời gian kết thúc dựa trên thời lượng phim + 10 phút nghỉ giữa các suất chiếu
        LocalDateTime endTime = request.getStartTime().plusMinutes(movie.getDuration()).plusMinutes(10);

        validateShowTime(movie, request.getStartTime(), endTime);
        log.info("Validated showtime for movie {} in room {}", movie.getTitle(), room.getId());



        // ❗ check overlap
        if (showTimeRepository.existsOverlap(
                room.getId(),
                request.getStartTime(),
                endTime
        )) {
            throw new AppException(ErrorCode.SHOWTIME_OVERLAP);
        }




        ShowTime showTime = showTimeMapper.toShowTime(request);
        showTime.setMovie(movie);
        showTime.setRoom(room);
        showTime.setEndTime(endTime );
        showTime.setStatus(ShowTimeStatus.ACTIVE);

        ShowTime savedShowTime = showTimeRepository.save(showTime);

        seatShowTimeService.createSeatShowTime(savedShowTime,room);

        return showTimeMapper.toShowTimeResponse(savedShowTime);
    }


    private void validateShowTime(Movie movie, LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime now = LocalDateTime.now();

        // không chiếu từ quá khứ
        if(startTime.isBefore(now)){
            throw new AppException(ErrorCode.SHOWTIME_ALREADY_PASSED);
        }

        // không chiếu trước ngày phát hành của phim
        if(startTime.toLocalDate().isBefore(movie.getReleaseDate())){
            throw new AppException(ErrorCode.SHOWTIME_BEFORE_MOVIE_RELEASE);
        }

        if(!endTime.isAfter(startTime)){
            throw new AppException(ErrorCode.SHOWTIME_END_BEFORE_START);
        }
    }

    public ShowTimeResponse getShowTimeById(String id) {

        LocalDateTime now = LocalDateTime.now();

        ShowTime showTime = showTimeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_EXIST));
        // return showTimeMapper.toShowTimeResponse(showTime);
        if(showTime.getStartTime().isAfter(now)){
            return showTimeMapper.toShowTimeResponse(showTime);
        }
        return null;
                

    }

    public List<ShowTimeResponse> getAllShowTimes() {
        List<ShowTime> showTimes = showTimeRepository.findAll();
        return showTimes.stream()
                .map(showTimeMapper::toShowTimeResponse)
                .toList();
    }

    public List<ShowTimeResponse> getAllShowTimesForUser() {
        LocalDateTime now = LocalDateTime.now();
        List<ShowTime> showTimes = showTimeRepository.findAll();
        return showTimes.stream()
                .filter(showTime -> showTime.getStartTime().isAfter(now))
                .map(showTimeMapper::toShowTimeResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteShowTime(String showTimeId) {
        ShowTime showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_EXIST));

        // Kiểm tra xem có booking nào cho suất chiếu này không
        long bookingCount = bookingRepository.countByShowTimeAndStatusIn(
                showTime, 
                java.util.List.of(
                    com.example.cinema_booking.enums.BookingStatus.PENDING,
                    com.example.cinema_booking.enums.BookingStatus.CONFIRMED
                )
        );

        if (bookingCount > 0) {
            throw new AppException(ErrorCode.SHOWTIME_HAS_BOOKINGS);
        }

        // Xóa tất cả SeatShowTime của suất chiếu này trước (để tránh FK constraint)
        java.util.List<com.example.cinema_booking.entity.SeatShowTime> seatShowTimes = 
                seatShowTimeRepository.findByShowtimeId(showTimeId);
        seatShowTimes.forEach(seatShowTimeRepository::delete);

        // Bây giờ xóa ShowTime
        showTimeRepository.delete(showTime);
        log.info("Deleted showtime: {}", showTimeId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ShowTimeResponse updateShowTime(String showTimeId, ShowTimeCreateRequest request) {
        ShowTime showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_EXIST));

        // Kiểm tra xem có booking nào cho suất chiếu này không
        long bookingCount = bookingRepository.countByShowTimeAndStatusIn(
                showTime,
                java.util.List.of(
                    com.example.cinema_booking.enums.BookingStatus.PENDING,
                    com.example.cinema_booking.enums.BookingStatus.CONFIRMED
                )
        );

        if (bookingCount > 0) {
            throw new AppException(ErrorCode.SHOWTIME_HAS_BOOKINGS);
        }

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_EXIST));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXIST));

        LocalDateTime endTime = request.getStartTime().plusMinutes(movie.getDuration()).plusMinutes(10);

        validateShowTime(movie, request.getStartTime(), endTime);

        // Kiểm tra overlap với các suất chiếu khác (loại trừ chính nó)
        if (showTimeRepository.existsOverlapExcluding(room.getId(), showTimeId, request.getStartTime(), endTime)) {
            throw new AppException(ErrorCode.SHOWTIME_OVERLAP);
        }

        showTime.setMovie(movie);
        showTime.setRoom(room);
        showTime.setStartTime(request.getStartTime());
        showTime.setEndTime(endTime);

        ShowTime updatedShowTime = showTimeRepository.save(showTime);
        log.info("Updated showtime: {}", showTimeId);

        return showTimeMapper.toShowTimeResponse(updatedShowTime);
    }
//
//    @Async
//    @Transactional(readOnly = true)
//    public CompletableFuture<ScreeningResponseDTO> getScreeningById(String id) {
//        ShowTime showTime = screeningRepository.findByIdWithDetails(id)
//                .orElseThrow(() -> new RuntimeException("ShowTime not found"));
//        return CompletableFuture.completedFuture(ScreeningResponseDTO.fromEntity(showTime));
//    }
//
//    @Async
//    @Transactional(readOnly = true)
//    public CompletableFuture<List<SeatResponseDTO>> getSeatsByRoom(String roomId) {
//        Room room = roomRepository.findById(roomId)
//                .orElseThrow(() -> new RuntimeException("Room not found"));
//
//        List<SeatResponseDTO> seats = room.getSeats().stream()
//                .map(SeatResponseDTO::fromEntity)
//                .collect(Collectors.toList());
//
//        return CompletableFuture.completedFuture(seats);
//    }
//
//    @Async
//    @Transactional(readOnly = true)
//    public CompletableFuture<List<ScreeningResponseDTO>> getScreeningsByMovie(Long movieId) {
//        Movie movie = movieRepository.findById(movieId)
//                .orElseThrow(() -> new RuntimeException("Movie not found"));
//
//        List<ScreeningResponseDTO> screenings = movie.getShowTimes().stream()
//                .map(ScreeningResponseDTO::fromEntity)
//                .collect(Collectors.toList());
//
//        return CompletableFuture.completedFuture(screenings);
//    }
}