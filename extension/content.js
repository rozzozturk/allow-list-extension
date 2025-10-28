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
    workflowStep12Description: 'Tüm adımlar başarıyla tamamlandı'
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
    workflowStep12Description: 'All steps successfully completed'
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
    elementNotFound: 'Element nicht gefunden',
    pleaseComplete: 'Bitte füllen Sie dieses Feld aus!',
    allScreenshotsSaved: 'Alle Screenshots in chrome.storage gespeichert'
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
    elementNotFound: 'Élément non trouvé',
    pleaseComplete: 'Veuillez compléter ce champ!',
    allScreenshotsSaved: 'Toutes les captures d\'écran sauvegardées dans chrome.storage'
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
    elementNotFound: 'Elemento no encontrado',
    pleaseComplete: '¡Por favor complete este campo!',
    allScreenshotsSaved: 'Todas las capturas de pantalla guardadas en chrome.storage'
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
    elementNotFound: 'Elemento non trovato',
    pleaseComplete: 'Si prega di completare questo campo!',
    allScreenshotsSaved: 'Tutti gli screenshot salvati in chrome.storage'
  }
}

// Current language (will be loaded from storage)
let CURRENT_LANGUAGE = 'tr'

// Load language preference from storage
async function loadLanguagePreference() {
  try {
    const result = await chrome.storage.local.get(['keepnet_language'])
    CURRENT_LANGUAGE = result.keepnet_language || 'tr'
    console.log('[i18n] Language loaded from storage:', CURRENT_LANGUAGE)
  } catch (error) {
    console.warn('[i18n] Error loading language preference:', error)
    CURRENT_LANGUAGE = 'tr'
  }
}

// i18n helper function
function i18n(key) {
  try {
    const message = MESSAGES[CURRENT_LANGUAGE]?.[key] || MESSAGES.tr[key] || key;
    return message;
  } catch (error) {
    console.warn('[i18n] Error getting message for key:', key, error);
    return key;
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
    validation: () => {
      return document.location.href.startsWith('https://security.microsoft.com')
    }
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
    validation: () => {
      // Herhangi bir email butonunu bul
      const btn = document.querySelector('button[aria-label*="posta"], button[aria-label*="Email"]')
      return btn && btn.getAttribute('aria-expanded') === 'true'
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('/securitypoliciesandrules') || 
             document.location.href.includes('/policy')
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('/threatpolicy')
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('/advanceddelivery')
    },
    waitAfterClick: 1000
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
    validation: () => {
      const tab = Array.from(document.querySelectorAll('button[role="tab"], .ms-Pivot-text')).find(el => 
        /Phishing simulation/i.test(el.textContent)
      )
      return tab && (tab.getAttribute('aria-selected') === 'true' || tab.classList.contains('is-selected'))
    },
    waitAfterClick: 2000
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
    validation: () => {
      // Panel veya modal açıldı mı kontrol et
      return !!document.querySelector('[role="dialog"], .ms-Panel, [data-automation-id="panel"]')
    },
    waitAfterClick: 1000
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
    validation: () => {
      const label = Array.from(document.querySelectorAll('label.ms-Label')).find(el => 
        /Etki Alanı/i.test(el.textContent)
      )
      return label && !label.textContent.includes('(0 öğe)')
    },
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
      selector: 'input[aria-label="IP picker"]',
      fallback: [
        'input.ms-BasePicker-input',
        'input[id*="combobox"][aria-label*="IP"]'
      ]
    },
    tooltip: 'White list IP adreslerini girin',
    autoClick: false,
    validation: () => {
      const input = document.querySelector('input[aria-label="IP picker"]')
      return input && input.value && input.value.length > 0
    },
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
    validation: () => {
      const label = Array.from(document.querySelectorAll('label.ms-Label')).find(el => 
        /İzin verilen simülasyon URL/i.test(el.textContent)
      )
      return label && !label.textContent.includes('(0 öğe)')
    },
    realTimeValidation: true,
    criticalStep: false,
    waitAfterClick: 2000
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
    validation: () => {
      // Save işlemi başarılı mı kontrol et
      return true
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('/antispam')
    },
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
    validation: () => {
      // Seçili checkbox var mı kontrol et
      const checkedBoxes = document.querySelectorAll('div.ms-DetailsRow-cellCheck div[data-automationid="DetailsRowCheck"][aria-checked="true"]')
      return checkedBoxes.length > 0
    },
    waitAfterClick: 1000
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
    validation: () => {
      return !!document.querySelector('button[aria-label*="Edit connection filter"]')
    },
    waitAfterClick: 1000
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
    validation: () => {
      return !!document.querySelector('textarea[aria-label*="IP"], input[aria-label*="IP"]')
    },
    waitAfterClick: 1000
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
    validation: () => {
      const input = document.querySelector('input.ms-BasePicker-input') ||
                    document.querySelector('textarea.ms-TextField-field') ||
                    document.querySelector('textarea')
      return input && input.value && input.value.length > 0
    },
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
    validation: () => {
      const checkbox = Array.from(document.querySelectorAll('input[type="checkbox"]')).find(el => {
        const label = el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent : el.parentElement?.textContent
        return label && /Turn on safe list/i.test(label)
      })
      return checkbox && checkbox.checked
    },
    waitAfterClick: 2000
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
    validation: () => {
      return true
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('/threatpolicy')
    }
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
    validation: () => {
      const btn = document.querySelector('button[aria-label*="posta"], button[aria-label*="Email"]')
      return btn && btn.getAttribute('aria-expanded') === 'true'
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('/threatpolicy')
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('safelinks') || 
             document.querySelector('[aria-label*="Safe Links"]')
    },
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
    validation: () => {
      return !!document.querySelector('[role="dialog"], .ms-Panel')
    },
    waitAfterClick: 1000
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
    validation: () => {
      const input = document.querySelector('input[placeholder*="name"], input[type="text"]')
      return input && input.value && input.value.length > 0
    },
    realTimeValidation: true,
    waitAfterClick: 2000
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
    validation: () => {
      return true
    },
    waitAfterClick: 1000
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
    validation: () => {
      const input = document.querySelector('input[aria-label*="domain"], input.ms-BasePicker-input')
      return input && input.value && input.value.length > 0
    },
    realTimeValidation: true,
    waitAfterClick: 2000
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
    validation: () => {
      return true
    },
    waitAfterClick: 1000
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
    validation: () => {
      const checkbox = document.querySelector('input[type="checkbox"][aria-label*="Track"]')
      return checkbox && !checkbox.checked
    },
    waitAfterClick: 2000
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
    validation: () => {
      const input = document.querySelector('textarea[aria-label*="URL"], textarea')
      return input && input.value && input.value.includes('*.')
    },
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
    validation: () => {
      return true
    },
    waitAfterClick: 1000
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
    validation: () => {
      return true
    },
    waitAfterClick: 1000
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
    description: 'Spam Filter Bypass adımı başlıyor. Her adım arasında 5 saniye duraksama var.',
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
    validation: () => {
      return document.location.href.includes('admin.exchange.microsoft.com') && 
             document.location.href.includes('transportrules')
    },
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
    validation: () => {
      return !!document.querySelector('span.ms-ContextualMenu-itemText') || !!document.querySelector('div[role="menuitem"]')
    },
    waitAfterClick: 1000
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
    validation: () => {
      return document.location.href.includes('new') || !!document.querySelector('input[data-automation-id="EditTransportRule_Name_TextField"]')
    },
    waitAfterClick: 1000,
    panelPosition: 'top-left'
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
    validation: () => {
      const input = document.querySelector('input[data-automation-id="EditTransportRule_Name_TextField"]') || 
                   document.querySelector('div.ms-TextField-fieldGroup input[type="text"]')
      return input && (input.value.length > 0 || document.activeElement === input)
    },
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
    validation: () => {
      return !!document.querySelector('button[data-index="1"] span:contains("The sender")') || 
             !!document.querySelector('div[role="option"]:contains("The sender")')
    },
    waitAfterClick: 1000
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
    validation: () => {
      const selectedText = document.querySelector('div[data-automation-id="EditTransportRule_GroupCondition_0_Dropdown"] span.ms-Dropdown-title')
      return selectedText && selectedText.textContent.includes('The sender')
    },
    waitAfterClick: 1000
  },
  {
    id: 8,
    name: 'spambypass_step8_select_one_ip',
    title: 'IP Condition Dropdown',
    description: '7) "Select one" dropdown\'ını açın (IP condition için).',
    target: {
      selector: 'span[id*="Dropdown"][id*="option"].ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder',
      textMatch: /Select one/i,
      fallback: [
        'span#Dropdown323-option',
        'span.ms-Dropdown-title:contains("Select one")',
        'span.ms-Dropdown-titleIsPlaceHolder'
      ]
    },
    tooltip: 'IP condition için Select one dropdown\'ını açın',
    autoClick: false,
    validation: () => {
      return !!document.querySelector('span.ms-Dropdown-optionText:contains("IP address is in any of these ranges")')
    },
    waitAfterClick: 1000
  },
  {
    id: 9,
    name: 'spambypass_step9_select_ip_range',
    title: 'IP Address Condition',
    description: '8) "IP address is in any of these ranges or exactly matches" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-617',
      textMatch: /IP address is in any of these ranges/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("IP address is in any of these ranges or exactly matches")',
        'span.ms-Dropdown-optionText:contains("IP address")',
        'div[role="option"]:contains("IP address")'
      ]
    },
    tooltip: 'IP address ranges seçeneğini seçin',
    autoClick: false,
    validation: () => {
      return !!document.querySelector('input[data-automation-id="SenderIpRanges_Input"]') || 
             !!document.querySelector('input[placeholder*="IPv4 or IPv6"]')
    },
    waitAfterClick: 1000
  },
  {
    id: 10,
    name: 'spambypass_step10_enter_ip',
    title: 'IP Adreslerini Girin',
    description: '9) IP adreslerini girin: 149.72.161.59, 149.72.42.201, 149.72.154.87 (Her satıra bir IP). 3 IP girildiğinde checkbox\'lar belirecek ve otomatik ilerleyecek.',
    target: {
      selector: 'input#TextField637',
      fallback: [
        'input[data-automation-id="SenderIpRanges_Input"]',
        'input[placeholder*="Enter an IPv4 or IPv6 address"]',
        'input.ms-TextField-field',
        'input[aria-label*="IP"]'
      ]
    },
    tooltip: 'IP adreslerini manuel olarak girin (Her satıra bir IP)',
    autoClick: false,
    manualStep: true,
    autoAdvance: true,
    hideCopyButton: true,
    validation: () => {
      // 3 tane checkbox var mı kontrolü (seçili olmasına gerek yok)
      const checkboxes = document.querySelectorAll('div.ms-DetailsRow-check.ms-Check-checkHost[role="radio"]') ||
                         document.querySelectorAll('div[id*="checkbox"][role="radio"]') ||
                         document.querySelectorAll('div.ms-Check-checkHost')
      console.log('[Keepnet] Total checkboxes found:', checkboxes.length)
      return checkboxes && checkboxes.length >= 3
    },
    realTimeValidation: true,
    realTimeValidationInterval: 2000,
    criticalStep: true,
    waitAfterClick: 2000
  },
  {
    id: 11,
    name: 'spambypass_step11_do_following_dropdown',
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
    validation: () => {
      return !!document.querySelector('span.ms-Dropdown-optionText:contains("Modify the message properties")')
    },
    waitAfterClick: 1000
  },
  {
    id: 12,
    name: 'spambypass_step12_modify_message_properties',
    title: 'Modify Message Properties',
    description: '11) "Modify the message properties" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-617',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span.ms-Dropdown-optionText:contains("Modify the message properties")',
        'div[role="option"]:contains("Modify the message properties")'
      ]
    },
    tooltip: 'Modify the message properties seçin',
    autoClick: false,
    validation: () => {
      return !!document.querySelector('span#Dropdown328-option') || 
             !!document.querySelector('span.ms-Dropdown-titleIsPlaceHolder:contains("Select one")')
    },
    waitAfterClick: 1000
  },
  {
    id: 13,
    name: 'spambypass_step13_second_select_one',
    title: 'Second Select One',
    description: '12) İkinci "Select one" dropdown\'ını açın.',
    target: {
      selector: 'span#Dropdown328-option.ms-Dropdown-titleIsPlaceHolder',
      textMatch: /Select one/i,
      fallback: [
        'span[id*="Dropdown328"].ms-Dropdown-title',
        'span.ms-Dropdown-titleIsPlaceHolder:contains("Select one")'
      ]
    },
    tooltip: 'İkinci Select one dropdown\'ını açın',
    autoClick: false,
    validation: () => {
      return !!document.querySelector('span:contains("set the spam confidence level")')
    },
    waitAfterClick: 1000
  },
  {
    id: 14,
    name: 'spambypass_step14_set_scl',
    title: 'Set SCL',
    description: '13) "set the spam confidence level (SCL)" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-706',
      textMatch: /set the spam confidence level/i,
      fallback: [
        'span:contains("set the spam confidence level (SCL)")',
        'span.ms-Dropdown-optionText:contains("spam confidence level")',
        'span[id*="Dropdown675-option"]'
      ]
    },
    tooltip: 'Set the spam confidence level (SCL) seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    validation: () => {
      return !!document.querySelector('span:contains("Bypass spam filtering")') || 
             !!document.querySelector('span[id*="Dropdown1028-option"]')
    },
    waitAfterClick: 1000
  },
  {
    id: 15,
    name: 'spambypass_step15_bypass_spam_filtering',
    title: 'Bypass Spam Filtering',
    description: '14) "Bypass spam filtering" seçeneğini seçin.',
    target: {
      selector: 'span[id*="Dropdown1028-option"]',
      textMatch: /Bypass spam filtering/i,
      fallback: [
        'span:contains("Bypass spam filtering")',
        'span.ms-Dropdown-title:contains("Bypass spam filtering")',
        'div[role="option"]:contains("Bypass spam filtering")'
      ]
    },
    tooltip: 'Bypass spam filtering seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    validation: () => {
      return !!document.querySelector('button:contains("Save")') || 
             !!document.querySelector('span.ms-Button-label:contains("Save")')
    },
    waitAfterClick: 1000
  },
  {
    id: 16,
    name: 'spambypass_step16_save_first_rule',
    title: 'İlk Kuralı Kaydet',
    description: '15) Save butonuna tıklayarak ilk kuralı kaydedin.',
    target: {
      selector: 'span.ms-Button-label',
      textMatch: /Save/i,
      fallback: [
        'button[aria-label*="Save"]',
        'button.ms-Button--primary',
        'button[type="button"]:contains("Save")',
        'button:contains("Save")'
      ]
    },
    tooltip: 'İlk kuralı kaydedin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => {
      return !!document.querySelector('i[data-icon-name="Add"]') || 
             !!document.querySelector('button:contains("+")')
    },
    waitAfterClick: 2000
  },
  {
    id: 17,
    name: 'spambypass_step17_add_new_rule',
    title: 'Yeni Kural Ekle',
    description: '16) "Do the following" alanının yanındaki + (artı) butonuna tıklayın.',
    target: {
      selector: 'i[data-icon-name="Add"]',
      fallback: [
        'button:contains("+")',
        'i.ms-Icon[data-icon-name="Add"]',
        'i.ms-Button-icon[data-icon-name="Add"]'
      ]
    },
    tooltip: 'Yeni kural eklemek için + butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    validation: () => {
      return !!document.querySelector('span:contains("Modify the message properties")')
    },
    waitAfterClick: 1000
  },
  {
    id: 18,
    name: 'spambypass_step18_modify_message_properties2',
    title: 'Modify Message Properties (2. Kez)',
    description: '17) Tekrar "Modify the message properties" seçeneğini seçin.',
    target: {
      selector: 'span[id*="Dropdown674-option"]',
      textMatch: /Modify the message properties/i,
      fallback: [
        'span:contains("Modify the message properties")',
        'span.ms-Dropdown-optionText:contains("Modify the message properties")'
      ]
    },
    tooltip: 'Modify the message properties seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    validation: () => {
      return !!document.querySelector('span:contains("Select one")') || 
             !!document.querySelector('span[id*="Dropdown675-option"]')
    },
    waitAfterClick: 1000
  },
  {
    id: 19,
    name: 'spambypass_step19_set_message_header',
    title: 'Set Message Header',
    description: '18) "Select one" dropdown\'ından "set a message header" seçeneğini seçin.',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-706',
      textMatch: /set a message header/i,
      fallback: [
        'span:contains("set a message header")',
        'span.ms-Dropdown-optionText:contains("set a message header")'
      ]
    },
    tooltip: 'Set a message header seçin',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    validation: () => {
      return !!document.querySelector('button[data-automation-id*="Link_SetHeader"]') || 
             !!document.querySelector('button:contains("Enter text")')
    },
    waitAfterClick: 1000
  },
  {
    id: 20,
    name: 'spambypass_step20_enter_text_button',
    title: 'Enter Text',
    description: '19) "Enter text" butonuna tıklayın.',
    target: {
      selector: 'button[data-automation-id*="Link_SetHeader"]',
      textMatch: /Enter text/i,
      fallback: [
        'button:contains("Enter text")',
        'button.ms-Link:contains("Enter text")'
      ]
    },
    tooltip: 'Enter text butonuna tıklayın',
    autoClick: false,
    autoAdvance: true,
    autoAdvanceDelay: 2000,
    validation: () => {
      return !!document.querySelector('input[placeholder*="header"]') || 
             !!document.querySelector('input[aria-label*="header"]')
    },
    waitAfterClick: 1000
  },
  {
    id: 21,
    name: 'spambypass_step21_enter_bypass_clutter',
    title: 'BypassClutter Header',
    description: '20) Header name alanına "X-MS-Exchange-Organization-BypassClutter" girin.',
    target: {
      selector: 'input[placeholder*="header"]',
      fallback: [
        'input[aria-label*="header"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'X-MS-Exchange-Organization-BypassClutter girin',
    autoClick: false,
    manualStep: true,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
    validation: () => {
      const input = document.querySelector('input[placeholder*="header"]') || 
                   document.querySelector('input[aria-label*="header"]')
      return input && input.value && input.value.includes('BypassClutter')
    },
    criticalStep: true,
    waitAfterClick: 1000
  },
  {
    id: 22,
    name: 'spambypass_step22_enter_header_value',
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
    manualStep: true,
    autoAdvance: true,
    autoAdvanceDelay: 3000,
    validation: () => {
      const input = document.querySelector('input[placeholder*="value"]') || 
                   document.querySelector('input[aria-label*="value"]')
      return input && input.value && input.value === 'true'
    },
    criticalStep: true,
    waitAfterClick: 1000
  },
  {
    id: 23,
    name: 'spambypass_step23_save_final',
    title: 'Final Save',
    description: '22) Save butonuna tıklayarak tüm kuralları kaydedin.',
    target: {
      selector: 'button[aria-label*="Save"]',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'button.ms-Button--primary',
        'button[type="button"]:contains("Save")',
        'button:contains("Save")',
        'span.ms-Button-label:contains("Save")'
      ]
    },
    tooltip: 'Tüm kuralları kaydedin',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 2000
  },
  {
    id: 24,
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
    name: 'atplink_step1_navigate',
    title: 'Exchange Admin Center',
    description: 'Exchange Admin Center Transport Rules sayfasına git.',
    navigate: 'https://admin.exchange.microsoft.com/#/transportrules',
    isNavigation: true,
    validation: () => {
      return document.location.href.includes('admin.exchange.microsoft.com') && 
             document.location.href.includes('transportrules')
    },
    waitAfterClick: 1000
  },
  {
    id: 2,
    name: 'atplink_step2_add_rule',
    title: 'Yeni Kural Ekle',
    description: 'Exchange Admin Rules sayfasında + Add a rule butonuna tıklayın',
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
    validation: () => {
      return !!document.querySelector('input[placeholder*="name"], input[aria-label*="name"]')
    },
    waitAfterClick: 1000
  },
  {
    id: 3,
    name: 'atplink_step3_rule_name',
    title: 'Kural İsmi',
    description: 'Beyaz liste kuralı için bir isim girin (örn: "ATP Link Bypass")',
    target: {
      selector: 'input[placeholder*="name"]',
      fallback: [
        'input[aria-label*="name"]',
        'input[aria-label*="Name"]',
        'input[type="text"]:first-of-type'
      ]
    },
    tooltip: 'Kural adını girin',
    autoClick: false,
    validation: () => {
      const input = document.querySelector('input[placeholder*="name"]') || document.querySelector('input[aria-label*="name"]')
      return input && input.value && input.value.length > 0
    },
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 5000
  },
  {
    id: 4,
    name: 'atplink_step4_apply_rule_if',
    title: 'Apply This Rule If',
    description: '"Apply this rule if..." > The sender > IP address is in any of these ranges or exactly matches',
    target: {
      selector: 'button[aria-label*="Apply this rule"]',
      textMatch: /Apply this rule if/i,
      fallback: [
        'button:contains("Apply this rule")',
        'button[aria-label*="condition"]'
      ]
    },
    tooltip: '"Apply this rule if..." ayarlarını yapın',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 5,
    name: 'atplink_step5_sender_ip',
    title: 'Gönderici IP Adresi',
    description: 'The sender > IP address is seçeneğini ayarlayın ve IP adreslerini girin',
    target: {
      selector: 'input.ms-BasePicker-input',
      fallback: [
        'textarea.ms-TextField-field',
        'input[aria-label*="IP"]',
        'textarea'
      ]
    },
    tooltip: 'IP adreslerini girin (Her satıra bir IP)',
    autoClick: false,
    validation: () => {
      const input = document.querySelector('input.ms-BasePicker-input') || document.querySelector('textarea')
      return input && input.value && input.value.length > 0
    },
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 5000
  },
  {
    id: 6,
    name: 'atplink_step6_do_following',
    title: 'Do The Following',
    description: '"Do the following" > Modify the message properties > Set a message header',
    target: {
      selector: 'button[aria-label*="Do the following"]',
      textMatch: /Do the following/i,
      fallback: [
        'button:contains("Do the following")',
        'button[aria-label*="action"]'
      ]
    },
    tooltip: '"Do the following" ayarlarını yapın',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 7,
    name: 'atplink_step7_message_header',
    title: 'Message Header Ayarı',
    description: 'X-MS-Exchange-Organization-SkipSafeLinksProcessing başlığını girin ve 1 değeriyle kaydedin',
    target: {
      selector: 'input[aria-label*="header name"]',
      fallback: [
        'input[placeholder*="header"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Header name: X-MS-Exchange-Organization-SkipSafeLinksProcessing, Value: 1',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 8,
    name: 'atplink_step8_save',
    title: 'Kaydet',
    description: 'Kuralı kaydetmek için Save butonuna tıklayın',
    target: {
      selector: 'button[aria-label*="Save"]',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'button.ms-Button--primary',
        'button[type="button"]:contains("Save")'
      ]
    },
    tooltip: 'Kuralı kaydedin',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 9,
    name: 'atplink_summary',
    title: 'Tamamlandı! ✅',
    description: 'ATP Link Bypass (SkipSafeLinksProcessing) kuralı başarıyla oluşturuldu.',
    isSummary: true
  }
]

/* ========== WORKFLOW 6: ATP Attachment Bypass (SkipSafeAttachmentProcessing) ========== */
const ATP_ATTACHMENT_BYPASS_STEPS = [
  {
    id: 1,
    name: 'atpattach_step1_navigate',
    title: 'Exchange Admin Center',
    description: 'Exchange Admin Center Transport Rules sayfasına git.',
    navigate: 'https://admin.exchange.microsoft.com/#/transportrules',
    isNavigation: true,
    validation: () => {
      return document.location.href.includes('admin.exchange.microsoft.com') && 
             document.location.href.includes('transportrules')
    },
    waitAfterClick: 1000
  },
  {
    id: 2,
    name: 'atpattach_step2_add_rule',
    title: 'Yeni Kural Ekle',
    description: '+ Add a rule butonuna tıklayın',
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
    validation: () => {
      return !!document.querySelector('input[placeholder*="name"], input[aria-label*="name"]')
    },
    waitAfterClick: 1000
  },
  {
    id: 3,
    name: 'atpattach_step3_rule_name',
    title: 'Kural İsmi',
    description: 'Beyaz liste kuralı için bir isim girin (örn: "ATP Attachment Bypass")',
    target: {
      selector: 'input[placeholder*="name"]',
      fallback: [
        'input[aria-label*="name"]',
        'input[aria-label*="Name"]',
        'input[type="text"]:first-of-type'
      ]
    },
    tooltip: 'Kural adını girin',
    autoClick: false,
    validation: () => {
      const input = document.querySelector('input[placeholder*="name"]') || document.querySelector('input[aria-label*="name"]')
      return input && input.value && input.value.length > 0
    },
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 5000
  },
  {
    id: 4,
    name: 'atpattach_step4_apply_rule_if',
    title: 'Apply This Rule If',
    description: '"Apply this rule if..." > The sender > IP address is in any of these ranges or exactly matches',
    target: {
      selector: 'button[aria-label*="Apply this rule"]',
      textMatch: /Apply this rule if/i,
      fallback: [
        'button:contains("Apply this rule")',
        'button[aria-label*="condition"]'
      ]
    },
    tooltip: '"Apply this rule if..." ayarlarını yapın',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 5,
    name: 'atpattach_step5_sender_ip',
    title: 'Gönderici IP Adresi',
    description: 'The sender > IP address is seçeneğini ayarlayın ve IP adreslerini girin',
    target: {
      selector: 'input.ms-BasePicker-input',
      fallback: [
        'textarea.ms-TextField-field',
        'input[aria-label*="IP"]',
        'textarea'
      ]
    },
    tooltip: 'IP adreslerini girin (Her satıra bir IP)',
    autoClick: false,
    validation: () => {
      const input = document.querySelector('input.ms-BasePicker-input') || document.querySelector('textarea')
      return input && input.value && input.value.length > 0
    },
    realTimeValidation: true,
    criticalStep: true,
    waitAfterClick: 5000
  },
  {
    id: 6,
    name: 'atpattach_step6_do_following',
    title: 'Do The Following',
    description: '"Do the following" > Modify the message properties > Set a message header',
    target: {
      selector: 'button[aria-label*="Do the following"]',
      textMatch: /Do the following/i,
      fallback: [
        'button:contains("Do the following")',
        'button[aria-label*="action"]'
      ]
    },
    tooltip: '"Do the following" ayarlarını yapın',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 7,
    name: 'atpattach_step7_message_header',
    title: 'Message Header Ayarı',
    description: 'X-MS-Exchange-Organization-SkipSafeAttachmentProcessing başlığını girin ve 1 değeriyle kaydedin',
    target: {
      selector: 'input[aria-label*="header name"]',
      fallback: [
        'input[placeholder*="header"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Header name: X-MS-Exchange-Organization-SkipSafeAttachmentProcessing, Value: 1',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 8,
    name: 'atpattach_step8_save',
    title: 'Kaydet',
    description: 'Kuralı kaydetmek için Save butonuna tıklayın',
    target: {
      selector: 'button[aria-label*="Save"]',
      textMatch: /Save|Kaydet/i,
      fallback: [
        'button.ms-Button--primary',
        'button[type="button"]:contains("Save")'
      ]
    },
    tooltip: 'Kuralı kaydedin',
    autoClick: false,
    validation: () => {
      return true
    },
    waitAfterClick: 1000
  },
  {
    id: 9,
    name: 'atpattach_summary',
    title: '🎊 Tebrikler! Tüm Adımları Tamamladınız!',
    description: 'ATP Attachment Bypass kuralı başarıyla oluşturuldu. Office 365 ortamında IP adreslerini beyaz listeye aldınız ve güvenlik simülasyonları, spam filtreleme ve tehdit öncesi (ATP) özelliklerini başarıyla yapılandırdınız!',
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
          <option value="fr">🇫🇷 FR</option>
          <option value="es">🇪🇸 ES</option>
          <option value="it">🇮🇹 IT</option>
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
    // Workflow 4-6 için global click koruması (feature flag ile kontrol edilir)
    document.addEventListener('click', (e) => {
      const isWorkflow4To6 = window.assistant && ['WORKFLOW_4', 'WORKFLOW_5', 'WORKFLOW_6'].includes(window.assistant.workflowName)
      
      if (isWorkflow4To6 && this.DISABLE_OUTSIDE_CLOSE_WF_4_6) {
        // Microsoft Exchange form'unun açık olduğunu kontrol et
        const exchangeForm = document.querySelector('[role="dialog"], .ms-Panel, [data-automation-id="panel"], .ms-Modal')
        
        if (exchangeForm) {
          // Keepnet panel'i dışında bir yere tıklanıyorsa
          const keepnetPanel = document.getElementById('keepnet-panel')
          if (keepnetPanel && !keepnetPanel.contains(e.target)) {
            console.log("[Keepnet] Global click protection - preventing outside click on Exchange form")
            
            // Log popup closure attempt
            this.logPopupClosureReason('outsideClick', window.assistant.workflowName, {
              targetElement: e.target.tagName,
              targetClass: e.target.className,
              targetId: e.target.id,
              clickPosition: { x: e.clientX, y: e.clientY }
            })
            
            // Exchange form'un kapanmasını engelle
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            
            // Form'a focus'u geri ver
            setTimeout(() => {
              if (exchangeForm && typeof exchangeForm.focus === 'function') {
                exchangeForm.focus()
              }
            }, 10)
            
            return false
          }
        }
      }
    }, true) // Capture phase'de dinle
    
    // ESC tuşu koruması
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const isWorkflow4To6 = window.assistant && ['WORKFLOW_4', 'WORKFLOW_5', 'WORKFLOW_6'].includes(window.assistant.workflowName)
        
        if (isWorkflow4To6) {
          const exchangeForm = document.querySelector('[role="dialog"], .ms-Panel, [data-automation-id="panel"], .ms-Modal')
          
          if (exchangeForm) {
            console.log("[Keepnet] ESC key protection - preventing Exchange form closure")
            
            // Log popup closure attempt
            this.logPopupClosureReason('esc', window.assistant.workflowName, {
              keyCode: e.keyCode,
              key: e.key,
              ctrlKey: e.ctrlKey,
              altKey: e.altKey,
              shiftKey: e.shiftKey
            })
            
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            
            // Form'a focus'u geri ver
            setTimeout(() => {
              if (exchangeForm && typeof exchangeForm.focus === 'function') {
                exchangeForm.focus()
              }
            }, 10)
            
            return false
          }
        }
      }
    }, true) // Capture phase'de dinle
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
          
        } else if (assistant.workflowName === 'WORKFLOW_5') {
          // WORKFLOW_5 -> WORKFLOW_6 AYNI SAYFADA!
          console.log("[Keepnet] Starting WORKFLOW_6 on SAME PAGE...")
          nextWorkflow = ATP_ATTACHMENT_BYPASS_STEPS
          nextWorkflowName = 'WORKFLOW_6'
          
          // ÖNEMLI: Aynı sayfada workflow değiştir!
          assistant.currentWorkflow = nextWorkflow
          assistant.workflowName = nextWorkflowName
          assistant.currentStep = 0
          assistant.stepResults = {}
          
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 0)
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
          assistant.currentStep = 0
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 0)
          
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
      
      console.log("[Keepnet] Button handlers attached")
    }, 100)
  }
  
  async executeStep(stepNum, customSteps = null) {
    try {
      // Hangi steps array'ini kullanacağız?
      if (customSteps) {
        this.currentWorkflow = customSteps
        this.workflowName = customSteps === THREAT_POLICIES_STEPS ? 'WORKFLOW_2' : 
                           customSteps === SAFE_LINKS_STEPS ? 'WORKFLOW_3' : 'WORKFLOW_1'
        console.log(`[Keepnet] Switching to ${this.workflowName}`)
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
      if (footer && !step.isSummary) {
        footer.style.display = 'flex'
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
          setTimeout(async () => {
            console.log(`[Keepnet] Auto advancing after ${step.autoAdvanceDelay}ms`)
            await this.nextStep()
          }, step.autoAdvanceDelay)
        }
        return
      }
      
      // Panel position control
      if (step.panelPosition === 'top-left') {
        this.panel.setPosition('top-left')
      } else {
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
        } else {
          console.warn("[Keepnet] Element not found:", i18n(step.title))
          
          // Safe Links için özel lisans kontrolü
          if (step.name === 'safelinks_step4_safe_links' && step.licenseCheck) {
            console.log("[Keepnet] Safe Links not found - checking license requirement")
            this.panel.showError(`Safe Links Bulunamadı\n\n${step.licenseCheck.message}\n\n${step.licenseCheck.skipMessage}`)
            
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
    if (step.id === 8 && step.name === 'step9_ip_input') {
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
    if (step.id === 9 || step.name === 'antispam_step5_add_ips') {
      html += `
        <div style="background: linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(45, 45, 74, 0.8)); border: 2px solid #4a9eff; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #4a9eff; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            📋 White List IP Adresleri
          </div>
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 8px; margin-bottom: 8px; font-family: 'Courier New', monospace; font-size: 13px; color: #E2E8F0;">
            <div style="padding: 4px 0;">149.72.161.59</div>
            <div style="padding: 4px 0;">149.72.42.201</div>
            <div style="padding: 4px 0;">149.72.154.87</div>
          </div>
          <button id="keepnet-copy-ips-btn" style="
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
          </button>
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
    if (step.id === 9 || step.name === 'antispam_step5_add_ips') {
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
    
    // Validate
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
    
    // Clear highlight (eğer valid değilse temizleme, kullanıcı girsin)
    if (isValid) {
      this.clearHighlight()
    }
    
    // NextTarget varsa, ikinci elementi bul ve highlight et
    if (step.nextTarget && isValid) {
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
    
    // OTOMATIK SONRAKI ADIMA GEÇ - Sadece valid ise!
    if (isValid) {
      console.log(`[Keepnet] Step ${step.id} tamamlandı, otomatik sonraki adıma geçiliyor...`)
      await Utils.sleep(500)
      await this.nextStep()
    } else if (step.criticalStep) {
      // Kritik adımda validation başarısızsa uyar
      this.panel.showError(`${i18n('pleaseComplete')} ${i18n(step.title)}`)
    } else {
      // Kritik olmayan adımda da geç
      await Utils.sleep(500)
      await this.nextStep()
    }
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
      
      if (step.id === 8) {
        // IP validation
        const panel = document.querySelector('.ms-Panel-main')
        if (!panel) return
        
        const text = panel.innerText
        const requiredIPs = step.requiredIPs || []
        const found = requiredIPs.filter(ip => text.includes(ip))
        const missing = requiredIPs.filter(ip => !text.includes(ip))
        
        if (missing.length > 0) {
          this.panel.showError(`IP girmeyi unuttunuz: ${missing.join(', ')}`)
        } else {
          this.panel.showSuccess(`Tüm IP'ler eklendi! (${found.length}/3)`)
        }
      }
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
    if (this.currentStep >= totalSteps) {
      await this.showSummary()
    } else {
      await this.executeStep(this.currentStep + 1)
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
        <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #FFFFFF;">
          ${i18n('summaryReport')} - ${this.workflowName}
        </h2>
        <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
    `
    
    // Summary adımını hariç tut
    const stepsToShow = this.currentWorkflow.filter(s => !s.isSummary)
    
    for (let i = 0; i < stepsToShow.length; i++) {
      const step = stepsToShow[i]
      const result = this.stepResults[step.id]
      const screenshot = screenshots[step.name]
      
      const status = result?.valid ? '✅' : (result ? '❌' : '⏳')
      
      html += `
        <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <div style="font-size: 18px; margin-right: 10px;">${status}</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 500; color: #111827;">
              ${i18n(step.title)}
            </div>
            ${screenshot ? `<div style="font-size: 11px; color: #6b7280;">Screenshot: ${step.name}.png</div>` : ''}
          </div>
          ${!result?.valid ? `
            <button 
              class="keepnet-goto-step-btn" 
              data-step-id="${step.id}" 
              data-workflow="${this.workflowName}"
              style="
                padding: 4px 8px;
                font-size: 11px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              ">${i18n('goAndFix')}</button>
          ` : ''}
        </div>
      `
    }
    
    html += `
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; font-size: 12px; color: #1e40af;">
          💾 ${i18n('allScreenshotsSaved')}
        </div>
    `
    
    // WORKFLOW_6 için özel tebrik mesajı
    if (this.workflowName === 'WORKFLOW_6') {
      html += `
        <div style="
          background: linear-gradient(135deg,rgb(49, 47, 54) 0%,rgb(144, 177, 234) 100%);
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
          color: white;
          text-align: center;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
        ">
          <div style="font-size: 48px; margin-bottom: 12px;">🎊</div>
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">
            Tebrikler! Tüm Adımları Tamamladınız!
          </div>
          <div style="font-size: 13px; line-height: 1.6; opacity: 0.95;">
            Bu adımlar ile Office 365 ortamında IP adreslerini beyaz listeye aldınız ve<br>
            güvenlik simülasyonları, spam filtreleme ve tehdit öncesi (ATP) özelliklerini<br>
            başarıyla yapılandırdınız!
          </div>
          <div style="font-size: 14px; font-weight: 600; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.3);">
            ✅ 6 Workflow Tamamlandı • 62 Adım Başarılı • 🎉
          </div>
        </div>
      `
    }
    
    // Sonraki workflow var mı kontrol et
    let nextWorkflowText = ''
    let hasNextWorkflow = false
    
    console.log("[Keepnet] Summary step - Current workflowName:", this.workflowName)
    
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
      console.log("[Keepnet] WORKFLOW_5 summary - hasNextWorkflow:", hasNextWorkflow, "nextWorkflowText:", nextWorkflowText)
    } else if (this.workflowName === 'WORKFLOW_6') {
      nextWorkflowText = '🎊 Tebrikler! Tüm Workflow\'lar Tamamlandı'
      hasNextWorkflow = false
    } else {
      nextWorkflowText = '✅ Tüm Workflow\'lar Tamamlandı'
      hasNextWorkflow = false
    }
    
    html += `
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button id="keepnet-continue-workflow-btn" ${!hasNextWorkflow ? 'disabled' : ''} class="keepnet-workflow-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: ${hasNextWorkflow ? 'linear-gradient(135deg,rgb(35, 30, 58) 0%,rgb(21, 51, 64) 100%)' : 'linear-gradient(135deg,rgb(85, 83, 223) 0%,rgb(48, 74, 221) 100%)'};
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: ${hasNextWorkflow ? 'pointer' : 'default'};
            transition: all 0.2s;
            box-shadow: ${hasNextWorkflow ? '0 2px 4px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(167, 139, 250, 0.4)'};
          ">
            ${hasNextWorkflow ? '➡️' : '✅'} ${nextWorkflowText}
          </button>
        </div>
      </div>
    `
    
    this.panel.setContent(html)
    
    // Show confetti celebration ONLY on final workflow!
    if (this.workflowName === 'WORKFLOW_6') {
      console.log("[Keepnet] FINAL WORKFLOW COMPLETED! Showing confetti celebration!")
      setTimeout(() => {
        AnimationUtils.showConfetti(document.body)
      }, 300)
      
      // Extra confetti for final workflow
      setTimeout(() => {
        AnimationUtils.showConfetti(document.body)
      }, 800)
    }
    
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
      console.log("[Keepnet] Ping received, responding...")
      sendResponse({ ok: true })
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
    
    // NOT: Fixing flag'ini temizleme burada, init() içinde temizlenecek
    
    // Asistan başlat
    setTimeout(async () => {
      chrome.runtime.sendMessage({ action: 'initAssistant' }, (response) => {
        console.log("[Keepnet] initAssistant response:", response)
        
        // Panel'i force visible et
        setTimeout(() => {
          const panel = document.querySelector('#keepnet-floating-panel')
          if (panel) {
            panel.style.display = 'flex'
            panel.style.opacity = '1'
            panel.style.visibility = 'visible'
            panel.style.zIndex = '2147483647'
            console.log("[Keepnet] Panel force visible!")
          }
        }, 500)
      })
    }, 1000)
    return
  }
  
  // Workflow geçiş modu kontrolü
  const nextWorkflow = await Storage.get('keepnet_next_workflow')
  if (nextWorkflow) {
    console.log("[Keepnet] 🚀 New workflow detected:", nextWorkflow)
    
    // Flag'i temizle
    await Storage.set('keepnet_next_workflow', null)
    
    // Kısa bekleme, sonra asistan başlat
    setTimeout(async () => {
      console.log("[Keepnet] Starting new workflow after page load...")
      chrome.runtime.sendMessage({ action: 'initAssistant' }, (response) => {
        console.log("[Keepnet] initAssistant response:", response)
        
        // Panel'i force visible et
        setTimeout(() => {
          const panel = document.querySelector('#keepnet-floating-panel')
          if (panel) {
            panel.style.display = 'flex'
            panel.style.opacity = '1'
            panel.style.visibility = 'visible'
            panel.style.zIndex = '2147483647'
            console.log("[Keepnet] Panel force visible!")
          }
        }, 500)
      })
    }, 1000)
    return
  }
  
  // Normal mod - aktif session var mı?
  const currentStep = await Storage.get(STORAGE_KEYS.CURRENT_STEP)
  if (currentStep && currentStep > 0) {
    console.log("[Keepnet] 🔄 Active session detected! Restoring assistant from step:", currentStep)
    
    // Asistan başlat
    setTimeout(async () => {
      chrome.runtime.sendMessage({ action: 'initAssistant' }, (response) => {
        console.log("[Keepnet] initAssistant response:", response)
        
        // Panel'i force visible et
        setTimeout(() => {
          const panel = document.querySelector('#keepnet-floating-panel')
          if (panel) {
            panel.style.display = 'flex'
            panel.style.opacity = '1'
            panel.style.visibility = 'visible'
            panel.style.zIndex = '2147483647'
            console.log("[Keepnet] Panel force visible!")
          }
        }, 500)
      })
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
      console.log("[Keepnet] nextWorkflow found, starting assistant...")
      await Storage.set('keepnet_next_workflow', null)
      chrome.runtime.sendMessage({ action: 'initAssistant' })
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
