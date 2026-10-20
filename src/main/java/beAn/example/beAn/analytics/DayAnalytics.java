package beAn.example.beAn.analytics;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DayAnalytics {

    @JsonProperty("dateKey")
    private String dateKey;
    private int totalClicks = 0;
    private Map<String, Integer> elements = new HashMap<>();
    private Map<String, Integer> sectionDwell = new HashMap<>();
    private Map<String, Integer> scrollReach = new HashMap<>();
    private Date updatedAt = new Date();

    public DayAnalytics() {
        initDefaultSections();
    }

    public DayAnalytics(String dateKey) {
        this.dateKey = dateKey;
        initDefaultSections();
    }

    private void initDefaultSections() {
        String[] sections = {"gioi-thieu", "ve-bean", "chuc-nang", "nguyen-ly", "thoi-su", "lien-he"};
        for (String s : sections) {
            sectionDwell.put(s, 0);
            scrollReach.put(s, 0);
        }
    }

    public String getDateKey() {
        return dateKey;
    }

    public void setDateKey(String dateKey) {
        this.dateKey = dateKey;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getTotalClicks() {
        return totalClicks;
    }

    public void setTotalClicks(int totalClicks) {
        this.totalClicks = totalClicks;
    }

    public Map<String, Integer> getElements() {
        return elements;
    }

    public void setElements(Map<String, Integer> elements) {
        this.elements = elements != null ? elements : new HashMap<>();
    }

    public Map<String, Integer> getSectionDwell() {
        return sectionDwell;
    }

    public void setSectionDwell(Map<String, Integer> sectionDwell) {
        this.sectionDwell = sectionDwell != null ? sectionDwell : new HashMap<>();
    }

    public Map<String, Integer> getScrollReach() {
        return scrollReach;
    }

    public void setScrollReach(Map<String, Integer> scrollReach) {
        this.scrollReach = scrollReach != null ? scrollReach : new HashMap<>();
    }

    public synchronized void recordClick(String trackId) {
        this.totalClicks++;
        this.updatedAt = new Date();
        if (trackId != null && !trackId.isBlank()) {
            this.elements.put(trackId, this.elements.getOrDefault(trackId, 0) + 1);
        }
    }

    public synchronized void recordDwell(String sectionId, int seconds) {
        if (sectionId != null && !sectionId.isBlank() && seconds > 0) {
            this.sectionDwell.put(sectionId, this.sectionDwell.getOrDefault(sectionId, 0) + seconds);
            this.updatedAt = new Date();
        }
    }

    public synchronized void recordScroll(String sectionId) {
        if (sectionId != null && !sectionId.isBlank()) {
            this.scrollReach.put(sectionId, this.scrollReach.getOrDefault(sectionId, 0) + 1);
            this.updatedAt = new Date();
        }
    }

    public synchronized void reset() {
        this.totalClicks = 0;
        this.elements.clear();
        this.updatedAt = new Date();
        initDefaultSections();
    }
}
