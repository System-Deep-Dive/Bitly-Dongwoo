package org.example.bitlygood.service;

import lombok.RequiredArgsConstructor;
import org.example.bitlygood.domain.IndexedUrl;
import org.example.bitlygood.domain.Url;
import org.example.bitlygood.repository.IndexedUrlRepository;
import org.example.bitlygood.repository.UrlRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final IndexedUrlRepository indexedUrlRepository;
    @Transactional(readOnly = true)
    public String getBaseLineUrl(String shortUrl) {
        return urlRepository.findByShortUrl(shortUrl)
                .map(Url::getOriginalUrl)
                .orElseThrow(() -> new IllegalArgumentException("Invalid short url"));
    }

    @Transactional(readOnly = true)
    public String getIndexUrl(String shortUrl) {
        return indexedUrlRepository.findByShortUrl(shortUrl)
                .map(IndexedUrl::getOriginalUrl)
                .orElseThrow(() -> new IllegalArgumentException("Invalid short url"));
    }

    @Transactional(readOnly = true)
    public List<String> getAllShortUrls() {
        return urlRepository.findAllShortUrls();
    }
}
