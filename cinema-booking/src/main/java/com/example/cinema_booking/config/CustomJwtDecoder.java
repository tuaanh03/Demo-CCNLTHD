package com.example.cinema_booking.config;

import java.text.ParseException;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import com.example.cinema_booking.dto.request.IntrospectRequest;
import com.example.cinema_booking.service.AuthenticateService;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;


import com.nimbusds.jose.JOSEException;

@Component
public class CustomJwtDecoder implements JwtDecoder {
//    @Value("${jwt.signerKey}")
//    private String signerKey;

    @NonFinal
    protected static final String SIGNED_KEY = "0e796109b182226d16e5ba239be1c9ce38c78d378444b4b8e2058e914ff887b8";

    @Autowired
    private AuthenticateService authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        try {
            var response = authenticationService.introspect(
                    IntrospectRequest.builder().token(token).build());

            if (!response.isValid()) {
                throw new BadJwtException("Token invalid");
            }
        } catch (JOSEException | ParseException e) {
            throw new BadJwtException("Token invalid", e);
        } catch (JwtException e) {
            throw e;
        } catch (Exception e) {
            throw new JwtException("JWT validation failed", e);
        }

        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNED_KEY.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }
}