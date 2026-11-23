import {enablePreviewAccess} from './preview-browser-access.mjs';
const origin=process.env.CINELOG_PREVIEW_ORIGIN||'http://127.0.0.1:5180';
import {createFixtures,viewerId,memberId} from './release-browser-fixtures.mjs';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
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
 const fixtures=createFixtures();const env=await readFile('.env.local','utf8');const backend=env.match(/^VITE_SUPABASE_URL=(.*)$/m)[1].trim().replace(/^['"]|['"]$/g,'');
 const exceptions=[],mockErrors=[];socket.addEventListener('message',async event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Fetch.requestPaused'){if(new URL(m.params.request.url).origin===new URL(origin).origin)return;try{const r=fixtures.respond(m.params.request);await send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:r.status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:'authorization,apikey,x-client-info,content-type,prefer,accept-profile,content-profile'},{name:'Access-Control-Allow-Methods',value:'GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS'},...(r.headers||[])],body:r.body===null?'':Buffer.from(JSON.stringify(r.body)).toString('base64')});}catch(e){mockErrors.push(e.message);await send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:500,body:Buffer.from('{}').toString('base64')});}}});
 await send('Runtime.enable');await enablePreviewAccess(send,socket,origin,[{urlPattern:backend+'/*'}]);
 const key='sb-'+new URL(backend).hostname.split('.')[0]+'-auth-token';
 await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.__releaseDocument=crypto.randomUUID();localStorage.setItem('+JSON.stringify(key)+','+JSON.stringify(JSON.stringify(fixtures.session))+');'});
 const waitFor=async expression=>{for(let i=0;i<100;i++){if(await evaluate('Boolean('+expression+')'))return true;await pause(100);}return false;};
 const navigate=async path=>{const oldDocument=await evaluate('window.__releaseDocument');await send('Page.navigate',{url:origin+path});assert.ok(await waitFor('window.__releaseDocument!=='+JSON.stringify(oldDocument||'')+' && location.pathname==='+JSON.stringify(new URL(path,origin).pathname)+' && document.querySelector(".studio-account")'),'Signed-in shell loaded');};
 const click=async(selector,text)=>{const code=`(()=>{const button=[...document.querySelectorAll(${JSON.stringify(selector)})].find(b=>b.textContent.trim().includes(${JSON.stringify(text)}));if(!button)throw Error('Missing '+${JSON.stringify(text)});button.click();})()`;await evaluate(code);await pause(150);};
 const input=async(selector,value)=>{await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing input');const prototype=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);};

 const fastSaved={...fixtures.tables.library[0],id:'99999999-9999-4999-8999-999999999999',tmdb_id:9799,title:'The Fast and the Furious',rating:9.4,review:'Preserve this saga review.',favorite:true};fixtures.tables.library.push(fastSaved);
 const passed=[];
 for(const [device,width,height] of [['desktop',1440,1000],['mobile',Number(process.env.CINELOG_TEST_MOBILE_WIDTH)||390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:device==='mobile'});
  const existing=fixtures.tables.library.find(m=>m.user_id===viewerId);const original={...existing};
  await navigate('/collections/franchise/fast');
  assert.ok(await waitFor('document.querySelectorAll(".saga-grid article").length>=10'));
  assert.ok(await evaluate('document.querySelector(".saga-page").getBoundingClientRect().height>100'));
  assert.ok(await evaluate('[...document.querySelectorAll(".saga-film strong")].some(e=>e.textContent==="The Fast and the Furious")'));
  assert.ok(await evaluate('[...document.querySelectorAll(".saga-film strong")].some(e=>e.textContent==="Fast Five")'));
  assert.ok(await evaluate('![...document.querySelectorAll(".saga-film strong")].some(e=>e.textContent==="The Godfather")'));
  const count=fixtures.tables.library.length;
  if(device==='desktop'){
   fixtures.failures.add('library');await click('.saga-heading button','Add');assert.ok(await waitFor('document.querySelector(".saga-page [role=status]")?.textContent.includes("could not be saved")'));assert.equal(fixtures.tables.library.length,count);fixtures.failures.delete('library');
   await click('.saga-heading button','Add');assert.ok(await waitFor('document.querySelector(".saga-heading button").disabled'));
   assert.ok(fixtures.tables.library.length>count);assert.deepEqual(fixtures.tables.library.find(m=>m.id===original.id),original,'Existing reviews/status/rating preserved');
  }
  assert.equal(fixtures.tables.library.find(m=>m.id===fastSaved.id).review,'Preserve this saga review.');assert.equal(fixtures.tables.library.find(m=>m.id===fastSaved.id).status,'watched');assert.equal(fixtures.tables.library.find(m=>m.id===fastSaved.id).rating,9.4);
  passed.push(device+': verified full saga and non-destructive bulk watchlisting');
  await evaluate('document.querySelector(".saga-film").click()');assert.ok(await waitFor('document.querySelector(".studio-film-dialog")'));
  assert.ok(await waitFor('document.querySelector(".similar-movies-grid button") || document.querySelector(".v2-film-sections")'));
  // Open another film while the first is open: one history slot must replace the other.
  const historyBefore=await evaluate('history.length');
  await evaluate('document.querySelectorAll(".saga-film")[1].click()');
  assert.ok(await waitFor('location.pathname.includes("/film/")'));
  assert.equal(await evaluate('history.length'),historyBefore);
  await evaluate('document.querySelector(".movie-detail-modal-backdrop").click()');
  assert.ok(await waitFor('location.pathname==="/collections/franchise/fast" && !document.querySelector(".studio-film-dialog")'));
  passed.push(device+': switching film replaces history, one close returns to collection');
  await navigate('/search?q=fast');assert.ok(await waitFor('document.querySelectorAll(".search-film-grid article").length>0'));
  assert.ok(await evaluate('Boolean(document.querySelector(".search-sagas button"))'));
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await input('input[aria-label="Search catalogue"]','Fast & Furious');
  assert.ok(await waitFor('[...document.querySelectorAll(".search-sagas button")].some(b=>b.textContent.includes("The Fast and the Furious Collection"))'));
  await evaluate('[...document.querySelectorAll(".search-sagas button")].find(b=>b.textContent.includes("The Fast and the Furious Collection")).click()');assert.ok(await waitFor('location.pathname.includes("/collections/franchise/tmdb-") && document.querySelectorAll(".saga-film").length>=10'));
  passed.push(device+': full search, popularity ordering and official saga page');
  const log=device==='mobile'?'.studio-mobile-log':'.studio-log-button';await evaluate('document.querySelector('+JSON.stringify(log)+').click()');assert.ok(await waitFor('document.querySelector(".quick-log-dialog")'));
  await input('.quick-log-dialog input[aria-label="Search catalogue"]',(device==='desktop'?'Interstellar':'Inception'));assert.ok(await waitFor('[...document.querySelectorAll(".quick-log-dialog .search-film-open strong")].some(e=>e.textContent==="'+(device==='desktop'?'Interstellar':'Inception')+'")'));
  fixtures.failures.add('library');await click('.quick-log-dialog .search-film-actions button','Watched');assert.ok(await waitFor('document.querySelector(".quick-log-dialog [role=alert]")'));fixtures.failures.delete('library');
  await click('.quick-log-dialog .search-film-actions button','Watched');assert.ok(await waitFor('document.querySelector(".quick-log-dialog [role=status]")?.textContent.includes("saved")'));
  assert.ok(fixtures.tables.library.some(m=>m.title===(device==='desktop'?'Interstellar':'Inception')&&m.user_id===viewerId&&m.status==='watched'));
  await input('.quick-log-dialog input[aria-label="Search catalogue"]',device==='desktop'?'The Matrix':'Alien');
  assert.ok(await waitFor('document.querySelectorAll(".quick-log-dialog .search-film-actions input:not(:disabled)").length>=2'));
  await click('.quick-log-dialog .search-save-status button','Watchlist');
  const selectedTitles=await evaluate('[...document.querySelectorAll(".quick-log-dialog .search-film-actions input:not(:disabled)")].slice(0,2).map(el=>el.closest("article").querySelector("strong").textContent)');
  await evaluate('[...document.querySelectorAll(".quick-log-dialog .search-film-actions input:not(:disabled)")].slice(0,2).forEach(el=>el.click())');
  await click('.quick-log-dialog .search-batch-save','Save 2');
  assert.ok(await waitFor('document.querySelector(".quick-log-dialog [role=status]")?.textContent.includes("added")'));
  for(const title of selectedTitles)assert.ok(fixtures.tables.library.some(m=>m.user_id===viewerId&&m.title===title&&m.status==='plan_to_watch'));
  const beforeScroll=await evaluate('({input:document.querySelector(".quick-log-dialog input").getBoundingClientRect().top,footer:document.querySelector(".quick-log-footer").getBoundingClientRect().bottom})');
  await evaluate('document.querySelector(".quick-log-dialog .search-film-grid").scrollTop=300');await pause(150);
  const afterScroll=await evaluate('({input:document.querySelector(".quick-log-dialog input").getBoundingClientRect().top,footer:document.querySelector(".quick-log-footer").getBoundingClientRect().bottom})');assert.deepEqual(afterScroll,beforeScroll,'Search and batch footer stay fixed while films scroll');
  assert.ok(await evaluate('document.querySelector(".quick-log-dialog").scrollWidth<=document.querySelector(".quick-log-dialog").clientWidth'),'Quick log has no horizontal overflow');
  await evaluate('document.querySelector(".quick-log-dialog .search-film-grid").scrollTop=0');
  const quickShot=await send('Page.captureScreenshot',{format:'png'});await writeFile('studio-previews/quick-log-'+device+'.png',Buffer.from(quickShot.data,'base64'));
  await evaluate('document.querySelector(".quick-log-close").click()');assert.ok(await waitFor('!document.querySelector(".quick-log-dialog")'));
  passed.push(device+': quick log saves directly and closes without opening detail editor');
  const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('studio-previews/collections-search-'+device+'.png',Buffer.from(shot.data,'base64'));
 }
 assert.equal(mockErrors.length,0);assert.equal(exceptions.length,0);await writeFile('browser-collections-search-report.json',JSON.stringify({passed,exceptions,mockErrors,fixtureWrites:fixtures.writes.length},null,2));console.log(JSON.stringify({passed,exceptions,mockErrors},null,2));try{await Promise.race([send('Browser.close'),pause(1000)]);}catch{}
}catch(e){console.error(e);process.exitCode=1;}finally{socket?.close();chrome.kill();}
