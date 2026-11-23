const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../assets/smart-scenes.js','utf8');
function node(){const events={},classes=new Set();return {textContent:'',hidden:false,dataset:{},attrs:{},classList:{contains:x=>classes.has(x),toggle(x,on){if(on)classes.add(x);else classes.delete(x)}},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){(events[k]||(events[k]=[])).push(fn)},emit(k){(events[k]||[]).forEach(fn=>fn())}}}
function setup({pending=[],failed=[]}={}){
 const stage=node(),caption=node(),copy=node(),loading=node();
 const frames=Array.from({length:5},(_,i)=>Object.assign(node(),{complete:!pending.includes(i),naturalWidth:failed.includes(i)?0:1672}));
 const buttons=frames.map((_,i)=>Object.assign(node(),{dataset:{scene:String(i)}}));stage.querySelectorAll=()=>frames;
 const elements={sceneStage:stage,sceneCaption:caption,sceneCopy:copy,sceneLoading:loading};
 const ctx={document:{getElementById:id=>elements[id],querySelectorAll:()=>buttons},console};vm.createContext(ctx);vm.runInContext(code,ctx);
 return {stage,caption,copy,loading,frames,buttons};
}
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 let t=setup();await flush();
 for(let i=0;i<5;i++){
  t.buttons[i].emit('click');await flush();assert.equal(t.stage.dataset.scene,String(i));assert.equal(t.frames.filter(f=>f.classList.contains('is-active')).length,1);assert(t.frames[i].classList.contains('is-active'));assert.equal(t.buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);assert.equal(t.stage.attrs['aria-busy'],'false');assert.equal(t.loading.hidden,true);
 }
 assert(t.caption.textContent.includes('電影院模式'));assert(t.copy.textContent.includes('窗簾關上'));
 t=setup({pending:[1]});await flush();t.buttons[1].emit('click');assert.equal(t.loading.hidden,false);t.buttons[3].emit('click');await flush();t.frames[1].complete=true;t.frames[1].emit('load');await flush();assert.equal(t.stage.dataset.scene,'3','a late image must not undo a newer selection');assert(t.frames[3].classList.contains('is-active'));
 t=setup({failed:[2]});await flush();t.buttons[2].emit('click');await flush();assert.equal(t.stage.attrs['aria-busy'],'false');assert.equal(t.loading.hidden,false);assert(t.loading.textContent.includes('暫時無法載入'));assert.equal(t.stage.dataset.scene,'0','retain the visible state when a replacement fails');
 const html=fs.readFileSync(__dirname+'/../smart-home-v2.html','utf8');
 const names=Array.from(html.matchAll(/class="scene-frame[^\"]*" src="([^"]+)"/g),m=>m[1]);assert.equal(new Set(names).size,5);for(const name of names)assert(fs.existsSync(__dirname+'/../'+name));
 console.log('PASS: five distinct scene images, exclusive image/button states, matching descriptions, pending feedback, latest-click race handling, failed-load feedback, production assets');
})().catch(e=>{console.error(e);process.exitCode=1});
