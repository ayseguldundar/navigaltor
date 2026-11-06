/* ================= FEN7 enerji dönüşümü · üretilmiş kısa video =================
 * APP_JS içinde personalization'dan sonra yüklenir; diğer kazanımların inline
 * animasyonlarına dokunmadan ilgili kazanımın görsel anlatımına MP4 ekler.
 */
(function () {
  if (typeof contentTab !== 'function' || contentTab.__naviGeneratedVideo) return;
  const originalContentTab = contentTab;
  const wrappedContentTab = function (k, tab, ...rest) {
    let html = originalContentTab.call(this, k, tab, ...rest);
    if (!k || k.id !== 'FEN7-2' || tab !== 'video') return html;
    html = html.replace('burada bir video dosyası oynatılmıyor.', 'aşağıda enerji dönüşümünü gösteren kısa bir video da izleyebilirsin.');
    return `${html}
      <figure class="lesson-video-clip" style="margin:16px 0 0;padding:0;">
        <video controls playsinline preload="metadata" aria-label="Potansiyel enerjinin kinetik enerjiye dönüşümünü gösteren kısa animasyon" style="display:block;width:100%;max-height:420px;aspect-ratio:16/9;object-fit:contain;background:#101827;border-radius:16px;">
          <source src="/videos/fen7-enerji-donusumu.mp4" type="video/mp4">
          Tarayıcınız HTML video oynatmayı desteklemiyor.
        </video>
        <figcaption class="small muted" style="margin-top:8px">FB.7.2.3 · Cisim yükselti kaybettikçe çekim potansiyel enerjisi azalırken hareketi hızlanır ve kinetik enerjisi artar. Rampa üzerindeki hareket, enerji dönüşümünü gözlemlemek için model olarak kullanılmıştır.</figcaption>
      </figure>`;
  };
  wrappedContentTab.__naviGeneratedVideo = true;
  contentTab = wrappedContentTab;
})();
