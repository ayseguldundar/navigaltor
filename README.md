# NavigAItor

5–8. sınıflar için yapay zekâ destekli uyarlanabilir öğrenme platformu. Öğretmen, öğrenci ve veli panellerinden oluşan, kurulabilir (PWA) web uygulaması.

**Canlı adres:** https://navigaltor.vercel.app (erişim ve staging bağlantısı bu çalışma sırasında bağımsız olarak doğrulanmadı.)

| Sayfa | Yol | Uygulama türü |
|---|---|---|
| Giriş | `/` | Gerçek uygulama girişine yönlendirme |
| Yönetim | `/yonetim` | `public/app/*.js` kullanan Supabase/Auth uygulaması |
| Öğrenci Paneli | `/ogrenci` | `public/app/*.js` kullanan Supabase/Auth uygulaması |
| Veli Paneli | `/veli` | `public/app/*.js` kullanan Supabase/Auth uygulaması |
| Giriş | `/giris` | Öğretmen, öğrenci ve veli giriş/kayıt akışları |
| Eski demo | `/demo` | `src/js/04-core.js` ve localStorage kullanan kurgusal demo |

> `/demo` altındaki paneller gerçek hesap veya veritabanı kullanmaz. `/yonetim`, `/ogrenci` ve `/veli` ise `public/app/*.js` üzerinden Supabase Auth/RLS/RPC akışlarına bağlanacak şekilde tasarlanmıştır. Bu checkout'ta gerçek staging projesi, canlı RLS davranışı veya migration uygulanması bağımsız olarak doğrulanmadı; özellikle `0007` migration'ının production'da uygulandığı doğrulanmadı. Ayrıntılar: [docs/FAZ1.md](docs/FAZ1.md), [docs/PILOT.md](docs/PILOT.md).

## Geliştirme

```bash
nvm use                         # .nvmrc: Node 22
npm ci                          # package-lock ile temiz ve tekrarlanabilir kurulum
npx playwright install chromium # CI: --with-deps chromium
npm test                        # build + local/mock smoke, auth ve XSS testleri
```

`npm test` test sunucularını yerelde açar; build, JavaScript kontrolleri ve Edge Function TypeScript syntax-only kontrolünün ardından `/demo` localStorage smoke, Supabase mock'lu gerçek sayfa auth akışları ve yerel XSS testini çalıştırır. TypeScript kontrolü Deno API/type-check değildir. Bu testler staging RLS veya gerçek Edge Function davranışının kanıtı değildir. Playwright 1.64.1 package-lock ile sabitlenmiştir; `npm audit --audit-level=high` 0 bulgu verdi.

## Klasör yapısı

```
src/        /demo için localStorage tabanlı eski demo kaynakları
public/app/ Gerçek giriş, yönetim, öğrenci ve veli uygulama kodu
    public/     Gerçek uygulama sayfaları, config, vendor ve PWA dosyaları
    supabase/   migrations/ ve functions/ kaynakları (uygulanmış oldukları varsayılmaz)
    scripts/    build, local serve ve static syntax check
tests/      Playwright tabanlı local/mock smoke, auth ve XSS testleri
    docs/       Faz, pilot, [erişim matrisi](docs/ACCESS-MATRIX.md) ve yol haritası
```

## Yayın ve doğrulama sınırı

`main` dalına gönderim için Vercel otomatik yayın ayarı bu checkout'ta bağımsız olarak doğrulanmadı. Gerçek pilot öncesinde staging kurulumu, migration durumu, RLS/RPC yetki senaryoları, Edge Function sırları, backup/restore ve health-check sonuçları [PILOT.md](docs/PILOT.md)'deki manuel kapılardan geçirilmelidir.

## Ürün kuralları

- Kazanım kodları arayüzde hiçbir yerde gösterilmez; kazanımlar adıyla yazılır.
- Kazanımlar yalnızca resmî kaynaktan (tymm.meb.gov.tr) alınır.
- Ders ve etkinlik kitapları soru havuzu olarak kullanılmaz; her öğrenciye düzeyine göre özgün ve anlık etkinlik üretilir.
