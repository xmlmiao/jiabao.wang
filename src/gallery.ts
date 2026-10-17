export interface Artwork {
 title:string;year:string;desc:string;pixels?:string[];palette?:Record<string,string>;img?:string;thumb?:string;crop?:[number,number,number,number];featured?:boolean;timg?:HTMLImageElement;preview?:HTMLCanvasElement;
}
export const GALLERY:Artwork[] = [
  { title:"深海小鱼", year:"2026", desc:"在 2000 米水深游泳的小鱼。\n它不知道有个 ROV 正在看它。",
    palette:{n:"#14325c",l:"#1f4f8a",y:"#ffd25a",r:"#ff7a59",k:"#222034",w:"#fff",g:"#5ad1c8"},
    pixels:["nnnnnnnnnnnn","nnnwnnnnnnnn","nnnnnnnnnwnn","nnnnyyyynnnn","nrnyyyyyynnn","nrryykyyyynn","nrryyyyyrynn","nrnyyyyyynnn","nnnnyyyynnnn","ngnnnnnnngnn","gglgnnnngglg","llllllllllll"] },
  { title:"小 ROV", year:"2026", desc:"向本职工作致敬：一台小小的水下机器人。\nSTM32 + RTOS 驱动，螺旋桨呼呼转。",
    palette:{n:"#0f2a4a",y:"#ffcc33",k:"#222034",c:"#9fe8ff",g:"#8b93a6",w:"#e8f6ff"},
    pixels:["nnnnnnnnnnnn","nnnnnwnnnnnn","nnnnnggnnnnn","nnyyyyyyyynn","nykyyyyyykyn","nyycccyyyyyn","ncwcycyyyyyn","nyycccyyyyyn","nykyyyyyykyn","nnyyyyyyyynn","ngnggnnggngn","nnnnnnnnnnnn"] },
  { title:"窗台绿萝", year:"2026", desc:"唯一一个不需要烧录固件\n就能自己长大的东西。",
    palette:{e:"#f3e2c7",g:"#4caf50",G:"#2e7d32",t:"#c0603a",T:"#8a3d22"},
    pixels:["eeeeeeeeeeee","eeeeegeeeeee","eeegGgegeeee","eegGgggGgeee","eeeGgGgggGee","eegggGgGgeee","eeeGgggGeeee","eeeettttteee","eeeetTTTteee","eeeetttteeee","eeeeTTTTeeee","eeeeeeeeeeee"] },
  { title:"毕业典礼", year:"", desc:"2026年6月24号毕业典礼，Bao和胶哥在北体激情比心❤",
    img:"assets/gallery/grad-2026.png", thumb:"assets/gallery/grad-2026-cover-v2.png" },
];
export const ART_SIZE=20;
export async function prepareGallery(){
 await Promise.all(GALLERY.map(async g=>{
  if(g.thumb){const image=new Image();g.timg=image;await new Promise<void>(resolve=>{image.onload=()=>resolve();image.onerror=()=>{g.timg=undefined;resolve()};image.src=assetUrl(g.thumb!)});}
  else if(g.pixels&&g.palette){const canvas=document.createElement('canvas');canvas.width=g.pixels[0].length;canvas.height=g.pixels.length;const ctx=canvas.getContext('2d')!;g.pixels.forEach((row,y)=>[...row].forEach((ch,x)=>{const c=g.palette![ch];if(c){ctx.fillStyle=c;ctx.fillRect(x,y,1,1)}}));g.preview=canvas;}
 }));
}
export function assetUrl(path:string){return import.meta.env.BASE_URL+path;}
export function galleryLayout(){
 const feat=GALLERY.filter(g=>g.featured),rest=GALLERY.filter(g=>!g.featured);
 const half=Math.ceil(rest.length/2),order=[...rest.slice(0,half),...feat,...rest.slice(half)];
 const dims=order.map(g=>({g,w:ART_SIZE+4,h:ART_SIZE+4}));
 const L=52,R=152,total=dims.reduce((a,d)=>a+d.w,0),gap=Math.max(1,Math.floor((R-L-total)/Math.max(1,dims.length-1)));
 let x=L+Math.floor((R-L-total-gap*(dims.length-1))/2);const top=14;
 return dims.map(d=>{const o={...d,x,y:top};x+=d.w+gap;return o});
}
