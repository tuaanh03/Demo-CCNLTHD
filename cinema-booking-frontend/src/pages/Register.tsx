import React, { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Link,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    Grid,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MovieIcon from '@mui/icons-material/Movie';
import { userService } from '../services/api';

export const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Số điện thoại không hợp lệ (10 chữ số)');
            return;
        }

        try {
            setLoading(true);
            await userService.register({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            });
            
            setSuccess(true);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            console.error('Register error:', err);
            setError(
                err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c3a 50%, #ffc107 100%)',
                display: 'flex',
                alignItems: 'center',
                py: 8,
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={8}
                    sx={{
                        p: 5,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <MovieIcon sx={{ fontSize: 60, color: '#ff6b00', mb: 2 }} />
                        <Typography variant="h4" component="h1" fontWeight={700} color="#ff6b00" gutterBottom>
                            Đăng Ký Tài Khoản
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Tạo tài khoản để trải nghiệm đầy đủ tính năng
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Đăng ký thành công! Đang chuyển đến trang đăng nhập...
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Họ và tên"
                                    value={formData.fullName}
                                    onChange={handleChange('fullName')}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange('email')}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Số điện thoại"
                                    value={formData.phone}
                                    onChange={handleChange('phone')}
                                    required
                                    placeholder="0123456789"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Mật khẩu"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange('password')}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Xác nhận mật khẩu"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 4,
                                mb: 2,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                backgroundColor: '#ff6b00',
                                '&:hover': {
                                    backgroundColor: '#d95a00',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s',
                                position: 'relative',
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                                'Đăng Ký'
                            )}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Đã có tài khoản?{' '}
                                <Link
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        color: '#ff6b00',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Đăng nhập
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};
