import React, { useEffect, useState, useRef } from 'react';
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
    Chip,
    Select,
    MenuItem,
    ListItemText,
    TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminMovieService, adminGenreService, adminCloudinaryService } from '../services/adminApi';
import { Movie, Genre } from '../types';

const MOVIE_STATUS = ['COMING_SOON', 'NOW_SHOWING', 'ENDED'];

export const AdminMovies: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        director: '',
        actors: '',
        duration: '',
        genreIds: [] as string[],  // Change to array for multiple genres
        releaseDate: '',
        imageUrl: '',
        trailerUrl: '',
        status: 'COMING_SOON',
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [openGenreDialog, setOpenGenreDialog] = useState(false);
    const [newGenreName, setNewGenreName] = useState('');
    const [creatingGenre, setCreatingGenre] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMovies();
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const response = await adminGenreService.getAllGenres();
            console.log('Genre response:', response.data);
            const genreList = response.data?.result || [];
            setGenres(Array.isArray(genreList) ? genreList : []);
            console.log('Genres loaded:', genreList);
        } catch (error) {
            console.error('Error fetching genres:', error);
            setGenres([]);
        }
    };

    const fetchMovies = async () => {
        try {
            const response = await adminMovieService.getAllMovies();
            setMovies(response.data.result);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const handleOpenDialog = (movie?: Movie) => {
        if (movie) {
            setEditingMovie(movie);
            setFormData({
                title: movie.title,
                description: movie.description,
                director: movie.director || '',
                actors: movie.actors || '',
                duration: String(movie.duration ?? ''),
                genreIds: movie.genreIds || [], // Use array directly
                releaseDate: movie.releaseDate,
                imageUrl: movie.imageUrl,
                trailerUrl: movie.trailerUrl,
                status: movie.status,
            });
        } else {
            setEditingMovie(null);
            setFormData({
                title: '',
                description: '',
                director: '',
                actors: '',
                duration: '',
                genreIds: [], // Initialize as empty array
                releaseDate: '',
                imageUrl: '',
                trailerUrl: '',
                status: 'COMING_SOON',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMovie(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as any;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleStatusChange = (e: any) => {
        setFormData({
            ...formData,
            status: e.target.value,
        });
    };

    const handleGenreChange = (e: any) => {
        setFormData({
            ...formData,
            genreIds: typeof e.target.value === 'string' 
                ? e.target.value.split(',').filter(Boolean) 
                : (e.target.value as string[]),
        });
    };

    const handleImageUpload = async (file: File) => {
        if (!file) return;

        try {
            setUploadingImage(true);
            const response = await adminCloudinaryService.uploadImage(file);
            const imageUrl = response.data;
            setFormData({
                ...formData,
                imageUrl: imageUrl,
            });
            alert('Tải lên hình ảnh thành công!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Lỗi tải lên hình ảnh. Vui lòng thử lại.');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleImageUpload(file);
            } else {
                alert('Vui lòng kéo thả hình ảnh!');
            }
        }
    };

    const handleOpenGenreDialog = () => {
        setNewGenreName('');
        setOpenGenreDialog(true);
    };

    const handleCloseGenreDialog = () => {
        setOpenGenreDialog(false);
        setNewGenreName('');
    };

    const handleCreateGenre = async () => {
        if (!newGenreName.trim()) {
            alert('Vui lòng nhập tên thể loại!');
            return;
        }

        try {
            setCreatingGenre(true);
            const response = await adminGenreService.createGenre(newGenreName.trim());
            const newGenre = response.data.result;
            
            // Add new genre to list
            setGenres([...genres, newGenre]);
            
            // Auto select the newly created genre
            setFormData({
                ...formData,
                genreIds: [...formData.genreIds, newGenre.id],
            });

            handleCloseGenreDialog();
            alert('Tạo thể loại mới thành công!');
        } catch (error: any) {
            console.error('Error creating genre:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi tạo thể loại. Vui lòng thử lại.';
            alert(errorMessage);
        } finally {
            setCreatingGenre(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const durationValue = Number(formData.duration);
            if (!Number.isInteger(durationValue) || durationValue <= 0) {
                alert('Thời lượng phải là số nguyên dương.');
                return;
            }

            if (editingMovie) {
                // Update movie
                await adminMovieService.updateMovie(editingMovie.id, {
                    title: formData.title,
                    description: formData.description,
                    director: formData.director,
                    actors: formData.actors,
                    duration: durationValue,
                    genreIds: formData.genreIds,
                    genreNames: [],
                    releaseDate: formData.releaseDate,
                    imageUrl: formData.imageUrl,
                    trailerUrl: formData.trailerUrl,
                    status: formData.status,
                });
            } else {
                // Create new movie
                await adminMovieService.createMovie({
                    title: formData.title,
                    description: formData.description,
                    director: formData.director,
                    actors: formData.actors,
                    duration: durationValue,
                    genreIds: formData.genreIds,
                    genreNames: [],
                    releaseDate: formData.releaseDate,
                    imageUrl: formData.imageUrl,
                    trailerUrl: formData.trailerUrl,
                    status: formData.status,
                });
            }
            handleCloseDialog();
            fetchMovies(); // Refresh list after save
        } catch (error) {
            console.error('Error saving movie:', error);
            alert('Lỗi lưu phim. Vui lòng thử lại.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phim này?')) return;
        
        try {
            await adminMovieService.deleteMovie(id);
            fetchMovies(); // Refresh list after delete
        } catch (error) {
            console.error('Error deleting movie:', error);
            alert('Lỗi xóa phim. Vui lòng thử lại.');
        }
    };

    const paginatedMovies = movies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(movies.length / rowsPerPage) - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [movies.length, rowsPerPage, page]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Quản Lý Phim
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
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
                    Thêm Phim Mới
                </Button>
            </Box>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Hình Ảnh</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Tên Phim</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Thể Loại</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Thời Lượng</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Ngày Khởi Chiếu</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                                Thao Tác
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedMovies.map((movie) => (
                            <TableRow
                                key={movie.id}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                    },
                                }}
                            >
                                <TableCell>{movie.id}</TableCell>
                                <TableCell>
                                    <img
                                        src={movie.imageUrl}
                                        alt={movie.title}
                                        style={{
                                            width: 60,
                                            height: 90,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={600}>{movie.title}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={movie.genreNames?.join(', ')}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(255, 107, 0, 0.1)',
                                            color: '#ff6b00',
                                            fontWeight: 600,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{movie.duration} phút</TableCell>
                                <TableCell>
                                    <Chip
                                        label={movie.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: movie.status === 'NOW_SHOWING' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 0, 0.1)',
                                            color: movie.status === 'NOW_SHOWING' ? '#4CAF50' : '#ff6b00',
                                            fontWeight: 600,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(movie)}
                                        sx={{ color: '#2196f3' }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(movie.id)}
                                        sx={{ color: '#f44336' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {movies.length > 0 && (
                <TablePagination
                    component="div"
                    count={movies.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 20]}
                    labelRowsPerPage="Số dòng mỗi trang"
                />
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                    {editingMovie ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên Phim"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Mô Tả"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            multiline
                            rows={4}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Đạo Diễn"
                            name="director"
                            value={formData.director}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Victor Vũ"
                        />
                        <TextField
                            fullWidth
                            label="Diễn Viên"
                            name="actors"
                            value={formData.actors}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: A, B, C"
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Thời Lượng"
                                name="duration"
                                type="number"
                                value={formData.duration}
                                onChange={handleInputChange}
                                inputProps={{ min: 1, step: 1 }}
                                required
                            />
                            <Box sx={{ flex: 1 }}>
                                <Select
                                    fullWidth
                                    multiple
                                    name="genreIds"
                                    value={formData.genreIds}
                                    onChange={handleGenreChange}
                                    displayEmpty
                                    renderValue={(selected: string[]) => 
                                        selected.length === 0 
                                            ? 'Chọn Thể Loại'
                                            : selected.map(id => genres.find(g => g.id === id)?.name).filter(Boolean).join(', ')
                                    }
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: 1,
                                    }}
                                >
                                    {genres.map((genre) => (
                                        <MenuItem key={genre.id} value={genre.id}>
                                            <ListItemText primary={genre.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                            <Button
                                variant="outlined"
                                onClick={handleOpenGenreDialog}
                                sx={{
                                    borderColor: '#ff6b00',
                                    color: '#ff6b00',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                ➕ Thêm Loại
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Ngày Khởi Chiếu"
                                name="releaseDate"
                                type="date"
                                value={formData.releaseDate}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                            <Select
                                fullWidth
                                name="status"
                                value={formData.status}
                                onChange={handleStatusChange}
                                displayEmpty
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 1,
                                }}
                            >
                                {MOVIE_STATUS.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                        <Box 
                            sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileInputChange}
                            />
                            <Box
                                sx={{
                                    flex: 1,
                                    border: '2px dashed',
                                    borderColor: isDraggingImage ? '#ff6b00' : '#ccc',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    backgroundColor: isDraggingImage ? 'rgba(255, 107, 0, 0.05)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: '#ff6b00',
                                        backgroundColor: 'rgba(255, 107, 0, 0.03)',
                                    }
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Typography 
                                    variant="body2"
                                    sx={{ 
                                        fontWeight: 600,
                                        color: isDraggingImage ? '#ff6b00' : '#666',
                                    }}
                                >
                                    {uploadingImage ? '⏳ Đang tải lên...' : '📸 Kéo thả hình ảnh hoặc click để chọn'}
                                </Typography>
                            </Box>
                        </Box>
                        <TextField
                            fullWidth
                            label="URL Hình Ảnh"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            label="URL Trailer"
                            name="trailerUrl"
                            value={formData.trailerUrl}
                            onChange={handleInputChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 600,
                        }}
                    >
                        {editingMovie ? 'Cập Nhật' : 'Thêm Mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openGenreDialog} onClose={handleCloseGenreDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                    Thêm Thể Loại Mới
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên Thể Loại"
                            value={newGenreName}
                            onChange={(e) => setNewGenreName(e.target.value)}
                            placeholder="Nhập tên thể loại (Ví dụ: Kinh Dị, Tình Cảm...)"
                            disabled={creatingGenre}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={handleCloseGenreDialog}
                        disabled={creatingGenre}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleCreateGenre}
                        variant="contained"
                        disabled={creatingGenre}
                        sx={{
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 600,
                        }}
                    >
                        {creatingGenre ? 'Đang Tạo...' : 'Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
