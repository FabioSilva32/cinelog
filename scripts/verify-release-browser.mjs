import {enablePreviewAccess} from './preview-browser-access.mjs';
const origin=process.env.CINELOG_PREVIEW_ORIGIN||'http://127.0.0.1:5180';
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
 await send('Page.enable'); await enablePreviewAccess(send,socket,origin);
 const exceptions=[],reports=[];socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});await send('Runtime.enable');
 const waitFor=async expression=>{for(let i=0;i<100;i++){if(await evaluate('Boolean('+expression+')'))return true;await pause(100);}return false;};
 const routes=['/explore','/library','/collections','/tier-lists','/community','/profile','/stats','/diary','/year-in-film','/stars-map','/achievements','/profile/extras','/challenges','/trivia','/picked-for-you'];
 for(const [device,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:device==='mobile'});
  for(const route of routes){await send('Page.navigate',{url:origin+route});assert.ok(await waitFor('document.querySelector("#main-content") && document.querySelector("#main-content").textContent.trim().length>5 && !document.querySelector(".studio-loading")'),device+' '+route+' loaded');await pause(250);const metrics=await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.querySelector("#main-content").textContent.trim().slice(0,95)})');reports.push({device,route,...metrics,overflow:metrics.scrollWidth>width+1});}
  await send('Page.navigate',{url:origin+'/explore'});assert.ok(await waitFor('document.querySelector(".studio-signin")'));
  await evaluate('document.querySelector(".studio-signin").click()');assert.ok(await waitFor('document.querySelector(".account-dialog")'));assert.equal(await evaluate('/tester|demo account|one.click/i.test(document.querySelector(".account-dialog").textContent)'),false);
  const capture=async label=>{const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(resolve('studio-previews/release-'+device+'-'+label+'.png'),Buffer.from(shot.data,'base64'));};
  await capture('signin');await evaluate('[...document.querySelectorAll(".account-tabs button")].find(b=>b.textContent==="Create account").click()');assert.ok(await waitFor('document.querySelector("input[autocomplete=nickname]")'));await capture('signup');await evaluate('[...document.querySelectorAll(".account-tabs button")].find(b=>b.textContent==="Sign in").click()');await evaluate('[...document.querySelectorAll(".account-text")].find(b=>b.textContent.includes("Forgot")).click()');assert.ok(await waitFor('document.querySelector("#account-title")?.textContent==="A fresh start."'));await capture('recovery');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});assert.ok(await waitFor('!document.querySelector(".account-dialog")'));await pause(500);
  if(device==='mobile'){await evaluate('document.querySelector(".studio-hamburger").click()');if(!await waitFor('document.querySelector(".studio-sidebar.is-open")')){console.log(await evaluate('JSON.stringify({width:innerWidth,compact:matchMedia("(max-width:767px)").matches,sidebars:[...document.querySelectorAll(".studio-sidebar")].map(e=>e.className),dialogs:[...document.querySelectorAll("[role=dialog]")].map(e=>e.getAttribute("aria-label")),exceptions:'+JSON.stringify([])+'})'));throw Error('Mobile navigation did not open');}await evaluate('[...document.querySelectorAll(".studio-nav-item")].find(b=>b.textContent.includes("Preferences")).click()');}else await evaluate('[...document.querySelectorAll(".studio-nav-item")].find(b=>b.textContent.includes("Preferences")).click()');
  assert.ok(await waitFor('document.querySelector(".settings-panel-sheet")'));await capture('settings');
 }
 await writeFile('browser-release-report.json',JSON.stringify({reports,exceptions},null,2));console.log(JSON.stringify({routes:reports.length,overflow:reports.filter(r=>r.overflow),exceptions,authMenus:'signin/signup/recovery + Escape on desktop and mobile'},null,2));assert.equal(exceptions.length,0,'No uncaught JavaScript errors');assert.equal(reports.filter(r=>r.overflow).length,0,'No page overflow');
 try{await send('Browser.close');}catch{}
}catch(error){console.error(error);process.exitCode=1;}finally{socket?.close();chrome.kill();}
