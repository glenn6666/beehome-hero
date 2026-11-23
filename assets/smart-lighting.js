(function(){
  'use strict';
  const hero=document.getElementById('top');
  const button=document.getElementById('lightToggle');
  const label=document.getElementById('lightToggleText');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let ready=false,manual=false,autoDone=false,inView=true,timer=null;
  function clearAuto(){if(timer!==null){clearTimeout(timer);timer=null}}
  function setLit(on){
    hero.classList.toggle('is-lit',on);
    button.setAttribute('aria-pressed',String(on));
    label.textContent=on?'關燈看看':'開燈看看';
  }
  function automatic(){
    if(!ready||manual||autoDone||!inView||document.hidden||timer!==null)return;
    if(motion.matches){autoDone=true;setLit(true);return}
    timer=setTimeout(function(){timer=null;if(!manual&&inView&&!document.hidden){autoDone=true;setLit(true)}},850);
  }
  function imageReady(img){return new Promise(function(resolve,reject){
    if(img.complete){if(img.naturalWidth)resolve();else reject(new Error('image'));return}
    img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});
  })}
  button.addEventListener('click',function(){manual=true;clearAuto();setLit(!hero.classList.contains('is-lit'))});
  Promise.all(Array.from(hero.querySelectorAll('.lighting-image')).map(imageReady)).then(function(){
    ready=true;button.disabled=false;automatic();
  }).catch(function(){
    button.hidden=true;
    const lit=document.getElementById('lightingOn');
    if(lit.complete&&lit.naturalWidth)setLit(true);
  });
  document.body.classList.add('hero-visible');
  if('IntersectionObserver' in window)new IntersectionObserver(function(entries){
    inView=entries[0].isIntersecting;document.body.classList.toggle('hero-visible',inView);
    if(inView)automatic();else clearAuto();
  },{threshold:.15}).observe(hero);
  document.addEventListener('visibilitychange',function(){if(document.hidden)clearAuto();else automatic()});
  function preference(){if(motion.matches&&ready&&!manual){clearAuto();autoDone=true;setLit(true)}}
  if(motion.addEventListener)motion.addEventListener('change',preference);else motion.addListener(preference);
})();
