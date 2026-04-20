import React, { useState, useEffect } from 'react';
import { Alert, Box, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface HoldCountdownProps {
  totalSeconds: number;
  onExpire: () => void;
  holdStartTime: number; // timestamp in ms
}

const HoldCountdown: React.FC<HoldCountdownProps> = ({ totalSeconds, onExpire, holdStartTime }) => {
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - holdStartTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, holdStartTime, onExpire]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const getSeverity = (): 'error' | 'warning' | 'success' => {
    if (timeRemaining < 60) return 'error';
    if (timeRemaining < 120) return 'warning';
    return 'success';
  };

  const getColor = () => {
    if (timeRemaining < 60) return theme.palette.error.main;
    if (timeRemaining < 120) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const progressValue = (timeRemaining / totalSeconds) * 100;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity={getSeverity()}
        sx={{
          mb: 2,
          backgroundColor: timeRemaining < 60 ? '#ffebee' : timeRemaining < 120 ? '#fff3e0' : '#e8f5e9',
          borderColor: getColor(),
          borderWidth: 2,
          borderStyle: 'solid',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Typography sx={{ fontWeight: 600, color: getColor() }}>
            ⏱️ Thời gian giữ ghế còn lại: <span style={{ fontSize: '1.2em' }}>{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </Typography>
          {timeRemaining < 60 && (
            <Typography sx={{ color: theme.palette.error.main, fontWeight: 600, fontSize: '0.9em' }}>
              ⚠️ Sắp hết thời gian!
            </Typography>
          )}
        </Box>
      </Alert>
      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: getColor(),
            transition: 'all 0.3s ease',
          },
        }}
      />
      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666', fontSize: '0.85em' }}>
        Vui lòng hoàn tất thanh toán trước khi hết thời gian
      </Typography>
    </Box>
  );
};

export default HoldCountdown;
