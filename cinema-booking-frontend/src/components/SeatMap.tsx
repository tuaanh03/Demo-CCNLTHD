import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { SeatShowTimeResponse } from '../types';
import { showtimeService } from '../services/api';
import { SeatButton } from './SeatButton';
import { SeatLegend } from './SeatLegend';

interface SeatMapProps {
    showtimeId: string;
    selectedSeats: SeatShowTimeResponse[];
    onSelectSeat: (seat: SeatShowTimeResponse) => void;
    onDeselectSeat: (seatCode: string) => void;
    refreshTrigger?: number;  // Trigger to force refresh seats
}

export const SeatMap: React.FC<SeatMapProps> = ({
    showtimeId,
    selectedSeats,
    onSelectSeat,
    onDeselectSeat,
    refreshTrigger = 0,
}) => {
    const [seats, setSeats] = useState<SeatShowTimeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch seats on mount and setup polling
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const response = await showtimeService.getSeatsByShowtime(showtimeId);
                setSeats(response.data.result);
                setError(null);
            } catch (err) {
                console.error('Error fetching seats:', err);
                setError('Không thể tải danh sách ghế');
            } finally {
                setLoading(false);
            }
        };

        fetchSeats();

        // Poll for updates every 1.5 seconds for real-time seat status
        const pollInterval = setInterval(() => {
            fetchSeats();
        }, 1500);

        return () => clearInterval(pollInterval);
    }, [showtimeId, refreshTrigger]);

    // Group seats by row
    const seatsByRow = useMemo(() => {
        return seats.reduce((acc, seat) => {
            const row = seat.seatCode.charAt(0);
            if (!acc[row]) acc[row] = [];
            acc[row].push(seat);
            return acc;
        }, {} as Record<string, SeatShowTimeResponse[]>);
    }, [seats]);

    const rows = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

    const handleSeatClick = (seat: SeatShowTimeResponse) => {
        const isSelected = selectedSeats.some(s => s.id === seat.id);
        const currentUserEmail = localStorage.getItem('userEmail');

        if (isSelected) {
            onDeselectSeat(seat.seatCode);
        } else if (seat.status === 'AVAILABLE') {
            onSelectSeat(seat);
        } else if (seat.status === 'HOLD' && currentUserEmail && seat.heldByUserEmail === currentUserEmail) {
            // Allow user to resume booking their own held seats
            onSelectSeat(seat);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" align="center">
                {error}
            </Typography>
        );
    }

    return (
        <Box>
            <SeatLegend />

            {/* Screen */}
            <Paper elevation={2} sx={{ p: 2, mb: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                    🎬 MÀN HÌNH
                </Typography>
            </Paper>

            {/* Seat Grid */}
            <Box sx={{ overflowX: 'auto', mb: 3 }}>
                {rows.map((row) => (
                    <Box
                        key={row}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                            justifyContent: 'center',
                        }}
                    >
                        <Typography sx={{ minWidth: 20, fontWeight: 'bold' }}>
                            {row}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {seatsByRow[row]
                                .sort((a, b) => {
                                    const numA = parseInt(a.seatCode.substring(1));
                                    const numB = parseInt(b.seatCode.substring(1));
                                    return numA - numB;
                                })
                                .map((seat) => {
                                    const currentUserEmail = localStorage.getItem('userEmail');
                                    const isUsersSeat = seat.status === 'HOLD' && currentUserEmail && seat.heldByUserEmail === currentUserEmail;
                                    const isDisabledSeat = seat.status !== 'AVAILABLE' && !isUsersSeat && !selectedSeats.some(s => s.id === seat.id);
                                    
                                    return (
                                        <SeatButton
                                            key={seat.id}
                                            seat={seat}
                                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                                            isDisabled={isDisabledSeat}
                                            onClick={() => handleSeatClick(seat)}
                                        />
                                    );
                                })}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Summary */}
            {selectedSeats.length > 0 && (
                <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2">
                        Ghế đã chọn: {selectedSeats.map(s => s.seatCode).join(', ')}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: 'success.main' }}>
                        Tổng tiền: ₫{selectedSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString('vi-VN')}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}; 