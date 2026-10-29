const ISSUE='https://github.com/xmlmiao/jiabao.wang/issues/2';
const API='https://api.github.com/repos/xmlmiao/jiabao.wang/issues/2';
type Comment={id:number;body:string;html_url:string;created_at:string;user:{login:string}};
export function openGuestbook(){
 let panel=document.querySelector<HTMLDialogElement>('#guestbook');
 if(!panel){
  panel=document.createElement('dialog');panel.id='guestbook';panel.setAttribute('aria-label','小屋信箱：GitHub 公共留言板');
  const bar=document.createElement('div');bar.className='guestbook-bar';const title=document.createElement('strong');title.textContent='📮 小屋信箱';const close=document.createElement('button');close.type='button';close.textContent='关闭 ×';close.onclick=()=>panel!.close();bar.append(title,close);
  const content=document.createElement('div');content.className='guestbook-content';
  const intro=document.createElement('p');intro.textContent='给小屋留一句问候，也和路过的朋友聊聊天。留言与回复保存在 GitHub，发表时需登录 GitHub。';
  const actions=document.createElement('div');actions.className='guestbook-actions';
  function link(text:string,url:string){const a=document.createElement('a');a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  const write=link('去 GitHub 留言 / 回复 ↗',ISSUE+'#new_comment_field');const refresh=document.createElement('button');refresh.type='button';refresh.textContent='刷新留言';actions.append(write,refresh);
  const status=document.createElement('p');status.setAttribute('role','status');
  const list=document.createElement('div');list.className='guestbook-comments';const older=document.createElement('button');older.type='button';older.textContent='查看更早的留言';older.hidden=true;
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='信箱说明与历史留言';const history=document.createElement('p');history.className='guestbook-history';details.append(summary,history);
  content.append(intro,actions,status,list,older,details);panel.append(bar,content);document.body.append(panel);
  let page=0,version=0;
  async function json(url:string){const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(!response.ok)throw Error(response.status===403||response.status===429?'GitHub 暂时限制了读取频率，请稍后刷新，或直接打开 GitHub 信箱。':'暂时无法读取留言，可以直接打开 GitHub 信箱。');return response.json();}
  async function load(reset=true){const run=++version;refresh.disabled=true;older.disabled=true;status.textContent='正在从 GitHub 读取留言…';try{
    let next=page;
    if(reset){const issue=await json(API);if(run!==version)return;history.textContent=issue.body||'';next=Math.max(1,Math.ceil(issue.comments/30));}
    const comments:Comment[]=await json(API+'/comments?per_page=30&page='+next);if(run!==version)return;
    if(reset)list.replaceChildren();
    comments.reverse().forEach(c=>{const card=document.createElement('article'),heading=document.createElement('div');heading.className='guestbook-comment-heading';const author=document.createElement('strong');author.textContent=c.user.login;const time=document.createElement('time');time.dateTime=c.created_at;time.textContent=new Date(c.created_at).toLocaleString('zh-CN');heading.append(author,time);const body=document.createElement('p');body.textContent=c.body;card.append(heading,body,link('在 GitHub 回复 ↗',c.html_url));list.append(card);});
    page=next-1;older.hidden=page<1;status.textContent=list.childElementCount?'':'还没有新的留言，来 GitHub 写下第一句问候吧。';
   }catch(e){if(run===version)status.textContent=e instanceof Error?e.message:'读取失败，请稍后重试。';}finally{if(run===version){refresh.disabled=false;older.disabled=false;}}}
  refresh.onclick=()=>{void load()};older.onclick=()=>{void load(false)};
  panel.addEventListener('click',e=>{if(e.target===panel)panel!.close()});
  window.addEventListener('focus',()=>{if(panel!.open)void load()});
  void load();
 }
 if(!panel.open)panel.showModal();
}
