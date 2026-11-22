BGS.nebulosa={n:'Nebulosa',init(){
  this.st=[0,1,2].map(l=>Array.from({length:110},()=>({x:Math.random()*BW,y:Math.random()*BH,r:rnd(.3,1.1)+l*.35,tw:rnd(0,6)})));
  const s=Math.ceil(Math.hypot(BW,BH)*1.05); const c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  x.globalCompositeOperation='lighter'; const pal=['#5b2bff','#ff2bd6','#00e5ff','#1a3cff','#ff7a2b','#7a2bff'];
  for(let i=0;i<16;i++){const px=rnd(.15,.85)*s,py=rnd(.15,.85)*s,r=rnd(.12,.38)*s,g=x.createRadialGradient(px,py,0,px,py,r); const col=pal[i%pal.length];
   g.addColorStop(0,col+'40');g.addColorStop(.5,col+'14');g.addColorStop(1,col+'00'); x.fillStyle=g; x.fillRect(0,0,s,s);}
  x.globalCompositeOperation='source-over';
  for(let i=0;i<10;i++){const px=rnd(0,s),py=rnd(0,s),r=rnd(.05,.18)*s,g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(0,0,6,.55)');g.addColorStop(1,'rgba(0,0,6,0)');x.fillStyle=g;x.fillRect(0,0,s,s);}
  this.neb=c; this.shoot=null;},
 draw(t,dt,en){ bx.fillStyle='#02020a'; bx.fillRect(0,0,BW,BH);
  const s=this.neb.width; bx.save(); bx.translate(BW/2,BH*.42); bx.rotate(t*.012); bx.globalAlpha=.95; bx.drawImage(this.neb,-s/2,-s/2); bx.restore(); bx.globalAlpha=1;
  this.st.forEach((L,l)=>{for(const p of L){const x=(p.x+t*(2+l*5))%BW; const a=.35+.65*Math.abs(Math.sin(t*1.3+p.tw)); bx.fillStyle=`rgba(220,235,255,${a})`; bx.beginPath(); bx.arc(x,p.y,p.r,0,7); bx.fill();}});
  if(!this.shoot&&Math.random()<.004) this.shoot={x:rnd(0,BW),y:rnd(0,BH*.4),vx:rnd(500,900),vy:rnd(150,300),l:1};
  if(this.shoot){const s2=this.shoot; s2.x+=s2.vx*dt; s2.y+=s2.vy*dt; s2.l-=dt*1.4; const g=bx.createLinearGradient(s2.x,s2.y,s2.x-s2.vx*.12,s2.y-s2.vy*.12); g.addColorStop(0,`rgba(255,255,255,${s2.l})`); g.addColorStop(1,'rgba(255,255,255,0)'); bx.strokeStyle=g; bx.lineWidth=2; bx.beginPath(); bx.moveTo(s2.x,s2.y); bx.lineTo(s2.x-s2.vx*.12,s2.y-s2.vy*.12); bx.stroke(); if(s2.l<=0) this.shoot=null;}
 }};
BGS.warp={n:'Hiperespacio',init(){this.s=Array.from({length:520},()=>this.mk(true)); bx.fillStyle='#000';bx.fillRect(0,0,BW,BH);},
 mk(r){return{x:rnd(-1,1)*BW,y:rnd(-1,1)*BH,z:r?rnd(1,BW):BW,pz:0,h:rnd(185,280)}},
 draw(t,dt,en){ bx.fillStyle='rgba(1,3,12,.38)'; bx.fillRect(0,0,BW,BH); const cx=BW/2,cy=BH*.42, sp=(BW*.35+en*BW*1.6)*dt;
  const g=bx.createRadialGradient(cx,cy,0,cx,cy,Math.max(BW,BH)*.5); g.addColorStop(0,'rgba(80,140,255,.10)'); g.addColorStop(1,'rgba(0,0,0,0)'); bx.fillStyle=g; bx.fillRect(0,0,BW,BH);
  for(const p of this.s){p.pz=p.z; p.z-=sp; if(p.z<1){Object.assign(p,this.mk(false));p.pz=p.z;continue;}
   const k=BW*.5, x=p.x/p.z*k+cx, y=p.y/p.z*k+cy, px=p.x/p.pz*k+cx, py=p.y/p.pz*k+cy; const a=clamp(1-p.z/BW,0,1);
   bx.strokeStyle=`hsla(${p.h},100%,${70+a*25}%,${a})`; bx.lineWidth=a*2.6+.3; bx.beginPath(); bx.moveTo(px,py); bx.lineTo(x,y); bx.stroke();}
 }};
BGS.synth={n:'Horizonte Neón',init(){
  this.hz=BH*.6; const r=Math.min(BW,BH)*.24; const c=document.createElement('canvas'); c.width=c.height=Math.ceil(r*2); const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,r*2); g.addColorStop(0,'#ffe259'); g.addColorStop(.55,'#ff7a59'); g.addColorStop(1,'#ff2e88'); x.fillStyle=g; x.beginPath(); x.arc(r,r,r,0,7); x.fill();
  x.globalCompositeOperation='destination-out'; for(let i=0;i<9;i++){const yy=r*1.05+i*i*r*.012+i*r*.09; x.fillRect(0,yy,r*2,2+i*1.3);} this.sun=c; this.r=r;
  this.mt=[0,1].map(l=>{const pts=[];let y=0;for(let x=0;x<=BW+40;x+=BW/28){y=clamp(y+rnd(-1,1)*BH*.035,-BH*.12*(l?0.6:1),0);pts.push([x,y-rnd(0,BH*.03)]);}return pts;});
  this.st=Array.from({length:90},()=>({x:rnd(0,BW),y:rnd(0,this.hz*.8),r:rnd(.3,1.2)}));},
 draw(t,dt,en){ const hz=this.hz; let g=bx.createLinearGradient(0,0,0,hz); g.addColorStop(0,'#07011a'); g.addColorStop(.6,'#2a0845'); g.addColorStop(1,'#a3195b'); bx.fillStyle=g; bx.fillRect(0,0,BW,hz);
  for(const s of this.st){bx.fillStyle=`rgba(255,255,255,${.4+.4*Math.sin(t*2+s.x)})`;bx.fillRect(s.x,s.y,s.r,s.r);}
  bx.drawImage(this.sun,BW/2-this.r,hz-this.r*1.55);
  this.mt.forEach((pts,l)=>{bx.fillStyle=l?'#1a0630':'#2b0a45'; bx.beginPath(); bx.moveTo(0,hz); for(const[x,y]of pts) bx.lineTo(x,hz+y*(l?1:1.6)); bx.lineTo(BW,hz); bx.fill(); bx.strokeStyle=l?'rgba(255,60,200,.35)':'rgba(255,60,200,.7)'; bx.lineWidth=1.2; bx.beginPath(); pts.forEach(([x,y],i)=>i?bx.lineTo(x,hz+y*(l?1:1.6)):bx.moveTo(x,hz+y*(l?1:1.6))); bx.stroke();});
  g=bx.createLinearGradient(0,hz,0,BH); g.addColorStop(0,'#2a0040'); g.addColorStop(1,'#07000f'); bx.fillStyle=g; bx.fillRect(0,hz,BW,BH-hz);
  bx.strokeStyle='#ff2bd6'; bx.shadowColor='#ff2bd6'; bx.shadowBlur=8; bx.lineWidth=1.4; const off=(t*(.45+en*1.5))%1;
  for(let i=0;i<18;i++){const z=(i+off)/18, y=hz+(BH-hz)*Math.pow(z,2.3); bx.globalAlpha=z; bx.beginPath(); bx.moveTo(0,y); bx.lineTo(BW,y); bx.stroke();}
  bx.globalAlpha=.8; for(let k=-22;k<=22;k++){bx.beginPath(); bx.moveTo(BW/2+k*BW*.012,hz); bx.lineTo(BW/2+k*BW*.16,BH); bx.stroke();}
  bx.globalAlpha=1; bx.shadowBlur=0; bx.fillStyle='rgba(255,80,200,.5)'; bx.fillRect(0,hz-1,BW,2);
 }};
BGS.ciudad={n:'Ciudad 2099',init(){
  this.L=[0,1,2].map(l=>{const c=document.createElement('canvas'); c.width=BW; c.height=BH; const x=c.getContext('2d'); let px=-20;
   const base=BH*(.62+l*.1), col=['#0d0b22','#090716','#040309'][l];
   while(px<BW+20){const w=rnd(26,70)*(1+l*.35), h=rnd(.18,.55)*BH*(1.1-l*.18); x.fillStyle=col; x.fillRect(px,base-h,w,BH);
    if(Math.random()<.3){x.fillRect(px+w/2-1,base-h-rnd(10,40),2,40);}
    for(let wy=base-h+8;wy<BH;wy+=7+l*2)for(let wx=px+4;wx<px+w-4;wx+=6+l*2) if(Math.random()<.22-l*.03){x.fillStyle=['rgba(255,200,120,','rgba(120,230,255,','rgba(255,90,200,'][Math.floor(Math.random()*3)]+rnd(.25,.8)+')'; x.fillRect(wx,wy,2+l,2+l);}
    x.fillStyle=col; px+=w+rnd(2,10);}
   return c;});
  this.signs=Array.from({length:7},()=>({x:rnd(0,BW),y:rnd(BH*.45,BH*.8),w:rnd(16,46),h:rnd(4,12),c:['#ff2bd6','#00e5ff','#ffb02e','#7a5cff'][Math.floor(Math.random()*4)],f:rnd(0,9)}));
  this.cars=Array.from({length:9},()=>({x:rnd(0,BW),y:rnd(BH*.18,BH*.55),v:rnd(40,160)*(Math.random()<.5?-1:1),c:Math.random()<.5?'#ff4d6d':'#bff6ff'}));
  this.rain=Array.from({length:150},()=>({x:rnd(0,BW),y:rnd(0,BH),v:rnd(600,1000)}));},
 draw(t,dt,en){ const g=bx.createLinearGradient(0,0,0,BH); g.addColorStop(0,'#04010d'); g.addColorStop(.55,'#1b0a33'); g.addColorStop(.8,'#3a0d4a'); g.addColorStop(1,'#12041d'); bx.fillStyle=g; bx.fillRect(0,0,BW,BH);
  const mx=BW*.78,my=BH*.17,mr=Math.min(BW,BH)*.09; const mg=bx.createRadialGradient(mx,my,mr*.2,mx,my,mr*3); mg.addColorStop(0,'rgba(255,170,220,.35)'); mg.addColorStop(1,'rgba(0,0,0,0)'); bx.fillStyle=mg; bx.fillRect(0,0,BW,BH);
  bx.fillStyle='#ffd6ec'; bx.beginPath(); bx.arc(mx,my,mr,0,7); bx.fill();
  bx.strokeStyle='rgba(255,214,236,.5)'; bx.lineWidth=1.5; bx.beginPath(); bx.ellipse(mx,my,mr*2,mr*.45,-.3,0,7); bx.stroke();
  for(const c of this.cars){c.x+=c.v*dt; if(c.x>BW+30)c.x=-30; if(c.x<-30)c.x=BW+30; bx.strokeStyle=c.c; bx.lineWidth=2; bx.beginPath(); bx.moveTo(c.x,c.y); bx.lineTo(c.x-Math.sign(c.v)*18,c.y); bx.stroke();}
  this.L.forEach((c,l)=>bx.drawImage(c,Math.sin(t*.15)*(l+1)*3,0));
  for(const s of this.signs){const on=Math.sin(t*3+s.f)>-.85||Math.random()<.5; if(!on) continue; bx.shadowColor=s.c; bx.shadowBlur=14; bx.fillStyle=s.c; bx.fillRect(s.x,s.y,s.w,s.h); bx.shadowBlur=0;}
  const fg=bx.createLinearGradient(0,BH*.7,0,BH); fg.addColorStop(0,'rgba(120,30,140,0)'); fg.addColorStop(1,'rgba(120,30,140,.35)'); bx.fillStyle=fg; bx.fillRect(0,BH*.7,BW,BH*.3);
  bx.strokeStyle='rgba(170,200,255,.22)'; bx.lineWidth=1; bx.beginPath(); for(const r of this.rain){r.y+=r.v*dt; r.x-=r.v*dt*.12; if(r.y>BH){r.y=-20;r.x=rnd(0,BW*1.1);} bx.moveTo(r.x,r.y); bx.lineTo(r.x+2.4,r.y-20);} bx.stroke();
 }};
BGS.datos={n:'Flujo de Datos',init(){this.fs=16; this.cols=Math.ceil(BW/this.fs); this.d=Array.from({length:this.cols},()=>rnd(-40,0)); this.acc=0; this.g='01ABCDEF<>/*+=∆Ωλψ∑アカサタナハマヤラワ'; bx.fillStyle='#00060a'; bx.fillRect(0,0,BW,BH);},
 draw(t,dt,en){ this.acc+=dt; if(this.acc<1/30) return; this.acc=0;
  bx.fillStyle='rgba(0,6,12,.13)'; bx.fillRect(0,0,BW,BH); bx.font=`${this.fs}px monospace`;
  for(let i=0;i<this.cols;i++){const ch=this.g[Math.floor(Math.random()*this.g.length)], y=this.d[i]*this.fs;
   bx.fillStyle='#e8ffff'; bx.fillText(ch,i*this.fs,y); bx.fillStyle=bgAccent; bx.globalAlpha=.75; bx.fillText(this.g[Math.floor(Math.random()*this.g.length)],i*this.fs,y-this.fs); bx.globalAlpha=1;
   this.d[i]+=1+en*2; if(y>BH&&Math.random()>.975) this.d[i]=rnd(-20,0);}
 }};
BGS.orbita={n:'Órbita',init(){this.st=Array.from({length:220},()=>({x:rnd(0,BW),y:rnd(0,BH),r:rnd(.3,1.3),tw:rnd(0,6)}));},
 draw(t,dt,en){ bx.fillStyle='#01020a'; bx.fillRect(0,0,BW,BH);
  for(const s of this.st){bx.fillStyle=`rgba(230,240,255,${.3+.6*Math.abs(Math.sin(t+s.tw))})`; bx.fillRect(s.x,s.y,s.r,s.r);}
  const R=Math.max(BW,BH)*.72, cx=BW*.5, cy=BH+R*.42;
  const ag=bx.createRadialGradient(cx,cy,R*.95,cx,cy,R*1.12); ag.addColorStop(0,'rgba(80,170,255,.5)'); ag.addColorStop(1,'rgba(80,170,255,0)'); bx.fillStyle=ag; bx.fillRect(0,0,BW,BH);
  bx.save(); bx.beginPath(); bx.arc(cx,cy,R,0,7); bx.clip();
  const pg=bx.createRadialGradient(cx-R*.3,cy-R*.9,R*.1,cx,cy,R); pg.addColorStop(0,'#3a7bd5'); pg.addColorStop(.5,'#123a6b'); pg.addColorStop(1,'#020814'); bx.fillStyle=pg; bx.fillRect(cx-R,cy-R,R*2,R*2);
  bx.globalAlpha=.18; for(let i=0;i<14;i++){bx.fillStyle=i%2?'#9fd3ff':'#0a2a50'; const y=cy-R+i*R*.05+Math.sin(t*.2+i)*4; bx.fillRect(cx-R,y,R*2,R*.02);} bx.globalAlpha=1;
  for(let i=0;i<40;i++){const a=i*2.4+t*.02, rr=R*(.75+.2*Math.sin(i)); const x=cx+Math.cos(a)*rr*.9, y=cy-Math.abs(Math.sin(a))*rr*.95; if(y<cy-R*.65){bx.fillStyle='rgba(255,200,120,.7)'; bx.fillRect(x,y,1.5,1.5);}}
  bx.restore();
  bx.strokeStyle='rgba(180,220,255,.35)'; for(let i=0;i<4;i++){bx.lineWidth=2-i*.4; bx.beginPath(); bx.ellipse(cx,cy-R*.62,R*(1.05+i*.06),R*(.09+i*.006),-.06,Math.PI*1.04,Math.PI*1.96); bx.stroke();}
  const ma=t*.08, mx=BW*.5+Math.cos(ma)*BW*.38, my=BH*.2+Math.sin(ma)*BH*.05, mr=Math.min(BW,BH)*.045; const mg=bx.createRadialGradient(mx-mr*.4,my-mr*.4,mr*.1,mx,my,mr); mg.addColorStop(0,'#e8ecf2'); mg.addColorStop(1,'#3a3f4a'); bx.fillStyle=mg; bx.beginPath(); bx.arc(mx,my,mr,0,7); bx.fill();
  bx.strokeStyle=bgAccent; bx.globalAlpha=.25; bx.setLineDash([3,7]); bx.beginPath(); bx.ellipse(BW*.5,BH*.2,BW*.38,BH*.05,0,0,7); bx.stroke(); bx.setLineDash([]); bx.globalAlpha=1;
 }};
