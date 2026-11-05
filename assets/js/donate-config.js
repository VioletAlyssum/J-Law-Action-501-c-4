/* =====================================================================
   JenniferslawAction.org — DONATION SETTINGS
   ---------------------------------------------------------------------
   This is the ONLY file that changes when the payment accounts are ready.
   Every value marked TODO is a placeholder. While a value is empty (''),
   that payment option shows "Opening soon" on the Support page instead of
   a broken button, so the page is always safe to publish.

   THIS FILE IS PUBLIC. Anyone can read it in a browser.
   Never put any of these here:
     - a bank account number or routing number
     - a password, a Stripe secret key (sk_live_...), or a PayPal secret
     - a home address, a personal phone number, or a birthdate
   Secret keys go ONLY in the .env file above public_html (see .env.example).

   Fund keys: 'jennifer'   = personal gift to Jennifer Canali
              'foundation' = Jennifer's Law Foundation, 501(c)(3), education
              'action'     = Jennifer's Law Action, 501(c)(4), campaigns
   Set up by Claude on October 19, 2026. Report with the full checklist:
   "_ Build Website/_ Reports - October 2026/2026-10-19 - Donations Setup Checklist.docx"
   ===================================================================== */
window.JL_DONATE = {

  /* Contact for major gifts, briefings, receipts and wire instructions: the page shows an
     "Email Jennifer's Law" button, and one click reveals the address (Jennifer's rule, Oct 19, 2026:
     the address is never written anywhere on the site, so bots cannot harvest it). It is not stored here.
     Any email address typed into a field below (receipts, Zelle) is also shown only after a click. */

  /* Page every processor returns donors to after a gift (relative to /support/). */
  thankYouPage: 'thank-you.html',

  /* Suggested amounts, in whole dollars. */
  amounts: {
    once:    [25, 50, 100, 250, 500, 1000],   // Nov 2026: lower first amounts for visitors arriving from videos
    monthly: [15, 25, 50, 100, 250]
  },
  /* Largest single online card or bank gift the page will start. Larger gifts
     are routed to "Major gifts" (wire, check, stock, DAF). Keep in step with
     STRIPE_MAX_DOLLARS in .env. */
  maxOnlineGift: 25000,

  funds: {

    /* -----------------------------------------------------------------
       3. JENNIFER'S LAW ACTION — 501(c)(4), campaigns and legislation
       ----------------------------------------------------------------- */
    action: {
      name: "Jennifer\u2019s Law Action",
      shortName: 'Action',
      recipient: "Jennifer\u2019s Law Action",
      legalName: "Jennifer\u2019s Law Action",        // TODO: exactly as on the Texas Certificate of Formation
      state: 'Texas',
      ein: '',                                   // TODO: XX-XXXXXXX
      formationDate: '',                         // TODO
      /* 'forming' = not yet incorporated; 'active' = incorporated, EIN issued, Form 8976 filed */
      status: 'forming',                         // TODO
      receiptsEmail: '',                         // TODO: e.g. action@jenniferslaw.org

      zeffy: {
        formUrl: '',                             // TODO: Zeffy campaign link for Jennifer's Law Action
        embedUrl: ''                             // TODO optional
      },

      paypal: {
        donateUrl: ''                            // TODO
      },

      venmo: {
        mode: 'paypal',                          // a 501(c)(4) cannot have a Venmo charity profile
        paypalClientId: '',                      // TODO: Live Client ID of Action's PayPal REST app
        username: '',
        qrImage: ''
      },

      zelle: {
        recipient: '',                           // TODO: e.g. action@jenniferslaw.org or a Zelle tag
        displayName: '',                         // TODO: e.g. JENNIFERS LAW ACTION
        qrImage: ''
      },

      /* If Action registers an Illinois political committee for a retention campaign,
         put the committee name here; the page then adds the committee notice. */
      illinoisCommittee: '',                     // TODO only if registered (10 ILCS 5/9-1.8)
      extraDisclosure: ''
    }
  }
};
