# NavigAItor — Demodan gerçek web uygulamasına yol haritası

_Son güncelleme: 29 Ekim 2026_

## Bugün neredeyiz (Faz 0 — tamamlandı)

| Konu | Durum |
|---|---|
| Kaynak kod | Depoda (`src/`), tek komutla derleniyor (`npm run build`) |
| Yayın | Vercel, her `main` güncellemesinde otomatik yayın |
| Kurulabilir uygulama (PWA) | Üç panel telefona/bilgisayara "uygulama" olarak eklenebiliyor, çevrimdışı açılıyor |
| Otomatik testler | `npm test` — 21 kontrol (bağlı akışlar, 100 etkinlik, kod sızıntısı, mobil, PWA) |
| Veri | **Yalnızca ziyaretçinin tarayıcısında** (localStorage). Sunucu, veritabanı, hesap yok |
| Yapay zekâ | **Taklit.** "Yapay zekâdan iste" hazır şablonlardan uyarlama yapıyor; gerçek üretim yok |
| Kullanıcılar | Kurgusal: tek öğretmen (Selin Yılmaz), tek öğrenci (Elif Yıldız), tek veli |

Kısacası: arayüz ve pedagojik akış ürün kalitesinde; arkasındaki **hesaplar, veritabanı ve gerçek yapay zekâ** henüz yok. Aşağıdaki fazlar bunları ekler.

---

## Önerilen teknoloji yığını

| Katman | Öneri | Neden |
|---|---|---|
| Barındırma | **Vercel** (mevcut) | Zaten kurulu; önizleme yayınları, otomatik HTTPS |
| Uygulama çatısı | **Next.js (TypeScript)** — panelleri sayfa sayfa taşıyarak | Sunucu tarafı API'ler (yapay zekâ anahtarı gizli kalır), Vercel ile yerel uyum, geniş geliştirici havuzu |
| Veritabanı + giriş | **Supabase (PostgreSQL + Auth)**, AB (Frankfurt) bölgesi | Satır düzeyi güvenlik ile "öğretmen yalnızca kendi şubesini görür" kuralı veritabanında zorlanır; hazır giriş sistemi |
| Yapay zekâ | **Sunucu tarafı API** üzerinden büyük dil modeli (ör. Claude) | Anahtar tarayıcıya hiç inmez; her istek kayıt altına alınır |
| Hata izleme | Sentry (ücretsiz katman) | Pilotta hataları kullanıcı bildirmeden görmek için |

**Taşıma stratejisi:** Mevcut arayüz yeniden yazılmaz. Önce veriler sunucuya taşınır (Faz 2), arayüz aynı kalır; sonra ekranlar ihtiyaç oldukça Next.js bileşenlerine dönüştürülür. Böylece her adımda çalışan bir ürün olur.

---

## Faz 1 — Hesaplar ve roller (tahmini 2–3 hafta)

- Roller: **okul yöneticisi, öğretmen, öğrenci, veli**. Her kayıt bir okula bağlı (çok okullu yapı baştan kurulur).
- **Öğretmen:** e-posta + şifre (veya Google ile giriş).
- **Öğrenci:** sınıf kodu + kişisel PIN veya QR kart. 5–8. sınıf öğrencilerinden e-posta istemek hem gerçekçi değil hem KVKK açısından gereksiz veri.
- **Veli:** öğretmenin gönderdiği davet bağlantısıyla; bağlantı veli onayı (açık rıza) adımını içerir.
- Okul yöneticisi öğretmen ve şube ekler; öğretmen öğrenci listesini içe aktarır (Excel/CSV).

## Faz 2 — Verinin sunucuya taşınması (tahmini 3–4 hafta)

Bugün tarayıcıdaki `DB` nesnesi şu tablolara bölünür:

| Tablo | İçerik |
|---|---|
| `schools`, `sections`, `users`, `enrollments` | Okul, şube, kişi, şube üyeliği |
| `curriculum_outcomes` | Resmî öğretim programı kazanımları (tymm.meb.gov.tr kaynaklı, mevcut veri) |
| `activity_templates` | 100 kütüphane etkinliği + 21. yy beceri eşleşmeleri |
| `assignments`, `submissions` | Atama, teslim, durum, puan |
| `measurements`, `error_events` | Kazanım ölçümleri, kavram/işlem/strateji hataları |
| `products` | Dijital ürünler (dosyalar Supabase Storage'da) |
| `intake_answers` | Navi tanışma formu cevapları |
| `reports`, `teacher_notes` | 3 aylık rapor anlık görüntüleri, öğretmen notları |

Arayüzdeki "öğretmen atar → öğrenci planında görür → öğrenci tamamlar → öğretmen görür" akışı bugün tek tarayıcıda çalışıyor; bu fazdan sonra **farklı cihazlar arasında** çalışır.

## Faz 3 — Gerçek yapay zekâ (tahmini 3–4 hafta)

- **Altın kural:** Ders kitapları ve etkinlik kitapları soru havuzu olarak kullanılmaz. Her öğrenciye düzeyine göre **özgün ve anlık** soru/etkinlik üretilir. Kütüphanedeki 100 etkinlik üretim için **yapı şablonudur**, kopyalanacak içerik değildir.
- Üretim sunucuda yapılır; modele öğrencinin adı veya kimliği gönderilmez, yalnızca takma kimlik + düzey + hata örüntüsü + tanışma formu tercihleri gider.
- Öğrenciye gidecek her yapay zekâ etkinliği önce **öğretmen onayından** geçer (bugünkü "Onayla ve ata" akışı korunur).
- Çıktılar otomatik denetlenir: kazanıma uygunluk, sınıf düzeyi, yaşa uygun dil, kazanım kodu içermeme.
- **Maliyet:** Rakam vermek için pilot kullanım verisi gerekir (öğrenci başına günlük üretim sayısı × istek başına token). Faz 3'ün ilk haftasında 1 şubelik ölçüm yapılıp öğrenci başına aylık maliyet bu veriyle hesaplanmalı; tahmine dayalı rakam sunulmamalı.

## Faz 4 — Pilot (tahmini 6–8 hafta)

- 1 okul, 2–4 şube; öğretmen eğitimi ve geri bildirim döngüsü.
- Hata izleme, günlük yedek, kullanım ölçümleri.
- Pilot sonunda: öğrenme kazanımı ölçümü (ön-son test), öğretmen zaman tasarrufu, yapay zekâ maliyeti.

---

## KVKK ve çocuk verisi — pilot öncesi şart

- Öğrenciler reşit değil: işlenen her kişisel veri için **veli açık rızası** ve **aydınlatma metni** gerekir.
- Veri yurt dışında (ör. AB'deki sunucu) tutulacaksa yurt dışına aktarım şartları karşılanmalı; alternatif Türkiye'de barındırma.
- VERBİS kayıt yükümlülüğü değerlendirilmeli.
- Yapay zekâya kimlik bilgisi gönderilmemesi (Faz 3) bu açıdan da gerekli.
- Bu başlıklar bir KVKK danışmanıyla netleştirilmeli; bu belge hukuki görüş değildir.

---

## Karar bekleyen konular

1. **Veri nerede tutulacak?** Supabase AB bölgesi (önerilen: hızlı kurulum, yönetilen servis) ya da Türkiye'de sunucu (KVKK aktarım yükü yok, kurulum ve bakım maliyeti yüksek).
2. **Öğrenci girişi:** sınıf kodu + PIN (önerilen) mi, okul e-postası mı?
3. **Geliştirme iş bölümü:** Faz 1–3 hangi ekip tarafından yapılacak? Teknoloji ortağıyla aynı yığın üzerinde anlaşmak en kritik ilk adım.
4. **Yapay zekâ sağlayıcısı ve pilot bütçe tavanı.**
