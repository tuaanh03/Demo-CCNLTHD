package com.example.cinema_booking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // nơi config các endpoint API nào cần được bảo vệ, API nào có thể truy cập công khai, và cách thức xác thực người dùng


    // Sau này thay bằng cách lấy từ file config hoặc biến môi trường, ko nên hardcode như này
//    @NonFinal
//    protected static final String SIGNED_KEY = "0e796109b182226d16e5ba239be1c9ce38c78d378444b4b8e2058e914ff887b8";

    @Autowired
    private CustomJwtDecoder customJwtDecoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity.authorizeHttpRequests(request ->
                request
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Cho phép preflight CORS
                .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/introspect", "/auth/refresh", "/users").permitAll()
                .requestMatchers("/users/**", "/roles/**", "/permissions/**").hasRole("ADMIN")
                        // yêu cầu xác thực cho tất cả các endpoint khác
                        .anyRequest().authenticated()
        );

        // Enable CORS at the Spring Security layer so it picks up the configuration from WebConfig
        httpSecurity.cors(cors -> {});

        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer ->
                                jwtConfigurer.decoder(customJwtDecoder)
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
        );

        httpSecurity.csrf(AbstractHttpConfigurer::disable);


        return httpSecurity.build();
    }

    // Chuyển custom format SCOPE_ADMIN thành custom ví dụ ROLE_ADMIN ...
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter()
    {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }
}