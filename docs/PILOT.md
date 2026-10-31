# NavigAItor pilot kılavuzu

Bu kılavuz bir okul ve 2–4 şubeyle sınırlı, uzman gözetimli pilot içindir. Bu dalda staging projesi oluşturulmadı; kaynak koddaki hedefler canlı ortam kanıtı değildir. Hiçbir production migration, kullanıcı verisi değişikliği veya canlı yayın bu çalışmada yapılmadı.

## Uygulama yolları

| Kullanıcı | Adres | Veri kaynağı |
|---|---|---|
| Herkes | `/` ve `/giris` | Tanıtım ve gerçek Auth giriş/kayıt akışları |
| Yönetici/öğretmen | `/yonetim` | `public/app/*.js`; Supabase Auth/RLS/RPC |
| Öğrenci | `/ogrenci` | `public/app/*.js`; kendi oturumu ve atanmış etkinlikleri |
| Veli | `/veli` | `public/app/*.js`; bağlı çocuklara ilişkin Supabase verisi |
| Tanıtım | `/demo` | Eski, kurgusal localStorage demosu; gerçek hesap/RLS kanıtı değildir |

`/demo` ile gerçek panelleri birbirine karıştırmayın. CI'daki auth akışları Supabase'i taklit eder; gerçek RLS veya Edge Function kanıtı değildir. Kaynak düzeyi rol/okul/şube matrisi [ACCESS-MATRIX.md](ACCESS-MATRIX.md)'de bulunur.

## Pilot öncesi zorunlu engeller

1. **E-posta doğrulaması:** `kayit-ogretmen` ve `kayit-veli` şu an `email_confirm: true` ile kullanıcı açıyor. Bu, kullanıcının e-posta adresini gerçekten doğruladığını kanıtlamaz. SMTP/Auth doğrulama akışı staging'de çalışır ve ayrı cihazdan test edilir olana kadar gerçek öğretmen/veli kaydı bu yolla açılmamalı.
2. **Staging bulunmuyor:** Hesap/proje, migration uygulama durumu ve Edge Function dağıtımı bu checkout'ta doğrulanmadı. Production kullanılamaz; migration `0008` ve `0009` yalnızca izole staging'de gözden geçirilip test edilmelidir.
3. **Erişim politikası migration'ı:** `20261031000009_profile_isolation.sql` öğretmenlerin okul personel profillerini ve diğer öğretmenlerin şube atamalarını listelemesini kapatır. Migration uygulanıp admin/teacher pozitif-negatif testleri geçene kadar bu erişim düzeltmesi etkin sayılmaz.
4. **Rate-limit güvenilir adresi:** İstek kotası atomik hale getirildi; ancak Edge Function'lar `x-forwarded-for` kullanıyor. Supabase gateway'in bu başlığı güvenilir biçimde ürettiği/taklidinin mümkün olmadığı doğrulanmadı. Kaynak doğrulanana kadar brute-force koruması tam kanıtlanmış değildir.
5. **Roster veri minimizasyonu:** Öğrenci girişindeki sınıf kodu uç noktası, kodu bilenlere isim etiketi ve öğrenci UUID'si verir. UUID'yi tarayıcıya taşımayan kısa ömürlü bilet veya eşdeğer çözüm staging'de uygulanıp test edilmelidir.

Bu kapılar kapanmadan “pilot için teknik olarak hazır” denmemelidir.

## Staging kurulumu ve değişiklik penceresi

- [ ] Ayrı staging Supabase projesi açıldı; proje ref'i, bölgesi ve hedef ortam yetkililerce kaydedildi. Bu görev staging oluşturmadı.
- [ ] Staging frontend yapılandırması (`public/config.js`/build hedefi) production URL ve anahtarından ayrı doğrulandı; kaynak kodda servis sırları yok.
- [ ] Migration'lar staging'de sıralı olarak uygulandı: `0001`–`0007`, ardından `20261031000008_atomic_limits.sql` ve `20261031000009_profile_isolation.sql`. Uygulanan sürümler migration geçmişinden doğrulandı.
- [ ] Staging Auth e-posta doğrulaması, redirect URL ve SMTP teslimatı test edildi; kullanıcı hesabı doğrulama öncesi yetkili sayılmıyor.
- [ ] Edge Function'lar staging'e deploy edildi; `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_DAILY_LIMIT`, `AI_GLOBAL_DAILY_LIMIT` staging ortam değişkenleri/secret'ları olarak tanımlandı. Değerleri depoya veya loga yazılmadı.
- [ ] Staging smoke hesapları üretim/pilot hesabından ayrı tutuldu ve temizleme planı kaydedildi.
- [ ] Health-check `/`, `/giris`, `/yonetim`, `/ogrenci`, `/veli`; Auth, temel RPC, her Edge Function ve hata loglarıyla tamamlandı.

Production hedefini seçen bir komut bu runbook'ta yoktur. Production migration/deploy ayrı yetkili incelemesi, yedek doğrulaması ve değişiklik penceresi onayı gerektirir.

## Staging kabul testleri

Staging'de gerçek iki okul ve ayrı tarayıcı/oturumlarla her adım için başarı ve yetkisiz erişim reddi kanıtı saklanmalıdır:

- Yönetici şube açar, öğretmeni davet edip atar; öğretmen öğrencileri ekler.
- Öğrenci başka cihaz/tarayıcıdan doğru kendi hesabıyla açılır; yalnızca kendine atanmış etkinlikleri görür.
- Öğrenci etkinliği kaydeder/tamamlar; öğretmen aynı gerçek veritabanı durumunu görür.
- Veli tek kullanımlık davetle bağlanır; kendi çocuğunu görür, başka çocuğun rapor/teslimine erişemez.
- Öğretmen başka okulun profilini, atamasını, davetini ve öğrencisini okuyamaz; öğrenci başka öğrenci kaydını okuyamaz.
- Kullanılmış/sona ermiş davet, yanlış PIN, kilit, tekrarlı istek, `srv_rate_limit` hata durumu ve paralel kota isteği güvenli biçimde sınanır.
- Çıkıştan sonra eski kullanıcının yerel oturumu ve hassas önbellek verisi görünmez; rol değişimi yeni profil/RLS ile doğrulanır.
- AI geçersiz rol/girdi, eksik anahtar, kotanın dolması, kota RPC hatası, sağlayıcı hatası/timeout ve bozuk/şema dışı çıktıda güvenli hata verir.

Bu depo testleri gerçek Supabase/RLS veya Anthropic üretimini kanıtlamaz; staging kanıtının yerine geçmez.

## Temiz kurulum ve otomatik test

```bash
nvm use                         # .nvmrc: Node 22
npm ci
npx playwright install --with-deps chromium
npm test
```

`npm test` build, JavaScript static syntax kontrolleri, `/demo` localStorage smoke, gerçek sayfa yollarında mock Supabase auth akışları ve yerel XSS testini çalıştırır. Mock senaryolarını canlı güvenlik kanıtı diye raporlamayın. CI da Node 22 üzerinde aynı local/mock testleri çalıştırır; migration SQL veya gerçek Edge Function entegrasyon testi çalıştırmaz.

## Dağıtım, geri alma ve işletim

- Frontend ve Supabase migration/Edge Function sürümleri farklı release yüzeyleridir. Vercel deploy bağlantısı bu checkout'ta doğrulanmadı; CI otomatik production yayın yapmaz.
- Önce migration dosyaları incelenmeli ve staging'e sıralı uygulanmalı; migration planı/DB snapshot'ı ve doğrulama sorguları kaydedilmeden production'a geçilmemelidir.
- Her Edge Function ayrı deploy edilir; gerekli secret/model değişkenleri ilgili Supabase **staging** projesinde tanımlanır. Secret değişkenlerini build çıktısına koymayın.
- `0008` rate-limit/kota RPC'lerini değiştirir; `0009` RLS politikalarını daraltır. Bunlar source tree'de bulunuyor, uygulanmış sayılmaz.
- Hata halinde frontend sürümü geri alınabilir; şema değişikliği geri alınamıyorsa destructive rollback yerine uyumlu sürüm veya forward-fix hazırlanır. Migration'ı production'da otomatik tersine çevirme.
- [ ] Staging migration/deploy ve geri alma/forward-fix provası yapıldı.
- [ ] Yedekleme sıklığı/saklama süresi doğrulandı; izole ortamda backup restore provası yapıldı.
- [ ] Hata izleme, servis sorumlusu, günlük sağlık kontrolü ve pilot durdurma kişisi belirlendi.

## Kullanım sınırları

- Uygulama kabuğu ve statik dosyalar service worker ile çevrimdışı açılabilir; Supabase veri okuma/yazma çevrimdışı çalışmaz. Taslak/teslimler için çevrimdışı kuyruk ve cihazlar arası çatışma çözümü yoktur. Pilot işlemleri çevrimiçi yapın; hata mesajı görünürken sayfadan ayrılmadan yeniden deneyin. Yenileme/sekme kapatma öncesi sunucu kaydını doğrulayın.
- AI girişinde e-posta, telefon ve TC kimlik benzeri örüntüler reddedilir ve ham istem/yanıt veritabanına kaydedilmez; ad, adres ve dolaylı tanımlayıcılar kusursuz yakalanamaz. Serbest metne gerçek öğrenci/veli bilgisi yazılmamalı. Üretilen içerik öğretmen incelemesinden geçmeden atanmaz; pedagojik doğruluk otomatik garanti değildir.
- Gerçek veri tabanına bağlı olmayan veya demo kapsamındaki mesajlaşma/rapor paylaşımı gibi eylemler gönderilmiş/kaydedilmiş olarak gösterilmemelidir. Bu kapsamın kullanıcıya dönük etiketleri staging'de ayrıca gözden geçirilmelidir.
- Backup/restore, canlı RLS/Edge davranışı, migration uygulama durumu ve production deploy bu çalışmada doğrulanmadı.
