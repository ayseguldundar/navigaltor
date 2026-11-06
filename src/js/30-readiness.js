/* ================= TOPIC READINESS BASELINE (global; loaded before 99-init) =================
   One fixed, one-time ten-item baseline per currently visible grade-7 KZ. Outcome identifiers,
   titles and official outcome text are rendered from KZ; question content is hand-authored here.
   Static answer indexes are validated at load; this assessment never changes mastery, XP or errors. */
const READY_BANKS={
 "MAT7-1": [
  [
   "−8 + 5 işleminin sonucu nedir?",
   "−3|−13|3|13",
   0,
   "İşaretleri farklı iki tam sayıda mutlak değerler çıkarılır; büyük mutlak değerin işareti kalır."
  ],
  [
   "−6 − (−4) işlemi nasıl yazılır?",
   "−6 − 4|−6 + 4|6 − 4|6 + 4",
   1,
   "Negatif bir sayıyı çıkarmak, onun pozitifini eklemektir."
  ],
  [
   "−3 ile −9 sayılarından hangisi daha büyüktür?",
   "−9|Eşittir|−3|Karşılaştırılamaz",
   2,
   "Sayı doğrusunda sağda olan −3 daha büyüktür."
  ],
  [
   "|−12| değeri kaçtır?",
   "−12|−1|0|12",
   3,
   "Mutlak değer sayının sıfıra uzaklığıdır ve negatif olmaz."
  ],
  [
   "−4, 2, −1, 0 sayılarının küçükten büyüğe sıralanışı hangisidir?",
   "−1, −4, 0, 2|−4, −1, 0, 2|2, 0, −1, −4|−4, 0, −1, 2",
   1,
   "Negatif sayılarda mutlak değeri büyük olan daha küçüktür; ardından 0 ve pozitif sayı gelir."
  ],
  [
   "Bir dalgıç deniz seviyesinin 7 m altında (−7 m). 3 m yükselirse konumu nedir?",
   "−10 m|4 m|−4 m|10 m",
   2,
   "Yükselmek sayı doğrusunda pozitif yönde ilerlemektir: −7 + 3 = −4."
  ],
  [
   "Sıfıra en yakın sayı hangisidir?",
   "−8|3|5|−2",
   3,
   "Uzaklıklar sırasıyla 8, 2, 3 ve 5’tir; en küçük uzaklık 2’dir."
  ],
  [
   "−5 − 7 işleminin sonucu nedir?",
   "−12|12|2|−2",
   0,
   "Negatif sayıdan 7 daha çıkarmak sayı doğrusunda sola gitmektir."
  ],
  [
   "Aşağıdaki karşılaştırmalardan hangisi doğrudur?",
   "−6 > −2|0 < −1|−2 < 0|4 < −5",
   2,
   "Her negatif tam sayı sıfırdan küçüktür."
  ],
  [
   "Hava sıcaklığı −2°C iken 6 derece düşerse yeni sıcaklık kaç °C olur?",
   "4|−4|8|−8",
   3,
   "Düşüş −6 değişimidir: −2 + (−6) = −8."
  ]
 ],
 "MAT7-2": [
  [
   "(−7) × 3 işleminin sonucu nedir?",
   "−10|−21|10|21",
   1,
   "Negatif ile pozitifin çarpımı negatiftir; 7×3=21."
  ],
  [
   "(−8) × (−4) işleminin sonucu nedir?",
   "−32|−12|32|12",
   2,
   "Aynı işaretli iki tam sayının çarpımı pozitiftir."
  ],
  [
   "45 ÷ (−9) işleminin sonucu nedir?",
   "5|−4|4|−5",
   3,
   "Farklı işaretli bölmede sonuç negatiftir; 45÷9=5."
  ],
  [
   "(−36) ÷ (−6) kaçtır?",
   "6|−6|−30|30",
   0,
   "Aynı işaretli bölmede bölüm pozitiftir."
  ],
  [
   "(−3) × 5 + 4 işleminin sonucu nedir?",
   "−19|−11|−7|19",
   2,
   "Önce çarpma: −15; sonra 4 ekle: −11."
  ],
  [
   "24 ÷ (−4) × (−2) işlemi soldan sağa yapıldığında sonuç nedir?",
   "−12|−3|3|12",
   3,
   "Önce 24÷(−4)=−6, sonra (−6)×(−2)=12."
  ],
  [
   "−2, −5 ve 3 sayılarının çarpımı nedir?",
   "30|−30|−10|10",
   0,
   "İki negatif çarpanın çarpımı pozitif, pozitif 3 ile sonuç 30’dur."
  ],
  [
   "−42 ÷ 7 işleminin sonucu nedir?",
   "−7|−6|6|7",
   1,
   "Farklı işaretli sayılarda bölüm negatif olur."
  ],
  [
   "Bir oyun puanı her yanlış cevapta 4 azalıyor. 5 yanlış cevabın toplam puan etkisi nedir?",
   "−9|9|20|−20",
   3,
   "Beş kez −4 değişim, 5×(−4)=−20 puandır."
  ],
  [
   "(−5) × (−2) ÷ 5 işleminin sonucu nedir?",
   "2|−2|−10|10",
   0,
   "Önce çarpım 10; 10÷5=2."
  ]
 ],
 "MAT7-3": [
  [
   "−2/3 ile −3/4 sayılarından hangisi daha küçüktür?",
   "−2/3|Eşittir|−3/4|Karşılaştırılamaz",
   2,
   "−3/4=−0,75 ve −2/3≈−0,67; daha negatif olan küçüktür."
  ],
  [
   "1/2 ile 3/5 sayılarının doğru sıralaması hangisidir?",
   "3/5 < 1/2|Eşittir|1/2 < 0 < 3/5|1/2 < 3/5",
   3,
   "1/2=0,5 ve 3/5=0,6 olduğundan ilk kesir küçüktür."
  ],
  [
   "−1/4, 0, 2/5 sayılarının küçükten büyüğe sıralanışı hangisidir?",
   "−1/4 < 0 < 2/5|0 < −1/4 < 2/5|2/5 < 0 < −1/4|−1/4 < 2/5 < 0",
   0,
   "Negatif sayı sıfırdan; pozitif kesir sıfırdan büyüktür."
  ],
  [
   "Aşağıdaki kesirlerden hangisi 1/2’den büyüktür?",
   "3/8|5/8|4/9|2/5",
   1,
   "5/8, yarımdan 1/8 fazladır; diğerleri 1/2’den küçüktür."
  ],
  [
   "−5/6 ile −4/5 karşılaştırması hangisidir?",
   "−5/6 > −4/5|Eşittir|İkisi de pozitiftir|−5/6 < −4/5",
   3,
   "−5/6≈−0,833; −4/5=−0,8 olduğundan −5/6 daha küçüktür."
  ],
  [
   "2/3, 3/4, 5/8 sayılarından en büyüğü hangisidir?",
   "3/4|2/3|5/8|Hepsi eşit",
   0,
   "Ortak payda 24 ile sırasıyla 16/24, 18/24, 15/24 elde edilir."
  ],
  [
   "−1,2 ile −6/5 için hangi ifade doğrudur?",
   "−1,2 < −6/5|Eşittir|−1,2 > −6/5|−1,2 pozitiftir",
   1,
   "−6/5 = −1,2; iki gösterim aynı sayıdır."
  ],
  [
   "Sayı doğrusunda −7/10 hangi noktaya karşılık gelir?",
   "−0,07|0,7|−0,7|−7",
   2,
   "Paydası 10 olan −7/10, ondalık gösterimle −0,7’dir."
  ],
  [
   "4/7 ile 5/7 karşılaştırması hangisidir?",
   "4/7 < 5/7|4/7 > 5/7|Eşittir|Paydalar farklı olduğu için sıralanamaz",
   0,
   "Paydalar aynı olduğunda payı büyük olan kesir daha büyüktür."
  ],
  [
   "−3/5, −1/2, −2/3 sayılarının küçükten büyüğe sıralaması hangisidir?",
   "−1/2 < −3/5 < −2/3|−2/3 < −3/5 < −1/2|−3/5 < −2/3 < −1/2|−2/3 < −1/2 < −3/5",
   1,
   "Ondalık karşılıklar −0,667; −0,6; −0,5’tir."
  ]
 ],
 "MAT7-4": [
  [
   "3/4 + 2/5 işleminin sonucu nedir?",
   "5/9|17/20|5/20|23/20",
   3,
   "Ortak payda 20: 15/20 + 8/20 = 23/20."
  ],
  [
   "1/3 + 1/4 işleminin sonucu nedir?",
   "7/12|2/7|5/12|2/12",
   0,
   "Ortak payda 12; 4/12 + 3/12 = 7/12."
  ],
  [
   "5/6 − 1/3 işleminin sonucu nedir?",
   "4/3|1/2|2/3|4/6",
   1,
   "1/3=2/6; 5/6−2/6=3/6=1/2."
  ],
  [
   "2/5 × 3/4 çarpımı kaçtır?",
   "5/9|6/9|6/20=3/10|1/10",
   2,
   "Paylar ve paydalar çarpılır: 6/20 sadeleşince 3/10 olur."
  ],
  [
   "3/8 ÷ 3/4 işleminin sonucu nedir?",
   "1/2|9/32|4/8|3/6",
   0,
   "Bölen kesir ters çevrilerek çarpılır: 3/8×4/3=1/2."
  ],
  [
   "1/2 + 1/3 + 1/6 toplamı nedir?",
   "3/11|1|1/2|5/6",
   1,
   "Ortak payda 6: 3/6+2/6+1/6=6/6=1."
  ],
  [
   "2 tam 1/4 bileşik kesir olarak nasıl yazılır?",
   "6/4|3/4|9/4|8/4",
   2,
   "2 tam = 8/4; üzerine 1/4 eklenince 9/4 olur."
  ],
  [
   "4/10 kesrinin en sade hâli nedir?",
   "4/5|1/5|2/10|2/5",
   3,
   "Pay ve payda 2’ye bölünür."
  ],
  [
   "Bir pizzanın 3/8’i yeniyor. Kalanı hangi kesirdir?",
   "3/8|5/8|8/3|1/8",
   1,
   "Bütün 8/8 olduğundan kalan 8/8−3/8=5/8’dir."
  ],
  [
   "2/3 ÷ 4 işleminin sonucu nedir?",
   "8/3|2/7|1/6|3/8",
   2,
   "Bir sayıyı 4’e bölmek 1/4 ile çarpmaktır: 2/3×1/4=2/12=1/6."
  ]
 ],
 "MAT7-5": [
  [
   "4x + 3x − 5 cebirsel ifadesinin sadeleşmiş hâli nedir?",
   "7x−5|7x+5|x−5|12x",
   0,
   "Benzer x terimleri toplanır; sabit −5 kalır."
  ],
  [
   "2(a + 3) ifadesinin açılımı hangisidir?",
   "2a+3|2a+6|a+6|5a",
   1,
   "Dağılma özelliğiyle 2 hem a hem 3 ile çarpılır."
  ],
  [
   "5y − 2 + 3y + 7 ifadesinin sadeleşmiş hâli nedir?",
   "8y−9|2y+5|8y+5|8y+9",
   2,
   "5y+3y=8y ve −2+7=5."
  ],
  [
   "“Bir sayının 4 eksiğinin 3 katı” hangi cebirsel ifadeyle gösterilir?",
   "3x−4|4−3x|3x+4|3(x−4)",
   3,
   "Önce sayıdan 4 çıkarılır, sonra bu fark 3 ile çarpılır."
  ],
  [
   "x=2 iken 3x²−1 ifadesinin değeri nedir?",
   "5|11|12|−1",
   1,
   "x yerine 2: 3×2²−1=12−1=11."
  ],
  [
   "−2m + 5m − m ifadesi nasıl sadeleşir?",
   "4m|−8m|2m|2m−1",
   2,
   "Katsayılar −2+5−1=2 olduğundan ifade 2m’dir."
  ],
  [
   "4(p−2)+3 ifadesinin açılmış ve sadeleşmiş hâli nedir?",
   "4p−8|p−5|4p+5|4p−5",
   3,
   "4(p−2)=4p−8; +3 ile 4p−5 olur."
  ],
  [
   "“Bir sayının iki katının 7 fazlası” ifadesi hangisidir?",
   "2x+7|2(x+7)|x+14|7x+2",
   0,
   "İki kat 2x; bunun 7 fazlası 2x+7’dir."
  ],
  [
   "3x + 2y − x + 5y ifadesinin sadeleşmiş hâli nedir?",
   "4x+7y|2x+3y|2x+7y|−2x+7y",
   2,
   "x terimleri 3x−x=2x, y terimleri 2y+5y=7y olur."
  ],
  [
   "n=−3 iken 2n−4 ifadesinin değeri kaçtır?",
   "−2|2|10|−10",
   3,
   "2×(−3)−4=−6−4=−10."
  ]
 ],
 "MAT7-6": [
  [
   "x + 8 = 15 denkleminde x kaçtır?",
   "23|7|−7|8",
   1,
   "Her iki taraftan 8 çıkarılır."
  ],
  [
   "3x = 21 denkleminde x kaçtır?",
   "18|24|7|63",
   2,
   "Her iki taraf 3’e bölünür."
  ],
  [
   "2x + 5 = 17 denkleminin çözümü nedir?",
   "11|12|8,5|6",
   3,
   "5 çıkarınca 2x=12; ikiye bölünce x=6."
  ],
  [
   "4x − 3 = 13 denkleminde x kaçtır?",
   "4|2,5|16|−4",
   0,
   "3 ekleyince 4x=16; 4’e bölünce x=4."
  ],
  [
   "“Bir sayının 5 fazlası 12’dir” ifadesinin denklemi hangisidir?",
   "5x=12|x−5=12|x+5=12|5−x=12",
   2,
   "Bilinmeyen sayı x; beş fazlası x+5 olur."
  ],
  [
   "7x + 2 = 30 denkleminde x kaçtır?",
   "28|32|2|4",
   3,
   "2 çıkarınca 7x=28; 7’ye bölünce x=4."
  ],
  [
   "x/3 = 5 denkleminde x kaçtır?",
   "15|8|2|5/3",
   0,
   "Her iki taraf 3 ile çarpılır."
  ],
  [
   "Bir sayının 2 katının 5 eksiği 19 ise sayı kaçtır?",
   "7|12|24|14",
   1,
   "2x−5=19; 5 ekleyip 2’ye bölünce x=12."
  ],
  [
   "5(x−2)=20 denkleminde x kaçtır?",
   "4|2|18|6",
   3,
   "Her iki taraf 5’e bölünür: x−2=4; buradan x=6."
  ],
  [
   "x=7, 3x−4=17 denkleminde çözüm müdür?",
   "Evet; 3×7−4=17|Hayır; sonuç 21|Hayır; sonuç 25|Hayır; sonuç 17 değildir",
   0,
   "Yerine koyma eşitliğin iki tarafını da 17 verir."
  ]
 ],
 "MAT7-7": [
  [
   "3 kalem 24 TL ise aynı fiyatla 5 kalem kaç TL’dir?",
   "32 TL|29 TL|40 TL|45 TL",
   2,
   "Birim fiyat 24÷3=8 TL; 5×8=40 TL."
  ],
  [
   "4 işçi bir işi 6 günde bitiriyor. Aynı hızla 8 işçi kaç günde bitirir?",
   "12 gün|6 gün|2 gün|3 gün",
   3,
   "İşçi sayısı ile süre ters orantılı: işçi iki katına çıkınca süre yarıya iner."
  ],
  [
   "2 bardak un için 3 yumurta gerekiyorsa 6 bardak un için kaç yumurta gerekir?",
   "9|7|6|12",
   0,
   "Un miktarı üç katına çıktığından yumurta sayısı da 3×3=9 olur."
  ],
  [
   "Ölçek 1:100 olan çizimde 4 cm gerçekte kaç cm’dir?",
   "104 cm|400 cm|40 cm|4 cm",
   1,
   "Gerçek uzunluk çizimin 100 katıdır: 4×100=400 cm."
  ],
  [
   "Bir araç 2 saatte 120 km gidiyorsa aynı hızla 5 saatte kaç km gider?",
   "240 km|125 km|180 km|300 km",
   3,
   "Saatlik hız 60 km; 5 saatte 300 km yol alır."
  ],
  [
   "6 musluk bir havuzu 4 saatte doldurursa aynı debide 3 musluk kaç saatte doldurur?",
   "8 saat|2 saat|4 saat|12 saat",
   0,
   "Musluk sayısı yarıya düşerse süre iki katına çıkar."
  ],
  [
   "5 kg elma 150 TL ise 2 kg elma kaç TL’dir?",
   "30 TL|60 TL|75 TL|100 TL",
   1,
   "Birim fiyat 30 TL/kg; 2 kg 60 TL tutar."
  ],
  [
   "3 defter 45 TL. 5 defterin fiyatını bulmak için hangi oran kullanılmalıdır?",
   "45/5 = x/3|3/45 = x/5|45/3 = x/5|45+3 = x+5",
   2,
   "Defter başına fiyat aynı kalacağı için fiyat/adet oranları eşitlenir."
  ],
  [
   "Bir haritada 2 cm, gerçekte 10 km ise 7 cm kaç km’yi gösterir?",
   "35 km|15 km|25 km|70 km",
   0,
   "Her santimetre 5 km’dir; 7×5=35 km."
  ],
  [
   "Aynı işi 4 kişi 9 saatte yapıyor. 12 kişi aynı hızla kaç saatte yapar?",
   "27 saat|3 saat|9 saat|6 saat",
   1,
   "Kişi sayısı üç katına çıktığı için süre üçte bire iner."
  ]
 ],
 "MAT7-8": [
  [
   "Bir araç 3 saatte 180 km gidiyor. Sabit hızla 5 saatte kaç km gider?",
   "182 km|240 km|360 km|300 km",
   3,
   "Birim hız 60 km/saattir; 5×60=300 km."
  ],
  [
   "y, x ile doğru orantılı ve x=2 iken y=6. x=5 iken y kaçtır?",
   "15|9|11|30",
   0,
   "Oran y/x=3 sabit; y=3×5=15."
  ],
  [
   "Bir musluk 4 dakikada 12 L su akıtıyor. 10 dakikada kaç litre akar?",
   "24 L|30 L|18 L|40 L",
   1,
   "Debi 3 L/dakika; 10 dakikada 30 L akar."
  ],
  [
   "Bir tarif 4 kişiye 300 g pirinç kullanıyor. 10 kişi için kaç gram gerekir?",
   "600 g|450 g|750 g|1.200 g",
   2,
   "Kişi başı 75 g; 10 kişiye 750 g gerekir."
  ],
  [
   "Sabit hızla 2 saatte 90 km giden bisikletli 6 saatte kaç km gider?",
   "270 km|180 km|94 km|360 km",
   0,
   "Süre üç katına çıkarsa sabit hızda yol da üç katına çıkar."
  ],
  [
   "Doğru orantı tablosunda x 4’ten 10’a çıkınca y 12’den kaç olur?",
   "18|30|24|36",
   1,
   "y/x=3 sabittir; y=10×3=30."
  ],
  [
   "5 m kumaş 200 TL ise aynı kumaşın 8 metresi kaç TL’dir?",
   "280 TL|205 TL|320 TL|400 TL",
   2,
   "Metre fiyatı 40 TL’dir; 8×40=320 TL."
  ],
  [
   "Bir yazıcı dakikada 18 sayfa basıyor. 7 dakikada kaç sayfa basar?",
   "25|108|144|126",
   3,
   "Sabit üretim hızıyla 18×7=126 sayfa basar."
  ],
  [
   "3 paket tohum 12 m² alanı ekiyor. 7 paket kaç m² alanı eker?",
   "16 m²|28 m²|21 m²|36 m²",
   1,
   "Paket başına 4 m²; 7 paket 28 m² alanı eker."
  ],
  [
   "Doğru orantıda x 3 katına çıkarılırsa y nasıl değişir?",
   "3 azalır|Değişmez|3 katına çıkar|9 katına çıkar",
   2,
   "Doğru orantıda oran sabittir; değişkenlerden biri 3 kat olunca diğeri de 3 kat olur."
  ]
 ],
 "TUR7-1": [
  [
   "Bir paragrafta ana fikir en doğru nasıl bulunur?",
   "Paragrafın bütününü kapsayan temel yargıyı belirleyerek|İlk cümleyi her zaman aynen alarak|En uzun cümleyi seçerek|Bilinmeyen her sözcüğü sıralayarak",
   0,
   "Ana fikir metnin tamamının üzerinde durduğu temel düşüncedir; yalnızca ilk cümle olmayabilir."
  ],
  [
   "“Ece her gün fidanları suladı. Yaz sonunda bahçede gölge veren ağaçlar büyüdü.” En uygun çıkarım nedir?",
   "Fidanlar kendiliğinden kurudu.|Düzenli bakım sonuç verdi.|Ece bahçeyi hiç ziyaret etmedi.|Ağaçlar bir günde büyüdü.",
   1,
   "Verilen olay sırası, bakım ile gelişim arasında ilişki kurmayı destekler."
  ],
  [
   "Bir metnin konusu ile ana fikri arasındaki fark hangisidir?",
   "İkisi daima aynı cümledir.|Ana fikir yalnızca kişi adıdır.|Konu ne anlatıldığını, ana fikir bu konuda ne söylendiğini belirtir.|Konu metnin son cümlesidir.",
   2,
   "Konu genel alanı; ana fikir yazarın o alandaki temel iletisini açıklar."
  ],
  [
   "“Her hafta kitap okuyan Deniz yeni sözcükler öğreniyor ve yazılarını geliştiriyor.” Ana fikir hangisidir?",
   "Deniz yalnızca hafta sonu yazı yazar.|Her kitap aynı uzunluktadır.|Yeni sözcükler öğrenmek gereksizdir.|Düzenli okuma dil becerilerini geliştirebilir.",
   3,
   "Cümle düzenli okumanın sözcük ve yazma gelişimine katkısını vurgular."
  ],
  [
   "Bir metinde “çünkü” sözcüğü çoğunlukla hangi ilişkiye işaret eder?",
   "Zaman sırasına|Neden açıklamasına|Karşıtlığa|Örneklerin sona ermesine",
   1,
   "“Çünkü” önceki yargının nedenini verir."
  ],
  [
   "Metinde “Buna rağmen” ifadesi, önceki yargıyla nasıl bir ilişki kurar?",
   "Aynı anlamı tekrar|Örnekleme|Karşıtlık/beklenmeyen durum|Neden-sonuçta neden",
   2,
   "Bu bağlaç, önceki duruma ters düşen bir bilgiyi tanıtır."
  ],
  [
   "Bir çıkarım yaparken en güvenilir dayanak hangisidir?",
   "Kişisel tahmini tek başına kullanmak|Başlığa bakıp metni okumamak|Metne ilgisiz bir olay eklemek|Metindeki ipuçları ve bilgiler",
   3,
   "Çıkarım metin kanıtından hareket etmeli; kanıtlanmayan varsayıma dönüşmemelidir."
  ],
  [
   "“Kütüphane sessizdi; öğrenciler sınavlarına odaklanmıştı.” Hangi çıkarım desteklenir?",
   "Öğrenciler çalışmak için sessiz bir ortam kullanıyordu.|Kütüphane kapalıydı.|Öğrenciler sınava girmedi.|Kitaplar ödünç verilmiyordu.",
   0,
   "Sessizlik ve odaklanma bilgileri çalışma amacı çıkarımını destekler."
  ],
  [
   "Ana fikri belirlemek için en yararlı yöntem hangisidir?",
   "Tek bir örneği ana fikir saymak|Yalnızca kişi adlarını not etmek|Ayrıntıları birleştirip metnin ortak mesajını kendi sözleriyle özetlemek|Metin dışı bilgi eklemek",
   2,
   "Özetleme, ayrıntılar arasındaki ortak düşünceyi görünür kılar."
  ],
  [
   "Bir metin, su tasarrufu yöntemlerini ve etkilerini anlatıyor. En uygun ana fikir hangisidir?",
   "Bütün evlerde aynı musluk vardır.|Su yalnızca içmek için kullanılır.|Tasarruf yöntemleri işe yaramaz.|Günlük tasarruf davranışları su kaynaklarının korunmasına katkı sağlar.",
   3,
   "Yöntemler ve etkiler metnin korumaya katkı iletisini birleştirir."
  ]
 ],
 "TUR7-2": [
  [
   "“Küçük bir ayrıntı, anlatının bütün havasını değiştirdi.” cümlesinde “ayrıntı” sözcüğünün anlamı hangisine yakındır?",
   "Ana başlık|İnce nokta|Sonuç|Gürültü",
   1,
   "Ayrıntı, bütünü oluşturan küçük fakat belirgin noktadır."
  ],
  [
   "Bir sözlükte bilmediğin sözcüğün anlamını ararken hangi bilgi en çok yardımcı olur?",
   "Sayfa numarası|Metnin yazı tipi|Sözcüğün metindeki bağlamı ve cümle örneği|Paragrafın satır sayısı",
   2,
   "Bağlam, sözcüğün o kullanımda hangi anlamı taşıdığını seçmeye yardım eder."
  ],
  [
   "“Çocuk sevinçten havalara uçtu.” ifadesindeki “havalara uçtu” ne anlatır?",
   "Gerçekten uçak kullandığını|Üzüldüğünü|Yorulduğunu|Çok sevindiğini",
   3,
   "Bu kalıp mecaz anlamla büyük sevinci anlatır."
  ],
  [
   "“Yol” sözcüğünün “Bu konuda bir yol bulmalıyız.” cümlesindeki anlamı hangisidir?",
   "Çözüm/yöntem|Kara yolu|Yürüyüş parkuru|Yön levhası",
   0,
   "Cümlede fiziksel yol değil, çözüm yöntemi anlatılır."
  ],
  [
   "“Cesur” sözcüğünün zıt anlamlısı hangisidir?",
   "Yürekli|Atılgan|Korkak|Gözü pek",
   2,
   "Korkak, cesur sözcüğünün karşıt anlamını taşır."
  ],
  [
   "“Yardım” sözcüğüne anlamca en yakın sözcük hangisidir?",
   "Engel|Zarar|Uzaklık|Destek",
   3,
   "Destek, yardım etme anlamıyla yakındır."
  ],
  [
   "“Sert” sözcüğü “sert ekmek” ve “sert konuşma” ifadelerinde neden farklı anlam taşır?",
   "Bağlama göre gerçek veya mecaz anlam kazanır.|Her iki cümlede de yalnızca renk bildirir.|Sözcük değişmeden anlamı daima aynıdır.|İkinci kullanım yazım yanlışıdır.",
   0,
   "Sözcüğün çevresindeki kelimeler, hangi anlamın kullanıldığını belirler."
  ],
  [
   "“Misafir” sözcüğünün Türkçe eş anlamlısı hangisidir?",
   "Ev sahibi|Konuk|Komşu|Yolcu",
   1,
   "Konuk, misafir ile aynı anlama gelir."
  ],
  [
   "Bir cümlede bir sözcüğün anlamını bağlamdan tahmin ederken hangi ipucu özellikle işe yarar?",
   "Cümlenin harf sayısı|Yazarın doğum yılı|Sayfanın rengi|Yakınındaki açıklama, örnek veya karşıtlık",
   3,
   "Yakın bağlamdaki açıklamalar ve karşılaştırmalar anlam için doğrudan ipucu sağlar."
  ],
  [
   "“Özgün” sözcüğünün anlamına en yakın seçenek hangisidir?",
   "Kendine has, başkasını taklit etmeyen|Çok eski|Eksik bırakılmış|Rastlantıyla bulunmuş",
   0,
   "Özgün, kendine has ve taklit olmayanı anlatır."
  ]
 ],
 "TUR7-3": [
  [
   "Bir paragraf yazmaya başlamadan önce amaç ve okuyucuyu belirlemek neden yararlıdır?",
   "Yazıyı gereksiz yere uzatmak için|Noktalama işaretlerini kaldırmak için|İçerik ve anlatım biçimini amaca uygun seçmek için|Başlığı rastgele seçmek için",
   2,
   "Amaç ve okuyucu, hangi bilgilerin ve dilin uygun olacağını belirler."
  ],
  [
   "“Okul bahçesine daha çok ağaç dikilmelidir.” Bu görüşü destekleyen gerekçe hangisidir?",
   "Bahçe okulun yanındadır.|Bazı öğrenciler mavi rengi sever.|Ağaç sözcüğü dört harflidir.|Ağaçlar gölge sağlar ve havayı iyileştirmeye yardımcı olur.",
   3,
   "Gerekçe, öneriyle doğrudan ilgili ve açıklayıcı olmalıdır."
  ],
  [
   "Bir olay yazısında olayları anlaşılır kılmak için hangi sıra çoğunlukla uygundur?",
   "Başlangıç, gelişme, sonuç|Sonuç, başlık, rastgele ayrıntılar|Yalnızca sonuç|Sözlük sırası",
   0,
   "Olayların başlangıçtan sonuca düzenlenmesi metnin izlenmesini kolaylaştırır."
  ],
  [
   "“Önce plan yaptık, ardından görevleri paylaştık.” “Ardından” ne bildirir?",
   "Karşıtlık|Zaman sırası|Neden|Koşul",
   1,
   "“Ardından” sonraki adımı zaman sırasıyla belirtir."
  ],
  [
   "Bir paragrafta aynı düşüncenin tekrarını azaltmanın iyi yolu hangisidir?",
   "Her cümleyi iki kez yazmak|Bütün bağlaçları silmek|Konuyla ilgisiz örnek eklemek|Tekrar eden cümleleri birleştirip gereksiz olanı çıkarmak",
   3,
   "Düzenleme, yinelenen bilgiyi ayıklayıp anlamı korur."
  ],
  [
   "Bir yazının ana düşüncesini en uygun biçimde destekleyen ayrıntı hangisidir?",
   "Konuya ilişkin örnek veya açıklayıcı kanıt|Okurun sevdiği rastgele bir bilgi|Konuyla ilgisiz bir anı|Aynı başlığın tekrarı",
   0,
   "Ayrıntılar ana düşünceyi açıklar veya kanıtlar nitelikte olmalıdır."
  ],
  [
   "Taslak yazdıktan sonra en etkili gözden geçirme adımı hangisidir?",
   "Yalnızca sayfa rengini değiştirmek|Anlam, paragraf sırası, yazım ve noktalama kontrolü yapmak|Metni okumadan göndermek|Her cümleyi silmek",
   1,
   "Gözden geçirme içerik ve dil doğruluğunu birlikte denetler."
  ],
  [
   "“Kitap okumak yararlıdır; çünkü sözcük dağarcığını geliştirir.” “Çünkü” hangi işlevdedir?",
   "Karşılaştırma yapar|Zamanı bildirir|Gerekçe sunar|Sonucu reddeder",
   2,
   "İkinci bölüm ilk yargının gerekçesini verir."
  ],
  [
   "Bir davet metninde hangi bilgiler bulunmalıdır?",
   "Etkinliğin ne zaman, nerede ve ne için olduğu|Yalnızca yazanın sevdiği renk|Konuyla ilgisiz uzun tanımlar|Okurdan saklanan tarih",
   0,
   "Okurun katılabilmesi için etkinlik bilgileri açık olmalıdır."
  ],
  [
   "Bir metne uygun başlık seçerken en iyi ölçüt hangisidir?",
   "En uzun kelimelerden oluşması|Metnin temel içeriğini kısa ve doğru yansıtması|Metinde hiç geçmeyen bir konuyu anlatması|Her zaman soru biçiminde olması",
   1,
   "Başlık, metnin ana içeriğine uygun ve yanıltıcı olmayan bir özet olmalıdır."
  ]
 ],
 "FEN7-1": [
  [
   "Uzay teleskobunun temel amacı hangisidir?",
   "Dünya’daki depremleri durdurmak|Uyduları yakıtla doldurmak|Okyanus derinliğini ölçmek|Gök cisimlerinden gelen ışınımı uzaydan gözlemek",
   3,
   "Uzay teleskopları gök cisimlerini gözleyerek astronomik veri toplar."
  ],
  [
   "Yapay uyduların Dünya çevresindeki yörüngede kalmasını sağlayan temel etki hangisidir?",
   "Yer çekimi ve ileri hareketin birlikte oluşturduğu yörünge hareketi|Uyduya sürekli ip bağlanması|Havanın uyduyu yukarı itmesi|Dünya’nın dönmesinin uyduları durdurması",
   0,
   "Yer çekimi uyduyu Dünya’ya doğru çekerken ileri hızı yörüngede kalmasını sağlar."
  ],
  [
   "Uzay istasyonları hangi amaçla kullanılır?",
   "Havaalanı uçaklarını park etmek|Astronotların uzayda yaşayıp bilimsel araştırma yapması|Deniz suyunu arıtmak|Gök taşlarını Dünya’ya yönlendirmek",
   1,
   "Uzay istasyonları insanlı araştırma ve deney ortamıdır."
  ],
  [
   "Bir haberleşme uydusu hangi hizmete doğrudan katkı sağlar?",
   "Yer altındaki kömürün çıkarılmasına|Depremi önceden engellemeye|Televizyon ve telefon sinyallerinin uzak bölgelere aktarılmasına|Bitkilerin fotosentez yapmasına",
   2,
   "Haberleşme uyduları sinyalleri alıp ileterek iletişimi destekler."
  ],
  [
   "Teleskop aynasının büyük olması gözlemi nasıl etkiler?",
   "Daha fazla ışık toplayıp sönük cisimlerin gözlenmesini kolaylaştırır.|Gök cisimlerini Dünya’ya yaklaştırır.|Yıldızların sıcaklığını düşürür.|Yörüngedeki uyduları hızlandırır.",
   0,
   "Geniş ayna daha çok ışık toplar; uzak ve sönük cisimler daha iyi incelenir."
  ],
  [
   "Bir uzay sondasının insan taşımadan başka gezegeni incelemesi hangi özelliktir?",
   "Haberleşme ağı|Robotik uzay araştırması|Hava durumu ölçümü|Yeryüzü haritacılığı",
   1,
   "Uzay sondaları insansız araçlar olarak gök cisimlerine veri toplamak üzere gönderilir."
  ],
  [
   "Uzay çöplerinin artması hangi riski artırır?",
   "Gezegenlerin yörüngeden çıkmasını|Güneş ışığının durmasını|Çarpışmaların çalışan uydu ve uzay araçlarına zarar vermesini|Dünya’nın yer çekiminin yok olmasını",
   2,
   "Yörüngedeki parçalar yüksek hızla çarparak araçlara hasar verebilir."
  ],
  [
   "Uzay araştırmalarından günlük yaşama aktarılabilen bir uygulama hangisidir?",
   "Ay’ın Dünya’dan uzaklaşmasını durdurma|Yer çekimini kapatma|Mevsimleri değiştirme|Uydu tabanlı konum belirleme",
   3,
   "Uydu navigasyonu konum ve yön bulma hizmetleri sunar."
  ],
  [
   "Astronotlar uzayda neden özel giysi kullanır?",
   "Daha hızlı yörünge çizmek için|Basınç, oksijen ve sıcaklık koşullarına karşı korunmak için|Uydularla aynı renkte görünmek için|Yer çekimini artırmak için",
   1,
   "Uzay ortamında solunabilir hava ve uygun basınç bulunmadığından yaşam desteği gerekir."
  ],
  [
   "Bir gözlemevi için ışık kirliliğinin düşük olması neden önemlidir?",
   "Teleskop aynasını büyütür.|Dünya’nın dönüşünü yavaşlatır.|Sönük gök cisimlerinden gelen ışığı ayırt etmeyi kolaylaştırır.|Yıldızları daha yakına getirir.",
   2,
   "Yapay ışık gökyüzü gözlemlerini perdeleyebilir; karanlık gökyüzü gözlemi iyileştirir."
  ]
 ],
 "FEN7-2": [
  [
   "Bir pil ile çalışan el fenerinde temel enerji dönüşümü hangisidir?",
   "Kimyasal enerji → elektrik enerjisi → ışık ve ısı enerjisi|Işık → çekim potansiyel enerjisi|Ses → kimyasal enerji|Isı → kütle enerjisi",
   0,
   "Pil kimyasal enerjiyi elektrik enerjisine, ampul ise ışık ve bir miktar ısıya dönüştürür."
  ],
  [
   "Bitkilerin fotosentezinde ışık enerjisi hangi enerji biçiminde depolanır?",
   "Ses enerjisi|Kimyasal enerji|Kinetik enerji|Elektrik enerjisi",
   1,
   "Fotosentez ışık enerjisini besinlerdeki kimyasal enerjiye dönüştürür."
  ],
  [
   "Elektrikli ısıtıcı çalışırken enerji dönüşümü hangisidir?",
   "Isı enerjisi → kimyasal enerji|Işık enerjisi → ses enerjisi|Elektrik enerjisi → ısı enerjisi|Kinetik enerji → çekim potansiyeli",
   2,
   "Isıtıcı elektrik enerjisini büyük ölçüde ısıya dönüştürür."
  ],
  [
   "Bir hoparlörde elektrik enerjisi çoğunlukla hangi enerjiye dönüşür?",
   "Çekim potansiyel enerjisi|Kimyasal enerji|Işık enerjisi|Ses enerjisi",
   3,
   "Hoparlör elektrik sinyalini titreşime ve duyulabilir sese dönüştürür."
  ],
  [
   "Enerji dönüşümlerinde “enerji yok olmaz” ilkesi ne anlatır?",
   "Her dönüşümde enerji tamamen kaybolur.|Enerji başka türlere dönüşebilir; toplam enerji korunur.|Enerji yalnızca ışık biçiminde bulunur.|Bir cisim enerji üretemez ve alamaz.",
   1,
   "Enerji biçim değiştirir; yoktan var olmaz ve yok olmaz."
  ],
  [
   "Güneş paneli hangi dönüşümü gerçekleştirir?",
   "Elektrik enerjisi → çekim enerjisi|Ses enerjisi → ısı enerjisi|Işık enerjisi → elektrik enerjisi|Kimyasal enerji → ses enerjisi",
   2,
   "Fotovoltaik hücreler güneş ışığından elektrik akımı elde eder."
  ],
  [
   "Mum yanarken hangi enerji dönüşümü belirgindir?",
   "Kinetik enerji → kimyasal enerji|Ses enerjisi → elektrik enerjisi|Çekim enerjisi → ışık enerjisi|Kimyasal enerji → ışık ve ısı enerjisi",
   3,
   "Mumun kimyasal enerjisi yanma sırasında ışık ve ısıya dönüşür."
  ],
  [
   "Enerji dönüşümü sırasında çevreye yayılan ve kullanılamayan ısı neyi gösterir?",
   "Enerjinin bir bölümünün farklı bir biçime dönüştüğünü|Enerjinin yok olduğunu|Kütlenin sıfıra indiğini|Maddenin enerji taşımadığını",
   0,
   "Enerji kaybolmaz; yararlı biçimden çevreye yayılan ısıya dönüşebilir."
  ],
  [
   "Rüzgâr türbininde rüzgârın hareketi sonunda hangi enerji elde edilir?",
   "Kimyasal enerji|Ses enerjisi|Elektrik enerjisi|Çekim potansiyel enerjisi",
   2,
   "Rüzgâr türbininin kanatlarını döndürür; jeneratör elektrik üretir."
  ],
  [
   "Bir ampulün yanması için devrede enerji aktarımını sağlayan kaynak hangisidir?",
   "Cam ampulün rengi|Anahtarın plastik gövdesi|Devredeki yalıtkan kaplama|Pil veya güç kaynağı",
   3,
   "Pil devreye elektrik enerjisi sağlar; kapalı devrede ampul çalışır."
  ]
 ],
 "FEN7-3": [
  [
   "Yüksek raftan düşen kitabın yere inerken hangi enerjisi azalır?",
   "Kinetik enerjisi|Çekim potansiyel enerjisi|Ses enerjisi|Kimyasal enerjisi",
   1,
   "Kitabın yüksekliği azaldıkça çekim potansiyel enerjisi azalır."
  ],
  [
   "Bir bisikletin kinetik enerjisi hangi durumda artar?",
   "Bisiklet durunca|Bisiklet boyanınca|Bisiklet hızlanınca|Bisiklet gölgeye girince",
   2,
   "Kinetik enerji hareketle ilişkilidir ve hız arttıkça artar."
  ],
  [
   "Gerilmiş bir lastikte hangi enerji depolanır?",
   "Kinetik enerji|Ses enerjisi|Elektrik enerjisi|Esneklik potansiyel enerjisi",
   3,
   "Şekli değiştirilen esnek cisim enerji depolar."
  ],
  [
   "Aynı hızla hareket eden iki cisimden kütlesi büyük olanın kinetik enerjisi nasıldır?",
   "Daha büyüktür|Daha küçüktür|Sıfırdır|Hızından bağımsız olarak aynıdır",
   0,
   "Kinetik enerji kütleyle doğru orantılıdır; hızlar aynıysa kütlesi büyük olanın enerjisi fazladır."
  ],
  [
   "Yerden yukarı kaldırılan topun hangi enerjisi artar?",
   "Kinetik enerjisi zorunlu olarak|Ses enerjisi|Çekim potansiyel enerjisi|Kimyasal enerjisi",
   2,
   "Yerden yüksekliği arttıkça çekim potansiyel enerjisi artar."
  ],
  [
   "Hareket eden bir top duvara çarpıp durduğunda enerjinin bir bölümü neye dönüşebilir?",
   "Yok olur|Yalnızca çekim enerjisine|Kütleye dönüşmeden kaybolur|Ses ve ısı enerjisine",
   3,
   "Çarpışmada hareket enerjisinin bir bölümü ses ve ısı olarak çevreye aktarılır."
  ],
  [
   "Bir sarkaç en alçak noktadan geçerken kinetik enerjisi genellikle nasıldır?",
   "En büyük değerine yakındır|Sıfırdır|En küçük değerindedir|Potansiyel enerjisiyle eşit olmak zorundadır",
   0,
   "Sarkaç alçak noktada en hızlıdır; bu nedenle kinetik enerjisi büyüktür."
  ],
  [
   "Yay sıkıştırıldığında enerji hangi biçimde depolanır?",
   "Kinetik enerji|Esneklik potansiyel enerjisi|Işık enerjisi|Ses enerjisi",
   1,
   "Sıkışma yayda esneklik potansiyel enerjisi biriktirir."
  ],
  [
   "Aynı yükseklikte duran iki toptan kütlesi büyük olanın çekim potansiyel enerjisi nasıldır?",
   "Daha küçüktür|Sıfırdır|Kütleyle değişmez|Daha büyüktür",
   3,
   "Aynı yerde yükseklik sabitken çekim potansiyel enerjisi kütleyle artar."
  ],
  [
   "Düşen topun hızı artarken kinetik enerjisi nasıl değişir?",
   "Artar|Azalır|Değişmez|Önce yok olur",
   0,
   "Hız arttıkça hareket enerjisi, yani kinetik enerji artar."
  ]
 ],
 "SOS7-1": [
  [
   "Etkili iletişimde karşıdaki kişi konuşurken en uygun davranış hangisidir?",
   "Yanıtını düşünmeden sesini yükseltmek|Telefonla ilgilenmek|Dikkatle dinleyip sözünü kesmemek|Konuyu hemen değiştirmek",
   2,
   "Etkin dinleme, karşıdakine odaklanmayı ve sözünü tamamlamasına izin vermeyi içerir."
  ],
  [
   "Bir anlaşmazlıkta kendi görüşünü saygılı biçimde anlatmanın iyi yolu hangisidir?",
   "Karşı tarafı küçümsemek|Bağırarak konuşmak|Söylentiyi kanıt gibi göstermek|“Ben böyle düşünüyorum, çünkü…” diyerek gerekçe sunmak",
   3,
   "Ben dili ve gerekçe, görüşü saldırgan olmadan açıklamaya yardım eder."
  ],
  [
   "İletişimde beden dili hangi bilgiyi taşıyabilir?",
   "Duygu ve tutumla ilgili sözsüz ipuçlarını|Yalnızca tarih bilgisini|Konuşulan her sözcüğün sözlük anlamını|Yazım kurallarını",
   0,
   "Yüz ifadesi, duruş ve göz teması sözsüz iletişim öğeleridir."
  ],
  [
   "Arkadaşın bir sorununu anlatıyor. Empatik tepki hangisidir?",
   "Sorunu küçümsemek|Duygusunu anlamaya çalışıp açık uçlu soru sormak|Kendi konuna geçmek|Onun yerine karar vermek",
   1,
   "Empati, karşıdakinin duygusunu anlamaya çalışmayı ve dikkatle yanıt vermeyi gerektirir."
  ],
  [
   "Bir yanlış anlaşılmayı gidermek için ilk olarak ne yapılabilir?",
   "Duyduğunu varsaymak|Konuşmayı kesmek|Başkalarına suç yüklemek|Ne anladığını sakin biçimde tekrar edip doğrulamak",
   3,
   "Anlamı geri yansıtıp doğrulamak, yanlış anlaşılmayı erken fark ettirir."
  ],
  [
   "Bir grup kararında herkesin görüşünü almak neden önemlidir?",
   "Farklı bakışları duymak ve ortak karar geliştirmek için|En hızlı konuşanı seçmek için|Kararı önceden gizlemek için|Sorumluluğu kaldırmak için",
   0,
   "Katılım, ortak anlayışı ve kapsayıcı karar almayı destekler."
  ],
  [
   "Çevrim içi mesajda yanlış anlaşılma riskini azaltan davranış hangisidir?",
   "Bütün noktalama işaretlerini kaldırmak|Açık, nazik ve bağlamı belli ifadeler kullanmak|Büyük harflerle bağırır gibi yazmak|Kaynağı belirsiz mesajı yaymak",
   1,
   "Yazılı iletişimde ses tonu görünmediğinden açık ve saygılı ifade önemlidir."
  ],
  [
   "Birisi konuşurken göz teması ve başıyla onaylama genellikle ne gösterir?",
   "Konuşmayı bitirdiğini|Karşı görüşü kesin reddettiğini|Dinlediğini ve konuşmayı takip ettiğini|Duyduğunu unuttuğunu",
   2,
   "Uygun sözsüz geri bildirim, dinlemeyi sürdürdüğünü gösterebilir."
  ],
  [
   "Görüş ayrılığında ortak çözüm aramanın uygun adımı hangisidir?",
   "İhtiyaçları belirleyip seçenekleri birlikte değerlendirmek|Yalnızca bir tarafın kazanmasını istemek|Sorunu kişiliğe bağlamak|Kanıtları dinlemeyi reddetmek",
   0,
   "İhtiyaçları ve seçenekleri birlikte ele almak uzlaşma olasılığını artırır."
  ],
  [
   "İletişimde “Ben bu sözden üzüldüm” ifadesi hangi yaklaşıma örnektir?",
   "Suçlayıcı sen dili|Duyguyu ben diliyle ifade etme|Etkin dinlemeyi kesme|Konudan kaçınma",
   1,
   "Ben dili, kişinin kendi duygu ve deneyimini suçlamadan anlatır."
  ]
 ],
 "SOS7-2": [
  [
   "Küreselleşmeyi en iyi açıklayan ifade hangisidir?",
   "Bütün ülkelerin aynı yönetim biçimini seçmesi|Ülkeler arasındaki tüm ulaşımın durması|Her toplumun dış dünyadan kopması|Ülkeler ve toplumlar arasındaki ekonomik, kültürel ve iletişim bağlarının artması",
   3,
   "Küreselleşme farklı yerlerdeki toplumlar arasında artan bağlantı ve etkileşimdir."
  ],
  [
   "Bir ürünün parçalarının farklı ülkelerde üretilip başka bir ülkede birleştirilmesi neyi gösterir?",
   "Küresel üretim ağlarını|Yalnızca yerel üretimi|Ülkeler arası iletişimin kesilmesini|Üretimin tamamen el işçiliği olduğunu",
   0,
   "Üretim aşamalarının ülkeler arasında paylaşılması küresel tedarik zincirlerine örnektir."
  ],
  [
   "Küresel iletişimde internetin önemli rolü nedir?",
   "Mesafeleri fiziksel olarak ortadan kaldırmak|Bilgi ve mesajların uzak yerlere hızlı aktarılmasını sağlamak|Bütün haberleri otomatik olarak doğru yapmak|Diller arasındaki farkları yok etmek",
   1,
   "İnternet iletişimi hızlandırır; ancak bilgiyi yine de doğrulamak gerekir."
  ],
  [
   "Küreselleşmenin kültürel etkisine örnek hangisidir?",
   "Dağların yer değiştirmesi|Mevsimlerin ortadan kalkması|Farklı ülkelere ait müzik ve yemeklerin tanınması|Bütün yerel geleneklerin zorunlu olarak silinmesi",
   2,
   "Kültürel ürün ve alışkanlıkların toplumlar arasında yayılması etkileşime örnektir."
  ],
  [
   "Küresel bir salgın neden ülkeler arasında iş birliği gerektirebilir?",
   "Hastalıkların sınırları aşabilmesi ve bilgi paylaşımının önem taşıması|Salgınların yalnızca tek evde görülmesi|Ülkelerin birbirinden tamamen bağımsız olması|İletişim araçlarının etkisiz olması",
   0,
   "Hastalık ve sağlık bilgisi sınır aşabildiği için ortak koordinasyon önemlidir."
  ],
  [
   "Küresel ticaretin olası yararlarından biri hangisidir?",
   "Ulaşım ihtiyacının tümüyle bitmesi|Tüketicilerin farklı ülkelerde üretilen ürünlere erişebilmesi|Her ürünün ücretsiz olması|Ülkelerin tüm üretimi durdurması",
   1,
   "Ticaret farklı ürünlerin pazarlara ulaşmasını sağlayabilir."
  ],
  [
   "Bir haberin küresel ölçekte paylaşılmasında hangi sorumluluk önemlidir?",
   "Başlığı görür görmez paylaşmak|Tarihini silmek|Kaynağı ve doğruluğu kontrol etmek|İddiayı kanıtsız biçimde kesin bilgi saymak",
   2,
   "Bilgiler hızlı yayıldığından kaynak doğrulaması yanlış bilginin yayılmasını azaltır."
  ],
  [
   "Küreselleşmenin çevresel sonuçlarına örnek hangisidir?",
   "Bütün atıkların kendiliğinden yok olması|Enerji kullanımının sıfırlanması|Hava kirliliğinin her durumda azalması|Uzun mesafeli taşımacılığın karbon salımını artırabilmesi",
   3,
   "Uluslararası taşımacılık enerji kullanımı ve sera gazı salımı oluşturabilir."
  ],
  [
   "Farklı kültürlerle etkileşimde saygılı yaklaşım hangisidir?",
   "Bir kültürü diğerlerinden üstün saymak|Farklılıkları öğrenmeye açık olmak ve genellemeden kaçınmak|Tek bir örneği bütün topluma genellemek|Farklı dilleri yasaklamak",
   1,
   "Kültürel etkileşimde açık fikirlilik ve önyargısız yaklaşım önemlidir."
  ],
  [
   "Küresel bir soruna yerel katkı sunmaya hangi örnek uyar?",
   "Sorunun yalnızca başka ülkeleri ilgilendirdiğini düşünmek|Bilgi paylaşımını reddetmek|Atığı azaltıp geri dönüşümü desteklemek|Kaynakları bilinçsizce tüketmek",
   2,
   "Yerel davranışlar da kaynak kullanımı ve atık gibi küresel konulara katkı yapar."
  ]
 ],
 "ING7-1": [
  [
   "Choose the best reply: “What time does your first lesson start?”",
   "It starts at nine o’clock.|I am in the library yesterday.|She likes apples.|There are three pencils.",
   0,
   "The question asks for a time, so “at nine o’clock” answers it."
  ],
  [
   "Complete: “We have science ___ Monday.”",
   "in|on|at|from",
   1,
   "Use “on” with days of the week."
  ],
  [
   "Which sentence describes a school subject you like?",
   "The bus is under the table.|My brother is taller yesterday.|I enjoy history because we learn about the past.|There are a window.",
   2,
   "The sentence names a school subject and gives a relevant reason."
  ],
  [
   "Choose the correct classroom request.",
   "Where does the sun sleep?|I am play football now.|She have two book.|Could I borrow your ruler, please?",
   3,
   "“Could I… please?” is a polite request for a classroom item."
  ],
  [
   "Complete the routine: “I ___ my homework after school.”",
   "does|do|doing|am do",
   1,
   "With “I” in the simple present, use the base form “do.”"
  ],
  [
   "Which is a suitable answer to “How often do you read?”",
   "At the science lab.|It is blue.|Twice a week.|Because it is seven.",
   2,
   "“How often” asks about frequency."
  ],
  [
   "Choose the correct sentence about a timetable.",
   "English are before lunch Tuesday.|English before lunch is Tuesday are.|English have before lunch.|English is before lunch on Tuesday.",
   3,
   "A singular subject takes “is”; the time phrase is clear."
  ],
  [
   "Complete: “My friends ___ basketball during the break.”",
   "play|plays|is play|playing",
   0,
   "Plural subject “my friends” takes the base verb “play.”"
  ],
  [
   "Which phrase gives a reason for liking a lesson?",
   "at half past eight|next to the library|because it is interesting|on the desk",
   2,
   "“Because” introduces a reason."
  ],
  [
   "Choose the best reply: “Can you help me with this project?”",
   "It is behind the door yesterday.|I am twelve o’clock.|No, she are a student.|Sure. Let’s work on it together.",
   3,
   "The question asks for help; the response appropriately offers to work together."
  ]
 ],
 "ING7-2": [
  [
   "Choose the healthy habit.",
   "I never sleep and skip every meal.|I drink water and eat fruit every day.|I eat sweets for breakfast and dinner.|I do not move all week.",
   1,
   "Drinking water and eating fruit are healthy daily habits."
  ],
  [
   "Complete: “You ___ wash your hands before eating.”",
   "shouldn’t|are|should|does",
   2,
   "“Should” gives appropriate health advice."
  ],
  [
   "Which activity helps you stay fit?",
   "Watching television all day.|Skipping sleep every night.|Eating only candy.|Going for a brisk walk.",
   3,
   "A brisk walk is physical activity that supports fitness."
  ],
  [
   "Choose the correct advice for a headache: “You ___ tell an adult and rest.”",
   "should|shouldn’t|is|has",
   0,
   "“Should” expresses sensible advice; a trusted adult can help."
  ],
  [
   "Complete: “She ___ vegetables with lunch.”",
   "eat|eating|eats|are eat",
   2,
   "With “she” in the simple present, the verb takes -s."
  ],
  [
   "Which sentence describes a balanced meal?",
   "It contains only fizzy drinks.|It is made only of sweets.|It has no food or water.|It includes vegetables, grains and a source of protein.",
   3,
   "A balanced meal includes different useful food groups."
  ],
  [
   "Choose the correct frequency phrase: “I exercise ___ a week.”",
   "three times|at the hospital|because tired|is healthy",
   0,
   "“Three times a week” expresses how often an activity happens."
  ],
  [
   "Complete: “If you feel very tired, you ___ go to bed late.”",
   "should|shouldn’t|doesn’t|are",
   1,
   "Avoiding a late bedtime is suitable advice when tired."
  ],
  [
   "Which is a good way to prevent spreading germs?",
   "Share an unwashed cup.|Touch food after coughing.|Ignore handwashing.|Cover your mouth when you cough.",
   3,
   "Covering a cough helps reduce the spread of droplets."
  ],
  [
   "Choose the best reply: “What do you do to keep healthy?”",
   "I sleep well and do exercise regularly.|My classroom is on the second floor.|I have got two notebooks.|It starts at quarter past eight.",
   0,
   "The reply names habits that support health."
  ]
 ]
};

const READY_TOPIC_IDS=Object.keys(READY_BANKS);
// Index order groups each bank as 3 introductory items, 4 consolidation items, then 3 application/reasoning items.
const READY_ORDER={
 'MAT7-1':[0,1,2,3,4,6,8,5,7,9],'MAT7-2':[0,1,2,3,4,5,7,6,8,9],
 'MAT7-3':[3,1,0,2,4,5,6,8,7,9],'MAT7-4':[7,8,1,0,2,5,6,3,4,9],
 'MAT7-5':[0,1,2,6,7,3,8,9,4,5],'MAT7-6':[0,1,4,2,3,5,6,7,8,9],
 'MAT7-7':[6,0,2,4,5,7,8,3,1,9],'MAT7-8':[2,0,4,3,6,7,8,1,5,9],
 'TUR7-1':[0,2,6,4,5,8,3,1,7,9],'TUR7-2':[0,7,5,1,8,9,4,6,2,3],
 'TUR7-3':[0,3,4,5,6,7,9,1,2,8],'FEN7-1':[0,2,3,5,8,4,1,6,7,9],
 'FEN7-2':[0,2,3,5,6,1,7,4,8,9],'FEN7-3':[1,2,7,0,3,4,8,5,6,9],
 'SOS7-1':[0,2,9,4,5,7,8,1,3,6],'SOS7-2':[0,2,3,5,8,1,4,6,7,9],
 'ING7-1':[0,1,2,4,5,6,7,3,8,9],'ING7-2':[0,2,4,5,6,1,3,7,8,9]
};
const READY_SKILLS={
 'MAT7-1':'Tam sayıları sayı doğrusunda konumlandırma; sıralama ve toplama/çıkarma işlemlerinde işaretleri yorumlama.',
 'MAT7-2':'Tam sayı çarpma ve bölme kurallarını, işlem sırasını ve işaret ilişkilerini uygulama.',
 'MAT7-3':'Rasyonel sayıları farklı gösterimlerde karşılaştırma ve küçükten büyüğe sıralama.',
 'MAT7-4':'Rasyonel sayılarla kesir işlemleri; eşdeğer kesir, sadeleştirme ve işlem sonucunu bağlamda yorumlama.',
 'MAT7-5':'Cebirsel ifadelerde benzer terimleri birleştirme, dağılma özelliği ve sözel ifadeyi cebirsel gösterime çevirme.',
 'MAT7-6':'Bir bilinmeyenli denklemi kurma, ters işlemlerle çözme ve yerine koyarak doğrulama.',
 'MAT7-7':'Oran-orantı kurma; birim oran, ölçek, doğru ve ters orantıyı problem durumunda kullanma.',
 'MAT7-8':'Doğru orantı ilişkisini sabit birim oranla modelleme ve günlük yaşam problemlerine uygulama.',
 'TUR7-1':'Metnin ana fikrini belirleme; açık ipuçlarından metne dayalı çıkarım yapma.',
 'TUR7-2':'Bağlam ipuçlarını kullanarak sözcüklerin gerçek/mecaz ve yakın/zıt anlamlarını çözümleme.',
 'TUR7-3':'Amaca uygun paragraf planlama, düşünceyi gerekçelendirme ve yazıyı gözden geçirip düzenleme.',
 'FEN7-1':'Uzay araştırma araçlarının görev ve kullanım amaçlarını; uzay teknolojilerinin yarar ve risklerini açıklama.',
 'FEN7-2':'Günlük yaşam ve teknolojide enerji türleri arasındaki dönüşümleri ve enerjinin korunmasını açıklama.',
 'FEN7-3':'Kinetik ve potansiyel enerji türlerini; hız, kütle, yükseklik ve esneklikle ilişkilerini yorumlama.',
 'SOS7-1':'Etkili iletişimde etkin dinleme, empati, ben dili ve saygılı uzlaşma davranışlarını seçme.',
 'SOS7-2':'Küreselleşmenin ekonomik, kültürel, iletişimsel ve çevresel etkilerini örneklerle değerlendirme.',
 'ING7-1':'School life: ders programı ve rutinleri hakkında soru-cevap, sıklık/zaman ifadeleri ve sınıf içi kibar istekler.',
 'ING7-2':'Staying healthy and fit: sağlıklı alışkanlıkları anlama, sıklık bildirme ve should/shouldn’t ile öneri verme.'
};
function readyBank(kid){return READY_ORDER[kid].map(i=>READY_BANKS[kid][i])}
function readySource(k){const u=k.url||((RESMI[k.course]||{})[k.grade]||{}).url||'https://tymm.meb.gov.tr/ogretim-programlari/temel-egitim';return /^https:\/\//.test(u)?u:'https://tymm.meb.gov.tr/ogretim-programlari/temel-egitim'}
function readyValidateBanks(){
  READY_TOPIC_IDS.forEach(id=>{
    const bank=READY_BANKS[id];
    if(!Array.isArray(bank)||bank.length!==10)throw new Error('Readiness bank must have exactly 10 items: '+id);
    const prompts=new Set();
    bank.forEach((item,i)=>{
      if(!Array.isArray(item)||item.length!==4||typeof item[0]!=='string'||!item[0].trim())throw new Error('Invalid readiness item '+id+'/'+i);
      const options=item[1].split('|');
      if(options.length!==4||new Set(options).size!==4||!Number.isInteger(item[2])||item[2]<0||item[2]>=options.length||!item[3])throw new Error('Invalid readiness choices/key/rationale '+id+'/'+i);
      if(prompts.has(item[0]))throw new Error('Duplicate readiness prompt '+id+'/'+i);
      prompts.add(item[0]);
    });
  });
  READY_TOPIC_IDS.forEach(id=>{if(!KZ.some(k=>k.id===id&&k.grade===7))throw new Error('Readiness topic is not a grade-7 KZ: '+id);if(!READY_ORDER[id]||READY_ORDER[id].length!==10||new Set(READY_ORDER[id]).size!==10||READY_ORDER[id].some(i=>i<0||i>=10)||!READY_SKILLS[id])throw new Error('Invalid readiness order or skill note: '+id)});
}
readyValidateBanks();
function readyVisibleTopics(s){return s&&s.grade===7?KZ.filter(k=>k.grade===7&&visibleCourses(s.section).includes(k.course)&&READY_BANKS[k.id]):[]}
function readyRoot(){if(!DB.readiness||typeof DB.readiness!=='object')DB.readiness={};return DB.readiness}
function readyStudent(sid){const root=readyRoot();if(!root[sid]||typeof root[sid]!=='object')root[sid]={};return root[sid]}
function readyRecord(sid,kid,create=false){const byStudent=create?readyStudent(sid):(DB.readiness&&DB.readiness[sid]);if(!byStudent)return null;if(!byStudent[kid]&&create)byStudent[kid]={answers:{},current:0,selected:null,complete:false};return byStudent[kid]||null}
function readyDate(){return new Date().toISOString().slice(0,10)}
function readyDateLabel(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?esc(fmtDL(value)):'—'}
function readyCorrectCount(kid,r){return readyBank(kid).reduce((n,q,i)=>n+(r&&r.answers&&r.answers[i]===q[2]?1:0),0)}
function readyPanel(s){
  const ks=readyVisibleTopics(s);if(!ks.length)return '';
  const done=ks.filter(k=>{const r=readyRecord(s.id,k.id);return r&&r.complete}).length;
  return `<section class="ocard" style="border-color:#e7d6b8;background:linear-gradient(120deg,#fffaf0,#fff)"><div class="card-hd"><div class="t"><h2 class="o-h">Konu Hazırbulunuşluk Ölçümü</h2><div class="meta">Her konu için bir kez uygulanır · 10 kısa soru · kaldığın yerden devam edebilirsin</div></div><span class="pill p-krem">${done}/${ks.length} tamamlandı</span></div><p class="small muted" style="margin:0 0 12px">Bu başlangıç ölçümüdür; notunu, ustalığını veya oyun puanını etkilemez.</p><div class="col" style="gap:7px">${ks.map(k=>{const r=readyRecord(s.id,k.id);const status=r&&r.complete?`Tamamlandı · ${readyCorrectCount(k.id,r)}/10 · ${readyDateLabel(r.date)}`:r?`Devam ediyor · ${clamp(+r.current||0,0,10)}/10`: 'Henüz başlanmadı';const label=r&&r.complete?'Sonucu gör':r?'Devam et':'Başla';return `<div class="trow" style="padding:8px 0">${cIcon(k.course,18)}<div class="sp" style="min-width:0"><b>${esc(k.topic)}</b><div class="small muted">MEB ${esc(k.code)} · ${esc(k.name)} · <a href="${esc(readySource(k))}" target="_blank" rel="noopener noreferrer">Resmî kaynak</a></div><div class="small muted">Yoklanan beceri: ${esc(READY_SKILLS[k.id])}</div></div><span class="small muted">${esc(status)}</span><button class="btn sm ${r&&r.complete?'sec':'pri'}" data-act="readyOpen" data-v="${esc(k.id)}">${label}</button></div>`}).join('')}</div></section>`
}
(function(){
  const old= PAGES['o-ders'];
  PAGES['o-ders']=(sub,param)=>{const p=old(sub,param);if(p&&p.html)p.html=readyPanel(myStu())+p.html;return p};
})();

PAGES['o-ready']=(kid)=>{
  const s=myStu();const k=KZ.find(x=>x.id===kid&&readyVisibleTopics(s).some(v=>v.id===x.id));
  const crumbs=[['Ana Sayfa','o-home'],['Derslerim','o-ders/tum'],['Hazırbulunuşluk','o-ready']];
  if(!k)return {title:'Konu ölçümü',crumbs,html:`<section class="ocard">${stateBox('err','Konu bulunamadı','Bu konu için ölçüm erişilebilir değil.')}<button class="btn sec" data-go="o-ders/tum">Derslerime dön</button></section>`};
  const bank=readyBank(k.id);let r=readyRecord(s.id,k.id);
  if(r&&r.complete)return readyResultPage(s,k,r,crumbs);
  if(!r){r=readyRecord(s.id,k.id,true);save()}
  const idx=clamp(+r.current||0,0,9);const [prompt,encoded,correct,why]=bank[idx];const options=encoded.split('|');const selected=Number.isInteger(r.selected)?r.selected:null;
  return {title:'Konu Hazırbulunuşluk Ölçümü',crumbs:[...crumbs,[k.topic,'']],html:`<div class="row" style="margin-bottom:14px"><button class="btn sm ghost" data-go="o-ders/tum">${ic('back',14)} Derslerime dön</button><span class="sp"></span><span class="meta">Başlangıç ölçümü · ${esc(k.code)}</span></div><section class="ocard"><div class="card-hd"><div class="t"><h2 class="o-h">${esc(k.topic)}</h2><div class="meta">MEB ${esc(k.code)} · ${esc(k.name)} · <a href="${esc(readySource(k))}" target="_blank" rel="noopener noreferrer">Resmî kaynak</a></div><div class="small muted" style="margin-top:5px">Yoklanan beceri: ${esc(READY_SKILLS[k.id])}</div></div><span class="pill p-krem">Soru ${idx+1} / 10</span></div><div class="pbar" aria-label="İlerleme"><i style="width:${idx*10}%;--c:#810000"></i></div><p class="small muted" style="margin:12px 0">Resmî çıktı odağı: <b>${esc(k.name)}</b></p><h3 class="o-h" style="font-size:20px;line-height:1.45;margin:20px 0 14px">${esc(prompt)}</h3><div class="col" style="gap:9px">${options.map((o,i)=>`<button class="card" style="padding:12px 14px;text-align:left;border:1px solid ${selected===i?'#810000':'var(--line)'};background:${selected===i?'#fff6f2':'#fff'}" data-act="readyChoose" data-v="${i}" aria-pressed="${selected===i}"><b style="display:inline-grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#f5eee4;margin-right:9px">${String.fromCharCode(65+i)}</b>${esc(o)}</button>`).join('')}</div><div class="row" style="margin-top:18px"><span class="small muted sp">Yanıtın bu cihazda kaydedilir; sayfadan ayrılsan da sürdürebilirsin.</span><button class="btn pri" data-act="readyNext" data-v="${k.id}" ${selected===null?'disabled':''}>${idx===9?'Ölçümü tamamla':'Yanıtla ve ilerle'} ${ic('cr',14)}</button></div></section><aside class="ai-box small" style="margin-top:12px">Bu çalışma yalnızca başlangıç düzeyini betimler. Not, kazanım ustalığı, hata kaydı veya XP oluşturmaz.</aside>`};
};
function readyResultPage(s,k,r,crumbs){
  const bank=readyBank(k.id),score=readyCorrectCount(k.id,r),shownDate=readyDateLabel(r.date);
  const rows=bank.map((item,i)=>{const chosen=r.answers&&Number.isInteger(r.answers[i])?r.answers[i]:-1;const opts=item[1].split('|');const ok=chosen===item[2];return `<div class="trow" style="align-items:flex-start"><span class="pill ${ok?'p-soft':'p-gray'}">${ok?'Doğru':'Geliştirilecek'}</span><div class="sp"><b class="small">${i+1}. ${esc(item[0])}</b><div class="small muted" style="margin-top:4px">Senin yanıtın: ${chosen>=0?esc(opts[chosen]):'Yanıt yok'} · Doğru yanıt: ${esc(opts[item[2]])}</div><div class="small" style="margin-top:4px">${esc(item[3])}</div></div></div>`}).join('');
  return {title:'Hazırbulunuşluk sonucu',crumbs:[...crumbs,[k.topic,'']],html:`<div class="row" style="margin-bottom:14px"><button class="btn sm ghost" data-go="o-ders/tum">${ic('back',14)} Derslerime dön</button></div><section class="ocard"><div class="card-hd"><div class="t"><span class="eyebrow">Bir defalık başlangıç ölçümü</span><h2 class="o-h">${esc(k.topic)}</h2><div class="meta">MEB ${esc(k.code)} · ${esc(k.name)} · <a href="${esc(readySource(k))}" target="_blank" rel="noopener noreferrer">Resmî kaynak</a></div><div class="small muted" style="margin-top:5px">Yoklanan beceri: ${esc(READY_SKILLS[k.id])}</div></div><span class="pill p-krem">${score}/10 · ${shownDate}</span></div><div class="ai-box"><b>Başlangıç düzeyi, not veya ustalık puanı değildir.</b> Sonuçlar öğrenme hedefini birlikte planlamak için betimleyici bir başlangıç göstergesidir; not, kazanım ustalığı, XP veya hata kaydı oluşturmaz.</div><h3 class="o-h" style="font-size:17px;margin:18px 0 8px">Soru bazında geri bildirim</h3><div class="col" style="gap:7px">${rows}</div><div class="row" style="margin-top:16px"><span class="sp"><b>Doğru yanıt sayısı: ${score} / 10</b><span class="small muted" style="display:block">Tekrar ölçüm yapılamaz; bu kayıt yalnızca başlangıç içindir.</span></span><button class="btn sec" data-go="o-ders/tum">Konu listesine dön</button></div></section>`}
}
ACT.readyOpen=el=>{const s=myStu(),k=KZ.find(x=>x.id===el.dataset.v);if(!k||!readyVisibleTopics(s).some(x=>x.id===k.id))return;go('o-ready/'+k.id)};
ACT.readyChoose=el=>{
  const s=myStu(),kid=UI.sub,k=KZ.find(x=>x.id===kid);if(!k||!READY_BANKS[kid])return;
  const r=readyRecord(s.id,kid);if(!r||r.complete)return;
  const idx=clamp(+r.current||0,0,9),choice=+el.dataset.v;if(!Number.isInteger(choice)||choice<0||choice>3)return;
  r.selected=choice;save();render();
};
ACT.readyNext=el=>{
  const s=myStu(),kid=el.dataset.v,k=KZ.find(x=>x.id===kid);if(!k||UI.sub!==kid||!readyVisibleTopics(s).some(x=>x.id===kid))return;
  const r=readyRecord(s.id,kid);if(!r||r.complete)return;
  const idx=clamp(+r.current||0,0,9);if(!Number.isInteger(r.selected)||r.selected<0||r.selected>3)return;
  r.answers=r.answers||{};
  if(Object.prototype.hasOwnProperty.call(r.answers,idx))return;
  r.answers[idx]=r.selected;r.selected=null;r.current=idx+1;
  if(r.current===10){r.score=readyBank(kid).reduce((n,q,i)=>n+(r.answers[i]===q[2]?1:0),0);r.date=readyDate();r.complete=true}
  save();render();
};

(function(){
  const old=PAGES.student;
  PAGES.student=(sub,sid)=>{
    const p=old(sub,sid);if(sub!=='profile'||!p||!p.html)return p;
    const records=Object.entries((DB.readiness&&DB.readiness[sid])||{}).filter(([kid,r])=>r&&r.complete&&READY_BANKS[kid]&&KZ.some(k=>k.id===kid));
    if(!records.length)return p;
    records.sort((a,b)=>String(b[1].date||'').localeCompare(String(a[1].date||'')));
    const rows=records.map(([kid,r])=>{const k=kzOf(kid);const n=readyCorrectCount(kid,r);return `<tr><td><b>${esc(k.topic)}</b><div class="meta">MEB ${esc(k.code)} · ${esc(k.name)} · <a href="${esc(readySource(k))}" target="_blank" rel="noopener noreferrer">Resmî kaynak</a></div><div class="small muted">Yoklanan beceri: ${esc(READY_SKILLS[kid])}</div></td><td>${readyDateLabel(r.date)}</td><td><b>${n}/10</b></td><td>${n} doğru</td></tr>`}).join('');
    p.html=`<section class="card panel" style="margin-bottom:14px"><div class="card-hd"><div class="t"><h2 class="st">Konu hazırbulunuşluk · başlangıç ölçümü</h2><div class="meta">Bir defalık, konu bazında kısa değerlendirme · ${records.length} tamamlandı</div></div></div><div class="ai-box small" style="margin-bottom:12px">Bunlar yalnızca başlangıç düzeyini gösteren betimleyici sonuçlardır; not, kazanım ustalığı veya öğretim kararı değildir ve mevcut mastery/XP ölçümlerinden ayrıdır.</div><div class="tw"><table class="t"><thead><tr><th>Konu / resmî çıktı</th><th>Tarih</th><th>Sonuç</th><th>Doğru yanıt sayısı</th></tr></thead><tbody>${rows}</tbody></table></div></section>`+p.html;
    return p;
  };
})();
