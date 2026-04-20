import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import { Movie } from '../types';
import StarIcon from '@mui/icons-material/Star';

interface MovieCardProps {
    movie: Movie;
    onSelect: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
    const navigate = useNavigate();
    // Generate random rating for demo (7.0 - 9.5)
    const rating = (Math.random() * 2.5 + 7).toFixed(1);
    
    // Age rating based on genre (demo)
    const getAgeRating = (genreName: string | undefined) => {
        if (!genreName) return 'T13';
        const genre = genreName.toLowerCase();
        if (genre.includes('action') || genre.includes('horror')) return 'T18';
        if (genre.includes('thriller')) return 'T16';
        return 'T13';
    };

    return (
        <Card
            sx={{
                width: 280,
                minWidth: 280,
                maxWidth: 280,
                backgroundColor: 'background.paper',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 16px 40px -12px rgba(255, 107, 0, 0.4)',
                    '& .movie-poster': {
                        transform: 'scale(1.05)',
                    },
                    '& .book-button': {
                        backgroundColor: '#ff6b00',
                    },
                },
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Box 
                sx={{ 
                    position: 'relative', 
                    overflow: 'hidden', 
                    width: '100%', 
                    aspectRatio: '280 / 420',
                    cursor: 'pointer',
                }}
                onClick={() => navigate(`/movie/${movie.id}`)}
            >
                <CardMedia
                    component="img"
                    image={movie.imageUrl || 'https://via.placeholder.com/280x420?text=No+Image'}
                    alt={movie.title}
                    className="movie-poster"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                        transition: 'transform 0.3s ease-in-out',
                    }}
                />
                {/* Rating Badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                    }}
                >
                    <StarIcon sx={{ fontSize: 18, color: '#ffc107' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffc107', fontSize: '0.95rem' }}>
                        {rating}
                    </Typography>
                </Box>
                {/* Age Rating Badge */}
                <Chip
                    label={getAgeRating(movie.genreNames?.[0])}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(255, 107, 0, 0.9)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        height: 24,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                />
            </Box>
            <CardContent sx={{ p: 2.5, pt: 2 }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        mb: 1.5,
                        height: '2.6em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: 'text.primary',
                        lineHeight: 1.3,
                    }}
                >
                    {movie.title}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Chip
                        label={movie.genreNames?.join(', ') || 'Không rõ'}
                        size="small"
                        sx={{
                            width: 'fit-content',
                            backgroundColor: 'rgba(255, 107, 0, 0.1)',
                            color: '#ff6b00',
                            border: '1px solid rgba(255, 107, 0, 0.3)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            height: 24,
                        }}
                    />
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    className="book-button"
                    sx={{
                        py: 1.2,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        backgroundColor: 'rgba(255, 107, 0, 0.9)',
                        color: 'white',
                        border: '1px solid rgba(255, 107, 0, 0.3)',
                        '&:hover': {
                            backgroundColor: '#ff6b00',
                            boxShadow: '0 4px 20px rgba(255, 107, 0, 0.4)',
                        },
                        transition: 'all 0.3s',
                    }}
                >
                    Đặt Vé Ngay
                </Button>
            </CardContent>
        </Card>
    );
}; 