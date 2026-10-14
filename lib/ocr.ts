import {createWorker} from 'tesseract.js';
export async function recognize(canvas:HTMLCanvasElement,lang:string,progress:(n:number)=>void,signal:AbortSignal){
 if(!['eng','fra','deu'].includes(lang))throw Error('Unsupported OCR language');
 if(canvas.width*canvas.height>8000000)throw Error('OCR is limited to 8 megapixels per page to constrain memory.');
 let worker:Awaited<ReturnType<typeof createWorker>>|null=null;
 const abort=()=>{if(worker)void worker.terminate()};signal.addEventListener('abort',abort,{once:true});
 try{worker=await createWorker(lang,1,{workerPath:'/ocr/worker.min.js',corePath:'/ocr/',langPath:'/ocr/',workerBlobURL:false,cacheMethod:'none',logger:m=>{if(m.status==='recognizing text')progress(m.progress)}});if(signal.aborted)throw Error('OCR cancelled');const result=await worker.recognize(canvas);if(signal.aborted)throw Error('OCR cancelled');return result.data.text;}finally{signal.removeEventListener('abort',abort);await worker?.terminate();}
}
