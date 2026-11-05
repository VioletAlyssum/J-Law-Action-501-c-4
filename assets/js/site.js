/* =====================================================================
   JennifersLaw.org — shared page behavior (November 2026)
   Reads window.JL_CONFIG from site-config.js. Adds:
     - the Appeal Fund progress bar (homepage, Appeal page)
     - "Share this page" buttons on content pages, and share dialogs
     - the slim "Fund the Appeal" bar on phones
     - newsletter routing to a real email service, when one is set up
     - Google Analytics events for appeal clicks, shares and sign-ups
   Nothing here needs editing; settings live in site-config.js.
   ===================================================================== */
(function () {
  'use strict';
  var CFG = window.JL_CONFIG || {};
  var APPEAL = CFG.appeal || {};
  var me = document.currentScript;
  var ROOT = me ? me.getAttribute('src').replace(/assets\/js\/site\.js.*$/, '') : '';

  /* Optional analytics for pages that do not carry the Google tag in their head (JL_CONFIG.analyticsId). */
  if (CFG.analyticsId && !window.gtag) {
    var ga = document.createElement('script'); ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.analyticsId);
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', CFG.analyticsId);
  }
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} }
  function money(n) { return '$' + Math.round(Number(n) || 0).toLocaleString('en-US'); }
  function el(tag, cls, html) { var x = document.createElement(tag); if (cls) x.className = cls; if (html != null) x.innerHTML = html; return x; }

  /* ---------- where this page sits, and its public address ---------- */
  var rootAbs = new URL(ROOT || './', location.href).href;
  function fromRoot(href) {
    var abs = new URL(href, location.href);
    abs.hash = ''; abs.search = '';
    var p = abs.href.indexOf(rootAbs) === 0 ? abs.href.slice(rootAbs.length) : abs.pathname.replace(/^\//, '');
    return p.replace(/(^|\/)index\.html$/, '$1');
  }
  var HERE = fromRoot(location.href);
  function publicUrl(pathFromRoot) {
    var base = (CFG.siteUrl || '').replace(/\/$/, '');
    if (!base || location.protocol === 'file:') base = rootAbs.replace(/\/$/, '');
    return base + '/' + pathFromRoot;
  }

  /* ---------- 1. Appeal Fund progress ---------- */
  function paintAppeal() {
    var goal = Number(APPEAL.goal) || 70000, raised = Number(APPEAL.raised) || 0;
    var pct = Math.max(0, Math.min(100, raised / goal * 100));
    document.querySelectorAll('[data-appeal-progress]').forEach(function (box) {
      var r = box.querySelector('[data-ap-raised]'), g = box.querySelector('[data-ap-goal]');
      var f = box.querySelector('[data-ap-fill]'), n = box.querySelector('[data-ap-note]');
      if (raised > 0) {
        if (r) r.textContent = money(raised);
        if (g) g.textContent = 'raised of the ' + money(goal) + ' goal';
        if (f) { f.style.width = (pct < 1.5 ? 1.5 : pct) + '%'; }
        if (n) {
          var bits = [];
          if (Number(APPEAL.donors) > 0) bits.push(Number(APPEAL.donors).toLocaleString('en-US') + (Number(APPEAL.donors) === 1 ? ' person has' : ' people have') + ' given');
          if (APPEAL.updatedOn) bits.push('updated ' + APPEAL.updatedOn);
          if (bits.length) n.textContent = bits.join(' · ') + '.';
        }
      } else {
        if (r) r.textContent = money(goal);
        if (g) g.textContent = 'goal';
        if (f) f.style.width = '0%';
      }
      box.setAttribute('aria-label', raised > 0 ? money(raised) + ' raised of ' + money(goal) : 'Goal: ' + money(goal));
    });
    document.querySelectorAll('[data-appeal-goal]').forEach(function (x) { x.textContent = money(goal); });
    if (APPEAL.gofundmeUrl) {
      document.querySelectorAll('[data-gofundme]').forEach(function (a) { a.href = APPEAL.gofundmeUrl; a.closest('[hidden]') && (a.closest('[hidden]').hidden = false); a.hidden = false; });
    }
  }

  /* ---------- 2. Sharing ---------- */
  var ICONS = {
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.8 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L8.3 3.9H6.5L17.8 20z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V22h3.4z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3V9.75zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-4V9.75z"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L4 7.3V17h16V7.3l-8 4.9zM5.2 7l6.8 4.2L18.8 7H5.2z"/></svg>',
    text: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 1-2zm1 2v12.6L7.3 16H20V5H5z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 0 1 4.2 4.2l-2.1 2.1a1 1 0 1 1-1.4-1.4l2.1-2.1a1 1 0 0 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 0 1-4.2-4.2l2.1-2.1a1 1 0 0 1 1.4 1.4L7.1 12.7a1 1 0 0 0 1.4 1.4l3.5-3.5a1 1 0 0 1 1.4 0z"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7a3 3 0 0 0 .1.8L8.4 11.2a3 3 0 1 0 0 3.6l6.7 3.4A3 3 0 1 0 18 16z"/></svg>'
  };

  function shareRow(url, text, title) {
    var row = el('div', 'jl-share-inner');
    var enc = encodeURIComponent, t = text || title || document.title;
    var links = [
      ['x', 'Share on X', 'https://twitter.com/intent/tweet?text=' + enc(t) + '&url=' + enc(url)],
      ['facebook', 'Share on Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url)],
      ['linkedin', 'Share on LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(url)],
      ['email', 'Share by email', 'mailto:?subject=' + enc(title || document.title) + '&body=' + enc(t + '\n\n' + url)]
    ];
    if ('ontouchstart' in window) links.push(['text', 'Share by text message', 'sms:?&body=' + enc(t + ' ' + url)]);
    links.forEach(function (l) {
      var a = el('a', 'jl-share-btn', ICONS[l[0]]);
      a.href = l[2]; a.setAttribute('aria-label', l[1]); a.title = l[1];
      if (l[0] !== 'email' && l[0] !== 'text') { a.target = '_blank'; a.rel = 'noopener'; }
      a.addEventListener('click', function () { track('share', { method: l[0], content_type: 'page', item_id: url }); });
      row.appendChild(a);
    });
    var copy = el('button', 'jl-share-btn', ICONS.link + '<span>Copy link</span>');
    copy.type = 'button';
    copy.addEventListener('click', function () {
      function done(ok) { copy.querySelector('span').textContent = ok ? 'Copied' : 'Press Ctrl+C'; setTimeout(function () { copy.querySelector('span').textContent = 'Copy link'; }, 2000); }
      track('share', { method: 'copy', item_id: url });
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { window.prompt('Copy this link:', url); done(false); });
      else { window.prompt('Copy this link:', url); done(false); }
    });
    row.appendChild(copy);
    if (navigator.share) {
      var more = el('button', 'jl-share-btn', ICONS.more + '<span>More</span>');
      more.type = 'button';
      more.addEventListener('click', function () { track('share', { method: 'native', item_id: url }); navigator.share({ title: title || document.title, text: t, url: url }).catch(function () {}); });
      row.appendChild(more);
    }
    return row;
  }

  function addShareBar() {
    var skip = /^(support\/|contact\.html|privacy\.html|terms\.html|404\.html)/;
    if (HERE === '' || skip.test(HERE) || document.body.hasAttribute('data-noshare')) return;
    var main = document.getElementById('main');
    if (!main || main.querySelector('.jl-share')) return;
    var bar = el('section', 'jl-share');
    bar.setAttribute('aria-label', 'Share this page');
    var wrap = el('div', 'wrap');
    var row = shareRow(publicUrl(HERE), null, document.title.replace(/\s+[—-]\s+Jennifer.s Law$/, ''));
    row.insertBefore(el('span', 'jl-share-label', 'Share this page'), row.firstChild);
    wrap.appendChild(row); bar.appendChild(wrap);
    /* Sit just above the "About This Section" note when the page has one; otherwise at the end. */
    var anchor = null;
    main.querySelectorAll(':scope > section').forEach(function (s) { if (!anchor && /^\s*About This Section/i.test(s.textContent)) anchor = s; });
    if (anchor) main.insertBefore(bar, anchor); else main.appendChild(bar);
  }

  var dialog = null, lastFocus = null;
  function openShareDialog(url, text, title) {
    if (!dialog) {
      dialog = el('div', 'jl-share-dialog');
      dialog.hidden = true;
      dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-labelledby', 'jl-share-title');
      dialog.innerHTML = '<div class="jl-share-card"><button type="button" class="jl-share-close" aria-label="Close">&times;</button><h2 id="jl-share-title">Share</h2><p class="jl-share-text"></p><div class="jl-share-slot"></div></div>';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', function (e) { if (e.target === dialog || e.target.closest('.jl-share-close')) closeShareDialog(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dialog && !dialog.hidden) closeShareDialog(); });
    }
    dialog.querySelector('.jl-share-text').textContent = text || '';
    var slot = dialog.querySelector('.jl-share-slot'); slot.innerHTML = '';
    slot.appendChild(shareRow(url, text, title));
    lastFocus = document.activeElement;
    dialog.hidden = false;
    dialog.querySelector('.jl-share-close').focus();
  }
  function closeShareDialog() { dialog.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  /* Other scripts (petition forms) can open the share dialog after an action: JLShare(url, text, title). */
  window.JLShare = function (url, text, title) {
    if (navigator.share && ('ontouchstart' in window)) { navigator.share({ title: title || document.title, text: text || '', url: url }).catch(function () {}); }
    else openShareDialog(url, text, title);
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.jl-share-open');
    if (!b) return;
    e.preventDefault();
    var url = publicUrl(fromRoot(new URL(ROOT + (b.getAttribute('data-share-url') || HERE), location.href).href));
    var text = b.getAttribute('data-share-text') || '';
    var title = b.getAttribute('data-share-title') || document.title;
    track('share_open', { item_id: url });
    if (navigator.share && ('ontouchstart' in window)) {
      navigator.share({ title: title, text: text, url: url }).catch(function () {});
    } else {
      openShareDialog(url, text, title);
    }
  });

  /* ---------- 3. Mobile "Fund the Appeal" bar ---------- */
  function addAppealBar() {
    if (APPEAL.showMobileBar === false) return;
    if (/^(appeal\/|support\/)/.test(HERE)) return;
    try { if (sessionStorage.getItem('jl-appeal-bar-closed') === '1') return; } catch (e) {}
    var bar = el('div', 'jl-appeal-bar');
    bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Fund the Appeal');
    bar.innerHTML = '<div class="jab-text"><strong>Fund the Appeal</strong>' + money(APPEAL.goal || 70000) + ' to start over from square one</div>' +
      '<a class="btn-signal" href="' + ROOT + 'appeal/index.html">Give</a>' +
      '<button type="button" class="jab-close" aria-label="Hide this bar">&times;</button>';
    bar.querySelector('.jab-close').addEventListener('click', function () {
      bar.remove(); document.body.classList.remove('has-appeal-bar');
      try { sessionStorage.setItem('jl-appeal-bar-closed', '1'); } catch (e) {}
    });
    document.body.appendChild(bar);
    document.body.classList.add('has-appeal-bar');
  }

  /* ---------- 4. Newsletter routing ---------- */
  var NL = CFG.newsletter || {};
  function nlReady() { return NL.provider === 'embed' && !!NL.embedAction; }
  function nlBody(email, name) {
    var fd = new FormData();
    fd.append(NL.emailField || 'email', email);
    if (name && NL.nameField) fd.append(NL.nameField, name);
    var x = NL.extraFields || {};
    Object.keys(x).forEach(function (k) { fd.append(k, x[k]); });
    return fd;
  }
  function nlSend(email, name) {
    return fetch(NL.embedAction, { method: 'POST', mode: 'no-cors', body: nlBody(email, name) });
  }
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.matches || !nlReady()) return;
    if (form.matches('form.newsletter-form, form[data-newsletter]')) {
      e.preventDefault(); e.stopPropagation();
      var email = (form.querySelector('[name=email]') || {}).value || '';
      var name = (form.querySelector('[name=name]') || {}).value || '';
      var msg = form.querySelector('.form-msg') || (form.parentElement && form.parentElement.querySelector('.form-msg'));
      var btn = form.querySelector('[type=submit]'); if (btn) btn.disabled = true;
      nlSend(email, name).then(function () {
        if (msg) { msg.textContent = NL.successMessage || 'Thank you.'; msg.classList.add('show'); msg.classList.remove('err'); }
        form.reset(); track('sign_up', { method: 'newsletter' });
      }).catch(function () {
        if (msg) { msg.textContent = 'Could not reach the newsletter service. Please try again in a moment.'; msg.classList.add('show', 'err'); }
      }).then(function () { if (btn) btn.disabled = false; });
      return;
    }
    /* Story form: "Would you like to join our email list?" = Yes */
    var join = form.querySelector('[name=join_list]');
    var em = form.querySelector('[name=email]');
    if (join && em && /^yes$/i.test(join.value) && em.value) {
      var nm = form.querySelector('[name=name]');
      nlSend(em.value, nm ? nm.value : '').catch(function () {});
      track('sign_up', { method: 'story_form' });
    }
  }, true);

  /* ---------- 5. Analytics for the appeal ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="appeal/"]');
    if (a) track('appeal_click', { link_text: (a.textContent || '').trim().slice(0, 60), page: HERE || 'home' });
  });

  function start() { paintAppeal(); addShareBar(); addAppealBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
