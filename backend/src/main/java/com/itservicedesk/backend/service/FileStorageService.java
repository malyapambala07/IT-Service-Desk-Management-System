
package com.itservicedesk.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir:uploads/attachments}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "png", "jpg", "jpeg",
                   "doc", "docx", "txt", "xlsx");

    public String store(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a file");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File size must not exceed 10 MB");
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        String cleanedName =
                StringUtils.cleanPath(originalName).replace("\\", "/");

        String fileName =
                cleanedName.substring(cleanedName.lastIndexOf("/") + 1);

        int dotIndex = fileName.lastIndexOf(".");

        if (dotIndex <= 0 || dotIndex == fileName.length() - 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file extension");
        }

        String extension =
                fileName.substring(dotIndex + 1).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "File type not allowed");
        }

        String storedName = UUID.randomUUID() + "." + extension;

        Path directory =
                Paths.get(uploadDir).toAbsolutePath().normalize();

        Files.createDirectories(directory);

        Path destination =
                directory.resolve(storedName).normalize();

        if (!destination.startsWith(directory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        Files.copy(file.getInputStream(), destination);

        return storedName;
    }

    public Resource load(String storedName) throws IOException {

        Path directory =
                Paths.get(uploadDir).toAbsolutePath().normalize();

        Path filePath =
                directory.resolve(storedName).normalize();

        if (!filePath.startsWith(directory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "File not found");
        }

        return resource;
    }

    public void delete(String storedName) throws IOException {

        Path directory =
                Paths.get(uploadDir).toAbsolutePath().normalize();

        Path filePath =
                directory.resolve(storedName).normalize();

        if (!filePath.startsWith(directory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        Files.deleteIfExists(filePath);
    }
}
