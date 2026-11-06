# Demo özellikleri — kalıcı veri katmanı

Pilot Supabase projesine `20261031000009_demo_ozellikleri.sql` migration’ı uygulandı. Bu migration mevcut hesap, atama, teslim ve tanışma formu akışlarını değiştirmez; demo panelinde localStorage ile tutulan gelişim verileri için RLS korumalı tablolar ekler.

## Eklenen kayıt türleri

- `student_measurements`: kazanım/beceri puanları ve kontrol ölçümleri
- `student_observations`: öğretmen gözlemleri
- `student_goals`: öğrenci hedefleri, başarı ölçütleri ve yöntemleri
- `teacher_meetings`: öğrenci/veli görüşme planları
- `teacher_messages`: öğrenci bağlamlı öğretmen-veli/öğrenci mesajları
- `student_support_plans`: veliye açılabilen Evde Destek planları
- `teacher_content`: kazanım bazlı öğretmen içerikleri ve sürümleri için temel kayıt
- `teacher_notifications`: kullanıcıya özel bildirimler

## Güvenlik

Tüm tablolar RLS ile korunur. Doğrudan yazma yetkisi `anon` ve `authenticated` rollerinden kaldırılmıştır. Öğretmen yazma işlemleri aşağıdaki security-definer RPC’leriyle yapılmalıdır:

- `save_student_measurement`
- `save_student_observation`
- `save_student_goal`
- `save_teacher_meeting`
- `save_support_plan`
- `save_teacher_content`

RPC’ler öğretmenin ilgili öğrenci/okul kapsamını kontrol eder; öğrenci ve veli tarafı yalnızca kendilerine açılan kayıtları okuyabilir.

## Uygulama notu

Mevcut pilotun atama, teslim, geri bildirim ve tanışma formu akışları zaten bu migration’dan bağımsız olarak gerçek Supabase tablolarına yazmaktadır. Yeni UI ekranları bu RPC’lere bağlanırken `public/app/supa.js` içindeki `rpc()` yardımcısı kullanılmalıdır. Migration canlı pilot Supabase’ine uygulanmış, üretim Vercel deploy’u yapılmamıştır.
