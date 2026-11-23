(function(){
  'use strict';
  const stage=document.getElementById('sceneStage');
  const frames=Array.from(stage.querySelectorAll('.scene-frame'));
  const buttons=Array.from(document.querySelectorAll('.scene-controls [data-scene]'));
  const caption=document.getElementById('sceneCaption');
  const copy=document.getElementById('sceneCopy');
  const loading=document.getElementById('sceneLoading');
  const descriptions=[
    '只開啟走廊低位暖光，讓夜間行走看得清楚，同時保留客廳與浴室的安靜黑暗。',
    '浴室內的照明與鏡前燈亮起，走廊和客廳維持原來的低光環境。',
    '客廳、走廊與浴室照明全部關閉，只留下窗外的傍晚環境光。',
    '玄關、走廊與客廳亮起柔和暖光，讓回家的動線與休息空間一起準備好。'
  ];
  const titles=['夜起微光 · 低位暖光','進浴室 · 局部亮燈','出門模式 · 照明全關','回家迎賓 · 柔和暖光'];
  const pending=new Map();let revision=0;
  function imageReady(img){
    if(img.complete)return img.naturalWidth?Promise.resolve():Promise.reject(new Error('image'));
    if(!pending.has(img))pending.set(img,new Promise(function(resolve,reject){
      img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});
    }));
    return pending.get(img);
  }
  function select(index){
    if(!Number.isInteger(index)||!frames[index])return;
    const current=++revision;
    buttons.forEach(function(button){const on=Number(button.dataset.scene)===index;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on))});
    stage.setAttribute('aria-busy','true');loading.hidden=false;loading.textContent='正在載入情境…';
    imageReady(frames[index]).then(function(){
      if(current!==revision)return;
      frames.forEach(function(frame,i){frame.classList.toggle('is-active',i===index)});
      stage.dataset.scene=String(index);caption.textContent='0'+(index+1)+' / '+titles[index];copy.textContent=descriptions[index];
      stage.setAttribute('aria-busy','false');loading.hidden=true;
    }).catch(function(){
      if(current!==revision)return;
      stage.setAttribute('aria-busy','false');loading.textContent='情境圖片暫時無法載入，請重新整理後再試。';
    });
  }
  buttons.forEach(function(button){button.addEventListener('click',function(){select(Number(button.dataset.scene))})});
  select(0);
})();
