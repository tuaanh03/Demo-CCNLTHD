import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    AlertColor,
    Box,
    Button,
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
import { adminPermissionService } from '../services/adminApi';
import { APIResponse, AdminPermission } from '../types';

type PermissionDialogMode = 'create' | 'edit';

interface PermissionFormState {
    name: string;
    description: string;
}

const initialFormState: PermissionFormState = {
    name: '',
    description: '',
};

export const AdminPermissions: React.FC = () => {
    const navigate = useNavigate();

    const [permissions, setPermissions] = useState<AdminPermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<PermissionDialogMode>('create');
    const [editingPermissionName, setEditingPermissionName] = useState<string | null>(null);
    const [formState, setFormState] = useState<PermissionFormState>(initialFormState);

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

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const response = await adminPermissionService.getAllPermissions();
            setPermissions(response.data.result || []);
        } catch (error) {
            if (handleUnauthorized(error)) return;
            openSnackbar(parseApiError(error, 'Không thể tải danh sách permission.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPermissions();
    }, []);

    const filteredPermissions = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return permissions;

        return permissions.filter((permission) => {
            const name = (permission.name || '').toLowerCase();
            const description = (permission.description || '').toLowerCase();
            return name.includes(keyword) || description.includes(keyword);
        });
    }, [permissions, searchKeyword]);

    const resetDialog = () => {
        setOpenDialog(false);
        setDialogMode('create');
        setEditingPermissionName(null);
        setFormState(initialFormState);
    };

    const openCreateDialog = () => {
        setDialogMode('create');
        setEditingPermissionName(null);
        setFormState(initialFormState);
        setOpenDialog(true);
    };

    const openEditDialog = (permission: AdminPermission) => {
        setDialogMode('edit');
        setEditingPermissionName(permission.name);
        setFormState({
            name: permission.name,
            description: permission.description || '',
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        const normalizedName = formState.name.trim();
        const normalizedDescription = formState.description.trim();

        if (!normalizedName) {
            openSnackbar('Tên permission không được để trống.', 'warning');
            return;
        }

        try {
            setSubmitting(true);

            if (dialogMode === 'create') {
                await adminPermissionService.createPermission({
                    name: normalizedName,
                    description: normalizedDescription,
                });
                openSnackbar('Thêm permission thành công.', 'success');
            } else {
                const permissionName = editingPermissionName || normalizedName;
                await adminPermissionService.updatePermission(permissionName, {
                    description: normalizedDescription,
                });
                openSnackbar('Cập nhật permission thành công.', 'success');
            }

            resetDialog();
            await loadPermissions();
        } catch (error) {
            if (handleUnauthorized(error)) return;
            if (dialogMode === 'edit' && isUpdateEndpointUnavailable(error)) {
                openSnackbar(
                    'Backend chưa bật endpoint cập nhật permission (PUT /permissions/{name}). Vui lòng bật endpoint này để lưu chỉnh sửa.',
                    'warning'
                );
                return;
            }
            openSnackbar(parseApiError(error, 'Lưu permission thất bại.'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Quản lý Permission
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Quản lý danh sách permission và mô tả quyền truy cập.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
                    Thêm Permission
                </Button>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Tìm kiếm permission theo tên hoặc mô tả"
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
                                    <TableCell>Tên permission</TableCell>
                                    <TableCell>Mô tả</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPermissions.map((permission) => (
                                    <TableRow key={permission.name} hover>
                                        <TableCell>{permission.name}</TableCell>
                                        <TableCell>{permission.description || '-'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => openEditDialog(permission)}
                                                aria-label="edit-permission"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredPermissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                                Không có permission phù hợp.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={resetDialog} fullWidth maxWidth="sm">
                <DialogTitle>{dialogMode === 'create' ? 'Thêm permission mới' : `Chỉnh sửa permission: ${formState.name}`}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Tên permission"
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
