const ORIGINS = new Set(['https://jiabao.wang', 'https://www.jiabao.wang', 'https://xmlmiao.github.io']);
export default {
 async fetch(request, env) {
  const url = new URL(request.url), origin = request.headers.get('Origin');
  const allowed = !origin || ORIGINS.has(origin) || origin === url.origin;
  const headers = {'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if (origin && allowed) Object.assign(headers, {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'});
  const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers});
  if (!allowed) return json({error:'来源不受支持'},403);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
  if (url.pathname !== '/api/messages') return json({service:'Bao 小屋信箱',storage:'Cloudflare D1'});
  try {
   if (request.method === 'GET') {
    const before = Number(url.searchParams.get('before') || Date.now()+1);
    if (!Number.isSafeInteger(before)||before<0) return json({error:'无效的分页参数'},400);
    const roots = await env.DB.prepare('SELECT id,name,body,parent,created FROM messages WHERE parent IS NULL AND created < ? ORDER BY created DESC LIMIT 20').bind(before).all();
    const ids = roots.results.map(x=>x.id);
    const replies = ids.length ? await env.DB.prepare(`SELECT id,name,body,parent,created FROM messages WHERE parent IN (${ids.map(()=>'?').join(',')}) ORDER BY created LIMIT 400`).bind(...ids).all() : {results:[]};
    return json({messages:[...roots.results,...replies.results],next:roots.results.length===20?roots.results.at(-1).created:null});
   }
   if (request.method !== 'POST') return json({error:'不支持的请求方式'},405);
   if (!request.headers.get('Content-Type')?.includes('application/json')) return json({error:'请求格式错误'},415);
   if (Number(request.headers.get('Content-Length')||0)>8192) return json({error:'留言太长了'},413);
   const reader=request.body?.getReader();if(!reader)return json({error:'请填写留言'},400);
   const chunks=[];let size=0;
   for (;;) {const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();return json({error:'留言太长了'},413)}chunks.push(value)}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
   let p;try{p=JSON.parse(new TextDecoder().decode(bytes))}catch{return json({error:'请求格式错误'},400)}
   if(!p||typeof p!=='object'||p.website)return json({error:'请稍后重试'},400);
   if(typeof p.name!=='string'||typeof p.body!=='string')return json({error:'请填写昵称和留言'},400);
   const name=p.name.trim(),body=p.body.trim(),parent=p.parent||null;
   if(!name||name.length>24||!body||body.length>500)return json({error:'昵称限 24 字，留言限 500 字。'},400);
   if(parent&&(typeof parent!=='string'||!await env.DB.prepare('SELECT id FROM messages WHERE id=? AND parent IS NULL').bind(parent).first()))return json({error:'原留言不存在，请刷新后重试。'},400);
   const ip=request.headers.get('CF-Connecting-IP')||'unknown';
   const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('bao-guestbook:'+ip));
   const fingerprint=Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('');
   const created=Date.now(),id=crypto.randomUUID();
   const result=await env.DB.prepare('INSERT INTO messages (id,name,body,parent,created,fingerprint) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM messages WHERE fingerprint=? AND created>?)').bind(id,name,body,parent,created,fingerprint,fingerprint,created-30000).run();
   if(!result.meta.changes)return json({error:'先歇一会儿，30 秒后再留言吧。'},429);
   return json({message:{id,name,body,parent,created}},201);
  } catch (e) {console.error('Guestbook request failed');return json({error:'信箱暂时无法访问，请稍后重试。'},503)}
 }
};
