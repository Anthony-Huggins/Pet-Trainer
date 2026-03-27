package com.pawforward.mcp.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * HTTP client that wraps all calls to the main PawForward REST API.
 * Public endpoints need no auth; authenticated endpoints require a Bearer token.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PawForwardApiClient {

    private final WebClient pawForwardWebClient;

    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST_TYPE =
            new ParameterizedTypeReference<>() {};

    // ──────────────────────────────────────────────
    // Public endpoints (no auth required)
    // ──────────────────────────────────────────────

    public List<Map<String, Object>> listServices() {
        return getList("/services");
    }

    public Map<String, Object> getServiceDetails(String id) {
        return getMap("/services/" + id);
    }

    public List<Map<String, Object>> listPackages() {
        return getList("/payments/packages");
    }

    public List<Map<String, Object>> listTrainers() {
        return getList("/trainers");
    }

    public Map<String, Object> getTrainerProfile(String id) {
        return getMap("/trainers/" + id);
    }

    public List<Map<String, Object>> getAvailableSlots(String trainerId, String serviceTypeId,
                                                        String from, String to) {
        StringBuilder uri = new StringBuilder("/scheduling/available-slots?");
        if (trainerId != null && !trainerId.isBlank()) uri.append("trainerId=").append(trainerId).append("&");
        if (serviceTypeId != null && !serviceTypeId.isBlank()) uri.append("serviceTypeId=").append(serviceTypeId).append("&");
        if (from != null && !from.isBlank()) uri.append("from=").append(from).append("&");
        if (to != null && !to.isBlank()) uri.append("to=").append(to).append("&");
        String path = uri.toString();
        if (path.endsWith("&") || path.endsWith("?")) {
            path = path.substring(0, path.length() - 1);
        }
        return getList(path);
    }

    public List<Map<String, Object>> listUpcomingClasses() {
        return getList("/scheduling/class-series");
    }

    public Map<String, Object> getClassDetails(String id) {
        return getMap("/scheduling/class-series/" + id);
    }

    public List<Map<String, Object>> getApprovedReviews() {
        return getList("/reviews");
    }

    public Map<String, Object> submitInquiry(Map<String, Object> data) {
        return postMap("/contact", data, null);
    }

    // ──────────────────────────────────────────────
    // Authenticated endpoints (require JWT token)
    // ──────────────────────────────────────────────

    public Map<String, Object> createBooking(String token, Map<String, Object> data) {
        return postMap("/bookings", data, token);
    }

    public Map<String, Object> cancelBooking(String token, String bookingId, String reason) {
        Map<String, Object> body = reason != null ? Map.of("reason", reason) : Map.of();
        return postMap("/bookings/" + bookingId + "/cancel", body, token);
    }

    public List<Map<String, Object>> getClientBookings(String token) {
        return getListAuth("/bookings", token);
    }

    public Map<String, Object> enrollInClass(String token, Map<String, Object> data) {
        return postMap("/bookings/enrollments", data, token);
    }

    public Map<String, Object> getDogProfile(String token, String dogId) {
        return getMapAuth("/dogs/" + dogId, token);
    }

    public Map<String, Object> getDogProgress(String token, String dogId) {
        return getMapAuth("/training/progress/dog/" + dogId, token);
    }

    public List<Map<String, Object>> getTrainingLogs(String token, String dogId) {
        return getListAuth("/training/logs/dog/" + dogId, token);
    }

    // ──────────────────────────────────────────────
    // Internal HTTP helpers
    // ──────────────────────────────────────────────

    private List<Map<String, Object>> getList(String path) {
        try {
            return pawForwardWebClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(LIST_TYPE)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("GET {} failed: {} {}", path, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ApiCallException("GET " + path + " failed: " + e.getStatusCode(), e);
        }
    }

    private Map<String, Object> getMap(String path) {
        try {
            return pawForwardWebClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(MAP_TYPE)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("GET {} failed: {} {}", path, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ApiCallException("GET " + path + " failed: " + e.getStatusCode(), e);
        }
    }

    private List<Map<String, Object>> getListAuth(String path, String token) {
        try {
            return pawForwardWebClient.get()
                    .uri(path)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(LIST_TYPE)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("GET {} (auth) failed: {} {}", path, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ApiCallException("GET " + path + " failed: " + e.getStatusCode(), e);
        }
    }

    private Map<String, Object> getMapAuth(String path, String token) {
        try {
            return pawForwardWebClient.get()
                    .uri(path)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(MAP_TYPE)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("GET {} (auth) failed: {} {}", path, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ApiCallException("GET " + path + " failed: " + e.getStatusCode(), e);
        }
    }

    private Map<String, Object> postMap(String path, Map<String, Object> body, String token) {
        try {
            WebClient.RequestBodySpec spec = pawForwardWebClient.post().uri(path);
            if (token != null && !token.isBlank()) {
                spec = (WebClient.RequestBodySpec) spec.header("Authorization", "Bearer " + token);
            }
            return spec
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(MAP_TYPE)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("POST {} failed: {} {}", path, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ApiCallException("POST " + path + " failed: " + e.getStatusCode(), e);
        }
    }

    /**
     * Runtime exception for API call failures with status info.
     */
    public static class ApiCallException extends RuntimeException {
        public ApiCallException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
