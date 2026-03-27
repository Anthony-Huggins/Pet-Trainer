package com.pawforward.mcp.resources;

import com.pawforward.mcp.client.PawForwardApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Static and dynamic MCP resources providing business information, policies, and FAQs.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BusinessResources {

    private final PawForwardApiClient apiClient;

    /**
     * @return all available resource URIs with descriptions
     */
    public List<Map<String, String>> listResources() {
        return List.of(
                Map.of("uri", "pawforward://business/info", "description", "Company information, contact details, and hours"),
                Map.of("uri", "pawforward://business/policies", "description", "Business policies including cancellation, vaccination, and late arrival"),
                Map.of("uri", "pawforward://business/faq", "description", "Frequently asked questions"),
                Map.of("uri", "pawforward://services/catalog", "description", "Dynamic service catalog from the API")
        );
    }

    /**
     * Retrieve a resource by its URI.
     */
    public Object getResource(String uri) {
        return switch (uri) {
            case "pawforward://business/info", "business/info", "business-info" -> getBusinessInfo();
            case "pawforward://business/policies", "business/policies", "business-policies" -> getPolicies();
            case "pawforward://business/faq", "business/faq", "business-faq" -> getFaq();
            case "pawforward://services/catalog", "services/catalog", "services-catalog" -> getServiceCatalog();
            default -> Map.of("error", true, "message", "Unknown resource: " + uri);
        };
    }

    private Map<String, Object> getBusinessInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("companyName", "PawForward Academy");
        info.put("tagline", "Professional Dog Training for Every Stage of Life");
        info.put("description", "PawForward Academy offers professional dog training services "
                + "including private sessions, group classes, board-and-train programs, and behavioral consultations. "
                + "Our certified trainers use positive reinforcement methods tailored to each dog's needs.");
        info.put("contact", Map.of(
                "email", "info@pawforwardacademy.com",
                "phone", "(555) PAW-TRAIN",
                "address", "123 Training Lane, Suite 100, Dogville, CA 90210"
        ));
        info.put("hours", Map.of(
                "monday_friday", "7:00 AM - 7:00 PM",
                "saturday", "8:00 AM - 5:00 PM",
                "sunday", "9:00 AM - 3:00 PM"
        ));
        info.put("website", "https://pawforwardacademy.com");
        return info;
    }

    private Map<String, Object> getPolicies() {
        Map<String, Object> policies = new LinkedHashMap<>();
        policies.put("cancellation", Map.of(
                "notice", "24 hours",
                "details", "Cancellations made at least 24 hours in advance receive a full refund. "
                        + "Late cancellations (less than 24 hours) are charged 50% of the session fee. "
                        + "No-shows are charged the full session fee."
        ));
        policies.put("vaccination", Map.of(
                "required", List.of("Rabies (current)", "DHPP / Distemper (current)", "Bordetella (within 12 months)"),
                "details", "All dogs must have up-to-date vaccinations before attending any training session or class. "
                        + "Proof of vaccination from a licensed veterinarian must be provided at registration."
        ));
        policies.put("lateArrival", Map.of(
                "grace_period", "10 minutes",
                "details", "Clients arriving more than 10 minutes late may need to reschedule. "
                        + "Late arrivals for group classes will not be admitted to avoid disruption."
        ));
        policies.put("aggressionPolicy", "Dogs exhibiting aggressive behavior may be removed from group classes "
                + "for the safety of all participants. Private sessions or behavioral consultations will be recommended.");
        return policies;
    }

    private List<Map<String, String>> getFaq() {
        return List.of(
                Map.of("question", "What age can my puppy start training?",
                        "answer", "Puppies can begin training as early as 8 weeks old. We recommend starting with our Puppy Foundations class."),
                Map.of("question", "How long are training sessions?",
                        "answer", "Private sessions are typically 60 minutes. Group classes run 60 minutes per weekly session over a multi-week series."),
                Map.of("question", "What training methods do you use?",
                        "answer", "We use positive reinforcement and science-based training methods. No harsh corrections or aversive tools are used."),
                Map.of("question", "Can I attend group classes with a reactive dog?",
                        "answer", "We recommend starting with private sessions for reactive dogs. Once your trainer feels your dog is ready, they can transition to group classes."),
                Map.of("question", "What should I bring to my first session?",
                        "answer", "Bring your dog on a 6-foot leash, high-value treats, vaccination records, and a positive attitude!"),
                Map.of("question", "Do you offer board-and-train programs?",
                        "answer", "Yes! Our board-and-train programs range from 2 to 4 weeks. Your dog stays with a trainer and receives daily training sessions."),
                Map.of("question", "What is your refund policy?",
                        "answer", "Unused sessions in a package can be refunded within 90 days of purchase. Individual session refunds follow our cancellation policy.")
        );
    }

    private Object getServiceCatalog() {
        try {
            return apiClient.listServices();
        } catch (Exception e) {
            log.error("Failed to fetch service catalog from API", e);
            return Map.of("error", true, "message", "Service catalog is temporarily unavailable.");
        }
    }
}
