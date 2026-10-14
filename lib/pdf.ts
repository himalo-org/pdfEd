import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, rgb, degrees, PDFName, PDFRef, PDFNumber, pushGraphicsState, popGraphicsState, concatTransformationMatrix } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type {Source,State,PageEdit,FormValue} from './model';
import {uid,lineSegments} from './model';
import {pageGeometry} from './pageGeometry';
import {applyOriginalChanges} from './originalText';
import {removeNativeText} from './nativeEngine';
export async function inspect(bytes:Uint8Array,source:number){
 const doc=await PDFDocument.load(bytes,{updateMetadata:false});
 const pages=doc.getPages().map((p,index)=>({id:uid(),source,index,...pageGeometry(p.getMediaBox(),p.getCropBox(),p.getRotation().angle),objects:[]} as PageEdit));
 const forms:FormValue[]=source===0?doc.getForm().getFields().map(f=>({name:f.getName(),type:f instanceof PDFTextField?'text':f instanceof PDFCheckBox?'checkbox':f instanceof PDFRadioGroup?'radio':f instanceof PDFDropdown?'dropdown':'unsupported',value:f instanceof PDFTextField?f.getText()||'':f instanceof PDFCheckBox?f.isChecked():f instanceof PDFRadioGroup?f.getSelected()||'':f instanceof PDFDropdown?f.getSelected()[0]||'':'',options:f instanceof PDFRadioGroup||f instanceof PDFDropdown?f.getOptions():[]})):[];
 return {pages,forms};
}
const color=(s:string)=>rgb(parseInt(s.slice(1,3),16)/255,parseInt(s.slice(3,5),16)/255,parseInt(s.slice(5,7),16)/255);
export type ExportOptions={indices?:number[];metadata?:boolean;interactiveNewFields?:boolean;fonts:{sans:Uint8Array;serif:Uint8Array}};
export async function exportPDF(sources:Source[],state:State,opt:ExportOptions,progress?:(p:number)=>void){
 // Work in a fresh document every time; the source bytes remain immutable.
 const docs=await Promise.all(sources.map(s=>PDFDocument.load(s.bytes,{updateMetadata:false})));
 let output=await PDFDocument.create();output.registerFontkit(fontkit);
 let fonts={sans:await output.embedFont(opt.fonts.sans,{subset:true}),serif:await output.embedFont(opt.fonts.serif,{subset:true})};
 if(docs[0]){const form=docs[0].getForm();for(const v of state.forms){const f=form.getField(v.name);if(f instanceof PDFTextField){const chars=new Set(fonts.sans.getCharacterSet());for(const ch of String(v.value))if(ch!=='\n'&&ch!=='\r'&&!chars.has(ch.codePointAt(0)!))throw Error(`The local font does not contain a character in form field ${v.name}. Load a suitable font in Settings.`);f.setText(String(v.value));}else if(f instanceof PDFCheckBox){v.value?f.check():f.uncheck()}else if(f instanceof PDFRadioGroup){v.value?f.select(String(v.value)):f.clear()}else if(f instanceof PDFDropdown){v.value?f.select(String(v.value)):f.clear()}}
 // Flatten source forms before copyPages, whose AcroForm copying is incomplete.
 if(form.getFields().length){docs[0].registerFontkit(fontkit);const font=await docs[0].embedFont(opt.fonts.sans,{subset:true});form.updateFieldAppearances(font);form.flatten();}}
 // Other merged forms are also flattened with their existing values.
 for(const doc of docs.slice(1)){if(doc.getForm().getFields().length)doc.getForm().flatten();}
 const indices=opt.indices??state.pages.map((_,i)=>i);
 const edits=indices.map(i=>state.pages[i]);if(edits.some(p=>!p))throw Error('Missing page');
 const native=edits.some(p=>p.nativeEdits?.length);
 const units=edits.map(p=>p.source<0?1:docs[p.source].getPage(p.index).node.lookupMaybe(PDFName.of('UserUnit'),PDFNumber)?.asNumber()||1);
 for(let n=0;n<edits.length;n++){
  const edit=edits[n],page=edit.source<0?output.addPage([edit.width,edit.height]):output.addPage((await output.copyPages(docs[edit.source],[edit.index]))[0]);
  await applyOriginalChanges(output,page,edit.textChanges||[]);
  if(native){const b=page.getMediaBox();page.setRotation(degrees(0));page.setCropBox(b.x,b.y,b.width,b.height);page.node.set(PDFName.of('UserUnit'),PDFNumber.of(1));}
  progress?.((n+1)/edits.length*.2);
 }
 if(native){output=await PDFDocument.load(await removeNativeText(await output.save(),edits.map(p=>p.nativeEdits||[])),{updateMetadata:false});output.registerFontkit(fontkit);fonts={sans:await output.embedFont(opt.fonts.sans,{subset:true}),serif:await output.embedFont(opt.fonts.serif,{subset:true})};}
 for(let n=0;n<edits.length;n++){
  const edit=edits[n],page=output.getPage(n),media=page.getMediaBox(),ox=media.x,oy=media.y;
  page.setRotation(degrees(edit.rotation));page.node.set(PDFName.of('UserUnit'),PDFNumber.of(units[n]));
  if(edit.crop)page.setCropBox(ox+edit.crop.x,oy+edit.height-edit.crop.y-edit.crop.h,edit.crop.w,edit.crop.h);else page.setCropBox(ox,oy,edit.width,edit.height);
  for(const replacement of edit.nativeEdits||[]){if(!replacement.replacement)continue;const font=fonts[replacement.font],chars=new Set(font.getCharacterSet());for(const ch of replacement.replacement)if(!chars.has(ch.codePointAt(0)!))throw Error('The replacement font lacks a required glyph. Load a suitable font.');const width=font.widthOfTextAtSize(replacement.replacement,replacement.size);if(width>replacement.rect.w+.5)throw Error('Replacement text is wider than the original span. Reduce its size or shorten it.');page.drawText(replacement.replacement,{x:ox+replacement.rect.x,y:oy+edit.height-replacement.baseline,font,size:replacement.size,color:color(replacement.color)});}
  // Coordinates are unrotated MediaBox points, with a top-left editor origin.
  for(const o of edit.objects){
   const x=ox+o.x,y=oy+edit.height-o.y-o.h,c=color(o.color);
   if(o.kind==='field'){
    const form=output.getForm(),name=`${o.text||'Field'}-${o.id}`;
    const choices=[...new Set((o.options||[]).filter(Boolean))];if((o.fieldType==='radio'||o.fieldType==='dropdown')&&!choices.length)throw Error(`Add at least one option to ${o.text}.`);
    const chars=new Set(fonts.sans.getCharacterSet());for(const value of [String(o.value??''),...(o.options||[])])for(const ch of value)if(ch!=='\n'&&ch!=='\r'&&!chars.has(ch.codePointAt(0)!))throw Error(`The local font does not contain a character in new field ${o.text}. Load a suitable font in Settings.`);
    const box={x,y,width:o.w,height:o.h,rotate:degrees(-o.rotation),borderColor:c,borderWidth:1};
    if(o.fieldType==='checkbox'){const field=form.createCheckBox(name);field.addToPage(page,box);if(o.value)field.check()}
    else if(o.fieldType==='radio'){const field=form.createRadioGroup(name),options=choices;for(let i=0;i<options.length;i++){const row=o.h/options.length,cy=y+o.h-(i+.5)*row;field.addOptionToPage(options[i],page,{...box,y:cy-9,width:18,height:18});page.drawText(options[i],{x:x+26,y:cy-4,size:12,font:fonts.sans,color:rgb(0,0,0)});}if(o.value)field.select(String(o.value));}
    else if(o.fieldType==='dropdown'){const field=form.createDropdown(name);field.addOptions(choices);field.addToPage(page,{...box,font:fonts.sans});if(o.value)field.select(String(o.value));}
    else{const field=form.createTextField(name);field.enableMultiline();field.addToPage(page,{...box,font:fonts.sans});field.setText(String(o.value||''));field.setFontSize(o.size);}
    continue;
   }
   const a=-o.rotation*Math.PI/180;
   page.pushOperators(pushGraphicsState(),concatTransformationMatrix(Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),x,y));
   const base={x:0,y:0,color:c};
   if(o.kind==='text'||o.kind==='note'){
    if(o.kind==='note')page.drawRectangle({...base,width:o.w,height:o.h,color:rgb(1,.96,.72),borderColor:rgb(.87,.77,.3),borderWidth:1});
    const font=fonts[o.font];const supported=new Set(font.getCharacterSet());for(const ch of o.text){if(ch==='\n'||ch==='\r')continue;if(!supported.has(ch.codePointAt(0)!))throw Error(`The local ${o.font} font does not contain “${ch}”. Load a suitable font in Settings.`);}
    const pad=o.kind==='note'?8:0;
    for(const [line,t]of o.text.split('\n').entries()){const w=font.widthOfTextAtSize(t,o.size);const tx=o.align==='center'?(o.w-w)/2:o.align==='right'?o.w-w-pad:pad;page.drawText(t,{x:tx,y:o.h-pad-o.size-line*o.size*1.3,size:o.size,font,color:c});}
   }else if(o.kind==='image'&&o.data){const image=o.data.startsWith('data:image/png')?await output.embedPng(o.data):await output.embedJpg(o.data);page.drawImage(image,{x:0,y:0,width:o.w,height:o.h});}
   else if(o.kind==='rectangle'||o.kind==='highlight')page.drawRectangle({...base,width:o.w,height:o.h,...(o.kind==='highlight'?{opacity:.28}:{color:undefined,borderColor:c,borderWidth:o.size})});
   else if(o.kind==='ellipse')page.drawEllipse({x:o.w/2,y:o.h/2,xScale:o.w/2,yScale:o.h/2,borderColor:c,borderWidth:o.size});
   else if(o.kind==='pen'){const pts=o.points||[];for(let i=1;i<pts.length;i++)page.drawLine({start:{x:pts[i-1][0],y:o.h-pts[i-1][1]},end:{x:pts[i][0],y:o.h-pts[i][1]},color:c,thickness:o.size});}
   else {for(const [x1,y1,x2,y2] of lineSegments(o))page.drawLine({start:{x:x1,y:o.h-y1},end:{x:x2,y:o.h-y2},color:c,thickness:o.size});}
   page.pushOperators(popGraphicsState());
  }
  progress?.(.2+(n+1)/indices.length*.8);
 }
 if(output.getForm().getFields().length){output.getForm().updateFieldAppearances(fonts.sans);if(opt.interactiveNewFields===false)output.getForm().flatten();}
 // Copying pages excludes document-level XMP, attachments and scripts. Optional removal also clears Info.
 if(opt.metadata){
  const info=output.context.trailerInfo.Info;
  if(info instanceof PDFRef)output.context.delete(info);
  output.context.trailerInfo.Info=undefined;
  output.catalog.delete(PDFName.of('Metadata'));
  for(const page of output.getPages()){
   const metadata=page.node.get(PDFName.of('Metadata'));
   if(metadata instanceof PDFRef)output.context.delete(metadata);
   page.node.delete(PDFName.of('Metadata'));
  }
 }else{
  output.setTitle(docs[0]?.getTitle()||'');
  output.setAuthor(docs[0]?.getAuthor()||'');
  output.setSubject(docs[0]?.getSubject()||'');
 }
 return output.save();
}
export async function blankPDF(){const d=await PDFDocument.create();d.addPage([595.28,841.89]);return d.save()}
export async function imagesPDF(files:{bytes:Uint8Array;type:string}[]){const d=await PDFDocument.create();for(const f of files){const i=f.type==='image/png'?await d.embedPng(f.bytes):await d.embedJpg(f.bytes);const factor=Math.min(1,1600/Math.max(i.width,i.height));const p=d.addPage([i.width*factor,i.height*factor]);p.drawImage(i,{x:0,y:0,width:p.getWidth(),height:p.getHeight()});}return d.save()}
