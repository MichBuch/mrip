// mrip — Media Ripper
// Readable source. The actual bookmarklet is this logic wrapped as
// javascript:(function(){ ... })();
// 
// To update the bookmarklet:
//   1. Minify / compact this (remove comments, shorten vars if needed)
//   2. Wrap in javascript:(function(){ <code> })();
//   3. Paste into bookmark URL field.

(function mrip() {
  'use strict';

  const OVERLAY_ID = 'mrip-overlay';
  if (document.getElementById(OVERLAY_ID)) {
    document.getElementById(OVERLAY_ID).remove();
    return;
  }

  function log(...args) {
    console.log('[mrip]', ...args);
  }

  function sanitizeFilename(name) {
    return (name || 'media')
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 110) || 'media';
  }

  function getExtension(url, type) {
    const clean = (url || '').split(/[?#]/)[0];
    const m = clean.match(/\.([a-z0-9]{2,5})$/i);
    if (m) return '.' + m[1].toLowerCase();
    if (type === 'image') return '.jpg';
    if (type === 'video') return '.mp4';
    if (type === 'audio') return '.mp3';
    return '';
  }

  function upgradeUrlForQuality(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('pinimg.com')) {
      let u = url.replace(/\/(originals|\d+x)\//i, '/originals/');
      u = u.replace(/\/236x\//i, '/736x/');
      return u;
    }
    return url;
  }

  function collectMedia() {
    const results = [];
    const seen = new Set();

    // Images
    document.querySelectorAll('img').forEach((img) => {
      let url = img.currentSrc || img.src || '';
      if (!url) return;
      if (url.startsWith('data:') && url.length < 300) return;
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w > 0 && h > 0 && w < 36 && h < 36) return;
      url = upgradeUrlForQuality(url);
      if (seen.has(url)) return;
      seen.add(url);
      results.push({
        url,
        type: 'image',
        w, h,
        alt: (img.alt || img.title || img.getAttribute('data-alt') || '').trim(),
        el: img
      });
    });

    // Videos
    document.querySelectorAll('video').forEach((vid) => {
      const cands = [];
      if (vid.currentSrc) cands.push(vid.currentSrc);
      if (vid.src) cands.push(vid.src);
      vid.querySelectorAll('source').forEach(s => s.src && cands.push(s.src));
      cands.forEach(u => {
        if (!u || seen.has(u)) return;
        seen.add(u);
        results.push({ url: u, type: 'video', alt: (vid.title || '').trim(), el: vid });
      });
    });

    // Audio
    document.querySelectorAll('audio').forEach((aud) => {
      const cands = [];
      if (aud.currentSrc) cands.push(aud.currentSrc);
      if (aud.src) cands.push(aud.src);
      aud.querySelectorAll('source').forEach(s => s.src && cands.push(s.src));
      cands.forEach(u => {
        if (!u || seen.has(u)) return;
        seen.add(u);
        results.push({ url: u, type: 'audio', alt: (aud.title || '').trim(), el: aud });
      });
    });

    // Direct links with media extensions
    document.querySelectorAll('a[href]').forEach((a) => {
      const h = a.href;
      if (!h || seen.has(h)) return;
      const lower = h.toLowerCase();
      if (/\.(jpe?g|png|gif|webp|avif|svg|mp4|webm|mov|mp3|wav|ogg|flac|m4a)(\?|$|#)/i.test(lower)) {
        seen.add(h);
        const t = /\.(mp4|webm|mov)/i.test(lower) ? 'video'
                : /\.(mp3|wav|ogg|flac|m4a)/i.test(lower) ? 'audio' : 'image';
        results.push({ url: h, type: t, alt: (a.textContent || a.title || '').trim().slice(0, 80), el: a });
      }
    });

    return results;
  }

  // Downloads

  async function saveViaFS(item, dirHandle) {
    try {
      const res = await fetch(item.url, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error('fetch ' + res.status);
      const blob = await res.blob();
      const ext = getExtension(item.url, item.type);
      const base = sanitizeFilename(item.alt || item.url.split('/').pop() || 'file');
      const name = base + (base.toLowerCase().endsWith(ext) ? '' : ext);

      const fh = await dirHandle.getFileHandle(name, { create: true });
      const w = await fh.createWritable();
      await w.write(blob);
      await w.close();
      return true;
    } catch (e) {
      log('FS failed, link fallback', e.message || e);
      return saveViaLink(item);
    }
  }

  function saveViaLink(item) {
    return new Promise(resolve => {
      const a = document.createElement('a');
      a.href = item.url;
      const ext = getExtension(item.url, item.type);
      const base = sanitizeFilename(item.alt || item.url.split('/').pop() || 'file');
      a.download = base + (base.toLowerCase().endsWith(ext) ? '' : ext);
      a.style.cssText = 'position:absolute;left:-9999px';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { a.remove(); resolve(true); }, 130);
    });
  }

  async function runDownloads(selected) {
    if (!selected.length) return;

    const canFS = 'showDirectoryPicker' in window;
    let dir = null;
    if (canFS) {
      try {
        dir = await window.showDirectoryPicker({ id: 'mrip-downloads', mode: 'readwrite', startIn: 'downloads' });
      } catch (e) {
        if (e.name !== 'AbortError') {
          log('FS picker error', e);
          const p = document.getElementById('mrip-progress');
          if (p) p.textContent = 'Folder picker failed or canceled — falling back to browser Downloads folder';
        }
      }
    }

    const prog = document.getElementById('mrip-progress');
    let i = 0;
    for (const item of selected) {
      i++;
      if (prog) prog.textContent = `Downloading ${i}/${selected.length}...`;
      try {
        if (dir) {
          try {
            await saveViaFS(item, dir);
          } catch (fsErr) {
            log('FS write error for', item.url, fsErr);
            // Permission or security errors on Downloads etc. → fallback
            if (fsErr && (fsErr.name === 'NotAllowedError' || fsErr.name === 'SecurityError' || /permission|denied|security|access/i.test(String(fsErr)))) {
              const p = document.getElementById('mrip-progress');
              if (p) p.textContent = `Permission issue writing to folder — falling back for remaining files`;
              dir = null; // switch to simple downloads for the rest
            }
            await saveViaLink(item);
          }
        } else {
          await saveViaLink(item);
        }
      } catch (e) {
        log('Download error', item.url, e);
      }
      await new Promise(r => setTimeout(r, 130));
    }
    if (prog) prog.textContent = `Done ${i}/${selected.length}`;
    setTimeout(() => document.getElementById(OVERLAY_ID)?.remove(), 900);
  }

  // UI builder

  function buildOverlay(items) {
    const o = document.createElement('div');
    o.id = OVERLAY_ID;
    o.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(15,15,15,0.82);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e6e6e6;display:flex;flex-direction:column';

    const hdr = document.createElement('div');
    hdr.style.cssText = 'padding:8px 14px;background:#0f0f0f;border-bottom:1px solid #333;display:flex;align-items:center;gap:10px;flex-shrink:0';
    const supportsFS = 'showDirectoryPicker' in window;
    const modeBadge = supportsFS ? 'FS' : 'DL';
    hdr.innerHTML = `<div style="font-weight:700;font-size:15px">mrip — Media Ripper</div><span style="font-size:9px;opacity:0.5;background:#222;padding:1px 4px;border-radius:2px;margin-left:6px" title="${supportsFS ? 'Direct folder write supported (best on Edge/Chrome/Brave/Opera)' : 'Standard download fallback (Firefox etc.)'}">${modeBadge}</span><div id="mrip-count" style="opacity:.65;font-size:12px;margin-left:6px"></div><div style="flex:1"></div><button id="mrip-close" style="background:#222;border:1px solid #444;color:#ddd;padding:4px 10px;border-radius:4px;cursor:pointer">Close (ESC)</button>`;
    o.appendChild(hdr);

    const bar = document.createElement('div');
    bar.style.cssText = 'padding:6px 12px;background:#181818;border-bottom:1px solid #333;flex-shrink:0;display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:13px';
    bar.innerHTML = `
      <button id="sa">Select All</button><button id="sn">None</button><button id="si">Invert</button>
      <span style="width:6px"></span>
      <label>Type: <select id="ft" style="background:#222;border:1px solid #444;color:#ddd"><option value="">All</option><option value="image">Images</option><option value="video">Video</option><option value="audio">Audio</option></select></label>
      <label style="margin-left:4px">Min: <input id="ms" type="number" value="60" style="width:50px;background:#222;border:1px solid #444;color:#ddd;padding:1px 3px">px</label>
      <span style="flex:1"></span>
      <button id="cp" style="background:#1f2a44">Copy URLs</button>
      <button id="go" style="background:#0a4;color:#fff;font-weight:600;padding:0 12px">Download Selected (0)</button>`;
    o.appendChild(bar);

    const grid = document.createElement('div');
    grid.style.cssText = 'flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:repeat(auto-fill,minmax(142px,1fr));gap:8px';
    o.appendChild(grid);

    const ftr = document.createElement('div');
    ftr.style.cssText = 'padding:5px 12px;background:#0f0f0f;font-size:11px;border-top:1px solid #333;flex-shrink:0;display:flex;gap:12px';
    ftr.innerHTML = `<div id="mrip-progress" style="flex:1"></div><div style="opacity:.55">Personal use • Respect copyright and site rules</div>`;
    o.appendChild(ftr);

    document.body.appendChild(o);

    let vis = items.slice();
    const ch = new Map();

    function render(list) {
      grid.innerHTML = '';
      ch.clear();
      list.forEach(it => {
        const c = document.createElement('div');
        c.style.cssText = 'background:#1f1f1f;border:1px solid #333;border-radius:5px;overflow:hidden;font-size:11px;display:flex;flex-direction:column';
        const top = document.createElement('div');
        top.style.cssText = 'padding:2px 5px;background:#181818;display:flex;align-items:center;gap:4px;font-size:10px';
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = false;
        const bd = document.createElement('span'); bd.textContent = it.type; bd.style.cssText = 'font-size:9px;background:#2a2a2a;padding:0 3px;border-radius:2px';
        top.append(cb, bd);
        if (it.w && it.h) {
          const d = document.createElement('span'); d.textContent = it.w + '×' + it.h; d.style.cssText = 'opacity:.5;margin-left:auto;font-size:9px';
          top.append(d);
        }
        const pr = document.createElement('div');
        pr.style.cssText = 'background:#111;display:flex;align-items:center;justify-content:center;overflow:hidden;max-height:110px;min-height:48px;border-bottom:1px solid #2a2a2a';
        let p;
        if (it.type === 'image') { p = document.createElement('img'); p.src = it.url; p.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain'; p.loading = 'lazy'; }
        else if (it.type === 'video') { p = document.createElement('video'); p.src = it.url; p.muted = true; p.loop = true; p.playsInline = true; p.style.cssText = 'max-width:100%;max-height:100%'; pr.onclick = () => p.paused ? p.play() : p.pause(); }
        else { p = document.createElement('div'); p.textContent = '♫'; p.style.cssText = 'font-size:36px;opacity:.5'; }
        if (p) pr.append(p);
        const nm = document.createElement('div');
        nm.style.cssText = 'padding:3px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
        nm.textContent = it.alt || (it.url.split('/').pop() || '').split('?')[0];
        const u = document.createElement('div');
        u.style.cssText = 'padding:1px 5px 3px;font-size:9px;opacity:.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-top:1px solid #2a2a2a';
        u.textContent = it.url;
        c.append(top, pr, nm, u);
        cb.onchange = updateBtn;
        c.onclick = e => { if (e.target !== cb && e.target.tagName !== 'VIDEO' && e.target.tagName !== 'IMG') { cb.checked = !cb.checked; updateBtn(); } };
        grid.append(c);
        ch.set(it, cb);
      });
      updateBtn();
    }

    function updateBtn() {
      const b = document.getElementById('go');
      if (b) b.textContent = 'Download Selected (' + Array.from(ch.values()).filter(x => x.checked).length + ')';
    }
    function getSel() { return vis.filter(i => ch.get(i)?.checked); }

    function filter() {
      const ty = document.getElementById('ft').value;
      const ms = +document.getElementById('ms').value || 0;
      vis = items.filter(i => {
        if (ty && i.type !== ty) return false;
        if (ms && i.type === 'image' && (i.w || 0) < ms && (i.h || 0) < ms) return false;
        return true;
      });
      render(vis);
    }

    document.getElementById('sa').onclick = () => { ch.forEach(c => c.checked = true); updateBtn(); };
    document.getElementById('sn').onclick = () => { ch.forEach(c => c.checked = false); updateBtn(); };
    document.getElementById('si').onclick = () => { ch.forEach(c => c.checked = !c.checked); updateBtn(); };
    document.getElementById('ft').onchange = filter;
    document.getElementById('ms').oninput = filter;
    document.getElementById('go').onclick = () => { const s = getSel(); if (s.length) runDownloads(s); };
    document.getElementById('cp').onclick = () => {
      const txt = getSel().map(i => i.url).join('\n');
      navigator.clipboard.writeText(txt).then(() => alert('Copied ' + getSel().length + ' URLs'), () => prompt('Copy:', txt));
    };
    document.getElementById('mrip-close').onclick = () => o.remove();
    document.addEventListener('keydown', e => { if (e.key === 'Escape') o.remove(); }, { once: true });

    const cnt = document.getElementById('mrip-count');
    if (cnt) cnt.textContent = items.length + ' items';
    render(vis);
    filter();
  }

  // Run
  const items = collectMedia();
  if (!items.length) {
    alert('mrip: No media found (try scrolling the page first to load lazy images).');
    return;
  }
  buildOverlay(items);
  log('Started with', items.length, 'items');
})();
