/**
 * beAn - Safe Kids, Smart Car | Core Web Application Logic
 * Features:
 *  1. Click Heatmap & Interest Tracking ("Xem vùng click / Kiểm soát sự quan tâm")
 *  2. Interactive 2-in-1 Simulator (Safety Mode vs Utility Mode)
 *  3. Social Follow & Engagement (Facebook & TikTok interactivity)
 *  4. Analytics Dashboard Modal & Data Export
 *  5. Contact Form Validation & Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {

  // ===================================================================
  // 1. MULTI-DAY ANALYTICS & DWELL TIME ENGINE ("KIỂM SOÁT SỰ QUAN TÂM THEO NGÀY")
  // ===================================================================
  
  const STORAGE_KEY = 'bean_admin_analytics_v3';
  const SESSION_ADMIN_KEY = 'bean_admin_auth_v1';

  // Helper to format Date -> YYYY-MM-DD
  function formatDateKey(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayKey() {
    return formatDateKey(new Date());
  }

  function getPastDateKey(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return formatDateKey(d);
  }

  // 6 Main Sections Tracked for Reading & Dwell Time
  const TRACKED_SECTIONS = [
    { 
      id: 'gioi-thieu', 
      title: 'Khu Vực Đầu Trang & Tổng Quan beAn', 
      desc: 'Thông điệp bảo vệ trẻ em, Slider mô phỏng và HUD trạng thái' 
    },
    { 
      id: 've-bean', 
      title: 'Câu Chuyện & Ý Tưởng Sáng Lập beAn', 
      desc: 'Ý nghĩa dự án, trăn trở sốc nhiệt trẻ em và sứ mệnh' 
    },
    { 
      id: 'chuc-nang', 
      title: 'Chức Năng An Toàn & Tiện Ích Hành Trình', 
      desc: 'Chế độ an toàn chống sốc nhiệt vs Chế độ tiện ích lái xe' 
    },
    { 
      id: 'nguyen-ly', 
      title: 'Nguyên Lý Hoạt Động & Phần Cứng Radar mmWave', 
      desc: 'Cảm biến vi chuyển động 24GHz, ESP32 và kiến trúc Flutter Cloud' 
    },
    { 
      id: 'thoi-su', 
      title: 'Tin Tức & Tính Pháp Lý Xe Học Sinh 2025', 
      desc: 'Luật Trật tự ATGT đường bộ 2024 (hiệu lực 2025) và các vụ việc thực tế' 
    },
    { 
      id: 'lien-he', 
      title: 'Đăng Ký Tư Vấn & Kết Nối Đội Ngũ', 
      desc: 'Biểu mẫu liên hệ, mạng xã hội TikTok / Fanpage và địa chỉ FPTU' 
    }
  ];

  // Comprehensive Friendly Names and Sections for All Tracked Elements
  const ELEMENT_INFO_MAP = {
    // 1. Thanh Header & Menu
    'nav-logo': { name: 'Logo beAn (Về Đầu Trang)', section: 'Thanh Header' },
    'nav-gioi-thieu': { name: 'Mục Menu: Giới Thiệu beAn', section: 'Thanh Header' },
    'nav-ve-bean': { name: 'Mục Menu: Về Dự Án beAn', section: 'Thanh Header' },
    'nav-chuc-nang': { name: 'Mục Menu: Chức Năng', section: 'Thanh Header' },
    'nav-nguyen-ly': { name: 'Mục Menu: Nguyên Lý & Radar', section: 'Thanh Header' },
    'nav-thoi-su': { name: 'Mục Menu: Thời Sự 2025', section: 'Thanh Header' },
    'nav-lien-he': { name: 'Mục Menu: Đăng Ký Tư Vấn', section: 'Thanh Header' },
    'btn-nav-order': { name: 'Nút: Liên Hệ Tư Vấn', section: 'Thanh Header' },
    'nav-admin-login': { name: 'Nút: Đăng Nhập Quản Trị', section: 'Thanh Header' },
    'btn-admin-nav': { name: 'Nút: Đăng Nhập Quản Trị Hệ Thống', section: 'Thanh Header' },
    'nav-mobile-toggle': { name: 'Nút: Menu Di Động', section: 'Thanh Header' },

    // 2. Khu Vực Đầu Trang (Hero Banner)
    'section-hero': { name: 'Khu Vực Đầu Trang', section: 'Đầu Trang (Hero)' },
    'hero-pill-badge': { name: 'Huy Hiệu: Đột Phá 2025', section: 'Đầu Trang (Hero)' },
    'hero-btn-order': { name: 'Nút: Đặt Trước Ngay', section: 'Đầu Trang (Hero)' },
    'hero-btn-demo': { name: 'Nút: Trải Nghiệm Demo 2-in-1', section: 'Đầu Trang (Hero)' },
    'trust-badge-radar': { name: 'Huy Hiệu: Radar mmWave 24GHz', section: 'Đầu Trang (Hero)' },
    'trust-badge-air': { name: 'Huy Hiệu: Cảm Biến Khí BME680', section: 'Đầu Trang (Hero)' },
    'trust-badge-cloud': { name: 'Huy Hiệu: Flutter & Firebase', section: 'Đầu Trang (Hero)' },
    'hero-visual-container': { name: 'Khung Slider Mascot & Ô Tô', section: 'Đầu Trang (Hero)' },
    'hero-slider-prev': { name: 'Nút Slider: Xem Ảnh Trước', section: 'Đầu Trang (Hero)' },
    'hero-slider-next': { name: 'Nút Slider: Xem Ảnh Sau', section: 'Đầu Trang (Hero)' },

    // 3. Khu Vực Câu Chuyện & Ý Tưởng Về beAn
    'section-about': { name: 'Khu Vực Về beAn', section: 'Về Dự Án beAn' },
    'badge-about': { name: 'Huy Hiệu: Về Dự Án beAn', section: 'Về Dự Án beAn' },
    'about-card-story': { name: 'Thẻ: Câu Chuyện Khởi Nguồn', section: 'Về Dự Án beAn' },
    'about-card-mascot': { name: 'Thẻ: Ý Nghĩa Mascot beAn', section: 'Về Dự Án beAn' },
    'attr-halo': { name: 'Vòng Thiên Thần Phát Sáng', section: 'Về Dự Án beAn' },
    'attr-face': { name: 'Màn Hình Biểu Cảm Thân Thiện', section: 'Về Dự Án beAn' },
    'attr-wings': { name: 'Đôi Cánh Bảo Hộ Thiên Thần', section: 'Về Dự Án beAn' },
    'attr-aroma': { name: 'Khe Tỏa Tinh Dầu Thơm Xe', section: 'Về Dự Án beAn' },
    'pillar-card-1': { name: 'Trụ Cột: Thiết Kế Cảm Xúc', section: 'Về Dự Án beAn' },
    'pillar-card-2': { name: 'Trụ Cột: Đa Dụng 2-trong-1', section: 'Về Dự Án beAn' },
    'pillar-card-3': { name: 'Trụ Cột: Chi Phí Hợp Lý', section: 'Về Dự Án beAn' },

    // 4. Khu Vực Chức Năng beAn (Features & Simulator)
    'section-features': { name: 'Khu Vực Chức Năng', section: 'Chức Năng & Tiện Ích' },
    'badge-features': { name: 'Huy Hiệu: Tính Năng Đột Phá', section: 'Chức Năng & Tiện Ích' },
    'feature-card-safety': { name: 'Thẻ: Chế Độ An Toàn Tránh Sốc Nhiệt', section: 'Chức Năng & Tiện Ích' },
    'feature-card-utility': { name: 'Thẻ: Chế Độ Tiện Ích Xe Đang Chạy', section: 'Chức Năng & Tiện Ích' },
    'interactive-simulator-box': { name: 'Bảng Mô Phỏng 2-in-1', section: 'Chức Năng & Tiện Ích' },
    'sim-engine-on': { name: 'Mô Phỏng: Xe Đang Chạy (Acc On)', section: 'Chức Năng & Tiện Ích' },
    'sim-engine-off': { name: 'Mô Phỏng: Xe Đã Tắt Máy (Acc Off)', section: 'Chức Năng & Tiện Ích' },
    'sim-child-absent': { name: 'Mô Phỏng: Xe Trống (Không Có Bé)', section: 'Chức Năng & Tiện Ích' },
    'sim-child-present': { name: 'Mô Phỏng: Phát Hiện Có Bé Trên Xe', section: 'Chức Năng & Tiện Ích' },
    'sim-slider-temp': { name: 'Mô Phỏng: Kéo Nhiệt Độ Cabin', section: 'Chức Năng & Tiện Ích' },
    'sim-output-box': { name: 'Màn Hình: Kết Quả Mô Phỏng', section: 'Chức Năng & Tiện Ích' },

    // 5. Khu Vực Nguyên Lý & Phần Cứng
    'section-tech': { name: 'Khu Vực Nguyên Lý Hoạt Động', section: 'Nguyên Lý & Phần Cứng' },
    'badge-tech': { name: 'Huy Hiệu: Công Nghệ Tiên Phong', section: 'Nguyên Lý & Phần Cứng' },
    'step-card-1': { name: 'Bước 1: Nhận Diện Vi Chuyển Động', section: 'Nguyên Lý & Phần Cứng' },
    'step-card-2': { name: 'Bước 2: Xử Lý AI Lọc Nhiễu', section: 'Nguyên Lý & Phần Cứng' },
    'step-card-3': { name: 'Bước 3: Báo Động Âm Thanh Kép', section: 'Nguyên Lý & Phần Cứng' },
    'step-card-4': { name: 'Bước 4: Bắn Cảnh Báo Khẩn & GPS', section: 'Nguyên Lý & Phần Cứng' },
    'tech-hardware-card': { name: 'Khung: Linh Kiện Phần Cứng beAn', section: 'Nguyên Lý & Phần Cứng' },
    'comp-esp32': { name: 'Linh Kiện: Vi Điều Khiển ESP32', section: 'Nguyên Lý & Phần Cứng' },
    'comp-radar': { name: 'Linh Kiện: Radar mmWave 24GHz', section: 'Nguyên Lý & Phần Cứng' },
    'comp-bme680': { name: 'Linh Kiện: Cảm Biến Khí BME680', section: 'Nguyên Lý & Phần Cứng' },
    'comp-oled': { name: 'Linh Kiện: Màn Hình Biểu Cảm OLED', section: 'Nguyên Lý & Phần Cứng' },
    'hw-slider-prev': { name: 'Nút Slider Linh Kiện: Xem Trước', section: 'Nguyên Lý & Phần Cứng' },
    'hw-slider-next': { name: 'Nút Slider Linh Kiện: Xem Kế', section: 'Nguyên Lý & Phần Cứng' },
    'tech-app-card': { name: 'Khung: Kiến Trúc Ứng Dụng Flutter', section: 'Nguyên Lý & Phần Cứng' },
    'comp-flutter': { name: 'App: Giao Diện Flutter Trực Quan', section: 'Nguyên Lý & Phần Cứng' },
    'comp-firebase': { name: 'App: Đồng Bộ Đám Mây Firebase', section: 'Nguyên Lý & Phần Cứng' },
    'comp-alert': { name: 'App: Báo Động Khẩn Bỏ Qua Im Lặng', section: 'Nguyên Lý & Phần Cứng' },
    'comp-remote': { name: 'App: Điều Khiển Mùi Hương Từ Xa', section: 'Nguyên Lý & Phần Cứng' },
    'img-mobile-alert': { name: 'Ảnh: Màn Hình Báo Động Điện Thoại', section: 'Nguyên Lý & Phần Cứng' },
    'comparison-table-wrapper': { name: 'Bảng So Sánh Giải Pháp beAn', section: 'Nguyên Lý & Phần Cứng' },
    'comparison-table': { name: 'Bảng Đối Soát Thị Trường', section: 'Nguyên Lý & Phần Cứng' },

    // 6. Khu Vực Thời Sự & Pháp Lý
    'section-news': { name: 'Khu Vực Thời Sự & Pháp Lý', section: 'Tin Tức & Pháp Lý 2025' },
    'badge-news': { name: 'Huy Hiệu: Cập Nhật Thời Sự', section: 'Tin Tức & Pháp Lý 2025' },
    'news-card-law': { name: 'Tin Tức: Luật ATGT Đường Bộ 2025', section: 'Tin Tức & Pháp Lý 2025' },
    'link-thuvienphapluat': { name: 'Liên Kết: Thư Viện Pháp Luật', section: 'Tin Tức & Pháp Lý 2025' },
    'news-card-incident1': { name: 'Tin Tức: Vấn Nạn Trẻ Bị Bỏ Quên', section: 'Tin Tức & Pháp Lý 2025' },
    'link-read-incident-article': { name: 'Nút: Đọc Bài Viết Cảnh Tỉnh', section: 'Tin Tức & Pháp Lý 2025' },
    'news-card-health-risk': { name: 'Tin Tức: Hiểm Họa Sốc Nhiệt Ô Tô', section: 'Tin Tức & Pháp Lý 2025' },
    'link-vnexpress-heatstroke': { name: 'Liên Kết Báo Chí: Báo VnExpress', section: 'Tin Tức & Pháp Lý 2025' },

    // 7. Khu Vực Đăng Ký Tư Vấn & Mạng Xã Hội
    'section-contact': { name: 'Khu Vực Liên Hệ & Tư Vấn', section: 'Đăng Ký Tư Vấn' },
    'badge-contact': { name: 'Huy Hiệu: Kết Nối Với beAn', section: 'Đăng Ký Tư Vấn' },
    'social-card-fb': { name: 'Thẻ: Fanpage Facebook beAn', section: 'Đăng Ký Tư Vấn' },
    'btn-fb-visit': { name: 'Nút: Ghé Thăm Fanpage Facebook', section: 'Đăng Ký Tư Vấn' },
    'btn-fb-follow': { name: 'Nút: Like & Follow Fanpage', section: 'Đăng Ký Tư Vấn' },
    'social-card-tiktok': { name: 'Thẻ: Kênh TikTok @bean.safekids', section: 'Đăng Ký Tư Vấn' },
    'btn-preview-tiktok': { name: 'Nút: Xem Video Mascot TikTok', section: 'Đăng Ký Tư Vấn' },
    'btn-tiktok-follow': { name: 'Nút: Follow & Thả Tim TikTok', section: 'Đăng Ký Tư Vấn' },
    'btn-submit-contact': { name: 'Nút: Gửi Đăng Ký Tư Vấn', section: 'Đăng Ký Tư Vấn' },
    'project-info-card': { name: 'Thẻ: Đội Ngũ Khởi Nghiệp FPTU', section: 'Đăng Ký Tư Vấn' },

    // 8. Chân Trang & Hộp Thoại
    'site-footer': { name: 'Chân Trang Trang Web', section: 'Chân Trang' },
    'modal-tiktok-overlay': { name: 'Cửa Sổ: Kênh TikTok Mascot', section: 'Cửa Sổ Nổi' },
    'modal-tiktok-dialog': { name: 'Hộp Thoại Video TikTok', section: 'Cửa Sổ Nổi' },
    'modal-close-tiktok': { name: 'Nút Đóng Video TikTok', section: 'Cửa Sổ Nổi' },
    'modal-article-incident': { name: 'Cửa Sổ: Bài Báo Vấn Nạn Bỏ Quên', section: 'Cửa Sổ Nổi' },
    'general-page-click': { name: 'Vùng Nội Dung Trang Chủ', section: 'Toàn Trang Web' }
  };

  // Helper to get friendly element name and its page section
  function getElementPageInfo(elKey) {
    if (ELEMENT_INFO_MAP[elKey]) {
      return ELEMENT_INFO_MAP[elKey];
    }
    // Smart fallback if any unknown key appears - NEVER show raw attr- or codes
    let clean = (elKey || '')
      .replace(/^attr-/, 'Chi Tiết: ')
      .replace(/^btn-/, 'Nút: ')
      .replace(/^comp-/, 'Linh Kiện: ')
      .replace(/^sim-/, 'Mô Phỏng: ')
      .replace(/^section-/, 'Khu Vực: ')
      .replace(/^card-/, 'Thẻ: ')
      .replace(/^link-/, 'Liên Kết: ')
      .replace(/-/g, ' ');
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    return {
      name: clean || 'Vùng Trang Chủ',
      section: 'Trang Chủ beAn'
    };
  }

  // Compatibility proxy for any legacy lookups
  const FRIENDLY_ELEMENT_NAMES = new Proxy({}, {
    get: (target, prop) => getElementPageInfo(prop).name
  });

  // Create an honest empty day record with 0 counts
  function createEmptyDayRecord() {
    return {
      totalClicks: 0,
      elements: {},
      sectionDwell: { 'gioi-thieu': 0, 've-bean': 0, 'chuc-nang': 0, 'nguyen-ly': 0, 'thoi-su': 0, 'lien-he': 0 },
      scrollReach: { 'gioi-thieu': 0, 've-bean': 0, 'chuc-nang': 0, 'nguyen-ly': 0, 'thoi-su': 0, 'lien-he': 0 }
    };
  }

  function loadMultiDayAnalytics() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = getTodayKey();
        if (!parsed[today]) {
          parsed[today] = createEmptyDayRecord();
          saveMultiDayAnalytics(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    const cleanData = {};
    for (let i = 0; i < 7; i++) {
      cleanData[getPastDateKey(i)] = createEmptyDayRecord();
    }
    saveMultiDayAnalytics(cleanData);
    return cleanData;
  }

  function saveMultiDayAnalytics(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  // Spring Boot Backend REST API Integration
  const API_BASE = window.location.origin.includes(':3000') || window.location.origin.includes(':5173') || window.location.protocol === 'file:'
    ? 'http://localhost:8080/api/analytics'
    : '/api/analytics';

  async function syncAnalyticsFromBackend() {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
          // Merge server data with local cache (preserve higher counts and never wipe out data)
          const merged = { ...multiDayAnalytics };
          for (const [date, sDay] of Object.entries(serverData)) {
            if (!merged[date]) {
              merged[date] = sDay;
            } else {
              const lDay = merged[date];
              merged[date] = {
                dateKey: date,
                totalClicks: Math.max(lDay.totalClicks || 0, sDay.totalClicks || 0),
                elements: { ...(lDay.elements || {}) },
                sectionDwell: { ...(lDay.sectionDwell || {}) },
                scrollReach: { ...(lDay.scrollReach || {}) }
              };
              for (const [k, v] of Object.entries(sDay.elements || {})) {
                merged[date].elements[k] = Math.max(merged[date].elements[k] || 0, v || 0);
              }
              for (const [k, v] of Object.entries(sDay.sectionDwell || {})) {
                merged[date].sectionDwell[k] = Math.max(merged[date].sectionDwell[k] || 0, v || 0);
              }
              for (const [k, v] of Object.entries(sDay.scrollReach || {})) {
                merged[date].scrollReach[k] = Math.max(merged[date].scrollReach[k] || 0, v || 0);
              }
            }
          }
          multiDayAnalytics = merged;
          saveMultiDayAnalytics(merged);
          updateMetricUI();
          const adminDash = document.getElementById('adminDashboardModal');
          if (adminDash && adminDash.classList.contains('active') && typeof renderAdminDashboard === 'function') {
            renderAdminDashboard(currentDateRange);
          }
        }
      }
    } catch (e) {
      // Backend not running: seamlessly fallback to local cache
    }
  }

  function sendBackendClick(trackId) {
    try {
      const payload = JSON.stringify({ date: getTodayKey(), trackId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${API_BASE}/click`, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(`${API_BASE}/click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {}
  }

  function sendBackendDwell(sectionId, seconds) {
    try {
      const payload = JSON.stringify({ date: getTodayKey(), sectionId, seconds });
      fetch(`${API_BASE}/dwell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    } catch (e) {}
  }

  function sendBackendScroll(sectionId) {
    try {
      const payload = JSON.stringify({ date: getTodayKey(), sectionId });
      fetch(`${API_BASE}/scroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    } catch (e) {}
  }

  function sendBackendReset(range) {
    try {
      fetch(`${API_BASE}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ range })
      }).catch(() => {});
    } catch (e) {}
  }

  // Initial sync from Spring Boot Backend
  syncAnalyticsFromBackend();

  let multiDayAnalytics = loadMultiDayAnalytics();
  let isHeatmapActive = false;
  let activeViewingSection = 'gioi-thieu';

  // Ensure today record exists
  function getTodayData() {
    const today = getTodayKey();
    if (!multiDayAnalytics[today]) {
      multiDayAnalytics[today] = createEmptyDayRecord();
      saveMultiDayAnalytics(multiDayAnalytics);
    }
    return multiDayAnalytics[today];
  }

  // Update UI Metric Counters
  function updateMetricUI() {
    const todayData = getTodayData();
    const totalEl = document.getElementById('metricTotalClicks');
    const orderEl = document.getElementById('metricOrderClicks');
    const socialEl = document.getElementById('metricSocialClicks');
    const topFeatureEl = document.getElementById('metricTopFeature');
    const globalBadge = document.getElementById('globalClickCount');
    const dockBadge = document.getElementById('dockClickTotal');

    if (totalEl) totalEl.textContent = todayData.totalClicks.toLocaleString();
    if (globalBadge) globalBadge.textContent = todayData.totalClicks.toLocaleString();
    if (dockBadge) dockBadge.textContent = todayData.totalClicks.toLocaleString();

    // Order clicks
    const orderCount = (todayData.elements['hero-btn-order'] || 0) + 
                       (todayData.elements['btn-nav-order'] || 0) + 
                       (todayData.elements['btn-submit-contact'] || 0);
    if (orderEl) orderEl.textContent = orderCount.toLocaleString();

    // Social clicks
    const socialCount = (todayData.elements['btn-fb-follow'] || 0) + 
                        (todayData.elements['btn-tiktok-follow'] || 0) + 
                        (todayData.elements['btn-preview-tiktok'] || 0) +
                        (todayData.elements['btn-fb-visit'] || 0);
    if (socialEl) socialEl.textContent = socialCount.toLocaleString();

    // Top feature
    if (todayData.totalClicks === 0) {
      if (topFeatureEl) topFeatureEl.textContent = 'Chưa có';
    } else {
      const safetyCount = (todayData.elements['feature-card-safety'] || 0) + (todayData.elements['sim-engine-off'] || 0);
      const utilityCount = (todayData.elements['feature-card-utility'] || 0);
      const orderInterest = (todayData.elements['hero-btn-order'] || 0);

      let topName = 'Chưa có';
      if (safetyCount >= utilityCount && safetyCount >= orderInterest && safetyCount > 0) {
        topName = 'Chống Bỏ Quên Trẻ (Safety)';
      } else if (utilityCount >= safetyCount && utilityCount >= orderInterest && utilityCount > 0) {
        topName = 'Đo Khí Tươi & Decor';
      } else if (orderInterest > 0) {
        topName = 'Đặt Mua Trải Nghiệm';
      }
      if (topFeatureEl) topFeatureEl.textContent = topName;
    }

    // Render badges if heatmap is active
    if (isHeatmapActive) {
      renderHeatmapBadges();
    }
  }

  // Record a click on a tracked element
  function recordClick(trackId, clientX, clientY) {
    const todayData = getTodayData();
    todayData.totalClicks += 1;
    if (!todayData.elements[trackId]) {
      todayData.elements[trackId] = 0;
    }
    todayData.elements[trackId] += 1;

    saveMultiDayAnalytics(multiDayAnalytics);
    sendBackendClick(trackId);
    updateMetricUI();

    // If heatmap active, show click ripple beacon
    if (isHeatmapActive && clientX && clientY) {
      spawnHeatBeacon(clientX, clientY);
    }
  }

  // Visual Heat Beacon Ripple
  function spawnHeatBeacon(x, y) {
    const beacon = document.createElement('div');
    beacon.className = 'click-heat-beacon';
    beacon.style.left = `${x + window.scrollX}px`;
    beacon.style.top = `${y + window.scrollY}px`;
    document.body.appendChild(beacon);
    setTimeout(() => beacon.remove(), 1200);
  }

  // Render Heatmap Badges on all tracked elements
  function renderHeatmapBadges() {
    document.querySelectorAll('.heatmap-indicator-badge').forEach(b => b.remove());

    const todayData = getTodayData();
    const total = todayData.totalClicks || 1;
    const trackedElements = document.querySelectorAll('[data-track-id]');

    trackedElements.forEach(el => {
      const trackId = el.getAttribute('data-track-id');
      const count = todayData.elements[trackId] || 0;
      const pct = Math.round((count / total) * 100);

      if (count > 0 || el.tagName === 'BUTTON' || el.tagName === 'A') {
        const badge = document.createElement('div');
        badge.className = 'heatmap-indicator-badge';
        badge.innerHTML = `<i class="fa-solid fa-fire"></i> ${count} click (${pct}%)`;
        
        if (pct >= 15) {
          badge.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else if (pct >= 8) {
          badge.style.background = 'linear-gradient(135deg, #f59e0b, #ea580c)';
        } else {
          badge.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        }

        el.style.position = 'relative';
        el.appendChild(badge);
      }
    });
  }

  // Toggle Heatmap Mode
  function toggleHeatmap(forceState) {
    if (typeof forceState === 'boolean') {
      isHeatmapActive = forceState;
    } else {
      isHeatmapActive = !isHeatmapActive;
    }

    document.body.classList.toggle('heatmap-active', isHeatmapActive);

    const btnNav = document.getElementById('btnToggleHeatmap');
    const floatingDock = document.getElementById('floatingHeatmapDock');
    const dockBadge = document.getElementById('dockClickTotal');

    if (btnNav) btnNav.classList.toggle('active', isHeatmapActive);
    if (floatingDock) {
      floatingDock.style.display = isHeatmapActive ? 'block' : 'none';
      if (dockBadge) dockBadge.textContent = getTodayData().totalClicks.toLocaleString();
    }

    if (isHeatmapActive) {
      renderHeatmapBadges();
      showToast('🔥 Đã BẬT Chế Độ Xem Vùng Click! Di chuột & click bất kỳ đâu để kiểm soát sự quan tâm.');
    } else {
      document.querySelectorAll('.heatmap-indicator-badge').forEach(b => b.remove());
      showToast('Đã TẮT chế độ Heatmap.');
    }
  }

  // Keyboard shortcut: Ctrl + Shift + A to toggle heatmap mode
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      toggleHeatmap();
    }
  });
  window.toggleHeatmap = toggleHeatmap;

  // Global click tracker delegator: ONLY track on main homepage content, NEVER in Admin Dashboard
  document.addEventListener('click', (e) => {
    // 1. Never track clicks inside Admin Dashboard, Admin Login Modal, or while overlay is open
    if (e.target.closest('#adminDashboardModal') || 
        e.target.closest('#adminLoginModal') || 
        e.target.closest('.admin-fullscreen-overlay') || 
        e.target.closest('.floating-heatmap-dock')) {
      return;
    }

    // 2. Never track if Admin Dashboard or Login Modal is currently open
    const adminDash = document.getElementById('adminDashboardModal');
    const adminLogin = document.getElementById('adminLoginModal');
    if ((adminDash && adminDash.classList.contains('active')) || 
        (adminLogin && adminLogin.classList.contains('active'))) {
      return;
    }

    // 3. Track homepage content elements
    const trackedEl = e.target.closest('[data-track-id]');
    if (trackedEl) {
      const trackId = trackedEl.getAttribute('data-track-id');
      recordClick(trackId, e.clientX, e.clientY);
    } else if (isHeatmapActive) {
      recordClick('general-page-click', e.clientX, e.clientY);
    }
  });

  // ===================================================================
  // 1B. DWELL TIME OBSERVER (TỰ ĐỘNG ĐO THỜI LƯỢNG ĐỌC TỪNG KHU VỰC)
  // ===================================================================
  const sectionElements = TRACKED_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);

  if ('IntersectionObserver' in window && sectionElements.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      // Pause observer while admin modal is active
      const adminDash = document.getElementById('adminDashboardModal');
      if (adminDash && adminDash.classList.contains('active')) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          const secId = entry.target.id;
          activeViewingSection = secId;

          // Record reach
          const todayData = getTodayData();
          if (!todayData.scrollReach) todayData.scrollReach = {};
          todayData.scrollReach[secId] = (todayData.scrollReach[secId] || 0) + 1;
          sendBackendScroll(secId);
        }
      });
    }, { threshold: [0.25, 0.5] });

    sectionElements.forEach(el => sectionObserver.observe(el));
  }

  // Periodic Timer: Increment dwell seconds for the currently active viewing section
  let dwellTickCount = 0;
  setInterval(() => {
    // Pause dwell timer while admin dashboard is open
    const adminDash = document.getElementById('adminDashboardModal');
    if (adminDash && adminDash.classList.contains('active')) {
      return;
    }

    if (!document.hidden && activeViewingSection) {
      const todayData = getTodayData();
      if (!todayData.sectionDwell) todayData.sectionDwell = {};
      todayData.sectionDwell[activeViewingSection] = (todayData.sectionDwell[activeViewingSection] || 0) + 1;

      dwellTickCount++;
      if (dwellTickCount >= 5) {
        dwellTickCount = 0;
        saveMultiDayAnalytics(multiDayAnalytics);
        sendBackendDwell(activeViewingSection, 5);
      }
    }
  }, 1000);

  // ===================================================================
  // 2. HERO QUICK SWITCHER (XE CHẠY VS XE TẮT MÁY)
  // ===================================================================
  const btnModeRunning = document.getElementById('btnModeRunning');
  const btnModeParked = document.getElementById('btnModeParked');
  const hudAqiVal = document.getElementById('hudAqiVal');
  const hudTempVal = document.getElementById('hudTempVal');
  const mascotHeroImg = document.getElementById('mascotHeroImg');

  if (btnModeRunning && btnModeParked) {
    btnModeRunning.addEventListener('click', () => {
      btnModeRunning.classList.add('active');
      btnModeParked.classList.remove('active');
      if (hudAqiVal) hudAqiVal.textContent = 'AQI: 18 • Rất tốt';
      if (hudTempVal) hudTempVal.textContent = '24.5°C • Mát mẻ';
      if (mascotHeroImg) {
        mascotHeroImg.style.filter = 'drop-shadow(0 20px 30px rgba(16, 185, 129, 0.5))';
      }
      showToast('🚗 Chế độ Xe Đang Chạy: Đang tỏa hương thơm tinh dầu & hiển thị không khí tươi mát.');
    });

    btnModeParked.addEventListener('click', () => {
      btnModeParked.classList.add('active');
      btnModeRunning.classList.remove('active');
      if (hudAqiVal) hudAqiVal.textContent = 'Động cơ: Acc Off';
      if (hudTempVal) hudTempVal.textContent = 'Radar HLK-LD2410 Active';
      if (mascotHeroImg) {
        mascotHeroImg.style.filter = 'drop-shadow(0 20px 30px rgba(6, 182, 212, 0.6))';
      }
      showToast('🛡️ Chế độ Xe Tắt Máy: Hệ thống Radar vi sóng đang canh chừng sự hiện diện trong khoang lái!');
    });
  }

  // ===================================================================
  // 3. INTERACTIVE SIMULATOR BOX (BỘ GIẢ LẬP TƯƠNG TÁC)
  // ===================================================================
  let simState = {
    engineOn: true,
    childPresent: true,
    temp: 26
  };

  const simCarEngineOn = document.getElementById('simCarEngineOn');
  const simCarEngineOff = document.getElementById('simCarEngineOff');
  const simChildAbsent = document.getElementById('simChildAbsent');
  const simChildPresent = document.getElementById('simChildPresent');
  const simTempSlider = document.getElementById('simTempSlider');
  const simTempDisplay = document.getElementById('simTempDisplay');

  const simStatusBadge = document.getElementById('simStatusBadge');
  const simOutputBox = document.getElementById('simOutputBox');
  const simPhoneNotification = document.getElementById('simPhoneNotification');
  const simNotiMsg = document.getElementById('simNotiMsg');
  const oledTemp = document.getElementById('oledTemp');
  const oledStatus = document.getElementById('oledStatus');
  const simActionSummary = document.getElementById('simActionSummary');

  function updateSimulator() {
    if (simTempDisplay) simTempDisplay.textContent = `${simState.temp}°C`;
    if (oledTemp) oledTemp.textContent = `${simState.temp.toFixed(1)}°C`;

    // Case 1: Engine is OFF and Child is PRESENT
    if (!simState.engineOn && simState.childPresent) {
      if (simState.temp >= 38) {
        // Critical Danger
        if (simStatusBadge) {
          simStatusBadge.className = 'sim-output-badge danger-state';
          simStatusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> BÁO ĐỘNG ĐỎ: NGUY CƠ SỐC NHIỆT CỰC ĐỘ!';
        }
        if (oledStatus) {
          oledStatus.className = 'text-danger';
          oledStatus.textContent = 'CRITICAL DANGER!';
        }
        if (simNotiMsg) {
          simNotiMsg.textContent = `NGUY CẤP! Nhiệt độ xe đã lên ${simState.temp}°C! Bé đang gặp nguy hiểm! Hãy mở khóa ngay!`;
        }
        if (simPhoneNotification) simPhoneNotification.className = 'sim-phone-notification show';
        if (simActionSummary) {
          simActionSummary.innerHTML = '<strong class="text-danger"><i class="fa-solid fa-volume-high"></i> Còi xe đang hú vang liên tục • Flutter App rung báo động đỏ tức thời!</strong>';
        }
      } else {
        // Warning
        if (simStatusBadge) {
          simStatusBadge.className = 'sim-output-badge danger-state';
          simStatusBadge.innerHTML = '<i class="fa-solid fa-bell"></i> CẢNH BÁO: PHÁT HIỆN BÉ CÒN TRÊN XE TẮT MÁY!';
        }
        if (oledStatus) {
          oledStatus.className = 'text-warning';
          oledStatus.textContent = 'CHILD DETECTED!';
        }
        if (simNotiMsg) {
          simNotiMsg.textContent = `Phát hiện có cử động/nhịp thở trong xe sau khi tắt máy! Nhiệt độ hiện tại: ${simState.temp}°C.`;
        }
        if (simPhoneNotification) simPhoneNotification.className = 'sim-phone-notification show';
        if (simActionSummary) {
          simActionSummary.innerHTML = '<strong class="text-warning"><i class="fa-solid fa-mobile-screen"></i> Bắn thông báo khẩn qua Firebase • Chuẩn bị kích hoạt còi xe sau 60s.</strong>';
        }
      }
    } else if (simState.engineOn) {
      // Normal Driving Mode
      if (simStatusBadge) {
        simStatusBadge.className = 'sim-output-badge';
        simStatusBadge.innerHTML = '<i class="fa-solid fa-check-circle"></i> Trạng thái: BÌNH THƯỜNG / TIỆN ÍCH HÀNH TRÌNH';
      }
      if (oledStatus) {
        oledStatus.className = 'text-success';
        oledStatus.textContent = 'FRESH & SAFE';
      }
      if (simPhoneNotification) simPhoneNotification.className = 'sim-phone-notification';
      if (simActionSummary) {
        simActionSummary.textContent = 'Xe đang vận hành. Hệ thống tự động làm thơm xe, khử mùi và giám sát không khí BME680.';
      }
    } else {
      // Engine Off & No Child
      if (simStatusBadge) {
        simStatusBadge.className = 'sim-output-badge';
        simStatusBadge.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Trạng thái: AN TOÀN - KHOANG LÁI TRỐNG';
      }
      if (oledStatus) {
        oledStatus.className = 'text-info';
        oledStatus.textContent = 'EMPTY - SLEEP';
      }
      if (simPhoneNotification) simPhoneNotification.className = 'sim-phone-notification';
      if (simActionSummary) {
        simActionSummary.textContent = 'Radar quét không phát hiện chuyển động. beAn chuyển sang chế độ tiết kiệm năng lượng ngủ đông.';
      }
    }
  }

  if (simCarEngineOn && simCarEngineOff) {
    simCarEngineOn.addEventListener('click', () => {
      simState.engineOn = true;
      simCarEngineOn.classList.add('active');
      simCarEngineOff.classList.remove('active', 'danger-active');
      updateSimulator();
    });

    simCarEngineOff.addEventListener('click', () => {
      simState.engineOn = false;
      simCarEngineOff.classList.add('active', 'danger-active');
      simCarEngineOn.classList.remove('active');
      updateSimulator();
    });
  }

  if (simChildAbsent && simChildPresent) {
    simChildAbsent.addEventListener('click', () => {
      simState.childPresent = false;
      simChildAbsent.classList.add('active');
      simChildPresent.classList.remove('active');
      updateSimulator();
    });

    simChildPresent.addEventListener('click', () => {
      simState.childPresent = true;
      simChildPresent.classList.add('active');
      simChildAbsent.classList.remove('active');
      updateSimulator();
    });
  }

  if (simTempSlider) {
    simTempSlider.addEventListener('input', (e) => {
      simState.temp = parseInt(e.target.value, 10);
      updateSimulator();
    });
  }

  // ===================================================================
  // 4. SOCIAL INTERACTION (FACEBOOK & TIKTOK FL VÀ TƯƠNG TÁC)
  // ===================================================================
  
  // Facebook Follow Toggle
  const btnFbFollow = document.getElementById('btnFbFollow');
  const fbFollowText = document.getElementById('fbFollowText');
  const fbFollowerCount = document.getElementById('fbFollowerCount');
  let isFbFollowed = false;

  if (btnFbFollow) {
    btnFbFollow.addEventListener('click', () => {
      isFbFollowed = !isFbFollowed;
      if (isFbFollowed) {
        btnFbFollow.style.background = '#047857';
        if (fbFollowText) fbFollowText.textContent = 'Đã Theo Dõi (✓)';
        if (fbFollowerCount) fbFollowerCount.textContent = '12,451';
        showToast('🎉 Cảm ơn bạn đã theo dõi Fanpage Facebook beAn!');
      } else {
        btnFbFollow.style.background = '#10b981';
        if (fbFollowText) fbFollowText.textContent = 'Follow Page';
        if (fbFollowerCount) fbFollowerCount.textContent = '12,450';
      }
    });
  }

  // TikTok Follow Toggle & Flying Hearts
  const btnTiktokFollow = document.getElementById('btnTiktokFollow');
  const tiktokFollowText = document.getElementById('tiktokFollowText');
  const tiktokFollowerCount = document.getElementById('tiktokFollowerCount');
  let isTiktokFollowed = false;

  function spawnFlyingHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'flying-heart';
    heart.innerHTML = '<i class="fa-solid fa-heart"></i>';
    heart.style.left = `${x + (Math.random() * 40 - 20)}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
  }

  if (btnTiktokFollow) {
    btnTiktokFollow.addEventListener('click', (e) => {
      isTiktokFollowed = !isTiktokFollowed;
      
      // Spawn burst of hearts
      for (let i = 0; i < 6; i++) {
        setTimeout(() => spawnFlyingHeart(e.clientX, e.clientY), i * 150);
      }

      if (isTiktokFollowed) {
        btnTiktokFollow.style.background = 'linear-gradient(135deg, #047857 0%, #064e3b 100%)';
        if (tiktokFollowText) tiktokFollowText.textContent = 'Đã Follow (❤️)';
        if (tiktokFollowerCount) tiktokFollowerCount.textContent = '35,801';
        showToast('❤️ Cảm ơn bạn đã Follow & thả tim kênh TikTok @bean.safekids!');
      } else {
        btnTiktokFollow.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        if (tiktokFollowText) tiktokFollowText.textContent = 'Follow & Thả Tim';
        if (tiktokFollowerCount) tiktokFollowerCount.textContent = '35,800';
      }
    });
  }

  // TikTok Preview Modal
  const btnPreviewTiktok = document.getElementById('btnPreviewTiktok');
  const tiktokModal = document.getElementById('tiktokModal');
  const btnCloseTiktok = document.getElementById('btnCloseTiktok');
  const btnTiktokHeart = document.getElementById('btnTiktokHeart');
  const ttHeartCount = document.getElementById('ttHeartCount');

  if (btnPreviewTiktok && tiktokModal) {
    btnPreviewTiktok.addEventListener('click', () => {
      tiktokModal.classList.add('active');
    });

    if (btnCloseTiktok) {
      btnCloseTiktok.addEventListener('click', () => {
        tiktokModal.classList.remove('active');
      });
    }

    tiktokModal.addEventListener('click', (e) => {
      if (e.target === tiktokModal) tiktokModal.classList.remove('active');
    });
  }

  if (btnTiktokHeart && ttHeartCount) {
    btnTiktokHeart.addEventListener('click', (e) => {
      btnTiktokHeart.style.color = '#fe2c55';
      ttHeartCount.textContent = '48.3K';
      spawnFlyingHeart(e.clientX, e.clientY);
      showToast('Đã thả tim video trải nghiệm beAn!');
    });
  }

  // ===================================================================
  // 4B. ARTICLE READING MODAL (THỜI SỰ & PHÂN TÍCH KHOA HỌC)
  // ===================================================================
  const articleIncidentModal = document.getElementById('articleIncidentModal');
  const btnOpenIncidentArticle = document.getElementById('btnOpenIncidentArticle');
  const cardIncident = document.getElementById('cardIncident');
  const btnCloseIncidentModal = document.getElementById('btnCloseIncidentModal');
  const btnFooterCloseIncident = document.getElementById('btnFooterCloseIncident');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 1. Incident Article Modal
  if (btnOpenIncidentArticle && articleIncidentModal) {
    btnOpenIncidentArticle.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(articleIncidentModal);
      if (typeof trackClick === 'function') trackClick('link-read-incident-article');
    });
  }

  if (cardIncident && articleIncidentModal) {
    cardIncident.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      openModal(articleIncidentModal);
      if (typeof trackClick === 'function') trackClick('news-card-incident1');
    });
  }

  if (btnCloseIncidentModal) {
    btnCloseIncidentModal.addEventListener('click', () => closeModal(articleIncidentModal));
  }
  if (btnFooterCloseIncident) {
    btnFooterCloseIncident.addEventListener('click', () => closeModal(articleIncidentModal));
  }
  if (articleIncidentModal) {
    articleIncidentModal.addEventListener('click', (e) => {
      if (e.target === articleIncidentModal) closeModal(articleIncidentModal);
    });
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (articleIncidentModal && articleIncidentModal.classList.contains('active')) closeModal(articleIncidentModal);
      if (tiktokModal && tiktokModal.classList.contains('active')) tiktokModal.classList.remove('active');
    }
  });

  // ===================================================================
  // 5. ADMIN AUTHENTICATION & MULTI-DAY DASHBOARD SYSTEM
  // ===================================================================
  
  // Elements: Admin Login Modal
  const adminLoginModal = document.getElementById('adminLoginModal');
  const btnCloseAdminLogin = document.getElementById('btnCloseAdminLogin');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminEmail = document.getElementById('adminEmail');
  const adminPassword = document.getElementById('adminPassword');
  const btnToggleAdminPwd = document.getElementById('btnToggleAdminPwd');
  const eyeAdminPwd = document.getElementById('eyeAdminPwd');
  const adminRemember = document.getElementById('adminRemember');
  const adminLoginAlert = document.getElementById('adminLoginAlert');
  const adminLoginAlertMsg = document.getElementById('adminLoginAlertMsg');

  // Elements: Admin Dashboard Modal
  const adminDashboardModal = document.getElementById('adminDashboardModal');
  const btnCloseAdminDashboard = document.getElementById('btnCloseAdminDashboard');
  const btnAdminLogout = document.getElementById('btnAdminLogout');
  const btnAdminNav = document.getElementById('btnAdminNav');
  const btnFooterAdminLogin = document.getElementById('btnFooterAdminLogin');

  // Elements: Dashboard Metrics & Panes
  const dashTotalClicks = document.getElementById('dashTotalClicks');
  const dashAvgDwellTime = document.getElementById('dashAvgDwellTime');
  const dashTopClickElement = document.getElementById('dashTopClickElement');
  const dashTopClickCount = document.getElementById('dashTopClickCount');
  const dashTopReadingSection = document.getElementById('dashTopReadingSection');
  const dashTopReadingTime = document.getElementById('dashTopReadingTime');

  const tabBtnReading = document.getElementById('tabBtnReading');
  const tabBtnClicks = document.getElementById('tabBtnClicks');
  const paneReading = document.getElementById('paneReading');
  const paneClicks = document.getElementById('paneClicks');
  const readingSectionsList = document.getElementById('readingSectionsList');
  const dashReadingTableBody = document.getElementById('dashReadingTableBody');
  const dashClicksTableBody = document.getElementById('dashClicksTableBody');

  // Elements: Date Filters & Action Buttons
  const dateFilterTabs = document.querySelectorAll('#dateFilterTabs .date-tab');
  const adminDatePicker = document.getElementById('adminDatePicker');
  const btnDashToggleHeatmap = document.getElementById('btnDashToggleHeatmap');
  const btnDashExport = document.getElementById('btnDashExport');
  const btnDashReset = document.getElementById('btnDashReset');

  // Elements: Floating Heatmap Dock
  const floatingHeatmapDock = document.getElementById('floatingHeatmapDock');
  const btnDockOpenAdmin = document.getElementById('btnDockOpenAdmin');
  const btnDockCloseHeatmap = document.getElementById('btnDockCloseHeatmap');

  let currentDateRange = 'today';

  // Format seconds to human friendly (e.g. "2m 15s" or "45s")
  function formatSeconds(sec) {
    if (!sec || sec <= 0) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) {
      return `${m}m ${s > 0 ? s + 's' : ''}`.trim();
    }
    return `${s}s`;
  }

  // Check Admin Login State
  function isAdminLoggedIn() {
    return sessionStorage.getItem(SESSION_ADMIN_KEY) === 'true' || 
           localStorage.getItem(SESSION_ADMIN_KEY) === 'true';
  }

  function setAdminLoggedIn(isLoggedIn, remember = false) {
    if (isLoggedIn) {
      sessionStorage.setItem(SESSION_ADMIN_KEY, 'true');
      if (remember) {
        localStorage.setItem(SESSION_ADMIN_KEY, 'true');
      }
    } else {
      sessionStorage.removeItem(SESSION_ADMIN_KEY);
      localStorage.removeItem(SESSION_ADMIN_KEY);
    }
    updateAdminNavUI();
  }

  function updateAdminNavUI() {
    if (btnAdminNav) {
      if (isAdminLoggedIn()) {
        btnAdminNav.classList.add('logged-in');
        btnAdminNav.innerHTML = '<i class="fa-solid fa-chart-pie"></i> <span>Quản Trị beAn</span>';
      } else {
        btnAdminNav.classList.remove('logged-in');
        btnAdminNav.innerHTML = '<i class="fa-solid fa-shield-halved"></i> <span>Admin</span>';
      }
    }
  }

  // Aggregate Analytics for Selected Date Range
  function aggregateAnalytics(range) {
    const today = getTodayKey();
    let targetDates = [];

    if (range === 'today') {
      targetDates = [today];
    } else if (range === 'yesterday') {
      targetDates = [getPastDateKey(1)];
    } else if (range === 'last7days') {
      for (let i = 0; i < 7; i++) {
        targetDates.push(getPastDateKey(i));
      }
    } else if (range === 'all') {
      targetDates = Object.keys(multiDayAnalytics);
    } else {
      // Specific date YYYY-MM-DD
      targetDates = [range];
    }

    let totalClicks = 0;
    const aggregatedElements = {};
    const aggregatedDwell = {
      'gioi-thieu': 0,
      've-bean': 0,
      'chuc-nang': 0,
      'nguyen-ly': 0,
      'thoi-su': 0,
      'lien-he': 0
    };
    const aggregatedReach = {
      'gioi-thieu': 0,
      've-bean': 0,
      'chuc-nang': 0,
      'nguyen-ly': 0,
      'thoi-su': 0,
      'lien-he': 0
    };

    targetDates.forEach(dateStr => {
      const dayData = multiDayAnalytics[dateStr];
      if (dayData) {
        totalClicks += (dayData.totalClicks || 0);

        // Elements
        if (dayData.elements) {
          Object.entries(dayData.elements).forEach(([elId, count]) => {
            aggregatedElements[elId] = (aggregatedElements[elId] || 0) + count;
          });
        }

        // Dwell
        if (dayData.sectionDwell) {
          Object.entries(dayData.sectionDwell).forEach(([secId, sec]) => {
            aggregatedDwell[secId] = (aggregatedDwell[secId] || 0) + sec;
          });
        }

        // Reach
        if (dayData.scrollReach) {
          Object.entries(dayData.scrollReach).forEach(([secId, rCount]) => {
            aggregatedReach[secId] = (aggregatedReach[secId] || 0) + rCount;
          });
        }
      }
    });

    // Top Click Element
    let topElKey = null;
    let topElClicks = 0;
    Object.entries(aggregatedElements).forEach(([k, c]) => {
      if (c > topElClicks) {
        topElClicks = c;
        topElKey = k;
      }
    });

    // Top Reading Section
    let topSecKey = null;
    let topSecDwell = 0;
    Object.entries(aggregatedDwell).forEach(([k, s]) => {
      if (s > topSecDwell) {
        topSecDwell = s;
        topSecKey = k;
      }
    });

    // Total Dwell seconds across all sections
    const totalDwellSecs = Object.values(aggregatedDwell).reduce((a, b) => a + b, 0);
    const avgSecDwell = totalDwellSecs > 0 ? Math.round(totalDwellSecs / TRACKED_SECTIONS.length) : 0;

    return {
      range,
      targetDates,
      totalClicks,
      elements: aggregatedElements,
      sectionDwell: aggregatedDwell,
      scrollReach: aggregatedReach,
      topElement: {
        key: topElKey,
        name: topElKey ? `${getElementPageInfo(topElKey).section}: ${getElementPageInfo(topElKey).name}` : 'Chưa có dữ liệu',
        shortName: topElKey ? getElementPageInfo(topElKey).name : 'Chưa có dữ liệu',
        section: topElKey ? getElementPageInfo(topElKey).section : 'Chưa có',
        clicks: topElClicks
      },
      topSection: {
        key: topSecKey,
        title: topSecKey ? ((TRACKED_SECTIONS.find(s => s.id === topSecKey) || {}).title || 'Chức Năng beAn') : 'Chưa có dữ liệu',
        dwellSeconds: topSecDwell
      },
      totalDwellSecs,
      avgSecDwell
    };
  }

  // Render Full Admin Dashboard
  function renderAdminDashboard(range = currentDateRange) {
    currentDateRange = range;
    const summary = aggregateAnalytics(range);

    // Grab Trend Elements
    const dashTrendClicks = document.getElementById('dashTrendClicks');
    const dashTrendDwell = document.getElementById('dashTrendDwell');

    // 1. KPI Cards
    if (dashTotalClicks) {
      dashTotalClicks.textContent = summary.totalClicks.toLocaleString();
      if (dashTrendClicks) {
        if (summary.totalClicks > 0) {
          dashTrendClicks.className = 'trend-pill trend-up';
          dashTrendClicks.innerHTML = '<i class="fa-solid fa-arrow-trend-up"></i> Hoạt động';
        } else {
          dashTrendClicks.className = 'trend-pill trend-empty';
          dashTrendClicks.innerHTML = '<i class="fa-solid fa-minus"></i> Chưa có';
        }
      }
    }

    if (dashAvgDwellTime) {
      if (summary.totalDwellSecs > 0) {
        dashAvgDwellTime.textContent = formatSeconds(summary.avgSecDwell);
        if (dashTrendDwell) {
          dashTrendDwell.className = 'trend-pill trend-neutral';
          dashTrendDwell.innerHTML = '<i class="fa-solid fa-eye"></i> Giữ chân tốt';
        }
      } else {
        dashAvgDwellTime.textContent = 'Chưa có';
        if (dashTrendDwell) {
          dashTrendDwell.className = 'trend-pill trend-empty';
          dashTrendDwell.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Chưa có';
        }
      }
    }

    if (dashTopClickElement) {
      dashTopClickElement.textContent = summary.topElement.clicks > 0 ? summary.topElement.shortName : 'Chưa có dữ liệu';
    }
    const dashTopClickPill = document.getElementById('dashTopClickPill');
    if (dashTopClickPill) {
      if (summary.topElement.clicks > 0) {
        dashTopClickPill.className = 'trend-pill trend-amber';
        dashTopClickPill.innerHTML = `<i class="fa-solid fa-fire"></i> ${summary.topElement.clicks.toLocaleString()} lượt`;
      } else {
        dashTopClickPill.className = 'trend-pill trend-empty';
        dashTopClickPill.innerHTML = '<i class="fa-solid fa-minus"></i> Chưa có';
      }
    }
    if (dashTopClickCount) {
      const clickPct = summary.totalClicks > 0 
        ? ((summary.topElement.clicks / summary.totalClicks) * 100).toFixed(1) 
        : '0.0';
      dashTopClickCount.innerHTML = summary.topElement.clicks > 0 
        ? `Khu vực: <strong>${summary.topElement.section}</strong> (Chiếm ${clickPct}% click)`
        : 'Chưa có lượt tương tác nào';
    }

    if (dashTopReadingSection) {
      dashTopReadingSection.textContent = summary.totalDwellSecs > 0 && summary.topSection.dwellSeconds > 0 
        ? summary.topSection.title 
        : 'Chưa có dữ liệu';
    }
    const dashTopReadingPill = document.getElementById('dashTopReadingPill');
    if (dashTopReadingPill) {
      if (summary.totalDwellSecs > 0 && summary.topSection.dwellSeconds > 0) {
        dashTopReadingPill.className = 'trend-pill trend-purple';
        dashTopReadingPill.innerHTML = `<i class="fa-solid fa-clock"></i> ${formatSeconds(summary.topSection.dwellSeconds)}`;
      } else {
        dashTopReadingPill.className = 'trend-pill trend-empty';
        dashTopReadingPill.innerHTML = '<i class="fa-solid fa-minus"></i> Chưa có';
      }
    }
    if (dashTopReadingTime) {
      const dwellPct = summary.totalDwellSecs > 0 
        ? ((summary.topSection.dwellSeconds / summary.totalDwellSecs) * 100).toFixed(1) 
        : '0.0';
      dashTopReadingTime.innerHTML = summary.totalDwellSecs > 0 && summary.topSection.dwellSeconds > 0 
        ? `Khu vực đọc lâu nhất (Chiếm ${dwellPct}% thời lượng)`
        : 'Chưa có dữ liệu đọc';
    }


    // 2. Reading Dwell Time Breakdown (6 Sections Table)
    const readingTable = dashReadingTableBody || document.getElementById('dashReadingTableBody') || readingSectionsList;
    if (readingTable) {
      readingTable.innerHTML = '';

      // Sort sections by dwell time descending
      const sortedSections = [...TRACKED_SECTIONS].map(sec => {
        const dwell = summary.sectionDwell[sec.id] || 0;
        const reach = summary.scrollReach[sec.id] || 0;
        const pctOfTotal = summary.totalDwellSecs > 0 ? Math.round((dwell / summary.totalDwellSecs) * 100) : 0;
        return {
          ...sec,
          dwell,
          reach,
          pctOfTotal
        };
      }).sort((a, b) => b.dwell - a.dwell);

      if (summary.totalDwellSecs === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" class="text-center text-muted py-4"><i class="fa-solid fa-circle-info"></i> Chưa có dữ liệu thời gian đọc trong khoảng thời gian này. Hệ thống sẽ tự động đo lường khi người dùng cuộn xem từng phần trên trang chủ.</td>`;
        readingTable.appendChild(emptyRow);
      } else {
        let activeRank = 0;
        sortedSections.forEach((sec) => {
          let rankBadge = `<span class="rank-badge normal">-</span>`;
          if (sec.dwell > 0) {
            activeRank++;
            if (activeRank === 1) rankBadge = `<span class="rank-badge gold"><i class="fa-solid fa-trophy"></i> 1</span>`;
            else if (activeRank === 2) rankBadge = `<span class="rank-badge silver">2</span>`;
            else if (activeRank === 3) rankBadge = `<span class="rank-badge bronze">3</span>`;
            else rankBadge = `<span class="rank-badge normal">${activeRank}</span>`;
          }

          const dwellText = sec.dwell > 0 ? formatSeconds(sec.dwell) : '0s';
          const reachText = sec.reach > 0 ? `${sec.reach.toLocaleString()} lượt` : 'Chưa có';
          const pctText = sec.pctOfTotal > 0 ? `${sec.pctOfTotal}%` : '0%';

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="text-align: center;">${rankBadge}</td>
            <td>
              <strong>${sec.title}</strong>
              <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">${sec.desc}</div>
            </td>
            <td style="text-align: center;">
              <span class="scroll-reach-pill"><i class="fa-solid fa-users-viewfinder"></i> ${reachText}</span>
            </td>
            <td style="text-align: center;"><span class="click-count-badge">${dwellText}</span></td>
            <td style="text-align: center;"><strong class="text-accent">${pctText}</strong></td>
          `;
          readingTable.appendChild(tr);
        });
      }
    }

    // 3. Click Areas Breakdown Table
    if (dashClicksTableBody) {
      dashClicksTableBody.innerHTML = '';

      // Sort elements by clicks descending
      const sortedElements = Object.entries(summary.elements)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      if (sortedElements.length === 0 || summary.totalClicks === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" class="text-center text-muted py-4"><i class="fa-solid fa-circle-info"></i> Chưa có dữ liệu lượt bấm nào trong khoảng thời gian này. Người dùng chưa click vào các vị trí trên trang chủ.</td>`;
        dashClicksTableBody.appendChild(emptyRow);
      } else {
        sortedElements.forEach(([elKey, count], idx) => {
          const rank = idx + 1;
          const pct = Math.round((count / summary.totalClicks) * 100);
          const info = getElementPageInfo(elKey);

          let rankBadge = `<span class="rank-badge normal">${rank}</span>`;
          if (rank === 1) rankBadge = `<span class="rank-badge gold"><i class="fa-solid fa-trophy"></i> 1</span>`;
          else if (rank === 2) rankBadge = `<span class="rank-badge silver">2</span>`;
          else if (rank === 3) rankBadge = `<span class="rank-badge bronze">3</span>`;

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="text-align: center;">${rankBadge}</td>
            <td><strong>${info.name}</strong></td>
            <td><span class="page-section-pill"><i class="fa-regular fa-folder-open text-emerald"></i> ${info.section}</span></td>
            <td style="text-align: center;"><span class="click-count-badge">${count.toLocaleString()}</span></td>
            <td style="text-align: center;"><strong class="text-accent">${pct}%</strong></td>
          `;
          dashClicksTableBody.appendChild(tr);
        });
      }
    }
  }

  // Handle Admin Button Click (Header & Footer)
  function handleAdminClick(e) {
    if (e) e.preventDefault();
    if (isAdminLoggedIn()) {
      openModal(adminDashboardModal);
      renderAdminDashboard(currentDateRange);
      syncAnalyticsFromBackend();
    } else {
      openModal(adminLoginModal);
    }
  }

  if (btnAdminNav) {
    btnAdminNav.addEventListener('click', handleAdminClick);
  }

  if (btnFooterAdminLogin) {
    btnFooterAdminLogin.addEventListener('click', handleAdminClick);
  }

  // Close Admin Login Modal
  if (btnCloseAdminLogin) {
    btnCloseAdminLogin.addEventListener('click', () => closeModal(adminLoginModal));
  }
  if (adminLoginModal) {
    adminLoginModal.addEventListener('click', (e) => {
      if (e.target === adminLoginModal) closeModal(adminLoginModal);
    });
  }

  // Toggle Password Visibility
  if (btnToggleAdminPwd && adminPassword && eyeAdminPwd) {
    btnToggleAdminPwd.addEventListener('click', () => {
      const isPwd = adminPassword.getAttribute('type') === 'password';
      adminPassword.setAttribute('type', isPwd ? 'text' : 'password');
      eyeAdminPwd.className = isPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }



  // Admin Login Form Submit
  function performAdminLogin() {
    const emailVal = (adminEmail ? adminEmail.value : '').trim().toLowerCase();
    const pwdVal = (adminPassword ? adminPassword.value : '').trim();
    const remember = adminRemember ? adminRemember.checked : true;

    // Strict Credentials Check: admin@bean.com / 123456
    if (emailVal === 'admin@bean.com' && pwdVal === '123456') {
      if (adminLoginAlert) adminLoginAlert.style.display = 'none';
      setAdminLoggedIn(true, remember);
      closeModal(adminLoginModal);
      openModal(adminDashboardModal);
      renderAdminDashboard(currentDateRange);
      syncAnalyticsFromBackend();
      showToast('✅ Đăng nhập Quản Trị thành công! Chào mừng admin@bean.com.');
    } else {
      if (adminLoginAlert) {
        adminLoginAlert.style.display = 'flex';
        if (adminLoginAlertMsg) {
          adminLoginAlertMsg.textContent = 'Sai tài khoản hoặc mật khẩu! Vui lòng dùng: admin@bean.com / 123456';
        }
      }
    }
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      performAdminLogin();
    });
  }

  // Admin Logout
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      setAdminLoggedIn(false);
      closeModal(adminDashboardModal);
      if (isHeatmapActive) toggleHeatmap(false);
      showToast('Đã đăng xuất khỏi tài khoản Quản Trị beAn.');
    });
  }

  // Close Admin Dashboard Modal
  if (btnCloseAdminDashboard) {
    btnCloseAdminDashboard.addEventListener('click', () => closeModal(adminDashboardModal));
  }
  if (adminDashboardModal) {
    adminDashboardModal.addEventListener('click', (e) => {
      if (e.target === adminDashboardModal) closeModal(adminDashboardModal);
    });
  }

  // Tab Navigation in Admin Dashboard (Reading vs Clicks)
  if (tabBtnReading && tabBtnClicks && paneReading && paneClicks) {
    tabBtnReading.addEventListener('click', () => {
      tabBtnReading.classList.add('active');
      tabBtnClicks.classList.remove('active');
      paneReading.style.display = 'block';
      paneClicks.style.display = 'none';
    });

    tabBtnClicks.addEventListener('click', () => {
      tabBtnClicks.classList.add('active');
      tabBtnReading.classList.remove('active');
      paneClicks.style.display = 'block';
      paneReading.style.display = 'none';
    });
  }

  // Date Filter Tabs (Hôm Nay, Hôm Qua, 7 Ngày Qua, Toàn Bộ)
  if (dateFilterTabs.length > 0) {
    dateFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dateFilterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (adminDatePicker) adminDatePicker.value = '';

        const range = tab.getAttribute('data-range');
        renderAdminDashboard(range);
        showToast(`📅 Đang lọc dữ liệu: ${tab.textContent}`);
      });
    });
  }

  // Date Picker Filter
  if (adminDatePicker) {
    adminDatePicker.addEventListener('change', (e) => {
      const selectedDate = e.target.value;
      if (selectedDate) {
        dateFilterTabs.forEach(t => t.classList.remove('active'));
        renderAdminDashboard(selectedDate);
        showToast(`📅 Đang lọc dữ liệu ngày: ${selectedDate}`);
      }
    });
  }

  // Toggle Heatmap from Dashboard
  if (btnDashToggleHeatmap) {
    btnDashToggleHeatmap.addEventListener('click', () => {
      closeModal(adminDashboardModal);
      toggleHeatmap(true);
    });
  }


  // Floating Heatmap Dock Controls
  if (btnDockOpenAdmin) {
    btnDockOpenAdmin.addEventListener('click', () => {
      openModal(adminDashboardModal);
      renderAdminDashboard(currentDateRange);
    });
  }
  if (btnDockCloseHeatmap) {
    btnDockCloseHeatmap.addEventListener('click', () => {
      toggleHeatmap(false);
    });
  }

  // Export Excel (.xls / XML Spreadsheet) Report for Current Date Filter
  function exportAnalyticsToExcel(range = currentDateRange) {
    const summary = aggregateAnalytics(range);

    const esc = (text) => {
      if (text === null || text === undefined) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const dateRangeLabel = range === 'today' ? 'Hôm Nay' : 
                          (range === 'yesterday' ? 'Hôm Qua' : 
                          (range === 'last7days' ? '7 Ngày Gần Nhất' : 
                          (range === 'all' ? 'Toàn Bộ Dữ Liệu' : `Ngày ${range}`)));

    const now = new Date();
    const exportTimeStr = now.toLocaleString('vi-VN');

    // Tính tỷ lệ % cụ thể cho KPI
    const topClickPct = summary.totalClicks > 0 && summary.topElement.clicks > 0
      ? ((summary.topElement.clicks / summary.totalClicks) * 100).toFixed(1) + '%'
      : '0.0%';

    const topSectionPct = summary.totalDwellSecs > 0 && summary.topSection.dwellSeconds > 0
      ? ((summary.topSection.dwellSeconds / summary.totalDwellSecs) * 100).toFixed(1) + '%'
      : '0.0%';

    // Dữ liệu 6 khu vực đọc (Dwell Time & Scroll Depth) với tỷ lệ % cụ thể (.toFixed(1))
    const sortedSections = [...TRACKED_SECTIONS].map(sec => {
      const dwell = summary.sectionDwell[sec.id] || 0;
      const reach = summary.scrollReach[sec.id] || 0;
      const pctVal = summary.totalDwellSecs > 0 ? (dwell / summary.totalDwellSecs) * 100 : 0;
      const pctStr = dwell > 0 ? `${pctVal.toFixed(1)}%` : '0.0%';
      return { ...sec, dwell, reach, pctVal, pctStr };
    }).sort((a, b) => b.dwell - a.dwell);

    // Dữ liệu Bảng xếp hạng Click với tỷ lệ % cụ thể (.toFixed(1))
    const sortedElements = Object.entries(summary.elements)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    // 1. Sheet 1: Báo cáo Tổng quan KPI
    const kpiRows = [
      ['BÁO CÁO THỐNG KÊ QUẢN TRỊ - beAn INTELLIGENCE PLATFORM'],
      ['Khoảng Thời Gian Lọc:', dateRangeLabel, 'Xuất Lúc:', exportTimeStr],
      ['Dự Án:', 'beAn - Safe Kids, Smart Car (Thiết Bị Cảnh Báo An Toàn & Tiện Ích Tránh Sốc Nhiệt)'],
      ['Người Xuất:', 'Quản Trị Viên (admin@bean.com)'],
      ['', ''],
      ['CHỈ SỐ TỔNG QUAN', 'GIÁ TRỊ THỐNG KÊ'],
      ['Tổng Lượt Bấm (User Clicks)', `${summary.totalClicks} lượt`],
      ['Thời Lượng Đọc Trung Bình', summary.totalDwellSecs > 0 ? formatSeconds(summary.avgSecDwell) : 'Chưa có'],
      ['Tổng Thời Gian Đọc Trang Web', summary.totalDwellSecs > 0 ? `${formatSeconds(summary.totalDwellSecs)} (${summary.totalDwellSecs}s)` : 'Chưa có'],
      ['Vùng Được Bấm Nhiều Nhất', summary.topElement.clicks > 0 ? `${summary.topElement.name} (${summary.topElement.section} - ${summary.topElement.clicks} lượt bấm)` : 'Chưa có'],
      ['Khu Vực Đọc Lâu Nhất', summary.topSection.dwellSeconds > 0 ? `${summary.topSection.title} (${formatSeconds(summary.topSection.dwellSeconds)})` : 'Chưa có'],
      ['', '', ''],
      ['', '', ''],
      ['PHÂN TÍCH CHI TIẾT KHU VỰC ĐỌC NHIỀU NHẤT (DWELL TIME & SCROLL DEPTH)', '', ''],
      ['Hạng & Tên Khu Vực Trang Web', 'Thời Gian Đọc & Lượt Cuộn Tới', 'Tỷ Trọng Thời Lượng (%)']
    ];

    let rankKpiSec = 0;
    sortedSections.forEach((s) => {
      if (s.dwell > 0) rankKpiSec++;
      kpiRows.push([
        s.dwell > 0 ? `#${rankKpiSec} - ${s.title}` : `- ${s.title}`,
        s.dwell > 0 ? `${formatSeconds(s.dwell)} (${s.reach} lượt cuộn tới)` : 'Chưa có lượt đọc',
        s.pctStr
      ]);
    });

    kpiRows.push(
      ['', '', ''],
      ['', '', ''],
      ['BẢNG XẾP HẠNG VÙNG BẤM & ĐIỂM TƯƠNG TÁC (CLICK HEATMAP BREAKDOWN)', '', ''],
      ['Hạng & Tên Nút / Vị Trí Bấm', 'Khu Vực Trang & Số Lượt Bấm', 'Tỷ Lệ Quan Tâm (%)']
    );

    if (sortedElements.length === 0) {
      kpiRows.push(['Chưa có dữ liệu lượt bấm nào', '-', '0.0%']);
    } else {
      sortedElements.forEach(([elKey, count], idx) => {
        const info = getElementPageInfo(elKey);
        const elPctVal = summary.totalClicks > 0 ? (count / summary.totalClicks) * 100 : 0;
        const elPctStr = `${elPctVal.toFixed(1)}%`;
        kpiRows.push([
          `#${idx + 1} - ${info.name}`,
          `${info.section} (${count} lượt bấm)`,
          elPctStr
        ]);
      });
    }

    // 2. Sheet 2: Thống kê chi tiết 6 Khu Vực Đọc (Dwell Time & Scroll Depth)
    const sectionRows = [
      ['BÁO CÁO CHI TIẾT THỜI LƯỢNG ĐỌC TỪNG KHU VỰC (DWELL TIME & SCROLL DEPTH)'],
      ['Bộ Lọc:', dateRangeLabel, 'Xuất Lúc:', exportTimeStr, '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Hạng', 'Tên Khu Vực Trang Web', 'Mô Tả Nội Dung', 'Thời Gian Đọc', 'Số Giây', 'Tỷ Trọng Thời Lượng (%)', 'Lượt Cuộn Tới Đọc']
    ];

    let rankSec = 0;
    sortedSections.forEach((s) => {
      if (s.dwell > 0) rankSec++;
      sectionRows.push([
        s.dwell > 0 ? `#${rankSec}` : '-',
        s.title,
        s.desc,
        s.dwell > 0 ? formatSeconds(s.dwell) : 'Chưa có',
        s.dwell,
        s.pctStr,
        s.reach > 0 ? s.reach : 'Chưa có'
      ]);
    });

    // 3. Sheet 3: Bảng Xếp Hạng Vùng Bấm Chi Tiết (Click Breakdown)
    const clickRows = [
      ['BẢNG XẾP HẠNG VÙNG BẤM & TƯƠNG TÁC NGƯỜI DÙNG (CLICK HEATMAP BREAKDOWN)'],
      ['Bộ Lọc:', dateRangeLabel, 'Tổng Lượt Bấm:', `${summary.totalClicks} lượt`, 'Xuất Lúc:', exportTimeStr, ''],
      ['', '', '', '', '', ''],
      ['Hạng', 'Vị Trí / Tên Nút Bấm', 'Thuộc Khu Vực Trang', 'Mã Định Danh (Track ID)', 'Số Lượt Bấm', 'Tỷ Lệ Quan Tâm (%)']
    ];

    if (sortedElements.length === 0) {
      clickRows.push(['-', 'Chưa có dữ liệu lượt bấm nào', '-', '-', 0, '0.0%']);
    } else {
      sortedElements.forEach(([elKey, count], idx) => {
        const info = getElementPageInfo(elKey);
        const elPctVal = summary.totalClicks > 0 ? (count / summary.totalClicks) * 100 : 0;
        const elPctStr = `${elPctVal.toFixed(1)}%`;
        clickRows.push([
          `#${idx + 1}`,
          info.name,
          info.section,
          elKey,
          count,
          elPctStr
        ]);
      });
    }

    // Convert rows to Worksheet XML
    const buildSheetXml = (sheetName, rows, colWidths = []) => {
      let colsXml = '';
      colWidths.forEach(w => {
        colsXml += `<Column ss:AutoFitWidth="0" ss:Width="${w}"/>\n`;
      });

      let rowsXml = '';
      rows.forEach((row, rIdx) => {
        let cellsXml = '';
        const firstCell = String(row[0] || '');
        const isMainTitle = rIdx === 0 && firstCell.startsWith('BÁO CÁO');
        const isSectionHeader = firstCell.startsWith('PHÂN TÍCH') || firstCell.startsWith('BẢNG XẾP HẠNG');
        const isColHeader = (firstCell === 'Hạng' || firstCell === 'CHỈ SỐ TỔNG QUAN' || firstCell === 'Hạng & Tên Khu Vực Trang Web' || firstCell === 'Hạng & Tên Nút / Vị Trí Bấm');

        row.forEach((cell) => {
          const isNum = typeof cell === 'number';
          const type = isNum ? 'Number' : 'String';
          const cellStr = String(cell || '');
          let styleId = 'DefaultStyle';

          if (isMainTitle) {
            styleId = 'TitleStyle';
          } else if (isSectionHeader && !isColHeader) {
            styleId = 'SectionHeaderStyle';
          } else if (isColHeader) {
            styleId = 'HeaderStyle';
          } else if (cellStr.endsWith('%')) {
            styleId = 'PctStyle';
          } else if (cellStr.startsWith('#')) {
            styleId = 'RankStyle';
          } else if (isNum) {
            styleId = 'NumberStyle';
          }

          cellsXml += `<Cell ss:StyleID="${styleId}"><Data ss:Type="${type}">${esc(cell)}</Data></Cell>`;
        });
        const rowHeight = isMainTitle ? '28' : (isSectionHeader && !isColHeader ? '24' : (isColHeader ? '22' : '20'));
        rowsXml += `<Row ss:Height="${rowHeight}">${cellsXml}</Row>\n`;
      });

      return `
        <Worksheet ss:Name="${esc(sheetName)}">
          <Table>
            ${colsXml}
            ${rowsXml}
          </Table>
        </Worksheet>
      `;
    };

    // Full XML Spreadsheet 2003 (.xls) document
    const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>beAn Intelligence Platform</Author>
  <Created>${now.toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="13" ss:Bold="1" ss:Color="#047857"/>
  </Style>
  <Style ss:ID="SectionHeaderStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DefaultStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="RankStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
  </Style>
  <Style ss:ID="PctStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#059669"/>
  </Style>
 </Styles>
 ${buildSheetXml('TongQuan_KPI', kpiRows, [280, 320, 220])}
 ${buildSheetXml('ThoiGianDoc_6KhuVuc', sectionRows, [65, 240, 320, 130, 85, 160, 140])}
 ${buildSheetXml('BangXepHang_Click', clickRows, [65, 240, 180, 180, 110, 160])}
</Workbook>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `Bao_Cao_beAn_${range}_${formatDateKey(now)}.xls`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    showToast(`📊 Đã xuất báo cáo Quản Trị beAn sang file Excel (.xls) thành công!`);
  }

  // Export Excel Button Event
  if (btnDashExport) {
    btnDashExport.addEventListener('click', () => {
      exportAnalyticsToExcel(currentDateRange);
    });
  }

  // Reset Analytics Data for Current Selected Date / Today
  if (btnDashReset) {
    btnDashReset.addEventListener('click', () => {
      if (confirm(`Bạn có chắc chắn muốn đặt lại toàn bộ thống kê của bộ lọc "${currentDateRange}" về 0 không?`)) {
        if (currentDateRange === 'all') {
          multiDayAnalytics = {};
          getTodayData();
        } else if (currentDateRange === 'last7days') {
          for (let i = 0; i < 7; i++) {
            const d = getPastDateKey(i);
            multiDayAnalytics[d] = {
              totalClicks: 0,
              elements: {},
              sectionDwell: { 'gioi-thieu': 0, 've-bean': 0, 'chuc-nang': 0, 'nguyen-ly': 0, 'thoi-su': 0, 'lien-he': 0 },
              scrollReach: { 'gioi-thieu': 0, 've-bean': 0, 'chuc-nang': 0, 'nguyen-ly': 0, 'thoi-su': 0, 'lien-he': 0 }
            };
          }
        } else {
          const targetKey = currentDateRange === 'today' ? getTodayKey() : (currentDateRange === 'yesterday' ? getPastDateKey(1) : currentDateRange);
          multiDayAnalytics[targetKey] = {
            totalClicks: 0,
            elements: {},
            sectionDwell: { 'gioi-thieu': 0, 've-bean': 0, 'chuc-nang': 0, 'nguyen-ly': 0, 'thoi-su': 0, 'lien-he': 0 },
            scrollReach: { 'gioi-thieu': 0, 've-bean': 0, 'chuc-nang': 0, 'nguyen-ly': 0, 'thoi-su': 0, 'lien-he': 0 }
          };
        }

        sendBackendReset(currentDateRange);
        saveMultiDayAnalytics(multiDayAnalytics);
        updateMetricUI();
        if (isHeatmapActive) renderHeatmapBadges();
        renderAdminDashboard(currentDateRange);
        showToast('Đã đặt lại dữ liệu tương tác về 0.');
      }
    });
  }

  // Initialize Admin State
  updateAdminNavUI();

  // ===================================================================
  // 6. CONTACT FORM SUBMISSION
  // ===================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value;
      const phone = document.getElementById('phoneNumber').value;

      recordClick('btn-submit-contact');

      showToast(`🎉 Cảm ơn ${fullName}! Đội ngũ beAn đã nhận được đăng ký và sẽ liên hệ số ${phone} trong 24 giờ.`);
      contactForm.reset();
    });
  }

  // ===================================================================
  // 7. TOAST NOTIFICATION HELPER
  // ===================================================================
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-info text-accent"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-30px)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ===================================================================
  // 8. MOBILE MENU TOGGLE & BACK-TO-TOP & SMOOTH SCROLL
  // ===================================================================
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navBackdrop = document.getElementById('navBackdrop');
  const btnBackToTop = document.getElementById('btnBackToTop');

  function closeMobileMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('is-open');
    if (menuToggle) {
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-bars';
      }
    }
    if (navBackdrop) {
      navBackdrop.classList.remove('active');
    }
    document.body.classList.remove('mobile-menu-locked');
  }

  function openMobileMenu() {
    if (!navMenu) return;
    navMenu.classList.add('is-open');
    if (menuToggle) {
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-xmark';
      }
    }
    if (navBackdrop) {
      navBackdrop.classList.add('active');
    }
    document.body.classList.add('mobile-menu-locked');
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMobileMenu);
    }

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  // Active Nav Scroll Spy & Mobile Menu Link Click
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });

  // Back to top button logic
  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    // Show/hide Back to Top button
    if (btnBackToTop) {
      if (scrollY > 380) {
        btnBackToTop.classList.add('visible');
      } else {
        btnBackToTop.classList.remove('visible');
      }
    }

    sections.forEach(sec => {
      const sectionHeight = sec.offsetHeight;
      const sectionTop = sec.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // ===================================================================
  // 9. HERO IMAGE SLIDER (NEXT/PREV QUAY QUA LẠI)
  // ===================================================================
  const heroSliderContainer = document.getElementById('heroSliderContainer');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroPrevBtn = document.getElementById('heroPrevBtn');
  const heroNextBtn = document.getElementById('heroNextBtn');
  const heroDots = document.querySelectorAll('#heroSliderDots .dot');
  let currentSlideIndex = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (!heroSlides.length) return;
    
    // Normalize index
    if (index < 0) {
      currentSlideIndex = heroSlides.length - 1;
    } else if (index >= heroSlides.length) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlideIndex);
    });

    heroDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlideIndex);
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, 4500);
  }

  function stopAutoPlay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  if (heroPrevBtn && heroNextBtn) {
    heroPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentSlideIndex - 1);
      startAutoPlay();
    });

    heroNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentSlideIndex + 1);
      startAutoPlay();
    });

    heroDots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
        showSlide(targetIndex);
        startAutoPlay();
      });
    });

    if (heroSliderContainer) {
      heroSliderContainer.addEventListener('mouseenter', stopAutoPlay);
      heroSliderContainer.addEventListener('mouseleave', startAutoPlay);

      // Mobile Touch Swipe Navigation
      let touchStartX = 0;
      let touchEndX = 0;
      heroSliderContainer.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].clientX;
        }
      }, { passive: true });

      heroSliderContainer.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchEndX = e.changedTouches[0].clientX;
          const diff = touchEndX - touchStartX;
          if (diff < -40) {
            // Swipe left -> Next
            showSlide(currentSlideIndex + 1);
            startAutoPlay();
          } else if (diff > 40) {
            // Swipe right -> Prev
            showSlide(currentSlideIndex - 1);
            startAutoPlay();
          }
        }
      }, { passive: true });
    }

    startAutoPlay();
  }

  // ===================================================================
  // 9. HARDWARE COMPONENTS SLIDER (PHẦN CỨNG & LINH KIỆN BEAN)
  // ===================================================================
  const hwContainer = document.getElementById('hardwareSliderContainer');
  const hwSlides = document.querySelectorAll('.hardware-slide');
  const hwPrevBtn = document.getElementById('hwPrevBtn');
  const hwNextBtn = document.getElementById('hwNextBtn');
  const hwDots = document.querySelectorAll('#hwSliderDots .dot');
  const hwCompItems = document.querySelectorAll('.tech-hardware-card .comp-item');

  let currentHwIndex = 0;
  let hwSlideInterval = null;

  function showHwSlide(index) {
    if (!hwSlides.length) return;
    if (index < 0) {
      currentHwIndex = hwSlides.length - 1;
    } else if (index >= hwSlides.length) {
      currentHwIndex = 0;
    } else {
      currentHwIndex = index;
    }

    hwSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentHwIndex);
    });

    hwDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentHwIndex);
    });

    // Also highlight the matching component bullet item in hardware card
    hwCompItems.forEach((item, i) => {
      if (i === currentHwIndex) {
        item.style.backgroundColor = 'var(--bg-mint-soft)';
        item.style.borderColor = 'var(--accent-green-primary)';
      } else {
        item.style.backgroundColor = 'transparent';
        item.style.borderColor = 'transparent';
      }
    });
  }

  function startHwAutoPlay() {
    stopHwAutoPlay();
    hwSlideInterval = setInterval(() => {
      showHwSlide(currentHwIndex + 1);
    }, 4500);
  }

  function stopHwAutoPlay() {
    if (hwSlideInterval) {
      clearInterval(hwSlideInterval);
      hwSlideInterval = null;
    }
  }

  if (hwPrevBtn && hwNextBtn) {
    hwPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showHwSlide(currentHwIndex - 1);
      startHwAutoPlay();
    });

    hwNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showHwSlide(currentHwIndex + 1);
      startHwAutoPlay();
    });

    hwDots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
        showHwSlide(targetIndex);
        startHwAutoPlay();
      });
    });

    // Interactive clicking on the component bullet points to view that slide
    hwCompItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        showHwSlide(i);
        startHwAutoPlay();
      });
    });

    if (hwContainer) {
      hwContainer.addEventListener('mouseenter', stopHwAutoPlay);
      hwContainer.addEventListener('mouseleave', startHwAutoPlay);

      // Mobile Touch Swipe Navigation
      let hwTouchStartX = 0;
      let hwTouchEndX = 0;
      hwContainer.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          hwTouchStartX = e.changedTouches[0].clientX;
        }
      }, { passive: true });

      hwContainer.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          hwTouchEndX = e.changedTouches[0].clientX;
          const diff = hwTouchEndX - hwTouchStartX;
          if (diff < -40) {
            showHwSlide(currentHwIndex + 1);
            startHwAutoPlay();
          } else if (diff > 40) {
            showHwSlide(currentHwIndex - 1);
            startHwAutoPlay();
          }
        }
      }, { passive: true });
    }

    startHwAutoPlay();
  }

  // Initial UI Render
  updateMetricUI();
  updateSimulator();

});
