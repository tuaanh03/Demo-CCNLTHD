package com.example.cinema_booking.utils;

import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Helper to get authenticated user's info from Spring SecurityContext.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            Object userId = jwt.getClaim("userId");
            if (userId != null) {
                return String.valueOf(userId);
            }
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}

