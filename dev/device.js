/* ============ VOZ DEL DISPOSITIVO (respaldo) + SUBTÍTULOS ============ */
const synth=window.speechSynthesis||null;
let devVoices=[], devVoice=null;
let chunks=[], cur=-1, paused=false, resumeAt=0, sid=0, sim=null, noBoundary=false, silent=!synth, lastB=null, total=1, gotStart=false;
const ta=$('#ta'), subs=$('#subs');
function loadVoices(){
 if(!synth) return; devVoices=synth.getVoices(); if(!devVoices.length) return;
 const sc=v=>(/^es[-_]AR/i.test(v.lang)?0:/^es[-_](US|MX|419)/i.test(v.lang)?1:/^es/i.test(v.lang)?2:5);
 devVoices.sort((a,b)=>sc(a)-sc(b)||a.name.localeCompare(b.name));
 const sel=$('#voice'), saved=store.get('devVoice',''); sel.innerHTML='';
 devVoices.forEach((v,i)=>{const o=document.createElement('option'); o.value=i; o.textContent=`${v.name} (${v.lang})`; sel.appendChild(o);});
 let idx=devVoices.findIndex(v=>v.name===saved); if(idx<0) idx=0; sel.value=idx; devVoice=devVoices[idx];
}
if(synth){loadVoices(); synth.onvoiceschanged=loadVoices;}
function note(h){const n=$('#note'); n.innerHTML=h; n.style.display='block'; clearTimeout(note.t); note.t=setTimeout(()=>n.style.display='none',12000);}
$('#voice').onchange=e=>{devVoice=devVoices[+e.target.value]; store.set('devVoice',devVoice?.name||'');};

function buildChunks(text,from){
 const out=[], s=text.slice(from), re=/(?:[^.!?…\n]|[.!?…](?=\S))+[.!?…]*["”»)]*\s*|\n+/g; let m;
 while((m=re.exec(s))){const piece=m[0]; if(!piece.trim()) continue; const base=from+m.index;
  if(piece.length<=230){out.push({text:piece,start:base});continue;}
  const re2=/[^,;:]+[,;:]?\s*/g; let m2; let buf='',bs=0;
  while((m2=re2.exec(piece))){ if(buf&&(buf+m2[0]).length>220){out.push({text:buf,start:base+bs});buf='';}
   if(!buf) bs=m2.index; buf+=m2[0];
   while(buf.length>230){const cut=buf.lastIndexOf(' ',210)>40?buf.lastIndexOf(' ',210):210; out.push({text:buf.slice(0,cut),start:base+bs}); bs+=cut; buf=buf.slice(cut);}}
  if(buf.trim()) out.push({text:buf,start:base+bs});
 }
 return out;
}
function tokens(text){const r=[],re=/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu;let m;while((m=re.exec(text)))r.push({i:m.index,w:m[0]});return r;}
function unlockAudio(){ if(!synth) return; try{const u=new SpeechSynthesisUtterance(' '); u.volume=0; synth.speak(u);}catch(e){} }

function requestSpeak(){
 const text=ta.value; if(!text.trim()){ ta.focus(); flashSys('PEGÁ UN TEXTO PRIMERO'); return; }
 store.set('text',text); $('#panel').classList.add('min'); clearTimeout(vanishTimer);
 if(E.on&&E.paused){ E.paused=false; ensureAudio2(); E.player.play().catch(()=>{}); setStatus('HABLANDO'); setBtn(); return; }
 if(paused){ startDevice(resumeAt); return; }
 if(API.tts&&API.codeOk){ ensureAudio(); startEleven(0); return; }
 if(P.state==='shown') startDevice(0); else { unlockAudio(); materialize(()=>startDevice(0)); }
}
function ensureAudio2(){ try{E.ctx&&E.ctx.resume();}catch(e){} }
function startDevice(from){
 stopAll(true); const text=ta.value; total=Math.max(1,text.length);
 chunks=buildChunks(text,from); if(!chunks.length) return;
 const isid=++E.sid; IMG.sid=isid; prepareImages(buildChunks(text,0),text,isid);
 const my=++sid; playing=true; paused=false; gotStart=false; setStatus('HABLANDO'); setBtn();
 if(silent||!devVoices.length&&!synth){ beginChunk(0,true,my); return; }
 synth.cancel();
 chunks.forEach((c,i)=>{const u=new SpeechSynthesisUtterance(c.text);
  if(devVoice){u.voice=devVoice;u.lang=devVoice.lang;} else u.lang='es-AR'; u.rate=rate; u.pitch=SK.mode===1?.85:1;
  u.onstart=()=>{ if(my!==sid) return; gotStart=true; beginChunk(i,false,my); };
  u.onboundary=e=>{ if(my!==sid||i!==cur) return; if(e.name&&e.name!=='word') return; c.gotB=true; if(sim&&sim.chunk===i){sim=null;} onWord(i,e.charIndex,e.charLength,true); };
  u.onend=()=>{ if(my!==sid) return; if(i===chunks.length-1) finish(); };
  u.onerror=e=>{ if(my!==sid) return; if(e.error==='interrupted'||e.error==='canceled') return; if(!gotStart){ silent=true; note('La voz del dispositivo no arrancó. Sigo en modo silencioso con subtítulos.'); startDevice(from); return; } if(i===chunks.length-1) finish(); };
  synth.speak(u);});
 setTimeout(()=>{ if(my===sid&&playing&&!gotStart){ silent=true; note('La voz del dispositivo no arrancó. Sigo en modo silencioso con subtítulos.'); synth.cancel(); beginChunk(0,true,my);} },3500);
}
function beginChunk(i,silentMode,my){
 cur=i; lastB=null; renderText(chunks[i].text); exprFor(chunks[i].text);
 if(silentMode||noBoundary) startSim(i,silentMode,0);
 else setTimeout(()=>{ if(my===sid&&cur===i&&!chunks[i].gotB&&playing&&!paused){ noBoundary=true; startSim(i,false,650);} },650);
}
function startSim(i,silentMode,offset){
 const c=chunks[i], tk=tokens(c.text), times=[]; let t=0;
 for(let k=0;k<tk.length;k++){times.push(t); const after=c.text.slice(tk[k].i+tk[k].w.length,(tk[k+1]?.i)??c.text.length);
  t+=tk[k].w.length*mpc+70+(/[.!?…]/.test(after)?480:/[,;:]/.test(after)?260:0);}
 sim={chunk:i,tk,times,k:0,t0:performance.now()-offset,silent:silentMode,end:t,my:sid};
}
function updateSim(now){
 if(!sim||sim.my!==sid||!playing) return; const el=now-sim.t0;
 while(sim.k<sim.tk.length&&el>=sim.times[sim.k]){const tk=sim.tk[sim.k]; onWord(sim.chunk,tk.i,tk.w.length,false); sim.k++;}
 if(sim&&sim.silent&&el>sim.end+200){const n=sim.chunk+1; sim=null; if(n<chunks.length) beginChunk(n,true,sid); else finish();}
}
function onWord(i,ci,len,real){
 const c=chunks[i]; if(!c) return; const now=performance.now();
 let word=len?c.text.substr(ci,len):''; if(!word){const m=/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/u.exec(c.text.slice(ci)); if(m){ci+=m.index;word=m[0];}}
 if(!word) return;
 if(real&&lastB&&lastB.ci<ci){const between=c.text.slice(lastB.ci,ci), dt=now-lastB.time;
  if(!/[.,;:!?…]/.test(between)&&dt<2500) mpc=clamp(mpc*.7+(dt/(ci-lastB.ci))*.3,35,170);}
 lastB={ci,time:now};
 playWord(word,now); highlight(ci); resumeAt=c.start+ci; $('#pg').style.width=(resumeAt/total*100).toFixed(1)+'%';
 imgTick(resumeAt);
 if(word.length>6||Math.random()<.18) S.nodV-=rnd(.35,.8);
}
function pause(){
 if(E.on){ if(E.paused){ E.paused=false; ensureAudio2(); E.player.play().catch(()=>{}); setStatus('HABLANDO'); } else { E.paused=true; E.player.pause(); setStatus('EN PAUSA'); } setBtn(); return; }
 if(!playing) return; if(paused){ startDevice(resumeAt); return; }
 paused=true; sid++; synth&&synth.cancel(); sim=null; vis=null; setStatus('EN PAUSA'); setBtn(); }
function stopAll(keep){ sid++; synth&&synth.cancel(); playing=false; paused=false; sim=null; vis=null;
 E.sid++; E.on=false; E.cur=null; E.paused=false; try{E.player.pause();}catch(e){} IMG.sid=E.sid;
 if(!keep){ resumeAt=0; subs.innerHTML=''; $('#pg').style.width='0'; clearImgs(); IMG.scenes=[]; setStatus(P.state==='shown'?'LISTO':'EN ESPERA'); setBtn(); } }
let vanishTimer=null;
function finish(){ playing=false; sim=null; E.on=false; setStatus('LISTO'); setBtn(); $('#pg').style.width='100%'; S.tSmile=SK.baseSmile+.3; S.tBrow=.2; resumeAt=0;
 setTimeout(()=>{ if(!playing) subs.style.opacity=0; },1600);
 setTimeout(()=>{ if(!playing) clearImgs(); },3000);
 clearTimeout(vanishTimer); if($('#vanish').checked) vanishTimer=setTimeout(()=>{ if(!playing) dematerialize(); },3600);
}
function renderText(t){ clearTimeout(vanishTimer); subs.style.opacity=1; subs.innerHTML='';
 const re=/\S+/g; let m; while((m=re.exec(t))){const sp=document.createElement('span'); sp.textContent=m[0]; sp.dataset.s=m.index; sp.dataset.e=m.index+m[0].length; subs.appendChild(sp); subs.appendChild(document.createTextNode(' '));}}
function highlight(ci){ for(const sp of subs.querySelectorAll('span')){const s=+sp.dataset.s,e=+sp.dataset.e; sp.className=e<=ci?'done':(s<=ci+1&&ci<e+1?'on':'');} }
function sysMsg(t){ subs.style.opacity=1; subs.innerHTML=`<div class="sys">${t}</div>`; }
function flashSys(t){ sysMsg(t); setTimeout(()=>{ if(!playing) subs.innerHTML=''; },1600); }
function setStatus(t){ $('#st').textContent=t; }
function setBtn(){ $('#bPause').textContent=(paused||E.paused)?'▶':'❚❚'; }
for(const [k,v] of Object.entries(SKINS)){const b=document.createElement('button'); b.className='chip'; b.dataset.k=k; b.textContent=v.n; b.onclick=()=>applySkin(k,true); $('#skins').appendChild(b);}
for(const [k,v] of Object.entries(BGS)){const b=document.createElement('button'); b.className='chip'; b.dataset.k=k; b.textContent=v.n; b.onclick=()=>setBG(k); $('#bgs').appendChild(b);}
$('#bPlay').onclick=requestSpeak; $('#bPause').onclick=pause; $('#bStop').onclick=()=>stopAll(false);
$('#bClr').onclick=()=>{ ta.value=''; store.set('text',''); $('#panel').classList.remove('min'); ta.focus(); };
$('#bSet').onclick=()=>{const d=$('#sets');d.style.display=d.style.display==='none'?'block':'none';};
$('#handle').onclick=()=>$('#panel').classList.toggle('min');
const rateI=$('#rate'); rateI.value=rate; $('#rateV').textContent=(+rate).toFixed(2);
rateI.oninput=()=>{rate=+rateI.value; mpc=70/rate; $('#rateV').textContent=rate.toFixed(2); store.set('rate',rate);};
$('#follow').checked=store.get('follow',true); $('#follow').onchange=e=>store.set('follow',e.target.checked);
$('#vanish').checked=store.get('vanish',true); $('#vanish').onchange=e=>store.set('vanish',e.target.checked);
mpc=70/rate;
ta.value=store.get('text','')||'Hola, soy VOXA. Pegá cualquier texto y lo leo en voz alta, con una voz humana y expresiva. Mientras hablo, a mi alrededor van apareciendo imágenes de lo que estoy contando. ¿Te gusta la historia? Elegí al anciano sabio y te la cuenta él, como en los viejos tiempos.';
canvas.addEventListener('pointermove',e=>{S.px=e.clientX/innerWidth*2-1;S.py=-(e.clientY/innerHeight*2-1);S.pointerT=T;});
canvas.addEventListener('pointerdown',e=>{S.px=e.clientX/innerWidth*2-1;S.py=-(e.clientY/innerHeight*2-1);S.pointerT=T; if(P.state==='hidden'&&!playing) materialize(()=>{setStatus('LISTO');flashSys('LISTO PARA LEER');});});
