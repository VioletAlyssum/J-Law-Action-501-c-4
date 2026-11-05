#!/usr/bin/env python3
"""
build_action_site.py: builds every page of JenniferslawAction.org.

Run from anywhere:   python3 _site-tools/build_action_site.py
First time only (copies the petitions from the JennifersLaw.org repository):
                     python3 _site-tools/build_action_site.py --import /path/to/jl-website-main-checkout

The look is the same as JennifersLaw.org: the same stylesheet (assets/css/site.css),
header, navigation pattern, footer and components. Only the name, menu and content differ.

Every page = SHELL (head, header, menu, footer, scripts) + its <main>.
  - Pages written here: the PAGES dictionary below.
  - Petition pages and the Reappointment Vote page keep their own <main>; this script
    re-wraps them in the current shell every time it runs, so menu or footer changes
    reach every page.
Afterwards it writes sitemap.xml and robots.txt.
"""
import datetime
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SITE = 'https://www.jenniferslawaction.org'
RECORD = 'https://jenniferslaw.org'          # the Foundation site, where the documented record lives
TODAY = datetime.date.today().isoformat()
NAME = 'Jennifer’s Law Action'

PETITION_SLUGS = [
    'judge-robert-w-rohm', 'judge-david-e-schwartz', 'judge-kenneth-l-popejoy', 'judge-bonnie-m-wheaton',
    'judge-mia-s-mcpherson', 'judge-jennifer-l-barron', 'judge-bryan-s-chapman', 'judge-joseph-t-bugos',
    'judge-charles-s-beach-ii', 'judge-thomas-v-lyons-ii', 'judge-kathy-m-flanagan', 'judge-jerry-a-esrig',
    'judge-toya-t-harvey', 'judge-jack-j-hagerty', 'judge-barbara-n-flores', 'judge-james-e-hanlon-jr',
]

LINK = 'style="color:var(--steel1);border-bottom:1px solid var(--steel3);"'


# ---------------------------------------------------------------- shell
def nav(r):
    return f'''<nav class="mainnav" id="mainnav" aria-label="Main navigation">
      <ul>
        <li><a href="{r}the-demand.html">The Demand</a></li>
        <li class="has-dropdown">
          <a href="{r}petitions/index.html">Petitions</a>
          <ul class="dropdown">
            <li><a href="{r}petitions/index.html">Sign Every Petition</a></li>
            <li><a href="{r}petitions/index.html#dupage">DuPage County</a></li>
            <li><a href="{r}petitions/index.html#cook">Cook County</a></li>
          </ul>
        </li>
        <li><a href="{r}reappointment-vote.html">The Reappointment Vote</a></li>
        <li><a href="{RECORD}/" rel="noopener">The Record</a></li>
        <li class="has-dropdown">
          <a href="{r}about.html">About</a>
          <ul class="dropdown">
            <li><a href="{r}about.html">About {NAME}</a></li>
            <li><a href="{r}contact.html">Contact</a></li>
            <li><a href="{r}privacy.html">Privacy Policy</a></li>
            <li><a href="{r}terms.html">Terms &amp; Conditions</a></li>
          </ul>
        </li>
        <li class="nav-cta"><a href="{r}support/index.html" class="support-btn">Support Action</a></li>
      </ul>
    </nav>'''


def header(r):
    return f'''<a class="skip-link" href="#main">Skip to main content</a>
<div class="grain" aria-hidden="true"></div>

<header class="site-header">
  <div class="wrap masthead">
    <a class="masthead-mark" href="{r}index.html" aria-label="{NAME} — home"><img class="jl-mark" src="{r}assets/img/jl-mark-light.png" alt="JL — Jennifer’s Law monogram"></a>
    <a href="{r}index.html" aria-label="{NAME} — home"><span class="masthead-name">{NAME}</span></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="mainnav" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="wrap header-inner">
    {nav(r)}
  </div>
</header>
'''


def footer(r):
    return f'''<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a href="{r}index.html" class="action-brand"><span class="ab-name">{NAME}</span><span class="ab-line">We, the people, will hold judges accountable.</span></a>
      <p class="ab-note">The documented record of what the judges did, every order and filing in full, is published at <a href="{RECORD}/" rel="noopener">JennifersLaw.org</a>.</p>
    </div>
    <nav aria-label="Footer — Campaign">
      <h2 class="footer-h">Campaign</h2>
      <a href="{r}the-demand.html">The Demand</a>
      <a href="{r}petitions/index.html">Petitions</a>
      <a href="{r}reappointment-vote.html">The Reappointment Vote</a>
      <a href="{r}support/index.html">Support Action</a>
    </nav>
    <nav aria-label="Footer — About">
      <h2 class="footer-h">About</h2>
      <a href="{r}about.html">About {NAME}</a>
      <a href="{r}contact.html">Contact</a>
      <a href="{r}privacy.html">Privacy Policy</a>
      <a href="{r}terms.html">Terms &amp; Conditions</a>
    </nav>
  </div>
  <div class="wrap footer-legal">
    <span>&copy; 2026 {NAME}. All rights reserved.</span>
    <span class="jl-action-note">Paid for by {NAME}. {NAME} is a 501(c)(4) social welfare organization, separate from Jennifer&#8217;s Law Foundation. Contributions to {NAME} are not tax-deductible as charitable contributions.</span>
  </div>
</footer>
'''


def head(r, path, title, desc, image, extra=''):
    t, d = html.escape(title, quote=True), html.escape(desc, quote=True)
    canon = SITE + '/' + re.sub(r'(^|/)index\.html$', r'\1', path)
    robots = '<meta name="robots" content="noindex">\n' if path in ('support/thank-you.html', '404.html') else f'<link rel="canonical" href="{canon}">\n'
    base = '<base href="/">\n' if path == '404.html' else ''
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
{base}<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{t}</title>
<meta name="description" content="{d}">
{robots}<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{NAME}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/assets/img/share/{image}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{SITE}/assets/img/share/{image}.jpg">
<link rel="icon" type="image/png" href="{r}assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{r}assets/css/site.css">
<link rel="stylesheet" href="{r}assets/css/action.css">
<script src="{r}assets/js/site-config.js"></script>
<script src="{r}assets/js/main.js" defer></script>
<script src="{r}assets/js/site.js" defer></script>
{extra}</head>
'''


def page(path, title, desc, main_html, image='default', extra_head=''):
    r = '../' * path.count('/')
    doc = (head(r, path, title, desc, image, extra_head) + '<body>\n' + header(r) +
           '\n<main id="main">\n' + main_html.strip() + '\n</main>\n\n' + footer(r) + '</body>\n</html>\n')
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    open(path, 'w', encoding='utf-8').write(doc)


# ---------------------------------------------------------------- shared pieces
STATS_EXHIBIT = '''<aside class="exhibit-hero" aria-labelledby="ex-sys-h">
      <h2 id="ex-sys-h" class="visually-hidden">Exhibit &mdash; The People v. the System</h2>
      <span class="exhibit-stamp">Exhibit</span>
      <p class="exhibit-title">The People v. the System</p>
      <div class="exhibit-row"><span class="lbl">Misconduct complaints against federal judges, fiscal year 2024</span><span class="val">1,510</span></div>
      <div class="exhibit-row"><span class="lbl">Ended in a censure or reprimand</span><span class="val">3</span></div>
      <div class="exhibit-row"><span class="lbl">Federal judges suspended</span><span class="val red">0</span></div>
      <div class="exhibit-row"><span class="lbl">Requests to investigate Illinois judges, 2024</span><span class="val">556</span></div>
      <div class="exhibit-row"><span class="lbl">Closed without any investigation</span><span class="val red">531</span></div>
      <div class="exhibit-row"><span class="lbl">Illinois associate judges reappointed, 2019 and 2023</span><span class="val">98.9%</span></div>
      <p class="exhibit-note"><em>Sources: Administrative Office of the U.S. Courts, <a href="https://www.uscourts.gov/sites/default/files/2025-02/jb_s22_0930.2024.pdf" target="_blank" rel="noopener" ''' + LINK + '''>Table S-22</a>; Illinois Judicial Inquiry Board, <a href="https://jib.illinois.gov/content/dam/soi/en/web/jib/JIB%20Report%202024.pdf" target="_blank" rel="noopener" ''' + LINK + '''>2024 Annual Report</a>; Administrative Office of the Illinois Courts.</em></p>
    </aside>'''

DEMAND_TEXT = ('To the United States Congress and the legislature of every state: We, the undersigned, demand an end to judicial immunity '
               'and the creation of independent accountability for judges: a standing body of citizens who are neither judges nor lawyers, '
               'with no ties to the courts, answering to a board of citizens, with the power to penalize, suspend, and remove judges who '
               'violate the law or the rights of the people who come before them. No one should have to file another lawsuit, or win the '
               'approval of other judges, for a judge to answer for what the judge did.')


def national_form(fid, r):
    return f'''<form class="pt-form" id="{fid}" data-petition-form data-petitions="peoples-demand" data-api="{r}api/petition-sign.php" novalidate>
  <h2 id="{fid}-h">Sign the People&#8217;s Demand</h2>
  <div class="pt-count" data-count="peoples-demand">&mdash;</div><div class="pt-count-lbl">People have signed</div>
  <label for="{fid}-name">Full name</label><input id="{fid}-name" type="text" name="name" autocomplete="name" required>
  <label for="{fid}-email">Email</label><input id="{fid}-email" type="email" name="email" autocomplete="email" required>
  <div class="pt-row">
    <div><label for="{fid}-city">City</label><input id="{fid}-city" type="text" name="city" autocomplete="address-level2"></div>
    <div><label for="{fid}-state">State</label><input id="{fid}-state" type="text" name="state" autocomplete="address-level1" maxlength="20"></div>
    <div><label for="{fid}-zip">ZIP</label><input id="{fid}-zip" type="text" name="zip" autocomplete="postal-code" maxlength="10"></div>
  </div>
  <label for="{fid}-comment">Why you are signing (optional)</label><textarea id="{fid}-comment" name="comment" maxlength="1000"></textarea>
  <label class="pt-check"><input type="checkbox" name="public" value="1"> Show my name and city on the list of signers.</label>
  <label class="pt-check"><input type="checkbox" name="updates" value="1"> Keep me updated about this campaign by email.</label>
  <div class="pt-hp" aria-hidden="true"><label>Leave this empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
  <input type="hidden" name="t" value="">
  <button type="submit" class="btn-signal" style="width:100%;margin-top:20px;">Add My Name</button>
  <div class="pt-msg" role="status" aria-live="polite"></div>
  <p class="pt-fine">Your email address is never published or shared, and is never given to the people a petition is delivered to. This petition never expires.</p>
</form>'''


def newsletter():
    return '''<section class="section sec-lift" aria-labelledby="stay-h"><div class="wrap">
  <p class="kicker">Updates</p>
  <h2 id="stay-h" class="section-h">Stay Informed</h2>
  <p style="color:var(--muted);font-size:16px;max-width:760px;">Petition deliveries, the reappointment vote, legislative news, and every way to take part &mdash; only when there is something worth your time.</p>
  <form class="newsletter-form nl-row" data-ajax action="https://formsubmit.co/ajax/" data-fs method="post" aria-label="Newsletter signup">
    <input type="hidden" name="_subject" value="JenniferslawAction.org — Newsletter signup"><input type="hidden" name="_template" value="table"><input type="hidden" name="_captcha" value="false">
    <label class="visually-hidden" for="nl-name">Your name</label>
    <input id="nl-name" name="name" type="text" placeholder="Your name" required>
    <label class="visually-hidden" for="nl-email">Your email address</label>
    <input id="nl-email" name="email" type="email" placeholder="Your email address" required>
    <button type="submit" class="btn-chrome join-btn">Subscribe</button>
  </form>
  <div class="form-msg" role="status"></div>
</div></section>'''


# ---------------------------------------------------------------- pages
HOME = '''
<section class="bis-section" aria-labelledby="bis-h">
  <div class="wrap">
    <div class="bis-frame">
      <i class="bfx bfx-o1" aria-hidden="true"></i><i class="bfx bfx-o2" aria-hidden="true"></i><i class="bfx bfx-it" aria-hidden="true"></i><i class="bfx bfx-ib" aria-hidden="true"></i><i class="bfx bfx-il" aria-hidden="true"></i><i class="bfx bfx-ir" aria-hidden="true"></i><i class="bfx bfx-c bfx-tl" aria-hidden="true"></i><i class="bfx bfx-c bfx-tr" aria-hidden="true"></i><i class="bfx bfx-c bfx-bl" aria-hidden="true"></i><i class="bfx bfx-c bfx-br" aria-hidden="true"></i><i class="bfx bfx-f bfx-ft" aria-hidden="true"></i><i class="bfx bfx-f bfx-fb" aria-hidden="true"></i>
      <div class="bis-cartouche">
        <div class="bis-cart-title">The Official Doctrine of the Judiciary</div>
        <div class="bis-cart-div"><span class="r"></span><span class="bis-cart-latin">Auctoritas Est Quod Dico</span><span class="r"></span></div>
      </div>
      <h2 id="bis-h" class="bis-quote"><span class="bis-qmark">&ldquo;</span><span class="chrome">Because I Said So</span><span class="bis-qmark">&rdquo;</span></h2>
      <div class="bis-links">
        <a class="bis-cta" href="the-demand.html">The Demand: End Judicial Immunity and Make Judges Answer to the People &rarr;</a>
        <a class="bis-cta" href="petitions/index.html">Sign the Petitions &rarr;</a>
        <a class="bis-cta" href="reappointment-vote.html">The 2027 Reappointment Vote: You Don&#8217;t Get a Vote. They Do. &rarr;</a>
        <a class="bis-cta" href="''' + RECORD + '''/" rel="noopener">The Record, Every Order and Filing, at JennifersLaw.org &rarr;</a>
      </div>
    </div>
  </div>
</section>

<section class="hero page-hero" style="padding:35px 0;">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 class="page-title hero-two-line"><span class="hl">Judges answer to no one.</span><span class="hl hl-2">We, the people, are going to change that.</span></h1>
      <div class="hero-paras">
        <p class="page-sub" style="font-size:17px;font-style:italic;line-height:1.5;">Jennifer&#8217;s Law Action is the campaign for judicial accountability. It organizes citizens, puts the documented record in front of the people who decide whether judges keep their seats, and campaigns for laws that end judicial immunity and make judges answer to an independent body of citizens.</p>
        <p class="page-sub" style="margin-top:14px;font-size:17px;font-style:italic;line-height:1.5;">Every effort to reform the courts from the inside has asked judges to hold themselves accountable. They never have, and they never will. Change has to come from outside the system, from ordinary people who refuse to accept it.</p>
      </div>
      <div class="hero-ctas" style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
        <a href="the-demand.html#sign" class="btn-signal">Sign the People&#8217;s Demand</a>
        <a href="petitions/index.html" class="btn-chrome">See the Petitions</a>
      </div>
    </div>
    ''' + STATS_EXHIBIT + '''
  </div>
</section>

<section class="section" aria-labelledby="demand-h"><div class="wrap two-col" style="align-items:start;">
  <div>
    <p class="eyebrow" style="margin-bottom:16px;">The Demand</p>
    <h2 id="demand-h" class="section-h">End Judicial Immunity. Make Judges Answer to the People.</h2>
    <p class="latest-p"><strong>End judicial immunity.</strong> No judge should be immune for deliberate constitutional violations, corruption, fraud, retaliation, conduct outside lawful authority, or conduct causing catastrophic harm.</p>
    <p class="latest-p"><strong>Create independent accountability.</strong> A standing body of people who are neither judges nor lawyers, with no ties to the courts, answering to a board of citizens, with the power to penalize, suspend, and remove judges, the way every employer treats every employee.</p>
    <p class="latest-p"><strong>No lawsuit required.</strong> No one harmed by a judge should have to file another case, or win the approval of other judges, before anything happens.</p>
    <a href="the-demand.html" class="see-all">Read the Full Demand &rarr;</a>
  </div>
  <div>''' + national_form('pt-home', '') + '''</div>
</div></section>

<section class="section" aria-labelledby="pet-h"><div class="wrap">
  <p class="kicker">Petitions</p>
  <h2 id="pet-h" class="section-h" style="max-width:none;">Every Judge in This Record Has Seen This Conduct. Not One Has Called It Wrong.</h2>
  <p style="color:var(--muted);font-size:16px;max-width:760px;margin-bottom:26px;">Each petition is tied to a judge whose conduct is documented in the public record at <a href="''' + RECORD + '''/accountability/judges.html" rel="noopener" ''' + LINK + '''>JennifersLaw.org</a>. Signatures are delivered to the people who decide whether that judge keeps the seat.</p>
  <div class="card-grid rec-cards">
    <a class="law-card-light" style="padding:18px 22px;" href="petitions/index.html"><span class="law-num">Sign Them All at Once</span><p>One form, one signature on every petition you choose.</p></a>
    <a class="law-card-light" style="padding:18px 22px;" href="reappointment-vote.html"><span class="law-num">The 2027 Reappointment Vote</span><p>You don&#8217;t get a vote. They do. Associate judges keep their seats only if three-fifths of the circuit judges say yes.</p></a>
    <a class="law-card-light" style="padding:18px 22px;" href="petitions/index.html#dupage"><span class="law-num">DuPage County &middot; 18th Judicial Circuit</span><p>Eight petitions: reappointment votes in 2027 and retention elections in 2028 and 2030.</p></a>
    <a class="law-card-light" style="padding:18px 22px;" href="petitions/index.html#cook"><span class="law-num">Cook County</span><p>Eight petitions: reappointment votes in 2027 and retention elections in 2028 and 2030.</p></a>
  </div>
</div></section>

''' + newsletter() + '''

<section class="section sec-lift" aria-labelledby="who-h"><div class="wrap">
  <h2 id="who-h" class="section-h">Who We Are</h2>
  <div class="prose" style="max-width:820px;">
    <p style="color:var(--steel2);font-size:16.5px;line-height:1.7;">Jennifer&#8217;s Law Action is a 501(c)(4) social welfare organization being incorporated in Texas. It was founded by Jennifer Canali, a citizen with no law degree who taught herself the law and fought eight cases before 25 judges over more than 11.5 years without winning once. It is separate from Jennifer&#8217;s Law Foundation, which publishes the documented record and the research at <a href="''' + RECORD + '''/" rel="noopener" ''' + LINK + '''>JennifersLaw.org</a>.</p>
    <p style="margin-top:18px;"><a href="about.html" class="see-all">About Jennifer&#8217;s Law Action &rarr;</a></p>
  </div>
</div></section>
'''

DEMAND = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">The Campaign</p>
  <h1 class="page-title">The People&#8217;s Demand</h1>
  <p class="page-sub">End judicial immunity. Make judges answer to the people. No lawsuit required.</p>
</div></section>
<section class="section"><div class="wrap rec-grid">
  <div class="prose">
    <h2>What We Are Demanding</h2>
    <p><strong>1. End judicial immunity.</strong> Judges created the doctrine of judicial immunity for themselves, and the Supreme Court has held that it protects a judge even when the judge is accused of acting &ldquo;maliciously and corruptly.&rdquo; No judge should be immune for deliberate constitutional violations, corruption, fraud, retaliation, conduct outside lawful authority, or conduct causing catastrophic harm.</p>
    <p><strong>2. Create independent accountability.</strong> Ending immunity alone is not enough, because a lawsuit against a judge is decided by that judge&#8217;s friends and peers. Accountability has to come from outside the system:</p>
    <ul>
      <li>a standing accountability body that reviews judges&#8217; conduct and acts on it;</li>
      <li>staffed by people who are not judges, not lawyers, not friends of the judges, and not financially connected to them;</li>
      <li>answering to a board of citizens, with non-lawyers and non-judges at every level up to the top;</li>
      <li>with immediate, escalating consequences: penalty, probation, and removal;</li>
      <li>and with severe consequences for anyone in that chain who fails to act.</li>
    </ul>
    <p><strong>3. No lawsuit required.</strong> No one harmed by a judge should have to hire a lawyer, file another case, or win the approval of other judges before anything happens.</p>
    <p><strong>4. Put everything on the record.</strong> Every hearing recorded and livestreamed, every filing public, and every ruling explained in writing, so there is a record to hold judges to.</p>

    <h2>Why It Has to Come From Us</h2>
    <p>In fiscal year 2024, 1,510 misconduct complaints were filed against federal judges; three ended in a censure or reprimand, and not one judge was suspended. The Illinois Judicial Inquiry Board received 556 requests for investigation and closed 531 of them without investigating at all. The bodies that oversee judges are run by judges and lawyers, and they protect their own.</p>
    <p>Jennifer Canali taught herself the law, matched every attorney she faced, and fought eight cases before 25 judges for more than 11.5 years. She has never won. Every order and filing is published at <a href="''' + RECORD + '''/" rel="noopener" ''' + LINK + '''>JennifersLaw.org</a> so anyone can verify it. If a citizen who did all of that cannot secure the most basic rights, the system is not broken. It is working exactly as it was designed to work.</p>

    <h2>Where This Goes</h2>
    <p>Judicial immunity can be ended by Congress for federal civil-rights claims and by state legislatures for state claims. In many states, including Illinois, the system for disciplining judges is written into the state constitution, so replacing it with independent accountability takes a constitutional amendment, and a constitutional amendment takes voters. Every name on this petition is a voter who has already decided.</p>
  </div>
  <div id="sign">
    <div class="pt-text" style="margin-bottom:20px;"><span class="pt-label">The Petition</span><p>''' + DEMAND_TEXT + '''</p></div>
    ''' + national_form('pt-demand', '') + '''
  </div>
</div></section>
'''

ABOUT = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">About</p>
  <h1 class="page-title">About Jennifer&#8217;s Law Action</h1>
  <p class="page-sub">The campaign for judicial accountability: petitions, public campaigns, and the legislative fight to end judicial immunity.</p>
</div></section>
<section class="section"><div class="wrap">
  <div class="prose" style="max-width:860px;">
    <h2>What We Do</h2>
    <p>Jennifer&#8217;s Law Action organizes citizens to hold judges accountable. It runs the petitions to the people who decide whether judges keep their seats, the public campaigns around judicial reappointment and retention, and the legislative campaign to end judicial immunity and create independent accountability for judges.</p>
    <h2>Who Founded It</h2>
    <p>Jennifer Canali started out knowing nothing about the law. She taught herself to do everything lawyers do and fought eight cases, in two counties, before 25 judges, over more than 11.5 years. She has done more than 19,000 hours of legal work without being paid a dollar for any of it, and she has never won. The complete record is published at <a href="''' + RECORD + '''/" rel="noopener" ''' + LINK + '''>JennifersLaw.org</a>.</p>
    <h2>How We Are Organized</h2>
    <p>Jennifer&#8217;s Law Action is a 501(c)(4) social welfare organization being incorporated as a Texas nonprofit corporation. It is a separate organization from Jennifer&#8217;s Law Foundation, which is being organized under section 501(c)(3) for research and public education and publishes the documented record at JennifersLaw.org, and it is separate from Jennifer Canali personally. Each keeps its own bank account, and a gift to one never pays for the work of another.</p>
    <p>Contributions to Jennifer&#8217;s Law Action are not deductible as charitable contributions for federal income tax purposes. Jennifer&#8217;s Law Action may use contributions for lobbying and for public campaigns concerning the reappointment and retention of judges.</p>
    <h2>Get in Touch</h2>
    <p>Questions, offers of help, and press inquiries: use the <a href="contact.html" ''' + LINK + '''>contact form</a>, or <button type="button" class="jl-email" data-subject="Jennifer's Law Action">Email Jennifer&#8217;s Law Action</button>.</p>
  </div>
</div></section>
'''

SUPPORT = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">Support Action</p>
  <h1 class="page-title">Fund the Campaign for Judicial Accountability</h1>
  <p class="page-sub">Gifts to Jennifer&#8217;s Law Action pay for the petitions, the public campaigns, and the legislative fight to end judicial immunity.</p>
</div></section>
<section class="section give-section" id="give" data-default-fund="action" data-thanks="thank-you.html"><div class="wrap">
  <div id="give-panel" class="give-panel" hidden></div>
  <noscript><div class="gp-notice"><p>The giving options on this page need JavaScript. Please turn on JavaScript in your browser to give.</p></div></noscript>
  <div class="give-major" id="major">
    <div>
      <h3>Major gifts</h3>
      <p>For a gift of $10,000 or more, a gift of appreciated stock, or a wire transfer, email Jennifer&#8217;s Law Action and Jennifer will respond personally. Wire and bank instructions are sent only by email, after your identity is confirmed, and are never posted on this site.</p>
      <p>Gifts to Jennifer&#8217;s Law Action are not deductible as charitable contributions, and they are generally not subject to federal gift tax (26 U.S.C. &sect; 2501(a)(6)). Please confirm the tax treatment of any gift with your own advisor.</p>
    </div>
    <div class="gmj-actions">
      <button type="button" class="jl-email btn-ghost" data-subject="Major gift to Jennifer's Law Action">Email Jennifer&#8217;s Law Action</button>
    </div>
  </div>
  <p class="give-separate">Jennifer&#8217;s Law Action is legally separate from Jennifer&#8217;s Law Foundation and from Jennifer Canali personally. To support Jennifer&#8217;s own appeal, visit <a href="''' + RECORD + '''/appeal/" rel="noopener" ''' + LINK + '''>JennifersLaw.org</a>.</p>
</div></section>
'''

THANKS = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">Support Action</p>
  <h1 class="page-title">Thank You</h1>
  <p class="page-sub">Your gift to Jennifer&#8217;s Law Action has been received. A receipt is on its way from the payment service you used.</p>
</div></section>
<section class="section"><div class="wrap">
  <p style="color:var(--steel2);font-size:17px;max-width:760px;margin-bottom:24px;">The fastest way to multiply your gift is to share the campaign with one more person.</p>
  <div style="display:flex;gap:16px;flex-wrap:wrap;">
    <button type="button" class="btn-signal jl-share-open" data-share-url="the-demand.html" data-share-text="Judges answer to no one. I just backed the campaign to change that. Add your name:">Share the Campaign</button>
    <a class="btn-ghost" href="../the-demand.html#sign">Sign the People&#8217;s Demand</a>
  </div>
</div></section>
'''

CONTACT = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">Get in Touch</p>
  <h1 class="page-title">Contact</h1>
  <p class="page-sub">Questions, offers of help, petition deliveries, and press. Every message gets read.</p>
</div></section>
<section class="section"><div class="wrap">
  <form data-ajax data-hide-on-success="1" action="https://formsubmit.co/ajax/" data-fs method="post" class="form-grid">
    <input type="hidden" name="_subject" value="JenniferslawAction.org — Contact form"><input type="hidden" name="_template" value="table"><input type="hidden" name="_captcha" value="false">
    <input type="hidden" name="topic" value="action">
    <div class="two-col" style="gap:18px;">
      <div><label class="f-label" for="c-name">Name</label><input class="f-input" id="c-name" name="name" autocomplete="name"></div>
      <div><label class="f-label" for="c-email">Email</label><input class="f-input" id="c-email" name="email" type="email" required autocomplete="email"></div>
    </div>
    <div><label class="f-label" for="c-msg">Message</label><textarea class="f-input" id="c-msg" name="message" required minlength="10"></textarea></div>
    <div><button class="btn-chrome" type="submit">Send</button></div>
    <div class="form-msg" role="status"></div>
  </form>
</div></section>
'''

PRIVACY = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">Legal</p>
  <h1 class="page-title">Privacy Policy</h1>
</div></section>
<section class="section"><div class="wrap"><div class="prose" style="max-width:860px;">
  <p><em>Last updated: November 5, 2026</em></p>
  <h2>1. Overview</h2>
  <p>JenniferslawAction.org (the &ldquo;Site&rdquo;) is operated by Jennifer&#8217;s Law Action (&ldquo;we&rdquo; or &ldquo;us&rdquo;). This policy explains what information the Site collects, how it is used, and the choices available to you.</p>
  <h2>2. Information You Provide</h2>
  <p>You can browse the Site without providing any personal information. We collect personal information only when you choose to submit it: when you sign a petition, subscribe to updates, contact us, or make a gift. Depending on the form, this may include your name, email address, city, state, ZIP code, and any comment or message you write.</p>
  <h2>3. Petitions</h2>
  <p>Petition signatures are stored on our own web server, not on a third-party petition platform. When a petition is delivered to the people it is addressed to, the delivery includes signers&#8217; names, cities and states, and any comment they chose to write. <strong>Email addresses are never delivered, published, or shared;</strong> they are used only to keep each person to one signature per petition and, if you checked &ldquo;Keep me updated,&rdquo; to send you campaign updates. If you checked &ldquo;Show my name and city on the list of signers,&rdquo; your name and city may appear on the Site.</p>
  <h2>4. Gifts</h2>
  <p>Gifts are processed by third-party payment services (such as Zeffy, PayPal, or your bank for Zelle), which handle your payment information under their own privacy policies. We receive your name, email address, and the amount of your gift, and we use them to acknowledge your gift and keep required records.</p>
  <h2>5. How We Use Your Information</h2>
  <p>We use the information you submit to record and deliver petitions, respond to your messages, send updates you asked for, and acknowledge gifts. We do not sell, rent, or trade your personal information to anyone, for any purpose.</p>
  <h2>6. Analytics and Cookies</h2>
  <p>The Site may use standard analytics tools to understand aggregate traffic. Analytics providers may set cookies; you can block or delete cookies in your browser without losing access to any part of the Site.</p>
  <h2>7. Your Choices</h2>
  <p>You may unsubscribe from email updates at any time, and you may ask us to correct or delete information you submitted by contacting us. Depending on where you live, you may have additional rights under applicable privacy laws, and we will honor valid requests consistent with those laws.</p>
  <h2>8. Children</h2>
  <p>The Site is not directed to children under 13, and we do not knowingly collect personal information from them.</p>
  <h2>9. Security</h2>
  <p>We take reasonable measures to protect the information you submit. No method of transmission or storage is perfectly secure.</p>
  <h2>10. Changes</h2>
  <p>We may update this policy from time to time. The date at the top reflects the most recent revision.</p>
  <h2>11. Contact</h2>
  <p>Questions or requests about your information: <button type="button" class="jl-email" data-subject="Privacy request">Email Jennifer&#8217;s Law Action</button>.</p>
</div></div></section>
'''

TERMS = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">Legal</p>
  <h1 class="page-title">Terms &amp; Conditions</h1>
</div></section>
<section class="section"><div class="wrap"><div class="prose" style="max-width:860px;">
  <p><em>Last updated: November 5, 2026</em></p>
  <h2>1. About This Site</h2>
  <p>JenniferslawAction.org (the &ldquo;Site&rdquo;) is operated by Jennifer&#8217;s Law Action, a social welfare organization being incorporated in Texas under section 501(c)(4) of the Internal Revenue Code. It is separate from Jennifer&#8217;s Law Foundation and from Jennifer Canali personally.</p>
  <h2>2. Not Legal Advice</h2>
  <p>Nothing on this Site is legal advice or creates an attorney-client relationship. The content is offered for informational, educational, and advocacy purposes.</p>
  <h2>3. Opinion and the Public Record</h2>
  <p>Statements about judges and attorneys on this Site concern their public conduct and are based on court records published in full at JennifersLaw.org. Statements of opinion are the views of Jennifer&#8217;s Law Action. Any judge or attorney named on this Site is invited to respond.</p>
  <h2>4. Petitions</h2>
  <p>By signing a petition, you confirm that the name you give is your own and that you are signing only once. Petitions on this Site do not expire; signatures are delivered to the people each petition is addressed to and remain part of the public record afterward. Comments you write may be delivered with your signature.</p>
  <h2>5. Gifts</h2>
  <p>Contributions to Jennifer&#8217;s Law Action are not deductible as charitable contributions for federal income tax purposes. Gifts are used for the organization&#8217;s campaigns, which may include lobbying and public campaigns concerning the reappointment and retention of judges.</p>
  <h2>6. Intellectual Property</h2>
  <p>Original content on this Site may be shared, quoted, and linked for non-commercial, educational, and advocacy purposes with credit to the Site as the source.</p>
  <h2>7. External Links</h2>
  <p>The Site links to other websites, including JennifersLaw.org. We are not responsible for the content or practices of third-party sites.</p>
  <h2>8. Disclaimer and Limitation of Liability</h2>
  <p>The Site is provided &ldquo;as is,&rdquo; without warranties of any kind. To the fullest extent permitted by law, Jennifer&#8217;s Law Action is not liable for damages arising from your use of the Site.</p>
  <h2>9. Changes</h2>
  <p>These Terms may be updated from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.</p>
  <h2>10. Contact</h2>
  <p>Questions about these Terms: <a href="contact.html" ''' + LINK + '''>contact us</a>.</p>
</div></div></section>
'''

NOTFOUND = '''
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">Jennifer&#8217;s Law Action</p>
  <h1 class="page-title">This Page Could Not Be Found</h1>
  <p class="page-sub">The address may have changed. Everything on this site is still here.</p>
</div></section>
<section class="section"><div class="wrap" style="display:flex;gap:18px;flex-wrap:wrap;">
  <a class="btn-signal" href="the-demand.html#sign">Sign the People&#8217;s Demand</a>
  <a class="btn-chrome" href="index.html">Go to the Homepage</a>
  <a class="btn-ghost" href="petitions/index.html">The Petitions</a>
</div></section>
'''

PAGES = [
    ('index.html', NAME + ' — We, the People, Will Hold Judges Accountable',
     'The campaign to end judicial immunity and make judges answer to an independent body of citizens. Sign the People’s Demand and the petitions.', HOME, 'action-home'),
    ('the-demand.html', 'The People’s Demand — ' + NAME,
     'End judicial immunity. Make judges answer to an independent body of citizens. No lawsuit required. Add your name.', DEMAND, 'action-demand'),
    ('about.html', 'About — ' + NAME,
     'Jennifer’s Law Action runs the petitions, the public campaigns, and the legislative fight to end judicial immunity.', ABOUT, 'action-home'),
    ('support/index.html', 'Support Action — ' + NAME,
     'Fund the petitions, the public campaigns, and the legislative fight to end judicial immunity.', SUPPORT, 'action-home'),
    ('support/thank-you.html', 'Thank You — ' + NAME, 'Thank you for supporting Jennifer’s Law Action.', THANKS, 'action-home'),
    ('contact.html', 'Contact — ' + NAME, 'Contact Jennifer’s Law Action.', CONTACT, 'action-home'),
    ('privacy.html', 'Privacy Policy — ' + NAME, 'How Jennifer’s Law Action handles petition signatures, gifts and messages.', PRIVACY, 'action-home'),
    ('terms.html', 'Terms & Conditions — ' + NAME, 'Terms for using JenniferslawAction.org.', TERMS, 'action-home'),
    ('404.html', 'Page Not Found — ' + NAME, 'The page you were looking for could not be found.', NOTFOUND, 'action-home'),
]

GIVE_HEAD = {'support/index.html': '<script src="../assets/js/donate-config.js" defer></script>\n<script src="../assets/js/donate.js" defer></script>\n'}
PETITION_HEAD = '<script src="{r}assets/js/petitions.js" defer></script>\n'


# ---------------------------------------------------------------- petitions (imported pages)
def rewrite_links(main, old_path, new_path, keep):
    """Relative links: kept when the target exists on this site, otherwise sent to JennifersLaw.org."""
    moved = {'accountability/reappointment-vote.html': 'reappointment-vote.html',
             'terms/index.html': 'terms.html', 'privacy/index.html': 'privacy.html',
             'contact/index.html': 'contact.html', 'index.html': 'index.html'}
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if re.match(r'^(https?:|mailto:|tel:|data:|#|//)', url):
            return m.group(0)
        path, frag = (url.split('#', 1) + [''])[:2]
        target = os.path.normpath(os.path.join(os.path.dirname(old_path), path)).replace('\\', '/')
        target = moved.get(target, target)
        if target in keep:
            new = os.path.relpath(target, os.path.dirname(new_path) or '.').replace('\\', '/')
        else:
            new = RECORD + '/' + re.sub(r'(^|/)index\.html$', r'\1', target)
        return '%s="%s%s"' % (attr, new, ('#' + frag) if frag else '')
    return re.sub(r'\b(href|src)="([^"]+)"', fix, main)


def import_from(src):
    keep = set(['petitions/index.html', 'reappointment-vote.html', 'terms.html', 'privacy.html', 'contact.html', 'index.html'] + ['petitions/%s.html' % s for s in PETITION_SLUGS])
    jobs = [('accountability/reappointment-vote.html', 'reappointment-vote.html')]
    jobs += [('petitions/' + f, 'petitions/' + f) for f in sorted(os.listdir(os.path.join(src, 'petitions'))) if f.endswith('.html')]
    for old, new in jobs:
        s = open(os.path.join(src, old), encoding='utf-8').read()
        title = html.unescape(re.search(r'<title>(.*?)</title>', s, re.S).group(1))
        title = re.sub(r'\s+—\s+Jennifer.s Law$', '', title) + ' — ' + NAME
        desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', s).group(1))
        main = s[s.find('<main id="main">') + len('<main id="main">'):s.find('</main>')]
        main = rewrite_links(main, old, new, keep)
        os.makedirs(os.path.dirname(new) or '.', exist_ok=True)
        open(new, 'w', encoding='utf-8').write('<!-- TITLE: %s -->\n<!-- DESC: %s -->\n<main id="main">%s</main>\n' % (title, desc, main))
    print('imported %d pages from %s' % (len(jobs), src))


def petition_tweaks(main):
    # 1. opt-in to updates on every petition form (stored with the signature; see api/petition-sign.php)
    if 'name="updates"' not in main:
        main = main.replace('<label class="pt-check"><input type="checkbox" name="public" value="1"> Show my name and city on the list of signers.</label>',
                            '<label class="pt-check"><input type="checkbox" name="public" value="1"> Show my name and city on the list of signers.</label>\n  '
                            '<label class="pt-check"><input type="checkbox" name="updates" value="1"> Keep me updated about this campaign by email.</label>')
    # 2. after a successful signature, offer to share (site.js provides window.JLShare)
    if 'JLShare' not in main:
        main = main.replace("if(d.counts) paint(d.counts);}",
                            "if(d.counts) paint(d.counts); if(window.JLShare) setTimeout(function(){window.JLShare(location.href.split('#')[0],'I just signed: '+document.title.replace(/ \\u2014 .*$/,'')+'. Add your name:',document.title);},900);}")
    # 3. the email promise covers delivery too
    main = main.replace('Your email address is never published or shared. It is used only to keep each person to one signature per petition.',
                        'Your email address is never published or shared, and is never given to the people a petition is delivered to.')
    # 4. anchors for the DuPage and Cook menu links on the petitions index
    main = main.replace('<h2>DuPage County &middot; 18th Judicial Circuit</h2>', '<h2 id="dupage">DuPage County &middot; 18th Judicial Circuit</h2>')
    main = main.replace('<h2>Cook County</h2>', '<h2 id="cook">Cook County</h2>')
    return main


def rewrap_imported():
    files = ['reappointment-vote.html'] + ['petitions/' + f for f in sorted(os.listdir('petitions')) if f.endswith('.html')]
    for p in files:
        s = open(p, encoding='utf-8').read()
        tm = re.search(r'<!-- TITLE: (.*?) -->', s)
        if tm:   # freshly imported stub
            title, desc = tm.group(1), re.search(r'<!-- DESC: (.*?) -->', s).group(1)
        else:
            title = html.unescape(re.search(r'<title>(.*?)</title>', s, re.S).group(1))
            desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', s).group(1))
        main = s[s.find('<main id="main">') + len('<main id="main">'):s.find('</main>')]
        page(p, title, desc, petition_tweaks(main), 'action-petitions')
    return files


# ---------------------------------------------------------------- sitemap, robots
def sitemap(paths):
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p in sorted(paths):
        if p in ('404.html', 'support/thank-you.html'):
            continue
        out.append('  <url><loc>%s/%s</loc><lastmod>%s</lastmod></url>' % (SITE, re.sub(r'(^|/)index\.html$', r'\1', p), TODAY))
    out.append('</urlset>\n')
    open('sitemap.xml', 'w', encoding='utf-8').write('\n'.join(out))
    open('robots.txt', 'w', encoding='utf-8').write('User-agent: *\nDisallow: /api/\nDisallow: /_site-tools/\nDisallow: /support/thank-you.html\n\nSitemap: %s/sitemap.xml\n' % SITE)


if __name__ == '__main__':
    if '--import' in sys.argv:
        import_from(sys.argv[sys.argv.index('--import') + 1])
    built = []
    for path, title, desc, main, img in PAGES:
        r = '../' * path.count('/')
        extra = GIVE_HEAD.get(path, '')
        if 'data-petition-form' in main:
            extra += PETITION_HEAD.format(r=r)
        page(path, title, desc, main, img, extra)
        built.append(path)
    built += rewrap_imported()
    sitemap(built)
    print('built %d pages; sitemap.xml and robots.txt written' % len(built))
