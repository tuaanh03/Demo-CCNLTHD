package com.example.cinema_booking.service;

import com.example.cinema_booking.dto.request.AuthenticationRequest;
import com.example.cinema_booking.dto.request.IntrospectRequest;
import com.example.cinema_booking.dto.request.LogoutRequest;
import com.example.cinema_booking.dto.request.RefreshRequest;
import com.example.cinema_booking.dto.response.AuthenticationResponse;
import com.example.cinema_booking.dto.response.IntrospectResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticateService {
    AuthenticationResponse authenticate(AuthenticationRequest request);
    void logout(LogoutRequest request) throws ParseException, JOSEException;
    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;
    AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
}
