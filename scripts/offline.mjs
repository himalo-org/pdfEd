import {readdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {serviceWorker} from './serviceworker.mjs';
async function walk(p){const out=[];for(const e of await readdir(p,{withFileTypes:true})){const q=`${p}/${e.name}`;out.push(...(e.isDirectory()?await walk(q):[q.replace(/^out/,'')]));}return out}
const files=(await walk('out')).filter(x=>!x.endsWith('.map')&&!x.endsWith('/sw.js')&&!x.startsWith('/source/'));
const hash=createHash('sha256');for(const file of files)hash.update(await readFile('out'+file));const version=hash.digest('hex').slice(0,12);
await writeFile('out/sw.js',serviceWorker(files,version));
