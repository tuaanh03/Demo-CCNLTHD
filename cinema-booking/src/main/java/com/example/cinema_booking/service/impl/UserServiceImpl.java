package com.example.cinema_booking.service.impl;

import com.example.cinema_booking.dto.request.*;
import com.example.cinema_booking.dto.response.UserResponse;
import com.example.cinema_booking.entity.Role;
import com.example.cinema_booking.entity.User;
import com.example.cinema_booking.exception.AppException;
import com.example.cinema_booking.exception.ErrorCode;
import com.example.cinema_booking.mapper.UserMapper;
import com.example.cinema_booking.repository.RoleRepository;
import com.example.cinema_booking.repository.UserRepository;
import com.example.cinema_booking.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor // tự động tạo constructor cho tất cả các field final
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) // tự động set tất cả các field là private và final
@Slf4j
public class UserServiceImpl  implements UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;

    public UserResponse createUser(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) throw new AppException(ErrorCode.USER_EMAIL_EXISTED);

        User user = userMapper.toUser(request);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        String roleName = com.example.cinema_booking.enums.Role.USER.name();
        Role role = roleRepository.findById(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(roleName)
                        .description("User role")
                        .build()));

        HashSet<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse getMyInfo()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PostAuthorize("returnObject.email == authentication.name or hasRole('ADMIN')")
    @Override
    public UserResponse updateUser(UserUpdateRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUserFromRequest(request, user);

        // vì mapper không thể tự convert string sang object Role nên phải convert thủ công ở đây
        // vì request là dạng set string nên phải convert sang set Role, nếu không sẽ bị lỗi khi save user vì user có field roles là set Role


        // Đưa dạng string vào dđây để tìm kiếm trong db , rồi return dạng object Role
        var roles = roleRepository.findAllById(request.getRoles());

        // Sau dđó hashset từ list về set(loại bỏ role trùng) cho lại cho user
        user.setRoles(new HashSet<>(roles));

        userRepository.save(user);

        return userMapper.toUserResponse(user);

    }


    @PostAuthorize("returnObject.email == authentication.name or hasRole('ADMIN')")
    // Chỉ cho phép người dùng truy cập vào phương thức này nếu email của họ trùng với email của user được trả về hoặc họ có role ADMIN
    @Override
    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')") // Chỉ cho phép người dùng có role ADMIN truy cập vào phương thức này
    @Override
    public List<UserResponse> getUsers() {
        log.info("In method get user");
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("Authenticated user: {}", authentication.getName());

        authentication.getAuthorities().forEach(authority -> log.info("Authority: {}", authority.getAuthority()));

        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .toList();
    }


//    @Override
//    public void assignRoleToUser(UserAssignRoleRequest request, String userId, String role) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
//
//    Role parsedRole;
//        try {
//            parsedRole = Role.valueOf(role.toUpperCase());
//        } catch (IllegalArgumentException e) {
//            throw new AppException(ErrorCode.INVALID_ROLE);
//        }
//
//        userMapper.assignUserRoleFromRequest(request, user);
//        userRepository.save(user);
//    }

    @Override
    public void updateUserStatus(UserUpdateStatusRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUserStatusFromRequest(request, user);
        userRepository.save(user);
    }

}
