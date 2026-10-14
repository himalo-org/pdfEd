'use client';
export default function Error({reset}: {reset:()=>void}) {return <main><h1>The workspace encountered a problem</h1><p>Your original file is unchanged. Reload or restore your local draft.</p><button onClick={reset}>Try again</button></main>}
