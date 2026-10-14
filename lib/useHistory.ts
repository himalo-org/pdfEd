'use client';
import {useState} from 'react';
import {history,type State} from './model';
export function useEditingHistory(){
 const [value,setValue]=useState({past:[] as State[],present:{pages:[],forms:[]} as State,future:[] as State[]});
 return {
  state:value.present,canUndo:!!value.past.length,canRedo:!!value.future.length,
  commit:(next:State)=>setValue(v=>history(v.past,v.present,next)),
  reset:(next:State)=>setValue({past:[],present:next,future:[]}),
  undo:()=>setValue(v=>v.past.length?{past:v.past.slice(0,-1),present:v.past.at(-1)!,future:[v.present,...v.future]}:v),
  redo:()=>setValue(v=>v.future.length?{past:[...v.past,v.present],present:v.future[0],future:v.future.slice(1)}:v),
 };
}
