// Keepnet Whitelist Assistant v3.1 - Third-Party Phishing Simulations Only
// Tek panel (sol-alt), otomatik tıklama, gerçek zamanlı validation, screenshot kanıt sistemi

console.log("[Keepnet v3.1] Content script loaded on", location.href)

/* ========== CONSTANTS & GLOBALS ========== */
const STORAGE_KEYS = {
  PANEL_STATE: 'keepnet_panel_state_v3',
  STEP_RESULTS: 'keepnet_step_results_v3',
  SCREENSHOTS: 'keepnet_screenshots_v3',
  CURRENT_STEP: 'keepnet_current_step_v3',
  LANGUAGE: 'keepnet_language_v3'
}

const PANEL_SIZE = { width: 340, height: 520 }
const AUTO_CLICK_TIMEOUT = 10000 // 10 saniye
const VALIDATION_INTERVAL = 1000 // 1 saniye

let CURRENT_STEP = 0
let TOTAL_STEPS = 12  // Third-Party Phishing: 12 adım
let LANGUAGE = 'en-US' // Default: English (US)
let screenshotCounter = 0

/* ========== i18n TRANSLATIONS ========== */
const TRANSLATIONS = {
  'en-US': {
    name: '🇺🇸 English (US)',
    brandName: 'KEEPNET LABS',
    stepOf: 'Step {current} of {total}',
    clickToExpand: 'Click to expand',
    formActive: 'FORM ACTIVE',
    back: 'BACK',
    continue: 'CONTINUE',
    summary: 'SUMMARY',
    copyAllIPs: 'COPY ALL IPs',
    copied: 'COPIED',
    error: 'ERROR',
    workflow1: 'Advanced Delivery',
    workflow2: 'Anti-Spam Policies',
    workflow3: 'Safe Links',
    workflow4: 'Mail Flow Rules',
    allWorkflowsCompleted: 'All workflows completed successfully!',
    elementNotFound: 'Element not found: {title}\n\nPlease continue manually.',
    pleaseComplete: 'Please complete: {title}',
    missingIPs: 'Missing IPs: {ips}',
    allIPsAdded: 'All IPs added successfully ({count}/3)',
    ipsAutoAdded: 'IPs automatically added',
    stepIncomplete: 'Step incomplete but continuing...',
    configCompleted: 'CONFIGURATION COMPLETED SUCCESSFULLY',
    allStepsSuccessful: '{count} WORKFLOWS COMPLETED • ALL STEPS SUCCESSFUL',
    summaryReport: 'Summary Report - {workflow}',
    continueToWorkflow: 'Continue to Workflow {number}: {name}',
    importantNotice: 'Important Notice',
    overlayWarning: "Don't click on Microsoft form's gray overlay area! If you do, the form will close and your entries may be lost. Only click on the white form area and Keepnet panel.",
    completed: 'COMPLETED',
    mailFlowRulesCompleted: 'MAIL FLOW RULES COMPLETED',

    configDescription: 'You have successfully whitelisted IP addresses in Office 365<br>and configured security simulations, spam filtering,<br>and Advanced Threat Protection (ATP) features!',
    // Step translations
    step1_home_title: 'Security Center Homepage',
    step1_home_desc: 'Make sure you are on Microsoft Security Center and continue.',
    step2_emailcollab_title: 'Email & Collaboration',
    step2_emailcollab_desc: 'Open the Email & Collaboration menu',
    step3_policies_title: 'Policies & Rules',
    step3_policies_desc: 'Go to Policies & Rules page',
    antispam_step1_navigate_title: 'Navigate to Anti-Spam',
    antispam_step1_navigate_desc: 'Navigate to the Anti-Spam policies page'
    ,
    // Mail Flow Rules - Rule 1 (SCL -1)
    mailflow_step1_navigate_title: 'Exchange Admin Portal',
    mailflow_step1_navigate_desc: 'Go to Exchange Admin → Mail flow → Rules',
    rule1_step1_add_rule_title: 'Rule 1: Add a Rule',
    rule1_step1_add_rule_desc: 'Click the + Add a rule button',
    rule1_step2_create_new_title: 'Rule 1: Create a New Rule',
    rule1_step2_create_new_desc: 'Click the "Create a new rule" option',
    rule1_step3_rule_name_title: 'Rule 1: Rule Name',
    rule1_step3_rule_name_desc: 'Enter a name (e.g., "Keepnet Bypass Spam Filter")',
    rule1_step4_apply_if_title: 'Rule 1: Apply This Rule If',
    rule1_step4_apply_if_desc: 'Open "Apply this rule if...", select "The sender"',
    rule1_step5_the_sender_title: 'Rule 1: The Sender',
    rule1_step5_the_sender_desc: 'Choose "The sender"',
    rule1_step6_ip_dropdown_title: 'Rule 1: IP Address Selection',
    rule1_step6_ip_dropdown_desc: 'Open the second dropdown',
    rule1_step7_ip_option_title: 'Rule 1: IP Address Option',
    rule1_step7_ip_option_desc: 'Select "IP address is in any of these ranges or exactly matches"',
    rule1_step8_enter_ips_title: 'Rule 1: Enter IP Addresses',
    rule1_step8_enter_ips_desc: 'Enter IPs (149.72.161.59, 149.72.42.201, 149.72.154.87) and click Add for each',
    rule1_step9_do_following_title: 'Rule 1: Do The Following',
    rule1_step9_do_following_desc: 'Open "Do the following" and select "Modify the message properties"',
    rule1_step10_modify_props_title: 'Rule 1: Modify Message Properties',
    rule1_step10_modify_props_desc: 'Select "Modify the message properties"',
    rule1_step11_scl_title: 'Rule 1: Set SCL',
    rule1_step11_scl_desc: 'Select "set the spam confidence level (SCL)"',
    rule1_step12_bypass_spam_title: 'Rule 1: Bypass Spam Filtering',
    rule1_step12_bypass_spam_desc: 'From SCL dropdown, choose "Bypass spam filtering" (-1)',
    rule1_step13_add_action_title: 'Rule 1: Add Action (+)',
    rule1_step13_add_action_desc: 'Click the + button next to "Do the following"',
    rule1_step14_set_header_title: 'Rule 1: Set Message Header',
    rule1_step14_set_header_desc: 'Choose "set a message header"',
    rule1_step15_header_name_title: 'Rule 1: Header Name',
    rule1_step15_header_name_desc: 'Enter header name "X-MS-Exchange-Organization-BypassClutter"',
    rule1_step16_header_value_title: 'Rule 1: Header Value',
    rule1_step16_header_value_desc: 'Enter header value "true"',
    rule1_step17_save_title: 'Rule 1: Save',
    rule1_step17_save_desc: 'Click Save to store the rule',
    // Mail Flow Rules - Rule 2 (Skip Safe Links)
    rule2_step1_add_rule_title: 'Rule 2: Add a Rule',
    rule2_step1_add_rule_desc: 'Click the + Add a rule button',
    rule2_step2_create_new_title: 'Rule 2: Create a New Rule',
    rule2_step2_create_new_desc: 'Click the "Create a new rule" option',
    rule2_step3_rule_name_title: 'Rule 2: Rule Name',
    rule2_step3_rule_name_desc: 'Enter a name (e.g., "Keepnet Skip Safe Links Processing")',
    rule2_step4_apply_sender_ip_title: 'Rule 2: Apply This Rule If (Sender IP)',
    rule2_step4_apply_sender_ip_desc: 'Select "The sender" → IP address is in any of these ranges, then add Keepnet IPs',
    rule2_step5_set_header_title: 'Rule 2: Set Message Header',
    rule2_step5_set_header_desc: 'Set header to "X-MS-Exchange-Organization-SkipSafeLinksProcessing" with value "1"',
    rule2_step6_save_title: 'Rule 2: Save',
    rule2_step6_save_desc: 'Click Save to store the rule',
    // Mail Flow Rules - Rule 3 (Skip Safe Attachments)
    rule3_step1_add_rule_title: 'Rule 3: Add a Rule',
    rule3_step1_add_rule_desc: 'Click the + Add a rule button',
    rule3_step2_create_new_title: 'Rule 3: Create a New Rule',
    rule3_step2_create_new_desc: 'Click the "Create a new rule" option',
    rule3_step3_rule_name_title: 'Rule 3: Rule Name',
    rule3_step3_rule_name_desc: 'Enter a name (e.g., "Keepnet Skip Safe Attachments Processing")',
    rule3_step4_apply_sender_ip_title: 'Rule 3: Apply This Rule If (Sender IP)',
    rule3_step4_apply_sender_ip_desc: 'Select "The sender" → IP address is in any of these ranges, then add Keepnet IPs',
    rule3_step5_set_header_title: 'Rule 3: Set Message Header',
    rule3_step5_set_header_desc: 'Set header to "X-MS-Exchange-Organization-SkipSafeAttachmentProcessing" with value "1"',
    rule3_step6_save_title: 'Rule 3: Save & Complete',
    rule3_step6_save_desc: 'Click Save to store the rule. All 3 mail flow rules are complete.',
    mailflow_summary_title: 'MAIL FLOW RULES COMPLETED',
    mailflow_summary_desc: '3 rules created successfully: Bypass Spam Filter, Skip Safe Links, Skip Safe Attachments'
  },
  'en-GB': {
    name: '🇬🇧 English (UK)',
    brandName: 'KEEPNET LABS',
    stepOf: 'Step {current} of {total}',
    clickToExpand: 'Click to expand',
    formActive: 'FORM ACTIVE',
    back: 'BACK',
    continue: 'CONTINUE',
    summary: 'SUMMARY',
    copyAllIPs: 'COPY ALL IPs',
    copied: 'COPIED',
    error: 'ERROR',
    workflow1: 'Advanced Delivery',
    workflow2: 'Anti-Spam Policies',
    workflow3: 'Safe Links',
    workflow4: 'Mail Flow Rules',
    allWorkflowsCompleted: 'All workflows completed successfully!',
    elementNotFound: 'Element not found: {title}\n\nPlease continue manually.',
    pleaseComplete: 'Please complete: {title}',
    missingIPs: 'Missing IPs: {ips}',
    allIPsAdded: 'All IPs added successfully ({count}/3)',
    ipsAutoAdded: 'IPs automatically added',
    stepIncomplete: 'Step incomplete but continuing...',
    configCompleted: 'CONFIGURATION COMPLETED SUCCESSFULLY',
    allStepsSuccessful: '{count} WORKFLOWS COMPLETED • ALL STEPS SUCCESSFUL',
    summaryReport: 'Summary Report - {workflow}',
    continueToWorkflow: 'Continue to Workflow {number}: {name}',
    importantNotice: 'Important Notice',
    overlayWarning: "Don't click on Microsoft form's grey overlay area! If you do, the form will close and your entries may be lost. Only click on the white form area and Keepnet panel.",
    completed: 'COMPLETED',
    mailFlowRulesCompleted: 'MAIL FLOW RULES COMPLETED',
    configDescription: 'You have successfully whitelisted IP addresses in Office 365<br>and configured security simulations, spam filtering,<br>and Advanced Threat Protection (ATP) features!'
  },
  'tr': {
    name: '🇹🇷 Türkçe',
    brandName: 'KEEPNET LABS',
    stepOf: 'Adım {current} / {total}',
    clickToExpand: 'Genişletmek için tıklayın',
    formActive: 'FORM AKTİF',
    back: 'GERİ',
    continue: 'DEVAM ET',
    summary: 'ÖZET',
    copyAllIPs: 'TÜM IP\'LERİ KOPYALA',
    copied: 'KOPYALANDI',
    error: 'HATA',
    workflow1: 'Gelişmiş Teslimat',
    workflow2: 'Anti-Spam Politikaları',
    workflow3: 'Güvenli Bağlantılar',
    workflow4: 'Mail Flow Kuralları',
    allWorkflowsCompleted: 'Tüm iş akışları başarıyla tamamlandı!',
    elementNotFound: 'Element bulunamadı: {title}\n\nLütfen manuel olarak devam edin.',
    pleaseComplete: 'Lütfen tamamlayın: {title}',
    missingIPs: 'Eksik IP\'ler: {ips}',
    allIPsAdded: 'Tüm IP\'ler başarıyla eklendi ({count}/3)',
    ipsAutoAdded: 'IP\'ler otomatik olarak eklendi',
    stepIncomplete: 'Adım tamamlanmadı ama devam ediliyor...',
    configCompleted: 'YAPILANDIRMA BAŞARIYLA TAMAMLANDI',
    allStepsSuccessful: '{count} İŞ AKIŞI TAMAMLANDI • TÜM ADIMLAR BAŞARILI',
    summaryReport: 'Özet Rapor - {workflow}',
    continueToWorkflow: 'Workflow {number}\'e Devam Et: {name}',
    importantNotice: 'Önemli Uyarı',
    overlayWarning: "Microsoft'un açılan form paneline tıklarken overlay'e (gri alana) tıklamayın! Aksi halde panel kapanır ve girdiğiniz bilgiler kaybolabilir. Sadece form alanlarına tıklayın.",
    completed: 'TAMAMLANDI',
    mailFlowRulesCompleted: 'MAIL FLOW KURALLARI TAMAMLANDI',
    configDescription: 'Bu adımlar ile Office 365 ortamında IP adreslerini beyaz listeye aldınız ve<br>güvenlik simülasyonları, spam filtreleme ve tehdit öncesi (ATP) özelliklerini<br>başarıyla yapılandırdınız!',
    // Adım çevirileri
    step1_home_title: 'Security Center Ana Sayfası',
    step1_home_desc: 'Microsoft Security Center\'da olduğunuzdan emin olun ve devam edin.',
    step2_emailcollab_title: 'E-posta ve İşbirliği',
    step2_emailcollab_desc: 'E-posta ve işbirliği menüsünü açın',
    step3_policies_title: 'İlkeler ve Kurallar',
    step3_policies_desc: 'İlkeler ve kurallar sayfasına gidin',
    antispam_step1_navigate_title: 'Anti-Spam\'e Git',
    antispam_step1_navigate_desc: 'Anti-Spam politikaları sayfasına gidin'
    ,
    // Mail Flow Rules - Rule 1 (SCL -1)
    mailflow_step1_navigate_title: 'Exchange Admin Portal',
    mailflow_step1_navigate_desc: 'Exchange Admin → Mail flow → Rules sayfasına gidin',
    rule1_step1_add_rule_title: 'Kural 1: Add a Rule',
    rule1_step1_add_rule_desc: '+ Add a rule butonuna tıklayın',
    rule1_step2_create_new_title: 'Kural 1: Create a New Rule',
    rule1_step2_create_new_desc: '"Create a new rule" seçeneğine tıklayın',
    rule1_step3_rule_name_title: 'Kural 1: Rule Name',
    rule1_step3_rule_name_desc: 'Kural için bir isim girin (örn: "Keepnet Bypass Spam Filter")',
    rule1_step4_apply_if_title: 'Kural 1: Apply This Rule If',
    rule1_step4_apply_if_desc: 'Scroll down ve "Apply this rule if..." dropdown\'ını açın, "The sender" seçin',
    rule1_step5_the_sender_title: 'Kural 1: The Sender',
    rule1_step5_the_sender_desc: '"The sender" seçeneğini seçin',
    rule1_step6_ip_dropdown_title: 'Kural 1: IP Address Selection',
    rule1_step6_ip_dropdown_desc: 'İkinci dropdown\'u açın',
    rule1_step7_ip_option_title: 'Kural 1: IP Address Option',
    rule1_step7_ip_option_desc: '"IP address is in any of these ranges or exactly matches" seçeneğini seçin',
    rule1_step8_enter_ips_title: 'Kural 1: Enter IP Addresses',
    rule1_step8_enter_ips_desc: 'IP adreslerini girin (149.72.161.59, 149.72.42.201, 149.72.154.87) ve her biri için Add\'e basın',
    rule1_step9_do_following_title: 'Kural 1: Do The Following',
    rule1_step9_do_following_desc: '"Do the following" açın ve "Modify the message properties" seçin',
    rule1_step10_modify_props_title: 'Kural 1: Modify Message Properties',
    rule1_step10_modify_props_desc: '"Modify the message properties" seçeneğini seçin',
    rule1_step11_scl_title: 'Kural 1: Set SCL',
    rule1_step11_scl_desc: '"set the spam confidence level (SCL)" seçin',
    rule1_step12_bypass_spam_title: 'Kural 1: Bypass Spam Filtering',
    rule1_step12_bypass_spam_desc: 'SCL dropdown\'ından "Bypass spam filtering" (-1) seçin',
    rule1_step13_add_action_title: 'Kural 1: Add Action (+)',
    rule1_step13_add_action_desc: '"Do the following" yanındaki + butonuna tıklayın',
    rule1_step14_set_header_title: 'Kural 1: Set Message Header',
    rule1_step14_set_header_desc: '"set a message header" seçin',
    rule1_step15_header_name_title: 'Kural 1: Header Name',
    rule1_step15_header_name_desc: 'Header adı "X-MS-Exchange-Organization-BypassClutter" girin',
    rule1_step16_header_value_title: 'Kural 1: Header Value',
    rule1_step16_header_value_desc: 'Header value olarak "true" girin',
    rule1_step17_save_title: 'Kural 1: Save',
    rule1_step17_save_desc: 'Kuralı kaydetmek için Save\'e tıklayın',
    // Mail Flow Rules - Rule 2 (Skip Safe Links)
    rule2_step1_add_rule_title: 'Kural 2: Add a Rule',
    rule2_step1_add_rule_desc: 'Tekrar + Add a rule butonuna tıklayın',
    rule2_step2_create_new_title: 'Kural 2: Create a New Rule',
    rule2_step2_create_new_desc: '"Create a new rule" seçeneğine tıklayın',
    rule2_step3_rule_name_title: 'Kural 2: Rule Name',
    rule2_step3_rule_name_desc: 'İsim girin (örn: "Keepnet Skip Safe Links Processing")',
    rule2_step4_apply_sender_ip_title: 'Kural 2: Apply This Rule If (Sender IP)',
    rule2_step4_apply_sender_ip_desc: '"The sender" → IP ranges seçin ve IP\'leri ekleyin',
    rule2_step5_set_header_title: 'Kural 2: Set Message Header',
    rule2_step5_set_header_desc: 'Header: "X-MS-Exchange-Organization-SkipSafeLinksProcessing", Value: "1"',
    rule2_step6_save_title: 'Kural 2: Save',
    rule2_step6_save_desc: 'Kuralı kaydedin',
    // Mail Flow Rules - Rule 3 (Skip Safe Attachments)
    rule3_step1_add_rule_title: 'Kural 3: Add a Rule',
    rule3_step1_add_rule_desc: 'Tekrar + Add a rule butonuna tıklayın',
    rule3_step2_create_new_title: 'Kural 3: Create a New Rule',
    rule3_step2_create_new_desc: '"Create a new rule" seçeneğine tıklayın',
    rule3_step3_rule_name_title: 'Kural 3: Rule Name',
    rule3_step3_rule_name_desc: 'İsim girin (örn: "Keepnet Skip Safe Attachments Processing")',
    rule3_step4_apply_sender_ip_title: 'Kural 3: Apply This Rule If (Sender IP)',
    rule3_step4_apply_sender_ip_desc: '"The sender" → IP ranges seçin ve IP\'leri ekleyin',
    rule3_step5_set_header_title: 'Kural 3: Set Message Header',
    rule3_step5_set_header_desc: 'Header: "X-MS-Exchange-Organization-SkipSafeAttachmentProcessing", Value: "1"',
    rule3_step6_save_title: 'Kural 3: Save & Complete',
    rule3_step6_save_desc: 'Kuralı kaydedin. 3 mail flow kuralı tamamlandı!',
    mailflow_summary_title: 'MAIL FLOW KURALLARI TAMAMLANDI',
    mailflow_summary_desc: '3 kural başarıyla oluşturuldu: Bypass Spam Filter, Skip Safe Links, Skip Safe Attachments'
  },
  'de': {
    name: '🇩🇪 Deutsch',
    brandName: 'KEEPNET LABS',
    stepOf: 'Schritt {current} von {total}',
    clickToExpand: 'Zum Erweitern klicken',
    formActive: 'FORMULAR AKTIV',
    back: 'ZURÜCK',
    continue: 'WEITER',
    summary: 'ZUSAMMENFASSUNG',
    copyAllIPs: 'ALLE IPs KOPIEREN',
    copied: 'KOPIERT',
    error: 'FEHLER',
    workflow1: 'Erweiterte Zustellung',
    workflow2: 'Anti-Spam-Richtlinien',
    workflow3: 'Sichere Links',
    workflow4: 'Nachrichtenflussregeln',
    allWorkflowsCompleted: 'Alle Workflows erfolgreich abgeschlossen!',
    elementNotFound: 'Element nicht gefunden: {title}\n\nBitte manuell fortfahren.',
    pleaseComplete: 'Bitte vervollständigen: {title}',
    missingIPs: 'Fehlende IPs: {ips}',
    allIPsAdded: 'Alle IPs erfolgreich hinzugefügt ({count}/3)',
    ipsAutoAdded: 'IPs automatisch hinzugefügt',
    stepIncomplete: 'Schritt unvollständig, aber fortfahrend...',
    configCompleted: 'KONFIGURATION ERFOLGREICH ABGESCHLOSSEN',
    allStepsSuccessful: '{count} WORKFLOWS ABGESCHLOSSEN • ALLE SCHRITTE ERFOLGREICH',
    summaryReport: 'Zusammenfassungsbericht - {workflow}',
    continueToWorkflow: 'Weiter zu Workflow {number}: {name}',
    importantNotice: 'Wichtiger Hinweis',
    overlayWarning: "Klicken Sie nicht auf den grauen Überlagerungsbereich des Microsoft-Formulars! Wenn Sie das tun, wird das Formular geschlossen und Ihre Eingaben können verloren gehen. Klicken Sie nur auf den weißen Formularbereich und das Keepnet-Panel.",
    completed: 'ABGESCHLOSSEN',
    mailFlowRulesCompleted: 'NACHRICHTENFLUSSREGELN ABGESCHLOSSEN',
    configDescription: 'Sie haben IP-Adressen in Office 365 erfolgreich auf die Whitelist gesetzt<br>und Sicherheitssimulationen, Spamfilterung<br>und erweiterte Bedrohungsschutz (ATP)-Funktionen konfiguriert!',
    // Schrittübersetzungen
    step1_home_title: 'Security Center Startseite',
    step1_home_desc: 'Stellen Sie sicher, dass Sie sich im Microsoft Security Center befinden und fahren Sie fort.',
    step2_emailcollab_title: 'E-Mail & Zusammenarbeit',
    step2_emailcollab_desc: 'Öffnen Sie das Menü E-Mail & Zusammenarbeit',
    step3_policies_title: 'Richtlinien & Regeln',
    step3_policies_desc: 'Gehen Sie zur Seite Richtlinien & Regeln',
    antispam_step1_navigate_title: 'Zu Anti-Spam navigieren',
    antispam_step1_navigate_desc: 'Navigieren Sie zur Anti-Spam-Richtlinienseite'
  },
  'fr': {
    name: '🇫🇷 Français',
    brandName: 'KEEPNET LABS',
    stepOf: 'Étape {current} sur {total}',
    clickToExpand: 'Cliquer pour agrandir',
    formActive: 'FORMULAIRE ACTIF',
    back: 'RETOUR',
    continue: 'CONTINUER',
    summary: 'RÉSUMÉ',
    copyAllIPs: 'COPIER TOUTES LES IPs',
    copied: 'COPIÉ',
    error: 'ERREUR',
    workflow1: 'Livraison Avancée',
    workflow2: 'Politiques Anti-Spam',
    workflow3: 'Liens Sécurisés',
    workflow4: 'Règles de Flux de Messagerie',
    allWorkflowsCompleted: 'Tous les flux de travail sont terminés avec succès!',
    elementNotFound: 'Élément non trouvé: {title}\n\nVeuillez continuer manuellement.',
    pleaseComplete: 'Veuillez compléter: {title}',
    missingIPs: 'IPs manquantes: {ips}',
    allIPsAdded: 'Toutes les IPs ajoutées avec succès ({count}/3)',
    ipsAutoAdded: 'IPs ajoutées automatiquement',
    stepIncomplete: 'Étape incomplète mais continuation...',
    configCompleted: 'CONFIGURATION TERMINÉE AVEC SUCCÈS',
    allStepsSuccessful: '{count} FLUX DE TRAVAIL TERMINÉS • TOUTES LES ÉTAPES RÉUSSIES',
    summaryReport: 'Rapport de Synthèse - {workflow}',
    continueToWorkflow: 'Continuer vers le Flux de travail {number}: {name}',
    importantNotice: 'Avis Important',
    overlayWarning: "Ne cliquez pas sur la zone de superposition grise du formulaire Microsoft! Si vous le faites, le formulaire se fermera et vos entrées pourraient être perdues. Cliquez uniquement sur la zone blanche du formulaire et le panneau Keepnet.",
    completed: 'TERMINÉ',
    mailFlowRulesCompleted: 'RÈGLES DE FLUX DE MESSAGERIE TERMINÉES',
    configDescription: 'Vous avez mis en liste blanche les adresses IP dans Office 365 avec succès<br>et configuré les simulations de sécurité, le filtrage du spam<br>et les fonctionnalités de protection avancée contre les menaces (ATP)!'
  },
  'es': {
    name: '🇪🇸 Español',
    brandName: 'KEEPNET LABS',
    stepOf: 'Paso {current} de {total}',
    clickToExpand: 'Haga clic para expandir',
    formActive: 'FORMULARIO ACTIVO',
    back: 'ATRÁS',
    continue: 'CONTINUAR',
    summary: 'RESUMEN',
    copyAllIPs: 'COPIAR TODAS LAS IPs',
    copied: 'COPIADO',
    error: 'ERROR',
    workflow1: 'Entrega Avanzada',
    workflow2: 'Políticas Anti-Spam',
    workflow3: 'Enlaces Seguros',
    workflow4: 'Reglas de Flujo de Correo',
    allWorkflowsCompleted: '¡Todos los flujos de trabajo completados con éxito!',
    elementNotFound: 'Elemento no encontrado: {title}\n\nPor favor continúe manualmente.',
    pleaseComplete: 'Por favor complete: {title}',
    missingIPs: 'IPs faltantes: {ips}',
    allIPsAdded: 'Todas las IPs agregadas con éxito ({count}/3)',
    ipsAutoAdded: 'IPs agregadas automáticamente',
    stepIncomplete: 'Paso incompleto pero continuando...',
    configCompleted: 'CONFIGURACIÓN COMPLETADA CON ÉXITO',
    allStepsSuccessful: '{count} FLUJOS DE TRABAJO COMPLETADOS • TODOS LOS PASOS EXITOSOS',
    summaryReport: 'Informe Resumido - {workflow}',
    continueToWorkflow: 'Continuar al Flujo de trabajo {number}: {name}',
    importantNotice: 'Aviso Importante',
    overlayWarning: "¡No haga clic en el área gris superpuesta del formulario de Microsoft! Si lo hace, el formulario se cerrará y sus entradas pueden perderse. Solo haga clic en el área blanca del formulario y el panel de Keepnet.",
    completed: 'COMPLETADO',
    mailFlowRulesCompleted: 'REGLAS DE FLUJO DE CORREO COMPLETADAS',
    configDescription: '¡Ha agregado exitosamente direcciones IP a la lista blanca en Office 365<br>y configurado simulaciones de seguridad, filtrado de spam<br>y funciones de Protección Avanzada contra Amenazas (ATP)!'
  },
  'it': {
    name: '🇮🇹 Italiano',
    brandName: 'KEEPNET LABS',
    stepOf: 'Passo {current} di {total}',
    clickToExpand: 'Clicca per espandere',
    formActive: 'MODULO ATTIVO',
    back: 'INDIETRO',
    continue: 'CONTINUA',
    summary: 'RIEPILOGO',
    copyAllIPs: 'COPIA TUTTI GLI IP',
    copied: 'COPIATO',
    error: 'ERRORE',
    workflow1: 'Consegna Avanzata',
    workflow2: 'Criteri Anti-Spam',
    workflow3: 'Collegamenti Sicuri',
    workflow4: 'Regole del Flusso di Posta',
    allWorkflowsCompleted: 'Tutti i flussi di lavoro completati con successo!',
    elementNotFound: 'Elemento non trovato: {title}\n\nSi prega di continuare manualmente.',
    pleaseComplete: 'Si prega di completare: {title}',
    missingIPs: 'IP mancanti: {ips}',
    allIPsAdded: 'Tutti gli IP aggiunti con successo ({count}/3)',
    ipsAutoAdded: 'IP aggiunti automaticamente',
    stepIncomplete: 'Passo incompleto ma continuando...',
    configCompleted: 'CONFIGURAZIONE COMPLETATA CON SUCCESSO',
    allStepsSuccessful: '{count} FLUSSI DI LAVORO COMPLETATI • TUTTI I PASSI RIUSCITI',
    summaryReport: 'Rapporto Riepilogativo - {workflow}',
    continueToWorkflow: 'Continua al Flusso di lavoro {number}: {name}',
    importantNotice: 'Avviso Importante',
    overlayWarning: "Non fare clic sull'area grigia sovrapposta del modulo Microsoft! Se lo fai, il modulo si chiuderà e le tue voci potrebbero andare perse. Fai clic solo sull'area bianca del modulo e sul pannello Keepnet.",
    completed: 'COMPLETATO',
    mailFlowRulesCompleted: 'REGOLE DEL FLUSSO DI POSTA COMPLETATE',
    configDescription: 'Hai inserito con successo gli indirizzi IP nella whitelist in Office 365<br>e configurato simulazioni di sicurezza, filtraggio spam<br>e funzionalità di Advanced Threat Protection (ATP)!'
  },
  'pt': {
    name: '🇵🇹 Português',
    brandName: 'KEEPNET LABS',
    stepOf: 'Passo {current} de {total}',
    clickToExpand: 'Clique para expandir',
    formActive: 'FORMULÁRIO ATIVO',
    back: 'VOLTAR',
    continue: 'CONTINUAR',
    summary: 'RESUMO',
    copyAllIPs: 'COPIAR TODOS OS IPs',
    copied: 'COPIADO',
    error: 'ERRO',
    workflow1: 'Entrega Avançada',
    workflow2: 'Políticas Anti-Spam',
    workflow3: 'Links Seguros',
    workflow4: 'Regras de Fluxo de Email',
    allWorkflowsCompleted: 'Todos os fluxos de trabalho concluídos com sucesso!',
    elementNotFound: 'Elemento não encontrado: {title}\n\nPor favor, continue manualmente.',
    pleaseComplete: 'Por favor, complete: {title}',
    missingIPs: 'IPs faltando: {ips}',
    allIPsAdded: 'Todos os IPs adicionados com sucesso ({count}/3)',
    ipsAutoAdded: 'IPs adicionados automaticamente',
    stepIncomplete: 'Passo incompleto mas continuando...',
    configCompleted: 'CONFIGURAÇÃO CONCLUÍDA COM SUCESSO',
    allStepsSuccessful: '{count} FLUXOS DE TRABALHO CONCLUÍDOS • TODOS OS PASSOS BEM-SUCEDIDOS',
    summaryReport: 'Relatório Resumido - {workflow}',
    continueToWorkflow: 'Continuar para o Fluxo de trabalho {number}: {name}',
    importantNotice: 'Aviso Importante',
    overlayWarning: "Não clique na área cinza sobreposta do formulário da Microsoft! Se você fizer isso, o formulário será fechado e suas entradas podem ser perdidas. Clique apenas na área branca do formulário e no painel Keepnet.",
    completed: 'CONCLUÍDO',
    mailFlowRulesCompleted: 'REGRAS DE FLUXO DE EMAIL CONCLUÍDAS',
    configDescription: 'Você adicionou com sucesso endereços IP à lista de permissões no Office 365<br>e configurou simulações de segurança, filtragem de spam<br>e recursos de Proteção Avançada contra Ameaças (ATP)!'
  },
  'ar': {
    name: '🇸🇦 العربية',
    brandName: 'KEEPNET LABS',
    stepOf: 'الخطوة {current} من {total}',
    clickToExpand: 'انقر للتوسيع',
    formActive: 'النموذج نشط',
    back: 'رجوع',
    continue: 'متابعة',
    summary: 'ملخص',
    copyAllIPs: 'نسخ جميع عناوين IP',
    copied: 'تم النسخ',
    error: 'خطأ',
    workflow1: 'التسليم المتقدم',
    workflow2: 'سياسات مكافحة البريد المزعج',
    workflow3: 'الروابط الآمنة',
    workflow4: 'قواعد تدفق البريد',
    allWorkflowsCompleted: 'تم إكمال جميع سير العمل بنجاح!',
    elementNotFound: 'العنصر غير موجود: {title}\n\nيرجى المتابعة يدويًا.',
    pleaseComplete: 'يرجى إكمال: {title}',
    missingIPs: 'عناوين IP مفقودة: {ips}',
    allIPsAdded: 'تمت إضافة جميع عناوين IP بنجاح ({count}/3)',
    ipsAutoAdded: 'تمت إضافة عناوين IP تلقائيًا',
    stepIncomplete: 'الخطوة غير مكتملة ولكن المتابعة...',
    configCompleted: 'اكتمل التكوين بنجاح',
    allStepsSuccessful: 'اكتمل {count} سير عمل • جميع الخطوات ناجحة',
    summaryReport: 'تقرير ملخص - {workflow}',
    continueToWorkflow: 'المتابعة إلى سير العمل {number}: {name}',
    importantNotice: 'إشعار هام',
    overlayWarning: "لا تنقر على منطقة التراكب الرمادية لنموذج Microsoft! إذا فعلت ذلك، سيتم إغلاق النموذج وقد تفقد إدخالاتك. انقر فقط على منطقة النموذج البيضاء ولوحة Keepnet.",
    completed: 'مكتمل',
    mailFlowRulesCompleted: 'قواعد تدفق البريد مكتملة',
    configDescription: 'لقد أضفت بنجاح عناوين IP إلى القائمة البيضاء في Office 365<br>وقمت بتكوين محاكاة الأمان وتصفية البريد المزعج<br>وميزات الحماية المتقدمة من التهديدات (ATP)!'
  },
  'nl': {
    name: '🇳🇱 Nederlands',
    brandName: 'KEEPNET LABS',
    stepOf: 'Stap {current} van {total}',
    clickToExpand: 'Klik om uit te breiden',
    formActive: 'FORMULIER ACTIEF',
    back: 'TERUG',
    continue: 'DOORGAAN',
    summary: 'SAMENVATTING',
    copyAllIPs: 'ALLE IP\'S KOPIËREN',
    copied: 'GEKOPIEERD',
    error: 'FOUT',
    workflow1: 'Geavanceerde Levering',
    workflow2: 'Anti-Spam Beleid',
    workflow3: 'Veilige Links',
    workflow4: 'E-mailstroom Regels',
    allWorkflowsCompleted: 'Alle workflows succesvol voltooid!',
    elementNotFound: 'Element niet gevonden: {title}\n\nGa handmatig verder.',
    pleaseComplete: 'Voltooi alstublieft: {title}',
    missingIPs: 'Ontbrekende IP\'s: {ips}',
    allIPsAdded: 'Alle IP\'s succesvol toegevoegd ({count}/3)',
    ipsAutoAdded: 'IP\'s automatisch toegevoegd',
    stepIncomplete: 'Stap onvolledig maar doorgaan...',
    configCompleted: 'CONFIGURATIE SUCCESVOL VOLTOOID',
    allStepsSuccessful: '{count} WORKFLOWS VOLTOOID • ALLE STAPPEN SUCCESVOL',
    summaryReport: 'Samenvattingsrapport - {workflow}',
    continueToWorkflow: 'Doorgaan naar Workflow {number}: {name}',
    importantNotice: 'Belangrijke Mededeling',
    overlayWarning: "Klik niet op het grijze overlay-gebied van het Microsoft-formulier! Als u dat doet, wordt het formulier gesloten en kunnen uw invoeren verloren gaan. Klik alleen op het witte formuliergebied en het Keepnet-paneel.",
    completed: 'VOLTOOID',
    mailFlowRulesCompleted: 'E-MAILSTROOM REGELS VOLTOOID',
    configDescription: 'U heeft met succes IP-adressen op de whitelist gezet in Office 365<br>en beveiligingssimulaties, spamfiltering<br>en Advanced Threat Protection (ATP) functies geconfigureerd!'
  },
  'ja': {
    name: '🇯🇵 日本語',
    brandName: 'KEEPNET LABS',
    stepOf: 'ステップ {current} / {total}',
    clickToExpand: 'クリックして展開',
    formActive: 'フォームアクティブ',
    back: '戻る',
    continue: '続行',
    summary: '概要',
    copyAllIPs: 'すべてのIPをコピー',
    copied: 'コピーしました',
    error: 'エラー',
    workflow1: '高度な配信',
    workflow2: 'スパム対策ポリシー',
    workflow3: '安全なリンク',
    workflow4: 'メールフロールール',
    allWorkflowsCompleted: 'すべてのワークフローが正常に完了しました！',
    elementNotFound: '要素が見つかりません: {title}\n\n手動で続行してください。',
    pleaseComplete: '完了してください: {title}',
    missingIPs: '不足しているIP: {ips}',
    allIPsAdded: 'すべてのIPが正常に追加されました ({count}/3)',
    ipsAutoAdded: 'IPが自動的に追加されました',
    stepIncomplete: 'ステップが不完全ですが続行中...',
    configCompleted: '構成が正常に完了しました',
    allStepsSuccessful: '{count}個のワークフローが完了 • すべてのステップが成功',
    summaryReport: '概要レポート - {workflow}',
    continueToWorkflow: 'ワークフロー{number}に続行: {name}',
    importantNotice: '重要なお知らせ',
    overlayWarning: "Microsoftフォームのグレーオーバーレイエリアをクリックしないでください！クリックすると、フォームが閉じて入力内容が失われる可能性があります。白いフォームエリアとKeepnetパネルのみをクリックしてください。",
    completed: '完了',
    mailFlowRulesCompleted: 'メールフロールールが完了',
    configDescription: 'Office 365でIPアドレスをホワイトリストに正常に追加し<br>セキュリティシミュレーション、スパムフィルタリング<br>Advanced Threat Protection (ATP)機能を構成しました！'
  },
  'zh-CN': {
    name: '🇨🇳 简体中文',
    brandName: 'KEEPNET LABS',
    stepOf: '步骤 {current} / {total}',
    clickToExpand: '点击展开',
    formActive: '表单激活',
    back: '返回',
    continue: '继续',
    summary: '摘要',
    copyAllIPs: '复制所有IP',
    copied: '已复制',
    error: '错误',
    workflow1: '高级投递',
    workflow2: '反垃圾邮件策略',
    workflow3: '安全链接',
    workflow4: '邮件流规则',
    allWorkflowsCompleted: '所有工作流已成功完成！',
    elementNotFound: '找不到元素: {title}\n\n请手动继续。',
    pleaseComplete: '请完成: {title}',
    missingIPs: '缺少IP: {ips}',
    allIPsAdded: '所有IP已成功添加 ({count}/3)',
    ipsAutoAdded: 'IP已自动添加',
    stepIncomplete: '步骤不完整但继续...',
    configCompleted: '配置成功完成',
    allStepsSuccessful: '{count}个工作流已完成 • 所有步骤成功',
    summaryReport: '摘要报告 - {workflow}',
    continueToWorkflow: '继续到工作流 {number}: {name}',
    importantNotice: '重要通知',
    overlayWarning: "不要点击Microsoft表单的灰色覆盖区域！如果这样做，表单将关闭，您的输入可能会丢失。只点击白色表单区域和Keepnet面板。",
    completed: '已完成',
    mailFlowRulesCompleted: '邮件流规则已完成',
    configDescription: '您已成功将IP地址添加到Office 365白名单<br>并配置了安全模拟、垃圾邮件过滤<br>和高级威胁防护 (ATP) 功能！'
  },
  'ko': {
    name: '🇰🇷 한국어',
    brandName: 'KEEPNET LABS',
    stepOf: '단계 {current} / {total}',
    clickToExpand: '클릭하여 확장',
    formActive: '양식 활성',
    back: '뒤로',
    continue: '계속',
    summary: '요약',
    copyAllIPs: '모든 IP 복사',
    copied: '복사됨',
    error: '오류',
    workflow1: '고급 배달',
    workflow2: '스팸 방지 정책',
    workflow3: '안전한 링크',
    workflow4: '메일 흐름 규칙',
    allWorkflowsCompleted: '모든 워크플로가 성공적으로 완료되었습니다!',
    elementNotFound: '요소를 찾을 수 없음: {title}\n\n수동으로 계속하십시오.',
    pleaseComplete: '완료하십시오: {title}',
    missingIPs: '누락된 IP: {ips}',
    allIPsAdded: '모든 IP가 성공적으로 추가됨 ({count}/3)',
    ipsAutoAdded: 'IP가 자동으로 추가됨',
    stepIncomplete: '단계가 불완전하지만 계속 중...',
    configCompleted: '구성이 성공적으로 완료됨',
    allStepsSuccessful: '{count}개 워크플로 완료 • 모든 단계 성공',
    summaryReport: '요약 보고서 - {workflow}',
    continueToWorkflow: '워크플로 {number}로 계속: {name}',
    importantNotice: '중요 공지',
    overlayWarning: "Microsoft 양식의 회색 오버레이 영역을 클릭하지 마십시오! 클릭하면 양식이 닫히고 입력 내용이 손실될 수 있습니다. 흰색 양식 영역과 Keepnet 패널만 클릭하십시오.",
    completed: '완료됨',
    mailFlowRulesCompleted: '메일 흐름 규칙 완료됨',
    configDescription: 'Office 365에서 IP 주소를 성공적으로 화이트리스트에 추가하고<br>보안 시뮬레이션, 스팸 필터링<br>고급 위협 방지 (ATP) 기능을 구성했습니다!'
  },
  'ru': {
    name: '🇷🇺 Русский',
    brandName: 'KEEPNET LABS',
    stepOf: 'Шаг {current} из {total}',
    clickToExpand: 'Нажмите, чтобы развернуть',
    formActive: 'ФОРМА АКТИВНА',
    back: 'НАЗАД',
    continue: 'ПРОДОЛЖИТЬ',
    summary: 'СВОДКА',
    copyAllIPs: 'КОПИРОВАТЬ ВСЕ IP',
    copied: 'СКОПИРОВАНО',
    error: 'ОШИБКА',
    workflow1: 'Расширенная Доставка',
    workflow2: 'Политики Защиты от Спама',
    workflow3: 'Безопасные Ссылки',
    workflow4: 'Правила Потока Почты',
    allWorkflowsCompleted: 'Все рабочие процессы успешно завершены!',
    elementNotFound: 'Элемент не найден: {title}\n\nПожалуйста, продолжите вручную.',
    pleaseComplete: 'Пожалуйста, завершите: {title}',
    missingIPs: 'Отсутствующие IP: {ips}',
    allIPsAdded: 'Все IP успешно добавлены ({count}/3)',
    ipsAutoAdded: 'IP добавлены автоматически',
    stepIncomplete: 'Шаг не завершен, но продолжаем...',
    configCompleted: 'КОНФИГУРАЦИЯ УСПЕШНО ЗАВЕРШЕНА',
    allStepsSuccessful: '{count} РАБОЧИХ ПРОЦЕССОВ ЗАВЕРШЕНО • ВСЕ ШАГИ УСПЕШНЫ',
    summaryReport: 'Сводный Отчет - {workflow}',
    continueToWorkflow: 'Продолжить к Рабочему процессу {number}: {name}',
    importantNotice: 'Важное Уведомление',
    overlayWarning: "Не нажимайте на серую область наложения формы Microsoft! Если вы сделаете это, форма закроется, и ваши записи могут быть потеряны. Нажимайте только на белую область формы и панель Keepnet.",
    completed: 'ЗАВЕРШЕНО',
    mailFlowRulesCompleted: 'ПРАВИЛА ПОТОКА ПОЧТЫ ЗАВЕРШЕНЫ',
    configDescription: 'Вы успешно добавили IP-адреса в белый список в Office 365<br>и настроили симуляции безопасности, фильтрацию спама<br>и функции Advanced Threat Protection (ATP)!'
  },
  'pl': {
    name: '🇵🇱 Polski',
    brandName: 'KEEPNET LABS',
    stepOf: 'Krok {current} z {total}',
    clickToExpand: 'Kliknij, aby rozwinąć',
    formActive: 'FORMULARZ AKTYWNY',
    back: 'WSTECZ',
    continue: 'KONTYNUUJ',
    summary: 'PODSUMOWANIE',
    copyAllIPs: 'KOPIUJ WSZYSTKIE IP',
    copied: 'SKOPIOWANO',
    error: 'BŁĄD',
    workflow1: 'Zaawansowane Dostarczanie',
    workflow2: 'Zasady Antyspamowe',
    workflow3: 'Bezpieczne Linki',
    workflow4: 'Reguły Przepływu Poczty',
    allWorkflowsCompleted: 'Wszystkie przepływy pracy zostały pomyślnie zakończone!',
    elementNotFound: 'Nie znaleziono elementu: {title}\n\nProszę kontynuować ręcznie.',
    pleaseComplete: 'Proszę uzupełnić: {title}',
    missingIPs: 'Brakujące IP: {ips}',
    allIPsAdded: 'Wszystkie IP zostały pomyślnie dodane ({count}/3)',
    ipsAutoAdded: 'IP zostały automatycznie dodane',
    stepIncomplete: 'Krok niekompletny, ale kontynuowanie...',
    configCompleted: 'KONFIGURACJA ZAKOŃCZONA POMYŚLNIE',
    allStepsSuccessful: '{count} PRZEPŁYWÓW PRACY ZAKOŃCZONYCH • WSZYSTKIE KROKI POMYŚLNE',
    summaryReport: 'Raport Podsumowujący - {workflow}',
    continueToWorkflow: 'Kontynuuj do Przepływu pracy {number}: {name}',
    importantNotice: 'Ważna Informacja',
    overlayWarning: "Nie klikaj w szary obszar nakładki formularza Microsoft! Jeśli to zrobisz, formularz zostanie zamknięty, a Twoje wpisy mogą zostać utracone. Klikaj tylko w biały obszar formularza i panel Keepnet.",
    completed: 'ZAKOŃCZONO',
    mailFlowRulesCompleted: 'REGUŁY PRZEPŁYWU POCZTY ZAKOŃCZONE',
    configDescription: 'Pomyślnie dodałeś adresy IP do białej listy w Office 365<br>i skonfigurowałeś symulacje bezpieczeństwa, filtrowanie spamu<br>oraz funkcje Advanced Threat Protection (ATP)!'
  }
}

// i18n helper function
function t(key, params = {}) {
  const translation = TRANSLATIONS[LANGUAGE]?.[key] || TRANSLATIONS['en-US'][key] || key
  return translation.replace(/\{(\w+)\}/g, (match, paramKey) => params[paramKey] || match)
}

/* ========== SPESIFIK AKIŞ: Third-Party Phishing Simulations ========== */
const WORKFLOW_STEPS = [
  {
    id: 1,
    name: 'step1_home',
    title: 'Security Center Ana Sayfası',
    description: 'Microsoft Security Center\'da olduğunuzdan emin olun ve devam edin.',
    navigate: 'https://security.microsoft.com/homepage',
    validation: () => {
      return document.location.href.startsWith('https://security.microsoft.com')
    }
  },
  {
    id: 2,
    name: 'step2_emailcollab',
    title: 'E-posta ve İşbirliği',
    description: 'E-posta ve işbirliği menüsünü açın',
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
    title: 'İlkeler ve Kurallar',
    description: 'İlkeler ve kurallar sayfasına gidin',
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
    waitAfterClick: 3000
  },
  {
    id: 4,
    name: 'step4_threat_policies',
    title: 'Tehdit İlkeleri',
    description: 'Tehdit ilkeleri\'ne tıklayın',
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
    waitAfterClick: 3000
  },
  {
    id: 5,
    name: 'step5_advanced_delivery',
    title: 'Advanced Delivery',
    description: 'Advanced delivery butonuna tıklayın',
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
    waitAfterClick: 3000
  },
  {
    id: 6,
    name: 'step6_phishing_simulation',
    title: 'Phishing Simulation Tab',
    description: 'Phishing simulation sekmesine tıklayın',
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
    waitAfterClick: 1500
  },
  {
    id: 7,
    name: 'step7_edit_button',
    title: 'Düzenle Butonu',
    description: 'Düzenle butonuna tıklayın',
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
    waitAfterClick: 2000
  },
  {
    id: 8,
    name: 'step8_domains_input',
    title: 'Etki Alanları',
    description: 'Etki alanlarını girin (örn: *.keepnetdomain.com)',
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
    id: 9,
    name: 'step9_ip_input',
    title: 'IP Adresleri',
    description: 'White list IP adreslerini girin',
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
    id: 10,
    name: 'step10_simulation_urls_input',
    title: 'Simülasyon URL\'leri',
    description: 'Simülasyon URL\'lerini girin',
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
    waitAfterClick: 500
  },
  {
    id: 11,
    name: 'step11_save',
    title: 'Kaydet',
    description: 'Değişiklikleri kaydedin',
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
    waitAfterClick: 2000
  },
  {
    id: 12,
    name: 'step12_summary',
    title: 'COMPLETED',
    description: 'Tüm adımlar başarıyla tamamlandı',
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
    title: 'Connection Filter Policy',
    description: 'Connection Filter Policy satırının checkbox\'ına tıklayın (satırı seçmek için)',
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
    waitAfterClick: 2000
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
    waitAfterClick: 2000
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
    waitAfterClick: 500
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
    waitAfterClick: 2000
  },
  {
    id: 8,
    name: 'antispam_summary',
    title: 'COMPLETED',
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
    waitAfterClick: 2000
  },
  {
    id: 4,
    name: 'safelinks_step4_safe_links',
    title: 'Safe Links',
    description: 'Safe Links\'e tıklayın',
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
    waitAfterClick: 2000
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
    waitAfterClick: 2000
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
    waitAfterClick: 500
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
    waitAfterClick: 2000
  },
  {
    id: 8,
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
    waitAfterClick: 500
  },
  {
    id: 9,
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
    waitAfterClick: 2000
  },
  {
    id: 10,
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
    waitAfterClick: 500
  },
  {
    id: 11,
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
    id: 12,
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
    waitAfterClick: 2000
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
    waitAfterClick: 2000
  },
  {
    id: 14,
    name: 'safelinks_summary',
    title: 'COMPLETED',
    description: 'Safe Links yapılandırması tamamlandı. Birkaç saat içinde etkili olacaktır.',
    isSummary: true
  }
]

/* ========== WORKFLOW 4: Spam Filter Bypass ========== */
/* ========== WORKFLOW 4: Mail Flow Rules (3 Kurallar) ========== */
const SPAM_FILTER_BYPASS_STEPS = [
  {
    id: 1,
    name: 'mailflow_step1_navigate',
    title: 'Exchange Admin Portal',
    description: 'Exchange Admin → Mail flow → Rules sayfasına gidin',
    navigate: 'https://admin.exchange.microsoft.com/#/transportrules',
    validation: () => {
      return document.location.href.includes('transportrules')
    },
    isNavigation: true
  },
  // KURAL 1: Bypass Spam Filter (SCL = -1)
  {
    id: 2,
    name: 'rule1_step1_add_rule',
    title: 'Kural 1: Add a Rule',
    description: '+ Add a rule butonuna tıklayın',
    target: {
      selector: 'button[aria-label*="Add a rule"]',
      fallback: [
        'button:has-text("Add a rule")',
        'button.ms-CommandBarItem-link:has-text("Add")',
        'button[name*="Add"]'
      ]
    },
    tooltip: '+ Add a rule butonuna tıklayın',
    autoClick: false,
    validation: () => {
      return !!document.querySelector('span.ms-ContextualMenu-itemText')
    },
    waitAfterClick: 1500
  },
  {
    id: 3,
    name: 'rule1_step2_create_new',
    title: 'Kural 1: Create a New Rule',
    description: '"Create a new rule" seçeneğine tıklayın',
    target: {
      selector: 'span.ms-ContextualMenu-itemText.label-685',
      fallback: [
        'button:has-text("Create a new rule")',
        'span:has-text("Create a new rule")',
        '[role="menuitem"]:has-text("Create")'
      ]
    },
    tooltip: 'Create a new rule seçeneğine tıklayın',
    autoClick: false,
    validation: () => {
      return !!document.querySelector('input[data-automation-id="EditTransportRule_Name_TextField"]')
    },
    waitAfterClick: 2000
  },
  {
    id: 4,
    name: 'rule1_step3_rule_name',
    title: 'Kural 1: Rule Name',
    description: 'Kural için bir isim girin (örn: "Keepnet Bypass Spam Filter")',
    target: {
      selector: 'input[data-automation-id="EditTransportRule_Name_TextField"]',
      fallback: [
        'input[type="text"][maxlength="64"]',
        'input[aria-labelledby*="TextFieldLabel"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Kural adını girin',
    autoClick: false,
    validation: () => {
      const input = document.querySelector('input[data-automation-id="EditTransportRule_Name_TextField"]')
      return input && input.value && input.value.length > 0
    },
    realTimeValidation: true,
    criticalStep: true
  },
  {
    id: 5,
    name: 'rule1_step4_apply_if',
    title: 'Kural 1: Apply This Rule If',
    description: 'Scroll down ve "Apply this rule if..." dropdown\'ını açın, "The sender" seçin',
    target: {
      selector: 'span.ms-Dropdown-title:has-text("Select one")',
      fallback: [
        '[id*="Dropdown"][id*="-option"]',
        'button[role="combobox"]:has-text("Select one")',
        '.ms-Dropdown'
      ]
    },
    tooltip: 'Apply this rule if dropdown\'ını açın',
    autoClick: false
  },
  {
    id: 6,
    name: 'rule1_step5_the_sender',
    title: 'Kural 1: The Sender',
    description: '"The sender" seçeneğini seçin',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-780:has-text("The sender")',
      fallback: [
        '[role="option"]:has-text("The sender")',
        'span:has-text("The sender")'
      ]
    },
    tooltip: 'The sender seçeneğini tıklayın',
    autoClick: false,
    waitAfterClick: 1000
  },
  {
    id: 7,
    name: 'rule1_step6_ip_dropdown',
    title: 'Kural 1: IP Address Selection',
    description: 'İkinci dropdown\'dan "IP address is in any of these ranges or exactly matches" seçin',
    target: {
      selector: 'span.ms-Dropdown-title.ms-Dropdown-titleIsPlaceHolder:has-text("Select one")',
      fallback: [
        '[id*="Dropdown944"]',
        'button[role="combobox"]'
      ]
    },
    tooltip: 'IP address dropdown\'ını açın',
    autoClick: false
  },
  {
    id: 8,
    name: 'rule1_step7_ip_option',
    title: 'Kural 1: IP Address Option',
    description: '"IP address is in any of these ranges or exactly matches" seçeneğini seçin',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-780:has-text("IP address is in any of these ranges")',
      fallback: [
        '[role="option"]:has-text("IP address")',
        'span:has-text("exactly matches")'
      ]
    },
    tooltip: 'IP address seçeneğini tıklayın',
    autoClick: false,
    waitAfterClick: 1500
  },
  {
    id: 9,
    name: 'rule1_step8_enter_ips',
    title: 'Kural 1: Enter IP Addresses',
    description: 'IP adreslerini girin (149.72.161.59, 149.72.42.201, 149.72.154.87) ve her birini Add butonuyla ekleyin',
    target: {
      selector: 'input[data-automation-id="SenderIpRanges_Input"]',
      fallback: [
        'input[placeholder*="IPv4 or IPv6"]',
        'input.ms-TextField-field[type="text"]'
      ]
    },
    tooltip: 'IP adreslerini girin ve Add butonuna basın',
    autoClick: false,
    realTimeValidation: true,
    criticalStep: true
  },
  {
    id: 10,
    name: 'rule1_step9_do_following',
    title: 'Kural 1: Do The Following',
    description: 'Scroll down, "Do the following" dropdown\'ını açın ve "Modify the message properties" seçin',
    target: {
      selector: 'span.ms-Dropdown-title:has-text("Select one")',
      fallback: [
        '[id*="Dropdown7373"]',
        'button[role="combobox"]'
      ]
    },
    tooltip: 'Do the following dropdown\'ını açın',
    autoClick: false
  },
  {
    id: 11,
    name: 'rule1_step10_modify_props',
    title: 'Kural 1: Modify Message Properties',
    description: '"Modify the message properties" seçeneğini seçin',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-780:has-text("Modify the message properties")',
      fallback: [
        '[role="option"]:has-text("Modify")',
        'span:has-text("message properties")'
      ]
    },
    tooltip: 'Modify the message properties seçeneğini tıklayın',
    autoClick: false,
    waitAfterClick: 1000
  },
  {
    id: 12,
    name: 'rule1_step11_scl',
    title: 'Kural 1: Set SCL',
    description: 'İkinci dropdown\'dan "set the spam confidence level (SCL)" seçin',
    target: {
      selector: 'span.ms-Dropdown-optionText.dropdownOptionText-780:has-text("set the spam confidence level")',
      fallback: [
        '[role="option"]:has-text("SCL")',
        'span:has-text("spam confidence")'
      ]
    },
    tooltip: 'Set the spam confidence level seçeneğini tıklayın',
    autoClick: false,
    waitAfterClick: 1000
  },
  {
    id: 13,
    name: 'rule1_step12_bypass_spam',
    title: 'Kural 1: Bypass Spam Filtering',
    description: 'SCL dropdown\'ından "Bypass spam filtering" (-1) seçin',
    target: {
      selector: 'span.ms-Dropdown-title:has-text("Bypass spam filtering")',
      fallback: [
        '[id*="Dropdown11599"]',
        '[role="option"]:has-text("Bypass spam")',
        'span:has-text("-1")'
      ]
    },
    tooltip: 'Bypass spam filtering seçeneğini tıklayın',
    autoClick: false,
    waitAfterClick: 1000
  },
  {
    id: 14,
    name: 'rule1_step13_add_action',
    title: 'Kural 1: Add Action (+)',
    description: '"Do the following" yanındaki + butonuna tıklayın (yeni action eklemek için)',
    target: {
      selector: 'button[aria-label*="Add action"]',
      fallback: [
        'button:has-text("+")',
        'button.ms-Button--icon:has-text("Add")',
        'button[data-automation-id*="AddAction"]'
      ]
    },
    tooltip: '+ Add action butonuna tıklayın',
    autoClick: false,
    waitAfterClick: 1000
  },
  {
    id: 15,
    name: 'rule1_step14_set_header',
    title: 'Kural 1: Set Message Header',
    description: '"Modify the message properties" → "set a message header" seçin',
    target: {
      selector: 'span:has-text("set a message header")',
      fallback: [
        '[role="option"]:has-text("message header")',
        'span.ms-Dropdown-optionText:has-text("header")'
      ]
    },
    tooltip: 'Set a message header seçeneğini tıklayın',
    autoClick: false,
    waitAfterClick: 1500
  },
  {
    id: 16,
    name: 'rule1_step15_header_name',
    title: 'Kural 1: Header Name',
    description: 'Header adı olarak "X-MS-Exchange-Organization-BypassClutter" girin',
    target: {
      selector: 'input[placeholder*="Enter"]',
      fallback: [
        'input.ms-TextField-field',
        'input[type="text"]'
      ]
    },
    tooltip: 'Header adını girin: X-MS-Exchange-Organization-BypassClutter',
    autoClick: false,
    criticalStep: true
  },
  {
    id: 17,
    name: 'rule1_step16_header_value',
    title: 'Kural 1: Header Value',
    description: 'Header value olarak "true" girin',
    target: {
      selector: 'input[placeholder*="value"]',
      fallback: [
        'input.ms-TextField-field:nth-of-type(2)',
        'input[type="text"]:last-of-type'
      ]
    },
    tooltip: 'Header value girin: true',
    autoClick: false,
    criticalStep: true
  },
  {
    id: 18,
    name: 'rule1_step17_save',
    title: 'Kural 1: Save',
    description: 'Save butonuna tıklayarak kuralı kaydedin',
    target: {
      selector: 'button.ms-Button.ms-Button--primary:has-text("Save")',
      fallback: [
        'button[type="button"]:has-text("Save")',
        'button.ms-Button--primary',
        'button[aria-label*="Save"]'
      ]
    },
    tooltip: 'Kuralı kaydedin',
    autoClick: false,
    waitAfterClick: 2000
  },
  
  // KURAL 2: Skip Safe Links Processing
  {
    id: 19,
    name: 'rule2_step1_add_rule',
    title: 'Kural 2: Add a Rule',
    description: 'Rules sayfasında tekrar + Add a rule butonuna tıklayın',
    target: {
      selector: 'button[aria-label*="Add a rule"]',
      fallback: [
        'button:has-text("Add a rule")',
        'button.ms-CommandBarItem-link'
      ]
    },
    tooltip: '+ Add a rule butonuna tıklayın',
    autoClick: false,
    waitAfterClick: 1500
  },
  {
    id: 20,
    name: 'rule2_step2_create_new',
    title: 'Kural 2: Create a New Rule',
    description: '"Create a new rule" seçeneğine tıklayın',
    target: {
      selector: 'span.ms-ContextualMenu-itemText:has-text("Create a new rule")',
      fallback: [
        'button:has-text("Create a new rule")',
        '[role="menuitem"]:has-text("Create")'
      ]
    },
    tooltip: 'Create a new rule seçeneğine tıklayın',
    autoClick: false,
    waitAfterClick: 2000
  },
  {
    id: 21,
    name: 'rule2_step3_rule_name',
    title: 'Kural 2: Rule Name',
    description: 'Kural için bir isim girin (örn: "Keepnet Skip Safe Links Processing")',
    target: {
      selector: 'input[data-automation-id="EditTransportRule_Name_TextField"]',
      fallback: [
        'input[type="text"][maxlength="64"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Kural adını girin',
    autoClick: false,
    realTimeValidation: true,
    criticalStep: true
  },
  {
    id: 22,
    name: 'rule2_step4_apply_sender_ip',
    title: 'Kural 2: Apply This Rule If (Sender IP)',
    description: '"Apply this rule if..." → "The sender" → "IP address is in any of these ranges" seçin ve Keepnet IP\'lerini ekleyin',
    tooltip: 'Sender IP ayarını yapın (Kural 1 ile aynı)',
    autoClick: false,
    criticalStep: true
  },
  {
    id: 23,
    name: 'rule2_step5_set_header',
    title: 'Kural 2: Set Message Header',
    description: '"Do the following" → "Modify the message properties" → "set a message header" seçin. Header: "X-MS-Exchange-Organization-SkipSafeLinksProcessing", Value: "1"',
    target: {
      selector: 'input[placeholder*="Enter"]',
      fallback: [
        'input.ms-TextField-field',
        'input[type="text"]'
      ]
    },
    tooltip: 'Header: X-MS-Exchange-Organization-SkipSafeLinksProcessing = 1',
    autoClick: false,
    criticalStep: true
  },
  {
    id: 24,
    name: 'rule2_step6_save',
    title: 'Kural 2: Save',
    description: 'Save butonuna tıklayarak kuralı kaydedin',
    target: {
      selector: 'button.ms-Button--primary:has-text("Save")',
      fallback: [
        'button[type="button"]:has-text("Save")',
        'button[aria-label*="Save"]'
      ]
    },
    tooltip: 'Kuralı kaydedin',
    autoClick: false,
    waitAfterClick: 2000
  },
  
  // KURAL 3: Skip Safe Attachments Processing
  {
    id: 25,
    name: 'rule3_step1_add_rule',
    title: 'Kural 3: Add a Rule',
    description: 'Rules sayfasında tekrar + Add a rule butonuna tıklayın',
    target: {
      selector: 'button[aria-label*="Add a rule"]',
      fallback: [
        'button:has-text("Add a rule")',
        'button.ms-CommandBarItem-link'
      ]
    },
    tooltip: '+ Add a rule butonuna tıklayın',
    autoClick: false,
    waitAfterClick: 1500
  },
  {
    id: 26,
    name: 'rule3_step2_create_new',
    title: 'Kural 3: Create a New Rule',
    description: '"Create a new rule" seçeneğine tıklayın',
    target: {
      selector: 'span.ms-ContextualMenu-itemText:has-text("Create a new rule")',
      fallback: [
        'button:has-text("Create a new rule")',
        '[role="menuitem"]:has-text("Create")'
      ]
    },
    tooltip: 'Create a new rule seçeneğine tıklayın',
    autoClick: false,
    waitAfterClick: 2000
  },
  {
    id: 27,
    name: 'rule3_step3_rule_name',
    title: 'Kural 3: Rule Name',
    description: 'Kural için bir isim girin (örn: "Keepnet Skip Safe Attachments Processing")',
    target: {
      selector: 'input[data-automation-id="EditTransportRule_Name_TextField"]',
      fallback: [
        'input[type="text"][maxlength="64"]',
        'input.ms-TextField-field'
      ]
    },
    tooltip: 'Kural adını girin',
    autoClick: false,
    realTimeValidation: true,
    criticalStep: true
  },
  {
    id: 28,
    name: 'rule3_step4_apply_sender_ip',
    title: 'Kural 3: Apply This Rule If (Sender IP)',
    description: '"Apply this rule if..." → "The sender" → "IP address is in any of these ranges" seçin ve Keepnet IP\'lerini ekleyin',
    tooltip: 'Sender IP ayarını yapın (Kural 1 ile aynı)',
    autoClick: false,
    criticalStep: true
  },
  {
    id: 29,
    name: 'rule3_step5_set_header',
    title: 'Kural 3: Set Message Header',
    description: '"Do the following" → "Modify the message properties" → "set a message header" seçin. Header: "X-MS-Exchange-Organization-SkipSafeAttachmentProcessing", Value: "1"',
    target: {
      selector: 'input[placeholder*="Enter"]',
      fallback: [
        'input.ms-TextField-field',
        'input[type="text"]'
      ]
    },
    tooltip: 'Header: X-MS-Exchange-Organization-SkipSafeAttachmentProcessing = 1',
    autoClick: false,
    criticalStep: true
  },
  {
    id: 30,
    name: 'rule3_step6_save',
    title: 'Kural 3: Save & Complete',
    description: 'Save butonuna tıklayarak kuralı kaydedin. 3 mail flow kuralı tamamlandı! ✅',
    target: {
      selector: 'button.ms-Button--primary:has-text("Save")',
      fallback: [
        'button[type="button"]:has-text("Save")',
        'button[aria-label*="Save"]'
      ]
    },
    tooltip: 'Kuralı kaydedin - Tamamlandı!',
    autoClick: false,
    waitAfterClick: 2000
  },
  {
    id: 31,
    name: 'mailflow_summary',
    title: 'MAIL FLOW RULES COMPLETED',
    description: '3 mail flow kuralı başarıyla oluşturuldu: Bypass Spam Filter, Skip Safe Links Processing, Skip Safe Attachments Processing',
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
    const colors = ['#7c3aed', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd']
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
  }
  
  start(element, delay, callback) {
    this.stop()
    
    let remaining = delay
    this.onTimeout = callback
    
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
      this.clickElement(element)
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
  
  clickElement(el) {
    if (!el) return
    
    try {
      // Mouse events dispatch et
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY
      })
      
      el.dispatchEvent(clickEvent)
      
      // Fallback
      if (el.click) {
        el.click()
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
    this.observer = null
    this.isMinimized = false
    this.wasMsFormOpen = false
    this.originalZIndex = '2147483647'
    this.savedSize = null
  }
  
  async init() {
    // Load saved language
    const savedLang = await Storage.get(STORAGE_KEYS.LANGUAGE)
    if (savedLang) {
      LANGUAGE = savedLang
      console.log("[Keepnet] Loaded language:", LANGUAGE)
    }
    
    const savedState = await Storage.get(STORAGE_KEYS.PANEL_STATE)
    if (savedState?.position) {
      this.position = savedState.position
    }
    
    this.createPanel()
    this.attachEventListeners()
    this.injectStyles()
    this.watchForMicrosoftPanels()
  }
  
  watchForMicrosoftPanels() {
    // Microsoft'un panel/modal'larını izle - sadece bildirim için
    this.observer = new MutationObserver((mutations) => {
      const msPanel = document.querySelector('.ms-Panel-main, .ms-Layer--fixed, .ms-Dialog-main, [role="dialog"][class*="ms-"]')
      const overlay = document.querySelector('.ms-Overlay, .ms-Layer[class*="Overlay"]')
      
      if ((msPanel || overlay) && this.container && !this.wasMsFormOpen) {
        console.log('[Keepnet] Microsoft panel detected - showing notification')
        this.showMicrosoftPanelWarning()
        this.wasMsFormOpen = true
      } else if (!msPanel && !overlay && this.wasMsFormOpen) {
        console.log('[Keepnet] Microsoft panel closed')
        this.wasMsFormOpen = false
      }
    })
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    })
  }
  
  showMicrosoftPanelWarning() {
    // Header'da uyarı göster
    const indicator = document.getElementById('keepnet-step-indicator')
    if (indicator && !indicator.dataset.warningShown) {
      const originalText = indicator.textContent
      indicator.innerHTML = t('formActive')
      indicator.style.color = '#10b981'
      indicator.style.fontWeight = '600'
      indicator.style.letterSpacing = '0.1em'
      indicator.dataset.warningShown = 'true'
      
      setTimeout(() => {
        indicator.textContent = originalText
        indicator.style.color = ''
        indicator.style.fontWeight = ''
        indicator.style.letterSpacing = ''
        delete indicator.dataset.warningShown
      }, 4000)
    }
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
      background: linear-gradient(to bottom right, rgba(255,255,255,0.98), rgba(250,250,255,0.95)) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border-radius: 20px !important;
      box-shadow: 
        0 20px 60px rgba(99, 102, 241, 0.15),
        0 8px 24px rgba(139, 92, 246, 0.12),
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(99, 102, 241, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
      opacity: 0 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      transform: translateY(20px) scale(0.96) !important;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    `
    
    console.log("[Keepnet] Premium panel created at:", this.position)
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
      this.container.style.opacity = '1'
      this.container.style.transform = 'translateY(0) scale(1)'
    })
    
    // Header - Premium gradient with modern design
    this.header = document.createElement('div')
    this.header.style.cssText = `
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      background-size: 200% 200%;
      animation: keepnet-gradient-shift 8s ease infinite;
      color: white;
      padding: 16px 18px;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      position: relative;
      overflow: hidden;
    `
    
    // Glassmorphic overlay on header
    const headerOverlay = document.createElement('div')
    headerOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    `
    this.header.appendChild(headerOverlay)
    
    this.header.innerHTML += `
      <div style="display: flex; align-items: center; gap: 12px; position: relative; z-index: 1;">
        <div style="
          background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08));
          backdrop-filter: blur(10px);
          border-radius: 10px;
          padding: 8px 10px;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" 
                  stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                  fill="rgba(255,255,255,0.15)"/>
            <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 2px 8px rgba(0,0,0,0.15);">${t('brandName')}</div>
          <div style="font-size: 10px; opacity: 0.85; font-weight: 500; letter-spacing: 0.05em;" id="keepnet-step-indicator">${t('stepOf', {current: 0, total: TOTAL_STEPS})}</div>
      </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; position: relative; z-index: 1;">
        <select id="keepnet-language-selector" style="
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          color: white;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.03em;
        "
        onmouseover="this.style.background='rgba(255,255,255,0.25)'"
        onmouseout="this.style.background='rgba(255,255,255,0.15)'">
          ${Object.entries(TRANSLATIONS).map(([code, data]) => 
            `<option value="${code}" ${LANGUAGE === code ? 'selected' : ''}>${data.name}</option>`
          ).join('')}
        </select>
      <button id="keepnet-close-btn" style="
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.25);
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        z-index: 1;
        font-weight: 300;
      " 
      onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='scale(1.05)'"
      onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='scale(1)'">×</button>
    `
    
    // Progress bar - Modern with gradient
    const progressBar = document.createElement('div')
    progressBar.style.cssText = `
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.2);
      position: relative;
      overflow: hidden;
    `
    progressBar.innerHTML = `
      <div id="keepnet-progress-bar" style="
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: keepnet-shimmer 2.5s infinite;
      "></div>
      </div>
    `
    this.header.appendChild(progressBar)
    
    // Body - Premium background
    this.body = document.createElement('div')
    this.body.id = 'keepnet-panel-body'
    this.body.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 20px;
      background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
      position: relative;
    `
    
    // Footer - Glass effect
    this.footer = document.createElement('div')
    this.footer.id = 'keepnet-panel-footer'
    this.footer.style.cssText = `
      padding: 16px 18px;
      background: linear-gradient(to right, rgba(255,255,255,0.8), rgba(250,250,255,0.8));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(99, 102, 241, 0.1);
      display: flex;
      gap: 10px;
      justify-content: space-between;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
    `
    
    this.footer.innerHTML = `
      <button id="keepnet-prev-btn" class="keepnet-btn keepnet-btn-secondary" style="flex: 1; letter-spacing: 0.03em;">
        ${t('back')}
      </button>
      <button id="keepnet-next-btn" class="keepnet-btn keepnet-btn-primary" style="flex: 2; letter-spacing: 0.03em;">
        ${t('continue')}
      </button>
      <button id="keepnet-summary-btn" class="keepnet-btn keepnet-btn-secondary" style="flex: 1; font-size: 11px; letter-spacing: 0.03em;">
        ${t('summary')}
      </button>
    `
    
    this.container.appendChild(this.header)
    this.container.appendChild(this.body)
    this.container.appendChild(this.footer)
    
    console.log("[Keepnet] Appending premium panel to body...")
    document.body.appendChild(this.container)
    console.log("[Keepnet] Premium panel appended! Visible:", this.container.offsetWidth > 0)
    
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
    // Header click - restore when minimized
    this.header.addEventListener('click', (e) => {
      if (e.target.id === 'keepnet-close-btn') return
      if (this.isMinimized) {
        this.restore()
      }
    })
    
    // Dragging
    this.header.addEventListener('mousedown', (e) => {
      if (e.target.id === 'keepnet-close-btn') return
      if (this.isMinimized) return // Don't drag when minimized
      // Sadece sol tık ile sürükle
      if (e.button !== 0) return
      // Form açıkken de sürüklemeye izin ver
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
      langSelector.addEventListener('change', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const newLang = e.target.value
        console.log("[Keepnet] Language changed to:", newLang)
        LANGUAGE = newLang
        await Storage.set(STORAGE_KEYS.LANGUAGE, newLang)
        // Reload panel content with new language
        if (window.keepnetAssistant) {
          window.keepnetAssistant.panel.updateProgress(
            window.keepnetAssistant.currentStep,
            window.keepnetAssistant.currentWorkflow.length
          )
          const currentStep = window.keepnetAssistant.currentWorkflow[window.keepnetAssistant.currentStep - 1]
          if (currentStep) {
            window.keepnetAssistant.panel.setContent(window.keepnetAssistant.renderStepContent(currentStep))
          }
        }
      })
      
      // Stop event propagation to prevent dragging when clicking selector
      langSelector.addEventListener('mousedown', (e) => {
        e.stopPropagation()
      })
    }

    // Panel içindeki HER TÜRLÜ tıklamanın dışarı çıkmamasını sağla
    // Bu sayede Microsoft overlay tıklama algılamaz ve form kapanmaz
    if (this.container) {
      this.container.addEventListener('click', (e) => {
        e.stopPropagation()
        console.log('[Keepnet] Click stopped from bubbling to overlay')
      }, true) // capture: true - en erken yakalama
      
      this.container.addEventListener('mousedown', (e) => {
        e.stopPropagation()
      }, true)
      
      this.container.addEventListener('mouseup', (e) => {
        e.stopPropagation()
      }, true)
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
      indicator.textContent = t('stepOf', {current, total})
      indicator.style.fontSize = '10px' // Reset font size
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
  
  minimize() {
    if (!this.container || this.isMinimized) return
    
    console.log('[Keepnet] Minimizing panel...')
    
    // Mevcut boyutu kaydet
    this.savedSize = {
      width: this.container.style.width || `${PANEL_SIZE.width}px`,
      height: this.container.style.height || `${PANEL_SIZE.height}px`
    }
    
    // Body ve footer'ı gizle
    if (this.body) this.body.style.display = 'none'
    if (this.footer) this.footer.style.display = 'none'
    
    // Container'ı küçült
    this.container.style.width = '240px'
    this.container.style.height = '56px'
    this.container.style.borderRadius = '28px'
    
    // Header'ı küçült
    if (this.header) {
      this.header.style.padding = '12px 20px'
      const indicator = document.getElementById('keepnet-step-indicator')
      if (indicator) {
        indicator.textContent = t('clickToExpand')
        indicator.style.fontSize = '10px'
      }
    }
    
    // Sağ-üste taşı
    this.container.style.right = '20px'
    this.container.style.left = 'auto'
    this.container.style.top = '20px'
    this.container.style.bottom = 'auto'
    this.container.style.cursor = 'pointer'
    
    this.isMinimized = true
    
    console.log('[Keepnet] Panel minimized')
  }
  
  restore() {
    if (!this.container || !this.isMinimized) return
    
    console.log('[Keepnet] Restoring panel...')
    
    // Body ve footer'ı göster
    if (this.body) this.body.style.display = 'block'
    if (this.footer) this.footer.style.display = 'flex'
    
    // Boyutu geri yükle
    if (this.savedSize) {
      this.container.style.width = this.savedSize.width
      this.container.style.height = this.savedSize.height
    } else {
      this.container.style.width = `${PANEL_SIZE.width}px`
      this.container.style.height = `${PANEL_SIZE.height}px`
    }
    
    this.container.style.borderRadius = '20px'
    this.container.style.cursor = 'default'
    
    // Header'ı geri yükle
    if (this.header) {
      this.header.style.padding = '16px 18px'
    }
    
    // Pozisyonu geri yükle (sol-alt)
    this.container.style.left = `${this.position.x}px`
    this.container.style.right = 'auto'
    this.container.style.top = `${this.position.y}px`
    this.container.style.bottom = 'auto'
    
    this.isMinimized = false
    
    // Step indicator'ı geri yükle (KeepnetAssistant bunu güncelleyecek)
    
    console.log('[Keepnet] Panel restored')
  }
  
  injectStyles() {
    if (document.getElementById('keepnet-styles')) {
      console.log("[Keepnet] Premium styles already injected")
      return
    }
    
    console.log("[Keepnet] Injecting premium styles...")
    const style = document.createElement('style')
    style.id = 'keepnet-styles'
    style.textContent = `
      /* Premium Button Styles */
      .keepnet-btn {
        padding: 10px 18px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        position: relative;
        overflow: hidden;
        letter-spacing: -0.01em;
      }
      
      .keepnet-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      
      .keepnet-btn:hover::before {
        left: 100%;
      }
      
      .keepnet-btn-primary {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 0 2px 4px rgba(139, 92, 246, 0.2);
      }
      
      .keepnet-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4), 0 4px 8px rgba(139, 92, 246, 0.3);
      }
      
      .keepnet-btn-primary:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      }
      
      .keepnet-btn-secondary {
        background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(250,250,255,0.9));
        backdrop-filter: blur(10px);
        color: #4b5563;
        border: 1.5px solid rgba(99, 102, 241, 0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      
      .keepnet-btn-secondary:hover {
        background: linear-gradient(135deg, rgba(255,255,255,1), rgba(248,248,255,1));
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
      
      .keepnet-btn-secondary:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      }
      
      /* Premium Scrollbar */
      #keepnet-panel-body::-webkit-scrollbar {
        width: 8px;
      }
      
      #keepnet-panel-body::-webkit-scrollbar-track {
        background: rgba(99, 102, 241, 0.03);
        border-radius: 10px;
      }
      
      #keepnet-panel-body::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #c7d2fe, #ddd6fe);
        border-radius: 10px;
        border: 2px solid rgba(255,255,255,0.5);
      }
      
      #keepnet-panel-body::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #a5b4fc, #c4b5fd);
      }
      
      /* Premium Highlight Effect */
      .keepnet-highlight {
        outline: 4px solid #10b981 !important;
        outline-offset: 6px !important;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.08)) !important;
        box-shadow: 
          0 0 0 8px rgba(16, 185, 129, 0.15),
          0 0 24px rgba(16, 185, 129, 0.3),
          0 8px 32px rgba(6, 182, 212, 0.2),
          inset 0 0 0 1px rgba(255,255,255,0.5) !important;
        position: relative !important;
        z-index: 999998 !important;
        animation: keepnet-pulse-glow 2s ease-in-out infinite !important;
        cursor: pointer !important;
        transform: scale(1.02) !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border-radius: 8px !important;
      }
      
      /* Premium Animations */
      @keyframes keepnet-pulse-glow {
        0%, 100% { 
          opacity: 1;
          box-shadow: 
            0 0 0 8px rgba(16, 185, 129, 0.15),
            0 0 24px rgba(16, 185, 129, 0.3),
            0 8px 32px rgba(6, 182, 212, 0.2);
        }
        50% { 
          opacity: 0.9;
          box-shadow: 
            0 0 0 12px rgba(16, 185, 129, 0.2),
            0 0 32px rgba(16, 185, 129, 0.4),
            0 12px 40px rgba(6, 182, 212, 0.3);
        }
      }
      
      @keyframes keepnet-gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes keepnet-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      
      @keyframes keepnet-bounce {
        0%, 100% { 
          transform: translateY(0px); 
          opacity: 1;
        }
        50% { 
          transform: translateY(-10px); 
          opacity: 0.9;
        }
      }
      
      /* Premium Tooltip */
      .keepnet-tooltip {
        position: fixed;
        background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
        color: white;
        padding: 14px 24px;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 700;
        pointer-events: none;
        z-index: 1000000;
        box-shadow: 
          0 12px 32px rgba(124, 58, 237, 0.4),
          0 4px 12px rgba(99, 102, 241, 0.3),
          0 0 0 1px rgba(255,255,255,0.2),
          inset 0 1px 0 rgba(255,255,255,0.3);
        white-space: nowrap;
        animation: keepnet-tooltip-float 3s ease-in-out infinite;
        backdrop-filter: blur(20px);
        letter-spacing: -0.02em;
      }
      
      .keepnet-tooltip::before {
        content: '';
        display: none;
        margin-right: 0;
        font-size: 22px;
        animation: keepnet-bounce 1.2s ease-in-out infinite;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }
      
      @keyframes keepnet-tooltip-float {
        0%, 100% { 
          transform: translateY(0px) scale(1);
          box-shadow: 
            0 12px 32px rgba(124, 58, 237, 0.4),
            0 4px 12px rgba(99, 102, 241, 0.3),
            0 0 0 1px rgba(255,255,255,0.2);
        }
        50% { 
          transform: translateY(-6px) scale(1.02);
          box-shadow: 
            0 16px 40px rgba(124, 58, 237, 0.5),
            0 8px 16px rgba(99, 102, 241, 0.4),
            0 0 0 1px rgba(255,255,255,0.3);
        }
      }
      
      /* Glass Card Effect */
      .keepnet-glass-card {
        background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(250,250,255,0.85));
        backdrop-filter: blur(20px);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.3);
        box-shadow: 
          0 8px 24px rgba(99, 102, 241, 0.08),
          0 2px 8px rgba(0,0,0,0.04),
          inset 0 1px 0 rgba(255,255,255,0.6);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .keepnet-glass-card:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 12px 32px rgba(99, 102, 241, 0.12),
          0 4px 12px rgba(0,0,0,0.06),
          inset 0 1px 0 rgba(255,255,255,0.8);
      }
    `
    
    document.head.appendChild(style)
    console.log("[Keepnet] Premium styles injected successfully! ✨")
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
      
      // Hangi workflow'dayız? URL'ye göre belirle
      const currentUrl = window.location.href
      const nextWorkflowName = await Storage.get('keepnet_next_workflow')
      const fixingWorkflow = await Storage.get('keepnet_fixing_workflow')
      
      // Git ve Düzelt modundaysak, kaydedilmiş workflow'ı kullan
      if (fixingWorkflow) {
        console.log("[Keepnet] 🔧 Git ve Düzelt mode - restoring workflow:", fixingWorkflow)
        
        if (fixingWorkflow === 'WORKFLOW_1') {
          this.currentWorkflow = WORKFLOW_STEPS
          this.workflowName = 'WORKFLOW_1'
        } else if (fixingWorkflow === 'WORKFLOW_2') {
          this.currentWorkflow = THREAT_POLICIES_STEPS
          this.workflowName = 'WORKFLOW_2'
        } else if (fixingWorkflow === 'WORKFLOW_3') {
          this.currentWorkflow = SAFE_LINKS_STEPS
          this.workflowName = 'WORKFLOW_3'
        } else if (fixingWorkflow === 'WORKFLOW_4') {
          this.currentWorkflow = SPAM_FILTER_BYPASS_STEPS
          this.workflowName = 'WORKFLOW_4'
        }
        
        // Fixing workflow flag'ini temizle
        await Storage.set('keepnet_fixing_workflow', null)
        
        console.log("[Keepnet] ✅ Workflow restored:", this.workflowName)
      }
      // Yeni workflow başlatılıyorsa
      else if (nextWorkflowName) {
        // Yeni workflow başlatılıyor
        console.log("[Keepnet] 🚀 Starting new workflow from storage:", nextWorkflowName)
        
        if (nextWorkflowName === 'WORKFLOW_2') {
          this.currentWorkflow = THREAT_POLICIES_STEPS
          this.workflowName = 'WORKFLOW_2'
        } else if (nextWorkflowName === 'WORKFLOW_3') {
          this.currentWorkflow = SAFE_LINKS_STEPS
          this.workflowName = 'WORKFLOW_3'
        } else if (nextWorkflowName === 'WORKFLOW_4') {
          this.currentWorkflow = SPAM_FILTER_BYPASS_STEPS
          this.workflowName = 'WORKFLOW_4'
          console.log("[Keepnet] ✅ WORKFLOW_4 (Mail Flow Rules - 3 Kurallar) selected!")
        }
        
        // Workflow değiştiği için tüm state'i temizle
        console.log("[Keepnet] 🧹 Clearing all state for new workflow...")
        this.currentStep = 0
        this.stepResults = {}
        await Storage.set(STORAGE_KEYS.CURRENT_STEP, 0)
        await Storage.set(STORAGE_KEYS.STEP_RESULTS, {})
        
        // ⚠️ ÖNEMLI: nextWorkflowName varsa, URL kontrolünü ATLAMA!
        // Workflow zaten yukarıda seçildi, URL'ye bakmaya gerek yok
        
        // Flag'i temizle - workflow başarıyla seçildi
        await Storage.set('keepnet_next_workflow', null)
        console.log("[Keepnet] ✅ Cleared keepnet_next_workflow flag after workflow selection")
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
      
      // "Git ve Düzelt" modu kontrolü
      const fixingStep = await Storage.get('keepnet_fixing_step')
      if (fixingStep) {
        console.log("[Keepnet] 🔧 Git ve Düzelt mode detected! Jumping to step:", fixingStep)
        
        // Flag'i temizle
        await Storage.set('keepnet_fixing_step', null)
        
        // O adıma git
        this.currentStep = fixingStep
        await Storage.set(STORAGE_KEYS.CURRENT_STEP, fixingStep)
        
        console.log("[Keepnet] 🎯 Executing step", fixingStep, "for fixing...")
        
        // Components initialize ettikten sonra step'ı çalıştıracağız
        // Aşağıda continue edeceğiz
      } else {
      
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
      } // Git ve Düzelt kontrolünün sonu
      
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
      console.log("[Keepnet] Continuing to next workflow...")
      console.log("[Keepnet] Current workflow:", assistant.workflowName)
      
      try {
        // Hangi workflow'a geçeceğiz?
        let nextWorkflow = null
        let nextWorkflowName = ''
        
        if (assistant.workflowName === 'WORKFLOW_1') {
          console.log("[Keepnet] Starting WORKFLOW_2 (THREAT_POLICIES_STEPS)...")
          nextWorkflow = THREAT_POLICIES_STEPS
          nextWorkflowName = 'WORKFLOW_2'
        } else if (assistant.workflowName === 'WORKFLOW_2') {
          console.log("[Keepnet] Starting WORKFLOW_3 (SAFE_LINKS_STEPS)...")
          nextWorkflow = SAFE_LINKS_STEPS
          nextWorkflowName = 'WORKFLOW_3'
        } else if (assistant.workflowName === 'WORKFLOW_3') {
          console.log("[Keepnet] Starting WORKFLOW_4 (SPAM_FILTER_BYPASS_STEPS)...")
          nextWorkflow = SPAM_FILTER_BYPASS_STEPS
          nextWorkflowName = 'WORKFLOW_4'
        } else if (assistant.workflowName === 'WORKFLOW_4') {
          console.log("[Keepnet] 🎉 All workflows completed!")
          assistant.panel?.showSuccess(t('allWorkflowsCompleted'))
          return
        }
        
        // ❌ Diğer workflow'lar için normal akış
        if (!nextWorkflow) {
          console.error("[Keepnet] No next workflow found!")
          return
        }
        
        // Step results temizle
        assistant.stepResults = {}
        await Storage.set(STORAGE_KEYS.STEP_RESULTS, {})
        
        // Yeni workflow'u storage'a kaydet
        await Storage.set('keepnet_next_workflow', nextWorkflowName)
        
        // İlk adım navigation mı?
        const firstStep = nextWorkflow[0]
        
        if (firstStep.isNavigation && firstStep.navigate) {
          // Navigation adımı var - sayfaya git
          console.log("[Keepnet] First step is navigation, going to:", firstStep.navigate)
          
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 1)
          
          const currentUrl = window.location.href
          const targetUrl = firstStep.navigate
          
          console.log("[Keepnet] Navigating to:", targetUrl)
          window.location.href = targetUrl
          
        } else {
          // Navigation yok - aynı sayfada devam
          console.log("[Keepnet] No navigation step, starting on same page...")
          
          const footer = document.getElementById('keepnet-panel-footer')
          if (footer) {
            footer.style.display = 'flex'
          }
          
          assistant.currentWorkflow = nextWorkflow
          assistant.workflowName = nextWorkflowName
          assistant.currentStep = 0
          await Storage.set(STORAGE_KEYS.CURRENT_STEP, 0)
          
          console.log("[Keepnet] 🚀 Starting", nextWorkflowName, "...")
          await assistant.executeStep(1)
          console.log("[Keepnet] ✅ Step 1 executed!")
        }
        
      } catch (error) {
        console.error("[Keepnet] Error continuing workflow:", error)
        assistant.panel?.showError(`Error: ${error.message}`)
      }
    }
    
    // Global function - Git ve Düzelt için
    window.keepnetGoToStep = async (stepId) => {
      console.log(`[Keepnet] Git ve Düzelt clicked for step ${stepId}`)
      console.log(`[Keepnet] Current workflow: ${assistant.workflowName}`)
      
      // Hangi workflow'dayız ve hangi adıma gitmek istiyoruz?
      const currentWorkflow = assistant.currentWorkflow
      const step = currentWorkflow[stepId - 1]
      
      if (!step) {
        console.error(`[Keepnet] Step ${stepId} not found in current workflow`)
        return
      }
      
      console.log(`[Keepnet] Target step:`, step.name, step.title)
      
      // Adımın URL'sini belirle
      let targetUrl = null
      
      // WORKFLOW_1: Third-Party Phishing Simulations
      if (assistant.workflowName === 'WORKFLOW_1') {
        if (stepId <= 2) {
          targetUrl = 'https://security.microsoft.com/homepage'
        } else if (stepId === 3) {
          targetUrl = 'https://security.microsoft.com/securitypoliciesandrules'
        } else if (stepId === 4) {
          targetUrl = 'https://security.microsoft.com/threatpolicy'
        } else if (stepId >= 5) {
          targetUrl = 'https://security.microsoft.com/advanceddelivery'
        }
      }
      // WORKFLOW_2: Anti-Spam
      else if (assistant.workflowName === 'WORKFLOW_2') {
        if (stepId === 1) {
          targetUrl = 'https://security.microsoft.com/antispam'
        } else {
          targetUrl = 'https://security.microsoft.com/antispam'
        }
      }
      // WORKFLOW_3: Safe Links
      else if (assistant.workflowName === 'WORKFLOW_3') {
        if (stepId <= 3) {
          targetUrl = 'https://security.microsoft.com/threatpolicy'
        } else {
          targetUrl = 'https://security.microsoft.com/safelinksv2'
        }
      }
      // WORKFLOW_4: Spam Filter Bypass
      else if (assistant.workflowName === 'WORKFLOW_4') {
        targetUrl = 'https://admin.exchange.microsoft.com/#/transportrules'
      }
      // WORKFLOW_5: ATP Link Bypass
      else if (assistant.workflowName === 'WORKFLOW_5') {
        targetUrl = 'https://admin.exchange.microsoft.com/#/transportrules'
      }
      // WORKFLOW_6: ATP Attachment Bypass
      else if (assistant.workflowName === 'WORKFLOW_6') {
        targetUrl = 'https://admin.exchange.microsoft.com/#/transportrules'
      }
      
      if (!targetUrl) {
        console.error(`[Keepnet] No URL mapping for workflow ${assistant.workflowName}, step ${stepId}`)
        // Fallback - direkt adımı çalıştır
        assistant.executeStep(stepId)
        return
      }
      
      const currentUrl = window.location.href
      console.log(`[Keepnet] Current URL: ${currentUrl}`)
      console.log(`[Keepnet] Target URL: ${targetUrl}`)
      
      // Farklı sayfadaysak, önce doğru sayfaya git
      const currentBase = currentUrl.split('?')[0].split('#')[0]
      const targetBase = targetUrl.split('?')[0].split('#')[0]
      
      if (!currentBase.includes(targetBase.replace('https://', ''))) {
        console.log(`[Keepnet] 🚀 Git ve Düzelt: Navigating to ${targetUrl}`)
        
        // "Git ve Düzelt" modunu işaretle
        await Storage.set('keepnet_fixing_step', stepId)
        await Storage.set('keepnet_fixing_workflow', assistant.workflowName)
        // Step'i kaydet
        await Storage.set(STORAGE_KEYS.CURRENT_STEP, stepId)
        
        // Sayfayı değiştir
        window.location.href = targetUrl
        return
      }
      
      // Aynı sayfadayız, direkt adıma geç
      console.log(`[Keepnet] ✅ Already on correct page, executing step ${stepId}`)
      await Storage.set(STORAGE_KEYS.CURRENT_STEP, stepId)
      assistant.executeStep(stepId)
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
          e.stopImmediatePropagation() // Microsoft overlay'e ulaşmasın
          console.log("[Keepnet] Next button clicked")
          this.nextStep()
        }
      }
      
      if (prevBtn) {
        prevBtn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log("[Keepnet] Prev button clicked")
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
      
      console.log(`[Keepnet] Executing step ${stepNum}: ${step.title}`)
      
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
      
      // Render step content
      this.renderStepContent(step)
      
      // Navigate if needed - AMA sadece navigation step DEĞİLSE otomatik git
      // Navigation step ise butonu göster, kullanıcı bassın
      // UYARI: Microsoft formu açıksa ASLA navigate YAPMA!
      if (step.navigate && !step.isNavigation) {
        // Microsoft formu açık mı kontrol et
        const msPanel = document.querySelector('.ms-Panel-main, .ms-Dialog-main, [role="dialog"][class*="ms-"]')
        
        if (msPanel) {
          console.log(`[Keepnet] ⚠️ Microsoft form açık - Navigation iptal edildi! Form doldurun ve Continue'a basın.`)
          // Form açıksa navigate YAPMA, kullanıcı formu kapatınca devam eder
          return
        }
        
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
            })
          }
          
          // Manual click listener
          element.addEventListener('click', async () => {
            this.autoClick.stop()
            await this.onElementClicked(step)
          }, { once: true })
        } else {
          console.warn("[Keepnet] Element not found:", step.title)
          this.panel.showError(t('elementNotFound', { title: step.title }))
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
      this.panel?.showError(`Error: ${error.message}`)
    }
  }
  
  renderStepContent(step) {
    // Try to translate step title and description
    const titleKey = step.name ? `${step.name}_title` : null
    const descKey = step.name ? `${step.name}_desc` : null
    
    const title = titleKey && TRANSLATIONS[LANGUAGE]?.[titleKey] ? t(titleKey) : step.title
    const description = descKey && TRANSLATIONS[LANGUAGE]?.[descKey] ? t(descKey) : step.description
    
    let html = `
      <div class="keepnet-step-content">
        <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #111827;">
          ${titleKey ? (TRANSLATIONS[LANGUAGE]?.[titleKey] || t(titleKey)) : title}
        </h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
          ${descKey ? (TRANSLATIONS[LANGUAGE]?.[descKey] || t(descKey)) : description}
        </p>
    `
    
    // Mail Flow Rules workflow'ları için özel uyarı (WORKFLOW_4, 5, 6)
    if (this.workflowName === 'WORKFLOW_4' || this.workflowName === 'WORKFLOW_5' || this.workflowName === 'WORKFLOW_6') {
      html += `
        <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.08)); border: 1.5px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: start; gap: 12px;">
            <div style="width: 4px; height: 100%; background: linear-gradient(180deg, #f59e0b, #d97706); border-radius: 2px; align-self: stretch;"></div>
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 700; color: #d97706; margin-bottom: 6px; letter-spacing: 0.03em; text-transform: uppercase;">
                ${t('importantNotice')}
              </div>
              <div style="font-size: 11px; color: #92400e; line-height: 1.6;">
                ${t('overlayWarning')}
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    // Navigation step için "Sayfaya Git" butonu
    if (step.isNavigation && step.navigate) {
      html += `
        <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(99, 102, 241, 0.08)); border: 2px solid #7c3aed; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #5b21b6; margin-bottom: 8px;">
            ${step.title}
          </div>
          <button id="keepnet-navigate-btn" data-url="${step.navigate}" style="
            width: 100%;
            background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
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
            🌐 Sayfaya Git
          </button>
        </div>
      `
    }
    
    // Step 1 Workflow 1 için eski buton (geriye dönük uyumluluk)
    if (step.id === 1 && step.name === 'step1_home') {
      html += `
        <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(99, 102, 241, 0.08)); border: 2px solid #7c3aed; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #5b21b6; margin-bottom: 8px;">
            Microsoft Security Center'a git
          </div>
          <button id="keepnet-go-to-security-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
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
            🌐 Sayfaya Git
          </button>
        </div>
      `
    }
    
    // IP Adresleri için özel liste (Workflow 1 step 9 veya Workflow 2 step 5)
    if (step.id === 9 || step.name === 'antispam_step5_add_ips') {
      html += `
        <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(99, 102, 241, 0.08)); border: 2px solid #7c3aed; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #5b21b6; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            📋 White List IP Adresleri
          </div>
          <div style="background: white; border-radius: 6px; padding: 8px; margin-bottom: 8px; font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937;">
            <div style="padding: 4px 0;">149.72.161.59</div>
            <div style="padding: 4px 0;">149.72.42.201</div>
            <div style="padding: 4px 0;">149.72.154.87</div>
          </div>
          <button id="keepnet-copy-ips-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
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
            ${t('copyAllIPs')}
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
    
    // IP copy butonu için event listener ekle (Workflow 1 step 9 veya Workflow 2 step 5)
    if (step.id === 9 || step.name === 'antispam_step5_add_ips') {
      setTimeout(() => {
        const copyBtn = document.getElementById('keepnet-copy-ips-btn')
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const ips = '149.72.161.59\n149.72.42.201\n149.72.154.87'
            navigator.clipboard.writeText(ips).then(() => {
              copyBtn.textContent = t('copied')
              copyBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              setTimeout(() => {
                copyBtn.textContent = t('copyAllIPs')
                copyBtn.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)'
              }, 2000)
            }).catch(err => {
              console.error('[Keepnet] Clipboard error:', err)
              copyBtn.textContent = t('error')
              setTimeout(() => {
                copyBtn.textContent = t('copyAllIPs')
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
      title: step.title,
      valid: isValid,
      timestamp: new Date().toISOString()
    }
    await Storage.set(STORAGE_KEYS.STEP_RESULTS, this.stepResults)
    
    // Clear highlight (eğer valid değilse temizleme, kullanıcı girsin)
    if (isValid) {
      this.clearHighlight()
    }
    
    // OTOMATIK SONRAKI ADIMA GEÇ - Sadece valid ise!
    if (isValid) {
      console.log(`[Keepnet] Step ${step.id} tamamlandı, otomatik sonraki adıma geçiliyor...`)
      await Utils.sleep(500)
      await this.nextStep()
    } else if (step.criticalStep) {
      // Kritik adımda validation başarısızsa uyar
      this.panel.showError(t('pleaseComplete', { title: step.title }))
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
          this.panel.showError(t('missingIPs', { ips: missing.join(', ') }))
        } else {
          this.panel.showSuccess(t('allIPsAdded', { count: found.length }))
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
    
    this.panel.showSuccess(t('ipsAutoAdded'))
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
        this.panel.showError(`Step incomplete but continuing...`)
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
        <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #111827; letter-spacing: -0.02em; text-transform: uppercase;">
          ${t('summaryReport', {workflow: this.workflowName})}
        </h2>
        <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
    `
    
    // Summary adımını hariç tut
    const stepsToShow = this.currentWorkflow.filter(s => !s.isSummary)
    
    for (let i = 0; i < stepsToShow.length; i++) {
      const step = stepsToShow[i]
      const stepIndex = i + 1  // Step index (1-based)
      const result = this.stepResults[step.id]
      const screenshot = screenshots[step.name]
      
      const status = result?.valid ? 
        '<span style="color: #10b981; font-weight: 600;">✓</span>' : 
        (result ? '<span style="color: #ef4444; font-weight: 600;">✗</span>' : 
        '<span style="color: #94a3b8; font-weight: 600;">○</span>')
      
      html += `
        <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <div style="font-size: 18px; margin-right: 10px;">${status}</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 500; color: #111827;">
              ${step.title}
            </div>
            ${screenshot ? `<div style="font-size: 11px; color: #6b7280;">Screenshot: ${step.name}.png</div>` : ''}
          </div>
          ${!result?.valid ? `
            <button class="keepnet-goto-step-btn" data-step-id="${stepIndex}" style="
              padding: 4px 8px;
              font-size: 11px;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">${LANGUAGE.startsWith('tr') ? 'Git ve Düzelt' : (LANGUAGE.startsWith('de') ? 'Gehe und behebe' : (LANGUAGE.startsWith('fr') ? 'Aller et corriger' : 'Go & Fix'))}</button>
          ` : ''}
        </div>
      `
    }
    
    html += `
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; font-size: 12px; color: #1e40af;">
          ${LANGUAGE.startsWith('tr') ? "Tüm ekran görüntüleri chrome.storage'a kaydedildi" : (LANGUAGE.startsWith('de') ? 'Alle Screenshots wurden in chrome.storage gespeichert' : (LANGUAGE.startsWith('fr') ? 'Toutes les captures sont enregistrées dans chrome.storage' : 'All screenshots have been saved to chrome.storage'))}
        </div>
    `
    
    // WORKFLOW_6 için özel tebrik mesajı
    if (this.workflowName === 'WORKFLOW_6') {
      html += `
        <div style="
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
          color: white;
          text-align: center;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
        ">
          <div style="font-size: 16px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px; text-transform: uppercase;">
            ${t('configCompleted')}
          </div>
          <div style="font-size: 13px; line-height: 1.7; opacity: 0.95;">
            ${t('configDescription')}
          </div>
          <div style="font-size: 13px; font-weight: 600; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.3); opacity: 0.9; letter-spacing: 0.03em;">
            ${t('allStepsSuccessful', {count: 4})}
          </div>
        </div>
      `
    }
    
    // Sonraki workflow var mı kontrol et
    let nextWorkflowText = ''
    let hasNextWorkflow = false
    
    if (this.workflowName === 'WORKFLOW_1') {
      nextWorkflowText = t('continueToWorkflow', { number: 2, name: TRANSLATIONS[LANGUAGE]?.workflow2 || 'Anti-Spam' })
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_2') {
      nextWorkflowText = t('continueToWorkflow', { number: 3, name: TRANSLATIONS[LANGUAGE]?.workflow3 || 'Safe Links' })
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_3') {
      nextWorkflowText = t('continueToWorkflow', { number: 4, name: TRANSLATIONS[LANGUAGE]?.workflow4 || 'Mail Flow Rules' })
      hasNextWorkflow = true
    } else if (this.workflowName === 'WORKFLOW_4') {
      // SON WORKFLOW! Artık devam yok!
      nextWorkflowText = t('allWorkflowsCompleted')
      hasNextWorkflow = false
    } else {
      nextWorkflowText = t('allWorkflowsCompleted')
      hasNextWorkflow = false
    }
    
    html += `
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button id="keepnet-continue-workflow-btn" ${!hasNextWorkflow ? 'disabled' : ''} class="keepnet-workflow-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: ${hasNextWorkflow ? 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' : '#9ca3af'};
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: ${hasNextWorkflow ? 'pointer' : 'not-allowed'};
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
          ">
            ${hasNextWorkflow ? '➡️' : '✅'} ${nextWorkflowText}
          </button>
        </div>
      </div>
    `
    
    this.panel.setContent(html)
    
    // Show confetti celebration ONLY on final workflow
    if (this.workflowName === 'WORKFLOW_4') {
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
          console.log("[Keepnet] Continue workflow button clicked!")
          
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
      
      // Git ve Düzelt butonları için
      const gotoButtons = document.querySelectorAll('.keepnet-goto-step-btn')
      gotoButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault()
          e.stopPropagation()
          const stepId = parseInt(btn.getAttribute('data-step-id'))
          console.log("[Keepnet] Git ve Düzelt clicked for step:", stepId)
          
          if (typeof window.keepnetGoToStep === 'function') {
            await window.keepnetGoToStep(stepId)
          } else {
            console.error("[Keepnet] window.keepnetGoToStep is not a function!")
          }
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
      
    case 'isPanelOpen':
      console.log("[Keepnet] isPanelOpen check...")
      const panel = document.getElementById('keepnet-floating-panel')
      const isOpen = panel && panel.style.display !== 'none' && panel.offsetWidth > 0
      console.log("[Keepnet] Panel open:", isOpen)
      sendResponse({ isOpen: isOpen })
      return false
      
    case 'togglePanel':
      console.log("[Keepnet] togglePanel...")
      const panelToToggle = document.getElementById('keepnet-floating-panel')
      if (panelToToggle) {
        if (panelToToggle.style.display === 'none') {
          panelToToggle.style.display = 'flex'
          console.log("[Keepnet] Panel shown")
        } else {
          panelToToggle.style.display = 'none'
          console.log("[Keepnet] Panel hidden")
        }
        sendResponse({ ok: true })
      } else {
        console.log("[Keepnet] Panel not found")
        sendResponse({ ok: false })
      }
      return false
      
    case 'showPanel':
      console.log("[Keepnet] showPanel...")
      const panelToShow = document.getElementById('keepnet-floating-panel')
      if (panelToShow) {
        panelToShow.style.display = 'flex'
        panelToShow.style.opacity = '1'
        console.log("[Keepnet] Panel shown")
        sendResponse({ ok: true })
      } else {
        console.log("[Keepnet] Panel not found, initializing assistant...")
        if (!assistantInstance) {
          assistantInstance = new KeepnetAssistant()
          assistantInstance.init().then(() => {
            sendResponse({ ok: true })
          }).catch((error) => {
            sendResponse({ ok: false, error: error.message })
          })
          return true // Async
        } else {
          sendResponse({ ok: false })
        }
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
  
  // Workflow geçiş modu kontrolü (yeni workflow başlatılacak mı?)
  const nextWorkflow = await Storage.get('keepnet_next_workflow')
  if (nextWorkflow) {
    console.log("[Keepnet] 🚀 New workflow detected:", nextWorkflow)
    
    // NOT: Flag'i temizleme! init() fonksiyonu içinde temizlenecek
    // await Storage.set('keepnet_next_workflow', null)
    
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
  
  // "Git ve Düzelt" modu kontrolü
  const fixing = await Storage.get('keepnet_fixing_step')
  if (fixing) {
    console.log("[Keepnet] 🔧 Fixing mode detected! Auto-starting assistant...")
    
    // Fixing flag'ini temizle
    await Storage.set('keepnet_fixing_step', null)
    
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

// Sayfa yüklenince ayrıca kontrol et (load event'i çalışmazsa)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log("[Keepnet] Document already loaded, checking state...")
  
  setTimeout(async () => {
    const nextWorkflow = await Storage.get('keepnet_next_workflow')
    if (nextWorkflow) {
      console.log("[Keepnet] nextWorkflow found, starting assistant...")
      // NOT: Flag'i temizleme! init() fonksiyonu içinde temizlenecek
      // await Storage.set('keepnet_next_workflow', null)
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

