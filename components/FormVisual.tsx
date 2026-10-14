import type {ObjectEdit} from '@/lib/model';
export default function FormVisual({o}:{o:ObjectEdit}){
 if(o.fieldType==='radio'){const options=o.options?.filter(Boolean).length?o.options.filter(Boolean):['Option 1','Option 2'];return <>{options.map((v,i)=>{const cy=(i+.5)*o.h/options.length;return <g key={v}><circle cx={9} cy={cy} r={9} stroke={o.color} fill="white"/>{String(o.value)===v&&<circle cx={9} cy={cy} r={4} fill="#222"/>}<text x={26} y={cy+4} fontFamily="LokoonSans" fontSize={12} fill="#222">{v}</text></g>})}</>}
 return <><rect width={o.w} height={o.h} fill="white" stroke={o.color}/>{o.fieldType==='checkbox'?o.value&&<path d={`M${o.w*.2} ${o.h*.5} L${o.w*.42} ${o.h*.75} L${o.w*.8} ${o.h*.22}`} stroke="#222" strokeWidth={2} fill="none"/>:<text fill="#222" fontFamily="LokoonSans" fontSize={o.size}>{String(o.value||'').split('\n').map((s,i)=><tspan key={i} x={7} y={o.size+7+i*o.size*1.2}>{s}</tspan>)}</text>}</>
}
