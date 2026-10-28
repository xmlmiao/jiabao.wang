import { Application, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { catFrames, paintBall, paintBubble, paintHeart, paintPaws } from './cat/illustration';
import type { CatController } from './cat/model';
import { ART_SIZE, galleryLayout } from './gallery';
import type { Hotspot } from './interactions';
import { BOX_PAD, drawWindow, paintBox, paintRoom, WINDOW } from './room-art';
import { BOX, CAT_HEIGHT, CAT_WIDTH, HEIGHT, WIDTH, type Phase } from './world';

function linear(texture:Texture){texture.source.scaleMode='linear';return texture;}
function nearest(texture:Texture){texture.source.scaleMode='nearest';return texture;}
export async function createScene(canvas:HTMLCanvasElement,hotspots:Hotspot[],onCat:()=>void,onEmpty:()=>void){
  const app=new Application();
  await app.init({canvas,width:WIDTH,height:HEIGHT,autoStart:false,sharedTicker:false,antialias:true,roundPixels:false,resolution:6,autoDensity:false,backgroundAlpha:0,preference:'webgl',powerPreference:'low-power',eventFeatures:{move:true,globalMove:false,click:true,wheel:false}});
  app.stage.label='cottage';app.stage.eventMode='static';app.stage.hitArea=new Rectangle(0,0,WIDTH,HEIGHT);
  app.renderer.events.cursorStyles.default='default';
  canvas.style.touchAction='manipulation';
  const ownedTextures:Texture[]=[];
  const own=(texture:Texture,smooth=false)=>{ownedTextures.push(texture);return smooth?linear(texture):nearest(texture);};
  const skyCanvas=document.createElement('canvas');skyCanvas.width=WINDOW.w*6;skyCanvas.height=WINDOW.h*6;
  const sky=new Sprite({texture:own(Texture.from(skyCanvas),true),label:'window-sky',x:WINDOW.x,y:WINDOW.y,width:WINDOW.w,height:WINDOW.h});
  const room=new Sprite({label:'room-artwork'}),cursor=new Graphics({label:'computer-cursor'}),flag=new Graphics({label:'mail-flag'});
  const covers=new Container({label:'gallery-image-covers'});
  for(const {g,x,y} of galleryLayout()){
    const image=g.timg?.naturalWidth?g.timg:g.preview;
    if(!image)continue;
    const source=own(Texture.from(image));
    const texture=g.crop&&g.timg?.naturalWidth?own(new Texture({source:source.source,frame:new Rectangle(...g.crop)})):source;
    covers.addChild(new Sprite({texture,x:x+2,y:y+2,width:ART_SIZE,height:ART_SIZE}));
  }
  const boxWidth=BOX.w+BOX_PAD*2,boxHeight=BOX.h+1+BOX_PAD;
  const boxBack=new Sprite({texture:own(Texture.from(paintBox(false)),true),label:'box-back',x:BOX.x-BOX_PAD,y:BOX.y-BOX_PAD,width:boxWidth,height:boxHeight});
  const boxFront=new Sprite({texture:own(Texture.from(paintBox(true)),true),label:'box-front',x:BOX.x-BOX_PAD,y:BOX.y-BOX_PAD,width:boxWidth,height:boxHeight});
  const frames=catFrames().map(frame=>({...frame,texture:own(Texture.from(frame.canvas),true)}));
  const bodyContainer=new Container({label:'baxa-body'}),body=new Sprite({label:'baxa-frame'});bodyContainer.addChild(body);
  const paws=new Sprite({texture:own(Texture.from(paintPaws()),true),label:'baxa-front-paws',width:12,height:3});
  const effects=new Container({label:'cat-effects'});
  const ball=new Sprite({texture:own(Texture.from(paintBall()),true),label:'yarn-ball',width:8,height:8});
  const yarn=new Graphics({label:'yarn-thread'});
  const heart=new Sprite({texture:own(Texture.from(paintHeart()),true),label:'heart',width:10,height:9});
  const zCanvas=document.createElement('canvas');zCanvas.width=24;zCanvas.height=24;
  {const ctx=zCanvas.getContext('2d')!;ctx.fillStyle='#8d6b4e';ctx.font='18px "WenQuanYi Micro Hei",sans-serif';ctx.textBaseline='top';ctx.fillText('z',0,0);}
  const z=new Sprite({texture:own(Texture.from(zCanvas),true),label:'sleep-z',width:6,height:6});
  const responses=new Map<string,Texture>();
  for(const text of ['喵～你好呀','呼噜噜…','摸摸我的爪','再睡一会…','小窝好暖～'])responses.set(text,own(Texture.from(paintBubble(text)),true));
  const meow=new Sprite({texture:responses.get('喵～你好呀')!,label:'meow',width:58,height:18});
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
      let texture=backgrounds.get(phase);
      if(!texture){texture=own(Texture.from(paintRoom(phase)),true);backgrounds.set(phase,texture);}
      room.texture=texture;room.width=WIDTH;room.height=HEIGHT;previousPhase=phase;
    }
    const skyFrame=f>>3;
    if(phaseChanged||skyFrame!==previousSkyFrame){
      previousSkyFrame=skyFrame;
      drawWindow(skyCanvas.getContext('2d')!,phase,time,reducedMotion,cloudEdge);
      sky.texture.source.update();
    }
    const cursorFrame=reducedMotion||time%1.8<1.1?1:0;
    if(phaseChanged||cursorFrame!==previousCursor){previousCursor=cursorFrame;cursor.clear();if(cursorFrame)cursor.roundRect(79,58.5,2.2,1.2,.3).fill({color:0xfffaf3,alpha:.9});}
    const flagFrame=(f>>5)&1;
    if(phaseChanged||flagFrame!==previousFlag){
      previousFlag=flagFrame;flag.clear();
      flag.poly([23,61.5,28.5,63,23,64.6]).fill({color:flagFrame?0xffd25a:0xf0c24a});
    }
    const reacting=cat.meow>0,greeting=cat.state==='sit'&&!reacting;
    const pose=reacting&&cat.state==='sit'&&cat.reaction==='hello'?'look':cat.state,flip=pose!=='box'&&cat.dir<0;
    bodyContainer.position.set(Math.round(cat.x)+(flip?CAT_WIDTH:0),pose==='box'?BOX.rim+1:cat.foot);
    bodyContainer.scale.set(flip?-1:1,1);
    shadow.visible=pose!=='box';shadow.clear();
    if(shadow.visible)shadow.ellipse(Math.round(cat.x)+12,cat.foot+1,8,1.6).fill({color:0x8a6a48,alpha:.16});
    const index=controller.frameIndex(pose,time,reducedMotion),drawn=frames[index];
    body.texture=drawn.texture;body.position.set(drawn.dx,-drawn.h);body.width=drawn.w;body.height=drawn.h;
    paws.visible=cat.state==='box';
    if(paws.visible)paws.position.set(Math.round(cat.x)+5,BOX.rim-1);
    catHit.position.set(cat.x,cat.foot);
    ball.visible=pose==='play';yarn.visible=ball.visible;
    if(ball.visible){
      const swing=reducedMotion?0:Math.round((1-Math.cos(cat.elapsed*4.5))*1.5);
      const bx=Math.round(cat.x)+(flip?-10-swing:CAT_WIDTH+swing),by=cat.foot-8;ball.position.set(bx,by);
      yarn.clear().moveTo(bx+(flip?8:-2),by+4).lineTo(bx+(flip?12:-6),by+2).stroke({width:.6,color:0xf4a4be});
    }
    z.visible=pose==='sleep';if(z.visible)z.position.set(Math.round(cat.x)+CAT_WIDTH-4,cat.foot-drawn.h-8-(reducedMotion?0:Math.floor(time%2.4)));
    meow.visible=reacting||greeting;heart.visible=(reacting&&cat.reaction!=='sleepy')||greeting;
    if(meow.visible){
      const lift=reducedMotion||greeting?0:Math.min(3,Math.floor(cat.reactElapsed*1.5));
      const opacity=reducedMotion||greeting?1:Math.min(1,cat.reactElapsed/.15,cat.meow/.4);
      meow.alpha=heart.alpha=opacity;
      const text=cat.state==='box'?'小窝好暖～':greeting?'喵～你好呀':{hello:'喵～你好呀',purr:'呼噜噜…',paw:'摸摸我的爪',sleepy:'再睡一会…'}[cat.reaction];
      meow.texture=responses.get(text)!;meow.width=58;meow.height=18;
      const headTop=pose==='box'?BOX.rim-8:cat.foot-drawn.h;
      meow.position.set(Math.max(2,Math.min(WIDTH-60,Math.round(cat.x)-16)),headTop-16-lift);
      heart.position.set(Math.max(2,Math.min(WIDTH-12,Math.round(cat.x)+drawn.w+2)),headTop+2-lift);
    }
  }
  canvas.dataset.renderer='pixi-webgl';
  return {app,update,destroy(){app.destroy(false,{children:true});ownedTextures.forEach(t=>t.destroy(false));}};
}
