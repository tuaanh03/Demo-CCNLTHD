# Frontend Implementation - Code Snippets

## 1. Type Definitions (src/types/index.ts)

```typescript
// 📌 ADD THESE TO EXISTING types/index.ts

// ===== ShowTime Related =====
export interface ShowTimeResponse {
    id: string;
    movieId: string;
    roomId: string;
    startTime: string;  // ISO DateTime
    endTime: string;    // ISO DateTime
    status: 'ACTIVE' | 'CANCELLED';
}

export interface SeatShowTimeResponse {
    id: string;
    seatCode: string;   // "A1", "A2", "B5"
    status: 'AVAILABLE' | 'BOOKED' | 'HOLD';
    price: number;
}

export interface Room {
    id: string;
    roomName: string;
    totalRows: number;
    totalColumns: number;
}

export interface ShowTimeDetail extends ShowTimeResponse {
    movie?: Movie;
    room?: Room;
}

export interface SeatShowTimeSummary {
    row: string;
    seats: SeatShowTimeResponse[];
}
```

---

## 2. API Service Updates (src/services/api.ts)

```typescript
// 📌 ADD THESE TO services/api.ts

export const showtimeService = {
    // ✅ GET /showtimes
    getAllShowtimes: (): Promise<AxiosResponse<APIResponse<ShowTimeResponse[]>>> => 
        axiosInstance.get<APIResponse<ShowTimeResponse[]>>('/showtimes'),
    
    // ✅ GET /showtimes/{id}
    getShowtimeById: (id: string): Promise<AxiosResponse<APIResponse<ShowTimeResponse>>> => 
        axiosInstance.get<APIResponse<ShowTimeResponse>>(`/showtimes/${id}`),
    
    // ✅ GET /seat-showtimes/{showTimeId}
    getSeatsByShowtime: (showtimeId: string): Promise<AxiosResponse<APIResponse<SeatShowTimeResponse[]>>> => 
        axiosInstance.get<APIResponse<SeatShowTimeResponse[]>>(`/seat-showtimes/${showtimeId}`),
    
    // ✅ PATCH /seat-showtimes/{showTimeId}
    updateSeatPrice: (
        showtimeId: string, 
        seatType: 'NORMAL' | 'VIP', 
        price: number
    ): Promise<AxiosResponse<APIResponse<void>>> => 
        axiosInstance.patch<APIResponse<void>>(`/seat-showtimes/${showtimeId}`, { 
            seatType, 
            price 
        }),
};
```

---

## 3. Component: ShowtimeHeader (NEW)

```typescript
// 📌 FILE: src/components/ShowtimeHeader.tsx

import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { ShowTimeDetail } from '../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

interface ShowtimeHeaderProps {
    showtime: ShowTimeDetail;
    availableSeatsCount: number;
}

export const ShowtimeHeader: React.FC<ShowtimeHeaderProps> = ({ 
    showtime, 
    availableSeatsCount 
}) => {
    // Format thời gian
    const startDateTime = new Date(showtime.startTime);
    const endDateTime = new Date(showtime.endTime);
    
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                {/* Movie Title */}
                <Grid item xs={12}>
                    <Typography variant="h4" fontWeight="bold">
                        {showtime.movie?.title || 'Movie'}
                    </Typography>
                </Grid>

                {/* Info Row */}
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon color="primary" />
                        <Typography variant="body2" color="textSecondary">
                            {formatDate(startDateTime)}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon color="primary" />
                        <Typography variant="body2" color="textSecondary">
                            {formatTime(startDateTime)} - {formatTime(endDateTime)}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MeetingRoomIcon color="primary" />
                        <Typography variant="body2" color="textSecondary">
                            Room {showtime.room?.roomName || 'N/A'}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalActivityIcon color="primary" />
                        <Typography variant="body2" color="success.main" fontWeight="500">
                            {availableSeatsCount} Seats Available
                        </Typography>
                    </Box>
                </Grid>

                {/* Status */}
                <Grid item xs={12}>
                    <Chip
                        label={showtime.status === 'ACTIVE' ? 'Active' : 'Cancelled'}
                        color={showtime.status === 'ACTIVE' ? 'success' : 'error'}
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};
```

---

## 4. Component: SeatLegend (NEW)

```typescript
// 📌 FILE: src/components/SeatLegend.tsx

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const SeatLegend: React.FC = () => {
    const legends = [
        { color: '#4caf50', status: 'AVAILABLE', label: 'Available' },
        { color: '#ff6b00', status: 'SELECTED', label: 'Selected' },
        { color: '#ffc107', status: 'HOLD', label: 'On Hold' },
        { color: '#e0e0e0', status: 'BOOKED', label: 'Booked' },
    ];

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Seat Legend
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {legends.map((legend) => (
                    <Box key={legend.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: legend.color,
                                borderRadius: 1,
                                border: '1px solid rgba(0,0,0,0.1)'
                            }}
                        />
                        <Typography variant="caption">{legend.label}</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
```

---

## 5. Component: SeatButton (NEW)

```typescript
// 📌 FILE: src/components/SeatButton.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { SeatShowTimeResponse } from '../types';

interface SeatButtonProps {
    seat: SeatShowTimeResponse;
    isSelected: boolean;
    isDisabled: boolean;
    onClick: () => void;
}

export const SeatButton: React.FC<SeatButtonProps> = ({
    seat,
    isSelected,
    isDisabled,
    onClick,
}) => {
    const getBackgroundColor = () => {
        if (isSelected) return '#ff6b00';      // Selected: Orange
        if (seat.status === 'AVAILABLE') return '#4caf50';  // Available: Green
        if (seat.status === 'HOLD') return '#ffc107';       // Hold: Yellow
        if (seat.status === 'BOOKED') return '#e0e0e0';     // Booked: Grey
        return '#e0e0e0';
    };

    return (
        <Box
            onClick={!isDisabled ? onClick : undefined}
            sx={{
                width: 50,
                height: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getBackgroundColor(),
                border: isSelected ? '2px solid #ff6b00' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled && !isSelected ? 0.6 : 1,
                transition: 'all 0.2s ease',
                userSelect: 'none',
                '&:hover': !isDisabled ? {
                    transform: 'scale(1.05)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                } : {},
            }}
        >
            <Typography 
                variant="caption" 
                fontWeight="bold"
                sx={{ color: isSelected || seat.status === 'AVAILABLE' ? '#fff' : '#666' }}
            >
                {seat.seatCode}
            </Typography>
            <Typography
                variant="caption"
                sx={{ color: isSelected || seat.status === 'AVAILABLE' ? '#fff' : '#999', fontSize: '10px' }}
            >
                {(seat.price / 1000).toFixed(0)}k
            </Typography>
        </Box>
    );
};
```

---

## 6. Component: SeatMap (REFACTORED)

```typescript
// 📌 FILE: src/components/SeatMap.tsx (Update existing)

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
}

export const SeatMap: React.FC<SeatMapProps> = ({
    showtimeId,
    selectedSeats,
    onSelectSeat,
    onDeselectSeat,
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
                setError('Failed to load seats');
            } finally {
                setLoading(false);
            }
        };

        fetchSeats();

        // Poll for updates every 3 seconds
        const pollInterval = setInterval(fetchSeats, 3000);

        return () => clearInterval(pollInterval);
    }, [showtimeId]);

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

        if (isSelected) {
            onDeselectSeat(seat.seatCode);
        } else if (seat.status === 'AVAILABLE') {
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
                    🎬 SCREEN
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
                            {seatsByRow[row].map((seat) => (
                                <SeatButton
                                    key={seat.id}
                                    seat={seat}
                                    isSelected={selectedSeats.some(s => s.id === seat.id)}
                                    isDisabled={seat.status !== 'AVAILABLE' && !selectedSeats.some(s => s.id === seat.id)}
                                    onClick={() => handleSeatClick(seat)}
                                />
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Summary */}
            {selectedSeats.length > 0 && (
                <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2">
                        Selected Seats: {selectedSeats.map(s => s.seatCode).join(', ')}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: 'success.main' }}>
                        Total: ₫{selectedSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};
```

---

## 7. Page: ScreeningList (REFACTORED)

```typescript
// 📌 FILE: src/pages/ScreeningList.tsx (Update existing)

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
                setError('Failed to load showtimes');
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
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error || 'Movie not found'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={4}>
                Select a Showtime for {movie.title}
            </Typography>

            {showtimes.length === 0 ? (
                <Alert severity="info">No showtimes available for this movie</Alert>
            ) : (
                <Box sx={{ display: 'grid', gap: 2 }}>
                    {showtimes.map((showtime) => (
                        <Card key={showtime.id} sx={{ '&:hover': { boxShadow: 4 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
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
                                        Select Seats
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
```

---

## 8. Page: SeatSelection (REFACTORED)

```typescript
// 📌 FILE: src/pages/SeatSelection.tsx (Update existing)

import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Typography,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { SeatMap } from '../components/SeatMap';
import { ShowtimeHeader } from '../components/ShowtimeHeader';
import { Movie, ShowTimeResponse, ShowTimeDetail, SeatShowTimeResponse, Room } from '../types';
import { showtimeService, movieService } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const SeatSelection: React.FC = () => {
    const { movieId, showtimeId } = useParams<{ movieId: string; showtimeId: string }>();
    const navigate = useNavigate();

    const [showtime, setShowtime] = useState<ShowTimeDetail | null>(null);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<SeatShowTimeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [seats, setSeats] = useState<SeatShowTimeResponse[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!showtimeId) return;

                const showtimeRes = await showtimeService.getShowtimeById(showtimeId);
                const showtimeData = showtimeRes.data.result;
                setShowtime(showtimeData);

                // Fetch movie info
                if (showtimeData.movieId) {
                    const movieRes = await movieService.getMovieById(showtimeData.movieId);
                    setMovie(movieRes.data.result);
                }

                // TODO: Fetch room info when room endpoint is available
                // if (showtimeData.roomId) {
                //     const roomRes = await roomService.getRoomById(showtimeData.roomId);
                //     setRoom(roomRes.data.result);
                // }

                // Fetch seats
                const seatsRes = await showtimeService.getSeatsByShowtime(showtimeId);
                setSeats(seatsRes.data.result);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load showtime information');
                setLoading(false);
            }
        };

        fetchData();
    }, [showtimeId]);

    const handleSelectSeat = (seat: SeatShowTimeResponse) => {
        const isSelected = selectedSeats.some(s => s.id === seat.id);
        if (!isSelected) {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleDeselectSeat = (seatCode: string) => {
        setSelectedSeats(selectedSeats.filter(s => s.seatCode !== seatCode));
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            setError('Please select at least one seat');
            return;
        }

        // TODO: Implement booking
        // For now, just navigate to confirmation
        navigate(`/booking/confirmation`, {
            state: {
                showtimeId,
                movieId,
                selectedSeats,
                totalPrice: selectedSeats.reduce((sum, s) => sum + s.price, 0),
            },
        });
    };

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
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error || 'Showtime not found'}
                </Alert>
            </Container>
        );
    }

    const availableSeatsCount = seats.filter(s => s.status === 'AVAILABLE').length;
    const enrichedShowtime: ShowTimeDetail = {
        ...showtime,
        movie,
        room,
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Back
            </Button>

            {/* Header with Movie & Showtime Info */}
            <ShowtimeHeader showtime={enrichedShowtime} availableSeatsCount={availableSeatsCount} />

            {/* Error Alert */}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Seat Map */}
            <SeatMap
                showtimeId={showtimeId!}
                selectedSeats={selectedSeats}
                onSelectSeat={handleSelectSeat}
                onDeselectSeat={handleDeselectSeat}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleBooking}
                    disabled={selectedSeats.length === 0}
                >
                    Confirm Booking (₫{selectedSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString()})
                </Button>
            </Box>
        </Container>
    );
};
```

---

## 9. State Management Alternative (Context - Optional)

```typescript
// 📌 FILE: src/context/ShowtimeContext.tsx (Optional)

import React, { createContext, useContext, useState } from 'react';
import { ShowTimeDetail, SeatShowTimeResponse } from '../types';

interface ShowtimeContextType {
    selectedShowtime: ShowTimeDetail | null;
    selectedSeats: SeatShowTimeResponse[];
    setSelectedShowtime: (showtime: ShowTimeDetail) => void;
    addSelectedSeat: (seat: SeatShowTimeResponse) => void;
    removeSelectedSeat: (seatCode: string) => void;
    clearSelection: () => void;
}

const ShowtimeContext = createContext<ShowtimeContextType | undefined>(undefined);

export const ShowtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedShowtime, setSelectedShowtime] = useState<ShowTimeDetail | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<SeatShowTimeResponse[]>([]);

    const addSelectedSeat = (seat: SeatShowTimeResponse) => {
        setSelectedSeats([...selectedSeats, seat]);
    };

    const removeSelectedSeat = (seatCode: string) => {
        setSelectedSeats(selectedSeats.filter(s => s.seatCode !== seatCode));
    };

    const clearSelection = () => {
        setSelectedShowtime(null);
        setSelectedSeats([]);
    };

    return (
        <ShowtimeContext.Provider
            value={{
                selectedShowtime,
                selectedSeats,
                setSelectedShowtime,
                addSelectedSeat,
                removeSelectedSeat,
                clearSelection,
            }}
        >
            {children}
        </ShowtimeContext.Provider>
    );
};

export const useShowtime = () => {
    const context = useContext(ShowtimeContext);
    if (!context) {
        throw new Error('useShowtime must be used within ShowtimeProvider');
    }
    return context;
};
```

---

## 10. Router Configuration (App.tsx Update)

```typescript
// 📌 UPDATE YOUR ROUTER IN App.tsx

import { ScreeningList } from './pages/ScreeningList';
import { SeatSelection } from './pages/SeatSelection';

// Add to your route declaration:
<Route path="/movies/:movieId/showtimes" element={<ScreeningList />} />
<Route path="/movies/:movieId/showtime/:showtimeId/seats" element={<SeatSelection />} />
```

