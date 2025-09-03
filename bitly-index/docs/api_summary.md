# API Summary

This document summarizes the API endpoints for the Bitly-Good service.

## Endpoints

### Create Short URL

*   **Method**: `POST`
*   **Endpoint**: `/urls`
*   **Request Body**: `String` (The original URL to be shortened)
*   **Response**: `String` (The shortened URL)

### Redirect to Original URL

*   **Method**: `GET`
*   **Endpoint**: `/{shortUrl}`
*   **Response**: HTTP 302 Redirect to the original URL.

---

## Performance Testing Guide

This section describes how to run the performance testing environment.

### 1. Start the Environment

Navigate to the `bitly-good` directory and run the following command to start all services (Application, Database, Prometheus, Grafana):

```bash
docker-compose up -d --build
```

### 2. Access Monitoring Tools

*   **Grafana**: `http://localhost:3000` (Login: `admin` / `password`)
    *   You need to add Prometheus as a data source:
        1.  Go to Configuration > Data Sources > Add data source.
        2.  Select Prometheus.
        3.  Set the URL to `http://prometheus:9090`.
        4.  Click `Save & Test`.
    *   Import a dashboard by ID (e.g., `4701` for JVM/Micrometer).
*   **Prometheus**: `http://localhost:9090`
    *   Check `Status` > `Targets` to ensure the `spring-app` is `UP`.

### 3. Run the Load Test

Navigate to the `bitly-good/k6` directory and run the following command:

```bash
k6 run script.js
```

The test will run for 30 seconds with 10 virtual users, measuring the GET request (redirection) performance.

### 4. Stop the Environment

When you are finished, stop and remove all containers:

```bash
docker-compose down -v
```