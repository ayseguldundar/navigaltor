# NavigAItor — demo ile gerçek web uygulamasını ayıran yol haritası

_Son güncelleme: 31 Ekim 2026 — kaynak kod ve test kapsamı gözden geçirildi; staging/production doğrulaması bu çalışma kapsamında yapılmadı._

## Bugün neredeyiz (kaynak kod durumu)

| Konu | Durum |
|---|---|
| Kaynak kod | `src/` eski `/demo` localStorage panelini, `public/app/` ise gerçek uygulama sayfalarının istemci kodunu içerir |
| Gerçek uygulama yolları | `/yonetim`, `/ogrenci`, `/veli` Supabase Auth/RLS/RPC akışlarına bağlanacak şekilde hazırlanmıştır |
| Eski demo yolu | `/demo` kurgusal verilerle localStorage kullanır; gerçek hesaba veya veritabanına dokunmaz |
| Yayın | Vercel yapılandırması depoda görünür; mevcut canlı/staging deploy durumu bağımsız doğrulanmadı |
| Otomatik testler | `npm test` build, localStorage smoke, Supabase mock'lu auth ve XSS testlerini çalıştırır; kontrol sayıları ve canlı başarı iddiaları doğrulanmadı |
| Veri ve hesap | `/demo` için tarayıcı localStorage'ı; gerçek uygulama için Supabase entegrasyon kodu var. Staging RLS/RPC kanıtı yok |
| Yapay zekâ | Gerçek uygulamada Edge Function köprüsü kaynak kodda bulunur; gerçek staging/production üretimi bu çalışmada doğrulanmadı |

Dolayısıyla “sunucu/hesap yok” ifadesi yalnızca eski `/demo` için doğrudur; gerçek `/yonetim`, `/ogrenci` ve `/veli` sayfaları için doğru değildir. Tersine, gerçek Supabase ortamının çalıştığı da bu checkout'tan kanıtlanmış sayılmaz.

## Faz 1 — Hesaplar, roller ve entegrasyon kaynakları

`public/app/*.js`, `supabase/migrations/*.sql` ve `supabase/functions/*` içinde hesap, rol, RLS/RPC ve Edge Function entegrasyonları bulunur. Bu kaynakların staging'de uygulandığı, özellikle `20261029000007_oturum_iptali.sql` migration'ının production'a geçtiği doğrulanmadı. Kanıt üretmek için [FAZ1.md](FAZ1.md) ve [PILOT.md](PILOT.md) manuel kapıları izlenmelidir.

## Faz 2 — Staging doğrulaması ve veri akışının kanıtlanması

Öncelik, yeni ürün çatısı taşımak değil, gerçek sayfaların staging Supabase projesiyle çalıştığını kanıtlamaktır: Auth, okul/şube/öğrenci/veli akışları, gerçek RLS negatif testleri, RPC yetkileri, Edge Function secret/kota davranışı, migration kayıtları ve health-check. CI testleri mock/local olduğu için bu fazın yerine geçmez.

## Faz 3 — Pilot işletim

Staging kanıtı tamamlandıktan sonra gözetimli pilot; öğretmen eğitimi, küçük kullanıcı grubu, hata izleme, günlük ölçümler ve geri bildirim döngüsüyle başlatılabilir. Pilot başlamadan backup/restore provası, rollback/forward-fix planı ve üretim değişiklik penceresi kayda alınmalıdır.

## İleri işler

Gerçek kullanım kanıtı oluştuğunda farklı cihazlar arası atama/teslim, raporlama, maliyet ölçümü ve gerekli arayüz iyileştirmeleri önceliklendirilebilir. Her iş için `/demo` localStorage kapsamı ile gerçek uygulama/Supabase kapsamı ayrı test edilmelidir.
