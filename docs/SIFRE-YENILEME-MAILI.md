# Şifre yenileme maili yapılandırması

## Uygulama davranışı

Giriş sayfası recovery isteğini canonical yayın adresine gönderir:

```text
https://navigaltor.vercel.app/sifre-yenileme
```

Böylece istek localhost üzerinden başlatılsa bile maildeki bağlantı localhost’a dönmez. Production’da custom domain Vercel’e bağlandığında `public/config.js` içindeki `appUrl` değeri yeni domain ile değiştirilmelidir.

## Supabase Auth → SMTP

Supabase Dashboard → Authentication → SMTP Settings bölümünde Resend bilgilerini kullanın:

- Host: `smtp.resend.com`
- Port: `465` veya `587`
- Username: `resend`
- Password: Resend API key
- Sender email: `info@navigaitor.net`
- Sender name: `NavigAItor`

Resend hesabında `navigaitor.net` gönderim domain’inin doğrulanmış olması gerekir. Resend connector’ı etkin durumdadır; ancak Supabase Auth’un mail gönderebilmesi için bu SMTP bilgilerinin Supabase projesindeki Auth ayarlarına girilmesi gerekir.

## Supabase Auth → Email Templates → Reset Password

Subject:

```text
Şifre Yenileme
```

HTML:

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#2b2118;line-height:1.6">
  <h2 style="color:#810000">Şifrenizi yenileyin</h2>
  <p>Merhaba,</p>
  <p>NavigAItor hesabınız için bir şifre yenileme isteği aldık.</p>
  <p>Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
  <p style="margin:28px 0">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#810000;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700">Şifremi yenile</a>
  </p>
  <p>Bu isteği siz yapmadıysanız bu e-postayı dikkate almayın. Şifreniz değiştirilmeyecektir.</p>
  <p>Bağlantı güvenlik nedeniyle sınırlı süre geçerlidir ve yalnızca bir kez kullanılabilir.</p>
  <p>Sevgiler,<br><strong>NavigAItor</strong></p>
</div>
```

Plain text:

```text
Merhaba,

NavigAItor hesabınız için bir şifre yenileme isteği aldık.

Yeni şifrenizi belirlemek için bu bağlantıyı açın:
{{ .ConfirmationURL }}

Bu isteği siz yapmadıysanız bu e-postayı dikkate almayın. Şifreniz değiştirilmeyecektir.

Bağlantı güvenlik nedeniyle sınırlı süre geçerlidir ve yalnızca bir kez kullanılabilir.

Sevgiler,
NavigAItor
```

## URL allow-list

Aşağıdaki adres Supabase Auth → URL Configuration → Redirect URLs listesinde bulunmalıdır:

```text
https://navigaltor.vercel.app/sifre-yenileme
```

## Kontrol listesi

1. Resend domain doğrulaması tamamlandı.
2. Supabase SMTP sender adresi `info@navigaitor.net` oldu.
3. Reset Password subject alanı `Şifre Yenileme` oldu.
4. HTML ve plain-text metinlerin tamamı Türkçe oldu.
5. Site URL veya recovery bağlantısında `localhost` kalmadı.
6. Test hesabıyla recovery maili istendi ve bağlantı `/sifre-yenileme` sayfasını açtı.
7. Yeni şifre kaydedildi ve yeni şifreyle giriş yapıldı.
