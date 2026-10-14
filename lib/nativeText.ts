import type {NativeSpan} from './nativeTypes';

// Keep floating-point coordinates from the walker. JSON serialization rounds
// bounding boxes and cannot reliably be matched to the walker's rectangles.
export function textCollector(){
 const spans:Omit<NativeSpan,'id'>[]=[];
 const stats={textLines:0,unsupportedLines:0};
 let line:{rect:NativeSpan['rect'];text:string;horizontal:boolean;baseline:number;size:number;color:string}|null=null;
 const walker={
  beginLine(bbox:number[],wmode:number,direction:number[]){line={rect:{x:bbox[0],y:bbox[1],w:bbox[2]-bbox[0],h:bbox[3]-bbox[1]},text:'',horizontal:wmode===0&&direction[0]>.999&&Math.abs(direction[1])<.001,baseline:0,size:0,color:'#222222'}},
  onChar(utf:string,origin:number[],_font:unknown,size:number,_quad:number[],color:number|number[]){if(!line)return;if(!line.text){line.baseline=origin[1];line.size=size;line.color=typeof color==='number'?'#'+(color&0xffffff).toString(16).padStart(6,'0'):'#'+color.slice(0,3).map(v=>Math.round(Math.max(0,Math.min(1,v))*255).toString(16).padStart(2,'0')).join('')}line.text+=utf},
  endLine(){if(line&&line.text.trim()){stats.textLines++;if(line.horizontal&&line.rect.w>0&&line.rect.h>0&&line.size>0)spans.push({text:line.text,rect:line.rect,baseline:line.baseline,size:line.size,color:line.color,font:'sans'});else stats.unsupportedLines++}line=null}
 };
 return {spans,walker,stats};
}
