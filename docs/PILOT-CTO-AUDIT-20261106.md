# NavigAItor CTO — Pilot hazırlık denetimi

**Denetim tarihi:** 6 Kasım 2026
**İncelenen depo/başlangıç:** `ayseguldundar/navigaltor`, `main` @ `ae00a08dd2ca79de325e25eebbbde063a6af103b` (`Merge pull request #3 … Demo`)
**Çalışma dalı:** `cto/pilot-hardening-ae00a08`
**Kapsam:** Trigger girdisinde iletilen 11 yeni olayın son durumunu temsil eden güncel `main`; önceki bulgular kodda yeniden doğrulandı. Hiçbir production veritabanı, migration veya deploy işlemi yapılmadı.

## Karar özeti

**NavigAItor pilot için teknik olarak hazır ilan edilemez.** Bu çalışma sırasında güvenli ve yerel olarak doğrulanabilir bazı düzeltmeler ayrı dalda hazırlandı. Erişim izolasyonu, hesap e-posta doğrulaması, AI kişisel veri saklama politikası ve production/staging yayın kapıları gerçek staging veya servis ayarı gerektiriyor; bu doğrulamalar yapılmadı.

## Denetimde doğrulanan ve bu dalda ele alınan bulgular

| Önem / öncelik | Bulgu ve kanıt | Bu dalda yapılan |
|---|---|---|
| Yüksek — pilota giriş için şart | `supabase/functions/yz-etkinlik/index.ts` içindeki `new RegExp(`\b${t}\b`)` JavaScript template literal’inde gerçek backspace karakteri üretiyor; geçerli görsel türü taslağı reddedebilir. | Görsel türü eşleşmesi test edilebilir allowlist yardımcı modülüne alındı. Yalnızca 27 izinli türün tam eşleşmesi kabul ediliyor. Her izinli tür, büyük harf ve yakın-geçersiz alt dize için regresyon testi eklendi. |
| Yüksek — pilota giriş için şart | `20261029000006_pilot_guvenlik.sql` ve `20261029000007_oturum_iptali.sql` içindeki `reset_section_pins` öğretmen yetkisini de kabul ediyordu; `move_student` mevcut ve hedef şubede öğretmen olmayı yeterli sayıyordu. | Yeni `20261106000010_pilot_security_followup.sql` migration’ı toplu PIN yenilemeyi yalnızca aynı okulun yöneticisine, öğrenci taşımayı da aynı okulda admin’e sınırlandırıyor. **Migration çalıştırılmadı.** |
| Orta — pilot sırasında izlenecek | `srv_rate_limit` sayım ve ekleme arasında kilit olmadığından aynı bucket’taki paralel istekler birlikte limiti aşabilirdi (`20261029000001_faz1_hesaplar.sql`). | Yeni migration, bucket başına transaction advisory lock ve parametre doğrulaması ekliyor. **Postgres/staging eşzamanlılık testi yapılmadı.** |
| Orta — pilot sırasında izlenecek | AI Edge Function gövde üst sınırını yalnız `Content-Length` üzerinden kontrol ediyordu; eksik/yanlış başlıkta gerçek boyut sınırı uygulanmıyordu. | `readBoundedJson` akıştan okunan byte sayısını üst sınıra bağlıyor; 413/bozuk JSON davranışı için Node testleri eklendi. |
| Orta — pilot sırasında izlenecek | AI sağlayıcı ağ/HTTP hatalarının ham metni `ai_generations.error` alanına yazılabiliyordu. | Sağlayıcı hata içeriği yerine yalnızca genel hata kategorisi/HTTP durumu saklanıyor. **AI üretim istek/yanıt geçmişi hâlâ ürün işlevi olarak saklanıyor; saklama süresi/temizleme kararı verilmedi.** |

### Denetim sırasında düzeltilen yanlış pozitif

Audit alt görevinin veli rızasının backend’de doğrulanmadığı iddiası kaynakla doğrulanmadı: `supabase/functions/kayit-veli/index.ts` `body.consent !== true` durumunu reddediyor; `srv_register_parent` ve `srv_link_parent` migration fonksiyonları onay sürümünü `consents` tablosuna kaydediyor. `tests/auth-flows.mjs` de mock akışta checkbox işaretlenmeden gönderimi reddediyor. Bu, gerçek Supabase/staging davranışının kanıtı değildir; ancak kodda eksik kontrol olduğu iddiası bu audit’te **bulgu olarak tutulmadı**.

## Kalan pilot engelleri ve gerekli kanıt

### Pilota giriş için şart

1. **Gerçek rol/okul/şube/veri izolasyonu:** `public/app/ogrenci.js`, `public/app/veli.js` ve `public/app/yonetim.js` bazı sorgularda açık kullanıcı/şube kapsamı göndermiyor; bunun tek başına veri sızıntısı olduğu kanıtlanmadı, fakat güvenlik RLS’ye bağlı. Staging’de ayrı okul, öğretmen, öğrenci ve veli hesaplarıyla başka okul/şube/öğrenci/aile kayıtlarına doğrudan REST/RPC erişiminin reddedildiği test edilmeli.
2. **Öğrenci PIN giriş koruması:** `public/app/giris.js` dört haneli PIN için istemci tarafında bekleme/deneme sınırı uygulamıyor. Sunucu tarafındaki hız sınırı, lockout, başarısız deneme kaydı ve hesap varlığını ifşa etmeyen hata yanıtı `supabase/functions/ogrenci-giris/index.ts` ve `ogrenci-sinif` akışında staging’de doğrulanmalı. Yeni rate-limit migration’ı ancak staging’de uygulanıp eşzamanlılık testinden sonra kanıt sayılabilir.
3. **Hesap e-posta doğrulaması ve okul admin kaydı:** `kayit-ogretmen`, `kayit-veli` ve `ogrenci-giris` akışlarında `email_confirm: true` kullanımı var. Öğretmen/veli e-posta sahipliği doğrulanmadan yetkili profile bağlanabilir. SMTP/Auth yapılandırması ve kayıt modeli kararı gerekiyor; bu akış mevcut kullanıcı beklentisini bozabilecek bir ürün/kurulum kararı olduğundan bu dalda değiştirilmedi.
4. **AI kişisel veri ve saklama:** `yz-etkinlik/index.ts` içindeki desen tabanlı kişisel bilgi filtresi kapsamlı değil; ad, okul/sınıf, öğrenme/sağlık bilgisi gibi serbest metinleri güvenilir biçimde ayıklamıyor. `ai_generations` tablosu istek/yanıtı saklıyor ve `public/app/yonetim-etkinlik.js` geçmişi okuyor. Tutulacak alanlar ve saklama süresi kararlaştırılmalı; sunucu tarafı veri minimizasyonu/PII kontrolleri ve silme/TTL mekanizması uygulanıp staging’de sınanmalı.
5. **Yayın onay kapısı:** README main dalına giden değişikliklerin Vercel’de otomatik derlenip yayımlandığını belirtiyor; `vercel.json` staging/production ayrımını tek başına kanıtlamıyor. Vercel production branch, preview, deploy protection ve production’a terfi onayı ayarları doğrulanmalı. GitHub Actions dosyası mock/UI testleri çalıştırıyor; gerçek Supabase staging entegrasyonu göstermiyor.
6. **E-posta/rate-limit ingress koşulları:** Edge Functions’ın `x-forwarded-for` kaynağının güvenilir ingress tarafından üretildiği ve kullanıcı tarafından taklit edilemediği doğrulanmadı. E-posta/Supabase Auth SMTP, function JWT/ACL ve staging migration geçmişi de bilinmiyor.

### Pilot sırasında izlenecek

- `public/app/ogrenci.js` tanışma formu kayıt hatalarını sessizce yutabilir; kullanıcıya kayıt durumu/yeniden deneme gösterilmeli.
- Öğrenci checklist değişiklikleri paralel RPC’ler başlatabilir; ters sırada yanıtın eski durumu son yazılan değer yapmadığı doğrulanmalı.
- Veli/yönetim ekranlarındaki bazı sorgu hataları boş veriyle karışabilir (`public/app/veli.js`, `public/app/yonetim.js`).
- PWA offline desteği esasen kabuk ve statik kaynaklarla sınırlı; Supabase verisi çevrimdışı çalışmıyor. `public/ogrenci.html` etkinlik CSS’inin service worker precache kapsamı ayrıca gözden geçirilmeli.
- Öğrenci/veli ekranlarında sorgu sayfalaması ve veri hacmi izlenmeli. Demo bundle ölçümü: `npm test` derlemesinde öğretmen/öğrenci demo HTML yaklaşık 1.69 MB, veli yaklaşık 1.13 MB çıktı; bu çalışma bundle bölme/iyileştirme yapmadı.

### Pilot sonrasına bırakılabilir

- `vercel.json` içindeki `unsafe-inline` CSP’yi kaldırmak için inline bundle/event handler’ları harici script/olay dinleyicilerine taşımak.
- `scripts/vendor.sh` bağımlılık sürümlerini lockfile ile sabitlemek ve vendor bundle checksum’u üretmek.
- `scripts/check.mjs` taramasını kaynak/izlenen dosyalarla sınırlayıp `node_modules`, `.git`, `dist` gibi üretilmiş alanları dışlamak.
- Demo kaynaklarındaki prototip çıkış davranışını, demo panellerinin gerçek auth paneli gibi algılanmadığı garanti edildikten sonra iyileştirmek.

## Testler ve kanıt

Yerel çalışma dalında:

- `npm ci --no-audit --no-fund` — geçti.
- `npm run check` — geçti: 195 dosya, 10 migration.
- `node tests/ai-visual-validation.mjs` — geçti: 27 allowlist değeri ve geçersiz alt-dize kontrolleri.
- `node tests/ai-request-validation.mjs` — geçti: başlıksız büyük gövde reddi, sınır içi gövde ve bozuk JSON kontrolleri.
- `npm test` — ilk deneme Playwright Chromium eksik olduğu için başlamadı. `npx playwright install chromium` ile yerel test tarayıcısı kurulduktan sonra tekrar çalıştırıldı ve geçti: build, smoke, mock auth-flow ve XSS testleri ile iki yeni Node testi. Tüm tarayıcı kontrolleri raporlandı.
- `git diff --check` — geçti.

Bu testler yerel/mock/test kodu kanıtıdır. **Gerçek staging Supabase RLS/Edge Function, migration, e-posta doğrulama, AI sağlayıcısı, kota yarış koşulu, üretim ayarı, yedek/geri yükleme veya gerçek cihazlar arası akış doğrulanmadı.** Deno/Supabase CLI bu ortamda bulunmadığından Edge Function typecheck ve veritabanı migration çalıştırması yapılmadı. Hiçbir secret yazdırılmadı.

## Staging yapılandırması ve manuel onay kapıları

- Yeni migration: `supabase/migrations/20261106000010_pilot_security_followup.sql`. Önce staging/test projesinde migration listesiyle farkı inceleyin; test hesaplarıyla admin dışı `reset_section_pins`/`move_student` reddini, başka okul erişimini ve eşzamanlı rate-limit sınırını test edin. Bu dosya **production’a uygulanmadı**.
- Deno Edge Function kontrolü ve staging deploy’u, staging Supabase CLI/Auth bilgileri ve Edge Function secret store erişimi gerektirir. `ANTHROPIC_API_KEY`, `SUPABASE_URL`, Supabase secret key ve benzeri değerler yalnızca doğru secret store’da tutulmalı; hiçbir değeri loga veya build’e yazmayın.
- Öğretmen/veli e-posta doğrulaması için Supabase Auth onay ayarı ve doğrulanmış SMTP/redirect yapılandırması kararlaştırılmalı. Bu çalışma ayarı değiştirmedi.
- Production’a geçmeden önce insan onayı; staging test çıktıları, migration incelemesi, Edge Function hash/sürüm kontrolü, yedek/geri yükleme provası, Vercel deploy onayı ve geri alma adımları gereklidir.

## Ürün/kurulum kararları

1. Pilot hesapları self-service öğretmen kaydıyla mı yoksa yalnızca onaylı davet/provizyonla mı oluşturulacak? E-posta doğrulaması ve ilk okul yöneticisi ataması bu karara bağlıdır.
2. AI etkinlik geçmişinde hangi istek/yanıt alanları saklanmalı ve ne kadar süre tutulmalı? Mevcut arayüz üretim geçmişini gösteriyor; saklamayı kaldırmak işlevi etkileyebilir.
3. Offline vaadi yalnızca uygulama kabuğunu mu kapsıyor, yoksa öğrenci ilerlemesinin çevrimdışı kaydı da mı isteniyor? İkincisi için cihazda hassas veri saklama ve senkronizasyon tasarımı gerekir.
4. Öğretmenlerin belirli öğrenci PIN’ini tekil yenileme yetkisi sürsün mü? Bu dalda yalnızca tüm şube PIN’lerini topluca yenileme işlemi admin’e sınırlandı.


### Test kapsamı ek notu

Son test turunda `tests/security-mock.mjs` de eklendi ve `npm test` akışına bağlandı. Bu, öğretmen rolünde toplu PIN yenileme/öğrenci taşıma reddini ve okul dışı taşıma reddini **mock** modelinde sınar; SQL/RLS veya staging testi değildir. Bu ekle birlikte son `npm test` ve `npm run check` çalışmaları başarılıdır.
