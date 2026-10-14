import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {download} from '../scripts/download.mjs';

async function fixture(run){const dir=await mkdtemp(join(tmpdir(),'lokoon-assets-'));try{await run(join(dir,'asset'))}finally{await rm(dir,{recursive:true,force:true})}}
test('asset downloads retry connection failures and publish complete bytes',()=>fixture(async path=>{
 let calls=0;
 await download('https://build.test/asset',path,{delayMs:0,fetcher:async()=>{if(++calls===1)throw Error('connection timeout');return new Response('complete asset')}});
 assert.equal(calls,2);assert.equal(await readFile(path,'utf8'),'complete asset');await assert.rejects(access(path+'.part'));
}));
test('already provisioned assets require no network',()=>fixture(async path=>{
 await writeFile(path,'local');await download('https://build.test/asset',path,{fetcher:()=>{throw Error('must not fetch')}});assert.equal(await readFile(path,'utf8'),'local');
}));
test('HTTP failures can fall back to another source',()=>fixture(async path=>{
 const urls=[];await download(['https://build.test/a','https://build.test/b'],path,{delayMs:0,fetcher:async url=>{urls.push(url);return new Response(url.endsWith('/a')?'unavailable':'fallback',{status:url.endsWith('/a')?503:200})}});
 assert.equal(urls.length,2);assert.equal(await readFile(path,'utf8'),'fallback');
}));
test('exhausted downloads explain recovery and leave no partial asset',()=>fixture(async path=>{
 await assert.rejects(download('https://build.test/asset',path,{attempts:2,delayMs:0,fetcher:async()=>new Response('',{status:503})}),/Check Docker.*HTTP 503/s);
 await assert.rejects(access(path));await assert.rejects(access(path+'.part'));
}));
