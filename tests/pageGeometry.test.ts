import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pageGeometry} from '../lib/pageGeometry';
const media={x:-20,y:50,width:600,height:800};
test('crop geometry keeps nonzero MediaBox offsets and normalized rotation',()=>{const p=pageGeometry(media,{x:20,y:100,width:300,height:400},-90);assert.deepEqual(p.origin,{x:-20,y:50});assert.equal(p.rotation,270);assert.deepEqual(p.crop,{x:40,y:350,w:300,h:400})});
test('crop boxes are intersected with the MediaBox; unusable crops fall back',()=>{const p=pageGeometry(media,{x:-100,y:0,width:300,height:300},0);assert.deepEqual(p.crop,{x:0,y:550,w:220,h:250});const bad=pageGeometry(media,{x:900,y:900,width:100,height:100},0);assert.deepEqual(bad.crop,{x:0,y:0,w:600,h:800})});
test('malformed dimensions and unsupported rotations fail explicitly',()=>{assert.throws(()=>pageGeometry({...media,width:0},media,0),/invalid MediaBox/);assert.throws(()=>pageGeometry({...media,height:NaN},media,0),/invalid MediaBox/);assert.throws(()=>pageGeometry(media,media,45),/unsupported page rotation/)});
