import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
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
        if (seat.status === 'AVAILABLE') {
            // Distinguish VIP and NORMAL seats by color
            return seat.seatType === 'VIP' ? '#9c27b0' : '#4caf50';  // VIP: Purple, NORMAL: Green
        }
        if (seat.status === 'HOLD') return '#ffc107';       // Hold: Yellow
        if (seat.status === 'BOOKED') return '#e0e0e0';     // Booked: Grey
        return '#e0e0e0';
    };

    // Format hold expiration time for tooltip
    const getHoldTooltip = () => {
        if (seat.status === 'HOLD') {
            const heldInfo = seat.heldByUserEmail ? `Đang giữ bởi: ${seat.heldByUserEmail}` : 'Ghế đang được giữ';
            if (seat.holdExpireTime) {
                const expireDate = new Date(seat.holdExpireTime);
                const timeRemaining = Math.max(0, (expireDate.getTime() - Date.now()) / 1000);
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = Math.floor(timeRemaining % 60);
                return `${heldInfo}\nHết hạn sau: ${minutes}p ${seconds}g`;
            }
            return heldInfo;
        }
        return seat.status === 'BOOKED' ? 'Ghế này đã được đặt' : '';
    };

    const seatButton = (
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

    if (seat.status === 'HOLD' || seat.status === 'BOOKED') {
        return (
            <Tooltip title={getHoldTooltip()} arrow>
                {seatButton}
            </Tooltip>
        );
    }

    return seatButton;
};
