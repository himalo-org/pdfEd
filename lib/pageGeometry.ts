type Box={x:number;y:number;width:number;height:number};
export function pageGeometry(media:Box,crop:Box,angle:number){
 if(![media.x,media.y,media.width,media.height].every(Number.isFinite)||media.width<=0||media.height<=0)throw Error('This page has an invalid MediaBox. Repair the PDF before editing.');
 if(!Number.isFinite(angle)||angle%90!==0)throw Error('This PDF has an unsupported page rotation. Only quarter-turn rotations are valid.');
 const left=Math.max(media.x,crop.x),bottom=Math.max(media.y,crop.y),right=Math.min(media.x+media.width,crop.x+crop.width),top=Math.min(media.y+media.height,crop.y+crop.height);
 // PDF.js uses the visible intersection, or the MediaBox when the crop is unusable.
 const valid=[left,bottom,right,top].every(Number.isFinite)&&right>left&&top>bottom;
 return {width:media.width,height:media.height,origin:{x:media.x,y:media.y},rotation:((angle%360)+360)%360,crop:valid?{x:left-media.x,y:media.y+media.height-top,w:right-left,h:top-bottom}:{x:0,y:0,w:media.width,h:media.height}};
}
