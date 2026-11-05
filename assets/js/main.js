/* Jennifer's Law Action: navigation, forms and email reveal (same code as JennifersLaw.org). */
/* JennifersLaw.org — global behavior: accessible nav, forms, poll & ranking voting */
(function () {
  'use strict';

  /* ----- Mobile nav toggle ----- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainnav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* ----- Dropdown toggles (keyboard + touch accessible) ----- */
  document.querySelectorAll('.has-dropdown').forEach(function (li) {
    var btn = li.querySelector('.dd-toggle');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = li.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { li.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.has-dropdown.open').forEach(function (li) {
      if (!li.contains(e.target)) {
        li.classList.remove('open');
        var b = li.querySelector('.dd-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ----- Generic AJAX form handling (data-ajax forms) ----- */
  document.querySelectorAll('form[data-ajax]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg') || form.parentElement.querySelector('.form-msg');
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      var fd = new FormData(form);
      /* FormSubmit needs the originating page URL: browsers now default to a
         strict referrer policy, so the Referer header alone is unreliable. */
      if (!fd.has('_url')) fd.append('_url', window.location.href);
      if (location.protocol === 'file:') {
        if (msg) { msg.textContent = 'This form only works on the live site, not on a file opened from disk.'; msg.classList.add('show', 'err'); }
        if (btn) btn.disabled = false;
        return;
      }
      fetch((form.hasAttribute('data-fs') && window.jlAddr ? 'https://formsubmit.co/ajax/' + window.jlAddr() : form.action), { method: 'POST', body: fd, headers: { 'Accept': 'application/json', 'X-Requested-With': 'fetch' } })
        .then(function (r) {
          /* The endpoint returns HTML on some errors; parsing that as JSON threw
             a SyntaxError that surfaced to the user as a bare "Network error". */
          var ct = r.headers.get('content-type') || '';
          if (ct.indexOf('application/json') === -1) {
            return r.text().then(function (t) {
              return { ok: false, message: 'The mail service returned an unexpected response (HTTP ' + r.status + '). If this is the first message ever sent from this form, check the Jennifer’s Law inbox for a FormSubmit activation email and click the link inside it.' };
            });
          }
          return r.json();
        })
        .then(function (data) {
          if (data && typeof data.ok === 'undefined' && typeof data.success !== 'undefined') { data.ok = (data.success === 'true' || data.success === true); if (data.ok && !data.message) data.message = 'Thank you — your submission has been received.'; }
          if (data && data.ok && form.dataset.voteKey) data.message = 'Thank you. Your vote has been recorded.';
          if (msg) {
            msg.textContent = data.message || (data.ok ? 'Thank you.' : 'Something went wrong.');
            msg.classList.add('show');
            msg.classList.toggle('err', !data.ok);
          }
          if (data.ok) form.reset();
          if (data.ok && form.dataset.hideOnSuccess) form.style.display = 'none';
          if (data.ok && form.dataset.voteKey) { try { sessionStorage.setItem('jl-voted-' + form.dataset.voteKey, '1'); } catch (err) {} }
          if (data.results) renderResults(form, data.results);
        })
        .catch(function (err) {
          if (msg) { msg.textContent = 'Could not reach the mail service — please try again. (' + (err && err.message ? err.message : 'network error') + ')'; msg.classList.add('show', 'err'); }
        })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  });

  /* ----- One vote per visit (session) for the poll and the ranking ----- */
  document.querySelectorAll('form[data-vote-key]').forEach(function (form) {
    var voted = false;
    try { voted = sessionStorage.getItem('jl-voted-' + form.dataset.voteKey) === '1'; } catch (err) {}
    if (!voted) return;
    form.style.display = 'none';
    var note = document.createElement('div');
    note.className = 'form-msg show';
    note.setAttribute('role', 'status');
    note.style.textAlign = 'center';
    note.textContent = 'Thank you. Your vote has been recorded for this visit.';
    form.parentNode.insertBefore(note, form.nextSibling);
  });

  /* ----- Render vote results bars ----- */
  window.jlRenderResults = function (hostSelector, results) {
    var host = document.querySelector(hostSelector);
    if (!host) return;
    paintResults(host, results);
  };
  function renderResults(form, results) {
    var host = document.querySelector(form.dataset.resultsTarget || '.vote-results');
    if (!host) return;
    paintResults(host, results);
    if (form.dataset.hideOnSuccess) form.style.display = 'none';
  }
  function paintResults(host, results) {
    var total = results.reduce(function (s, r) { return s + r.votes; }, 0) || 1;
    host.innerHTML = '';
    results.forEach(function (r) {
      var pct = Math.round((r.votes / total) * 100);
      var row = document.createElement('div');
      row.className = 'result-row';
      row.innerHTML =
        '<div class="r-label"><span></span><span>' + pct + '%</span></div>' +
        '<div class="r-bar"><div class="r-fill" style="width:' + pct + '%"></div></div>';
      row.querySelector('.r-label span').textContent = r.label;
      host.appendChild(row);
    });
    host.hidden = false;
  }

  /* ----- Homepage rotating fact bar (auto-rotate + prev/next arrows) ----- */
  var factEl = document.getElementById('factText');
  var citeEl = document.getElementById('factCite');
  if (factEl && citeEl && window.JL_FACTS && window.JL_FACTS.length > 1) {
    var fi = 0, factTimer = null;
    function showFact(i) {
      fi = (i + window.JL_FACTS.length) % window.JL_FACTS.length;
      factEl.style.opacity = 0; citeEl.style.opacity = 0;
      setTimeout(function () {
        factEl.textContent = window.JL_FACTS[fi].t;
        citeEl.textContent = window.JL_FACTS[fi].c;
        factEl.style.opacity = 1; citeEl.style.opacity = 1;
      }, 350);
    }
    var factPaused = false;
    function startFactTimer() {
      if (factTimer) { clearInterval(factTimer); factTimer = null; }
      /* While paused the arrows still work, but they must not silently
         restart the 8s carousel — the pause has to hold until the user says so. */
      if (factPaused) return;
      factTimer = setInterval(function () { showFact(fi + 1); }, 8000);
    }
    var prevBtn   = document.getElementById('factPrev');
    var nextBtn   = document.getElementById('factNext');
    var toggleBtn = document.getElementById('factToggle');
    var toggleIcn = document.getElementById('factToggleIcon');
    var PAUSE_ICON = '<rect x="1" y="1" width="3.4" height="11" rx=".6"></rect><rect x="7.6" y="1" width="3.4" height="11" rx=".6"></rect>';
    var PLAY_ICON  = '<path d="M1.6 1.1 11 6.5 1.6 11.9z"></path>';
    function setFactPaused(paused) {
      factPaused = paused;
      if (toggleIcn) toggleIcn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        toggleBtn.setAttribute('aria-label', paused ? 'Resume the rotating quotes' : 'Pause the rotating quotes');
        toggleBtn.setAttribute('title', paused ? 'Play' : 'Pause');
      }
      startFactTimer();
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { showFact(fi - 1); startFactTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showFact(fi + 1); startFactTimer(); });
    if (toggleBtn) toggleBtn.addEventListener('click', function () { setFactPaused(!factPaused); });
    startFactTimer();
  }
})();
/* nav-flyouts-right-js (Oct 18 2026) */
(function(){
  /* Every flyout opens to the RIGHT of its item. If it would run past the edge of the
     window, the parent dropdown slides left just far enough to make room. */
  function fit(top){
    var dd=top.querySelector(':scope > ul.dropdown'); if(!dd) return;
    dd.style.left='';
    if(window.innerWidth<=960) return;
    var fl=dd.querySelectorAll('ul.flyout'); if(!fl.length) return;
    var w=290; fl.forEach(function(f){ if(f.offsetWidth>w) w=f.offsetWidth; });
    var r=dd.getBoundingClientRect(); var over=r.right+w+14-window.innerWidth;
    if(over>0){ dd.style.left=(-over)+'px'; }
  }
  document.querySelectorAll('.mainnav li.has-dropdown').forEach(function(top){
    if(!top.querySelector('ul.flyout')) return;
    top.addEventListener('mouseenter',function(){fit(top);});
    top.addEventListener('focusin',function(){fit(top);});
  });
})();
/* jl-email-reveal-js (Oct 19 2026) */
(function(){
  /* The address is never written in the page. It is assembled only when a visitor
     clicks "Email Jennifer's Law", so bots that harvest addresses never see it. */
  function jlAddr(){ var c = window.JL_CONFIG && window.JL_CONFIG.email; if (c && c.user && c.domain) return c.user + String.fromCharCode(64) + c.domain; return ['Jennifers','Law','.org'].join('') + String.fromCharCode(64) + ['gm','ail','.c','om'].join(''); }
  window.jlAddr = jlAddr;
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest ? e.target.closest('.jl-email') : null;
    if (!b) return;
    e.preventDefault();
    var enc = b.getAttribute('data-e');
    var a = enc ? enc.split('').reverse().join('') : jlAddr();
    var s = b.getAttribute('data-subject');
    var l = document.createElement('a');
    l.href = 'mailto:' + a + (s ? '?subject=' + encodeURIComponent(s) : '');
    l.textContent = a;
    l.className = (b.className.replace(/\bjl-email\b/, '') + ' jl-email-addr').replace(/\s+/g, ' ').trim();
    b.parentNode.replaceChild(l, b);
    try { l.focus(); } catch (err) {}
  });
})();
