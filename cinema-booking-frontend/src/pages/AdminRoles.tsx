import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    AlertColor,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
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
import AddIcon from '@mui/icons-material/Add';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { adminPermissionService, adminRoleService } from '../services/adminApi';
import { APIResponse, AdminPermission, AdminRole } from '../types';

type RoleDialogMode = 'create' | 'edit';

interface RoleFormState {
    name: string;
    description: string;
    permissions: string[];
}

const initialFormState: RoleFormState = {
    name: '',
    description: '',
    permissions: [],
};

export const AdminRoles: React.FC = () => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [permissions, setPermissions] = useState<AdminPermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<RoleDialogMode>('create');
    const [editingRoleName, setEditingRoleName] = useState<string | null>(null);
    const [formState, setFormState] = useState<RoleFormState>(initialFormState);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const openSnackbar = (message: string, severity: AlertColor) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const closeSnackbar = () => setSnackbarOpen(false);

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

    const isUpdateEndpointUnavailable = (error: unknown) => {
        const status = (error as AxiosError)?.response?.status;
        return status === 404 || status === 405;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [roleRes, permissionRes] = await Promise.all([
                adminRoleService.getAllRoles(),
                adminPermissionService.getAllPermissions(),
            ]);
            setRoles(roleRes.data.result || []);
            setPermissions(permissionRes.data.result || []);
        } catch (error) {
            if (handleUnauthorized(error)) return;
            openSnackbar(parseApiError(error, 'Không thể tải dữ liệu quản lý quyền.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredRoles = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return roles;

        return roles.filter((role) => {
            const name = (role.name || '').toLowerCase();
            const description = (role.description || '').toLowerCase();
            return name.includes(keyword) || description.includes(keyword);
        });
    }, [roles, searchKeyword]);

    const resetDialog = () => {
        setOpenDialog(false);
        setDialogMode('create');
        setEditingRoleName(null);
        setFormState(initialFormState);
    };

    const openCreateDialog = () => {
        setDialogMode('create');
        setEditingRoleName(null);
        setFormState(initialFormState);
        setOpenDialog(true);
    };

    const openEditDialog = (role: AdminRole) => {
        setDialogMode('edit');
        setEditingRoleName(role.name);
        setFormState({
            name: role.name,
            description: role.description || '',
            permissions: (role.permissions || []).map((permission) => permission.name),
        });
        setOpenDialog(true);
    };

    const togglePermission = (permissionName: string) => {
        setFormState((prev) => {
            const exists = prev.permissions.includes(permissionName);
            if (exists) {
                return {
                    ...prev,
                    permissions: prev.permissions.filter((name) => name !== permissionName),
                };
            }
            return {
                ...prev,
                permissions: [...prev.permissions, permissionName],
            };
        });
    };

    const handleSave = async () => {
        const normalizedName = formState.name.trim();
        const normalizedDescription = formState.description.trim();

        if (!normalizedName) {
            openSnackbar('Tên role không được để trống.', 'warning');
            return;
        }

        try {
            setSubmitting(true);

            if (dialogMode === 'create') {
                await adminRoleService.createRole({
                    name: normalizedName,
                    description: normalizedDescription,
                    permissions: formState.permissions,
                });
                openSnackbar('Thêm role thành công.', 'success');
            } else {
                const roleName = editingRoleName || normalizedName;
                await adminRoleService.updateRole(roleName, {
                    description: normalizedDescription,
                    permissions: formState.permissions,
                });
                openSnackbar('Cập nhật role thành công.', 'success');
            }

            resetDialog();
            await loadData();
        } catch (error) {
            if (handleUnauthorized(error)) return;
            if (dialogMode === 'edit' && isUpdateEndpointUnavailable(error)) {
                openSnackbar(
                    'Backend chưa bật endpoint cập nhật role (PUT /roles/{name}). Vui lòng bật endpoint này để lưu chỉnh sửa.',
                    'warning'
                );
                return;
            }
            openSnackbar(parseApiError(error, 'Lưu role thất bại.'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Quản lý quyền (Role)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Quản lý danh sách role và cấu hình permission cho từng role.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
                    Thêm Role
                </Button>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Tìm kiếm role theo tên hoặc mô tả"
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
                                    <TableCell>Tên role</TableCell>
                                    <TableCell>Mô tả</TableCell>
                                    <TableCell>Số permission</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRoles.map((role) => (
                                    <TableRow key={role.name} hover>
                                        <TableCell>{role.name}</TableCell>
                                        <TableCell>{role.description || '-'}</TableCell>
                                        <TableCell>{(role.permissions || []).length}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => openEditDialog(role)}
                                                aria-label="edit-role"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRoles.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                                Không có role phù hợp.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={resetDialog} fullWidth maxWidth="md">
                <DialogTitle>{dialogMode === 'create' ? 'Thêm role mới' : `Chỉnh sửa role: ${formState.name}`}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Tên role"
                            value={formState.name}
                            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                            disabled={dialogMode === 'edit'}
                            fullWidth
                        />

                        <TextField
                            label="Mô tả"
                            value={formState.description}
                            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                            fullWidth
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Danh sách permission (tick chọn)
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width={80}>Chọn</TableCell>
                                            <TableCell>Tên permission</TableCell>
                                            <TableCell>Mô tả</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {permissions.map((permission) => {
                                            const checked = formState.permissions.includes(permission.name);
                                            return (
                                                <TableRow key={permission.name} hover>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={checked}
                                                            onChange={() => togglePermission(permission.name)}
                                                            inputProps={{ 'aria-label': `permission-${permission.name}` }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{permission.name}</TableCell>
                                                    <TableCell>{permission.description || '-'}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {permissions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3}>
                                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                                                        Không có permission để cấu hình.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetDialog} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={submitting}>
                        {submitting ? 'Đang lưu...' : 'Lưu'}
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
