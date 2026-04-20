import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Drawer,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MovieIcon from '@mui/icons-material/Movie';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const { isLoggedIn: authLoggedIn, user, logout } = useAuth();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        handleMenuClose();
        setMobileDrawerOpen(false);
        navigate('/login');
    };

    const getUserInitial = () => {
        const email = user?.email || '';
        return email.charAt(0).toUpperCase();
    };

    return (
        <>
            <AppBar position="sticky" elevation={0} sx={{ 
                backgroundColor: '#ffffff',
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            }}>
                <Container maxWidth="lg">
                    <Toolbar sx={{ 
                        justifyContent: 'space-between', 
                        py: 1,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/login')}>
                            <MovieIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: '#ff6b00' }} />
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: '#ff6b00',
                                    letterSpacing: '0.5px',
                                    display: { xs: 'none', sm: 'block' },
                                }}
                            >
                                Security Demo
                            </Typography>
                        </Box>

                        <Box sx={{ 
                            display: { xs: 'none', md: 'flex' },
                            gap: 2, 
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}>
                            <Button
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': {
                                        color: '#ff6b00',
                                        backgroundColor: 'rgba(255, 107, 0, 0.08)',
                                    },
                                }}
                                startIcon={<LoginIcon />}
                                onClick={() => navigate('/login')}
                            >
                                Đăng nhập
                            </Button>
                            <Button
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': {
                                        color: '#ff6b00',
                                        backgroundColor: 'rgba(255, 107, 0, 0.08)',
                                    },
                                }}
                                startIcon={<PersonAddIcon />}
                                onClick={() => navigate('/register')}
                            >
                                Đăng ký
                            </Button>
                            <Button
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': {
                                        color: '#ff6b00',
                                        backgroundColor: 'rgba(255, 107, 0, 0.08)',
                                    },
                                }}
                                startIcon={<AdminPanelSettingsIcon />}
                                onClick={() => navigate('/admin/login')}
                            >
                                Admin
                            </Button>
                        </Box>

                        <Box sx={{ 
                            display: { xs: 'none', md: 'flex' },
                            ml: 2,
                            alignItems: 'center',
                        }}>
                            {authLoggedIn ? (
                                <>
                                    <IconButton onClick={handleMenuOpen}>
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#ff6b00' }}>
                                            {getUserInitial()}
                                        </Avatar>
                                    </IconButton>
                                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                        <MenuItem disabled>
                                            <Typography variant="body2">{user?.email}</Typography>
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <LogoutIcon sx={{ mr: 1 }} />
                                            Đăng xuất
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button variant="outlined" startIcon={<LoginIcon />} onClick={() => navigate('/login')}>
                                    Đăng Nhập
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
                            <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ color: '#ff6b00' }}>
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer anchor="right" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
                <Box sx={{ width: 280, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: '#ff6b00' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <MenuItem onClick={() => { navigate('/login'); setMobileDrawerOpen(false); }} sx={{ mb: 1, borderRadius: 1 }}>
                        <LoginIcon sx={{ mr: 2, color: '#ff6b00' }} />
                        <Typography>Đăng nhập</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/register'); setMobileDrawerOpen(false); }} sx={{ mb: 1, borderRadius: 1 }}>
                        <PersonAddIcon sx={{ mr: 2, color: '#ff6b00' }} />
                        <Typography>Đăng ký</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/admin/login'); setMobileDrawerOpen(false); }} sx={{ mb: 1, borderRadius: 1 }}>
                        <AdminPanelSettingsIcon sx={{ mr: 2, color: '#ff6b00' }} />
                        <Typography>Đăng nhập admin</Typography>
                    </MenuItem>

                    <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', my: 2 }} />

                    {authLoggedIn ? (
                        <>
                            <MenuItem disabled sx={{ mb: 1 }}>
                                <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: '#ff6b00' }}>{getUserInitial()}</Avatar>
                                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1 }}>
                                <LogoutIcon sx={{ mr: 2, color: '#ff6b00' }} />
                                <Typography>Đăng xuất</Typography>
                            </MenuItem>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Đăng nhập để thực hiện các thao tác người dùng.
                        </Typography>
                    )}
                </Box>
            </Drawer>
        </>
    );
};