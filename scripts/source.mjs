import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {zipSync,strToU8} from 'fflate';
import {download} from './download.mjs';
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+e.name;files.push(...(e.isDirectory()?await walk(path):[path]))}return files}
const files=['vercel.json','.vercelignore','package.json','package-lock.json','tsconfig.json','next.config.ts','playwright.config.ts','Dockerfile','compose.yaml','compose.qa.yaml','.dockerignore','README.md','LICENSES.md','FEATURE_MATRIX.md','TEST_RESULTS.md','LICENSE'];
for(const dir of ['app','components','lib','scripts','tests','docker','.github']){try{files.push(...await walk(dir))}catch{}}
const archive={};for(const path of files){try{archive[path]=new Uint8Array(await readFile(path))}catch{}}
archive['SOURCE-NOTICE.txt']=strToU8('Lokoon PDF is licensed AGPL-3.0-or-later. Build instructions are in README.md. MuPDF 1.28.1 corresponding source is provided alongside this archive as mupdf-1.28.1-source.tar.gz. Other dependency versions are specified in package-lock.json; retain their license notices. No user documents or local drafts are included.');
await mkdir('public/source',{recursive:true});await writeFile('public/source/lokoon-pdf-source.zip',zipSync(archive,{level:6}));
await download('https://mupdf.com/downloads/archive/mupdf-1.28.1-source.tar.gz','public/source/mupdf-1.28.1-source.tar.gz');
