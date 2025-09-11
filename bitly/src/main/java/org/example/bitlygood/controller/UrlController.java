package org.example.bitlygood.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.bitlygood.service.UrlService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @GetMapping("/base-line/{shortUrl}")
    public void redirectBaseLine(@PathVariable String shortUrl, HttpServletResponse response) throws IOException {
        String originalUrl = urlService.getBaseLineUrl(shortUrl);
        response.sendRedirect(originalUrl);
    }

    @GetMapping("/index/{shortUrl}")
    public void redirectIndex(@PathVariable String shortUrl, HttpServletResponse response) throws IOException {
        String originalUrl = urlService.getIndexUrl(shortUrl);
        response.sendRedirect(originalUrl);
    }

    @GetMapping("/urls/all")
    public ResponseEntity<List<String>> getAllShortUrls() {
        return ResponseEntity.ok(urlService.getAllShortUrls());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Void> handleIllegalArgumentException() {
        return ResponseEntity.notFound().build();
    }
}
