package beAn.example.beAn.analytics;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Service
public class AnalyticsService {

    private static final String STORAGE_FILE_PATH = "data/analytics_data.json";
    private final ConcurrentHashMap<String, DayAnalytics> analyticsData = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

    @PostConstruct
    public void init() {
        loadFromFile();
        ensureRecentDaysExist();
    }

    public Map<String, DayAnalytics> getAllData() {
        ensureRecentDaysExist();
        return Collections.unmodifiableMap(analyticsData);
    }

    public DayAnalytics getOrCreateDay(String dateKey) {
        if (dateKey == null || dateKey.isBlank()) {
            dateKey = getTodayKey();
        }
        return analyticsData.computeIfAbsent(dateKey, k -> {
            DayAnalytics day = new DayAnalytics();
            saveToFileAsync();
            return day;
        });
    }

    public void recordClick(String dateKey, String trackId) {
        String key = (dateKey != null && !dateKey.isBlank()) ? dateKey : getTodayKey();
        DayAnalytics day = getOrCreateDay(key);
        day.recordClick(trackId);
        saveToFileAsync();
    }

    public void recordDwell(String dateKey, String sectionId, int seconds) {
        String key = (dateKey != null && !dateKey.isBlank()) ? dateKey : getTodayKey();
        DayAnalytics day = getOrCreateDay(key);
        day.recordDwell(sectionId, seconds);
        saveToFileAsync();
    }

    public void recordScroll(String dateKey, String sectionId) {
        String key = (dateKey != null && !dateKey.isBlank()) ? dateKey : getTodayKey();
        DayAnalytics day = getOrCreateDay(key);
        day.recordScroll(sectionId);
        saveToFileAsync();
    }

    public void reset(String range) {
        if (range == null || range.isBlank() || "all".equalsIgnoreCase(range)) {
            for (DayAnalytics day : analyticsData.values()) {
                day.reset();
            }
        } else if ("today".equalsIgnoreCase(range)) {
            getOrCreateDay(getTodayKey()).reset();
        } else if ("yesterday".equalsIgnoreCase(range)) {
            getOrCreateDay(getPastDateKey(1)).reset();
        } else if ("last7days".equalsIgnoreCase(range)) {
            for (int i = 0; i < 7; i++) {
                getOrCreateDay(getPastDateKey(i)).reset();
            }
        } else {
            DayAnalytics day = analyticsData.get(range);
            if (day != null) {
                day.reset();
            }
        }
        saveToFile();
    }

    private void ensureRecentDaysExist() {
        for (int i = 0; i < 7; i++) {
            String key = getPastDateKey(i);
            analyticsData.computeIfAbsent(key, k -> new DayAnalytics());
        }
    }

    private String getTodayKey() {
        return LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private String getPastDateKey(int daysAgo) {
        return LocalDate.now().minusDays(daysAgo).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private void loadFromFile() {
        rwLock.readLock().lock();
        try {
            File file = new File(STORAGE_FILE_PATH);
            if (file.exists() && file.length() > 0) {
                Map<String, DayAnalytics> loaded = objectMapper.readValue(file, new TypeReference<Map<String, DayAnalytics>>() {});
                if (loaded != null) {
                    analyticsData.putAll(loaded);
                }
            }
        } catch (Exception e) {
            System.err.println("[AnalyticsService] Could not load from " + STORAGE_FILE_PATH + ": " + e.getMessage());
        } finally {
            rwLock.readLock().unlock();
        }
    }

    private void saveToFile() {
        rwLock.writeLock().lock();
        try {
            File file = new File(STORAGE_FILE_PATH);
            File parent = file.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            objectMapper.writeValue(file, analyticsData);
        } catch (IOException e) {
            System.err.println("[AnalyticsService] Could not save to " + STORAGE_FILE_PATH + ": " + e.getMessage());
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    private void saveToFileAsync() {
        new Thread(this::saveToFile).start();
    }
}
