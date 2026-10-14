'use client';
import {useState} from 'react';
import type {PageEdit} from '@/lib/model';
import {ranges} from '@/lib/model';
import {batchPages} from '@/lib/batch';
export default function BatchPages({pages,disabled,onChange}:{pages:PageEdit[];disabled:boolean;onChange:(pages:PageEdit[])=>void}){
 const [range,setRange]=useState(''),[destination,setDestination]=useState(1),[error,setError]=useState('');
 function apply(operation:Parameters<typeof batchPages>[2]){try{const next=batchPages(pages,ranges(range,pages.length),operation,destination);onChange(next);setError('');setRange('')}catch(e){setError((e as Error).message)}}
 return <section aria-label="Batch page operations"><hr/><span className="section-caption">EDIT A PAGE RANGE</span><label>Pages to change<input disabled={disabled} placeholder="1-3, 5" value={range} onChange={e=>{setRange(e.target.value);setError('')}}/></label><button className="wide" disabled={disabled} onClick={()=>setRange(`1-${pages.length}`)}>Select all pages</button><div className="action-grid">{(['rotate','duplicate','reverse','delete'] as const).map(op=><button key={op} disabled={disabled||!range} onClick={()=>apply(op)}>{({rotate:'Rotate selected pages',duplicate:'Duplicate selected pages',reverse:'Reverse selected pages',delete:'Delete selected pages'})[op]}</button>)}</div><label>Final start position<input type="number" min="1" max={pages.length} value={destination} onChange={e=>setDestination(Number(e.target.value))}/></label><button className="wide" disabled={disabled||!range} onClick={()=>apply('move')}>Move selected pages</button><p className="muted">Positions are numbered from 1 after selected pages are removed. Pages move together in document order. Edits stay attached to their pages. Undo restores the entire operation.</p>{error&&<p role="alert">{error}</p>}</section>
}
