# NavigAItor

5–8. sınıflar için yapay zekâ destekli uyarlanabilir öğrenme platformu. Öğretmen, öğrenci ve veli panellerinden oluşan, kurulabilir (PWA) web uygulaması.

**Canlı:** https://navigaltor.vercel.app

| Sayfa | Yol |
|---|---|
| Giriş | `/` |
| Öğretmen Paneli | `/ogretmen` |
| Öğrenci Paneli | `/ogrenci` |
| Veli Paneli | `/veli` |
| Giriş (öğretmen, öğrenci, veli) | `/giris` |
| Yönetim (şubeler, öğrenciler, davetler) | `/yonetim` |

> **Pilot branch durumu:** hesaplar, roller, sınıf kodu + PIN ile öğrenci girişi, atama/teslim akışı ve Claude etkinlik üretimi Supabase üzerinde çalışacak şekilde kodlanmıştır. `/demo` kurgusal veridir; gerçek pilot akışı `/giris`, `/yonetim`, `/ogrenci` ve `/veli` rotalarındadır. Canlı migration ve Edge Function sürümleri branch ile ayrıca karşılaştırılmalıdır: [docs/PILOT-HAZIRLIK-RAPORU.md](docs/PILOT-HAZIRLIK-RAPORU.md)

## Geliştirme

```bash
npm run build      # src/ → dist/ (bağımlılık gerekmez, Node 18+)
npm run serve      # http://localhost:4173 adresinde önizleme
npm ci && npx playwright install --with-deps chromium
npm run check      # statik güvenlik ve repo bütünlüğü kontrolleri
npm test           # derler ve uçtan uca testleri çalıştırır
```

`main` dalına gönderilen her değişiklik Vercel'de otomatik olarak derlenip yayınlanır.

## Klasör yapısı

```
src/html/   Sayfa iskeleti ve stiller (head, tema, gövde)
src/js/     Uygulama modülleri; sırası scripts/build.mjs içinde tanımlı
            03-data       demo verisi            21-resmi     resmî öğretim programı kazanımları
            04/05-core    durum, yönlendirme     25-lib*      100 etkinlik + 21. yy beceri eşleşmeleri
            06–11         öğretmen ekranları     24-vis       etkileşimli görseller (pizza, kan yolculuğu…)
            13–17         öğrenci ekranları      26-onboard   Navi tanışma formu
            20-veli       veli paneli            27-report    3 aylık gelişim raporu
public/     Giriş ve yönetim sayfaları (app/), simgeler, hizmet çalışanı (sw.js), supabase-js (vendor/)
supabase/   migrations/ (veritabanı şeması + güvenlik), functions/ (sunucu fonksiyonları)
scripts/    build.mjs (derleme), serve.mjs (yerel sunucu)
tests/      smoke.mjs (uçtan uca testler)
docs/       Yol haritası ve kararlar
```

## Ürün kuralları

- Kazanım kodları arayüzde hiçbir yerde gösterilmez; kazanımlar adıyla yazılır.
- Kazanımlar yalnızca resmî kaynaktan (tymm.meb.gov.tr) alınır.
- Ders ve etkinlik kitapları soru havuzu olarak kullanılmaz; her öğrenciye düzeyine göre özgün ve anlık etkinlik üretilir.
