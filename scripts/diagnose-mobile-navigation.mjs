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
 const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
 await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Page.navigate',{url:'http://127.0.0.1:5180/library'});await pause(1800);console.log(await evaluate('JSON.stringify({before:document.querySelector(".studio-sidebar")?.className,buttons:document.querySelectorAll("[aria-label=\"Open navigation\"]").length,rect:document.querySelector(".studio-hamburger")?.getBoundingClientRect().toJSON(),parent:document.querySelector(".studio-hamburger")?.parentElement.outerHTML})'));await evaluate('document.querySelector(".studio-hamburger").click()');await pause(300);console.log(await evaluate('JSON.stringify({after:document.querySelector(".studio-sidebar")?.className,body:document.body.dataset,button:document.querySelector(".studio-hamburger")?.outerHTML})'));const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(resolve('studio-previews/mobile-navigation-debug.png'),Buffer.from(shot.data,'base64'));try{await send('Browser.close');}catch{}
}catch(error){console.error(error);process.exitCode=1;}finally{socket?.close();chrome.kill();}
