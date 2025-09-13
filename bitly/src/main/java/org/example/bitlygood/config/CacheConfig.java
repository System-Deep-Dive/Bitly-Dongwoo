package org.example.bitlygood.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // 1. 기본 캐시 설정: 10분 TTL, JSON 직렬화
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10)) // 기본 만료 시간 10분
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // 2. 특정 캐시 그룹("indexedUrl")을 위한 별도 설정: 1시간 TTL
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        cacheConfigurations.put("indexedUrl", defaultConfig.entryTtl(Duration.ofHours(1))); // "indexedUrl" 캐시는 1시간

        // 3. 설정들을 적용하여 CacheManager 생성
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig) // 기본 설정 적용
                .withInitialCacheConfigurations(cacheConfigurations) // 특정 캐시 설정 적용
                .build();
    }
}
