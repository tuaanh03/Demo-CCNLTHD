import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    ButtonGroup,
    Stack,
    Chip,
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { adminBookingService, adminMovieService, adminShowtimeService } from '../services/adminApi';
import { Booking, Movie, ShowTimeResponse } from '../types';

interface StatCard {
    title: string;
    value: string | number;
    icon: JSX.Element;
    color: string;
    bgColor: string;
}

type RevenueFilter = 'DAY' | 'WEEK' | 'MOVIE';

interface RevenueChartPoint {
    label: string;
    revenue: number;
    fullLabel?: string;
}

const DISPLAY_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const datePartFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

const getTimeZoneDateParts = (date: Date) => {
    const parts = datePartFormatter.formatToParts(date);
    const year = Number(parts.find((part) => part.type === 'year')?.value || 0);
    const month = Number(parts.find((part) => part.type === 'month')?.value || 0);
    const day = Number(parts.find((part) => part.type === 'day')?.value || 0);
    return { year, month, day };
};

const toDateKey = ({ year, month, day }: { year: number; month: number; day: number }) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getIsoWeek = (year: number, month: number, day: number) => {
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const weekday = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - weekday);
    const weekYear = utcDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(weekYear, 0, 1));
    const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { weekYear, week };
};

const createMonthDateKeysUntilToday = (year: number, month: number, currentDay: number) => {
    const keys: string[] = [];
    for (let day = 1; day <= currentDay; day += 1) {
        keys.push(toDateKey({ year, month, day }));
    }
    return keys;
};

const truncateLabel = (value: string, maxLength = 18) =>
    value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

const RevenueTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{ value?: number; payload?: RevenueChartPoint }>;
    label?: string;
}> = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    const revenue = payload[0]?.value || 0;
    const point = payload[0]?.payload;
    const displayLabel = point?.fullLabel || label || '';

    return (
        <Box
            sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.12)',
                backgroundColor: '#fff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            }}
        >
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.3 }}>
                {displayLabel}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 700 }}>
                Doanh thu: {currencyFormatter.format(revenue)}
            </Typography>
        </Box>
    );
};

export const AdminDashboard: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [showtimes, setShowtimes] = useState<ShowTimeResponse[]>([]);
    const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>('DAY');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moviesResponse, bookingsResponse, showtimesResponse] = await Promise.all([
                    adminMovieService.getAllMovies(),
                    adminBookingService.getAllBooking(),
                    adminShowtimeService.getAllShowtimes(),
                ]);

                setMovies(moviesResponse.data.result ?? []);
                setBookings(bookingsResponse.data.result ?? []);
                setShowtimes(showtimesResponse.data.result ?? []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    const getTicketCount = (booking: Booking) => {
        if (booking.seatCodes?.length) return booking.seatCodes.length;
        if (booking.seatShowTimeIds?.length) return booking.seatShowTimeIds.length;
        return 0;
    };

    const confirmedBookings = useMemo(
        () => bookings.filter((booking) => booking.status === 'CONFIRMED'),
        [bookings]
    );

    const today = new Date();
    const todayTz = getTimeZoneDateParts(today);
    const todayDateKey = toDateKey(todayTz);
    const currentIsoWeek = getIsoWeek(todayTz.year, todayTz.month, todayTz.day);

    const todayShowtimes = showtimes.filter((showtime) => {
        const start = new Date(showtime.startTime);
        if (Number.isNaN(start.getTime()) || showtime.status !== 'ACTIVE') return false;
        return toDateKey(getTimeZoneDateParts(start)) === todayDateKey;
    });

    const totalTickets = confirmedBookings.reduce((sum, booking) => sum + getTicketCount(booking), 0);
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    const revenueDataByFilter = useMemo<Record<RevenueFilter, RevenueChartPoint[]>>(() => {
        const movieMap = new Map(movies.map((movie) => [movie.id, movie.title]));
        const showtimeMovieTitleMap = new Map(
            showtimes.map((showtime) => [showtime.id, movieMap.get(showtime.movieId) || `Phim #${showtime.movieId}`])
        );

        const dayBuckets = new Map<string, number>();
        const weekBuckets = new Map<number, number>();
        const movieBuckets = new Map<string, number>();

        const monthDateKeys = createMonthDateKeysUntilToday(todayTz.year, todayTz.month, todayTz.day);
        monthDateKeys.forEach((key) => dayBuckets.set(key, 0));

        for (let week = 1; week <= currentIsoWeek.week; week += 1) {
            weekBuckets.set(week, 0);
        }

        confirmedBookings.forEach((booking) => {
            const bookingDate = new Date(booking.bookingTime);
            if (Number.isNaN(bookingDate.getTime())) return;

            const revenue = booking.totalPrice || 0;
            const bookingParts = getTimeZoneDateParts(bookingDate);
            const bookingDateKey = toDateKey(bookingParts);

            if (bookingParts.year === todayTz.year && bookingParts.month === todayTz.month && bookingDateKey <= todayDateKey) {
                dayBuckets.set(bookingDateKey, (dayBuckets.get(bookingDateKey) || 0) + revenue);
            }

            const bookingWeek = getIsoWeek(bookingParts.year, bookingParts.month, bookingParts.day);
            if (bookingWeek.weekYear === todayTz.year && bookingWeek.week <= currentIsoWeek.week) {
                weekBuckets.set(bookingWeek.week, (weekBuckets.get(bookingWeek.week) || 0) + revenue);
            }

            if (bookingParts.year === todayTz.year && bookingParts.month === todayTz.month) {
                const showTimeId = booking.showTimeId || 'N/A';
                const movieLabel = showtimeMovieTitleMap.get(showTimeId) || `Phim #${showTimeId}`;
                movieBuckets.set(movieLabel, (movieBuckets.get(movieLabel) || 0) + revenue);
            }
        });

        const dayData = Array.from(dayBuckets.entries()).map(([dateKey, revenue]) => {
            const [, month, day] = dateKey.split('-');
            return {
                label: `${day}/${month}`,
                revenue,
                fullLabel: `${day}/${month}/${todayTz.year}`,
            };
        });

        const weekData = Array.from(weekBuckets.entries()).map(([week, revenue]) => ({
            label: `Tuần ${week}`,
            revenue,
            fullLabel: `Tuần ${week}`,
        }));

        const movieData = Array.from(movieBuckets.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([movieTitle, revenue]) => ({
                label: truncateLabel(movieTitle, 20),
                fullLabel: movieTitle,
                revenue,
            }));

        return {
            DAY: dayData,
            WEEK: weekData,
            MOVIE: movieData,
        };
    }, [confirmedBookings, currentIsoWeek.week, movies, showtimes, todayDateKey, todayTz.day, todayTz.month, todayTz.year]);

    const formatCurrency = (value: number) =>
        value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

    const stats: StatCard[] = [
        {
            title: 'Tổng Số Phim',
            value: movies.length,
            icon: <MovieIcon sx={{ fontSize: 40 }} />,
            color: '#ff6b00',
            bgColor: 'rgba(255, 107, 0, 0.1)',
        },
        {
            title: 'Suất Chiếu Hôm Nay',
            value: todayShowtimes.length,
            icon: <EventIcon sx={{ fontSize: 40 }} />,
            color: '#2196f3',
            bgColor: 'rgba(33, 150, 243, 0.1)',
        },
        {
            title: 'Vé Đã Đặt',
            value: totalTickets,
            icon: <ConfirmationNumberIcon sx={{ fontSize: 40 }} />,
            color: '#4caf50',
            bgColor: 'rgba(76, 175, 80, 0.1)',
        },
        {
            title: 'Tổng doanh thu',
            value: formatCurrency(totalRevenue),
            icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: '#ffc107',
            bgColor: 'rgba(255, 193, 7, 0.1)',
        },
    ];

    const revenueChartData = revenueDataByFilter[revenueFilter];

    const revenueDimensionLabel: Record<RevenueFilter, string> = {
        DAY: 'Ngày',
        WEEK: 'Tuần',
        MOVIE: 'Phim',
    };

    return (
        <Box sx={{ pb: 2 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 0.2 }}>
                    Bảng Điều Khiển
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                background: 'linear-gradient(180deg, #fff 0%, #fff8f2 100%)',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 10px 26px rgba(0,0,0,0.10)',
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ mt: 1, fontSize: { xs: '1.7rem', md: '2rem' } }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            backgroundColor: stat.bgColor,
                                            color: stat.color,
                                            borderRadius: 3,
                                            p: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            background: '#fff',
                        }}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            justifyContent="space-between"
                            spacing={1.5}
                            sx={{ mb: 2 }}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Thống kê doanh thu
                                </Typography>
                            </Box>
                            <Chip
                                label={`Bộ lọc hiện tại: ${revenueDimensionLabel[revenueFilter]}`}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: 'rgba(255, 107, 0, 0.12)',
                                    color: '#ff6b00',
                                }}
                            />
                        </Stack>

                        <Box sx={{ mb: 2 }}>
                            <ButtonGroup
                                variant="outlined"
                                size="medium"
                                aria-label="revenue filter"
                                sx={{
                                    '& .MuiButton-root': {
                                        px: 3,
                                        py: 0.9,
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        textTransform: 'none',
                                        borderColor: 'rgba(255, 107, 0, 0.4)',
                                        color: '#ff6b00',
                                    },
                                    '& .MuiButton-contained': {
                                        background: 'linear-gradient(90deg, #ff6b00 0%, #ff8c3a 100%)',
                                        color: '#fff',
                                        borderColor: 'transparent',
                                        boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)',
                                    },
                                }}
                            >
                                <Button
                                    variant={revenueFilter === 'DAY' ? 'contained' : 'outlined'}
                                    onClick={() => setRevenueFilter('DAY')}
                                >
                                    Ngày
                                </Button>
                                <Button
                                    variant={revenueFilter === 'WEEK' ? 'contained' : 'outlined'}
                                    onClick={() => setRevenueFilter('WEEK')}
                                >
                                    Tuần
                                </Button>
                                <Button
                                    variant={revenueFilter === 'MOVIE' ? 'contained' : 'outlined'}
                                    onClick={() => setRevenueFilter('MOVIE')}
                                >
                                    Phim
                                </Button>
                            </ButtonGroup>
                        </Box>

                        <Box sx={{ height: 360, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 3, p: { xs: 1, md: 2 } }}>
                            {revenueChartData.length === 0 ? (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Chưa có dữ liệu doanh thu để hiển thị biểu đồ
                                    </Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={revenueChartData}
                                        margin={{ top: 10, right: 16, left: 8, bottom: revenueFilter === 'MOVIE' ? 56 : 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 12, fill: '#334155' }}
                                            interval={0}
                                            angle={revenueFilter === 'MOVIE' ? -20 : 0}
                                            textAnchor={revenueFilter === 'MOVIE' ? 'end' : 'middle'}
                                            height={revenueFilter === 'MOVIE' ? 62 : 36}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#334155' }}
                                            tickFormatter={(value: number | string) => currencyFormatter.format(Number(value)).replace(' ₫', '')}
                                            width={92}
                                        />
                                        <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(255, 107, 0, 0.08)' }} />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#ff6b00"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={56}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};
