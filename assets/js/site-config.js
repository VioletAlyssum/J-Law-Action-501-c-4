/* =====================================================================
   JenniferslawAction.org — SITE SETTINGS
   The ONE file to edit when the email address or newsletter service changes.
   THIS FILE IS PUBLIC. Never put a password, an API key, or a bank number here.
   ===================================================================== */
window.JL_CONFIG = {

  /* The live address of the site, no trailing slash. Used for share links. */
  siteUrl: 'https://www.jenniferslawaction.org',

  /* Google Analytics: create a SEPARATE property for this site and paste its
     Measurement ID here (looks like G-XXXXXXXXXX). Leave blank for none. */
  analyticsId: '',                   // TODO

  /* EMAIL: every "Email Jennifer's Law Action" button and every form on this site
     delivers here. To switch to the business email, change the two halves, e.g.
        user: 'action', domain: 'jenniferslawaction.org'
     then send one test message from the Contact page and click FormSubmit's
     activation link in that inbox. */
  email: {
    user:   'JennifersLaw.org',      // TODO at launch
    domain: 'gmail.com'              // TODO at launch
  },

  /* NEWSLETTER: see the notes in JennifersLaw.org's site-config.js. Set provider
     to 'embed' and paste the email service's form action to use a real list. */
  newsletter: {
    provider: 'formsubmit',
    embedAction: '',
    emailField: 'email',
    nameField: 'name',
    extraFields: {},
    successMessage: 'Thank you. Please check your inbox to confirm your subscription.'
  },

  /* The Appeal Fund bar belongs to JennifersLaw.org; it stays off here. */
  appeal: { showMobileBar: false }
};
