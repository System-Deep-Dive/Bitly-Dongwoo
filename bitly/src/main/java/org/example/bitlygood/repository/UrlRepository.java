package org.example.bitlygood.repository;

import org.example.bitlygood.domain.Url;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortUrl(String shortUrl);

    @Query("SELECT u.shortUrl FROM Url u")
    List<String> findAllShortUrls();
}
