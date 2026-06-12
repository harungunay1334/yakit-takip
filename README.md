# ⛽ Yakıt Takip Uygulaması

Motosikletiniz (Benzin) ve Otomobiliniz (Benzin & LPG) için yakıt tüketimi, kilometre ve maliyet takibi yapabileceğiniz, sunucu gerektirmeyen ve tamamen tarayıcınızda çalışan modern bir web uygulaması.

Bu uygulama **GitHub Pages** üzerinde barındırılmaya tamamen uygundur. Verileriniz tarayıcınızın yerel depolama alanında (`localStorage`) güvenli bir şekilde saklanır.

---

## 🌟 Özellikler

- 🛵 **Motosiklet Desteği**: Sadece benzin tüketimi ve kilometre takibi.
- 🚗 **Çift Yakıtlı Otomobil Desteği**: Hem Benzin hem de LPG dolumlarını ayrı ayrı kaydedebilme ve istatistiklerini izleme.
- 📊 **Dinamik Gösterge Paneli (KPI)**:
  - Toplam yapılan yol (km)
  - Toplam harcanan yakıt tutarı (TL)
  - Km başına düşen ortalama maliyet (TL/km)
  - 100 km'de ortalama yakıt tüketimi (L/100km)
  - Otomobil için Benzin/LPG harcama oranlarının görsel ilerleme çubuğu
- 📈 **Grafikler (Chart.js)**:
  - Aylık yakıt gideri dağılımı (Araç ve yakıt bazlı yığılmış bar grafiği)
  - Yakıt birim fiyat değişim grafiği (TL/Litre trend çizgileri)
- 📝 **Geçmiş Yönetimi**: Tüm kayıtları filtreleme, düzenleme ve silme.
- 💾 **Yedekleme & Geri Yükleme**: Verilerinizi JSON formatında bilgisayarınıza indirebilir, daha sonra geri yükleyebilirsiniz.
- ⚡ **Kullanıcı Dostu Form**: Depo fulleme seçeneği, litre fiyatı ve litre girildiğinde otomatik toplam tutar hesaplama.
- 📱 **Tam Mobil Uyum**: Mobil cihazlarda alt navigasyon barı ile yerel mobil uygulama hissi veren responsive arayüz.

---

## 🚀 Yerel Çalıştırma

Uygulamayı bilgisayarınızda çalıştırmak için hiçbir kurulum yapmanıza gerek yoktur:

1. Bu klasördeki `index.html` dosyasına çift tıklayarak tarayıcınızda doğrudan açabilirsiniz.
2. Veya daha profesyonel bir test için terminalden bir yerel sunucu başlatabilirsiniz:
   ```bash
   # Python yüklüyse:
   python3 -m http.server 8000
   # Tarayıcınızdan http://localhost:8000 adresine gidin.
   ```

---

## 🌐 GitHub Pages ile Yayınlama Adımları

Uygulamayı GitHub üzerinde ücretsiz olarak yayınlamak ve telefonunuzdan/bilgisayarınızdan dilediğiniz an erişmek için aşağıdaki adımları takip edebilirsiniz:

### 1. Yeni Bir GitHub Deposu (Repository) Oluşturun
1. [GitHub](https://github.com) hesabınıza giriş yapın.
2. Sağ üstteki **+** ikonuna tıklayıp **New repository** seçeneğini seçin.
3. Repository adını belirleyin (Örn: `yakit-takip`).
4. Depoyu **Public** (Açık) yapın ve **Create repository** butonuna basın.

### 2. Projenizi GitHub'a Yükleyin
Proje klasörünüzün içinde terminalinizi açarak şu komutları çalıştırın (kendi kullanıcı adınız ve repo adınızla güncelleyin):
```bash
# Git deposunu başlatın
git init

# Dosyaları ekleyin ve commit yapın
git add .
git commit -m "İlk sürüm: Yakıt Takip uygulaması hazır"

# GitHub reponuzu uzak sunucu olarak bağlayın
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git

# Kodları GitHub'a gönderin
git push -u origin main
```

### 3. GitHub Pages Ayarını Aktifleştirin
1. GitHub deposundaki sayfanızda sağ üstteki **Settings** (Ayarlar) sekmesine gidin.
2. Sol menüdeki **Code and automation** başlığı altından **Pages** sekmesine tıklayın.
3. **Build and deployment** > **Source** kısmını "Deploy from a branch" olarak bırakın.
4. **Branch** kısmında `main` (veya `master`) seçin ve klasör olarak `/ (root)` seçip **Save** butonuna tıklayın.
5. Birkaç dakika bekleyin. Sayfayı yenilediğinizde üst kısımda sitenizin yayında olduğu bağlantıyı göreceksiniz. (Örn: `https://kullanici-adiniz.github.io/yakit-takip/`)

Artık telefonunuzun tarayıcısından bu adrese girerek yakıt dolumlarınızı anlık olarak kaydedebilirsiniz!
