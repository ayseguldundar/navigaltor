# NavigAItor — güncel teknik yol haritası

_Son güncelleme: 30 Ekim 2026_

## Mevcut durum

NavigAItor artık yalnızca localStorage demosu değildir. Gerçek giriş, roller, okul/şube/öğrenci/veli ilişkileri, atama/teslim akışı ve AI Edge Function kodu Supabase için hazırlanmıştır. Kurgusal demo panelleri yalnızca `/demo` altında tutulur.

Üretim durumu repo branch’iyle otomatik olarak eşdeğer kabul edilmemelidir. Canlı Supabase’de migration geçmişi branch’ten geridedir; gerçek pilot kararı staging doğrulaması ve kontrollü deploy sonrasında verilmelidir.

## Tamamlanan teknik fazlar

| Faz | Durum | Not |
|---|---|---|
| Frontend/PWA ve demo akışı | Tamamlandı | Vercel’de yayın; PWA ve responsive smoke testleri mevcut |
| Hesaplar ve roller | Kodda tamamlandı | Supabase Auth, rol/profil ve okul izolasyonu |
| Atama/teslim ve veli görünümü | Kodda tamamlandı | Ayrı oturum senaryoları mock E2E ile kapsanıyor |
| AI üretim hattı | Kodda tamamlandı | Sunucu anahtarı, öğretmen onayı, çıktı şeması ve kota |
| Pilot hardening | Bu branch’te | CI, lockfile, fail-closed rate-limit, atomik kota migration’ı |

## Pilota giriş sırası

1. Staging Supabase projesini oluşturun veya seçin.
2. Migration’ları sıralı uygulayın ve `list_migrations` çıktısını branch ile karşılaştırın.
3. Edge Function’ları deploy edin; function version/hash ve secret varlığını doğrulayın.
4. İki okul ile pozitif/negatif RLS testleri, yanlış PIN/davet/rate-limit testleri ve paralel AI kota testi çalıştırın.
5. Yedekleme/geri yükleme ve rollback provasını yapın.
6. Sadece bu kanıtlar incelendikten sonra production migration/function deploy’u için manuel onay verin.

## Pilot sonrası

- Gerçek Supabase RLS/Edge Function testlerini CI veya belgelenmiş staging job’a bağlamak.
- Hata izleme, servis sağlık panosu ve hassas veri içermeyen audit metrikleri eklemek.
- Oturum iptali, öğretmen çıkarma ve self-service şifre sıfırlamayı ürünleştirmek.
- Frontend bundle’ını daha ileri bölmek; önce/sonra ölçümlerini CI artifact’ı olarak saklamak.
- AI prompt/yanıt saklama süresi ve operasyonel silme politikasını teknik olarak uygulamak.

## Kaynaklar

- Pilot kararları ve açık riskler: [PILOT-HAZIRLIK-RAPORU.md](PILOT-HAZIRLIK-RAPORU.md)
- Kurulum, deploy ve rollback: [PILOT.md](PILOT.md)
- Hesap/RLS tasarımı: [FAZ1.md](FAZ1.md)
