import {exportPDF,inspect,imagesPDF} from './pdf';
import {PDFDocument} from 'pdf-lib';
import {originalRuns} from './originalText';
import {nativeContents} from './nativeEngine';
const scope=self as unknown as {onmessage:((event:MessageEvent)=>void)|null;postMessage:(message:unknown,transfer?:Transferable[])=>void};
scope.onmessage=async(e:MessageEvent)=>{try{if(e.data.operation==='nativeSpans'){scope.postMessage(await nativeContents(e.data.bytes,e.data.index));return}if(e.data.operation==='textRuns'){const doc=await PDFDocument.load(e.data.bytes,{updateMetadata:false});scope.postMessage({runs:await originalRuns(doc,e.data.index)});return}if(e.data.operation==='inspect'){scope.postMessage({state:await inspect(e.data.bytes,e.data.source)});return}const bytes=e.data.operation==='images'?await imagesPDF(e.data.files):await exportPDF(e.data.sources,e.data.state,e.data.options,p=>scope.postMessage({progress:p}));scope.postMessage({bytes},[bytes.buffer as ArrayBuffer]);}catch(error){scope.postMessage({error:error instanceof Error?error.message:String(error)})}};
