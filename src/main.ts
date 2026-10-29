import { createCatController } from './cat/model';
import { FixedClock } from './clock';
import { createDialog } from './dialog';

import { prepareGallery } from './gallery';
import { greetBaxa, roomHotspots } from './interactions';
import { createScene } from './scene';
import { getPhase, HEIGHT, WIDTH } from './world';

async function start(){
  const canvas=document.querySelector<HTMLCanvasElement>('#c')!,stage=document.querySelector<HTMLDivElement>('#stage')!,element=document.querySelector<HTMLDivElement>('#dlg')!;
  const search=new URLSearchParams(location.search),motion=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
  const dialog=createDialog(element),controller=createCatController(search.get('cat')),clock=new FixedClock();
  function fit(){const pad=innerWidth<500?24:32,raw=Math.min((innerWidth-pad)/WIDTH,(innerHeight-150)/HEIGHT,6);let scale=Math.floor(raw);if(scale<2)scale=Math.max(1,(innerWidth-pad)/WIDTH);canvas.style.width=WIDTH*scale+'px';canvas.style.height=HEIGHT*scale+'px';stage.style.setProperty('--scene-height',HEIGHT*scale+'px');element.style.fontSize=(scale<=2?12:14)+'px';}
  fit();addEventListener('resize',fit,{signal:events.signal});
  await prepareGallery();
  const phase=()=>getPhase(search);
  const scene=await createScene(canvas,roomHotspots(dialog,controller,phase),()=>greetBaxa(controller,dialog),dialog.close);
  fit();let fresh=true;
  document.addEventListener('visibilitychange',()=>{clock.reset();fresh=true;},{signal:events.signal});
  motion.addEventListener('change',()=>{clock.reset();fresh=true;},{signal:events.signal});
  scene.app.ticker.add(ticker=>{
    if(document.hidden||motion.matches){
      clock.reset();fresh=true;
      if(!document.hidden&&motion.matches)controller.stepReaction(Math.min(ticker.elapsedMS/1000,.1));
    }
    else if(fresh)fresh=false;
    else clock.advance(ticker.elapsedMS,controller.step);
    scene.update(controller,clock.time,phase(),motion.matches,search.get('cloud')==='edge');
  });
  scene.update(controller,0,phase(),motion.matches,search.get('cloud')==='edge');
  scene.app.render();stage.dataset.ready='true';scene.app.start();
  if(import.meta.hot)import.meta.hot.dispose(()=>{events.abort();dialog.destroy();scene.destroy();});
}
start().catch((error:unknown)=>{
  console.error(error);
  const element=document.querySelector<HTMLDivElement>('#dlg')!;
  element.style.display='block';element.textContent='小屋暂时没能加载，刷新一下再试试吧。';
  document.querySelector('#stage')!.setAttribute('data-load-error','true');
});

