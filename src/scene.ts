import { Application, Assets, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { ATLAS } from './cat/atlas';
import type { CatController } from './cat/model';
import { ART_SIZE, assetUrl, galleryLayout } from './gallery';
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
  // Keep the room's 192x128 pixel grid, but give image covers enough display
  // pixels to preserve faces rather than baking them into 20x20 textures.
  await app.init({canvas,width:WIDTH,height:HEIGHT,autoStart:false,sharedTicker:false,antialias:false,roundPixels:true,resolution:6,autoDensity:false,backgroundAlpha:0,preference:'webgl',powerPreference:'low-power',eventFeatures:{move:true,globalMove:false,click:true,wheel:false}});
  app.stage.label='cottage';app.stage.eventMode='static';app.stage.hitArea=new Rectangle(0,0,WIDTH,HEIGHT);
  app.renderer.events.cursorStyles.default='default';
  canvas.style.touchAction='manipulation';
  const ownedTextures:Texture[]=[];
  const own=(texture:Texture)=>{ownedTextures.push(texture);return nearest(texture);};
  const sky=new Graphics({label:'window-sky'}),room=new Sprite({label:'room-artwork'}),cursor=new Graphics({label:'computer-cursor'}),flag=new Graphics({label:'mail-flag'});
  const covers=new Container({label:'gallery-image-covers'});
  for(const {g,x,y} of galleryLayout()){
    if(!g.timg?.naturalWidth)continue;
    const source=own(Texture.from(g.timg));
    const texture=g.crop?own(new Texture({source:source.source,frame:new Rectangle(...g.crop)})):source;
    covers.addChild(new Sprite({texture,x:x+2,y:y+2,width:ART_SIZE,height:ART_SIZE}));
  }
  const boxBack=new Sprite({texture:own(Texture.from(paintBox(false))),label:'box-back',x:BOX.x,y:BOX.y});
  const boxFront=new Sprite({texture:own(Texture.from(paintBox(true))),label:'box-front',x:BOX.x,y:BOX.y});
  const bodyContainer=new Container({label:'baxa-body'}),body=new Sprite({label:'baxa-frame'});bodyContainer.addChild(body);
  const paws=new Sprite({label:'baxa-front-paws'});
  let atlas:Texture|null=null;
  try{atlas=nearest(await Assets.load<Texture>(assetUrl('assets/baxa/animation-atlas.png')));}catch{/* A small cat remains visible if its sheet cannot load. */}
  // Register each frame at its logical pixel size once. This preserves the
  // previous Canvas 2D sampling (especially single-pixel eyes) on every GPU.
  const resource=atlas?.source.resource as CanvasImageSource|undefined;
  const frames=resource?ATLAS.map(m=>own(Texture.from(pixelCanvas(m.w*2,m.h*2,ctx=>ctx.drawImage(resource,m.sx,m.sy,m.sw,m.sh,0,0,m.w*2,m.h*2))))):[];
  if(resource){const m=ATLAS[21];paws.texture=own(Texture.from(pixelCanvas(m.w,2,ctx=>ctx.drawImage(resource,m.sx,m.sy+m.sh-24,m.sw,24,0,0,m.w,2))));}
  const fallback=own(Texture.from(pixelCanvas(CAT_WIDTH,CAT_HEIGHT,ctx=>{
    ctx.fillStyle='#231f29';ctx.fillRect(6,10,12,10);ctx.fillRect(7,8,3,3);ctx.fillRect(14,8,3,3);ctx.fillStyle='#ece1d4';ctx.fillRect(10,15,6,5);
  })));
  const effects=new Container({label:'cat-effects'});
  const ball=new Sprite({texture:own(pixelTexture(BALL,{k:'#47243d',p:'#ff86b3',w:'#ffe0ec'})),label:'yarn-ball'});
  const yarn=new Graphics({label:'yarn-thread'});
  const heart=new Sprite({texture:own(pixelTexture(HEART,{k:'#47243d',p:'#ff86b3'})),label:'heart'});
  const z=new Sprite({texture:own(Texture.from(pixelCanvas(5,7,ctx=>{ctx.fillStyle='#ede2ff';ctx.font='5px monospace';ctx.textBaseline='top';ctx.fillText('z',0,0);}))),label:'sleep-z'});
  const responses=new Map<string,Texture>();
  for(const text of ['喵～你好呀','呼噜噜…','摸摸我的爪','再睡一会…','小窝好暖～']){
    responses.set(text,own(Texture.from(pixelCanvas(88,28,ctx=>{
      ctx.scale(2,2);ctx.fillStyle='#483448';ctx.fillRect(0,0,44,12);ctx.fillRect(19,12,3,2);
      ctx.fillStyle='#fff3d9';ctx.fillRect(1,1,42,10);ctx.fillStyle='#483448';ctx.font='7px "Microsoft YaHei",sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(text,22,6);
    }))));
  }
  const meow=new Sprite({texture:responses.get('喵～你好呀')!,label:'meow',width:44,height:14});
  const shadow=new Graphics({label:'baxa-ground-shadow'});
  effects.addChild(ball,yarn,z,heart,meow);
  app.stage.addChild(sky,room,covers,cursor,flag,shadow,boxBack,bodyContainer,boxFront,paws,effects);
  for(const layer of [sky,room,covers,cursor,flag,shadow,boxBack,bodyContainer,boxFront,paws,effects])layer.eventMode='none';
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
      boxBack.tint=boxFront.tint=phase==='night'?0xa5a0b4:phase==='dusk'?0xffdcc5:0xffffff;
      bodyContainer.tint=paws.tint=phase==='night'?0xc6c6dc:phase==='dusk'?0xffead5:0xffffff;
      covers.tint=phase==='night'?0xc0bfd2:phase==='dusk'?0xffeee0:0xffffff;
    }
    const skyFrame=f>>3;
    if(phaseChanged||skyFrame!==previousSkyFrame){
      previousSkyFrame=skyFrame;sky.clear();
      const color={day:0x9ccedc,dusk:0xd38e8e,night:0x252e52}[phase];sky.rect(12,16,32,26).fill(color);
      sky.rect(12,32,32,10).fill({day:0xc8e0d8,dusk:0xf2bc94,night:0x384368}[phase]);
      sky.rect(12,39,32,3).fill({day:0x91b6a4,dusk:0x9c8896,night:0x242e4c}[phase]);
      sky.rect(12,38,7,4).rect(19,40,9,2).rect(37,37,7,5).fill({day:0x789d91,dusk:0x7e758d,night:0x20283f}[phase]);
      if(phase==='night'){
        // A stepped crescent opening toward the upper right.
        sky.rect(35,19,2,1).rect(34,20,1,3).rect(35,23,1,1)
          .rect(36,24,3,1).rect(39,22,1,2).fill(0xfff0bd);
        // Stars stay visible. Once per 12 seconds, one gently brightens
        // for 1.8 seconds; successive pulses move around the window.
        const pulseCycle=Math.floor(time/12),pulseTime=time%12;
        const pulse=!reducedMotion&&pulseTime>=8&&pulseTime<9.8
          ?Math.sin((pulseTime-8)/1.8*Math.PI):0;
        [[16,20],[24,30],[40,34],[20,36],[30,22]].forEach(([x,y],i)=>{
          const glow=i===pulseCycle%5?pulse:0;
          sky.rect(x,y,1,1).fill({color:0xf5efdb,alpha:.66+.34*glow});
        });
      }else{
        sky.rect(phase==='day'?36:16,phase==='day'?20:32,5,5).fill(phase==='day'?0xfff3a0:0xffe08a);
        const x=cloudEdge?38:12+((f>>3)%48)-8;sky.rect(x,24,8,2).fill(phase==='day'?0xf3f2df:0xf6d4b6).rect(x+2,23,4,1).fill(phase==='day'?0xf3f2df:0xf6d4b6);
      }
    }
    // A relaxed 1.8-second cycle, visible for the first 1.1 seconds.
    const cursorFrame=reducedMotion||time%1.8<1.1?1:0;
    if(phaseChanged||cursorFrame!==previousCursor){previousCursor=cursorFrame;cursor.clear();if(cursorFrame)cursor.rect(79,59,2,1).fill(roomTint(0xffffff,phase));}
    const flagFrame=(f>>5)&1;
    if(phaseChanged||flagFrame!==previousFlag){previousFlag=flagFrame;flag.clear().rect(28,62,4,3).fill(roomTint(flagFrame?0xffd25a:0xf2c94c,phase));}
    const reacting=cat.meow>0;
    const pose=reacting&&cat.state==='sit'&&cat.reaction==='hello'?'look':cat.state,flip=pose!=='box'&&cat.dir<0;
    const size=pose==='box'?1:1.12;
    bodyContainer.position.set(Math.round(cat.x)+(flip?CAT_WIDTH:0),pose==='box'?BOX.rim+1:cat.foot);
    bodyContainer.scale.set(flip?-size:size,size);
    shadow.visible=pose!=='box';shadow.clear();
    if(shadow.visible)shadow.rect(Math.round(cat.x)+5,cat.foot-1,17,2).fill({color:0x241f31,alpha:.18}).rect(Math.round(cat.x)+8,cat.foot+1,11,1).fill({color:0x241f31,alpha:.1});
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
    meow.visible=reacting;heart.visible=reacting&&cat.reaction!=='sleepy';
    if(reacting){
      const lift=reducedMotion?0:Math.min(3,Math.floor(cat.reactElapsed*1.5));
      const opacity=reducedMotion?1:Math.min(1,cat.reactElapsed/.15,cat.meow/.4);
      meow.alpha=heart.alpha=opacity;
      const text=cat.state==='box'?'小窝好暖～':{hello:'喵～你好呀',purr:'呼噜噜…',paw:'摸摸我的爪',sleepy:'再睡一会…'}[cat.reaction];
      meow.texture=responses.get(text)!;meow.width=44;meow.height=14;
      const headTop=pose==='box'?BOX.rim-10:cat.foot-m.h*size;
      meow.position.set(Math.max(2,Math.min(WIDTH-46,Math.round(cat.x)-10)),headTop-18-lift);
      heart.position.set(Math.max(2,Math.min(WIDTH-9,Math.round(cat.x)+CAT_WIDTH+4)),headTop-5-lift);
    }
  }
  canvas.dataset.renderer='pixi-webgl';
  return {app,update,destroy(){app.destroy(false,{children:true});ownedTextures.forEach(t=>t.destroy(false));if(atlas)Assets.unload(assetUrl('assets/baxa/animation-atlas.png'));}};
}
