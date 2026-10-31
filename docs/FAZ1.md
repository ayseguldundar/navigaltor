# Faz 1 — Hesaplar, roller ve gerçek uygulama uçları

## Mimari

| Katman | Nerede | Ne yapar |
|---|---|---|
| Eski demo | `/demo`, `src/js/04-core.js` | localStorage üzerinde kurgusal panel akışları; gerçek hesap/veritabanı kullanmaz |
| Gerçek uygulama sayfaları | `/giris`, `/yonetim`, `/ogrenci`, `/veli`; `public/app/*.js` | Supabase Auth ve uygulama RPC/REST köprüleriyle hesaplı akışlar |
| Veritabanı | Supabase Postgres; migration kaynakları `supabase/migrations/` | Şema, RLS ve RPC tanımları |
| Sunucu fonksiyonları | Supabase Edge Functions; `supabase/functions/` | Yetkili işlemler ve yapay zekâ çağrısı |
| Yapay zekâ | Claude, `yz-etkinlik` fonksiyonu üzerinden | Anahtarın tarayıcıya inmemesi hedeflenir |

Bu belgede kaynak kodda bulunan yapı ile gerçekten uygulanmış/çalıştırılmış ortam birbirinden ayrıdır. Bu checkout'ta staging Supabase projesi, canlı RLS/RPC davranışı veya migration uygulama kaydı bulunmadığı için bunlar doğrulanmış kabul edilmez. `20261029000007_oturum_iptali.sql` migration'ının production'da uygulandığı özellikle doğrulanmadı.

## Roller ve giriş

| Rol | Tasarlanan akış |
|---|---|
| Okul yöneticisi | `/giris` → öğretmen → okul oluşturma → e-posta + şifre |
| Öğretmen | Okul davet kodu → e-posta + şifre |
| Öğrenci | Sınıf kodu → isim → PIN |
| Veli | Öğrenci davet kodu ve açık rıza → e-posta + şifre |

Gerçek uygulama kodu bu akışlar için Supabase istemcisi ve RPC/Edge Function çağrıları içerir. `npm test` bunları gerçek Supabase yerine `tests/mock-supabase.mjs` ile taklit eder; bu nedenle test geçmesi canlı RLS kanıtı değildir.

## Güvenlik hedefleri (kaynak migration/fonksiyonlarda)

- İstemci yazmaları yetki denetimli RPC/Edge Function akışlarından geçmelidir.
- Öğretmen yalnızca atanmış şubeleri, yönetici kendi okulunu, öğrenci kendi kaydını ve veli bağlı çocuğunu görmelidir.
- PIN özeti, kilitleme, hız sınırı ve yapay zekâ kota kontrolleri sunucu tarafında uygulanmalıdır.
- Yapay zekâ isteğinde öğrenci adı/kimliği gönderilmemeli ve üretim kayıt altına alınmalıdır.

Bu maddelerin staging veya production RLS/RPC yürütme kanıtı bu checkout'ta yoktur; manuel pilot kapıları tamamlanmadan doğrulanmış güvenlik sonucu olarak raporlanmamalıdır.

## Yapılandırma

`public/config.js` içindeki proje adresi ve yayımlanabilir anahtarın tarayıcıda bulunması beklenen tasarımdır. Gizli anahtarlar yalnızca staging/production Edge Function ortamında yapılandırılmalıdır; bu görev kapsamında secret kullanılmadı.

## Testler ve kanıt kapsamı

- `npm test`: build ardından Playwright smoke, auth ve XSS testlerini yerel sunucuda çalıştırır.
- Smoke testi `/demo` localStorage panelini sınar.
- Auth testi `/giris`, `/yonetim`, `/ogrenci`, `/veli` yollarını Supabase mock'u ile sınar.
- XSS testi yerel etkinlik görüntüleyicisini sınar.
- Önceki test kontrol sayıları ve canlı akış/RLS başarı iddiaları bu checkout'ta bağımsız doğrulanmadı; kanıtlanmış sonuç olarak kullanılmamalıdır.

## Bilinen sınırlar

- Gerçek staging projesi ve staging RLS/RPC testi mevcut değil/doğrulanmadı.
- Migration'ların hangi ortamda uygulandığı, özellikle `0007` migration'ı, doğrulanmadı.
- Edge Function deploy, secret yapılandırması, health-check ve backup/restore doğrulaması yapılmadı.
- Şifre sıfırlama, oturum iptali ve diğer işletim adımları pilot öncesi manuel kapılardan geçirilmelidir.
