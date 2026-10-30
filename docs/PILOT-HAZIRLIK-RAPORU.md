# NavigAItor — pilot hazırlık raporu

_30 Ekim 2026 · Kapsam: tek okul, gözetimli pilot (birkaç öğretmen, 1–3 şube, 30–90 öğrenci ve velileri)_

## Karar

**Gözetimli pilot için yeterli.** Bunun iki koşulu var: aşağıdaki "Pilottan önce sizin yapmanız gerekenler" listesi tamamlanmalı ve ilk gün okulda kısa bir toplu giriş denemesi yapılmalı.

Ürünün çekirdek döngüsü uçtan uca çalışıyor ve sınandı:

1. Öğretmen etkinlik atar (kütüphaneden ya da Claude ile üreterek).
2. Öğrenci telefonundan girer ve etkinliği tamamlar.
3. Öğretmen ilerlemeyi görür ve geri bildirim yazar.
4. Veli çocuğunun çalışmasını ve öğretmen notunu görür.

Bağımsız incelemenin bulduğu engelleyici güvenlik açığı kapatıldı. Kalan riskler bilinen ve yönetilebilir türden.

## Ne yapıldı

| Alan | Durum |
|---|---|
| Ana sayfa (`/`) | Wix tasarımı yayında; giriş ve demo bağlantıları eklendi |
| Giriş (`/giris`) | Öğretmen kaydı (okul açma / davet kodu), öğrenci sınıf kodu + isim + PIN, veli davet kodu + KVKK açık rıza |
| Yönetim konsolu (`/yonetim`) | Şubeler, öğrenci listesi (Excel'den yapıştırma), PIN kartları, veli davetleri, öğretmen davetleri, etkinlik atama ve takip, Claude ile üretim, taslaklar, şifre işlemleri, KVKK silme, şube değiştirme, ikinci yönetici |
| Öğrenci uygulaması (`/ogrenci`) | Navi tanışma formu, görevlerim, etkileşimli etkinlik sayfası, kontrol listesi, "ne öğrendin" notu, öğretmen geri bildirimi |
| Veli uygulaması (`/veli`) | Çocukların etkinlikleri, çalışılan 21. yy becerileri, öğretmen notları, evde destek önerisi, çocuk ekleme. Karşılaştırma ve sıralama yok |
| Claude ile üretim | Canlıda 3 kez denendi (7. sınıf Matematik, 6. sınıf Fen, 5. sınıf Türkçe). İçerik özgün, kazanım kodu yok, düzeye uygun. Bir üretim 35–45 sn sürüyor |
| Veritabanı | Supabase (AB-Frankfurt), satır düzeyi güvenlik, tüm yazma işlemleri yetki denetimli sunucu fonksiyonlarıyla. 6 göç dosyası uygulandı |
| Testler | `npm test`: duman testi (22 kontrol), uçtan uca akış testi (70 kontrol), güvenlik (XSS) testi. Tamamı geçiyor |

## Eleştirel inceleme: bulgular ve sonuçları

Bu çalışmayı görmemiş ayrı bir değerlendirici kodu inceledi. Bulgular ve yapılanlar:

| Önem | Bulgu | Durum |
|---|---|---|
| Engelleyici | Etkinlik görsellerinde zararlı içerik (XSS): bir öğretmen hesabından öğrenci, veli ve yönetici oturumları ele geçirilebiliyordu | **Kapatıldı.** Görsel parametreleri temizleniyor; `eval` yerine güvenli hesaplayıcı var; tarayıcı güvenlik politikası (CSP) yayında; yapay zekâ çıktısı sunucuda da temizleniyor. Yeni güvenlik testi açığı yakalıyor ve düzeltmeyi doğruluyor |
| Engelleyici | Okul ağında herkes aynı IP'den bağlandığı için hız sınırları toplu girişi kilitleyebilirdi | **Düzeltildi.** Öğrenci girişi sınıf kodu başına sınırlanıyor ve sınırlar okul ölçeğine göre genişletildi. Asıl koruma öğrenci başına PIN kilidi. **Canlı yük testi yapılmadı** (aşağıya bakın) |
| Yüksek | Öğretmen davet kodu çok kullanımlıktı; her öğretmen tüm davet kodlarını görebiliyordu | **Düzeltildi.** Kod tek kullanımlık, 7 gün geçerli; yeni kod eskisini geçersiz kılıyor; davetleri yalnızca yönetici ve ilgili öğretmen görüyor. Canlıda sınandı |
| Yüksek | Şifre veya PIN yenilenince açık oturumlar kapanmıyordu | **Kısmen.** Kod hazır, ancak veritabanı değişikliği Supabase'in onay penceresinde iki kez iptal oldu ve uygulanmadı (`20261029000007_oturum_iptali.sql`). Arayüz şimdilik "oturum açık kalabilir" diyor |
| Yüksek | PIN tahmini: kilit her seferinde sıfırlanıyordu | **Düzeltildi.** Kilit kademeli artıyor (15 dk → 30 dk → 1 sa … en çok 4 sa). Canlıda sınandı |
| Yüksek | Yapay zekâ maliyeti sınırsız; kota hatasında üretim sürüyordu | **Düzeltildi.** Kota hatasında üretim durur; sistem geneli günlük 300 sınırı var. **Anthropic konsolunda harcama sınırını siz koymalısınız** |
| Yüksek | Okulun tek yöneticisi şifresini unutursa kimse işlem yapamıyordu | **Düzeltildi.** İkinci yönetici atanabiliyor; son yönetici düşürülemiyor. Kılavuza kurtarma adımı eklendi |
| Orta | Aynı ad ve soyad baş harfli öğrenciler listede ayırt edilemiyordu | **Düzeltildi** ("Zeynep Kar." / "Zeynep Kay."; gerekirse okul no) |
| Orta | Veli ekranında KVKK metni okunamıyordu; metin yurt dışı yapay zekâ hizmetinden söz etmiyordu | **Düzeltildi.** Metin her iki ekranda okunuyor; Anthropic'e (ABD) yalnızca ders, kazanım ve öğretmen notu gittiği yazıyor; rızanın geri alınması açıklandı |
| Orta | Öğrenci şube değiştiremiyordu; PIN kartları kaybolunca toplu çözüm yoktu | **Düzeltildi** ("Şube değiştir", "Tüm PIN'leri yenile") |
| Orta | Ağ kesintisi öğrenciyi giriş ekranına atıyordu | **Düzeltildi.** "Yeniden dene" ekranı çıkıyor, oturum korunuyor |
| Orta | Yeni sürümden sonra eski kod çalışabiliyordu; ilk açılışta yaklaşık 2 MB iniyordu | **Düzeltildi.** Uygulama kodu önce ağdan alınıyor; demo panelleri önceden indirilmiyor |
| Orta | Öğrenci silme yarıda kalırsa yeniden denenemiyordu | **Düzeltildi.** Önce giriş hesapları siliniyor |
| Düşük | Haber kartı görseli bozuktu; diğer satırlara yazılan geri bildirim kayboluyordu; sunucu ham veritabanı hatası döndürüyordu; yanlış çocuk seçiliyordu | **Düzeltildi** |

### Açık kalan bulgular

- **Oturum iptali uygulanmadı.** Supabase onayı bekliyor; ayrıntı yukarıdaki tabloda.
- **Öğretmeni şubeden çıkarma yok.** Aynı onaya bağlı. Okuldan ayrılan öğretmen için geçici çözüm: yönetici şifresini sıfırlar ve kişiye iletmez.
- **Veli hesabını doğrulama yok.** Davet kodunu bilen herkes "veli" olarak kaydolabilir. Öğretmen yalnızca "✓ bağlı" görüyor; kimin bağlandığını görmüyor. Pilotta davet kodlarını veliye elden veya veli toplantısında verin.
- **Yedekleme ve izleme yok.** Supabase planı doğrulanamadı. Ücretsiz plandaysa proje 7 gün kullanılmazsa durur ve indirilebilir yedek yoktur. Hata izleme (Sentry vb.) kurulu değil.
- **Veritabanı kuralları otomatik testte yok.** Gerçek SQL ve yetki kuralları otomatik testlerde değil, canlı veritabanında elle sınandı.
- **Küçük konular:**
  - Öğretmen geri bildirimi, başlanmamış etkinliği "devam ediyor" gösterebiliyor.
  - Hem öğretmen hem veli olan kişi iki ayrı e-posta kullanmalı.
  - Kütüphane veri dosyasında kazanım kodları duruyor. Ekranda görünmüyorlar, yalnızca geliştirici araçlarıyla okunabiliyorlar.

## Pilottan önce sizin yapmanız gerekenler

1. **Siteye herkesin erişebildiğini doğrulayın.** https://navigaltor.vercel.app/giris adresini gizli pencerede açın. Vercel giriş ekranı çıkarsa: Vercel → Project → Settings → Deployment Protection → Vercel Authentication'ı kapatın. Benim ortamım siteye dışarıdan erişemediği için bunu doğrulayamadım.
2. **Supabase onayı verin.** Bir sonraki denememde çıkan pencereyi onaylayın. Bu adım oturum iptalini ve öğretmen çıkarmayı etkinleştirir.
3. **Anthropic konsolunda aylık harcama sınırı koyun.** Örneğin 50 $; pilot için yeterli.
4. **Supabase planını ve yedekleri kontrol edin.** Pilot süresince Pro plan önerilir; durmaz ve günlük yedek alır.
5. **İlk gün toplu giriş denemesi yapın.** Bir sınıfın aynı anda giriş yapmasını izleyin. Sorun çıkarsa bana söyleyin; sınırları yükseltirim.
6. **KVKK metnini hukuk danışmanına onaylatın.** Metin hâlâ "taslak" ibaresi taşıyor.
7. **Test verisini temizleyin.** "YZ Test Okulu (test)" ve "Pilot Test Okulu (test)" ile iki test hesabı duruyor. Silmek için Supabase onayı gerekiyor; isterseniz silerim.

## Ölçüm önerisi (pilot boyunca)

- **Haftalık:** atanan / tamamlanan etkinlik oranı, ilk 10 dakikada giriş yapabilen öğrenci oranı, öğretmen başına üretim sayısı.
- **Öğretmenden:** "Claude taslağını değiştirmeden atadım / düzelttim / attım" geri bildirimi. Bu, üretim kalitesinin en doğrudan göstergesi.
- **İkinci haftada:** 3–5 veliyle kısa görüşme; veli ekranı anlaşılıyor mu?
