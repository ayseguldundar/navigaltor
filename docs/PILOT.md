# NavigAItor pilot kılavuzu

Bu kılavuz, uygulamayı bir okulda pilot olarak kullanmaya başlamak için gereken adımları anlatır.

## Adresler

| Kim | Adres | Ne yapar |
|---|---|---|
| Herkes | `/` | Tanıtım sayfası |
| Herkes | `/giris` | Giriş ve kayıt (öğretmen, öğrenci, veli) |
| Öğretmen ve okul yöneticisi | `/yonetim` | Şubeler, öğrenciler, PIN kartları, veli davetleri, etkinlik atama ve takip, Claude ile etkinlik üretimi |
| Öğrenci | `/ogrenci` | Navi tanışma formu, görevler, etkinlik sayfası |
| Veli | `/veli` | Çocuğun etkinlikleri, çalıştığı beceriler, öğretmen notları |
| Tanıtım | `/demo` | Kurgusal verilerle eski demo panelleri (gerçek veriye dokunmaz) |

## Kurulum sırası (okul yöneticisi)

1. `/giris` → Öğretmen → "Hesap oluştur". Okul adını yazın; okulu açan kişi **okul yöneticisi** olur.
2. **Şubelerim** → "+ Yeni şube". Sistem 6 karakterlik **sınıf kodu** üretir.
3. **Öğrenciler** → "+ Öğrenci ekle". Excel'den No, Ad ve Soyad sütunlarını kopyalayıp yapıştırın. Her öğrenci için 4 haneli PIN üretilir. **PIN kartlarını hemen yazdırın**, çünkü PIN'ler saklanmaz.
4. Her öğrenci için "Davet kodu üret" deyin ve kodu veliye iletin. Kod tek kullanımlıktır ve 30 gün geçerlidir.
5. **Okul ve öğretmenler** → "Davet kodu üret". Kod **tek kullanımlıktır** ve 7 gün geçerlidir. Her öğretmen için yeni kod üretin; yeni kod, kullanılmamış eski kodu geçersiz kılar. Öğretmenleri ardından şubelere ve derslere atayın.
6. Güvenlik için **ikinci bir yönetici** atayın (Okul ve öğretmenler → "Yönetici yap"). Böylece bir yönetici şifresini unutursa diğeri sıfırlayabilir.

## Günlük kullanım

- **Öğretmen:**
  - Etkinlikler → "Kütüphaneden ata" ya da "✨ Claude ile üret". Taslağı gözden geçirip "Şubeye ata" deyin.
  - Atama kartında kimin tamamladığını görür, öğrencinin notunu okur, kısa geri bildirim yazarsınız.
- **Öğrenci:**
  - `/giris` → Öğrenci → sınıf kodu → adını seç → PIN.
  - İlk girişte Navi tanışma formu açılır; sonra doldurulabilir.
  - Etkinlikte kontrol listesindeki maddelerin hepsini işaretleyince "Etkinliği tamamladım" açılır.
- **Veli:** davet koduyla kaydolur ve açık rıza verir. Çocuğunun ilerlemesini görür. Başka çocuklarını "+ Çocuk ekle" ile bağlar.

## Sık karşılaşılan durumlar

| Durum | Çözüm |
|---|---|
| Öğrenci PIN'ini unuttu | Öğrenciler → "Yeni PIN" (eski PIN geçersiz olur) |
| PIN kartları kayboldu | Öğrenciler → "Tüm PIN'leri yenile" → yazdır |
| Öğrenci şube değiştirdi | Öğrencinin adına tıklayın → "Şube değiştir". PIN, veli bağlantısı ve geçmiş korunur |
| Öğretmen veya veli şifresini unuttu | Okul yöneticisi: Okul ve öğretmenler → "Şifre sıfırla". Üretilen geçici şifre kişiye iletilir; kişi giriş yapıp "Şifre" düğmesinden değiştirir |
| Öğrenci okuldan ayrıldı | Geçici olarak: "Pasif yap". KVKK silme talebinde: yönetici → "Sil" (öğrencinin adı yazılarak onaylanır; geri alınamaz) |
| Veli davet kodu kayboldu | Aynı öğrenci için yeni davet kodu üretin |
| Yanlış PIN denemeleri | Her 5 yanlış denemede giriş kilitlenir: önce 15 dakika, sonra 30 dakika, 1 saat… en çok 4 saat. "Yeni PIN" kilidi hemen açar |
| Tek yönetici şifresini unuttu ve başka yönetici yok | Teknik ekip Supabase panelinden (Authentication → Users) geçici şifre verir |

## Bilinen sınırlar (pilot)

- E-posta ile şifre sıfırlama kapalıdır, çünkü özel SMTP kurulmadı. Şifreler yönetici üzerinden sıfırlanır.
- Claude ile üretim öğretmen başına günde 40 taslakla (`AI_DAILY_LIMIT`), sistem genelinde günde 300 taslakla (`AI_GLOBAL_DAILY_LIMIT`) sınırlıdır. Bir üretim 30–60 saniye sürer. Ayrıca Anthropic konsolunda aylık harcama sınırı tanımlanmalıdır.
- Uygulama çevrimdışı açılır, ancak kayıt ve teslim için internet gerekir.

## Teknik işletim

- **Yayın:** `main` dalına her gönderimde Vercel otomatik yayınlar. Hizmet çalışanı sürümü her derlemede değişir, böylece eski kod önbellekte kalmaz.
- **Veritabanı:** Supabase `navigaitor`, AB-Frankfurt bölgesinde. Göçler `supabase/migrations`, sunucu fonksiyonları `supabase/functions` altındadır.
- **Gizli anahtarlar:** `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_DAILY_LIMIT` ve `AI_GLOBAL_DAILY_LIMIT` Supabase → Edge Functions → Secrets bölümündedir. Depoda gizli anahtar yoktur.
- **İşlem kaydı:** yönetici şifre sıfırlama ve öğrenci silme işlemleri `admin_log` tablosuna kişisel veri olmadan yazılır.
- **Testler:** `npm test` (derleme, duman testi, uçtan uca akış testi, güvenlik testi).
