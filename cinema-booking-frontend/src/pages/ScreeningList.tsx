import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Movie, ShowTimeResponse } from '../types';
import { movieService, showtimeService } from '../services/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const ScreeningList: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [showtimes, setShowtimes] = useState<ShowTimeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!movieId) return;

                // Fetch both movie and all showtimes
                const [movieRes, showtimesRes] = await Promise.all([
                    movieService.getMovieById(movieId),
                    showtimeService.getAllShowtimes(),
                ]);

                setMovie(movieRes.data.result);

                // Filter showtimes for this movie
                const filteredShowtimes = showtimesRes.data.result.filter(
                    st => st.movieId === movieId && st.status === 'ACTIVE'
                );
                setShowtimes(filteredShowtimes);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải danh sách suất chiếu');
                setLoading(false);
            }
        };

        fetchData();

        // Poll every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [movieId]);

    const handleSelectShowtime = (showtimeId: string) => {
        navigate(`/movie/${movieId}/showtime/${showtimeId}/seats`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !movie) {
        return (
            <Container>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                >
                    Quay lại
                </Button>
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error || 'Không tìm thấy phim'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Quay lại
            </Button>

            <Typography variant="h4" fontWeight="bold" mb={4}>
                Chọn Suất Chiếu Cho {movie.title}
            </Typography>

            {showtimes.length === 0 ? (
                <Alert severity="info">Hiện chưa có suất chiếu cho phim này</Alert>
            ) : (
                <Box sx={{ display: 'grid', gap: 2 }}>
                    {showtimes.map((showtime) => (
                        <Card key={showtime.id} sx={{ '&:hover': { boxShadow: 4 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ flex: 1, minWidth: 200 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <CalendarTodayIcon fontSize="small" />
                                            <Typography variant="body2" color="textSecondary">
                                                {new Date(showtime.startTime).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <AccessTimeIcon fontSize="small" />
                                            <Typography variant="h6">
                                                {new Date(showtime.startTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                {' - '}
                                                {new Date(showtime.endTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSelectShowtime(showtime.id)}
                                    >
                                        Chọn Ghế
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>
    );
};