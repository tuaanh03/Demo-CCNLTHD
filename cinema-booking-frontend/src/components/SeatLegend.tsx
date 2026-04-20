import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const SeatLegend: React.FC = () => {
    const legends = [
        { color: '#4caf50', status: 'AVAILABLE_NORMAL', label: 'Trống (Thường)' },
        { color: '#9c27b0', status: 'AVAILABLE_VIP', label: 'Trống (VIP)' },
        { color: '#ff6b00', status: 'SELECTED', label: 'Đã chọn' },
        { color: '#ffc107', status: 'HOLD', label: 'Đang giữ' },
        { color: '#e0e0e0', status: 'BOOKED', label: 'Đã đặt' },
    ];

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Chú Thích Ghế
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
