package org.example.bitlygood.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UrlService urlService;

    @Override
    public void run(String... args) {
        log.info("Seeding database with 1000 URLs...");
        try {
            for (int i = 0; i < 1000; i++) {
                String originalUrl = "https://example.com/seed-data/" + i;
                urlService.createShortUrl(originalUrl);
            }
            log.info("Database seeding complete.");
        } catch (Exception e) {
            log.error("Database seeding failed: {}", e.getMessage());
        }
    }
}
