import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {ObjectEdit} from '../lib/model';
import {lineSegments} from '../lib/model';
import {resizeObject,dragBounds} from '../lib/objects';
const shape:ObjectEdit={id:'shape',kind:'rectangle',x:40,y:60,w:100,h:80,rotation:0,color:'#000000',size:2,text:'',align:'left',font:'sans'};
function corner(o:ObjectEdit){const a=o.rotation*Math.PI/180;return [o.x+o.h*Math.sin(a),o.y+o.h*(1-Math.cos(a))]}
test('resizing rotated objects keeps the top-left corner fixed',()=>{for(const rotation of [0,30,90,180,270]){const o={...shape,rotation},next=resizeObject(o,150,200);const before=corner(o),after=corner(next);assert.ok(Math.abs(before[0]-after[0])<1e-8);assert.ok(Math.abs(before[1]-after[1])<1e-8)}});
test('image resizing preserves aspect ratio and rejects negative dimensions',()=>{const image={...shape,kind:'image' as const};const a=resizeObject(image,200,80);assert.equal(a.h,160);const b=resizeObject(image,100,40,'height');assert.equal(b.w,50);const c=resizeObject(image,-20,-40);assert.ok(c.w>0&&c.h>0);assert.equal(c.w/c.h,image.w/image.h)});
test('resizing freehand paths scales points without mutating history',()=>{const o={...shape,kind:'pen' as const,points:[[0,0],[50,40],[100,80]]},next=resizeObject(o,200,160);assert.deepEqual(next.points,[[0,0],[100,80],[200,160]]);assert.deepEqual(o.points,[[0,0],[50,40],[100,80]])});
test('arrows preserve drag direction in all quadrants, horizontal and vertical',()=>{for(const end of [[80,100],[-20,100],[80,-20],[-20,-20],[40,100],[80,60]]){const bounds=dragBounds([40,60],end,true);const segments=lineSegments({...bounds,kind:'arrow'});assert.deepEqual([bounds.x+segments[0][0],bounds.y+segments[0][1]],[40,60]);assert.deepEqual([bounds.x+segments[0][2],bounds.y+segments[0][3]],end);assert.deepEqual(segments[1].slice(0,2),segments[0].slice(2));assert.ok(bounds.w>0&&bounds.h>0)}});
