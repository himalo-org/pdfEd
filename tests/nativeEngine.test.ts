import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument,StandardFonts} from 'pdf-lib';
import {nativeSpans,removeNativeText,nativeEngine} from '../lib/nativeEngine';
import {readFile} from 'node:fs/promises';
import {exportPDF,inspect} from '../lib/pdf';
import fontkit from '@pdf-lib/fontkit';
test('MuPDF detects fractional-coordinate original text and actually removes it',async()=>{
 const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica),p=d.addPage([600,800]);
 p.drawText('Original text',{x:40.235,y:720.138,font,size:17.3});p.drawText('Keep neighbour',{x:40,y:640,font,size:16});
 const bytes=await d.save(),spans=await nativeSpans(bytes,0),span=spans.find(s=>s.text==='Original text');assert.ok(span,'Original selectable text must be detected');
 const removed=await removeNativeText(bytes,[[{...span,replacement:''}]]),m=await nativeEngine(),doc=m.Document.openDocument(removed,'application/pdf'),page=doc.loadPage(0),text=page.toStructuredText('preserve-spans');
 try{assert.ok(!text.asText().includes('Original text'));assert.ok(text.asText().includes('Keep neighbour'));assert.equal((await PDFDocument.load(removed)).getPageCount(),1)}finally{text.destroy();page.destroy();doc.destroy()}
});

test('embedded fonts are detected and original text replacement survives crop, rotation and duplicate-page export',async()=>{
 const fonts={sans:new Uint8Array(await readFile('public/fonts/NotoSans-Regular.ttf')),serif:new Uint8Array(await readFile('public/fonts/NotoSerif-Regular.ttf'))};
 const d=await PDFDocument.create();d.registerFontkit(fontkit);const font=await d.embedFont(fonts.sans,{subset:true});d.addPage([600,800]).drawText('Original embedded text',{x:40.235,y:720.138,font,size:17.3});
 const bytes=await d.save(),state=await inspect(bytes,0),spans=await nativeSpans(bytes,0),span=spans.find(s=>s.text==='Original embedded text');assert.ok(span);
 const original=state.pages[0];state.pages.push({...original,id:'duplicate',objects:[]});state.pages[0]={...original,rotation:90,crop:{x:20,y:30,w:400,h:600},nativeEdits:[{...span,replacement:'Edited text'}]};
 const exported=await exportPDF([{name:'original.pdf',bytes}],state,{fonts}),reopened=await PDFDocument.load(exported);assert.equal(reopened.getPageCount(),2);assert.equal(reopened.getPage(0).getRotation().angle,90);assert.deepEqual(reopened.getPage(0).getCropBox(),{x:20,y:170,width:400,height:600});
 const m=await nativeEngine(),doc=m.Document.openDocument(exported,'application/pdf');
 try{for(let i=0;i<2;i++){const page=doc.loadPage(i),text=page.toStructuredText('preserve-spans');try{const plain=text.asText();if(i===0){assert.ok(plain.includes('Edited text'));assert.ok(!plain.includes('Original embedded text'))}else assert.ok(plain.includes('Original embedded text'))}finally{text.destroy();page.destroy()}}}finally{doc.destroy()}
 assert.ok((await nativeSpans(bytes,0)).some(s=>s.text==='Original embedded text'),'Source remains immutable');
});
