import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { adminMovieService, adminShowtimeService, adminRoomService, adminAxios } from '../services/adminApi';
import { Movie, ShowTimeResponse } from '../types';

interface Room {
    id: string;
    roomName: string;
}

const API_BASE_URL = 'http://localhost:8080/home';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export const AdminScreenings: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);

    // Showtime Management
    const [showtimes, setShowtimes] = useState<ShowTimeResponse[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [openShowtimeDialog, setOpenShowtimeDialog] = useState(false);
    const [editingShowtimeId, setEditingShowtimeId] = useState<string | null>(null);
    const [errorShowtime, setErrorShowtime] = useState('');
    const [successShowtime, setSuccessShowtime] = useState('');
    const [showtimeFormData, setShowtimeFormData] = useState({
        movieId: '',
        roomId: '',
        startTime: '',
    });

    // Delete Confirmation
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [showtimeToDelete, setShowtimeToDelete] = useState<ShowTimeResponse | null>(null);

    // Seat Price Management
    const [selectedShowtime, setSelectedShowtime] = useState<ShowTimeResponse | null>(null);
    const [openPriceDialog, setOpenPriceDialog] = useState(false);
    const [priceFormData, setPriceFormData] = useState({
        normalPrice: 150000,
        vipPrice: 200000,
    });
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [errorPrice, setErrorPrice] = useState('');
    const [successPrice, setSuccessPrice] = useState('');
    const [calculatedEndTime, setCalculatedEndTime] = useState('');

    // Load initial data
    useEffect(() => {
        fetchShowtimes();
        fetchMovies();
        fetchRooms();
    }, []);

    // Tính toán thời gian kết thúc tự động khi movieId hoặc startTime thay đổi
    useEffect(() => {
        if (showtimeFormData.movieId && showtimeFormData.startTime) {
            const selectedMovie = movies.find(m => m.id === showtimeFormData.movieId);
            if (selectedMovie && selectedMovie.duration) {
                const durationMinutes = parseDurationToMinutes(selectedMovie.duration);
                const startDateTime = new Date(showtimeFormData.startTime);
                const endDateTime = new Date(startDateTime.getTime() + (durationMinutes + 10) * 60000);
                
                // Format lại cho datetime-local input
                const year = endDateTime.getFullYear();
                const month = String(endDateTime.getMonth() + 1).padStart(2, '0');
                const date = String(endDateTime.getDate()).padStart(2, '0');
                const hours = String(endDateTime.getHours()).padStart(2, '0');
                const minutes = String(endDateTime.getMinutes()).padStart(2, '0');
                
                setCalculatedEndTime(`${year}-${month}-${date}T${hours}:${minutes}`);
            }
        } else {
            setCalculatedEndTime('');
        }
    }, [showtimeFormData.movieId, showtimeFormData.startTime, movies]);

    const fetchShowtimes = async () => {
        try {
            setLoadingShowtimes(true);
            const response = await adminShowtimeService.getAllShowtimes();
            setShowtimes(response.data.result || []);
            setErrorShowtime('');
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            setErrorShowtime('Không thể tải danh sách suất chiếu');
        } finally {
            setLoadingShowtimes(false);
        }
    };

    const fetchMovies = async () => {
        try {
            const response = await adminMovieService.getAllMovies();
            setMovies(response.data.result || []);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const response = await adminRoomService.getAllRooms();
            setRooms(response.data.result || []);
            setErrorShowtime('');
        } catch (error) {
            console.error('Error fetching rooms:', error);
            setErrorShowtime('Không thể tải danh sách phòng chiếu');
        } finally {
            setLoadingRooms(false);
        }
    };

    // Showtime Dialog
    const parseDurationToMinutes = (duration: string): number => {
        if (!duration) return 0;
        
        // Format: "120" hoặc "120 minutes"
        if (/^\d+\s*(minutes?)?$/.test(duration)) {
            return parseInt(duration.replace(/[^0-9]/g, ''), 10);
        }
        
        let totalMinutes = 0;
        
        // Format: "2 hours 30 minutes" hoặc "2h 30m"
        const parts = duration.toLowerCase().split(/\s+/);
        for (let i = 0; i < parts.length; i++) {
            const num = parseInt(parts[i], 10);
            if (!isNaN(num) && i + 1 < parts.length) {
                if (parts[i + 1].startsWith('h')) {
                    totalMinutes += num * 60;
                } else if (parts[i + 1].startsWith('m')) {
                    totalMinutes += num;
                }
            }
        }
        
        return totalMinutes || parseInt(duration.replace(/[^0-9]/g, ''), 10);
    };

    const handleOpenShowtimeDialog = () => {
        setEditingShowtimeId(null);
        setShowtimeFormData({
            movieId: '',
            roomId: '',
            startTime: '',
        });
        setErrorShowtime('');
        setSuccessShowtime('');
        setOpenShowtimeDialog(true);
    };

    const handleCloseShowtimeDialog = () => {
        setOpenShowtimeDialog(false);
        setEditingShowtimeId(null);
        setCalculatedEndTime('');
    };

    const handleShowtimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShowtimeFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateShowtime = async () => {
        try {
            setLoadingShowtimes(true);
            setErrorShowtime('');

            if (!showtimeFormData.movieId || !showtimeFormData.roomId) {
                setErrorShowtime('Vui lòng chọn phim và phòng chiếu');
                return;
            }

            if (!showtimeFormData.startTime) {
                setErrorShowtime('Vui lòng nhập thời gian bắt đầu');
                return;
            }

            const startDateTime = new Date(showtimeFormData.startTime);
            const now = new Date();

            if (startDateTime <= now) {
                setErrorShowtime('Thời gian bắt đầu phải ở trong tương lai');
                setLoadingShowtimes(false);
                return;
            }

            // Chuyển local datetime thành ISO string (giữ giờ địa phương, không convert UTC)
            // Ví dụ: 04:13 ở VN → "2026-04-08T04:13:00"
            const offset = startDateTime.getTimezoneOffset() * 60000;
            const isoString = new Date(startDateTime.getTime() - offset).toISOString().slice(0, 19);

            const payload = {
                movieId: showtimeFormData.movieId,
                roomId: showtimeFormData.roomId,
                startTime: isoString,
            };

            let response;
            if (editingShowtimeId) {
                // Update mode
                response = await adminShowtimeService.updateShowtime(editingShowtimeId, payload);
                setSuccessShowtime('Sửa suất chiếu thành công!');
            } else {
                // Create mode
                response = await adminShowtimeService.createShowtime(payload);
                setSuccessShowtime('Tạo suất chiếu thành công!');
            }

            if (response.data.result) {
                handleCloseShowtimeDialog();
                fetchShowtimes();
                setTimeout(() => setSuccessShowtime(''), 3000);
            }
        } catch (error: any) {
            console.error('Error creating/updating showtime:', error);
            setErrorShowtime(
                error.response?.data?.message || 'Lỗi khi tạo/sửa suất chiếu'
            );
        } finally {
            setLoadingShowtimes(false);
        }
    };

    const handleOpenEditDialog = (showtime: ShowTimeResponse) => {
        setEditingShowtimeId(showtime.id);
        setShowtimeFormData({
            movieId: showtime.movieId,
            roomId: showtime.roomId,
            startTime: showtime.startTime.slice(0, 16), // "2026-04-08T04:13"
        });
        setErrorShowtime('');
        setSuccessShowtime('');
        setOpenShowtimeDialog(true);
    };

    const handleOpenDeleteDialog = (showtime: ShowTimeResponse) => {
        setShowtimeToDelete(showtime);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!showtimeToDelete) return;

        try {
            await adminShowtimeService.deleteShowtime(showtimeToDelete.id);
            setSuccessShowtime('Xóa suất chiếu thành công!');
            setOpenDeleteDialog(false);
            setShowtimeToDelete(null);
            fetchShowtimes();
            setTimeout(() => setSuccessShowtime(''), 3000);
        } catch (error: any) {
            console.error('Lỗi khi xóa suất chiếu:', error);
            setErrorShowtime(
                error.response?.data?.message || 'Lỗi khi xóa suất chiếu'
            );
        }
    };

    // Price Dialog
    const handleOpenPriceDialog = async (showtime: ShowTimeResponse) => {
        try {
            setSelectedShowtime(showtime);
            setErrorPrice('');
            setSuccessPrice('');
            
            // Fetch current seat prices from database
            const response = await adminShowtimeService.getSeatsByShowtime(showtime.id);
            const seats = response.data.result || [];
            
            // Get current prices by seat type
            const normalSeat = seats.find(s => s.seatType === 'NORMAL');
            const vipSeat = seats.find(s => s.seatType === 'VIP');
            
            setPriceFormData({
                normalPrice: normalSeat?.price || 150000,
                vipPrice: vipSeat?.price || 200000,
            });
            
            setOpenPriceDialog(true);
        } catch (error) {
            console.error('Lỗi khi hiển thị giá ghế:', error);
            setPriceFormData({
                normalPrice: 150000,
                vipPrice: 200000,
            });
            setOpenPriceDialog(true);
        }
    };

    const handleClosePriceDialog = () => {
        setOpenPriceDialog(false);
        setSelectedShowtime(null);
    };

    const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPriceFormData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0,
        }));
    };

    const handleUpdatePrice = async () => {
        try {
            setLoadingPrice(true);
            setErrorPrice('');

            if (priceFormData.normalPrice <= 0 || priceFormData.vipPrice <= 0) {
                setErrorPrice('Giá ghế phải lớn hơn 0');
                setLoadingPrice(false);
                return;
            }

            if (!selectedShowtime) return;

            // Update NORMAL price
            await adminShowtimeService.updateSeatPrice(
                selectedShowtime.id,
                'NORMAL',
                priceFormData.normalPrice
            );

            // Update VIP price
            await adminShowtimeService.updateSeatPrice(
                selectedShowtime.id,
                'VIP',
                priceFormData.vipPrice
            );

            setSuccessPrice(`Cập nhật giá ghế thành công!`);
            setTimeout(() => {
                handleClosePriceDialog();
                setSuccessPrice('');
            }, 1500);
        } catch (error: any) {
            console.error('Lỗi khi cập nhật giá:', error);
            setErrorPrice(
                error.response?.data?.message || 'Lỗi khi cập nhật giá'
            );
        } finally {
            setLoadingPrice(false);
        }
    };

    const getMovieTitle = (movieId: string) => {
        return movies.find(m => m.id === movieId)?.title || movieId;
    };

    const getRoomName = (roomId: string) => {
        return rooms.find(r => r.id === roomId)?.roomName || roomId;
    };

    const formatDateTime = (dateTimeString: string): string => {
        // dateTimeString format: "2026-04-08T04:13:00"
        // Convert to: "04:13 08/04/2026"
        try {
            const parts = dateTimeString.split('T');
            if (parts.length !== 2) return dateTimeString;
            
            const [year, month, day] = parts[0].split('-');
            const time = parts[1].substring(0, 5); // "04:13"
            
            return `${time} ${day}/${month}/${year}`;
        } catch {
            return dateTimeString;
        }
    };

    return (
        <Box sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    🎬 Quản Lý Suất Chiếu & Giá Ghế
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
                    <Tab label="📽️ Suất Chiếu" />
                </Tabs>

                {/* Tab 1: Showtimes */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        {successShowtime && (
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                {successShowtime}
                            </Alert>
                        )}
                        {errorShowtime && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {errorShowtime}
                            </Alert>
                        )}

                        <Box sx={{ mb: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenShowtimeDialog}
                                sx={{
                                    background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                }}
                            >
                                Tạo Suất Chiếu
                            </Button>
                        </Box>

                        {loadingShowtimes ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Phim</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Phòng</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Thời Gian</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Thao Tác</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {showtimes.map((showtime) => (
                                            <TableRow key={showtime.id}>
                                                <TableCell>{getMovieTitle(showtime.movieId)}</TableCell>
                                                <TableCell>{getRoomName(showtime.roomId)}</TableCell>
                                                <TableCell>
                                                    {formatDateTime(showtime.startTime)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={showtime.status === 'ACTIVE' ? 'Hoạt Động' : 'Đã Hủy'}
                                                        size="small"
                                                        color={showtime.status === 'ACTIVE' ? 'success' : 'error'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenPriceDialog(showtime)}
                                                            title="Cập nhật giá"
                                                            sx={{ color: '#ff6b00' }}
                                                        >
                                                            <AttachMoneyIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenEditDialog(showtime)}
                                                            title="Chỉnh sửa thông tin"
                                                            sx={{ color: '#2196f3' }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenDeleteDialog(showtime)}
                                                            title="Xóa suất chiếu"
                                                            sx={{ color: '#f44336' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </TabPanel>


            </Paper>

            {/* Create/Edit Showtime Dialog */}
            <Dialog open={openShowtimeDialog} onClose={handleCloseShowtimeDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                    {editingShowtimeId ? 'Sửa Suất Chiếu' : 'Tạo Suất Chiếu'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            select
                            label="Phim"
                            name="movieId"
                            value={showtimeFormData.movieId}
                            onChange={handleShowtimeInputChange as any}
                            fullWidth
                            disabled={loadingShowtimes}
                        >
                            {movies.map(movie => (
                                <MenuItem key={movie.id} value={movie.id}>
                                    {movie.title}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Phòng Chiếu"
                            name="roomId"
                            value={showtimeFormData.roomId}
                            onChange={handleShowtimeInputChange as any}
                            fullWidth
                            disabled={loadingShowtimes}
                        >
                            {rooms.map(room => (
                                <MenuItem key={room.id} value={room.id}>
                                    {room.roomName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            type="datetime-local"
                            label="Thời Gian Bắt Đầu"
                            name="startTime"
                            value={showtimeFormData.startTime}
                            onChange={handleShowtimeInputChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={loadingShowtimes}
                            inputProps={{
                                min: new Date().toISOString().slice(0, 16),
                            }}
                            helperText="Thời gian kết thúc sẽ được tính tự động dựa vào thời lượng phim + 10 phút nghỉ"
                        />

                        <TextField
                            type="datetime-local"
                            label="Thời Gian Kết Thúc (Tự động)"
                            value={calculatedEndTime}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={true}
                            InputProps={{
                                readOnly: true,
                            }}
                            sx={{
                                backgroundColor: '#f5f5f5',
                                '& .MuiOutlinedInput-root': {
                                    cursor: 'not-allowed',
                                }
                            }}
                            helperText={calculatedEndTime ? `Khoảng ${parseDurationToMinutes(movies.find(m => m.id === showtimeFormData.movieId)?.duration || '') + 10} phút` : 'Vui lòng chọn phim và thời gian bắt đầu'}
                        />

                        {errorShowtime && (
                            <Alert severity="error">{errorShowtime}</Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleCloseShowtimeDialog} disabled={loadingShowtimes}>
                        Huỷ
                    </Button>
                    <Button
                        onClick={handleCreateShowtime}
                        variant="contained"
                        disabled={loadingShowtimes}
                        sx={{
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                            textTransform: 'none',
                        }}
                    >
                        {loadingShowtimes ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                        {editingShowtimeId ? 'Lưu' : 'Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Price Dialog */}
            <Dialog open={openPriceDialog} onClose={handleClosePriceDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                    Cập Nhật Giá Ghế
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedShowtime && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Phim:</strong> {getMovieTitle(selectedShowtime.movieId)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Thời Gian:</strong> {formatDateTime(selectedShowtime.startTime)}
                                </Typography>
                            </Paper>

                            <TextField
                                label="Giá Ghế NORMAL"
                                name="normalPrice"
                                type="number"
                                value={priceFormData.normalPrice}
                                onChange={handlePriceInputChange}
                                inputProps={{ step: 10000, min: 0 }}
                                fullWidth
                                disabled={loadingPrice}
                            />

                            <TextField
                                label="Giá Ghế VIP"
                                name="vipPrice"
                                type="number"
                                value={priceFormData.vipPrice}
                                onChange={handlePriceInputChange}
                                inputProps={{ step: 10000, min: 0 }}
                                fullWidth
                                disabled={loadingPrice}
                            />

                            {errorPrice && (
                                <Alert severity="error">{errorPrice}</Alert>
                            )}

                            {successPrice && (
                                <Alert severity="success">{successPrice}</Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleClosePriceDialog} disabled={loadingPrice}>
                        Huỷ
                    </Button>
                    <Button
                        onClick={handleUpdatePrice}
                        variant="contained"
                        disabled={loadingPrice}
                        sx={{
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 600,
                        }}
                    >
                        {loadingPrice ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                        Cập Nhật Giá
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Xác Nhận Xóa</DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    <Typography>
                        Bạn có chắc muốn xóa suất chiếu <strong>{showtimeToDelete && getMovieTitle(showtimeToDelete.movieId)}</strong> lúc <strong>{showtimeToDelete && formatDateTime(showtimeToDelete.startTime)}</strong>?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        ⚠️ Hành động này không thể hoàn tác. Suất chiếu sẽ bị xóa vĩnh viễn.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: 'none' }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};