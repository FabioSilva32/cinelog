import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom',logLevel:'silent'});
const {useSaveFeedback}=await server.ssrLoadModule('/src/hooks/useSaveFeedback.js');
test.after(()=>server.close());
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const priorWindow=globalThis.window;globalThis.window=new EventTarget();
test.after(()=>{globalThis.window=priorWindow;});
let value;
function Probe({owner}){value=useSaveFeedback(owner);return null;}
test('Failed saves remain available for explicit retry without claiming success',async()=>{
 let root,attempts=0;await act(async()=>{root=TestRenderer.create(React.createElement(Probe,{owner:'owner-a'}));});
 await act(async()=>{await assert.rejects(value.run(async()=>{if(++attempts===1)throw Error('Offline');return true;},'A viewing','film:1'));});
 assert.ok(value.failed);assert.equal(value.saved,false);assert.equal(value.pending,0);
 await act(async()=>{await value.retry();});assert.equal(attempts,2);assert.equal(value.failed,null);assert.equal(value.saved,true);await act(async()=>root.unmount());
});
test('Switching accounts clears failed intents and blocks retry under the new owner',async()=>{
 let root,attempts=0;await act(async()=>{root=TestRenderer.create(React.createElement(Probe,{owner:'owner-a'}));});
 await act(async()=>{await assert.rejects(value.run(async()=>{attempts++;throw Error('Rejected');},'A viewing','film:1'));});
 await act(async()=>{root.update(React.createElement(Probe,{owner:'owner-b'}));});
 await act(async()=>value.retry());assert.equal(attempts,1);assert.equal(value.failed,null);await act(async()=>root.unmount());
});
test('A successful save for another film does not discard a failed change',async()=>{
 let root,retry=false;await act(async()=>{root=TestRenderer.create(React.createElement(Probe,{owner:'owner-a'}));});
 await act(async()=>{await assert.rejects(value.run(async()=>{if(!retry)throw Error('Rejected');return true;},'Film one','film:1'));});
 await act(async()=>value.run(async()=>true,'Film two','film:2'));assert.ok(value.failed);
 retry=true;await act(async()=>value.retry());assert.equal(value.failed,null);await act(async()=>root.unmount());
});
test('A newer edit supersedes the failed payload for the same title',async()=>{
 let root,oldAttempts=0;await act(async()=>{root=TestRenderer.create(React.createElement(Probe,{owner:'owner-a'}));});
 await act(async()=>{await assert.rejects(value.run(async()=>{oldAttempts++;throw Error('Rejected');},'Old edit','film:1'));});
 await act(async()=>value.run(async()=>true,'New edit','film:1'));await act(async()=>value.retry());assert.equal(oldAttempts,1);assert.equal(value.failed,null);await act(async()=>root.unmount());
});
