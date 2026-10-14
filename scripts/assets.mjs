import {mkdir,cp,access} from 'node:fs/promises';
import {download} from './download.mjs';
import {generateIcons} from './icons.mjs';
await generateIcons();
await mkdir('public/mupdf',{recursive:true});await cp('node_modules/mupdf/dist','public/mupdf',{recursive:true});
await mkdir('public/pdfjs',{recursive:true});await mkdir('public/fonts',{recursive:true});await mkdir('public/ocr',{recursive:true});
for(const dir of ['cmaps','standard_fonts'])await cp(`node_modules/pdfjs-dist/${dir}`,`public/pdfjs/${dir}`,{recursive:true});
await cp('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/pdfjs/pdf.worker.min.mjs');
// MuPDF ships the AGPL license with its npm package; no GNU connection needed.
try{await access('LICENSE')}catch{
 let copied=false;
 for(const name of ['LICENSE','COPYING','LICENSE.txt','LICENSE.md']){
  try{await cp(`node_modules/mupdf/${name}`,'LICENSE');copied=true;break}catch{}
 }
 if(!copied)await download('https://raw.githubusercontent.com/ArtifexSoftware/mupdf/1.28.1/COPYING','LICENSE');
}
const noto='https://raw.githubusercontent.com/notofonts/noto-fonts/main';
await download(`${noto}/hinted/ttf/NotoSans/NotoSans-Regular.ttf`,'public/fonts/NotoSans-Regular.ttf');
await download(`${noto}/hinted/ttf/NotoSerif/NotoSerif-Regular.ttf`,'public/fonts/NotoSerif-Regular.ttf');
await download(`${noto}/LICENSE`,'public/fonts/OFL.txt');
await cp('node_modules/tesseract.js/dist/worker.min.js','public/ocr/worker.min.js');
for(const file of ['tesseract-core.wasm.js','tesseract-core.wasm','tesseract-core-simd.wasm.js','tesseract-core-simd.wasm','tesseract-core-lstm.wasm.js','tesseract-core-lstm.wasm','tesseract-core-simd-lstm.wasm.js','tesseract-core-simd-lstm.wasm'])await cp(`node_modules/tesseract.js-core/${file}`,`public/ocr/${file}`);
for(const lang of ['eng','fra','deu'])await download(`https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/${lang}.traineddata.gz`,`public/ocr/${lang}.traineddata.gz`);
console.log('Local PDF workers, fonts and OCR assets ready. Runtime uses only same-origin assets.');
await mkdir('public/licenses',{recursive:true});
for(const name of ['next','react','react-dom','pdf-lib','pdfjs-dist','@pdf-lib/fontkit','lucide-react','idb','tesseract.js','tesseract.js-core','mupdf']){for(const filename of ['LICENSE','LICENSE.md','LICENSE.txt']){try{await cp(`node_modules/${name}/${filename}`,`public/licenses/${name.replace('/','-')}-${filename}`);break}catch{}}}
