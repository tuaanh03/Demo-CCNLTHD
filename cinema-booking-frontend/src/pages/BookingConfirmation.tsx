import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Divider,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import type { SeatShowTimeResponse, ShowTimeDetail, HoldSeatResponse } from '../types';
import { holdService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import HoldCountdown from '../components/HoldCountdown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export const BookingConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    // State from navigation
    const selectedSeats = location.state?.selectedSeats as SeatShowTimeResponse[];
    const selectedSeatIds = location.state?.selectedSeatIds as string[];
    const totalPrice = location.state?.totalPrice as number;
    const showtimeId = location.state?.showtimeId as string;
    const showtime = location.state?.showtime as ShowTimeDetail;

    // Component state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [holdResponse, setHoldResponse] = useState<HoldSeatResponse | null>(null);
    const [holdStartTime, setHoldStartTime] = useState<number>(0);
    const [holdExpired, setHoldExpired] = useState(false);
    const [paymentInProgress, setPaymentInProgress] = useState(false);
    const [seatAlreadyHeld, setSeatAlreadyHeld] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [exitConfirmDialogOpen, setExitConfirmDialogOpen] = useState(false);
    const redirectingToPaymentRef = useRef(false);
    const bookingSuccessRef = useRef(false);
    const paymentInProgressRef = useRef(false);

    useEffect(() => {
        bookingSuccessRef.current = bookingSuccess;
    }, [bookingSuccess]);

    useEffect(() => {
        paymentInProgressRef.current = paymentInProgress;
    }, [paymentInProgress]);

    // Initialize and hold seats
    useEffect(() => {
        // Skip if already held or nothing to hold
        if (holdResponse || !selectedSeatIds || selectedSeatIds.length === 0) {
            return;
        }

        const initializeHold = async () => {
            try {
                // Require user login so backend can read user_id from JWT
                if (!isLoggedIn) {
                    setError('Vui lòng đăng nhập để tiếp tục đặt vé.');
                    setLoading(false);
                    return;
                }

                // Validate inputs
                if (!showtimeId) {
                    setError('Thiếu thông tin suất chiếu');
                    setLoading(false);
                    return;
                }

                // Call hold API (backend derives user_id from token claims)
                const response = await holdService.holdSeats({
                    seatShowTimeIds: selectedSeatIds,
                    showTimeId: showtimeId,
                    holdDuration: 5, // 5 minutes
                } as any);

                if (response.data.result) {
                    setHoldResponse(response.data.result);
                    setHoldStartTime(Date.now());
                    setLoading(false);
                } else {
                    setError(response.data.message || 'Giữ ghế không thành công');
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('Error holding seats:', err);

                const errorMessage = err.response?.data?.message || err.message || 'Giữ ghế không thành công';

                if (errorMessage.toLowerCase().includes('already held')) {
                    console.warn('Seat already held - redirecting to seat selection');
                    setError('');
                    setSeatAlreadyHeld(true);
                    setLoading(false);
                    return;
                }

                setError(errorMessage);
                setLoading(false);
            }
        };

        initializeHold();
    }, [selectedSeatIds, showtimeId, holdResponse, isLoggedIn]);

    // Handle hold expiration
    const handleHoldExpired = useCallback(async () => {
        setHoldExpired(true);
        setError('Hết thời gian giữ ghế. Vui lòng chọn ghế lại.');

        // Release the hold
        if (selectedSeatIds) {
            try {
                await holdService.releaseHold(selectedSeatIds);
            } catch (err) {
                console.error('Error releasing hold:', err);
                setError('Hết thời gian giữ ghế. Không thể giải phóng ghế ngay lập tức, hệ thống sẽ tự nhả sau tối đa 5 phút.');
            }
        }

        // Redirect to home page after 3 seconds (always home, not back to seat selection)
        setTimeout(() => {
            navigate(`/`);
        }, 3000);
    }, [navigate, selectedSeatIds]);

    // Warn if user tries to close tab/refresh while holding seats
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (holdResponse && !bookingSuccess && !paymentInProgress && !redirectingToPaymentRef.current) {
                e.preventDefault();
                e.returnValue = 'Ghế đang giữ sẽ được giải phóng nếu bạn rời khỏi trang này.';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Handle browser back button
        const handlePopState = (e: PopStateEvent) => {
            if (holdResponse && !bookingSuccess && !paymentInProgress && !redirectingToPaymentRef.current) {
                e.preventDefault();
                setExitConfirmDialogOpen(true);
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        window.history.pushState(null, '', window.location.href);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [holdResponse, bookingSuccess, paymentInProgress]);

    // Handle payment
    const handlePayment = async () => {
        try {
            setPaymentInProgress(true);
            paymentInProgressRef.current = true;
            setError('');

            if (!isLoggedIn) {
                setError('Vui lòng đăng nhập để tiếp tục đặt vé.');
                setPaymentInProgress(false);
                paymentInProgressRef.current = false;
                return;
            }

            if (!showtimeId || !selectedSeatIds || selectedSeatIds.length === 0) {
                setError('Thiếu thông tin đặt vé. Vui lòng thử lại.');
                setPaymentInProgress(false);
                paymentInProgressRef.current = false;
                return;
            }

            const paymentResponse = await paymentService.checkoutPayment({
                showTimeId: showtimeId,
                seatShowTimeIds: selectedSeatIds,
            });

            const paymentUrl = paymentResponse.data?.result?.url;

            if (!paymentUrl) {
                throw new Error('Không lấy được link thanh toán VNPay.');
            }

            setBookingSuccess(true);
            bookingSuccessRef.current = true;
            redirectingToPaymentRef.current = true;
            window.location.href = paymentUrl;
        } catch (err) {
            setBookingSuccess(false);
            bookingSuccessRef.current = false;
            redirectingToPaymentRef.current = false;
            console.error('Error during payment:', err);

            const message = (err as any)?.response?.data?.message || (err as any)?.message || '';
            if (message.toLowerCase().includes('thời gian giữ ghế') || message.toLowerCase().includes('hold')) {
                setHoldExpired(true);
                setError('Hết thời gian giữ ghế. Vui lòng chọn ghế lại.');
            } else {
                setError('Thanh toán thất bại. Vui lòng thử lại.');
            }
            setPaymentInProgress(false);
            paymentInProgressRef.current = false;
        }
    };

    // Cleanup: Auto-release hold when user leaves without confirming payment
    useEffect(() => {
        return () => {
            // Only auto-release when page is actually left (unmount), not on every state change.
            if (!bookingSuccessRef.current && !paymentInProgressRef.current && !redirectingToPaymentRef.current && selectedSeatIds && selectedSeatIds.length > 0) {
                holdService.releaseHold(selectedSeatIds).catch(err => 
                    console.warn('Release hold on unmount failed, booking timeout task will auto-cancel pending state:', err)
                );
            }
        };
    }, [selectedSeatIds]);

    // Handle back button - show confirmation dialog
    const handleBackClick = () => {
        setExitConfirmDialogOpen(true);
    };

    // Confirm exit and release hold
    const handleConfirmExit = async () => {
        setExitConfirmDialogOpen(false);
        try {
            if (selectedSeatIds) {
                await holdService.releaseHold(selectedSeatIds);
            }
            navigate(`/`);
        } catch (err) {
            console.error('Error releasing hold:', err);
            setError('Không thể giải phóng giữ ghế ngay lúc này. Bạn có thể thử lại, hoặc chờ hệ thống tự nhả sau tối đa 5 phút.');
        }
    };

    // Cancel exit
    const handleCancelExit = () => {
        setExitConfirmDialogOpen(false);
    };

    // Auto-redirect when seat is already held
    useEffect(() => {
        if (seatAlreadyHeld) {
            const timer = setTimeout(() => {
                navigate(`/`);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [seatAlreadyHeld, navigate]);

    // Auto-redirect when hold expired
    useEffect(() => {
        if (holdExpired) {
            const timer = setTimeout(() => {
                navigate(`/`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [holdExpired, navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Handle case where seat is already held by another user
    if (seatAlreadyHeld) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h5" color="warning" gutterBottom>
                        Ghế Không Còn Trống
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        Ghế này đã được người dùng khác giữ. Vui lòng chọn ghế khác.
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 4, display: 'block', color: '#999' }}>
                        Đang chuyển hướng...
                    </Typography>
                </Box>
            </Container>
        );
    }

    // If we have error and no holdResponse, show error page instead of main page
    if (error && !holdResponse) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Alert severity="error">
                        {error || 'Giữ ghế không thành công. Vui lòng thử lại.'}
                    </Alert>
                    <Box sx={{ mt: 4 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleBackClick}
                        >
                            Quay Lại Chọn Ghế
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    if (error && holdExpired) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                        <Typography variant="h5" color="error" gutterBottom>
                            Hết Thời Gian Giữ Ghế
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 4, display: 'block', color: '#999' }}>
                            Đang chuyển hướng...
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 4 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate(`/`)}
                        >
                            Về Trang Chủ
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    if (!selectedSeats || selectedSeats.length === 0 || !holdResponse) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Alert severity="error">
                        {error || 'Giữ ghế không thành công. Vui lòng thử lại.'}
                    </Alert>
                    <Box sx={{ mt: 4 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleBackClick}
                        >
                            Quay Lại Chọn Ghế
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackClick}
                    sx={{ mb: 3 }}
                >
                    Quay Lại Chọn Ghế
                </Button>

                {/* Hold Countdown Timer */}
                {!holdExpired && (
                    <HoldCountdown
                        totalSeconds={holdResponse.holdDurationSeconds}
                        onExpire={handleHoldExpired}
                        holdStartTime={holdStartTime}
                    />
                )}

                {/* Success Alert for Hold */}
                {!error && !holdExpired && !seatAlreadyHeld && (
                    <Alert
                        severity="success"
                        icon={<CheckCircleIcon />}
                        sx={{ mb: 3 }}
                    >
                        ✅ Ghế đã được giữ thành công! Vui lòng hoàn tất thanh toán trong thời gian giữ.
                    </Alert>
                )}

                {/* Movie & Showtime Info */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {showtime?.movie?.title || 'Phim'}
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Suất chiếu
                                </Typography>
                                <Typography variant="body2">
                                    {showtime ? new Date(showtime.startTime).toLocaleString() : 'Không có'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Phòng chiếu
                                </Typography>
                                <Typography variant="body2">
                                    {showtime?.room?.roomName || 'Không có'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Selected Seats Summary */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Ghế Đã Chọn ({selectedSeats.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {selectedSeats.map(seat => (
                                <Box
                                    key={seat.id}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        bgcolor: '#e3f2fd',
                                        border: '1px solid #2196f3',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="bold">
                                        {seat.seatCode}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ${seat.price.toFixed(2)} ({seat.seatType === 'VIP' ? 'VIP' : 'Thường'})
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>

                {/* Price Summary */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff8f0', border: '2px solid #ff6b00' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography color="text.secondary">Tạm tính ({selectedSeats.length} ghế)</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography>${totalPrice.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography color="text.secondary">Phí dịch vụ</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography>$0.00</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h6" fontWeight="bold">
                                Tổng cộng
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="bold" color="error">
                                ${totalPrice.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handlePayment}
                        disabled={paymentInProgress || holdExpired}
                        sx={{
                            bgcolor: '#ff6b00',
                            '&:hover': { bgcolor: '#e55a00' },
                        }}
                    >
                        {paymentInProgress ? <CircularProgress size={24} /> : 'Tiến Hành Thanh Toán'}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={handleBackClick}
                        disabled={holdExpired || paymentInProgress}
                    >
                        Hủy Và Giải Phóng Ghế
                    </Button>
                </Box>

                {/* Info Box */}
                <Paper sx={{ mt: 3, p: 2, bgcolor: '#e8f5e9', border: '1px solid #81c784' }}>
                    <Typography variant="caption" color="text.secondary">
                        💡 <strong>Lưu ý:</strong> Ghế của bạn sẽ được giữ trong 5 phút. Sau đó ghế sẽ được mở lại để người khác có thể đặt.
                    </Typography>
                </Paper>

                {/* Exit Confirmation Dialog */}
                <Dialog
                    open={exitConfirmDialogOpen}
                    onClose={handleCancelExit}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Giải Phóng Ghế Và Thoát?</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Nếu thoát lúc này, các ghế đang giữ sẽ được giải phóng để khách khác có thể đặt.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold', color: 'warning.main' }}>
                            ⚠️ Bạn sẽ cần chọn lại ghế nếu muốn tiếp tục đặt vé.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleCancelExit}
                            variant="outlined"
                        >
                            Tiếp Tục Đặt Vé
                        </Button>
                        <Button
                            onClick={handleConfirmExit}
                            variant="contained"
                            color="error"
                        >
                            Thoát Và Giải Phóng Ghế
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};
