package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.entity.Genre;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.GenreRepository;
import com.example.cinema_booking.service.GenreService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenreServiceImpl implements GenreService {
    GenreRepository genreRepository;

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')")
    @Override
    public Genre findOrCreateGenre(String genreId, String genreName) {
        // 1. Nếu có genreId, tìm và trả về
        if (genreId != null && !genreId.isBlank()) {
            return genreRepository.findById(genreId)
                    .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_EXIST));
        }

        // 2. Nếu không có genreId, kiểm tra genreName
        if (genreName == null || genreName.isBlank()) {
            throw new AppException(ErrorCode.INVALID_GENRE);
        }

        // 3. Tìm genre theo tên (tránh trùng)
        Optional<Genre> existing = genreRepository.findByNameIgnoreCase(genreName.trim());
        if (existing.isPresent()) {
            return existing.get();
        }

        // 4. Tạo mới
        Genre newGenre = new Genre();
        newGenre.setName(genreName.trim());
        return genreRepository.save(newGenre);
    }

    /**
     * Tìm hoặc tạo nhiều genre từ danh sách IDs và Names
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    public Set<Genre> findOrCreateGenres(List<String> genreIds, List<String> genreNames) {
        Set<Genre> genres = new HashSet<>();

        // Xử lý genreIds - tìm genre theo ID (phải tồn tại)
        if (genreIds != null && !genreIds.isEmpty()) {
            for (String id : genreIds) {
                if (id != null && !id.isBlank()) {
                    Genre genre = genreRepository.findById(id)
                            .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_EXIST));
                    genres.add(genre);
                }
            }
        }

        // Xử lý genreNames - tìm hoặc tạo mới
        if (genreNames != null && !genreNames.isEmpty()) {
            for (String name : genreNames) {
                if (name != null && !name.isBlank()) {
                    Optional<Genre> existing = genreRepository.findByNameIgnoreCase(name.trim());
                    if (existing.isPresent()) {
                        genres.add(existing.get());
                    } else {
                        Genre newGenre = new Genre();
                        newGenre.setName(name.trim());
                        genres.add(genreRepository.save(newGenre));
                    }
                }
            }
        }

        // Nếu không có genre nào, throw error
        if (genres.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_GENRE);
        }

        return genres;
    }

    public List<Genre> findAllGenres() {
        return genreRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMIN_MOVIE')" )
    @Override
    public Genre createGenre(String genreName) {
        if (genreName == null || genreName.isBlank()) {
            throw new AppException(ErrorCode.INVALID_GENRE);
        }

        // Check nếu genre đã tồn tại (tránh trùng lặp)
        Optional<Genre> existing = genreRepository.findByNameIgnoreCase(genreName.trim());
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.GENRE_ALREADY_EXIST);
        }

        // Tạo genre mới
        Genre newGenre = new Genre();
        newGenre.setName(genreName.trim());
        return genreRepository.save(newGenre);
    }
}
