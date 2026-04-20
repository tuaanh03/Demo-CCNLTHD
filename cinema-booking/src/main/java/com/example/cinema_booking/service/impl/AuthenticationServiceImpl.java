package com.example.cinema_booking.service.impl;


import com.example.cinema_booking.dto.request.AuthenticationRequest;
import com.example.cinema_booking.dto.request.IntrospectRequest;
import com.example.cinema_booking.dto.request.LogoutRequest;
import com.example.cinema_booking.dto.request.RefreshRequest;
import com.example.cinema_booking.dto.response.AuthenticationResponse;
import com.example.cinema_booking.dto.response.IntrospectResponse;
import com.example.cinema_booking.entity.InvalidatedToken;
import com.example.cinema_booking.entity.User;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.repository.InvalidatedTokenRepository;
import com.example.cinema_booking.repository.UserRepository;
import com.example.cinema_booking.service.AuthenticateService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j

public class AuthenticationServiceImpl implements AuthenticateService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;


    // Sau này thay bằng cách lấy từ file config hoặc biến môi trường, ko nên hardcode như này
    @NonFinal
    protected static final String SIGNED_KEY = "0e796109b182226d16e5ba239be1c9ce38c78d378444b4b8e2058e914ff887b8";

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    private long REFRESHABLE_DURATION;



    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException
    {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
        }
        catch (AppException e)
        {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();

    }


    // Hàm login để lấy token

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        if (request == null
                || isBlank(request.getEmail())
                || isBlank(request.getPassword())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));


        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .isAuthenticated(true)
                .build();
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SIGNED_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expirationTime = (isRefresh)
                                            ? new Date(signedJWT.getJWTClaimsSet().getIssueTime().toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                                            :signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expirationTime.after(new Date())))
        {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
        {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException
    {

        try
        {
            var signedToken = verifyToken(request.getToken(), true);

            String jti = signedToken.getJWTClaimsSet().getJWTID();

            Date expirationTime = signedToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jti)
                    .expiryTime(expirationTime)
                    .build();

            invalidatedTokenRepository.save(invalidatedToken);
        }
        catch (AppException e)
        {
            log.info("Token already invalid or expired: {}", e.getMessage());
        }



    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signJWT = verifyToken(request.getToken(), true);

        var jti = signJWT.getJWTClaimsSet().getJWTID();
        var expirationTime = signJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jti)
                .expiryTime(expirationTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);

        var username = signJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByEmail(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var new_token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(new_token)
                .isAuthenticated(true)
                .build();
    }

    private String generateToken(User user) {

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("cinema-booking")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("userId", user.getId())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNED_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {

            log.error("Error while signing the token: {}", e.getMessage());

            throw new RuntimeException(e);
        }

    }

    private String buildScope(User user)
    {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
        {
            user.getRoles().forEach(role ->{
                    stringJoiner.add("ROLE_" + role.getName());
                    if (!CollectionUtils.isEmpty(role.getPermissions()))
                        role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));

            });
        }

        return stringJoiner.toString();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }


}
