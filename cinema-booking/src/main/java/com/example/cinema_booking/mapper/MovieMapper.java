package com.example.cinema_booking.mapper;

import com.example.cinema_booking.dto.request.MovieCreateRequest;
import com.example.cinema_booking.dto.request.MovieUpdateRequest;
import com.example.cinema_booking.dto.response.MovieResponse;
import com.example.cinema_booking.entity.Genre;
import com.example.cinema_booking.entity.Movie;
import com.example.cinema_booking.service.GenreService;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface MovieMapper {

    @Mapping(target = "genres", ignore = true) //  để Service xử lý
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Movie toMovie(MovieCreateRequest request);

    @Mapping(target = "genreIds", expression = "java(movie.getGenres().stream().map(g -> g.getId()).collect(java.util.stream.Collectors.toList()))")
    @Mapping(target = "genreNames", expression = "java(movie.getGenres().stream().map(g -> g.getName()).collect(java.util.stream.Collectors.toList()))")
    MovieResponse toMovieResponse(Movie movie);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateMovieFromRequest(MovieUpdateRequest request, @MappingTarget Movie movie);

    List<MovieResponse> toMovieResponseList(List<Movie> movies);
}
