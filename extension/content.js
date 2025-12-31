// Keepnet Allow List Assistant v3.1 - Third-Party Phishing Simulations Only
// Tek panel (sol-alt), otomatik tıklama, gerçek zamanlı validation, screenshot kanıt sistemi

console.log("[Keepnet v3.1.8] Content script loaded on", location.href)

/* ========== CONSTANTS & GLOBALS ========== */
const STORAGE_KEYS = {
  PANEL_STATE: 'keepnet_panel_state_v3',
  STEP_RESULTS: 'keepnet_step_results_v3',
  SCREENSHOTS: 'keepnet_screenshots_v3',
  CURRENT_STEP: 'keepnet_current_step_v3'
}

const PANEL_SIZE = { width: 340, height: 520 }
const AUTO_CLICK_TIMEOUT = 10000 // 10 saniye
const VALIDATION_INTERVAL = 1000 // 1 saniye
// Otomasyon varsayılanını KAPALI tutuyoruz:
// - Kullanıcı kontrolü + yanlış input riskini azaltır
// - "Keepnet Auto" gibi otomatik yazmaları engeller
const AUTO_MODE = false
const AUTO_MODE_ADVANCE_DELAY = 8000 // Otomatik mod açılırsa kullanılacak varsayılan bekleme
const AUTO_AGENT = false // Tam otonom ajan (varsayılan kapalı)

let CURRENT_STEP = 0
let TOTAL_STEPS = 12  // Third-Party Phishing: 12 adım
let LANGUAGE = 'en'
let screenshotCounter = 0

// Dosya başına:
let autoAdvanceTimer = null;

/* ========== i18n SYSTEM ========== */
// Messages for different languages
const MESSAGES = {
  tr: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    assistantSubtitle: '',
    step: 'Adım',
    of: '/',
    continue: 'Devam',
    previous: 'Önceki',
    summary: 'Özet',
    summaryReport: 'Özet Rapor',
    goToPage: 'Sayfaya Git',
    copyAll: 'Tümünü Kopyala',
    copyDomain: 'Kopyala',
    copyAllDomains: 'Tümünü kopyala',
    domainListLabel: 'Domain Listesi',
    copied: 'Kopyalandı!',
    error: 'Hata',
    goAndFix: 'Git ve Düzelt',
    workflowStep1Title: 'Security Center Ana Sayfası',
    workflowStep1Description: 'Microsoft Security Center\'da olduğunuzdan emin olun ve devam edin.',
    workflowStep2Title: 'E-posta ve İşbirliği',
    workflowStep2Description: 'E-posta ve işbirliği menüsünü açın',
    workflowStep3Title: 'İlkeler ve Kurallar',
    workflowStep3Description: 'İlkeler ve kurallar sayfasına gidin',
    workflowStep4Title: 'Tehdit İlkeleri',
    workflowStep4Description: 'Tehdit ilkeleri\'ne tıklayın',
    workflowStep5Title: 'Gelişmiş Teslim',
    workflowStep5Description: '"Gelişmiş teslim" butonuna tıklayın',
    workflowStep6Title: 'Kimlik Avı Simülasyonları',
    workflowStep6Description: '"Kimlik avı simülasyonları" sekmesine tıklayın',
    workflowStep7Title: 'Düzenle Butonu',
    workflowStep7Description: 'Düzenle butonuna tıklayın',
    workflowStep8Title: 'Etki Alanları',
    workflowStep8Description: 'Bu domainleri girebilirsiniz:',
    workflowStep9Title: 'IP Adresleri',
    workflowStep9Description: 'Allow list IP adreslerini girin',
    workflowStep10Title: 'Simülasyon URL\'leri',
    workflowStep10Description: 'Bu URL\'leri girebilirsiniz:',
    workflowStep11Title: 'Kaydet',
    workflowStep11Description: 'Değişiklikleri kaydedin',
    workflowStep12Title: 'Tamamlandı!',
    workflowStep12Description: 'Tüm adımlar başarıyla tamamlandı',
    congratsTitle: 'Tebrikler! Tüm Adımları Tamamladınız!',
    congratsDesc: 'Bu adımlar ile Office 365 ortamında IP adreslerini beyaz listeye aldınız ve<br>güvenlik simülasyonları, spam filtreleme ve tehdit öncesi (ATP) özelliklerini<br>başarıyla yapılandırdınız!',
    workflowsCompleted: '6 Workflow',
    stepsSuccessful: '62 Adım',
    importantWarning: 'Önemli Uyarı',
    warningFromStep3: '3. adımdan itibaren eklentiye TIKLAMAYINIZ',
    warningLine1: '• Form kapandığında eklentiyi açarak devam edin',
    warningLine2: '• Ekranda gösterilen vurgulara (highlight) dikkat edin',
    warningLine3: '• Her adım arasında 5 saniye bekleme süresi vardır',
    allScreenshotsSaved: 'Tüm screenshot\'lar chrome.storage\'da kaydedildi',
    screenshotSaved: 'Screenshot kaydedildi',
    successful: 'Başarılı',
    remainingTime: 'Kalan Süre',
    saveButton: 'SAVE Butonuna Basın',
    clickToSave: 'Tıklayarak kaydedin',
    clickHere: 'buraya yazın',
    valueEntered: 'değeri girildi',
    nowSelect: 'Şimdi',
    selectOption: 'seçin',
    selectThisOption: 'bu seçeneği',
    selectIPAddressRanges: 'IP address is in any of these ranges" seçeneğini',
    tooltipEmailCollab: 'E-posta ve işbirliği\'ne tıklayın',
    tooltipPolicies: 'İlkeler ve kurallar\'a tıklayın',
    tooltipThreatPolicies: 'Tehdit ilkeleri\'ne tıklayın',
    tooltipAdvancedDelivery: '"Gelişmiş teslim" butonuna tıklayın',
    tooltipPhishingSim: '"Kimlik avı simülasyonları" sekmesine tıklayın',
    tooltipEdit: 'Düzenle butonuna tıklayın',
    tooltipDomains: 'Etki alanlarını girin',
    tooltipIPs: 'Allow list IP adreslerini girin',
    tooltipURLs: 'Simülasyon URL\'lerini girin',
    tooltipSave: 'Kaydet butonuna tıklayın',
    tooltipConnectionFilterCheckbox: 'Bağlantı filtresi ilkesinin satırındaki checkbox\'ı seçin',
    tooltipConnectionFilterPolicy: 'Bağlantı filtresi ilkesine tıklayın',
    tooltipEditConnectionFilter: 'Bağlantı filtresi ilkesini düzenle butonuna tıklayın',
    tooltipAddIPs: 'IP adreslerini girin (Her satıra bir IP)',
    tooltipSafeList: 'Turn on safe list checkbox\'ını işaretleyin',
    tooltipSafeLinks: 'Safe Links\'e tıklayın',
    tooltipCreate: 'Create butonuna tıklayın',
    tooltipName: 'İsim girin',
    tooltipPolicyName: 'Politika adını girin',
    tooltipDescription: 'Açıklama girin',
    tooltipNext: 'Next butonuna tıklayın',
    tooltipAddDomain: 'Domain ekleyin',
    tooltipClickNext: 'Next\'e tıklayın',
    tooltipRemoveTrack: 'Track user clicks seçeneğini kaldırın',
    tooltipAddPhishingDomains: 'Phishing domain\'lerini ekleyin',
    tooltipDisableOfficeApps: '"Office 365 Apps" seçeneğini kaldırın',
    tooltipManageUrls: '"URL\'sini yönet" butonuna tıklayın',
    tooltipAddUrls: '"URL\'leri ekleyin" butonuna tıklayın',
    tooltipDone: '"Bitti" butonuna tıklayın',
    // Workflow 4, 5, 6 tooltips
    tooltipCreateNewRule: 'Create a new rule seçeneğini seçin',
    tooltipEnterRuleName: 'Kural adını girin',
    tooltipOpenApplyRuleIf: 'Apply this rule if dropdown\'ını açın',
    tooltipSelectTheSender: '"The sender" seçeneğini seçin',
    tooltipOpenIPCondition: 'IP condition için dropdown\'ı açın ve IP address ranges seçeneğini seçin',
    tooltipEnterIPsManually: 'IP adreslerini manuel olarak girin (Her satıra bir IP) ve save butonuna tıklayınız',
    tooltipOpenDoFollowing: 'Do the following dropdown\'ını açın',
    tooltipOpenSelectOne: 'Select one dropdown\'ını açın',
    tooltipSelectModifyMessageProperties: 'Modify the message properties seçeneğini seçin',
    tooltipSelectSetSCL: 'Set the spam confidence level (SCL) seçin',
    tooltipSelectBypassSpamFiltering: 'Bypass spam filtering seçin',
    tooltipClickEnterText: 'Enter text butonuna tıklayın',
    tooltipClickEnterTextAndValue: 'Enter text butonuna tıklayın ve "1" değerini girin',
    tooltipClickFirstEnterText: 'İlk Enter text butonuna tıklayın',
    tooltipClickSecondEnterText: 'İkinci Enter text butonuna tıklayın',
    tooltipEnterHeaderNameSkipSafeLinks: 'Header adını girin: X-MS-Exchange-Organization-SkipSafeLinksProcessing',
    tooltipEnterHeaderNameSkipSafeAttachment: 'Header adını girin: X-MS-Exchange-Organization-SkipSafeAttachmentProcessing',
    tooltipEnterHeaderValue: 'Header değerini girin: 1',
    tooltipClickFinish: 'Finish butonuna tıklayın',
    tooltipSubmit: 'Submit butonuna tıklayın',
    tooltipAddRule: '+ Add a rule butonuna tıklayın',
    tooltipSaveButton: 'Save butonuna tıklayın',
    tooltipAddAction: '+ (Add action) butonuna tıklayın',
    tooltipSelectFromDropdown: 'Dropdown\'dan seçeneği seçin',
    tooltipEnterBypassClutter: 'X-MS-Exchange-Organization-BypassClutter girin',
    tooltipModifyProperties: 'Modify the message properties seçin',
    tooltipSetMessageHeader: 'Set a message header seçin',
    tooltipAddRuleButton: 'Add a rule butonuna tıklayın',
    tooltipSelectOneDropdown: '"Select one" dropdown\'ını açın',
    // Validation Messages
    validationNoDomains: 'Uyarı: Hiçbir domain girmediniz!\n\nLütfen en az bir domain girin ve tekrar Continue butonuna basın.',
    validationNoIPs: 'Uyarı: Hiçbir IP adresi girmediniz!\n\nLütfen en az bir IP adresi girin ve tekrar Continue butonuna basın.',
    validationNoURLs: 'Uyarı: Hiçbir URL girmediniz!\n\nLütfen en az bir URL girin ve tekrar Continue butonuna basın.',
    validationNoRuleName: 'Uyarı: Kural adı girmediniz!\n\nLütfen bir kural adı girin ve tekrar Continue butonuna basın.',
    validationNoHeaderName: 'Uyarı: Header adı girmediniz!\n\nLütfen header adını girin (örn: X-MS-Exchange-Organization-BypassClutter) ve tekrar Continue butonuna basın.',
    validationNoHeaderValue: 'Uyarı: Header değeri girmediniz!\n\nLütfen "1" değerini girin ve tekrar Continue butonuna basın.',
    // Workflow isimleri
    workflow1Name: 'Third-Party Phishing Simulations',
    workflow2Name: 'Anti-Spam Politikaları',
    workflow3Name: 'Safe Links',
    workflow4Name: 'Spam Filter Bypass',
    workflow5Name: 'ATP Link Bypass',
    workflow6Name: 'ATP Attachment Bypass',
    // Buton metinleri
    continueToWorkflow2: 'Devam Et (Workflow 2: Anti-Spam)',
    continueToWorkflow3: 'Devam Et (Workflow 3: Safe Links)',
    continueToWorkflow4: 'Devam Et (Workflow 4: Spam Filter Bypass)',
    continueToWorkflow5: 'Devam Et (Workflow 5: ATP Link Bypass)',
    continueToWorkflow6: 'Devam Et (Workflow 6: ATP Attachment Bypass)',
    allWorkflowsCompleted: 'Tebrikler! Tüm Workflow\'lar Tamamlandı',
    // Summary
    congratulations: 'Tebrikler! Tüm Adımları Tamamladınız!',
    summaryDescription: 'Bu adımlar ile Office 365 ortamında IP adreslerini allow list\'e eklediniz ve güvenlik simülasyonları, spam filtreleme ve tehdit öncesi (ATP) özelliklerini başarıyla yapılandırdınız!',
    // Timer
    timeForThisStep: 'Bu adım için süreniz',
    timeUp: 'Süre doldu! Lütfen devam edin.',
    timeUpReady: 'Süre doldu! Hazır olduğunuzda Continue\'ya basın.',
    // IP/Domain
    whiteListIPs: 'Allow List IP Adresleri',
    domainList: 'Domain Listesi',
    manualInputRequired: 'MANUEL GİRİŞ GEREKLİ',
    howToEnter: 'NASIL GİRİLİR:',
    // Steps genel
    stepCompleted: 'Tamamlandı',
    stepPending: 'Bekliyor',
    stepError: 'Hata',
    // Workflow 2 - Anti-Spam Steps
    antispamStep1Title: 'Anti-Spam Politikalarına Git',
    antispamStep1Description: 'Anti-Spam politikalarına gitmek için "Sayfaya Git" butonuna tıklayın',
    antispamStep2Title: 'Bağlantı Filtresi Checkbox',
    antispamStep2Description: 'Bağlantı filtresi ilkesinin satırındaki checkbox\'ı seçin',
    antispamStep3Title: 'Bağlantı Filtresi İlkesi',
    antispamStep3Description: 'Bağlantı filtresi ilkesi (Varsayılan) satırına tıklayın',
    antispamStep4Title: 'Bağlantı Filtresi İlkesini Düzenle',
    antispamStep4Description: 'Bağlantı filtresi ilkesini düzenle butonuna tıklayın',
    antispamStep5Title: 'IP Adresleri Ekle',
    antispamStep5Description: 'IP adreslerini "Always allow messages from the following IP addresses" kısmına ekleyin (Her IP yeni satıra)',
    antispamStep6Title: 'Turn on Safe List',
    antispamStep6Description: '"Turn on safe list" checkbox\'ını işaretleyin',
    antispamStep7Title: 'Kaydet',
    antispamStep7Description: 'Save (Kaydet) butonuna tıklayarak işlemi tamamlayın',
    antispamSummaryTitle: 'Tamamlandı!',
    antispamSummaryDescription: 'Anti-Spam yapılandırması başarıyla tamamlandı',
    // Workflow 3 - Safe Links Steps
    safelinksStep1Title: 'Security Center',
    safelinksStep1Description: 'Microsoft Security & Compliance Center\'a gidin',
    safelinksStep2Title: 'E-posta ve İşbirliği',
    safelinksStep2Description: 'E-posta ve İşbirliği sekmesini açın',
    safelinksStep3Title: 'İlkeler ve Kurallar',
    safelinksStep3Description: 'İlkeler ve Kurallar\'a tıklayın',
    safelinksStep4Title: 'Tehdit İlkeleri',
    safelinksStep4Description: 'Tehdit İlkeleri\'ne tıklayın',
    safelinksStep5Title: 'Güvenli Bağlantılar',
    safelinksStep5Description: 'Güvenli Bağlantılar\'a tıklayın. Eğer görünmüyorsa, Microsoft Defender for Office 365 lisansı eksik olabilir.',
    safelinksStep6Title: 'Oluştur',
    safelinksStep6Description: 'Oluştur (Create) butonuna tıklayın',
    safelinksStep7Title: 'Politika Adı',
    safelinksStep7Description: 'Güvenli bağlantılar politikası için bir ad girin',
    safelinksStep8Title: 'Açıklama',
    safelinksStep8Description: 'Politika için açıklama girin',
    safelinksStep9Title: 'Sonraki',
    safelinksStep9Description: 'Sonraki (Next) butonuna tıklayın',
    safelinksStep10Title: 'Şirket Etki Alanı',
    safelinksStep10Description: 'Bu politikaya dahil edilecek şirket etki alanını seçin',
    safelinksStep11Title: 'Sonraki (2)',
    safelinksStep11Description: 'Sonraki (Next) butonuna tıklayın',
    safelinksStep12Title: 'Office 365 Apps',
    safelinksStep12Description: '"Office 365 Apps" seçeneğini KAPATIN',
    safelinksStep13Title: 'Kullanıcı Tıklamalarını İzle',
    safelinksStep13Description: '"Kullanıcı tıklamalarını izle" seçeneğini KAPATIN',
    safelinksStep14Title: 'URL\'sini Yönet',
    safelinksStep14Description: '"0 URL\'sini yönet" butonuna tıklayın',
    safelinksStep15Title: 'URL\'leri Ekleyin',
    safelinksStep15Description: '"URL\'leri ekleyin" butonuna tıklayın',
    safelinksStep16Title: 'URL Listesi',
    safelinksStep16Description: 'Whitelist edilecek phishing domain URL\'lerini *.domain.com/* formatında ekleyin',
    safelinksStep17Title: 'Kaydet',
    safelinksStep17Description: 'Kaydet (Save) butonuna tıklayın',
    safelinksStep18Title: 'Bitti',
    safelinksStep18Description: 'Bitti (Done) butonuna tıklayın',
    safelinksStep19Title: 'Sonraki (3)',
    safelinksStep19Description: 'Sonraki (Next) butonuna tıklayın',
    safelinksStep20Title: 'Sonraki (4)',
    safelinksStep20Description: 'Sonraki (Next) butonuna tıklayın',
    safelinksStep21Title: 'Gönder',
    safelinksStep21Description: 'Gönder (Submit) butonuna tıklayarak işlemi tamamlayın',
    safelinksSummaryTitle: 'Tamamlandı!',
    safelinksSummaryDescription: 'Safe Links yapılandırması tamamlandı. Birkaç saat içinde etkili olacaktır.',
    // Safe Links License Messages
    safelinksLicenseInfoTitle: 'Bilgilendirme: Safe Links Özelliği için Gerekli Lisanslar',
    safelinksLicenseMessage: 'Safe Links özelliği yalnızca aşağıdaki lisanslarla aktif hale gelir:<br><br>• <strong>Microsoft Defender for Office 365 Plan 1</strong><br>• <strong>Microsoft Defender for Office 365 Plan 2</strong><br>• <strong>Microsoft 365 E5 / A5 / G5</strong> <br><br>Bu lisanslardan biri yoksa Safe Links özelliği görünmeyecektir.',
    safelinksLicenseNotFoundTitle: 'Safe Links Bulunamadı',
    safelinksLicenseNotFoundMessage: 'Safe Links özelliği yalnızca şu lisanslarda aktif hale gelir:\n\n• Microsoft Defender for Office 365 Plan 1\n• Microsoft Defender for Office 365 Plan 2\n• Microsoft 365 E5 / A5 / G5 (bu planlarda Defender for Office 365 dahil)\n\nBu lisanslardan biri yoksa Safe Links görünmeyecektir.',
    safelinksLicenseSkipMessage: 'Safe Links bulunamadı. Lisans eksikliği nedeniyle bu adım atlanıyor ve diğer adımlara geçiliyor.',
    safelinksIfNotVisible: '🔹 Safe Links görünmüyorsa:',
    safelinksCanSkip: 'Bu adımı atlayabilir ve sonraki adımlara geçebilirsiniz.',
    // Workflow 4 - Spam Filter Bypass Steps
    spambypassStep1Title: 'Başlangıç Bilgisi',
    spambypassStep1Description: 'Spam Filter Bypass adımı başlıyor.',
    spambypassStep2Title: 'Exchange Admin Center',
    spambypassStep2Description: 'Exchange Admin Center Transport Rules sayfasına git.',
    spambypassStep3Title: 'Add a rule',
    spambypassStep3Description: '2) Add a rule\'a tıklayın.',
    spambypassStep4Title: 'Create a new rule',
    spambypassStep4Description: '3) Create a new rule seçeneğini seçin.',
    spambypassStep5Title: 'Name',
    spambypassStep5Description: '4) Kural adı girin (ör. \'Keepnet Allow List Rule\').',
    spambypassStep6Title: 'Apply this rule if',
    spambypassStep6Description: '5) Apply this rule if dropdown\'ını açın.',
    spambypassStep7Title: 'The Sender',
    spambypassStep7Description: '6) \'The sender\' seçeneğini seçin.',
    spambypassStep8Title: 'IP Address Condition',
    spambypassStep8Description: '7) "Select one" dropdown\'ını açın ve "IP address is in any of these ranges or exactly matches" seçeneğini seçin.',
    spambypassStep9Title: 'IP Adreslerini Girin',
    spambypassStep9Description: '9) IP adreslerini girin ve kaydedin.',
    spambypassStep10Title: 'Do The Following',
    spambypassStep10Description: '10) "Do the following" dropdown\'ını açın.',
    spambypassStep11Title: 'Modify Message Properties',
    spambypassStep11Description: '11) "Modify the message properties" seçeneğini seçin.',
    spambypassStep12Title: 'Select One (SCL)',
    spambypassStep12Description: '12) "Select one" dropdown\'ını açın.',
    spambypassStep13Title: 'Set SCL',
    spambypassStep13Description: '13) "set the spam confidence level (SCL)" seçeneğini seçin.',
    spambypassStep14Title: 'Bypass Spam Filtering',
    spambypassStep14Description: '14) "Bypass spam filtering" seçeneğini seçin.',
    spambypassStep15Title: 'Save',
    spambypassStep15Description: '15) Save butonuna tıklayın.',
    spambypassStep16Title: 'Yeni Kural Ekle',
    spambypassStep16Description: '16) "Do the following" alanının yanındaki + (artı) butonuna tıklayın.',
    spambypassStep17Title: 'Modify Message Properties (2. Kez)',
    spambypassStep17Description: '17) "Select one" dropdown\'ını açın ve "Modify the message properties" seçeneğini seçin.',
    spambypassStep18Title: 'Set Message Header',
    spambypassStep18Description: '18) "Select one" dropdown\'ından seçeneği seçin.',
    spambypassStep19Title: 'Enter Text',
    spambypassStep19Description: '19) "Enter text" butonuna tıklayın.',
    spambypassStep20Title: 'BypassClutter Header',
    spambypassStep20Description: '20) Header name alanına <strong>X-MS-Exchange-Organization-BypassClutter</strong> değerini girin ve kaydet tuşuna basın.',
    spambypassStep21Title: 'Enter Text and Value',
    spambypassStep21Description: '21) "Enter text" butonuna basın ve "1" değerini girin.',
    spambypassStep22Title: 'Next (1)',
    spambypassStep22Description: '22) Next butonuna basın.',
    spambypassStep23Title: 'Next (2)',
    spambypassStep23Description: '23) Tekrar Next butonuna basın.',
    spambypassStep24Title: 'Finish',
    spambypassStep24Description: '24) Finish butonuna basın.',
    spambypassSummaryTitle: 'Tamamlandı!',
    spambypassSummaryDescription: 'Spam Filter Bypass kuralı başarıyla oluşturuldu. Kuralın durumunun enabled olduğundan emin olun.',
    // Workflow 5 - ATP Link Bypass Steps
    atplinkStep1Title: 'Başlangıç Bilgisi',
    atplinkStep1Description: 'ATP Link Bypass adımı başlıyor.',
    atplinkStep2Title: 'Add a rule',
    atplinkStep2Description: '1) Add a rule butonuna tıklayın.',
    atplinkStep3Title: 'Create a new rule',
    atplinkStep3Description: '2) Create a new rule seçeneğini seçin.',
    atplinkStep4Title: 'Kural Adı',
    atplinkStep4Description: '3) Kural adı girin (ör. \'ATP Link Bypass Rule\').',
    atplinkStep5Title: 'Apply this rule if',
    atplinkStep5Description: '4) "Apply this rule if..." dropdown\'ını açın.',
    atplinkStep6Title: 'The Sender',
    atplinkStep6Description: '5) "The sender" seçeneğini seçin.',
    atplinkStep7Title: 'IP Address Condition',
    atplinkStep7Description: '6) "Select one" dropdown\'ını açın ve "IP address is in any of these ranges or exactly matches" seçin.',
    atplinkStep8Title: 'IP Adresleri',
    atplinkStep8Description: '7) IP adreslerini girin ve save butonuna tıklayınız.',
    atplinkStep9Title: 'Do The Following',
    atplinkStep9Description: '10) "Select one" dropdown\'ını açın.',
    atplinkStep10Title: 'Modify Message Properties',
    atplinkStep10Description: '10) "Modify the message properties" seçeneğini seçin.',
    atplinkStep11Title: 'Select one',
    atplinkStep11Description: '11) "Select one" dropdown\'ını açın.',
    atplinkStep12Title: 'Set a message header',
    atplinkStep12Description: '12) "Set a message header" seçeneğini seçin.',
    atplinkStep13Title: 'Enter text (1. Kez)',
    atplinkStep13Description: '13) İlk "Enter text" butonuna tıklayın.',
    atplinkStep14Title: 'Header Name',
    atplinkStep14Description: '14) Header adı alanına <strong>X-MS-Exchange-Organization-SkipSafeLinksProcessing</strong> yazın ve kaydet tuşuna basın.',
    atplinkStep15Title: 'Enter text (2. Kez)',
    atplinkStep15Description: '15) İkinci "Enter text" butonuna tıklayın.',
    atplinkStep16Title: 'Header Value',
    atplinkStep16Description: '16) Header değeri alanına "1" yazın.',
    atplinkStep17Title: 'Next (1)',
    atplinkStep17Description: '17) Next butonuna basın.',
    atplinkStep18Title: 'Next (2)',
    atplinkStep18Description: '18) Tekrar Next butonuna basın.',
    atplinkStep19Title: 'Finish',
    atplinkStep19Description: '19) Finish butonuna basın.',
    atplinkSummaryTitle: 'ATP Link Bypass Tamamlandı!',
    atplinkSummaryDescription: 'ATP Link Bypass kuralı başarıyla oluşturuldu. Şimdi Workflow 6\'ya (ATP Attachment Bypass) geçiliyor...',
    // Workflow 6 - ATP Attachment Bypass Steps
    atpattachStep1Title: 'Başlangıç Bilgisi',
    atpattachStep1Description: 'ATP Attachment Bypass adımı başlıyor.',
    atpattachStep2Title: 'Add a rule',
    atpattachStep2Description: '1) Add a rule butonuna tıklayın.',
    atpattachStep3Title: 'Create a new rule',
    atpattachStep3Description: '2) Create a new rule seçeneğini seçin.',
    atpattachStep4Title: 'Kural Adı',
    atpattachStep4Description: '3) Kural adı girin (ör. \'ATP Attachment Bypass Rule\').',
    atpattachStep5Title: 'Apply this rule if',
    atpattachStep5Description: '4) "Apply this rule if..." dropdown\'ını açın.',
    atpattachStep6Title: 'The Sender',
    atpattachStep6Description: '5) "The sender" seçeneğini seçin.',
    atpattachStep7Title: 'IP Address Condition',
    atpattachStep7Description: '6) "Select one" dropdown\'ını açın ve "IP address is in any of these ranges or exactly matches" seçin.',
    atpattachStep8Title: 'IP Adresleri',
    atpattachStep8Description: '7) IP adreslerini girin ve save butonuna tıklayınız.',
    atpattachStep9Title: 'Do the following',
    atpattachStep9Description: '9) "Do the following" dropdown\'ını açın.',
    atpattachStep10Title: 'Modify Message Properties',
    atpattachStep10Description: '10) "Modify the message properties" seçeneğini seçin.',
    atpattachStep11Title: 'Select one',
    atpattachStep11Description: '11) "Select one" dropdown\'ını açın.',
    atpattachStep12Title: 'Set a message header',
    atpattachStep12Description: '12) "Set a message header" seçeneğini seçin.',
    atpattachStep13Title: 'Enter text',
    atpattachStep13Description: '13) "Enter text" butonuna tıklayın.',
    atpattachStep15Title: 'Header Name',
    atpattachStep15Description: '14) Header adı alanına <strong>X-MS-Exchange-Organization-SkipSafeAttachmentProcessing</strong> yazın ve kaydet tuşuna basın.',
    atpattachStep16Title: 'Enter text (2. Kez)',
    atpattachStep16Description: '15) İkinci "Enter text" butonuna tıklayın.',
    atpattachStep17Title: 'Header Value',
    atpattachStep17Description: '16) Header value alanına <strong>1</strong> değerini girin.',
    atpattachStep18Title: 'Next (1)',
    atpattachStep18Description: '17) Next butonuna basın.',
    atpattachStep19Title: 'Next (2)',
    atpattachStep19Description: '18) Tekrar Next butonuna basın.',
    atpattachStep20Title: 'Finish',
    atpattachStep20Description: '19) Finish butonuna basın.',
    atpattachSummaryTitle: 'Tebrikler! Tüm Adımlar Bitti!',
    atpattachSummaryDescription: 'Tüm workflow\'lar başarıyla tamamlandı! Office 365 ortamında IP adreslerini allow list\'e eklediniz ve güvenlik simülasyonları, spam filtreleme, ATP Link ve ATP Attachment özelliklerini başarıyla yapılandırdınız!',
  },
  en: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    assistantSubtitle: '',
    step: 'Step',
    of: 'of',
    continue: 'Continue',
    previous: 'Previous',
    summary: 'Summary',
    summaryReport: 'Summary Report',
    goToPage: 'Go to Page',
    copyAll: 'Copy All',
    copyDomain: 'Copy',
    copyAllDomains: 'Copy all',
    domainListLabel: 'Domain List',
    copied: 'Copied!',
    error: 'Error',
    goAndFix: 'Go & Fix',
    workflowStep1Title: 'Security Center Home Page',
    workflowStep1Description: 'Make sure you are on Microsoft Security Center and proceed.',
    workflowStep2Title: 'Email & Collaboration',
    workflowStep2Description: 'Open the Email & Collaboration menu',
    workflowStep3Title: 'Policies & Rules',
    workflowStep3Description: 'Go to Policies & Rules page',
    workflowStep4Title: 'Threat Policies',
    workflowStep4Description: 'Click on Threat Policies',
    workflowStep5Title: 'Advanced Delivery',
    workflowStep5Description: 'Click on Advanced delivery button',
    workflowStep6Title: 'Phishing Simulation Tab',
    workflowStep6Description: 'Click on Phishing simulation tab',
    workflowStep7Title: 'Edit Button',
    workflowStep7Description: 'Click on the Edit button',
    workflowStep8Title: 'Domains',
    workflowStep8Description: 'You can enter these domains:',
    workflowStep9Title: 'IP Addresses',
    workflowStep9Description: 'Enter allow list IP addresses',
    workflowStep10Title: 'Simulation URLs',
    workflowStep10Description: 'You can enter these URLs:',
    workflowStep11Title: 'Save',
    workflowStep11Description: 'Save the changes',
    workflowStep12Title: 'Completed!',
    workflowStep12Description: 'All steps successfully completed',
    congratsTitle: 'Congratulations! You\'ve Completed All Steps!',
    congratsDesc: 'With these steps, you\'ve successfully added IP addresses to your Office 365 allow list and<br>configured security simulations, spam filtering, and Advanced Threat Protection (ATP) features!',
    workflowsCompleted: '6 Workflows',
    stepsSuccessful: '62 Steps',
    importantWarning: 'Important Warning',
    warningFromStep3: 'Do NOT click the extension from step 3 onwards',
    warningLine1: '• Continue by opening extension when form closes',
    warningLine2: '• Pay attention to on-screen highlights',
    warningLine3: '• 5 second wait between each step',
    allScreenshotsSaved: 'All screenshots saved in chrome.storage',
    screenshotSaved: 'Screenshot saved',
    successful: 'Successful',
    remainingTime: 'Remaining Time',
    saveButton: 'Click SAVE Button',
    clickToSave: 'Click to save',
    clickHere: 'write here',
    valueEntered: 'value entered',
    nowSelect: 'Now',
    selectOption: 'option',
    selectThisOption: 'this option',
    selectIPAddressRanges: 'IP address is in any of these ranges" option',
    tooltipEmailCollab: 'Click on Email & Collaboration',
    tooltipPolicies: 'Click on Policies & Rules',
    tooltipThreatPolicies: 'Click on Threat Policies',
    tooltipAdvancedDelivery: 'Click on Advanced delivery',
    tooltipPhishingSim: 'Click on Phishing simulation tab',
    tooltipEdit: 'Click on Edit button',
    tooltipDomains: 'Enter domains',
    tooltipIPs: 'Enter allow list IP addresses',
    tooltipURLs: 'Enter simulation URLs',
    tooltipSave: 'Click on Save button',
    tooltipConnectionFilterCheckbox: 'Select Connection Filter Policy checkbox',
    tooltipConnectionFilterPolicy: 'Click on Connection filter policy',
    tooltipEditConnectionFilter: 'Click on Edit connection filter policy',
    tooltipAddIPs: 'Enter IP addresses (One IP per line)',
    tooltipSafeList: 'Check Turn on safe list checkbox',
    tooltipSafeLinks: 'Click on Safe Links',
    tooltipCreate: 'Click on Create button',
    tooltipName: 'Enter name',
    tooltipPolicyName: 'Enter policy name',
    tooltipDescription: 'Enter description',
    tooltipNext: 'Click on Next button',
    tooltipAddDomain: 'Add domain',
    tooltipClickNext: 'Click Next',
    tooltipRemoveTrack: 'Remove Track user clicks option',
    tooltipAddPhishingDomains: 'Add phishing domains',
    tooltipDisableOfficeApps: 'Turn OFF "Office 365 Apps" option',
    tooltipManageUrls: 'Click on "Manage URLs" button',
    tooltipAddUrls: 'Click on "Add URLs" button',
    tooltipDone: 'Click on "Done" button',
    // Workflow 4, 5, 6 tooltips
    tooltipCreateNewRule: 'Select Create a new rule option',
    tooltipEnterRuleName: 'Enter rule name',
    tooltipOpenApplyRuleIf: 'Open Apply this rule if dropdown',
    tooltipSelectTheSender: 'Select "The sender" option',
    tooltipOpenIPCondition: 'Open IP condition dropdown and select IP address ranges option',
    tooltipEnterIPsManually: 'Enter IP addresses manually (One IP per line) and click save button',
    tooltipOpenDoFollowing: 'Open Do the following dropdown',
    tooltipOpenSelectOne: 'Open Select one dropdown',
    tooltipSelectModifyMessageProperties: 'Select Modify the message properties option',
    tooltipSelectSetSCL: 'Select set the spam confidence level (SCL)',
    tooltipSelectBypassSpamFiltering: 'Select Bypass spam filtering',
    tooltipClickEnterText: 'Click on Enter text button',
    tooltipClickEnterTextAndValue: 'Click Enter text button and enter "1" value',
    tooltipClickFirstEnterText: 'Click on first Enter text button',
    tooltipClickSecondEnterText: 'Click on second Enter text button',
    tooltipEnterHeaderNameSkipSafeLinks: 'Enter header name: X-MS-Exchange-Organization-SkipSafeLinksProcessing',
    tooltipEnterHeaderNameSkipSafeAttachment: 'Enter header name: X-MS-Exchange-Organization-SkipSafeAttachmentProcessing',
    tooltipEnterHeaderValue: 'Enter header value: 1',
    tooltipClickFinish: 'Click on Finish button',
    tooltipSubmit: 'Click on Submit button',
    tooltipAddRule: 'Click on + Add a rule button',
    tooltipSaveButton: 'Click on Save button',
    tooltipAddAction: 'Click on + (Add action) button',
    tooltipSelectFromDropdown: 'Select option from dropdown',
    tooltipEnterBypassClutter: 'Enter X-MS-Exchange-Organization-BypassClutter',
    tooltipModifyProperties: 'Select Modify the message properties',
    tooltipSetMessageHeader: 'Select Set a message header',
    tooltipAddRuleButton: 'Click on Add a rule button',
    tooltipSelectOneDropdown: 'Open "Select one" dropdown',
    // Validation Messages
    validationNoDomains: 'Warning: You haven\'t entered any domains!\n\nPlease enter at least one domain and click Continue again.',
    validationNoIPs: 'Warning: You haven\'t entered any IP addresses!\n\nPlease enter at least one IP address and click Continue again.',
    validationNoURLs: 'Warning: You haven\'t entered any URLs!\n\nPlease enter at least one URL and click Continue again.',
    validationNoRuleName: 'Warning: You haven\'t entered a rule name!\n\nPlease enter a rule name and click Continue again.',
    validationNoHeaderName: 'Warning: You haven\'t entered a header name!\n\nPlease enter the header name (e.g., X-MS-Exchange-Organization-BypassClutter) and click Continue again.',
    validationNoHeaderValue: 'Warning: You haven\'t entered a header value!\n\nPlease enter "1" and click Continue again.',
    // Workflow names
    workflow1Name: 'Third-Party Phishing Simulations',
    workflow2Name: 'Anti-Spam Policies',
    workflow3Name: 'Safe Links',
    workflow4Name: 'Spam Filter Bypass',
    workflow5Name: 'ATP Link Bypass',
    workflow6Name: 'ATP Attachment Bypass',
    // Button texts
    continueToWorkflow2: 'Continue (Workflow 2: Anti-Spam)',
    continueToWorkflow3: 'Continue (Workflow 3: Safe Links)',
    continueToWorkflow4: 'Continue (Workflow 4: Spam Filter Bypass)',
    continueToWorkflow5: 'Continue (Workflow 5: ATP Link Bypass)',
    continueToWorkflow6: 'Continue (Workflow 6: ATP Attachment Bypass)',
    allWorkflowsCompleted: 'Congratulations! All Workflows Completed',
    // Summary
    congratulations: 'Congratulations! You Have Completed All Steps!',
    summaryDescription: 'With these steps, you have added IP addresses to your Office 365 allow list and successfully configured security simulations, spam filtering, and Advanced Threat Protection (ATP) features!',
    // Timer
    timeForThisStep: 'Time for this step',
    timeUp: 'Time is up! Please continue.',
    timeUpReady: 'Time is up! Click Continue when ready.',
    // IP/Domain
    whiteListIPs: 'Allow List IP Addresses',
    domainList: 'Domain List',
    manualInputRequired: 'MANUAL INPUT REQUIRED',
    howToEnter: 'HOW TO ENTER:',
    // Steps general
    stepCompleted: 'Completed',
    stepPending: 'Pending',
    stepError: 'Error',
    // Workflow 2 - Anti-Spam Steps
    antispamStep1Title: 'Go to Anti-Spam Policies',
    antispamStep1Description: 'Click "Go to Page" button to navigate to Anti-Spam policies',
    antispamStep2Title: 'Connection Filter Policy Checkbox',
    antispamStep2Description: 'Select the checkbox for Connection Filter Policy row',
    antispamStep3Title: 'Connection Filter Policy',
    antispamStep3Description: 'Click on Connection filter policy (Default) row',
    antispamStep4Title: 'Edit Connection Filter',
    antispamStep4Description: 'Click on Edit connection filter policy button',
    antispamStep5Title: 'Add IP Addresses',
    antispamStep5Description: 'Add IP addresses to "Always allow messages from the following IP addresses" section (One IP per line)',
    antispamStep6Title: 'Turn on Safe List',
    antispamStep6Description: 'Check the "Turn on safe list" checkbox',
    antispamStep7Title: 'Save',
    antispamStep7Description: 'Complete the process by clicking Save button',
    antispamSummaryTitle: 'Completed!',
    antispamSummaryDescription: 'Anti-Spam configuration successfully completed',
    // Workflow 3 - Safe Links Steps
    safelinksStep1Title: 'Security Center',
    safelinksStep1Description: 'Go to Microsoft Security & Compliance Center',
    safelinksStep2Title: 'Email & Collaboration',
    safelinksStep2Description: 'Open Email & Collaboration tab',
    safelinksStep3Title: 'Policies & Rules',
    safelinksStep3Description: 'Click on Policies and rules',
    safelinksStep4Title: 'Threat Policies',
    safelinksStep4Description: 'Click on Threat Policies',
    safelinksStep5Title: 'Safe Links',
    safelinksStep5Description: 'Click on Safe Links. If it is not visible, Microsoft Defender for Office 365 license may be missing.',
    safelinksStep6Title: 'Create',
    safelinksStep6Description: 'Click on Create button',
    safelinksStep7Title: 'Policy Name',
    safelinksStep7Description: 'Enter a name for your Safe Links policy',
    safelinksStep8Title: 'Description',
    safelinksStep8Description: 'Enter a description for the policy',
    safelinksStep9Title: 'Next',
    safelinksStep9Description: 'Click on Next button',
    safelinksStep10Title: 'Company Domain',
    safelinksStep10Description: 'Select the company domain to include in this policy',
    safelinksStep11Title: 'Next (2)',
    safelinksStep11Description: 'Click on Next button',
    safelinksStep12Title: 'Office 365 Apps',
    safelinksStep12Description: 'TURN OFF "Office 365 Apps" option',
    safelinksStep13Title: 'Track User Clicks',
    safelinksStep13Description: 'TURN OFF "Track user clicks" option',
    safelinksStep14Title: 'Manage URLs',
    safelinksStep14Description: 'Click on "Manage URLs" button',
    safelinksStep15Title: 'Add URLs',
    safelinksStep15Description: 'Click on "Add URLs" button',
    safelinksStep16Title: 'URL List',
    safelinksStep16Description: 'Add phishing domains in *.domain.com/* wildcard format',
    safelinksStep17Title: 'Save',
    safelinksStep17Description: 'Click on Save button',
    safelinksStep18Title: 'Done',
    safelinksStep18Description: 'Click on Done button',
    safelinksStep19Title: 'Next (3)',
    safelinksStep19Description: 'Click on Next button',
    safelinksStep20Title: 'Next (4)',
    safelinksStep20Description: 'Click on Next button',
    safelinksStep21Title: 'Submit',
    safelinksStep21Description: 'Complete the process by clicking Submit',
    safelinksSummaryTitle: 'Completed!',
    safelinksSummaryDescription: 'Safe Links configuration completed. It will be effective within a few hours.',
    // Safe Links License Messages
    safelinksLicenseInfoTitle: 'Information: Required Licenses for Safe Links Feature',
    safelinksLicenseMessage: 'Safe Links feature is only available with the following licenses:<br><br>• <strong>Microsoft Defender for Office 365 Plan 1</strong><br>• <strong>Microsoft Defender for Office 365 Plan 2</strong><br>• <strong>Microsoft 365 E5 / A5 / G5</strong> <br><br>If you don\'t have one of these licenses, Safe Links feature will not be visible.',
    safelinksLicenseNotFoundTitle: 'Safe Links Not Found',
    safelinksLicenseNotFoundMessage: 'Safe Links feature is only available with the following licenses:\n\n• Microsoft Defender for Office 365 Plan 1\n• Microsoft Defender for Office 365 Plan 2\n• Microsoft 365 E5 / A5 / G5 (Defender for Office 365 is included in these plans)\n\nIf you don\'t have one of these licenses, Safe Links will not be visible.',
    safelinksLicenseSkipMessage: 'Safe Links not found. Skipping this step due to license requirement and proceeding to next steps.',
    safelinksIfNotVisible: '🔹 If Safe Links is not visible:',
    safelinksCanSkip: 'You can skip this step and proceed to next steps.',
    // Workflow 4 - Spam Filter Bypass Steps
    spambypassStep1Title: 'Getting Started',
    spambypassStep1Description: 'Spam Filter Bypass steps starting. Please read the important warnings below.',
    spambypassStep2Title: 'Exchange Admin Center',
    spambypassStep2Description: 'Go to Exchange Admin Center Transport Rules page.',
    spambypassStep3Title: 'Add a rule',
    spambypassStep3Description: '2) Click on Add a rule.',
    spambypassStep4Title: 'Create a new rule',
    spambypassStep4Description: '3) Select Create a new rule option.',
    spambypassStep5Title: 'Name',
    spambypassStep5Description: '4) Enter rule name (e.g. \'Keepnet Allow List Rule\').',
    spambypassStep6Title: 'Apply this rule if',
    spambypassStep6Description: '5) Open Apply this rule if dropdown.',
    spambypassStep7Title: 'The Sender',
    spambypassStep7Description: '6) Select \'The sender\' option.',
    spambypassStep8Title: 'IP Address Condition',
    spambypassStep8Description: '7) Open "Select one" dropdown and select "IP address is in any of these ranges or exactly matches" option.',
    spambypassStep9Title: 'Enter IP Addresses',
    spambypassStep9Description: '9) Enter IP addresses and save.',
    spambypassStep10Title: 'Do The Following',
    spambypassStep10Description: '10) Open "Do the following" dropdown.',
    spambypassStep11Title: 'Modify Message Properties',
    spambypassStep11Description: '11) Select "Modify the message properties" option.',
    spambypassStep12Title: 'Select One (SCL)',
    spambypassStep12Description: '12) Open "Select one" dropdown.',
    spambypassStep13Title: 'Set SCL',
    spambypassStep13Description: '13) Select "set the spam confidence level (SCL)" option.',
    spambypassStep14Title: 'Bypass Spam Filtering',
    spambypassStep14Description: '14) Select "Bypass spam filtering" option.',
    spambypassStep15Title: 'Save',
    spambypassStep15Description: '15) Click on Save button.',
    spambypassStep16Title: 'Add New Rule',
    spambypassStep16Description: '16) Click on + (plus) button next to "Do the following" field.',
    spambypassStep17Title: 'Modify Message Properties (2nd Time)',
    spambypassStep17Description: '17) Open "Select one" dropdown and select "Modify the message properties" option.',
    spambypassStep18Title: 'Set Message Header',
    spambypassStep18Description: '18) Select option from "Select one" dropdown.',
    spambypassStep19Title: 'Enter Text',
    spambypassStep19Description: '19) Click on "Enter text" button.',
    spambypassStep20Title: 'BypassClutter Header',
    spambypassStep20Description: '20) Enter <strong>X-MS-Exchange-Organization-BypassClutter</strong> in Header name field and click save button.',
    spambypassStep21Title: 'Enter Text and Value',
    spambypassStep21Description: '21) Click "Enter text" button and enter "1" value.',
    spambypassStep22Title: 'Next (1)',
    spambypassStep22Description: '22) Click Next button.',
    spambypassStep23Title: 'Next (2)',
    spambypassStep23Description: '23) Click Next button again.',
    spambypassStep24Title: 'Finish',
    spambypassStep24Description: '24) Click Finish button.',
    spambypassSummaryTitle: 'Completed!',
    spambypassSummaryDescription: 'Spam Filter Bypass rule successfully created. Make sure the rule status is enabled.',
    // Workflow 5 - ATP Link Bypass Steps
    atplinkStep1Title: 'Getting Started',
    atplinkStep1Description: 'ATP Link Bypass steps starting.',
    atplinkStep2Title: 'Add a rule',
    atplinkStep2Description: '1) Click on Add a rule button.',
    atplinkStep3Title: 'Create a new rule',
    atplinkStep3Description: '2) Select Create a new rule option.',
    atplinkStep4Title: 'Rule Name',
    atplinkStep4Description: '3) Enter rule name (e.g. \'ATP Link Bypass Rule\').',
    atplinkStep5Title: 'Apply this rule if',
    atplinkStep5Description: '4) Open "Apply this rule if..." dropdown.',
    atplinkStep6Title: 'The Sender',
    atplinkStep6Description: '5) Select "The sender" option.',
    atplinkStep7Title: 'IP Address Condition',
    atplinkStep7Description: '6) Open "Select one" dropdown and select "IP address is in any of these ranges or exactly matches".',
    atplinkStep8Title: 'IP Addresses',
    atplinkStep8Description: '7) Enter IP addresses and click save button.',
    atplinkStep9Title: 'Do The Following',
    atplinkStep9Description: '10) Open "Select one" dropdown.',
    atplinkStep10Title: 'Modify Message Properties',
    atplinkStep10Description: '10) Select "Modify the message properties" option.',
    atplinkStep11Title: 'Select one',
    atplinkStep11Description: '11) Open "Select one" dropdown.',
    atplinkStep12Title: 'Set a message header',
    atplinkStep12Description: '12) Select "Set a message header" option.',
    atplinkStep13Title: 'Enter text (1st Time)',
    atplinkStep13Description: '13) Click on first "Enter text" button.',
    atplinkStep14Title: 'Header Name',
    atplinkStep14Description: '14) Enter <strong>X-MS-Exchange-Organization-SkipSafeLinksProcessing</strong> in Header name field and click save button.',
    atplinkStep15Title: 'Enter text (2nd Time)',
    atplinkStep15Description: '15) Click on second "Enter text" button.',
    atplinkStep16Title: 'Header Value',
    atplinkStep16Description: '16) Enter "1" in Header value field.',
    atplinkStep17Title: 'Next (1)',
    atplinkStep17Description: '17) Click Next button.',
    atplinkStep18Title: 'Next (2)',
    atplinkStep18Description: '18) Click Next button again.',
    atplinkStep19Title: 'Finish',
    atplinkStep19Description: '19) Click Finish button.',
    atplinkSummaryTitle: 'ATP Link Bypass Completed!',
    atplinkSummaryDescription: 'ATP Link Bypass rule successfully created. Now proceeding to Workflow 6 (ATP Attachment Bypass)...',
    // Workflow 6 - ATP Attachment Bypass Steps
    atpattachStep1Title: 'Getting Started',
    atpattachStep1Description: 'ATP Attachment Bypass steps starting.',
    atpattachStep2Title: 'Add a rule',
    atpattachStep2Description: '1) Click on Add a rule button.',
    atpattachStep3Title: 'Create a new rule',
    atpattachStep3Description: '2) Select Create a new rule option.',
    atpattachStep4Title: 'Rule Name',
    atpattachStep4Description: '3) Enter rule name (e.g. \'ATP Attachment Bypass Rule\').',
    atpattachStep5Title: 'Apply this rule if',
    atpattachStep5Description: '4) Open "Apply this rule if..." dropdown.',
    atpattachStep6Title: 'The Sender',
    atpattachStep6Description: '5) Select "The sender" option.',
    atpattachStep7Title: 'IP Address Condition',
    atpattachStep7Description: '6) Open "Select one" dropdown and select "IP address is in any of these ranges or exactly matches".',
    atpattachStep8Title: 'IP Addresses',
    atpattachStep8Description: '7) Enter IP addresses and click save button.',
    atpattachStep9Title: 'Do the following',
    atpattachStep9Description: '9) Open "Do the following" dropdown.',
    atpattachStep10Title: 'Modify Message Properties',
    atpattachStep10Description: '10) Select "Modify the message properties" option.',
    atpattachStep11Title: 'Select one',
    atpattachStep11Description: '11) Open "Select one" dropdown.',
    atpattachStep12Title: 'Set a message header',
    atpattachStep12Description: '12) Select "Set a message header" option.',
    atpattachStep13Title: 'Enter text',
    atpattachStep13Description: '13) Click on "Enter text" button.',
    atpattachStep15Title: 'Header Name',
    atpattachStep15Description: '14) Enter <strong>X-MS-Exchange-Organization-SkipSafeAttachmentProcessing</strong> in Header name field and click save button.',
    atpattachStep16Title: 'Enter text (2nd Time)',
    atpattachStep16Description: '15) Click on second "Enter text" button.',
    atpattachStep17Title: 'Header Value',
    atpattachStep17Description: '16) Enter <strong>1</strong> in Header value field.',
    atpattachStep18Title: 'Next (1)',
    atpattachStep18Description: '17) Click Next button.',
    atpattachStep19Title: 'Next (2)',
    atpattachStep19Description: '18) Click Next button again.',
    atpattachStep20Title: 'Finish',
    atpattachStep20Description: '19) Click Finish button.',
    atpattachSummaryTitle: 'Congratulations! All Steps Completed!',
    atpattachSummaryDescription: 'All workflows successfully completed! You have added IP addresses to your Office 365 allow list and successfully configured security simulations, spam filtering, ATP Link and ATP Attachment features!',
  }
}

// Current language (will be loaded from storage)
let CURRENT_LANGUAGE = 'en'

// Load language preference from storage
async function loadLanguagePreference() {
  try {
    const result = await chrome.storage.local.get(['keepnet_language'])
    const savedLang = result.keepnet_language
    const userLang = chrome.i18n.getUILanguage().split('-')[0] // Get 'en' from 'en-US'
    const supportedLangs = ['tr', 'en']
    CURRENT_LANGUAGE = savedLang || (supportedLangs.includes(userLang) ? userLang : 'en')
    console.log('[i18n] Language loaded:', CURRENT_LANGUAGE)
    
    // Update chrome.i18n locale if different
    if (CURRENT_LANGUAGE !== chrome.i18n.getUILanguage().split('-')[0]) {
      // Note: chrome.i18n.getUILanguage() is read-only, we'll use storage
    }
    
    LANGUAGE = CURRENT_LANGUAGE
    return CURRENT_LANGUAGE
  } catch (error) {
    console.warn('[i18n] Error loading language preference:', error)
    CURRENT_LANGUAGE = 'en'
    LANGUAGE = 'en'
    return 'en'
  }
}

// Simple i18n helper - uses chrome.i18n API when available, falls back to MESSAGES
function i18n(key) {
  try {
    // For dynamic language support, use MESSAGES object first
    // This allows switching languages without reload
    const message = MESSAGES[CURRENT_LANGUAGE]?.[key] || MESSAGES.tr?.[key]
    if (message) {
      return message
    }
    
    // Fallback to chrome.i18n (works for default locale)
    const chromeMessage = chrome.i18n.getMessage(key)
    if (chromeMessage && chromeMessage !== key && chromeMessage.length > 0) {
      return chromeMessage
    }
    
    // If no message found, return key
    if (key !== undefined) {
      console.warn('[i18n] Key not found:', key, 'Current language:', CURRENT_LANGUAGE, 'Available keys:', Object.keys(MESSAGES[CURRENT_LANGUAGE] || {}).slice(0, 10))
    }
    return key
  } catch (error) {
    console.warn('[i18n] Error getting message for key:', key, error)
    return key
  }
}

// Change language function
async function changeLanguage(newLang) {
  try {
    console.log('[i18n] Changing language from', CURRENT_LANGUAGE, 'to', newLang)
    CURRENT_LANGUAGE = newLang
    LANGUAGE = CURRENT_LANGUAGE
    await chrome.storage.local.set({ keepnet_language: newLang })
    console.log('[i18n] Language changed to', CURRENT_LANGUAGE)
    
    // Notify content script to re-render UI
    if (window.assistant && window.assistant.updateUILanguage) {
      await window.assistant.updateUILanguage(newLang)
    }
  } catch (error) {
    console.error('[i18n] Error changing language:', error)
  }
}

/* ========== SPESIFIK AKIŞ: Third-Party Phishing Simulations ========== */
const WORKFLOW_STEPS = [
  {
    id: 1,
    name: 'step1_home',
    title: 'workflowStep1Title',
    description: 'workflowStep1Description',
    navigate: 'https://security.microsoft.com/homepage',
    validation: () => true,
    hideInSummary: true,  // Summary'de gösterme
    // Açılış ekranını göstermeden otomatik ilerle
    skipUI: true,
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 1000,
    hideButtons: true
  },
  {
    id: 2,
    name: 'step2_emailcollab',
    title: 'workflowStep2Title',
    description: 'workflowStep2Description',
    target: {
      selector: 'button[aria-label="E-posta ve işbirliği"]',
      fallback: [
        'button[aria-label*="E-posta"]',
        'button[aria-label*="Email"]',
        'button#Group_200_id12',
        'button#Group_150_id12',
        'button[data-icon-name="Mail"]'
      ]
    },
    tooltip: 'tooltipEmailCollab',
    autoClick: true,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'step3_policies',
    title: 'workflowStep3Title',
    description: 'workflowStep3Description',
    target: {
      selector: 'a[href*="securitypoliciesandrules"]',
      textMatch: /İlkeler ve kurallar|Policies & rules/i,
      fallback: [
        'a[data-automation-id*="securitypoliciesandrules"]',
        'a[href*="policy"]',
        'span:contains("İlkeler")'
      ]
    },
    tooltip: 'tooltipPolicies',
    autoClick: false,  // Kullanıcı manuel tıklasın
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'step4_threat_policies',
    title: 'workflowStep4Title',
    description: 'workflowStep4Description',
    target: {
      selector: 'a[href*="threatpolicy"]',
      textMatch: /Tehdit ilkeleri|Threat policies/i,
      fallback: [
        'a[data-automation-id*="threatpolicy"]',
        'span:contains("Tehdit ilkeleri")',
        'a:contains("Threat")'
      ]
    },
    tooltip: 'tooltipThreatPolicies',
    autoClick: false,  // Kullanıcı manuel tıklasın
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 5,
    name: 'step5_advanced_delivery',
    title: 'workflowStep5Title',
    description: 'workflowStep5Description',
    target: {
      selector: 'button[aria-label*="OverridePolicy"]',
      textMatch: /(Advanced delivery|Gelişmiş teslim)/i,
      fallback: [
        'button.ms-Link.root-1170',
        'button.ms-Link[aria-label*="Gelişmiş teslim"]',
        'button.ms-Link[aria-label*="Advanced delivery"]',
        'button.ms-Link',
        'button[type="button"]'
      ]
    },
    tooltip: 'tooltipAdvancedDelivery',
    autoClick: false,  // Kullanıcı manuel tıklasın
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 6,
    name: 'step6_phishing_simulation',
    title: 'workflowStep6Title',
    description: 'workflowStep6Description',
    target: {
      selector: 'span.ms-Pivot-text',
      textMatch: /Kimlik avı simülasyonu|Phishing simulation/i,
      fallback: [
        'span.ms-Pivot-text:contains("Kimlik avı simülasyonu")',
        'button[role="tab"]',
        '[data-automation-id*="phishing"]',
        '.ms-Pivot button'
      ]
    },
    tooltip: 'tooltipPhishingSim',
    autoClick: true,
    validation: () => true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'step7_edit_button',
    title: 'workflowStep7Title',
    description: 'workflowStep7Description',
    target: {
      selector: 'button[aria-label*="Düzenle"]',
      textMatch: /Düzenle/i,
      fallback: [
        'span.ms-Button-label',
        'button.ms-Button',
        'button[type="button"]'
      ]
    },
    tooltip: 'tooltipEdit',
    autoClick: true,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'step8_domains_input',
    title: 'workflowStep8Title',
    description: 'workflowStep8Description',
    target: {
      selector: 'label.ms-Label',
      textMatch: /(Etki Alanı|Domain|Domain Name|Accepted domain)/i,
      fallback: [
        'label.ms-Label.root-995',
        'label.ms-Label.root-1229',
        'input[aria-label="Etki alanları"]',
        'input[aria-label*="domain"]',
        'input.ms-BasePicker-input'
      ]
    },
    tooltip: 'tooltipDomains',
    autoClick: false,
    autoAdvance: false,  // Manuel Continue butonuna basılmalı
    validation: () => true,
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 500
  },
  {
    id: 8,
    name: 'step9_ip_input',
    title: 'workflowStep9Title',
    description: 'workflowStep9Description',
    target: {
      selector: 'label.ms-Label',
      textMatch: /(IP gönderiliyor|Sending IP|Sender IP|IP address)/i,
      fallback: [
        'label.ms-Label.root-1229',
        'label.ms-Label:contains("IP gönderiliyor")',
        'label.ms-Label:contains("Sending IP")',
        'input#TextField527[data-automation-id="SenderIpRanges_Input"]',
        'input[data-automation-id="SenderIpRanges_Input"]',
        'input#TextField527',
        'input.ms-TextField-field.field-681',
        'input[aria-label="IP picker"]',
        'input.ms-BasePicker-input',
        'input[id*="combobox"][aria-label*="IP"]'
      ]
    },
    tooltip: 'tooltipIPs',
    autoClick: false,
    autoAdvance: false,  // Manuel Continue butonuna basılmalı
    validation: () => true,
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 500
  },

  {
    id: 9,
    name: 'step10_simulation_urls_input',
    title: 'workflowStep10Title',
    description: 'workflowStep10Description',
    target: {
      selector: 'label.ms-Label',
      textMatch: /(İzin verilen simülasyon URL’leri|İzin verilen simülasyon URL'leri|Simülasyon URL|Simulation URL)/i,
      fallback: [
        'label.ms-Label.root-985',
        'label.ms-Label:contains("İzin verilen simülasyon URL")',
        'label.ms-Label:contains("Simulation URL")',
        'input[aria-label="URL picker"]',
        'input.ms-BasePicker-input'
      ]
    },
    tooltip: 'tooltipURLs',
    autoClick: false,
    autoAdvance: false,  // Manuel Continue butonuna basılmalı
    validation: () => true,
    realTimeValidation: true,
    criticalStep: false,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'step11_save',
    title: 'workflowStep11Title',
    description: 'workflowStep11Description',
    target: {
      selector: 'button:has(span.ms-Button-label:contains("Save"))',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'span.ms-Button-label[id*="id__"]',
        'button[aria-label*="Save"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipSave',
    autoClick: true,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 11,
    name: 'step12_summary',
    title: 'workflowStep12Title',
    description: 'workflowStep12Description',
    isSummary: true
  }
]
/* ========== WORKFLOW 2: Threat Policies - Anti-Spam ========== */
const THREAT_POLICIES_STEPS = [
    {
      id: 1,
      name: 'antispam_step1_navigate',
      title: 'antispamStep1Title',
      description: 'antispamStep1Description',
      navigate: 'https://security.microsoft.com/antispam',
      validation: () => true,
      isNavigation: true,
      autoAdvance: false, // Workflow 2: adım geçişi her zaman manuel olsun
      hideInSummary: true  // Summary'de gösterme
    },
    {
      id: 2,
      name: 'antispam_step2_select_checkbox',
      title: 'antispamStep2Title',
      description: 'antispamStep2Description',
      target: {
        selector: 'span.scc-list-first-column',
        textMatch: /Bağlantı filtresi ilkesi.*Varsayılan|Connection filter policy.*Default/i,
        fallback: [
          'span.scc-list-first-column.css-201',
          'div[data-automationid="DetailsRowCell"] span.scc-list-first-column',
          'span.scc-list-first-column',
          'div.ms-DetailsRow-cell span'
        ]
      },
      tooltip: 'tooltipConnectionFilterCheckbox',
      autoClick: true,
      autoAdvance: false, // Kullanıcı panelden Continue ile ilerlesin
      disableHighlight: false,
      waitForChecked: true,
      findCheckboxFromRow: true, // Özel flag: satırdan checkbox bul
      validation: async function() {
        // "Bağlantı filtresi ilkesi (Varsayılan)" satırını bul
        const rowText = Array.from(document.querySelectorAll('span.scc-list-first-column')).find(span => {
          const text = span.textContent || span.innerText || ''
          return /Bağlantı filtresi ilkesi.*Varsayılan|Connection filter policy.*Default/i.test(text)
        })
        
        if (!rowText) {
          console.warn('[Keepnet] Connection filter policy row not found')
          return false
        }
        
        // Satırın parent container'ını bul (DetailsRow)
        let rowContainer = rowText.closest('div[data-automationid="DetailsRow"]') ||
                          rowText.closest('div.ms-DetailsRow') ||
                          rowText.closest('div[role="row"]') ||
                          rowText.parentElement?.parentElement
        
        if (!rowContainer) {
          console.warn('[Keepnet] Row container not found')
          return false
        }
        
        // Container içinde checkbox'ı bul - yeni HTML yapısına göre
        // Checkbox artık direkt data-selection-toggle="true" attribute'una sahip
        const checkbox = rowContainer.querySelector('div[role="radio"][data-automationid="DetailsRowCheck"][data-selection-toggle="true"]') ||
                         rowContainer.querySelector('div[aria-label="Satır seç"][data-automationid="DetailsRowCheck"][data-selection-toggle="true"]') ||
                         rowContainer.querySelector('div.ms-DetailsRow-check[data-automationid="DetailsRowCheck"][data-selection-toggle="true"]') ||
                         rowContainer.querySelector('div[role="radio"][data-automationid="DetailsRowCheck"]')
        
        if (!checkbox) {
          console.warn('[Keepnet] Checkbox not found in row container')
          return false
        }
        
        const isChecked = checkbox.getAttribute('aria-checked') === 'true'
        console.log(`[Keepnet] Checkbox validation: aria-checked="${checkbox.getAttribute('aria-checked')}", isChecked=${isChecked}`)
        return isChecked
      },
      waitAfterClick: 1000, // Diğer adımlar gibi 1 saniye
      panelPosition: 'bottom-left'
    },
    {
      id: 3,
      name: 'antispam_step3_click_row',
      title: 'antispamStep3Title',
      description: 'antispamStep3Description',
      target: {
        selector: 'span.scc-list-first-column',
        textMatch: /Bağlantı filtresi ilkesi|Connection filter policy/i,
        fallback: [
          'span.scc-list-first-column.css-201',
          'div[data-automationid="DetailsRowCell"] span.scc-list-first-column',
          'span.scc-list-first-column',
          'div.ms-DetailsRow-cell span'
        ]
      },
      tooltip: 'tooltipConnectionFilterPolicy',
      autoClick: false,
      autoAdvance: false,
      validation: () => true,
      waitAfterClick: 1000,
      panelPosition: 'bottom-left'
    },
  {
    id: 4,
    name: 'antispam_step4_edit_button',
    title: 'antispamStep4Title',
    description: 'antispamStep4Description',
    target: {
      selector: 'button[aria-label*="Bağlantı filtresi ilkesini düzenle"]',
      textMatch: /Bağlantı filtresi ilkesini düzenle|Edit connection filter/i,
      fallback: [
        'button.ms-Link.root-1011:contains("Bağlantı filtresi ilkesini düzenle")',
        'button[aria-label*="Edit connection"]',
        'button.ms-Link[aria-label*="Edit"]'
      ]
    },
    tooltip: 'tooltipEditConnectionFilter',
    autoClick: false,
    autoAdvance: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 5,
    name: 'antispam_step5_add_ips',
    title: 'antispamStep5Title',
    description: 'antispamStep5Description',
    target: {
      selector: 'label.ms-Label[style*="margin-top"]',
      textMatch: /Always allow messages/i,
      fallback: [
        'input.ms-BasePicker-input',
        'textarea.ms-TextField-field',
        'textarea',
        'input[type="text"]'
      ]
    },
    tooltip: 'tooltipAddIPs',
    autoClick: false,
    autoAdvance: false,
    validation: () => true,
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 500,
    isLabelStep: true  // Bu step label içeriyor, input'u bul
  },
  {
    id: 6,
    name: 'antispam_step6_safe_list',
    title: 'antispamStep6Title',
    description: 'antispamStep6Description',
    target: {
      selector: 'label.ms-Checkbox-label[for*="checkbox"]',
      textMatch: /Turn on safe list/i,
      fallback: [
        'input[type="checkbox"]',
        '.ms-Checkbox-label',
        '.ms-Checkbox input'
      ]
    },
    tooltip: 'tooltipSafeList',
    autoClick: false,
    autoAdvance: false,
    validation: () => true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'antispam_step7_save',
    title: 'antispamStep7Title',
    description: 'antispamStep7Description',
    target: {
      selector: 'span.ms-Button-label:contains("Kaydet"), span.ms-Button-label:contains("Save")',
      textMatch: /Kaydet|Save/i,
      fallback: [
        'button[aria-label*="Save"]',
        'button.ms-Button--primary',
        'span.ms-Button-label'
      ]
    },
    tooltip: 'tooltipSaveButton',
    autoClick: false,
    autoAdvance: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'antispam_summary',
    title: 'antispamSummaryTitle',
    description: 'antispamSummaryDescription',
    isSummary: true
  }
]

/* ========== WORKFLOW 3: Safe Links ========== */
const SAFE_LINKS_STEPS = [
  {
    id: 1,
    name: 'safelinks_step1_navigate',
    title: 'safelinksStep1Title',
    description: 'safelinksStep1Description',
    navigate: 'https://security.microsoft.com/threatpolicy',
    validation: () => true,
    isNavigation: true,
    hideInSummary: true
  },
  {
    id: 2,
    name: 'safelinks_step2_email_collab',
    title: 'safelinksStep2Title',
    description: 'safelinksStep2Description',
    target: {
      selector: 'button[aria-label="E-posta ve işbirliği"]',
      fallback: [
        'button[aria-label*="E-posta"]',
        'button[aria-label*="Email"]',
        'button#Group_200_id12',
        'button#Group_150_id12',
        'button[data-icon-name="Mail"]'
      ]
    },
    tooltip: 'tooltipEmailCollab',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'safelinks_step3_policies',
    title: 'safelinksStep3Title',
    description: 'safelinksStep3Description',
    target: {
      selector: 'a[href*="securitypoliciesandrules"]',
      textMatch: /İlkeler ve kurallar|Policies & rules/i,
      fallback: [
        'a[data-automation-id*="securitypoliciesandrules"]',
        'a[href*="policy"]',
        'span:contains("İlkeler")'
      ]
    },
    tooltip: 'tooltipPolicies',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'safelinks_step4_threat_policies',
    title: 'safelinksStep4Title',
    description: 'safelinksStep4Description',
    target: {
      selector: 'a[href*="threatpolicy"]',
      textMatch: /Tehdit ilkeleri|Threat policies/i,
      fallback: [
        'a[data-automation-id*="threatpolicy"]',
        'span:contains("Tehdit ilkeleri")',
        'a:contains("Threat")'
      ]
    },
    tooltip: 'tooltipThreatPolicies',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 5,
    name: 'safelinks_step5_safe_links',
    title: 'safelinksStep5Title',
    description: 'safelinksStep5Description',
    target: {
      // TR UI örneği: <button aria-label="Link Icon, Güvenli Bağlantılar" class="ms-Link ...">Güvenli Bağlantılar</button>
      selector: 'button[aria-label*="Güvenli Bağlantılar"], button[aria-label*="Safe Links"], button.ms-Link, a.ms-Link',
      textMatch: /Güvenli Bağlantılar|Safe Links/i,
      fallback: [
        'a[href*="safelinksv2"]',
        'a[href*="safelinks"]',
        'button[aria-label*="Link Icon"]'
      ]
    },
    tooltip: 'tooltipSafeLinks',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    licenseCheck: {
      required: 'Microsoft Defender for Office 365',
      message: 'safelinksLicenseNotFoundMessage',
      skipMessage: 'safelinksLicenseSkipMessage'
    }
  },
  {
    id: 6,
    name: 'safelinks_step6_create',
    title: 'safelinksStep6Title',
    description: 'safelinksStep6Description',
    target: {
      // TR UI örneği: <span class="ms-Button-label">Oluştur</span>
      selector: 'span.ms-Button-label',
      textMatch: /Oluştur|Create/i,
      fallback: [
        'button[aria-label*="Oluştur"]',
        'button[aria-label*="Create"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipCreate',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'safelinks_step7_policy_name',
    title: 'safelinksStep7Title',
    description: 'safelinksStep7Description',
    target: {
      // TR UI örneği: <input id="policyNameId" ... />
      selector: '#policyNameId, input#policyNameId',
      fallback: [
        'input[type="text"][aria-required="true"]',
        'input.ms-TextField-field',
        'input[aria-label*="Ad"]',
        'input[aria-label*="Name"]'
      ]
    },
    tooltip: 'tooltipPolicyName',
    autoClick: false,
    validation: () => true,
    realTimeValidation: true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'safelinks_step8_policy_description',
    title: 'safelinksStep8Title',
    description: 'safelinksStep8Description',
    target: {
      // TR UI örneği: <textarea aria-label="Açıklama" ...></textarea>
      selector: 'textarea[aria-label="Açıklama"], textarea[aria-label*="Description"], textarea[id^="TextField"]',
      fallback: [
        'textarea.ms-TextField-field',
        'textarea'
      ]
    },
    tooltip: 'tooltipDescription',
    autoClick: false,
    validation: () => true,
    realTimeValidation: true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 9,
    name: 'safelinks_step9_next1',
    title: 'safelinksStep9Title',
    description: 'safelinksStep9Description',
    target: {
      // TR UI örneği: <span class="ms-Button-label">Sonraki</span>
      selector: 'span.ms-Button-label',
      textMatch: /Sonraki|Next/i,
      fallback: [
        'button[aria-label*="Sonraki"]',
        'button[aria-label*="Next"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipClickNext',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'safelinks_step10_domain_select',
    title: 'safelinksStep10Title',
    description: 'safelinksStep10Description',
    target: {
      // TR UI örneği: <input aria-label="Ve Etki alanları" class="ms-BasePicker-input" role="combobox" ... />
      selector: 'input.ms-BasePicker-input[role="combobox"][aria-label*="Etki alan"], input.ms-BasePicker-input[role="combobox"][aria-label*="Domain"], input[aria-label*="Etki alan"], input[aria-label*="Domain"]',
      fallback: [
        'input.ms-BasePicker-input',
        'input[role="combobox"]'
      ]
    },
    tooltip: 'tooltipAddDomain',
    autoClick: false,
    validation: () => true,
    realTimeValidation: true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 11,
    name: 'safelinks_step11_next2',
    title: 'safelinksStep11Title',
    description: 'safelinksStep11Description',
    target: {
      selector: 'span.ms-Button-label',
      textMatch: /Sonraki|Next/i,
      fallback: [
        'button[aria-label*="Sonraki"]',
        'button[aria-label*="Next"]'
      ]
    },
    tooltip: 'tooltipClickNext',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 12,
    name: 'safelinks_step12_office_apps_toggle',
    title: 'safelinksStep12Title',
    description: 'safelinksStep12Description',
    target: {
      selector: 'span.ms-Checkbox-text',
      textMatch: /Microsoft Office uygulamalar|Office 365 Apps/i,
      fallback: [
        'input[type="checkbox"]'
      ]
    },
    tooltip: 'tooltipDisableOfficeApps',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1500,
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'safelinks_step13_track_user_clicks_toggle',
    title: 'safelinksStep13Title',
    description: 'safelinksStep13Description',
    target: {
      selector: 'span.ms-Checkbox-text',
      textMatch: /Kullanıcı tıklamalarını izle|Track user clicks/i,
      fallback: [
        'input[type="checkbox"][aria-label*="Track"]',
        'input[type="checkbox"]'
      ]
    },
    tooltip: 'tooltipRemoveTrack',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1500,
    panelPosition: 'bottom-left'
  },
  {
    id: 14,
    name: 'safelinks_step14_manage_urls',
    title: 'safelinksStep14Title',
    description: 'safelinksStep14Description',
    target: {
      // TR UI örneği: <button class="ms-Link ...">0 URL'sini yönet</button>
      selector: 'button.ms-Link',
      textMatch: /URL.?sini yönet|Manage.*URL|0\s*URL/i,
      fallback: [
        'button[aria-label*="URL"]',
        'button:contains("URL")'
      ]
    },
    tooltip: 'tooltipManageUrls',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 15,
    name: 'safelinks_step15_add_urls',
    title: 'safelinksStep15Title',
    description: 'safelinksStep15Description',
    target: {
      // TR UI örneği: <span class="ms-Button-label">URL’leri ekleyin</span>
      selector: 'span.ms-Button-label',
      textMatch: /URL.?leri ekleyin|Add URLs/i,
      fallback: [
        '[data-automationid="splitbuttonprimary"]',
        'button[aria-label*="URL"]'
      ]
    },
    tooltip: 'tooltipAddUrls',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 16,
    name: 'safelinks_step16_urls_input',
    title: 'safelinksStep16Title',
    description: 'safelinksStep16Description',
    target: {
      selector: 'textarea[aria-label*="URL"], input[aria-label*="URL"]',
      fallback: [
        'textarea',
        'input.ms-BasePicker-input'
      ]
    },
    tooltip: 'tooltipAddPhishingDomains',
    autoClick: false,
    // URL alanına tıklamak adımı "tamamlandı" gibi algılanmasın.
    // Kullanıcı URL'leri ekledikten sonra panelden Continue ile ilerlesin.
    disableClickListener: true,
    autoAdvance: false,
    validation: () => true,
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 500
  },
  {
    id: 17,
    name: 'safelinks_step17_save',
    title: 'safelinksStep17Title',
    description: 'safelinksStep17Description',
    target: {
      selector: 'span.ms-Button-label',
      textMatch: /Kaydet|Save/i,
      fallback: [
        'button[aria-label*="Kaydet"]',
        'button[aria-label*="Save"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipSave',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 18,
    name: 'safelinks_step18_done',
    title: 'safelinksStep18Title',
    description: 'safelinksStep18Description',
    target: {
      selector: 'span.ms-Button-label',
      textMatch: /Bitti|Done/i,
      fallback: [
        'button[aria-label*="Bitti"]',
        'button[aria-label*="Done"]',
        '[data-automationid="splitbuttonprimary"] span.ms-Button-label'
      ]
    },
    tooltip: 'tooltipDone',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 19,
    name: 'safelinks_step19_next3',
    title: 'safelinksStep19Title',
    description: 'safelinksStep19Description',
    target: {
      selector: 'span.ms-Button-label',
      textMatch: /Sonraki|Next/i,
      fallback: [
        'button[aria-label*="Sonraki"]',
        'button[aria-label*="Next"]'
      ]
    },
    tooltip: 'tooltipClickNext',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 20,
    name: 'safelinks_step20_next4',
    title: 'safelinksStep20Title',
    description: 'safelinksStep20Description',
    target: {
      selector: 'span.ms-Button-label',
      textMatch: /Sonraki|Next/i,
      fallback: [
        'button[aria-label*="Sonraki"]',
        'button[aria-label*="Next"]'
      ]
    },
    tooltip: 'tooltipClickNext',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 21,
    name: 'safelinks_step21_submit',
    title: 'safelinksStep21Title',
    description: 'safelinksStep21Description',
    target: {
      // TR UI örneği: <span class="ms-Button-label">Gönder</span>
      selector: 'span.ms-Button-label',
      textMatch: /Gönder|Submit/i,
      fallback: [
        'button[aria-label*="Gönder"]',
        'button[aria-label*="Submit"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipSubmit',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 22,
    name: 'safelinks_summary',
    title: 'safelinksSummaryTitle',
    description: 'safelinksSummaryDescription',
    isSummary: true
  }
]
/* ========== WORKFLOW 4: Spam Filter Bypass ========== */
const SPAM_FILTER_BYPASS_STEPS = [
  {
    id: 1,
    name: 'spambypass_step1_info',
    title: 'spambypassStep1Title',
    description: 'spambypassStep1Description',
    isInfoCard: true,
    hideInSummary: true,  // Summary'de gösterme
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    waitAfterClick: 0
  },
  {
    id: 2,
    name: 'spambypass_step2_navigate',
    title: 'spambypassStep2Title',
    description: 'spambypassStep2Description',
    navigate: 'https://admin.exchange.microsoft.com/#/transportrules',
    isNavigation: true,
    hideInSummary: true,  // Summary'de gösterme
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000
  },
  {
    id: 3,
    name: 'spambypass_step3_add_rule',
    title: 'spambypassStep3Title',
    description: 'spambypassStep3Description',
    target: {
      selector: 'button[aria-label*="Add"]',
      textMatch: /Add a rule/i,
      fallback: [
        'button[name*="Add"]',
        'button:contains("Add a rule")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipAddRule',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 6s → 12s (daha yavaş)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 2s → 4s (daha uzun bekle)
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'spambypass_step4_create_rule',
    title: 'spambypassStep4Title',
    description: 'spambypassStep4Description',
    target: {
      selector: 'span.ms-ContextualMenu-itemText',
      textMatch: /Create a new rule/i,
      fallback: [
        'span.ms-ContextualMenu-itemText:contains("Create a new rule")',
        'div[role="menuitem"]:contains("Create a new rule")',
        'button:contains("Create a new rule")',
        'a:contains("Create a new rule")'
      ]
    },
    tooltip: 'tooltipCreateNewRule',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 6s → 12s (daha yavaş)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 2s → 4s (daha uzun bekle)
    panelPosition: 'bottom-left'
  },
  {
    id: 5,
    name: 'spambypass_step5_rule_name',
    title: 'spambypassStep5Title',
    description: 'spambypassStep5Description',
    target: {
      selector: 'input[data-automation-id="EditTransportRule_Name_TextField"]',
      fallback: [
        'div.ms-TextField-fieldGroup input[type="text"]',
        'input[maxlength="64"]',
        'input[aria-labelledby*="TextFieldLabel"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'tooltipEnterRuleName',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 15000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 10000,
    waitAfterClick: 10000,
    panelPosition: 'top-left',
    criticalStep: true
  },
  {
    id: 6,
    name: 'spambypass_step6_apply_rule_if',
    title: 'spambypassStep6Title',
    description: 'spambypassStep6Description',
    target: {
      selector: 'div[data-automation-id="EditTransportRule_GroupCondition_0_Dropdown"]',
      fallback: [
        'div[role="combobox"][aria-label*="Select a group condition"]',
        'div.ms-Dropdown',
        'span.ms-Dropdown-title:contains("Select one")'
      ]
    },
    tooltip: 'tooltipOpenApplyRuleIf',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 7000,  // 10s → 7s (daha hızlı geçiş)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 1200,  // 3s → 1.2s (kullanıcı tıkladıktan sonra daha az bekle)
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'spambypass_step7_select_sender',
    title: 'spambypassStep7Title',
    description: 'spambypassStep7Description',
    target: {
      selector: 'button[data-index="1"]',
      textMatch: /The sender/i,
      fallback: [
        'button[role="option"]:contains("The sender")',
        'div[role="option"]:contains("The sender")',
        'span.ms-Dropdown-optionText:contains("The sender")'
      ]
    },
    tooltip: 'tooltipSelectTheSender',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 6s → 10s (daha yavaş)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    criticalStep: false,
    waitAfterClick: 3000,  // 2s → 3s (daha uzun bekle)
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'spambypass_step8_ip_address_condition',
    title: 'spambypassStep8Title',
    description: 'spambypassStep8Description',
    target: {
      selector: 'span[id*="Dropdown"][id*="option"].ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder',
      textMatch: /Select one/i,
      fallback: [
        'span#Dropdown323-option',
        'span.ms-Dropdown-title:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ],
      secondaryTarget: {
        selector: 'span.ms-Dropdown-optionText.dropdownOptionText-669',
        textMatch: /IP address is in any of these ranges/i,
        fallback: [
          'span.ms-Dropdown-optionText.dropdownOptionText-617',
          'span.ms-Dropdown-optionText:contains("IP address is in any of these ranges or exactly matches")',
          'span.ms-Dropdown-optionText:contains("IP address")',
          'div[role="option"]:contains("IP address")'
        ]
      }
    },
    tooltip: 'tooltipOpenIPCondition',
    autoClick: false,  // true → false (manuel yapılsın, daha kontrollü)
    hideCopyButton: true,
    hideIPList: true,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 7s → 12s (çok daha yavaş)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 2s → 4s (daha uzun bekle)
    panelPosition: 'bottom-left'
  },
  {
    id: 9,
    name: 'spambypass_step9_enter_ip',
    title: 'spambypassStep9Title',
    description: 'spambypassStep9Description',
    manualTimer: 60000,  // 1 dakika = 60 saniye
    autoAdvance: false,  // Timer bitince otomatik geçme
    target: {
      selector: 'input[data-automation-id="SenderIpRanges_Input"]',
      fallback: [
        'input#TextField1460',
        'input#TextField313',
        'input[placeholder*="Enter an IPv4 or IPv6 address"]',
        'input.ms-TextField-field.field-681',
        'input.ms-TextField-field',
        'input[aria-label*="IP"]'
      ]
    },
    tooltip: 'tooltipEnterIPsManually',
    autoClick: false,
    manualStep: true,
    showIPList: true,
    hideCopyButton: true,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'spambypass_step10_do_following_dropdown',
    title: 'spambypassStep10Title',
    description: 'spambypassStep10Description',
    target: {
      selector: 'span#Dropdown327-option',
      textMatch: /Select one/i,  // BURADA DEĞİŞİKLİK: Buton metni "Select one"
      fallback: [
        'span[id*="Dropdown327"].ms-Dropdown-title',
        'span.ms-Dropdown-title:contains("Select one")',
        'button[aria-label*="Do the following"]'
      ]
    },
    tooltip: 'tooltipSelectOneDropdown',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 6s → 10s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 2s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 11,
    name: 'spambypass_step11_modify_message_properties',
    title: 'spambypassStep11Title',
    description: 'spambypassStep11Description',
    hideIPList: true,  // Burada da gösterme
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("Modify the message properties")',
        'div[role="option"]:contains("Modify the message properties")'
      ]
    },
    tooltip: 'tooltipModifyProperties',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 7s → 10s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 2s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 12,
    name: 'spambypass_step12_select_one_scd',
    title: 'spambypassStep12Title',
    description: 'spambypassStep12Description',
    target: {
      selector: 'span#Dropdown706-option.ms-Dropdown-title',
      textMatch: /Select one/i,
      fallback: [
        'span#Dropdown706-option',
        'span.ms-Dropdown-titleIsPlaceHolder:contains("Select one")'
      ]
    },
    tooltip: 'tooltipOpenSelectOne',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 6s → 10s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    criticalStep: false,
    waitAfterClick: 3000,  // 2s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'spambypass_step13_set_scl',
    title: 'spambypassStep13Title',
    description: 'spambypassStep13Description',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-706',
      textMatch: /set the spam confidence level/i,
      fallback: [
        'span:contains("set the spam confidence level (SCL)")',
        'span.ms-Dropdown-optionText:contains("spam confidence level")',
        'span#Dropdown706-option'
      ]
    },
    tooltip: 'tooltipSelectSetSCL',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 6s → 10s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    criticalStep: false,
    waitAfterClick: 3000,  // 2s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 14,
    name: 'spambypass_step14_bypass_spam_filtering',
    title: 'spambypassStep14Title',
    description: 'spambypassStep14Description',
    target: {
      selector: 'span#Dropdown826-option.ms-Dropdown-title',
      textMatch: /Bypass spam filtering/i,
      fallback: [
        'span[id*="Dropdown826"]',
        'span:contains("Bypass spam filtering")',
        'span.ms-Dropdown-optionText:contains("Bypass spam filtering")',
        'div[role="option"]:contains("Bypass spam filtering")'
      ]
    },
    tooltip: 'tooltipSelectBypassSpamFiltering',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 6s → 10s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    criticalStep: false,
    waitAfterClick: 3000,  // 2s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 15,
    name: 'spambypass_step15_save_first_rule',
    title: 'spambypassStep15Title',
    description: 'spambypassStep15Description',
    target: {
      selector: 'span.ms-Button-label.label-722#id__891',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'span:contains("Save")',
        'span.ms-Button-label:contains("Save")',
        'button:contains("Save")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipSaveButton',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 9000,  // 15s → 9s (form kapanması için ama daha kısa)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 2000,  // 5s → 2s (kullanıcı tıkladıktan sonra bekleme kısaltıldı)
    panelPosition: 'bottom-left'
  },
  {
    id: 16,
    name: 'spambypass_step16_add_new_rule',
    title: 'spambypassStep16Title',
    description: 'spambypassStep16Description',
    target: {
      selector: 'button[data-automation-id="AddAction_1"]',
      textMatch: /Add action/i,
      fallback: [
        'button[aria-label*="Add action"]',
        'button:contains("Add action")',
        'button.ms-Button--icon[title*="Add"]',
        'button[data-automation-id*="AddAction"]'
      ]
    },
    tooltip: 'tooltipAddAction',
    autoClick: false,
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 2s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 17,
    name: 'spambypass_step17_modify_message_properties2',
    title: 'spambypassStep17Title',
    description: 'spambypassStep17Description',
    target: {
      selector: 'span#Dropdown263-option',
      textMatch: /Select one/i,
      fallback: [
        'span.ms-Dropdown-title.title-791:contains("Select one")',
        'span.ms-Dropdown-title:contains("Select one")',
        'span[id*="Dropdown263"]:contains("Select one")'
      ],
      secondaryTarget: {
        selector: 'span.ms-Dropdown-optionText.dropdownOptionText-772',
        textMatch: /Modify the message properties/i,
        fallback: [
          'span.ms-Dropdown-optionText:contains("Modify the message properties")',
          'div[role="option"]:contains("Modify the message properties")'
        ]
      }
    },
    tooltip: 'tooltipOpenSelectOne',
    autoClick: false,  // true → false (daha kontrollü)
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    criticalStep: false,
    waitAfterClick: 4000,  // 2s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 18,
    name: 'spambypass_step18_set_message_header',
    title: 'spambypassStep18Title',
    description: 'spambypassStep18Description',
    target: {
      selector: 'span#Dropdown510-option',
      textMatch: /Select one/i,
      fallback: [
        'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder.title-758:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ],
      secondaryTarget: {
        selector: 'span.ms-Dropdown-optionText.dropdownOptionText-772',
        textMatch: /set a message header/i,
        fallback: [
          'span.ms-Dropdown-optionText:contains("set a message header")',
          'span:contains("set a message header")',
          'div[role="option"]:contains("message header")'
        ]
      }
    },
    tooltip: 'tooltipSelectFromDropdown',
    autoClick: false,  // true → false (daha kontrollü)
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    criticalStep: false,
    waitAfterClick: 4000,  // 2s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 19,
    name: 'spambypass_step19_enter_text_button',
    title: 'spambypassStep19Title',
    description: 'spambypassStep19Description',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_1_0"]',
      fallback: [
        'button.ms-Link.root-809:contains("Enter text")',
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'tooltipClickEnterText',
    autoClick: false,  // true → false (daha kontrollü)
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    criticalStep: false,
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 20,
    name: 'spambypass_step20_enter_bypass_clutter',
    title: 'spambypassStep20Title',
    description: 'spambypassStep20Description',
    manualTimer: 60000,  // 1 dakika = 60 saniye
    autoAdvance: false,  // Timer bitince otomatik geçme
    target: {
      selector: 'input#TextField930[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input.ms-TextField-field.field-681',
        'input[data-automation-id="SetHeader_TextField"]',
        'input[placeholder*="header"]'
      ]
    },
    tooltip: 'tooltipEnterBypassClutter',
    autoClick: false,
    manualStep: true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    validation: () => true,
    criticalStep: true,
    waitAfterClick: 3000,
    panelPosition: 'bottom-left'
  },
  {
    id: 21,
    name: 'spambypass_step21_enter_text_and_value',
    title: 'spambypassStep21Title',
    description: 'spambypassStep21Description',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_1_1"]',
      textMatch: /Enter text/i,
      fallback: [
        'button.ms-Link.root-809:contains("Enter text")',
        'button.ms-Link.root-812:contains("Enter text")',
        'button[role="button"]:contains("Enter text")',
        'button[data-automation-id*="Link_SetHeader"]'
      ]
    },
    tooltip: 'tooltipClickEnterTextAndValue',
    autoClick: false,  // true → false (daha kontrollü)
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 5000 → 500ms
    criticalStep: false,
    waitAfterClick: 3000,  // 5s → 3s
    panelPosition: 'bottom-left',
    nextTarget: {
      selector: 'input[placeholder*="value"], input[aria-label*="value"]',
      fallback: [
        'input.ms-TextField-field:last-of-type',
        'input[data-automation-id*="TextField"]'
      ],
      textToEnter: '1'
    }
  },
  {
    id: 22,
    name: 'spambypass_step22_next',
    title: 'spambypassStep22Title',
    description: 'spambypassStep22Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__769',
      textMatch: /Next/i,
      fallback: [
        'span.ms-Button-label:contains("Next")',
        'button[aria-label*="Next"]',
        'button:contains("Next")'
      ]
    },
    tooltip: 'tooltipNext',
    autoClick: false,
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 3000 → 500ms
    waitAfterClick: 3000,  // 5s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 23,
    name: 'spambypass_step23_next2',
    title: 'spambypassStep23Title',
    description: 'spambypassStep23Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__769',
      textMatch: /Next/i,
      fallback: [
        'span.ms-Button-label:contains("Next")',
        'button[aria-label*="Next"]',
        'button:contains("Next")'
      ]
    },
    tooltip: 'tooltipNext',
    autoClick: false,
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 3000 → 500ms
    waitAfterClick: 3000,  // 5s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 24,
    name: 'spambypass_step24_finish',
    title: 'spambypassStep24Title',
    description: 'spambypassStep24Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__1150',
      textMatch: /Finish/i,
      fallback: [
        'span.ms-Button-label:contains("Finish")',
        'button[aria-label*="Finish"]',
        'button:contains("Finish")'
      ]
    },
    tooltip: 'tooltipClickFinish',
    autoClick: false,
    autoAdvance: false,  // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 3000 → 500ms
    waitAfterClick: 3000,  // 5s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 25,
    name: 'spambypass_summary',
    title: 'spambypassSummaryTitle',
    description: 'spambypassSummaryDescription',
    isSummary: true
  }
]
/* ========== WORKFLOW 5: ATP Link Bypass (SkipSafeLinksProcessing) ========== */
const ATP_LINK_BYPASS_STEPS = [
  {
    id: 1,
    name: 'atplink_step1_info',
    title: 'atplinkStep1Title',
    description: 'atplinkStep1Description',
    isInfoCard: true,
    hideInSummary: true,  // Summary'de gösterme
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye (bilgi kartı)
    waitAfterClick: 0
  },
  {
    id: 2,
    name: 'atplink_step2_add_rule',
    title: 'atplinkStep2Title',
    description: 'atplinkStep2Description',
    target: {
      selector: 'span.ms-Button-label.label-402#id__18',
      textMatch: /Add a rule/i,
      fallback: [
        'span.ms-Button-label:contains("Add a rule")',
        'button[aria-label*="Add"]',
        'button:contains("Add a rule")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipAddRuleButton',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye (WF4 ile aynı)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'atplink_step3_create_rule',
    title: 'atplinkStep3Title',
    description: 'atplinkStep3Description',
    target: {
      selector: 'span.ms-ContextualMenu-itemText.label-606',
      textMatch: /Create a new rule/i,
      fallback: [
        'span.ms-ContextualMenu-itemText:contains("Create a new rule")',
        'div[role="menuitem"]:contains("Create a new rule")',
        'button:contains("Create a new rule")',
        'a:contains("Create a new rule")'
      ]
    },
    tooltip: 'tooltipCreateNewRule',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye (WF4 ile aynı)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'atplink_step4_rule_name',
    title: 'atplinkStep4Title',
    description: 'atplinkStep4Description',
    target: {
      selector: 'input[data-automation-id="EditTransportRule_Name_TextField"]',
      fallback: [
        'input#TextField238',
        'div.ms-TextField-fieldGroup input[type="text"]',
        'input[maxlength="64"]',
        'input[aria-labelledby*="TextFieldLabel"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'tooltipEnterRuleName',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 15000,  // 15 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 15000,
    waitAfterClick: 10000,
    panelPosition: 'top-left',
    criticalStep: true
  },
  {
    id: 5,
    name: 'atplink_step5_apply_rule_if',
    title: 'atplinkStep5Title',
    description: 'atplinkStep5Description',
    target: {
      selector: 'span#Dropdown243-option',
      fallback: [
        'span.ms-Dropdown-title.title-726:contains("Select one")',
        'span.ms-Dropdown-title:contains("Select one")',
        'div[data-automation-id="EditTransportRule_GroupCondition_0_Dropdown"]'
      ]
    },
    tooltip: 'tooltipOpenApplyRuleIf',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 18000,  // 15s → 18s (WF4 ile tutarlı)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 2000,  // 1s → 2s
    panelPosition: 'bottom-left'
  },
  {
    id: 6,
    name: 'atplink_step6_select_sender',
    title: 'atplinkStep6Title',
    description: 'atplinkStep6Description',
    hideIPList: true,  // IP listesi görünmemeli
    manualTimer: undefined,  // Timer yok
    showIPList: false,  // IP listesi gösterilmemeli
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /The sender/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("The sender")',
        'div[role="option"]:contains("The sender")'
      ]
    },
    tooltip: 'tooltipSelectTheSender',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'atplink_step7_ip_address_condition',
    title: 'atplinkStep7Title',
    description: 'atplinkStep7Description',
    showIPList: false,  // IP listesini gösterme
    hideIPList: true,   // IP listesini gizle
    target: {
      selector: 'span#Dropdown244-option',
      textMatch: /Select one/i,
      fallback: [
        'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder.title-693:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ],
      secondaryTarget: {
        selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
        textMatch: /IP address is in any of these ranges/i,
        fallback: [
          'span.ms-Dropdown-optionText:contains("IP address is in any of these ranges or exactly matches")',
          'span.ms-Dropdown-optionText:contains("IP address")',
          'div[role="option"]:contains("IP address")'
        ]
      }
    },
    tooltip: 'tooltipOpenIPCondition',
    autoClick: false,  // true → false (daha kontrollü)
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'atplink_step8_ip_addresses',
    title: 'atplinkStep8Title',
    description: 'atplinkStep8Description',
    showIPList: true,    // IP listesini göster
    hideIPList: false,   // IP listesi gösterilmeli
    target: {
      selector: 'input[data-automation-id="SenderIpRanges_Input"]',
      fallback: [
        'input#TextField772',
        'input[placeholder*="IPv4"]',
        'textarea.ms-TextField-field',
        'input[aria-label*="IP"]',
        'textarea'
      ]
    },
    tooltip: 'tooltipEnterIPsManually',
    autoClick: false,
    manualTimer: 60000,       // 1 dakika manuel timer
    autoAdvance: false,       // Timer bitene kadar otomatik geçiş yok
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 2000,
    panelPosition: 'top-left'
  },
  {
    id: 9,
    name: 'spambypass_step10_do_following_dropdown',
    title: 'atplinkStep9Title',
    description: 'atplinkStep9Description',
    target: {
      selector: 'span#Dropdown327-option',
      textMatch: /Select one/i,  // BURADA DEĞİŞİKLİK: Buton metni "Select one"
      fallback: [
        'span[id*="Dropdown327"].ms-Dropdown-title',
        'span.ms-Dropdown-title:contains("Select one")',
        'button[aria-label*="Do the following"]'
      ]
    },
    tooltip: 'tooltipSelectOneDropdown',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'atplink_step11_modify_message_properties',
    title: 'atplinkStep10Title',
    description: 'atplinkStep10Description',
    hideIPList: true,  // Burada da gösterme
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("Modify the message properties")',
        'div[role="option"]:contains("Modify the message properties")'
      ]
    },
    tooltip: 'tooltipModifyProperties',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 11,
    name: 'atplink_step12_select_one',
    title: 'atplinkStep11Title',
    description: 'atplinkStep11Description',
    target: {
      selector: 'span#Dropdown249-option',
      fallback: [
        'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder.title-745:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ]
    },
    tooltip: 'tooltipOpenSelectOne',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 12,
    name: 'atplink_step13_set_message_header',
    title: 'atplinkStep12Title',
    description: 'atplinkStep12Description',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /set a message header/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("set a message header")',
        'span.ms-Dropdown-optionText:contains("Set a message header")',
        'div[role="option"]:contains("message header")'
      ]
    },
    tooltip: 'tooltipSetMessageHeader',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'atplink_step14_enter_text_first',
    title: 'atplinkStep13Title',
    description: 'atplinkStep13Description',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_0"]',
      fallback: [
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'tooltipClickFirstEnterText',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 14,
    name: 'atplink_step15_header_name',
    title: 'atplinkStep14Title',
    description: 'atplinkStep14Description',
    manualTimer: 60000,  // 1 dakika = 60 saniye timer
    autoAdvance: false,  // Timer bitince otomatik geçiş (false = timer göster)
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1391',
        'input[type="text"][placeholder*="header"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'tooltipEnterHeaderNameSkipSafeLinks',
    autoClick: false,
    manualStep: true,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'top-left'
  },
  {
    id: 15,
    name: 'atplink_step16_enter_text_second',
    title: 'atplinkStep15Title',
    description: 'atplinkStep15Description',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_1"]',
      fallback: [
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'tooltipClickSecondEnterText',
    autoClick: false,
    autoAdvance: false, // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 16,
    name: 'atplink_step17_header_value',
    title: 'atplinkStep16Title',
    description: 'atplinkStep16Description',
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1444',
        'input[type="text"][placeholder*="value"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'tooltipEnterHeaderValue',
    autoClick: false,
    autoAdvance: false, // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'top-left'
  },
  {
    id: 17,
    name: 'atplink_step18_next',
    title: 'atplinkStep17Title',
    description: 'atplinkStep17Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__769',
      textMatch: /Next/i,
      fallback: [
        'span.ms-Button-label:contains("Next")',
        'button[aria-label*="Next"]',
        'button:contains("Next")'
      ]
    },
    tooltip: 'tooltipNext',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 18,
    name: 'atplink_step19_next2',
    title: 'atplinkStep18Title',
    description: 'atplinkStep18Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__769',
      textMatch: /Next/i,
      fallback: [
        'span.ms-Button-label:contains("Next")',
        'button[aria-label*="Next"]',
        'button:contains("Next")'
      ]
    },
    tooltip: 'tooltipNext',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 19,
    name: 'atplink_step20_finish',
    title: 'atplinkStep19Title',
    description: 'atplinkStep19Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__1150',
      textMatch: /Finish/i,
      fallback: [
        'span.ms-Button-label:contains("Finish")',
        'button[aria-label*="Finish"]',
        'button:contains("Finish")'
      ]
    },
    tooltip: 'tooltipClickFinish',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 2s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 20,
    name: 'atplink_summary',
    title: 'atplinkSummaryTitle',
    description: 'atplinkSummaryDescription',
    isSummary: true
  }
]
/* ========== WORKFLOW 6: ATP Attachment Bypass (SkipSafeAttachmentProcessing) ========== */
const ATP_ATTACHMENT_BYPASS_STEPS = [
  {
    id: 1,
    name: 'atpattach_step1_info',
    title: 'atpattachStep1Title',
    description: 'atpattachStep1Description',
    isInfoCard: true,
    hideInSummary: true,  // Summary'de gösterme
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye (bilgi kartı)
    waitAfterClick: 0
  },
  {
    id: 2,
    name: 'atpattach_step2_add_rule',
    title: 'atpattachStep2Title',
    description: 'atpattachStep2Description',
    target: {
      selector: 'span.ms-Button-label.label-402#id__18',
      textMatch: /Add a rule/i,
      fallback: [
        'span.ms-Button-label:contains("Add a rule")',
        'button[aria-label*="Add"]',
        'button:contains("Add a rule")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'tooltipAddRuleButton',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye (WF4 ile aynı)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'atpattach_step3_create_rule',
    title: 'atpattachStep3Title',
    description: 'atpattachStep3Description',
    target: {
      selector: 'span.ms-ContextualMenu-itemText.label-606',
      textMatch: /Create a new rule/i,
      fallback: [
        'span.ms-ContextualMenu-itemText:contains("Create a new rule")',
        'div[role="menuitem"]:contains("Create a new rule")',
        'button:contains("Create a new rule")',
        'a:contains("Create a new rule")'
      ]
    },
    tooltip: 'tooltipCreateNewRule',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye (WF4 ile aynı)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'atpattach_step4_rule_name',
    title: 'atpattachStep4Title',
    description: 'atpattachStep4Description',
    target: {
      selector: 'input[data-automation-id="EditTransportRule_Name_TextField"]',
      fallback: [
        'input#TextField238',
        'div.ms-TextField-fieldGroup input[type="text"]',
        'input[maxlength="64"]',
        'input[aria-labelledby*="TextFieldLabel"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'tooltipEnterRuleName',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 15000,  // 15 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 15000,
    waitAfterClick: 10000,
    panelPosition: 'top-left',
    criticalStep: true
  },
  {
    id: 5,
    name: 'atpattach_step5_apply_rule_if',
    title: 'atpattachStep5Title',
    description: 'atpattachStep5Description',
    target: {
      selector: 'span#Dropdown243-option',
      fallback: [
        'span.ms-Dropdown-title.title-726:contains("Select one")',
        'span.ms-Dropdown-title:contains("Select one")',
        'div[data-automation-id="EditTransportRule_GroupCondition_0_Dropdown"]'
      ]
    },
    tooltip: 'tooltipOpenApplyRuleIf',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 18000,  // 10s → 18s (WF4/5 ile tutarlı)
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 2000,  // 1s → 2s
    panelPosition: 'bottom-left'
  },
  {
    id: 6,
    name: 'atpattach_step6_select_sender',
    title: 'atpattachStep6Title',
    description: 'atpattachStep6Description',
    hideIPList: true,  // IP listesi görünmemeli
    manualTimer: undefined,  // Timer yok
    showIPList: false,  // IP listesi gösterilmemeli
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /The sender/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("The sender")',
        'div[role="option"]:contains("The sender")'
      ]
    },
    tooltip: 'tooltipSelectTheSender',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'atplink_step7_ip_address_condition',
    title: 'atpattachStep7Title',
    description: 'atpattachStep7Description',
    showIPList: false,  // IP listesini gösterme
    hideIPList: true,   // IP listesini gizle
    target: {
      selector: 'span#Dropdown244-option',
      textMatch: /Select one/i,
      fallback: [
        'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder.title-693:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ],
      secondaryTarget: {
        selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
        textMatch: /IP address is in any of these ranges/i,
        fallback: [
          'span.ms-Dropdown-optionText:contains("IP address is in any of these ranges or exactly matches")',
          'span.ms-Dropdown-optionText:contains("IP address")',
          'div[role="option"]:contains("IP address")'
        ]
      }
    },
    tooltip: 'tooltipOpenIPCondition',
    autoClick: false,  // true → false (daha kontrollü)
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'atplink_step8_ip_addresses',
    title: 'atpattachStep8Title',
    description: 'atpattachStep8Description',
    showIPList: true,    // IP listesini göster
    hideIPList: false,   // IP listesi gösterilmeli
    target: {
      selector: 'input[data-automation-id="SenderIpRanges_Input"]',
      fallback: [
        'input#TextField772',
        'input[placeholder*="IPv4"]',
        'textarea.ms-TextField-field',
        'input[aria-label*="IP"]',
        'textarea'
      ]
    },
    tooltip: 'tooltipEnterIPsManually',
    autoClick: false,
    manualTimer: 60000,       // 1 dakika manuel timer
    autoAdvance: false,       // Timer bitene kadar otomatik geçiş yok
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 2000,
    panelPosition: 'top-left'
  },
  {
    id: 9,
    name: 'atpattach_step9_do_following',
    title: 'atpattachStep9Title',
    description: 'atpattachStep9Description',
    hideIPList: true,  // IP listesini gizle
    target: {
      selector: 'span#Dropdown1874-option',
      textMatch: /Select one/i,
      fallback: [
        'span.ms-Dropdown-title.title-799',
        'span#Dropdown1874-option',
        'span.ms-Dropdown-title:contains("Select one")',
        'div[data-automation-id*="Action"] span.ms-Dropdown-title'
      ]
    },
    tooltip: 'tooltipSelectOneDropdown',
    autoClick: false,  // true → false (daha kontrollü)
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // Eksikti, eklendi
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'atpattach_step10_modify_message_properties',
    title: 'atpattachStep10Title',
    description: 'atpattachStep10Description',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-772',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("Modify the message properties")',
        'div[role="option"]:contains("Modify the message properties")'
      ]
    },
    tooltip: 'tooltipModifyProperties',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 11,
    name: 'atpattach_step11_select_one',
    title: 'atpattachStep11Title',
    description: 'atpattachStep11Description',
    target: {
      selector: 'span#Dropdown697-option',
      fallback: [
        'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder.title-758:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ]
    },
    tooltip: 'tooltipOpenSelectOne',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 12,
    name: 'atpattach_step12_set_message_header',
    title: 'atpattachStep12Title',
    description: 'atpattachStep12Description',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /set a message header/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("set a message header")',
        'span.ms-Dropdown-optionText:contains("Set a message header")',
        'div[role="option"]:contains("message header")'
      ]
    },
    tooltip: 'tooltipSetMessageHeader',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000,  // 10s → 12s
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 4000,  // 1s → 4s
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'atpattach_step13_enter_text',
    title: 'atpattachStep13Title',
    description: 'atpattachStep13Description',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_0"]',
      fallback: [
        'button.ms-Link.root-812:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'tooltipClickEnterText',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 15,
    name: 'atpattach_step15_header_name',
    title: 'atpattachStep15Title',
    description: 'atpattachStep15Description',
    manualTimer: 60000,  // 1 dakika = 60 saniye timer
    autoAdvance: false,  // Timer bitince otomatik geçiş (false = timer göster)
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1391',
        'input[type="text"][placeholder*="header"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'tooltipEnterHeaderNameSkipSafeAttachment',
    autoClick: false,
    manualStep: true,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'top-left'
  },
  {
    id: 16,
    name: 'atpattach_step16_enter_text_second',
    title: 'atpattachStep16Title',
    description: 'atpattachStep16Description',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_1"]',
      fallback: [
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'tooltipClickSecondEnterText',
    autoClick: false,
    autoAdvance: false, // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 17,
    name: 'atpattach_step17_header_value',
    title: 'atpattachStep17Title',
    description: 'atpattachStep17Description',
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1444',
        'input[type="text"][placeholder*="value"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'tooltipEnterHeaderValue',
    autoClick: false,
    autoAdvance: false, // Otomatik geçiş yok
    manualStep: true,  // Manuel ilerleme
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'top-left'
  },
  {
    id: 18,
    name: 'atpattach_step18_next',
    title: 'atpattachStep18Title',
    description: 'atpattachStep18Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__769',
      textMatch: /Next/i,
      fallback: [
        'span.ms-Button-label:contains("Next")',
        'button[aria-label*="Next"]',
        'button:contains("Next")'
      ]
    },
    tooltip: 'tooltipNext',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 19,
    name: 'atpattach_step19_next2',
    title: 'atpattachStep19Title',
    description: 'atpattachStep19Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__769',
      textMatch: /Next/i,
      fallback: [
        'span.ms-Button-label:contains("Next")',
        'button[aria-label*="Next"]',
        'button:contains("Next")'
      ]
    },
    tooltip: 'tooltipNext',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,  // 100 → 500ms
    waitAfterClick: 3000,  // 1s → 3s
    panelPosition: 'bottom-left'
  },
  {
    id: 20,
    name: 'atpattach_step20_finish',
    title: 'atpattachStep20Title',
    description: 'atpattachStep20Description',
    target: {
      selector: 'span.ms-Button-label.label-788#id__769',
      textMatch: /Finish/i,
      fallback: [
        'span.ms-Button-label:contains("Finish")',
        'button[aria-label*="Finish"]',
        'button:contains("Finish")'
      ]
    },
    tooltip: 'tooltipClickFinish',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 10000,  // 10 saniye
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 500,
    waitAfterClick: 3000,
    panelPosition: 'bottom-left'
  },
  {
    id: 21,
    name: 'atpattach_summary',
    title: 'atpattachSummaryTitle',
    description: 'atpattachSummaryDescription',
    isSummary: true
  }
]

/* ========== STORAGE HELPERS ========== */
const Storage = {
  async get(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] || null)
        })
    })
  },
  
  async set(key, value) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve(true))
    })
  }
}

/* ========== ANIMATION UTILITIES ========== */
const AnimationUtils = {
  // Framer Motion benzeri spring animasyon
  animate(element, animation, duration = 300, easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)') {
    if (!element) return
    
    const animations = {
      'fadeIn': 'keepnet-fade-in',
      'fadeInUp': 'keepnet-fade-in-up',
      'slideInRight': 'keepnet-slide-in-right',
      'slideInBottom': 'keepnet-slide-in-bottom',
      'scaleIn': 'keepnet-scale-in',
      'rotateIn': 'keepnet-rotate-in',
      'pulse': 'keepnet-pulse',
      'bounce': 'keepnet-bounce',
      'shake': 'keepnet-shake'
    }
    
    const animationName = animations[animation] || animation
    
    element.style.animation = `${animationName} ${duration}ms ${easing} forwards`
    element.style.opacity = '1'
    
    return new Promise(resolve => {
      setTimeout(() => {
        element.style.animation = ''
        resolve()
      }, duration)
    })
  },
  
  // Stagger animasyon (çocukları sırayla animasyon yap)
  async staggerChildren(parent, animation, staggerDelay = 50) {
    if (!parent) return
    
    const children = Array.from(parent.children)
    for (let i = 0; i < children.length; i++) {
      await Utils.sleep(staggerDelay)
      this.animate(children[i], animation, 300)
    }
  },
  
  // Smooth scroll to element
  scrollToElement(element, offset = -100) {
    if (!element) return
    
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset + offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  },
  
  // Highlight element with animation
  highlightElement(element) {
    if (!element) return
    
    element.classList.add('keepnet-highlight')
    this.animate(element, 'pulse', 600)
    this.scrollToElement(element)
  },
  
  // Remove highlight with fade out
  removeHighlight(element) {
    if (!element) return
    
    element.style.animation = 'keepnet-fade-out 300ms ease-out forwards'
    setTimeout(() => {
      element.classList.remove('keepnet-highlight')
      element.style.animation = ''
    }, 300)
  },
  
  // Progress bar animation
  animateProgressBar(element, from, to, duration = 500) {
    if (!element) return
    
    const startTime = performance.now()
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased
      
      element.style.width = `${current}%`
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  },
  
  // Counter animation
  animateCounter(element, from, to, duration = 1000, suffix = '') {
    if (!element) return
    
    const startTime = performance.now()
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (to - from) * eased)
      
      element.textContent = current + suffix
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  },
  
  // Confetti effect for completion
  showConfetti(container) {
    const colors = ['#4a9eff', '#5dade2', '#ffffff', '#2d2d4a', '#3a3a5c']
    const confettiCount = 50
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          top: 50%;
          left: 50%;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999999;
        `
        
        container.appendChild(confetti)
        
        const angle = Math.random() * Math.PI * 2
        const velocity = 15 + Math.random() * 15
        const tx = Math.cos(angle) * velocity * 30
        const ty = Math.sin(angle) * velocity * 30
        
        confetti.animate([
          { transform: 'translate(0, 0) scale(0)', opacity: 1 },
          { transform: `translate(${tx}px, ${ty}px) scale(1)`, opacity: 0 }
        ], {
          duration: 1000 + Math.random() * 500,
          easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => confetti.remove()
      }, i * 10)
    }
  }
}
/* ========== UTILITY FUNCTIONS ========== */
const Utils = {
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  
  findElement(target) {
    if (!target) return null
    
    // Önce selector dene (text match olmadan)
    if (target.selector && !target.textMatch) {
      try {
        // :contains() gibi pseudo-selector'ları temizle
        const cleanSelector = target.selector.replace(/:contains\([^)]+\)/g, '')
        if (cleanSelector.trim()) {
          const el = document.querySelector(cleanSelector)
          if (el && this.isVisible(el)) return el
        }
      } catch (e) {}
    }
    
    // Text match varsa
    if (target.textMatch) {
      const regex = typeof target.textMatch === 'string' 
        ? new RegExp(target.textMatch, 'i') 
        : target.textMatch
      
      // Önce selector ile sınırla (eğer varsa)
      let candidates = []
      
      if (target.selector) {
        const selectorBase = target.selector.replace(/:contains\([^)]+\)/g, '').trim()
        if (selectorBase) {
          try {
            candidates = Array.from(document.querySelectorAll(selectorBase))
          } catch (e) {}
        }
      }
      
      // Selector yoksa veya bulunamadıysa fallback dene
      if (candidates.length === 0 && target.fallback) {
        const fallbacks = Array.isArray(target.fallback) ? target.fallback : [target.fallback]
        
        for (const fb of fallbacks) {
          const fallbackBase = fb.replace(/:contains\([^)]+\)/g, '').trim()
          if (fallbackBase) {
            try {
              const fbCandidates = Array.from(document.querySelectorAll(fallbackBase))
              if (fbCandidates.length > 0) {
                candidates = fbCandidates
                break
              }
            } catch (e) {}
          }
        }
      }
      
      // Hiçbiri yoksa tüm elementleri ara
      if (candidates.length === 0) {
        candidates = Array.from(document.querySelectorAll('button, a, span, div[role="tab"], [role="button"]'))
      }
      
      // Text match ile filtrele (hem textContent hem aria-label kontrol et)
      for (const el of candidates) {
        const text = el.textContent || el.innerText || ''
        const ariaLabel = el.getAttribute('aria-label') || ''
        const combinedText = `${text} ${ariaLabel}`.trim()
        if (regex.test(combinedText) && this.isVisible(el)) {
          return el
        }
      }
    }
    
    // Fallback dene (text match olmadan) - array veya string olabilir
    if (target.fallback) {
      const fallbacks = Array.isArray(target.fallback) ? target.fallback : [target.fallback]
      
      for (const fb of fallbacks) {
        try {
          const cleanFallback = fb.replace(/:contains\([^)]+\)/g, '').trim()
          if (cleanFallback) {
            const el = document.querySelector(cleanFallback)
            if (el && this.isVisible(el)) {
              console.log('[Keepnet] Element found with fallback:', fb)
              return el
            }
          }
        } catch (e) {
          console.warn('[Keepnet] Fallback selector error:', fb)
        }
      }
    }
    
    return null
  },

  /**
   * Belirtilen hedef tanımı için DOM'da element arar ve bulunana kadar bekler.
   * @param {object} target
   * @param {{ timeout?: number, interval?: number, useObserver?: boolean }} [options]
   * @returns {Promise<HTMLElement|null>}
   */
  async waitForElement(target, options = {}) {
    if (!target) return null

    const {
      timeout = 10000,
      interval = 250,
      useObserver = true
    } = options

    const stopObserver = (obs) => {
      if (obs) {
        obs.disconnect()
      }
    }

    const immediate = this.findElement(target)
    if (immediate) return immediate

    const start = performance.now()

    if (useObserver && typeof MutationObserver !== 'undefined') {
      const foundByObserver = await new Promise(resolve => {
        let resolved = false
        const observer = new MutationObserver(() => {
          const el = this.findElement(target)
          if (el) {
            resolved = true
            stopObserver(observer)
            resolve(el)
          }
        })

        observer.observe(document.body, { childList: true, subtree: true })

        setTimeout(() => {
          if (!resolved) {
            stopObserver(observer)
            resolve(null)
          }
        }, timeout)
      })

      if (foundByObserver) return foundByObserver
    }

    while (performance.now() - start < timeout) {
      await this.sleep(interval)
      const el = this.findElement(target)
      if (el) {
        return el
      }
    }

    return null
  },
  
  isVisible(el) {
    if (!el) return false
    if (typeof window === 'undefined') return false
    const style = window.getComputedStyle(el)
    if (!style || style.visibility === 'hidden' || style.display === 'none') {
      return false
    }
    return !!(
      (el.offsetWidth && el.offsetHeight) ||
      el.getClientRects().length
    )
  },
  
  scrollToElement(el) {
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/* ========== SCREENSHOT MANAGER ========== */
class ScreenshotManager {
  constructor() {
    // Screenshot özelliği devre dışı bırakıldı
    this.screenshots = {}
  }
  
  async init() {
    // Artık storage'dan screenshot okunmuyor
    this.screenshots = {}
  }
  
  async capture(stepName) {
    // Screenshot alma tamamen kapalı
    console.log('[Keepnet] Screenshot capture disabled:', stepName)
    return null
  }
  
  async save(stepName, dataUrl, validationResult = {}) {
    // Screenshot kaydetme tamamen kapalı
    console.log('[Keepnet] Screenshot save disabled:', stepName)
    return
  }
  
  getAll() {
    // Her zaman boş döndür
    return {}
  }
}

/* ========== AUTO CLICK ENGINE ========== */
class AutoClickEngine {
  constructor() {
    this.timeout = null
    this.countdown = null
    this.onTimeout = null
    this.DISABLE_AUTOCLICK_ON_WORKFLOWS_4_6 = true // Feature flag to disable auto-click on workflows 4-6
  }
  
  start(element, delay, callback, workflowName = null) {
    this.stop()
    
    let remaining = delay
    this.onTimeout = callback
    this.currentWorkflowName = workflowName
    
    // Workflow 4-6 için auto-click'i devre dışı bırak
    if (workflowName && ['WORKFLOW_4', 'WORKFLOW_5', 'WORKFLOW_6'].includes(workflowName) && this.DISABLE_AUTOCLICK_ON_WORKFLOWS_4_6) {
      console.log(`[Keepnet] Auto-click disabled for ${workflowName} - manual interaction required`)
      return
    }
    
    // Countdown göster
    this.countdown = setInterval(() => {
      remaining -= 1000
      if (remaining <= 0) {
        clearInterval(this.countdown)
      } else {
        console.log(`[Keepnet] Auto-click in ${remaining / 1000}s...`)
      }
    }, 1000)
    
    // Timeout
    this.timeout = setTimeout(() => {
      console.log("[Keepnet] Auto-clicking element:", element)
      this.clickElement(element, workflowName)
      if (callback) callback()
    }, delay)
  }
  
  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    if (this.countdown) {
      window.clearInterval(this.countdown)
      this.countdown = null
    }
  }
  
  clickElement(el, workflowName = null) {
    if (!el) return
    
    try {
      // Workflow 4-6 için özel event handling
      const isWorkflow4To6 = workflowName && ['WORKFLOW_4', 'WORKFLOW_5', 'WORKFLOW_6'].includes(workflowName)
      
      if (isWorkflow4To6 && this.DISABLE_AUTOCLICK_ON_WORKFLOWS_4_6) {
        console.log(`[Keepnet] Auto-click disabled for ${workflowName} - manual interaction required`)
        
        // Log auto-click attempt
        if (window.assistant && window.assistant.panel) {
          window.assistant.panel.logPopupClosureReason('autoClick', workflowName, {
            elementTag: element.tagName,
            elementClass: element.className,
            elementId: element.id,
            disabled: true
          })
        }
        
        return
      }
      
      // Mouse events dispatch et
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: isWorkflow4To6 ? false : true, // Workflow 4-6 için event bubbling'i engelle
        cancelable: true,
        clientX: centerX,
        clientY: centerY
      })
      
      el.dispatchEvent(clickEvent)
      
      // Fallback
      if (el.click) {
        el.click()
      }
      
      // Workflow 4-6 için focus koruması
      if (isWorkflow4To6) {
        setTimeout(() => {
          if (el && typeof el.focus === 'function') {
            el.focus()
            
            // Log focus restoration
            if (window.assistant && window.assistant.panel) {
              window.assistant.panel.logPopupClosureReason('focusLoss', workflowName, {
                elementTag: el.tagName,
                elementClass: el.className,
                elementId: el.id,
                restored: true
              })
            }
          }
        }, 100)
      }
    } catch (e) {
      console.error("[Keepnet] Click error:", e)
    }
  }
}
/* ========== FLOATING PANEL (SOL-ALT) ========== */
class FloatingPanel {
  constructor() {
    this.container = null
    this.header = null
    this.body = null
    this.footer = null
    this.isDragging = false
    this.dragOffset = { x: 0, y: 0 }
    this.dragButtonPressed = false
    this.position = { x: 20, y: window.innerHeight - PANEL_SIZE.height - 20 } // SOL-ALT
    this.isDraggingEnabled = true  // Dragging kontrolü için flag
    this.dragAnimationFrame = null
    this.draggingPointerId = null
    this.baseTransition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    this.handleResize = this.handleResize.bind(this)
    
    // Feature flags for workflow 4-6 behavior
    this.DISABLE_OUTSIDE_CLOSE_WF_4_6 = true
    this.DISABLE_AUTOCLICK_ON_WORKFLOWS_4_6 = true
  }
  
  async init() {
    const savedState = await Storage.get(STORAGE_KEYS.PANEL_STATE)
    if (savedState?.position) {
      this.position = savedState.position
    }
    
    this.createPanel()
    this.attachEventListeners()
    this.injectStyles()
    this.setupGlobalClickProtection()
  }
  
  createPanel() {
    if (this.container) return
    
    this.container = document.createElement('div')
    this.container.id = 'keepnet-floating-panel'
    this.container.style.cssText = `
      position: fixed !important;
      top: ${this.position.y}px !important;
      left: ${this.position.x}px !important;
      width: ${PANEL_SIZE.width}px !important;
      height: ${PANEL_SIZE.height}px !important;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%) !important;
      border: 2px solid #4a9eff !important;
      border-radius: 20px !important;
      box-shadow: 0 0 30px rgba(74, 158, 255, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif !important;
      opacity: 0 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      transform: translateX(100px) scale(0.95) !important;
      transition: ${this.baseTransition} !important;
      backdrop-filter: blur(20px) !important;
    `
    
    console.log("[Keepnet] Panel created at:", this.position)
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
      this.container.style.opacity = '1'
      this.container.style.transform = 'translateX(0) scale(1)'
    })
    
    // Header
    this.header = document.createElement('div')
    this.header.style.cssText = `
      background: linear-gradient(135deg, #2d2d4a 0%, #3a3a5c 100%);
      color: white;
      padding: 16px 20px;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      touch-action: none;
      border-radius: 20px 20px 0 0;
      position: relative;
      overflow: hidden;
    `
    
    this.header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.12);">
          <img src="${chrome.runtime.getURL('icons/keepnetlogo.svg')}" alt="Keepnet" style="width: 28px; height: 28px; object-fit: contain; display: block;" />
        </div>
        <div>
          <div id="keepnet-assistant-title" style="font-size: 14px; font-weight: 600; margin-bottom: 2px;">${i18n('assistantTitle')}</div>
          <div style="font-size: 11px; opacity: 0.8;" id="keepnet-step-indicator"></div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <select id="keepnet-language-selector" class="keepnet-lang-select" style="
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        ">
          <option value="tr">🇹🇷 TR</option>
          <option value="en">🇬🇧 EN</option>
        </select>
        <button id="keepnet-close-btn" class="keepnet-close-btn" style="
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">×</button>
      </div>
    `
    
    // Progress bar
    const progressBar = document.createElement('div')
    progressBar.style.cssText = `
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.1);
      position: absolute;
      bottom: 0;
      left: 0;
    `
    progressBar.innerHTML = `
      <div id="keepnet-progress-bar" style="
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #4a9eff 0%, #5dade2 100%);
        transition: width 0.4s ease;
        border-radius: 0 0 20px 0;
      "></div>
    `
    this.header.appendChild(progressBar)
    
    // Body
    this.body = document.createElement('div')
    this.body.id = 'keepnet-panel-body'
    this.body.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
    `
    
    // Footer
    this.footer = document.createElement('div')
    this.footer.id = 'keepnet-panel-footer'
    this.footer.style.cssText = `
      padding: 16px 20px;
      background: rgba(26, 26, 46, 0.8);
      border-top: 1px solid rgba(74, 158, 255, 0.3);
      display: flex;
      gap: 10px;
      justify-content: space-between;
      backdrop-filter: blur(10px);
    `
    
    this.footer.innerHTML = `
      <button id="keepnet-prev-btn" class="keepnet-btn keepnet-btn-secondary" style="flex: 1;">
        ${i18n('previous')}
      </button>
      <button id="keepnet-next-btn" class="keepnet-btn keepnet-btn-primary" style="flex: 2;">
        ${i18n('continue')}
      </button>
      <button id="keepnet-summary-btn" class="keepnet-btn keepnet-btn-secondary" style="flex: 1; font-size: 11px;" title="Skip to summary report">
        ${i18n('summary')}
      </button>
    `
    
    this.container.appendChild(this.header)
    this.container.appendChild(this.body)
    this.container.appendChild(this.footer)
    
    console.log("[Keepnet] Appending panel to body...")
    document.body.appendChild(this.container)
    console.log("[Keepnet] Panel appended! Visible:", this.container.offsetWidth > 0)
    
    // Force visibility check
    setTimeout(() => {
      if (this.container.style.display === 'none' || !this.container.offsetWidth) {
        console.warn("[Keepnet] Panel not visible! Forcing...")
        this.container.style.display = 'flex'
        this.container.style.opacity = '1'
        this.container.style.visibility = 'visible'
      }
    }, 100)

    // Design demo removed
  }
  
  attachEventListeners() {
    const startDragging = (e) => {
      if (e.target.id === 'keepnet-close-btn') return
      const inLangSelector = (e.target && (e.target.id === 'keepnet-language-selector' || (e.target.closest && e.target.closest('#keepnet-language-selector'))))
      if (inLangSelector) return
      if (!this.isDraggingEnabled) return
      if (typeof e.button === 'number' && e.button !== 0) return
      
      this.isDragging = true
      this.draggingPointerId = e.pointerId ?? null
      this.dragOffset = {
        x: e.clientX - this.position.x,
        y: e.clientY - this.position.y
      }
      this.dragButtonPressed = true
      
      if (this.container) {
        this.container.style.transition = 'none'
      }
      
      if (this.header && typeof this.header.setPointerCapture === 'function' && e.pointerId !== undefined) {
        try {
          this.header.setPointerCapture(e.pointerId)
        } catch (captureError) {
          console.warn('[Keepnet] Pointer capture failed:', captureError)
        }
      }
      
      e.preventDefault()
    }
    
    const handlePointerMove = (e) => {
      if (!this.isDragging) return
      if (this.draggingPointerId !== null && e.pointerId !== undefined && e.pointerId !== this.draggingPointerId) return
      
      const nextX = e.clientX - this.dragOffset.x
      const nextY = e.clientY - this.dragOffset.y
      
      if (this.dragAnimationFrame) {
        cancelAnimationFrame(this.dragAnimationFrame)
      }
      
      this.dragAnimationFrame = requestAnimationFrame(() => {
        this.position = { x: nextX, y: nextY }
        this.updatePosition(true)
      })
    }
    
    const stopDraggingSafe = () => {
      if (!this.isDragging) return
      
      this.isDragging = false
      this.dragButtonPressed = false
      
      if (this.dragAnimationFrame) {
        cancelAnimationFrame(this.dragAnimationFrame)
        this.dragAnimationFrame = null
      }
      
      if (this.draggingPointerId !== null && this.header && typeof this.header.releasePointerCapture === 'function') {
        try {
          this.header.releasePointerCapture(this.draggingPointerId)
        } catch (releaseError) {
          console.warn('[Keepnet] Pointer release failed:', releaseError)
        }
      }
      
      this.draggingPointerId = null
      
      if (this.container) {
        this.container.style.transition = this.baseTransition
      }
      
      // Clamp position before saving to avoid off-screen persistence
      this.updatePosition(true)
      this.saveState()
      console.log('[Keepnet] Dragging stopped')
    }
    
    this.header.addEventListener('pointerdown', startDragging)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDraggingSafe, { capture: true })
    window.addEventListener('pointercancel', stopDraggingSafe, { capture: true })
    window.addEventListener('blur', stopDraggingSafe)
    window.addEventListener('resize', this.handleResize)
    
    // Close button
    const closeBtn = document.getElementById('keepnet-close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log("[Keepnet] Close button clicked - cleaning up...")
        
        // TÜM HIGHLIGHT'LARI TEMİZLE
        if (window.assistant) {
          window.assistant.clearHighlight()
        }
        
        // Ek güvenlik: tüm highlight class'larını ve tooltipleri temizle
        const allHighlighted = document.querySelectorAll('.keepnet-highlight')
        allHighlighted.forEach(el => {
          el.classList.remove('keepnet-highlight')
          el.style.outline = ''
          el.style.boxShadow = ''
        })
        const allTooltips = document.querySelectorAll('.keepnet-tooltip')
        allTooltips.forEach(t => t.remove())
        
        // Panel'i gizle
        this.container.style.display = 'none'
        
        // IMPORTANT: Global assistant instance'ları temizle
        // Bu sayede tekrar eklenti butonuna tıklayınca yeni bir instance oluşturulur
        window.assistantInstance = null
        window.assistant = null
        
        // Module-level assistantInstance'ı da temizle
        if (typeof assistantInstance !== 'undefined') {
          assistantInstance = null
        }
        
        console.log("[Keepnet] Panel closed and all instances cleared")
      })
    }
    
    // Language selector - no page reload, dynamic update handled elsewhere
    const langSelector = document.getElementById('keepnet-language-selector')
    if (langSelector) {
      // Load current language from storage
      chrome.storage.local.get(['keepnet_language'], (result) => {
        const currentLang = result.keepnet_language || CURRENT_LANGUAGE || 'tr'
        langSelector.value = currentLang
        console.log("[Keepnet] Current language loaded:", currentLang)
      })
      
      // Dropdown fokuslandığında sürüklemeyi geçici kapat, bırakıldığında aç
      langSelector.addEventListener('focus', () => {
        this.isDraggingEnabled = false
        this.header.style.cursor = 'default'
      })
      langSelector.addEventListener('blur', () => {
        this.isDraggingEnabled = true
        this.header.style.cursor = 'move'
      })
    }
  }
  
  stopDragging() {
    if (!this.isDragging) return
    
    this.isDragging = false
    this.dragButtonPressed = false
    
    if (this.dragAnimationFrame) {
      cancelAnimationFrame(this.dragAnimationFrame)
      this.dragAnimationFrame = null
    }
    
    if (this.draggingPointerId !== null && this.header && typeof this.header.releasePointerCapture === 'function') {
      try {
        this.header.releasePointerCapture(this.draggingPointerId)
      } catch (releaseError) {
        console.warn('[Keepnet] Pointer release failed:', releaseError)
      }
    }
    
    this.draggingPointerId = null
    
    if (this.container) {
      this.container.style.transition = this.baseTransition
    }
    
    // Clamp position before saving to avoid off-screen persistence
    this.updatePosition(true)
    this.saveState()
    console.log('[Keepnet] Dragging stopped')
  }
  
  updatePosition(shouldClamp = false) {
    if (this.container) {
      let { x, y } = this.position
      if (shouldClamp) {
        const margin = 8
        const maxX = Math.max(margin, window.innerWidth - PANEL_SIZE.width - margin)
        const maxY = Math.max(margin, window.innerHeight - PANEL_SIZE.height - margin)
        x = Math.min(Math.max(x, margin), maxX)
        y = Math.min(Math.max(y, margin), maxY)
        this.position = { x, y }
      }
      this.container.style.left = `${x}px`
      this.container.style.top = `${y}px`
    }
  }
  
  handleResize() {
    // Ekran boyutu değiştiğinde panel görünür alanda kalacak şekilde yeniden konumlandır
    this.updatePosition(true)
    this.saveState()
  }
  
  setContent(html) {
    this.body.innerHTML = html
  }
  
  updateProgress(current, total) {
    const percent = Math.round((current / total) * 100)
    
    const progressBar = document.getElementById('keepnet-progress-bar')
    if (progressBar) {
      const currentWidth = parseInt(progressBar.style.width) || 0
      AnimationUtils.animateProgressBar(progressBar, currentWidth, percent, 600)
      
      // Add shimmer effect on progress
      progressBar.style.background = `linear-gradient(90deg, 
        #22c55e 0%, 
        #16a34a 50%, 
        #22c55e 100%)`
      progressBar.style.backgroundSize = '200% 100%'
      progressBar.style.animation = 'keepnet-shimmer 2s linear infinite'
    }
    
    const indicator = document.getElementById('keepnet-step-indicator')
    if (indicator) {
      indicator.style.transition = 'all 0.3s ease'
      indicator.textContent = `${i18n('step')} ${current} ${i18n('of')} ${total}`
      AnimationUtils.animate(indicator, 'pulse', 300)
    }
  }
  
  showError(message) {
    const existing = this.body.querySelector('.keepnet-error-message')
    if (existing) {
      AnimationUtils.animate(existing, 'shake', 500)
      return
    }
    
    const errorEl = document.createElement('div')
    errorEl.className = 'keepnet-error-message'
    errorEl.style.cssText = `
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 500;
      opacity: 0;
      transform: translateY(-10px);
    `
    errorEl.textContent = message
    
    this.body.insertBefore(errorEl, this.body.firstChild)
    
    // Animate entrance
    AnimationUtils.animate(errorEl, 'fadeInUp', 400)
  }
  
  setupGlobalClickProtection() {
    // Yalnızca Keepnet paneli kapsamında tıklamaları yönet; Exchange formuna müdahale etme
    const keepnetPanel = document.getElementById('keepnet-floating-panel')
    if (!keepnetPanel) return

    // Panel içindeki tıklamalarda balonlamayı durdurarak sadece panel içi davranışları koru
    const stop = (e) => {
      // Sadece bubbling aşamasında durdur; hedef üzerindeki handler'lar çalışsın
      e.stopPropagation()
    }
    ;['click','mousedown','mouseup','pointerdown','pointerup','touchstart','touchend'].forEach(evt => {
      keepnetPanel.addEventListener(evt, stop, false)
    })

    // Exchange panel açıkken Keepnet paneline tıklanınca Exchange panel'inin kapanmasını engelle
    // Ama Keepnet panelindeki butonların çalışmasına izin ver
    const preventExchangePanelClose = (e) => {
      // Eğer tıklama Keepnet panelinden geliyorsa
      if (keepnetPanel.contains(e.target)) {
        // Exchange panel'i açık mı kontrol et
        const exchangeForm = document.querySelector('[role="dialog"], .ms-Panel, [data-automation-id="panel"], .ms-Modal')
        if (exchangeForm) {
          // Sadece Exchange panel'inin backdrop/overlay click handler'ını engelle
          // Keepnet panelindeki butonların handler'ları çalışmaya devam etsin
          // Capture phase'de sadece stopPropagation kullan, stopImmediatePropagation kullanma
          e.stopPropagation()
          console.log('[Keepnet] Prevented Exchange panel close on Keepnet panel click')
        }
      }
    }
    
    // Capture phase'de dinle - Exchange panel'inin handler'ından önce çalışsın
    // Ama sadece mousedown'da, click'te değil - böylece Keepnet butonları çalışır
    document.addEventListener('mousedown', preventExchangePanelClose, true)

    // Panel dışına tıklanırsa sadece kendi panel durumumuzu yönet (MS event'lerine dokunma)
    document.addEventListener('click', (e) => {
      if (!keepnetPanel.contains(e.target)) {
        this.logPopupClosureReason && this.logPopupClosureReason('outsideClickKeepnet', window.assistant?.workflowName, {
          targetElement: e.target?.tagName,
          targetClass: e.target?.className,
          targetId: e.target?.id
        })
        // İstenirse paneli kapat: keepnetPanel.style.display = 'none'
      }
    }, false)

    // ESC sadece panel odaklıyken ele alınır; Exchange event'lerine müdahale etme
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return
      const activeInPanel = keepnetPanel.contains(document.activeElement) || keepnetPanel.matches(':hover')
      if (!activeInPanel) return
      e.stopPropagation()
      // Panel içi alt katman kapanışları burada yönetilebilir
    }, false)
  }
  
  logPopupClosureReason(reason, workflowName, additionalInfo = {}) {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      reason,
      workflowName,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...additionalInfo
    }
    
    console.log(`[Keepnet] Popup closure detected:`, logData)
    
    // Development ortamında detaylı log
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
      console.group(`[Keepnet] Popup Closure Analysis`)
      console.log('Reason:', reason)
      console.log('Workflow:', workflowName)
      console.log('URL:', window.location.href)
      console.log('Additional Info:', additionalInfo)
      console.log('Exchange Form Present:', !!document.querySelector('[role="dialog"], .ms-Panel, [data-automation-id="panel"], .ms-Modal'))
      console.groupEnd()
    }
    
    // Storage'a kaydet (opsiyonel)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('keepnet_popup_logs') || '[]')
      existingLogs.push(logData)
      
      // Son 50 log'u tut
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50)
      }
      
      localStorage.setItem('keepnet_popup_logs', JSON.stringify(existingLogs))
    } catch (e) {
      console.warn('[Keepnet] Could not save popup closure log:', e)
    }
  }
  
  showSuccess(message) {
    const existing = this.body.querySelector('.keepnet-success-message')
    if (existing) existing.remove()
    
    const successEl = document.createElement('div')
    successEl.className = 'keepnet-success-message'
    successEl.style.cssText = `
      background: #d1fae5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 500;
      opacity: 0;
      transform: scale(0.9);
    `
    successEl.textContent = message
    
    this.body.insertBefore(successEl, this.body.firstChild)
    
    // Animate entrance with scale
    AnimationUtils.animate(successEl, 'scaleIn', 500)
  }
  
  async saveState() {
    await Storage.set(STORAGE_KEYS.PANEL_STATE, {
      position: this.position
    })
  }
  
  setPosition(positionType) {
    if (!this.container) return
    
    let newPosition = { x: 20, y: 20 }
    
    switch (positionType) {
      case 'top-left':
        newPosition = { x: 20, y: 20 }
        break
      case 'top-right':
        newPosition = { x: window.innerWidth - PANEL_SIZE.width - 20, y: 20 }
        break
      case 'bottom-left':
        newPosition = { x: 20, y: window.innerHeight - PANEL_SIZE.height - 20 }
        break
      case 'bottom-right':
      default:
        newPosition = { x: window.innerWidth - PANEL_SIZE.width - 20, y: window.innerHeight - PANEL_SIZE.height - 20 }
        break
    }
    
    this.position = newPosition
    this.container.style.left = `${newPosition.x}px`
    this.container.style.top = `${newPosition.y}px`
    
    console.log(`[Keepnet] Panel position changed to: ${positionType}`, newPosition)
    
    // Save new position
    this.saveState()
  }
  injectStyles() {
    if (document.getElementById('keepnet-styles')) {
      console.log("[Keepnet] Styles already injected")
      return
    }
    
    console.log("[Keepnet] Injecting styles...")
    const style = document.createElement('style')
    style.id = 'keepnet-styles'
    style.textContent = `
      .keepnet-btn {
        padding: 10px 16px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        position: relative;
        overflow: hidden;
      }
      
      .keepnet-btn-primary {
        background: #FFFFFF;
        color: #000000;
        border: none;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
        font-weight: 600;
      }
      
      .keepnet-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2);
      }
      
      .keepnet-btn-primary:active {
        transform: translateY(0);
      }
      
      .keepnet-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #FFFFFF;
        border: 1px solid rgba(74, 158, 255, 0.3);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        font-weight: 500;
      }
      
      .keepnet-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(74, 158, 255, 0.2);
      }
      
      #keepnet-panel-body::-webkit-scrollbar {
        width: 6px;
      }
      
      #keepnet-panel-body::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #4a9eff 0%, #5dade2 100%);
        border-radius: 3px;
      }
      
      /* Hover effects for header controls */
      .keepnet-lang-select:hover {
        background: rgba(255,255,255,0.2) !important;
      }
      
      .keepnet-close-btn:hover {
        background: rgba(255,255,255,0.2) !important;
      }
      
      .keepnet-nav-btn:hover {
        transform: scale(1.02) !important;
        box-shadow: 0 4px 8px rgba(124, 58, 237, 0.5) !important;
      }
      
      .keepnet-copy-btn:hover {
        background: rgba(255,255,255,0.12) !important;
      }
      
      .keepnet-copy-all-btn:hover {
        background: rgba(59,130,246,0.25) !important;
      }
      
      .keepnet-copy-btn:hover {
        background: rgba(255,255,255,0.12) !important;
      }
      
      .keepnet-summary-item:hover {
        background: rgba(255, 255, 255, 0.05) !important;
      }
      
      .keepnet-goto-step-btn:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        transform: translateY(-1px) !important;
      }
      
      .keepnet-highlight {
        outline: 2px solid #6366f1 !important;
        outline-offset: 2px !important;
        box-shadow: 
          0 0 0 6px rgba(99, 102, 241, 0.2),
          0 0 20px rgba(99, 102, 241, 0.4) !important;
        position: relative !important;
        z-index: 999998 !important;
        border-radius: 4px !important;
        animation: keepnet-pulse-ring 2s infinite !important;
        cursor: pointer !important;
      }
      
      /* Temizlendiğinde override et */
      .keepnet-highlight-removed {
        outline: none !important;
        outline-offset: 0 !important;
        background-color: transparent !important;
        box-shadow: none !important;
        animation: none !important;
        transform: none !important;
        z-index: auto !important;
      }
      
      @keyframes keepnet-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes keepnet-pulse-ring {
        0% { 
          box-shadow: 
            0 0 0 0 rgba(99, 102, 241, 0.4),
            0 0 0 6px rgba(99, 102, 241, 0.2),
            0 0 20px rgba(99, 102, 241, 0.4);
        }
        70% { 
          box-shadow: 
            0 0 0 10px rgba(99, 102, 241, 0),
            0 0 0 6px rgba(99, 102, 241, 0.2),
            0 0 20px rgba(99, 102, 241, 0.4);
        }
        100% { 
          box-shadow: 
            0 0 0 0 rgba(99, 102, 241, 0),
            0 0 0 6px rgba(99, 102, 241, 0.2),
            0 0 20px rgba(99, 102, 241, 0.4);
        }
      }
      
      @keyframes keepnet-bounce {
        0%, 100% { 
          transform: translateY(0px); 
          opacity: 1;
        }
        50% { 
          transform: translateY(-8px); 
          opacity: 0.8;
        }
      }
      
      .keepnet-tooltip {
        position: fixed;
        background: linear-gradient(135deg, #2d2d4a 0%, #3a3a5c 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 600;
        pointer-events: none;
        z-index: 1000000;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.1);
        white-space: nowrap;
        animation: keepnet-tooltip-pulse 2s ease-in-out infinite;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .keepnet-tooltip::before {
        content: '→';
        display: inline-block;
        margin-right: 8px;
        font-size: 16px;
        animation: keepnet-bounce 1s ease-in-out infinite;
      }
      
      @keyframes keepnet-tooltip-pulse {
        0%, 100% { 
          transform: scale(1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.1);
        }
        50% { 
          transform: scale(1.05);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255,255,255,0.2);
        }
      }
      
      /* Modern Timer Animations */
      @keyframes keepnet-timer-pulse {
        0%, 100% { 
          opacity: 1; 
          transform: scale(1);
        }
        50% { 
          opacity: 0.8; 
          transform: scale(1.05);
        }
      }
      
      @keyframes keepnet-timer-bounce {
        0%, 100% { 
          transform: translateY(0px); 
        }
        50% { 
          transform: translateY(-5px); 
        }
      }
      
      @keyframes keepnet-shimmer {
        0% { 
          background-position: 200% 0; 
        }
        100% { 
          background-position: -200% 0; 
        }
      }
    `
    
    document.head.appendChild(style)
  }
}

/* ========== MAIN ORCHESTRATOR ========== */
class KeepnetAssistant {
  constructor() {
    this.panel = null
    this.autoClick = null
    this.screenshots = null
    this.currentStep = 0
    this.stepResults = {}
    this.highlightedElement = null
    this.tooltip = null
    this.validationInterval = null
    this.currentWorkflow = WORKFLOW_STEPS  // Aktif workflow
    this.workflowName = 'WORKFLOW_1'  // Workflow adı
    this.currentTimerInterval = null  // Manual timer için interval
    this.lockPanelPosition = false    // Dil değişiminde panel pozisyonunu sabitle
    this.lastKnownUrl = window.location.href
    this.urlWatcher = null
  }
  
  getWorkflowAllowedUrls(step) {
    const basePatterns = {
      WORKFLOW_1: [/security\.microsoft\.com/],
      WORKFLOW_2: [/security\.microsoft\.com/],
      WORKFLOW_3: [/security\.microsoft\.com/],
      WORKFLOW_4: [/admin\.exchange\.microsoft\.com/],
      WORKFLOW_5: [/admin\.exchange\.microsoft\.com/],
      WORKFLOW_6: [/admin\.exchange\.microsoft\.com/]
    }
    
    const patterns = []
    
    if (step?.allowedUrls) {
      patterns.push(...[].concat(step.allowedUrls))
    }
    
    if (step?.navigate) {
      patterns.push(step.navigate)
    }
    
    patterns.push(...(basePatterns[this.workflowName] || []))
    
    return patterns
  }
  
  ensureOnAllowedPage(step) {
    const patterns = this.getWorkflowAllowedUrls(step)
    if (patterns.length === 0) return true
    
    const currentUrl = window.location.href
    const isAllowed = patterns.some((p) => {
      if (!p) return false
      if (p instanceof RegExp) return p.test(currentUrl)
      if (typeof p === 'string') return currentUrl.includes(p)
      return false
    })
    
    if (!isAllowed) {
      console.warn(`[Keepnet] URL guard blocked highlight for step ${step?.id} on ${currentUrl}`)
      this.clearHighlight()
      
      if (this.panel?.showError) {
        const messageTr = 'Doğru sayfada değilsiniz. Lütfen yönlendirme butonuna tıklayın veya ilgili sekmeye dönün.'
        const messageEn = 'You are not on the expected page. Please go to the required page and retry.'
        this.panel.showError(CURRENT_LANGUAGE === 'en' ? messageEn : messageTr)
      }
    }
    
    return isAllowed
  }
  
  validateTargetElement(element, target) {
    if (!element) return false
    if (!Utils.isVisible(element)) return false
    
    const rect = element.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) {
      return false
    }
    
    if (target?.textMatch) {
      const regex = typeof target.textMatch === 'string'
        ? new RegExp(target.textMatch, 'i')
        : target.textMatch
      const text = element.textContent || element.innerText || ''
      if (!regex.test(text)) {
        return false
      }
    }
    
    if (target?.selector) {
      const cleanSelector = target.selector.replace(/:contains\([^)]+\)/g, '').trim()
      try {
        if (cleanSelector && !element.matches(cleanSelector)) {
          // Selector uyuşmuyorsa ama textMatch tutuyorsa tolere et
          if (!target.textMatch) {
            return false
          }
        }
      } catch (e) {
        // matches hata verirse es geç
      }
    }
    
    return true
  }
  
  startUrlWatcher() {
    if (this.urlWatcher) {
      window.clearInterval(this.urlWatcher)
    }
    
    this.lastKnownUrl = window.location.href
    
    this.urlWatcher = window.setInterval(() => {
      const currentUrl = window.location.href
      if (currentUrl !== this.lastKnownUrl) {
        console.log('[Keepnet] URL changed, clearing highlights to avoid stale tooltips')
        this.lastKnownUrl = currentUrl
        this.clearHighlight()
      }
    }, 800)
  }
  
  async updateUILanguage(newLang) {
    try {
      // Header texts
      const titleEl = document.getElementById('keepnet-assistant-title')
      if (titleEl) titleEl.textContent = i18n('assistantTitle')
      
      // Language selector value
      const langSelector = document.getElementById('keepnet-language-selector')
      if (langSelector) langSelector.value = CURRENT_LANGUAGE
      
      // Footer buttons
      const prevBtn = document.getElementById('keepnet-prev-btn')
      const nextBtn = document.getElementById('keepnet-next-btn')
      const summaryBtn = document.getElementById('keepnet-summary-btn')
      if (prevBtn) prevBtn.textContent = i18n('previous')
      if (nextBtn) nextBtn.textContent = i18n('continue')
      if (summaryBtn) summaryBtn.textContent = i18n('summary')
      
      // Re-render current step fully but lock panel position to avoid jumps
      this.lockPanelPosition = true
      if (this.currentStep > 0) {
        await this.executeStep(this.currentStep)
      }
      this.lockPanelPosition = false
      
      console.log('[Keepnet] UI language refreshed for:', newLang)
    } catch (e) {
      console.warn('[Keepnet] updateUILanguage error:', e)
    }
  }
  
  async init() {
    try {
      console.log("[Keepnet] Initializing assistant...")
      
      // Load language preferences first
      await loadLanguagePreference()
      console.log("[Keepnet] Language loaded:", CURRENT_LANGUAGE)
      await Utils.sleep(100)
      
      // Hangi workflow'dayız? URL'ye göre belirle
      const currentUrl = window.location.href
      const nextWorkflowName = await Storage.get('keepnet_next_workflow')
      
      if (nextWorkflowName) {
        // Yeni workflow başlatılıyor
        console.log("[Keepnet] Starting new workflow from storage:", nextWorkflowName)
        
        if (nextWorkflowName === 'WORKFLOW_2') {
          this.currentWorkflow = THREAT_POLICIES_STEPS
          this.workflowName = 'WORKFLOW_2'
        } else if (nextWorkflowName === 'WORKFLOW_3') {
          this.currentWorkflow = SAFE_LINKS_STEPS
          this.workflowName = 'WORKFLOW_3'
        } else if (nextWorkflowName === 'WORKFLOW_4') {
          this.currentWorkflow = SPAM_FILTER_BYPASS_STEPS
          this.workflowName = 'WORKFLOW_4'
          console.log("[Keepnet] WORKFLOW_4 (Spam Filter Bypass) selected!")
        } else if (nextWorkflowName === 'WORKFLOW_5') {
          this.currentWorkflow = ATP_LINK_BYPASS_STEPS
          this.workflowName = 'WORKFLOW_5'
          console.log("[Keepnet] WORKFLOW_5 (ATP Link Bypass) selected!")
        } else if (nextWorkflowName === 'WORKFLOW_6') {
          this.currentWorkflow = ATP_ATTACHMENT_BYPASS_STEPS
          this.workflowName = 'WORKFLOW_6'
          console.log("[Keepnet] WORKFLOW_6 (ATP Attachment Bypass) selected!")
        }
        
        // Workflow değiştiği için tüm state'i temizle
        console.log("[Keepnet] Clearing all state for new workflow...")
        this.currentStep = 0
        this.stepResults = {}
        await Storage.set(STORAGE_KEYS.CURRENT_STEP, 0)
        await Storage.set(STORAGE_KEYS.STEP_RESULTS, {})
        
        // ÖNEMLI: nextWorkflowName varsa, URL kontrolünü ATLAMA!
        // Workflow zaten yukarıda seçildi, URL'ye bakmaya gerek yok
      } else {
        // nextWorkflowName YOK, URL'ye göre workflow belirle
        if (currentUrl.includes('/antispam')) {
          console.log("[Keepnet] Detected Anti-Spam page, setting WORKFLOW_2")
          this.currentWorkflow = THREAT_POLICIES_STEPS
          this.workflowName = 'WORKFLOW_2'
        } else if (currentUrl.includes('/safelinks') || currentUrl.includes('/threatpolicy')) {
          console.log("[Keepnet] Detected Safe Links page, setting WORKFLOW_3")
          this.currentWorkflow = SAFE_LINKS_STEPS
          this.workflowName = 'WORKFLOW_3'
        } else if (currentUrl.includes('admin.exchange.microsoft.com')) {
          console.log("[Keepnet] Detected Exchange Admin page, setting WORKFLOW_4 (default)")
          // Exchange admin sayfasında varsayılan olarak WORKFLOW_4
          this.currentWorkflow = SPAM_FILTER_BYPASS_STEPS
          this.workflowName = 'WORKFLOW_4'
        } else {
          console.log("[Keepnet] Default to WORKFLOW_1 (Phishing Simulation)")
          this.currentWorkflow = WORKFLOW_STEPS
          this.workflowName = 'WORKFLOW_1'
        }
      }
      
      console.log("[Keepnet] Current workflow:", this.workflowName)
      
      // Load saved progress (ama sadece yeni workflow değilse)
      if (!nextWorkflowName) {
      const saved = await Storage.get(STORAGE_KEYS.CURRENT_STEP)
      if (saved && saved > 0) {
        this.currentStep = saved
          console.log("[Keepnet] 📂 Loaded saved step:", saved)
      } else {
        this.currentStep = 1
      }
      
      const savedResults = await Storage.get(STORAGE_KEYS.STEP_RESULTS)
        if (savedResults) {
          this.stepResults = savedResults
          console.log("[Keepnet] 📂 Loaded saved results")
        }
      } else {
        // Yeni workflow başlatıyoruz, saved state yükleme
        this.currentStep = 1
        console.log("[Keepnet] 🆕 New workflow, starting from step 1")
      }
      
      // Initialize components
      this.panel = new FloatingPanel()
      await this.panel.init()
      this.panel.handleResize()
      
      this.autoClick = new AutoClickEngine()
      
      this.screenshots = new ScreenshotManager()
      await this.screenshots.init()
      
      // Global reference for language updates and diagnostics
      try {
        window.assistant = this
      } catch (e) {}
      
      // ÖNEMLİ: Button handler'ları BURADA attach et
      console.log('[Keepnet] Calling attachButtonHandlers()...')
      this.attachButtonHandlers()
      
      // Global fonksiyonları tanımla (summary ekranı için)
      this.setupGlobalFunctions()
      
      // URL değişimlerinde eski highlight'ların yanlış sayfada kalmasını engelle
      this.startUrlWatcher()
      
      // Güvenlik ağı: Eski highlight'ları sürekli kontrol et ve temizle
      this.highlightCleaner = window.setInterval(() => {
        try {
          const allHighlighted = document.querySelectorAll('.keepnet-highlight')
          const allTooltips = document.querySelectorAll('.keepnet-tooltip')
          
          // Aktif highlighted element yoksa tüm highlight'ları temizle
          if (!this.highlightedElement && allHighlighted.length > 0) {
            console.warn('[Keepnet] Found orphan highlights, cleaning...')
            allHighlighted.forEach(el => {
              el.classList.remove('keepnet-highlight')
              el.style.outline = ''
              el.style.boxShadow = ''
            })
          }
          
          // Birden fazla tooltip varsa fazlalarını temizle
          if (allTooltips.length > 1) {
            console.warn('[Keepnet] Found multiple tooltips, cleaning...')
            allTooltips.forEach((tooltip, idx) => {
              if (idx > 0) tooltip.remove()
            })
          }
        } catch (e) {
          console.warn('[Keepnet] highlightCleaner error:', e)
        }
      }, 2000)
      
      // Cleanup fonksiyonu
      this.cleanup = () => {
        if (this.highlightCleaner) {
          window.clearInterval(this.highlightCleaner)
          this.highlightCleaner = null
        }
        if (this.urlWatcher) {
          window.clearInterval(this.urlWatcher)
          this.urlWatcher = null
        }
        this.clearHighlight()
      }
      
      // YENİ: "Git ve Düzelt" modunu kontrol et
      const fixingStep = await Storage.get('keepnet_fixing_step')
      if (fixingStep) {
        console.log("[Keepnet] Fixing mode detected! Going to step:", fixingStep)
        
        // Fixing flag'ini temizle
        await Storage.set('keepnet_fixing_step', null)
        
        // Footer'ı göster
        const footer = document.getElementById('keepnet-panel-footer')
        if (footer) {
          footer.style.display = 'flex'
        }
        
        // Direkt adıma git
        await this.executeStep(fixingStep)
        return
      }
      
      // Start first step (navigation step ise 2. adımdan başla)
      const firstStep = this.currentWorkflow[this.currentStep - 1]
      if (firstStep && firstStep.isNavigation && this.currentStep === 1) {
        // Navigation adımını atla, 2. adıma geç
        console.log("[Keepnet] Skipping navigation step, starting from step 2")
        this.currentStep = 2
        await Storage.set(STORAGE_KEYS.CURRENT_STEP, 2)
        await this.executeStep(2)
      } else {
        // Normal şekilde başlat
      await this.executeStep(this.currentStep)
      }
      
      console.log("[Keepnet] Assistant ready!")
    } catch (error) {
      console.error("[Keepnet] Init error:", error)
      alert("Keepnet Asistanı başlatılamadı. Lütfen sayfayı yenileyip tekrar deneyin.\n\nHata: " + error.message)
    }
  }
  setupGlobalFunctions() {
    const assistant = this
    
    console.log("[Keepnet] setupGlobalFunctions() called")
    
    // Global function - Sonraki workflow'a git
    window.keepnetContinueWorkflow = async () => {
      console.log("[Keepnet] keepnetContinueWorkflow() called!")
      console.log("[Keepnet] Current workflow:", assistant.workflowName)
      
      try {
        let nextWorkflow = null
        let nextWorkflowName = ''
        
        console.log("[Keepnet] Determining next workflow from:", assistant.workflowName)
        
        // DOĞRU SIRALAMA
        if (assistant.workflowName === 'WORKFLOW_1') {
          console.log("[Keepnet] Starting WORKFLOW_2...")
          nextWorkflow = THREAT_POLICIES_STEPS
          nextWorkflowName = 'WORKFLOW_2'
          
        } else if (assistant.workflowName === 'WORKFLOW_2') {
          console.log("[Keepnet] Starting WORKFLOW_3...")
          nextWorkflow = SAFE_LINKS_STEPS
          nextWorkflowName = 'WORKFLOW_3'
          
        } else if (assistant.workflowName === 'WORKFLOW_3') {
          console.log("[Keepnet] Starting WORKFLOW_4...")
          nextWorkflow = SPAM_FILTER_BYPASS_STEPS
          nextWorkflowName = 'WORKFLOW_4'
          
        } else if (assistant.workflowName === 'WORKFLOW_4') {
          console.log("[Keepnet] Starting WORKFLOW_5...")
          nextWorkflow = ATP_LINK_BYPASS_STEPS
          nextWorkflowName = 'WORKFLOW_5'
          
          // WORKFLOW_5 -> WORKFLOW_6 gibi aynı sayfada devam et!
          console.log("[Keepnet] WORKFLOW_5 starting on SAME PAGE...")
          assistant.currentWorkflow = nextWorkflow
          assistant.workflowName = nextWorkflowName
          assistant.currentStep = 1
          assistant.stepResults = {}
          
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 1)
          await Storage.set(STORAGE_KEYS.STEP_RESULTS, {})
          await Storage.set('keepnet_next_workflow', null)
          
          // Footer'ı göster
          const footer = document.getElementById('keepnet-panel-footer')
          if (footer) {
            footer.style.display = 'flex'
          }
          
          console.log("[Keepnet] Starting WORKFLOW_5 Step 1...")
          await assistant.executeStep(1)
          console.log("[Keepnet] WORKFLOW_5 started!")
          return // Burada return et, sayfa değiştirme!
          
        } else if (assistant.workflowName === 'WORKFLOW_5') {
          // WORKFLOW_5 -> WORKFLOW_6 AYNI SAYFADA!
          console.log("[Keepnet] Starting WORKFLOW_6 on SAME PAGE...")
          nextWorkflow = ATP_ATTACHMENT_BYPASS_STEPS
          nextWorkflowName = 'WORKFLOW_6'
          
          // ÖNEMLI: Aynı sayfada workflow değiştir!
          assistant.currentWorkflow = nextWorkflow
          assistant.workflowName = nextWorkflowName
          assistant.currentStep = 1
          assistant.stepResults = {}
          
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 1)
          await Storage.set(STORAGE_KEYS.STEP_RESULTS, {})
          await Storage.set('keepnet_next_workflow', null)
          
          // Footer'ı göster
          const footer = document.getElementById('keepnet-panel-footer')
          if (footer) {
            footer.style.display = 'flex'
          }
          
          console.log("[Keepnet] Starting WORKFLOW_6 Step 1...")
          await assistant.executeStep(1)
          console.log("[Keepnet] WORKFLOW_6 started!")
          return // Burada return et, sayfa değiştirme!
          
        } else if (assistant.workflowName === 'WORKFLOW_6') {
          console.log("[Keepnet] All workflows completed!")
          assistant.panel?.showSuccess('Tüm workflow\'lar tamamlandı!')
          return
        }
        
        // WORKFLOW_5 değilse, diğer workflow'lar için normal akış
        if (!nextWorkflow) {
          console.error("[Keepnet] No next workflow found!")
          return
        }
        
        // Step results'ı temizle
        assistant.stepResults = {}
        await Storage.set(STORAGE_KEYS.STEP_RESULTS, {})
        
        // Yeni workflow'u storage'a kaydet
        await Storage.set('keepnet_next_workflow', nextWorkflowName)
        
        // İlk adım navigation mı?
        const firstStep = nextWorkflow[0]
        
        if (firstStep.isNavigation && firstStep.navigate) {
          console.log("[Keepnet] First step is navigation, going to:", firstStep.navigate)
          
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 1)
          
          const currentUrl = window.location.href
          const targetUrl = firstStep.navigate
          
          console.log("[Keepnet] Current URL:", currentUrl)
          console.log("[Keepnet] Target URL:", targetUrl)
          
          // Farklı sayfaya git
          console.log("[Keepnet] Navigating to:", targetUrl)
          window.location.href = targetUrl
          
        } else {
          // Navigation yoksa aynı sayfada devam et
          console.log("[Keepnet] No navigation step, starting on same page...")
          
          const footer = document.getElementById('keepnet-panel-footer')
          if (footer) {
            footer.style.display = 'flex'
          }
          
          assistant.currentWorkflow = nextWorkflow
          assistant.workflowName = nextWorkflowName
          assistant.currentStep = 1
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 1)
          
          console.log("[Keepnet] Starting", nextWorkflowName, "...")
          await assistant.executeStep(1)
          console.log("[Keepnet] Step 1 executed!")
        }
        
      } catch (error) {
        console.error("[Keepnet] Error continuing workflow:", error)
        assistant.panel?.showError(`Hata: ${error.message}`)
      }
    }
    
    // YENİ: Akıllı "Git ve Düzelt" sistemi
    window.keepnetGoToStep = async (stepId, workflowName) => {
      console.log(`[Keepnet] Git ve Düzelt: Step ${stepId}, Workflow: ${workflowName}`)
      
      // Hangi workflow'dayız?
      const targetWorkflow = workflowName || assistant.workflowName
      
      // Workflow'a göre steps array'ini al
      let stepsArray = null
      let baseUrl = ''
      
      switch (targetWorkflow) {
        case 'WORKFLOW_1':
          stepsArray = WORKFLOW_STEPS
          baseUrl = 'https://security.microsoft.com'
          break
        case 'WORKFLOW_2':
          stepsArray = THREAT_POLICIES_STEPS
          baseUrl = 'https://security.microsoft.com/antispam'
          break
        case 'WORKFLOW_3':
          stepsArray = SAFE_LINKS_STEPS
          baseUrl = 'https://security.microsoft.com/threatpolicy'
          break
        case 'WORKFLOW_4':
          stepsArray = SPAM_FILTER_BYPASS_STEPS
          baseUrl = 'https://admin.exchange.microsoft.com/#/transportrules'
          break
        case 'WORKFLOW_5':
          stepsArray = ATP_LINK_BYPASS_STEPS
          baseUrl = 'https://admin.exchange.microsoft.com/#/transportrules'
          break
        case 'WORKFLOW_6':
          stepsArray = ATP_ATTACHMENT_BYPASS_STEPS
          baseUrl = 'https://admin.exchange.microsoft.com/#/transportrules'
          break
      }
      
      if (!stepsArray) {
        console.error("[Keepnet] Unknown workflow:", targetWorkflow)
        alert('Bilinmeyen workflow!')
        return
      }
      
      // Target step'i bul
      const targetStep = stepsArray[stepId - 1]
      if (!targetStep) {
        console.error("[Keepnet] Step not found:", stepId)
        alert('Adım bulunamadı!')
        return
      }
      
      // Step'in navigate URL'i var mı?
      const targetUrl = targetStep.navigate || baseUrl
      const currentUrl = window.location.href
      
      console.log(`[Keepnet] Target URL: ${targetUrl}`)
      console.log(`[Keepnet] Current URL: ${currentUrl}`)
      
      // Workflow değiştiriyorsak, önce workflow'u kaydet
      if (targetWorkflow !== assistant.workflowName) {
        console.log(`[Keepnet] Switching from ${assistant.workflowName} to ${targetWorkflow}`)
        await Storage.set('keepnet_next_workflow', targetWorkflow)
        await Storage.set('keepnet_fixing_step', stepId)
      } else {
        // Aynı workflow içinde adım değiştirme
        await Storage.set('keepnet_fixing_step', stepId)
      }
      
      // Step'i kaydet
      await Storage.set(STORAGE_KEYS.CURRENT_STEP, stepId)
      
      // Farklı sayfadaysak yönlendir
      if (!currentUrl.startsWith(targetUrl.split('?')[0].split('#')[0])) {
        console.log(`[Keepnet] Git ve Düzelt: Navigating to ${targetUrl}`)
        window.location.href = targetUrl
      } else {
        // Aynı sayfadaysak direkt adıma geç
        console.log(`[Keepnet] Git ve Düzelt: Same page, executing step ${stepId}`)
        
        // Workflow değiştiyse güncelle
        if (targetWorkflow !== assistant.workflowName) {
          assistant.currentWorkflow = stepsArray
          assistant.workflowName = targetWorkflow
        }
        
        await assistant.executeStep(stepId)
      }
    }
    
    console.log("[Keepnet] Global functions registered")
  }
  
  attachButtonHandlers() {
    console.log('[Keepnet] attachButtonHandlers() called')
    // DOM tam hazır olmayabilir, biraz bekleyip tekrar dene
    setTimeout(() => {
      console.log('[Keepnet] Looking for buttons...')
      const nextBtn = document.getElementById('keepnet-next-btn')
      const prevBtn = document.getElementById('keepnet-prev-btn')
      const summaryBtn = document.getElementById('keepnet-summary-btn')
      
      console.log('[Keepnet] Button search results:', {
        nextBtn: !!nextBtn,
        prevBtn: !!prevBtn,
        summaryBtn: !!summaryBtn,
        footer: !!document.getElementById('keepnet-panel-footer')
      })
      
      if (!nextBtn || !prevBtn || !summaryBtn) {
        console.error('[Keepnet] BUTTONS NOT FOUND! Retrying in 500ms...')
        setTimeout(() => this.attachButtonHandlers(), 500)
        return
      }
      
      // NEXT
      console.log('[Keepnet] Attaching Next button handler...')
      const newNextBtn = nextBtn.cloneNode(true)
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn)
      newNextBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('[Keepnet] NEXT BUTTON CLICKED')
        console.log('[Keepnet] Current workflow:', this.workflowName)
        try {
          this.nextStep()
        } catch (err) {
          console.error('[Keepnet] nextStep error:', err)
          alert('Hata: ' + (err?.message || err))
        }
      })
      console.log('[Keepnet] Next button handler attached')
      
      // PREVIOUS
      console.log('[Keepnet] Attaching Previous button handler...')
      const newPrevBtn = prevBtn.cloneNode(true)
      prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn)
      newPrevBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
        console.log('[Keepnet] PREVIOUS BUTTON CLICKED')
        try {
          this.prevStep()
        } catch (err) {
          console.error('[Keepnet] prevStep error:', err)
          alert('Hata: ' + (err?.message || err))
        }
      })
      console.log('[Keepnet] Previous button handler attached')
      
      // SUMMARY
      console.log('[Keepnet] Attaching Summary button handler...')
      const newSummaryBtn = summaryBtn.cloneNode(true)
      summaryBtn.parentNode.replaceChild(newSummaryBtn, summaryBtn)
      newSummaryBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
        console.log('[Keepnet] SUMMARY BUTTON CLICKED')
        try {
          this.showSummary()
        } catch (err) {
          console.error('[Keepnet] showSummary error:', err)
          alert('Hata: ' + (err?.message || err))
        }
      })
      console.log('[Keepnet] Summary button handler attached')
      console.log('[Keepnet] All button handlers attached successfully')
      
      // Language selector dynamic change (no reload)
      this.attachLanguageChangeHandler()
    }, 500)
  }
  
  attachLanguageChangeHandler() {
      const langSelector = document.getElementById('keepnet-language-selector')
    if (!langSelector) {
      console.warn('[Keepnet] Language selector not found for handler attachment')
      return
    }
    
    // Önceki dinleyicileri kaldırmak için clone tekniği
    const cloned = langSelector.cloneNode(true)
    langSelector.parentNode.replaceChild(cloned, langSelector)
    
    cloned.value = CURRENT_LANGUAGE
    cloned.addEventListener('change', async (e) => {
          const newLang = e.target.value
          console.log('[Keepnet] Language selector changed to:', newLang)
      
      if (typeof cloned.blur === 'function') {
        cloned.blur()
      }
      
      await changeLanguage(newLang)
    })
        console.log('[Keepnet] Language selector handler attached')
  }
  applyAutoMode(step) {
    if (!AUTO_MODE) return step
    const cloned = { ...step }
    
    // Varsayılan: otomatik tıklama ve otomatik ilerleme açık
    cloned.autoClick = cloned.autoClick !== false
    cloned.autoAdvance = cloned.autoAdvance !== false
    cloned.autoAdvanceDelay = cloned.autoAdvanceDelay ?? AUTO_MODE_ADVANCE_DELAY
    
    // Manuel timer/manuel step'leri devre dışı bırak veya kısalt
    if (cloned.manualTimer) {
      cloned.manualTimer = 0
    }
    if (cloned.manualStep) {
      cloned.manualStep = false
    }
    
    // Butonları gizleme bayraklarını kapat
    if (cloned.hideButtons) cloned.hideButtons = false
    
    return cloned
  }
  
  async autoFillForStep(step) {
    if (!AUTO_MODE) return
    
    const ipList = ['149.72.161.59', '149.72.42.201', '149.72.154.87']
    const domainList = [
      'signin-authzone.com', 'verifycloudaccess.com', 'akibadem.org', 'isdestek.org',
      'gartnerpeer.com', 'global-cloud-llc.com', 'cloudverification.online',
      'accountaccesses.com'
    ]
    const urlList = [
      'signin-authzone.com',
      'verifycloudaccess.com',
      'accountaccesses.com'
    ]
    
    const fillText = (selector, text) => {
      const el = document.querySelector(selector)
      if (el) {
        el.focus()
        el.value = text
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      }
      return false
    }
    
    const fillAnyInput = (text) => {
      const candidates = Array.from(document.querySelectorAll('textarea, input[type="text"]:not([type="hidden"]), input.ms-BasePicker-input'))
      for (const el of candidates) {
        if (!el.value || !el.value.trim()) {
          el.focus()
          el.value = text
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
          return true
        }
      }
      return false
    }
    
    // Domain girme adımları
    if (['step8_domains_input', 'safelinks_step10_domain_select'].includes(step.name)) {
      const joined = domainList.join('\n')
      if (fillText('textarea, input[type="text"]', joined)) return
      fillAnyInput(joined)
      return
    }
    
    // IP girme adımları
    if (['step9_ip_input', 'antispam_step5_add_ips', 'spambypass_step9_enter_ip', 'atplink_step8_ip_addresses', 'atpattach_step8_ip_addresses'].includes(step.name)) {
      const joined = ipList.join('\n')
      if (fillText('textarea, input[type="text"]', joined)) return
      fillAnyInput(joined)
      return
    }
    
    // URL girme adımı
    if (['step10_simulation_urls_input', 'safelinks_step16_urls_input'].includes(step.name)) {
      const joined = urlList.join('\n')
      if (fillText('textarea, input[type="text"]', joined)) return
      fillAnyInput(joined)
      return
    }
    
    // NOT: Genel amaçlı otomatik doldurma YOK.
    // Sadece yukarıdaki açıkça tanımlı IP/Domain/URL adımlarında otomatik doldurma yapılır.
  }
  
  async executeStep(stepNum, customSteps = null) {
    try {
      // ÖNCELİKLE HER ŞEYİ TEMİZLE!
      console.log(`[Keepnet] Cleaning before step ${stepNum}`)
      this.clearHighlight()
      
      // Timer'ları temizle
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer)
        autoAdvanceTimer = null
      }
      if (this.currentTimerInterval) {
        clearInterval(this.currentTimerInterval)
        this.currentTimerInterval = null
      }
      
      // Biraz bekle ki DOM temizlensin
      await Utils.sleep(100)
      console.log(`[Keepnet] Cleaned, now executing step ${stepNum}`)
      
      console.log(`[Keepnet] executeStep called: step=${stepNum}, workflow=${this.workflowName}`)
      
      // Clear previous timer (ek güvenlik)
      if (this.currentTimerInterval) { clearInterval(this.currentTimerInterval); this.currentTimerInterval = null }
      if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null }
      
      // Hangi steps array'ini kullanacağız?
      if (customSteps) {
        this.currentWorkflow = customSteps
        this.workflowName = customSteps === THREAT_POLICIES_STEPS ? 'WORKFLOW_2' : 
                           customSteps === SAFE_LINKS_STEPS ? 'WORKFLOW_3' : 'WORKFLOW_1'
        console.log(`[Keepnet] Switching to ${this.workflowName}`)
      }
      
      // Eğer ATP_ATTACHMENT_BYPASS_STEPS kullanılıyorsa, workflow ismini güncelle
      if (this.currentWorkflow === ATP_ATTACHMENT_BYPASS_STEPS && this.workflowName !== 'WORKFLOW_6') {
        console.log('[Keepnet] Detected ATP_ATTACHMENT_BYPASS_STEPS but workflow name mismatch, fixing...')
        this.workflowName = 'WORKFLOW_6'
      }
      
      const stepsArray = this.currentWorkflow
      let step = stepsArray[stepNum - 1]
      
      if (!step) {
        console.error("[Keepnet] Step not found:", stepNum)
        return
      }
      
      // Otomatik mod ayarlarını uygula
      step = this.applyAutoMode(step)
      
      // Otonom ajan: navigation adımlarında otomatik git
      if (AUTO_AGENT && step.isNavigation && step.navigate) {
        console.log(`[Keepnet] AUTO_AGENT navigating to ${step.navigate}`)
        window.location.href = step.navigate
      }
      
      console.log(`[Keepnet] Executing step ${stepNum}: ${i18n(step.title)}`)
      
      this.currentStep = stepNum
      await Storage.set(STORAGE_KEYS.CURRENT_STEP, stepNum)
      
      // Update panel
      const totalSteps = stepsArray.length
      this.panel.updateProgress(stepNum, totalSteps)
      
      // Footer butonlarını güncelle
      const prevBtn = document.getElementById('keepnet-prev-btn')
      const nextBtn = document.getElementById('keepnet-next-btn')
      const summaryBtn = document.getElementById('keepnet-summary-btn')
      
      if (prevBtn) {
        prevBtn.textContent = i18n('previous')
        prevBtn.style.display = 'block'
        if (stepNum === 1) {
          prevBtn.disabled = true
          prevBtn.style.opacity = '0.5'
          prevBtn.style.cursor = 'not-allowed'
          prevBtn.style.pointerEvents = 'none'
        } else {
          prevBtn.disabled = false
          prevBtn.style.opacity = '1'
          prevBtn.style.cursor = 'pointer'
          prevBtn.style.pointerEvents = 'auto'
        }
      }
      
      if (nextBtn) {
        nextBtn.textContent = i18n('continue')
      }
      
      if (summaryBtn) {
        summaryBtn.textContent = i18n('summary')
      }
      
      if (step.isSummary && nextBtn) {
        nextBtn.style.display = 'none'
      } else if (nextBtn) {
        nextBtn.style.display = 'block'
      }
      
      // Footer'ı göster (summary değilse)
      const footer = document.getElementById('keepnet-panel-footer')
      if (footer && !step.isSummary && !step.hideButtons) {
        footer.style.display = 'flex'
      } else if (footer && step.hideButtons) {
        footer.style.display = 'none'
      }
      
      // Clear previous highlights
      this.clearHighlight()
      
      // Summary step?
      if (step.isSummary) {
        await this.showSummary()
        return
      }
      
      // Info card step?
      if (step.isInfoCard) {
        this.renderStepContent(step)
        
        // Auto advance after delay
        if (step.autoAdvance && step.autoAdvanceDelay) {
          autoAdvanceTimer = setTimeout(() => {
            // Her durumda, step değişmediyse kesin ilerle!
            if (window.assistant && step.id === window.assistant.currentWorkflow[window.assistant.currentStep-1]?.id) {
              console.log('[Keepnet] Fail-safe auto-advance. Step:', step.id);
              window.assistant.nextStep();
            }
          }, step.autoAdvanceDelay);
        }
        return
      }
      
      // Panel position control (skip if locked during live language switch)
      // ÖNEMLİ: Workflow 1 Step 8-9-10 ve Workflow 2 Step 4-5 kontrolü EN SONDA yapılmalı (override edilmemesi için)
      if (!this.lockPanelPosition && this.workflowName === 'WORKFLOW_4' && this.currentStep >= 3) {
        // Workflow 4'te step 3'ten 24'e kadar hep sol tarafta kal (step'lerin kendi panelPosition'ını override et)
        console.log(`[Keepnet] WORKFLOW_4 Panel Override: Step ${this.currentStep} - FORCED LEFT position`)
        this.panel.setPosition('bottom-left')
      } else if (!this.lockPanelPosition && this.workflowName === 'WORKFLOW_5' && this.currentStep >= 2) {
        // Workflow 5'te step 2'den itibaren hep sol tarafta kal
        console.log(`[Keepnet] WORKFLOW_5 Panel Override: Step ${this.currentStep} - FORCED LEFT position`)
        this.panel.setPosition('bottom-left')
      } else if (!this.lockPanelPosition && this.workflowName === 'WORKFLOW_6' && this.currentStep >= 2) {
        // Workflow 6'te step 2'den itibaren hep sol tarafta kal
        console.log(`[Keepnet] WORKFLOW_6 Panel Override: Step ${this.currentStep} - FORCED LEFT position`)
        this.panel.setPosition('bottom-left')
      } else if (!this.lockPanelPosition && this.workflowName === 'WORKFLOW_1' && [8, 9, 10].includes(this.currentStep)) {
        // WORKFLOW 1 Step 8-9-10 için özel panel pozisyonu - formun sol tarafında sabit kal
        // Bu kontrol EN SONDA yapılmalı, diğer kontroller override etmesin
        console.log(`[Keepnet] WORKFLOW_1 Step ${this.currentStep} - Fixing panel position to left side (dragging disabled)`)
        this.panel.setPosition('top-left')
        // Dragging devre dışı - panel sabit kalır
        this.panel.isDraggingEnabled = false
      } else if (!this.lockPanelPosition && this.workflowName === 'WORKFLOW_2' && [4, 5].includes(this.currentStep)) {
        // WORKFLOW 2 Step 4-5 için özel panel pozisyonu - formun sol tarafında sabit kal
        // Bu kontrol EN SONDA yapılmalı, diğer kontroller override etmesin
        console.log(`[Keepnet] WORKFLOW_2 Step ${this.currentStep} - Fixing panel position to left side (dragging disabled)`)
        this.panel.setPosition('top-left')
        // Dragging devre dışı - panel sabit kalır
        this.panel.isDraggingEnabled = false
      } else if (!this.lockPanelPosition && step.panelPosition === 'top-left') {
        console.log(`[Keepnet] Step Panel Position: top-left`)
        this.panel.setPosition('top-left')
      } else if (!this.lockPanelPosition && step.panelPosition === 'left') {
        console.log(`[Keepnet] Step Panel Position: left`)
        this.panel.setPosition('bottom-left')
      } else if (!this.lockPanelPosition) {
        console.log(`[Keepnet] Default Panel Position: bottom-right`)
        this.panel.setPosition('bottom-right') // default
      }
      
      // Workflow 1 diğer adımlarında dragging aktif olsun (Step 8-9-10 hariç)
      if (this.workflowName === 'WORKFLOW_1' && ![8, 9, 10].includes(this.currentStep)) {
        this.panel.isDraggingEnabled = true
      }
      
      // Workflow 2 diğer adımlarında dragging aktif olsun (Step 4-5 hariç)
      if (this.workflowName === 'WORKFLOW_2' && ![4, 5].includes(this.currentStep)) {
        this.panel.isDraggingEnabled = true
      }
      
      // Skip UI steps (ör. ilk girişte mesaj göstermemek için)
      if (step.skipUI) {
        this.panel.setContent('')
        this.clearHighlight()
        // Eğer navigation tanımlıysa bekle, sonra otomatik ilerle
        setTimeout(() => {
          this.nextStep()
        }, step.autoAdvanceDelay ?? AUTO_MODE_ADVANCE_DELAY)
        return
      }
      
      // Render step content
      this.renderStepContent(step)
      
      // Otomatik doldurma (varsa)
      await this.autoFillForStep(step)
      
      // Manual timer başlat (7 saniyelik timer ÇALIŞMAZ - yukarıda kontrol edildi)
      if (step.manualTimer) {
        console.log(`[Keepnet] Step ${step.id}: Starting manual timer (${step.manualTimer}ms)`)
        
        let remainingTime = step.manualTimer / 1000
        const totalTime = step.manualTimer / 1000
        
      const timerInterval = window.setInterval(() => {
          remainingTime--
          
          // Timer text güncelle
          const timerEl = document.getElementById('keepnet-manual-timer')
          if (timerEl) {
            const minutes = Math.floor(remainingTime / 60)
            const seconds = remainingTime % 60
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`
            
            // Timer rengi değiştir (son 30 saniye kırmızı)
            if (remainingTime <= 30) {
              timerEl.style.color = '#fca5a5'
              timerEl.style.animation = 'keepnet-timer-pulse 0.5s ease-in-out infinite'
            } else {
              timerEl.style.color = 'white'
              timerEl.style.animation = 'none'
            }
          }
          
          // Progress bar güncelle
          const progressEl = document.getElementById('keepnet-timer-progress')
          if (progressEl) {
            const percentage = (remainingTime / totalTime) * 100
            progressEl.style.width = `${percentage}%`
            
            // Progress bar rengi değiştir
            if (remainingTime <= 30) {
              progressEl.style.background = 'linear-gradient(90deg, #fca5a5 0%, #ef4444 50%, #dc2626 100%)'
              progressEl.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)'
            } else if (remainingTime <= 60) {
              progressEl.style.background = 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
              progressEl.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.6)'
            } else {
              progressEl.style.background = 'linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)'
              progressEl.style.boxShadow = '0 0 20px rgba(74, 222, 128, 0.6)'
            }
          }
          
          if (remainingTime <= 0) {
            window.clearInterval(timerInterval)
            this.currentTimerInterval = null
            console.log(`[Keepnet] Manual timer finished for step ${step.id}`)
            
            // Timer bitti - bildirim göster
            const finalTimerEl = document.getElementById('keepnet-manual-timer')
            if (finalTimerEl) {
              finalTimerEl.textContent = '0:00'
              finalTimerEl.style.color = '#ef4444'
            }
            
            // Timer bitti - HER ZAMAN otomatik adıma geç (form kapanıyor, continue butonu yok)
            console.log(`[Keepnet] Manual timer finished, auto-advancing to next step`)
            if (this.panel && this.panel.showSuccess) {
              this.panel.showSuccess(i18n('timeUp'))
            }
            setTimeout(() => {
              this.nextStep()
            }, 1000)
          }
        }, 1000)
        
        this.currentTimerInterval = timerInterval
      }
      
      // Navigate if needed - AMA sadece navigation step DEĞİLSE otomatik git
      // Navigation step ise butonu göster, kullanıcı bassın
      if (step.navigate && !step.isNavigation) {
        const currentUrl = window.location.href
        const targetUrl = step.navigate
        
        // Daha akıllı URL karşılaştırması
        const needsNavigation = !currentUrl.startsWith(targetUrl.split('?')[0])
        
        if (needsNavigation) {
          console.log(`[Keepnet] Navigating to: ${targetUrl}`)
          window.location.href = targetUrl
          // Wait for load
          await Utils.sleep(2000)
          return
        } else {
          console.log(`[Keepnet] Already on target page, skipping navigation`)
        }
      }
      
      // isNavigation step ise, sadece butonu göster (renderStepContent zaten gösterdi)
      if (step.isNavigation) {
        console.log(`[Keepnet] Navigation step - waiting for user to click button`)
        return
      }
      
      // ÖNEMLİ: Sayfa tam yüklenmeyi bekle!
      console.log(`[Keepnet] Waiting for page to be fully loaded before showing highlight...`)
      
      // 1. Document ready kontrolü
      if (document.readyState !== 'complete') {
        console.log(`[Keepnet] Document not ready yet, waiting...`)
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve()
          } else {
            window.addEventListener('load', resolve, { once: true })
            // Maximum 5 saniye bekle
            setTimeout(resolve, 5000)
          }
        })
      }
      
      // 2. Network idle kontrolü (daha az istekler olana kadar bekle)
      console.log(`[Keepnet] Waiting for network to settle...`)
      await Utils.sleep(1500)  // 500ms → 1500ms (sayfa yüklenme için daha fazla zaman)
      
      // 3. Angular/React rendering için ek bekle
      console.log(`[Keepnet] Waiting for framework rendering to complete...`)
      await Utils.sleep(1000)  // Ek 1 saniye bekle
      
      console.log(`[Keepnet] Page fully loaded, proceeding with step execution`)
      
      // Find and (optionally) highlight target
      if (step.target && !this.ensureOnAllowedPage(step)) {
        console.warn(`[Keepnet] Skipping highlight because URL guard failed for step ${step.id}`)
        return
      }
      
      if (step.target) {
        const waitOptions = {
          timeout: step.waitTimeout ?? 10000,
          interval: step.waitInterval ?? 250,
          useObserver: step.waitObserver ?? true
        }
        const element = await Utils.waitForElement(step.target, waitOptions)
        
        if (element) {
          // Hedefi doğrula; metin/visible/kutu boyutu uyuşmazsa yeniden ara
          let validatedTarget = element
          const targetIsValid = this.validateTargetElement(element, step.target)
          if (!targetIsValid) {
            console.warn('[Keepnet] Target failed validation, retrying waitForElement with shorter timeout...')
            const retry = await Utils.waitForElement(step.target, { ...waitOptions, timeout: 4000 })
            if (retry && this.validateTargetElement(retry, step.target)) {
              validatedTarget = retry
            } else {
              console.warn('[Keepnet] Target still invalid after retry, skipping highlight to avoid wrong element')
              return
            }
          }
          
          // Küçük bir gecikme ekle: highlight ve auto-advance'ın agresif görünmesini engelle
          await Utils.sleep(step.preHighlightDelay ?? 400)
          
          Utils.scrollToElement(validatedTarget)
          
          // findCheckboxFromRow flag'i varsa, satırdan checkbox'ı bul
          let clickTarget = validatedTarget
          if (step.findCheckboxFromRow) {
            console.log('[Keepnet] findCheckboxFromRow flag active, finding checkbox from row...')
            
            // Satırın parent container'ını bul (DetailsRow)
            let rowContainer = validatedTarget.closest('div[data-automationid="DetailsRow"]') ||
                              validatedTarget.closest('div.ms-DetailsRow') ||
                              validatedTarget.closest('div[role="row"]') ||
                              validatedTarget.parentElement?.parentElement
            
            if (rowContainer) {
              // Container içinde checkbox'ı bul - yeni HTML yapısına göre
              const checkbox = rowContainer.querySelector('div[role="radio"][data-automationid="DetailsRowCheck"][data-selection-toggle="true"]') ||
                               rowContainer.querySelector('div[aria-label="Satır seç"][data-automationid="DetailsRowCheck"][data-selection-toggle="true"]') ||
                               rowContainer.querySelector('div.ms-DetailsRow-check[data-automationid="DetailsRowCheck"][data-selection-toggle="true"]') ||
                               rowContainer.querySelector('div[role="radio"][data-automationid="DetailsRowCheck"]')
              
              if (checkbox) {
                console.log('[Keepnet] Checkbox found in row, using it as click target')
                clickTarget = checkbox
              } else {
                console.warn('[Keepnet] Checkbox not found in row container, using row element')
              }
            } else {
              console.warn('[Keepnet] Row container not found, using row element')
            }
          }
          
          // Bazı adımlarda highlight istenmiyor (ör. WF2 Step 2 checkbox)
          if (!step.disableHighlight) {
          this.highlightElement(clickTarget, i18n(step.tooltip))
          } else {
            console.log('[Keepnet] Highlight disabled for this step. Waiting for manual user action.')
          }
          
          // Auto-click? (AUTO_AGENT modunda highlight engellense bile tıklamaya devam et)
          const allowAutoClick = !step.disableClickListener && (AUTO_MODE || step.autoClick || AUTO_AGENT)
          if (allowAutoClick) {
            this.autoClick.start(clickTarget, AUTO_CLICK_TIMEOUT, async () => {
              await this.onElementClicked(step)
            }, this.workflowName)
          }
          
          // Manual click listener
          if (!step.disableHighlight && !step.disableClickListener) {
          clickTarget.addEventListener('click', async () => {
            this.autoClick.stop()
            await this.onElementClicked(step)
          }, { once: true })
          }
          
          // WORKFLOW 4-5-6 için otomatik geçiş - AMA manualTimer varsa veya autoAdvance false ise ÇALIŞMA!
          // WORKFLOW 1 Step 8-9-10 için auto-advance YAPMA (manuel Continue butonu gerekli)
          // Otomatik ilerleme
          const shouldAutoAdvance = (AUTO_MODE && step.autoAdvance !== false && !step.manualTimer) ||
            ((this.workflowName === 'WORKFLOW_4' || this.workflowName === 'WORKFLOW_5' || this.workflowName === 'WORKFLOW_6')
              && !step.isSummary && !step.isInfoCard && !step.manualTimer && step.autoAdvance !== false)
          
          if (shouldAutoAdvance) {
            const baseAutoDelay = step.autoAdvanceDelay ?? AUTO_MODE_ADVANCE_DELAY
            // WF4-5-6 için minimum 18s kuralını koru; diğerlerinde AUTO_MODE delay kullan
            const autoDelay = (this.workflowName === 'WORKFLOW_4' || this.workflowName === 'WORKFLOW_5' || this.workflowName === 'WORKFLOW_6')
              ? Math.max(baseAutoDelay, 18000)
              : baseAutoDelay
            console.log(`[Keepnet] ${this.workflowName} Step ${step.id}: Starting auto-advance timer (${autoDelay / 1000}s)`)
            autoAdvanceTimer = setTimeout(async () => {
              console.log(`[Keepnet] ${this.workflowName} Step ${step.id}: Auto-advance timeout elapsed, going to next step`)
              this.clearHighlight()
              this.autoClick.stop()
              await this.nextStep()
            }, autoDelay)
          }
        } else {
          const missingElementDetails = {
            stepId: step.id,
            stepName: step.name,
            title: i18n(step.title),
            selector: step.target?.selector,
            fallback: step.target?.fallback,
            timeout: waitOptions.timeout
          }

          console.warn("[Keepnet] Element not found after wait:", missingElementDetails)
          
          // Safe Links için özel lisans kontrolü
          if (step.name === 'safelinks_step4_safe_links' && step.licenseCheck) {
            console.log("[Keepnet] Safe Links not found - checking license requirement")
            this.panel.showError(`${i18n('safelinksLicenseNotFoundTitle')}
${i18n(step.licenseCheck.message)}

${i18n(step.licenseCheck.skipMessage)}`)
            
            // 15 saniye Safe Links elementini bekle
            console.log("[Keepnet] Waiting 15 seconds for Safe Links element...")
            let safeLinksFound = false
            
            // 15 saniye boyunca Safe Links elementini kontrol et
          const checkInterval = window.setInterval(() => {
              const safeLinksElement = document.querySelector('a:contains("Safe Links"), a[href*="safelinks"], [aria-label*="Safe Links"]')
              if (safeLinksElement) {
                console.log("[Keepnet] Safe Links element found! Continuing with current step.")
                safeLinksFound = true
            window.clearInterval(checkInterval)
                // Element bulundu, normal akışa devam et
                this.highlightElement(safeLinksElement, i18n(step.tooltip))
                
                // Auto-click?
                if (step.autoClick) {
                  this.autoClick.start(safeLinksElement, AUTO_CLICK_TIMEOUT, async () => {
                    await this.onElementClicked(step)
                  }, this.workflowName)
                }
                
                // Manual click listener
                safeLinksElement.addEventListener('click', async () => {
                  this.autoClick.stop()
                  await this.onElementClicked(step)
                }, { once: true })
              }
            }, 1000) // Her saniye kontrol et
            
            // 15 saniye sonra Safe Links bulunamazsa Workflow 4'e geç
            setTimeout(async () => {
              if (!safeLinksFound) {
                clearInterval(checkInterval)
                console.log("[Keepnet] Safe Links not found after 15 seconds - auto-transitioning to Workflow 4")
                
                // Workflow 4'e otomatik geçiş
                this.panel.showSuccess("Safe Links bulunamadı. Otomatik olarak Workflow 4'e geçiliyor...")
                
                // Workflow 4'e geçiş için gerekli ayarlar
                await Storage.set('keepnet_next_workflow', 'WORKFLOW_4')
                
                // Sayfa değiştir
                setTimeout(() => {
                  window.location.href = 'https://admin.exchange.microsoft.com/#/transportrules'
                }, 2000)
              }
            }, 15000) // 15 saniye
            
            return
          }
          
          console.warn("[Keepnet] Panel error suppressed for missing element:", missingElementDetails)
        }
      }
      
      // Real-time validation?
      if (step.realTimeValidation) {
        this.startRealTimeValidation(step)
      }
      
      // Auto-fill for IP step?
      if (step.autoFill && step.id === 8) {
        this.setupAutoFillForIPs(step)
      }
    } catch (error) {
      console.error("[Keepnet] executeStep error:", error)
      this.panel?.showError(`Hata: ${error.message}`)
    }
  }
  
  renderStepContent(step) {
    // Summary adımları için küçük font, diğerleri için büyük
    const isSummary = step.isSummary
    const titleSize = isSummary ? '15px' : '18px'
    const descSize = isSummary ? '13px' : '15px'
    const titleMargin = isSummary ? '8px' : '12px'
    const descMargin = isSummary ? '12px' : '16px'
    
    let html = `
      <div class="keepnet-step-content">
        <h3 style="margin: 0 0 ${titleMargin} 0; font-size: ${titleSize}; color: #FFFFFF; font-weight: 600; line-height: 1.4;">
          ${i18n(step.title)}
        </h3>
        <p style="margin: 0 0 ${descMargin} 0; font-size: ${descSize}; color: #E2E8F0; line-height: 1.6;">
          ${i18n(step.description)}
        </p>
    `
    
    // Manual timer görselleştirmesi - KOMPAKT ve küçük
    if (step.manualTimer) {
      const totalMinutes = Math.floor(step.manualTimer / 60000)
      const totalSeconds = Math.floor((step.manualTimer % 60000) / 1000)
      
      html += `
        <div style="
          background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3), 0 0 0 1px rgba(74, 158, 255, 0.2);
          border: 1px solid rgba(74, 158, 255, 0.3);
        ">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="
              width: 32px;
              height: 32px;
              background: rgba(74, 158, 255, 0.2);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              border: 1px solid rgba(74, 158, 255, 0.3);
              flex-shrink: 0;
            ">⏱️</div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); font-weight: 500; margin-bottom: 2px;">
                ${i18n('remainingTime')}
          </div>
              <div style="
                font-size: 20px;
                font-weight: 700;
                color: white;
                font-family: 'SF Mono', 'Monaco', monospace;
                letter-spacing: 1px;
                line-height: 1.2;
              " id="keepnet-manual-timer">
                ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}
              </div>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="
                width: 100%;
                height: 4px;
                background: rgba(74, 158, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 6px;
              ">
                <div id="keepnet-timer-progress" style="
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
                  border-radius: 2px;
                  transition: width 1s linear;
                  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
                "></div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    // Premium warning for workflow 4, 5, 6 - step 1 - REMOVED
    const needsWarning = false  // Uyarı mesajı kaldırıldı
    
    if (needsWarning) {
      html += `
        <div style="
          background: rgba(251, 191, 36, 0.15);
          border: 2px solid rgba(251, 191, 36, 0.5);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          animation: keepnet-warning-pulse 3s ease-in-out infinite;
        ">
          <!-- Warning Header -->
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style="
              font-size: 14px;
              font-weight: 600;
              color: #fbbf24;
              letter-spacing: 0.3px;
            ">${i18n('importantWarning')}</span>
          </div>
          
          <!-- Main Warning -->
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 12px;
            line-height: 1.5;
          ">
            ${i18n('warningFromStep3')}
          </div>
          
          <!-- Bullet Points -->
          <div style="
            font-size: 12px;
            color: #fef3c7;
            line-height: 1.6;
          ">
            <div style="margin-bottom: 6px;">${i18n('warningLine1')}</div>
            <div style="margin-bottom: 6px;">${i18n('warningLine2')}</div>
            <div>${i18n('warningLine3')}</div>
          </div>
        </div>
        
        <style>
          @keyframes keepnet-warning-pulse {
            0%, 100% {
              border-color: rgba(251, 191, 36, 0.5);
              box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
            }
            50% {
              border-color: rgba(251, 191, 36, 0.8);
              box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
            }
          }
        </style>
      `
    }
    
    // Navigation step için "Sayfaya Git" butonu
    if (step.isNavigation && step.navigate) {
      html += `
        <div style="background: linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(45, 45, 74, 0.8)); border: 2px solid #4a9eff; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #4a9eff; margin-bottom: 8px;">
            ${i18n(step.title)}
          </div>
          <button id="keepnet-navigate-btn" class="keepnet-nav-btn" data-url="${step.navigate}" style="
            width: 100%;
            background: linear-gradient(135deg, #4a9eff 0%, #5dade2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
          ">
            ${i18n('goToPage')}
          </button>
        </div>
      `
    }
    
    // Safe Links lisans bilgilendirmesi için özel bölüm (Workflow 3 step 4)
    if (step.id === 4 && step.name === 'safelinks_step4_safe_links') {
      html += `
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.08)); border: 2px solid #3b82f6; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <div style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">i</div>
            ${i18n('safelinksLicenseInfoTitle')}
          </div>
          <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 13px; color: #374151; line-height: 1.5;">
              ${i18n('safelinksLicenseMessage')}
            </div>
          </div>
          <div style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.15)); border: 2px solid #fb923c; border-radius: 8px; padding: 12px;">
            <div style="font-size: 12px; color: #ea580c; font-weight: 600; margin-bottom: 8px;">
              ${i18n('safelinksIfNotVisible')}
            </div>
            <div style="font-size: 12px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">
              ${i18n('safelinksCanSkip')}
            </div>
          </div>
        </div>
      `
    }
    
    // Simülasyon URL'leri için özel bölüm (Workflow 1 step 10) - Modern Notion-style liste
    if (step.id === 9 && step.name === 'step10_simulation_urls_input') {
      const domains = [
        'signin-authzone.com',
        'verifycloudaccess.com',
        'akibadem.org',
        'isdestek.org',
        'gartnerpeer.com',
        'global-cloud-llc.com',
        'cloudverification.online',
        'accountaccesses.com',
        'shoppingcenter.site',
        'hesapdogrulama.info',
        'banksecure.info',
        'meetingonline-us.com',
        'digitalsecurelogin.co',
        'secureloginshop.net',
        'encryptedconnections.info',
        'trendyoll.club',
        'kurumsalgiris.com',
        'yoursecuregateway.com',
        'securemygateway.com',
        'hadisendekatil.com',
        'updatemyinformation.com',
        'secure-passchanges.com',
        'swift-intel.com',
        'hepsibureda.com',
        'securely-logout.com',
        'sigortacilarbirligi.com',
        'btyardimmasasi.com',
        'sirketiciduyuru.com',
        'bilgilerimiguncelle.com',
        'securelogout.com',
        'securelinked-in.com',
        'theconnectionsuccess.com',
        'sigortacilikhizmetleri.me',
        'securebankingservices.net',
        'guvenlibankacilik.com',
        'insurance-services.me',
        'btservisleri.com',
        'secureloginonline.net',
        'insan-kaynaklari.me',
        'getaccess.store'
      ]
      
      html += `
        <div style="
          background: linear-gradient(160deg, #0f172a 0%, #111827 50%, #0b1020 100%);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(59, 130, 246, 0.35);
          box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
          color: #e8edff;
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px;">
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              border-radius: 10px;
              background: linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.18));
              border: 1px solid rgba(59,130,246,0.35);
              color: #e8edff;
              font-weight: 700;
              font-size: 13px;
            ">
              <span style="
                width: 10px;
                height: 10px;
                border-radius: 999px;
                background: #22c55e;
                box-shadow: 0 0 8px rgba(34,197,94,0.8);
              "></span>
              ${i18n('workflowStep10Title')} (${domains.length} item)
            </div>
            <button
              class="keepnet-copy-all-btn"
              data-copy-text="${domains.map(d => d.replace(/'/g, "&apos;")).join('\\n')}"
              data-original-text="${i18n('copyAllDomains')}"
              style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 10px;
                border: 1px solid rgba(59,130,246,0.45);
                background: rgba(59,130,246,0.15);
                color: #e8edff;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
            >
              ${i18n('copyAllDomains')}
            </button>
          </div>
          
          <div style="
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            padding: 10px;
            max-height: 320px;
            overflow-y: auto;
            border: 1px solid rgba(148,163,184,0.25);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          ">
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
              gap: 8px;
            ">
              ${domains.map((d, idx) => `
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 10px;
                  padding: 10px 12px;
                  background: ${idx % 2 === 0 ? 'rgba(59,130,246,0.12)' : 'rgba(17,24,39,0.65)'};
                  border: 1px solid rgba(59,130,246,0.35);
                  border-radius: 10px;
                  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #eef2ff;
                    font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                    font-size: 12px;
                    word-break: break-all;
                    flex: 1;
                  ">
                    <span style="width: 6px; height: 6px; border-radius: 999px; background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.8);"></span>
                    ${d}
                  </div>
                  <button
                    class="keepnet-copy-btn"
                    data-copy-text="${d.replace(/'/g, "&apos;")}"
                    data-original-text="${i18n('copyDomain')}"
                    style="
                      padding: 7px 10px;
                      border-radius: 8px;
                      border: 1px solid rgba(148,163,184,0.35);
                      background: rgba(255,255,255,0.06);
                      color: #eef2ff;
                      font-weight: 600;
                      font-size: 11px;
                      cursor: pointer;
                      transition: all 0.15s ease;
                      white-space: nowrap;
                    "
                  >
                    ${i18n('copyDomain')}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
          
        </div>
      `
    }

    // Safe Links URL listesi için özel bölüm (Workflow 3 - URL ekleme adımı)
    // Kullanıcı Safe Links ekranında "*.domain.com/*" formatında URL eklediği için,
    // burada kopyalanabilir wildcard liste gösteriyoruz.
    if (step.name === 'safelinks_step16_urls_input' && this.workflowName === 'WORKFLOW_3') {
      const domains = [
        'signin-authzone.com',
        'verifycloudaccess.com',
        'akibadem.org',
        'isdestek.org',
        'gartnerpeer.com',
        'global-cloud-llc.com',
        'cloudverification.online',
        'accountaccesses.com',
        'shoppingcenter.site',
        'hesapdogrulama.info',
        'banksecure.info',
        'meetingonline-us.com',
        'digitalsecurelogin.co',
        'secureloginshop.net',
        'encryptedconnections.info',
        'trendyoll.club',
        'kurumsalgiris.com',
        'yoursecuregateway.com',
        'securemygateway.com',
        'hadisendekatil.com',
        'updatemyinformation.com',
        'secure-passchanges.com',
        'swift-intel.com',
        'hepsibureda.com',
        'securely-logout.com',
        'sigortacilarbirligi.com',
        'btyardimmasasi.com',
        'sirketiciduyuru.com',
        'bilgilerimiguncelle.com',
        'securelogout.com',
        'securelinked-in.com',
        'theconnectionsuccess.com',
        'sigortacilikhizmetleri.me',
        'securebankingservices.net',
        'guvenlibankacilik.com',
        'insurance-services.me',
        'btservisleri.com',
        'secureloginonline.net',
        'insan-kaynaklari.me',
        'getaccess.store'
      ]
      const urlList = domains

      html += `
        <div style="
          background: linear-gradient(160deg, #0f172a 0%, #111827 50%, #0b1020 100%);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(59, 130, 246, 0.35);
          box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
          color: #e8edff;
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px;">
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              border-radius: 10px;
              background: linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.18));
              border: 1px solid rgba(59,130,246,0.35);
              color: #e8edff;
              font-weight: 700;
              font-size: 13px;
            ">
              <span style="
                width: 10px;
                height: 10px;
                border-radius: 999px;
                background: #22c55e;
                box-shadow: 0 0 8px rgba(34,197,94,0.8);
              "></span>
              Safe Links URL Listesi (${urlList.length} item)
            </div>
            <button
              class="keepnet-copy-all-btn"
              data-copy-text="${urlList.map(d => d.replace(/'/g, "&apos;")).join('\\n')}"
              data-original-text="${i18n('copyAllDomains')}"
              style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 10px;
                border: 1px solid rgba(59,130,246,0.45);
                background: rgba(59,130,246,0.15);
                color: #e8edff;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
            >
              ${i18n('copyAllDomains')}
            </button>
          </div>

          <div style="
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            padding: 10px;
            max-height: 320px;
            overflow-y: auto;
            border: 1px solid rgba(148,163,184,0.25);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          ">
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
              gap: 8px;
            ">
              ${urlList.map((d, idx) => `
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 10px;
                  padding: 10px 12px;
                  background: ${idx % 2 === 0 ? 'rgba(59,130,246,0.12)' : 'rgba(17,24,39,0.65)'};
                  border: 1px solid rgba(59,130,246,0.35);
                  border-radius: 10px;
                  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #eef2ff;
                    font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                    font-size: 12px;
                    word-break: break-all;
                    flex: 1;
                  ">
                    <span style="width: 6px; height: 6px; border-radius: 999px; background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.8);"></span>
                    ${d}
                  </div>
                  <button
                    class="keepnet-copy-btn"
                    data-copy-text="${d.replace(/'/g, "&apos;")}"
                    data-original-text="${i18n('copyDomain')}"
                    style="
                      padding: 7px 10px;
                      border-radius: 8px;
                      border: 1px solid rgba(148,163,184,0.35);
                      background: rgba(255,255,255,0.06);
                      color: #eef2ff;
                      font-weight: 600;
                      font-size: 11px;
                      cursor: pointer;
                      transition: all 0.15s ease;
                      white-space: nowrap;
                    "
                  >
                    ${i18n('copyDomain')}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `
    }
    
        // Domain listesi için özel bölüm (Workflow 1 step 8) - SADECE LİSTE
    if (step.id === 7 && step.name === 'step8_domains_input' && this.workflowName === 'WORKFLOW_1') {
      const domains = [
        'signin-authzone.com', 'verifycloudaccess.com', 'akibadem.org', 'isdestek.org', 
        'gartnerpeer.com', 'global-cloud-llc.com', 'cloudverification.online', 
        'accountaccesses.com', 'shoppingcenter.site', 'hesapdogrulama.info', 
        'banksecure.info', 'meetingonline-us.com', 'digitalsecurelogin.co', 
        'secureloginshop.net', 'encryptedconnections.info', 'trendyoll.club', 
        'kurumsalgiris.com', 'yoursecuregateway.com', 'securemygateway.com', 
        'hadisendekatil.com', 'updatemyinformation.com', 'secure-passchanges.com', 
        'swift-intel.com', 'hepsibureda.com', 'securely-logout.com', 
        'sigortacilarbirligi.com', 'btyardimmasasi.com', 'sirketiciduyuru.com', 
        'bilgilerimiguncelle.com', 'securelogout.com', 'securelinked-in.com', 
        'theconnectionsuccess.com', 'sigortacilikhizmetleri.me', 
        'securebankingservices.net', 'guvenlibankacilik.com', 'insurance-services.me', 
        'btservisleri.com', 'secureloginonline.net', 'insan-kaynaklari.me', 'getaccess.store'
      ]
      
      html += `
        <div style="
          background: linear-gradient(160deg, #0f172a 0%, #111827 50%, #0b1020 100%);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(59, 130, 246, 0.35);
          box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
          color: #e8edff;
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px;">
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              border-radius: 10px;
              background: linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.18));
              border: 1px solid rgba(59,130,246,0.35);
              color: #e8edff;
              font-weight: 700;
              font-size: 13px;
            ">
              <span style="
                width: 10px;
                height: 10px;
                border-radius: 999px;
                background: #22c55e;
                box-shadow: 0 0 8px rgba(34,197,94,0.8);
              "></span>
              ${i18n('domainListLabel')} (${domains.length} domain)
            </div>
            <button
              class="keepnet-copy-all-btn"
              data-copy-text="${domains.map(d => d.replace(/'/g, "&apos;")).join('\\n')}"
              data-original-text="${i18n('copyAllDomains')}"
              style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 10px;
                border: 1px solid rgba(59,130,246,0.45);
                background: rgba(59,130,246,0.15);
                color: #e8edff;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
            >
              ${i18n('copyAllDomains')}
            </button>
          </div>
          
          <div style="
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            padding: 10px;
            max-height: 320px;
            overflow-y: auto;
            border: 1px solid rgba(148,163,184,0.25);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          ">
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
              gap: 8px;
            ">
              ${domains.map((d, idx) => `
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 10px;
                  padding: 10px 12px;
                  background: ${idx % 2 === 0 ? 'rgba(59,130,246,0.12)' : 'rgba(17,24,39,0.65)'};
                  border: 1px solid rgba(59,130,246,0.35);
                  border-radius: 10px;
                  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #eef2ff;
                    font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                    font-size: 12px;
                    word-break: break-all;
                    flex: 1;
                  ">
                    <span style="width: 6px; height: 6px; border-radius: 999px; background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.8);"></span>
                    ${d}
                  </div>
                  <button
                    class="keepnet-copy-btn"
                    data-copy-text="${d.replace(/'/g, "&apos;")}"
                    data-original-text="${i18n('copyDomain')}"
                    style="
                      padding: 7px 10px;
                      border-radius: 8px;
                      border: 1px solid rgba(148,163,184,0.35);
                      background: rgba(255,255,255,0.06);
                      color: #eef2ff;
                      font-weight: 600;
                      font-size: 11px;
                      cursor: pointer;
                      transition: all 0.15s ease;
                      white-space: nowrap;
                    "
                  >
                    ${i18n('copyDomain')}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
          
        </div>
      `
    }
    
    // IP listesi gösterimi - showIPList flag'ine göre - Modern Notion-style
    // DİKKAT: WORKFLOW_4 Step 9 için buraya gelmemeli (yukarıda özel kod var)
    // DİKKAT: WORKFLOW_5 Step 10 için IP listesi görünmemeli (hideIPList flag var)
    // DİKKAT: Workflow 5 ve 6'da Step 6'da IP listesi gösterilmemeli
    if (step.showIPList && !step.hideIPList && !(this.workflowName === 'WORKFLOW_4' && step.id === 9 && step.name === 'spambypass_step9_enter_ip') && !((this.workflowName === 'WORKFLOW_5' || this.workflowName === 'WORKFLOW_6') && step.id === 6 && (step.name === 'atplink_step6_select_sender' || step.name === 'atpattach_step6_select_sender'))) {
      const ips = ['149.72.161.59', '149.72.42.201', '149.72.154.87']
      
      html += `
        <div style="
          background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(74, 158, 255, 0.3), 0 0 0 1px rgba(74, 158, 255, 0.2);
          border: 1px solid rgba(74, 158, 255, 0.3);
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          ">
            <div style="
              width: 36px;
              height: 36px;
              background: rgba(74, 158, 255, 0.25);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              border: 1px solid rgba(74, 158, 255, 0.4);
              flex-shrink: 0;
            ">IP</div>
            <div style="
              font-size: 16px;
              font-weight: 700;
              color: white;
              letter-spacing: 0.3px;
            ">${i18n('whiteListIPs')}</div>
          </div>
          
          <div style="
            background: rgba(74, 158, 255, 0.08);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid rgba(74, 158, 255, 0.2);
          ">
            ${ips.map((ip, index) => `
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: ${index % 2 === 0 ? 'rgba(74, 158, 255, 0.12)' : 'rgba(74, 158, 255, 0.05)'};
                border-radius: 8px;
                margin-bottom: ${index < ips.length - 1 ? '8px' : '0'};
                transition: all 0.2s ease;
                border-left: 3px solid rgba(74, 158, 255, 0.4);
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background: #4ade80;
                  border-radius: 50%;
                  box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);
                  flex-shrink: 0;
                "></div>
                <div style="
                  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                  font-size: 15px;
                  font-weight: 600;
                  color: white;
                  letter-spacing: 0.5px;
                  flex: 1;
                ">${ip}</div>
            </div>
            `).join('')}
          </div>
        </div>
      `
    }
    
    // IP listesi gösterimi - SADECE Step 9 için (Workflow 1) - Modern Notion-style
    if (step.id === 8 && step.name === 'step9_ip_input' && this.workflowName === 'WORKFLOW_1') {
      const ips = ['149.72.161.59', '149.72.42.201', '149.72.154.87']
      
      html += `
        <div style="
          background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(74, 158, 255, 0.3), 0 0 0 1px rgba(74, 158, 255, 0.2);
          border: 1px solid rgba(74, 158, 255, 0.3);
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          ">
            <div style="
              width: 36px;
              height: 36px;
              background: rgba(74, 158, 255, 0.25);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              border: 1px solid rgba(74, 158, 255, 0.4);
              flex-shrink: 0;
            ">IP</div>
            <div style="
              font-size: 16px;
              font-weight: 700;
              color: white;
              letter-spacing: 0.3px;
            ">${i18n('whiteListIPs')}</div>
          </div>
          
          <div style="
            background: rgba(74, 158, 255, 0.08);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid rgba(74, 158, 255, 0.2);
          ">
            ${ips.map((ip, index) => `
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: ${index % 2 === 0 ? 'rgba(74, 158, 255, 0.12)' : 'rgba(74, 158, 255, 0.05)'};
                border-radius: 8px;
                margin-bottom: ${index < ips.length - 1 ? '8px' : '0'};
                transition: all 0.2s ease;
                border-left: 3px solid rgba(74, 158, 255, 0.4);
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background: #4ade80;
                  border-radius: 50%;
                  box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);
                  flex-shrink: 0;
                "></div>
                <div style="
                  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                  font-size: 15px;
                  font-weight: 600;
                  color: white;
                  letter-spacing: 0.5px;
                  flex: 1;
                ">${ip}</div>
            </div>
            `).join('')}
          </div>
        </div>
      `
    }
    // WORKFLOW 4 - Step 9: IP listesi (TEK! showIPList flag'i ile çakışmasın) - Modern Notion-style
    if (this.workflowName === 'WORKFLOW_4' && step.id === 9 && step.name === 'spambypass_step9_enter_ip') {
      const ips = ['149.72.161.59', '149.72.42.201', '149.72.154.87']
      
      html += `
        <div style="
          background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(74, 158, 255, 0.3), 0 0 0 1px rgba(74, 158, 255, 0.2);
          border: 1px solid rgba(74, 158, 255, 0.3);
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          ">
            <div style="
              width: 36px;
              height: 36px;
              background: rgba(74, 158, 255, 0.25);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              border: 1px solid rgba(74, 158, 255, 0.4);
              flex-shrink: 0;
            ">IP</div>
            <div style="
              font-size: 16px;
              font-weight: 700;
              color: white;
              letter-spacing: 0.3px;
            ">${i18n('whiteListIPs')}</div>
          </div>
          
          <div style="
            background: rgba(74, 158, 255, 0.08);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid rgba(74, 158, 255, 0.2);
          ">
            ${ips.map((ip, index) => `
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: ${index % 2 === 0 ? 'rgba(74, 158, 255, 0.12)' : 'rgba(74, 158, 255, 0.05)'};
                border-radius: 8px;
                margin-bottom: ${index < ips.length - 1 ? '8px' : '0'};
                transition: all 0.2s ease;
                border-left: 3px solid rgba(74, 158, 255, 0.4);
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background: #4ade80;
                  border-radius: 50%;
                  box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);
                  flex-shrink: 0;
                "></div>
                <div style="
                  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                  font-size: 15px;
                  font-weight: 600;
                  color: white;
                  letter-spacing: 0.5px;
                  flex: 1;
                ">${ip}</div>
            </div>
            `).join('')}
          </div>
        </div>
      `
    }
    // WORKFLOW 2 - Anti-spam Step 5: IP listesi
    else if (this.workflowName === 'WORKFLOW_2' && step.name === 'antispam_step5_add_ips') {
      const showButton = !step.hideCopyButton // hideCopyButton true ise butonu gösterme
      
      const ips = ['149.72.161.59', '149.72.42.201', '149.72.154.87']
      
      html += `
        <div style="
          background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 10px 40px rgba(74, 158, 255, 0.3), 0 0 0 1px rgba(74, 158, 255, 0.2);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(74, 158, 255, 0.3);
        ">
          <!-- Background pattern -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.05;">
            <div style="position: absolute; width: 200px; height: 200px; background: #4a9eff; border-radius: 50%; top: -100px; right: -100px;"></div>
          </div>
          
          <div style="position: relative; z-index: 1;">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 16px;
            ">
              <div style="
                width: 40px;
                height: 40px;
                background: rgba(74, 158, 255, 0.2);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                font-size: 20px;
                border: 1px solid rgba(74, 158, 255, 0.3);
              ">IP</div>
              <div style="
                font-size: 16px;
                font-weight: 700;
                color: white;
                letter-spacing: 0.3px;
              ">${i18n('whiteListIPs')}</div>
            </div>
            
            <div style="
              background: rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(10px);
              border-radius: 12px;
              padding: 16px;
              ${showButton ? 'margin-bottom: 12px;' : ''}
              border: 1px solid rgba(255, 255, 255, 0.2);
            ">
              ${ips.map((ip, index) => `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 12px 14px;
                  background: ${index % 2 === 0 ? 'rgba(74, 158, 255, 0.12)' : 'rgba(74, 158, 255, 0.05)'};
                  border-radius: 8px;
                  margin-bottom: ${index < ips.length - 1 ? '8px' : '0'};
                  transition: all 0.2s ease;
                  border-left: 3px solid rgba(74, 158, 255, 0.4);
                ">
                  <div style="
                    width: 8px;
                    height: 8px;
                    background: #4ade80;
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);
                    flex-shrink: 0;
                  "></div>
                  <div style="
                    font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                    font-size: 15px;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.5px;
                    flex: 1;
                  ">${ip}</div>
                </div>
              `).join('')}
          </div>
          
        </div>
      `
    }
    
    if (step.requiredIPs) {
      html += `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 4px;">
            Gerekli IP'ler:
          </div>
          <div style="font-size: 12px; color: #1e3a8a; font-family: monospace;">
            ${step.requiredIPs.map(ip => `• ${ip}`).join('<br>')}
          </div>
        </div>
      `
    }
    
    
    html += '</div>'
    
    this.panel.setContent(html)
    
    // Navigation butonları için event listener
    setTimeout(() => {
      const navBtn = document.getElementById('keepnet-navigate-btn')
      if (navBtn) {
        navBtn.addEventListener('click', () => {
          const url = navBtn.getAttribute('data-url')
          console.log('[Keepnet] Navigate button clicked, going to:', url)
          window.location.href = url
        })
      }
      
      // Copy button'lar için event delegation
      const panelBody = this.panel.body
      if (panelBody) {
        // Copy button'lar (hem copy-all hem de copy)
        panelBody.querySelectorAll('[data-copy-text]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy-text')?.replace(/&apos;/g, "'")
            const originalText = btn.getAttribute('data-original-text') || btn.textContent
            if (textToCopy && navigator.clipboard) {
              try {
                await navigator.clipboard.writeText(textToCopy)
                btn.textContent = i18n('copied')
                setTimeout(() => {
                  btn.textContent = originalText
                }, 1400)
              } catch (err) {
                console.error('[Keepnet] Copy failed:', err)
              }
            }
          })
        })
        
        // Go and Fix button'lar için event delegation
        panelBody.querySelectorAll('.keepnet-goto-step-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const stepId = parseInt(btn.getAttribute('data-step-id'))
            const workflow = btn.getAttribute('data-workflow')
            if (stepId && workflow && window.assistant) {
              console.log(`[Keepnet] Go to step ${stepId} in ${workflow}`)
              window.assistant.executeStep(stepId)
            }
          })
        })
      }
    }, 100)
  }
  
  highlightElement(element, tooltipText) {
    this.clearHighlight()
    
    this.highlightedElement = element
    element.classList.add('keepnet-highlight')
    
    // Animate highlight with pulse
    AnimationUtils.animate(element, 'pulse', 600)
    AnimationUtils.scrollToElement(element)
    
    // Tooltip - element'in üstünde ortalı
    if (tooltipText) {
      const rect = element.getBoundingClientRect()
      
      this.tooltip = document.createElement('div')
      this.tooltip.className = 'keepnet-tooltip'
      this.tooltip.textContent = tooltipText
      this.tooltip.style.opacity = '0'
      this.tooltip.style.transform = 'translateY(10px) scale(0.9)'
      
      // Tooltip'i önce append et ki genişliğini ölçebilelim
      document.body.appendChild(this.tooltip)
      
      // Tooltip genişliğini al
      const tooltipWidth = this.tooltip.offsetWidth
      
      // Element'in üstünde ortalı konumlandır
      const centerX = rect.left + (rect.width / 2) - (tooltipWidth / 2)
      const topY = rect.top - 60 // Element'in 60px üstünde
      
      // Ekran sınırlarını kontrol et
      const finalX = Math.max(10, Math.min(centerX, window.innerWidth - tooltipWidth - 10))
      const finalY = Math.max(10, topY)
      
      this.tooltip.style.top = `${finalY}px`
      this.tooltip.style.left = `${finalX}px`
      
      // Animate tooltip entrance
      AnimationUtils.animate(this.tooltip, 'fadeInUp', 400)
      
      console.log(`[Keepnet] Tooltip positioned at (${finalX}, ${finalY})`)
    }
  }
  
  clearHighlight() {
    console.log('[Keepnet] Clearing all highlights and tooltips')
    
    // Aktif highlight'i kaldır
    if (this.highlightedElement) {
      AnimationUtils.removeHighlight(this.highlightedElement)
      this.highlightedElement.classList?.remove('keepnet-highlight')
      this.highlightedElement = null
    }
    
    // EKSTRA: Sayfadaki tum keepnet-highlight siniflarini temizle
    const allHighlighted = document.querySelectorAll('.keepnet-highlight')
    allHighlighted.forEach(el => {
      el.classList.remove('keepnet-highlight')
      el.style.outline = ''
      el.style.outlineOffset = ''
      el.style.backgroundColor = ''
      el.style.boxShadow = ''
      el.style.animation = ''
      el.style.transform = ''
      el.style.zIndex = ''
    })
    console.log(`[Keepnet] Removed ${allHighlighted.length} highlight(s)`)
    
    // Tooltip temizle (aktif)
    if (this.tooltip) {
      this.tooltip.style.animation = 'keepnet-fade-out 200ms ease-out forwards'
      setTimeout(() => {
        if (this.tooltip) {
          this.tooltip.remove()
      this.tooltip = null
        }
      }, 200)
    }
    
    // EKSTRA: Tum tooltipleri temizle
    const allTooltips = document.querySelectorAll('.keepnet-tooltip')
    allTooltips.forEach(t => t.remove())
    console.log(`[Keepnet] Removed ${allTooltips.length} tooltip(s)`)
    
    // Zamanlayicilari ve realtime validation'i durdur
    if (this.autoClick && typeof this.autoClick.stop === 'function') {
      this.autoClick.stop()
    }
    this.stopRealTimeValidation()
  }
  
  async onElementClicked(step) {
    console.log(`[Keepnet] Element clicked for step ${step.id}`)
    
    // Clear auto-advance timer if element was clicked manually
    if (autoAdvanceTimer) {
      console.log('[Keepnet] Clearing auto-advance timer due to manual click')
      clearTimeout(autoAdvanceTimer)
      autoAdvanceTimer = null
    }
    
    // Eğer bir LABEL'a tıklandıysa, altındaki INPUT'u bul ve focus et
    if (this.highlightedElement && this.highlightedElement.tagName === 'LABEL') {
      console.log("[Keepnet] Label clicked, finding input...")
      
      // Label'ın parent container'ını bul (birkaç level yukarı çık)
      let container = this.highlightedElement.closest('div')
      
      // Container içinde input ara - fallback ile
      let input = container?.querySelector('input.ms-BasePicker-input') || 
                  container?.querySelector('input[role="combobox"]') ||
                  container?.querySelector('textarea.ms-TextField-field') ||
                  container?.querySelector('textarea') ||
                  container?.querySelector('input[type="text"]')
      
      // Container'ı yukarı çıkarak bul (5 level kadar, daha fazla)
      if (!input && container) {
        for (let i = 0; i < 5; i++) {
          container = container.parentElement
          if (container) {
            input = container.querySelector('input.ms-BasePicker-input') || 
                    container.querySelector('input[role="combobox"]') ||
                    container.querySelector('textarea.ms-TextField-field') ||
                    container.querySelector('textarea') ||
                    container.querySelector('input[type="text"]') ||
                    container.querySelector('input[aria-label*="IP"]') ||
                    container.querySelector('input[aria-label*="URL"]') ||
                    container.querySelector('input[data-automation-id*="Input"]')
            if (input) break
          }
        }
      }
      
      // Hala bulunamadıysa, tüm panel içinde ara
      if (!input) {
        const panel = document.querySelector('.ms-Panel-main, [role="dialog"]')
        if (panel) {
          input = panel.querySelector('input.ms-BasePicker-input') || 
                  panel.querySelector('input[role="combobox"]') ||
                  panel.querySelector('textarea.ms-TextField-field') ||
                  panel.querySelector('input[type="text"]:not([type="hidden"])')
        }
      }
        
      if (input) {
        console.log("[Keepnet] Input found, focusing...")
        input.focus()
        input.click()
        
        // Highlight'ı input'a taşı
        this.clearHighlight()
        this.highlightElement(input, `${i18n(step.tooltip)} (${i18n('clickHere')})`)
      } else {
        console.warn("[Keepnet] Input not found for label step, but continuing...")
        // Input bulunamasa bile devam et (hata mesajı gösterme)
      }
    }
    
    // Wait if specified
    // Workflow 4-5-6 için highlight'ın biraz daha uzun görünmesi önemli,
    // diğer workflow'larda ise gereksiz uzun beklemeleri 1 saniye ile sınırlıyoruz.
    if (step.waitAfterClick) {
      let safeDelay = step.waitAfterClick
      
      if (this.workflowName === 'WORKFLOW_4' || this.workflowName === 'WORKFLOW_5' || this.workflowName === 'WORKFLOW_6') {
        // Bu workflow'larda adımlar arasındaki görsel geri bildirim daha uzun kalsın ama makul sınırda olsun
        safeDelay = Math.min(step.waitAfterClick, 3000)
      } else {
        // Diğer tüm workflow'larda uzun beklemeleri 1 saniye ile sınırla
        safeDelay = Math.min(step.waitAfterClick, 1000)
      }
      
      await Utils.sleep(safeDelay)
    }
    
    // Validation'ı sadece screenshot için çağır ama ilerlemeyi engelleme
    const isValid = await this.validateStep(step)
    
    // Screenshot
    await this.captureScreenshot(step, isValid)
    
    // Save result
    this.stepResults[step.id] = {
      title: i18n(step.title),
      valid: isValid,
      timestamp: new Date().toISOString()
    }
    await Storage.set(STORAGE_KEYS.STEP_RESULTS, this.stepResults)
    
    // Highlight'ı her zaman temizle - validation sonucuna bakmaksızın
    this.clearHighlight()
    
    // NextTarget varsa, ikinci elementi bul ve highlight et
    if (step.nextTarget) {
      console.log(`[Keepnet] Looking for nextTarget...`)
      await Utils.sleep(1000) // Menünün açılması için bekle
      
      const nextElement = Utils.findElement(step.nextTarget)
      if (nextElement) {
        console.log(`[Keepnet] NextTarget found, highlighting...`)
        this.clearHighlight()
        
        // Eğer textToEnter varsa input alanına yaz
        if (step.nextTarget.textToEnter) {
          console.log(`[Keepnet] Entering text: "${step.nextTarget.textToEnter}"`)
          if (nextElement.tagName === 'INPUT' || nextElement.tagName === 'TEXTAREA') {
            nextElement.focus()
            nextElement.value = step.nextTarget.textToEnter
            // Input event trigger et
            nextElement.dispatchEvent(new Event('input', { bubbles: true }))
            nextElement.dispatchEvent(new Event('change', { bubbles: true }))
            
            // Highlight göster
            this.highlightElement(nextElement, `"${step.nextTarget.textToEnter}" ${i18n('valueEntered')}`)
            
            // Manual timer varsa veya autoAdvance false ise beklemeli, değilse otomatik geç
            await Utils.sleep(step.waitAfterClick || 1000)
            if (!step.manualTimer && step.autoAdvance !== false) {
              await this.nextStep()
            } else {
              console.log(`[Keepnet] Manual timer active or autoAdvance disabled, waiting for user to click Continue`)
            }
            return
          }
        } else {
          // Normal nextTarget mantığı (click listener)
        this.highlightElement(nextElement, `${i18n('nowSelect')} "${step.nextTarget.textMatch?.source || i18n('selectThisOption')}" ${i18n('selectOption')}`)
        
        // NextTarget'a click listener ekle
        nextElement.addEventListener('click', async () => {
          console.log(`[Keepnet] NextTarget clicked`)
          this.clearHighlight()
          await Utils.sleep(step.waitAfterClick || 500)
            // Manual timer varsa veya autoAdvance false ise nextStep çağırma
            if (!step.manualTimer && step.autoAdvance !== false) {
          await this.nextStep()
            } else {
              console.log(`[Keepnet] Manual timer active or autoAdvance disabled, waiting for user to click Continue`)
            }
        }, { once: true })
        
        return // Normal nextStep'i atla
        }
      }
    }
    
    // SecondaryTarget varsa (dropdown'dan sonra seçilecek öğe), ikinci elementi bul ve highlight et
    if (step.target && step.target.secondaryTarget) {
      console.log(`[Keepnet] Looking for secondaryTarget...`)
      await Utils.sleep(1000) // Dropdown'ın açılması için bekle
      
      const secondaryElement = Utils.findElement(step.target.secondaryTarget)
      if (secondaryElement) {
        console.log(`[Keepnet] SecondaryTarget found, highlighting...`)
        this.clearHighlight()
        this.highlightElement(secondaryElement, `${i18n('nowSelect')} "${step.target.secondaryTarget.textMatch?.source || i18n('selectThisOption')}" ${i18n('selectOption')}`)
        
        // SecondaryTarget'a click listener ekle
        secondaryElement.addEventListener('click', async () => {
          console.log(`[Keepnet] SecondaryTarget clicked`)
          this.clearHighlight()
          await Utils.sleep(step.waitAfterClick || 500)
          // Manual timer varsa veya autoAdvance false ise nextStep çağırma
          if (!step.manualTimer && step.autoAdvance !== false) {
          await this.nextStep()
          } else {
            console.log(`[Keepnet] Manual timer active or autoAdvance disabled, waiting for user to click Continue`)
          }
        }, { once: true })
        
        // Auto-click için secondary target'ı da destekle (manual timer varsa veya autoAdvance false ise çalışma)
        if (step.autoClick && !step.manualTimer && step.autoAdvance !== false) {
          this.autoClick.start(secondaryElement, AUTO_CLICK_TIMEOUT, async () => {
            el.click()
          await Utils.sleep(step.waitAfterClick || 500)
          await this.nextStep()
          }, this.workflowName)
        }
        
        return // Normal nextStep'i atla
      } else {
        console.warn(`[Keepnet] SecondaryTarget not found, trying to find with fallback selectors...`)
        // Fallback selector'ları dene
        const fallbacks = step.target.secondaryTarget.fallback || []
        for (const fallback of fallbacks) {
          try {
            const cleanFallback = fallback.replace(/:contains\([^)]+\)/g, '').trim()
            if (cleanFallback) {
              const elements = Array.from(document.querySelectorAll(cleanFallback))
              for (const el of elements) {
                const text = el.textContent || el.innerText || ''
                if (/IP address is in any of these ranges/i.test(text) && Utils.isVisible(el)) {
                  console.log(`[Keepnet] SecondaryTarget found with fallback: ${fallback}`)
                  this.clearHighlight()
                  this.highlightElement(el, `${i18n('nowSelect')} "${i18n('selectIPAddressRanges')}`)
                  
                  el.addEventListener('click', async () => {
                    console.log(`[Keepnet] SecondaryTarget clicked (fallback)`)
                    this.clearHighlight()
                    await Utils.sleep(step.waitAfterClick || 500)
                    // Manual timer varsa veya autoAdvance false ise nextStep çağırma
                    if (!step.manualTimer && step.autoAdvance !== false) {
                    await this.nextStep()
                    } else {
                      console.log(`[Keepnet] Manual timer active or autoAdvance disabled, waiting for user to click Continue`)
                    }
                  }, { once: true })
                  
                  if (step.autoClick && !step.manualTimer && step.autoAdvance !== false) {
                    this.autoClick.start(el, AUTO_CLICK_TIMEOUT, async () => {
                      el.click()
          await Utils.sleep(step.waitAfterClick || 500)
          await this.nextStep()
                    }, this.workflowName)
                  }
                  
                  return
                }
              }
            }
          } catch (e) {
            console.warn(`[Keepnet] Fallback selector error: ${fallback}`, e)
          }
        }
      }
    }
    
    // OTOMATIK SONRAKİ ADIMA GEÇ - AMA manualTimer varsa VEYA autoAdvance false ise ÇALIŞMA!
    // Eğer manual timer varsa veya autoAdvance false ise, kullanıcı manuel Continue butonuna basmalı
    if (step.manualTimer || step.autoAdvance === false) {
      console.log(`[Keepnet] Step ${step.id} has manual timer or autoAdvance disabled, NOT auto-advancing. Waiting for user to click Continue...`)
      return // Kullanıcı Continue butonuna basmalı
    }
    
    // Normal adımlar için otomatik geçiş - kullanıcı zaten elemente tıkladıktan sonra ek bekleme yok
    console.log(`[Keepnet] Step ${step.id} tamamlandı, otomatik sonraki adıma geçiliyor...`)
    await this.nextStep()
  }
  
  async validateStep(step) {
    if (!step.validation) return true
    
    try {
      const result = step.validation()
      return result
    } catch (e) {
      console.error("[Keepnet] Validation error:", e)
      return false
    }
  }
  
  startRealTimeValidation(step) {
    this.stopRealTimeValidation()
    
    this.validationInterval = window.setInterval(async () => {
      const isValid = await this.validateStep(step)
      
      // Step 8 için IP validation mesajları kaldırıldı
    }, VALIDATION_INTERVAL)
  }
  
  stopRealTimeValidation() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
      this.validationInterval = null
    }
  }
  
  setupAutoFillForIPs(step) {
    const autoFillTimer = setTimeout(async () => {
      // Kullanıcı 10s içinde giriş yapmadı mı?
      const panel = document.querySelector('.ms-Panel-main')
      if (!panel) return
      
      const text = panel.innerText
      const hasAnyIP = step.requiredIPs.some(ip => text.includes(ip))
      
      if (!hasAnyIP) {
        // Otomatik doldur seçeneği sun
        const confirmFill = confirm('IP\'leri otomatik doldurmak ister misiniz?')
        if (confirmFill) {
          await this.autoFillIPs(step.requiredIPs)
        }
      }
    }, step.autoFillDelay || 10000)
    
    // Kullanıcı bir şey girerse timer'ı iptal et
    document.addEventListener('input', () => {
      clearTimeout(autoFillTimer)
    }, { once: true })
  }
  
  async autoFillIPs(ips) {
    // IP input field'ını bul ve doldur
    const panel = document.querySelector('.ms-Panel-main')
    if (!panel) return
    
    const input = panel.querySelector('input[type="text"], textarea')
    if (!input) return
    
    for (const ip of ips) {
      input.value = ip
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      
      // "Add" butonunu bul ve tıkla
      const addBtn = Array.from(panel.querySelectorAll('button')).find(btn => 
        /Add|Ekle/i.test(btn.textContent)
      )
      if (addBtn) {
        addBtn.click()
      }
      
      await Utils.sleep(500)
    }
    
    this.panel.showSuccess('IP\'ler otomatik eklendi!')
  }
  
  async captureScreenshot(step, isValid) {
    const stepName = step.name
    const dataUrl = await this.screenshots.capture(stepName)
    
    if (dataUrl) {
      await this.screenshots.save(stepName, dataUrl, { valid: isValid })
      console.log(`[Keepnet] Screenshot saved: ${stepName}.png`)
    }
  }
  async nextStep() {
    console.log("[Keepnet] Next step clicked")
    
    // ÖNCELİKLE TEMİZLE
    this.clearHighlight()
    
    // Timer'ları temizle
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer)
      autoAdvanceTimer = null
    }
    if (this.currentTimerInterval) {
      window.clearInterval(this.currentTimerInterval)
      this.currentTimerInterval = null
    }
    
    // Clear auto-advance timer when manually proceeding (log only)
    if (autoAdvanceTimer) {
      console.log('[Keepnet] Clearing auto-advance timer due to manual next step')
      clearTimeout(autoAdvanceTimer)
      autoAdvanceTimer = null
    }
    
    // Current step validation (sadece uyarı, bloklama yok)
    const currentStepConfig = this.currentWorkflow[this.currentStep - 1]
    
    // ÖNEMLİ: Workflow 1 için Domain, IP ve URL input validation (ZORUNLU)
    if (this.workflowName === 'WORKFLOW_1' && currentStepConfig) {
      const stepName = currentStepConfig.name
      
      // Step 8: Domain girişi kontrolü
      if (stepName === 'step8_domains_input') {
        console.log('[Keepnet] Checking domain input...')
        const panel = document.querySelector('.ms-Panel-main, [role="dialog"]')
        if (panel) {
          // Domain picker içindeki chip/tag'leri kontrol et
          const domainChips = panel.querySelectorAll('.ms-BasePicker-text .ms-PickerPersona-container, .ms-TagItem')
          console.log('[Keepnet] Domain chips found:', domainChips.length)
          
          if (domainChips.length === 0) {
            alert(i18n('validationNoDomains'))
            return // Bir sonraki adıma geçme!
          }
        }
      }
      
      // Step 9: IP girişi kontrolü
      if (stepName === 'step9_ip_input') {
        console.log('[Keepnet] Checking IP input...')
        const panel = document.querySelector('.ms-Panel-main, [role="dialog"]')
        if (panel) {
          // IP picker içindeki chip/tag'leri kontrol et - daha geniş selector
          const ipChips = panel.querySelectorAll('.ms-BasePicker-text .ms-PickerPersona-container, .ms-TagItem, .ms-Persona-primaryText, [data-automation-id="FieldRendererAnchor-SenderIpRanges"] .ms-BasePicker-text > div')
          console.log('[Keepnet] IP chips found:', ipChips.length)
          
          // Alternatif: Text content kontrolü
          const ipText = panel.textContent || panel.innerText || ''
          const hasIPs = /149\.72\.\d+\.\d+/.test(ipText) || ipChips.length > 0
          
          if (!hasIPs) {
            alert(i18n('validationNoIPs'))
            return // Bir sonraki adıma geçme!
          }
        }
      }
      
      // Step 10: URL girişi kontrolü
      if (stepName === 'step10_simulation_urls_input') {
        console.log('[Keepnet] Checking URL input...')
        const panel = document.querySelector('.ms-Panel-main, [role="dialog"]')
        if (panel) {
          // URL picker içindeki chip/tag'leri kontrol et - daha geniş selector
          const urlChips = panel.querySelectorAll('.ms-BasePicker-text .ms-PickerPersona-container, .ms-TagItem, .ms-Persona-primaryText, [data-automation-id="FieldRendererAnchor-AllowedUrls"] .ms-BasePicker-text > div')
          console.log('[Keepnet] URL chips found:', urlChips.length)
          
          // Alternatif: Text content kontrolü
          const urlText = panel.textContent || panel.innerText || ''
          const hasURLs = /https?:\/\//.test(urlText) || urlChips.length > 0
          
          if (!hasURLs) {
            alert(i18n('validationNoURLs'))
            return // Bir sonraki adıma geçme!
          }
        }
      }
    }
    
    // ÖNEMLİ: Workflow 4 için IP ve Header girişi validation (ZORUNLU)
    if (this.workflowName === 'WORKFLOW_4' && currentStepConfig) {
      const stepName = currentStepConfig.name
      
      // Step 5: Rule Name kontrolü
      if (stepName === 'spambypass_step5_rule_name') {
        console.log('[Keepnet] Checking rule name input...')
        const ruleNameInput = document.querySelector('input[data-automation-id="EditTransportRule_Name_TextField"], input[maxlength="64"]')
        if (ruleNameInput && ruleNameInput.value.trim() === '') {
          alert(i18n('validationNoRuleName'))
          return
        }
      }
      
      // Step 9: IP girişi kontrolü
      if (stepName === 'spambypass_step9_enter_ip') {
        console.log('[Keepnet] Checking IP input...')
        // IP'lerin eklenmiş olup olmadığını kontrol et (form içinde)
        const ipContainer = document.querySelector('[data-automation-id="SenderIpRanges"], .ms-TextField-wrapper')
        if (ipContainer) {
          // Eklenmiş IP chip/tag'lerini bul
          const ipTags = ipContainer.querySelectorAll('.ms-TagItem, [class*="tagItem"]')
          const containerText = ipContainer.textContent || ''
          // Hem eski chip/tag yapısını hem de sadece metin olarak girilmiş IP'leri destekle
          const hasIPText = /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(containerText)
          console.log('[Keepnet] IP tags found:', ipTags.length, 'hasIPText:', hasIPText)

          let hasIPs = ipTags.length > 0 || hasIPText

          // Ek olarak, dialog içindeki liste/grid yapısında IP var mı kontrol et (yeni Exchange UI için)
          if (!hasIPs) {
            const dialog = document.querySelector('[role="dialog"], .ms-Dialog-main, .ms-Callout-main, .ms-Panel-main')
            if (dialog) {
              const dialogText = dialog.textContent || ''
              const hasDialogIP = /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(dialogText)
              console.log('[Keepnet] Dialog-level IP search, hasDialogIP:', hasDialogIP)
              hasIPs = hasDialogIP
            }
          }

          if (!hasIPs) {
            alert(i18n('validationNoIPs'))
            return
          }
        }
      }
      
      // Step 20: Header Name kontrolü (X-MS-Exchange-Organization-BypassClutter)
      if (stepName === 'spambypass_step20_enter_bypass_clutter') {
        console.log('[Keepnet] Checking header name input...')
        const headerInput = document.querySelector('input[data-automation-id="SetHeader_TextField"], input[placeholder*="header"]')
        if (headerInput && headerInput.value.trim() === '') {
          alert(i18n('validationNoHeaderName'))
          return
        }
      }
    }
    
    // ÖNEMLİ: Workflow 5 için IP ve Header girişi validation (ZORUNLU)
    if (this.workflowName === 'WORKFLOW_5' && currentStepConfig) {
      const stepName = currentStepConfig.name
      
      // Step 4: Rule Name kontrolü
      if (stepName === 'atplink_step4_rule_name') {
        console.log('[Keepnet] Checking rule name input...')
        const ruleNameInput = document.querySelector('input[data-automation-id="EditTransportRule_Name_TextField"], input[maxlength="64"]')
        if (ruleNameInput && ruleNameInput.value.trim() === '') {
          alert(i18n('validationNoRuleName'))
          return
        }
      }
      
      // Step 8: IP girişi kontrolü
      if (stepName === 'atplink_step8_enter_ip') {
        console.log('[Keepnet] Checking IP input...')
        const ipContainer = document.querySelector('[data-automation-id="SenderIpRanges"], .ms-TextField-wrapper')
        if (ipContainer) {
          const ipTags = ipContainer.querySelectorAll('.ms-TagItem, [class*="tagItem"]')
          const containerText = ipContainer.textContent || ''
          const hasIPText = /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(containerText)
          console.log('[Keepnet] IP tags found:', ipTags.length, 'hasIPText:', hasIPText)

          let hasIPs = ipTags.length > 0 || hasIPText

          if (!hasIPs) {
            const dialog = document.querySelector('[role="dialog"], .ms-Dialog-main, .ms-Callout-main, .ms-Panel-main')
            if (dialog) {
              const dialogText = dialog.textContent || ''
              const hasDialogIP = /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(dialogText)
              console.log('[Keepnet] Dialog-level IP search, hasDialogIP:', hasDialogIP)
              hasIPs = hasDialogIP
            }
          }

          if (!hasIPs) {
            alert(i18n('validationNoIPs'))
            return
          }
        }
      }
      
      // Step 14: Header Name kontrolü (X-MS-Exchange-Organization-SkipSafeLinksProcessing)
      if (stepName === 'atplink_step14_header_name') {
        console.log('[Keepnet] Checking header name input...')
        const headerInput = document.querySelector('input[data-automation-id="SetHeader_TextField"], input[placeholder*="header"]')
        if (headerInput && headerInput.value.trim() === '') {
          alert(i18n('validationNoHeaderName'))
          return
        }
      }
      
      // Step 16: Header Value kontrolü (1)
      if (stepName === 'atplink_step16_header_value') {
        console.log('[Keepnet] Checking header value input...')
        const headerValueInputs = document.querySelectorAll('input[data-automation-id="SetHeader_TextField"], input[placeholder*="value"]')
        // İkinci input'u al (value için)
        const headerValueInput = headerValueInputs[1] || headerValueInputs[0]
        if (headerValueInput && headerValueInput.value.trim() === '') {
          alert(i18n('validationNoHeaderValue'))
          return
        }
      }
    }
    
    // ÖNEMLİ: Workflow 6 için IP ve Header girişi validation (ZORUNLU)
    if (this.workflowName === 'WORKFLOW_6' && currentStepConfig) {
      const stepName = currentStepConfig.name
      
      // Step 4: Rule Name kontrolü
      if (stepName === 'atpattach_step4_rule_name') {
        console.log('[Keepnet] Checking rule name input...')
        const ruleNameInput = document.querySelector('input[data-automation-id="EditTransportRule_Name_TextField"], input[maxlength="64"]')
        if (ruleNameInput && ruleNameInput.value.trim() === '') {
          alert(i18n('validationNoRuleName'))
          return
        }
      }
      
      // Step 8: IP girişi kontrolü
      if (stepName === 'atpattach_step8_enter_ip') {
        console.log('[Keepnet] Checking IP input...')
        const ipContainer = document.querySelector('[data-automation-id="SenderIpRanges"], .ms-TextField-wrapper')
        if (ipContainer) {
          const ipTags = ipContainer.querySelectorAll('.ms-TagItem, [class*="tagItem"]')
          const containerText = ipContainer.textContent || ''
          const hasIPText = /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(containerText)
          console.log('[Keepnet] IP tags found:', ipTags.length, 'hasIPText:', hasIPText)

          let hasIPs = ipTags.length > 0 || hasIPText

          if (!hasIPs) {
            const dialog = document.querySelector('[role="dialog"], .ms-Dialog-main, .ms-Callout-main, .ms-Panel-main')
            if (dialog) {
              const dialogText = dialog.textContent || ''
              const hasDialogIP = /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(dialogText)
              console.log('[Keepnet] Dialog-level IP search, hasDialogIP:', hasDialogIP)
              hasIPs = hasDialogIP
            }
          }

          if (!hasIPs) {
            alert(i18n('validationNoIPs'))
            return
          }
        }
      }
      
      // Step 15: Header Name kontrolü (X-MS-Exchange-Organization-SkipSafeAttachmentProcessing)
      if (stepName === 'atpattach_step15_header_name') {
        console.log('[Keepnet] Checking header name input...')
        const headerInput = document.querySelector('input[data-automation-id="SetHeader_TextField"], input[placeholder*="header"]')
        if (headerInput && headerInput.value.trim() === '') {
          alert(i18n('validationNoHeaderName'))
          return
        }
      }
      
      // Step 17: Header Value kontrolü (1)
      if (stepName === 'atpattach_step17_header_value') {
        console.log('[Keepnet] Checking header value input...')
        const headerValueInputs = document.querySelectorAll('input[data-automation-id="SetHeader_TextField"], input[placeholder*="value"]')
        // İkinci input'u al (value için)
        const headerValueInput = headerValueInputs[1] || headerValueInputs[0]
        if (headerValueInput && headerValueInput.value.trim() === '') {
          alert(i18n('validationNoHeaderValue'))
          return
        }
      }
    }
    
    if (currentStepConfig && currentStepConfig.validation) {
      const isValid = await this.validateStep(currentStepConfig)
      if (!isValid && currentStepConfig.criticalStep) {
        // Kritik adım tamamlanmamış - sadece uyarı göster
        console.warn("[Keepnet] Critical step not completed, but continuing anyway")
        this.panel.showError(`Bu adım tamamlanmamış ama devam ediliyor...`)
      }
    }
    
    // Screenshot current step
    if (currentStepConfig && !currentStepConfig.isSummary) {
      await this.captureScreenshot(currentStepConfig, true)
    }
    
    // Next
    const totalSteps = this.currentWorkflow.length
    const nextStepNum = this.currentStep + 1
    console.log(`[Keepnet] Current step: ${this.currentStep}, Next step: ${nextStepNum}, Total steps: ${totalSteps}`)
    
    // Eğer sonraki adım summary adımıysa direkt summary göster
    const nextStep = this.currentWorkflow[nextStepNum - 1]
    if (nextStep && nextStep.isSummary) {
      console.log('[Keepnet] Next step is summary, showing summary directly')
      await this.showSummary()
    } else if (this.currentStep >= totalSteps) {
      console.log('[Keepnet] All steps completed, showing summary')
      await this.showSummary()
    } else {
      await this.executeStep(nextStepNum)
    }
  }
  
  async prevStep() {
    console.log("[Keepnet] Previous step clicked")
    
    // ÖNCELİKLE TEMİZLE
    this.clearHighlight()
    
    // Timer'ları temizle
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer)
      autoAdvanceTimer = null
    }
      if (this.currentTimerInterval) {
        window.clearInterval(this.currentTimerInterval)
      this.currentTimerInterval = null
    }
    
    if (this.currentStep <= 1) return
    await this.executeStep(this.currentStep - 1)
  }
  
  async showSummary() {
    this.clearHighlight()
    
    // Language'i yeniden yükle (güncel olsun)
    await loadLanguagePreference()
    console.log('[showSummary] Current language:', CURRENT_LANGUAGE)
    
    // Footer'ı gizle (summary ekranında footer butonu gösterme)
    const footer = document.getElementById('keepnet-panel-footer')
    if (footer) {
      footer.style.display = 'none'
    }
    
    const screenshots = this.screenshots.getAll()
    
    const workflowDisplayNameKey = `workflow${this.workflowName.replace('WORKFLOW_', '')}Name`
    let workflowDisplayName = i18n(workflowDisplayNameKey)
    if (workflowDisplayName === workflowDisplayNameKey) {
      workflowDisplayName = this.workflowName
    }
    
    let html = `
      <div class="keepnet-summary">
        <!-- Clean Header (Linear style) -->
        <div style="
          margin-bottom: 20px;
        ">
          <h2 style="
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            letter-spacing: -0.01em;
          ">
            ${i18n('summaryReport')} - ${workflowDisplayName}
          </h2>
          <div style="
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 400;
          ">
            ${workflowDisplayName}
          </div>
        </div>
        
        <!-- Task List Container (Notion style) -->
        <div style="
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 8px;
          margin-bottom: 16px;
        ">
    `
    
    // Summary adımını ve hideInSummary olan adımları hariç tut
    const stepsToShow = this.currentWorkflow.filter(s => !s.isSummary && !s.hideInSummary)
    
    for (let i = 0; i < stepsToShow.length; i++) {
      const step = stepsToShow[i]
      const result = this.stepResults[step.id]
      const screenshot = screenshots[step.name]
      
      // SVG Status Icons (clean icons instead of emojis)
      let statusIcon = ''
      if (result?.valid) {
        statusIcon = `
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 4px;
            background: rgba(16, 185, 129, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 10px;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        `
      } else if (result) {
        statusIcon = `
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 4px;
            background: rgba(239, 68, 68, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 10px;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        `
      } else {
        statusIcon = `
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 10px;
          ">
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.5);
            "></div>
          </div>
        `
      }
      
      const isLast = i === stepsToShow.length - 1
      const itemBackground = !result?.valid ? 'rgba(255, 255, 255, 0.03)' : 'transparent'
      const marginBottom = !isLast ? 'margin-bottom: 4px;' : ''
      html += `
        <div style="
          display: flex;
          align-items: center;
          padding: 10px 12px;
          ${marginBottom}
          border-radius: 6px;
          transition: all 0.15s ease;
          background: ${itemBackground};
        " class="keepnet-summary-item">
          ${statusIcon}
          <div style="flex: 1; min-width: 0;">
            <div style="
              font-size: 13px;
              font-weight: 500;
              color: #FFFFFF;
              line-height: 1.4;
              margin-bottom: ${screenshot ? '2px' : '0'};
            ">
              ${i18n(step.title)}
            </div>
            ${screenshot ? `
              <div style="
                font-size: 11px;
                color: rgba(255, 255, 255, 0.5);
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>${i18n('screenshotSaved')}</span>
              </div>
            ` : ''}
          </div>
          ${!result?.valid ? `
            <button 
              class="keepnet-goto-step-btn" 
              data-step-id="${step.id}" 
              data-workflow="${this.workflowName}"
              style="
                padding: 6px 12px;
                font-size: 11px;
                font-weight: 500;
                background: rgba(255, 255, 255, 0.1);
                color: #FFFFFF;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
                flex-shrink: 0;
                font-family: inherit;
              "
            >
              <span>${i18n('goAndFix')}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          ` : ''}
        </div>
      `
    }
    
    html += `
        </div>
    `
    
    // WORKFLOW_6 için özel tebrik mesajı
    if (this.workflowName === 'WORKFLOW_6') {
      html += `
        <div style="
          background: linear-gradient(135deg, #1e293b 0%, #312e81 100%);
          border-radius: 16px;
          padding: 48px 32px;
          margin-top: 16px;
          color: white;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        ">
          <!-- Subtle background glow -->
          <div style="
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            pointer-events: none;
          "></div>
          
          <!-- Success Icon with Animation -->
          <div style="
            position: relative;
            z-index: 1;
            width: 72px;
            height: 72px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
            animation: keepnet-pulse-success 2s ease-in-out infinite;
          ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L5.53 12.7a1 1 0 00-1.42 0 1 1 0 000 1.41l4.18 4.18a1 1 0 001.42 0L20.41 7.59a1 1 0 00-1.41-1.41L9 16.17z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <!-- Heading -->
          <div style="
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
            position: relative;
            z-index: 1;
          ">
            ${i18n('congratulations')}
          </div>
          
          <!-- Body Text -->
          <div style="
            font-size: 14px;
            line-height: 1.6;
            color: #e2e8f0;
            margin-bottom: 32px;
            position: relative;
            z-index: 1;
          ">
            ${i18n('summaryDescription')}
          </div>
          
          <!-- Status Badges -->
          <div style="
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            position: relative;
            z-index: 1;
          ">
            <div style="
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 12px;
              padding: 8px 16px;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              font-weight: 500;
            ">
              <span style="color: #10b981; font-size: 16px;">✓</span>
              <span>${i18n('workflowsCompleted')}</span>
            </div>
            <div style="
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 12px;
              padding: 8px 16px;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              font-weight: 500;
            ">
              <span style="color: #3b82f6; font-size: 16px;">✓</span>
              <span>${i18n('stepsSuccessful')}</span>
            </div>
            <div style="
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 12px;
              padding: 8px 16px;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              font-weight: 500;
            ">
              <span style="color: #a855f7; font-size: 16px;">✓</span>
              <span>${i18n('successful')}</span>
            </div>
          </div>
        </div>
        
        <!-- Add CSS animation -->
        <style>
          @keyframes keepnet-pulse-success {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 12px 32px rgba(16, 185, 129, 0.6);
            }
          }
        </style>
      `
    }
    
    // Sonraki workflow var mı? Devam butonu metnini belirle
    let hasNextWorkflow = false
    let nextWorkflowText = ''
    if (this.workflowName === 'WORKFLOW_1') {
      nextWorkflowText = i18n('continueToWorkflow2')
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_2') {
      nextWorkflowText = i18n('continueToWorkflow3')
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_3') {
      nextWorkflowText = i18n('continueToWorkflow4')
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_4') {
      nextWorkflowText = i18n('continueToWorkflow5')
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_5') {
      nextWorkflowText = i18n('continueToWorkflow6')
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_6') {
      // WORKFLOW_6 için buton gösterme
      hasNextWorkflow = false
    } else {
      nextWorkflowText = i18n('allWorkflowsCompleted')
      hasNextWorkflow = false
    }

    // Devam butonu bloğunu ekle (sadece hasNextWorkflow true ise)
    if (hasNextWorkflow) {
      html += `
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button id="keepnet-continue-workflow-btn" class="keepnet-workflow-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: linear-gradient(135deg,rgb(35, 30, 58) 0%,rgb(21, 51, 64) 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
          ">
            ${nextWorkflowText}
          </button>
        </div>
      `
    }

    // Oluşturulan içeriği panele yaz
    this.panel.setContent(html)

    // Animate summary items with stagger
    setTimeout(() => {
      const summaryItems = this.panel.body.querySelectorAll('.keepnet-summary > div > div')
      if (summaryItems.length > 0) {
        AnimationUtils.staggerChildren(summaryItems[0].parentElement, 'fadeInUp', 80)
      }
    }, 100)
    
    // Global fonksiyonları yeniden kaydet (emin olmak için)
    console.log("[Keepnet] Re-registering global functions for summary...")
    this.setupGlobalFunctions()
    
    // Event listeners
    setTimeout(() => {
      // Continue butonu için
      const continueBtn = document.getElementById('keepnet-continue-workflow-btn')
      if (continueBtn && hasNextWorkflow) {
        console.log("[Keepnet] Attaching click handler to continue button")
        
        // Click handler
        continueBtn.addEventListener('click', async (e) => {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          console.log("[Keepnet] Continue workflow button clicked!")
          console.log("[Keepnet] Current workflow:", this.workflowName)
          
          // Workflow 4-6 için popup kapanma koruması
          const isWorkflow4To6 = ['WORKFLOW_4', 'WORKFLOW_5', 'WORKFLOW_6'].includes(this.workflowName)
          if (isWorkflow4To6) {
            console.log(`[Keepnet] Workflow ${this.workflowName} - preventing popup closure`)
            
            // Log continue button click (NOT a closure reason - just tracking)
            this.panel?.logPopupClosureReason('continueBtn', this.workflowName, {
              buttonId: 'keepnet-continue-workflow-btn',
              buttonText: continueBtn.textContent,
              hasNextWorkflow: hasNextWorkflow,
              note: 'Continue button click - popup should NOT close'
            })
            
            // Microsoft Exchange form'unun açık olduğunu kontrol et
            const exchangeForm = document.querySelector('[role="dialog"], .ms-Panel, [data-automation-id="panel"], .ms-Modal')
            if (exchangeForm) {
              console.log("[Keepnet] Exchange form detected - maintaining focus")
              // Form'a focus'u geri ver
              setTimeout(() => {
                if (exchangeForm && typeof exchangeForm.focus === 'function') {
                  exchangeForm.focus()
                }
              }, 50)
            }
          }
          
          if (typeof window.keepnetContinueWorkflow === 'function') {
            await window.keepnetContinueWorkflow()
          } else {
            console.error("[Keepnet] window.keepnetContinueWorkflow is not a function!")
            alert("Hata: Fonksiyon bulunamadı. Lütfen extension'ı yeniden yükleyin.")
          }
        })
        
        // Hover animations (CSP-safe)
        continueBtn.addEventListener('mouseenter', () => {
          continueBtn.style.transform = 'scale(1.02)'
          continueBtn.style.boxShadow = '0 4px 8px rgba(124, 58, 237, 0.5)'
        })
        
        continueBtn.addEventListener('mouseleave', () => {
          continueBtn.style.transform = 'scale(1)'
          continueBtn.style.boxShadow = '0 2px 4px rgba(124, 58, 237, 0.3)'
        })
        
        console.log("[Keepnet] Click handler and hover effects attached successfully")
      }
      
      // YENİ: Git ve Düzelt butonları için workflow bilgisiyle
      const gotoButtons = document.querySelectorAll('.keepnet-goto-step-btn')
      gotoButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault()
          e.stopPropagation()
          
          const stepId = parseInt(btn.getAttribute('data-step-id'))
          const workflowName = btn.getAttribute('data-workflow')
          
          console.log(`[Keepnet] Git ve Düzelt clicked: Step ${stepId}, Workflow: ${workflowName}`)
          
          if (typeof window.keepnetGoToStep === 'function') {
            await window.keepnetGoToStep(stepId, workflowName)
          } else {
            console.error("[Keepnet] window.keepnetGoToStep is not a function!")
            alert("Hata: Fonksiyon bulunamadı. Lütfen extension'ı yeniden yükleyin.")
          }
        })
        
        // Hover effect
        btn.addEventListener('mouseenter', () => {
          btn.style.background = '#5b21b6'
          btn.style.transform = 'scale(1.05)'
        })
        
        btn.addEventListener('mouseleave', () => {
          btn.style.background = '#667eea'
          btn.style.transform = 'scale(1)'
        })
      })
      console.log("[Keepnet] Git ve Düzelt handlers attached:", gotoButtons.length)
    }, 100)
    
    console.log("[Keepnet] Summary displayed, global functions:", {
      keepnetContinueWorkflow: typeof window.keepnetContinueWorkflow,
      keepnetGoToStep: typeof window.keepnetGoToStep
    })
  }
  
  async waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
      } else {
        window.addEventListener('load', resolve, { once: true })
      }
    })
    
    // Dark mode removed
  }
}
// Toasts and design demo removed

/* ========== MESSAGE HANDLERS ========== */
let assistantInstance = null

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Keepnet] Message received:", request.action)
  
  switch (request.action) {
    case 'ping':
      console.log("[Keepnet] Ping received, responding with pong...")
      sendResponse('pong')
      return false
      
    case 'initAssistant':
      console.log("[Keepnet] initAssistant received!")
      if (!assistantInstance) {
        assistantInstance = new KeepnetAssistant()
        assistantInstance.init().then(() => {
          console.log("[Keepnet] Assistant initialized successfully")
          sendResponse({ ok: true })
        }).catch((error) => {
          console.error("[Keepnet] Init failed:", error)
          sendResponse({ ok: false, error: error.message })
        })
        return true // Async response
      } else {
        console.log("[Keepnet] Assistant already running")
        sendResponse({ ok: true })
        return false
      }
      
    case 'isPanelOpen':
      console.log("[Keepnet] Checking if panel is open...")
      const panel = document.getElementById('keepnet-floating-panel')
      const isOpen = panel && panel.style.display !== 'none'
      console.log("[Keepnet] Panel open status:", isOpen)
      sendResponse({ isOpen: isOpen })
      return false
      
    case 'togglePanel':
      console.log("[Keepnet] Toggle panel requested")
      const panelToToggle = document.getElementById('keepnet-floating-panel')
      if (panelToToggle) {
        if (panelToToggle.style.display === 'none') {
          // Panel kapalıydı, açılıyor
          // Eğer assistant instance yoksa, yeniden başlat
          if (!assistantInstance && !window.assistant) {
            console.log("[Keepnet] Panel açılıyor ama assistant yok, yeniden başlatılıyor...")
            assistantInstance = new KeepnetAssistant()
            assistantInstance.init().then(() => {
              console.log("[Keepnet] Assistant re-initialized after panel reopen")
              sendResponse({ ok: true })
            }).catch((error) => {
              console.error("[Keepnet] Re-init failed:", error)
              sendResponse({ ok: false, error: error.message })
            })
            return true // Async response
          } else {
            // Assistant varsa sadece panel'i göster
            panelToToggle.style.display = 'block'
            console.log("[Keepnet] Panel opened")
            sendResponse({ ok: true })
          }
        } else {
          // Panel açıktı, kapanıyor - instance'ı da temizle
          panelToToggle.style.display = 'none'
          window.assistantInstance = null
          window.assistant = null
          assistantInstance = null
          console.log("[Keepnet] Panel closed and instances cleared")
          sendResponse({ ok: true })
        }
      } else {
        sendResponse({ ok: false, error: 'Panel not found' })
      }
      return false
      
    case 'screenshotCaptured':
      console.log("[Keepnet] Screenshot captured notification received")
      sendResponse({ ok: true })
      return false
  }
  
  return false
})

/* ========== READY ========== */
console.log("[Keepnet] Content script ready! Waiting for initAssistant message...")
console.log("[Keepnet] Current URL:", location.href)

// Sayfa yüklendiğinde assistant'ı restore et
window.addEventListener('load', async () => {
  console.log("[Keepnet] Page loaded, checking for active session...")
  
  // ÖNCE: "Git ve Düzelt" modunu kontrol et
  const fixingStep = await Storage.get('keepnet_fixing_step')
  if (fixingStep) {
    console.log("[Keepnet] Fixing mode detected on page load! Auto-starting assistant...")
    
    // Asistan başlat - DIRECTLY initialize, don't send message to background
    setTimeout(async () => {
      if (!assistantInstance) {
        assistantInstance = new KeepnetAssistant()
        await assistantInstance.init()
        console.log("[Keepnet] Assistant initialized in fixing mode!")
      }
    }, 1000)
    return
  }
  
  // Workflow geçiş modu kontrolü
  const nextWorkflow = await Storage.get('keepnet_next_workflow')
  if (nextWorkflow) {
    console.log("[Keepnet] New workflow detected:", nextWorkflow)
    
    // Flag'i temizle - NOTE: init() içinde de temizlenecek ama burada da temizle
    await Storage.set('keepnet_next_workflow', null)
    
    // Kısa bekleme, sonra asistan başlat - DIRECTLY
    setTimeout(async () => {
      console.log("[Keepnet] Starting new workflow after page load...")
      if (!assistantInstance) {
        assistantInstance = new KeepnetAssistant()
        await assistantInstance.init()
        console.log("[Keepnet] Assistant initialized for new workflow!")
      }
    }, 1000)
    return
  }
  
  // Normal mod - aktif session var mı?
  const currentStep = await Storage.get(STORAGE_KEYS.CURRENT_STEP)
  if (currentStep && currentStep > 0) {
    console.log("[Keepnet] 🔄 Active session detected! Restoring assistant from step:", currentStep)
    
    // Asistan başlat - DIRECTLY
    setTimeout(async () => {
      if (!assistantInstance) {
        assistantInstance = new KeepnetAssistant()
        await assistantInstance.init()
        console.log("[Keepnet] Assistant restored from active session!")
      }
    }, 1000)
  }
})

// Load language preference on startup
loadLanguagePreference()

// Sayfa yüklenince ayrıca kontrol et (load event'i çalışmazsa)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log("[Keepnet] Document already loaded, checking state...")
  
  setTimeout(async () => {
    // Load language first
    await loadLanguagePreference()
    
    const nextWorkflow = await Storage.get('keepnet_next_workflow')
    if (nextWorkflow) {
      console.log("[Keepnet] nextWorkflow found, starting assistant directly...")
      await Storage.set('keepnet_next_workflow', null)
      
      if (!assistantInstance) {
        assistantInstance = new KeepnetAssistant()
        await assistantInstance.init()
        console.log("[Keepnet] Assistant initialized from document ready!")
      }
    }
  }, 500)
}

// TEST: Panel var mı kontrol et (10 saniyede bir)
window.setInterval(() => {
  const panel = document.querySelector('#keepnet-floating-panel')
  if (panel) {
    console.log("[Keepnet] Panel exists! Display:", panel.style.display, "Size:", panel.offsetWidth, "x", panel.offsetHeight)
  } else {
    console.log("[Keepnet] Panel NOT found in DOM!")
  }
}, 10000);

/* ==== WF4/5/6 HIZLI GEÇİŞ PATCH ==== */
(function () {
  // Fastpass kapalıysa hiçbir şey yapma (WF4/5/6 oto-ileri özelliğini devre dışı bırak)
  try {
    if (!(window && window.KEEPNET_FASTPASS === true)) {
      console.log('[Keepnet] Fastpass disabled - skipping WF4/5/6 acceleration helpers')
      return
    }
  } catch (e) {}
  const AUTO_WF = new Set(['workflow4', 'workflow5', 'workflow6']);

  // Basit yardımcılar
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function waitForSelector(sel, timeout = 10000) {
    const start = performance.now();
    while (performance.now() - start < timeout) {
      const el = document.querySelector(sel);
      if (el) return el;
      await sleep(100);
    }
    return null;
  }

  // Metinle eşleşen öğeleri bulup en yakın kapsayıcıyı kaldır
  function removeAllowlistBlocks() {
    const killByTexts = ['Allow List IP', 'Allowlist IP', 'Tümünü Kopyala', 'IP Adresleri'];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
    const toRemove = new Set();

    while (walker.nextNode()) {
      const el = /** @type {HTMLElement} */ (walker.currentNode);
      const t = (el.innerText || '').trim();
      if (!t) continue;
      if (killByTexts.some(tx => t.includes(tx))) {
        // Kart/panel benzeri en yakın kapsayıcıyı sil
        const panel = el.closest('[role="dialog"], .panel, .card, .ms-Panel, .ms-Card, section, .modal, .callout') || el.closest('div');
        if (panel) toRemove.add(panel);
      }
    }

    toRemove.forEach(el => el.remove());
    if (toRemove.size) console.log('🧹 Step 8: Allowlist/IP kopya blokları kaldırıldı.');
  }

  // Bulunduğun step'i DOM'dan okumaya çalış
  function getCurrentStepNumber() {
    // Sık görülen işaretlemeler
    const active = document.querySelector('[data-step].is-active, [data-step].active');
    if (active && active.getAttribute('data-step')) {
      const n = parseInt(active.getAttribute('data-step') || '', 10);
      if (!Number.isNaN(n)) return n;
    }

    // "Step 9" gibi bir başlık varsa
    const h = Array.from(document.querySelectorAll('h1,h2,h3,.step-title'))
      .map(x => x.textContent || '');
    for (const txt of h) {
      const m = txt.match(/step\s*(\d+)/i);
      if (m) return parseInt(m[1], 10);
    }

    // Bazı projelerde global değişken tutulur
    if (typeof window !== 'undefined') {
      const g1 = (window).currentStepNumber;
      if (typeof g1 === 'number') return g1;
    }

    return null;
  }

  // Projede varsa kullan; yoksa "İleri/Devam" butonuna tıkla
  async function goToStep(stepNo) {
    if (typeof (window).goToStep === 'function') {
      (window).goToStep(stepNo);
      return;
    }

    // Yedek: "Devam/Next/Continue" düğmesine tıkla
    const candidates = [
      'button[aria-label="Devam"]',
      'button[aria-label="Next"]',
      'button[aria-label="Continue"]',
      'button.ms-Button--primary',
      'button[type="submit"]',
      'button:where([data-role="next"],[data-action="next"])'
    ];

    for (const sel of candidates) {
      const btn = document.querySelector(sel);
      if (btn) { btn.click(); return; }
    }

    console.warn('Uyarı: Sonraki adıma geçiş için uygun buton bulunamadı.');
  }

  // SAĞDAKİ "Add action" butonu (workflow4 step 15 için lazım)
  async function clickRightAddAction() {
    const sel = 'button[data-automation-id="EditTransportRule_AddAction_0_IconButtonBtn"]';
    const btn = await waitForSelector(sel, 8000);
    if (btn) {
      btn.click();
      console.log('➕ Sağdaki "Add action" tıklandı.');
    } else {
      console.warn('"Add action" butonu bulunamadı:', sel);
    }
  }

  async function runForWorkflow(name) {
    name = (name || '').toLowerCase();
    if (!AUTO_WF.has(name)) return;

    const step = getCurrentStepNumber();
    if (step == null) return;

    // Ortak: Step 8 görünürse allowlist bloklarını kaldır
    if (step === 8) {
      removeAllowlistBlocks();
    }

    // WF4 özel akışlar
    if (name === 'workflow4') {
      if (step === 9) {
        console.log('⏳ WF4: Step 9\'da 20 sn bekleniyor, sonra 10\'a otomatik geçilecek…');
        await sleep(20000);
        await goToStep(10);
        return;
      }

      if (step === 15) {
        // Doğrudan sağdaki "Add action" tıkla ve hızlıca 16 & 17'ye ilerle
        await clickRightAddAction();
        await sleep(800);
        await goToStep(16);
        await sleep(800);
        await goToStep(17);
        return;
      }

      if (step === 16) {
        await sleep(800);
        await goToStep(17);
        return;
      }
    }

    // WF5 & WF6 genel hızlandırma: beklemeyip 800 ms sonra ilerle
    if ((name === 'workflow5' || name === 'workflow6')) {
      // 8'de sadece allowlist kaldır; geçişi de hızlandır
      if (step === 8) {
        await sleep(800);
        await goToStep(9);
        return;
      }

      if (step === 9) {
        await sleep(800);
        await goToStep(10);
        return;
      }
    }
  }

  // workflow adını bul
  function detectWorkflowName() {
    // Projede global değişken olabilir
    if (typeof (window).workflowName === 'string') return (window).workflowName;
    if (typeof (window).currentWorkflowName === 'string') return (window).currentWorkflowName;

    // data attribute ile işaretlenmiş olabilir
    const host = document.querySelector('[data-workflow]');
    if (host) return host.getAttribute('data-workflow');

    // Sayfa metninden bir ipucu
    const hint = (document.body.innerText || '').toLowerCase();
    if (hint.includes('workflow4')) return 'workflow4';
    if (hint.includes('workflow5')) return 'workflow5';
    if (hint.includes('workflow6')) return 'workflow6';

    return '';
  }

  async function boot() {
    const wf = detectWorkflowName();
    if (!wf) return;

    if (!AUTO_WF.has(wf.toLowerCase())) return;

    // İlk çalıştırma
    runForWorkflow(wf);

    // Step değişikliklerini yakalamak için basit gözlemci
    const obs = new MutationObserver(() => {
      runForWorkflow(wf);
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();