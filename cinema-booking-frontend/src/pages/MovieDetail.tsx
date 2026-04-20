import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Chip,
    Grid,
    Paper,
    CircularProgress,
    Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { movieService } from '../services/api';
import { Movie } from '../types';

export const MovieDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating] = useState((Math.random() * 2.5 + 7).toFixed(1));

    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                if (!id) return;
                const response = await movieService.getMovieById(id);
                setMovie(response.data.result);
            } catch (error) {
                console.error('Error fetching movie detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovieDetail();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!movie) {
        return (
            <Container>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="h5">Phim không tìm thấy</Typography>
                </Box>
            </Container>
        );
    }

    const getAgeRating = (genreName: string | undefined) => {
        if (!genreName) return 'T13';
        const genre = genreName.toLowerCase();
        if (genre.includes('action') || genre.includes('horror')) return 'T18';
        if (genre.includes('thriller')) return 'T16';
        return 'T13';
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Main Content */}
                <Grid container spacing={4}>
                    {/* Left: Poster & Title */}
                    <Grid item xs={12} sm={4} md={3}>
                        <Box>
                            {/* Poster Card */}
                            <Paper
                                elevation={3}
                                sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    mb: 2,
                                }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    <img
                                        src={movie.imageUrl}
                                        alt={movie.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block',
                                        }}
                                    />
                                    {/* Rating Badge */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        <Typography sx={{ color: '#ffc107', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            ⭐ {rating}
                                        </Typography>
                                    </Box>
                                    {/* Age Rating */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            backgroundColor: '#ff9800',
                                            color: 'white',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {getAgeRating(movie.genreNames?.[0])}
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Right: Information */}
                    <Grid item xs={12} sm={8} md={9}>
                        <Box component={Paper} elevation={0} sx={{ p: { xs: 2, md: 4 }, backgroundColor: 'white', borderRadius: 2 }}>
                            {/* Title */}
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 700, 
                                    mb: 3,
                                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                                }}
                            >
                                {movie.title}
                            </Typography>

                            {/* Quick Info */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={movie.genreNames?.join(', ')}
                                        sx={{
                                            backgroundColor: 'rgba(255, 107, 0, 0.1)',
                                            color: '#ff6b00',
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Chip
                                        icon={<LocalFireDepartmentIcon />}
                                        label={movie.status === 'NOW_SHOWING' ? 'Đang Chiếu' : 'Sắp Chiếu'}
                                        sx={{
                                            backgroundColor: movie.status === 'NOW_SHOWING' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 0, 0.1)',
                                            color: movie.status === 'NOW_SHOWING' ? '#4CAF50' : '#ff6b00',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>

                                {/* Key Details */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                                            Khởi chiếu:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarTodayIcon sx={{ color: '#ff6b00' }} />
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                                            Thời lượng:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon sx={{ color: '#ff6b00' }} />
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {movie.duration} phút
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Movie Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                    Đạo diễn:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    {movie.director || 'Đang cập nhật'}
                                </Typography>

                                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                    Diễn viên:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    {movie.actors || 'Đang cập nhật'}
                                </Typography>

                                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                    Thể loại:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    {movie.genreNames?.join(', ')}
                                </Typography>

                                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                    Ngôn ngữ:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 3 }}>
                                    Tiếng Anh - Phụ đề tiếng Việt
                                </Typography>
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<PlayArrowIcon />}
                                    sx={{
                                        background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: { xs: 3, sm: 4 },
                                        flex: { xs: '1 1 100%', sm: 'auto' },
                                    }}
                                    onClick={() => navigate(`/movie/${id}/showtimes`)}
                                >
                                    Mua Vé
                                </Button>
                                {movie.trailerUrl && (
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<PlayArrowIcon />}
                                        sx={{
                                            borderColor: '#ff6b00',
                                            color: '#ff6b00',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: { xs: 3, sm: 4 },
                                            flex: { xs: '1 1 100%', sm: 'auto' },
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 107, 0, 0.1)',
                                            },
                                        }}
                                        onClick={() => window.open(movie.trailerUrl, '_blank')}
                                    >
                                        Xem Trailer
                                    </Button>
                                )}
                            </Box>

                            <Button
                                variant="text"
                                sx={{ color: '#666', mb: 2 }}
                                onClick={() => navigate(-1)}
                            >
                                ← Quay lại
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Synopsis */}
                <Paper elevation={0} sx={{ mt: 4, p: 4, backgroundColor: 'white', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                        Nội Dung Phim
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            lineHeight: 1.8,
                            fontSize: '1rem',
                        }}
                    >
                        {movie.description}
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};
