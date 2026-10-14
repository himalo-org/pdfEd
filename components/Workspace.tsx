'use client';
import dynamic from 'next/dynamic';
const Editor=dynamic(()=>import('./Editor'),{ssr:false,loading:()=> <main className="loading-workspace"><span className="logo">L</span><h1>Lokoon PDF</h1><p>Opening your private workspace…</p></main>});
export default Editor;
