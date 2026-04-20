package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.RevenueStatisticsRequest;
import com.example.cinema_booking.dto.response.RevenueStatisticsItemResponse;
import com.example.cinema_booking.dto.response.RevenueStatisticsResponse;
import com.example.cinema_booking.entity.Booking;
import com.example.cinema_booking.enums.BookingStatus;
import com.example.cinema_booking.enums.StatisticGroupBy;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.BookingRepository;
import com.example.cinema_booking.repository.BookingSeatRepository;
import com.example.cinema_booking.service.StatisticService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor

public class StatisticServiceImpl implements StatisticService {
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public RevenueStatisticsResponse getRevenueStatistics(RevenueStatisticsRequest request) {
        validateStatisticsRequest(request);

        LocalDate fromDate = request.getFromDate();
        LocalDate toDate = request.getToDate();
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.plusDays(1).atStartOfDay();


        List<Booking> bookings = bookingRepository.findForRevenueStatistics(
                BookingStatus.CONFIRMED,
                fromDateTime,
                toDateTime,
                request.getMovieId()
        );

        Map<String, StatisticAccumulator> groupedStats = new LinkedHashMap<>();
        for (Booking booking : bookings) {
            GroupMeta groupMeta = buildGroupMeta(booking, request.getGroupBy());
            long ticketCount = bookingSeatRepository.countByBookingId(booking.getId());
            long revenue = booking.getTotal_price() == null ? 0L : booking.getTotal_price();

            StatisticAccumulator accumulator = groupedStats.computeIfAbsent(
                    groupMeta.key(),
                    key -> new StatisticAccumulator(
                            groupMeta.key(),
                            groupMeta.label(),
                            groupMeta.movieId(),
                            groupMeta.movieTitle(),
                            groupMeta.fromDate(),
                            groupMeta.toDate()
                    )
            );

            accumulator.bookingCount += 1;
            accumulator.ticketCount += ticketCount;
            accumulator.revenue += revenue;
        }

        List<RevenueStatisticsItemResponse> items = groupedStats.values().stream()
                .map(stat -> RevenueStatisticsItemResponse.builder()
                        .key(stat.key)
                        .label(stat.label)
                        .movieId(stat.movieId)
                        .movieTitle(stat.movieTitle)
                        .fromDate(stat.fromDate)
                        .toDate(stat.toDate)
                        .bookingCount(stat.bookingCount)
                        .ticketCount(stat.ticketCount)
                        .revenue(stat.revenue)
                        .build())
                .toList();

        long totalRevenue = items.stream().map(RevenueStatisticsItemResponse::getRevenue).filter(Objects::nonNull).mapToLong(Long::longValue).sum();
        long totalBookings = items.stream().map(RevenueStatisticsItemResponse::getBookingCount).filter(Objects::nonNull).mapToLong(Long::longValue).sum();
        long totalTickets = items.stream().map(RevenueStatisticsItemResponse::getTicketCount).filter(Objects::nonNull).mapToLong(Long::longValue).sum();

        return RevenueStatisticsResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .movieId(request.getMovieId())
                .groupBy(request.getGroupBy())
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .totalTickets(totalTickets)
                .items(items)
                .build();
    }

    private void validateStatisticsRequest(RevenueStatisticsRequest request) {
        if (request == null || request.getFromDate() == null || request.getToDate() == null || request.getGroupBy() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private GroupMeta buildGroupMeta(Booking booking, StatisticGroupBy groupBy) {
        LocalDate bookingDate = booking.getBookingTime().toLocalDate();
        return switch (groupBy) {
            case DAY -> new GroupMeta(
                    bookingDate.toString(),
                    bookingDate.toString(),
                    null,
                    null,
                    bookingDate,
                    bookingDate
            );
            case WEEK -> {
                LocalDate fromDate = bookingDate.with(DayOfWeek.MONDAY);
                LocalDate toDate = fromDate.plusDays(6);
                WeekFields weekFields = WeekFields.ISO;
                int week = bookingDate.get(weekFields.weekOfWeekBasedYear());
                int weekYear = bookingDate.get(weekFields.weekBasedYear());
                String key = String.format("%d-W%02d", weekYear, week);
                String label = fromDate + " -> " + toDate;
                yield new GroupMeta(key, label, null, null, fromDate, toDate);
            }
            case MOVIE -> new GroupMeta(
                    booking.getShowTime().getMovie().getId(),
                    booking.getShowTime().getMovie().getTitle(),
                    booking.getShowTime().getMovie().getId(),
                    booking.getShowTime().getMovie().getTitle(),
                    null,
                    null
            );
        };
    }

    private record GroupMeta(String key,
                             String label,
                             String movieId,
                             String movieTitle,
                             LocalDate fromDate,
                             LocalDate toDate) {
    }

    private static class StatisticAccumulator {
        private final String key;
        private final String label;
        private final String movieId;
        private final String movieTitle;
        private final LocalDate fromDate;
        private final LocalDate toDate;
        private long bookingCount;
        private long ticketCount;
        private long revenue;

        private StatisticAccumulator(String key,
                                     String label,
                                     String movieId,
                                     String movieTitle,
                                     LocalDate fromDate,
                                     LocalDate toDate) {
            this.key = key;
            this.label = label;
            this.movieId = movieId;
            this.movieTitle = movieTitle;
            this.fromDate = fromDate;
            this.toDate = toDate;
        }
    }
}
