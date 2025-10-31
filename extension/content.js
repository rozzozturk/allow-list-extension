// Keepnet Allow List Assistant v3.1 - Third-Party Phishing Simulations Only
// Tek panel (sol-alt), otomatik tıklama, gerçek zamanlı validation, screenshot kanıt sistemi

console.log("[Keepnet v3.1] Content script loaded on", location.href)

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

let CURRENT_STEP = 0
let TOTAL_STEPS = 12  // Third-Party Phishing: 12 adım
let LANGUAGE = 'tr'
let screenshotCounter = 0

// Dosya başına:
let autoAdvanceTimer = null;

/* ========== i18n SYSTEM ========== */
// Messages for different languages
const MESSAGES = {
  tr: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    step: 'Adım',
    of: '/',
    continue: 'Continue',
    previous: 'Previous',
    summary: 'Summary',
    summaryReport: '📊 Özet Rapor',
    goToPage: '🌐 Sayfaya Git',
    copyAll: 'Tümünü Kopyala',
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
    workflowStep5Title: 'Advanced Delivery',
    workflowStep5Description: 'Advanced delivery butonuna tıklayın',
    workflowStep6Title: 'Phishing Simulation Tab',
    workflowStep6Description: 'Phishing simulation sekmesine tıklayın',
    workflowStep7Title: 'Düzenle Butonu',
    workflowStep7Description: 'Düzenle butonuna tıklayın',
    workflowStep8Title: 'Etki Alanları',
    workflowStep8Description: 'Bu domainleri girebilirsiniz: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep9Title: 'IP Adresleri',
    workflowStep9Description: 'White list IP adreslerini girin',
    workflowStep10Title: 'Simülasyon URL\'leri',
    workflowStep10Description: 'Bu domainleri girebilirsiniz: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep11Title: 'Kaydet',
    workflowStep11Description: 'Değişiklikleri kaydedin',
    workflowStep12Title: 'Tamamlandı! ✅',
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
    screenshotSaved: 'Screenshot kaydedildi'
  },
  en: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    step: 'Step',
    of: 'of',
    continue: 'Continue',
    previous: 'Previous',
    summary: 'Summary',
    summaryReport: '📊 Summary Report',
    goToPage: '🌐 Go to Page',
    copyAll: 'Copy All',
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
    workflowStep8Description: 'You can enter these domains: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep9Title: 'IP Addresses',
    workflowStep9Description: 'Enter white list IP addresses',
    workflowStep10Title: 'Simulation URLs',
    workflowStep10Description: 'You can enter these domains: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep11Title: 'Save',
    workflowStep11Description: 'Save the changes',
    workflowStep12Title: 'Completed! ✅',
    workflowStep12Description: 'All steps successfully completed',
    congratsTitle: 'Congratulations! You\'ve Completed All Steps!',
    congratsDesc: 'With these steps, you\'ve successfully whitelisted IP addresses in your Office 365 environment and<br>configured security simulations, spam filtering, and Advanced Threat Protection (ATP) features!',
    workflowsCompleted: '6 Workflows',
    stepsSuccessful: '62 Steps',
    importantWarning: 'Important Warning',
    warningFromStep3: 'Do NOT click the extension from step 3 onwards',
    warningLine1: '• Continue by opening extension when form closes',
    warningLine2: '• Pay attention to on-screen highlights',
    warningLine3: '• 5 second wait between each step',
    allScreenshotsSaved: 'All screenshots saved in chrome.storage',
    screenshotSaved: 'Screenshot saved'
  },
  de: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    step: 'Schritt',
    of: 'von',
    continue: 'Weiter',
    previous: 'Zurück',
    summary: 'Zusammenfassung',
    summaryReport: '📊 Zusammenfassungsbericht',
    goToPage: '🌐 Zur Seite gehen',
    copyAll: 'Alles kopieren',
    copied: 'Kopiert!',
    error: 'Fehler',
    goAndFix: 'Gehen & Reparieren',
    workflowStep1Title: 'Security Center Startseite',
    workflowStep1Description: 'Stellen Sie sicher, dass Sie sich im Microsoft Security Center befinden und fahren Sie fort.',
    workflowStep2Title: 'E-Mail & Zusammenarbeit',
    workflowStep2Description: 'Öffnen Sie das E-Mail & Zusammenarbeit-Menü',
    workflowStep3Title: 'Richtlinien & Regeln',
    workflowStep3Description: 'Gehen Sie zur Seite "Richtlinien & Regeln"',
    workflowStep4Title: 'Bedrohungsrichtlinien',
    workflowStep4Description: 'Klicken Sie auf Bedrohungsrichtlinien',
    workflowStep5Title: 'Erweiterte Zustellung',
    workflowStep5Description: 'Klicken Sie auf die Schaltfläche "Erweiterte Zustellung"',
    workflowStep6Title: 'Phishing-Simulation Tab',
    workflowStep6Description: 'Klicken Sie auf den Phishing-Simulation Tab',
    workflowStep7Title: 'Bearbeiten-Schaltfläche',
    workflowStep7Description: 'Klicken Sie auf die Bearbeiten-Schaltfläche',
    workflowStep8Title: 'Domänen',
    workflowStep8Description: 'Sie können diese Domänen eingeben: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep9Title: 'IP-Adressen',
    workflowStep9Description: 'Geben Sie Whitelist-IP-Adressen ein',
    workflowStep10Title: 'Simulations-URLs',
    workflowStep10Description: 'Sie können diese Domänen eingeben: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep11Title: 'Speichern',
    workflowStep11Description: 'Speichern Sie die Änderungen',
    workflowStep12Title: 'Abgeschlossen! ✅',
    workflowStep12Description: 'Alle Schritte erfolgreich abgeschlossen',
    congratsTitle: 'Glückwunsch! Alle Schritte abgeschlossen!',
    congratsDesc: 'Mit diesen Schritten haben Sie IP-Adressen in Ihrer Office 365-Umgebung erfolgreich<br>auf die Whitelist gesetzt und Sicherheitssimulationen, Spamfilterung und<br>erweiterte Bedrohungsschutz-(ATP-)Funktionen konfiguriert!',
    workflowsCompleted: '6 Workflows',
    stepsSuccessful: '62 Schritte',
    importantWarning: 'Wichtige Warnung',
    warningFromStep3: 'Klicken Sie ab Schritt 3 NICHT auf die Erweiterung',
    warningLine1: '• Fortsetzen durch Öffnen der Erweiterung wenn das Formular geschlossen wird',
    warningLine2: '• Achten Sie auf die Bildschirmhervorhebungen',
    warningLine3: '• 5 Sekunden Wartezeit zwischen jedem Schritt',
    allScreenshotsSaved: 'Alle Screenshots in chrome.storage gespeichert',
    screenshotSaved: 'Screenshot gespeichert'
  },
  fr: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    step: 'Étape',
    of: 'de',
    continue: 'Continuer',
    previous: 'Précédent',
    summary: 'Résumé',
    summaryReport: '📊 Rapport de résumé',
    goToPage: '🌐 Aller à la page',
    copyAll: 'Tout copier',
    copied: 'Copié!',
    error: 'Erreur',
    goAndFix: 'Aller & Corriger',
    workflowStep1Title: 'Page d\'accueil du Security Center',
    workflowStep1Description: 'Assurez-vous d\'être sur Microsoft Security Center et continuez.',
    workflowStep2Title: 'E-mail et Collaboration',
    workflowStep2Description: 'Ouvrez le menu E-mail et Collaboration',
    workflowStep3Title: 'Politiques et Règles',
    workflowStep3Description: 'Allez à la page Politiques et Règles',
    workflowStep4Title: 'Politiques de Menace',
    workflowStep4Description: 'Cliquez sur Politiques de Menace',
    workflowStep5Title: 'Livraison Avancée',
    workflowStep5Description: 'Cliquez sur le bouton Livraison Avancée',
    workflowStep6Title: 'Onglet Simulation de Phishing',
    workflowStep6Description: 'Cliquez sur l\'onglet Simulation de Phishing',
    workflowStep7Title: 'Bouton Modifier',
    workflowStep7Description: 'Cliquez sur le bouton Modifier',
    workflowStep8Title: 'Domaines',
    workflowStep8Description: 'Vous pouvez saisir ces domaines: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep9Title: 'Adresses IP',
    workflowStep9Description: 'Entrez les adresses IP de la liste blanche',
    workflowStep10Title: 'URLs de Simulation',
    workflowStep10Description: 'Vous pouvez saisir ces domaines: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep11Title: 'Enregistrer',
    workflowStep11Description: 'Enregistrez les modifications',
    workflowStep12Title: 'Terminé! ✅',
    workflowStep12Description: 'Toutes les étapes terminées avec succès',
    congratulations: 'Félicitations! Toutes les étapes terminées!',
    congratulationsDesc: 'Avec ces étapes, vous avez réussi à mettre sur liste blanche les adresses IP<br>dans votre environnement Office 365 et configuré les simulations de sécurité,<br>le filtrage du spam et les fonctions de protection avancée contre les menaces (ATP)!',
    congratulationsWorkflows: '6 Workflows',
    congratulationsSteps: '62 Étapes',
    importantWarning: 'Avertissement Important',
    warningFromStep3: 'NE cliquez PAS sur l\'extension à partir de l\'étape 3',
    warningLine1: '• Continuez en ouvrant l\'extension lorsque le formulaire se ferme',
    warningLine2: '• Faites attention aux surlignages à l\'écran',
    warningLine3: '• 5 secondes d\'attente entre chaque étape',
    allScreenshotsSaved: 'Toutes les captures d\'écran sauvegardées dans chrome.storage',
    screenshotSaved: 'Capture d\'écran sauvegardée'
  },
  es: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    step: 'Paso',
    of: 'de',
    continue: 'Continuar',
    previous: 'Anterior',
    summary: 'Resumen',
    summaryReport: '📊 Informe de Resumen',
    goToPage: '🌐 Ir a la Página',
    copyAll: 'Copiar Todo',
    copied: '¡Copiado!',
    error: 'Error',
    goAndFix: 'Ir y Arreglar',
    workflowStep1Title: 'Página de Inicio del Security Center',
    workflowStep1Description: 'Asegúrese de estar en Microsoft Security Center y continúe.',
    workflowStep2Title: 'Correo Electrónico y Colaboración',
    workflowStep2Description: 'Abra el menú de Correo Electrónico y Colaboración',
    workflowStep3Title: 'Políticas y Reglas',
    workflowStep3Description: 'Vaya a la página de Políticas y Reglas',
    workflowStep4Title: 'Políticas de Amenazas',
    workflowStep4Description: 'Haga clic en Políticas de Amenazas',
    workflowStep5Title: 'Entrega Avanzada',
    workflowStep5Description: 'Haga clic en el botón de Entrega Avanzada',
    workflowStep6Title: 'Pestaña de Simulación de Phishing',
    workflowStep6Description: 'Haga clic en la pestaña de Simulación de Phishing',
    workflowStep7Title: 'Botón Editar',
    workflowStep7Description: 'Haga clic en el botón Editar',
    workflowStep8Title: 'Dominios',
    workflowStep8Description: 'Puede ingresar estos dominios: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep9Title: 'Direcciones IP',
    workflowStep9Description: 'Ingrese las direcciones IP de la lista blanca',
    workflowStep10Title: 'URLs de Simulación',
    workflowStep10Description: 'Puede ingresar estos dominios: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep11Title: 'Guardar',
    workflowStep11Description: 'Guarde los cambios',
    workflowStep12Title: '¡Completado! ✅',
    workflowStep12Description: 'Todos los pasos completados exitosamente',
    congratulations: '¡Felicidades! ¡Todos los pasos completados!',
    congratulationsDesc: '¡Con estos pasos, ha añadido exitosamente las direcciones IP a la lista blanca<br>en su entorno de Office 365 y configurado simulaciones de seguridad,<br>filtrado de spam y funciones de Advanced Threat Protection (ATP)!',
    congratulationsWorkflows: '6 Workflows',
    congratulationsSteps: '62 Pasos',
    importantWarning: 'Advertencia Importante',
    warningFromStep3: 'NO haga clic en la extensión desde el paso 3 en adelante',
    warningLine1: '• Continuar abriendo la extensión cuando se cierre el formulario',
    warningLine2: '• Preste atención a los resaltados en pantalla',
    warningLine3: '• 5 segundos de espera entre cada paso',
    allScreenshotsSaved: 'Todas las capturas de pantalla guardadas en chrome.storage',
    screenshotSaved: 'Captura de pantalla guardada'
  },
  it: {
    extensionName: 'Keepnet Allow List Assistant for Office 365',
    assistantTitle: 'Keepnet Assistant',
    step: 'Passo',
    of: 'di',
    continue: 'Continua',
    previous: 'Precedente',
    summary: 'Riepilogo',
    summaryReport: '📊 Rapporto di Riepilogo',
    goToPage: '🌐 Vai alla Pagina',
    copyAll: 'Copia Tutto',
    copied: 'Copiato!',
    error: 'Errore',
    goAndFix: 'Vai e Correggi',
    workflowStep1Title: 'Pagina Iniziale del Security Center',
    workflowStep1Description: 'Assicurati di essere su Microsoft Security Center e continua.',
    workflowStep2Title: 'Email e Collaborazione',
    workflowStep2Description: 'Apri il menu Email e Collaborazione',
    workflowStep3Title: 'Politiche e Regole',
    workflowStep3Description: 'Vai alla pagina Politiche e Regole',
    workflowStep4Title: 'Politiche delle Minacce',
    workflowStep4Description: 'Clicca su Politiche delle Minacce',
    workflowStep5Title: 'Consegna Avanzata',
    workflowStep5Description: 'Clicca sul pulsante Consegna Avanzata',
    workflowStep6Title: 'Tab Simulazione Phishing',
    workflowStep6Description: 'Clicca sul tab Simulazione Phishing',
    workflowStep7Title: 'Pulsante Modifica',
    workflowStep7Description: 'Clicca sul pulsante Modifica',
    workflowStep8Title: 'Domini',
    workflowStep8Description: 'Puoi inserire questi domini: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep9Title: 'Indirizzi IP',
    workflowStep9Description: 'Inserisci gli indirizzi IP della whitelist',
    workflowStep10Title: 'URL di Simulazione',
    workflowStep10Description: 'Puoi inserire questi domini: signin-authzone.com, verifycloudaccess.com, akibadem.org, isdestek.org, gartnerpeer.com, global-cloud-llc.com, cloudverification.online, accountaccesses.com, shoppingcenter.site, hesapdogrulama.info, banksecure.info, meetingonline-us.com, digitalsecurelogin.co, secureloginshop.net, encryptedconnections.info, trendyoll.club, kurumsalgiris.com, yoursecuregateway.com, securemygateway.com, hadisendekatil.com, updatemyinformation.com, secure-passchanges.com, swift-intel.com, hepsibureda.com, securely-logout.com, sigortacilarbirligi.com, btyardimmasasi.com, sirketiciduyuru.com, bilgilerimiguncelle.com, securelogout.com, securelinked-in.com, theconnectionsuccess.com, sigortacilikhizmetleri.me, securebankingservices.net, guvenlibankacilik.com, insurance-services.me, btservisleri.com, secureloginonline.net, insan-kaynaklari.me, getaccess.store',
    workflowStep11Title: 'Salva',
    workflowStep11Description: 'Salva le modifiche',
    workflowStep12Title: 'Completato! ✅',
    workflowStep12Description: 'Tutti i passaggi completati con successo',
    congratulations: 'Congratulazioni! Tutti i passaggi completati!',
    congratulationsDesc: 'Con questi passaggi, hai aggiunto con successo gli indirizzi IP alla whitelist<br>nel tuo ambiente Office 365 e configurato simulazioni di sicurezza,<br>filtraggio dello spam e funzioni di Advanced Threat Protection (ATP)!',
    congratulationsWorkflows: '6 Workflows',
    congratulationsSteps: '62 Passaggi',
    importantWarning: 'Avviso Importante',
    warningFromStep3: 'NON cliccare sull\'estensione dal passaggio 3 in poi',
    warningLine1: '• Continuare aprendo l\'estensione quando il modulo si chiude',
    warningLine2: '• Prestare attenzione agli evidenziamenti sullo schermo',
    warningLine3: '• 5 secondi di attesa tra ogni passaggio',
    allScreenshotsSaved: 'Tutti gli screenshot salvati in chrome.storage',
    screenshotSaved: 'Screenshot salvato'
  }
}

// Current language (will be loaded from storage)
let CURRENT_LANGUAGE = 'tr'

// Load language preference from storage
async function loadLanguagePreference() {
  try {
    const result = await chrome.storage.local.get(['keepnet_language'])
    const savedLang = result.keepnet_language
    const userLang = chrome.i18n.getUILanguage().split('-')[0] // Get 'en' from 'en-US'
    const supportedLangs = ['tr', 'en', 'de']
    CURRENT_LANGUAGE = savedLang || (supportedLangs.includes(userLang) ? userLang : 'tr')
    console.log('[i18n] Language loaded:', CURRENT_LANGUAGE)
    
    // Update chrome.i18n locale if different
    if (CURRENT_LANGUAGE !== chrome.i18n.getUILanguage().split('-')[0]) {
      // Note: chrome.i18n.getUILanguage() is read-only, we'll use storage
    }
  } catch (error) {
    console.warn('[i18n] Error loading language preference:', error)
    CURRENT_LANGUAGE = 'tr'
  }
}

// Simple i18n helper - uses chrome.i18n API when available, falls back to MESSAGES
function i18n(key) {
  try {
    // Try chrome.i18n first (works for default locale)
    const chromeMessage = chrome.i18n.getMessage(key)
    if (chromeMessage) {
      return chromeMessage
    }
    
    // For dynamic language support, use MESSAGES object
    // This allows switching languages without reload
    const message = MESSAGES[CURRENT_LANGUAGE]?.[key] || MESSAGES.tr[key] || key
    return message
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
    validation: () => true
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
    tooltip: 'E-posta ve işbirliği\'ne tıklayın',
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
    tooltip: 'İlkeler ve kurallar\'a tıklayın',
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
    tooltip: 'Tehdit ilkeleri\'ne tıklayın',
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
      selector: 'button[aria-label*="Advanced delivery"]',
      textMatch: /Advanced delivery/i,
      fallback: [
        'button[aria-label*="OverridePolicy"]',
        'button.ms-Link',
        'button[type="button"]'
      ]
    },
    tooltip: 'Advanced delivery\'ye tıklayın',
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
      selector: 'button[name="Phishing simulation"]',
      textMatch: /Phishing simulation/i,
      fallback: [
        'span.ms-Pivot-text',
        'button[role="tab"]',
        '[data-automation-id*="phishing"]',
        '.ms-Pivot button'
      ]
    },
    tooltip: 'Phishing simulation sekmesine tıklayın',
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
    tooltip: 'Düzenle butonuna tıklayın',
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
      selector: 'label.ms-Label:contains("Etki Alanı")',
      textMatch: /Etki Alanı/i,
      fallback: [
        'label.ms-Label.root-995',
        'input[aria-label="Etki alanları"]',
        'input.ms-BasePicker-input'
      ]
    },
    tooltip: 'Etki alanlarını girin',
    autoClick: false,
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
      selector: 'input#TextField527[data-automation-id="SenderIpRanges_Input"]',
      fallback: [
        'input[data-automation-id="SenderIpRanges_Input"]',
        'input#TextField527',
        'input.ms-TextField-field.field-681',
        'input[aria-label="IP picker"]',
        'input.ms-BasePicker-input',
        'input[id*="combobox"][aria-label*="IP"]'
      ]
    },
    tooltip: 'White list IP adreslerini girin',
    autoClick: false,
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
      selector: 'label.ms-Label.root-985',
      textMatch: /İzin verilen simülasyon URL/i,
      fallback: [
        'label.ms-Label:contains("İzin verilen simülasyon URL")',
        'input[aria-label="URL picker"]',
        'input.ms-BasePicker-input'
      ]
    },
    tooltip: 'Simülasyon URL\'lerini girin',
    autoClick: false,
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
    tooltip: 'Kaydet butonuna tıklayın',
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
    title: 'Anti-Spam Politikalarına Git',
    description: 'Anti-Spam politikalarına gitmek için "Sayfaya Git" butonuna tıklayın',
    navigate: 'https://security.microsoft.com/antispam',
    validation: () => true,
    isNavigation: true
  },
  {
    id: 2,
    name: 'antispam_step2_select_checkbox',
    title: 'Connection Filter Policy Checkbox',
    description: 'Connection Filter Policy satırının checkbox\'ını seçin',
    target: {
      selector: 'div.ms-DetailsRow-cellCheck div[role="radio"][data-automationid="DetailsRowCheck"][aria-checked="false"]',
      fallback: [
        'div.ms-DetailsRow-cellCheck div[role="radio"][data-automationid="DetailsRowCheck"]',
        'div.checkCell-938 div[data-automationid="DetailsRowCheck"]',
        'div.ms-Check-checkHost:nth-of-type(2)',
        'div[data-automationid="DetailsRowCheck"]:not([aria-checked="true"]):first-of-type'
      ]
    },
    tooltip: 'Connection Filter Policy checkbox\'ını seçin',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'antispam_step3_click_row',
    title: 'Connection Filter Policy',
    description: 'Connection filter policy (Varsayılan) satırına tıklayın',
    target: {
      selector: 'span.scc-list-first-column',
      textMatch: /Connection filter policy/i,
      fallback: [
        'div[data-automationid="DetailsRowCell"] span.scc-list-first-column',
        'span.scc-list-first-column',
        'div.ms-DetailsRow-cell span'
      ]
    },
    tooltip: 'Connection filter policy\'ye tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'antispam_step4_edit_button',
    title: 'Edit Connection Filter',
    description: 'Edit connection filter policy butonuna tıklayın',
    target: {
      selector: 'button[aria-label="Edit connection filter policy"]',
      textMatch: /Edit connection filter/i,
      fallback: [
        'button[aria-label*="Edit connection"]',
        'button.ms-Link[aria-label*="Edit"]'
      ]
    },
    tooltip: 'Edit connection filter policy\'ye tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 5,
    name: 'antispam_step5_add_ips',
    title: 'IP Adresleri Ekle',
    description: 'IP adreslerini "Always allow messages from the following IP addresses" kısmına ekleyin (Her IP yeni satıra)',
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
    tooltip: 'IP adreslerini girin (Her satıra bir IP)',
    autoClick: false,
    validation: () => true,
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 500,
    isLabelStep: true  // Bu step label içeriyor, input'u bul
  },
  {
    id: 6,
    name: 'antispam_step6_safe_list',
    title: 'Turn on Safe List',
    description: '"Turn on safe list" checkbox\'ını işaretleyin',
    target: {
      selector: 'label.ms-Checkbox-label[for*="checkbox"]',
      textMatch: /Turn on safe list/i,
      fallback: [
        'input[type="checkbox"]',
        '.ms-Checkbox-label',
        '.ms-Checkbox input'
      ]
    },
    tooltip: 'Turn on safe list checkbox\'ını işaretleyin',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'antispam_step7_save',
    title: 'Kaydet',
    description: 'Save (Kaydet) butonuna tıklayarak işlemi tamamlayın',
    target: {
      selector: 'span.ms-Button-label:contains("Kaydet"), span.ms-Button-label:contains("Save")',
      textMatch: /Kaydet|Save/i,
      fallback: [
        'button[aria-label*="Save"]',
        'button.ms-Button--primary',
        'span.ms-Button-label'
      ]
    },
    tooltip: 'Kaydet butonuna tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'antispam_summary',
    title: 'Tamamlandı! ✅',
    description: 'Anti-Spam yapılandırması başarıyla tamamlandı',
    isSummary: true
  }
]

/* ========== WORKFLOW 3: Safe Links ========== */
const SAFE_LINKS_STEPS = [
  {
    id: 1,
    name: 'safelinks_step1_navigate',
    title: 'Security Center',
    description: 'Microsoft Security & Compliance Center\'a gidin',
    navigate: 'https://security.microsoft.com/threatpolicy',
    validation: () => true
  },
  {
    id: 2,
    name: 'safelinks_step2_email_collab',
    title: 'E-posta ve İşbirliği',
    description: 'Email & Collaboration sekmesini açın',
    target: {
      selector: 'button[aria-label*="E-posta"]',
      fallback: [
        'button[aria-label*="Email"]',
        'button[data-icon-name="Mail"]'
      ]
    },
    tooltip: 'E-posta ve işbirliği\'ne tıklayın',
    autoClick: true,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'safelinks_step3_policies',
    title: 'Policies & Rules',
    description: 'Policies and rules > Threat Policies kısmına gidin',
    target: {
      selector: 'a[href*="threatpolicy"]',
      textMatch: /Threat policies/i,
      fallback: [
        'a[href*="policy"]'
      ]
    },
    tooltip: 'Threat Policies\'e tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'safelinks_step4_safe_links',
    title: 'Safe Links',
    description: 'Safe Links\'e tıklayın. Eğer Safe Links görünmüyorsa, Microsoft Defender for Office 365 lisansı eksik olabilir.',
    target: {
      selector: 'a:contains("Safe Links")',
      textMatch: /Safe Links/i,
      fallback: [
        'a[href*="safelinks"]',
        'button:contains("Safe Links")'
      ]
    },
    tooltip: 'Safe Links\'e tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    licenseCheck: {
      required: 'Microsoft Defender for Office 365',
      message: 'Safe Links özelliği yalnızca şu lisanslarda aktif hale gelir:\n\n• Microsoft Defender for Office 365 Plan 1\n• Microsoft Defender for Office 365 Plan 2\n• Microsoft 365 E5 / A5 / G5 (bu planlarda Defender for Office 365 dahil)\n\nBu lisanslardan biri yoksa Safe Links görünmeyecektir.',
      skipMessage: 'Safe Links bulunamadı. Lisans eksikliği nedeniyle bu adım atlanıyor ve diğer adımlara geçiliyor.'
    }
  },
  {
    id: 5,
    name: 'safelinks_step5_create',
    title: 'Create Butonu',
    description: 'Create butonuna tıklayın',
    target: {
      selector: 'button:contains("Create")',
      textMatch: /Create/i,
      fallback: [
        'button[aria-label*="Create"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'Create butonuna tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 6,
    name: 'safelinks_step6_name',
    title: 'İsim ve Açıklama',
    description: 'Bir isim ve açıklama ekleyin',
    target: {
      selector: 'input[placeholder*="name"], input[aria-label*="Name"]',
      fallback: [
        'input[type="text"]',
        'textarea'
      ]
    },
    tooltip: 'İsim girin',
    autoClick: false,
    validation: () => true,
    realTimeValidation: true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'safelinks_step7_next1',
    title: 'Next (1)',
    description: 'Next butonuna tıklayın',
    target: {
      selector: 'button:contains("Next")',
      textMatch: /Next/i,
      fallback: [
        'button[aria-label*="Next"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'Next butonuna tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'safelinks_step8_domain',
    title: 'Domain Ekle',
    description: 'Şirket domaininizi ekleyin',
    target: {
      selector: 'input[aria-label*="domain"]',
      fallback: [
        'input.ms-BasePicker-input',
        'input[type="text"]'
      ]
    },
    tooltip: 'Domain ekleyin',
    autoClick: false,
    validation: () => true,
    realTimeValidation: true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'safelinks_step9_next2',
    title: 'Next (2)',
    description: 'Next butonuna tıklayın',
    target: {
      selector: 'button:contains("Next")',
      textMatch: /Next/i,
      fallback: [
        'button[aria-label*="Next"]'
      ]
    },
    tooltip: 'Next\'e tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 9,
    name: 'safelinks_step10_deselect_options',
    title: 'Seçenekleri Kaldır',
    description: '"Track user clicks" ve "Office 365 Apps" seçeneklerini deselect edin',
    target: {
      selector: 'input[type="checkbox"][aria-label*="Track"]',
      fallback: [
        'input[type="checkbox"]'
      ]
    },
    tooltip: 'Track user clicks seçeneğini kaldırın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'safelinks_step11_add_urls',
    title: 'Phishing Domain Ekle',
    description: 'Do not rewrite the following URLs kısmına *.domain.com/* formatında ekleyin',
    target: {
      selector: 'textarea[aria-label*="URL"], input[aria-label*="URL"]',
      fallback: [
        'textarea',
        'input.ms-BasePicker-input'
      ]
    },
    tooltip: 'Phishing domainlerini ekleyin',
    autoClick: false,
    validation: () => true,
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 500
  },
  {
    id: 11,
    name: 'safelinks_step12_next3',
    title: 'Next (3)',
    description: 'Next butonuna tıklayın',
    target: {
      selector: 'button:contains("Next")',
      textMatch: /Next/i,
      fallback: [
        'button[aria-label*="Next"]'
      ]
    },
    tooltip: 'Next\'e tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'safelinks_step13_submit',
    title: 'Submit',
    description: 'Submit diyerek işlemi tamamlayın',
    target: {
      selector: 'button:contains("Submit")',
      textMatch: /Submit/i,
      fallback: [
        'button[aria-label*="Submit"]',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'Submit butonuna tıklayın',
    autoClick: false,
    validation: () => true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 14,
    name: 'safelinks_summary',
    title: 'Tamamlandı! ✅',
    description: 'Safe Links yapılandırması tamamlandı. Birkaç saat içinde etkili olacaktır.',
    isSummary: true
  }
]

/* ========== WORKFLOW 4: Spam Filter Bypass ========== */
const SPAM_FILTER_BYPASS_STEPS = [
  {
    id: 1,
    name: 'spambypass_step1_info',
    title: 'Başlangıç Bilgisi',
    description: 'Spam Filter Bypass adımı başlıyor. Lütfen aşağıdaki önemli uyarıları okuyunuz.',
    isInfoCard: true,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    waitAfterClick: 0
  },
  {
    id: 2,
    name: 'spambypass_step2_navigate',
    title: 'Exchange Admin Center',
    description: 'Exchange Admin Center Transport Rules sayfasına git.',
    navigate: 'https://admin.exchange.microsoft.com/#/transportrules',
    isNavigation: true,
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
    title: 'Add a rule',
    description: '2) Add a rule\'a tıklayın.',
    target: {
      selector: 'button[aria-label*="Add"]',
      textMatch: /Add a rule/i,
      fallback: [
        'button[name*="Add"]',
        'button:contains("Add a rule")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: '+ Add a rule butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'spambypass_step4_create_rule',
    title: 'Create a new rule',
    description: '3) Create a new rule seçeneğini seçin.',
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
    tooltip: 'Create a new rule seçeneğini seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 5,
    name: 'spambypass_step5_rule_name',
    title: 'Name',
    description: '4) Kural adı girin (ör. \'Keepnet Whitelist Rule\').',
    target: {
      selector: 'input[data-automation-id="EditTransportRule_Name_TextField"]',
      fallback: [
        'div.ms-TextField-fieldGroup input[type="text"]',
        'input[maxlength="64"]',
        'input[aria-labelledby*="TextFieldLabel"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Kural adını girin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    waitAfterClick: 1000,
    panelPosition: 'top-left',
    criticalStep: true
  },
  {
    id: 6,
    name: 'spambypass_step6_apply_rule_if',
    title: 'Apply this rule if',
    description: '5) Apply this rule if dropdown\'ını açın.',
    target: {
      selector: 'div[data-automation-id="EditTransportRule_GroupCondition_0_Dropdown"]',
      fallback: [
        'div[role="combobox"][aria-label*="Select a group condition"]',
        'div.ms-Dropdown',
        'span.ms-Dropdown-title:contains("Select one")'
      ]
    },
    tooltip: 'Apply this rule if dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'spambypass_step7_select_sender',
    title: 'The Sender',
    description: '6) \'The sender\' seçeneğini seçin.',
    target: {
      selector: 'button[data-index="1"]',
      textMatch: /The sender/i,
      fallback: [
        'button[role="option"]:contains("The sender")',
        'div[role="option"]:contains("The sender")',
        'span.ms-Dropdown-optionText:contains("The sender")'
      ]
    },
    tooltip: '"The sender" seçeneğini seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    criticalStep: false,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'spambypass_step8_ip_address_condition',
    title: 'IP Address Condition',
    description: '7) "Select one" dropdown\'ını açın ve "IP address is in any of these ranges or exactly matches" seçeneğini seçin.',
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
    tooltip: 'IP condition için dropdown\'ı açın ve IP address ranges seçeneğini seçin',
    autoClick: true,
    hideCopyButton: true,
    hideIPList: true,
    autoAdvance: true,
    autoAdvanceDelay: 4000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 9,
    name: 'spambypass_step9_enter_ip',
    title: 'IP Adreslerini Girin',
    description: '9) IP adreslerini girin: ',
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
    tooltip: 'IP adreslerini manuel olarak girin (Her satıra bir IP) ve save butonuna tıklayınız',
    autoClick: false,
    manualStep: true,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
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
    title: 'Do The Following',
    description: '10) "Do the following" dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown327-option',
      textMatch: /Select one/i,
      fallback: [
        'span[id*="Dropdown327"].ms-Dropdown-title',
        'span.ms-Dropdown-title:contains("Select one")',
        'button[aria-label*="Do the following"]'
      ]
    },
    tooltip: 'Do the following dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 11,
    name: 'spambypass_step11_modify_message_properties',
    title: 'Modify Message Properties',
    description: '11) "Modify the message properties" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-780',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("Modify the message properties")',
        'div[role="option"]:contains("Modify the message properties")'
      ]
    },
    tooltip: 'Modify the message properties seçeneğini seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    criticalStep: false,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 12,
    name: 'spambypass_step12_select_one_scd',
    title: 'Select One (SCL)',
    description: '12) "Select one" dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown706-option.ms-Dropdown-title',
      textMatch: /Select one/i,
      fallback: [
        'span#Dropdown706-option',
        'span.ms-Dropdown-titleIsPlaceHolder:contains("Select one")'
      ]
    },
    tooltip: 'Select one dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    criticalStep: false,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'spambypass_step13_set_scl',
    title: 'Set SCL',
    description: '13) "set the spam confidence level (SCL)" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-706',
      textMatch: /set the spam confidence level/i,
      fallback: [
        'span:contains("set the spam confidence level (SCL)")',
        'span.ms-Dropdown-optionText:contains("spam confidence level")',
        'span#Dropdown706-option'
      ]
    },
    tooltip: 'Set the spam confidence level (SCL) seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    criticalStep: false,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 14,
    name: 'spambypass_step14_bypass_spam_filtering',
    title: 'Bypass Spam Filtering',
    description: '14) "Bypass spam filtering" seçeneğini seçin.',
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
    tooltip: 'Bypass spam filtering seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    criticalStep: false,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 15,
    name: 'spambypass_step15_save_first_rule',
    title: 'Save',
    description: '15) Save butonuna tıklayın.',
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
    tooltip: 'Save butonuna tıklayın',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 16,
    name: 'spambypass_step16_add_new_rule',
    title: 'Yeni Kural Ekle',
    description: '16) "Do the following" alanının yanındaki + (artı) butonuna tıklayın.',
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
    tooltip: '+ (Add action) butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
    {
      id: 17,
      name: 'spambypass_step17_modify_message_properties2',
      title: 'Modify Message Properties (2. Kez)',
      description: '17) "Select one" dropdown\'ını açın ve "Modify the message properties" seçeneğini seçin.',
      target: {
        selector: 'span#Dropdown470-option',
        textMatch: /Select one/i,  // BURADA DEĞİŞİKLİK: Buton metni "Select one"
        fallback: [
          'span.ms-Dropdown-title.title-725:contains("Select one")',
          'span.ms-Dropdown-title:contains("Select one")',
          'span[id*="Dropdown470"]:contains("Select one")'
        ]
      },
      tooltip: '"Select one" dropdown\'ını açın',
      autoClick: true,
      autoAdvance: true,
      autoAdvanceDelay: 5000,
      validation: () => true,
      realTimeValidation: true,
      realTimeValidationInterval: 100,
      criticalStep: false,
      waitAfterClick: 1000,
      panelPosition: 'bottom-left'
    },
  {
    id: 18,
    name: 'spambypass_step18_set_message_header',
    title: 'Set Message Header',
    description: '18) "Select one" dropdown\'ından "set a message header" seçeneğini seçin.',
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
    tooltip: 'Set a message header seçin',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    criticalStep: false,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 19,
    name: 'spambypass_step19_enter_text_button',
    title: 'Enter Text',
    description: '19) "Enter text" butonuna tıklayın.',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_1_0"]',
      fallback: [
        'button.ms-Link.root-746:contains("Enter text")',
        'button:contains("Enter text")',
        'button[role="button"]:contains("Enter text")'
      ]
    },
    tooltip: 'Enter text butonuna tıklayın',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    criticalStep: false,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 20,
    name: 'spambypass_step24_enter_bypass_clutter',
    title: 'BypassClutter Header',
    description: '20) Header name alanına "X-MS-Exchange-Organization-BypassClutter" girin.',
    target: {
      selector: 'input#TextField930[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input.ms-TextField-field.field-681',
        'input[data-automation-id="SetHeader_TextField"]',
        'input[placeholder*="header"]'
      ]
    },
    tooltip: 'X-MS-Exchange-Organization-BypassClutter girin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    manualStep: true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    validation: () => true,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 21,
    name: 'spambypass_step25_enter_header_value',
    title: 'Header Value',
    description: '21) Header value alanına "true" girin.',
    target: {
      selector: 'input[placeholder*="value"]',
      fallback: [
        'input[aria-label*="value"]',
        'input.ms-TextField-field:last-of-type'
      ]
    },
    tooltip: 'Header value olarak "true" girin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    manualStep: true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    validation: () => true,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 22,
    name: 'spambypass_step26_save_final',
    title: 'Final Save',
    description: '22) Save butonuna tıklayarak tüm kuralları kaydedin.',
    target: {
      selector: 'span.ms-Button-label.label-722#id__935',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'span:contains("Save")',
        'span.ms-Button-label:contains("Save")',
        'button:contains("Save")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'Tüm kuralları kaydedin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 23,
    name: 'spambypass_summary',
    title: 'Tamamlandı! ✅',
    description: 'Spam Filter Bypass kuralı başarıyla oluşturuldu. Kuralın durumunun enabled olduğundan emin olun.',
    isSummary: true
  }
]

/* ========== WORKFLOW 5: ATP Link Bypass (SkipSafeLinksProcessing) ========== */
const ATP_LINK_BYPASS_STEPS = [
  {
    id: 1,
    name: 'atplink_step1_info',
    title: 'Başlangıç Bilgisi',
    description: 'ATP Link Bypass adımı başlıyor. Lütfen aşağıdaki önemli uyarıları okuyunuz.',
    isInfoCard: true,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    waitAfterClick: 0
  },
  {
    id: 2,
    name: 'atplink_step2_add_rule',
    title: 'Add a rule',
    description: '1) Add a rule butonuna tıklayın.',
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
    tooltip: 'Add a rule butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'atplink_step3_create_rule',
    title: 'Create a new rule',
    description: '2) Create a new rule seçeneğini seçin.',
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
    tooltip: 'Create a new rule seçeneğini seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'atplink_step4_rule_name',
    title: 'Kural Adı',
    description: '3) Kural adı girin (ör. \'ATP Link Bypass Rule\').',
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
    tooltip: 'Kural adını girin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    waitAfterClick: 1000,
    panelPosition: 'top-left',
    criticalStep: true
  },
  {
    id: 5,
    name: 'atplink_step5_apply_rule_if',
    title: 'Apply this rule if',
    description: '4) "Apply this rule if..." dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown243-option',
      fallback: [
        'span.ms-Dropdown-title.title-726:contains("Select one")',
        'span.ms-Dropdown-title:contains("Select one")',
        'div[data-automation-id="EditTransportRule_GroupCondition_0_Dropdown"]'
      ]
    },
    tooltip: 'Apply this rule if dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 6,
    name: 'atplink_step6_select_sender',
    title: 'The Sender',
    description: '5) "The sender" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /The sender/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("The sender")',
        'div[role="option"]:contains("The sender")'
      ]
    },
    tooltip: 'The sender seçeneğini seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'atplink_step7_ip_address_condition',
    title: 'IP Address Condition',
    description: '6) "Select one" dropdown\'ını açın ve "IP address is in any of these ranges or exactly matches" seçeneğini seçin.',
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
    tooltip: 'IP condition için dropdown\'ı açın ve IP address ranges seçeneğini seçin',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'atplink_step8_ip_addresses',
    title: 'IP Adresleri',
    description: '7) IP adreslerini girin ve save butonuna tıklayınız. (149.72.161.59, 149.72.42.201, 149.72.154.87).',
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
    tooltip: 'IP adreslerini girin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
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
    title: 'Do The Following',
    description: '10) "Select one" dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown327-option',
      textMatch: /Select one/i,  // BURADA DEĞİŞİKLİK: Buton metni "Select one"
      fallback: [
        'span[id*="Dropdown327"].ms-Dropdown-title',
        'span.ms-Dropdown-title:contains("Select one")',
        'button[aria-label*="Do the following"]'
      ]
    },
    tooltip: '"Select one" dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'atplink_step11_modify_message_properties',
    title: 'Modify Message Properties',
    description: '10) "Modify the message properties" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("Modify the message properties")',
        'div[role="option"]:contains("Modify the message properties")'
      ]
    },
    tooltip: 'Modify the message properties seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 11,
    name: 'atplink_step12_select_one',
    title: 'Select one',
    description: '11) "Select one" dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown249-option',
      fallback: [
        'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder.title-745:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ]
    },
    tooltip: 'Select one dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 12,
    name: 'atplink_step13_set_message_header',
    title: 'Set a message header',
    description: '12) "Set a message header" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /set a message header/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("set a message header")',
        'span.ms-Dropdown-optionText:contains("Set a message header")',
        'div[role="option"]:contains("message header")'
      ]
    },
    tooltip: 'Set a message header seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'atplink_step14_enter_text_first',
    title: 'Enter text (1. Kez)',
    description: '13) İlk "Enter text" butonuna tıklayın.',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_0"]',
      fallback: [
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'İlk Enter text butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 14,
    name: 'atplink_step15_header_name',
    title: 'Header Name',
    description: '14) Header adı alanına "X-MS-Exchange-Organization-SkipSafeLinksProcessing" yazın.',
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1391',
        'input[type="text"][placeholder*="header"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Header adını girin: X-MS-Exchange-Organization-SkipSafeLinksProcessing',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
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
    title: 'Enter text (2. Kez)',
    description: '15) İkinci "Enter text" butonuna tıklayın.',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_1"]',
      fallback: [
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'İkinci Enter text butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 16,
    name: 'atplink_step17_header_value',
    title: 'Header Value',
    description: '16) Header değeri alanına "1" yazın.',
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1444',
        'input[type="text"][placeholder*="value"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Header değerini girin: 1',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'top-left'
  },
  {
    id: 17,
    name: 'atplink_step18_save_final',
    title: 'Save (Final)',
    description: '17) Save butonuna tıklayarak kuralı kaydedin.',
    target: {
      selector: 'span.ms-Button-label.label-723#id__790',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'span:contains("Save")',
        'span.ms-Button-label:contains("Save")',
        'button:contains("Save")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'Save butonuna tıklayın',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 18,
    name: 'atplink_summary',
    title: 'ATP Link Bypass Tamamlandı! ✅',
    description: 'ATP Link Bypass kuralı başarıyla oluşturuldu. Şimdi Workflow 6\'ya (ATP Attachment Bypass) geçiliyor...',
    isSummary: true
  }
  
]

/* ========== WORKFLOW 6: ATP Attachment Bypass (SkipSafeAttachmentProcessing) ========== */
const ATP_ATTACHMENT_BYPASS_STEPS = [
  {
    id: 1,
    name: 'atpattach_step1_info',
    title: 'Başlangıç Bilgisi',
    description: 'ATP Attachment Bypass adımı başlıyor. Lütfen aşağıdaki önemli uyarıları okuyunuz.',
    isInfoCard: true,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    waitAfterClick: 0
  },
  {
    id: 2,
    name: 'atpattach_step2_add_rule',
    title: 'Add a rule',
    description: '1) Add a rule butonuna tıklayın.',
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
    tooltip: 'Add a rule butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 3,
    name: 'atpattach_step3_create_rule',
    title: 'Create a new rule',
    description: '2) Create a new rule seçeneğini seçin.',
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
    tooltip: 'Create a new rule seçeneğini seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 4,
    name: 'atpattach_step4_rule_name',
    title: 'Kural Adı',
    description: '3) Kural adı girin (ör. \'ATP Attachment Bypass Rule\').',
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
    tooltip: 'Kural adını girin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    waitAfterClick: 1000,
    panelPosition: 'top-left',
    criticalStep: true
  },
  {
    id: 5,
    name: 'atpattach_step5_apply_rule_if',
    title: 'Apply this rule if',
    description: '4) "Apply this rule if..." dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown243-option',
      fallback: [
        'span.ms-Dropdown-title.title-726:contains("Select one")',
        'span.ms-Dropdown-title:contains("Select one")',
        'div[data-automation-id="EditTransportRule_GroupCondition_0_Dropdown"]'
      ]
    },
    tooltip: 'Apply this rule if dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 6,
    name: 'atpattach_step6_select_sender',
    title: 'The Sender',
    description: '5) "The sender" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /The sender/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("The sender")',
        'div[role="option"]:contains("The sender")'
      ]
    },
    tooltip: 'The sender seçeneğini seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 7,
    name: 'atpattach_step7_ip_address_condition',
    title: 'IP Address Condition',
    description: '6) "Select one" dropdown\'ını açın ve "IP address is in any of these ranges or exactly matches" seçeneğini seçin.',
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
    tooltip: 'IP condition için dropdown\'ı açın ve IP address ranges seçeneğini seçin',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 8,
    name: 'atpattach_step8_ip_addresses',
    title: 'IP Adresleri',
    description: '7) IP adreslerini girin (149.72.161.59, 149.72.42.201, 149.72.154.87).',
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
    tooltip: 'IP adreslerini girin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
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
    title: 'Do the following',
    description: '9) "Do the following" dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown248-option',
      fallback: [
        'span.ms-Dropdown-title.title-726:contains("Select one")',
        'span.ms-Dropdown-title:contains("Select one")',
        'div[data-automation-id*="Action"]'
      ]
    },
    tooltip: 'Do the following dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 10,
    name: 'atpattach_step10_modify_message_properties',
    title: 'Modify Message Properties',
    description: '10) "Modify the message properties" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("Modify the message properties")',
        'div[role="option"]:contains("Modify the message properties")'
      ]
    },
    tooltip: 'Modify the message properties seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 12,
    name: 'atpattach_step12_select_one',
    title: 'Select one',
    description: '11) "Select one" dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown249-option',
      fallback: [
        'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder.title-745:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ]
    },
    tooltip: 'Select one dropdown\'ını açın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 13,
    name: 'atpattach_step13_set_message_header',
    title: 'Set a message header',
    description: '12) "Set a message header" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-707',
      textMatch: /set a message header/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("set a message header")',
        'span.ms-Dropdown-optionText:contains("Set a message header")',
        'div[role="option"]:contains("message header")'
      ]
    },
    tooltip: 'Set a message header seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 14,
    name: 'atpattach_step14_enter_text_first',
    title: 'Enter text (1. Kez)',
    description: '13) İlk "Enter text" butonuna tıklayın.',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_0"]',
      fallback: [
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'İlk Enter text butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 15,
    name: 'atpattach_step15_header_name',
    title: 'Header Name',
    description: '14) Header adı alanına "X-MS-Exchange-Organization-SkipSafeAttachmentProcessing" yazın.',
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1391',
        'input[type="text"][placeholder*="header"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Header adını girin: X-MS-Exchange-Organization-SkipSafeAttachmentProcessing',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
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
    title: 'Enter text (2. Kez)',
    description: '15) İkinci "Enter text" butonuna tıklayın.',
    target: {
      selector: 'button[data-automation-id="Link_SetHeader_1_0_1"]',
      fallback: [
        'button.ms-Link.root-748:contains("Enter text")',
        'button:contains("Enter text")'
      ]
    },
    tooltip: 'İkinci Enter text butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 1000,
    panelPosition: 'bottom-left'
  },
  {
    id: 17,
    name: 'atpattach_step17_header_value',
    title: 'Header Value',
    description: '16) Header değeri alanına "1" yazın.',
    target: {
      selector: 'input[data-automation-id="SetHeader_TextField"]',
      fallback: [
        'input#TextField1444',
        'input[type="text"][placeholder*="value"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Header değerini girin: 1',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 1000,
    criticalStep: true,
    waitAfterClick: 1000,
    panelPosition: 'top-left'
  },
  {
    id: 18,
    name: 'atpattach_step18_save_final',
    title: 'Save (Final)',
    description: '17) Save butonuna tıklayarak kuralı kaydedin.',
    target: {
      selector: 'span.ms-Button-label.label-723#id__790',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'span:contains("Save")',
        'span.ms-Button-label:contains("Save")',
        'button:contains("Save")',
        'button.ms-Button--primary'
      ]
    },
    tooltip: 'Save butonuna tıklayın',
    autoClick: true,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => true,
    realTimeValidation: true,
    realTimeValidationInterval: 100,
    waitAfterClick: 2000,
    panelPosition: 'bottom-left'
  },
  {
    id: 19,
    name: 'atpattach_summary',
    title: '🎊 Tebrikler! Tüm Adımlar Bitti!',
    description: 'Tüm workflow\'lar başarıyla tamamlandı! Office 365 ortamında IP adreslerini beyaz listeye aldınız ve güvenlik simülasyonları, spam filtreleme, ATP Link ve ATP Attachment özelliklerini başarıyla yapılandırdınız!',
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
      
      // Text match ile filtrele
      for (const el of candidates) {
        const text = el.textContent || el.innerText || ''
        if (regex.test(text) && this.isVisible(el)) {
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
  
  isVisible(el) {
    if (!el) return false
    return !!(el.offsetWidth && el.offsetHeight && el.offsetParent)
  },
  
  scrollToElement(el) {
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/* ========== SCREENSHOT MANAGER ========== */
class ScreenshotManager {
  constructor() {
    this.screenshots = {}
  }
  
  async init() {
    this.screenshots = await Storage.get(STORAGE_KEYS.SCREENSHOTS) || {}
  }
  
  async capture(stepName) {
    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'captureScreenshot',
          stepName: stepName
        }, (response) => {
          resolve(response?.dataUrl || null)
        })
      })
    } catch (error) {
      console.error("[Keepnet] Screenshot error:", error)
      return null
    }
  }
  
  async save(stepName, dataUrl, validationResult = {}) {
    this.screenshots[stepName] = {
      dataUrl,
      timestamp: new Date().toISOString(),
      validation: validationResult
    }
    
    await Storage.set(STORAGE_KEYS.SCREENSHOTS, this.screenshots)
    console.log(`[Keepnet] Screenshot saved: ${stepName}.png`)
  }
  
  getAll() {
    return this.screenshots
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
      clearInterval(this.countdown)
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
    this.position = { x: 20, y: window.innerHeight - PANEL_SIZE.height - 20 } // SOL-ALT
    
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
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
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
      border-radius: 20px 20px 0 0;
      position: relative;
      overflow: hidden;
    `
    
    this.header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #1a1a2e 0%, #4a9eff 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">K</div>
        <div>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 2px;">${i18n('assistantTitle')}</div>
          <div style="font-size: 11px; opacity: 0.8;" id="keepnet-step-indicator">Enterprise Security Configuration</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <select id="keepnet-language-selector" style="
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          <option value="tr">🇹🇷 TR</option>
          <option value="en">🇬🇧 EN</option>
          <option value="de">🇩🇪 DE</option>
        </select>
        <button id="keepnet-close-btn" style="
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
        " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">×</button>
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
  }
  
  attachEventListeners() {
    // Dragging
    this.header.addEventListener('mousedown', (e) => {
      if (e.target.id === 'keepnet-close-btn') return
      this.isDragging = true
      this.dragOffset = {
        x: e.clientX - this.position.x,
        y: e.clientY - this.position.y
      }
    })
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return
      
      this.position = {
        x: e.clientX - this.dragOffset.x,
        y: e.clientY - this.dragOffset.y
      }
      
      this.updatePosition()
    })
    
    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false
        this.saveState()
      }
    })
    
    // Close button
    const closeBtn = document.getElementById('keepnet-close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log("[Keepnet] Close button clicked")
        this.container.style.display = 'none'
      })
    }
    
    // Language selector
    const langSelector = document.getElementById('keepnet-language-selector')
    if (langSelector) {
      // Load current language from storage
      chrome.storage.local.get(['keepnet_language'], (result) => {
        const currentLang = result.keepnet_language || 'tr'
        langSelector.value = currentLang
        console.log("[Keepnet] Current language loaded:", currentLang)
      })
      
      langSelector.addEventListener('change', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const selectedLang = e.target.value
        console.log("[Keepnet] Language changed to:", selectedLang)
        
        try {
          // Save selected language to storage
          await chrome.storage.local.set({ keepnet_language: selectedLang })
          console.log("[Keepnet] Language saved to storage:", selectedLang)
          
          // Show loading indicator
          langSelector.style.opacity = '0.6'
          langSelector.style.pointerEvents = 'none'
          
          // Reload page after short delay
          setTimeout(() => {
            console.log("[Keepnet] Reloading page for language change")
            location.reload()
          }, 300)
          
        } catch (error) {
          console.error("[Keepnet] Error saving language:", error)
          langSelector.style.opacity = '1'
          langSelector.style.pointerEvents = 'auto'
        }
      })
    }
  }
  
  updatePosition() {
    if (this.container) {
      this.container.style.left = `${this.position.x}px`
      this.container.style.top = `${this.position.y}px`
    }
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
    const keepnetPanel = document.getElementById('keepnet-panel')
    if (!keepnetPanel) return

    // Panel içindeki tıklamalarda balonlamayı durdurarak sadece panel içi davranışları koru
    keepnetPanel.addEventListener('click', (e) => {
      e.stopPropagation()
    })

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
      
      .keepnet-highlight {
        outline: 3px solid #4a9eff !important;
        outline-offset: 3px !important;
        background-color: rgba(74, 158, 255, 0.08) !important;
        box-shadow: 
          0 0 0 8px rgba(74, 158, 255, 0.2),
          0 0 30px rgba(74, 158, 255, 0.3),
          inset 0 0 20px rgba(74, 158, 255, 0.05) !important;
        position: relative !important;
        z-index: 999998 !important;
        animation: keepnet-pulse 2s ease-in-out infinite !important;
        cursor: pointer !important;
        transform: scale(1.01) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border-radius: 8px !important;
      }
      
      @keyframes keepnet-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
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
  }
  
  async init() {
    try {
      console.log("[Keepnet] Initializing assistant...")
      
      // Load language preferences first
      await loadLanguagePreference()
      console.log("[Keepnet] Language loaded:", CURRENT_LANGUAGE)
      
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
      
      this.autoClick = new AutoClickEngine()
      
      this.screenshots = new ScreenshotManager()
      await this.screenshots.init()
      
      // Attach button handlers
      this.attachButtonHandlers()
      
      // Global fonksiyonları tanımla (summary ekranı için)
      this.setupGlobalFunctions()
      
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
    // setTimeout ile bekle ki DOM hazır olsun
    setTimeout(() => {
      const nextBtn = document.getElementById('keepnet-next-btn')
      const prevBtn = document.getElementById('keepnet-prev-btn')
      const summaryBtn = document.getElementById('keepnet-summary-btn')
      
      if (nextBtn) {
        nextBtn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          console.log("[Keepnet] Next button clicked")
          console.log("[Keepnet] Current workflow:", this.workflowName)
          
          // Workflow 4-6 için popup kapanma koruması
          const isWorkflow4To6 = ['WORKFLOW_4', 'WORKFLOW_5', 'WORKFLOW_6'].includes(this.workflowName)
          if (isWorkflow4To6) {
            console.log(`[Keepnet] Workflow ${this.workflowName} - preventing popup closure on next step`)
            
            // Log next button click (NOT a closure reason - just tracking)
            this.panel?.logPopupClosureReason('nextBtn', this.workflowName, {
              buttonId: 'keepnet-next-btn',
              currentStep: this.currentStep,
              totalSteps: this.currentWorkflow.length,
              note: 'Next button click - popup should NOT close'
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
          
          this.nextStep()
        }
      }
      
      if (prevBtn) {
        prevBtn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          console.log("[Keepnet] Prev button clicked")
          console.log("[Keepnet] Current workflow:", this.workflowName)
          
          // Workflow 4-6 için popup kapanma koruması
          const isWorkflow4To6 = ['WORKFLOW_4', 'WORKFLOW_5', 'WORKFLOW_6'].includes(this.workflowName)
          if (isWorkflow4To6) {
            console.log(`[Keepnet] Workflow ${this.workflowName} - preventing popup closure on prev step`)
            
            // Log prev button click (NOT a closure reason - just tracking)
            this.panel?.logPopupClosureReason('prevBtn', this.workflowName, {
              buttonId: 'keepnet-prev-btn',
              currentStep: this.currentStep,
              totalSteps: this.currentWorkflow.length,
              note: 'Previous button click - popup should NOT close'
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
          
          this.prevStep()
        }
      }
      
      if (summaryBtn) {
        summaryBtn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log("[Keepnet] Summary button clicked - jumping to summary")
          this.showSummary()
        }
      }
      
      // Language selector handler
      const langSelector = document.getElementById('keepnet-language-selector')
      if (langSelector) {
        langSelector.value = CURRENT_LANGUAGE
        langSelector.onchange = async (e) => {
          const newLang = e.target.value
          console.log('[Keepnet] Language selector changed to:', newLang)
          await changeLanguage(newLang)
          // Re-render current step with new language
          if (this.currentStep > 0) {
            await this.executeStep(this.currentStep)
          }
        }
        console.log('[Keepnet] Language selector handler attached')
      }
      
      console.log("[Keepnet] Button handlers attached")
    }, 100)
  }
  
  async executeStep(stepNum, customSteps = null) {
    try {
      console.log(`[Keepnet] 📍 executeStep called: step=${stepNum}, workflow=${this.workflowName}`)
      
      // Clear any existing auto-advance timer from previous step
      if (autoAdvanceTimer) {
        console.log('[Keepnet] Clearing previous auto-advance timer')
        clearTimeout(autoAdvanceTimer)
        autoAdvanceTimer = null
      }
      
      // Hangi steps array'ini kullanacağız?
      if (customSteps) {
        this.currentWorkflow = customSteps
        this.workflowName = customSteps === THREAT_POLICIES_STEPS ? 'WORKFLOW_2' : 
                           customSteps === SAFE_LINKS_STEPS ? 'WORKFLOW_3' : 'WORKFLOW_1'
        console.log(`[Keepnet] Switching to ${this.workflowName}`)
      }
      
      // Eğer ATP_ATTACHMENT_BYPASS_STEPS kullanılıyorsa, workflow ismini güncelle
      if (this.currentWorkflow === ATP_ATTACHMENT_BYPASS_STEPS && this.workflowName !== 'WORKFLOW_6') {
        console.log('[Keepnet] ⚠️ Detected ATP_ATTACHMENT_BYPASS_STEPS but workflow name mismatch, fixing...')
        this.workflowName = 'WORKFLOW_6'
      }
      
      const stepsArray = this.currentWorkflow
      const step = stepsArray[stepNum - 1]
      
      if (!step) {
        console.error("[Keepnet] Step not found:", stepNum)
        return
      }
      
      console.log(`[Keepnet] Executing step ${stepNum}: ${i18n(step.title)}`)
      
      this.currentStep = stepNum
      await Storage.set(STORAGE_KEYS.CURRENT_STEP, stepNum)
      
      // Update panel
      const totalSteps = stepsArray.length
      this.panel.updateProgress(stepNum, totalSteps)
      
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
      
      // Panel position control
      if (this.workflowName === 'WORKFLOW_4' && this.currentStep >= 3) {
        // Workflow 4'te step 3'ten 24'e kadar hep sol tarafta kal (step'lerin kendi panelPosition'ını override et)
        console.log(`[Keepnet] WORKFLOW_4 Panel Override: Step ${this.currentStep} - FORCED LEFT position`)
        this.panel.setPosition('bottom-left')
      } else if (this.workflowName === 'WORKFLOW_5' && this.currentStep >= 2) {
        // Workflow 5'te step 2'den itibaren hep sol tarafta kal
        console.log(`[Keepnet] WORKFLOW_5 Panel Override: Step ${this.currentStep} - FORCED LEFT position`)
        this.panel.setPosition('bottom-left')
      } else if (this.workflowName === 'WORKFLOW_6' && this.currentStep >= 2) {
        // Workflow 6'te step 2'den itibaren hep sol tarafta kal
        console.log(`[Keepnet] WORKFLOW_6 Panel Override: Step ${this.currentStep} - FORCED LEFT position`)
        this.panel.setPosition('bottom-left')
      } else if (step.panelPosition === 'top-left') {
        console.log(`[Keepnet] Step Panel Position: top-left`)
        this.panel.setPosition('top-left')
      } else if (step.panelPosition === 'left') {
        console.log(`[Keepnet] Step Panel Position: left`)
        this.panel.setPosition('bottom-left')
      } else {
        console.log(`[Keepnet] Default Panel Position: bottom-right`)
        this.panel.setPosition('bottom-right') // default
      }
      
      // Render step content
      this.renderStepContent(step)
      
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
      
      // Wait a bit for page to settle
      await Utils.sleep(500)
      
      // Find and highlight target
      if (step.target) {
        const element = Utils.findElement(step.target)
        
        if (element) {
          this.highlightElement(element, step.tooltip)
          
          // Auto-click?
          if (step.autoClick) {
            this.autoClick.start(element, AUTO_CLICK_TIMEOUT, async () => {
              await this.onElementClicked(step)
            }, this.workflowName)
          }
          
          // Manual click listener
          element.addEventListener('click', async () => {
            this.autoClick.stop()
            await this.onElementClicked(step)
          }, { once: true })
          
          // WORKFLOW 4-5-6 için 7 saniye sonra otomatik geçiş
          if ((this.workflowName === 'WORKFLOW_4' || this.workflowName === 'WORKFLOW_5' || this.workflowName === 'WORKFLOW_6') && !step.isSummary && !step.isInfoCard) {
            console.log(`[Keepnet] ${this.workflowName} Step ${step.id}: Starting 7-second auto-advance timer`)
            autoAdvanceTimer = setTimeout(async () => {
              console.log(`[Keepnet] ${this.workflowName} Step ${step.id}: 7 seconds elapsed, auto-advancing to next step`)
              // Clear any highlights
              this.clearHighlight()
              this.autoClick.stop()
              // Advance to next step
              await this.nextStep()
            }, 7000) // 7 seconds
          }
        } else {
          console.warn("[Keepnet] Element not found:", i18n(step.title))
          
          // Safe Links için özel lisans kontrolü
          if (step.name === 'safelinks_step4_safe_links' && step.licenseCheck) {
            console.log("[Keepnet] Safe Links not found - checking license requirement")
            this.panel.showError(`Safe Links Bulunamadı

${step.licenseCheck.message}

${step.licenseCheck.skipMessage}`)
            
            // 15 saniye Safe Links elementini bekle
            console.log("[Keepnet] Waiting 15 seconds for Safe Links element...")
            let safeLinksFound = false
            
            // 15 saniye boyunca Safe Links elementini kontrol et
            const checkInterval = setInterval(() => {
              const safeLinksElement = document.querySelector('a:contains("Safe Links"), a[href*="safelinks"], [aria-label*="Safe Links"]')
              if (safeLinksElement) {
                console.log("[Keepnet] Safe Links element found! Continuing with current step.")
                safeLinksFound = true
                clearInterval(checkInterval)
                // Element bulundu, normal akışa devam et
                this.highlightElement(safeLinksElement, step.tooltip)
                
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
          
          this.panel.showError(`${i18n('elementNotFound')}: ${i18n(step.title)}\n\nLütfen manuel olarak devam edin.`)
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
    let html = `
      <div class="keepnet-step-content">
        <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #FFFFFF;">
          ${i18n(step.title)}
        </h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #E2E8F0; line-height: 1.5;">
          ${i18n(step.description)}
        </p>
    `
    
    // Premium warning for workflow 4, 5, 6 - step 1
    const needsWarning = (step.id === 1) && 
                         (step.name === 'spambypass_step1_info' || 
                          step.name === 'atplink_step1_info' || 
                          step.name === 'atpattach_step1_info')
    
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
          <button id="keepnet-navigate-btn" data-url="${step.navigate}" style="
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
          " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 8px rgba(124, 58, 237, 0.5)'"
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(124, 58, 237, 0.3)'">
            ${i18n('goToPage')}
          </button>
        </div>
      `
    }
    
    // Step 1 Workflow 1 için eski buton (geriye dönük uyumluluk)
    if (step.id === 1 && step.name === 'step1_home') {
      html += `
        <div style="background: linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(45, 45, 74, 0.8)); border: 2px solid #4a9eff; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #4a9eff; margin-bottom: 8px;">
            Microsoft Security Center'a git
          </div>
          <button id="keepnet-go-to-security-btn" style="
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
          " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 8px rgba(124, 58, 237, 0.5)'"
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(124, 58, 237, 0.3)'">
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
            <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">ℹ</div>
            Bilgilendirme: Safe Links Özelliği için Gerekli Lisanslar
          </div>
          <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 13px; color: #374151; line-height: 1.5;">
              Safe Links özelliği yalnızca aşağıdaki lisanslarla aktif hale gelir:<br><br>
              • <strong>Microsoft Defender for Office 365 Plan 1</strong><br>
              • <strong>Microsoft Defender for Office 365 Plan 2</strong><br>
              • <strong>Microsoft 365 E5 / A5 / G5</strong> <br><br>
              Bu lisanslardan biri yoksa Safe Links özelliği görünmeyecektir.
            </div>
          </div>
          <div style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.15)); border: 2px solid #fb923c; border-radius: 8px; padding: 12px;">
            <div style="font-size: 12px; color: #ea580c; font-weight: 600; margin-bottom: 8px;">
              🔹 Safe Links görünmüyorsa:
            </div>
            <div style="font-size: 12px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">
              Bu adımı atlayabilir ve sonraki adımlara geçebilirsiniz.
            </div>
          </div>
        </div>
      `
    }
    
        // Simülasyon URL'leri için özel bölüm (Workflow 1 step 10) - Note: "Tümünü Kopyala" removed, moved to IP step
    if (step.id === 9 && step.name === 'step10_simulation_urls_input') {
      // Sadece bilgi göster, kopyalama butonu yok (IP adımına taşındı)
      html += `
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08)); border: 2px solid #10b981; border-radius: 12px; padding: 16px; margin-bottom: 16px;">                                               
          <div style="font-size: 14px; font-weight: 600; color: #047857; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">                   
            <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">S</div>                                                                   
            Simülasyon URL Bilgisi
          </div>
          <div style="font-size: 12px; color: #065f46; line-height: 1.5;">
            Bu adımda simülasyon URL'lerini elle girmeniz gerekmektedir.
          </div>
        </div>
      `
    }
    
        // Domain listesi için özel bölüm (Workflow 1 step 8)
    if (step.id === 7 && step.name === 'step8_domains_input') {
      const domains = [
        'signin-authzone.com', 'verifycloudaccess.com', 'akibadem.org', 'isdestek.org', 'gartnerpeer.com',                                                      
        'global-cloud-llc.com', 'cloudverification.online', 'accountaccesses.com', 'shoppingcenter.site',                                                       
        'hesapdogrulama.info', 'banksecure.info', 'meetingonline-us.com', 'digitalsecurelogin.co',                                                              
        'secureloginshop.net', 'encryptedconnections.info', 'trendyoll.club', 'kurumsalgiris.com',                                                              
        'yoursecuregateway.com', 'securemygateway.com', 'hadisendekatil.com', 'updatemyinformation.com',                                                        
        'secure-passchanges.com', 'swift-intel.com', 'hepsibureda.com', 'securely-logout.com',                                                                  
        'sigortacilarbirligi.com', 'btyardimmasasi.com', 'sirketiciduyuru.com', 'bilgilerimiguncelle.com',                                                      
        'securelogout.com', 'securelinked-in.com', 'theconnectionsuccess.com', 'sigortacilikhizmetleri.me',                                                     
        'securebankingservices.net', 'guvenlibankacilik.com', 'insurance-services.me', 'btservisleri.com',                                                      
        'secureloginonline.net', 'insan-kaynaklari.me', 'getaccess.store'
      ]
      
      html += `
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(29, 78, 216, 0.08)); border: 2px solid #3b82f6; border-radius: 12px; padding: 16px; margin-bottom: 16px;">                                               
          <div style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">                   
            <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">D</div>                                                                   
            Domain Listesi
          </div>
          <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px; max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0;">                                                                              
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 4px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 12px; color: #374151;">                     
              ${domains.map(domain => `<div style="padding: 2px 4px; background: #f8fafc; border-radius: 4px; border-left: 3px solid #3b82f6;">${domain}</div>`).join('')}                                                                      
            </div>
          </div>
          <button id="keepnet-copy-domains-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(59, 130, 246, 0.4)'"                                    
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)'">                                      
            ${i18n('copyAll')}
          </button>
        </div>
      `
    }
    
    // IP Adresleri için özel bölüm - Tümünü Kopyala butonu (Workflow 1 step 8 - IP Ekle)
    // WORKFLOW_4 step 8 (spambypass_step8) için GÖSTERME
    if (step.id === 8 && step.name === 'step9_ip_input' && !step.hideIPList) {
      const ips = ['149.72.161.59', '149.72.42.201', '149.72.154.87']
      
      html += `
        <div style="background: linear-gradient(135deg, rgba(107, 114, 128, 0.08), rgba(75, 85, 99, 0.08)); border: 2px solid #6b7280; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">IP</div>
            IP Adresi Listesi
          </div>
          <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px; max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 4px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 12px; color: #374151;">
              ${ips.map(ip => `<div style="padding: 2px 4px; background: #f3f4f6; border-radius: 4px; border-left: 3px solid #6b7280;">${ip}</div>`).join('')}
            </div>
          </div>
          <button id="keepnet-copy-ips-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(107, 114, 128, 0.4)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(107, 114, 128, 0.3)'">
            ${i18n('copyAll')}
          </button>
        </div>
      `
    }
    
    // IP Adresleri için özel liste (Workflow 1 step 9 veya Workflow 2 step 5)
    // WORKFLOW_4 step 9 için SADECE IP listesini göster, buton OLMASIN (hideCopyButton true ise)
    if ((step.id === 9 || step.name === 'antispam_step5_add_ips') && step.name !== 'spambypass_step8_select_one_ip' && step.name !== 'spambypass_step9_select_ip_range') {
      const showButton = !step.hideCopyButton // hideCopyButton true ise butonu gösterme
      
      html += `
        <div style="background: linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(45, 45, 74, 0.8)); border: 2px solid #4a9eff; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #4a9eff; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            📋 White List IP Adresleri
          </div>
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 8px; ${showButton ? 'margin-bottom: 8px;' : ''} font-family: 'Courier New', monospace; font-size: 13px; color: #E2E8F0;">
            <div style="padding: 4px 0;">149.72.161.59</div>
            <div style="padding: 4px 0;">149.72.42.201</div>
            <div style="padding: 4px 0;">149.72.154.87</div>
          </div>
          ${showButton ? `<button id="keepnet-copy-ips-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #4a9eff 0%, #5dade2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
          " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 8px rgba(124, 58, 237, 0.5)'"
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(124, 58, 237, 0.3)'">
            📋 ${i18n('copyAll')}
          </button>` : ''}
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
    
    if (step.autoClick) {
      html += `
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; font-size: 11px; color: #92400e;">
          ⏱️ 5 saniye içinde otomatik tıklanacak...
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
      
        const goBtn = document.getElementById('keepnet-go-to-security-btn')
        if (goBtn) {
          goBtn.addEventListener('click', () => {
            console.log('[Keepnet] Sayfaya Git clicked')
            window.location.href = 'https://security.microsoft.com/homepage'
          })
        }
      }, 100)
    
    // Simülasyon URL'leri copy butonu için event listener ekle (Workflow 1 step 10)
    if (step.id === 9 && step.name === 'step10_simulation_urls_input') {
      setTimeout(() => {
        const copyBtn = document.getElementById('keepnet-copy-simulation-urls-btn')
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const domains = [
              'signin-authzone.com', 'verifycloudaccess.com', 'akibadem.org', 'isdestek.org', 'gartnerpeer.com',
              'global-cloud-llc.com', 'cloudverification.online', 'accountaccesses.com', 'shoppingcenter.site',
              'hesapdogrulama.info', 'banksecure.info', 'meetingonline-us.com', 'digitalsecurelogin.co',
              'secureloginshop.net', 'encryptedconnections.info', 'trendyoll.club', 'kurumsalgiris.com',
              'yoursecuregateway.com', 'securemygateway.com', 'hadisendekatil.com', 'updatemyinformation.com',
              'secure-passchanges.com', 'swift-intel.com', 'hepsibureda.com', 'securely-logout.com',
              'sigortacilarbirligi.com', 'btyardimmasasi.com', 'sirketiciduyuru.com', 'bilgilerimiguncelle.com',
              'securelogout.com', 'securelinked-in.com', 'theconnectionsuccess.com', 'sigortacilikhizmetleri.me',
              'securebankingservices.net', 'guvenlibankacilik.com', 'insurance-services.me', 'btservisleri.com',
              'secureloginonline.net', 'insan-kaynaklari.me', 'getaccess.store'
            ]
            const domainsText = domains.join('\n')
            navigator.clipboard.writeText(domainsText).then(() => {
              copyBtn.textContent = i18n('copied')
              copyBtn.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
              setTimeout(() => {
                copyBtn.textContent = i18n('copyAll')
                copyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }, 2000)
            }).catch(err => {
              console.error('[Keepnet] Clipboard error:', err)
              copyBtn.textContent = i18n('error')
              setTimeout(() => {
                copyBtn.textContent = i18n('copyAll')
              }, 2000)
            })
          })
        }
      }, 100)
    }
    
    // Domain copy butonu için event listener ekle (Workflow 1 step 8)
    if (step.id === 7 && step.name === 'step8_domains_input') {
      setTimeout(() => {
        const copyBtn = document.getElementById('keepnet-copy-domains-btn')
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const domains = [
              'signin-authzone.com', 'verifycloudaccess.com', 'akibadem.org', 'isdestek.org', 'gartnerpeer.com',
              'global-cloud-llc.com', 'cloudverification.online', 'accountaccesses.com', 'shoppingcenter.site',
              'hesapdogrulama.info', 'banksecure.info', 'meetingonline-us.com', 'digitalsecurelogin.co',
              'secureloginshop.net', 'encryptedconnections.info', 'trendyoll.club', 'kurumsalgiris.com',
              'yoursecuregateway.com', 'securemygateway.com', 'hadisendekatil.com', 'updatemyinformation.com',
              'secure-passchanges.com', 'swift-intel.com', 'hepsibureda.com', 'securely-logout.com',
              'sigortacilarbirligi.com', 'btyardimmasasi.com', 'sirketiciduyuru.com', 'bilgilerimiguncelle.com',
              'securelogout.com', 'securelinked-in.com', 'theconnectionsuccess.com', 'sigortacilikhizmetleri.me',
              'securebankingservices.net', 'guvenlibankacilik.com', 'insurance-services.me', 'btservisleri.com',
              'secureloginonline.net', 'insan-kaynaklari.me', 'getaccess.store'
            ]
            const domainsText = domains.join('\n')
            navigator.clipboard.writeText(domainsText).then(() => {
              copyBtn.textContent = i18n('copied')
              copyBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              setTimeout(() => {
                copyBtn.textContent = i18n('copyAll')
                copyBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              }, 2000)
            }).catch(err => {
              console.error('[Keepnet] Clipboard error:', err)
              copyBtn.textContent = i18n('error')
              setTimeout(() => {
                copyBtn.textContent = i18n('copyAll')
              }, 2000)
            })
          })
        }
      }, 100)
    }
    
    // IP copy butonu için event listener ekle (Workflow 1 step 9 veya Workflow 2 step 5)
    // WORKFLOW_4 steps için ASLA ekleme
    if ((step.id === 9 || step.name === 'antispam_step5_add_ips') && step.name !== 'spambypass_step8_select_one_ip' && step.name !== 'spambypass_step9_select_ip_range') {
      setTimeout(() => {
        const copyBtn = document.getElementById('keepnet-copy-ips-btn')
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const ips = '149.72.161.59\n149.72.42.201\n149.72.154.87'
            navigator.clipboard.writeText(ips).then(() => {
              copyBtn.textContent = i18n('copied')
              copyBtn.style.background = 'linear-gradient(135deg, #5dade2 0%, #4a9eff 100%)'
              setTimeout(() => {
                copyBtn.textContent = i18n('copyAll')
                copyBtn.style.background = 'linear-gradient(135deg, #4a9eff 0%, #5dade2 100%)'
              }, 2000)
            }).catch(err => {
              console.error('[Keepnet] Clipboard error:', err)
              copyBtn.textContent = i18n('error')
              setTimeout(() => {
                copyBtn.textContent = i18n('copyAll')
              }, 2000)
            })
          })
        }
      }, 100)
    }
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
    if (this.highlightedElement) {
      AnimationUtils.removeHighlight(this.highlightedElement)
      this.highlightedElement = null
    }
    
    if (this.tooltip) {
      this.tooltip.style.animation = 'keepnet-fade-out 200ms ease-out forwards'
      setTimeout(() => {
        this.tooltip?.remove()
      this.tooltip = null
      }, 200)
    }
    
    this.autoClick.stop()
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
      
      // Container'ı yukarı çıkarak bul (3 level kadar)
      if (!input && container) {
        for (let i = 0; i < 3; i++) {
          container = container.parentElement
      if (container) {
            input = container.querySelector('input.ms-BasePicker-input') || 
                      container.querySelector('input[role="combobox"]') ||
                    container.querySelector('textarea.ms-TextField-field') ||
                    container.querySelector('textarea') ||
                      container.querySelector('input[type="text"]')
            if (input) break
          }
        }
      }
        
        if (input) {
          console.log("[Keepnet] Input found, focusing...")
          input.focus()
          input.click()
          
          // Highlight'ı input'a taşı
          this.clearHighlight()
          this.highlightElement(input, `${step.tooltip} (buraya yazın)`)
      } else {
        console.warn("[Keepnet] Input not found for label step")
      }
    }
    
    // Wait if specified
    if (step.waitAfterClick) {
      await Utils.sleep(step.waitAfterClick)
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
        this.highlightElement(nextElement, `Şimdi "${step.nextTarget.textMatch?.source || 'bu seçeneği'}" seçin`)
        
        // NextTarget'a click listener ekle
        nextElement.addEventListener('click', async () => {
          console.log(`[Keepnet] NextTarget clicked`)
          this.clearHighlight()
          await Utils.sleep(step.waitAfterClick || 500)
          await this.nextStep()
        }, { once: true })
        
        return // Normal nextStep'i atla
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
        this.highlightElement(secondaryElement, `Şimdi "${step.target.secondaryTarget.textMatch?.source || 'bu seçeneği'}" seçin`)
        
        // SecondaryTarget'a click listener ekle
        secondaryElement.addEventListener('click', async () => {
          console.log(`[Keepnet] SecondaryTarget clicked`)
          this.clearHighlight()
          await Utils.sleep(step.waitAfterClick || 500)
          await this.nextStep()
        }, { once: true })
        
        // Auto-click için secondary target'ı da destekle
        if (step.autoClick) {
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
                  this.highlightElement(el, `Şimdi "IP address is in any of these ranges" seçeneğini seçin`)
                  
                  el.addEventListener('click', async () => {
                    console.log(`[Keepnet] SecondaryTarget clicked (fallback)`)
                    this.clearHighlight()
                    await Utils.sleep(step.waitAfterClick || 500)
                    await this.nextStep()
                  }, { once: true })
                  
                  if (step.autoClick) {
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
    
    // OTOMATIK SONRAKİ ADIMA GEÇ - Validation sonucuna bakmaksızın her zaman ilerle
    console.log(`[Keepnet] Step ${step.id} tamamlandı, otomatik sonraki adıma geçiliyor...`)
    await Utils.sleep(500)
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
    
    this.validationInterval = setInterval(async () => {
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
    
    // Clear auto-advance timer when manually proceeding
    if (autoAdvanceTimer) {
      console.log('[Keepnet] Clearing auto-advance timer due to manual next step')
      clearTimeout(autoAdvanceTimer)
      autoAdvanceTimer = null
    }
    
    // Current step validation (sadece uyarı, bloklama yok)
    const currentStepConfig = this.currentWorkflow[this.currentStep - 1]
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
    if (this.currentStep <= 1) return
    await this.executeStep(this.currentStep - 1)
  }
  
  async showSummary() {
    this.clearHighlight()
    
    // Footer'ı gizle (summary ekranında footer butonu gösterme)
    const footer = document.getElementById('keepnet-panel-footer')
    if (footer) {
      footer.style.display = 'none'
    }
    
    const screenshots = this.screenshots.getAll()
    
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
            ${i18n('summaryReport')}
          </h2>
          <div style="
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 400;
          ">
            ${this.workflowName}
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
    
    // Summary adımını hariç tut
    const stepsToShow = this.currentWorkflow.filter(s => !s.isSummary)
    
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
        " class="keepnet-summary-item" 
        onmouseover="this.style.background='rgba(255, 255, 255, 0.05)'"
        onmouseout="this.style.background='${itemBackground}'">
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
              onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'; this.style.transform='translateY(-1px)'"
              onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.transform='translateY(0)'"
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
        <!-- Screenshot Notification (Stripe style) -->
        <div style="
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          gap: 10px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span style="font-weight: 500;">${i18n('allScreenshotsSaved')}</span>
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
            ${i18n('congratsTitle')}
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
            ${i18n('congratsDesc')}
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
              <span>Başarılı</span>
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
      nextWorkflowText = 'Devam Et (Workflow 2: Anti-Spam)'
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_2') {
      nextWorkflowText = 'Devam Et (Workflow 3: Safe Links)'
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_3') {
      nextWorkflowText = 'Devam Et (Workflow 4: Spam Filter Bypass)'
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_4') {
      nextWorkflowText = 'Devam Et (Workflow 5: ATP Link Bypass)'
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_5') {
      nextWorkflowText = 'Devam Et (Workflow 6: ATP Attachment Bypass)'
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_6') {
      // WORKFLOW_6 için buton gösterme
      hasNextWorkflow = false
    } else {
      nextWorkflowText = '✅ Tüm Workflow\'lar Tamamlandı'
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
            ➡️ ${nextWorkflowText}
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
  }
}

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
    console.log("[Keepnet] 🚀 New workflow detected:", nextWorkflow)
    
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
setInterval(() => {
  const panel = document.querySelector('#keepnet-floating-panel')
  if (panel) {
    console.log("[Keepnet] ✅ Panel exists! Display:", panel.style.display, "Size:", panel.offsetWidth, "x", panel.offsetHeight)
  } else {
    console.log("[Keepnet] ❌ Panel NOT found in DOM!")
  }
}, 10000)

/* ==== WF4/5/6 HIZLI GEÇİŞ PATCH ==== */
(function () {
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
  function removeWhitelistBlocks() {
    const killByTexts = ['White List IP', 'Whitelist IP', 'Tümünü Kopyala', 'IP Adresleri'];
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
    if (toRemove.size) console.log('🧹 Step 8: Whitelist/IP kopya blokları kaldırıldı.');
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

    console.warn('⚠️ Sonraki adıma geçiş için uygun buton bulunamadı.');
  }

  // SAĞDAKİ "Add action" butonu (workflow4 step 15 için lazım)
  async function clickRightAddAction() {
    const sel = 'button[data-automation-id="EditTransportRule_AddAction_0_IconButtonBtn"]';
    const btn = await waitForSelector(sel, 8000);
    if (btn) {
      btn.click();
      console.log('➕ Sağdaki "Add action" tıklandı.');
    } else {
      console.warn('⚠️ "Add action" butonu bulunamadı:', sel);
    }
  }

  async function runForWorkflow(name) {
    name = (name || '').toLowerCase();
    if (!AUTO_WF.has(name)) return;

    const step = getCurrentStepNumber();
    if (step == null) return;

    // Ortak: Step 8 görünürse whitelist bloklarını kaldır
    if (step === 8) {
      removeWhitelistBlocks();
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
      // 8'de sadece whitelist kaldır; geçişi de hızlandır
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
