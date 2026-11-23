import {useId} from 'react';

// IDs remain stable so previous purchases and achievement rewards keep working.
export const FRAME_ART={
 'orbit-voyager':['orbit','#88e4ef','#17414c'],'noir-raven':['raven','#d2cce0','#373040'],
 'critics-quill':['quill','#f2d396','#4b3623'],'dragon-screen':['dragon','#88dbac','#244b38'],
 'archive-reel':['reel','#e4b482','#4b3122'],'festival-wreath':['laurel','#f1d497','#514025'],
 bronze:['reel','#dcaa84','#503627'],silver:['deco','#dbe1ea','#39434e'],gold:['laurel','#edd192','#514025'],
 'crystal-diamond':['crystal','#bde9f4','#29485d'],'cinema-overlord':['deco','#f0cb85','#5a3a24'],
 'emerald-glow':['botanical','#91d5b4','#264c3c'],'sapphire-glow':['wave','#97cbf2','#284a66'],
 'rose-quartz':['crystal','#e6b3c8','#674054'],'scifi-nebula':['orbit','#b7c4f4','#323d64'],
 'nightmare-blood':['gothic','#ed7d88','#591e30'],'anime-sakura':['sakura','#f3c9d0','#66414c'],
 'genre-prismatic':['mosaic','#e1ca99','#393750'],'curator-heart':['ribbon','#f4a4ae','#6e2b3d'],
 'chrono-rewind':['clock','#dfca9c','#4d4030'],'fire-glow':['phoenix','#ffc58b','#763b25'],
 'matrix-code':['circuit','#8eddb6','#254d3d'],'cyber-violet':['circuit','#c7b4ef','#41385d'],
 'plasma-red':['crystal','#ff8b9c','#6c2235'],'frostbite-ice':['crystal','#c1f1f4','#2b5661'],
 'void-shadow':['eclipse','#c5b8e4','#39304d'],'lunar-archivist':['eclipse','#e7d9b0','#484037'],
 tidebound:['wave','#92ddd8','#234b50'],'velvet-marquee':['deco','#eccb90','#56313b'],
 'paper-crane':['crane','#ecdcca','#5e4048']
};

function Branch({metal,dark,mirror=false,small=false}){
 return <g transform={mirror?'translate(120 0) scale(-1 1)':undefined}>
  <path d="M42 109 C13 98 6 75 14 45" fill="none" stroke={metal} strokeWidth="1.4"/>
  {(small?[0,2,4]:[0,1,2,3,4]).map(i=><g key={i} transform={`translate(${12+i*3.6} ${54+i*10}) rotate(${-25+i*12})`}>
   <path d="M0 0 C-12 -1 -15 -9 -12 -15 C-2 -13 2 -6 0 0Z M0 0 C10 -4 12 -12 7 -18 C-1 -13 -4 -5 0 0Z" fill={dark} stroke={metal} strokeWidth=".9"/>
   {!small&&<path d="M-1 -2 L-10 -12 M1 -3 L6 -14" stroke={metal} strokeWidth=".5"/>}
  </g>)}
 </g>;
}
function Feather({metal,dark,mirror=false,small=false}){
 return <g transform={mirror?'translate(120 0) scale(-1 1)':undefined}>
  <path d="M26 101 C9 82 2 55 8 27 C15 33 19 41 22 48 L20 17 C32 29 36 45 31 63 C29 76 27 89 26 101Z" fill={dark} stroke={metal} strokeWidth="1.2"/>
  <path d="M26 99 Q15 64 13 35" fill="none" stroke={metal} strokeWidth=".9"/>
  {!small&&[0,1,2,3,4].map(i=><path key={i} d={`M${18+i*1.5} ${51+i*8} l-9 -8 m9 8 9 -11`} fill="none" stroke={metal} strokeWidth=".6" opacity=".8"/>)}
 </g>;
}
export default function EarnedFrameArt({id,small=false}){
 const uid=useId().replace(/[^a-zA-Z0-9]/g,'');const finish=FRAME_ART[id];if(!finish)return null;
 const [motif,color,dark]=finish,metal=`url(#metal${uid})`,enamel=`url(#enamel${uid})`;
 return <svg data-frame-art={id} aria-hidden="true" viewBox="0 0 120 120" style={{position:'absolute',inset:'-10%',width:'120%',height:'120%',overflow:'visible',pointerEvents:'none',zIndex:2}}>
 <defs>
  <linearGradient id={'metal'+uid} x1="0" y1="0" x2="1" y2="1"><stop stopColor={color}/><stop offset=".26" stopColor="#fff3dd"/><stop offset=".46" stopColor={color}/><stop offset=".71" stopColor={dark}/><stop offset="1" stopColor={color}/></linearGradient>
  <linearGradient id={'enamel'+uid} x1="0" y1="0" x2="1" y2="1"><stop stopColor={dark}/><stop offset=".5" stopColor="#14171c"/><stop offset="1" stopColor={dark}/></linearGradient>
 </defs>
 <circle cx="60" cy="60" r="50.8" fill="none" stroke="#111216" strokeWidth="7"/>
 <circle cx="60" cy="60" r="51.5" fill="none" stroke={metal} strokeWidth="2.2"/>
 <circle cx="60" cy="60" r="48.8" fill="none" stroke={color} strokeOpacity=".55" strokeWidth=".6"/>
 {motif==='orbit'&&<>
  <path d="M12 76 C-7 100 21 117 65 102 C101 89 122 65 109 53" fill="none" stroke="#10151b" strokeWidth="5"/>
  <path d="M12 76 C-7 100 21 117 65 102 C101 89 122 65 109 53" fill="none" stroke={metal} strokeWidth="1.8"/>
  <path d="M8 42 A55 55 0 0 1 78 7" fill="none" stroke={color} strokeWidth=".8" strokeDasharray="2 5"/>
  <g transform="translate(100 27) rotate(28)"><rect x="-5" y="-6" width="10" height="12" rx="2" fill={enamel} stroke={metal}/><path d="M-6 -3 H-18 V4 H-6 M6 -3 H18 V4 H6" fill={dark} stroke={metal}/>{!small&&<path d="M-12 -3 V4 M12 -3 V4 M0 -7 V-13 M-3 -13 H3" stroke={color} strokeWidth=".7"/>}</g><circle cx="24" cy="102" r="4" fill={enamel} stroke={metal}/>
 </>}
 {(motif==='raven'||motif==='phoenix')&&<>
  <Feather metal={metal} dark={enamel} small={small}/><Feather metal={metal} dark={enamel} small={small} mirror/>
  <path d={motif==='raven'?'M45 107 L55 99 L60 103 L65 99 L75 107 L65 111 L60 117 L55 111Z':'M39 106 L51 98 L60 103 L69 98 L81 106 L65 112 L60 119 L55 112Z'} fill={enamel} stroke={metal} strokeWidth="1.1"/>
  <path d="M55 107 L60 104 L65 107 L60 112Z" fill={color}/>{motif==='phoenix'&&<path d="M48 11 Q43 -1 52 4 L60 13 L68 4 Q77 -1 72 11" fill={dark} stroke={metal}/>}
 </>}
 {motif==='quill'&&<>
  <path d="M82 109 C105 83 116 54 110 25 C89 39 86 59 90 79 L82 109Z" fill={enamel} stroke={metal} strokeWidth="1.2"/>
  <path d="M78 111 Q98 76 108 32" fill="none" stroke={metal} strokeWidth="1.2"/>
  {!small&&[0,1,2,3,4].map(i=><path key={i} d={`M${96+i*2.2} ${72-i*8} l${13-i*2} -5 m${-13+i*2} 5 -5 -12`} fill="none" stroke={color} strokeWidth=".6"/>)}
  <path d="M10 90 H32 L36 108 Q22 114 6 108Z M14 89 V83 H28 V89" fill={enamel} stroke={metal} strokeWidth="1.1"/><path d="M13 103 H29" stroke={color}/>
 </>}
 {motif==='dragon'&&<>
  {[false,true].map(mirror=><g key={String(mirror)} transform={mirror?'translate(120 0) scale(-1 1)':undefined}><path d="M24 91 C4 72 4 41 21 18 L19 40 L28 34 L20 57 L28 55 L23 76Z" fill={enamel} stroke={metal} strokeWidth="1.2"/>{!small&&<path d="M13 49 l8 -7 M12 62 l9 -7 M16 75 l7 -7" stroke={color} strokeWidth=".6"/>}</g>)}
  <path d="M43 105 L41 91 L52 97 L60 90 L68 97 L79 91 L77 105 L69 116 L60 120 L51 116Z" fill={enamel} stroke={metal} strokeWidth="1.3"/>
  <path d="M48 103 L56 105 M64 105 L72 103" stroke={color} strokeWidth="2"/><path d="M56 112 L60 115 L64 112 M60 101 V109" fill="none" stroke={metal}/>
 </>}
 {motif==='reel'&&<>
  {[false,true].map(mirror=><g key={String(mirror)} transform={mirror?'translate(120 0) scale(-1 1)':undefined}><path d="M11 29 Q2 61 12 91 L20 88 Q10 59 20 32Z" fill={enamel} stroke={metal}/>{(small?[0,2,4]:[0,1,2,3,4]).map(i=><rect key={i} x={i===0||i===4?12:8} y={36+i*10} width="4" height="5" rx="1" fill={color}/>)}</g>)}
  <circle cx="60" cy="107" r="11" fill={enamel} stroke={metal} strokeWidth="1.4"/>{[0,1,2,3].map(i=><circle key={i} cx="60" cy="101" r="2.8" fill={color} transform={`rotate(${i*90} 60 107)`}/>)}<circle cx="60" cy="107" r="1.7" fill={color}/>
 </>}
 {(motif==='laurel'||motif==='botanical')&&<>
  <Branch metal={metal} dark={enamel} small={small}/><Branch metal={metal} dark={enamel} small={small} mirror/>
  {motif==='laurel'?<path d="M60 96 L64 104 L73 105 L66 111 L68 120 L60 115 L52 120 L54 111 L47 105 L56 104Z" fill={enamel} stroke={metal} strokeWidth="1.2"/>:<path d="M60 98 C42 101 45 115 60 118 C75 115 78 101 60 98Z M60 100 V116" fill={enamel} stroke={metal} strokeWidth="1.2"/>}
 </>}
 {motif==='deco'&&<>
  {[false,true].map(mirror=><g key={String(mirror)} transform={mirror?'translate(120 0) scale(-1 1)':undefined} fill={enamel} stroke={metal} strokeWidth="1"><path d="M11 37 L20 28 L20 92 L11 83Z"/><path d="M5 44 L10 39 V81 L5 76Z"/>{!small&&<path d="M15 39 V81 M8 46 V74" fill="none" strokeWidth=".5"/>}</g>)}
  <path d="M33 14 L44 9 L44 4 L76 4 L76 9 L87 14 L78 20 L42 20Z" fill={enamel} stroke={metal}/><path d="M43 13 H77 M50 8 H70" stroke={color} strokeWidth=".7"/>
  <path d="M35 104 H85 L80 115 H40Z" fill={enamel} stroke={metal}/><path d="M48 109 H72" stroke={color}/>
 </>}
 {motif==='crystal'&&(small?[0,90,180,270]:[0,45,90,135,180,225,270,315]).map(angle=><g key={angle} transform={`rotate(${angle} 60 60)`}><path d="M54 12 L57 3 L63 3 L66 12 L60 21Z" fill={enamel} stroke={metal} strokeWidth=".8"/><path d="M54 12 H66 L60 21 L58 12 L60 4 L62 12" fill="none" stroke={color} strokeWidth=".5"/></g>)}
 {motif==='gothic'&&<>
  {[false,true].map(mirror=><path key={String(mirror)} transform={mirror?'translate(120 0) scale(-1 1)':undefined} d="M28 95 Q4 85 3 48 L11 55 L11 30 L20 41 L25 18 L30 41 L22 65Z" fill={enamel} stroke={metal} strokeWidth="1.2"/>)}
  <path d="M52 100 L60 95 L68 100 L69 109 L64 109 L64 116 H56 V109 H51Z" fill={enamel} stroke={metal}/><path d="M55 104 h3 m4 0 h3" stroke={color} strokeWidth="2"/>
 </>}
 {motif==='sakura'&&<>
  <path d="M13 39 Q-1 87 43 109 M107 81 Q117 30 77 11" fill="none" stroke={metal} strokeWidth="2"/>
  {(small?[[15,70],[96,28]]:[[15,70],[24,94],[96,28],[105,49]]).map(([x,y],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${i*27})`}>{[0,1,2,3,4].map(n=><path key={n} d="M0 0 C-9 -4 -7 -13 0 -8 C7 -13 9 -4 0 0Z" transform={`rotate(${n*72})`} fill={dark} stroke={color} strokeWidth=".8"/>)}<circle r="2" fill="#f5d7a1"/></g>)}
 </>}
 {motif==='mosaic'&&Array.from({length:small?8:16},(_,i)=><path key={i} d="M53 10 L60 4 L67 10 L60 16Z" transform={`rotate(${i*(small?45:22.5)} 60 60)`} fill={['#9c5664','#ba9867','#648f86','#777da6'][i%4]} stroke="#e1cfa4" strokeWidth=".6"/>)}
 {motif==='ribbon'&&<>
  <path d="M40 102 L31 119 L47 114 L51 120 L55 105 M80 102 L89 119 L73 114 L69 120 L65 105" fill={enamel} stroke={metal}/><path d="M60 104 C45 85 37 104 60 117 C83 104 75 85 60 104Z" fill={dark} stroke={metal} strokeWidth="1.2"/>
  <path d="M10 56 A51 51 0 0 1 33 16 M110 56 A51 51 0 0 0 87 16" fill="none" stroke={color} strokeDasharray="3 4"/>
 </>}
 {motif==='clock'&&<>
  {Array.from({length:small?12:24},(_,i)=><path key={i} d={i%2?'M60 8 V11':'M60 6 V12'} transform={`rotate(${i*(small?30:15)} 60 60)`} stroke={metal} strokeWidth={i%2?'.7':'1.3'}/>)}
  <circle cx="60" cy="106" r="12" fill={enamel} stroke={metal}/><path d="M60 97 V106 L67 109 M45 5 H75 V13 H45Z" fill={enamel} stroke={metal}/><circle cx="60" cy="106" r="1.5" fill={color}/>
 </>}
 {motif==='wave'&&<>
  <path d="M9 79 Q5 102 26 100 Q16 87 30 84 Q25 105 51 106 Q66 108 83 99 Q107 90 112 70 Q121 103 86 113 Q39 130 12 101Z" fill={enamel} stroke={metal} strokeWidth="1.2"/>
  <path d="M16 105 Q37 118 67 112 M71 109 Q99 99 105 87" fill="none" stroke={color} strokeWidth=".7"/>{!small&&<path d="M9 33 q-6 -7 0 -12 q7 5 0 12 M108 44 q-7 -9 0 -15 q8 6 0 15" fill={color} opacity=".75"/>}
 </>}
 {motif==='circuit'&&<>
  {[false,true].map(mirror=><g key={String(mirror)} transform={mirror?'translate(120 0) scale(-1 1)':undefined} fill={enamel} stroke={metal} strokeWidth="1.2"><path d="M20 22 H10 V42 H5 V77 H12 V96 H25 M17 33 V49 H11 V70 H18 V87" fill="none"/>{[22,49,77,96].map((y,i)=><rect key={y} x={i%2?8:16} y={y-2} width="4" height="4"/>)}</g>)}
  <path d="M48 101 H72 V115 H48Z" fill={enamel} stroke={metal}/><path d="M54 106 H66 V110 H54Z" fill={color}/>
 </>}
 {motif==='eclipse'&&<>
  <circle cx="60" cy="60" r="56" fill="none" stroke={metal} strokeWidth=".8" strokeDasharray="52 17" transform="rotate(-25 60 60)"/>
  <path d="M75 2 Q45 15 75 28 Q41 33 41 15 Q41 -2 75 2Z" fill={enamel} stroke={metal} strokeWidth="1.1"/>
  <path d="M17 93 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z M103 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" fill={color}/>
 </>}
 {motif==='crane'&&<>
  <path d="M8 77 Q4 36 35 15 M112 77 Q116 36 85 15" fill="none" stroke={metal} strokeDasharray="4 3"/>
  <path d="M60 106 L31 86 L43 110 L60 113 L77 110 L91 84 L63 105 L70 91 L77 89 L73 96Z" fill={enamel} stroke={metal} strokeWidth="1.1"/>{!small&&<path d="M43 110 L54 105 M77 110 L68 106 M60 106 V113" stroke={color} strokeWidth=".7"/>}
 </>}
 </svg>;
}
