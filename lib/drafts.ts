import {openDB} from 'idb';
import type {Source,State} from './model';
export type Draft={sources:Source[];state:State;name:string;updated:number;fontOverride?:Uint8Array|null;fontName?:string};
const db=()=>openDB('lokoon-private',1,{upgrade(d){d.createObjectStore('drafts')}});
export async function saveDraft(value:Draft){const d=await db();await d.put('drafts',value,'current');d.close()}
export async function getDraft():Promise<Draft|null>{const d=await db();const v=await d.get('drafts','current');d.close();return v||null}
export async function clearDraft(){const d=await db();await d.clear('drafts');d.close()}
