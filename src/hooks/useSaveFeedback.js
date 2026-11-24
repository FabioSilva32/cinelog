import {useEffect,useRef,useState} from 'react';
export function useSaveFeedback(owner){
 const activeOwner=useRef(owner);activeOwner.current=owner;
 const [state,setState]=useState({pending:0,failed:null,saved:false}),[online,setOnline]=useState(navigator.onLine);
 const failures=useRef(new Map()),sequence=useRef(0),busy=useRef(new Set());
 useEffect(()=>{failures.current.clear();busy.current.clear();sequence.current++;setState({pending:0,failed:null,saved:false});},[owner]);
 useEffect(()=>{const update=()=>setOnline(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
 useEffect(()=>{if(!state.saved)return;const timer=setTimeout(()=>setState(s=>({...s,saved:false})),4000);return()=>clearTimeout(timer);},[state.saved]);
 const run=async(task,label='Your changes',key=label)=>{const id=owner,version=sequence.current;if(!id)return task();if(busy.current.has(key))throw Error('This change is already being saved.');busy.current.add(key);failures.current.delete(key);setState(s=>({...s,pending:s.pending+1,saved:false}));try{const result=await task();if(result===false||result?.saved===false||result?.failed>0)throw Object.assign(Error(result?.error||`${label} could not be fully saved.`),{result});if(activeOwner.current===id&&sequence.current===version)setState(s=>({...s,failed:failures.current.size?`${failures.current.size} changes need retrying.`:null,saved:true}));return result;}catch(e){if(activeOwner.current===id&&sequence.current===version){failures.current.set(key,{task,label,key});setState(s=>({...s,failed:`${failures.current.size} changes need retrying.`,saved:false}));}throw e;}finally{if(activeOwner.current===id&&sequence.current===version){busy.current.delete(key);setState(s=>({...s,pending:Math.max(0,s.pending-1)}));}}};
 const retry=async()=>{if(state.pending)return;for(const entry of [...failures.current.values()]){if(activeOwner.current!==owner)break;try{await run(entry.task,entry.label,entry.key);}catch{}}};
 return {...state,online,run,retry};
}
