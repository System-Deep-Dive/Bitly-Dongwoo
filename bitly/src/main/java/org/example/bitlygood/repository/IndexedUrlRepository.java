package org.example.bitlygood.repository;

import org.example.bitlygood.domain.IndexedUrl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IndexedUrlRepository extends JpaRepository<IndexedUrl, Long> {
    Optional<IndexedUrl> findByShortUrl(String shortUrl);
}
