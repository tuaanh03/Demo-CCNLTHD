package com.example.cinema_booking.config;


import com.example.cinema_booking.entity.User;
import com.example.cinema_booking.entity.Role;
import com.example.cinema_booking.repository.RoleRepository;
import com.example.cinema_booking.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@Slf4j
public class ApplicationInitConfig {

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository)
    {

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        return args -> {
               String adminEmail = "admin@gmail.com";

               if (userRepository.findByEmail(adminEmail).isEmpty())
               {
                   String adminRoleName = com.example.cinema_booking.enums.Role.ADMIN.name();

                   Role adminRole = roleRepository.findById(adminRoleName)
                           .orElseGet(() -> roleRepository.save(Role.builder()
                                   .name(adminRoleName)
                                   .description("Administrator role")
                                   .build()));

                   User user = User.builder()
                           .email(adminEmail)
                           .roles(Set.of(adminRole))
                           .password(passwordEncoder.encode("admin"))
                           .build();

                   userRepository.save(user);
                   log.warn("admin user have been created with default password: admin, you must change the password");

               }
        };
    }

}
