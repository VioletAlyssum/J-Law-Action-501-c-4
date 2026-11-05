#!/usr/bin/env python3
"""
rohm_record.py: the Judge Robert W. Rohm record, written once and used by BOTH sites
(JennifersLaw.org's accountability page and JenniferslawAction.org's petition page).

Edit the text here, then run:
    python3 _site-tools/apply_rohm_record.py            (JennifersLaw.org)
    python3 _site-tools/build_action_site.py            (JenniferslawAction.org; it has its own copy of this file)

Sources:
  - Judge Rohm's orders of August 28, August 31, October 27 and October 28, 2026 (posted in documents/orders/).
  - Jennifer's summary of what happened (November 5, 2026).
  - Grounds 1-43: the four Verified Petitions for Substitution of Judge for Cause against Judge Rohm and the
    Supplement (June 29 - August 26, 2026), as filed with the Illinois Supreme Court as Exhibits 21, 25, 27,
    31 and 46 to the Rule 383 motion already published on JennifersLaw.org.
"""
import html

# ------------------------------------------------------------------ the cost
SANCTIONS_TOTAL = '$29,478.23'
COST = [
    ('Sanctions ordered by Judge Rohm', SANCTIONS_TOTAL, ''),
    ('The appeal', '$30,000', ''),
    ('The bond on the sanctions', '$10,000', ''),
    ('To start the case over from square one', 'About $70,000', 'gold'),
    ('Years of litigation in this case', '8', ''),
    ('Hours Jennifer has put into this case', '11,500+', ''),
    ('More hours the appeal will take', '1,000+', ''),
    ('Rulings on the merits', '0', 'red'),
    ('What it costs the judges who caused it', '$0', 'red'),
]

LEAD = (
    'Judge Robert W. Rohm dismissed Jennifer Canali&#8217;s case with prejudice, sanctioned her '
    + SANCTIONS_TOTAL + ', revoked her fee waiver, revoked her right to appear by Zoom, and barred her from emailing '
    'the court. After eight years of litigation and more than 11,500 hours of work on this one case, no judge has ever '
    'ruled on its merits: no judge has reviewed the facts and the evidence and applied the law to them.'
)
LEAD2 = (
    'To get the chance to start over from square one, Jennifer must now pay about $70,000: '
    + SANCTIONS_TOTAL + ' in sanctions, $30,000 for the appeal, and $10,000 for the bond on the sanctions, and '
    'spend at least another 1,000 hours on the appeal. Judge Rohm and the colleagues who caused this will not lose a '
    'single minute of their time or a single dollar of their money. Every minute and every dollar falls on the victim.'
)
THESIS = 'They caused the harm. The victim pays for it.'

# ------------------------------------------------------------------ what he did (Jennifer's list, checked against the orders)
WHAT_HE_DID = [
    ('On the Eve of Trial', [
        'Set the case for trial under the January 22, 2020 order, an unlawful order that limited the conversion of everything Jennifer owned to a single conversation lasting less than 30 minutes, and made her property rights depend on the words, actions and mindset of one of her friends on one specific day.',
        'Set that order aside on August 6, 2026, 25 days before trial, while reserving the final determination for August 7, 2026, and kept the August 31 trial date.',
        'Refused to reopen discovery, although the case had just grown from one conversation lasting less than 30 minutes to years of events.',
        'Stated on the record that there was no lawful basis for terminating the defendant&#8217;s deposition, then upheld the termination and the closing of discovery.',
        'Refused to allow Jennifer to depose the defendant or any fact witness.',
        'Stated twice on the record that Jennifer would not be permitted to present her evidence at trial.',
        'Required her to amend her 63-page complaint in seven hours and 29 minutes on Friday night, August 7, 2026.',
        'Required her to complete every trial material in four court days, and to mail hard copies before she had received the defendant&#8217;s answer.',
        'Allowed nine court days in all to prepare for trial on years of newly permitted claims, four for the trial materials and five for everything else: work that would ordinarily take an attorney two to three years.',
        'Was told in every filing, and at every hearing at which Jennifer was permitted to speak, that a trial on the merits was impossible on those dates and that she could not get to Illinois. She told him the moment the dates were chosen, between his calendar and defense counsel&#8217;s.',
    ]),
    ('The Sanctions', [
        'Sanctioned her $1,000 on August 28, 2026 because she could not appear in person for the final pretrial conference, for a trial that could not occur.',
        'Sanctioned her $2,000 more on August 31, 2026, the next court day, for the same reason, and dismissed her case with prejudice.',
        'Moments after the dismissal, granted defense counsel&#8217;s one-sentence oral motion for all of the defense&#8217;s attorney&#8217;s fees, with no written motion, no briefing, and no chance to respond or object.',
        'Instructed defense counsel not to file any pleading and simply to submit her billing records.',
        'Announced the amount at an ex parte status conference.',
        'Awarded every fee and expense on the defense&#8217;s invoices from May 6, 2026 forward, at $450 an hour, a rate never charged to the client.',
        'Ordered Jennifer to pay $26,478.23 to defense counsel&#8217;s firm, for work counsel did pro bono and for which her own client was charged $60.',
        'Gave as reasons, in an order drafted by defense counsel, her &ldquo;frivolous motions,&rdquo; her emails, and her &ldquo;attacks on the judiciary and defense counsel.&rdquo;',
    ]),
    ('The Motions', [
        'Denied every motion Jennifer filed, without exception.',
        'Denied motions the defense never opposed: defense counsel filed no response to any of her motions.',
        'Denied motions he admitted he had not read. On August 6, 2026 he had defense counsel read their titles aloud, denied each one, and when asked whether he was ruling on the titles alone, answered: &ldquo;That&#8217;s exactly correct.&rdquo;',
        'On October 28, 2026, denied &ldquo;all motions, objections and filings by the Plaintiff&rdquo; with prejudice, giving as the reason that she did not appear in person.',
        'Denied her postjudgment motion before she had scheduled it for presentment, at a status conference she did not attend, giving as a reason that she did not appear in person for a hearing at which that motion was not up for decision. His order states that the motion was &ldquo;noticed by Defendant.&rdquo;',
    ]),
    ('Shut Out of Her Own Case', [
        'Revoked her right under Illinois Supreme Court Rule 45 to appear by Zoom.',
        'Revoked her fee waiver, in place since January 11, 2019, &ldquo;for the reasons stated on the record,&rdquo; two months after the case was dismissed and five weeks after she moved for the transcripts she needs for her appeal.',
        'Ordered that any new fee-waiver application be presented in person, although the application states that a hearing is generally not necessary and gives the applicant the option to appear remotely.',
        'Ordered that any request for the transcripts needed for her appeal also be heard in person.',
        'Barred her from emailing the court, any judge of the 18th Judicial Circuit, or the clerk&#8217;s office, and ordered her to communicate by postal mail, UPS, FedEx or hand delivery.',
        'Did all of this knowing that she lives more than 1,200 miles away in Texas, has no car, no driver&#8217;s license and no government ID, and works 80 to 120 hours a week on legal work for which she receives nothing.',
    ]),
    ('The Petitions to Remove Him', [
        'Denied her Fifth Verified Petition for Substitution of Judge for Cause himself, without transferring it to another judge, although 735 ILCS 5/2-1001(a)(3)(iii) requires that such a petition be heard &ldquo;by a judge other than the judge named in the petition.&rdquo;',
        'Held her in direct contempt during the August 31 hearing, then, in his own words, &ldquo;reconsidered his decision after the parties departed.&rdquo;',
    ]),
]

# ------------------------------------------------------------------ the 43 grounds already filed
GROUNDS_SOURCES = [
    (1, 12, 'Verified Petition for Substitution of Judge for Cause, filed June 29, 2026'),
    (13, 17, 'Supplement to the Petition, filed July 20, 2026'),
    (18, 22, 'Second Verified Petition, filed July 30, 2026'),
    (23, 30, 'Third Verified Petition, filed August 6, 2026'),
    (31, 43, 'Fourth Verified Petition, filed August 26, 2026'),
]
GROUNDS = {
    1: 'The foreclosure of the deposition of the defendant and every fact witness, on a premise the certified transcript disproves, and the imposition of a written-question procedure Illinois law does not recognize.',
    2: 'The denial of the Rule 219(c) sanctions motion as &ldquo;baseless,&rdquo; rendered without any opposition from defense counsel and without review of the transcript or video recording that constitutes the entire evidentiary foundation.',
    3: 'The continued enforcement of the single-day order after the concession, on two records, that no legal basis for it could be identified.',
    4: 'The reversal of the venue transfer Judge Rohm had agreed to five weeks earlier, absent any change in circumstance, simply stating: &ldquo;I changed my mind.&rdquo;',
    5: 'The threat to hold Jennifer in contempt as she attempted to make a record.',
    6: 'Granting the defendant&#8217;s contested motion at a status conference, in violation of Local Rule 6.04(d), Local Rule 6.05, and the 18th Judicial Circuit Law Division Standing Order.',
    7: 'The commitment of the case to a jury trial that cannot be certified as ready, on a foundation Judge Rohm conceded he cannot justify.',
    8: 'The impossible schedule: more than one year of motion practice compressed into 33 days.',
    9: 'The structural impossibility of the trial schedule: no time to hear the dispositive motions, and the reset that the granting of any one of them compels.',
    10: 'The collapse of trial preparation into a window consumed by a conflicting Cook County proceeding and cross-country travel, foreclosing any review of the defendant&#8217;s pretrial submissions.',
    11: 'The entry of two false orders, each reciting a disposition the record contradicts, to the defendant&#8217;s benefit.',
    12: 'The threats to bar Jennifer from filing anything further.',
    13: 'Placed the petition seeking his own removal on his own calendar, in his own courtroom, on one court day&#8217;s notice, without disclosing what proceeding he intended to conduct.',
    14: 'Continued his pattern of scheduling proceedings on dates Jennifer cannot attend.',
    15: 'Announced an ultimatum, received compliance with it, and imposed the penalty for noncompliance anyway.',
    16: 'Consumed the whole of Jennifer&#8217;s capacity to litigate and left her none for the merits.',
    17: 'Inflicted severe and escalating physical and psychological harm on Jennifer, harm that is itself evidence of the antagonism the Supplement documents.',
    18: 'Ordered eleven dispositive matters to be decided in a single morning.',
    19: 'Selected a Monday for the August 3 hearing, a day he was twice told directly that Jennifer cannot appear, while every setting in the case was built around defense counsel&#8217;s availability.',
    20: 'Used a court order to create a false record of Jennifer&#8217;s conduct, positioning himself to impose contempt or other penalties for failing to appear at a hearing he knew she could not attend.',
    21: 'Created a schedule that consumed every hour Jennifer would otherwise spend prosecuting her case, and that inflicted physical harm through sustained sleep deprivation.',
    22: 'Withheld, across two separate orders, the mandatory local-rule deadline for trial conference materials, leaving Jennifer to discover it after the chance to object or stipulate had passed.',
    23: 'Investigated, on his own and outside the record, Jennifer&#8217;s Cook County lawsuits, which involve the defendant, the defendant&#8217;s key witnesses, and the events at issue.',
    24: 'Wrote an order striking a filing Jennifer never submitted, never served it on her, and told her that another judge had struck it.',
    25: 'Chose the judge who would rule on his own substitution.',
    26: 'Planned an ambush hearing to decide Jennifer&#8217;s eleven dispositive matters on July 20, 2026, immediately after the predetermined denial of her substitution petitions.',
    27: 'Made his rulings on all eleven of Jennifer&#8217;s dispositive matters before they were even presented to be set for briefing, while a petition to remove him for cause was pending.',
    28: 'Set every hearing date and the trial date around defense counsel&#8217;s calendar, and disregarded Jennifer&#8217;s stated unavailability every time.',
    29: 'Told Jennifer that what she says about him and the Circuit is contemptuous, that she cannot say it, that it offends him, and that her emails are obnoxious, without a single example, and directed her to an unpublished opinion affirming contempt sanctions and disbarment against an advocate who accused a judge of misconduct.',
    30: 'Applied notice and hearing requirements only when they delayed Jennifer&#8217;s access to the transcripts she needed to preserve the record, after repeatedly discarding the same safeguards to speed decisions against her.',
    31: 'Denied six of Jennifer&#8217;s filings as defense counsel read their titles aloud, having stated that he had not seen them, and confirmed that the denials rested on the titles: &ldquo;That&#8217;s exactly correct.&rdquo;',
    32: 'Announced that he would research the ways he could sanction Jennifer, although no sanctions motion was pending, after twice raising contempt and stating that an attorney who made her comments would be jailed.',
    33: 'Found that no right of Jennifer&#8217;s had been violated by anyone, clearing himself and every officer in the eleven-year record, in the same hearing in which he set aside the order that had governed the case for 2,388 days and denied six motions on their titles.',
    34: 'Disclosed that the information about Jennifer&#8217;s other litigation came to him from Judge David Schwartz, who recused himself after 2.5 years on the case when Jennifer petitioned to remove him for cause.',
    35: 'Conducted his own research and wrote his own arguments against all eleven of Jennifer&#8217;s dispositive motions, supplied the only opposition, denied every motion on that opposition, and gave her no opportunity to respond.',
    36: 'Canceled the presentment Jennifer had scheduled for the morning of August 6, 2026, refused presentment that afternoon, and then treated her filings as moot because she had not presented them.',
    37: 'Disposed of eleven dispositive matters in a single proceeding, giving more of it to transcript requests and to warnings and threats against Jennifer than to every dispositive matter combined.',
    38: 'On the eve of trial, set aside the order that had confined the case for 2,388 days to one friend&#8217;s conversation of less than 30 minutes, enlarged the case by years, and gave Jennifer seven hours and 29 minutes on a Friday night to write and file an amended complaint, four court days to complete all trial materials, and nine court days to prepare to try years of events never before permitted.',
    39: 'After enlarging the case by years, kept the trial date and enforced impossible deadlines, including a schedule requiring every pretrial submission to be mailed before the defendant&#8217;s answer was due.',
    40: 'Forced Jennifer to prosecute her case with no operative complaint, no answer, no completed deposition of the defendant, and defense witnesses she was never able to depose.',
    41: 'Manufactured an adverse account of Jennifer&#8217;s conduct that the filed record disproves, and foreclosed any correction while declaring the record settled.',
    42: 'Denied Jennifer&#8217;s request for the transcripts recording his own misconduct, the misconduct of Chief Judge Bonnie M. Wheaton, and the misconduct of retired Judge Richard Russo.',
    43: 'Told Jennifer that her statements about the Circuit are conduct for which an attorney would be jailed, that litigants like her lose the ability to appear remotely, and that she risks being barred from filing in her own case.',
}

FILINGS_NOTE = ('Every order Judge Rohm entered is published on JennifersLaw.org. Jennifer&#8217;s verified petitions '
                'and her other court filings will be posted soon, along with every order in the case.')


def count_items():
    return sum(len(v) for _, v in WHAT_HE_DID)


def exhibit_html(title='The Cost of One Judge&#8217;s Orders', stamp='Exhibit', hid='ex-cost-h'):
    rows = ''.join('<div class="exhibit-row"><span class="lbl">%s</span><span class="val%s">%s</span></div>'
                   % (l, (' ' + c) if c else '', v) for l, v, c in COST)
    return ('<aside class="exhibit-hero" aria-labelledby="%s"><h2 id="%s" class="visually-hidden">Exhibit &mdash; %s</h2>'
            '<span class="exhibit-stamp">%s</span><p class="exhibit-title">%s</p>%s'
            '<p class="exhibit-note"><em>Sanctions from Judge Rohm&#8217;s orders of August 28, August 31 and October 28, 2026. '
            'The appeal and bond are what it now costs to challenge them.</em></p></aside>') % (hid, hid, title, stamp, title, rows)


def what_he_did_html(start=1):
    out, n = [], start
    for heading, items in WHAT_HE_DID:
        lis = []
        for it in items:
            lis.append('<li value="%d">%s</li>' % (n, it)); n += 1
        out.append('<div class="rr-group"><h3>%s</h3><ol class="rr-list">%s</ol></div>' % (heading, ''.join(lis)))
    return ''.join(out)


def grounds_html():
    out = []
    for a, b, src in GROUNDS_SOURCES:
        lis = ''.join('<li value="%d">%s</li>' % (n, GROUNDS[n]) for n in range(a, b + 1))
        out.append('<div class="rr-group"><h3>Grounds %d&ndash;%d <span class="rr-src">%s</span></h3><ol class="rr-list">%s</ol></div>' % (a, b, src, lis))
    return ''.join(out)


CSS = '''
/* Judge Rohm record lists (Nov 2026) */
.rr-lead p{color:var(--steel2);font-size:17.5px;line-height:1.7;margin-bottom:14px;}
.rr-thesis,.prose p.rr-thesis,.rr-lead p.rr-thesis{font-family:var(--display);font-style:italic;font-weight:600;font-size:clamp(26px,3.4vw,38px);line-height:1.25;color:var(--white);margin:22px 0 8px;text-align:left;hyphens:none;}
.prose a.btn-signal,.prose a.btn-chrome{color:#0A1220 !important;border:1px solid #DCE7F5 !important;text-decoration:none;}
.rr-group{margin:0 0 30px;}
.rr-group h3{font-family:var(--serif);font-size:22px;font-weight:700;color:var(--white);margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--hair);}
.rr-src{display:block;font-family:var(--sans);font-size:11.5px;letter-spacing:1.4px;text-transform:uppercase;color:var(--steel1);font-weight:600;margin-top:6px;}
.rr-list{margin:0;padding-left:2.4em;}
.rr-list li{color:var(--steel2);font-size:16.5px;line-height:1.65;padding:7px 0 7px 6px;border-bottom:1px solid rgba(198,219,245,.10);}
.rr-list li::marker{font-family:var(--serif);font-weight:800;color:var(--steel1);}
.rr-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;}
@media(max-width:960px){.rr-cols{grid-template-columns:minmax(0,1fr);gap:0;}}
.rr-note{color:var(--muted);font-size:14.5px;font-style:italic;max-width:820px;margin-top:6px;}
'''
