import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAdminAuth } from '../context/AdminAuthContext';
import axios from 'axios';

export const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { loginAdmin } = useAdminAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSubmitting(true);
        try {
            await loginAdmin(email, password);
            navigate('/admin');
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const msg = (err.response?.data as any)?.message || (err.response?.data as any)?.error;
                setError(msg || 'Đăng nhập admin thất bại. Vui lòng thử lại.');
            } else if (err instanceof Error && err.message) {
                setError(err.message);
            } else {
                setError('Đăng nhập admin thất bại. Vui lòng thử lại.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0b1220 100%)',
                display: 'flex',
                alignItems: 'center',
                py: 8,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 5,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <AdminPanelSettingsIcon sx={{ fontSize: 60, color: '#111827', mb: 1 }} />
                        <Typography variant="h4" component="h1" fontWeight={800} color="#111827" gutterBottom>
                            Đăng Nhập Quản Trị
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Khu vực quản trị hệ thống
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            sx={{
                                py: 1.5,
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                backgroundColor: '#111827',
                                '&:hover': { backgroundColor: '#0b1220' },
                            }}
                        >
                            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập Admin'}
                        </Button>

                        <Button
                            type="button"
                            fullWidth
                            variant="text"
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/')}
                        >
                            Về trang đặt vé
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};
