import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export const BookingQrView: React.FC = () => {
    const location = useLocation();

    const { bookingId, qrData } = useMemo(() => {
        const search = new URLSearchParams(location.search);
        return {
            bookingId: search.get('bookingId') || '',
            qrData: search.get('data') || '',
        };
    }, [location.search]);

    if (!qrData) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    px: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Không có dữ liệu QR
                </Typography>
                <Typography color="text.secondary" align="center">
                    Vui lòng quay lại lịch sử đặt vé và mở lại mã QR.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                backgroundColor: '#fff',
                px: 2,
            }}
        >
            <QRCodeSVG
                value={qrData}
                size={340}
                bgColor="#ffffff"
                fgColor="#000000"
                includeMargin
                level="M"
            />
            <Typography sx={{ fontWeight: 700 }}>
                {bookingId ? `Đơn #${bookingId}` : 'Mã QR đặt vé'}
            </Typography>
        </Box>
    );
};
