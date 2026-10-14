'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
export type MenuAction={label:string;shortcut?:string;disabled?:boolean;run:()=>void};
export default function ContextMenu({x,y,actions,onClose}:{x:number;y:number;actions:MenuAction[];onClose:()=>void}){
 const ref=useRef<HTMLDivElement>(null),close=useRef(onClose),[position,setPosition]=useState({left:x,top:y});close.current=onClose;
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const previous=document.activeElement,box=el.getBoundingClientRect();setPosition({left:Math.max(8,Math.min(x,window.innerWidth-box.width-8)),top:Math.max(8,Math.min(y,window.innerHeight-box.height-8))});el.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();return()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus()}},[x,y]);
 useEffect(()=>{const dismiss=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))close.current()},resize=()=>close.current();window.addEventListener('pointerdown',dismiss);window.addEventListener('resize',resize);return()=>{window.removeEventListener('pointerdown',dismiss);window.removeEventListener('resize',resize)}},[]);
 return <div ref={ref} role="menu" aria-label="PDF actions" className="context-menu" style={position} onContextMenu={e=>e.preventDefault()} onKeyDown={e=>{
  const buttons=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]),index=buttons.indexOf(document.activeElement as HTMLButtonElement);
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus()}
  if(e.key==='Escape'||e.key==='Tab'){e.preventDefault();e.stopPropagation();onClose()}
 }}>{actions.map(action=><button key={action.label} role="menuitem" disabled={action.disabled} onClick={()=>{onClose();action.run()}}><span>{action.label}</span>{action.shortcut&&<kbd>{action.shortcut}</kbd>}</button>)}</div>
}
