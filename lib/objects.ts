import type {ObjectEdit} from './model';

/** Resize in the object's axes, keeping its rotated top-left corner fixed. */
export function resizeObject(o:ObjectEdit,width:number,height:number,axis:'width'|'height'='width'):ObjectEdit {
 let w=Math.max(1,Number.isFinite(width)?width:o.w),h=Math.max(1,Number.isFinite(height)?height:o.h);
 if(o.kind==='image'){if(axis==='height')w=h*o.w/o.h;else h=w*o.h/o.w}
 const angle=o.rotation*Math.PI/180,delta=o.h-h;
 return {...o,w,h,x:o.x+delta*Math.sin(angle),y:o.y+delta*(1-Math.cos(angle)),points:o.points?.map(p=>[p[0]*w/o.w,p[1]*h/o.h])};
}

/** The line's endpoints preserve the direction of the user's drag. */
export function dragBounds(start:number[],end:number[],directional=false){
 const x=Math.min(start[0],end[0]),y=Math.min(start[1],end[1]);
 return {x,y,w:Math.max(1,Math.abs(end[0]-start[0])),h:Math.max(1,Math.abs(end[1]-start[1])),...(directional?{points:[[start[0]-x,start[1]-y],[end[0]-x,end[1]-y]]}:{})};
}
