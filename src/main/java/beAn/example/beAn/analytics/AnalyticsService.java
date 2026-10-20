package beAn.example.beAn.analytics;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.ReplaceOptions;
import jakarta.annotation.PostConstruct;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Service
public class AnalyticsService {

    private static final String STORAGE_FILE_PATH = "data/analytics_data.json";
    private static final String COLLECTION_NAME = "analytics_days";

    private final ConcurrentHashMap<String, DayAnalytics> analyticsData = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

    @Autowired(required = false)
    private MongoClient mongoClient;

    @Value("${spring.data.mongodb.database:beandb}")
    private String databaseName;

    @PostConstruct
    public void init() {
        // 1. Fast instant initialization from file and memory so port 8080 binds immediately
        loadFromFile();
        ensureRecentDaysExist();

        // 2. Asynchronously sync with MongoDB in background without blocking web server startup
        new Thread(this::syncWithMongoAsync).start();
    }

    public Map<String, DayAnalytics> getAllData() {
        ensureRecentDaysExist();
        return Collections.unmodifiableMap(analyticsData);
    }

    public DayAnalytics getOrCreateDay(String dateKey) {
        if (dateKey == null || dateKey.isBlank()) {
            dateKey = getTodayKey();
        }
        final String finalKey = dateKey;
        return analyticsData.computeIfAbsent(finalKey, k -> {
            DayAnalytics day = new DayAnalytics(finalKey);
            saveDayAsync(day);
            return day;
        });
    }

    public void recordClick(String dateKey, String trackId) {
        String key = (dateKey != null && !dateKey.isBlank()) ? dateKey : getTodayKey();
        DayAnalytics day = getOrCreateDay(key);
        day.recordClick(trackId);
        saveDayAsync(day);
    }

    public void recordDwell(String dateKey, String sectionId, int seconds) {
        String key = (dateKey != null && !dateKey.isBlank()) ? dateKey : getTodayKey();
        DayAnalytics day = getOrCreateDay(key);
        day.recordDwell(sectionId, seconds);
        saveDayAsync(day);
    }

    public void recordScroll(String dateKey, String sectionId) {
        String key = (dateKey != null && !dateKey.isBlank()) ? dateKey : getTodayKey();
        DayAnalytics day = getOrCreateDay(key);
        day.recordScroll(sectionId);
        saveDayAsync(day);
    }

    public void reset(String range) {
        if (range == null || range.isBlank() || "all".equalsIgnoreCase(range)) {
            for (DayAnalytics day : analyticsData.values()) {
                day.reset();
                saveDayDirect(day);
            }
        } else if ("today".equalsIgnoreCase(range)) {
            DayAnalytics day = getOrCreateDay(getTodayKey());
            day.reset();
            saveDayDirect(day);
        } else if ("yesterday".equalsIgnoreCase(range)) {
            DayAnalytics day = getOrCreateDay(getPastDateKey(1));
            day.reset();
            saveDayDirect(day);
        } else if ("last7days".equalsIgnoreCase(range)) {
            for (int i = 0; i < 7; i++) {
                DayAnalytics day = getOrCreateDay(getPastDateKey(i));
                day.reset();
                saveDayDirect(day);
            }
        } else {
            DayAnalytics day = analyticsData.get(range);
            if (day != null) {
                day.reset();
                saveDayDirect(day);
            }
        }
        saveToFile();
    }

    private void ensureRecentDaysExist() {
        for (int i = 0; i < 7; i++) {
            String key = getPastDateKey(i);
            analyticsData.computeIfAbsent(key, DayAnalytics::new);
        }
    }

    private String getTodayKey() {
        return LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private String getPastDateKey(int daysAgo) {
        return LocalDate.now().minusDays(daysAgo).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private MongoCollection<Document> getCollection() {
        if (mongoClient == null) {
            return null;
        }
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName != null && !databaseName.isBlank() ? databaseName : "beandb");
            return database.getCollection(COLLECTION_NAME);
        } catch (Exception e) {
            System.err.println("[AnalyticsService] MongoDB getCollection error: " + e.getMessage());
            return null;
        }
    }

    private void syncWithMongoAsync() {
        MongoCollection<Document> col = getCollection();
        if (col == null) {
            return;
        }
        try {
            int count = 0;
            try (MongoCursor<Document> cursor = col.find().iterator()) {
                while (cursor.hasNext()) {
                    Document doc = cursor.next();
                    DayAnalytics day = parseDocumentToDay(doc);
                    if (day != null && day.getDateKey() != null) {
                        analyticsData.put(day.getDateKey(), day);
                        count++;
                    }
                }
            }
            if (count > 0) {
                System.out.println("[AnalyticsService] Successfully loaded " + count + " daily records from MongoDB Atlas.");
            } else if (!analyticsData.isEmpty()) {
                // If MongoDB Atlas is newly created and empty, migrate local data into MongoDB Atlas
                for (DayAnalytics day : analyticsData.values()) {
                    saveDayDirect(day);
                }
                System.out.println("[AnalyticsService] Seeded MongoDB Atlas with " + analyticsData.size() + " records.");
            }
        } catch (Exception e) {
            System.err.println("[AnalyticsService] MongoDB async sync error: " + e.getMessage());
        }
    }

    private DayAnalytics parseDocumentToDay(Document doc) {
        try {
            String json = doc.toJson();
            DayAnalytics day = objectMapper.readValue(json, DayAnalytics.class);
            if (day.getDateKey() == null) {
                day.setDateKey(doc.getString("_id"));
            }
            return day;
        } catch (Exception e) {
            System.err.println("[AnalyticsService] Could not parse document: " + e.getMessage());
            return null;
        }
    }

    private void saveDayDirect(DayAnalytics day) {
        if (day == null || day.getDateKey() == null) return;
        day.setUpdatedAt(new Date());

        MongoCollection<Document> col = getCollection();
        if (col != null) {
            try {
                String json = objectMapper.writeValueAsString(day);
                Document doc = Document.parse(json);
                doc.put("_id", day.getDateKey());
                col.replaceOne(Filters.eq("_id", day.getDateKey()), doc, new ReplaceOptions().upsert(true));
            } catch (Exception e) {
                System.err.println("[AnalyticsService] MongoDB save error: " + e.getMessage());
            }
        }
    }

    private void saveDayAsync(DayAnalytics day) {
        if (day == null) return;
        new Thread(() -> {
            saveDayDirect(day);
            saveToFile();
        }).start();
    }

    private void loadFromFile() {
        rwLock.readLock().lock();
        try {
            File file = new File(STORAGE_FILE_PATH);
            if (file.exists() && file.length() > 0) {
                Map<String, DayAnalytics> loaded = objectMapper.readValue(file, new TypeReference<Map<String, DayAnalytics>>() {});
                if (loaded != null) {
                    for (Map.Entry<String, DayAnalytics> entry : loaded.entrySet()) {
                        DayAnalytics day = entry.getValue();
                        if (day.getDateKey() == null) {
                            day.setDateKey(entry.getKey());
                        }
                        analyticsData.put(entry.getKey(), day);
                    }
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
}
