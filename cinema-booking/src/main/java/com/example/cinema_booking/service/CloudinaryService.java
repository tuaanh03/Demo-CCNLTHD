package com.example.cinema_booking.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryService {
    Cloudinary cloudinary;


    public String upload(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "width", 280,
                            "height", 420,
                            "crop", "fill",
                            "gravity", "face"
                    )
            );
            String publicId = uploadResult.get("public_id").toString();
            // Return URL với transformation để đảm bảo size fixed
            String transformedUrl = cloudinary.url()
                    .transformation(new com.cloudinary.Transformation()
                            .width(280)
                            .height(420)
                            .crop("fill")
                            .gravity("face")
                    )
                    .generate(publicId);
            return transformedUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

}
