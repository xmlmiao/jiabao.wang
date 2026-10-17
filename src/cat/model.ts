import { BOX, CAT_WIDTH as SW, WIDTH as W } from '../world';
export const POSES=['sit','stand','walk','lie','sleep','look','groom','play','back','box'] as const;
export type PublicPose=typeof POSES[number];
export type CatPose=PublicPose|'crouch';
export type Arrival='sit'|'box'|'play';
export interface CatState {x:number;foot:number;dir:number;v:number;target:number;state:CatPose;elapsed:number;duration:number;next:CatPose|CatPose[]|null;arrival:Arrival;stride:number;meow:number;reactElapsed:number}
export function isPose(value:unknown):value is PublicPose{return typeof value==='string'&&POSES.includes(value as PublicPose)}
export function createCatController(forcedQuery:string|null=null,rng:()=>number=Math.random){
const FORCE=forcedQuery==='left'||forcedQuery==='right'||isPose(forcedQuery)?forcedQuery:null;
const cat:CatState={x:100,foot:114,dir:1,v:0,target:100,state:'sit',elapsed:0,duration:3,next:null,arrival:'sit',stride:0,meow:0,reactElapsed:0};
const random=(lo:number,hi:number)=>lo+rng()*(hi-lo);
function enter(state:CatPose,duration:number,next:CatPose|CatPose[]|null=null){cat.state=state;cat.elapsed=0;cat.duration=duration;cat.next=next;cat.foot=state==='box'?BOX.foot:114;if(state==='box'){cat.x=BOX.catX;cat.v=0}}
function goHome(){
 cat.meow=0;cat.v=0;cat.target=BOX.catX;cat.arrival='box';cat.dir=cat.target>=cat.x?1:-1;
 if(Math.abs(cat.x-BOX.catX)<.4){enter('box',random(8,14));return}
 if(cat.state==='sleep')enter('lie',.65,['crouch','stand','walk']);
 else if(cat.state==='lie')enter('crouch',.4,['stand','walk']);
 else enter('stand',.4,'walk');
}
function leaveHome(after:Arrival='sit'){cat.meow=0;cat.target=BOX.x-24;cat.arrival=after;cat.dir=-1;cat.v=0;enter('stand',.4,'walk')}
function pick(){
 const roll=rng(),previous=cat.state;
 if(roll<.4){
  const options=[28,50,74,98,122].filter(x=>Math.abs(x-cat.x)>24);
  cat.target=options[Math.floor(rng()*options.length)]+random(-3,3);
  cat.dir=Math.sign(cat.target-cat.x);cat.v=0;cat.arrival='sit';
  if(previous==='sleep')enter('lie',.65,['crouch','stand','walk']);
  else if(previous==='lie')enter('crouch',.4,['stand','walk']);
  else enter('stand',.4,'walk');
 }else if(roll<.9){
  const options:CatPose[]=previous==='sleep'?['lie']:previous==='lie'?['sit','sleep']:['sit','lie','groom','look','back'];
  const state=options[Math.floor(rng()*options.length)];
  if(state==='lie'&&previous!=='sleep')enter('crouch',.35,'lie');else enter(state,state==='sleep'?random(9,16):random(3,6));
 }else{
  const activity=rng()<.5?'play':'box';
  if(activity==='box'){goHome();return}
  if(previous==='sleep')enter('lie',.65,['sit',activity]);
  else if(previous==='lie')enter('sit',.45,activity);
  else enter(activity,random(4,6));
 }
}

function stepCat(dt:number){
 if(cat.meow>0){cat.meow=Math.max(0,cat.meow-dt);cat.reactElapsed+=dt;if(!cat.meow)return}
 const forcedWalk=FORCE==='left'||FORCE==='right';
 if(forcedWalk){if(cat.state!=='walk')enter('walk',Infinity);cat.dir=FORCE==='left'?-1:1;cat.target=cat.x+cat.dir*50}
 else if(isPose(FORCE)){if(cat.state!==FORCE)enter(FORCE,Infinity);cat.elapsed+=dt;return}
 cat.elapsed+=dt;
 if(cat.state==='walk'){
  const dist=cat.target-cat.x,desired=Math.sign(dist)*Math.min(17,Math.abs(dist)*3);
  cat.v+=(desired-cat.v)*(1-Math.exp(-9*dt));
  const move=cat.v*dt;
  cat.x+=move;cat.stride+=Math.abs(move);
  if(Math.abs(cat.v)>.5)cat.dir=Math.sign(cat.v);
  if(forcedWalk){if(cat.x<-SW)cat.x=W;if(cat.x>W)cat.x=-SW}
  else if(Math.abs(dist)<.35&&Math.abs(cat.v)<1.2){cat.x=cat.target;cat.v=0;enter('stand',.35,cat.arrival)}
 }else if(!FORCE&&cat.elapsed>=cat.duration){
  if(cat.next){const sequence=Array.isArray(cat.next)?[...cat.next]:[cat.next],next=sequence.shift()!;enter(next,next==='walk'?Infinity:next==='box'?random(8,14):sequence.length?.45:random(2.5,4.5),sequence.length?sequence:null)}
  else if(cat.state==='box')leaveHome();
  else if(cat.state==='groom'||cat.state==='play')enter('sit',random(1.5,2.5));
  else pick();
 }
 // Unknown debug strings must not freeze normal idle transitions.
 if(FORCE&&!forcedWalk&&!isPose(FORCE)&&cat.elapsed>=cat.duration)pick();
}
function frameIndex(name:CatPose,worldTime:number,reducedMotion:boolean){
 const t=cat.elapsed,blink=!reducedMotion&&worldTime%5.2>5.04;
 if(name==='sit')return blink?1:0;
 if(name==='stand')return 2;
 if(name==='look')return blink?5:4;
 if(name==='walk')return 6+(FORCE==='walk'?Math.floor(t*6):Math.floor(cat.stride/2))%4;
 if(name==='crouch')return 10;
 if(name==='lie')return 11;
 if(name==='sleep')return 12+(reducedMotion?0:Math.floor(t/2.2)%2);
 if(name==='groom')return [14,15,16,15][Math.floor(t*3.5)%4];
 if(name==='back')return 17;
 if(name==='play')return [18,19,20,19][Math.floor(t*4)%4];
 if(name==='box')return blink?22:Math.floor(t/2.8)%2?23:21;
 return 0;
}
function greetCat(){const atHome=cat.state==='box';cat.v=0;cat.meow=2.4;cat.reactElapsed=0;if(atHome){cat.elapsed=0;cat.duration=10}else enter('sit',3);}
if(isPose(FORCE))enter(FORCE,Infinity);
return {cat,enter,goHome,leaveHome,step:stepCat,frameIndex,greet:greetCat};
}
export type CatController=ReturnType<typeof createCatController>;
