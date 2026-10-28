import type { CatPose } from './model';

const S = 6;
const FUR = '#2c2c2c';
const EDGE = '#4a403c';
const CREAM = '#f7f3ec';
const PINK = '#f3a8b6';

export interface CatFrame {canvas:HTMLCanvasElement;w:number;h:number;dx:number}

function surface(w:number,h:number,paint:(ctx:CanvasRenderingContext2D)=>void){
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(w*S);canvas.height=Math.ceil(h*S);
  const ctx=canvas.getContext('2d')!;
  ctx.scale(S,S);ctx.lineJoin='round';ctx.lineCap='round';
  paint(ctx);
  return canvas;
}
function blob(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string){
  ctx.fillStyle=EDGE;ctx.beginPath();ctx.ellipse(x,y,rx+.4,ry+.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
}
function eye(ctx:CanvasRenderingContext2D,x:number,y:number,blink:boolean){
  if(blink){ctx.strokeStyle=FUR;ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(x-1,y);ctx.lineTo(x+1,y);ctx.stroke();return;}
  ctx.fillStyle='#2a2420';ctx.beginPath();ctx.ellipse(x,y,.65,.85,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+.2,y-.25,.18,0,Math.PI*2);ctx.fill();
}
function face(ctx:CanvasRenderingContext2D,x:number,y:number,blink:boolean,open:boolean){
  blob(ctx,x,y,3.3,2.5,CREAM);
  eye(ctx,x-1.6,y-1.5,blink);eye(ctx,x+1.6,y-1.5,blink);
  ctx.fillStyle=PINK;ctx.beginPath();ctx.ellipse(x,y+.35,.65,.42,0,0,Math.PI*2);ctx.fill();
  if(!open)return;
  ctx.fillStyle='#e9879a';ctx.beginPath();ctx.ellipse(x,y+1.15,1.15,.7,0,0,Math.PI);ctx.fill();
}
function ears(ctx:CanvasRenderingContext2D,x:number,y:number){
  ctx.fillStyle=EDGE;
  ctx.beginPath();ctx.moveTo(x-5.4,y);ctx.lineTo(x-3.5,y-4.2);ctx.lineTo(x-1.1,y+.4);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(x+5.4,y);ctx.lineTo(x+3.5,y-4.2);ctx.lineTo(x+1.1,y+.4);ctx.closePath();ctx.fill();
  ctx.fillStyle=FUR;
  ctx.beginPath();ctx.moveTo(x-4.8,y);ctx.lineTo(x-3.5,y-3.3);ctx.lineTo(x-1.7,y+.2);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(x+4.8,y);ctx.lineTo(x+3.5,y-3.3);ctx.lineTo(x+1.7,y+.2);ctx.closePath();ctx.fill();
  ctx.fillStyle=PINK;
  ctx.beginPath();ctx.moveTo(x-4.1,y-.2);ctx.lineTo(x-3.5,y-2.2);ctx.lineTo(x-2.5,y);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(x+4.1,y-.2);ctx.lineTo(x+3.5,y-2.2);ctx.lineTo(x+2.5,y);ctx.closePath();ctx.fill();
}
function front(ctx:CanvasRenderingContext2D,w:number,h:number,blink:boolean,paw:number){
  const x=w/2;
  ctx.strokeStyle=FUR;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x-4,h-7);ctx.quadraticCurveTo(1.5,h-3,2.4,h-11);ctx.stroke();
  blob(ctx,x,h-7,7.2,5.2,FUR);
  blob(ctx,x+.2,h-6.2,4.2,4,CREAM);
  blob(ctx,x-3.4,h-2.2,2.1,1.25,CREAM);blob(ctx,x+3.4,h-2.2,2.1,1.25,CREAM);
  if(paw)blob(ctx,x+(paw>1?3:-3),h-9,1.5,1.8,CREAM);
  blob(ctx,x,h-13.2,5.6,4.8,FUR);
  ears(ctx,x,h-15.5);
  face(ctx,x,h-12.2,blink,true);
}
function side(ctx:CanvasRenderingContext2D,w:number,h:number,step:number,low:boolean){
  const ground=h-(low?2.2:1.2),bodyY=ground-(low?4:6.5);
  ctx.strokeStyle=FUR;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(5,bodyY);ctx.quadraticCurveTo(1,bodyY-4,4,bodyY-7);ctx.stroke();
  blob(ctx,w*.48,bodyY,7.2,low?3.4:4.2,FUR);
  blob(ctx,w*.48,bodyY+.4,3.2,low?2:2.6,CREAM);
  const legs=[-4.2,-1.4,1.6,4.4];
  legs.forEach((offset,i)=>{
    const lift=!low&&(i%2===step%2)?1.6:0;
    blob(ctx,w*.48+offset,ground-1.2-lift,.7,low?1.2:2.1,FUR);
  });
  ears(ctx,w*.72,bodyY-4);
  blob(ctx,w*.74,bodyY-3.2,3.5,3.2,FUR);
  face(ctx,w*.86,bodyY-2.6,false,step===0);
}
function draw(ctx:CanvasRenderingContext2D,pose:CatPose,step:number,blink:boolean,w:number,h:number){
  if(pose==='sit'||pose==='look')front(ctx,w,h,blink,0);
  else if(pose==='groom')front(ctx,w,h,blink,step===0?2.2:3.4);
  else if(pose==='stand'||pose==='walk'||pose==='play')side(ctx,w,h,pose==='stand'?0:step,false);
  else if(pose==='crouch')side(ctx,w,h,0,true);
  else if(pose==='lie'||pose==='sleep'){
    blob(ctx,w*.5,h-3.4,9,3.1,FUR);blob(ctx,w*.55,h-3.2,4,2,CREAM);
    blob(ctx,w*.78,h-5.2,3.2,2.6,FUR);face(ctx,w*.84,h-4.8,pose==='sleep'||blink,false);
  }else if(pose==='back'){
    blob(ctx,w/2,h-6,6.5,5.5,FUR);blob(ctx,w/2,h-1.4,2.2,1.2,FUR);
    ears(ctx,w/2,h-12);blob(ctx,w/2,h-10,5,4.4,FUR);
  }else{
    const x=w/2;
    ears(ctx,x,4.2);blob(ctx,x,6.2,5.2,3.6,FUR);face(ctx,x,6.8,blink,true);
  }
}

const SPECS:{pose:CatPose;step:number;blink:boolean;w:number;h:number;dx:number}[]=[
  {pose:'sit',step:0,blink:false,w:22,h:20,dx:1},
  {pose:'sit',step:0,blink:true,w:22,h:20,dx:1},
  {pose:'stand',step:0,blink:false,w:22,h:18,dx:1},
  {pose:'stand',step:1,blink:false,w:22,h:18,dx:1},
  {pose:'look',step:0,blink:false,w:22,h:20,dx:1},
  {pose:'look',step:0,blink:true,w:22,h:20,dx:1},
  {pose:'walk',step:0,blink:false,w:24,h:18,dx:0},
  {pose:'walk',step:1,blink:false,w:24,h:18,dx:0},
  {pose:'walk',step:2,blink:false,w:24,h:18,dx:0},
  {pose:'walk',step:3,blink:false,w:24,h:18,dx:0},
  {pose:'crouch',step:0,blink:false,w:24,h:14,dx:0},
  {pose:'lie',step:0,blink:false,w:26,h:12,dx:-1},
  {pose:'sleep',step:0,blink:false,w:26,h:12,dx:-1},
  {pose:'sleep',step:1,blink:true,w:26,h:12,dx:-1},
  {pose:'groom',step:0,blink:false,w:22,h:20,dx:1},
  {pose:'groom',step:1,blink:false,w:22,h:20,dx:1},
  {pose:'groom',step:2,blink:false,w:22,h:20,dx:1},
  {pose:'back',step:0,blink:false,w:18,h:18,dx:3},
  {pose:'play',step:0,blink:false,w:24,h:18,dx:0},
  {pose:'play',step:1,blink:false,w:24,h:18,dx:0},
  {pose:'play',step:2,blink:false,w:24,h:18,dx:0},
  {pose:'box',step:0,blink:false,w:16,h:10,dx:5},
  {pose:'box',step:0,blink:true,w:16,h:10,dx:5},
  {pose:'box',step:1,blink:false,w:16,h:10,dx:5},
];

export function catFrames():CatFrame[]{
  return SPECS.map(spec=>({canvas:surface(spec.w,spec.h,ctx=>draw(ctx,spec.pose,spec.step,spec.blink,spec.w,spec.h)),w:spec.w,h:spec.h,dx:spec.dx}));
}
export function paintPaws(){
  return surface(12,3,ctx=>{
    blob(ctx,3,1.5,2.1,1.05,CREAM);blob(ctx,8.4,1.5,2.1,1.05,CREAM);
  });
}
export function paintHeart(){
  return surface(10,9,ctx=>{
    ctx.fillStyle='#f29cb4';
    ctx.beginPath();ctx.ellipse(3.1,3.2,2.2,2.2,0,0,Math.PI*2);ctx.ellipse(6.7,3.2,2.2,2.2,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(1.2,4);ctx.lineTo(4.9,8.2);ctx.lineTo(8.6,4);ctx.closePath();ctx.fill();
  });
}
export function paintBall(){
  return surface(8,8,ctx=>{
    blob(ctx,4,4,3.1,3.1,'#f4a4be');
    ctx.strokeStyle='#fff';ctx.lineWidth=.45;ctx.beginPath();ctx.arc(4,4,1.6,0,Math.PI*1.4);ctx.stroke();
  });
}
export function paintBubble(text:string){
  const w=58,h=18;
  return surface(w,h,ctx=>{
    ctx.fillStyle='#8d6b4e';ctx.beginPath();ctx.roundRect(.4,.4,w-1,h-5,5);ctx.fill();
    ctx.fillStyle='#fffaf3';ctx.beginPath();ctx.roundRect(1,1,w-2.4,h-6.2,4.4);ctx.fill();
    ctx.fillStyle='#8d6b4e';ctx.beginPath();ctx.moveTo(w*.62,h-5);ctx.lineTo(w*.74,h-1);ctx.lineTo(w*.5,h-5);ctx.fill();
    ctx.fillStyle='#fffaf3';ctx.beginPath();ctx.moveTo(w*.6,h-5.6);ctx.lineTo(w*.7,h-2.2);ctx.lineTo(w*.52,h-5.6);ctx.fill();
    ctx.fillStyle='#5c4638';ctx.font='7px "WenQuanYi Micro Hei","Droid Sans Fallback",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,w/2,6.1);
  });
}
