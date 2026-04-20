package com.example.cinema_booking.controller;


import com.example.cinema_booking.dto.request.*;
import com.example.cinema_booking.dto.response.AuthenticationResponse;
import com.example.cinema_booking.dto.response.IntrospectResponse;
import com.example.cinema_booking.service.AuthenticateService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticateService authenticateService;

    @PostMapping("/login")
    APIResponse<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        var authResponse = authenticateService.authenticate(request);


        return APIResponse.<AuthenticationResponse>builder()
                .result(authResponse)
                .build();
    }

    @PostMapping("/introspect")
    APIResponse<IntrospectResponse> authenticate(@Valid @RequestBody IntrospectRequest request) throws JOSEException, ParseException {
        var authResponse =authenticateService.introspect(request);


        return APIResponse.<IntrospectResponse>builder()
                .result(authResponse)
                .build();
    }

    @PostMapping("/refresh")
    APIResponse<AuthenticationResponse> refresh(@Valid @RequestBody RefreshRequest request) throws ParseException, JOSEException {
        var authResponse = authenticateService.refreshToken(request);

        return APIResponse.<AuthenticationResponse>builder()
                .result(authResponse)
                .build();
    }

    @PostMapping("/logout")
    APIResponse<Void> logout(@Valid @RequestBody LogoutRequest request) throws JOSEException, ParseException {
        authenticateService.logout(request);
        return APIResponse.<Void>builder()
                .build();
    }



}
