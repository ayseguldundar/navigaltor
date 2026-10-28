// Testler için Supabase taklidi: Playwright isteklerini yakalayıp Auth, REST (tablolar + RPC) ve Edge Function yanıtları üretir.
// Amaç arayüz akışlarını gerçek supabase-js kütüphanesiyle, ağ olmadan sınamak. Sunucu mantığı ayrıca canlı projede sınanır.
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (u) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: u.id, email: u.email, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
let seq = 0;
const id = (p) => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}${p ? '' : ''}`;
const code = (n) => Array.from({ length: n }, (_, i) => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[(seq * 7 + i * 13) % 31]).join('');

export function createMock() {
  const db = { users: [], profiles: [], schools: [], sections: [], ts: [], students: [], secrets: {}, guardians: [], invites: [], gens: [] };
  const calls = [];
  const userByToken = (h) => { const t = (h || '').replace(/^Bearer\s+/i, ''); return db.users.find((u) => u.token === t); };
  const profileOf = (u) => u && db.profiles.find((p) => p.id === u.id);
  const session = (u) => {
    u.token = jwt(u);
    return { access_token: u.token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'r-' + u.id, user: { id: u.id, email: u.email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } };
  };
  const addUser = (email, password) => { const u = { id: id(), email, password }; db.users.push(u); return u; };
  const sectionView = (me) => db.sections.filter((s) => s.school_id === me.school_id && (me.role === 'admin' || db.ts.some((t) => t.section_id === s.id && t.teacher_id === me.id)));

  const rpc = {
    my_context: (me) => ({ profile: me, school: db.schools.find((s) => s.id === me.school_id),
      sections: sectionView(me).map((s) => ({ ...s, courses: db.ts.filter((t) => t.section_id === s.id && t.teacher_id === me.id).map((t) => ({ course: t.course, is_guidance: t.is_guidance })),
        student_count: db.students.filter((x) => x.section_id === s.id && x.active).length })) }),
    create_section: (me, a) => {
      if (db.sections.some((s) => s.school_id === me.school_id && s.name === a.p_name.toUpperCase())) throw new Error('duplicate key value violates unique constraint');
      const s = { id: id(), school_id: me.school_id, grade: a.p_grade, name: a.p_name.toUpperCase(), class_code: code(6) };
      db.sections.push(s); db.ts.push({ teacher_id: me.id, section_id: s.id, course: a.p_course, is_guidance: a.p_guidance }); return s;
    },
    import_students: (me, a) => a.p_rows.map((r, i) => {
      const s = { id: id(), school_id: me.school_id, section_id: a.p_section, first_name: r.first_name, last_name: r.last_name, student_no: r.student_no || null, active: true, auth_user_id: null };
      db.students.push(s); const pin = String(1000 + seq + i).slice(-4); db.secrets[s.id] = pin; return { ...s, pin };
    }),
    reset_student_pin: (me, a) => { const pin = '4321'; db.secrets[a.p_student] = pin; return pin; },
    update_student: (me, a) => { const s = db.students.find((x) => x.id === a.p_student); s.active = a.p_active; return null; },
    create_parent_invite: (me, a) => { const c = code(8); db.invites.push({ code: c, kind: 'parent', student_id: a.p_student, school_id: me.school_id, used_at: null, expires_at: new Date(Date.now() + 864e5 * 30).toISOString(), created_at: new Date().toISOString() }); return c; },
    create_teacher_invite: (me) => { if (me.role !== 'admin') throw new Error('Yalnızca okul yöneticisi'); const c = code(8); db.invites.push({ code: c, kind: 'teacher', school_id: me.school_id, used_at: null, expires_at: new Date(Date.now() + 864e5 * 30).toISOString(), created_at: new Date().toISOString() }); return c; },
    add_teacher_to_section: (me, a) => { db.ts.push({ teacher_id: a.p_teacher, section_id: a.p_section, course: a.p_course, is_guidance: a.p_guidance }); return null; },
  };

  const fns = {
    'kayit-ogretmen': (b) => {
      if (db.users.some((u) => u.email === b.email)) return [409, { error: 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.' }];
      const u = addUser(b.email, b.password);
      let school, role;
      if (b.inviteCode) { const inv = db.invites.find((i) => i.code === b.inviteCode && i.kind === 'teacher'); if (!inv) return [400, { error: 'Davet kodu geçersiz veya süresi dolmuş' }]; school = inv.school_id; role = 'teacher'; }
      else { school = id(); db.schools.push({ id: school, name: b.schoolName }); role = 'admin'; }
      db.profiles.push({ id: u.id, school_id: school, role, full_name: b.fullName }); return [200, { ok: true, role }];
    },
    'kayit-veli': (b) => {
      if (b.consent !== true) return [400, { error: 'Devam etmek için açık rıza metnini onaylamanız gerekiyor.' }];
      const inv = db.invites.find((i) => i.code === b.inviteCode && i.kind === 'parent' && !i.used_at);
      if (!inv) return [400, { error: 'Davet kodu geçersiz, kullanılmış veya süresi dolmuş' }];
      const u = addUser(b.email, b.password);
      db.profiles.push({ id: u.id, school_id: inv.school_id, role: 'parent', full_name: b.fullName });
      db.guardians.push({ parent_id: u.id, student_id: inv.student_id }); inv.used_at = new Date().toISOString(); return [200, { ok: true }];
    },
    'ogrenci-sinif': (b) => {
      const s = db.sections.find((x) => x.class_code === b.classCode);
      if (!s) return [404, { error: 'Bu sınıf kodu bulunamadı. Öğretmenine sor.' }];
      return [200, { section: { grade: s.grade, name: s.name, school: db.schools.find((x) => x.id === s.school_id).name },
        students: db.students.filter((x) => x.section_id === s.id && x.active).map((x) => ({ id: x.id, label: `${x.first_name} ${x.last_name[0]}.` })) }];
    },
    'ogrenci-giris': (b) => {
      const st = db.students.find((x) => x.id === b.studentId);
      if (!st || db.secrets[st.id] !== b.pin) return [401, { error: 'Şifre yanlış. Tekrar dene.' }];
      let u = db.users.find((x) => x.id === st.auth_user_id);
      if (!u) { u = addUser(`ogrenci-${st.id}@ogrenci.navigaitor.app`, null); st.auth_user_id = u.id; db.profiles.push({ id: u.id, school_id: st.school_id, role: 'student', full_name: `${st.first_name} ${st.last_name}` }); }
      const s = session(u); return [200, { access_token: s.access_token, refresh_token: s.refresh_token, full_name: `${st.first_name} ${st.last_name}` }];
    },
    'yz-etkinlik': (b, me) => {
      if (!me || !['admin', 'teacher'].includes(me.role)) return [401, { error: 'Oturum bulunamadı. Yeniden giriş yapın.' }];
      db.gens.push({ id: id(), created_at: new Date().toISOString(), status: 'ok', model: 'claude-sonnet-5-5', input_tokens: 2100, output_tokens: 3200, request: b, response: { title: 'Okul Bahçesinde Kesir Avı' } });
      return [200, { quota: { used: db.gens.length, limit: 40, ok: true }, activity: {
        id: 'ai-test', title: 'Okul Bahçesinde Kesir Avı', subtitle: 'Kesirleri gerçek ölçümlerle karşılaştırma', scenario: 'Okul bahçesine yeni çiçek tarhları yapılacak. Hangi tarh daha büyük?',
        kazanim: [b.outcome], skills21: ['Problem Çözme', 'İş Birliği'], digital: ['Dijital Sayı Doğrusu'], tools: ['Şerit metre'],
        visual: { type: 'pizza', params: { pizzas: 2, target: ['1/2', '1/4'], maxCut: 8 }, caption: 'İki tarhı dilimleyerek karşılaştır.' },
        steps: [{ title: 'Ölç', mode: 'Grup · 15 dk', items: ['Tarhları ölç', 'Kesir olarak yaz'], warn: 'Payı büyük olan her zaman büyük değildir.' },
          { title: 'Karşılaştır', mode: 'Bireysel · 15 dk', items: ['Ortak payda bul', 'Sırala'] }, { title: 'Sun', mode: 'Grup · 10 dk', items: ['Sonucu anlat', 'Gerekçelendir'] }],
        checklist: ['Ölçtüm', 'Yazdım', 'Karşılaştırdım', 'Sundum'], navi: ['Hangisi daha büyük, nasıl anladın?', 'Payda neyi anlatır?'],
        rubric: [1, 2, 3, 4].map((i) => ({ k: 'Ölçüt ' + i, d: 'Açıklama', l4: 'Mükemmel', l3: 'Yeterli', l2: 'Gelişiyor', l1: 'Başlangıç' })),
        diff: { destek: 'Kesir şeritleri kullan.', ileri: 'Üç tarhı karşılaştır.' }, misconception: 'Büyük payda büyük kesir yanılgısı.', aiLevel: b.level, course: b.course, grade: b.grade } }];
    },
  };

  // PostgREST sorgu süzgeçlerinin basit taklidi (eq, in, is, gt)
  const filterRows = (rows, params) => rows.filter((r) => [...params].every(([k, v]) => {
    if (['select', 'order', 'limit', 'offset'].includes(k)) return true;
    const [op, ...rest] = v.split('.'); const val = rest.join('.');
    if (op === 'eq') return String(r[k]) === val;
    if (op === 'in') return val.replace(/[()]/g, '').split(',').includes(String(r[k]));
    if (op === 'is') return val === 'null' ? r[k] == null : true;
    if (op === 'gt') return String(r[k]) > val;
    return true;
  }));
  const visible = (table, me) => {
    if (!me) return [];
    if (table === 'profiles') return db.profiles.filter((p) => p.id === me.id || (['admin', 'teacher'].includes(me.role) && p.school_id === me.school_id));
    if (table === 'students') return db.students.filter((s) => (['admin', 'teacher'].includes(me.role) && sectionView(me).some((x) => x.id === s.section_id)) || s.auth_user_id === me.id || db.guardians.some((g) => g.parent_id === me.id && g.student_id === s.id));
    if (table === 'guardians') return db.guardians;
    if (table === 'invites') return db.invites.filter((i) => i.school_id === me.school_id);
    if (table === 'ai_generations') return db.gens;
    return [];
  };

  async function handle(route) {
    const req = route.request();
    const url = new URL(req.url());
    const p = url.pathname;
    const hdr = req.headers();
    const body = () => { try { return JSON.parse(req.postData() || '{}'); } catch { return {}; } };
    const send = (status, json) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: json === undefined ? '' : JSON.stringify(json) });
    calls.push(`${req.method()} ${p}`);
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });

    if (p === '/auth/v1/token') {
      const b = body();
      if (url.searchParams.get('grant_type') === 'password') {
        const u = db.users.find((x) => x.email === b.email && x.password === b.password);
        return u ? send(200, session(u)) : send(400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      }
      const u = db.users.find((x) => 'r-' + x.id === b.refresh_token);
      return u ? send(200, session(u)) : send(400, { msg: 'Invalid Refresh Token' });
    }
    if (p === '/auth/v1/user') { const u = userByToken(hdr.authorization); return u ? send(200, session(u).user) : send(401, { msg: 'invalid JWT' }); }
    if (p === '/auth/v1/logout') return send(204);

    const me = profileOf(userByToken(hdr.authorization));
    if (p.startsWith('/rest/v1/rpc/')) {
      const fn = p.split('/').pop();
      if (!me) return send(401, { message: 'JWT gerekli' });
      try { return send(200, rpc[fn](me, body())); } catch (e) { return send(400, { message: e.message }); }
    }
    if (p.startsWith('/rest/v1/')) {
      const rows = filterRows(visible(p.split('/').pop(), me), url.searchParams);
      if ((hdr.accept || '').includes('vnd.pgrst.object')) return rows.length === 1 ? send(200, rows[0]) : send(406, { message: 'not single' });
      return send(200, rows);
    }
    if (p.startsWith('/functions/v1/')) {
      const fn = fns[p.split('/').pop()];
      const [status, json] = fn(body(), me);
      return send(status, json);
    }
    return send(404, { message: 'taklitte yok: ' + p });
  }

  return { db, calls, handle, addUser, session };
}
