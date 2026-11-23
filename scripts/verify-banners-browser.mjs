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
 const navigate=async path=>{const oldDocument=await evaluate('window.__releaseDocument');await send('Page.navigate',{url:origin+path});assert.ok(await waitFor('window.__releaseDocument!=='+JSON.stringify(oldDocument||'')+' && location.pathname==='+JSON.stringify(path)+' && document.querySelector(".studio-account")'),'Signed-in shell loaded');};
 const click=async(selector,text)=>{const code=`(()=>{const button=[...document.querySelectorAll(${JSON.stringify(selector)})].find(b=>b.textContent.trim().includes(${JSON.stringify(text)}));if(!button)throw Error('Missing '+${JSON.stringify(text)});button.click();})()`;await evaluate(code);await pause(150);};
 const input=async(selector,value)=>{await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing input');const prototype=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);};

 const passed=[];
 for(const [device,width,height] of [['mobile',390,844],['small-mobile',320,740],['desktop',1440,1000]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:device!=='desktop'});
  for(const fit of ['contain','cover']){
   for(const p of fixtures.tables.profiles){p.banner_url=process.env.CINELOG_BANNER_SOURCE||"/film_frames/curated/blade_runner_2049_orange_vegas_4k.png";p.banner_fit_mode=fit;p.banner_pos_percent=47;}
   for(const route of ['/profile','/u/release_member']){
    await navigate(route);assert.ok(await waitFor('document.querySelector(".profile-cover-measure")?.naturalWidth>0 && document.querySelector(".v2-profile-cover")?.dataset.letterboxCorrected==="true"'));
    const geometry=await evaluate(`(()=>{const el=document.querySelector('.v2-profile-cover'),img=el.querySelector('img'),r=el.getBoundingClientRect(),css=getComputedStyle(el);return {width:r.width,height:r.height,ratio:3840/1600,fit:el.dataset.fit,position:el.dataset.focus,corrected:el.dataset.letterboxCorrected};})()`);
    assert.equal(geometry.fit,fit);assert.equal(geometry.corrected,"true");
    if(device!=='desktop'&&fit==='contain')assert.ok(Math.abs(geometry.width/geometry.height-geometry.ratio)<.05,'Full-image cover follows artwork proportions without bars');
    if(fit==='cover')assert.ok(geometry.position==="47",'Saved focus preserved');
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Profile fits viewport');
    const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('studio-previews/banner-'+device+'-'+fit+(route==='/profile'?'-own':'-public')+'.png',Buffer.from(shot.data,'base64'));passed.push(device+' '+fit+' '+route);
   }
  }
 }
 assert.equal(exceptions.length,0);assert.equal(mockErrors.length,0);
 await writeFile('browser-banners-report.json',JSON.stringify({passed,exceptions,mockErrors},null,2));console.log(JSON.stringify({passed,exceptions,mockErrors},null,2));
 try{await Promise.race([send('Browser.close'),pause(1000)]);}catch{}
}catch(error){console.error(error);process.exitCode=1;}finally{socket?.close();chrome.kill();}
