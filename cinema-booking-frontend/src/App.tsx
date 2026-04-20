import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Snackbar, Alert } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { MovieList } from './pages/MovieList';
import { MovieDetail } from './pages/MovieDetail';
import { ScreeningList } from './pages/ScreeningList';
import { SeatSelection } from './pages/SeatSelection';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { BookingHistory } from './pages/BookingHistory';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Navigation } from './components/Navigation';
import { AuthProvider } from './context/AuthContext';
import { GenreProvider } from './context/GenreContext';
import { SearchProvider } from './context/SearchContext';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMovies } from './pages/AdminMovies';
import { AdminRooms } from './pages/AdminRooms';
import { AdminScreenings } from './pages/AdminScreenings';
import { AdminBookings } from './pages/AdminBookings';
import { AdminUsers } from './pages/AdminUsers';
import { AdminRoles } from './pages/AdminRoles';
import { AdminPermissions } from './pages/AdminPermissions';
import { AdminLogin } from './pages/AdminLogin';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AUTH_TOKEN_CLEARED_EVENT } from './services/api';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#ff6b00', // Galaxy Cinema orange
            light: '#ff8c3a',
            dark: '#d95a00',
            contrastText: '#fff',
        },
        secondary: {
            main: '#ffc107', // Gold accent
            light: '#ffd54f',
            dark: '#ffa000',
        },
        background: {
            default: '#f5f5f5', // Light gray
            paper: '#ffffff', // White for cards
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

function App() {
    const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
    const [sessionExpiredMessage, setSessionExpiredMessage] = useState('Bạn đã hết phiên đăng nhập. Vui lòng đăng nhập lại.');
    const lastNoticeAtRef = useRef(0);

    useEffect(() => {
        const handleTokenCleared = (event: Event) => {
            const customEvent = event as CustomEvent<{ tokenKey?: string; reason?: string }>;
            const reason = customEvent.detail?.reason;
            const refreshFailureReasons = ['refresh-failed', 'empty-refresh-token', 'missing-token-before-refresh'];

            if (reason && !refreshFailureReasons.includes(reason)) {
                return;
            }

            const now = Date.now();
            if (now - lastNoticeAtRef.current < 1200) {
                return;
            }

            lastNoticeAtRef.current = now;
            const isAdminSession = customEvent.detail?.tokenKey === 'adminAccessToken';
            setSessionExpiredMessage(
                isAdminSession
                    ? 'Bạn đã hết phiên đăng nhập quản trị. Vui lòng đăng nhập lại.'
                    : 'Bạn đã hết phiên đăng nhập. Vui lòng đăng nhập lại.'
            );
            setSessionExpiredOpen(true);
        };

        window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
        return () => {
            window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
        };
    }, []);

    return (
        <AuthProvider>
            <AdminAuthProvider>
                <GenreProvider>
                    <SearchProvider>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <Router>
                                <Routes>
                                    {/* Auth routes - no navigation */}
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    {/* Admin auth route */}
                                    <Route path="/admin/login" element={<AdminLogin />} />

                                    {/* Admin routes - with admin layout */}
                                    <Route path="/admin" element={<AdminLayout />}>
                                        <Route index element={<AdminDashboard />} />
                                        <Route path="movies" element={<AdminMovies />} />
                                        <Route path="rooms" element={<AdminRooms />} />
                                        <Route path="screenings" element={<AdminScreenings />} />
                                        <Route path="bookings" element={<AdminBookings />} />
                                        <Route path="users" element={<AdminUsers />} />
                                        <Route path="roles" element={<AdminRoles />} />
                                        <Route path="permissions" element={<AdminPermissions />} />
                                    </Route>

                                    {/* Main routes - with navigation */}
                                    <Route path="*" element={
                                        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
                                            <Navigation />
                                            <Routes>
                                                <Route path="/" element={<MovieList />} />
                                                <Route path="/movie/:id" element={<MovieDetail />} />
                                                <Route path="/movie/:movieId/showtimes" element={<ScreeningList />} />
                                                <Route path="/movie/:movieId/showtime/:showtimeId/seats" element={<SeatSelection />} />
                                                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                                                <Route path="/booking-history" element={<BookingHistory />} />
                                            </Routes>
                                        </Box>
                                    } />
                                </Routes>
                                <Snackbar
                                    open={sessionExpiredOpen}
                                    autoHideDuration={4500}
                                    onClose={() => setSessionExpiredOpen(false)}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                >
                                    <Alert
                                        onClose={() => setSessionExpiredOpen(false)}
                                        severity="warning"
                                        sx={{ width: '100%' }}
                                    >
                                        {sessionExpiredMessage}
                                    </Alert>
                                </Snackbar>
                            </Router>
                        </ThemeProvider>
                    </SearchProvider>
                </GenreProvider>
            </AdminAuthProvider>
        </AuthProvider>
    );
}

export default App;