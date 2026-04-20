import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Tabs, Tab } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { MovieCard } from '../components/MovieCard';
import { movieService } from '../services/api';
import { Movie } from '../types';
import { useNavigate } from 'react-router-dom';
import { useGenre } from '../context/GenreContext';
import { useSearch } from '../context/SearchContext';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import HistoryIcon from '@mui/icons-material/History';

export const MovieList: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [tabValue, setTabValue] = useState(0);
    const navigate = useNavigate();
    const { selectedGenreId } = useGenre();
    const { searchKeyword } = useSearch();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                let response;
                
                if (searchKeyword) {
                    // Search by keyword
                    response = await movieService.searchMovies(searchKeyword);
                } else if (selectedGenreId) {
                    // Fetch movies by genre
                    response = await movieService.getMoviesByGenre(selectedGenreId);
                } else if (tabValue === 0) {
                    // Phim Đang Chiếu
                    response = await movieService.getMoviesByStatus('NOW_SHOWING');
                } else if (tabValue === 1) {
                    // Phim Sắp Chiếu
                    response = await movieService.getMoviesByStatus('COMING_SOON');
                } else {
                    // Fetch all movies
                    response = await movieService.getAllMovies();
                }
                
                setMovies(response.data.result);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching movies:', error);
                setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        fetchMovies();
    }, [selectedGenreId, searchKeyword, tabValue]);

    const handleSelectMovie = (movie: Movie) => {
        navigate(`/movie/${movie.id}/screenings`);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'background.default'
                }}
            >
                <CircularProgress size={60} sx={{ color: '#ff6b00' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" align="center" variant="h5" sx={{ mt: 4 }}>
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c3a 100%)',
                    borderBottom: '2px solid rgba(255, 107, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <LocalMoviesIcon sx={{ fontSize: 80, color: '#ff6b00', filter: 'drop-shadow(0 0 20px rgba(255, 107, 0, 0.5))' }} />
                        </Box>
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                color: '#ffffff',
                                letterSpacing: '1px',
                            }}
                        >
                            Đặt Vé Xem Phim Online
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 4,
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: { xs: '1rem', md: '1.25rem' },
                                fontWeight: 400,
                            }}
                        >
                            Trải nghiệm điện ảnh đỉnh cao - Đặt vé nhanh chóng, không lo trễ nải
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<HistoryIcon />}
                            onClick={() => navigate('/booking-history')}
                            sx={{
                                py: 1.5,
                                px: 4,
                                fontSize: '1rem',
                                backgroundColor: '#ffffff',
                                color: '#ff6b00',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s',
                            }}
                        >
                            Xem Lịch Sử Đặt Vé
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6 }}>
                {/* Tabs Section */}
                <Box sx={{ borderBottom: 2, borderColor: 'rgba(255, 107, 0, 0.2)', mb: 5 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            '& .MuiTab-root': {
                                color: 'text.secondary',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: 200,
                                py: 2,
                                '&.Mui-selected': {
                                    color: '#ff6b00',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#ff6b00',
                                height: 3,
                            },
                        }}
                    >
                        <Tab label="Phim Đang Chiếu" />
                        <Tab label="Phim Sắp Chiếu" />
                    </Tabs>
                </Box>

                {/* Movie Carousel */}
                <Box
                    sx={{
                        position: 'relative',
                        '& .swiper': {
                            paddingBottom: '20px',
                        },
                        '& .swiper-button-next, & .swiper-button-prev': {
                            backgroundColor: 'rgba(255, 107, 0, 0.9)',
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 107, 0, 1)',
                                transform: 'translateY(-50%) scale(1.1)',
                            },
                            '&::after': {
                                fontSize: '20px',
                                color: '#ffffff',
                                fontWeight: 'bold',
                            },
                        },
                        '& .swiper-button-next': {
                            right: -10,
                        },
                        '& .swiper-button-prev': {
                            left: -10,
                        },
                        '& .swiper-pagination-bullet': {
                            backgroundColor: 'rgba(255, 107, 0, 0.5)',
                            width: 10,
                            height: 10,
                        },
                        '& .swiper-pagination-bullet-active': {
                            backgroundColor: '#ff6b00',
                        },
                    }}
                >
                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        spaceBetween={20}
                        slidesPerView={1}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                            1440: {
                                slidesPerView: 4,
                            },
                        }}
                        loop={movies.length > 4}
                        grabCursor={true}
                        speed={500}
                    >
                        {movies.length > 0 ? (
                            movies.map((movie) => (
                                <SwiperSlide key={movie.id}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <MovieCard movie={movie} onSelect={handleSelectMovie} />
                                    </Box>
                                </SwiperSlide>
                            ))
                        ) : (
                            <SwiperSlide>
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h5" color="text.secondary">
                                        Không có phim nào
                                    </Typography>
                                </Box>
                            </SwiperSlide>
                        )}
                    </Swiper>
                    <div className="swiper-button-prev"></div>
                    <div className="swiper-button-next"></div>
                </Box>
            </Container>
        </Box>
    );
}; 