export type Kind = 'text'|'image'|'pen'|'rectangle'|'ellipse'|'line'|'arrow'|'highlight'|'underline'|'strike'|'note'|'field';
export type ObjectEdit = {id:string;kind:Kind;x:number;y:number;w:number;h:number;rotation:number;color:string;size:number;text:string;align:'left'|'center'|'right';font:'sans'|'serif';data?:string;points?:number[][];fieldType?:'text'|'checkbox'|'radio'|'dropdown';value?:string|boolean;options?:string[];nativeImageId?:string};
export type PageEdit = {id:string;source:number;index:number;width:number;height:number;origin?:{x:number;y:number};rotation:number;crop?:{x:number;y:number;w:number;h:number};objects:ObjectEdit[];textChanges?:import('./originalText').TextChange[];nativeEdits?:import('./nativeTypes').NativeTextEdit[];nativeImages?:import('./nativeTypes').NativeImageEdit[]};
export function clonePage(page:PageEdit){const ids=new Map<string,string>();const objects=page.objects.map(o=>{const id=uid();ids.set(o.id,id);return {...o,id}});return {...page,id:uid(),objects,nativeImages:page.nativeImages?.map(i=>({...i,objectId:i.objectId?ids.get(i.objectId):undefined}))}}
export type Source = {name:string;bytes:Uint8Array};
export type FormValue = {name:string;type:string;value:string|boolean;options:string[]};
export type State = {pages:PageEdit[];forms:FormValue[]};
export const uid=()=>crypto.randomUUID();
export function reorder(p:PageEdit[],from:number,to:number){const a=[...p];const [v]=a.splice(from,1);a.splice(to,0,v);return a}
export function ranges(s:string,total:number){const result:number[]=[];for(const part of s.split(',')){const m=part.trim().match(/^(\d+)(?:-(\d+))?$/);if(!m)throw Error('Use ranges such as 1-3,5.');const a=Number(m[1]),b=Number(m[2]||m[1]);if(a<1||b<a||b>total)throw Error('Page range is outside this document.');for(let i=a;i<=b;i++)if(!result.includes(i-1))result.push(i-1)}return result}
export function history<T>(past:T[],present:T,next:T){return {past:[...past,present].slice(-60),present:next,future:[] as T[]}}
export function lineSegments(o:Pick<ObjectEdit,'kind'|'w'|'h'|'points'>):number[][]{
 const startY=o.kind==='underline'?o.h:o.kind==='strike'?o.h/2:0,endY=o.kind==='underline'||o.kind==='strike'?startY:o.h;
 const directional=(o.kind==='line'||o.kind==='arrow')&&o.points&&o.points.length>=2;
 const start=directional?o.points![0]:[0,startY],end=directional?o.points![1]:[o.w,endY];
 const result=[[...start,...end]];
 if(o.kind==='arrow'){const angle=Math.atan2(end[1]-start[1],end[0]-start[0]);for(const offset of [-.5,.5])result.push([end[0],end[1],end[0]-12*Math.cos(angle+offset),end[1]-12*Math.sin(angle+offset)])}
 return result;
}
