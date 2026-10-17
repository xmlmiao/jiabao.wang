import { Application, Assets, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { ATLAS } from './cat/atlas';
import type { CatController } from './cat/model';
import { assetUrl } from './gallery';
import type { Hotspot } from './interactions';
import { paintBox, paintRoom, pixelCanvas } from './room-art';
import { BOX, CAT_HEIGHT, CAT_WIDTH, HEIGHT, WIDTH, type Phase } from './world';

const HEART=['.kk.kk.','kppkppk','kpppppk','.kpppk.','..kpk..','...k...'];
const BALL=['..kkkk..','.kppppk.','kppwpppk','kpwpwppk','kppwpwpk','.kppppk.','..kkkk..'];
function nearest(texture:Texture){texture.source.scaleMode='nearest';return texture;}
function pixelTexture(rows:string[],palette:Record<string,string>){return nearest(Texture.from(pixelCanvas(rows[0].length,rows.length,ctx=>rows.forEach((row,y)=>[...row].forEach((key,x)=>{if(palette[key]){ctx.fillStyle=palette[key];ctx.fillRect(x,y,1,1);}})))));}
function roomTint(color:number,phase:Phase){
  if(phase==='day')return color;
  const overlay=phase==='night'?[10,10,40]:[255,120,60],alpha=phase==='night'?.28:.08;
  const channels=[color>>16&255,color>>8&255,color&255].map((c,i)=>Math.round(c*(1-alpha)+overlay[i]*alpha));
  return channels[0]<<16|channels[1]<<8|channels[2];
}
export async function createScene(canvas:HTMLCanvasElement,hotspots:Hotspot[],onCat:()=>void,onEmpty:()=>void){
  const app=new Application();
  await app.init({canvas,width:WIDTH,height:HEIGHT,autoStart:false,sharedTicker:false,antialias:false,roundPixels:true,resolution:1,autoDensity:false,backgroundAlpha:0,preference:'webgl',powerPreference:'low-power',eventFeatures:{move:true,globalMove:false,click:true,wheel:false}});
  app.stage.label='cottage';app.stage.eventMode='static';app.stage.hitArea=new Rectangle(0,0,WIDTH,HEIGHT);
  app.renderer.events.cursorStyles.default='default';
  canvas.style.touchAction='manipulation';
  const ownedTextures:Texture[]=[];
  const own=(texture:Texture)=>{ownedTextures.push(texture);return nearest(texture);};
  const sky=new Graphics({label:'window-sky'}),room=new Sprite({label:'room-artwork'}),cursor=new Graphics({label:'computer-cursor'}),flag=new Graphics({label:'mail-flag'});
  const boxBack=new Sprite({texture:own(Texture.from(paintBox(false))),label:'box-back',x:BOX.x,y:BOX.y});
  const boxFront=new Sprite({texture:own(Texture.from(paintBox(true))),label:'box-front',x:BOX.x,y:BOX.y});
  const bodyContainer=new Container({label:'baxa-body'}),body=new Sprite({label:'baxa-frame'});bodyContainer.addChild(body);
  const paws=new Sprite({label:'baxa-front-paws'});
  let atlas:Texture|null=null;
  try{atlas=nearest(await Assets.load<Texture>(assetUrl('assets/baxa/animation-atlas.png')));}catch{/* A small cat remains visible if its sheet cannot load. */}
  // Register each frame at its logical pixel size once. This preserves the
  // previous Canvas 2D sampling (especially single-pixel eyes) on every GPU.
  const resource=atlas?.source.resource as CanvasImageSource|undefined;
  const frames=resource?ATLAS.map(m=>own(Texture.from(pixelCanvas(m.w,m.h,ctx=>ctx.drawImage(resource,m.sx,m.sy,m.sw,m.sh,0,0,m.w,m.h))))):[];
  if(resource){const m=ATLAS[21];paws.texture=own(Texture.from(pixelCanvas(m.w,2,ctx=>ctx.drawImage(resource,m.sx,m.sy+m.sh-24,m.sw,24,0,0,m.w,2))));}
  const fallback=own(Texture.from(pixelCanvas(CAT_WIDTH,CAT_HEIGHT,ctx=>{
    ctx.fillStyle='#231f29';ctx.fillRect(6,10,12,10);ctx.fillRect(7,8,3,3);ctx.fillRect(14,8,3,3);ctx.fillStyle='#ece1d4';ctx.fillRect(10,15,6,5);
  })));
  const effects=new Container({label:'cat-effects'});
  const ball=new Sprite({texture:own(pixelTexture(BALL,{k:'#47243d',p:'#ff86b3',w:'#ffe0ec'})),label:'yarn-ball'});
  const yarn=new Graphics({label:'yarn-thread'});
  const heart=new Sprite({texture:own(pixelTexture(HEART,{k:'#47243d',p:'#ff86b3'})),label:'heart'});
  const z=new Sprite({texture:own(Texture.from(pixelCanvas(5,7,ctx=>{ctx.fillStyle='#ede2ff';ctx.font='5px monospace';ctx.textBaseline='top';ctx.fillText('z',0,0);}))),label:'sleep-z'});
  const meow=new Sprite({texture:own(Texture.from(pixelCanvas(22,12,ctx=>{ctx.fillStyle='#302640';ctx.fillRect(0,0,22,10);ctx.fillRect(12,10,2,2);ctx.fillStyle='#fbf2df';ctx.fillRect(1,1,20,8);ctx.fillStyle='#302640';ctx.font='7px monospace';ctx.textBaseline='top';ctx.fillText('喵?',3,1);}))),label:'meow'});
  effects.addChild(ball,yarn,z,heart,meow);
  app.stage.addChild(sky,room,cursor,flag,boxBack,bodyContainer,boxFront,paws,effects);
  for(const layer of [sky,room,cursor,flag,boxBack,bodyContainer,boxFront,paws,effects])layer.eventMode='none';
  const hitLayer=new Container({label:'room-hotspots'});
  [...hotspots].sort((a,b)=>b.w*b.h-a.w*a.h).forEach(item=>{
    const hit=new Container({label:item.name});hit.hitArea=new Rectangle(item.x,item.y,item.w,item.h);hit.eventMode='static';hit.cursor='pointer';
    hit.on('pointertap',event=>{event.stopPropagation();item.activate();});hitLayer.addChild(hit);
  });
  const catHit=new Container({label:'baxa-hit-area'});catHit.hitArea=new Rectangle(2,-CAT_HEIGHT,CAT_WIDTH-4,CAT_HEIGHT);catHit.eventMode='dynamic';catHit.cursor='pointer';
  catHit.on('pointertap',event=>{event.stopPropagation();onCat();});hitLayer.addChild(catHit);
  app.stage.addChild(hitLayer);app.stage.on('pointertap',onEmpty);
  const backgrounds=new Map<Phase,Texture>();
  let previousPhase:Phase|null=null,previousSkyFrame=-1,previousCursor=-1,previousFlag=-1;
  function update(controller:CatController,time:number,phase:Phase,reducedMotion:boolean,cloudEdge:boolean){
    const cat=controller.cat,f=Math.floor(time*60),phaseChanged=phase!==previousPhase;
    if(phaseChanged){
      let texture=backgrounds.get(phase);if(!texture){texture=own(Texture.from(paintRoom(phase)));backgrounds.set(phase,texture);}room.texture=texture;previousPhase=phase;
    }
    const skyFrame=f>>3;
    if(phaseChanged||skyFrame!==previousSkyFrame){
      previousSkyFrame=skyFrame;sky.clear();
      const color={day:0x8fd3ff,dusk:0xff9e6b,night:0x1a1f4a}[phase];sky.rect(12,16,32,26).fill(color);
      if(phase==='night'){
        sky.rect(34,20,4,4).fill(0xfff6c2).rect(35,21,3,3).fill(color);
        [[16,20],[24,30],[40,34],[20,36],[28,22]].forEach(([x,y],i)=>{if(((f>>4)+i)&1)sky.rect(x,y,1,1).fill(0xffffff);});
      }else{
        sky.rect(phase==='day'?36:16,phase==='day'?20:32,5,5).fill(phase==='day'?0xfff3a0:0xffe08a);
        const x=cloudEdge?38:12+((f>>3)%48)-8;sky.rect(x,24,8,2).fill(0xffffff).rect(x+2,23,4,1).fill(0xffffff);
      }
    }
    const cursorFrame=(f>>4)&1;
    if(phaseChanged||cursorFrame!==previousCursor){previousCursor=cursorFrame;cursor.clear();if(cursorFrame)cursor.rect(79,59,2,1).fill(roomTint(0xffffff,phase));}
    const flagFrame=(f>>5)&1;
    if(phaseChanged||flagFrame!==previousFlag){previousFlag=flagFrame;flag.clear().rect(28,62,4,3).fill(roomTint(flagFrame?0xffd25a:0xf2c94c,phase));}
    const pose=cat.state==='box'?'box':cat.meow>0?'look':cat.state,flip=pose!=='box'&&cat.dir<0;
    bodyContainer.position.set(Math.round(cat.x)+(flip?CAT_WIDTH:0),pose==='box'?BOX.rim+1:cat.foot);bodyContainer.scale.x=flip?-1:1;
    const index=controller.frameIndex(pose,time,reducedMotion),m=ATLAS[index];
    if(atlas){body.texture=frames[index];body.position.set(m.dx,-m.h);body.width=m.w;body.height=m.h;}
    else{body.texture=fallback;body.position.set(0,-CAT_HEIGHT);body.width=CAT_WIDTH;body.height=CAT_HEIGHT;}
    paws.visible=!!atlas&&cat.state==='box';
    if(paws.visible){const m=ATLAS[21];paws.position.set(Math.round(cat.x)+m.dx,BOX.rim-1);paws.width=m.w;paws.height=2;}
    catHit.position.set(cat.x,cat.foot);
    ball.visible=pose==='play';yarn.visible=ball.visible;
    if(ball.visible){
      const swing=reducedMotion?0:Math.round((1-Math.cos(cat.elapsed*4.5))*1.5);
      const bx=Math.round(cat.x)+(flip?-8-swing:CAT_WIDTH+swing),by=cat.foot-7;ball.position.set(bx,by);
      yarn.clear().rect(bx+(flip?8:-3),by+5,3,1).rect(bx+(flip?10:-4),by+4,1,2).fill(0xffe0ec);
    }
    z.visible=pose==='sleep';if(z.visible)z.position.set(Math.round(cat.x)+CAT_WIDTH-2,cat.foot-CAT_HEIGHT-5-(reducedMotion?0:Math.floor(time%2.4)));
    heart.visible=meow.visible=cat.meow>0;
    if(cat.meow>0){heart.position.set(Math.max(2,Math.min(WIDTH-9,Math.round(cat.x)+CAT_WIDTH+7)),cat.foot-CAT_HEIGHT-9-Math.min(4,Math.floor(cat.reactElapsed*2)));meow.position.set(Math.max(2,Math.min(WIDTH-25,Math.round(cat.x)-9)),cat.foot-CAT_HEIGHT-13);}
  }
  canvas.dataset.renderer='pixi-webgl';
  return {app,update,destroy(){app.destroy(false,{children:true});ownedTextures.forEach(t=>t.destroy(false));if(atlas)Assets.unload(assetUrl('assets/baxa/animation-atlas.png'));}};
}
