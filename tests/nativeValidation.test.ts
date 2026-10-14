import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateNativeSelections,sameRect,intersects} from '../lib/nativeValidation';
import type {NativeTextEdit} from '../lib/nativeTypes';
const edit:NativeTextEdit={id:'a',text:'Original',replacement:'New',rect:{x:20,y:30,w:100,h:20},baseline:45,size:14,font:'sans',color:'#222222'};
test('native edits reject stale, ambiguous, duplicate and overlapping selections',()=>{const line={text:edit.text,rect:edit.rect};assert.doesNotThrow(()=>validateNativeSelections([edit],[line]));assert.throws(()=>validateNativeSelections([edit],[]),/stale/);assert.throws(()=>validateNativeSelections([edit],[line,line]),/ambiguous/);assert.throws(()=>validateNativeSelections([edit,edit],[line]),/overlap|Duplicate/);assert.throws(()=>validateNativeSelections([edit],[line,{text:'Neighbour',rect:{x:110,y:30,w:100,h:20}}]),/neighbour/)});
test('native edits preserve neighbouring lines and accept only single-line replacements',()=>{const line={text:edit.text,rect:edit.rect};assert.doesNotThrow(()=>validateNativeSelections([edit],[line,{text:'Below',rect:{x:20,y:60,w:100,h:20}}]));assert.throws(()=>validateNativeSelections([{...edit,replacement:'one\ntwo'}],[line]),/one line/);assert.equal(intersects(edit.rect,{x:120,y:30,w:100,h:20}),false);assert.equal(sameRect(edit.rect,{...edit.rect,x:20.05}),true)});
