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
                        {showtime.movie?.title || 'Phim'}
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
                            Phòng {showtime.roomName || 'Không có'}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalActivityIcon color="primary" />
                        <Typography variant="body2" color="success.main" fontWeight="500">
                            {availableSeatsCount} ghế còn trống
                        </Typography>
                    </Box>
                </Grid>

                {/* Status */}
                <Grid item xs={12}>
                    <Chip
                        label={showtime.status === 'ACTIVE' ? 'Đang mở bán' : 'Đã hủy'}
                        color={showtime.status === 'ACTIVE' ? 'success' : 'error'}
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};
