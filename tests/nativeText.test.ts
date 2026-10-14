import {test} from 'node:test';
import assert from 'node:assert/strict';
import {textCollector} from '../lib/nativeText';
import {validateNativeSelections} from '../lib/nativeValidation';
test('fractional text bounds survive extraction and export validation',()=>{
 const {walker,spans}=textCollector();walker.beginLine([40.235,62.419,100.897,80.138],0,[1,0]);
 for(const ch of 'Hello')walker.onChar(ch,[40.235,76.5],null,14,[],[.2,.4,.6]);walker.endLine();
 assert.equal(spans.length,1);assert.equal(spans[0].text,'Hello');assert.equal(spans[0].rect.x,40.235);assert.equal(spans[0].baseline,76.5);assert.equal(spans[0].color,'#336699');
 assert.doesNotThrow(()=>validateNativeSelections([{...spans[0],id:'span',replacement:'Hi'}],spans));
});
test('horizontal text is eligible while vertical, rotated and empty lines are excluded',()=>{
 const {walker,spans}=textCollector();for(const [mode,dir,text] of [[0,[1,0],'Valid'],[1,[0,1],'Vertical'],[0,[.707,.707],'Rotated'],[0,[1,0],' ']] as const){walker.beginLine([1,2,60,20],mode,[...dir]);walker.onChar(text,[1,16],null,12,[],0xff123456);walker.endLine()}
 assert.deepEqual(spans.map(s=>s.text),['Valid']);assert.equal(spans[0].color,'#123456');
});
