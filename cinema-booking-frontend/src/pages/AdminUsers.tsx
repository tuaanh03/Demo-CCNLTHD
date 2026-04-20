import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    AlertColor,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    adminPermissionService,
    adminRoleService,
    adminUserService,
} from '../services/adminApi';
import {
    AdminPermission,
    AdminRole,
    AdminUser,
    AdminUserUpdateRequest,
    APIResponse,
} from '../types';

type UserFormState = {
    name: string;
    phone: string;
    password: string;
    roles: string[];
};

const initialFormState: UserFormState = {
    name: '',
    phone: '',
    password: '',
    roles: [],
};

export const AdminUsers: React.FC = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [permissions, setPermissions] = useState<AdminPermission[]>([]);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formState, setFormState] = useState<UserFormState>(initialFormState);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const openSnackbar = (message: string, severity: AlertColor) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const closeSnackbar = () => {
        setSnackbarOpen(false);
    };

    const parseApiError = (error: unknown, fallback: string) => {
        const axiosError = error as AxiosError<APIResponse<unknown>>;
        return axiosError.response?.data?.message || fallback;
    };

    const handleUnauthorized = (error: unknown): boolean => {
        const status = (error as AxiosError)?.response?.status;
        if (status === 401) {
            navigate('/admin/login', { replace: true });
            return true;
        }
        if (status === 403) {
            openSnackbar('Bạn không có permission để thực hiện thao tác này.', 'warning');
            return true;
        }
        return false;
    };

    const loadUsers = async () => {
        const userRes = await adminUserService.getAllUsers();
        setUsers(userRes.data.result || []);
    };

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [userRes, roleRes, permissionRes] = await Promise.all([
                adminUserService.getAllUsers(),
                adminRoleService.getAllRoles(),
                adminPermissionService.getAllPermissions(),
            ]);

            setUsers(userRes.data.result || []);
            setRoles(roleRes.data.result || []);
            setPermissions(permissionRes.data.result || []);
        } catch (error) {
            if (handleUnauthorized(error)) return;
            openSnackbar(parseApiError(error, 'Không thể tải dữ liệu quản lý user.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const filteredUsers = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return users;

        return users.filter((user) => {
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            return name.includes(keyword) || email.includes(keyword);
        });
    }, [users, searchKeyword]);

    const selectedPermissions = useMemo(() => {
        const permissionMap = new Map<string, AdminPermission>();

        roles
            .filter((role) => formState.roles.includes(role.name))
            .forEach((role) => {
                (role.permissions || []).forEach((permission) => {
                    if (permission?.name) {
                        permissionMap.set(permission.name, permission);
                    }
                });
            });

        // Fallback mô tả quyền từ endpoint /permissions khi role không trả description đầy đủ.
        permissions.forEach((permission) => {
            if (permissionMap.has(permission.name)) {
                const current = permissionMap.get(permission.name)!;
                if (!current.description && permission.description) {
                    permissionMap.set(permission.name, permission);
                }
            }
        });

        return Array.from(permissionMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [roles, permissions, formState.roles]);

    const handleOpenEditDialog = async (user: AdminUser) => {
        setEditingUserId(user.id);
        setOpenDialog(true);

        try {
            const detailRes = await adminUserService.getUserById(user.id);
            const detail = detailRes.data.result;

            setFormState({
                name: detail.name || '',
                phone: detail.phone || '',
                password: '',
                roles: (detail.roles || []).map((role) => role.name),
            });
        } catch (error) {
            if (handleUnauthorized(error)) return;
            setFormState({
                name: user.name || '',
                phone: user.phone || '',
                password: '',
                roles: (user.roles || []).map((role) => role.name),
            });
            openSnackbar(parseApiError(error, 'Không thể tải chi tiết user, đang dùng dữ liệu hiện có.'), 'warning');
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUserId(null);
        setFormState(initialFormState);
    };

    const handleSave = async () => {
        if (!editingUserId) return;

        try {
            setSubmitting(true);

            const payload: AdminUserUpdateRequest = {
                name: formState.name.trim(),
                phone: formState.phone.trim(),
                roles: formState.roles,
            };

            const normalizedPassword = formState.password.trim();
            if (normalizedPassword) {
                payload.password = normalizedPassword;
            }

            await adminUserService.updateUser(editingUserId, payload);
            await loadUsers();

            openSnackbar('Cập nhật user thành công.', 'success');
            handleCloseDialog();
        } catch (error) {
            if (handleUnauthorized(error)) return;
            openSnackbar(parseApiError(error, 'Cập nhật user thất bại.'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={800}>
                    Quản lý User
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Quản lý thông tin tài khoản, vai trò và quyền truy cập trong hệ thống.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Tìm kiếm theo tên hoặc email"
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                    />
                </Stack>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Họ tên</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Số điện thoại</TableCell>
                                    <TableCell>Vai trò</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>{user.name || '-'}</TableCell>
                                        <TableCell>{user.email || '-'}</TableCell>
                                        <TableCell>{user.phone || '-'}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                {(user.roles || []).length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <Chip key={`${user.id}-${role.name}`} size="small" label={role.name} />
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Chưa có vai trò
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditDialog(user)}
                                                aria-label="edit-user"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                                Không có user phù hợp.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Cập nhật thông tin user</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Họ tên"
                            value={formState.name}
                            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                            fullWidth
                        />

                        <TextField
                            label="Số điện thoại"
                            value={formState.phone}
                            onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                            fullWidth
                        />

                        <TextField
                            label="Mật khẩu mới (không bắt buộc)"
                            type="password"
                            value={formState.password}
                            onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                            helperText="Để trống nếu không muốn đổi mật khẩu."
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel id="admin-user-role-select-label">Vai trò</InputLabel>
                            <Select
                                labelId="admin-user-role-select-label"
                                multiple
                                value={formState.roles}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setFormState((prev) => ({
                                        ...prev,
                                        roles: typeof value === 'string' ? value.split(',') : value,
                                    }));
                                }}
                                input={<OutlinedInput label="Vai trò" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {(selected as string[]).map((roleName) => (
                                            <Chip key={roleName} label={roleName} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.name} value={role.name}>
                                        {role.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Permission theo vai trò đã chọn
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {selectedPermissions.length > 0 ? (
                                    selectedPermissions.map((permission) => (
                                        <Chip
                                            key={permission.name}
                                            size="small"
                                            label={permission.name}
                                            title={permission.description || permission.name}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Chưa có permission tương ứng.
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4500}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};
