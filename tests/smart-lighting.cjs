const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../assets/smart-lighting.js','utf8');
function node(){const events={},classes=new Set();return {disabled:true,hidden:false,textContent:'',attrs:{},classList:{add(x){classes.add(x)},contains(x){return classes.has(x)},toggle(x,on){if(on)classes.add(x);else classes.delete(x)}},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){(events[k]||(events[k]=[])).push(f)},emit(k){(events[k]||[]).forEach(f=>f())}}}
function setup({reduced=false,offFailed=false}={}){
 const hero=node(),button=node(),label=node(),body=node(),off=node(),on=node(),doc=node();
 Object.assign(off,{complete:true,naturalWidth:offFailed?0:1672});Object.assign(on,{complete:true,naturalWidth:1672});hero.querySelectorAll=()=>[off,on];
 const elements={top:hero,lightToggle:button,lightToggleText:label,lightingOn:on};Object.assign(doc,{hidden:false,body,getElementById:id=>elements[id]});
 const timers=new Map();let next=1,observer;
 const ctx={document:doc,window:{IntersectionObserver:true},IntersectionObserver:class{constructor(fn){observer=fn}observe(){}},matchMedia:()=>({matches:reduced,addEventListener(){}}),setTimeout(fn){const id=next++;timers.set(id,fn);return id},clearTimeout(id){timers.delete(id)}};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 return {hero,button,label,body,doc,timers,visibility(on){observer([{isIntersecting:on}])},run(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())}};
}
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 let t=setup();await flush();assert.equal(t.button.disabled,false);assert.equal(t.timers.size,1);t.run();assert(t.hero.classList.contains('is-lit'));assert.equal(t.label.textContent,'關燈看看');
 t.button.emit('click');assert(!t.hero.classList.contains('is-lit'));assert.equal(t.button.attrs['aria-pressed'],'false');t.visibility(false);t.visibility(true);assert.equal(t.timers.size,0,'manual selection must not be overwritten');
 t.button.emit('click');assert(t.hero.classList.contains('is-lit'));
 t=setup({reduced:true});await flush();assert(t.hero.classList.contains('is-lit'));assert.equal(t.timers.size,0);
 t=setup();await flush();t.doc.hidden=true;t.doc.emit('visibilitychange');assert.equal(t.timers.size,0);t.doc.hidden=false;t.doc.emit('visibilitychange');assert.equal(t.timers.size,1);
 t.visibility(false);assert.equal(t.body.classList.contains('hero-visible'),false);assert.equal(t.timers.size,0);t.visibility(true);assert(t.body.classList.contains('hero-visible'));t.run();assert(t.hero.classList.contains('is-lit'));
 t=setup({offFailed:true});await flush();assert.equal(t.button.hidden,true);assert(t.hero.classList.contains('is-lit'),'loaded lit image is a usable fallback');
 for(const name of ['smart-glass-house-on.jpg','smart-glass-house-off.jpg'])assert(fs.existsSync(__dirname+'/../assets/'+name));
 console.log('PASS: image readiness, automatic lighting, manual off/on, manual-choice retention, reduced motion, hidden-tab deferral, mobile CTA visibility, failed-image fallback, local assets');
})().catch(e=>{console.error(e);process.exitCode=1});
