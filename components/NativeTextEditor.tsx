'use client';
import {useEffect,useState} from 'react';
import type {NativeSpan,NativeTextEdit} from '@/lib/nativeTypes';
export default function NativeTextEditor({bytes,index,edits,onChange}:{bytes:Uint8Array;index:number;edits:NativeTextEdit[];onChange:(edits:NativeTextEdit[])=>void}){
 const [spans,setSpans]=useState<NativeSpan[]>([]),[busy,setBusy]=useState(true),[error,setError]=useState(''),[reason,setReason]=useState(''),[query,setQuery]=useState(''),[offset,setOffset]=useState(0),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  setBusy(true);setError('');setReason('');setSpans([]);setOffset(0);setQuery('');
  const worker=new Worker(new URL('../lib/export.worker.ts',import.meta.url));
  const timer=setTimeout(()=>{worker.terminate();setBusy(false);setError('Reading text took too long. Retry, or use a smaller PDF on this device.')},90000);
  const finish=()=>{clearTimeout(timer);setBusy(false);worker.terminate()};
  worker.onmessage=e=>{finish();if(e.data.error)setError(e.data.error);else if(Array.isArray(e.data.spans)){setSpans(e.data.spans);setReason(e.data.reason||'')}else setError('The text worker returned an unexpected result. Refresh the application and retry.')};
  worker.onerror=e=>{finish();setError(e.message||'The local PDF text engine failed to load. Refresh or retry.')};
  worker.postMessage({operation:'nativeSpans',bytes,index});
  return()=>{clearTimeout(timer);worker.terminate()};
 },[bytes,index,attempt]);
 const matches=spans.filter(s=>s.text.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 function set(span:NativeSpan,value:Partial<NativeTextEdit>){const current=edits.find(e=>e.id===span.id)||{...span,replacement:span.text};onChange([...edits.filter(e=>e.id!==span.id),{...current,...value}])}
 return <section aria-label="Edit original PDF text">
  <span className="section-caption">EDIT ORIGINAL TEXT</span>
  <p className="muted">Replace supported horizontal text. Original glyphs are removed on export; replacement text uses Noto or your local font. Paragraph reflow and matching the original font are not supported.</p>
  {busy?<p role="status">Reading original text locally...</p>:error?<><p role="alert">{error}</p><button onClick={()=>setAttempt(a=>a+1)}>Retry text detection</button></>:<>
   {reason&&<p role="status" className="tip">{reason}</p>}
   {spans.length>0&&<label>Find a text span<input value={query} onChange={e=>{setQuery(e.target.value);setOffset(0)}}/></label>}
   {matches.slice(offset,offset+15).map(span=>{const edit=edits.find(e=>e.id===span.id);return <div className="native-span" key={span.id}>
    <label>{span.text.slice(0,70)}<input aria-label={'Replace text: '+span.text} value={edit?.replacement??span.text} onChange={e=>set(span,{replacement:e.target.value})}/></label>
    {edit&&<><div className="field-row"><label>Font<select value={edit.font} onChange={e=>set(span,{font:e.target.value as 'sans'|'serif'})}><option value="sans">Noto Sans / local font</option><option value="serif">Noto Serif / local font</option></select></label><label>Size<input type="number" min="4" max="200" value={edit.size} onChange={e=>{const size=Number(e.target.value);if(Number.isFinite(size)&&size>0)set(span,{size:Math.max(4,Math.min(200,size))})}}/></label></div>
     <label>Color<input type="color" value={edit.color} onChange={e=>set(span,{color:e.target.value})}/></label><button onClick={()=>onChange(edits.filter(e=>e.id!==span.id))}>Reset replacement</button>
    </>}
   </div>})}
   {matches.length>15&&<div className="button-row"><button disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-15))}>Previous</button><button disabled={offset+15>=matches.length} onClick={()=>setOffset(offset+15)}>Next</button></div>}
   <p className="muted">{query?`${matches.length} matching spans of ${spans.length} available.`:`${spans.length} available spans.`}</p>
   {spans.length>0&&!matches.length&&<p>No spans match your search. Try a shorter phrase.</p>}
   <button onClick={()=>setAttempt(a=>a+1)}>Refresh text detection</button>
   {edits.length>0&&<p className="tip">{edits.length} replacement(s) pending. Live preview updates automatically when enabled below; otherwise use Preview edited page. If text is too wide, shorten it or reduce its font size. Download the edited PDF to save replacements.</p>}
  </>}
 </section>
}
