import { assetUrl, GALLERY, type Artwork } from './gallery';

export function createDialog(element:HTMLDivElement){
  let typing:ReturnType<typeof setInterval>|null=null;
  let artworkIndex:number|null=null;
  let pressedInDialog=false;
  function clearTyping(){if(typing!==null){clearInterval(typing);typing=null;}}
  function close(){clearTyping();element.style.display='none';artworkIndex=null;}
  function say(title:string,text:string,top=false,image?:string){
    clearTyping();artworkIndex=null;pressedInDialog=false;
    element.classList.toggle('top',top);
    element.style.display='block';
    element.innerHTML='<b></b><br><span></span>';
    element.querySelector('b')!.textContent=title;
    if(image){const img=document.createElement('img');img.src=image;img.alt=title;element.append(img);}
    const span=element.querySelector('span')!;let i=0;
    typing=setInterval(()=>{span.textContent=text.slice(0,++i);if(i>=text.length)clearTyping();},28);
  }
  function showArtwork(artwork:Artwork){
    let image=artwork.img?assetUrl(artwork.img):undefined;
    if(!image&&artwork.pixels&&artwork.palette){
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!,unit=20;
      canvas.width=artwork.pixels[0].length*unit;canvas.height=artwork.pixels.length*unit;
      artwork.pixels.forEach((row,y)=>[...row].forEach((ch,x)=>{const color=artwork.palette![ch];if(color){ctx.fillStyle=color;ctx.fillRect(x*unit,y*unit,unit,unit);}}));
      image=canvas.toDataURL();
    }
    say('🖼 '+artwork.title+(artwork.year?' · '+artwork.year:''),artwork.desc,true,image);
    artworkIndex=GALLERY.indexOf(artwork);
    const row=document.createElement('div');row.className='art-row';
    const arrow=(label:string,direction:number)=>{
      const button=document.createElement('button');button.type='button';button.className='art-arrow';button.textContent=direction<0?'◀':'▶';button.setAttribute('aria-label',label);
      button.onclick=event=>{event.stopPropagation();shiftArtwork(direction);element.querySelector<HTMLButtonElement>(direction<0?'[aria-label="上一张画"]':'[aria-label="下一张画"]')!.focus({preventScroll:true});};
      return button;
    };
    const img=element.querySelector('img');
    if(img)row.append(arrow('上一张画',-1),img,arrow('下一张画',1));
    element.append(row);
  }
  function shiftArtwork(direction:number){if(artworkIndex!==null)showArtwork(GALLERY[(artworkIndex+direction+GALLERY.length)%GALLERY.length]);}
  // A touch that opens the panel can emit a compatibility click over the new
  // panel. Close only when the press itself started inside it.
  element.onpointerdown=()=>{pressedInDialog=true;};
  element.onclick=event=>{event.stopPropagation();if(pressedInDialog||event.detail===0){pressedInDialog=false;close();}};
  function keydown(event:KeyboardEvent){
    if(event.key==='Escape')close();
    else if(artworkIndex!==null&&element.style.display!=='none'&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();shiftArtwork(event.key==='ArrowRight'?1:-1);}
  }
  addEventListener('keydown',keydown);
  return {say,close,showArtwork,destroy(){clearTyping();removeEventListener('keydown',keydown);element.onclick=null;element.onpointerdown=null;}};
}
export type CottageDialog=ReturnType<typeof createDialog>;
