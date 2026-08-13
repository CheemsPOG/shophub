package com.shophub.shared.storage;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.shophub.shared.error.ApiException;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;

@Service
public class MediaStorageService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MediaStorageService.class);
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final MinioClient minioClient;
    private final MinioProperties props;

    public MediaStorageService(MinioClient minioClient, MinioProperties props) {
        this.minioClient = minioClient;
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(props.getBucket()).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(props.getBucket()).build());
            }
            minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
                    .bucket(props.getBucket())
                    .config(publicReadPolicy(props.getBucket()))
                    .build());
        } catch (Exception ex) {
            log.warn("Could not initialize MinIO bucket '{}': {}", props.getBucket(), ex.getMessage());
        }
    }

    public String upload(MultipartFile file, String keyPrefix) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("INVALID_FILE", "No file was uploaded");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw ApiException.badRequest("INVALID_FILE_TYPE", "Only JPEG, PNG, WEBP, or GIF images are allowed");
        }
        if (file.getSize() > MAX_BYTES) {
            throw ApiException.badRequest("FILE_TOO_LARGE", "Image must be 5MB or smaller");
        }
        String extension = extensionFor(contentType);
        String objectKey = (keyPrefix == null || keyPrefix.isBlank() ? "uploads" : keyPrefix)
                + "/" + UUID.randomUUID() + extension;
        try (InputStream in = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .stream(in, file.getSize(), -1)
                    .contentType(contentType)
                    .build());
        } catch (IOException ex) {
            throw new IllegalStateException("Could not read uploaded file", ex);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not upload file to storage", ex);
        }
        return props.getPublicUrlPrefix() + "/" + props.getBucket() + "/" + objectKey;
    }

    private static String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    private static String publicReadPolicy(String bucket) {
        return """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": {"AWS": ["*"]},
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::%s/*"]
                    }
                  ]
                }
                """.formatted(bucket);
    }
}
