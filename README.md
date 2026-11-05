# JenniferslawAction.org

The website of **Jennifer's Law Action**, the 501(c)(4) campaign for judicial accountability:
the People's Demand (national petition), the petitions to the people who decide whether judges
keep their seats, the 2027 reappointment vote, and the legislative campaign to end judicial immunity.

It is a separate site from **JennifersLaw.org** (Jennifer's Law Foundation, 501(c)(3)), which
publishes the documented record and the research. The two share one look; this site links to the
record, and JennifersLaw.org links only to this site's homepage.

## Editing
- Pages are built by `python3 _site-tools/build_action_site.py` (menu, footer and new pages live there;
  petition pages keep their own content and are re-wrapped in the current menu and footer).
- Settings: `assets/js/site-config.js` (email address, newsletter service, analytics ID) and
  `assets/js/donate-config.js` (Action's payment accounts).
- Petitions: see `PETITIONS-SETUP.md`.
- Share images: `node _site-tools/share-images/make.js`.

Upload everything **except** `_site-tools/`, `README.md` and `PETITIONS-SETUP.md`
(the `.htaccess` refuses to serve them anyway).
