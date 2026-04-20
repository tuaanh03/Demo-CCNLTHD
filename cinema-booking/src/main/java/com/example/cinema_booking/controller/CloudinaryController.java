package com.example.cinema_booking.controller;


import com.example.cinema_booking.service.CloudinaryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryController {

        CloudinaryService cloudinaryService;

    @PostMapping
    public String upload(@RequestParam MultipartFile file) {
        return cloudinaryService.upload(file);
    }
}
