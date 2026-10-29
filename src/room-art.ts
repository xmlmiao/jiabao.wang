import {ART_SIZE,galleryLayout} from './gallery';
import {WIDTH as W,HEIGHT as H,BOX,type Phase} from './world';
export function pixelCanvas(width:number,height:number,paint:(ctx:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;paint(ctx);return c}
export function paintRoom(ph:Phase){return pixelCanvas(W,H,X=>{
 const r=(x:number,y:number,w:number,h:number,c:string)=>{X.fillStyle=c;X.fillRect(x,y,w,h)};
 // All lighting is drawn on the original pixel grid; no blurred textures.
 const night=ph==='night',dusk=ph==='dusk';
 const wall=night?['#34465f','#3a4c66','#2f4058']:dusk?['#879fb3','#91a8bb','#7c94aa']:['#a9cddd','#b2d5e3','#9fc3d5'];
 r(0,0,W,90,wall[0]);
 for(let x=0;x<W;x+=8){r(x,0,1,84,wall[2]);r(x+1,0,1,84,wall[1]);}
 r(0,0,W,2,night?'#29394f':'#7297af');r(0,2,W,1,night?'#536b84':'#d7ebef');
 // Quiet wainscot and a raised skirting board.
 r(0,76,W,8,wall[2]);r(0,75,W,1,wall[1]);
 r(0,84,W,6,night?'#283a50':'#6b91a7');r(0,84,W,1,night?'#617f97':'#d0e6ea');r(0,89,W,1,'#302c3b');
 const wood=night?['#65504c','#59464a','#776055','#3d3440']:dusk?['#a67455','#956347','#b78360','#6d4c43']:['#a47c5b','#99704f','#b58d68','#70503e'];
 r(0,90,W,H-90,wood[0]);
 for(let row=0,y=90;y<H;y+=7,row++){
  for(let x=-24+(row%2)*16;x<W;x+=32){r(x+1,y+1,31,6,wood[(row+Math.floor((x+24)/32))%2]);r(x,y,32,1,wood[3]);r(x,y,1,7,wood[3]);r(x+2,y+1,28,1,wood[2]);r(x+6,y+4,9,1,night?'#69514d':'#ad805a');r(x+20,y+5,6,1,night?'#58454a':'#8d684d');}
 }
 const poly=(points:number[][],c:string)=>{X.fillStyle=c;X.beginPath();points.forEach(([x,y],i)=>i?X.lineTo(x,y):X.moveTo(x,y));X.closePath();X.fill()};
 // Broad window light, crossed by the window mullions.
 poly([[12,44],[43,44],[91,90],[41,90]],night?'#b5cafa0a':dusk?'#ffc18c16':'#fff4c51c');
 poly([[41,90],[91,90],[115,107],[58,107]],night?'#b5cafa0d':dusk?'#ffc88e25':'#fff0bc30');
 poly([[25,44],[28,44],[69,90],[65,90]],'#40354912');
 // Contact shadows, behind the furniture.
 r(157,90,32,3,'#24243238');r(160,93,26,2,'#2424321c');
 poly([[63,90],[104,90],[116,98],[68,98]],'#30263828');
 r(151,119,30,3,'#25213140');r(12,102,16,2,'#25213130');
 // Recessed window, beveled wooden frame, and a tiny climbing plant.
 r(9,13,38,32,'#302b38');r(10,14,36,30,'#97795c');r(11,15,34,28,'#d3b58a');
 X.clearRect(12,16,32,26);
 r(27,16,2,26,'#85694f');r(27,16,1,26,'#d2b48b');r(12,28,32,2,'#85694f');r(12,28,32,1,'#d2b48b');
 r(8,43,40,2,'#c7a379');r(9,45,39,2,'#70523f');r(11,47,36,1,'#342d3b25');
 r(35,38,8,1,'#e2a375');r(36,39,6,4,'#bb7656');r(37,39,1,3,'#d59168');r(36,42,6,1,'#885644');
 r(38,32,1,6,'#648b60');r(35,34,3,2,'#8bad69');r(39,31,3,2,'#8bad69');r(39,35,3,2,'#4e7856');r(34,36,3,1,'#648b60');
 // Fine brass picture frames with small wall shadows.
 galleryLayout().forEach(({g,x,y,w,h})=>{r(x+1,y+2,w,h,'#24213345');r(x,y,w,h,'#443341');r(x+1,y+1,w-2,h-2,'#c49a60');r(x+1,y+1,w-2,1,'#f0d39a');r(x+1,y+1,1,h-2,'#dfbb7d');r(x+2,y+h-2,w-3,1,'#8c623e');
 if(g.timg?.naturalWidth){if(g.crop)X.drawImage(g.timg,...g.crop,x+2,y+2,ART_SIZE,ART_SIZE);else X.drawImage(g.timg,x+2,y+2,ART_SIZE,ART_SIZE)}else if(g.preview)X.drawImage(g.preview,x+2,y+2,ART_SIZE,ART_SIZE);
 });
 // Public guestbook mailbox, freestanding pixel postbox.
 r(139,98,8,2,'#24213338');r(140,77,2,22,'#a88962');r(142,77,1,22,'#705747');
 r(134,63,16,14,'#6d3d4c');r(134,63,15,14,'#a65360');
 r(134,63,15,1,'#d78e88');r(135,64,14,1,'#bd7476');
 r(136,67,10,2,'#693e49');r(136,68,10,1,'#d3918a');r(144,73,4,2,'#d6b58a');
 r(148,60,2,9,'#75505c');r(150,60,4,3,'#d4b15a');
 // Bookshelf: inset back, lit edges, labeled spines, varied heights.
 r(156,34,30,56,'#674b3d');r(156,34,30,1,'#b08b64');r(157,35,1,54,'#967252');r(158,36,26,52,'#382f32');r(184,35,2,55,'#4e3b35');
 const bc=['#be7775','#7aabb1','#d6b66e','#839b77','#a48aa9','#c78c64'];
 [36,53,70].forEach((y,s)=>{r(158,y,26,2,'#221e2928');for(let i=0;i<7;i++){const hh=9+((i*7+s*3)%5),x=159+i*3+(i>4?2:0),top=y+15-hh;r(x,top,3,hh,bc[(i+s)%6]);r(x+2,top,1,hh,'#28233135');r(x,top+2,2,1,'#f4e1b9aa');if(i%3===0)r(x,top+hh-3,2,1,'#f4e1b980');}r(158,y+15,26,2,'#97704e');r(158,y+15,26,1,'#bf986c');});
 r(157,90,3,2,'#493b36');r(181,90,3,2,'#493b36');
 // Woven rug with a quiet geometric border and short fringe.
 // Align with the tabletop's left edge (59); center vertically on floor 90..128.
 X.save();X.translate(-5,-6);
 r(63,110,75,14,'#25223225');r(64,108,72,14,'#355767');r(65,109,70,12,'#77989a');r(67,111,66,8,'#426f7a');r(68,112,64,1,'#658c90');r(68,118,64,1,'#658c90');
 for(let x=69;x<132;x+=8){r(x,114,1,3,'#cbbb88');r(x-1,115,3,1,'#cbbb88');}
 for(let x=66;x<135;x+=3){r(x,107,1,1,'#b9ac8b');r(x,122,1,1,'#b9ac8b');}
 X.restore();
 // Desk joinery, drawer, keyboard, notebook and ceramic cup.
 r(60,68,46,4,'#8a6349');r(59,68,48,1,'#d0ab7b');r(60,69,46,1,'#b78e63');r(62,72,3,22,'#684b3c');r(62,72,1,21,'#ac825b');r(101,72,3,22,'#684b3c');r(101,72,1,21,'#ac825b');
 r(87,72,14,7,'#98704f');r(88,73,12,4,'#ab815a');r(93,74,3,1,'#dfc68b');r(65,73,22,2,'#4c3d3728');
 r(69,50,24,16,'#211f2b');r(70,50,22,1,'#7b7883');r(71,52,20,12,'#172c38');r(72,52,1,12,'#305160');r(79,66,4,1,'#76727a');r(75,67,12,1,'#494451');
 r(73,53,10,1,'#78c6bb');r(73,55,7,1,'#78c6bb');r(73,57,12,1,'#dfc58a');r(73,59,5,1,'#78c6bb');r(89,64,1,1,'#c1d7b7');
 r(73,69,15,1,'#d1c9b4');r(74,70,14,1,'#695f63');r(90,68,3,2,'#dad2bc');
 r(94,62,6,6,'#e5dcc6');r(95,63,4,4,'#8f563e');r(95,67,4,1,'#b9aa96');r(100,63,2,4,'#e5dcc6');r(100,64,1,2,'#786050');
 // Floor lamp: layered shade, brass stem, and a pool of warm light.
 r(118,66,2,26,'#826747');r(119,66,1,26,'#443842');r(115,92,8,2,'#493b38');r(116,92,6,1,'#b09062');
 function lampshade(lit:boolean){
  // Stepped trapezoid: narrow top, broad hem, centered on the stem.
  for(let row=0;row<8;row++){
   const inset=3-Math.floor(row/2),left=113+inset,width=12-inset*2;
   r(left,58+row,width,1,lit?'#ffe4a0':'#d5c3a0');
   r(left,58+row,1,1,lit?'#fff2c8':'#eee0bf');
   r(left+width-1,58+row,1,1,lit?'#dfba78':'#aa9375');
  }
  r(116,58,6,1,lit?'#fff2c8':'#eee0bf');r(113,65,12,1,'#ad8c60');
 }
 lampshade(night);
 if(night){poly([[113,66],[125,66],[136,104],[102,104]],'#ffd99924');r(104,98,31,5,'#ffe4ab12');r(108,103,25,2,'#ffd68a21');}
 // Mailbox enamel and a small nameplate.
 r(18,78,2,24,'#785b45');r(18,79,1,23,'#af8a62');r(10,66,18,12,'#b8595c');r(10,66,18,1,'#ec9890');r(11,67,16,1,'#d67e78');r(27,67,1,11,'#8c414c');r(12,70,10,1,'#643640');r(12,71,10,1,'#df9386');r(21,74,4,2,'#e5c598');r(26,62,2,8,'#594248');r(28,62,4,3,'#dfb96c');
 // Ambient grading stays below the local light sources.
 if(night)r(0,0,W,H,'#171e4128');else if(dusk)r(0,0,W,H,'#ef8a6310');
 if(night){
  poly([[110,58],[114,52],[124,52],[128,58],[128,69],[124,73],[114,73],[110,68]],'#ffdc9b0b');
  lampshade(true);
  r(72,52,18,10,'#80d4d90a');r(74,68,14,1,'#9bd8cd30');
 }
});}
export function paintBox(front:boolean){return pixelCanvas(BOX.w,BOX.h+1,X=>{X.translate(-BOX.x,-BOX.y);const r=(x:number,y:number,w:number,h:number,c:string)=>{X.fillStyle=c;X.fillRect(x,y,w,h)};
function drawBoxBack(){const {x,y,w,h}=BOX;r(x+1,y+h,w-1,1,'#65432f');r(x+2,y,w-5,1,'#9a633c');r(x+2,y+1,w-5,3,'#c48b53');r(x+3,y+2,w-7,1,'#d5a16a');r(x+2,y+4,w-4,6,'#63442f');r(x+1,y+4,2,8,'#b17a48');r(x+w-3,y+3,3,10,'#98613a')}
function drawBoxFront(){const {x,y,w}=BOX;r(x+1,y+7,w-4,7,'#bf8750');r(x+2,y+8,w-6,5,'#c38c55');r(x+w-3,y+6,3,8,'#9e683e');r(x+w-3,y+6,1,7,'#b27b49');r(x,y+6,w-3,2,'#d6a16a');r(x+1,y+6,w-4,1,'#e3b47e');r(x+1,y+13,w-4,1,'#a16b3f')}
if(front)drawBoxFront();else drawBoxBack();});}
