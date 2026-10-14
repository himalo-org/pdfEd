import {writeFile,mkdir} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function chunk(type,data){const t=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);t.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc(Buffer.concat([t,data])),data.length+8);return out}
export async function generateIcons(){
 await mkdir('public',{recursive:true});
 for(const size of [192,512]){const pixels=Buffer.alloc(size*(size*4+1));for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*(size*4+1)+1+x*4;const ink=(x>size*.27&&x<size*.39&&y>size*.23&&y<size*.77)||(x>size*.27&&x<size*.73&&y>size*.65&&y<size*.77);pixels[i]=ink?255:85;pixels[i+1]=ink?255:73;pixels[i+2]=ink?255:206;pixels[i+3]=255}const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;await writeFile(`public/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]));}
}
