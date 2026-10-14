import {access,rename,rm,writeFile} from 'node:fs/promises';

// Build-time downloads only. Partial files never become reusable assets.
export async function download(urls,path,{fetcher=fetch,attempts=3,timeoutMs=120000,delayMs=1000}={}){
  try{await access(path);return}catch{}
  const sources=Array.isArray(urls)?urls:[urls];
  const failures=[];
  for(let attempt=0;attempt<attempts;attempt++){
    for(const url of sources){
      try{
        const response=await fetcher(url,{signal:AbortSignal.timeout(timeoutMs)});
        if(!response.ok)throw Error(`HTTP ${response.status}`);
        const bytes=new Uint8Array(await response.arrayBuffer());
        if(!bytes.length)throw Error('Empty response');
        await writeFile(path+'.part',bytes);
        await rename(path+'.part',path);
        return;
      }catch(error){
        await rm(path+'.part',{force:true});
        const cause=error?.cause?.code;
        failures.push(`${url}: ${error.message}${cause?' ('+cause+')':''}`);
      }
    }
    if(attempt+1<attempts&&delayMs)await new Promise(resolve=>setTimeout(resolve,delayMs*(attempt+1)));
  }
  throw Error(`Could not prepare local asset ${path}. Check Docker's internet/DNS/proxy settings, or place the complete asset at this path before building.\n${failures.slice(-sources.length).join('\n')}`);
}
