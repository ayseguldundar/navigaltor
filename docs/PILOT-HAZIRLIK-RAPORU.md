# NavigAItor — pilot hazırlık raporu

_30 Ekim 2026 · Kapsam: tek okul, gözetimli pilot (1–3 şube, yaklaşık 30–90 öğrenci ve velileri)_

## Karar

**Bu dal, staging doğrulaması ve üretim onay kapıları tamamlanmadan “pilot için teknik olarak hazır” ilan edilmemelidir.** Mock tabanlı uçtan uca akışlar temiz geçiyor; canlı Vercel frontend’i erişilebilir; ancak canlı Supabase migration geçmişi repo ile eşleşmiyor ve gerçek RLS/Edge Function izolasyon testleri henüz otomatikleştirilmedi.

Pilotun çekirdek ürün akışı kodda mevcut: yönetici şube açar, öğretmen öğrenci ve etkinlik atar, öğrenci başka oturumdan tamamlar, öğretmen ilerlemeyi görür, davetli veli yalnızca bağlı çocuklarını görür. Bu akışın gerçek staging kanıtı ayrıca alınmalıdır.

## Doğrulanan canlı durum

- `https://navigaltor.vercel.app/giris` HTTP 200 dönüyor; CSP, HSTS, `X-Content-Type-Options` ve `Referrer-Policy` başlıkları mevcut.
- Supabase projesi erişilebilir; repo ile canlı migration geçmişi eşleşmiyor: canlıda `20261028214244`, `20261028214335`, `20261028214927`, `20261028222730`, `20261029111225`, `20261030075033` var; repo branch’inde ayrıca `20261030000007` ve yeni `20261030000008` var.
- Canlıda 7 Edge Function aktif; kaynak değişiklikleri deploy edilmeden canlı davranış güncel branch ile aynı kabul edilemez.
- Üretim veritabanına migration veya kullanıcı verisi değişikliği yapılmadı; sırlar yazdırılmadı.

## Bu branch’te yapılan işler

| Alan | Değişiklik | Kanıt |
|---|---|---|
| Rate limit | Rate-limit RPC hata verdiğinde dört kayıt/giriş fonksiyonu artık fail-open olmaz; isteği durdurur | `supabase/functions/{ogrenci-sinif,ogrenci-giris,kayit-ogretmen,kayit-veli}` |
| AI kota | Öğretmen ve sistem kotası için advisory-lock kullanan atomik rezervasyon migration’ı ve Edge Function entegrasyonu eklendi | `20261030000008_ai_kota_atomik.sql`, `yz-etkinlik/index.ts` |
| AI veri sınırları | Gövde boyutu, e-posta/telefon/T.C. kimlik numarası desenleri ve çıktı alanı/uzunluğu doğrulaması eklendi | `yz-etkinlik/index.ts` |
| Sır/CI | Lockfile, Node 22 CI, statik sır/fail-open kontrolü ve Playwright Chromium kurulumu eklendi | `package-lock.json`, `.github/workflows/ci.yml`, `scripts/check.mjs` |
| Test | Build, smoke, auth-flow ve XSS testleri temiz | `npm test` |

## Önceliklendirme

### Pilota giriş için şart

1. Ayrı bir Supabase staging projesinde tüm repo migration’larını uygulayın; özellikle oturum iptali migration’ı ve `srv_reserve_ai_generation` migration’ı doğrulanmadan production’a geçmeyin.
2. Edge Function’ları staging’e deploy edin ve staging URL’si üzerinde gerçek auth/RLS negatif testlerini çalıştırın: başka okul, başka şube, başka öğrenci ve başka veli erişimi reddedilmeli.
3. `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_DAILY_LIMIT`, `AI_GLOBAL_DAILY_LIMIT` secret’larını yalnızca Edge Function secret store’a koyun. Frontend build’inde görünmemeli.
4. Öğretmen/veli e-posta doğrulamasının pilot ayarını karar verip staging’de doğrulayın; mevcut kayıt fonksiyonları `email_confirm: true` kullandığından bu davranış ayrıca onay gerektirir.
5. Bir sınıfın eşzamanlı giriş denemesini staging’de yük testiyle ölçün; rate-limit değerlerini gözleme göre ayarlayın.
6. Supabase yedekleme/geri yükleme ve rollback prosedürünü bir kez prova edin.

### Pilot sırasında izlenecek

- Başarılı giriş oranı ve ilk 10 dakikada tamamlanan öğrenci girişleri.
- Atanan/tamamlanan etkinlik oranı ve öğretmen başına AI üretimi.
- AI hata, kota ve bekleyen rezervasyon kayıtları; hassas içerik loglanmamalı.
- Yanlış PIN, davet kodu ve rate-limit olaylarının oranı.
- Vercel hata oranı, Supabase Edge Function gecikmesi ve servis sağlık kontrolleri.

### Pilot sonrasına bırakılabilir

- Sentry veya eşdeğer hata izleme entegrasyonu.
- Öğretmeni şubeden çıkarma ve tam oturum iptali operasyonlarının ürünleştirilmesi.
- E-posta ile self-service şifre sıfırlama için SMTP kurulumu.
- Frontend bundle’ının daha ileri bölünmesi; mevcut smoke test mobil taşma ve tarayıcı hatasını kontrol ediyor.

## Bilinen sınırlamalar

- Mevcut testlerin önemli bölümü Supabase davranışını mock’lar; gerçek RLS kanıtı değildir.
- Çevrimdışı kullanım açılış ve önbellekle sınırlıdır; kayıt/teslim internet ister.
- Öğretmen ve veli kayıtları için e-posta onayı mevcut kodda otomatik etkinleştirilmiştir; bu ayar production kararı olarak ayrıca gözden geçirilmelidir.
- Yeni atomik AI kota migration’ı henüz canlıda değildir; bu nedenle canlı Edge Function deploy edilene kadar eski kota davranışı geçerlidir.

## Üretim onay kapısı

Production’a geçmeden önce branch incelemesi, staging test çıktısı, migration planı, Edge Function sürüm/hash kontrolü, yedek doğrulaması ve geri alma planı yazılı olarak onaylanmalıdır. Bu dal bu işlemleri otomatik olarak production’a uygulamaz.
