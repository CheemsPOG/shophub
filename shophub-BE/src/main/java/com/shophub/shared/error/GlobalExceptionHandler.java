package com.shophub.shared.error;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApi(ApiException ex, HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus()).body(body(ex.getStatus(), ex.getCode(), ex.getMessage(), request, List.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.toList());
        return ResponseEntity.badRequest().body(body(400, "VALIDATION_ERROR", "Request validation failed", request, details));
    }

    @ExceptionHandler({BadCredentialsException.class})
    public ResponseEntity<Map<String, Object>> handleBadCreds(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(401).body(body(401, "UNAUTHENTICATED", "Invalid email or password", request, List.of()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleDenied(AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(403).body(body(403, "ACCESS_DENIED", "You do not have permission to perform this action", request, List.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleOther(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(500).body(body(500, "INTERNAL_ERROR", "An unexpected error occurred", request, List.of()));
    }

    private Map<String, Object> body(int status, String code, String message, HttpServletRequest request, List<String> details) {
        String requestId = MDC.get("requestId");
        if (requestId == null) {
            requestId = UUID.randomUUID().toString();
        }
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", status,
                "code", code,
                "message", message,
                "path", request.getRequestURI(),
                "requestId", requestId,
                "details", details);
    }
}
