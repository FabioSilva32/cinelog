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
 const reports=[];
 for(const [label,width,height,mobile,collection]of [['desktop',1440,1200,false,'Recrafted classics'],['mobile',390,1100,true,'The earned collection']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
  await send('Page.navigate',{url:'http://127.0.0.1:5180/studio-previews/earned-frames.html?collection='+encodeURIComponent(collection)});
  let loaded=false;for(let i=0;i<80;i++){if(await evaluate('document.querySelectorAll(".grid.portraits img").length===18 && [...document.images].every(i=>i.complete&&i.naturalWidth>0)')){loaded=true;break;}await pause(100);}
  assert.ok(loaded,'Portrait assets loaded');
  const metrics=await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:document.images.length})');
  assert.equal(metrics.width,width);assert.ok(metrics.scrollWidth<=width,'No horizontal overflow: '+JSON.stringify(metrics));
  await evaluate('document.querySelectorAll(".portraits button")[2].click()');
  await pause(100);
  assert.equal(await evaluate('document.querySelectorAll(".portraits button")[2].getAttribute("aria-pressed")'),'true');
  await evaluate('document.querySelector(".grid:not(.portraits)").querySelectorAll("button")[1].click()');await pause(100);
  assert.equal(await evaluate('document.querySelector(".grid:not(.portraits)").querySelectorAll("button")[1].getAttribute("aria-pressed")'),'true');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:label==='desktop'?2600:1600,scale:1}});
  const path=resolve('studio-previews/collectors-'+label+'-verified.png');await writeFile(path,Buffer.from(shot.data,'base64'));reports.push({label,...metrics,portraitSelection:true,frameSelection:true,screenshot:path});
 }
 console.log(JSON.stringify(reports,null,2));
 try{await send('Browser.close');}catch{}
}catch(error){console.error(error);process.exitCode=1;}finally{socket?.close();chrome.kill();}
