# 🚀 Chrome Web Store'a Yükleme Rehberi - Basit Adımlar

## ⚡ Hızlı Başlangıç

### Adım 1: Extension'ı Paketle (ZIP Oluştur)

Terminal'de şu komutu çalıştırın:

```bash
cd /Users/rozerinozturk/Desktop/white-v-main/extension
./package-for-store.sh
```

Bu script otomatik olarak:
- ✅ Tüm gerekli dosyaları kontrol eder
- ✅ ZIP dosyası oluşturur (`keepnet-assistant-v3.1.0.zip`)
- ✅ Dosya boyutunu kontrol eder

**Veya manuel olarak:**

```bash
cd /Users/rozerinozturk/Desktop/white-v-main/extension
zip -r ../keepnet-assistant-v3.1.0.zip . \
  -x "*.md" \
  -x ".git/*" \
  -x ".DS_Store"
```

---

### Adım 2: Chrome Web Store Developer Hesabı Oluştur

1. https://chrome.google.com/webstore/devconsole adresine gidin
2. Google hesabınızla giriş yapın
3. **"Pay registration fee"** ($5 tek seferlik) ödemesini yapın
4. Developer hesabınız hazır!

---

### Adım 3: Extension'ı Yükle

1. Developer Dashboard'da **"New Item"** butonuna tıklayın
2. **"Select a file"** ile `keepnet-assistant-v3.1.0.zip` dosyasını yükleyin
3. Yükleme tamamlanana kadar bekleyin

---

### Adım 4: Store Listing Bilgilerini Doldur

**📝 Bu bilgileri gireceksiniz:**

#### Zorunlu Alanlar:

1. **Name (İsim)**
   ```
   Keepnet Assistant
   ```

2. **Summary (Kısa Açıklama)** - 132 karakter maksimum
   ```
   Office 365'te Keepnet phishing simülasyonları için otomatik allow list yapılandırma asistanı - Akıllı navigasyon ve kanıt toplama
   ```

3. **Description (Detaylı Açıklama)**
   - `extension/STORE_LISTING.md` dosyasındaki içeriği kopyalayıp yapıştırın
   - Türkçe veya İngilizce versiyonunu kullanabilirsiniz

4. **Category (Kategori)**
   ```
   Productivity (Üretkenlik)
   ```

5. **Language (Dil)**
   ```
   Turkish (Türkçe)
   English (İngilizce)
   ```

6. **Privacy Policy (Gizlilik Politikası)**
   - `extension/PRIVACY_POLICY.md` dosyasını GitHub'da veya bir web sitesinde yayınlayın
   - URL'ini buraya girin
   - Örnek: `https://github.com/kullaniciadi/repo/blob/main/extension/PRIVACY_POLICY.md`

#### Görseller (Zorunlu):

7. **Small Promotional Tile** (440x280 piksel)
   - Extension'ın çalışma anını gösteren bir görsel
   - Photoshop, Figma veya Canva ile hazırlayabilirsiniz
   - **ÖNEMLİ:** Bu görsel zorunlu!

8. **Screenshots** (1280x800 veya 640x400 piksel)
   - En az 1 screenshot zorunlu
   - Extension'ın kullanımını gösteren ekran görüntüleri
   - Örnekler:
     - Welcome ekranı
     - Workflow seçim ekranı
     - Tamamlanma ekranı

#### İzinler Açıklamaları:

9. **Permissions (İzinler)** - Her izin için açıklama istenir:

   - **storage**: "Workflow durumunu ve screenshot'ları yerel olarak saklamak için"
   - **tabs**: "Aktif sekme bilgisini almak için"
   - **activeTab**: "Kullanıcı extension'a tıkladığında aktif sekmede çalışmak için"
   - **scripting**: "Microsoft Office 365 sayfalarında otomatik navigasyon için"
   - **host_permissions**: "Sadece Microsoft Office 365 sayfalarında çalışmak için (security.microsoft.com, admin.exchange.microsoft.com)"

---

### Adım 5: Gönder ve Bekle

1. Tüm bilgileri doldurduktan sonra sayfanın altındaki **"Submit for Review"** butonuna tıklayın
2. Chrome Web Store ekibi extension'ınızı inceleyecek (genellikle 1-3 iş günü)
3. Onaylandığında extension yayınlanır!

---

## 📋 Hazırlık Kontrol Listesi

Yüklemeden önce şunları kontrol edin:

- [ ] Extension çalışıyor mu? (Chrome'da test edin)
- [ ] ZIP dosyası hazır mı?
- [ ] Store görselleri hazır mı? (en az 1 screenshot + promotional tile)
- [ ] Privacy Policy URL'i hazır mı?
- [ ] Developer hesabı oluşturuldu mu?

---

## 🎨 Görsel Hazırlama İpuçları

### Screenshot Nasıl Alınır?

1. Extension'u Chrome'da yükleyin (Developer mode)
2. Microsoft Security Center'a gidin
3. Extension'u çalıştırın
4. Chrome DevTools ile yüksek kaliteli screenshot alın:
   - F12 → Console
   - `Shift + Cmd + P` (Mac) veya `Shift + Ctrl + P` (Windows)
   - "Capture screenshot" yazın ve seçin

### Promotional Tile Nasıl Hazırlanır?

1. Photoshop/Figma/Canva açın
2. 440x280 piksel canvas oluşturun
3. Extension ikonunu ekleyin
4. "Keepnet Assistant" yazısını ekleyin
5. Temiz ve profesyonel görünmesini sağlayın
6. PNG olarak kaydedin

---

## ❓ Sık Sorulan Sorular

**S: Privacy Policy URL'i zorunlu mu?**
C: Evet, Chrome Web Store artık zorunlu tutuyor. GitHub'da yayınlayabilirsiniz.

**S: Kaç screenshot gerekli?**
C: En az 1, maksimum 5. Ne kadar çok o kadar iyi.

**S: Extension reddedilirse ne olur?**
C: Chrome Web Store size e-posta gönderir. Nedenini açıklar ve düzeltmenizi ister.

**S: Extension ücretsiz mi olacak?**
C: Evet, varsayılan olarak ücretsizdir. Store listing'de "Free" seçeneğini işaretleyin.

---

## 📞 Yardım

Sorun yaşarsanız:
- `extension/CHROME_STORE_CHECKLIST.md` dosyasına bakın
- `extension/STORE_LISTING.md` dosyasındaki örnekleri kullanın
- Chrome Web Store Developer Documentation'ı okuyun

---

**🎯 Özet:** ZIP oluştur → Developer hesabı aç → Upload et → Bilgileri doldur → Görselleri yükle → Submit et!

