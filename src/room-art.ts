import {galleryLayout} from './gallery';
import {WIDTH as W,HEIGHT as H,BOX,type Phase} from './world';

export const WINDOW={x:12,y:16,w:32,h:26} as const;
export const BOX_PAD=4;
const S=6;

export function pixelCanvas(width:number,height:number,paint:(ctx:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;paint(ctx);return c}
function smoothCanvas(width:number,height:number,paint:(ctx:CanvasRenderingContext2D)=>void){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';paint(ctx);return canvas;
}
function rounded(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.55;ctx.stroke();}
}

export function paintRoom(ph:Phase){
  return smoothCanvas(W*S,H*S,X=>{
    X.scale(S,S);X.lineJoin='round';X.lineCap='round';
    const night=ph==='night',dusk=ph==='dusk';
    X.fillStyle=night?'#e6d8c6':dusk?'#f4decc':'#f7ecdf';
    X.fillRect(0,0,W,90);
    X.fillStyle=night?'#d9c8b2':'#ead8c0';
    for(let i=0;i<70;i++)X.fillRect((i*47)%186+3,(i*29)%68+4,.7,.7);
    X.fillStyle=night?'#c9d4c2':'#d7e4cf';X.fillRect(0,76,W,14);
    X.fillStyle=night?'#b7c4b0':'#c5d5bb';
    for(let x=4;x<W;x+=8)X.fillRect(x,79,.35,8);
    X.fillStyle='#ecd8b6';X.fillRect(0,88.2,W,2.2);
    X.fillStyle=night?'#d2b089':'#efd0a4';X.fillRect(0,90,W,H-90);
    X.fillStyle=night?'#c4a27c':'#e2bc8c';
    for(let y=96,row=0;y<H;y+=8,row++){X.fillRect(0,y,W,.28);for(let x=(row%2)*28;x<W;x+=56)X.fillRect(x,y,.28,8);}

    rounded(X,8,12,40,32,2,'#e0b06e','#c48b49');
    X.clearRect(WINDOW.x,WINDOW.y,WINDOW.w,WINDOW.h);
    X.fillStyle='#d79a58';
    X.fillRect(WINDOW.x,28.4,WINDOW.w,1.35);X.fillRect(27.2,WINDOW.y,1.35,WINDOW.h);
    rounded(X,6,42,44,3.4,1,'#e8c088','#c99655');
    X.fillStyle='#5f9a58';
    X.beginPath();X.ellipse(34,33,3.4,2,-.8,0,Math.PI*2);X.ellipse(40,32,3.3,1.9,.6,0,Math.PI*2);X.ellipse(37,31,2.2,2.4,0,0,Math.PI*2);X.fill();
    rounded(X,34.2,34.5,6.2,4.2,.7,'#e07a45','#c45e34');

    galleryLayout().forEach(({x,y,w,h},index)=>{
      const cx=x+w/2;
      X.strokeStyle='#b7a48c';X.lineWidth=.45;X.beginPath();X.moveTo(cx-5,y);X.lineTo(cx,y-5);X.lineTo(cx+5,y);X.stroke();
      X.fillStyle='#b7a48c';X.beginPath();X.arc(cx,y-6,.7,0,Math.PI*2);X.fill();
      X.fillStyle='rgba(120,86,48,.13)';X.beginPath();X.roundRect(x+.8,y+1.2,w,h,1.6);X.fill();
      rounded(X,x,y,w,h,1.8,'#d59a5c','#b67b3d');
      rounded(X,x+1.5,y+1.5,w-3,h-3,1,'#f8f2e6');
      if(index===galleryLayout().length-1){
        X.save();X.strokeStyle='#cbb79a';X.lineWidth=.7;X.setLineDash([1.3,1.05]);
        X.strokeRect(x-1.6,y-1.6,w+3.2,h+3.2);X.restore();
      }
    });

    rounded(X,156,32,30,56,2,'#d7a15d','#b67d3c');
    X.fillStyle='#f3e2c4';X.beginPath();X.roundRect(159,35,24,50,1);X.fill();
    const spines=['#e07b78','#7eb0b4','#e2c56b','#8aaa78','#c48bb8','#e09a62','#7f93c4'];
    [38,52,68].forEach((shelf,row)=>{
      for(let i=0;i<6;i++){
        const bh=7+((i*3+row)%4),bx=160+i*3.7;
        rounded(X,bx,shelf+12-bh,3.2,bh,.4,spines[(i+row)%spines.length]);
      }
      X.fillStyle='#e2b56a';X.fillRect(159,shelf+12,24,1.5);
    });

    X.fillStyle='rgba(120,90,50,.12)';X.beginPath();X.ellipse(96,118,34,3.2,0,0,Math.PI*2);X.fill();
    rounded(X,62,108,68,13,3,'#6ea0b0');
    X.strokeStyle='#f7f3ea';X.lineWidth=.7;
    for(let x=70;x<124;x+=9){X.beginPath();X.moveTo(x,114.5);X.lineTo(x+2.2,112.2);X.lineTo(x+4.4,114.5);X.lineTo(x+2.2,116.8);X.closePath();X.stroke();}

    rounded(X,59,67,50,5,1.2,'#e4b578','#c49256');
    rounded(X,63,72,3.2,16,.6,'#d7a468');rounded(X,102,72,3.2,16,.6,'#d7a468');
    rounded(X,88,72,12,6,1,'#e6bc84');
    rounded(X,69,48,24,18,2,'#6f7d86','#5d6a72');
    X.fillStyle='#24343c';X.beginPath();X.roundRect(71,50,20,12,1);X.fill();
    X.fillStyle='#8fd0c4';X.fillRect(73,53,11,.7);X.fillRect(73,55.2,7,.7);X.fillRect(73,57.4,12,.7);
    X.fillStyle='#f0d7a4';X.fillRect(73,59.6,6,.7);
    rounded(X,76,66,10,1.4,.4,'#d9d3c6');
    rounded(X,95,59,6.2,7.2,1.6,'#fffaf3','#e4cbb4');
    X.strokeStyle='#e4cbb4';X.lineWidth=.7;X.beginPath();X.arc(101.4,62.4,2,-Math.PI/2,Math.PI/2);X.stroke();

    X.strokeStyle='#c6a36a';X.lineWidth=1.3;X.beginPath();X.moveTo(119,67);X.lineTo(119,90);X.stroke();
    rounded(X,113,90,12,2.2,1,'#c6a36a');
    X.fillStyle=night?'#ffe7b0':'#f4e4c2';
    X.beginPath();X.moveTo(116,58);X.lineTo(122,58);X.lineTo(127,67);X.lineTo(111,67);X.closePath();X.fill();
    X.strokeStyle=night?'#e8c98a':'#ddc7a4';X.lineWidth=.6;X.stroke();
    if(night){
      const glow=X.createRadialGradient(119,78,2,119,86,26);
      glow.addColorStop(0,'rgba(255,214,140,.42)');glow.addColorStop(1,'rgba(255,214,140,0)');
      X.fillStyle=glow;X.fillRect(96,66,48,40);
    }else{
      const sun=X.createRadialGradient(28,40,2,78,108,62);
      sun.addColorStop(0,'rgba(255,236,190,.34)');sun.addColorStop(1,'rgba(255,236,190,0)');
      X.fillStyle=sun;X.fillRect(8,70,110,50);
    }

    rounded(X,17,80,2.4,20,.5,'#d7b184','#b88858');
    X.fillStyle='#e15d62';X.beginPath();X.arc(18,66,8,Math.PI,0);X.fill();X.fillRect(10,66,16,10);
    X.strokeStyle='#c4474e';X.lineWidth=.6;X.stroke();X.strokeRect(10,66,16,10);
    X.fillStyle='#fffaf3';X.beginPath();X.roundRect(12.2,68,11.5,5,1);X.fill();
    X.fillStyle='#8d4a42';X.font='3px "WenQuanYi Micro Hei","Droid Sans Fallback",sans-serif';
    X.textAlign='center';X.textBaseline='middle';X.fillText('Bao',18,70.6);
    if(night){X.fillStyle='rgba(70,78,120,.16)';X.fillRect(0,0,W,H);}
    else if(dusk){X.fillStyle='rgba(232,140,90,.08)';X.fillRect(0,0,W,H);}
    X.save();X.globalCompositeOperation='destination-out';X.fillStyle='#000';X.fillRect(WINDOW.x,WINDOW.y,WINDOW.w,WINDOW.h);X.restore();
    X.fillStyle='#d79a58';X.fillRect(WINDOW.x,28.4,WINDOW.w,1.35);X.fillRect(27.2,WINDOW.y,1.35,WINDOW.h);
    X.fillStyle='#5f9a58';
    X.beginPath();X.ellipse(34,33,3.4,2,-.8,0,Math.PI*2);X.ellipse(40,32,3.3,1.9,.6,0,Math.PI*2);X.ellipse(37,31,2.2,2.4,0,0,Math.PI*2);X.fill();
    rounded(X,34.2,34.5,6.2,4.2,.7,'#e07a45','#c45e34');
  });
}

export function drawWindow(ctx:CanvasRenderingContext2D,phase:Phase,time:number,reducedMotion:boolean,cloudEdge:boolean){
  const {w,h}=WINDOW;
  ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,w,h);
  const sky=ctx.createLinearGradient(0,0,0,h);
  if(phase==='night'){sky.addColorStop(0,'#1d2748');sky.addColorStop(1,'#31406a');}
  else if(phase==='dusk'){sky.addColorStop(0,'#f2b08a');sky.addColorStop(1,'#f6c9a4');}
  else{sky.addColorStop(0,'#8ecff0');sky.addColorStop(1,'#d7f0c8');}
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  if(phase==='night'){
    ctx.fillStyle='#fff4c8';ctx.beginPath();ctx.arc(23,8,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1d2748';ctx.beginPath();ctx.arc(24.2,7.4,2.1,0,Math.PI*2);ctx.fill();
    const pulseCycle=Math.floor(time/12),pulseTime=time%12;
    const pulse=!reducedMotion&&pulseTime>=8&&pulseTime<9.8?Math.sin((pulseTime-8)/1.8*Math.PI):0;
    [[6,6],[12,12],[20,15],[8,16],[16,5]].forEach(([x,y],i)=>{
      ctx.globalAlpha=.55+.45*(i===pulseCycle%5?pulse:0);ctx.fillStyle='#fff6d8';ctx.fillRect(x,y,.8,.8);ctx.globalAlpha=1;
    });
  }else{
    ctx.fillStyle=phase==='day'?'#ffe56a':'#ffb15e';ctx.beginPath();ctx.arc(phase==='day'?24:8,phase==='day'?7:12,2.5,0,Math.PI*2);ctx.fill();
    const drift=cloudEdge?22:((time*6)%36)-8;
    ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.ellipse(drift,9,5,2.1,0,0,Math.PI*2);ctx.ellipse(drift+3.2,8,3,1.5,0,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=phase==='night'?'#2c3b34':phase==='dusk'?'#7e8b5c':'#8fbf78';
  ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,17);ctx.quadraticCurveTo(8,13,16,17);ctx.quadraticCurveTo(24,20,32,15);ctx.lineTo(w,h);ctx.fill();
  ctx.fillStyle=phase==='night'?'#243228':phase==='dusk'?'#6d7a52':'#79a868';
  ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,20);ctx.quadraticCurveTo(14,17,w,21);ctx.lineTo(w,h);ctx.fill();
}

export function paintBox(front:boolean){
  const width=BOX.w+BOX_PAD*2,height=BOX.h+1+BOX_PAD;
  return smoothCanvas(width*S,height*S,X=>{
    X.scale(S,S);X.translate(-(BOX.x-BOX_PAD),-(BOX.y-BOX_PAD));X.lineJoin='round';
    const {x,y,w,h}=BOX;
    if(!front){
      X.fillStyle='#e8c88a';X.beginPath();X.moveTo(x+2,y+3);X.lineTo(x+6,y-3);X.lineTo(x+w/2-1,y-1);X.lineTo(x+2,y+6);X.closePath();X.fill();
      X.beginPath();X.moveTo(x+w-2,y+3);X.lineTo(x+w-6,y-3);X.lineTo(x+w/2+1,y-1);X.lineTo(x+w-2,y+6);X.closePath();X.fill();
      X.strokeStyle='#c4965c';X.lineWidth=.5;X.stroke();
      X.fillStyle='#c99558';X.beginPath();X.roundRect(x+2,y+3,w-4,7,1);X.fill();
      return;
    }
    X.fillStyle='#f0d7a8';
    X.beginPath();X.moveTo(x,y+5);X.lineTo(x-4,y+8);X.lineTo(x+2,y+11);X.closePath();X.fill();
    X.beginPath();X.moveTo(x+w,y+5);X.lineTo(x+w+4,y+8);X.lineTo(x+w-2,y+11);X.closePath();X.fill();
    X.strokeStyle='#c4965c';X.lineWidth=.45;X.stroke();
    rounded(X,x+1,y+6,w-2,h-5,1.2,'#f3ddb0','#c4965c');
    X.fillStyle='#8d6238';X.font='3.1px "WenQuanYi Micro Hei","Droid Sans Fallback",sans-serif';
    X.textAlign='center';X.textBaseline='middle';X.fillText('BAXA',x+w/2-1,y+11);
    X.fillStyle='#e7c49a';X.beginPath();X.arc(x+w-5,y+h-2.2,.7,0,Math.PI*2);X.fill();
  });
}
