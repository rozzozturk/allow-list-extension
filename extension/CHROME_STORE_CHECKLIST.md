# Chrome Web Store Yükleme Kontrol Listesi

Bu liste, extension'ı Chrome Web Store'a yüklemeden önce tamamlamanız gereken tüm adımları içerir.

## ✅ Hazırlık Adımları

### 1. Dosya Hazırlığı
- [x] Manifest.json Chrome Web Store gereksinimlerine uygun
- [x] İkonlar hazır (16x16, 48x48, 128x128 PNG)
- [x] Privacy Policy dosyası hazır
- [x] Store listing açıklaması hazır
- [ ] Store görselleri hazır (screenshots ve promotional tiles)
- [ ] Extension test edildi ve çalışıyor
- [ ] Tüm dosyalar extension klasöründe

### 2. Manifest Kontrolü
- [x] manifest_version: 3
- [x] name ve description i18n ile yapılandırılmış
- [x] version numarası doğru (3.1.0)
- [x] İzinler açıkça belirtilmiş ve gerekçelendirilmiş
- [x] host_permissions yalnızca gerekli domain'ler için
- [x] İkonlar tanımlı ve dosyalar mevcut
- [x] default_locale tanımlı
- [x] short_name eklendi (opsiyonel ama önerilir)

### 3. İzinler ve Güvenlik
- [x] Storage izni: Yerel veri saklama için
- [x] Tabs izni: Aktif sekme bilgisi için
- [x] activeTab izni: Sadece kullanıcı tıkladığında
- [x] scripting izni: Content script injection için
- [x] host_permissions: Sadece Microsoft Office 365 sayfaları
- [x] Tüm izinler açıkça belgelenmiş

### 4. Çoklu Dil Desteği
- [x] Türkçe (tr) mesajlar hazır
- [x] İngilizce (en) mesajlar hazır
- [x] default_locale: tr
- [x] _locales klasör yapısı doğru

### 5. Görseller
- [x] icon16.png (16x16)
- [x] icon48.png (48x48)
- [x] icon128.png (128x128)
- [ ] Small Promotional Tile (440x280) - **Hazırlanmalı**
- [ ] Marquee Promotional Tile (1400x560) - **Opsiyonel**
- [ ] Screenshot 1 (1280x800) - **Hazırlanmalı**
- [ ] Screenshot 2 (1280x800) - **Opsiyonel**
- [ ] Screenshot 3 (1280x800) - **Opsiyonel**

### 6. Dokümantasyon
- [x] PRIVACY_POLICY.md hazır
- [x] STORE_LISTING.md hazır
- [x] STORE_ASSETS_README.md hazır
- [x] README.md güncel
- [x] CHROME_STORE_CHECKLIST.md (bu dosya)

### 7. Kod Kalitesi
- [ ] Content script hataları kontrol edildi
- [ ] Background script hataları kontrol edildi
- [ ] Console log'lar temizlendi (production için)
- [ ] Test edildi ve çalışıyor
- [ ] Edge case'ler kontrol edildi

## 📦 Paketleme Adımları

### 1. Extension Klasörünü Hazırlama
```bash
cd extension/
# Gereksiz dosyaları temizle
rm -f *.md  # Store'a yüklerken .md dosyalarına gerek yok
# veya sadece gerekli dosyaları içeren bir klasör oluştur
```

### 2. ZIP Dosyası Oluşturma
```bash
# Extension klasörünün içindeyken
cd extension/
zip -r ../keepnet-assistant-v3.1.0.zip . \
  -x "*.md" \
  -x ".git/*" \
  -x ".DS_Store" \
  -x "*.zip"
```

### 3. ZIP Dosyasını Kontrol Etme
- [ ] ZIP dosyası oluşturuldu
- [ ] ZIP içinde manifest.json var
- [ ] ZIP içinde tüm gerekli dosyalar var
- [ ] ZIP boyutu 10MB'ın altında (Chrome Web Store limiti)

## 🚀 Chrome Web Store'a Yükleme

### 1. Developer Hesabı
- [ ] Chrome Web Store Developer hesabı oluşturuldu
- [ ] $5 one-time registration fee ödendi

### 2. Yeni Extension Oluşturma
- [ ] Chrome Web Store Developer Dashboard'a giriş yapıldı
- [ ] "New Item" butonuna tıklandı
- [ ] ZIP dosyası yüklendi

### 3. Store Listing Bilgileri
- [ ] **Name**: Keepnet Assistant
- [ ] **Short Description**: Office 365'te Keepnet phishing simülasyonları için otomatik allow list yapılandırma asistanı - Akıllı navigasyon ve kanıt toplama
- [ ] **Detailed Description**: STORE_LISTING.md dosyasındaki içerik kopyalandı
- [ ] **Category**: Productivity
- [ ] **Language**: Turkish (tr), English (en)
- [ ] **Privacy Policy URL**: PRIVACY_POLICY.md dosyasının yayınlandığı URL

### 4. Görseller
- [ ] Small Promotional Tile yüklendi
- [ ] (Opsiyonel) Marquee Promotional Tile yüklendi
- [ ] En az 1 screenshot yüklendi
- [ ] Tüm görseller doğru boyutlarda

### 5. Ek Bilgiler
- [ ] **Website**: GitHub repository URL'i veya web sitesi
- [ ] **Support Email**: Destek e-posta adresi
- [ ] **Single Purpose**: Extension tek bir amaca hizmet ediyor (Office 365 allow list yapılandırması)

### 6. İzinler Açıklamaları
- [ ] Her izin için açıklama eklendi:
  - **storage**: Workflow durumunu ve screenshot'ları yerel olarak saklamak için
  - **tabs**: Aktif sekme bilgisini almak için
  - **activeTab**: Kullanıcı extension'a tıkladığında aktif sekmede çalışmak için
  - **scripting**: Microsoft Office 365 sayfalarında otomatik navigasyon için
  - **host_permissions**: Sadece Microsoft Office 365 sayfalarında çalışmak için

### 7. Gönderim
- [ ] Tüm bilgiler dolduruldu
- [ ] Preview kontrol edildi
- [ ] "Submit for Review" butonuna tıklandı
- [ ] Review süreci beklendi (genellikle birkaç saat ile birkaç gün arası)

## 🔍 İnceleme Süreci Sonrası

### 1. Onaylandıysa
- [ ] Extension yayınlandı
- [ ] Store sayfası kontrol edildi
- [ ] Kullanıcı geri bildirimleri takip edildi

### 2. Reddedildiyse
- [ ] Red nedeni incelendi
- [ ] Gerekli düzeltmeler yapıldı
- [ ] Yeniden gönderildi

## 📝 Notlar

- Chrome Web Store'un inceleme süreci genellikle 1-3 iş günü sürer
- Extension reddedilirse, geri bildirim e-postası gönderilir ve düzeltmeler yapılabilir
- Store listing'i her zaman güncel tutmak önemlidir
- Kullanıcı geri bildirimlerini düzenli olarak kontrol edin

## 🆘 Yardım

Sorun yaşarsanız:
1. Chrome Web Store Developer Documentation'ı kontrol edin
2. Chrome Web Store Forum'unda arama yapın
3. Extension'u test edin ve console hatalarını kontrol edin

