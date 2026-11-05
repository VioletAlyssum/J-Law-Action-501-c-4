/* =====================================================================
   JennifersLaw.org — Support page giving widget (Oct 19, 2026)
   Reads window.JL_DONATE from donate-config.js. Every account detail lives
   there; nothing in this file needs to change when accounts are added.
   ===================================================================== */
(function () {
  'use strict';
  var CFG = window.JL_DONATE;
  var root = document.getElementById('give');
  if (!CFG || !root) return;
  var panel = document.getElementById('give-panel');
  var choices = root.querySelectorAll('.give-choice');

  /* ---------- small helpers ---------- */
  function h(tag, attrs, html) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    if (html != null) el.innerHTML = html;
    return el;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]; }); }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  /* Email privacy (Oct 19, 2026): no address is ever written into the page. contactLink() gives the
     one-click "Email Jennifer's Law" button (the address is assembled by the reveal script in the page);
     revealAddr() hides any other address (receipts, Zelle) behind the same one-click reveal. */
  function contactLink(subject) { return '<button type="button" class="jl-email" data-subject="' + esc(subject) + '">Email Jennifer\u2019s Law Action</button>'; }
  function revealAddr(addr, label) { return '<button type="button" class="jl-email" data-e="' + esc(String(addr).split('').reverse().join('')) + '">' + esc(label || 'Show the email address') + '</button>'; }
  /* Pages outside /support/ (the Appeal page) say where the thank-you page is with data-thanks. */
  function thankYou(fund, extra) { return (root.getAttribute('data-thanks') || CFG.thankYouPage || 'thank-you.html') + '?fund=' + fund + (extra || ''); }

  /* ---------- what each fund offers ---------- */
  var METHODS = [
    { id: 'card',   label: 'Credit or debit card', sub: 'Also Apple Pay and Google Pay' },
    { id: 'bank',   label: 'Bank transfer',        sub: 'ACH from a checking account' },
    { id: 'paypal', label: 'PayPal',               sub: 'PayPal account, or any card through PayPal' },
    { id: 'venmo',  label: 'Venmo',                sub: 'One-time gifts' },
    { id: 'zelle',  label: 'Zelle',                sub: "From your own bank's app" }
  ];

  function fundOpen(key) {
    var f = CFG.funds[key];
    if (key === 'foundation') return f.irsStatus !== 'forming';
    if (key === 'action') return f.status !== 'forming';
    return true;
  }

  function cardRail(key) { return key === 'jennifer' ? 'stripe' : 'zeffy'; }

  function enabled(key, m, freq) {
    var f = CFG.funds[key];
    if (!fundOpen(key)) return false;
    if (m === 'card' || m === 'bank') {
      if (cardRail(key) === 'stripe') return !!(f.stripe && (f.stripe.enabled || (freq === 'once' && f.stripe.paymentLinkOnce)));
      return !!(f.zeffy && (f.zeffy.formUrl || f.zeffy.embedUrl));
    }
    if (m === 'paypal') return !!(f.paypal && f.paypal.donateUrl);
    if (m === 'venmo') {
      if (!f.venmo) return false;
      return f.venmo.mode === 'profile' ? !!f.venmo.username : !!f.venmo.paypalClientId;
    }
    if (m === 'zelle') return !!(f.zelle && f.zelle.recipient);
    return false;
  }

  /* What each option costs the recipient (shown for transparency). */
  function cost(key, m) {
    if (m === 'zelle') return 'Fee to us: none';
    if (key === 'jennifer') {
      return ({ card: 'Fee to us: 2.9% + 30¢', bank: 'Fee to us: 0.8%, never more than $5', paypal: 'Fee to us: 2.89% + 49¢', venmo: 'Fee to us: none from a bank or debit card' })[m];
    }
    return ({ card: 'Fee to us: none', bank: 'Fee to us: none', paypal: key === 'foundation' ? 'Fee to us: 1.99% to 2.89% + 49\u00a2' : 'Fee to us: 2.89% + 49\u00a2', venmo: 'Fee to us: about 3% + 49\u00a2' })[m];
  }

  function monthlyNote(key, m) {
    if (m === 'venmo') return 'Venmo gifts are one-time only. For a monthly gift, choose a card, a bank transfer, or PayPal.';
    if (m === 'zelle') return "Zelle has no monthly option of its own, but many banks let you schedule a repeating Zelle payment in your banking app.";
    if (m === 'paypal') return 'On PayPal’s page, check “Make this a monthly donation.”';
    return '';
  }

  /* ---------- state ---------- */
  var state = { fund: null, freq: 'once', method: null, amount: null };

  /* ---------- disclosures ---------- */
  function disclosure(key) {
    var f = CFG.funds[key], out = [];
    if (key === 'jennifer') {
      out.push('A gift here is a personal gift to Jennifer Canali. It pays for her appeal and the costs of her own cases, so she can keep doing this work. It is not a charitable donation, it is not tax-deductible, and it does not go to Jennifer’s Law Foundation or Jennifer’s Law Action.');
    } else if (key === 'foundation') {
      var id = esc(f.legalName) + ' is a ' + esc(f.state) + ' nonprofit corporation' + (f.ein ? ' (EIN ' + esc(f.ein) + ')' : '') + '.';
      if (f.irsStatus === 'recognized') {
        out.push(id + ' The Internal Revenue Service has recognized it as exempt from federal income tax under section 501(c)(3) of the Internal Revenue Code' + (f.irsRecognizedDate ? ' (determination dated ' + esc(f.irsRecognizedDate) + ')' : '') + '. Gifts are tax-deductible to the extent allowed by law. No goods or services are provided in exchange for a gift.');
      } else if (f.irsStatus === 'pending') {
        out.push(id + ' Its application for recognition of exemption under section 501(c)(3) of the Internal Revenue Code is pending. When the IRS grants recognition, it applies back to the date the Foundation was formed' + (f.formationDate ? ', ' + esc(f.formationDate) : '') + ', and gifts made since then are tax-deductible to the extent allowed by law. No goods or services are provided in exchange for a gift.');
      } else {
        out.push('Jennifer’s Law Foundation is being incorporated as a Texas nonprofit corporation and will apply to the IRS for recognition under section 501(c)(3) of the Internal Revenue Code. Online giving opens as soon as it has its EIN and its own bank account.');
      }
      if (f.illinoisCharityNumber) out.push('Registered with the Illinois Attorney General’s Charitable Trust Bureau, No. ' + esc(f.illinoisCharityNumber) + '.');
      if (f.receiptsEmail) out.push('For a receipt for a gift made by Zelle or check, email your name, mailing address, and the amount to the Foundation: ' + revealAddr(f.receiptsEmail) + '.');
      if (f.extraDisclosure) out.push(esc(f.extraDisclosure));
    } else {
      var id2 = esc(f.legalName) + ' is a ' + esc(f.state) + ' nonprofit corporation organized under section 501(c)(4) of the Internal Revenue Code' + (f.ein ? ' (EIN ' + esc(f.ein) + ')' : '') + '.';
      if (f.status === 'forming') {
        out.push('Jennifer’s Law Action is being incorporated as a Texas nonprofit corporation under section 501(c)(4) of the Internal Revenue Code. Online giving opens as soon as it has its EIN and its own bank account.');
      } else {
        out.push(id2 + ' Contributions or gifts to Jennifer’s Law Action are not deductible as charitable contributions for federal income tax purposes. Jennifer’s Law Action may use contributions for lobbying and for public campaigns concerning the reappointment and retention of judges.');
      }
      if (f.illinoisCommittee) out.push('Its Illinois retention campaign is conducted through ' + esc(f.illinoisCommittee) + ', registered with the Illinois State Board of Elections.');
      if (f.receiptsEmail) out.push('For an acknowledgment of a gift made by Zelle or check, email Jennifer\u2019s Law Action: ' + revealAddr(f.receiptsEmail) + '.');
      if (f.extraDisclosure) out.push(esc(f.extraDisclosure));
    }
    return out.map(function (p) { return '<p>' + p + '</p>'; }).join('');
  }

  /* ---------- amount picker ---------- */
  function amountPicker(onChange) {
    var wrap = h('div', { class: 'gp-amounts' });
    var list = (CFG.amounts && CFG.amounts[state.freq]) || [50, 100, 250, 1000];
    var group = h('div', { class: 'gp-chips', role: 'group', 'aria-label': 'Gift amount' });
    var other = h('input', { class: 'f-input gp-other', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Other amount in dollars', placeholder: 'Other amount' });
    var msg = h('p', { class: 'gp-msg', role: 'status' });
    function select(v, fromChip) {
      state.amount = v;
      group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.v) === v && fromChip)); });
      msg.textContent = '';
      if (v && v > CFG.maxOnlineGift) {
        msg.innerHTML = 'For a gift above ' + money(CFG.maxOnlineGift) + ', please see <a href="#major">Major gifts and grants</a>, which lists the lower-cost ways to give a larger amount.';
      }
      onChange && onChange(v);
    }
    list.forEach(function (v) {
      var b = h('button', { type: 'button', class: 'gp-chip', 'data-v': String(v), 'aria-pressed': 'false' });
      b.textContent = money(v) + (state.freq === 'monthly' ? '/mo' : '');
      b.addEventListener('click', function () { other.value = ''; select(v, true); });
      group.appendChild(b);
    });
    other.addEventListener('input', function () {
      var v = parseFloat(other.value.replace(/[^0-9.]/g, ''));
      select(isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null, false);
    });
    wrap.appendChild(group); wrap.appendChild(other); wrap.appendChild(msg);
    if (state.amount) {
      var match = group.querySelector('[data-v="' + state.amount + '"]');
      if (match) match.setAttribute('aria-pressed', 'true'); else other.value = state.amount;
    }
    return wrap;
  }
  function validAmount() {
    var a = state.amount;
    return a && a >= 1 && a <= CFG.maxOnlineGift;
  }

  /* ---------- step renderers ---------- */
  function stepStripe(key, f, box) {
    var m = state.method;
    box.appendChild(h('p', { class: 'gp-lead' }, 'Choose an amount' + (state.freq === 'monthly' ? ' to give each month' : '') + '.'));
    box.appendChild(amountPicker());
    var go = h('button', { type: 'button', class: 'btn-chrome gp-go' });
    go.textContent = m === 'bank' ? 'Continue to secure bank checkout' : 'Continue to secure checkout';
    var out = h('p', { class: 'gp-msg', role: 'status' });
    go.addEventListener('click', function () {
      out.textContent = '';
      if (!validAmount()) { out.textContent = state.amount > CFG.maxOnlineGift ? 'That amount is above the online limit; please see Major gifts and grants below.' : 'Please choose or enter an amount.'; return; }
      if (location.protocol === 'file:') { out.textContent = 'Checkout works only on the live site, not on a page opened from disk.'; return; }
      var useLink = !f.stripe.enabled && state.freq === 'once' && f.stripe.paymentLinkOnce;
      if (useLink) { location.href = f.stripe.paymentLinkOnce; return; }
      go.disabled = true; go.textContent = 'Opening secure checkout…';
      fetch(f.stripe.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ fund: key, amount: state.amount, frequency: state.freq, method: m })
      }).then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (j) {
          if (j && j.url) { location.href = j.url; return; }
          if (f.stripe.paymentLinkOnce && state.freq === 'once') { location.href = f.stripe.paymentLinkOnce; return; }
          throw new Error((j && j.message) || 'unavailable');
        })
        .catch(function (e) {
          go.disabled = false; go.textContent = m === 'bank' ? 'Continue to secure bank checkout' : 'Continue to secure checkout';
          out.innerHTML = 'Secure checkout could not be opened just now' + (e && e.message && e.message !== 'unavailable' ? ' (' + esc(e.message) + ')' : '') + '. Please try again in a moment, or give by Zelle or PayPal.';
        });
    });
    box.appendChild(go); box.appendChild(out);
    var fine = 'Checkout is hosted by Stripe; card and bank details never pass through this site.' + (m === 'bank' ? ' For a larger gift, a bank transfer costs Jennifer far less than a card, because Stripe’s fee on a bank transfer never exceeds $5.' : '');
    if (state.freq === 'monthly' && f.stripe.manageMonthlyUrl) fine += ' To change or cancel a monthly gift later, use <a href="' + esc(f.stripe.manageMonthlyUrl) + '">Manage my monthly gift</a>.';
    box.appendChild(h('p', { class: 'gp-fine-inline' }, fine));
  }

  function stepZeffy(key, f, box) {
    var where = f.zeffy.embedUrl ? 'below' : 'on the next page';
    box.appendChild(h('p', { class: 'gp-lead' }, 'Complete your gift on the secure Zeffy form ' + where + (state.freq === 'monthly' ? ', and choose “Monthly” on the form.' : '.')));
    if (f.zeffy.embedUrl) {
      var fr = h('div', { class: 'gp-embed' });
      fr.appendChild(h('iframe', { title: 'Secure donation form for ' + f.name + ', powered by Zeffy', src: f.zeffy.embedUrl, loading: 'lazy', allowpaymentrequest: '', allowtransparency: 'true' }));
      box.appendChild(fr);
      if (f.zeffy.formUrl) box.appendChild(h('p', { class: 'gp-fine-inline' }, 'Prefer a full page? <a href="' + esc(f.zeffy.formUrl) + '" target="_blank" rel="noopener">Open the secure form in a new tab</a>.'));
    } else {
      var a = h('a', { class: 'btn-chrome gp-go', href: f.zeffy.formUrl });
      a.textContent = 'Continue to the secure form';
      box.appendChild(a);
    }
    box.appendChild(h('p', { class: 'gp-fine-inline' }, 'Zeffy charges ' + esc(f.shortName) + ' nothing, so every dollar you give arrives. At checkout Zeffy asks whether you would like to add an optional tip to Zeffy itself; you can change that tip to $0.'));
  }

  function stepPayPal(key, f, box) {
    box.appendChild(h('p', { class: 'gp-lead' }, 'You will finish on PayPal’s secure page, where you can give from a PayPal account or with any debit or credit card, no PayPal account needed.' + (state.freq === 'monthly' ? ' ' + monthlyNote(key, 'paypal') : '')));
    var a = h('a', { class: 'btn-chrome gp-go', href: f.paypal.donateUrl });
    a.textContent = 'Continue to PayPal';
    box.appendChild(a);
  }

  function stepVenmo(key, f, box) {
    if (state.freq === 'monthly') {
      box.appendChild(h('p', { class: 'gp-lead' }, monthlyNote(key, 'venmo')));
      return;
    }
    if (f.venmo.mode === 'profile') {
      box.appendChild(h('p', { class: 'gp-lead' }, 'Choose an amount, then send it to <strong>@' + esc(f.venmo.username) + '</strong> in Venmo.'));
      box.appendChild(amountPicker());
      var row = h('div', { class: 'gp-pay-row' });
      var a = h('a', { class: 'btn-chrome gp-go', href: 'https://venmo.com/u/' + encodeURIComponent(f.venmo.username), target: '_blank', rel: 'noopener' });
      a.textContent = 'Open Venmo';
      row.appendChild(a);
      if (f.venmo.qrImage) row.appendChild(h('img', { class: 'gp-qr', src: f.venmo.qrImage, alt: 'Venmo QR code for @' + f.venmo.username, width: '150', height: '150' }));
      box.appendChild(row);
      box.appendChild(h('p', { class: 'gp-fine-inline' }, 'On a computer, scan the code with your phone. Please check that the name shown in Venmo is ' + esc(f.recipient) + ' before you send.'));
      return;
    }
    /* Venmo through PayPal's "Pay with Venmo" button, paid into the fund's own PayPal account */
    box.appendChild(h('p', { class: 'gp-lead' }, 'Choose an amount, then tap the Venmo button.'));
    box.appendChild(amountPicker());
    var holder = h('div', { class: 'gp-venmo-btn' });
    var msg = h('p', { class: 'gp-msg', role: 'status' });
    box.appendChild(holder); box.appendChild(msg);
    box.appendChild(h('p', { class: 'gp-fine-inline' }, 'Venmo opens in the Venmo app on a phone; on a computer it shows a code to scan with your phone. Venmo is available to donors in the United States.'));
    loadPayPal(f.venmo.paypalClientId, 'jlPayPal_' + key, function (pp) {
      if (!pp || !pp.Buttons) { msg.textContent = 'Venmo could not be loaded just now. Please try again, or give through PayPal.'; return; }
      var btn = pp.Buttons({
        fundingSource: pp.FUNDING.VENMO,
        style: { color: 'blue', shape: 'rect', height: 48, label: 'pay' },
        createOrder: function (d, actions) {
          if (!validAmount()) { msg.textContent = 'Please choose or enter an amount first.'; return Promise.reject(new Error('amount')); }
          msg.textContent = '';
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: 'USD', value: Number(state.amount).toFixed(2) }, description: 'Gift to ' + f.recipient }],
            application_context: { shipping_preference: 'NO_SHIPPING', brand_name: f.recipient, user_action: 'PAY_NOW' }
          });
        },
        onApprove: function (d, actions) {
          return actions.order.capture().then(function () { location.href = thankYou(key, '&via=venmo'); });
        },
        onError: function () { msg.textContent = 'Venmo did not complete the gift. Nothing was charged; please try again or give through PayPal.'; }
      });
      if (btn.isEligible && !btn.isEligible()) { msg.textContent = 'Venmo is not available in this browser. On a phone with the Venmo app it appears here; otherwise, please give through PayPal.'; return; }
      btn.render(holder);
    });
  }

  function stepZelle(key, f, box) {
    var z = f.zelle;
    var lead = 'Open your bank’s app, choose Zelle, and send your gift to the address below.';
    if (state.freq === 'monthly') lead += ' ' + monthlyNote(key, 'zelle');
    box.appendChild(h('p', { class: 'gp-lead' }, lead));
    var card = h('div', { class: 'gp-zelle' });
    var info = h('div');
    info.appendChild(h('p', { class: 'gp-zelle-k' }, 'Send to'));
    var line = h('p', { class: 'gp-zelle-v' });
    if (String(z.recipient).indexOf('@') > -1) line.appendChild(h('span', null, revealAddr(z.recipient, 'Show the Zelle email address')));
    else line.appendChild(h('span', { text: z.recipient }));
    var copy = h('button', { type: 'button', class: 'gp-copy' }); copy.textContent = 'Copy';
    copy.addEventListener('click', function () {
      function done() { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(z.recipient).then(done, done);
      else { var t = h('textarea'); t.value = z.recipient; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
    });
    line.appendChild(copy);
    info.appendChild(line);
    if (z.displayName) { info.appendChild(h('p', { class: 'gp-zelle-k' }, 'Zelle will show the name')); info.appendChild(h('p', { class: 'gp-zelle-v', text: z.displayName })); }
    card.appendChild(info);
    if (z.qrImage) card.appendChild(h('img', { class: 'gp-qr', src: z.qrImage, alt: 'Zelle QR code for ' + f.recipient, width: '150', height: '150' }));
    box.appendChild(card);
    box.appendChild(h('p', { class: 'gp-fine-inline' }, 'Zelle moves money from your bank to ours with no fee to either of us. Send only to the exact address shown here, because a Zelle payment cannot be reversed. Your bank sets how much you can send in a day; for a larger gift, see <a href="#major">Major gifts and grants</a>.'));
  }

  /* ---------- PayPal SDK loader (one namespace per fund, so each fund's money goes to its own account) ---------- */
  var ppLoading = {};
  function loadPayPal(clientId, ns, cb) {
    if (window[ns]) return cb(window[ns]);
    if (ppLoading[ns]) { ppLoading[ns].push(cb); return; }
    ppLoading[ns] = [cb];
    var s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(clientId) + '&currency=USD&intent=capture&components=buttons&enable-funding=venmo';
    s.setAttribute('data-namespace', ns);
    s.async = true;
    s.onload = function () { ppLoading[ns].forEach(function (f) { f(window[ns]); }); ppLoading[ns] = null; };
    s.onerror = function () { ppLoading[ns].forEach(function (f) { f(null); }); ppLoading[ns] = null; };
    document.head.appendChild(s);
  }

  /* ---------- panel ---------- */
  function renderPanel() {
    var key = state.fund, f = CFG.funds[key];
    panel.innerHTML = '';
    panel.hidden = false;
    panel.setAttribute('aria-labelledby', 'gc-' + key);

    var head = h('div', { class: 'gp-head' });
    head.appendChild(h('h3', { class: 'gp-title', text: root.getAttribute('data-fund-title') || f.name }));
    var tax = key === 'jennifer' ? 'Personal gift · Not tax-deductible'
      : key === 'foundation' ? (f.irsStatus === 'recognized' ? '501(c)(3) · Tax-deductible' : f.irsStatus === 'pending' ? '501(c)(3) · IRS recognition pending' : '501(c)(3) · Being incorporated')
      : (f.status === 'forming' ? '501(c)(4) · Being incorporated' : '501(c)(4) · Not tax-deductible');
    head.appendChild(h('p', { class: 'gp-tax', text: tax }));
    panel.appendChild(head);

    if (!fundOpen(key)) {
      panel.appendChild(h('div', { class: 'gp-notice' },
        '<p>' + esc(f.name) + ' is being incorporated in Texas. Online giving opens as soon as it has its EIN and its own bank account.</p>' +
        '<p>' + contactLink('Founding gift — ' + f.name) + '</p>'));
      panel.appendChild(h('div', { class: 'gp-fine' }, disclosure(key)));
      return;
    }

    /* frequency */
    var freq = h('div', { class: 'gp-freq', role: 'radiogroup', 'aria-label': 'How often' });
    [['once', 'One-time'], ['monthly', 'Monthly']].forEach(function (p) {
      var b = h('button', { type: 'button', role: 'radio', class: 'gp-freq-btn', 'aria-checked': String(state.freq === p[0]) });
      b.textContent = p[1];
      b.addEventListener('click', function () { if (state.freq !== p[0]) { state.freq = p[0]; state.amount = null; renderPanel(); } });
      freq.appendChild(b);
    });
    panel.appendChild(freq);

    /* methods */
    panel.appendChild(h('p', { class: 'gp-lead gp-how' }, 'How would you like to give?'));
    var grid = h('div', { class: 'gp-methods' });
    var anyOn = false;
    METHODS.forEach(function (m) {
      var on = enabled(key, m.id, state.freq);
      anyOn = anyOn || on;
      var b = h('button', { type: 'button', class: 'gp-method', 'data-m': m.id, 'aria-pressed': String(state.method === m.id) });
      if (!on) { b.disabled = true; b.classList.add('off'); }
      b.innerHTML = '<span class="gm-label">' + m.label + '</span><span class="gm-sub">' + (on ? m.sub : 'Opening soon') + '</span>' + (on ? '<span class="gm-cost">' + cost(key, m.id) + '</span>' : '');
      b.addEventListener('click', function () { state.method = m.id; renderPanel(); var s = panel.querySelector('.gp-step'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
      grid.appendChild(b);
    });
    panel.appendChild(grid);

    if (!anyOn) {
      panel.appendChild(h('div', { class: 'gp-notice' }, '<p>Online giving to ' + esc(f.shortName === 'Jennifer' ? 'Jennifer' : f.name) + ' opens as soon as the accounts are verified. In the meantime, you will receive instructions personally.</p><p>' + contactLink('Gift — ' + f.name) + '</p>'));
    }

    /* step for the chosen method */
    if (state.method && enabled(key, state.method, state.freq)) {
      var box = h('div', { class: 'gp-step', 'aria-live': 'polite' });
      var m = state.method;
      if (m === 'card' || m === 'bank') (cardRail(key) === 'stripe' ? stepStripe : stepZeffy)(key, f, box);
      else if (m === 'paypal') stepPayPal(key, f, box);
      else if (m === 'venmo') stepVenmo(key, f, box);
      else if (m === 'zelle') stepZelle(key, f, box);
      panel.appendChild(box);
    } else if (state.method) {
      state.method = null;
    }

    panel.appendChild(h('div', { class: 'gp-fine' }, disclosure(key)));
  }

  function choose(key, scroll) {
    if (!CFG.funds[key]) return;
    if (state.fund !== key) { state.method = null; state.amount = null; }
    state.fund = key;
    choices.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.fund === key)); c.classList.toggle('active', c.dataset.fund === key); });
    renderPanel();
    try { history.replaceState(null, '', '#' + key); } catch (e) {}
    if (scroll) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  choices.forEach(function (c) {
    c.addEventListener('click', function () { choose(c.dataset.fund, true); });
    /* keep the tax line on each card in step with the settings */
    var t = c.querySelector('.gc-tax'), k = c.dataset.fund, f = CFG.funds[k];
    if (!t || !f) return;
    if (k === 'foundation') t.textContent = f.irsStatus === 'recognized' ? 'Tax-deductible to the extent allowed by law' : f.irsStatus === 'pending' ? 'Tax-deductible once IRS recognition is granted' : 'Being incorporated \u00b7 Opening soon';
    if (k === 'action') t.textContent = f.status === 'forming' ? 'Being incorporated \u00b7 Opening soon' : 'Not tax-deductible';
  });

  /* Deep links: support/#jennifer, #foundation, #action (or ?fund=...) open that fund directly. */
  var want = (location.hash || '').replace('#', '');
  var q = /[?&]fund=([a-z]+)/.exec(location.search);
  if (q) want = q[1];
  if (CFG.funds[want]) choose(want, true);
  /* A page with one fund (the Appeal page) opens it straight away: <div id="give" data-default-fund="jennifer">. */
  else if (CFG.funds[root.getAttribute('data-default-fund')]) choose(root.getAttribute('data-default-fund'), false);
  window.addEventListener('hashchange', function () {
    var k = (location.hash || '').replace('#', '');
    if (CFG.funds[k] && k !== state.fund) choose(k, true);
  });
})();
