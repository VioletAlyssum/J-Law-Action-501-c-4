/* Petition forms outside /petitions/ (homepage, The Demand). Same behavior as the
   petition pages: live counts, one signature per email, share prompt after signing. */
(function(){
  'use strict';
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  var forms=qa('form[data-petition-form]'); if(!forms.length) return;
  var API=forms[0].getAttribute('data-api')||'api/petition-sign.php';
  function paint(counts){ qa('[data-count]').forEach(function(el){ var t=0; el.getAttribute('data-count').split(',').forEach(function(s){t+=counts[s]||0;}); el.textContent=(t||0).toLocaleString(); }); }
  if(location.protocol!=='file:'){ fetch(API+'?counts=1',{headers:{'Accept':'application/json'}}).then(function(r){return r.json();}).then(function(d){if(d&&d.ok)paint(d.counts);}).catch(function(){}); }
  forms.forEach(function(form){
    var t=form.querySelector('input[name=t]'); if(t) t.value=Date.now();
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=form.querySelector('.pt-msg'),btn=form.querySelector('[type=submit]');
      if(location.protocol==='file:'){msg.textContent='Signing works on the live site, not on a file opened from disk.';msg.className='pt-msg show err';return;}
      var fd=new FormData(form); fd.set('petitions',form.getAttribute('data-petitions'));
      if(btn) btn.disabled=true;
      fetch(form.getAttribute('data-api')||API,{method:'POST',body:fd,headers:{'Accept':'application/json'}}).then(function(r){return r.json();}).then(function(d){
        msg.textContent=(d&&d.message)||'Something went wrong. Please try again.';
        msg.className='pt-msg show'+(d&&d.ok?'':' err');
        if(d&&d.ok){
          qa('input[type=text],input[type=email],textarea',form).forEach(function(i){i.value='';});
          if(d.counts) paint(d.counts);
          try{ if(window.gtag) window.gtag('event','sign_up',{method:'petition'}); }catch(err){}
          if(window.JLShare) setTimeout(function(){ window.JLShare((window.JL_CONFIG&&JL_CONFIG.siteUrl||'')+'/the-demand.html','Judges answer to no one. I just signed the People’s Demand to change that. Add your name:','The People’s Demand'); },900);
        }
      }).catch(function(){msg.textContent='The petition service could not be reached. Please try again.';msg.className='pt-msg show err';})
        .then(function(){if(btn) btn.disabled=false;});
    });
  });
})();
