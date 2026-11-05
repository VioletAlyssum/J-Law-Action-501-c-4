# Petitions — setup on Hostinger (moved from JennifersLaw.org, November 2026)

The petitions live on this site (`/petitions/`, plus the national petition, The People's Demand,
on the homepage and `the-demand.html`), so they never expire or close.
Signatures are posted to `api/petition-sign.php`, which needs no third-party service.

## What happens automatically
- On the first signature, the script creates `jl-data/petitions.sqlite` ONE LEVEL ABOVE `public_html`
  (for example `/home/uXXXXXXXXX/domains/jenniferslawaction.org/jl-data/`). Nothing in it is reachable over the web.
- One signature per email address per petition. Email addresses are never shown publicly and are never delivered.
- Signers may tick "Keep me updated about this campaign by email" (column `wants_updates` in the full export).

## What needs to be done once
1. Put a `.env` file above `public_html` (see `.env.example`) with `PETITION_ADMIN_KEY` and `PETITION_SALT`
   (two different long random strings).
2. Upload the whole site, including `api/petition-sign.php` and `api/.htaccess`.

## Getting the signatures
- Everything, with emails (for your records and the email list):
  `https://www.jenniferslawaction.org/api/petition-sign.php?export=all&key=YOUR_ADMIN_KEY`
- **For delivery to the judges or legislators a petition is addressed to** (names, cities, states and
  comments only, never emails): add `&delivery=1`, e.g.
  `...?export=judge-robert-w-rohm&key=YOUR_ADMIN_KEY&delivery=1`
- Deliver the reappointment petitions (Rohm, Schwartz, Chapman, Bugos; Cook: Flores, Hanlon) before the
  2027 ballots go out (no later than May 21, 2027).
- People who ticked the updates box: filter `wants_updates = 1` in the full export and import them into the
  newsletter service.

## Adding or removing a petition
Add or remove the slug in `PETITION_SLUGS` in `_site-tools/build_action_site.py` AND in `JL_PETITIONS` in
`api/petition-sign.php`, add the page in `petitions/`, then run `python3 _site-tools/build_action_site.py`.

## Before any retention-election spending
Spending money to oppose a judge in a retention election can require registering a political committee
with the Illinois State Board of Elections once spending passes the state threshold. Check before 2028.
`donate-config.js` has an `illinoisCommittee` setting for the required notice once registered.
