import { galleryLayout } from './gallery';
import { BOX, type Phase } from './world';
import type { CatController } from './cat/model';
import type { CottageDialog } from './dialog';

export interface Hotspot {name:string;x:number;y:number;w:number;h:number;activate:()=>void}
export function roomHotspots(dialog:CottageDialog,cat:CatController,phase:()=>Phase):Hotspot[]{
  const say=dialog.say;
  return [
    ...galleryLayout().map(({g,x,y,w,h})=>({name:g.title,x,y,w,h,activate:()=>dialog.showArtwork(g)})),
    {name:'电脑',x:68,y:48,w:26,h:22,activate:()=>say('💻 电脑','这是 Bao 的电脑。\nBao：哈尔滨工程大学毕业，在水下机器人公司做嵌入式工程师。\n平时写 C/C++，玩 STM32、RTOS、ArduSub 和 ROS；\n在学校时做过 AUV/ROV，也打过水下机器人比赛。')},
    {name:'信箱',x:8,y:60,w:26,h:44,activate:()=>say('📮 信箱','想给 Bao 写信？\n✉ Email：（待填写）\n🐙 GitHub：（待填写）\n旗子立起来了，说明……有新邮件？')},
    {name:'书架',x:156,y:34,w:30,h:56,activate:()=>say('📚 书架','《STM32 从入门到冒烟》《RTOS 的一百种死锁》\n《ROS 与它的依赖地狱》《深海漫游指南》')},
    {name:'窗户',x:8,y:12,w:40,h:34,activate:()=>say('🪟 窗户',{day:'外面阳光正好，适合出海测试。',dusk:'黄昏了，ROV 该回收了。',night:'夜深了，星星出来了。猫还没睡。'}[phase()])},
    {name:'台灯',x:112,y:56,w:14,h:38,activate:()=>say('💡 台灯',phase()==='night'?'灯光暖暖的。\n（灯会在夜里自己亮起来）':'台灯正安静地等着天黑。\n（灯会在夜里自己亮起来）')},
    {name:'书桌',x:60,y:68,w:46,h:26,activate:()=>say('🪑 书桌','桌上有一杯咖啡，已经凉了。')},
    {name:'Baxa 小窝',x:BOX.x-3,y:BOX.y,w:BOX.w+6,h:BOX.h+2,activate:()=>{if(cat.cat.state!=='box')cat.goHome();say('📦 Baxa 的小窝',cat.cat.state==='box'?'Baxa 正窝在箱子里。\n这是它固定的小角落。':'Baxa 慢慢走回自己的纸箱小窝。',true);}},
  ];
}
export function greetBaxa(controller:CatController,dialog:CottageDialog){
  dialog.close();
  controller.greet();
}
