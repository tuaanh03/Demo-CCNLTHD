import React, { useEffect, useState, useMemo } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ShowtimeHeader } from '../components/ShowtimeHeader';
import { SeatMap } from '../components/SeatMap';
import { showtimeService } from '../services/api';
import { ShowTimeDetail, SeatShowTimeResponse } from '../types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

export const SeatSelection: React.FC = () => {
    const { movieId, showtimeId } = useParams<{ movieId: string; showtimeId: string }>();
    const navigate = useNavigate();

    const [showtime, setShowtime] = useState<ShowTimeDetail | null>(null);
    const [allSeats, setAllSeats] = useState<SeatShowTimeResponse[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<SeatShowTimeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchShowtime = async () => {
            try {
                if (!showtimeId) return;

                const [showtimeRes, seatsRes] = await Promise.all([
                    showtimeService.getShowtimeById(showtimeId),
                    showtimeService.getSeatsByShowtime(showtimeId),
                ]);

                setShowtime(showtimeRes.data.result || showtimeRes.data);
                setAllSeats(seatsRes.data.result || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching showtime:', err);
                setError('Không thể tải thông tin suất chiếu');
                setLoading(false);
            }
        };

        fetchShowtime();

        // Auto-refresh seats when user returns to this page (window focus)
        const handleFocus = () => {
            console.log('Page focused, refreshing seats...');
            fetchShowtime();
            setRefreshTrigger(prev => prev + 1);  // Trigger SeatMap to refetch
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [showtimeId]);

    const handleSelectSeat = (seat: SeatShowTimeResponse) => {
        setSelectedSeats(prev => {
            const isSelected = prev.some(s => s.id === seat.id);
            if (isSelected) {
                return prev.filter(s => s.id !== seat.id);
            } else {
                return [...prev, seat];
            }
        });
    };

    const handleDeselectSeat = (seatCode: string) => {
        setSelectedSeats(prev => prev.filter(s => s.seatCode !== seatCode));
    };

    const handleConfirmBooking = () => {
        if (selectedSeats.length === 0) {
            setError('Vui lòng chọn ít nhất một ghế');
            return;
        }

        // Calculate total price of selected seats
        const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

        // Navigate to booking confirmation with selected seats
        navigate(`/booking-confirmation`, {
            state: {
                showtimeId,
                movieId,
                selectedSeats,
                selectedSeatIds: selectedSeats.map(s => s.id),
                totalPrice,
                showtime,
            }
        });
    };

    // Calculate available seats count
    const availableSeatsCount = useMemo(() => {
        return allSeats.filter(seat => seat.status === 'AVAILABLE').length;
    }, [allSeats]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !showtime) {
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
                    {error || 'Không tìm thấy suất chiếu'}
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3 }}
                >
                    Quay lại
                </Button>

                {/* Showtime Header */}
                <ShowtimeHeader showtime={showtime} availableSeatsCount={availableSeatsCount} />

                {/* Seat Selection Section */}
                <Paper elevation={2} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="bold" mb={3}>
                        Chọn Ghế Của Bạn
                    </Typography>

                    {showtimeId && (
                        <SeatMap
                            showtimeId={showtimeId}
                            selectedSeats={selectedSeats}
                            onSelectSeat={handleSelectSeat}
                            onDeselectSeat={handleDeselectSeat}
                            refreshTrigger={refreshTrigger}
                        />
                    )}
                </Paper>

                {/* Seat Summary & Checkout */}
                {selectedSeats.length > 0 && (
                    <Paper
                        elevation={3}
                        sx={{
                            mt: 4,
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: '#ff6b00',
                            color: 'white',
                        }}
                    >
                        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                            <Grid item xs={12} md={8}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Ghế Đã Chọn ({selectedSeats.length})
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {selectedSeats.map(s => s.seatCode).join(', ')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<ConfirmationNumberIcon />}
                                    onClick={handleConfirmBooking}
                                    sx={{
                                        backgroundColor: 'white',
                                        color: '#ff6b00',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        },
                                    }}
                                >
                                    Tiếp Tục Đặt Vé
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {selectedSeats.length === 0 && (
                    <Paper
                        elevation={1}
                        sx={{
                            mt: 4,
                            p: 3,
                            textAlign: 'center',
                            borderRadius: 2,
                            backgroundColor: '#fff3cd',
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            Vui lòng chọn ít nhất một ghế để tiếp tục
                        </Typography>
                    </Paper>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Container>
        </Box>
    );
}; 