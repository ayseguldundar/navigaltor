# NavigAItor pilot kılavuzu

Bu kılavuz, uygulamayı bir okulda gözetimli pilot olarak kullanmaya başlamak için gereken ürün ve teknik adımları anlatır. Pilot başlamadan önce [PILOT-HAZIRLIK-RAPORU.md](PILOT-HAZIRLIK-RAPORU.md) içindeki staging onay kapıları geçilmelidir.

## Adresler

| Kim | Adres | Ne yapar |
|---|---|---|
| Herkes | `/` | Tanıtım sayfası |
| Herkes | `/giris` | Giriş ve kayıt |
| Öğretmen/yönetici | `/yonetim` | Şubeler, öğrenciler, PIN, davetler, atama ve AI taslakları |
| Öğrenci | `/ogrenci` | Tanışma formu, görevler, etkinlik |
| Veli | `/veli` | Bağlı çocukların etkinlikleri ve öğretmen notları |
| Tanıtım | `/demo` | Gerçek veriye dokunmayan kurgusal demo |

## Teknik kurulum ve deploy kapıları

1. Node sürümünü `22.x` kullanın. Yeni klonda `npm ci`, ardından `npx playwright install --with-deps chromium`, `npm run check` ve `npm test` çalıştırın.
2. Önce ayrı Supabase staging projesi seçin. Repo migration’larını sıralı uygulayın; üretim projesine doğrudan migration çalıştırmayın.
3. Supabase Edge Function secret store’a yalnızca şu değişkenleri ekleyin: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_DAILY_LIMIT`, `AI_GLOBAL_DAILY_LIMIT`. `SUPABASE_URL` ve Supabase anahtarları platform tarafından sağlanır; service-role anahtarı tarayıcıya koyulmaz.
4. `supabase/functions` altındaki fonksiyonları staging’e deploy edin. Özellikle `yz-etkinlik` deploy’undan önce `20261030000008_ai_kota_atomik.sql` uygulanmış olmalıdır.
5. Staging’de iki ayrı okul, iki öğretmen, iki öğrenci ve iki veli oluşturup pozitif/negatif erişim testleri çalıştırın. Başka okulun/çocuğun verisi hiçbir rolde görünmemeli.
6. Test çıktısı, migration listesi, function version/hash ve yedek doğrulaması incelenmeden production onayı vermeyin.

## Kurulum sırası (okul yöneticisi)

1. `/giris` → Öğretmen → hesap oluştur. Okul adını yazan kişi yönetici olur.
2. **Şubelerim** → yeni şube; sistem 6 karakterlik sınıf kodu üretir.
3. **Öğrenciler** → Excel’den No, Ad ve Soyad sütunlarını yapıştır. Üretilen 4 haneli PIN kartlarını hemen yazdırın; PIN’ler saklanmaz.
4. Öğrenci bazında veli davet kodu üretin. Kod tek kullanımlı ve süreli olmalıdır.
5. **Okul ve öğretmenler** → öğretmen davet kodu üretin. Her öğretmen için yeni kod kullanın.
6. En az iki yönetici belirleyin ve ilk gün bir test öğrencisiyle tam akışı deneyin.

## Günlük kullanım

- Öğretmen kütüphaneden etkinlik atar veya AI taslağı üretir; taslağı incelemeden öğrenciye atamaz.
- Öğrenci sınıf kodu → kısa ad → PIN ile girer ve kontrol listesini tamamlar.
- Veli yalnızca davetle bağlanan çocuklarının görünümünü görür.
- Mesajlaşma, rapor paylaşımı veya tamamlanmamış özellikler gönderildi/kaydedildi gibi sunulmamalıdır.

## Sık karşılaşılan durumlar

| Durum | Çözüm |
|---|---|
| Öğrenci PIN’ini unuttu | Yönetim → öğrenci → yeni PIN |
| PIN kartları kayboldu | Yönetim → tüm PIN’leri yenile |
| Yanlış PIN denemeleri | Kademeli kilit uygulanır; gerekirse PIN’i yenileyin |
| Şifre unutuldu | Pilot kılavuzundaki yönetici sıfırlama prosedürünü kullanın; geçici şifreyi paylaşım kanalında bırakmayın |
| Öğrenci okuldan ayrıldı | Pasif yapın; silme talebinde geri alınamaz silme akışını iki kişiyle kontrol edin |
| Rate-limit altyapısı hata verdi | İstek güvenli biçimde reddedilir; önce Supabase/RPC sağlığını kontrol edin, limitleri yükseltmeyin |

## Bilinen sınırlar

- Çevrimdışı açılış desteklenir; kayıt ve teslim internet ister.
- AI kotası öğretmen başına ve sistem geneline uygulanır; Anthropic tarafında ayrıca harcama tavanı koyun.
- Self-service e-posta şifre sıfırlama `/giris` ekranındaki **Şifremi unuttum** butonuyla başlar. Supabase Auth’ta Resend SMTP göndericisini yapılandırın; `https://<domain>/sifre-yenileme` adresini Auth URL allow-list’ine ekleyin. Recovery mailindeki bağlantı yeni parolayı kaydeder ve kullanıcıyı tekrar girişe yönlendirir.
- Mock testler gerçek Supabase RLS kanıtı değildir; staging entegrasyon çıktısını ayrıca saklayın.

## Rollback

Frontend için önceki Vercel deployment’ını yeniden etkinleştirin. Edge Function için önceki function version/hash’e dönün. Migration’ları geri almak yerine ileri uyumlu düzeltme migration’ı kullanın; veri silen veya production kullanıcılarını değiştiren rollback işlemini yazılı onay olmadan çalıştırmayın. Her rollback sonrasında `/giris`, öğrenci PIN girişi, veli görünümü ve öğretmen atama akışını smoke test edin.
