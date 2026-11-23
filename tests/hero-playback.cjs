const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function setup({reduced=false,saveData=false,deny=false}={}){
 function node(){const handlers={},classes=new Set();return {textContent:'',attributes:{},classList:{add(...xs){xs.forEach(x=>classes.add(x))},remove(...xs){xs.forEach(x=>classes.delete(x))},contains(x){return classes.has(x)}},setAttribute(k,v){this.attributes[k]=v},addEventListener(k,f){(handlers[k]||(handlers[k]=[])).push(f)},dispatch(k){(handlers[k]||[]).forEach(f=>f())}}}
 const hero=node(),video=node(),control=node(),text=node(),icon=node();
 Object.assign(video,{paused:true,ended:false,currentTime:0,muted:false,error:null,plays:0,loads:0,deny,
  play(){this.plays++;if(this.deny)return Promise.reject(Error('blocked'));this.paused=false;this.ended=false;this.dispatch('playing');return Promise.resolve()},
  pause(){if(!this.paused){this.paused=true;this.dispatch('pause')}},load(){this.loads++}});
 const nodes={hero,heroVideo:video,lightControl:control,controlText:text,controlIcon:icon};
 const doc=node();Object.assign(doc,{hidden:false,getElementById(id){return nodes[id]}});
 const motion={matches:reduced,addEventListener(){}};
 const ctx={document:doc,window:{},navigator:{connection:{saveData}},matchMedia(){return motion},console};
 vm.createContext(ctx);vm.runInContext(script,ctx);
 return {hero,video,control,text,doc,motion};
}
(async()=>{
 const t=setup();assert.equal(t.video.plays,1);assert.equal(t.video.muted,true);assert.equal(t.text.textContent,'暫停動畫');
 t.control.dispatch('click');assert(t.video.paused);assert.equal(t.text.textContent,'繼續播放');
 t.doc.hidden=true;t.doc.dispatch('visibilitychange');t.doc.hidden=false;t.doc.dispatch('visibilitychange');assert.equal(t.video.plays,1,'manually paused video must stay paused');
 t.control.dispatch('click');assert.equal(t.video.plays,2);
 t.video.currentTime=8;t.video.ended=true;t.video.paused=true;t.video.dispatch('ended');assert(t.hero.classList.contains('is-lit'));assert.equal(t.text.textContent,'重播亮燈');
 t.control.dispatch('click');assert.equal(t.video.currentTime,0);assert.equal(t.video.plays,3);assert(!t.hero.classList.contains('is-lit'));
 for(const option of [{reduced:true},{saveData:true}]){const s=setup(option);assert.equal(s.video.plays,0);assert(s.hero.classList.contains('is-static'));s.control.dispatch('click');assert.equal(s.video.plays,1,'explicit playback must remain available')}
 const blocked=setup({deny:true});await Promise.resolve();assert(blocked.hero.classList.contains('is-fallback'));assert.equal(blocked.text.textContent,'播放亮燈');blocked.video.deny=false;blocked.control.dispatch('click');assert(!blocked.hero.classList.contains('is-fallback'));
 blocked.video.pause();blocked.video.error={code:2};blocked.video.dispatch('error');assert.equal(blocked.text.textContent,'重試播放');blocked.control.dispatch('click');assert.equal(blocked.video.loads,1);
 for(const file of ['assets/smart-home-hero.mp4','assets/smart-home-hero-poster.jpg','assets/smart-home-hero-end.jpg'])assert(fs.existsSync(__dirname+'/../'+file));
 console.log('PASS: muted autoplay, pause/resume, manual-pause retention, end-frame hold, replay, reduced motion, data saver, blocked autoplay, media retry, asset availability');
})().catch(e=>{console.error(e);process.exitCode=1});
