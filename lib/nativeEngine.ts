import {PDFDocument,PDFName,PDFNumber,degrees} from 'pdf-lib';
import type {NativeSpan,NativeTextEdit,NativeImageSpan,NativeImageEdit} from './nativeTypes';
import {validateNativeSelections,sameRect,intersects} from './nativeValidation';
import {textCollector} from './nativeText';
type Engine=typeof import('mupdf');
let loading:Promise<Engine>|null=null;
export function nativeEngine():Promise<Engine>{
 if(!loading){const path=typeof process!=='undefined'&&process.versions?.node?'mupdf':'/mupdf/mupdf.js';loading=import(/* webpackIgnore: true */ path).catch(error=>{loading=null;throw Error('The local native PDF engine could not load: '+String(error))})}
 return loading!;
}
type StructuredPage={blocks:{type:string;bbox:{x:number;y:number;w:number;h:number};lines?:{text:string;x:number;y:number;wmode:number;bbox:{x:number;y:number;w:number;h:number};font:{size:number;family:string}}[]}[]};
async function normalizedPage(bytes:Uint8Array,index:number){const source=await PDFDocument.load(bytes,{updateMetadata:false}),out=await PDFDocument.create();const p=out.addPage((await out.copyPages(source,[index]))[0]),media=p.getMediaBox();p.setRotation(degrees(0));p.setCropBox(media.x,media.y,media.width,media.height);p.node.set(PDFName.of('UserUnit'),PDFNumber.of(1));p.node.delete(PDFName.of('Annots'));return out.save()}
export async function nativeContents(bytes:Uint8Array,index:number):Promise<{spans:NativeSpan[];images:NativeImageSpan[];reason:string}>{
 const m=await nativeEngine(),data=await normalizedPage(bytes,index),doc=m.Document.openDocument(data,'application/pdf').asPDF();if(!doc)throw Error('Native editing requires a PDF document.');
 const page=doc.loadPage(0),structured=page.toStructuredText('preserve-spans,preserve-images');
 try{const parsed=JSON.parse(structured.asJSON()) as StructuredPage,bounds=page.getBounds(),area=(bounds[2]-bounds[0])*(bounds[3]-bounds[1]);const scan=parsed.blocks.some(b=>b.type==='image'&&b.bbox.w*b.bbox.h>area*.85);
 const collected=textCollector();structured.walk(collected.walker);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const result:NativeSpan[]=scan?[]:collected.spans.map((span,i)=>({...span,id:hash+':'+index+':'+i}));
 const images=parsed.blocks.filter(b=>b.type==='image'&&b.bbox.w>0&&b.bbox.h>0&&b.bbox.x>=-.1&&b.bbox.y>=-.1&&b.bbox.x+b.bbox.w<=bounds[2]+.1&&b.bbox.y+b.bbox.h<=bounds[3]+.1).map((b,i)=>({id:hash+':'+index+':image:'+i,rect:b.bbox}));
 const reason=scan?'This page has an image covering most of the page. It may be a scan with an invisible OCR layer. Replacing that layer would leave the visible scanned words unchanged, so original-text replacement is disabled on this page.':!collected.stats.textLines?'The PDF engine found no text characters on this page. Its visible words may be part of an image or vector outlines. OCR can extract text, but cannot rewrite those original words.':!result.length?'Text was found, but no horizontal text lines could be edited. Vertical or rotated text is currently unsupported.':'';
 return {spans:result,images,reason};
 }finally{structured.destroy();page.destroy();doc.destroy();m.emptyStore()}
}
export async function nativeSpans(bytes:Uint8Array,index:number){return (await nativeContents(bytes,index)).spans}
export async function removeNativeText(bytes:Uint8Array,edits:NativeTextEdit[][],images:NativeImageEdit[][]=[]):Promise<Uint8Array>{
 const m=await nativeEngine(),doc=m.Document.openDocument(bytes,'application/pdf').asPDF();if(!doc)throw Error('Native editing requires PDF data.');
 try{for(let index=0;index<edits.length;index++){if(!edits[index].length&&!images[index]?.length)continue;const page=doc.loadPage(index);try{
 if(!(page instanceof m.PDFPage))throw Error('Native editing requires a PDF page.');
 const text=page.toStructuredText('preserve-spans');try{const collected=textCollector();text.walk(collected.walker);validateNativeSelections(edits[index],collected.spans);}finally{text.destroy()}
 const annotations=page.getAnnotations();if(annotations.some(a=>a.getType()==='Redact')){annotations.forEach(a=>a.destroy());throw Error('This page already contains redaction annotations. Apply or remove them in a dedicated editor first.')}annotations.forEach(a=>a.destroy());
 for(const edit of edits[index]){const r=edit.rect;if(![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.w<=0||r.h<=0)throw Error('Invalid native text selection.');const annotation=page.createAnnotation('Redact');try{annotation.setRect([r.x,r.y,r.x+r.w,r.y+r.h]);}finally{annotation.destroy()}}
 if(edits[index].length)page.applyRedactions(false,m.PDFPage.REDACT_IMAGE_NONE,m.PDFPage.REDACT_LINE_ART_NONE,m.PDFPage.REDACT_TEXT_REMOVE);
 if(images[index]?.length){const text=page.toStructuredText('preserve-images');try{const parsed=JSON.parse(text.asJSON()) as StructuredPage,boxes=parsed.blocks.filter(b=>b.type==='image').map(b=>b.bbox);for(const image of images[index]){if(boxes.filter(b=>sameRect(b,image.rect)).length!==1||boxes.some(b=>!sameRect(b,image.rect)&&intersects(b,image.rect)))throw Error('This image selection is ambiguous or overlaps another image.');const r=image.rect,annotation=page.createAnnotation('Redact');try{annotation.setRect([r.x,r.y,r.x+r.w,r.y+r.h]);}finally{annotation.destroy()}}}finally{text.destroy()}page.applyRedactions(false,m.PDFPage.REDACT_IMAGE_REMOVE,m.PDFPage.REDACT_LINE_ART_NONE,m.PDFPage.REDACT_TEXT_NONE);}
 }finally{page.destroy()}}
 const buffer=doc.saveToBuffer('garbage=4,compress=yes,clean=yes');try{return new Uint8Array(buffer.asUint8Array())}finally{buffer.destroy()}
 }finally{doc.destroy();m.emptyStore()}
}
