import React, { useEffect, useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItemIcon, ListItemText, ListItemButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAdminAuth } from '../context/AdminAuthContext';
import PeopleIcon from '@mui/icons-material/People';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';

const drawerWidth = 260;

interface MenuItemType {
    text: string;
    icon: JSX.Element;
    path: string;
}

const menuItems: MenuItemType[] = [
    { text: 'Quản lý User', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Quản lý quyền (Role)', icon: <SecurityIcon />, path: '/admin/roles' },
    { text: 'Quản lý Permission', icon: <VpnKeyIcon />, path: '/admin/permissions' },
];

export const AdminLayout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdminLoggedIn, logoutAdmin, isAdminInitialized, adminEmail } = useAdminAuth() as any;

    useEffect(() => {
        if (!isAdminInitialized) return;
        if (!isAdminLoggedIn) {
            navigate('/admin/login', { replace: true });
        }
    }, [isAdminInitialized, isAdminLoggedIn, navigate]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logoutAdmin();
        handleMenuClose();
        navigate('/admin/login');
    };

    const drawer = (
        <Box>
            <Box
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c3a 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Khu Vực Quản Trị
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        User Management Demo
                    </Typography>
                </Box>
            </Box>
            <Divider />
            <List sx={{ px: 2, py: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                                backgroundColor: isActive ? 'rgba(255, 107, 0, 0.1)' : 'transparent',
                                color: isActive ? '#ff6b00' : 'text.primary',
                                '&:hover': {
                                    backgroundColor: isActive ? 'rgba(255, 107, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive ? '#ff6b00' : 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>
            <Divider />
        
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: 'white',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        Quản Trị User, Role, Permission
                    </Typography>
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: '#ff6b00' }}>A</Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                {adminEmail || 'admin'}
                            </Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                            Đăng xuất
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};
