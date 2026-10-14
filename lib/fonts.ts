export type LocalFonts={sans:Uint8Array;serif:Uint8Array};
let bundled:Promise<LocalFonts>|null=null;
export function bundledFonts():Promise<LocalFonts>{
 if(!bundled)bundled=Promise.all(['NotoSans-Regular.ttf','NotoSerif-Regular.ttf'].map(async name=>{
  const response=await fetch('/fonts/'+name);
  if(!response.ok)throw Error('Local fonts are missing. Prepare application assets, or load a licensed TTF/OTF font in Settings.');
  return new Uint8Array(await response.arrayBuffer());
 })).then(([sans,serif])=>({sans,serif})).catch(error=>{bundled=null;throw error});
 return bundled;
}
export async function applyPreviewFonts(fonts:LocalFonts,signal?:AbortSignal){
 const faces=await Promise.all([new FontFace('LokoonSans',new Uint8Array(fonts.sans).buffer).load(),new FontFace('LokoonSerif',new Uint8Array(fonts.serif).buffer).load()]);
 // Replace only after both fonts have loaded; failed loading keeps the current preview intact.
 signal?.throwIfAborted();
 document.fonts.forEach(face=>{if(['LokoonSans','LokoonSerif'].includes(face.family))document.fonts.delete(face)});
 faces.forEach(face=>document.fonts.add(face));
}
