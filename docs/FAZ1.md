# Faz 1 — Hesaplar, roller ve gerçek yapay zekâ ucu

## Mimari

| Katman | Nerede | Ne yapar |
|---|---|---|
| Sayfalar | Vercel (`public/`, `src/`) | `/giris`, `/yonetim`, üç panel |
| Veritabanı | Supabase Postgres, eu-central-1 (Frankfurt) | `supabase/migrations/*.sql` |
| Sunucu fonksiyonları | Supabase Edge Functions | `supabase/functions/*` |
| Yapay zekâ | Claude (Anthropic API), yalnızca `yz-etkinlik` fonksiyonundan | Anahtar Supabase gizli değişkeninde; tarayıcıya inmez |

## Roller ve giriş

| Rol | Nasıl hesap açılır | Nasıl giriş yapar |
|---|---|---|
| Okul yöneticisi | `/giris` → Öğretmen → "Okulumu ilk kez ekliyorum" | E-posta + şifre |
| Öğretmen | Yöneticinin verdiği 8 karakterlik okul davet kodu | E-posta + şifre |
| Öğrenci | Öğretmen listeyi yapıştırır; sistem 4 haneli PIN üretir | Sınıf kodu (6 karakter) → adını seçer → PIN |
| Veli | Öğretmenin öğrenci için ürettiği tek kullanımlık davet kodu + KVKK açık rıza | E-posta + şifre |

## Güvenlik kuralları (veritabanında zorlanır)

- İstemci tablolara **yazamaz**; tüm değişiklikler yetki denetimli fonksiyonlardan geçer.
- Öğretmen yalnızca atandığı şubelerin öğrencilerini, yönetici kendi okulunun tamamını görür; başka okul hiçbir şey görmez.
- Öğrenci yalnızca kendi kaydını, veli yalnızca bağlı olduğu çocuğu görür.
- PIN'ler yalnızca bcrypt özeti olarak saklanır ve hiçbir istemci rolü okuyamaz. 5 hatalı denemede 15 dakika kilit.
- Kayıt ve giriş uçlarında IP başına hız sınırı vardır.
- Yapay zekâ ucu: yalnızca öğretmen/yönetici, günlük kota (varsayılan 40, `AI_DAILY_LIMIT`), öğrenci adı gönderilmez, kazanım kodları çıktıdan temizlenir, her üretim `ai_generations` tablosuna token sayısıyla kaydedilir.

## Yapılandırma

| Gizli değişken (Supabase → Edge Functions → Secrets) | Zorunlu | Açıklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | Evet | Claude API anahtarı. Yoksa panel "anahtar eksik" der, demo modu çalışmaya devam eder |
| `ANTHROPIC_MODEL` | Hayır | Varsayılan `claude-sonnet-5-5` |
| `AI_DAILY_LIMIT` | Hayır | Öğretmen başına günlük üretim sınırı, varsayılan 40 |

`public/config.js` içindeki proje adresi ve yayımlanabilir anahtar herkese açık olacak şekilde tasarlanmıştır.

## Testler

- `tests/auth-flows.mjs` — 30 kontrol: kayıt, şube, öğrenci içe aktarma ve PIN kartları, veli daveti ve açık rıza, öğrenci PIN girişi, yetki yönlendirmeleri, panelde yapay zekâ köprüsü (Supabase istekleri taklit edilir).
- Sunucu tarafı canlı projede ayrıca sınandı: kayıt → şube → içe aktarma → sınıf listesi → yanlış/doğru PIN → veli kaydı → yapay zekâ ucunun yetki ve anahtar kontrolleri; başka okulun veri görememesi.

## Bilinen sınırlar (Faz 2'de)

- Paneller hâlâ demo verisi gösteriyor; giriş yapan kişinin adı oturum rozetinde görünür ama sınıf listesi, atamalar ve ölçümler henüz veritabanından gelmiyor.
- Şifre sıfırlama e-postası için Supabase'e özel SMTP tanımlanmalı (varsayılan e-posta servisi yalnızca proje ekibine gönderir).
- KVKK aydınlatma metni taslaktır; pilot öncesi hukuk danışmanına onaylatılmalı.
