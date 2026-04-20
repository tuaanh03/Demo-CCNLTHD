package com.example.cinema_booking.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ValidationErrorResponse {
    int status;
    String message;
    Map<String, String> errors;
    LocalDateTime timestamp;
}
