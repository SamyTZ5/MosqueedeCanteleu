// ================================================================
// AMCC — cms.js v4.0
// ================================================================

const SUPABASE_URL = 'https://bejqwniucizvfxamnlyf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DllY8Q-udoVWolzg-4xxbQ_VSz-vYP3';
const LOGO_URL     = 'https://i.ibb.co/35sHFxJZ/Chat-GPT-Image-Jan-1-2026-08-58-31-PM-removebg-preview.png';

(async () => {
  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  // ── Utilitaires ──────────────────────────────────────────────
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday:'long', day:'numeric', month:'long', year:'numeric'
    });
  }
  function fmtDay(iso) { return new Date(iso).getDate(); }
  function fmtMonthYear(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { month:'short', year:'numeric' });
  }
  function couleurBandeau(c) {
    return { rouge:'#dc3545', orange:'#fd7e14', vert:'#28a745' }[c] || '#dc3545';
  }

  async function fetchActifs(table) {
    const view = table + '_valides';
    const { data, error } = await sb.from(view).select('*');
    if (error) {
      const { data: fallback } = await sb.from(table).select('*')
        .eq('actif', true)
        .order('created_at', { ascending: false });
      return fallback || [];
    }
    return data || [];
  }

  // ── Rosette SVG ──────────────────────────────────────────────
  function rosetteSVG(color, size) {
    size = size || 100;
    var rects = '';
    var angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5];
    for (var i = 0; i < angles.length; i++) {
      rects += '<rect x="-16" y="-16" width="32" height="32" rx="4" fill="' + color + '" transform="rotate(' + angles[i] + ')" opacity=".6"/>';
    }
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block;"><g transform="translate(50,50)">' + rects + '<circle r="10" fill="' + color + '"/></g></svg>';
  }

  // ── Boutons de partage ────────────────────────────────────────
  function shareBtns(id, titre, contenu) {
    var baseUrl    = window.location.origin + '/actus.html';
    var directUrl  = baseUrl + '?annonce=' + id;
    var urlEnc     = encodeURIComponent(directUrl);
    var excerpt    = contenu.substring(0, 200) + (contenu.length > 200 ? '...' : '');
    var waMsg      = (titre ? 'Mosquee El Mohsinine : ' + titre + '\n\n' : 'Mosquee El Mohsinine\n\n') + excerpt + '\n\n' + directUrl;
    var waUrl      = 'https://wa.me/?text=' + encodeURIComponent(waMsg);
    var fbUrl      = 'https://www.facebook.com/sharer/sharer.php?u=' + urlEnc;
    var btnBase    = 'display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9px;font-size:.88rem;text-decoration:none;border:none;cursor:pointer;';

    return '<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">'
      + '<span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#a0aec0;">Partager</span>'
      + '<a href="' + fbUrl + '" target="_blank" rel="noopener" title="Facebook" style="' + btnBase + 'background:#1877f2;color:#fff;"><i class="fab fa-facebook-f"></i></a>'
      + '<a href="' + waUrl + '" target="_blank" rel="noopener" title="WhatsApp" style="' + btnBase + 'background:#25d366;color:#fff;"><i class="fab fa-whatsapp"></i></a>'
      + '<button onclick="navigator.clipboard.writeText(\'' + directUrl.replace(/'/g, "\\'") + '\').then(function(){var b=this;b.innerHTML=\'<i class=&quot;fas fa-check&quot;></i>\';b.style.background=\'#28a745\';setTimeout(function(){b.innerHTML=\'<i class=&quot;fas fa-link&quot;></i>\';b.style.background=\'#718096\';},2000);}.bind(this));" title="Copier le lien" style="' + btnBase + 'background:#718096;color:#fff;"><i class="fas fa-link"></i></button>'
      + '</div>';
  }

  // ── Affichette principale ─────────────────────────────────────
  function buildCard(annonce, module) {
    var isMosquee   = module === 'mosquee';
    var poleName    = isMosquee ? 'Mosquée El Mohsinine' : 'Madrassah El Mohsinine';
    var poleIconFA  = isMosquee ? 'fa-mosque' : 'fa-graduation-cap';
    var accentGreen = isMosquee ? '#1E5545' : '#5a3e28';
    var headBg      = isMosquee ? '#e8f5f0' : '#f0ebe3';

    var typeLabel, typeIcon, typeBg;
    if (annonce.type === 'urgente')       { typeLabel='Annonce Urgente'; typeIcon='fa-bullhorn';  typeBg='#dc3545'; }
    else if (annonce.type === 'epinglee') { typeLabel='Message Épinglé'; typeIcon='fa-thumbtack'; typeBg='#C5A059'; }
    else                                  { typeLabel='Actualité';       typeIcon='fa-newspaper'; typeBg=accentGreen; }

    var expiryHtml = '';
    if (annonce.expire_at) {
      expiryHtml = '<div style="font-size:.7rem;color:#fd7e14;margin-top:3px;"><i class="fas fa-hourglass-half" style="margin-right:4px;"></i>Valable jusqu\'au ' + fmtDate(annonce.expire_at) + '</div>';
    }

    var imageHtml = '';
    if (annonce.image_url) {
      imageHtml = '<div style="margin-bottom:15px;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1);"><img src="' + annonce.image_url + '" alt="" style="width:100%;height:200px;object-fit:cover;display:block;"></div>';
    }

    var titreHtml = '';
    if (annonce.titre) {
      titreHtml = '<h3 style="font-family:\'Poppins\',sans-serif;font-weight:700;font-size:1.05rem;color:' + accentGreen + ';margin-bottom:10px;line-height:1.35;">' + annonce.titre + '</h3>';
    }

    return '<div data-annonce-id="' + annonce.id + '" style="background:#fdfaf5;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.09);border:1px solid rgba(197,160,89,.25);font-family:\'Open Sans\',sans-serif;position:relative;">'

      // En-tête vert menthe
      + '<div style="background:' + headBg + ';border-bottom:3px solid #C5A059;padding:14px 18px;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden;">'
      + '<div style="position:absolute;right:-18px;top:-18px;opacity:.18;">' + rosetteSVG('#C5A059', 80) + '</div>'
      + '<img src="' + LOGO_URL + '" alt="Logo" style="width:38px;height:38px;object-fit:contain;flex-shrink:0;z-index:1;">'
      + '<div style="flex:1;z-index:1;">'
      + '<div style="font-family:\'Montserrat\',sans-serif;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#1a2e2a;opacity:.7;margin-bottom:4px;"><i class="fas ' + poleIconFA + '" style="margin-right:5px;"></i>' + poleName + '</div>'
      + '<span style="display:inline-flex;align-items:center;gap:6px;background:' + typeBg + ';color:#fff;padding:3px 11px;border-radius:20px;font-size:.7rem;font-weight:700;"><i class="fas ' + typeIcon + '" style="font-size:.65rem;"></i>' + typeLabel + '</span>'
      + '</div>'
      + '<div style="text-align:right;z-index:1;flex-shrink:0;">'
      + '<div style="font-family:\'Poppins\',sans-serif;font-size:2rem;font-weight:900;color:#C5A059;line-height:1;">' + fmtDay(annonce.created_at) + '</div>'
      + '<div style="font-size:.65rem;font-weight:700;text-transform:uppercase;color:#1a2e2a;opacity:.65;letter-spacing:.4px;">' + fmtMonthYear(annonce.created_at) + '</div>'
      + '</div>'
      + '</div>'

      // Corps
      + '<div style="padding:18px 20px;background:#fdfaf5;">'
      + imageHtml
      + titreHtml
      + '<p style="color:#3d3d3d;font-size:.92rem;line-height:1.7;white-space:pre-wrap;margin:0;">' + annonce.contenu + '</p>'
      // Séparateur
      + '<div style="display:flex;align-items:center;gap:8px;margin:16px 0 14px;">'
      + '<div style="flex:1;height:1px;background:rgba(197,160,89,.3);"></div>'
      + '<div style="opacity:.4;">' + rosetteSVG('#C5A059', 16) + '</div>'
      + '<div style="flex:1;height:1px;background:rgba(197,160,89,.3);"></div>'
      + '</div>'
      // Pied
      + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">'
      + '<div>'
      + '<div style="font-size:.73rem;color:#a0aec0;"><i class="fas fa-clock" style="margin-right:4px;color:#C5A059;"></i>' + fmtDate(annonce.created_at) + '</div>'
      + expiryHtml
      + '</div>'
      + shareBtns(annonce.id, annonce.titre, annonce.contenu)
      + '</div>'
      + '</div>'
      + '</div>';
  }

  // ── Placeholder ───────────────────────────────────────────────
  function buildPlaceholder(module) {
    var isMosquee   = module === 'mosquee';
    var poleName    = isMosquee ? 'Mosquée El Mohsinine' : 'Madrassah El Mohsinine';
    var poleIconFA  = isMosquee ? 'fa-mosque' : 'fa-graduation-cap';
    var headBg      = isMosquee ? '#e8f5f0' : '#f0ebe3';
    var accentGreen = isMosquee ? '#1E5545' : '#5a3e28';

    return '<div style="background:#fdfaf5;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.05);border:1px solid rgba(197,160,89,.15);">'
      + '<div style="background:' + headBg + ';border-bottom:3px solid #C5A059;padding:14px 18px;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden;">'
      + '<div style="position:absolute;right:-18px;top:-18px;opacity:.15;">' + rosetteSVG('#C5A059', 80) + '</div>'
      + '<img src="' + LOGO_URL + '" alt="" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;z-index:1;">'
      + '<div style="z-index:1;">'
      + '<div style="font-family:\'Montserrat\',sans-serif;font-size:.67rem;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#1a2e2a;opacity:.65;"><i class="fas ' + poleIconFA + '" style="margin-right:5px;"></i>' + poleName + '</div>'
      + '<div style="font-size:.82rem;color:' + accentGreen + ';font-weight:600;margin-top:3px;">Aucune annonce</div>'
      + '</div></div>'
      + '<div style="padding:20px;text-align:center;color:#c0c0c0;">'
      + '<i class="fas ' + poleIconFA + '" style="font-size:1.5rem;margin-bottom:8px;display:block;opacity:.2;"></i>'
      + '<p style="font-size:.85rem;">Les prochaines annonces apparaîtront ici.</p>'
      + '</div></div>';
  }

  // ── Rendu accueil ─────────────────────────────────────────────
  function renderAccueil(slot, annonces, module) {
    if (!slot) return;
    if (!annonces.length) { slot.innerHTML = buildPlaceholder(module); return; }
    var toShow = null;
    for (var i = 0; i < annonces.length; i++) {
      if (annonces[i].type === 'epinglee') { toShow = annonces[i]; break; }
    }
    if (!toShow) toShow = annonces[0];
    slot.innerHTML = buildCard(toShow, module);
  }

  // ── En-tête section Actualités ────────────────────────────────
  function sectionHeader(module, count) {
    var isMosquee   = module === 'mosquee';
    var poleName    = isMosquee ? 'Annonces — Mosquée El Mohsinine' : 'Annonces — Madrassah El Mohsinine';
    var sub         = isMosquee ? "Communications officielles de l'AMCC" : 'Communications de la Madrassah';
    var poleIconFA  = isMosquee ? 'fa-mosque' : 'fa-graduation-cap';
    var headBg      = isMosquee ? '#e8f5f0' : '#f0ebe3';
    var accentGreen = isMosquee ? '#1E5545' : '#5a3e28';

    return '<div style="background:' + headBg + ';border-radius:14px 14px 0 0;border:1px solid rgba(197,160,89,.25);border-bottom:3px solid #C5A059;padding:18px 24px;display:flex;align-items:center;gap:16px;position:relative;overflow:hidden;">'
      + '<div style="position:absolute;right:-20px;top:-20px;opacity:.15;">' + rosetteSVG('#C5A059', 90) + '</div>'
      + '<img src="' + LOGO_URL + '" alt="" style="width:42px;height:42px;object-fit:contain;flex-shrink:0;z-index:1;">'
      + '<div style="z-index:1;flex:1;">'
      + '<div style="font-family:\'Poppins\',sans-serif;font-weight:700;font-size:1.05rem;color:' + accentGreen + ';">' + poleName + '</div>'
      + '<div style="font-size:.8rem;color:' + accentGreen + ';opacity:.65;margin-top:2px;">' + sub + '</div>'
      + '</div>'
      + '<div style="background:rgba(197,160,89,.15);color:#C5A059;padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:700;z-index:1;font-family:\'Montserrat\',sans-serif;">' + count + ' publication' + (count > 1 ? 's' : '') + '</div>'
      + '</div>';
  }

  // ── Rendu page Actualités ─────────────────────────────────────
  function renderActus(slot, annonces, module) {
    if (!slot) return;
    var poleIconFA = module === 'mosquee' ? 'fa-mosque' : 'fa-graduation-cap';
    var cardsHtml;

    if (!annonces.length) {
      cardsHtml = '<div style="padding:40px;text-align:center;color:#c0c0c0;background:#fdfaf5;border-radius:0 0 14px 14px;border:1px solid rgba(197,160,89,.2);border-top:none;">'
        + '<i class="fas ' + poleIconFA + '" style="font-size:2.5rem;display:block;margin-bottom:12px;opacity:.2;"></i>'
        + '<p style="font-size:.9rem;">Aucune publication pour le moment.</p></div>';
    } else {
      var cards = '';
      for (var i = 0; i < annonces.length; i++) {
        cards += buildCard(annonces[i], module);
      }
      cardsHtml = '<div style="border:1px solid rgba(197,160,89,.2);border-top:none;border-radius:0 0 14px 14px;padding:20px;background:#f8f4ee;display:flex;flex-direction:column;gap:18px;">' + cards + '</div>';
    }

    slot.innerHTML = sectionHeader(module, annonces.length) + cardsHtml;
  }

  // ── Bandeau urgent ────────────────────────────────────────────
  function renderBandeau(toutes) {
    var slot = document.getElementById('bandeau-urgente');
    if (!slot) return;
    var urgente = null;
    for (var i = 0; i < toutes.length; i++) {
      if (toutes[i].type === 'urgente') { urgente = toutes[i]; break; }
    }
    if (!urgente) { slot.style.display = 'none'; return; }
    var bg = couleurBandeau(urgente.couleur);
    slot.style.display = 'block';
    slot.innerHTML = '<div style="background:' + bg + ';color:#fff;padding:10px 0;font-family:\'Montserrat\',sans-serif;font-size:.86rem;font-weight:600;z-index:999;">'
      + '<div style="max-width:1200px;margin:0 auto;padding:0 5%;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'
      + '<img src="' + LOGO_URL + '" alt="" style="width:20px;height:20px;object-fit:contain;filter:brightness(0) invert(1);opacity:.8;flex-shrink:0;">'
      + '<i class="fas fa-bullhorn" style="flex-shrink:0;"></i>'
      + '<span style="flex:1;">' + urgente.contenu + '</span>'
      + '<button onclick="this.closest(\'div\').parentElement.parentElement.style.display=\'none\'" style="background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:1rem;padding:0 6px;flex-shrink:0;"><i class="fas fa-times"></i></button>'
      + '</div></div>';
  }

  // ── Orchestration ─────────────────────────────────────────────
  var results = await Promise.all([
    fetchActifs('annonces_mosquee'),
    fetchActifs('annonces_madrassah')
  ]);
  var mosquee   = results[0];
  var madrassah = results[1];

  renderBandeau(mosquee.concat(madrassah));
  renderAccueil(document.getElementById('cms-mosquee'),   mosquee,   'mosquee');
  renderAccueil(document.getElementById('cms-madrassah'), madrassah, 'madrassah');
  renderActus(document.getElementById('actus-mosquee'),   mosquee,   'mosquee');
  renderActus(document.getElementById('actus-madrassah'), madrassah, 'madrassah');

})();
