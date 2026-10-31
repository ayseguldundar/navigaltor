# NavigAItor — erişim matrisi

Bu belge migration ve Edge Function kaynak kodundaki amaçlanan erişimi özetler; çalışan bir Supabase ortamından alınmış sonuç değildir. `20261031000009_profile_isolation.sql` bu dalda öğretmen erişimini daraltır, fakat henüz hiçbir veritabanına uygulanmadı. Pilot öncesi staging'de pozitif ve negatif testler zorunludur.

## Roller

- **Yönetici:** Kendi okulunda okul yönetimi.
- **Öğretmen:** Kendi profili ve yetkili/atanmış şubelerdeki işler.
- **Öğrenci:** Kendi hesabı ve bağlı olduğu şubenin atanmış etkinlikleri.
- **Veli:** Yalnızca tek kullanımlık davetle hesabına bağlanan çocuk(lar).
- **Anonim:** Doğrudan tablo okuması yok; öğrenci giriş/kayıt Edge Function'ları gibi özellikle açık uçlar dışında.
- **service_role:** Yalnızca Edge Function'ların kullandığı, istemciye verilmeyen sunucu yetkisi.

## Tablo okuma ve yazma

İstemci rollerine doğrudan `INSERT`/`UPDATE`/`DELETE` verilmez; yazmalar yetki denetimli RPC veya Edge Function üzerinden yapılır. Tablolarda RLS vardır. Aşağıdaki durumlar kaynak politikalarının hedefidir.

| Tablo | Okuma yetkisi | Yazma yolu / sınır |
|---|---|---|
| `schools` | Okul profili olan kullanıcı yalnızca kendi okulunu görür. | Okul, yönetici kayıt akışında sunucu tarafından oluşturulur. |
| `profiles` | Kullanıcı kendi profilini; yönetici kendi okulunun profillerini görür. Migration `0009` uygulanana kadar eski politika öğretmenlere aynı okuldaki tüm profilleri açar. | Kayıt, rol değişimi ve hesap yönetimi sunucu/RPC yolundan. |
| `sections` | Yönetici/öğretmen erişebildiği şubeleri; öğrenci kendi; veli bağlı çocuğunun şubesini görür. | `create_section`; kaynak kodda yönetici **ve öğretmen** şube açabilir (ürün kararı aşağıda). |
| `teacher_sections` | `0009` sonrasında öğretmen kendi atamalarını, yönetici okulunun tüm atamalarını görür. Önceki politika tüm okul personeline tüm atamaları açıyordu. | `add_teacher_to_section` ve `remove_teacher_from_section`; yönetici yetkisi. |
| `students` | Yönetici/öğretmen yetkili şubedeki öğrencileri; öğrenci kendini; veli bağlı çocuğunu görür. | Öğrenci ekleme/düzenleme/taşıma ve silme sunucu/RPC yolundan; bölüm yetkisi kontrol edilir. |
| `student_secrets` | İstemci rolleri göremez; RLS açık ve politika yok. | PIN hash'i ve kilit durumu yalnızca sunucu RPC'leri. |
| `guardians` | Veli kendi çocuk bağlantılarını; öğretmen yetkili şubesindeki bağlantıları görür. | Veli daveti bağlama RPC'si; davet öğrenci ve okul sunucuda doğrulanır. |
| `consents` | Veli kendi onaylarını; öğretmen erişebildiği şubedeki onayları görür. | Veli kayıt/bağlantı RPC'si. |
| `invites` | Yönetici kendi okulundaki davetleri; öğretmen yalnızca yetkili şubesindeki veli davetlerini görür (`0006`). | Yönetici öğretmen daveti; yetkili öğretmen/yönetici veli daveti. Öğretmen kodu tek kullanımlı, 7 günlük; yeni kod eski kullanılmamış öğretmen kodunu geçersiz kılar. Veli kodu tek kullanımlı ve varsayılan 30 günlük. |
| `login_attempts` | İstemci rolleri göremez; RLS açık ve politika yok. | Servis RPC'si atomik hız sınırı sayımı yapar; eski sayımlar 1 günden sonra temizlenir. |
| `ai_generations` | Öğretmen kendi üretim kayıtlarını; yönetici kendi okulundakileri görür. | Edge Function önce atomik kota rezervasyonu yapar; istemci tablosuna yazamaz. Kayıt istem özeti/token metaverisi tutar, ham istemi/yanıtı saklamaz. |
| `teacher_activities` | Aynı okuldaki personel kendi okulunun etkinlik taslaklarını görür. | `save_teacher_activity` ve `delete_teacher_activity`; personel ve okul kapsamı kontrol edilir. |
| `assignments` | Yetkili şube öğretmeni/yöneticisi, ilgili öğrenci ve bağlı veli görür. | `create_assignment` ve `archive_assignment`; şube yetkisi kontrol edilir. |
| `submissions` | İlgili öğretmen, öğrenci kendisi, veli bağlı çocuğu görür. | Öğrenci kendi teslimini; öğretmen yalnızca yetkili öğrencinin geri bildirimini yazar. |
| `intake_responses` | İlgili öğretmen, öğrenci kendisi, veli bağlı çocuğu görür. | Öğrenci kendi yanıtlarını `save_intake` ile yazar. |
| `admin_log` | Yalnızca kendi okulunun yöneticisi görür. | Hassas içerik yerine işlem türü/zaman/aktör tutulur; sunucu tarafı işlem kayıtları yazar. |

## RPC ve Edge Function yetkileri

| İşlem grubu | Sunucu kontrolü |
|---|---|
| `my_context` | Oturumdaki kullanıcının kendi profil/okulunu; yönetici veya öğretmenin erişebildiği şube listesini döndürür. |
| `create_section` | `app.is_staff()` kontrolü var; öğretmenler de şube açabiliyor. Pilot rol beklentisi için karar gerekir. |
| `add_teacher_to_section`, `set_staff_role`, `create_teacher_invite`, `remove_teacher_from_section` | Okul yöneticisi ve kendi okuluyla sınırlı. |
| `import_students`, `update_student`, `move_student`, `reset_student_pin`, `reset_section_pins`, `create_parent_invite` | Yönetici veya ilgili şube öğretmeni; hedef şube/öğrenci sunucuda doğrulanır. |
| `save_teacher_activity`, `delete_teacher_activity`, `create_assignment`, `archive_assignment`, `set_teacher_feedback` | Öğretmen/yönetici rolü ve kendi okul/şube yetkisi denetlenir. |
| `save_submission`, `save_intake` | Öğrenci kimliği oturumdan çözülür; yalnızca kendi atama/cevapları yazılabilir. |
| `srv_register_staff`, `srv_register_parent`, `srv_link_parent`, `srv_link_student_auth`, `srv_class_roster`, `srv_verify_student_pin` | `service_role` içindir; Edge Function'lardan çağrılır. Davetler tek kullanımlı ve PIN doğrulaması/kilidi sunucudadır. |
| `srv_rate_limit`, `srv_ai_reserve` | Yalnızca `service_role`; rate limit ve AI rezervasyon/kota kontrolleri atomiktir. Hata halinde çağrı güvenli biçimde reddedilir. |
| `srv_student_deletion_plan`, `srv_can_reset_password`, `srv_log_password_reset`, `srv_can_remove_staff`, `srv_parent_self`, `srv_revoke_sessions` | Yalnızca `service_role`; Edge Function yönetici/aktör/okul yetkisini önceden doğrular. |
| `kayit-ogretmen`, `kayit-veli` | Kayıt, davet ve hız sınırı işlemleri sunucu tarafında; **mevcut kod Auth kullanıcısını `email_confirm: true` ile oluşturuyor**, yani gerçek adres doğrulaması yok. |
| `ogrenci-sinif`, `ogrenci-giris` | Sınıf kodu + isim listesi ve PIN akışı; PIN deneme/kilidi ve rate-limit sunucu tarafında. İsim listesi endpoint'i sınıf kodunu bilenlere açıktır ve etiketle birlikte öğrenci UUID'sini döndürür. |
| `sifre-sifirla`, `veri-sil` | Oturumdaki yönetici ve aynı okul/kişi için sunucu tarafı kontrol; oturum iptali ve işlem kaydı. |
| `yz-etkinlik` | Oturum ve öğretmen/yönetici rolü kontrol edilir; istek/gövde/prompt uzunluğu, alanlar, izinli görsel türleri/JSON şeması doğrulanır; AI anahtarı yalnızca Edge Function ortamında okunur. Kota RPC'si hata verirse üretim başlamaz. |

## Pilot için açık teknik kapılar

1. **E-posta doğrulaması:** `kayit-ogretmen` ve `kayit-veli` adresi doğrulanmadan kullanıcıyı doğrulanmış kabul ediyor. SMTP/Auth e-posta doğrulaması ile kayıt akışı staging'de kurulup test edilene kadar gerçek öğretmen/veli hesabı açılmamalı; otomatik doğrulama güvenli çözüm sayılmaz.
2. **Profil ve atama RLS'i:** `0009_profile_isolation.sql` eski geniş `profiles` ve `teacher_sections` politikalarını daraltıyor. Staging'de öğretmen, diğer okul profillerini/atamalarını doğrudan sorguladığında 0 satır veya yetki reddi doğrulanmalı; yönetici paneli ve kendi profili akışı da pozitif test edilmeli.
3. **Rate-limit kaynağı:** Edge Function'lar `x-forwarded-for` başlığını kullanıyor. Bu başlığın Supabase gateway tarafından güvenilir biçimde üretildiği ve istemci tarafından taklit edilemediği staging/edge yapılandırmasında doğrulanmadı. SQL sayımı atomik olsa da kaynak adresi güvenilirliği doğrulanana kadar brute-force koruması tamamlanmış sayılmaz.
4. **Roster veri minimizasyonu:** İsim listesi yalnızca sınıf kodunu bilenlere açılır, fakat istemciye öğrenci UUID'si de gider. UUID'yi gizleyen kısa süreli sunucu bileti ya da eşdeğer tasarım staging'de uygulanıp denenmeden bu durum çözüldü sayılmaz.
5. **AI serbest metni:** Basit regex e-posta/telefon/TC kimlik ve kimlik numarası etiketlerini reddeder; ad-soyad, adres veya dolaylı tanımlayıcıları kusursuz tespit etmez. Ham istem/yanıt DB'ye kaydedilmez, ancak kullanıcı girdiği serbest metin sağlayıcıya gönderilir; teknik güvence tüm kişisel veriyi yakalamaz.
6. **Çevrimdışı kullanım:** Service worker yalnızca uygulama kabuğu/HTML/statik dosyaları önbelleğe alır; Supabase verisi ve yazma işlemleri çevrimdışı kuyruk değildir. Formlar çevrimiçi kullanılmalı; kaydetme hatasında mevcut ekrandaki giriş korunup tekrar denenmelidir. Kapanma/sekme değişimi sonrası taslak senkronizasyonu veya çatışma çözümü garanti edilmez.

## Ürün kararı

- Şube oluşturma `create_section` ile öğretmenlere de açık kalsın mı, yoksa yalnızca okul yöneticisi mi oluşturmalı?
