package beAn.example.beAn.analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/data")
    public ResponseEntity<Map<String, DayAnalytics>> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllData());
    }

    @PostMapping("/click")
    public ResponseEntity<Map<String, Object>> recordClick(@RequestBody Map<String, String> payload) {
        String dateKey = payload.get("date");
        String trackId = payload.get("trackId");
        if (trackId != null && !trackId.isBlank()) {
            analyticsService.recordClick(dateKey, trackId);
        }
        return ResponseEntity.ok(Map.of("status", "success", "event", "click"));
    }

    @PostMapping("/dwell")
    public ResponseEntity<Map<String, Object>> recordDwell(@RequestBody Map<String, Object> payload) {
        String dateKey = (String) payload.get("date");
        String sectionId = (String) payload.get("sectionId");
        int seconds = 0;
        if (payload.get("seconds") instanceof Number) {
            seconds = ((Number) payload.get("seconds")).intValue();
        }
        if (sectionId != null && !sectionId.isBlank() && seconds > 0) {
            analyticsService.recordDwell(dateKey, sectionId, seconds);
        }
        return ResponseEntity.ok(Map.of("status", "success", "event", "dwell"));
    }

    @PostMapping("/scroll")
    public ResponseEntity<Map<String, Object>> recordScroll(@RequestBody Map<String, String> payload) {
        String dateKey = payload.get("date");
        String sectionId = payload.get("sectionId");
        if (sectionId != null && !sectionId.isBlank()) {
            analyticsService.recordScroll(dateKey, sectionId);
        }
        return ResponseEntity.ok(Map.of("status", "success", "event", "scroll"));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetData(@RequestBody(required = false) Map<String, String> payload) {
        String range = payload != null ? payload.get("range") : "today";
        analyticsService.reset(range);
        return ResponseEntity.ok(Map.of("status", "success", "resetRange", range));
    }
}
