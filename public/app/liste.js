// Öğrenci listesi ayrıştırıcı (Excel'den yapıştırma veya CSV).
// "No<TAB>Ad<TAB>Soyad", "Ad Soyad", "No;Ad;Soyad" ve "Ad,Soyad" biçimlerini anlar.
export function parseRoster(text) {
  const rows = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let cols = line.split(/\t|;|,/).map((c) => c.trim()).filter(Boolean);
    if (cols.length === 1) cols = line.split(/\s+/);
    if (/^(no|numara|okul no)$/i.test(cols[0]) || /^ad/i.test(cols[0]) && /soyad/i.test(cols.join(' '))) continue;
    let no = '';
    if (/^\d{1,6}$/.test(cols[0])) no = cols.shift();
    if (cols.length < 2) continue;
    let first, last;
    if (cols.length === 2) [first, last] = cols;
    else { last = cols.pop(); first = cols.join(' '); }
    rows.push({ student_no: no, first_name: first, last_name: last });
  }
  return rows;
}

