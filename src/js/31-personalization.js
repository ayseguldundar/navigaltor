/* ================= ÖĞRENCİ: ankete dayalı hafif kişiselleştirme =================
 * Yüklendiğinde mevcut ders içeriği ve sayfa üreticilerini sarar; başka modüle
 * ya da öğrenme durumuna dokunmaz. Derleme listesine ekleme bu dosyanın kapsamı dışıdır.
 */
(function (root) {
  'use strict';

  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
  const cleanText = value => typeof value === 'string' ? value.trim().slice(0, 120) : '';
  const appDB = () => {
    try { if (typeof DB !== 'undefined') return DB; } catch (_) { /* optional fallback */ }
    return root.DB;
  };

  // OB_Q yanıtları: DB.st.intro.a[0-based position] = {v, other}; v dizi veya tek değer olabilir.
  function answerAt(position) {
    try {
      const db = appDB();
      const answers = db && db.st && db.st.intro && db.st.intro.a;
      const answer = answers && answers[position];
      if (answer == null) return { values: [], other: '' };
      const raw = answer && typeof answer === 'object' && !Array.isArray(answer) && 'v' in answer
        ? answer.v : answer;
      const items = Array.isArray(raw) ? raw : [raw];
      const values = [];
      items.forEach(item => {
        const text = cleanText(item);
        if (text && !values.includes(text)) values.push(text);
      });
      return {
        values: values.slice(0, 8),
        other: cleanText(answer && typeof answer === 'object' && !Array.isArray(answer) ? answer.other : '').slice(0, 48)
      };
    } catch (_) {
      return { values: [], other: '' };
    }
  }

  function surveyData() {
    const goal = answerAt(4);
    const hobbies = answerAt(6);
    const mode = answerAt(14);
    const difficulty = answerAt(16);
    const reaction = answerAt(17);
    // Kamuya açık yardımcıdan dönen survey metinlerinin tamamı HTML-escape edilmiştir.
    return {
      goal: goal.values.map(escapeHTML),
      goalOther: escapeHTML(goal.other),
      hobbies: hobbies.values.map(escapeHTML),
      hobbyOther: escapeHTML(hobbies.other),
      preferredMode: mode.values.length ? escapeHTML(mode.values[0]) : '',
      difficulties: difficulty.values.map(escapeHTML),
      mistakeReaction: reaction.values.length ? escapeHTML(reaction.values[0]) : ''
    };
  }

  function internalAnswers() {
    return {
      goal: answerAt(4), hobbies: answerAt(6), mode: answerAt(14),
      difficulty: answerAt(16), reaction: answerAt(17)
    };
  }

  const contains = (values, value) => values.indexOf(value) !== -1;
  const interestHas = (interests, fixed, pattern) =>
    contains(interests.values, fixed) || (interests.other && pattern.test(interests.other));

  function contextExamples(k, tab) {
    if (!k || !['aciklama', 'video', 'ornek'].includes(tab)) return [];
    const a = internalAnswers();
    const course = String(k.course || '');
    const topicText = [k.name, k.topic, k.skill, k.unit, k.id].filter(Boolean).join(' ').toLocaleLowerCase('tr');
    const notes = [];
    const sports = interestHas(a.hobbies, 'Spor ve hareket', /spor|futbol|bisiklet|koşu|yüzme|hareket/i);
    const drawing = interestHas(a.hobbies, 'Resim, tasarım veya el işleri', /resim|çizim|tasarım|el işi|poster|görsel/i);
    const nature = interestHas(a.hobbies, 'Hayvanlar ve doğa', /doğa|hayvan|bitki|bahçe|gözlem|çevre/i);
    const games = interestHas(a.hobbies, 'Oyunlar ve bulmacalar', /oyun|bulmaca|satranç|puzzle/i);

    // İlgi alanı ancak konu/ders ile doğal bağ kuruyorsa kullanılır; not başına tek örnek eklenir.
    if (sports && (/(hareket|hız|enerji|yol|mesafe|zaman|kuvvet|sağlıklı|fit)/i.test(topicText) ||
        (course === 'MAT' && /(kesir|oran|yüzde|sayı|ölçü|alan|çevre|işlem|problem)/i.test(topicText)))) {
      notes.push('Uygunsa fikri futbol topunun hareketi, bisiklet sürüşü ya da bir etkinlikteki tur sayısıyla düşünebilirsin.');
    }
    if (drawing && (course === 'DIJ' || /(şekil|geometri|alan|çevre|görsel|tasarım|renk|poster|sunum|kesir)/i.test(topicText))) {
      notes.push('Konuya uyarsa bir poster veya görsel tasarlama örneğiyle bağlantı kurabilirsin.');
    }
    if (nature && (course === 'FEN' || /(doğa|canlı|hayvan|bitki|enerji|çevre|hava|madde|gözlem|ekosistem)/i.test(topicText))) {
      notes.push('Kavramı doğada yapacağın kısa bir alan gözlemiyle ilişkilendirebilirsin.');
    }
    if (games && (course === 'MAT' || /(puan|seviye|oyun|işlem|kesir|olasılık|denklem|sayı|problem)/i.test(topicText))) {
      notes.push('Uygunsa puan ve seviyeler içeren küçük bir oyun örneği kurabilirsin.');
    }
    return notes.slice(0, 2);
  }

  function supportNotes() {
    const a = internalAnswers();
    const notes = [];
    const selected = a.difficulty.values;
    const supports = [
      ['Sorunun ne istediğini anlamakta', 'Önce sorunun ne istediğini kendi cümlenle belirleyelim.'],
      ['Konuyla ilgili bilgiyi hatırlamakta', 'Gerekli bilgiyi kısa bir hatırlatmayla tazeleyelim.'],
      ['Çözüme nasıl başlayacağımı bulmakta', 'İlk adımı birlikte planlayıp kalanını sana bırakalım.'],
      ['İşlemleri doğru yapmakta', 'İşlemleri küçük adımlara ayırıp her adımı ayrı kontrol edelim.'],
      ['Çözümü sonuna kadar götürmekte', 'Çözümü kısa basamaklara bölelim ve sırayla ilerleyelim.'],
      ['Cevabımı kontrol etmekte', 'Sonunda cevabı soruya geri bağlayıp birlikte kontrol edelim.']
    ];
    supports.forEach(([choice, text]) => { if (contains(selected, choice) && notes.length < 2) notes.push(text); });

    const reaction = a.reaction.values[0] || '';
    const correction = {
      'Nerede yanlış yaptığımı bulmaya çalışırım.': 'Yanlış olursa, nerede ayrıldığını sakin bir kontrolle bulup yeniden deneyelim.',
      'Çözümü inceleyip yeniden denerim.': 'Yanlış olursa, çözümü inceleyip benzer bir adımı yeniden denemen için alan bırakalım.',
      'Birinden açıklamasını isterim.': 'Yanlış olursa, önce takıldığın noktayı sorup kısa bir açıklamayla ilerleyelim.',
      'Sonra bakmak için işaretlerim.': 'Yanlış olursa, not edip hazır olduğunda birlikte geri dönebiliriz.',
      'Başka bir soruya geçerim.': 'Yanlış olursa, bunu öğrenme ipucu sayıp istersen daha sonra yeniden ele alalım.',
      'Duruma göre değişir.': 'Yanlış olursa, önce nasıl devam etmek istediğini seçebilirsin.'
    }[reaction];
    if (correction && notes.length < 3) notes.push(correction);
    return notes;
  }

  function goalNote() {
    const goal = internalAnswers().goal;
    const text = goal.values[0] || '';
    if (!text) return '';
    if (text === 'Henüz karar vermedim.' || text === 'Başka bir hedefim var: …') {
      return 'İstersen bu derste kendin için küçük bir hedef seçebilirsin.';
    }
    // Anketten gelen seçenek HTML-escape edilir; serbest metin en fazla 48 karakterdir.
    const safeGoal = escapeHTML(text.slice(0, 80));
    return `Hedefin “${safeGoal}” için bu derste küçük bir adım seçmeye ne dersin?`;
  }

  function personalizedNote(k, tab) {
    const parts = contextExamples(k, tab).concat(supportNotes());
    const goal = goalNote();
    if (goal) parts.push(goal);
    if (!parts.length) return '';
    return `<aside class="small muted" role="note" style="margin-top:12px;padding:8px 10px;border-left:2px solid var(--line);opacity:.9">${parts.join(' ')}</aside>`;
  }

  // Capture and reassign instead of editing the lesson renderer; delegation preserves other behavior.
  if (typeof contentTab === 'function' && !contentTab.__naviPersonalization) {
    const originalContentTab = contentTab;
    const wrappedContentTab = function (k, tab, ...rest) {
      const html = originalContentTab.call(this, k, tab, ...rest);
      const note = personalizedNote(k, tab);
      return note ? `${html}${note}` : html;
    };
    wrappedContentTab.__naviPersonalization = true;
    contentTab = wrappedContentTab;
  }

  // Respect a pre-existing ctab choice. Set a survey-based default only on lesson content.
  if (typeof PAGES !== 'undefined' && PAGES && typeof PAGES['o-ders'] === 'function' && !PAGES['o-ders'].__naviPersonalization) {
    const pages = PAGES;
    const originalLearningPage = pages['o-ders'];
    const wrappedLearningPage = function (sub, ...rest) {
      if (sub !== 'tum' && sub !== 'hafta' && typeof UI !== 'undefined' && UI.tabs && !UI.tabs.ctab) {
        const preferred = internalAnswers().mode.values[0] || '';
        const tabByMode = {
          'Kısa bir açıklama okumak': 'aciklama',
          'Bir örneğin çözümünü izlemek': 'ornek',
          'Görsellerle anlatım görmek': 'aciklama',
          'Küçük bir etkinlik yapmak': 'etk',
          'Önce kendim bir soru denemek': 'set'
        };
        if (tabByMode[preferred]) UI.tabs.ctab = tabByMode[preferred];
      }
      return originalLearningPage.call(this, sub, ...rest);
    };
    wrappedLearningPage.__naviPersonalization = true;
    pages['o-ders'] = wrappedLearningPage;
  }

  const priorAPI = root.NaviPersonalization && typeof root.NaviPersonalization === 'object'
    ? root.NaviPersonalization : {};
  root.NaviPersonalization = Object.assign(priorAPI, {
    readSurvey: surveyData,
    normalizeSelections: function (position) {
      // Exposed values are escaped as HTML text; multi-select answers always return arrays.
      return answerAt(position).values.map(escapeHTML);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
