package com.salonbooking.api.service.impl;

import com.salonbooking.api.exception.BusinessException;
import com.salonbooking.api.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryStorageServiceImpl implements FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new BusinessException("Failed to store empty file.");
            }
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.rootLocation.resolve(filename));
            
            // Build the URL to serve the file
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(filename)
                    .toUriString();
            
            return fileUrl;
        } catch (IOException e) {
            log.error("Error saving file locally: {}", e.getMessage());
            throw new BusinessException("Failed to store file.");
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/uploads/")) {
            return;
        }
        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path file = rootLocation.resolve(filename);
            Files.deleteIfExists(file);
            log.info("Deleted local file: {}", filename);
        } catch (IOException e) {
            log.error("Error deleting local file: {}", e.getMessage());
        }
    }
}
