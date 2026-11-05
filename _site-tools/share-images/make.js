// Re-renders the 1200x630 share images in assets/img/share/.  Run: node _site-tools/share-images/make.js  (needs Playwright)
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const site = path.join(__dirname, '..', '..');
const tpl = fs.readFileSync(path.join(__dirname,'card.html'),'utf8')
  .replace('FRAME','file://'+path.join(__dirname,'doctrine-frame.png')).replace('MARK','file://'+site+'/assets/img/jl-mark-light.png');
const cards = {
  'action-home': `<div class="kick">Jennifer&rsquo;s Law Action</div><div class="h">The judges caused the harm. The victim pays for it.</div><div class="btn">The Case Against Judge Rohm</div>`,
  'action-demand': `<div class="stamp">The Demand</div><div class="h">End judicial immunity. Make judges accountable. Stop making the victim pay.</div><div class="btn">Add Your Name</div>`,
  'action-petitions': `<div class="kick">Do Not Reappoint Judge Rohm</div><div class="h">$29,478.23 in sanctions. No ruling on the merits. The victim pays about $70,000 to start over.</div><div class="btn">Sign the Petition</div>`,
  'default': `<div class="kick">The Official Doctrine of the Judiciary</div><div class="latin">&mdash; Auctoritas Est Quod Dico &mdash;</div><div class="big"><span class="q">&ldquo;</span>Because I Said So<span class="q">&rdquo;</span></div><div class="sub">Jennifer&rsquo;s Law Action</div>`
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  fs.mkdirSync(path.join(site,'assets/img/share'),{recursive:true});
  for (const [k,v] of Object.entries(cards)) {
    const f = path.join(__dirname, '_' + k + '.html'); fs.writeFileSync(f, tpl.replace('CONTENT', v));
    await p.goto('file://'+f, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(site,'assets/img/share',k+'.jpg'), type:'jpeg', quality: 88 });
    fs.unlinkSync(f); console.log('made', k);
  }
  await b.close();
})();
