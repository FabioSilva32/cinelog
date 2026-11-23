import {enablePreviewAccess} from './preview-browser-access.mjs';
const origin=process.env.CINELOG_PREVIEW_ORIGIN||'http://127.0.0.1:5180';
import {createFixtures,viewerId,memberId} from './release-browser-fixtures.mjs';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await mkdtemp(join(tmpdir(),'cinelog-art-proof-'));
const chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
let socket;
try{
 let port;for(let i=0;i<80;i++){try{port=Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 assert.ok(port,'Headless Chrome is available');
 const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((ok,no)=>{socket.onopen=ok;socket.onerror=no;});
 let serial=0;const pending=new Map();socket.onmessage=e=>{const message=JSON.parse(e.data);if(message.id){const task=pending.get(message.id);pending.delete(message.id);if(message.error)task?.reject(new Error(message.error.message));else task?.resolve(message.result);}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const response=await send('Runtime.evaluate',{expression,returnByValue:true});if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value;};
 await send('Page.enable');
 const fixtures=createFixtures(); const discoveryRequests=[];const env=await readFile('.env.local','utf8');const backend=env.match(/^VITE_SUPABASE_URL=(.*)$/m)[1].trim().replace(/^['"]|['"]$/g,'');
 const exceptions=[],mockErrors=[];socket.addEventListener('message',async event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Fetch.requestPaused'){if(new URL(m.params.request.url).origin===new URL(origin).origin)return;try{const req=m.params.request,url=new URL(req.url);let r;if(url.hostname==='api.themoviedb.org'){
 let body={results:[],total_pages:1};
 if(url.pathname.endsWith('/tv/1399'))body={id:1399,name:'Progress Series',seasons:[{season_number:1,episode_count:3}]};
 if(url.pathname.endsWith('/tv/1399/season/1'))body={episodes:[{season_number:1,episode_number:1,name:'Pilot',air_date:'2025-01-01'},{season_number:1,episode_number:2,name:'Return',air_date:'2025-01-02'},{season_number:1,episode_number:3,name:'Future',air_date:'2099-01-01'}]};
 if(url.pathname.endsWith('/watch/providers/movie'))body={results:[{provider_id:8,provider_name:'Netflix'}]};
 if(url.pathname.endsWith('/discover/movie')){discoveryRequests.push(Object.fromEntries([...url.searchParams].filter(([k])=>k!=='api_key')));body={results:[{id:777777,title:'Discovery Film',poster_path:'/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',release_date:'1995-01-01',vote_average:8}],total_pages:1};}
 r={status:200,body};
 }else r=fixtures.respond(req);await send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:r.status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Expose-Headers',value:'Content-Range'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:'authorization,apikey,x-client-info,content-type,prefer,accept-profile,content-profile'},{name:'Access-Control-Allow-Methods',value:'GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS'},...(r.headers||[])],body:r.body===null?'':Buffer.from(JSON.stringify(r.body)).toString('base64')});}catch(e){if(/Invalid InterceptionId/.test(e.message))return;mockErrors.push(e.message);await send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:500,body:Buffer.from('{}').toString('base64')});}}});
 await send('Runtime.enable');await enablePreviewAccess(send,socket,origin,[{urlPattern:backend+'/*'},{urlPattern:'https://api.themoviedb.org/*'}]);
 const key='sb-'+new URL(backend).hostname.split('.')[0]+'-auth-token';
 await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.__releaseDocument=crypto.randomUUID();localStorage.setItem('+JSON.stringify(key)+','+JSON.stringify(JSON.stringify(fixtures.session))+');'});
 const waitFor=async expression=>{for(let i=0;i<100;i++){if(await evaluate('Boolean('+expression+')'))return true;await pause(100);}console.log('WAIT FAILED',expression,await evaluate('({body:document.body.innerText.slice(-1800),notice:document.querySelector(".save-indicator")?.innerText,card:document.querySelector(".continue-card")?.innerText})'),exceptions);return false;};
 const navigate=async path=>{const oldDocument=await evaluate('window.__releaseDocument');await send('Page.navigate',{url:origin+path});assert.ok(await waitFor('window.__releaseDocument!=='+JSON.stringify(oldDocument||'')+' && location.pathname==='+JSON.stringify(new URL(path,origin).pathname)+' && document.querySelector(".studio-account")'),'Signed-in shell loaded');};
 const click=async(selector,text)=>{const code=`(()=>{const button=[...document.querySelectorAll(${JSON.stringify(selector)})].find(b=>b.textContent.trim().includes(${JSON.stringify(text)}));if(!button)throw Error('Missing '+${JSON.stringify(text)});button.click();})()`;await evaluate(code);await pause(150);};
 const input=async(selector,value)=>{await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing input');const prototype=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);};


 fixtures.tables.library=fixtures.tables.library.filter(m=>m.user_id===memberId||m.tmdb_id===238);
 const own=fixtures.tables.library.find(m=>m.user_id===viewerId);own.review='First review\n__EPISODE_DATA__:'+JSON.stringify({screenings:[{id:'one',date:'2026-11-20',rating:8.5,review:'First review'}]});
 const series={...own,id:'88888888-8888-4888-8888-888888888888',tmdb_id:1399,media_type:'tv',title:'Progress Series',status:'watching',rating:null,review:'',date_added:'2026-11-20T12:00:00Z'};fixtures.tables.library.push(series);
 fixtures.tables.library.push({...own,id:'99999999-9999-4999-8999-999999999998',tmdb_id:88888,title:'Watchlist Only',status:'plan_to_watch',review:''});
 fixtures.tables.custom_lists.push({...fixtures.tables.custom_lists[0],id:'own-public',user_id:viewerId,title:'Pinned discoveries'});
 fixtures.tables.profiles[0].pinned_list_ids=[];
 fixtures.tables.follows.push({follower_id:viewerId,following_id:memberId});
 const select=async(selector,value)=>{await evaluate('(()=>{const e=document.querySelector('+JSON.stringify(selector)+');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set.call(e,'+JSON.stringify(value)+');e.dispatchEvent(new Event("change",{bubbles:true}));})()');await pause(100);};
 const passed=[];
 for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  fixtures.failures.clear();series.review='';own.review='First review\n__EPISODE_DATA__:'+JSON.stringify({screenings:[{id:'one',date:'2026-11-20',rating:8.5,review:'First review'}]});fixtures.tables.profiles[0].pinned_list_ids=[];
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:device==='mobile'});
  await navigate('/explore');
  assert.ok(await waitFor('document.querySelector(".continue-card .studio-secondary")?.textContent.includes("S1 E1")'));
  fixtures.failures.add('library');await click('.continue-card button','S1 E1');
  assert.ok(await waitFor('document.querySelector(".save-indicator")?.textContent.includes("Retry save")'));
  fixtures.failures.clear();await click('.save-indicator button','Retry save');
  assert.ok(await waitFor('document.querySelector(".continue-card .studio-secondary")?.textContent.includes("S1 E2")'));
  assert.ok(JSON.parse(series.review.split('__EPISODE_DATA__:')[1]).dates.S01E01);
  await click('.continue-card button','S1 E2');assert.ok(await waitFor('document.querySelector(".continue-card")?.textContent.includes("All aired episodes caught up")'));
  assert.ok(!series.review.includes('S01E03'));passed.push(device+': episode progress, failed save retry, future episodes excluded');
  await click('.discovery-finder summary','Find your kind');
  await select('.discovery-controls label:nth-of-type(1) select','8');await select('.discovery-controls label:nth-of-type(2) select','18');await select('.discovery-controls label:nth-of-type(3) select','1990');await select('.discovery-controls label:nth-of-type(4) select','120');await click('.discovery-controls button','Find films');
  assert.ok(await waitFor('document.querySelector(".discovery-results")?.textContent.includes("Discovery Film")'));
  const query=discoveryRequests.at(-1);assert.equal(query.with_watch_providers,'8');assert.equal(query.with_genres,'18');assert.equal(query['with_runtime.lte'],'120');assert.equal(query['primary_release_date.gte'],'1990-01-01');assert.ok(query.watch_region);
  const saveButton=await evaluate('document.querySelector(".discovery-results .studio-secondary")?.disabled');if(!saveButton)await click('.discovery-results .studio-secondary','Watchlist');
  assert.ok(await waitFor('document.querySelector(".discovery-results .studio-secondary")?.textContent.includes("In your library")'));passed.push(device+': discovery filters and direct watchlist save');
  await navigate('/diary');
  // Use the route assigned to the sidebar, rather than assuming the legacy alias.
  if(!await waitFor('document.body.textContent.includes("Watch Calendar")')){await evaluate('[...document.querySelectorAll(".studio-nav-item")].find(b=>b.textContent.includes("Watch diary")).click()');}
  assert.ok(await waitFor('document.body.textContent.includes("Watch Calendar")'));
  await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("title")?.includes("2026-11-20"))?.click()');
  // Select the calendar date through its accessible day cell.
  await evaluate('(()=>{const cell=[...document.querySelectorAll("[role=button],button")].find(b=>b.getAttribute("aria-label")?.includes("2026-11-20"));cell?.click();})()');
  // Heatmap cells use date-based titles. Fallback to the twentieth in the current month.
  if(!await evaluate('Boolean(document.querySelector(".diary-row-actions"))'))await evaluate('(()=>{const cells=[...document.querySelectorAll("[role=button]")];const c=cells.find(e=>e.textContent.trim()==="20");c?.click();})()');
  assert.ok(await waitFor('document.querySelector(".diary-row-actions")'));
  await click('.diary-row-actions button','Edit screening');await input('.viewing-dialog textarea','A separate viewing note');await input('.viewing-dialog input[type=number]','9.1');await click('.viewing-dialog button','Save screening');
  assert.ok(await waitFor('!document.querySelector(".viewing-dialog")'));assert.ok(own.review.includes('A separate viewing note'));
  await click('.diary-row-actions button','Edit screening');await click('.viewing-dialog button','Remove entry');assert.ok(await waitFor('document.querySelector(".cine-notice-action")'));await click('.cine-notice-action','Undo');assert.ok(await waitFor('document.querySelector(".diary-row-actions")'));assert.ok(own.review.includes('A separate viewing note'));passed.push(device+': per-viewing edits and delete undo');
  await navigate('/profile');assert.ok(await waitFor('document.querySelector(".profile-pin")'));await click('.profile-pin','Pin to profile');assert.ok(await waitFor('document.querySelector(".profile-pin")?.getAttribute("aria-pressed")==="true"'));assert.deepEqual(fixtures.tables.profiles[0].pinned_list_ids,['own-public']);
  await click('.v2-profile-facts button','following');assert.ok(await waitFor('document.querySelector(".connection-person")?.textContent.includes("release_member")'));await click('.connection-person','release_member');assert.ok(await waitFor('location.pathname.includes("release_member")'));assert.ok(await waitFor('document.querySelector(".v2-profile")'));passed.push(device+': public pins and following navigation');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'No horizontal overflow');
  const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('studio-previews/viewing-upgrades-'+device+'.png',Buffer.from(shot.data,'base64'));
 }
 assert.equal(mockErrors.length,0);assert.equal(exceptions.length,0);console.log(JSON.stringify({passed,exceptions,mockErrors},null,2));await writeFile('browser-viewing-upgrades-report.json',JSON.stringify({passed,exceptions,mockErrors},null,2));
 try{await Promise.race([send('Browser.close'),pause(1000)]);}catch{}
}catch(e){console.error(e);process.exitCode=1;}finally{socket?.close();chrome.kill();}
