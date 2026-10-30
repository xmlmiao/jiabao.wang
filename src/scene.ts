import { COMPACT_ATLAS as ATLAS } from './cat/compact-atlas';
import type { CatController } from './cat/model';
import { ART_SIZE, assetUrl, galleryLayout } from './gallery';
import type { Hotspot } from './interactions';
import { paintBox, paintRoom, pixelCanvas } from './room-art';
import { BOX, CAT_HEIGHT, CAT_WIDTH, HEIGHT, WIDTH, type Phase } from './world';

const HEART=['.kk.kk.','kppkppk','kpppppk','.kpppk.','..kpk..','...k...'];
const BALL=['..kkkk..','.kppppk.','kppwpppk','kpwpwppk','kppwpwpk','.kppppk.','..kkkk..'];
function pixels(rows:string[],palette:Record<string,string>){return pixelCanvas(rows[0].length,rows.length,c=>rows.forEach((row,y)=>[...row].forEach((key,x)=>{if(palette[key]){c.fillStyle=palette[key];c.fillRect(x,y,1,1)}})))}
export function createScene(canvas:HTMLCanvasElement,hotspots:Hotspot[],onCat:()=>void,onEmpty:()=>void){
 canvas.width=WIDTH*6;canvas.height=HEIGHT*6;
 const ctx=canvas.getContext('2d',{alpha:false})!;
 ctx.imageSmoothingEnabled=false;canvas.dataset.renderer='canvas-2d';canvas.style.touchAction='manipulation';
 const events=new AbortController(),backgrounds=new Map<Phase,HTMLCanvasElement>(),tints=new Map<CanvasImageSource,Map<string,HTMLCanvasElement>>();
 const back=paintBox(false),front=paintBox(true),frames:HTMLCanvasElement[]=[];
 const heart=pixels(HEART,{k:'#47243d',p:'#ff86b3'}),ball=pixels(BALL,{k:'#47243d',p:'#ff86b3',w:'#ffe0ec'});
 const fallback=pixelCanvas(CAT_WIDTH,CAT_HEIGHT,c=>{c.fillStyle='#231f29';c.fillRect(6,10,12,10);c.fillRect(7,8,3,3);c.fillRect(14,8,3,3);c.fillStyle='#ece1d4';c.fillRect(10,15,6,5)});
 const z=pixelCanvas(5,7,c=>{c.fillStyle='#ede2ff';c.font='5px monospace';c.textBaseline='top';c.fillText('z',0,0)});
 const responses=new Map<string,HTMLCanvasElement>();
 for(const text of ['喵～你好呀','呼噜噜…','摸摸我的爪','再睡一会…','小窝好暖～'])responses.set(text,pixelCanvas(88,28,c=>{c.scale(2,2);c.fillStyle='#483448';c.fillRect(0,0,44,12);c.fillRect(19,12,3,2);c.fillStyle='#fff3d9';c.fillRect(1,1,42,10);c.fillStyle='#483448';c.font='7px "Microsoft YaHei",sans-serif';c.textBaseline='middle';c.textAlign='center';c.fillText(text,22,6)}));
 let destroyed=false,requestId=0,lastFrame=0,catController:CatController|null=null,paws:HTMLCanvasElement|null=null,keyboardIndex=-1;
 const atlas=new Image();atlas.decoding='async';
 atlas.onload=()=>{if(destroyed)return;for(const m of ATLAS)frames.push(pixelCanvas(m.sw,m.sh,c=>c.drawImage(atlas,m.sx,m.sy,m.sw,m.sh,0,0,m.sw,m.sh)));const m=ATLAS[21];paws=pixelCanvas(m.w,2,c=>c.drawImage(atlas,m.sx,m.sy+m.sh-4,m.sw,4,0,0,m.w,2))};
 // Start image requests in the background; the room and mailbox never wait for them.
 atlas.src=assetUrl('assets/baxa/animation-compact.webp');
 function rect(x:number,y:number,w:number,h:number,color:string){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
 function tint(source:HTMLCanvasElement|HTMLImageElement,color:string){let values=tints.get(source);if(!values){values=new Map();tints.set(source,values)}let image=values.get(color);if(!image){image=pixelCanvas(source.width,source.height,c=>{c.drawImage(source,0,0);c.globalCompositeOperation='multiply';c.fillStyle=color;c.fillRect(0,0,source.width,source.height);c.globalCompositeOperation='destination-in';c.drawImage(source,0,0)});values.set(color,image)}return image}
 function draw(source:HTMLCanvasElement|HTMLImageElement,x:number,y:number,w=source.width,h=source.height,color?:string){ctx.drawImage(color?tint(source,color):source,x,y,w,h)}
 function sky(time:number,phase:Phase,reduced:boolean,edge:boolean){
  const f=Math.floor(time*60);ctx.save();ctx.beginPath();ctx.rect(12,16,32,26);ctx.clip();
  rect(12,16,32,26,{day:'#9ccedc',dusk:'#d38e8e',night:'#252e52'}[phase]);rect(12,32,32,10,{day:'#c8e0d8',dusk:'#f2bc94',night:'#384368'}[phase]);rect(12,39,32,3,{day:'#91b6a4',dusk:'#9c8896',night:'#242e4c'}[phase]);
  for(const [x,y,w,h]of [[12,38,7,4],[19,40,9,2],[37,37,7,5]])rect(x,y,w,h,{day:'#789d91',dusk:'#7e758d',night:'#20283f'}[phase]);
  if(phase==='night'){
   for(const [x,y,w,h]of [[35,19,2,1],[34,20,1,3],[35,23,1,1],[36,24,3,1],[39,22,1,2]])rect(x,y,w,h,'#fff0bd');
   const cycle=Math.floor(time/12),t=time%12,pulse=!reduced&&t>=8&&t<9.8?Math.sin((t-8)/1.8*Math.PI):0;
   [[16,20],[24,30],[40,34],[20,36],[30,22]].forEach(([x,y],i)=>{ctx.globalAlpha=.66+.34*(i===cycle%5?pulse:0);rect(x,y,1,1,'#f5efdb')});ctx.globalAlpha=1;
  }else{rect(phase==='day'?36:16,phase==='day'?20:32,5,5,phase==='day'?'#fff3a0':'#ffe08a');const x=edge?38:12+((f>>3)%48)-8;rect(x,24,8,2,phase==='day'?'#f3f2df':'#f6d4b6');rect(x+2,23,4,1,phase==='day'?'#f3f2df':'#f6d4b6')}
  ctx.restore();
 }
 function update(controller:CatController,time:number,phase:Phase,reducedMotion:boolean,cloudEdge:boolean){
  if(destroyed)return;catController=controller;
  ctx.setTransform(6,0,0,6,0,0);ctx.globalAlpha=1;ctx.clearRect(0,0,WIDTH,HEIGHT);
  sky(time,phase,reducedMotion,cloudEdge);
  let room=backgrounds.get(phase);if(!room){room=paintRoom(phase);backgrounds.set(phase,room)}draw(room,0,0);
  const coverTint=phase==='night'?'#c0bfd2':phase==='dusk'?'#ffeee0':undefined;
  for(const {g,x,y}of galleryLayout())if(g.timg?.naturalWidth){if(g.crop){ctx.drawImage(coverTint?tint(g.timg,coverTint):g.timg,...g.crop,x+2,y+2,ART_SIZE,ART_SIZE)}else draw(g.timg,x+2,y+2,ART_SIZE,ART_SIZE,coverTint)}
  if(reducedMotion||time%1.8<1.1)rect(79,59,2,1,phase==='night'?'#b7b7c4':phase==='dusk'?'#fff4eb':'#fff');
  rect(28,62,4,3,phase==='night'?'#bd9e50':((Math.floor(time*60)>>5)&1)?'#ffd25a':'#f2c94c');
  const cat=controller.cat,reacting=cat.meow>0,pose=reacting&&cat.state==='sit'&&cat.reaction==='hello'?'look':cat.state,flip=pose!=='box'&&cat.dir<0,size=pose==='box'?1:1.12;
  const index=controller.frameIndex(pose,time,reducedMotion),m=ATLAS[index],frame=frames[index];
  if(pose!=='box'){rect(Math.round(cat.x)+5,cat.foot-1,17,2,'#241f312e');rect(Math.round(cat.x)+8,cat.foot+1,11,1,'#241f311a')}
  const boxTint=phase==='night'?'#a5a0b4':phase==='dusk'?'#ffdcc5':undefined,catTint=phase==='night'?'#c6c6dc':phase==='dusk'?'#ffead5':undefined;
  draw(back,BOX.x,BOX.y,back.width,back.height,boxTint);
  ctx.save();ctx.translate(Math.round(cat.x)+(flip?CAT_WIDTH:0),pose==='box'?BOX.rim+1:cat.foot);ctx.scale(flip?-size:size,size);
  if(frame)draw(frame,m.dx,-m.h,m.w,m.h,catTint);else draw(fallback,0,-CAT_HEIGHT,CAT_WIDTH,CAT_HEIGHT,catTint);ctx.restore();
  draw(front,BOX.x,BOX.y,front.width,front.height,boxTint);
  if(paws&&cat.state==='box')draw(paws,Math.round(cat.x)+ATLAS[21].dx,BOX.rim-1,paws.width,2,catTint);
  if(pose==='play'){const swing=reducedMotion?0:Math.round((1-Math.cos(cat.elapsed*4.5))*1.5),x=Math.round(cat.x)+(flip?-8-swing:CAT_WIDTH+swing),y=cat.foot-7;rect(x+(flip?8:-3),y+5,3,1,'#ffe0ec');rect(x+(flip?10:-4),y+4,1,2,'#ffe0ec');draw(ball,x,y)}
  if(pose==='sleep')draw(z,Math.round(cat.x)+CAT_WIDTH-2,cat.foot-CAT_HEIGHT-5-(reducedMotion?0:Math.floor(time%2.4)));
  if(reacting){const lift=reducedMotion?0:Math.min(3,Math.floor(cat.reactElapsed*1.5)),headTop=pose==='box'?BOX.rim-10:cat.foot-m.h*size;
   ctx.globalAlpha=reducedMotion?1:Math.min(1,cat.reactElapsed/.15,cat.meow/.4);
   const text=cat.state==='box'?'小窝好暖～':{hello:'喵～你好呀',purr:'呼噜噜…',paw:'摸摸我的爪',sleepy:'再睡一会…'}[cat.reaction];
   draw(responses.get(text)!,Math.max(2,Math.min(WIDTH-46,Math.round(cat.x)-10)),headTop-18-lift,44,14);
   if(cat.reaction!=='sleepy')draw(heart,Math.max(2,Math.min(WIDTH-9,Math.round(cat.x)+CAT_WIDTH+4)),headTop-5-lift);ctx.globalAlpha=1;
  }
  if(document.activeElement===canvas&&keyboardIndex>=0){const hit=hotspots[keyboardIndex];ctx.strokeStyle='#ffe4a0';ctx.lineWidth=1;ctx.strokeRect(hit.x-.5,hit.y-.5,hit.w+1,hit.h+1)}
 }
 function locate(event:PointerEvent){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*WIDTH/r.width,y:(event.clientY-r.top)*HEIGHT/r.height}}
 const ordered=[...hotspots].sort((a,b)=>a.w*a.h-b.w*b.h);
 function hit(x:number,y:number){const cat=catController?.cat;if(cat&&x>=cat.x+2&&x<=cat.x+CAT_WIDTH-2&&y>=cat.foot-CAT_HEIGHT&&y<=cat.foot)return onCat;return ordered.find(h=>x>=h.x&&x<h.x+h.w&&y>=h.y&&y<h.y+h.h)?.activate}
 let press:{x:number;y:number;id:number}|null=null;
 canvas.addEventListener('pointerdown',e=>{press={x:e.clientX,y:e.clientY,id:e.pointerId}},{signal:events.signal});
 canvas.addEventListener('pointercancel',()=>{press=null},{signal:events.signal});
 canvas.addEventListener('pointerup',e=>{const down=press;press=null;if(!down||down.id!==e.pointerId||Math.hypot(e.clientX-down.x,e.clientY-down.y)>10)return;const p=locate(e);(hit(p.x,p.y)||onEmpty)()},{signal:events.signal});
 canvas.addEventListener('pointermove',e=>{const p=locate(e);canvas.style.cursor=hit(p.x,p.y)?'pointer':'default'},{signal:events.signal});
 canvas.addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();keyboardIndex=(keyboardIndex+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+hotspots.length)%hotspots.length;canvas.setAttribute('aria-label',hotspots[keyboardIndex].name+'，按回车打开')}else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(keyboardIndex<0)keyboardIndex=hotspots.findIndex(h=>h.name.includes('信箱'));hotspots[Math.max(0,keyboardIndex)].activate()}},{signal:events.signal});
 return {update,start(tick:(elapsedMS:number)=>void){const loop=(now:number)=>{if(destroyed)return;requestId=requestAnimationFrame(loop);if(now-lastFrame<1000/30)return;const elapsed=lastFrame?Math.min(250,now-lastFrame):0;lastFrame=now;if(!document.hidden)tick(elapsed)};requestId=requestAnimationFrame(loop)},destroy(){destroyed=true;cancelAnimationFrame(requestId);events.abort();atlas.onload=null;frames.length=0;backgrounds.clear();tints.clear()}};
}
