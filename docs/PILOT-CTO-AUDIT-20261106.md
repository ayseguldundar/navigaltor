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


## Dokuz kabul kriteri — sonuç tablosu

| # | Kriter | Durum ve kanıt |
|---|---|---|
| 1 | Yönetici → öğretmen/şube/öğrenci kurulumu; başka cihazdan doğru öğrenci hesabı | **Staging’de doğrulanmadı.** Mock auth akışıyla bazı UI işlemleri geçiyor; iki gerçek cihaz/hesap ve DB kanıtı yok. |
| 2 | Öğretmen ataması → öğrencinin görüp tamamlaması → öğretmenin gerçek DB ilerlemesini görmesi | **Mock geçti, gerçek DB bekliyor.** `tests/auth-flows.mjs` simüle edilen atama/tamamlama/öğretmen görünümünü doğruluyor; gerçek Supabase staging teslimi yok. |
| 3 | Veli yalnız bağlı çocuklarını görür | **Mock geçti, RLS kanıtı yok.** UI mock’unda bağlı çocuk akışı çalışıyor; başka çocuk/aileye doğrudan REST sorgusu staging’de denenmedi. |
| 4 | Başka okul/şube/öğrenci/aile ve yetkisiz davet erişimi reddedilir | **Kısmi mock, staging bekliyor.** Yeni `tests/security-mock.mjs` admin/öğretmen ve okul sınırını mock’ta doğruluyor; DB/RLS, başka aile ve bozuk/expired/replay davet negatif testleri yok. |
| 5 | Yanlış PIN, brute-force, tekrar/süresi dolmuş davet, rate-limit hatası, paralel kota ve çıkış sonrası eski veri | **Kısmi mock; kritik entegrasyonlar açık.** Yanlış PIN, tek kullanımlık davet ve çıkış UI mock’larında mevcut; brute-force eşzamanlılığı, expired/replay, rate-limit fail-closed, paralel AI kota yarışı ve çıkış sonrası cache verisi gerçek staging’de test edilmedi. |
| 6 | AI hata/bozuk çıktı/kota/rol/girdi senaryoları | **Kısmi yerel test, gerçek AI/staging yok.** Geçersiz görsel türleri ve gövde boyutu Node’da sınanıyor; akış testindeki üretim mock; provider failure, bozuk tam payload, gerçek quota/role ve kişisel veri senaryoları henüz staging’de çalıştırılmadı. |
| 7 | Build, otomatik testler ve gerçek staging entegrasyon testleri temiz | **Yerel build/test temiz; kriter tamamlanmadı.** Yerel `npm test` geçti; GitHub Actions `CI/test` son kontrolde QUEUED, Vercel Preview başarılı. Gerçek staging entegrasyon testi yok. |
| 8 | Belgelenen Node sürümüyle yeni klon kurulum/CI tekrarlanır | **Yerelde geçti, CI sonucu bekliyor.** Node `22.23.4` ile `npm ci`, `npm run check`, `npm test` geçti; workflow Node `22.x` kullanıyor; GitHub CI henüz sonuçlanmamıştı. |
| 9 | Pilot dışı/gerçek veriye bağlı olmayan özellikler listelenir | **Kısmi.** Bu rapor offline desteğin statik kabukla sınırlı olduğunu, gerçek Supabase/AI/SMTP ayarlarına bağlı akışları ve karar bekleyen AI geçmişini listeliyor. Canlı veriye veya servis durumuna bağlı tüm feature flag/env kombinasyonlarının envanteri çıkarılmadı. |

## Geri alma planı

- **Mevcut durum:** PR açık, merge edilmedi; bu dal için Vercel Preview başarıyla oluştu. Production deploy, Supabase migration veya gerçek kullanıcı verisi değişikliği yapılmadı. PR merge edilmeden kapatılabilir; dal/commit `7ed54d20` güvenle ayrık kalır.
- **Kod geri alma:** Merge/deploy sonrasında hata görülürse, önce son bilinen iyi Vercel production sürümüne platformun rollback/terfi mekanizmasıyla dönün; ardından sebebi gideren revert PR açın. Preview deploy production rollback gerektirmez.
- **DB geri alma:** Bu migration tabloya veri yazmıyor; `reset_section_pins`, `move_student`, `srv_rate_limit` fonksiyon gövdeleri ve ACL’lerini değiştiriyor. Staging’de test edilmiş, önceki migration’lardaki tam gövdeleri/ACL’leri geri yükleyen ayrı ve review edilmiş SQL rollback migration’ı olmadan production’a uygulanmamalı. Migration dosyasını silmek çalışan veritabanını geri almaz. Rollback eski yetki ve rate-limit yarış risklerini yeniden getireceği için yalnız kontrollü kurtarma adımıdır.
- **Veri kurtarma:** Herhangi production değişikliğinden önce yedek/restore provası şarttır; bu çalışmada yedek alınmadı, restore testi yapılmadı.

## Staging değişken adları

Staging secret/config adları (değerler bu rapora alınmadı): `SUPABASE_URL`, `SUPABASE_SECRET_KEYS` (tercih edilen) veya eski kurulumlarda `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_DAILY_LIMIT`, `AI_GLOBAL_DAILY_LIMIT`. Bunlar yalnız doğru Supabase Edge Function secret store’a girilmeli; e-posta doğrulama/redirect/SMTP ayarları Supabase Auth panelinde ayrıca doğrulanmalı.


### PR durum damgası

`ccdfe41` head’i sonrası son kontrolde PR `OPEN` ve merge edilmemişti. GitHub Actions `CI/test` ve Vercel deployment **pending** durumundaydı; Vercel Preview Comments check başarılıydı. Önceki head’deki Vercel success, dokümantasyon commit’i sonrası yeni Preview deploy’un tamamlandığı anlamına gelmez. Production deploy yapılmadı.
