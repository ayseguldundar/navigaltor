# NavigAItor — CTO pilot hazırlık raporu

**Karar: pilot için teknik olarak hazır olduğu henüz söylenemez.** Gerçek staging Supabase projesi/Edge Function testi yok; ayrıca öğretmen/veli kayıt kodu e-postayı doğrulanmış gibi işaretliyor. Bu çalışma production'a migration, kullanıcı verisi değişikliği veya yayın yapmadı.

## Doğrulanan önemli bulgular

- `/yonetim`, `/ogrenci`, `/veli` gerçek uygulama uçları Supabase/Auth/RLS/RPC kodunu kullanıyor; `/demo` ise ayrı, kurgusal localStorage demosu. Mock Playwright sonuçları gerçek veritabanı kanıtı değil.
- Kaynakta `profiles` RLS politikası öğretmenlere aynı okuldaki bütün profilleri; `teacher_sections` politikası tüm personel atamalarını açıyordu. Yeni `20261031000009_profile_isolation.sql` öğretmene yalnızca kendi profil/atamalarını, yöneticiye okul çapındaki listeyi bırakıyor. Migration henüz uygulanmadı.
- Öğretmen daveti kaynakta tek kullanımlı, 7 gün geçerli; yenisi oluşturulunca önceki kullanılmamış kod iptal ediliyor. Veli daveti tek kullanımlı ve varsayılan 30 gün geçerli. Kayıt fonksiyonları daveti `FOR UPDATE` ile tüketiyor.
- `kayit-ogretmen` ve `kayit-veli`, Supabase Auth kullanıcılarını `email_confirm: true` ile oluşturuyor. Gerçek e-posta sahipliği kanıtı olmadan doğrulanmış hesap yaratılması, SMTP/Auth doğrulama akışı çözülene kadar pilot blokajıdır.
- Öğrenci giriş roster'ı sınıf kodunu bilenlere isim etiketiyle beraber öğrenci UUID'si döndürüyor. `srv_class_roster` doğrudan yalnızca `service_role` içindir; fakat herkese açık Edge Function bu içeriği tarayıcıya geçiriyor. UUID'yi tarayıcıya taşımayan kısa ömürlü bir bilet tasarımı gerekir.
- Hız sınırı ve AI kota rezervasyonu için `20261031000008_atomic_limits.sql` aynı bucket/global quota üzerinde transaction lock kullanıyor; Edge Function'lar hata halinde fail-closed davranacak şekilde güncellendi. Ancak kullanılan `x-forwarded-for` değerinin Supabase gateway'den güvenilir geldiği doğrulanmadı; SQL atomikliği tek başına IP kaynağını güvenilir yapmaz.
- AI Edge Function istek gövdesi/prompt boyutunu ve izinli alanları sınırlar, e-posta/telefon/TC kimlik benzeri örüntüleri reddeder, çıktıyı katı JSON/visual schema ile doğrular ve ham prompt/yanıtı AI tablosuna yazmaz. Ad, adres veya dolaylı tanımlayıcıları regex kusursuz yakalayamaz; serbest metin sağlayıcıya gider. Pedagojik doğruluk iddiası yoktur; taslak öğrenciye atanmadan öğretmen onayı ister.
- Service worker statik kabuk ve dosyaları önbelleğe alır; Supabase verisi/yazması çevrimdışı kuyruklanmıyor. Kaydetme hatası görünür, ancak sekme/yenileme sonrası cihazlar arası taslak/çatışma çözümü garanti edilmez. Pilot işlemleri çevrimiçi yapılmalıdır.
- Eski `/demo` rapor paylaşımı gerçek gönderim gibi görünmeyecek şekilde “simülasyon (demo)” olarak etiketlendi; notun yalnızca demo localStorage'ına gittiği açıklanıyor. Mock smoke testi veli mesajlaşmasının kapalı olduğunu doğruladı.

Rol/tablo/RPC/Edge Function matrisi [ACCESS-MATRIX.md](ACCESS-MATRIX.md)'de; staging işletim kapıları [PILOT.md](PILOT.md)'de bulunur.

## Bu dalda yapılan işler

- Ayrı yerel dal: `pilot-readiness/2026-10-31`, başlangıç `main` commit'i `32bbd225d7efc94b93a5a2cb137d4c4000fccb93`. Değişiklikler henüz commit/push/PR değil.
- Yeni `0008` migration ve buna bağlı Edge Function kullanımı: atomik fail-closed hız sınırı ve günlük AI kota rezervasyonu.
- Yeni `0009` migration: öğretmenlerin okul içi profil ve diğer öğretmen şube atama listelerini doğrudan okumasını daraltma.
- AI Edge Function: tip/uzunluk/izinli değer kontrolleri, toplam gövde/prompt sınırı, hassas örüntü reddi, bounded response, strict output schema, sabit hata mesajları ve öğretmen onayı öncesi taslak akışı.
- Gerçek panellerde veri hatalarının sahte başarıya dönüşmemesi ve oturum çıkışında yerel auth/Navi session verilerinin temizlenmesi; uzak logout 1,5 saniyede tamamlanmazsa yerel temizlik yine yapılır.
- Node 22, lockfile, Playwright CI ve static syntax kontrolü. Playwright 1.48.0 için audit yüksek önem uyarısı verdi; 1.64.1'e yükseltildi, audit artık 0 bulgu raporluyor.
- README, Faz 1, yol haritası ve pilot runbook'ları mock/staging kanıt sınırlarını açıkça ayıracak şekilde güncellendi.

## Test kanıtı

| Kontrol | Sonuç | Kanıtın sınırı |
|---|---|---|
| Node sürümü | Node 22.23.4 | `.nvmrc` ve CI Node 22 ile uyumlu |
| Temiz kurulum | `npm ci` başarılı | `package-lock.json` üzerinden, yeni klon davranışına yakın |
| Playwright | 1.64.1, Chromium kuruldu | npm audit eski 1.48.0 açığını sabitledikten sonra 0 bulgu |
| `npm test` | Build, 16 JS + 7 Edge Function TS syntax-only check, demo smoke, mock auth, XSS geçti | Gerçek Supabase/Anthropic değil; Deno API/type-check değil |
| Edge Function parser | Node 22 `--experimental-strip-types --check` tüm Edge Function `.ts` dosyalarında geçti | Bu yalnızca syntax kontrolü; Deno API/type-check veya deploy değildir |
| `git diff --check` | Final kontrol geçti | Whitespace/merge-marker kontrolü; çalışma zamanı testi değildir |
| Gerçek staging RLS/Edge testleri | Çalıştırılmadı | Staging proje/branch yok; bu nedenle kabul kriterleri 1–7 staging açısından tamamlanmış sayılmaz |

Build ölçümünde demo paneller 1.09–1.59 MB ve eski kütüphane modülü 749 KB görünür; gerçek route HTML'leri 2.8–3.9 KB, ana sayfa modülleri yaklaşık 9–30 KB'dır. Büyük etkinlik kütüphanesi gerektiğinde ayrı yüklenir. Bu çalışma bundle küçültme yapmadı; gerçek ilk açılış için laboratuvar performans ölçümü veya before/after iddiası üretilmedi.

## Kabul ölçütleri durumu

1. Yönetici→öğretmen→öğrenci, ayrı cihaz hesabı: UI/mock akışında var; staging kanıtı yok.
2. Atama→öğrenci teslimi→öğretmen ilerlemesi: UI/mock akışında var; gerçek DB/staging kanıtı yok.
3. Veli yalnız bağlı çocuğu: RLS kaynağı ve tek kullanımlı davet akışı var; negatif staging testi yok.
4. Başka okul/şube/öğrenci/veli izolasyonu: kaynak politikalar ve `0009` düzeltmesi var; `0009` uygulanmadı, gerçek RLS testi yok.
5. Yanlış PIN/davet, rate limit, paralel kota, logout: SQL/Edge kaynakları güncellendi; gerçek eşzamanlı DB testi yok, `x-forwarded-for` güveni açık.
6. AI hataları/rol/girdi/kota/bozuk çıktı: kodda fail-closed kontroller var; sağlayıcı/staging entegrasyon testi yok.
7. `npm test`: geçti; gerçek staging testi yapılmadığı için kabul ölçütünün staging kısmı eksik.
8. Temiz Node 22 kurulum: `npm ci` ve testler geçti; CI tanımlı. Edge Function TypeScript kontrolü syntax-only.
9. Demo olmayan/gerçek olmayan kapsam: `/demo` ve çevrimdışı sınırlar dokümante edildi; gerçek mesaj/rapor paylaşımı yok ve demo düğmesi simülasyon diye etiketli.

## Pilota giriş için şartlar

1. Ayrı staging Supabase projesi ya da mevcut staging ref'i sağlanmalı; `0001`–`0009` migration'ları staging'de sırayla uygulanmalı ve migration geçmişi doğrulanmalı.
2. E-posta doğrulama/SMTP Auth akışı kurulmalı; doğrulanmamış öğretmen/veli hesabı yetkili kabul edilmemeli.
3. `0009` sonrası rol/okul/şube/öğrenci/veli RLS pozitif-negatif senaryoları ve sınıf roster/yanlış PIN/kilit/davet tekrar kullanım testleri gerçek staging'de çalıştırılmalı.
4. Gateway'deki gerçek istemci IP kaynağı teyit edilmeli; teyit edilemiyorsa rate limit için güvenilir gateway başlığı veya platform koruması seçilmeli.
5. Öğrenci UUID'si anonim tarayıcıya taşınmadan roster/login akışı test edilmeli.
6. Edge Function'lar staging'e deploy edilmeli; AI key, model, günlük/global kota ve staging CORS/Auth ayarları doğrulanmalı.
7. Backup/restore provası, health-check, hata izleme, migration rollback/forward-fix, geri dönüş sorumlusu ve üretim onay kapısı tamamlanmalı.

## Değişkenler ve onaylar

Staging frontend için `SUPABASE_URL` ve `SUPABASE_PUBLISHABLE_KEY`; Supabase işlemleri için proje ref'i ve yetkili CLI erişimi/DB parola yönetimi; AI Function için `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_DAILY_LIMIT`, `AI_GLOBAL_DAILY_LIMIT`; Auth doğrulaması için staging SMTP/redirect ayarları gerekir. Bu raporda hiçbir gizli değer bulunmaz. Production için ayrı proje/ref, secrets ve açık deploy/migration onayı şarttır.

İstenen GitHub PR'ı açılmadı; bu ortamda yazma yetkili GitHub bağlantısı henüz kullanılabilir değil. Dal yerelde duruyor, main'e birleştirilmedi ve push edilmedi. Staging'e migration/deploy de yapılmadı.

## Gerekli kısa kararlar

1. Şube açma yetkisi öğretmenlerde de kalsın mı, yalnızca okul yöneticisinde mi olsun? Mevcut `create_section` tüm okul personeline izin veriyor.
2. Staging Supabase projesi/ref'i mevcut mu; yoksa ayrı staging oluşturulmasına onay veriyor musunuz? Production'a dokunulmayacak.
3. GitHub bağlantısı yazma/PR izniyle etkinleştirilebilir mi? PR için gerekir.
4. SMTP/Auth e-posta doğrulaması hangi sağlayıcıyla kurulacak? Bu çözülene kadar gerçek hesap kaydı güvenli değil.
