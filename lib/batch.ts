import {clonePage} from './model';
import type {PageEdit,ObjectEdit} from './model';
export function batchPages(pages:PageEdit[],indices:number[],operation:'rotate'|'delete'|'duplicate'|'reverse'|'move',destination=1){
 if(!indices.length||new Set(indices).size!==indices.length||indices.some(i=>!Number.isInteger(i)||i<0||i>=pages.length))throw Error('Choose a valid page range.');
 const chosen=new Set(indices),ordered=indices.slice().sort((a,b)=>a-b);
 if(operation==='delete'){if(chosen.size===pages.length)throw Error('Keep at least one page in the document.');return pages.filter((_,i)=>!chosen.has(i))}
 if(operation==='rotate')return pages.map((p,i)=>chosen.has(i)?{...p,rotation:(p.rotation+90)%360}:p);
 if(operation==='reverse'){const reversed=ordered.map(i=>pages[i]).reverse();let next=0;return pages.map((p,i)=>chosen.has(i)?reversed[next++]:p)}
 if(operation==='duplicate'){const copies=ordered.map(i=>clonePage(pages[i])),out=[...pages];out.splice(ordered.at(-1)!+1,0,...copies);return out}
 const rest=pages.filter((_,i)=>!chosen.has(i));if(!Number.isInteger(destination)||destination<1||destination>rest.length+1)throw Error(`Enter a final start position between 1 and ${rest.length+1}.`);
 rest.splice(destination-1,0,...ordered.map(i=>pages[i]));return rest;
}
export function orderObject(objects:ObjectEdit[],id:string,operation:'front'|'back'|'forward'|'backward'){
 const index=objects.findIndex(o=>o.id===id);if(index<0)return objects;
 const to=operation==='front'?objects.length-1:operation==='back'?0:Math.max(0,Math.min(objects.length-1,index+(operation==='forward'?1:-1)));
 if(index===to)return objects;const out=[...objects],[object]=out.splice(index,1);out.splice(to,0,object);return out;
}
