import {readFile} from 'node:fs/promises';
const env=await readFile('.env.local','utf8');const value=name=>env.match(new RegExp('^'+name+'=(.*)$','m'))?.[1]?.trim().replace(/^['"]|['"]$/g,'');
const url=value('VITE_SUPABASE_URL'),key=value('VITE_SUPABASE_ANON_KEY');if(!url||!key)throw Error('Public database configuration missing');
let role;try{role=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role;}catch{role=key.startsWith('sb_publishable_')?'publishable':'unknown';}
if(!['anon','publishable'].includes(role))throw Error('Client configuration is not a public key');
const results=[];for(const[table,query]of [['profiles','select=id,username,banner_url,banner_fit_mode,banner_pos_percent,featured_badges&limit=0'],['custom_lists','select=id&is_public=eq.false&limit=1'],['follows','select=follower_id,following_id&limit=0'],['list_likes','select=list_id,user_id&limit=0'],['list_comments','select=id,list_id,user_id&limit=0'],['library','select=id,user_id,review&limit=0']]){
 try{const r=await fetch(url+'/rest/v1/'+table+'?'+query,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});const data=await r.json();results.push({table,status:r.status,code:data?.code,privateListVisible:table==='custom_lists'&&Array.isArray(data)?data.length>0:undefined});}catch{results.push({table,status:'unreachable'});}
}
console.log(JSON.stringify({keyRole:role,checks:results},null,2));await import('node:fs/promises').then(fs=>fs.writeFile('public-api-audit.json',JSON.stringify({keyRole:role,checks:results},null,2)));
