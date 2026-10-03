/* ECLIPSE RPG — BOSS SKILLS + VFX */
const BOSS_BANNER={name:'',sub:'',life:0,maxLife:0,color:'#ff3050',icon:'👹'};
function spawnBossBanner(name,sub,color,icon){BOSS_BANNER.name=name;BOSS_BANNER.sub=sub||'BOSS INCOMING';BOSS_BANNER.color=color||'#ff3050';BOSS_BANNER.icon=icon||'👹';BOSS_BANNER.life=2.0;BOSS_BANNER.maxLife=2.0;}
function drawBossBanner(){
  if(BOSS_BANNER.life<=0)return;
  const t=1-BOSS_BANNER.life/BOSS_BANNER.maxLife;
  const a=BOSS_BANNER.life/BOSS_BANNER.maxLife;
  const alpha=Math.min(1,a*2.2)*Math.min(1,(1-t)*5+.15);
  const cx=W/2,cy=H*0.25+(1-Math.min(1,t*2.5))*-24;
  ctx.save();
  ctx.textAlign='center';ctx.textBaseline='middle';
  const bw=Math.min(W*.8,440),bh=64;
  ctx.globalAlpha=alpha*.9;
  ctx.fillStyle='rgba(0,0,0,.75)';
  ctx.fillRect(cx-bw/2-6,cy-bh/2-6,bw+12,bh+12);
  const grad=ctx.createLinearGradient(cx-bw/2,0,cx+bw/2,0);
  grad.addColorStop(0,'rgba(0,0,0,0)');
  grad.addColorStop(.25,BOSS_BANNER.color);
  grad.addColorStop(.5,'#ffffff');
  grad.addColorStop(.75,BOSS_BANNER.color);
  grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grad;
  ctx.fillRect(cx-bw/2,cy-bh/2,bw,bh);
  ctx.globalAlpha=alpha;
  ctx.strokeStyle='#ffd040';ctx.lineWidth=3;
  ctx.strokeRect(cx-bw/2,cy-bh/2,bw,bh);
  ctx.strokeStyle=BOSS_BANNER.color;ctx.lineWidth=1;
  ctx.strokeRect(cx-bw/2+3,cy-bh/2+3,bw-6,bh-6);
  ctx.globalAlpha=alpha*.9;
  for(let i=0;i<4;i++){
    const cxs=[cx-bw/2+12,cx+bw/2-12,cx-bw/2+12,cx+bw/2-12][i];
    const cys=[cy-bh/2+12,cy-bh/2+12,cy+bh/2-12,cy+bh/2-12][i];
    ctx.save();ctx.translate(cxs,cys);ctx.rotate(worldTime*3+i*1.57);
    ctx.fillStyle='#ffd040';
    ctx.fillRect(-2,-5,4,10);
    ctx.fillRect(-5,-2,10,4);
    ctx.restore();
  }
  const bounce=Math.sin(worldTime*10)*3;
  ctx.font='900 30px system-ui';
  ctx.shadowColor=BOSS_BANNER.color;ctx.shadowBlur=12;
  ctx.fillStyle='#ffd040';
  ctx.fillText(BOSS_BANNER.icon,cx-bw*.34,cy+bounce);
  ctx.shadowBlur=0;
  ctx.font='900 18px system-ui';
  ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.95)';
  ctx.strokeText(BOSS_BANNER.name,cx+bw*.06,cy-7,bw*.55);
  const nameGrad=ctx.createLinearGradient(0,cy-16,0,cy+6);
  nameGrad.addColorStop(0,'#fff5a0');
  nameGrad.addColorStop(.5,'#ffd040');
  nameGrad.addColorStop(1,BOSS_BANNER.color);
  ctx.fillStyle=nameGrad;
  ctx.fillText(BOSS_BANNER.name,cx+bw*.06,cy-7,bw*.55);
  ctx.font='900 9px system-ui';
  ctx.fillStyle='#ffd040';
  ctx.shadowColor='#ffd040';ctx.shadowBlur=6;
  ctx.fillText(BOSS_BANNER.sub,cx+bw*.06,cy+15,bw*.55);
  ctx.shadowBlur=0;
  ctx.globalAlpha=alpha*(1-t);
  ctx.strokeStyle=BOSS_BANNER.color;
  ctx.lineWidth=2.5;
  const lw=45+t*150;
  ctx.beginPath();
  ctx.moveTo(cx-lw,cy+bh/2+8);ctx.lineTo(cx+lw,cy+bh/2+8);
  ctx.stroke();
  ctx.restore();
}

const BOSS_PHASE_LABELS=[{name:'AWAKENING',color:'#ffd060',icon:'⚔️'},{name:'ENRAGED',color:'#ff8040',icon:'🔥'},{name:'CATASTROPHE',color:'#ff2030',icon:'💀'}];
function drawBossHpBar(){
  const boss=enemies.find(e=>e.boss&&e.hp>0&&!e._dead);
  if(!boss)return;
  const barW=Math.min(W*0.78,640);const barH=18;
  const x=(W-barW)/2;const y=34;
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.75)';
  ctx.fillRect(x-6,y-6,barW+12,barH+12);
  ctx.strokeStyle='#ffd040';ctx.lineWidth=2;
  ctx.strokeRect(x-6,y-6,barW+12,barH+12);
  ctx.fillStyle='#201010';
  ctx.fillRect(x,y,barW,barH);
  const pct=Math.max(0,boss.hp/boss.maxHp);
  const ph=boss.bossPhase|0;
  const grad=ctx.createLinearGradient(x,0,x+barW,0);
  const c1=ph===2?'#ff2030':ph===1?'#ff5020':'#c03030';
  const c2=ph===2?'#ff8040':ph===1?'#ffa040':'#ff5050';
  grad.addColorStop(0,c1);grad.addColorStop(1,c2);
  ctx.fillStyle=grad;
  ctx.fillRect(x,y,barW*pct,barH);
  ctx.globalAlpha=.4;ctx.fillStyle='#fff';
  ctx.fillRect(x,y,barW*pct,4);
  ctx.globalAlpha=1;
  const stripeOffset=(worldTime*60)%20;
  ctx.save();
  ctx.beginPath();ctx.rect(x+barW*pct,y,barW*(1-pct),barH);ctx.clip();
  for(let i=-3;i<barW/20+3;i++){
    const sx=x+barW*pct+i*20+stripeOffset;
    ctx.fillStyle=i%2?'rgba(255,60,60,.15)':'rgba(255,200,80,.15)';
    ctx.beginPath();
    ctx.moveTo(sx,y);ctx.lineTo(sx+10,y);ctx.lineTo(sx-4,y+barH);ctx.lineTo(sx-14,y+barH);
    ctx.closePath();ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;
  [0.70,0.35].forEach(p=>{
    const mx=x+barW*p;
    ctx.beginPath();ctx.moveTo(mx,y-2);ctx.lineTo(mx,y+barH+2);ctx.stroke();
    ctx.fillStyle='#fff';
    ctx.fillRect(mx-1,y-6,2,4);
    ctx.fillRect(mx-1,y+barH+2,2,4);
  });
  ctx.globalAlpha=.6+.4*Math.sin(worldTime*8);
  ctx.fillStyle='#fff';
  ctx.fillRect(x+barW*pct-2,y,3,barH);
  ctx.globalAlpha=1;
  const lv=BOSS_PHASE_LABELS[ph];
  const label='👹 '+boss.name.toUpperCase()+(ph>0?'  —  '+lv.icon+' '+lv.name:'');
  ctx.font='900 13px system-ui';
  ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.95)';
  ctx.strokeText(label,W/2,y-10);
  const lg=ctx.createLinearGradient(0,y-24,0,y-6);
  lg.addColorStop(0,'#fff5a0');
  lg.addColorStop(1,ph===2?'#ff8080':ph===1?'#ffa060':'#ffd060');
  ctx.fillStyle=lg;
  ctx.fillText(label,W/2,y-10);
  ctx.font='900 10px system-ui';
  ctx.fillStyle='#fff';
  ctx.fillText(Math.ceil(boss.hp)+' / '+Math.ceil(boss.maxHp),W/2,y+barH+14);
  ctx.restore();
}

/* ============================================================
   PORTAL RENDERER — fungsi yang sebelumnya hilang (fix layar hitam)
   ============================================================ */

const BOSS_SKILLS={
slam:{id:'slam',name:'EARTH SLAM',icon:'💥',color:'#ffb060',cd:3.6,minRange:0,maxRange:170,cast:0.5,weight:1.5,exec(b){const dmg=bossDmg(b,1.3);burst(b.x,b.y,b.c,30,{spd:280,life:[.35,.7]});const R=150;const d=Math.hypot(player.x-b.x,player.y-b.y);if(d<R+player.r&&player.inv<=0){hp-=dmg;player.inv=.55;floatText(player.x,player.y-30,'-'+dmg,'#ff9060');}warningZones.push({x:b.x,y:b.y,r:R,life:.05,maxLife:.05,color:b.c,dmg,onTrigger:()=>{}});addShake(.55);screenFlash(.25);hitStopNow(.05);}},
shock:{id:'shock',name:'SHOCKWAVE',icon:'🌊',color:'#ffd060',cd:5.5,minRange:0,maxRange:230,cast:0.75,weight:1.2,exec(b){const R=240,dmg=bossDmg(b,1.5);for(let ring=0;ring<3;ring++){setTimeout(()=>{if(!running||b.hp<=0)return;addVfx({type:'shockwave',x:b.x,y:b.y,color:b.c,r:R-ring*30,life:.5});const d=Math.hypot(player.x-b.x,player.y-b.y);if(d<R-ring*30+player.r&&player.inv<=0){hp-=dmg;player.inv=.4;floatText(player.x,player.y-30,'-'+dmg,'#ffd060');}},ring*150);}addShake(.5);screenFlash(.3);}},
nova:{id:'nova',name:'ARCANE NOVA',icon:'✨',color:'#c080ff',cd:6.5,minRange:0,maxRange:260,cast:0.9,weight:1.2,exec(b){const R=270,dmg=bossDmg(b,1.7);for(let i=0;i<3;i++)setTimeout(()=>{if(!running||b.hp<=0)return;warningZones.push({x:b.x,y:b.y,r:R-i*40,life:.3,maxLife:.3,color:b.c,dmg,onTrigger:()=>{}});burst(b.x,b.y,b.c,40,{spd:320,life:[.4,.9]});addVfx({type:'shockwave',x:b.x,y:b.y,color:b.c,r:R-i*40,life:.5});},i*220);addShake(.6);screenFlash(.4);}},
volley:{id:'volley',name:'MISSILE VOLLEY',icon:'🏹',color:'#80ff80',cd:4.2,minRange:130,maxRange:650,cast:0.5,weight:1.5,exec(b){const a=Math.atan2(player.y-b.y,player.x-b.x),dmg=bossDmg(b,0.75);for(let i=-3;i<=3;i++)enemyProjectile(b,a+i*0.09,dmg,{speed:440,style:'arrow',pat:'arrow',r:5,life:1.8,color:b.c});}},
ringBullets:{id:'ringBullets',name:'RING BARRAGE',icon:'⭕',color:'#80d0ff',cd:5.8,minRange:80,maxRange:520,cast:0.7,weight:1.3,exec(b){const n=16,dmg=bossDmg(b,0.7);for(let i=0;i<n;i++){const a=i*(Math.PI*2/n);enemyProjectile(b,a,dmg,{speed:320,style:'magic',r:7,life:2.2,color:b.c});}burst(b.x,b.y,b.c,25,{spd:260});}},
spiral:{id:'spiral',name:'SPIRAL BARRAGE',icon:'🌀',color:'#c080ff',cd:6.5,minRange:80,maxRange:520,cast:0.8,weight:1.1,exec(b){const dmg=bossDmg(b,0.6);let fired=0;const shoot=()=>{if(!running||b.hp<=0||fired>=18)return;const a=fired*0.42+worldTime*0.3;enemyProjectile(b,a,dmg,{speed:300,style:'orb',r:6,life:2,color:b.c});fired++;setTimeout(shoot,55);};shoot();}},
homing:{id:'homing',name:'SOUL SEEKERS',icon:'💀',color:'#c060ff',cd:7.0,minRange:100,maxRange:640,cast:0.85,weight:1.2,exec(b){const dmg=bossDmg(b,0.8);for(let i=0;i<6;i++)setTimeout(()=>{if(!running||b.hp<=0)return;const a=Math.atan2(player.y-b.y,player.x-b.x)+rand(-0.5,0.5);projectiles.push({x:b.x,y:b.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,dmg,life:3.2,color:b.c,r:7,pat:'orb',style:'skull',fromEnemy:true,homing:2.2,targetPlayer:true,explodeR:18,explodeColor:b.c});},i*90);}},
meteor:{id:'meteor',name:'METEOR RAIN',icon:'☄️',color:'#ff6020',cd:8.0,minRange:0,maxRange:800,cast:1.0,weight:1.0,exec(b){const dmg=bossDmg(b,1.5),count=6;for(let i=0;i<count;i++){const tx=clamp(player.x+rand(-200,200),60,WORLD.w-60);const ty=clamp(player.y+rand(-150,150),100,WORLD.h-60);warningZones.push({x:tx,y:ty,r:75,life:0.9+i*0.12,maxLife:0.9+i*0.12,color:b.c,dmg,onTrigger:()=>{burst(tx,ty,b.c,30,{spd:380,life:[.4,.9]});for(let k=0;k<12;k++){const a=Math.random()*Math.PI*2,v=rand(150,320);particles.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v-100,life:rand(.4,.9),color:k%2?'#fff':b.c,size:rand(3,6),grav:200});}}});}toast('☄️ METEOR RAIN!');}},
beam:{id:'beam',name:'ANNIHILATION BEAM',icon:'⚡',color:'#80d0ff',cd:6.5,minRange:150,maxRange:700,cast:1.0,weight:1.1,exec(b){const a=Math.atan2(player.y-b.y,player.x-b.x),dmg=bossDmg(b,2.0);const len=620;for(let t=0;t<=len;t+=45){const x=b.x+Math.cos(a)*t,y=b.y+Math.sin(a)*t;warningZones.push({x,y,r:22,life:0.55+t/len*0.25,maxLife:0.55+t/len*0.25,color:b.c,dmg,onTrigger:()=>{}});}setTimeout(()=>{if(!running||b.hp<=0)return;addVfx({type:'beam',x:b.x,y:b.y,angle:a,color:b.c,color2:'#fff',len:720,width:40,life:.55});const dx=player.x-b.x,dy=player.y-b.y,proj=dx*Math.cos(a)+dy*Math.sin(a),side=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(proj>0&&proj<720&&side<30+player.r&&player.inv<=0){hp-=dmg;player.inv=.55;floatText(player.x,player.y-30,'-'+dmg,'#80d0ff');}addShake(.55);screenFlash(.4);hitStopNow(.05);},800);}},
blackhole:{id:'blackhole',name:'SINGULARITY',icon:'🕳️',color:'#a040ff',cd:11.0,minRange:60,maxRange:800,cast:0.9,weight:0.8,exec(b){const bx=player.x,by=player.y,R=230,dmg=bossDmg(b,1.9);b._pullField={x:bx,y:by,until:worldTime+2.0,R:R};addVfx({type:'vortex',x:bx,y:by,color:'#a040ff',r:R,life:2.0,rotSpeed:6});warningZones.push({x:bx,y:by,r:R,life:2.0,maxLife:2.0,color:'#a040ff',dmg,onTrigger:()=>{for(let i=0;i<60;i++){const a=Math.random()*Math.PI*2,v=rand(320,620);particles.push({x:bx,y:by,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.5,1.1),color:i%2?'#fff':'#a040ff',size:rand(4,9),grav:0});}addShake(.75);screenFlash(.55);hitStopNow(.08);}});toast('🕳️ SINGULARITY!');}},
summon:{id:'summon',name:'SUMMON ARMY',icon:'💀',color:'#a060ff',cd:9.0,minRange:0,maxRange:900,cast:1.0,weight:0.9,exec(b){const cnt=Math.min(4,2+Math.floor(getStageDifficultyNorm(stageIndex)*3));for(let i=0;i<cnt;i++){const a=i/cnt*Math.PI*2;const x=clamp(b.x+Math.cos(a)*90,60,WORLD.w-60),y=clamp(b.y+Math.sin(a)*90,100,WORLD.h-60);spawnEnemy(false,{summoned:true,parent:b,overrideX:x,overrideY:y});}burst(b.x,b.y,b.c,40,{spd:280,life:[.5,1]});addShake(.35);screenFlash(.25);toast('💀 ARMY RISES!');}},
frost:{id:'frost',name:'ABSOLUTE ZERO',icon:'❄️',color:'#a0e0ff',cd:8.0,minRange:0,maxRange:400,cast:1.0,weight:1.1,exec(b){const dmg=bossDmg(b,1.3);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const len=340;for(let t=80;t<=len;t+=70){const x=b.x+Math.cos(a)*t,y=b.y+Math.sin(a)*t;warningZones.push({x,y,r:38,life:0.7+t/len*0.35,maxLife:0.7+t/len*0.35,color:'#a0e0ff',dmg,status:{type:'freeze',dur:1.8,dps:0},onTrigger:()=>{}});}}setTimeout(()=>{if(!running||b.hp<=0)return;for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,v=rand(200,420);particles.push({x:b.x,y:b.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.5,1),color:'#c8f0ff',size:rand(3,6),grav:60});}addShake(.4);screenFlash(.4);},900);toast('❄️ ABSOLUTE ZERO!');}},
flame:{id:'flame',name:'INFERNO CONE',icon:'🔥',color:'#ff6020',cd:6.5,minRange:100,maxRange:400,cast:0.85,weight:1.3,exec(b){const a=Math.atan2(player.y-b.y,player.x-b.x),dmg=bossDmg(b,1.4);const arc=0.55;for(let i=-3;i<=3;i++){const aa=a+i*(arc/3);for(let t=80;t<=340;t+=70){const x=b.x+Math.cos(aa)*t,y=b.y+Math.sin(aa)*t;warningZones.push({x,y,r:36,life:0.55+t/340*0.3,maxLife:0.55+t/340*0.3,color:'#ff6020',dmg,status:{type:'burn',dur:3,dps:b.atk*0.12},onTrigger:()=>{}});}}setTimeout(()=>{if(!running||b.hp<=0)return;for(let i=0;i<50;i++){const aa=a+rand(-arc,arc),v=rand(200,480);particles.push({x:b.x,y:b.y,vx:Math.cos(aa)*v,vy:Math.sin(aa)*v,life:rand(.4,.9),color:i%2?'#ffd040':'#ff6020',size:rand(3,7),grav:100});}addShake(.4);screenFlash(.45);},700);toast('🔥 INFERNO!');}},
thunder:{id:'thunder',name:"HEAVEN'S THUNDER",icon:'⚡',color:'#ffe060',cd:7.5,minRange:0,maxRange:800,cast:1.0,weight:1.0,exec(b){const dmg=bossDmg(b,1.6);const points=[];for(let i=0;i<7;i++){const tx=clamp(player.x+rand(-180,180),60,WORLD.w-60);const ty=clamp(player.y+rand(-140,140),100,WORLD.h-60);points.push({x:tx,y:ty});warningZones.push({x:tx,y:ty,r:52,life:0.75+i*0.15,maxLife:0.75+i*0.15,color:'#ffe060',dmg,status:{type:'shock',dur:2,dps:b.atk*0.15},onTrigger:()=>{for(let k=0;k<14;k++){const a=Math.random()*Math.PI*2,v=rand(180,380);particles.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.3,.6),color:'#fff8c0',size:rand(2,4),grav:0});}}});}for(let i=0;i<points.length-1;i++){const p=points[i],q=points[i+1];addVfx({type:'beam',x:p.x,y:p.y,angle:Math.atan2(q.y-p.y,q.x-p.x),color:'#ffe060',color2:'#fff',len:Math.hypot(q.x-p.x,q.y-p.y),width:6,life:.4});}toast("⚡ HEAVEN'S THUNDER!");}},
guillotine:{id:'guillotine',name:'GODFALL GUILLOTINE',icon:'🗡️',color:'#c080ff',cd:8.0,minRange:100,maxRange:700,cast:1.1,weight:1.0,exec(b){const a=Math.atan2(player.y-b.y,player.x-b.x),dmg=bossDmg(b,2.4);const len=520,width=42;for(let t=0;t<=len;t+=45){const x=b.x+Math.cos(a)*t,y=b.y+Math.sin(a)*t;warningZones.push({x,y,r:width/2,life:0.9+t/len*0.3,maxLife:0.9+t/len*0.3,color:'#c080ff',dmg,onTrigger:()=>{}});}setTimeout(()=>{if(!running||b.hp<=0)return;addVfx({type:'beam',x:b.x,y:b.y,angle:a,color:'#c080ff',color2:'#fff',len:600,width:60,life:.55});const dx=player.x-b.x,dy=player.y-b.y,proj=dx*Math.cos(a)+dy*Math.sin(a),side=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(proj>0&&proj<600&&side<50+player.r&&player.inv<=0){hp-=dmg;player.inv=.6;floatText(player.x,player.y-30,'-'+dmg,'#c080ff');}addShake(.6);screenFlash(.35);hitStopNow(.06);},950);toast('🗡️ GODFALL!');}},
mirror:{id:'mirror',name:'MIRROR PUNISHMENT',icon:'🪞',color:'#a0c8ff',cd:10,minRange:0,maxRange:900,cast:0.6,weight:0.7,exec(b){b.shieldReflectUntil=worldTime+3.0;addVfx({type:'shield',x:b.x,y:b.y,color:'#a0c8ff',color2:'#fff',r:60,life:3.0,follow:true});toast('🪞 BOSS SHIELDED!');}},
teleport:{id:'teleport',name:'PHANTOM TELEPORT',icon:'✨',color:'#c080ff',cd:4.5,minRange:200,maxRange:900,cast:0.35,weight:1.4,exec(b){const a=Math.random()*Math.PI*2,d=rand(160,260);const ox=b.x,oy=b.y;b.x=clamp(player.x+Math.cos(a)*d,60,WORLD.w-60);b.y=clamp(player.y+Math.sin(a)*d,100,WORLD.h-60);burst(ox,oy,b.c,20,{spd:200});burst(b.x,b.y,b.c,26,{spd:220});addVfx({type:'rift',x:b.x,y:b.y,color:b.c,r:110,life:.55,rotSpeed:5});const dmg=bossDmg(b,1.0);const dist2=Math.hypot(player.x-b.x,player.y-b.y);if(dist2<120&&player.inv<=0){hp-=dmg;player.inv=.5;floatText(player.x,player.y-30,'-'+dmg,'#c080ff');addShake(.3);}}},
dash:{id:'dash',name:'ABSOLUTE PURSUIT',icon:'💨',color:'#ff5050',cd:5.5,minRange:160,maxRange:520,cast:0.45,weight:1.5,exec(b){let chains=2+Math.floor(getStageDifficultyNorm(stageIndex)*2);let done=0;const doDash=()=>{if(!running||b.hp<=0||done>=chains)return;const a=Math.atan2(player.y-b.y,player.x-b.x);const dist=240;const ox=b.x,oy=b.y;b.x=clamp(b.x+Math.cos(a)*dist,60,WORLD.w-60);b.y=clamp(b.y+Math.sin(a)*dist,100,WORLD.h-60);addVfx({type:'dashTrail',x:ox,y:oy,angle:a,color:b.c,len:dist,life:.5});burst(b.x,b.y,b.c,16,{spd:200});const dx=player.x-b.x,dy=player.y-b.y;if(Math.hypot(dx,dy)<b.r+player.r+22&&player.inv<=0){const dmg=bossDmg(b,1.2);hp-=dmg;player.inv=.5;floatText(player.x,player.y-30,'-'+dmg,'#ff5050');}addShake(.35);done++;setTimeout(doDash,220);};doDash();}},
timeSlow:{id:'timeSlow',name:'CHRONO PRISON',icon:'⏳',color:'#c080ff',cd:9.0,minRange:0,maxRange:520,cast:0.8,weight:0.9,exec(b){const R=280,dmg=bossDmg(b,0.6);warningZones.push({x:b.x,y:b.y,r:R,life:.5,maxLife:.5,color:'#c080ff',dmg,onTrigger:()=>{}});setTimeout(()=>{if(!running||b.hp<=0)return;addVfx({type:'ring',x:b.x,y:b.y,color:'#c080ff',r:R,life:.8,r0:10});for(const q of [player]){const d=Math.hypot(q.x-b.x,q.y-b.y);if(d<R+player.r){applyStatus('slow',3.0,0);applyStatus('freeze',0.6,0);}}addShake(.3);screenFlash(.35);},500);toast('⏳ CHRONO PRISON!');}},
drain:{id:'drain',name:'SOUL DRAIN FIELD',icon:'🌑',color:'#a060ff',cd:8.0,minRange:0,maxRange:400,cast:0.9,weight:1.0,exec(b){const R=280,dmg=bossDmg(b,1.4);warningZones.push({x:b.x,y:b.y,r:R,life:1.4,maxLife:1.4,color:'#a060ff',dmg,onTrigger:()=>{}});addVfx({type:'drain',x:b.x,y:b.y,color:'#a060ff',r:R,life:1.4,rotSpeed:4});setTimeout(()=>{if(!running||b.hp<=0)return;const d=Math.hypot(player.x-b.x,player.y-b.y);if(d<R+player.r&&player.inv<=0){hp-=dmg;player.inv=.5;floatText(player.x,player.y-30,'-'+dmg,'#a060ff');const heal=Math.round(dmg*0.6);b.hp=Math.min(b.maxHp,b.hp+heal);floatText(b.x,b.y-40,'+'+heal,'#a0ff80');}addShake(.35);screenFlash(.3);},1300);toast('🌑 SOUL DRAIN!');}},
void:{id:'void',name:'VOID RIFT',icon:'🌌',color:'#4a2080',cd:8.5,minRange:100,maxRange:700,cast:1.0,weight:0.9,exec(b){const R=200,dmg=bossDmg(b,1.8);for(let k=0;k<3;k++){const tx=clamp(player.x+rand(-100,100),60,WORLD.w-60);const ty=clamp(player.y+rand(-100,100),100,WORLD.h-60);warningZones.push({x:tx,y:ty,r:R,life:0.7+k*0.2,maxLife:0.7+k*0.2,color:'#a080ff',dmg,onTrigger:()=>{addVfx({type:'rift',x:tx,y:ty,color:'#a080ff',r:150,life:.6,rotSpeed:5});for(let i=0;i<24;i++){const a=Math.random()*Math.PI*2,v=rand(150,340);particles.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.4,.8),color:i%2?'#fff':'#a080ff',size:rand(3,6),grav:0});}}});}toast('🌌 VOID RIFTS!');}},
orbit:{id:'orbit',name:'DEATH ORBIT',icon:'⚔️',color:'#ff80ff',cd:6.5,minRange:0,maxRange:600,cast:0.7,weight:1.1,exec(b){const cnt=10,dmg=bossDmg(b,0.85);for(let i=0;i<cnt;i++){const a=i/cnt*Math.PI*2;const orb={x:b.x+Math.cos(a)*150,y:b.y+Math.sin(a)*150,ang:a,R:150,speed:3.2,life:3.0,maxLife:3.0,boss:b._id,dmg,color:b.c,hitCooldown:0};projectiles.push({_orb:true,orbit:orb,x:orb.x,y:orb.y,vx:0,vy:0,dmg,life:3.0,color:b.c,r:8,pat:'orb',style:'orb',fromEnemy:true,targetPlayer:true,ignore:true});}addVfx({type:'spiral',x:b.x,y:b.y,color:b.c,r:200,life:1.0,cnt:8,rotSpeed:6});toast('⚔️ DEATH ORBIT!');}}
};
const BOSS_SKILL_PRESETS={slime:['slam','summon','ringBullets','shock'],golem:['slam','shock','guillotine','summon'],beast:['dash','slam','summon','homing'],bug:['slam','volley','dash','summon'],humanoid:['dash','volley','nova','homing'],winged:['volley','dash','homing','meteor'],demon:['flame','meteor','dash','drain'],dragon:['flame','beam','meteor','shock'],ghost:['homing','drain','teleport','nova'],robot:['beam','volley','ringBullets','shock'],king:['guillotine','meteor','thunder','summon'],treant:['summon','shock','frost','drain'],ice:['frost','guillotine','volley','shock'],fire:['flame','meteor','dash','shock'],thunder:['thunder','dash','beam','ringBullets'],time:['timeSlow','beam','homing','nova'],void:['blackhole','void','teleport','drain'],poison:['summon','drain','slam','volley'],ocean:['volley','shock','summon','frost'],samurai:['dash','guillotine','teleport','ringBullets'],ninja:['teleport','dash','ringBullets','volley'],knight:['dash','slam','guillotine','shock'],emperor:['guillotine','beam','meteor','summon'],alien:['beam','homing','ringBullets','void'],witch:['homing','summon','void','meteor'],default:['slam','volley','dash','nova']};
function getBossSkillSet(bossName,def){const n=(bossName||'').toLowerCase();const v=(def.v||'').toLowerCase();const stageName=(STAGES[stageIndex]||{}).n?.toLowerCase()||'';const all=n+' '+v+' '+stageName;
if(/zeus|thunder|sky/.test(all))return BOSS_SKILL_PRESETS.thunder;if(/dragon|drake|wyrm|hydra|leviathan/.test(all))return BOSS_SKILL_PRESETS.dragon;if(/ice|frost|snow|glacier/.test(all))return BOSS_SKILL_PRESETS.ice;if(/fire|lava|magma|inferno|volcan/.test(all))return BOSS_SKILL_PRESETS.fire;if(/void|abyss|shadow|nightmare|dark king/.test(all))return BOSS_SKILL_PRESETS.void;if(/slime/.test(all))return BOSS_SKILL_PRESETS.slime;if(/golem|titan|colossus|guardian/.test(all))return BOSS_SKILL_PRESETS.golem;if(/kraken|sea|tide|ocean/.test(all))return BOSS_SKILL_PRESETS.ocean;if(/demon|hell|devil/.test(all))return BOSS_SKILL_PRESETS.demon;if(/wolf|beast|hound|fang/.test(all))return BOSS_SKILL_PRESETS.beast;if(/spider|insect|scorpion|crab/.test(all))return BOSS_SKILL_PRESETS.bug;if(/robot|mecha|tech|drone/.test(all))return BOSS_SKILL_PRESETS.robot;if(/angel|holy|seraph/.test(all))return BOSS_SKILL_PRESETS.winged;if(/ghost|spirit|wraith|soul|phantom/.test(all))return BOSS_SKILL_PRESETS.ghost;if(/samurai|ronin|ninja/.test(all))return BOSS_SKILL_PRESETS.samurai;if(/knight|paladin|warlord|gladiator/.test(all))return BOSS_SKILL_PRESETS.knight;if(/emperor|king|queen|lord/.test(all))return BOSS_SKILL_PRESETS.king;if(/witch|mage|sorcerer|wizard|warlock/.test(all))return BOSS_SKILL_PRESETS.witch;if(/poison|plague|toxic|venom/.test(all))return BOSS_SKILL_PRESETS.poison;if(/forest|treant|bamboo|wood/.test(all))return BOSS_SKILL_PRESETS.treant;if(/alien/.test(all))return BOSS_SKILL_PRESETS.alien;if(/time|chronos/.test(all))return BOSS_SKILL_PRESETS.time;return BOSS_SKILL_PRESETS.default;}
function attachBossConfig(e,def){const skillIds=getBossSkillSet(e.name,def);const cfg={skills:skillIds.map((id,idx)=>{const base=BOSS_SKILLS[id];if(!base)return null;const minPhase=idx<2?0:(idx===2?1:2);return Object.assign({},base,{minPhase});}).filter(Boolean)};e.bossConfig=cfg;e.bossPhase=0;e._skillCds={};for(const s of cfg.skills)e._skillCds[s.id]=rand(0.5,1.5);e.globalCd=1.2;e.castTimer=0;e.castSkill=null;e.castTarget=null;e._pullField=null;e.shieldReflectUntil=0;}
function updateBossPhase(e){const pct=e.hp/e.maxHp;let targetPhase=0;if(pct<=0.35)targetPhase=2;else if(pct<=0.70)targetPhase=1;if(targetPhase>(e.bossPhase|0)){e.bossPhase=targetPhase;bossPhaseTransition(e,targetPhase);}}
function bossPhaseTransition(e,phase){e.invuln=2.2;e.stun=Math.max(e.stun,0.2);e.castTimer=1.8;e.castSkill={exec:()=>{}};const lv=BOSS_PHASE_LABELS[phase]||BOSS_PHASE_LABELS[0];screenFlash(0.55);addShake(0.85);burst(e.x,e.y,e.c,80,{spd:380,life:[.6,1.3]});addVfx({type:'shockwave',x:e.x,y:e.y,color:e.c,r:400,life:1.2});addVfx({type:'rune',x:e.x,y:e.y,color:e.c,color2:'#fff',r:200,life:1.8,rotSpeed:3});spawnBossBanner(e.name.toUpperCase(),lv.icon+' '+lv.name+' — TRANSFORMATION',lv.color,lv.icon);if(phase===1){e.atk*=1.28;e.spd*=1.12;}else{e.atk*=1.55;e.spd*=1.22;}for(const k in e._skillCds)e._skillCds[k]=rand(0.5,1.4);}
function pickBossSkill(b,dist){if(!b.bossConfig)return null;const phase=b.bossPhase|0;const avail=[];for(const sk of b.bossConfig.skills){if(sk.minPhase!==undefined&&phase<sk.minPhase)continue;if(sk.cd===0&&sk.phaseOnly)continue;if(dist<(sk.minRange||0)||dist>(sk.maxRange||9999))continue;const cdLeft=b._skillCds[sk.id]||0;if(cdLeft>0)continue;avail.push(sk);}if(!avail.length)return null;let total=0;for(const s of avail)total+=(s.weight||1);let r=Math.random()*total;for(const s of avail){r-=(s.weight||1);if(r<=0)return s;}return avail[avail.length-1];}
function bossMovement(b,dt,dx,dy,d){if(b.charging>0)return;const slowMult=b.slow>0?0.42:1;const speed=b.spd*slowMult;let desired=120;if(b.role==='ranged'||b.role==='mage')desired=280;if(b.role==='assassin')desired=90;if(d>desired+30){const nx=dx/d,ny=dy/d;b.x+=nx*speed*dt;b.y+=ny*speed*dt;}else if(d<desired-40&&b.role!=='melee'){const nx=-dx/d,ny=-dy/d;b.x+=nx*speed*dt;b.y+=ny*speed*dt;}b.strafeTimer=(b.strafeTimer||0)-dt;if(b.strafeTimer<=0){b.strafeTimer=rand(.7,1.6);b.strafeDir=Math.random()<0.5?-1:1;}const perpX=-dy/d,perpY=dx/d;b.x+=perpX*b.strafeDir*speed*0.35*dt;b.y+=perpY*b.strafeDir*speed*0.35*dt;b.x=clamp(b.x,25,WORLD.w-25);b.y=clamp(b.y,75,WORLD.h-25);}
function updateBossAI(b,dt,dx,dy,d){if(b.hp<=0)return;updateBossPhase(b);if(b.invuln>0)b.invuln-=dt;for(const k in b._skillCds){b._skillCds[k]=Math.max(0,b._skillCds[k]-dt);}if(b._pullField){if(worldTime<b._pullField.until){const pdx=b._pullField.x-player.x;const pdy=b._pullField.y-player.y;const pd=Math.hypot(pdx,pdy)||1;if(pd<b._pullField.R){const pull=200*(1-pd/b._pullField.R)+40;player.x+=pdx/pd*pull*dt;player.y+=pdy/pd*pull*dt;player.x=clamp(player.x,25,WORLD.w-25);player.y=clamp(player.y,75,WORLD.h-25);}}else b._pullField=null;}
if(b.castTimer>0){b.castTimer-=dt;if(Math.random()<0.35){const a=Math.random()*Math.PI*2,r=b.r+rand(6,20);particles.push({x:b.x+Math.cos(a)*r,y:b.y+Math.sin(a)*r,vx:-Math.cos(a)*40,vy:-Math.sin(a)*40,life:.4,color:b.c,size:rand(2,4),grav:0});}if(b.castTimer<=0&&b.castSkill){const sk=b.castSkill;b.castSkill=null;if(sk.exec){try{sk.exec(b);}catch(err){console.warn('Boss skill error:',err);}}if(sk.id&&sk.cd>0)b._skillCds[sk.id]=sk.cd;}return;}
b.globalCd=(b.globalCd||1)-dt;if(b.globalCd<=0){const sk=pickBossSkill(b,d);if(sk){b.castTimer=sk.cast||0.6;b.castSkill=sk;b.globalCd=(sk.post||1.1)+rand(0.2,0.6);b.castTarget={x:player.x,y:player.y};addVfx({type:'ring',x:b.x,y:b.y,color:sk.color||b.c,r:80,life:b.castTimer+0.15,r0:10});addVfx({type:'rune',x:b.x,y:b.y,color:sk.color||b.c,color2:'#fff',r:60,life:b.castTimer+0.2,rotSpeed:3});if(sk.name&&sk.name.length<22){SKILL_BANNER.text=sk.name;SKILL_BANNER.sub=b.name+' · '+((b.bossPhase===2)?'CATASTROPHE':(b.bossPhase===1)?'ENRAGED':'AWAKENING');SKILL_BANNER.icon=sk.icon||'⚡';SKILL_BANNER.color=sk.color||b.c;SKILL_BANNER.life=1.0;SKILL_BANNER.maxLife=1.0;}return;}}
bossMovement(b,dt,dx,dy,d);
if(d<b.r+player.r+22&&b.attackCd<=0&&player.inv<=0&&!dying){b.attackCd=0.75;const dmg=bossDmg(b,1.15);if(player.defendTimer>0){}hp-=(player.defendTimer>0?Math.round(dmg*(1-(player.shieldReduction||.5))):dmg);player.inv=0.42;floatText(player.x+rand(-6,6),player.y-28,'-'+dmg,'#ff7182');burst(player.x,player.y,b.c,12,{spd:170});addShake(.22);screenFlash(.1);hitStopNow(.04);}}

