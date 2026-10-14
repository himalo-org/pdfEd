import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc='/pdfjs/pdf.worker.min.mjs';
export {pdfjs};
export async function loadViewer(bytes:Uint8Array,password?:string){const task=pdfjs.getDocument({data:bytes.slice(),password,cMapUrl:'/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/pdfjs/standard_fonts/',isEvalSupported:false});try{return await task.promise}catch(error){await task.destroy();throw error}}
