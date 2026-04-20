import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { adminRoomService } from '../services/adminApi';

interface Room {
    id: string;
    roomName: string;
    totalRows: number;
    totalColumns: number;
}

interface RoomRequest {
    roomName: string;
    totalRows: number;
    totalColumns: number;
}

const API_BASE_URL = 'http://localhost:8080/home';

export const AdminRooms: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<RoomRequest>({
        roomName: '',
        totalRows: 15,
        totalColumns: 10,
    });

    // Fetch rooms on mount
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const response = await adminRoomService.getAllRooms();
            console.log('Rooms response:', response.data);
            setRooms(response.data.result || []);
            setError('');
        } catch (err: any) {
            console.error('Error fetching rooms:', err);
            setError('Không thể tải danh sách phòng chiếu');
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleOpenDialog = () => {
        setFormData({
            roomName: '',
            totalRows: 15,
            totalColumns: 10,
        });
        setError('');
        setSuccess('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'roomName' ? value : parseInt(value) || 0,
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            if (!formData.roomName.trim()) {
                setError('Vui lòng nhập tên phòng chiếu');
                return;
            }

            if (formData.totalRows <= 0 || formData.totalColumns <= 0) {
                setError('Số hàng và số cột phải lớn hơn 0');
                return;
            }

            const response = await adminRoomService.createRoom(formData);

            if (response.data.result) {
                setSuccess(`Tạo phòng chiếu "${formData.roomName}" thành công! Tổng ${formData.totalRows * formData.totalColumns} ghế.`);
                handleCloseDialog();
                fetchRooms(); // Fetch updated list
            }
        } catch (err: any) {
            console.error('Error creating room:', err);
            setError(
                err.response?.data?.message ||
                'Lỗi khi tạo phòng chiếu. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    🏢 Quản Lý Phòng Chiếu
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    sx={{
                        background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #ff5500 0%, #ff7700 100%)',
                        },
                    }}
                >
                    Tạo Phòng Chiếu
                </Button>
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Typography variant="body2" color="textSecondary">
                    💡 Tip: Mỗi phòng chiếu sẽ tự động tạo ghế ngồi dựa trên số hàng và số cột bạn nhập.
                    Ví dụ: 15 hàng × 10 cột = 150 ghế (75 NORMAL + 75 VIP)
                </Typography>
            </Paper>

            {/* Rooms Table */}
            {loadingRooms ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : rooms.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <Typography color="textSecondary" gutterBottom>
                        📭 Chưa có phòng chiếu nào
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Hãy tạo phòng chiếu đầu tiên bằng cách click nút "Tạo Phòng Chiếu"
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Tên Phòng</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Hàng × Cột</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Tổng Ghế</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>NORMAL</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>VIP</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rooms.map((room) => {
                                const totalSeats = room.totalRows * room.totalColumns;
                                const normalSeats = Math.ceil(totalSeats / 2);
                                const vipSeats = Math.floor(totalSeats / 2);
                                return (
                                    <TableRow key={room.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                                        <TableCell>
                                            <Typography fontWeight={600}>{room.roomName}</Typography>
                                        </TableCell>
                                        <TableCell>{room.totalRows} × {room.totalColumns}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${totalSeats} ghế`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(255, 107, 0, 0.1)',
                                                    color: '#ff6b00',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={normalSeats}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                    color: '#4caf50',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={vipSeats}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                                    color: '#ffc107',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create Room Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                    Tạo Phòng Chiếu Mới
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Tên Phòng Chiếu"
                            name="roomName"
                            value={formData.roomName}
                            onChange={handleInputChange}
                            placeholder="VD: Phòng 1, Phòng VIP, Phòng IMAX"
                            fullWidth
                            disabled={loading}
                        />

                        <TextField
                            label="Số Hàng Ghế"
                            name="totalRows"
                            type="number"
                            value={formData.totalRows}
                            onChange={handleInputChange}
                            inputProps={{ min: 1, max: 50 }}
                            fullWidth
                            disabled={loading}
                        />

                        <TextField
                            label="Số Cột Ghế"
                            name="totalColumns"
                            type="number"
                            value={formData.totalColumns}
                            onChange={handleInputChange}
                            inputProps={{ min: 1, max: 50 }}
                            fullWidth
                            disabled={loading}
                        />

                        <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                <strong>Tổng Ghế:</strong> {formData.totalRows * formData.totalColumns}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                <strong>NORMAL:</strong> {Math.ceil(formData.totalRows * formData.totalColumns / 2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                <strong>VIP:</strong> {Math.floor(formData.totalRows * formData.totalColumns / 2)}
                            </Typography>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseDialog} disabled={loading}>
                        Huỷ
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 600,
                        }}
                    >
                        {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                        Tạo Phòng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
