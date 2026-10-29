const URL='https://bao-cottage-guestbook.baozii0725.chatgpt.site/';
export function openGuestbook(){
 let panel=document.querySelector<HTMLDialogElement>('#guestbook');
 if(!panel){panel=document.createElement('dialog');panel.id='guestbook';panel.setAttribute('aria-label','小屋信箱：公共留言板');const bar=document.createElement('div');bar.className='guestbook-bar';const title=document.createElement('strong');title.textContent='✉ 小屋信箱';const close=document.createElement('button');close.type='button';close.textContent='关闭 ×';close.onclick=()=>panel!.close();bar.append(title,close);const frame=document.createElement('iframe');frame.title='公共留言板，留言和回复';frame.src=URL;frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');const fallback=document.createElement('a');fallback.href=URL;fallback.target='_blank';fallback.rel='noopener';fallback.textContent='加载不出来？在新窗口打开信箱 ↗';panel.append(bar,frame,fallback);panel.addEventListener('click',e=>{if(e.target===panel)panel!.close()});document.body.append(panel)}
 if(!panel.open)panel.showModal();
}
