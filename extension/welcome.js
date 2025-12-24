// Keepnet Welcome Page - Language Switcher
// Hem DOMContentLoaded hem de sayfa yüklendiğinde çalışsın
const initLanguage = () => {
  // --- ÇEVİRİLER ---
  const translations = {
    tr: {
      badge_text: "Güvenli Başlangıç",
      title: "Microsoft Oturumu Öncesi",
      description: "Keepnet asistanı, allow-list işlemlerini hızlandırmak için Microsoft portalında size rehberlik eder. Müşteri verisi toplamaz veya gizli API izni istemez.",
      feat1_title: "Neden Gerekli?",
      feat1_desc: "Portal adımlarını otomatize etmek için UI erişimi gerekir. Yalnızca açık sekmeye işlem uygulanır.",
      feat2_title: "Yetki & Roller",
      feat2_desc: "Global Admin şart değil. <strong>Security Admin</strong> veya <strong>Exchange Admin</strong> yeterlidir.",
      feat3_title: "Tam Gizlilik",
      feat3_desc: "Veriler cihazınızda kalır (`chrome.storage`). Harici sunuculara veri gönderilmez.",
      btn_start: "Microsoft ile Devam Et",
      btn_portal: "Sadece Portalı Aç",
      status_default: "Devam ettiğinizde Microsoft Security Center yeni sekmede açılır.",
      status_loading: "Microsoft Security Center açılıyor... lütfen bekleyin.",
      status_success: "Portal açıldı. Oturum açtıktan sonra eklenti ikonuna tıklayın.",
      status_error: "Doğrudan portal açıldı. Oturum açtıktan sonra eklentiye dönün.",
      btn_loading: "Açılıyor...",
      btn_retry: "Tekrar Dene"
    },
    en: {
      badge_text: "Secure Start",
      title: "Before Microsoft Login",
      description: "Keepnet assistant guides you through the Microsoft portal to speed up allow-list processes. No customer data collection or hidden API permissions.",
      feat1_title: "Why is this needed?",
      feat1_desc: "Access is required to automate portal steps. Actions are applied only to the active tab.",
      feat2_title: "Roles & Permissions",
      feat2_desc: "Global Admin is not required. <strong>Security Admin</strong> or <strong>Exchange Admin</strong> is sufficient.",
      feat3_title: "Privacy First",
      feat3_desc: "Data stays on your device (`chrome.storage`). No data is sent to external servers.",
      btn_start: "Continue with Microsoft",
      btn_portal: "Open Portal Only",
      status_default: "Microsoft Security Center will open in a new tab.",
      status_loading: "Opening Microsoft Security Center... please wait.",
      status_success: "Portal opened. Click the extension icon after logging in.",
      status_error: "Portal opened directly. Return to the extension after login.",
      btn_loading: "Opening...",
      btn_retry: "Try Again"
    }
  };

  let currentLang = 'en';
  const statusEl = document.getElementById('status');
  const startBtn = document.getElementById('start-btn');
  const btnTr = document.getElementById('btn-tr');
  const btnEn = document.getElementById('btn-en');

  // --- CHROME STORAGE YÖNETİMİ ---
  const STORAGE_KEY = 'keepnet_welcome_lang';

  // Chrome storage'dan dil tercihini oku
  const loadSavedLanguage = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        if (result[STORAGE_KEY] && (result[STORAGE_KEY] === 'tr' || result[STORAGE_KEY] === 'en')) {
          return result[STORAGE_KEY];
        }
      }
    } catch (err) {
      console.warn('[Keepnet] Could not load saved language:', err);
    }
    return null;
  };

  // Dil tercihini Chrome storage'a kaydet
  const saveLanguage = async (lang) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ [STORAGE_KEY]: lang });
      }
    } catch (err) {
      console.warn('[Keepnet] Could not save language:', err);
    }
  };

  // --- DİL FONKSİYONU ---
  const setLanguage = (lang, saveToStorage = true) => {
    if (!translations[lang]) {
      console.warn('[Keepnet] Invalid language:', lang);
      return;
    }
    
    currentLang = lang;
    console.log('[Keepnet] Setting language to:', lang);

    // Chrome storage'a kaydet (async ama await beklemeden devam et)
    if (saveToStorage) {
      saveLanguage(lang).catch(err => console.warn('[Keepnet] Save language error:', err));
    }

    // Buton aktiflik sınıflarını güncelle
    if (btnTr) {
      btnTr.classList.remove('active');
      if (lang === 'tr') btnTr.classList.add('active');
    }
    if (btnEn) {
      btnEn.classList.remove('active');
      if (lang === 'en') btnEn.classList.add('active');
    }

    // Metinleri güncelle - TÜM data-i18n elementlerini bul
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      
      if (translations[lang][key] !== undefined) {
        const translation = translations[lang][key];
        const tagName = el.tagName.toUpperCase();
        
        // HTML içeriği olan elementler için innerHTML kullan (feat2_desc gibi <strong> içeriyor)
        if (tagName === 'SPAN' || tagName === 'DIV' || tagName === 'P' || tagName === 'H1') {
          el.innerHTML = translation;
        } else if (tagName === 'A') {
          // Link için textContent kullan
          el.textContent = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // HTML lang tag ve title güncelle
    document.documentElement.lang = lang;
    if (lang === 'tr') {
      document.title = 'Keepnet Assistant | Güvenli Başlangıç';
    } else {
      document.title = 'Keepnet Assistant | Secure Start';
    }

    // Status mesajını da güncelle (eğer varsa)
    if (statusEl && statusEl.getAttribute('data-i18n') === 'status_default') {
      statusEl.textContent = translations[lang]['status_default'];
    }
  };

  // --- OLAY DİNLEYİCİLERİ (Event Listeners) ---
  
  // 1. Dil Butonları için tıklama olayları
  if(btnTr) {
    btnTr.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setLanguage('tr');
      return false;
    });
  }
  if(btnEn) {
    btnEn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setLanguage('en');
      return false;
    });
  }

  // 2. Başlangıçta dili yükle (önce kaydedilmiş, sonra tarayıcı dili)
  (async () => {
    try {
      const savedLang = await loadSavedLanguage();
      if (savedLang) {
        setLanguage(savedLang, false); // Zaten storage'da, tekrar kaydetmeye gerek yok
      } else {
        // Kaydedilmiş dil yoksa tarayıcı dilini kullan
        const userLang = navigator.language || navigator.userLanguage; 
        const initialLang = (userLang && userLang.startsWith('tr')) ? 'tr' : 'en';
        setLanguage(initialLang);
      }
    } catch (err) {
      console.error('[Keepnet] Error loading language:', err);
      // Hata durumunda varsayılan olarak İngilizce kullan
      setLanguage('en');
    }
  })();

  // 3. Başlat Butonu Mantığı
  const setStatus = (key, ok = false) => {
    const text = translations[currentLang]?.[key] || key;
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = ok ? 'status ok' : 'status';
    }
  };

  if(startBtn) {
    startBtn.addEventListener('click', async () => {
      startBtn.disabled = true;
      const btnTextSpan = startBtn.querySelector('span');
      if(btnTextSpan) btnTextSpan.textContent = translations[currentLang]['btn_loading'];

      setStatus('status_loading');

      try {
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
          const res = await chrome.runtime.sendMessage({ action: 'startAssistantFromWelcome' });
          if (res && res.ok) {
            setStatus('status_success', true);
            return;
          }
          throw new Error(res?.error || 'Failed');
        } else {
           // Test ortamı için (Chrome API yoksa)
           throw new Error('No Chrome API');
        }
      } catch (err) {
        console.error('[Keepnet] Start failed:', err);
        // Fallback
        window.open('https://security.microsoft.com/homepage', '_blank', 'noreferrer');
        setStatus('status_error', true);
        
        startBtn.disabled = false;
        if(btnTextSpan) btnTextSpan.textContent = translations[currentLang]['btn_retry'];
      }
    });
  }
};

// Sayfa yüklendiğinde çalıştır
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguage);
} else {
  // Sayfa zaten yüklüyse direkt çalıştır
  initLanguage();
}

