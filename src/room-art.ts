import {GALLERY,ART_SIZE,galleryLayout} from './gallery';
import {WIDTH as W,HEIGHT as H,BOX,type Phase} from './world';
export function pixelCanvas(width:number,height:number,paint:(ctx:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;paint(ctx);return c}
export function paintRoom(ph:Phase){return pixelCanvas(W,H,X=>{
const r=(x:number,y:number,w:number,h:number,c:string)=>{X.fillStyle=c;X.fillRect(x,y,w,h)};

 const f=0;
 // 墙
 r(0,0,W,90,'#6b4f8a');for(let x=0;x<W;x+=8)r(x,0,1,90,'#634780');
 r(0,84,W,6,'#4a3466');r(0,84,W,1,'#8a6aa8');
 // 地板
 r(0,90,W,38,'#a0663d');for(let y=90;y<H;y+=6){r(0,y,W,1,'#7d4a2a');for(let x=(y/6%2)*12;x<W;x+=24)r(x,y,1,6,'#7d4a2a')}
 // 窗户（天空内容裁剪在玻璃内，不会画到墙上）
 const wx=12,wy=16,ww=32,wh=26;
 r(10,14,36,30,'#3a2a20');X.clearRect(wx,wy,ww,wh);
 r(27,wy,2,wh,'#3a2a20');r(wx,28,ww,2,'#3a2a20');r(8,43,40,3,'#5a3e2b');
 // 窗台植物
 r(36,38,6,5,'#c0603a');r(37,34,1,4,'#4caf50');r(39,32,1,6,'#2e7d32');r(40,35,2,1,'#4caf50');r(35,36,2,1,'#4caf50');
 // 画廊
 galleryLayout().forEach(({g,x,y,w,h})=>{r(x,y,w,h,'#3a2a20');r(x+1,y+1,w-2,h-2,g.featured?'#f2c94c':'#d9a441');
   if(g.timg){if(g.timg.naturalWidth){if(g.crop)X.drawImage(g.timg,...g.crop,x+2,y+2,ART_SIZE,ART_SIZE);else X.drawImage(g.timg,x+2,y+2,ART_SIZE,ART_SIZE)}return}
   if(g.preview)X.drawImage(g.preview,x+2,y+2,ART_SIZE,ART_SIZE)});
 // 书架
 r(156,34,30,56,'#5a3e2b');r(158,36,26,52,'#3a2a20');
 const bc=['#e45b5b','#5bb0e4','#f2c94c','#6fcf97','#bb6bd9','#f2994a'];
 [36,53,70].forEach((y,s)=>{r(158,y+15,26,2,'#5a3e2b');for(let i=0;i<7;i++){const hh=10+((i*7+s*3)%5);r(159+i*3+(i>4?2:0),y+15-hh,3,hh,bc[(i+s)%6]);r(159+i*3+(i>4?2:0),y+15-hh+2,3,1,'rgba(255,255,255,.35)')}});
 // 地毯
 r(64,108,72,14,'#2f6f8f');r(66,110,68,10,'#3f8fb0');for(let x=68;x<132;x+=6)r(x,114,3,2,'#ffd25a');
 // 书桌 + 电脑
 r(60,68,46,4,'#8a5a36');r(60,68,46,1,'#b07a4c');r(62,72,3,22,'#6b4428');r(101,72,3,22,'#6b4428');
 r(70,50,22,16,'#2b2b3a');r(72,52,18,12,'#0d1b2a');r(79,66,4,2,'#2b2b3a');r(74,66,14,2,'#444');
 const cur=(f>>4)&1;r(73,53,10,1,'#5ad1c8');r(73,55,7,1,'#5ad1c8');r(73,57,12,1,'#ffd25a');r(73,59,5,1,'#5ad1c8');if(cur)r(79,59,2,1,'#fff');
 r(94,62,6,6,'#fff');r(95,63,4,4,'#c46a2b'); // 杯子
 r(100,64,1,3,'#fff');
 // 台灯（落地灯）
 r(114,58,10,8,'#ffd25a');r(115,59,8,2,'#fff3a0');r(118,66,2,26,'#3a2a20');r(115,92,8,2,'#3a2a20');
 if(ph!=='day'){X.fillStyle='rgba(255,220,120,.10)';X.beginPath();X.moveTo(114,66);X.lineTo(124,66);X.lineTo(136,106);X.lineTo(102,106);X.fill()}
 // 信箱 / 木牌
 r(18,78,2,24,'#5a3e2b');r(10,66,18,12,'#d64545');r(10,66,18,2,'#ff7070');r(12,70,10,1,'#7a1f1f');
 r(26,62,2,8,'#3a2a20');r(28,62,4,3,(f>>5)&1?'#ffd25a':'#f2c94c');
 // 夜晚整体变暗
 if(ph==='night'){X.fillStyle='rgba(10,10,40,.28)';X.fillRect(0,0,W,H)}else if(ph==='dusk'){X.fillStyle='rgba(255,120,60,.08)';X.fillRect(0,0,W,H)}


});}
export function paintBox(front:boolean){return pixelCanvas(BOX.w,BOX.h+1,X=>{X.translate(-BOX.x,-BOX.y);const r=(x:number,y:number,w:number,h:number,c:string)=>{X.fillStyle=c;X.fillRect(x,y,w,h)};
function drawBoxBack(){const {x,y,w,h}=BOX;r(x+1,y+h,w-1,1,'#65432f');r(x+2,y,w-5,1,'#9a633c');r(x+2,y+1,w-5,3,'#c48b53');r(x+3,y+2,w-7,1,'#d5a16a');r(x+2,y+4,w-4,6,'#63442f');r(x+1,y+4,2,8,'#b17a48');r(x+w-3,y+3,3,10,'#98613a')}
function drawBoxFront(){const {x,y,w}=BOX;r(x+1,y+7,w-4,7,'#bf8750');r(x+2,y+8,w-6,5,'#c38c55');r(x+w-3,y+6,3,8,'#9e683e');r(x+w-3,y+6,1,7,'#b27b49');r(x,y+6,w-3,2,'#d6a16a');r(x+1,y+6,w-4,1,'#e3b47e');r(x+1,y+13,w-4,1,'#a16b3f')}

if(front)drawBoxFront();else drawBoxBack();});}
