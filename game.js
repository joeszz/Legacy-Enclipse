/* ECLIPSE RPG — MAIN GAME LOOP */
/* ============================================================
   PIXEL ART HELPERS
   ============================================================ */
function snap(v){return Math.round(v);}
function pxRect(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(snap(x),snap(y),Math.max(1,snap(w)),Math.max(1,snap(h)));}

const SK='eclipse_rpg_settings_v1';
const DS={shake:1,showDamage:true,showAimLine:true,particles:1,difficulty:1};
let settings={...DS};
function loadSettings(){try{const r=localStorage.getItem(SK);if(r)settings={...DS,...JSON.parse(r)};}catch(e){}}
function saveSettings(){try{localStorage.setItem(SK,JSON.stringify(settings));}catch(e){}}
function renderSettingsUI(){document.querySelectorAll('[data-setting]').forEach(el=>{const k=el.getAttribute('data-setting'),cv=String(settings[k]);el.querySelectorAll('button').forEach(btn=>{const v=btn.getAttribute('data-value');btn.classList.toggle('active',v===cv);btn.onclick=()=>{let nv=v;if(v==='true')nv=true;else if(v==='false')nv=false;else if(!isNaN(parseFloat(v))&&isFinite(v))nv=parseFloat(v);settings[k]=nv;saveSettings();renderSettingsUI();if(k==='showAimLine'&&!nv)currentAimTarget=null;};});});}

/* ============================================================
   ARCHETYPE DETECTION
   ============================================================ */
function getArchetype(ch){
  const n=(ch.name||'').toUpperCase();
  const s=(ch.sub||'').toUpperCase();
  const style=ch.style||'';
  if(/ROBOT|MECH|ANDROID|CYBORG|MECHA|DRONE|TINKER/.test(n)) return 'robot';
  if(/DRAGON (KNIGHT|SLAYER|TAMER|QUEEN|RIDER)/.test(n)) return 'dragonrider';
  if(/WOLF (RIDER|KING)/.test(n)) return 'wolfrider';
  if(/BEAST ?(MASTER|TAMER)/.test(n)) return 'beastmaster';
  if(/TAMER/.test(n)) return 'beastmaster';
  if(/ANGEL|SERAPH/.test(n)) return 'angel';
  if(/DEMON|DEVIL|LORD/.test(n) && /DEMON|DEVIL/.test(n)) return 'demon';
  if(/LICH|UNDEAD|NECROMANCER|SOUL EATER|SOUL HUNTER|REAPER/.test(n)) return 'undead';
  if(/GHOST|SPIRIT|WRAITH|PHANTOM|SHADOW|BANSHEE/.test(n)) return 'ghost';
  if(/PHOENIX/.test(n)) return 'phoenix';
  if(/ICE QUEEN|SNOW/.test(n)) return 'icequeen';
  if(/GOLEM|TITAN|COLOSSUS/.test(n)) return 'golem';
  if(/LIGHT KING|DARK KING|RULER|EMPEROR|QUEEN|KING/.test(n)) return 'royal';
  if(/NINJA|ASSASSIN|ROGUE|THIEF|RONIN/.test(n)) return 'ninja';
  if(/MAGE|WIZARD|WARLOCK|SORCERER|ORACLE|ARCANIST|CHRONOMANCER|ELEMENTALIST/.test(n)) return 'mage';
  if(/SUMMONER|CALLER|KEEPER/.test(n)) return 'summoner';
  if(/PIRATE|VIKING|AXEMAN|WARLORD|GLADIATOR/.test(n)) return 'warrior';
  if(/PRIEST|PALADIN|CRUSADER|SUN KNIGHT|HOLY/.test(n)) return 'paladin';
  if(style==='mage') return 'mage';
  if(style==='ranger'||style==='bard') return 'ranger';
  if(style==='rogue') return 'ninja';
  if(style==='monk') return 'monk';
  if(style==='engineer') return 'robot';
  if(style==='paladin') return 'paladin';
  if(style==='warlord') return 'warrior';
  return 'human';
}

function drawHeroPixelOutline(g,arch){
  const ink='#101522';
  if(arch==='dragonrider'||arch==='wolfrider'){
    pxRect(g,-24,-8,48,22,ink);
    pxRect(g,-13,-24,26,18,ink);
    pxRect(g,-10,-39,20,18,ink);
    pxRect(g,-15,-14,7,15,ink);pxRect(g,8,-14,7,15,ink);
    pxRect(g,-12,10,8,10,ink);pxRect(g,4,10,8,10,ink);
    return;
  }
  if(arch==='robot'||arch==='golem'||arch==='royal'||arch==='icequeen'){
    const wide=arch==='golem'?15:13;
    pxRect(g,-9,10,8,10,ink);pxRect(g,1,10,8,10,ink);
    pxRect(g,-wide,-11,wide*2,22,ink);
    pxRect(g,-wide-3,-8,5,16,ink);pxRect(g,wide-2,-8,5,16,ink);
    pxRect(g,-12,-30,24,22,ink);
    pxRect(g,-8,-35,16,10,ink);
    return;
  }
  if(arch==='mage'||arch==='summoner'||arch==='ninja'||arch==='paladin'){
    pxRect(g,-10,8,9,12,ink);pxRect(g,1,8,9,12,ink);
    pxRect(g,-12,-9,24,20,ink);
    pxRect(g,-13,-2,26,15,ink);
    pxRect(g,-6,-28,12,18,ink);
    pxRect(g,-16,-4,6,13,ink);pxRect(g,10,-4,6,13,ink);
    return;
  }
  const wide=arch==='monk'?11:12;
  pxRect(g,-9,8,8,12,ink);pxRect(g,1,8,8,12,ink);
  pxRect(g,-wide,-8,wide*2,20,ink);
  pxRect(g,-wide-3,-6,5,13,ink);pxRect(g,wide-2,-6,5,13,ink);
  pxRect(g,-12,-24,24,18,ink);
}

const HERO_PIXEL_SCALE=.5;
const HERO_PIXEL_CANVAS=document.createElement('canvas');
HERO_PIXEL_CANVAS.width=48;HERO_PIXEL_CANVAS.height=44;
const HERO_PIXEL_CTX=HERO_PIXEL_CANVAS.getContext('2d');
HERO_PIXEL_CTX.imageSmoothingEnabled=false;
function drawHero(g,ch,facing,atkA,opts){
  const pixelCtx=HERO_PIXEL_CTX;
  pixelCtx.setTransform(1,0,0,1,0,0);
  pixelCtx.clearRect(0,0,HERO_PIXEL_CANVAS.width,HERO_PIXEL_CANVAS.height);
  pixelCtx.save();
  pixelCtx.setTransform(HERO_PIXEL_SCALE,0,0,HERO_PIXEL_SCALE,24,28);
  drawHeroRaw(pixelCtx,ch,facing,atkA,opts);
  pixelCtx.restore();
  pixelCtx.setTransform(1,0,0,1,0,0);
  g.save();
  g.imageSmoothingEnabled=false;
  g.drawImage(HERO_PIXEL_CANVAS,-48,-56,96,88);
  g.restore();
}

function drawHeroRaw(g,ch,facing,atkA,opts){
  opts=opts||{};
  const arch=getArchetype(ch);
  g.save();
  const t=worldTime||0;
  const breathe=Math.sin(t*2.2)*0.35;
  const c=ch.color,cd=ch.colorDark,cl=ch.colorLight;
  const swing=atkA>0?(-1.2+(1-atkA/.4)*2.4):.35;
  if(opts.walking)g.translate(0,Math.round(Math.sin((opts.walkT||0)*2)*.7));
  g.fillStyle='rgba(0,0,0,.38)';g.fillRect(-13,14,26,4);g.fillRect(-10,18,20,2);
  drawGroundGlow(g,c,cl,arch);
  drawHeroPixelOutline(g,arch);
  if(opts.dashing){const alpha=g.globalAlpha;g.globalAlpha=alpha*.32;for(let i=0;i<3;i++)pxRect(g,-facing*(18+i*6),-8+i*7,5,3,i===1?cl:c);g.globalAlpha=alpha;}
  switch(arch){
    case 'robot': drawRobot(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'dragonrider': drawDragonRider(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'wolfrider': drawWolfRider(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'beastmaster': drawBeastmaster(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'angel': drawAngel(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'demon': drawDemon(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'undead': drawUndead(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'ghost': drawGhost(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'phoenix': drawPhoenix(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'icequeen': drawIceQueen(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'golem': drawGolem(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'royal': drawRoyal(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'ninja': drawNinja(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'mage': drawMage(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'summoner': drawSummoner(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'paladin': drawPaladin(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'warrior': drawWarrior(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'monk': drawMonk(g,ch,facing,atkA,breathe,c,cd,cl); break;
    case 'ranger': drawRanger(g,ch,facing,atkA,breathe,c,cd,cl); break;
    default: drawHuman(g,ch,facing,atkA,breathe,c,cd,cl);
  }
  g.restore();
}

function drawGroundGlow(g,c,cl,arch){
  const t=worldTime||0;
  g.save();
  const pulse=.35+.18*Math.sin(t*3);
  g.globalAlpha=pulse;
  g.fillStyle=cl;
  g.fillRect(-12,17,24,1);
  g.fillRect(-8,18,16,1);
  g.globalAlpha=1;
  g.restore();
}

function drawChibiBody(g,skin,cloth,clothDark,clothLight,breathe,facing){
  const headY=-20+Math.round(breathe);
  pxRect(g,-6,8,5,8,clothDark);
  pxRect(g,1,8,5,8,clothDark);
  pxRect(g,-7,14,6,3,'#0a0a10');
  pxRect(g,1,14,6,3,'#0a0a10');
  pxRect(g,-7,14,6,1,clothLight);
  pxRect(g,1,14,6,1,clothLight);
  pxRect(g,-9,-4,18,14,cloth);
  pxRect(g,-9,-4,18,3,clothLight);
  pxRect(g,-9,8,18,2,clothDark);
  pxRect(g,-8,headY,16,14,skin);
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-7,headY+1,3,3,'rgba(255,255,255,.2)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');
  pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,'#101010');
  pxRect(g,3+off,headY+8,2,3,'#101010');
  pxRect(g,-1,headY+12,2,1,'rgba(0,0,0,.55)');
  pxRect(g,-12,-1,3,7,skin);
  pxRect(g,9,-1,3,7,skin);
  return headY;
}

function drawHair(g,hs,hair,cl,headY,ghostMode){
  if(ghostMode)return;
  g.fillStyle=hair;
  if(hs==='hat'){g.fillRect(-12,headY-2,24,3);g.fillRect(-9,headY-6,18,4);g.fillRect(-5,headY-10,10,4);g.fillRect(-2,headY-13,4,3);pxRect(g,-10,headY-4,20,1,cl);pxRect(g,-1,headY-9,3,3,'#ffe080');}
  else if(hs==='hood'){g.fillRect(-10,headY-3,20,9);g.fillRect(-11,headY+1,2,14);g.fillRect(9,headY+1,2,14);pxRect(g,-8,headY+2,16,10,'rgba(0,0,0,.7)');}
  else if(hs==='long'){g.fillRect(-9,headY-2,18,5);g.fillRect(-11,headY+2,2,18);g.fillRect(9,headY+2,2,18);pxRect(g,-8,headY-1,3,1,cl);}
  else if(hs==='spike'){g.fillRect(-9,headY-2,18,5);g.fillRect(-10,headY-5,3,4);g.fillRect(-3,headY-7,3,6);g.fillRect(4,headY-5,3,5);g.fillRect(8,headY-4,3,4);}
  else if(hs==='pony'){g.fillRect(-9,headY-2,18,5);g.fillRect(-8,headY+2,3,4);g.fillRect(-9,headY+5,3,13);g.fillRect(-8,headY+17,2,3);}
  else if(hs==='antler'){g.fillRect(-9,headY-2,18,5);g.fillStyle='#8a6a30';g.fillRect(-10,headY-7,2,5);g.fillRect(-13,headY-11,2,5);g.fillRect(-14,headY-14,2,4);g.fillRect(8,headY-7,2,5);g.fillRect(11,headY-11,2,5);g.fillRect(12,headY-14,2,4);}
  else{g.fillRect(-9,headY-2,18,5);g.fillRect(-11,headY+2,2,6);g.fillRect(9,headY+2,2,6);}
}

function drawHuman(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=drawChibiBody(g,ch.skin,cd,c,cl,breathe,facing);
  drawHair(g,ch.hairStyle,ch.hair,cl,headY,false);
  drawWeaponFor(g,ch,facing,atkA,c,cd,cl);
}
function drawMage(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=-20+Math.round(breathe);
  pxRect(g,-7,8,5,8,cd);
  pxRect(g,1,8,5,8,cd);
  pxRect(g,-11,-4,22,12,cd);
  pxRect(g,-13,7,26,7,cd);
  pxRect(g,-13,13,26,2,cl);
  pxRect(g,-3,-1,6,6,c);
  pxRect(g,-1,1,2,2,'#ffffff');
  pxRect(g,-14,-1,3,7,cd);
  pxRect(g,11,-1,3,7,cd);
  pxRect(g,-8,headY,16,14,ch.skin);
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-7,headY+1,3,3,'rgba(255,255,255,.2)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,cl);pxRect(g,3+off,headY+8,2,3,cl);
  pxRect(g,-1,headY+12,2,1,'rgba(0,0,0,.5)');
  drawHair(g,ch.hairStyle||'hat',ch.hair,cl,headY,false);
  g.save();g.translate(facing*10,2);g.scale(facing,1);g.rotate(atkA>0?(-.9+(1-atkA/.4)*1.4):0);
  pxRect(g,-1,-40,2,58,'#4a3010');
  pxRect(g,-5,-48,10,10,c);
  pxRect(g,-3,-46,6,6,cl);
  pxRect(g,-2,-45,2,2,'#ffffff');
  g.restore();
}
function drawSummoner(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=-20+Math.round(breathe);
  pxRect(g,-7,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-10,-4,20,12,c);
  pxRect(g,-12,7,24,8,cd);
  pxRect(g,-12,13,24,2,cl);
  pxRect(g,-3,-1,6,6,cd);
  pxRect(g,-1,1,2,2,cl);
  pxRect(g,-13,-1,3,7,cd);pxRect(g,10,-1,3,7,cd);
  pxRect(g,-8,headY,16,14,ch.skin);
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,c);pxRect(g,3+off,headY+8,2,3,c);
  drawHair(g,ch.hairStyle||'hood',ch.hair,cl,headY,false);
  const t=worldTime||0;
  const orbX=Math.cos(t*2)*18*facing;
  const orbY=-26+Math.sin(t*2)*3;
  pxRect(g,orbX-3,orbY-3,6,6,c);
  pxRect(g,orbX-2,orbY-2,4,4,cl);
  pxRect(g,orbX-1,orbY-1,2,2,'#ffffff');
  g.save();g.translate(facing*12,-2);g.scale(facing,1);
  pxRect(g,-1,-38,2,50,'#3a2010');
  pxRect(g,-4,-46,8,8,c);
  pxRect(g,-2,-44,4,4,cl);
  g.restore();
}
function drawNinja(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=-20+Math.round(breathe);
  pxRect(g,-6,8,5,8,'#101020');pxRect(g,1,8,5,8,'#101020');
  pxRect(g,-8,14,6,3,'#0a0a10');pxRect(g,2,14,6,3,'#0a0a10');
  pxRect(g,-9,-4,18,14,'#16162a');
  pxRect(g,-9,-4,18,3,c);
  pxRect(g,-9,6,18,2,c);
  pxRect(g,-9,9,18,2,'#0a0a15');
  pxRect(g,-11,-1,2,8,'#101020');
  pxRect(g,9,-1,2,8,'#101020');
  pxRect(g,-10,headY-3,20,13,c);
  pxRect(g,-9,headY+1,18,10,'rgba(0,0,0,.85)');
  const eyeGlow=Math.sin(worldTime*6)*.3+.7;
  g.globalAlpha=eyeGlow;
  pxRect(g,-5,headY+5,3,2,cl);
  pxRect(g,2,headY+5,3,2,cl);
  g.globalAlpha=1;
  pxRect(g,-10,headY+3,20,2,'#0a0a15');
  g.save();g.translate(facing*11,2);g.scale(facing,1);g.rotate(atkA>0?(-1+(1-atkA/.4)*2):.4);
  pxRect(g,-1,-14,2,14,'#e8e8f0');
  pxRect(g,-1,-14,1,14,'#ffffff');
  pxRect(g,-2,-3,4,3,'#3a1010');
  g.restore();
  g.save();g.translate(-facing*10,4);g.scale(facing,1);g.rotate(atkA>0?(.5-(1-atkA/.4)*1.5):-.5);
  pxRect(g,-1,-12,2,12,'#e8e8f0');
  pxRect(g,-1,-12,1,12,'#ffffff');
  pxRect(g,-2,-3,4,3,'#3a1010');
  g.restore();
}
function drawPaladin(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=-20+Math.round(breathe);
  pxRect(g,-6,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-7,14,6,3,'#3a2800');pxRect(g,1,14,6,3,'#3a2800');
  pxRect(g,-11,-4,22,15,c);
  pxRect(g,-11,-4,22,3,cl);
  pxRect(g,-11,6,22,2,cd);
  pxRect(g,-11,9,22,2,'#a08020');
  pxRect(g,-2,0,4,7,'#ffffff');
  pxRect(g,-4,1,8,2,'#ffffff');
  pxRect(g,-14,-4,4,6,cd);pxRect(g,10,-4,4,6,cd);
  pxRect(g,-14,-4,3,2,cl);pxRect(g,10,-4,3,2,cl);
  pxRect(g,-14,1,3,7,ch.skin);pxRect(g,11,1,3,7,ch.skin);
  pxRect(g,-8,headY,16,14,ch.skin);
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,'#4060a0');pxRect(g,3+off,headY+8,2,3,'#4060a0');
  drawHair(g,ch.hairStyle||'short',ch.hair,cl,headY,false);
  pxRect(g,-9,headY-4,18,3,'#a08020');
  pxRect(g,-9,headY-4,18,1,'#ffd060');
  g.save();g.translate(facing*10,2);g.scale(facing,1);
  g.scale(-1,1);g.translate(-2,0);
  pxRect(g,-11,-10,22,20,'#1a3a6a');
  pxRect(g,-11,-10,22,4,'#2a4a8a');
  pxRect(g,-11,-10,22,2,'#e0b055');
  pxRect(g,-1,-2,2,8,'#ffffff');pxRect(g,-4,1,8,2,'#ffffff');
  g.restore();
  g.save();g.translate(facing*10,2);g.scale(facing,1);g.rotate(atkA>0?(-1+(1-atkA/.4)*2):.35);
  pxRect(g,-1,-2,2,18,'#3a2010');
  pxRect(g,-6,-12,12,10,'#a0a0b0');
  pxRect(g,-6,-12,12,2,'#e0e0f0');
  g.restore();
}
function drawWarrior(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=drawChibiBody(g,ch.skin,cd,c,cl,breathe,facing);
  pxRect(g,-13,-4,4,5,c);
  pxRect(g,9,-4,4,5,c);
  drawHair(g,ch.hairStyle,ch.hair,cl,headY,false);
  drawWeaponFor(g,ch,facing,atkA,c,cd,cl);
}
function drawMonk(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=-20+Math.round(breathe);
  pxRect(g,-6,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-7,14,6,3,'#3a2010');pxRect(g,1,14,6,3,'#3a2010');
  pxRect(g,-9,-4,18,14,ch.skin);
  pxRect(g,-9,5,18,1,'#c09060');
  pxRect(g,-9,7,18,1,'#c09060');
  pxRect(g,-9,9,18,2,c);
  pxRect(g,-11,-1,2,7,ch.skin);pxRect(g,9,-1,2,7,ch.skin);
  pxRect(g,-8,headY,16,14,ch.skin);
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,'#101010');pxRect(g,3+off,headY+8,2,3,'#101010');
  drawHair(g,ch.hairStyle||'short',ch.hair,cl,headY,false);
  const t=worldTime||0;
  if(atkA>0){const fg=6+Math.sin(t*30)*2;pxRect(g,facing*14-2,-2-fg/2,4,fg,c);}
  g.save();g.translate(facing*11,2);g.scale(facing,1);g.rotate(atkA>0?(-1.2+(1-atkA/.4)*2.4):.2);
  pxRect(g,-3,-6,6,14,'#e0e0d0');
  pxRect(g,-3,0,6,1,'#c0c0b0');pxRect(g,-3,4,6,1,'#c0c0b0');
  g.restore();
}
function drawRanger(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=drawChibiBody(g,ch.skin,cd,c,cl,breathe,facing);
  pxRect(g,-10,4,20,10,c);
  pxRect(g,-10,12,20,3,cd);
  drawHair(g,ch.hairStyle,ch.hair,cl,headY,false);
  g.save();g.translate(facing*10,0);g.scale(facing,1);
  g.strokeStyle='#3a2010';g.lineWidth=2;
  g.beginPath();g.moveTo(0,-16);g.quadraticCurveTo(10,0,0,16);g.stroke();
  pxRect(g,-1,-17,3,2,cl);pxRect(g,-1,15,3,2,cl);
  if(atkA>.1){const pull=4+atkA*8;g.strokeStyle='#ffffff';g.lineWidth=1;g.beginPath();g.moveTo(0,-16);g.lineTo(-pull,0);g.lineTo(0,16);g.stroke();pxRect(g,-pull-14,-1,14,2,cl);}
  g.restore();
}

function drawRobot(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const hum=Math.sin(t*4)*.5;
  pxRect(g,-8,8,6,8,'#40405a');
  pxRect(g,2,8,6,8,'#40405a');
  pxRect(g,-9,14,7,3,'#202030');
  pxRect(g,2,14,7,3,'#202030');
  pxRect(g,-9,14,7,1,cl);
  pxRect(g,2,14,7,1,cl);
  pxRect(g,-7,6,5,3,c);
  pxRect(g,2,6,5,3,c);
  pxRect(g,-11,-6+hum,22,14,cd);
  pxRect(g,-11,-6+hum,22,3,c);
  pxRect(g,-11,4+hum,22,3,'#181828');
  const glow=.6+.4*Math.sin(t*8);
  g.globalAlpha=glow;
  pxRect(g,-3,-3+hum,6,6,cl);
  pxRect(g,-1,-1+hum,2,2,'#ffffff');
  g.globalAlpha=1;
  pxRect(g,-9,-2+hum,2,5,'#202030');
  pxRect(g,7,-2+hum,2,5,'#202030');
  pxRect(g,-16,-6+hum,5,7,c);
  pxRect(g,11,-6+hum,5,7,c);
  pxRect(g,-16,-6+hum,5,2,cl);
  pxRect(g,11,-6+hum,5,2,cl);
  pxRect(g,-16,1+hum,4,7,cd);
  pxRect(g,12,1+hum,4,7,cd);
  pxRect(g,-17,7+hum,5,3,'#202030');
  pxRect(g,12,7+hum,5,3,'#202030');
  const headY=-24+Math.round(breathe)+Math.round(hum);
  pxRect(g,-9,headY,18,14,c);
  pxRect(g,-9,headY,18,3,cl);
  pxRect(g,-8,headY+4,16,7,'#0a0a15');
  const eyeGlow=.7+.3*Math.sin(t*10);
  g.globalAlpha=eyeGlow;
  pxRect(g,-6,headY+6,4,3,'#00ffff');
  pxRect(g,2,headY+6,4,3,'#00ffff');
  pxRect(g,-5,headY+6,2,2,'#ffffff');
  pxRect(g,3,headY+6,2,2,'#ffffff');
  g.globalAlpha=1;
  pxRect(g,-1,headY-8,2,5,'#40405a');
  pxRect(g,-2,headY-10,4,3,cl);
  g.globalAlpha=.7+.3*Math.sin(t*12);
  pxRect(g,-1,headY-10,2,2,'#ffffff');
  g.globalAlpha=1;
  pxRect(g,-12,headY-5,24,3,'#e0f7ff');
  g.save();g.translate(facing*16,-2+hum);g.scale(facing,1);
  pxRect(g,-2,-3,10,6,'#40405a');
  pxRect(g,6,-2,6,4,c);
  pxRect(g,10,-1,4,2,cl);
  pxRect(g,12,-6,5,4,'#e0f7ff');
  g.restore();
}

function drawDragonRider(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const flap=Math.sin(t*3)*3;
  const dC=c,dCd=cd,dCl=cl;
  g.fillStyle=dCd;
  g.beginPath();g.moveTo(-2,-18);g.lineTo(-30,-30+flap);g.lineTo(-16,-8);g.closePath();g.fill();
  g.beginPath();g.moveTo(2,-18);g.lineTo(30,-30+flap);g.lineTo(16,-8);g.closePath();g.fill();
  g.strokeStyle=dCl;g.lineWidth=1;
  g.beginPath();g.moveTo(-2,-18);g.lineTo(-26,-28+flap);g.moveTo(-8,-14);g.lineTo(-22,-22+flap);g.stroke();
  g.beginPath();g.moveTo(2,-18);g.lineTo(26,-28+flap);g.moveTo(8,-14);g.lineTo(22,-22+flap);g.stroke();
  pxRect(g,-18,-6,30,16,dC);
  pxRect(g,-18,-6,30,3,dCl);
  pxRect(g,-18,7,30,3,dCd);
  for(let i=0;i<5;i++)pxRect(g,-14+i*6,-2,3,4,dCd);
  pxRect(g,10,-10,14,12,dC);
  pxRect(g,10,-10,14,3,dCl);
  pxRect(g,17,-7,3,3,'#ffd040');
  pxRect(g,18,-7,1,1,'#000');
  pxRect(g,13,-15,3,6,dCl);
  pxRect(g,20,-15,3,6,dCl);
  pxRect(g,22,-2,4,2,'#8a0000');
  g.strokeStyle=dC;g.lineWidth=4;
  g.beginPath();g.moveTo(-18,-2);g.quadraticCurveTo(-32,-4+Math.sin(t*4)*2,-36,-12);g.stroke();
  pxRect(g,-38,-14,6,4,dCl);
  pxRect(g,-12,10,5,7,dCd);
  pxRect(g,2,10,5,7,dCd);
  const headY=-36+Math.round(breathe);
  pxRect(g,-6,-18,5,7,cd);pxRect(g,1,-18,5,7,cd);
  pxRect(g,-8,-22,16,8,ch.colorDark);
  pxRect(g,-8,-22,16,2,cl);
  pxRect(g,-10,-18,3,5,ch.skin);pxRect(g,7,-18,3,5,ch.skin);
  pxRect(g,-7,headY,14,12,ch.skin);
  pxRect(g,-7,headY+9,14,3,'rgba(0,0,0,.15)');
  pxRect(g,-5,headY+6,3,3,'#fff');pxRect(g,2,headY+6,3,3,'#fff');
  const off=facing>=0?1:0;
  pxRect(g,-4+off,headY+7,2,2,'#101010');pxRect(g,3+off,headY+7,2,2,'#101010');
  drawHair(g,ch.hairStyle,ch.hair,cl,headY,false);
  g.save();g.translate(facing*11,-18);g.scale(facing,1);g.rotate(atkA>0?(-.8+(1-atkA/.4)*1.8):.35);
  pxRect(g,-1,-30,2,30,'#e8e8f0');
  pxRect(g,-2,-3,4,3,cd);
  g.restore();
}

function drawWolfRider(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const gallop=Math.sin(t*6)*1.5;
  const wC='#8a7050',wCd='#4a3020',wCl='#c0a080';
  pxRect(g,-18,-4,28,12,wC);
  pxRect(g,-18,-4,28,3,wCl);
  pxRect(g,-18,6,28,3,wCd);
  for(let i=0;i<4;i++)pxRect(g,-14+i*8,-6,4,3,wCl);
  pxRect(g,8,-10,14,12,wC);
  pxRect(g,8,-10,14,3,wCl);
  pxRect(g,10,-15,4,6,wCd);
  pxRect(g,17,-15,4,6,wCd);
  pxRect(g,10,-15,2,4,cl);
  pxRect(g,15,-7,3,3,'#ffd040');
  pxRect(g,16,-7,1,1,'#000');
  pxRect(g,20,-4,5,4,wCd);
  pxRect(g,23,-3,3,2,'#000');
  g.strokeStyle=wC;g.lineWidth=4;
  g.beginPath();g.moveTo(-18,0);g.quadraticCurveTo(-28,-4+Math.sin(t*6)*3,-30,-14);g.stroke();
  pxRect(g,-32,-16,5,4,wCl);
  pxRect(g,-14,8+gallop,4,8,wCd);
  pxRect(g,-4,8-gallop,4,8,wCd);
  pxRect(g,4,8+gallop,4,8,wCd);
  pxRect(g,12,8-gallop,4,8,wCd);
  const headY=-32+Math.round(breathe);
  pxRect(g,-6,-16,5,7,cd);pxRect(g,1,-16,5,7,cd);
  pxRect(g,-8,-20,16,9,c);
  pxRect(g,-8,-20,16,2,cl);
  pxRect(g,-10,-16,3,5,ch.skin);pxRect(g,7,-16,3,5,ch.skin);
  pxRect(g,-7,headY,14,12,ch.skin);
  pxRect(g,-7,headY+9,14,3,'rgba(0,0,0,.15)');
  pxRect(g,-5,headY+6,3,3,'#fff');pxRect(g,2,headY+6,3,3,'#fff');
  const off=facing>=0?1:0;
  pxRect(g,-4+off,headY+7,2,2,'#101010');pxRect(g,3+off,headY+7,2,2,'#101010');
  drawHair(g,ch.hairStyle,ch.hair,cl,headY,false);
  g.save();g.translate(facing*10,-14);g.scale(facing,1);
  g.strokeStyle='#3a2010';g.lineWidth=2;
  g.beginPath();g.moveTo(0,-14);g.quadraticCurveTo(9,0,0,14);g.stroke();
  pxRect(g,-1,-15,3,2,cl);pxRect(g,-1,13,3,2,cl);
  g.restore();
}

function drawBeastmaster(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=drawChibiBody(g,ch.skin,cd,c,cl,breathe,facing);
  pxRect(g,-12,-3,24,4,cd);
  pxRect(g,-12,-3,24,1,'#c0a060');
  for(let i=0;i<3;i++)pxRect(g,-4+i*4,1,2,3,'#ffffff');
  drawHair(g,ch.hairStyle||'long',ch.hair,cl,headY,false);
  const t=worldTime||0;
  const wx=facing*(28)+Math.sin(t*2)*2;
  const wy=4+Math.abs(Math.sin(t*6)*1.5);
  g.save();g.translate(wx,wy);
  const wC='#7a5a30',wCd='#3a2010';
  pxRect(g,-10,-4,20,10,wC);
  pxRect(g,-10,-4,20,2,'#a08050');
  pxRect(g,6,-8,10,9,wC);
  pxRect(g,8,-12,3,5,wCd);
  pxRect(g,13,-12,3,5,wCd);
  pxRect(g,12,-5,3,2,'#ffd040');
  pxRect(g,-14,0,4,3,'#3a2010');
  g.restore();
  g.save();g.translate(facing*10,2);g.scale(facing,1);
  pxRect(g,-1,-38,2,52,'#4a3010');
  pxRect(g,-4,-44,8,7,cd);
  pxRect(g,-2,-42,4,3,cl);
  g.restore();
}

function drawAngel(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const flap=Math.sin(t*2)*4;
  g.globalAlpha=.85;
  pxRect(g,-10,-38,20,3,'#ffe080');
  pxRect(g,-8,-39,16,1,'#ffffff');
  g.globalAlpha=1;
  g.fillStyle='#fff8e0';
  g.beginPath();g.moveTo(-3,-20);g.lineTo(-26,-32+flap);g.lineTo(-18,-16);g.lineTo(-24,-8);g.lineTo(-12,-8);g.closePath();g.fill();
  g.beginPath();g.moveTo(3,-20);g.lineTo(26,-32+flap);g.lineTo(18,-16);g.lineTo(24,-8);g.lineTo(12,-8);g.closePath();g.fill();
  g.strokeStyle='#e0c060';g.lineWidth=1;
  g.beginPath();g.moveTo(-3,-20);g.lineTo(-22,-28+flap);g.moveTo(-8,-16);g.lineTo(-20,-18);g.stroke();
  g.beginPath();g.moveTo(3,-20);g.lineTo(22,-28+flap);g.moveTo(8,-16);g.lineTo(20,-18);g.stroke();
  const headY=-20+Math.round(breathe);
  pxRect(g,-7,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-11,-4,22,14,'#f0f0ff');
  pxRect(g,-13,7,26,8,'#e0e8ff');
  pxRect(g,-13,14,26,2,'#ffe080');
  pxRect(g,-3,-1,6,6,'#ffe080');
  pxRect(g,-1,1,2,2,'#ffffff');
  pxRect(g,-13,-1,3,7,ch.skin);pxRect(g,10,-1,3,7,ch.skin);
  pxRect(g,-8,headY,16,14,ch.skin);
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,'#4080d0');pxRect(g,3+off,headY+8,2,3,'#4080d0');
  drawHair(g,ch.hairStyle||'long','#f0e0a0',cl,headY,false);
  g.save();g.translate(facing*10,2);g.scale(facing,1);g.rotate(atkA>0?(-.6+(1-atkA/.4)*1.2):0);
  pxRect(g,-1,-40,2,58,'#a08020');
  pxRect(g,-5,-48,10,10,'#ffe080');
  pxRect(g,-3,-46,6,6,'#fff8d0');
  pxRect(g,-1,-45,2,2,'#ffffff');
  g.restore();
}

function drawDemon(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const flap=Math.sin(t*3)*3;
  g.fillStyle=cd;
  g.beginPath();g.moveTo(-3,-20);g.lineTo(-30,-34+flap);g.lineTo(-20,-14);g.lineTo(-28,-6);g.lineTo(-14,-10);g.closePath();g.fill();
  g.beginPath();g.moveTo(3,-20);g.lineTo(30,-34+flap);g.lineTo(20,-14);g.lineTo(28,-6);g.lineTo(14,-10);g.closePath();g.fill();
  g.strokeStyle='#ff3050';g.lineWidth=1;g.globalAlpha=.7;
  g.beginPath();g.moveTo(-3,-20);g.lineTo(-24,-28+flap);g.moveTo(-8,-14);g.lineTo(-18,-14);g.stroke();
  g.beginPath();g.moveTo(3,-20);g.lineTo(24,-28+flap);g.moveTo(8,-14);g.lineTo(18,-14);g.stroke();
  g.globalAlpha=1;
  const headY=-20+Math.round(breathe);
  pxRect(g,-7,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-8,14,7,3,'#150005');pxRect(g,1,14,7,3,'#150005');
  pxRect(g,-10,-4,20,14,c);
  pxRect(g,-10,-4,20,3,cl);
  pxRect(g,-10,8,20,2,cd);
  const glow=.6+.4*Math.sin(t*8);
  g.globalAlpha=glow;
  pxRect(g,-3,0,6,6,'#ff2050');
  pxRect(g,-1,2,2,2,'#ffffff');
  g.globalAlpha=1;
  pxRect(g,-13,-1,3,8,cd);pxRect(g,10,-1,3,8,cd);
  pxRect(g,-13,6,1,3,'#ff9090');pxRect(g,-11,6,1,3,'#ff9090');pxRect(g,-9,6,1,3,'#ff9090');
  pxRect(g,9,6,1,3,'#ff9090');pxRect(g,11,6,1,3,'#ff9090');pxRect(g,13,6,1,3,'#ff9090');
  pxRect(g,-8,headY,16,14,c);
  pxRect(g,-8,headY,16,3,cl);
  pxRect(g,-11,headY-6,3,7,'#3a0510');
  pxRect(g,-13,headY-11,3,6,'#3a0510');
  pxRect(g,8,headY-6,3,7,'#3a0510');
  pxRect(g,10,headY-11,3,6,'#3a0510');
  g.globalAlpha=.8+.2*Math.sin(t*10);
  pxRect(g,-6,headY+6,4,3,'#ff2020');
  pxRect(g,2,headY+6,4,3,'#ff2020');
  g.globalAlpha=1;
  pxRect(g,-5,headY+6,2,2,'#ffffff');pxRect(g,3,headY+6,2,2,'#ffffff');
  pxRect(g,-2,headY+12,1,2,'#ffffff');pxRect(g,1,headY+12,1,2,'#ffffff');
  g.strokeStyle=c;g.lineWidth=3;
  g.beginPath();g.moveTo(-8,6);g.quadraticCurveTo(-20,10+Math.sin(t*4)*2,-26,-2);g.stroke();
  g.save();g.translate(facing*13,2);g.scale(facing,1);g.rotate(atkA>0?(-.7+(1-atkA/.4)*1.4):.3);
  pxRect(g,-1,-46,2,50,'#3a0010');
  pxRect(g,-5,-52,2,8,'#c02040');
  pxRect(g,3,-52,2,8,'#c02040');
  pxRect(g,-1,-56,2,8,'#c02040');
  g.restore();
}

function drawUndead(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const headY=-20+Math.round(breathe);
  pxRect(g,-6,8,5,8,'#e8e0d0');pxRect(g,1,8,5,8,'#e8e0d0');
  pxRect(g,-7,14,6,3,'#8a8070');pxRect(g,1,14,6,3,'#8a8070');
  pxRect(g,-8,-4,16,12,cd);
  for(let i=0;i<4;i++)pxRect(g,-6,-2+i*3,12,1,'#c0b8a0');
  pxRect(g,-1,-4,2,12,'#e8e0d0');
  pxRect(g,-11,-2,2,9,'#e8e0d0');pxRect(g,9,-2,2,9,'#e8e0d0');
  pxRect(g,-11,6,2,3,'#8a8070');pxRect(g,9,6,2,3,'#8a8070');
  pxRect(g,-8,headY,16,14,'#e8e0d0');
  pxRect(g,-8,headY+10,16,4,'#8a8070');
  pxRect(g,-6,headY+5,4,5,'#0a0010');
  pxRect(g,2,headY+5,4,5,'#0a0010');
  g.globalAlpha=.85+.15*Math.sin(t*8);
  pxRect(g,-5,headY+6,2,3,c);
  pxRect(g,3,headY+6,2,3,c);
  g.globalAlpha=1;
  for(let i=0;i<4;i++)pxRect(g,-3+i*2,headY+12,1,2,'#e8e0d0');
  pxRect(g,-10,headY-3,20,3,cd);
  pxRect(g,-11,headY+0,2,4,cd);pxRect(g,9,headY+0,2,4,cd);
  g.save();g.translate(facing*11,2);g.scale(facing,1);g.rotate(atkA>0?(-.9+(1-atkA/.4)*1.8):.35);
  pxRect(g,-1,-40,2,52,'#3a2020');
  g.fillStyle='#c0c0d0';
  g.fillRect(2,-40,20,3);
  g.fillRect(4,-37,16,3);
  g.fillRect(6,-34,12,3);
  g.fillStyle='#ffffff';g.fillRect(20,-40,2,3);
  g.restore();
  for(let i=0;i<3;i++){
    const a=t*1.5+i*2.09;
    const x=Math.cos(a)*22,y=-22+Math.sin(a*1.5)*8;
    g.globalAlpha=.6+.4*Math.sin(t*5+i);
    pxRect(g,x-1,y-1,3,3,c);
    pxRect(g,x,y,1,1,'#ffffff');
  }
  g.globalAlpha=1;
}

function drawGhost(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const headY=-20+Math.round(breathe);
  g.globalAlpha=.85;
  g.beginPath();
  g.moveTo(-12,-4);
  g.lineTo(12,-4);
  g.lineTo(12,8);
  for(let i=0;i<3;i++){
    const wave=Math.sin(t*4+i*1.5)*2;
    g.quadraticCurveTo(12-i*8,12+wave,4-i*8,8);
  }
  g.lineTo(-12,8);
  g.closePath();
  g.fillStyle=c;g.fill();
  g.globalAlpha=.4;
  g.fillStyle=cl;
  g.fillRect(-10,-2,20,2);
  g.fillRect(-8,2,16,2);
  g.globalAlpha=.85;
  pxRect(g,-8,headY,16,14,c);
  pxRect(g,-6,headY+5,4,6,'#0a0010');
  pxRect(g,2,headY+5,4,6,'#0a0010');
  g.globalAlpha=.9;
  pxRect(g,-5,headY+6,2,3,cl);
  pxRect(g,3,headY+6,2,3,cl);
  g.globalAlpha=.85;
  pxRect(g,-2,headY+12,4,2,'#0a0010');
  g.globalAlpha=1;
  g.globalAlpha=.75;
  pxRect(g,-13,-1,3,9,c);
  pxRect(g,10,-1,3,9,c);
  g.globalAlpha=1;
  for(let i=0;i<5;i++){
    const a=t*2+i*1.3;
    const x=Math.sin(a)*20,y=-14+Math.cos(a*1.2)*10;
    g.globalAlpha=.5+.3*Math.sin(t*6+i);
    pxRect(g,x-1,y-1,3,3,cl);
  }
  g.globalAlpha=1;
}

function drawPhoenix(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const flap=Math.sin(t*5)*5;
  g.fillStyle=cd;
  g.beginPath();g.moveTo(-3,-22);g.lineTo(-32,-36+flap);g.lineTo(-22,-14);g.lineTo(-30,-4);g.lineTo(-16,-10);g.closePath();g.fill();
  g.beginPath();g.moveTo(3,-22);g.lineTo(32,-36+flap);g.lineTo(22,-14);g.lineTo(30,-4);g.lineTo(16,-10);g.closePath();g.fill();
  g.fillStyle=c;
  g.beginPath();g.moveTo(-3,-20);g.lineTo(-24,-30+flap);g.lineTo(-18,-14);g.lineTo(-22,-8);g.lineTo(-12,-12);g.closePath();g.fill();
  g.beginPath();g.moveTo(3,-20);g.lineTo(24,-30+flap);g.lineTo(18,-14);g.lineTo(22,-8);g.lineTo(12,-12);g.closePath();g.fill();
  g.fillStyle=cl;
  g.beginPath();g.moveTo(-3,-18);g.lineTo(-16,-24+flap);g.lineTo(-12,-14);g.closePath();g.fill();
  g.beginPath();g.moveTo(3,-18);g.lineTo(16,-24+flap);g.lineTo(12,-14);g.closePath();g.fill();
  const headY=-20+Math.round(breathe);
  pxRect(g,-7,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-9,-4,18,14,c);
  pxRect(g,-9,-4,18,3,cl);
  pxRect(g,-9,7,18,3,'#8a2000');
  pxRect(g,-3,0,6,6,cl);
  pxRect(g,-1,2,2,2,'#ffffff');
  pxRect(g,-8,headY,16,14,c);
  pxRect(g,-8,headY,16,3,cl);
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,'#ff2020');pxRect(g,3+off,headY+8,2,3,'#ff2020');
  const flames=[[-6,-8,3,6],[0,-12,3,8],[6,-8,3,6],[3,-16,3,5],[-3,-16,3,5]];
  for(const f of flames){
    const fy=headY+f[1]+Math.sin(t*8+f[0])*2;
    pxRect(g,f[0],fy,f[2],f[3],c);
    pxRect(g,f[0]+1,fy+1,f[2]-2,f[3]-2,cl);
    pxRect(g,f[0]+1,fy+1,1,1,'#ffffff');
  }
  pxRect(g,-12,-1,3,7,c);pxRect(g,9,-1,3,7,c);
  pxRect(g,-12,-1,3,3,cl);pxRect(g,9,-1,3,3,cl);
  g.save();g.translate(facing*12,2);g.scale(facing,1);g.rotate(atkA>0?(-1+(1-atkA/.4)*2):.35);
  pxRect(g,-1,-40,3,40,c);
  pxRect(g,-1,-40,2,40,cl);
  pxRect(g,0,-42,1,4,'#ffffff');
  pxRect(g,-3,-5,7,3,'#3a0800');
  g.restore();
}

function drawIceQueen(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const headY=-20+Math.round(breathe);
  for(let i=0;i<6;i++){
    const a=t*1.2+i*1.05;
    const x=Math.cos(a)*26,y=-18+Math.sin(a*1.4)*12;
    g.globalAlpha=.75;
    pxRect(g,x-1,y-1,3,3,cl);
    pxRect(g,x,y,1,1,'#ffffff');
  }
  g.globalAlpha=1;
  pxRect(g,-7,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-11,-4,22,12,cd);
  pxRect(g,-13,7,26,8,c);
  pxRect(g,-15,13,30,2,cl);
  for(let i=0;i<5;i++){
    const x=-13+i*6;
    g.fillStyle=cl;
    g.beginPath();g.moveTo(x,7);g.lineTo(x+3,13);g.lineTo(x+6,7);g.closePath();g.fill();
  }
  pxRect(g,-4,0,8,8,c);
  pxRect(g,-2,2,4,4,cl);
  pxRect(g,-1,3,2,2,'#ffffff');
  pxRect(g,-14,-1,3,8,c);pxRect(g,11,-1,3,8,c);
  pxRect(g,-14,6,3,3,cl);pxRect(g,11,6,3,3,cl);
  pxRect(g,-8,headY,16,14,'#e0f0ff');
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,'#80c0ff');pxRect(g,3+off,headY+8,2,3,'#80c0ff');
  for(let i=0;i<5;i++){
    const x=-8+i*4;
    const h=6+i%2*4;
    pxRect(g,x,headY-h,3,h,cl);
    pxRect(g,x+1,headY-h,1,1,'#ffffff');
  }
  pxRect(g,-9,headY-2,18,2,c);
  pxRect(g,-9,headY-2,18,5,cl);
  pxRect(g,-11,headY+3,2,18,cl);
  pxRect(g,9,headY+3,2,18,cl);
  g.save();g.translate(facing*11,2);g.scale(facing,1);g.rotate(atkA>0?(-.5+(1-atkA/.4)*1):0);
  pxRect(g,-1,-40,2,58,'#305080');
  pxRect(g,-5,-50,10,12,c);
  pxRect(g,-3,-48,6,8,cl);
  const cx=0,cy=-44;
  pxRect(g,cx-1,cy-3,2,6,'#ffffff');
  pxRect(g,cx-3,cy-1,6,2,'#ffffff');
  g.restore();
}

function drawGolem(g,ch,facing,atkA,breathe,c,cd,cl){
  const t=worldTime||0;
  const hum=Math.sin(t*2)*.5;
  pxRect(g,-12,12,10,5,cd);
  pxRect(g,2,12,10,5,cd);
  pxRect(g,-12,12,10,2,cl);
  pxRect(g,2,12,10,2,cl);
  pxRect(g,-10,4,8,9,c);
  pxRect(g,2,4,8,9,c);
  pxRect(g,-10,4,8,2,cl);
  pxRect(g,2,4,8,2,cl);
  pxRect(g,-14,-8+hum,28,14,cd);
  pxRect(g,-14,-8+hum,28,4,c);
  pxRect(g,-14,4+hum,28,3,'#2a2a2a');
  g.globalAlpha=.7+.3*Math.sin(t*6);
  pxRect(g,-4,-2+hum,8,8,cl);
  pxRect(g,-2,0+hum,4,4,'#ffffff');
  g.globalAlpha=1;
  pxRect(g,-20,-8+hum,7,9,c);
  pxRect(g,13,-8+hum,7,9,c);
  pxRect(g,-20,-8+hum,7,3,cl);
  pxRect(g,13,-8+hum,7,3,cl);
  pxRect(g,-20,1+hum,5,9,cd);
  pxRect(g,15,1+hum,5,9,cd);
  pxRect(g,-21,9+hum,6,4,'#2a2a2a');
  pxRect(g,15,9+hum,6,4,'#2a2a2a');
  const headY=-26+Math.round(breathe)+Math.round(hum);
  pxRect(g,-10,headY,20,14,c);
  pxRect(g,-10,headY,20,4,cl);
  pxRect(g,-10,headY+11,20,3,'#2a2a2a');
  g.globalAlpha=.75+.25*Math.sin(t*5);
  pxRect(g,-6,headY+5,4,3,cl);
  pxRect(g,2,headY+5,4,3,cl);
  pxRect(g,-5,headY+5,2,2,'#ffffff');
  pxRect(g,3,headY+5,2,2,'#ffffff');
  g.globalAlpha=1;
  pxRect(g,-2,headY+3,1,8,'#1a1a1a');
  pxRect(g,1,headY+5,1,5,'#1a1a1a');
}

function drawRoyal(g,ch,facing,atkA,breathe,c,cd,cl){
  const headY=-20+Math.round(breathe);
  const t=worldTime||0;
  const capeWave=Math.sin(t*2)*3;
  g.fillStyle=cd;
  g.beginPath();
  g.moveTo(-9,-4);
  g.lineTo(9,-4);
  g.lineTo(15+capeWave,18);
  g.lineTo(-15+capeWave,18);
  g.closePath();
  g.fill();
  g.fillStyle=c;
  g.beginPath();g.moveTo(-9,-3);g.lineTo(9,-3);g.lineTo(12,15);g.lineTo(-12,12);g.closePath();g.fill();
  pxRect(g,-13,14,26,2,cl);
  pxRect(g,-6,8,5,8,cd);pxRect(g,1,8,5,8,cd);
  pxRect(g,-7,14,6,3,'#3a2000');pxRect(g,1,14,6,3,'#3a2000');
  pxRect(g,-10,-4,20,14,c);
  pxRect(g,-10,-4,20,3,cl);
  pxRect(g,-10,7,20,3,'#a08020');
  const glow=.65+.35*Math.sin(t*6);
  g.globalAlpha=glow;
  pxRect(g,-3,1,6,5,'#ffd040');
  pxRect(g,-1,2,2,2,'#ffffff');
  g.globalAlpha=1;
  pxRect(g,-13,-1,3,8,cd);pxRect(g,10,-1,3,8,cd);
  pxRect(g,-13,4,3,3,'#a08020');pxRect(g,10,4,3,3,'#a08020');
  pxRect(g,-8,headY,16,14,ch.skin);
  pxRect(g,-8,headY+11,16,3,'rgba(0,0,0,.15)');
  pxRect(g,-6,headY+7,4,4,'#ffffff');pxRect(g,2,headY+7,4,4,'#ffffff');
  const off=facing>=0?1:0;
  pxRect(g,-5+off,headY+8,2,3,'#101010');pxRect(g,3+off,headY+8,2,3,'#101010');
  pxRect(g,-9,headY-2,18,5,ch.hair||'#c0a060');
  pxRect(g,-11,headY+3,2,12,ch.hair||'#c0a060');
  pxRect(g,9,headY+3,2,12,ch.hair||'#c0a060');
  pxRect(g,-10,headY-6,20,4,'#ffd040');
  for(let i=0;i<5;i++){
    const x=-9+i*4;
    const h=i===2?8:5;
    pxRect(g,x,headY-6-h,2,h,'#ffd040');
    pxRect(g,x,headY-6-h,2,2,'#fff0a0');
  }
  pxRect(g,-9,headY-3,18,1,'#ff4060');
  drawWeaponFor(g,ch,facing,atkA,c,cd,cl);
}

function drawWeaponFor(g,ch,facing,atkA,c,cd,cl){
  const wp=ch.weapon;
  const swing=atkA>0?(-1.2+(1-atkA/.4)*2.4):.35;
  g.save();g.translate(facing*10,2);g.scale(facing,1);
  if(wp==='greatsword'){
    g.save();g.rotate(swing);
    pxRect(g,-2,-3,4,15,'#2a0810');
    pxRect(g,-7,-5,14,3,c);
    pxRect(g,-7,-5,14,1,cl);
    pxRect(g,-2,-42,4,38,'#d8d8e8');
    pxRect(g,-1,-42,2,38,'#ffffff');
    pxRect(g,-3,-46,6,4,'#8a8aa0');
    g.restore();
  }else if(wp==='shieldmace'){
    g.save();g.scale(-1,1);g.translate(-4,0);
    pxRect(g,-11,-10,22,20,'#1a3a6a');
    pxRect(g,-11,-10,22,4,'#2a4a8a');
    pxRect(g,-11,-10,22,2,cl);
    pxRect(g,-1,-2,2,8,cl);pxRect(g,-4,1,8,2,cl);
    g.restore();
    g.rotate(swing);
    pxRect(g,-1,-2,2,18,'#3a2010');
    pxRect(g,-6,-12,12,10,'#a0a0b0');
    pxRect(g,-6,-12,12,2,'#e0e0f0');
  }else if(wp==='spear'){
    g.rotate(swing*.5);
    pxRect(g,-1,-42,2,52,'#3a2010');
    pxRect(g,-3,-54,6,12,'#d8e0f0');
    pxRect(g,-3,-50,6,4,'#a0b0c8');
    pxRect(g,-1,-54,2,10,'#ffffff');
  }else if(wp==='bow'){
    g.save();g.translate(4,0);
    g.strokeStyle='#3a2010';g.lineWidth=2;
    g.beginPath();g.moveTo(0,-15);g.quadraticCurveTo(9,0,0,15);g.stroke();
    pxRect(g,-1,-16,3,2,cl);pxRect(g,-1,14,3,2,cl);
    if(atkA>.1){const pull=4+atkA*6;g.strokeStyle='#ffffff';g.lineWidth=1;g.beginPath();g.moveTo(0,-15);g.lineTo(-pull,0);g.lineTo(0,15);g.stroke();pxRect(g,-pull-10,-1,10,2,cl);pxRect(g,-pull-14,-1,4,2,cl);}
    g.restore();
  }else if(wp==='dualdagger'){
    g.save();g.rotate(swing);
    pxRect(g,-2,-2,4,8,'#3a1010');
    pxRect(g,-2,-20,4,18,'#d8d8e8');
    pxRect(g,-1,-20,2,18,'#ffffff');
    g.restore();
    g.save();g.translate(-facing*14,4);g.scale(facing,1);g.rotate(-swing*.6+.6);
    pxRect(g,-2,-2,4,8,'#3a1010');
    pxRect(g,-2,-18,4,16,'#d8d8e8');
    pxRect(g,-1,-18,2,16,'#ffffff');
    g.restore();
  }else if(wp==='staff'){
    g.rotate(swing*.4);
    pxRect(g,-1,-40,2,58,'#4a3010');
    pxRect(g,-5,-48,10,10,c);
    pxRect(g,-3,-46,6,6,cl);
    pxRect(g,-2,-45,2,2,'#ffffff');
  }else if(wp==='scythe'){
    g.rotate(swing*.6);
    pxRect(g,-1,-40,2,58,'#3a2020');
    g.fillStyle='#c0c0d0';
    g.fillRect(2,-40,20,3);
    g.fillRect(4,-37,16,3);
    g.fillRect(6,-34,12,3);
    pxRect(g,20,-40,2,3,'#ffffff');
  }else if(wp==='magicsword'){
    g.rotate(swing);
    pxRect(g,-2,-3,4,12,'#1a2a5a');
    pxRect(g,-6,-5,12,3,'#3a5a9a');
    pxRect(g,-2,-42,4,38,'#e8f0ff');
    pxRect(g,-1,-42,2,38,cl);
    pxRect(g,-1,-46,2,4,'#ffffff');
  }else if(wp==='wraps'){
    g.rotate(swing*1.2);
    pxRect(g,-3,-6,6,14,'#e0e0d0');
    pxRect(g,-3,-2,6,1,'#c0c0b0');pxRect(g,-3,2,6,1,'#c0c0b0');
    pxRect(g,-2,-6,4,2,cl);
  }else if(wp==='wrench'){
    g.rotate(swing);
    pxRect(g,-1,-2,2,16,'#4a3020');
    pxRect(g,-6,-14,12,8,'#a0a0b0');
    pxRect(g,-3,-12,6,4,'#4a3020');
    pxRect(g,-1,-10,2,2,c);
  }else if(wp==='lute'){
    g.rotate(.3);
    pxRect(g,-7,-4,14,14,'#8a5a20');
    pxRect(g,-4,0,8,3,'#3a2010');
    pxRect(g,-1,-22,2,20,'#3a2010');
    pxRect(g,-3,-24,6,3,'#e0e0d0');
    if(atkA>0){pxRect(g,-3,-2,6,3,cl);}
  }else{
    g.rotate(swing);
    pxRect(g,-1,-30,2,26,'#d8d8e8');
    pxRect(g,-1,-30,1,26,'#ffffff');
  }
  g.restore();
}

function drawProjectile(p){
  if(p._orb){
    const t=worldTime;
    ctx.save();ctx.translate(p.x,p.y);
    const R=Math.round(p.r+2);
    pxRect(ctx,-R,-R,R*2,R*2,p.color);
    pxRect(ctx,-R+1,-R+1,R*2-2,R*2-2,'#ffffff');
    pxRect(ctx,-R+3,-R+3,R*2-6,R*2-6,p.color);
    const rd=p.r+6+Math.sin(t*14)*2;
    ctx.fillStyle=p.color;
    for(let i=0;i<8;i++){const a=i*Math.PI/4+t*3;ctx.fillRect(Math.cos(a)*rd-2,Math.sin(a)*rd-2,4,4);}
    ctx.restore();return;
  }
  const style=p.fromAlly?'orb':(p.style||(currentChar&&currentChar.projStyle)||'arrow');
  const col=p.color,t=worldTime;const ang=Math.atan2(p.vy,p.vx);
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);
  ctx.globalAlpha=.6;ctx.fillStyle=col;for(let i=1;i<=3;i++){ctx.fillRect(-i*7,-2,5,4);}ctx.globalAlpha=1;
  if(style==='slash'){pxRect(ctx,-14,-6,20,3,col);pxRect(ctx,-8,-8,16,3,col);pxRect(ctx,-4,3,20,3,col);pxRect(ctx,-8,5,16,3,col);pxRect(ctx,-10,-1,20,2,'#ffffff');pxRect(ctx,8,-4,6,8,col);pxRect(ctx,10,-2,3,4,'#ffffff');}
  else if(style==='arrow'){pxRect(ctx,-16,-2,24,4,col);pxRect(ctx,-12,-1,22,2,'#6a4a20');pxRect(ctx,-14,-4,3,3,col);pxRect(ctx,-14,1,3,3,col);pxRect(ctx,6,-3,8,6,'#ffffff');pxRect(ctx,10,-3,4,6,col);}
  else if(style==='orb'){const R=p.r+2;pxRect(ctx,-R,-R,R*2,R*2,col);pxRect(ctx,-R+1,-R+1,R*2-2,R*2-2,'#ffffff');pxRect(ctx,-R+3,-R+3,R*2-6,R*2-6,col);}
  else if(style==='blades'){for(let i=-1;i<=1;i++){const oy=i*5,ox=Math.abs(i)*3;pxRect(ctx,-12+ox,oy-2,20,4,col);pxRect(ctx,-6+ox,oy-1,14,2,'#ffffff');}}
  else if(style==='wolf'){pxRect(ctx,-16,-6,20,12,col);pxRect(ctx,4,-4,10,8,col);pxRect(ctx,10,-8,4,4,col);pxRect(ctx,10,4,4,4,col);pxRect(ctx,6,-2,3,2,'#ffffff');pxRect(ctx,6,0,3,2,'#ffffff');}
  else if(style==='bomb'){const R=p.r+3;pxRect(ctx,-R,-R,R*2,R*2,'#1a1a1a');pxRect(ctx,-R+1,-R+1,R*2-2,3,'#4a4a4a');pxRect(ctx,0,-R-3,3,3,'#8a5a20');pxRect(ctx,0,-R-6,4,4,'#ffd040');pxRect(ctx,1,-R-5,2,2,'#ffffff');}
  else if(style==='skull'){pxRect(ctx,-6,-7,12,12,'#e8e0f0');pxRect(ctx,-4,-3,3,3,col);pxRect(ctx,1,-3,3,3,col);pxRect(ctx,-3,-3,2,2,'#ffffff');pxRect(ctx,2,-3,2,2,'#ffffff');pxRect(ctx,-5,5,10,3,'#e8e0f0');}
  else if(style==='sword'){pxRect(ctx,-18,-4,28,8,'#d8e0ff');pxRect(ctx,-14,-2,24,4,col);pxRect(ctx,-14,-1,24,2,'#ffffff');pxRect(ctx,6,-6,10,12,col);pxRect(ctx,8,-3,6,6,'#ffffff');}
  else if(style==='ki'){const R=p.r+2;pxRect(ctx,-R,-R,R*2,R*2,col);pxRect(ctx,-R+1,-R+1,R*2-2,R*2-2,'#fff8c0');pxRect(ctx,-R+3,-R+3,R*2-6,R*2-6,col);pxRect(ctx,-1,-1,2,2,'#ffffff');}
  else if(style==='spear'){pxRect(ctx,-16,-2,26,4,'#3a70a0');pxRect(ctx,-16,-3,26,2,col);pxRect(ctx,10,-6,10,12,col);pxRect(ctx,12,-3,6,6,'#ffffff');}
  else if(style==='nature'){pxRect(ctx,-14,-8,16,16,col);pxRect(ctx,-12,-6,12,12,'#d0ffa0');pxRect(ctx,2,-6,10,12,col);pxRect(ctx,4,-3,6,6,'#ffffff');}
  else if(style==='note'){pxRect(ctx,-8,0,12,8,col);pxRect(ctx,2,-14,2,16,'#3a2010');pxRect(ctx,4,-14,10,4,col);pxRect(ctx,-6,2,8,4,'#ffffff');}
  else if(style==='poison'){const R=p.r+3;pxRect(ctx,-R,-R,R*2,R*2,'#2a8a3a');pxRect(ctx,-R+1,-R+1,R*2-2,R*2-2,'#7dff5b');pxRect(ctx,-R+3,-R+3,R*2-6,R*2-6,'#dfff90');pxRect(ctx,-2,-2,4,4,'#ffffff');}
  else if(style==='ice'){const R=p.r+3;pxRect(ctx,-R,-R,R*2,R*2,'#3060a0');pxRect(ctx,-R+2,-R+2,R*2-4,R*2-4,'#a0e0ff');pxRect(ctx,-R+4,-R+4,R*2-8,R*2-8,'#ffffff');}
  else if(style==='fire'){const R=p.r+3;pxRect(ctx,-R,-R,R*2,R*2,'#8a2000');pxRect(ctx,-R+1,-R+1,R*2-2,R*2-2,'#ff6020');pxRect(ctx,-R+3,-R+3,R*2-6,R*2-6,'#ffa040');pxRect(ctx,-R+5,-R+5,R*2-10,R*2-10,'#ffe080');pxRect(ctx,-2,-2,4,4,'#ffffff');}
  else if(style==='water'){const R=p.r+3;pxRect(ctx,-R,-R,R*2,R*2,'#1060a0');pxRect(ctx,-R+1,-R+1,R*2-2,R*2-2,'#40c0ff');pxRect(ctx,-R+3,-R+3,R*2-6,R*2-6,'#a0e0ff');pxRect(ctx,-1,-2,3,4,'#ffffff');}
  else if(style==='magic'||style==='shadow'){const R=p.r+2;const base=style==='shadow'?'#3a0a5a':'#c080ff';pxRect(ctx,-R,-R,R*2,R*2,base);pxRect(ctx,-R+1,-R+1,R*2-2,R*2-2,col);pxRect(ctx,-R+3,-R+3,R*2-6,R*2-6,'#ffffff');pxRect(ctx,-1,-1,2,2,col);}
  else if(style==='rail'){const R=p.r+3;pxRect(ctx,-R-2,-R,R*2+4,R*2,'#202040');pxRect(ctx,-R,-R+2,R*2,R*2-4,'#40d0ff');pxRect(ctx,-R+2,-R+4,R*2-4,R*2-8,'#ffffff');}
  else if(style==='bat'){pxRect(ctx,-6,-3,12,6,col);pxRect(ctx,-10,-6,4,3,col);pxRect(ctx,6,-6,4,3,col);pxRect(ctx,-10,3,4,3,col);pxRect(ctx,6,3,4,3,col);pxRect(ctx,-2,-1,2,2,'#ff3050');pxRect(ctx,0,-1,2,2,'#ff3050');}
  else{pxRect(ctx,-6,-6,12,12,col);pxRect(ctx,-3,-3,6,6,'#ffffff');}
  ctx.restore();ctx.globalAlpha=1;
}

function drawHPBar(x,y,w,hpPct,elite,boss){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(Math.round(x-w/2),Math.round(y),w,5);ctx.fillStyle='#2a1518';ctx.fillRect(Math.round(x-w/2+1),Math.round(y+1),w-2,3);ctx.fillStyle=boss?'#ff4040':(elite?'#c78bff':'#ff596e');ctx.fillRect(Math.round(x-w/2+1),Math.round(y+1),Math.round((w-2)*hpPct),3);}
function drawStunStars(e){const t=worldTime*4;for(let i=0;i<3;i++){const a=t+i*(Math.PI*2/3),sx=e.x+Math.cos(a)*16,sy=e.y-e.r-22+Math.sin(a)*4;ctx.fillStyle='#ffe060';ctx.fillRect(sx-3,sy-1,6,2);ctx.fillRect(sx-1,sy-3,2,6);}}
function drawSlowTint(e){ctx.save();ctx.globalAlpha=.2;ctx.fillStyle='#80b8ff';ctx.beginPath();ctx.arc(e.x,e.y,e.r+4,0,Math.PI*2);ctx.fill();ctx.restore();}


function drawEnemyPixelOutline(e,pat){
  const r=e.r,ink='#101522';
  if(pat==='humanoid'||pat==='imp'||pat==='winged'||pat==='king'){
    pxRect(ctx,-r*.7,-r*1.08,r*1.4,r,ink);
    pxRect(ctx,-r,-r*.22,r*2,r*.95,ink);
    pxRect(ctx,-r*.78,r*.55,r*.6,r*.5,ink);pxRect(ctx,r*.18,r*.55,r*.6,r*.5,ink);
    pxRect(ctx,-r*1.25,-r*.1,r*.42,r*.85,ink);pxRect(ctx,r*.83,-r*.1,r*.42,r*.85,ink);
  }else if(pat==='golem'||pat==='robot'||pat==='treant'){
    pxRect(ctx,-r*.7,-r*1.18,r*1.4,r*1.05,ink);
    pxRect(ctx,-r*1.02,-r*.48,r*2.04,r*1.08,ink);
    pxRect(ctx,-r*.78,r*.42,r*.58,r*.62,ink);pxRect(ctx,r*.2,r*.42,r*.58,r*.62,ink);
  }else if(pat==='slime'||pat==='mushroom'||pat==='jellyfish'){
    pxRect(ctx,-r-3,-r*.62,r*2+6,r*1.65,ink);
    pxRect(ctx,-r*.72,-r*.92,r*1.44,r*.48,ink);
  }else if(pat==='dragon'||pat==='beast'||pat==='bat'){
    pxRect(ctx,-r*1.32,-r*.76,r*2.35,r*1.55,ink);
    pxRect(ctx,r*.55,-r*1.02,r*.82,r*.9,ink);
  }else if(pat==='bug'){
    pxRect(ctx,-r*.98,-r*.9,r*1.96,r*1.8,ink);
    for(let i=0;i<4;i++){const y=(-3+i*2)*r*.35;pxRect(ctx,-r*1.5,y-2,r*.58,4,ink);pxRect(ctx,r*.92,y-2,r*.58,4,ink);}
  }else{
    pxRect(ctx,-r,-r,r*2,r*1.8,ink);
  }
}

function drawEnemy(e){
const bob=Math.sin(e.phase)*2;const sq=e.squash;const sx=(1-Math.sin(e.phase)*.07)*(1+sq*.45);const sy=(1+Math.sin(e.phase)*.07)*(1-sq*.4);
ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y+bob));
if(e.boss){const lv=e.bossPhase|0;const auraCol=lv===2?'#ff2030':lv===1?'#ff8040':'#ffd060';ctx.save();const pulse=.35+.25*Math.sin(worldTime*3);ctx.globalAlpha=pulse;const r=e.r*2.2;for(let i=0;i<16;i++){const a=i/16*Math.PI*2+worldTime*(lv===2?1.4:lv===1?0.9:0.5);ctx.fillStyle=auraCol;ctx.fillRect(Math.cos(a)*r-3,Math.sin(a)*r-3,6,6);}ctx.globalAlpha=.7;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const r2=e.r*1.6;ctx.fillStyle=auraCol;ctx.fillRect(Math.cos(a)*r2-2,Math.sin(a)*r2*.7-4,4,8);ctx.fillRect(Math.cos(a)*r2-4,Math.sin(a)*r2*.7-2,8,4);}ctx.restore();}
ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,16,e.r,5,0,0,Math.PI*2);ctx.fill();
ctx.scale(sx,sy);
const c=e.hit>0?'#ffffff':e.c,cd=e.cd,pat=e.p;
if(!drawEnemyAtlasSprite(e,pat)){
drawEnemyPixelOutline(e,pat);
if(pat==='slime'){ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,e.r,Math.PI,0);ctx.quadraticCurveTo(e.r,e.r-1,0,e.r);ctx.quadraticCurveTo(-e.r,e.r-1,-e.r,0);ctx.fill();if(e.boss){ctx.fillStyle='#ffd45e';ctx.fillRect(-11,-e.r-11,22,5);}ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(-9,-9,6,6);ctx.fillStyle='#17301b';ctx.fillRect(-8,-2,4,5);ctx.fillRect(4,-2,4,5);}
else if(pat==='bat'){const flap=Math.sin(e.phase*5)*.6;ctx.fillStyle=cd;const ws=22+flap*8;ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(-ws,-8);ctx.lineTo(-ws+6,4);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(ws,-8);ctx.lineTo(ws-6,4);ctx.closePath();ctx.fill();ctx.fillStyle=c;ctx.fillRect(-9,-6,18,12);ctx.fillStyle='#ff3a5a';ctx.fillRect(-6,-3,4,4);ctx.fillRect(2,-3,4,4);}
else if(pat==='beast'){ctx.fillStyle=cd;ctx.fillRect(-11,6,4,10);ctx.fillRect(7,6,4,10);ctx.fillStyle=c;ctx.fillRect(-e.r,-e.r*.6,e.r*2,e.r*1.2);const fd=player.x>e.x?1:-1;ctx.fillRect(fd*e.r*.5,-e.r*.9,e.r*.7,e.r*.7);ctx.fillStyle='#ffe040';ctx.fillRect(fd*e.r*.8,-e.r*.6,3,3);ctx.beginPath();ctx.moveTo(fd*e.r*.5,-e.r*.6);ctx.lineTo(fd*e.r*.65,-e.r*1.1);ctx.lineTo(fd*e.r*.85,-e.r*.6);ctx.closePath();ctx.fill();}
else if(pat==='humanoid'){const v=e.v;ctx.fillStyle=cd;ctx.fillRect(-e.r*.45,e.r*.2,e.r*.35,e.r*.6);ctx.fillRect(e.r*.1,e.r*.2,e.r*.35,e.r*.6);ctx.fillRect(-e.r*.6,-e.r*.15,e.r*1.2,e.r*.8);ctx.fillStyle=c;ctx.fillRect(-e.r*.5,-e.r*.95,e.r,e.r*.85);ctx.fillStyle=cd;ctx.fillRect(-e.r*.55,-e.r*1.05,e.r*1.1,e.r*.3);if(v==='bone'){ctx.fillStyle='#fff';ctx.fillRect(-e.r*.4,-e.r*.8,3,3);ctx.fillRect(e.r*.15,-e.r*.8,3,3);}else{ctx.fillStyle='#ffe040';ctx.fillRect(-e.r*.35,-e.r*.75,3,3);ctx.fillRect(e.r*.15,-e.r*.75,3,3);}
const w=e.w,fd=player.x>e.x?1:-1;ctx.save();ctx.translate(fd*e.r*.7,e.r*.1);ctx.scale(fd,1);if(w==='sword'){ctx.fillStyle='#d8d8e0';ctx.fillRect(-1,-e.r*1.3,3,e.r*.9);}else if(w==='bow'){ctx.strokeStyle='#3a2010';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-e.r*.9);ctx.quadraticCurveTo(e.r*.5,0,0,e.r*.9);ctx.stroke();}else if(w==='axe'){ctx.fillStyle='#4a3020';ctx.fillRect(-1,-e.r*.9,3,e.r*1.2);ctx.fillStyle='#a0a0b0';ctx.fillRect(2,-e.r*.9,e.r*.5,e.r*.6);}else if(w==='spear'||w==='trident'){ctx.fillStyle='#3a2010';ctx.fillRect(-1,-e.r*1.4,3,e.r*1.8);ctx.fillStyle='#c8d8e8';ctx.fillRect(-2,-e.r*1.5,5,e.r*.3);}else if(w==='club'){ctx.fillStyle='#4a3020';ctx.fillRect(-1,-e.r*.5,3,e.r*.9);ctx.fillStyle='#6a5030';ctx.beginPath();ctx.arc(.5,-e.r*.7,e.r*.25,0,Math.PI*2);ctx.fill();}else if(w==='katana'){ctx.fillStyle='#d8d8e0';ctx.fillRect(-1,-e.r*1.4,2,e.r*1.1);}else if(w==='staff'){ctx.fillStyle='#4a3010';ctx.fillRect(-1,-e.r*1.2,3,e.r*1.6);ctx.fillStyle='#a080ff';ctx.beginPath();ctx.arc(.5,-e.r*1.3,e.r*.2,0,Math.PI*2);ctx.fill();}else if(w==='dagger'){ctx.fillStyle='#d8d8e0';ctx.fillRect(-1,-e.r*.7,2,e.r*.5);}ctx.restore();}
else if(pat==='golem'||pat==='robot'){ctx.fillStyle=cd;ctx.fillRect(-e.r*.7,e.r*.3,e.r*.5,e.r*.6);ctx.fillRect(e.r*.2,e.r*.3,e.r*.5,e.r*.6);ctx.fillStyle=c;ctx.fillRect(-e.r*.9,-e.r*.4,e.r*1.8,e.r*.8);ctx.fillStyle=cd;ctx.fillRect(-e.r*1.3,-e.r*.3,e.r*.45,e.r*.7);ctx.fillRect(e.r*.85,-e.r*.3,e.r*.45,e.r*.7);ctx.fillStyle=cd;ctx.fillRect(-e.r*.55,-e.r*1.1,e.r*1.1,e.r*.75);ctx.fillStyle=pat==='robot'?'#80ffff':'#ff6020';ctx.fillRect(-e.r*.35,-e.r*.85,e.r*.25,e.r*.2);ctx.fillRect(e.r*.1,-e.r*.85,e.r*.25,e.r*.2);}
else if(pat==='bug'){const v=e.v;if(v==='crab'){ctx.fillStyle=cd;ctx.fillRect(-e.r*.9,e.r*.3,e.r*.3,e.r*.5);ctx.fillRect(-e.r*.4,e.r*.3,e.r*.3,e.r*.5);ctx.fillRect(e.r*.1,e.r*.3,e.r*.3,e.r*.5);ctx.fillRect(e.r*.6,e.r*.3,e.r*.3,e.r*.5);ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,0,e.r*.9,e.r*.7,0,0,Math.PI*2);ctx.fill();}else{ctx.fillStyle=cd;ctx.strokeStyle=cd;ctx.lineWidth=Math.max(1,e.r*.15);for(let i=0;i<4;i++){const yy=(-3+i*2)*e.r*.35;ctx.beginPath();ctx.moveTo(-e.r*.4,yy);ctx.lineTo(-e.r*1.4,yy-3);ctx.stroke();ctx.beginPath();ctx.moveTo(e.r*.4,yy);ctx.lineTo(e.r*1.4,yy-3);ctx.stroke();}ctx.fillStyle=c;ctx.fillRect(-e.r*.85,-e.r*.85,e.r*1.7,e.r*1.7);ctx.fillStyle='#ff2030';ctx.fillRect(-e.r*.35,-e.r*.2,e.r*.3,e.r*.25);ctx.fillRect(e.r*.05,-e.r*.2,e.r*.3,e.r*.25);}}
else if(pat==='mushroom'){ctx.fillStyle=cd;ctx.fillRect(-e.r*.35,-e.r*.1,e.r*.7,e.r*.9);ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-e.r*.2,e.r*.95,Math.PI,0);ctx.quadraticCurveTo(e.r*.95,e.r*.3,0,e.r*.3);ctx.quadraticCurveTo(-e.r*.95,e.r*.3,-e.r*.95,-e.r*.2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-e.r*.5,-e.r*.55,4,4);ctx.fillRect(e.r*.25,-e.r*.35,4,4);ctx.fillStyle='#101818';ctx.fillRect(-e.r*.25,e.r*.2,3,4);ctx.fillRect(e.r*.05,e.r*.2,3,4);}
else if(pat==='imp'){ctx.fillStyle=cd;ctx.fillRect(-e.r*.5,e.r*.3,e.r*.35,e.r*.5);ctx.fillRect(e.r*.15,e.r*.3,e.r*.35,e.r*.5);ctx.fillStyle=c;ctx.fillRect(-e.r*.55,-e.r*.15,e.r*1.1,e.r*.55);ctx.fillRect(-e.r*.45,-e.r*.85,e.r*.9,e.r*.7);ctx.fillStyle=cd;ctx.fillRect(-e.r*.6,-e.r*1.2,3,6);ctx.fillRect(e.r*.4,-e.r*1.2,3,6);ctx.fillStyle='#ffe040';ctx.fillRect(-e.r*.3,-e.r*.65,3,3);ctx.fillRect(e.r*.1,-e.r*.65,3,3);}
else if(pat==='winged'){const v=e.v;ctx.fillStyle=cd;const ws=e.r*1.5;ctx.beginPath();ctx.moveTo(-e.r*.3,-e.r*.3);ctx.lineTo(-ws,-e.r*.9);ctx.lineTo(-ws*.7,e.r*.2);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(e.r*.3,-e.r*.3);ctx.lineTo(ws,-e.r*.9);ctx.lineTo(ws*.7,e.r*.2);ctx.closePath();ctx.fill();ctx.fillStyle=c;ctx.fillRect(-e.r*.4,-e.r*.4,e.r*.8,e.r*.9);ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-e.r*.7,e.r*.4,0,Math.PI*2);ctx.fill();ctx.fillStyle=(v==='demon'||v==='shadow')?'#ff2020':'#ffe040';ctx.fillRect(-e.r*.2,-e.r*.85,3,3);ctx.fillRect(e.r*.05,-e.r*.85,3,3);}
else if(pat==='treant'){ctx.fillStyle=cd;ctx.fillRect(-e.r*.4,e.r*.3,e.r*.3,e.r*.7);ctx.fillRect(e.r*.1,e.r*.3,e.r*.3,e.r*.7);ctx.fillStyle=c;ctx.fillRect(-e.r*.65,-e.r*.4,e.r*1.3,e.r*.8);ctx.fillStyle=cd;ctx.beginPath();ctx.arc(0,-e.r*.7,e.r*1.1,0,Math.PI*2);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-e.r*.7,e.r*.9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe040';ctx.fillRect(-e.r*.35,-e.r*.5,4,4);ctx.fillRect(e.r*.15,-e.r*.5,4,4);}
else if(pat==='jellyfish'){ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-e.r*.3,e.r*.9,Math.PI,0);ctx.quadraticCurveTo(e.r*.9,e.r*.2,0,e.r*.2);ctx.quadraticCurveTo(-e.r*.9,e.r*.2,-e.r*.9,-e.r*.3);ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=2;for(let i=0;i<5;i++){const px=-e.r*.7+i*e.r*.35;ctx.beginPath();ctx.moveTo(px,e.r*.2);ctx.quadraticCurveTo(px+Math.sin(worldTime*3+i)*5,e.r*.9,px,e.r*1.4);ctx.stroke();}ctx.fillStyle='#fff';ctx.fillRect(-e.r*.3,-e.r*.5,3,3);ctx.fillRect(e.r*.1,-e.r*.5,3,3);}
else if(pat==='worm'){ctx.strokeStyle=c;ctx.lineWidth=e.r*.9;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<8;i++){const x=(i/7-.5)*e.r*2.2,y=Math.sin(e.phase*3+i*.8)*e.r*.25;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.lineCap='butt';const fd=player.x>e.x?1:-1;ctx.fillStyle=c;ctx.beginPath();ctx.arc(fd*e.r*1.1,0,e.r*.7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff2020';ctx.fillRect(fd*e.r*1.2-3,-3,3,3);ctx.fillRect(fd*e.r*1.2+1,-3,3,3);}
else if(pat==='ghost'){ctx.globalAlpha=.75;ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-e.r*.2,e.r*.8,Math.PI,0);ctx.lineTo(e.r*.8,e.r*.6);for(let i=0;i<3;i++){ctx.quadraticCurveTo(e.r*(.6-i*.5),e.r*(.8+Math.sin(worldTime*4+i)*.2),e.r*(.3-i*.5),e.r*.6);}ctx.lineTo(-e.r*.8,e.r*.6);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.fillRect(-e.r*.35,-e.r*.4,3,3);ctx.fillRect(e.r*.15,-e.r*.4,3,3);}
else if(pat==='dragon'){const v=e.v;ctx.fillStyle=cd;ctx.beginPath();ctx.moveTo(-e.r*.3,-e.r*.5);ctx.lineTo(-e.r*1.8,-e.r*1.1);ctx.lineTo(-e.r*1,e.r*.3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(e.r*.3,-e.r*.5);ctx.lineTo(e.r*1.8,-e.r*1.1);ctx.lineTo(e.r*1,e.r*.3);ctx.closePath();ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,0,e.r*1.1,e.r*.7,0,0,Math.PI*2);ctx.fill();const fd=player.x>e.x?1:-1;ctx.beginPath();ctx.ellipse(fd*e.r*.9,-e.r*.3,e.r*.55,e.r*.45,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe040';ctx.fillRect(fd*e.r*.9-3,-e.r*.45,4,4);ctx.strokeStyle=c;ctx.lineWidth=e.r*.3;ctx.beginPath();ctx.moveTo(-e.r*1.1,0);ctx.quadraticCurveTo(-e.r*1.6,e.r*.2,-e.r*1.9,-e.r*.3);ctx.stroke();}
else if(pat==='king'){ctx.fillStyle=cd;ctx.fillRect(-e.r*.7,e.r*.3,e.r*.5,e.r*.6);ctx.fillRect(e.r*.2,e.r*.3,e.r*.5,e.r*.6);ctx.fillStyle=cd;ctx.beginPath();ctx.moveTo(-e.r*.85,-e.r*.4);ctx.lineTo(e.r*.85,-e.r*.4);ctx.lineTo(e.r*.6,e.r*.8);ctx.lineTo(-e.r*.6,e.r*.8);ctx.closePath();ctx.fill();ctx.fillStyle=c;ctx.fillRect(-e.r*.6,-e.r*.4,e.r*1.2,e.r*.75);ctx.fillStyle=c;ctx.fillRect(-e.r*.5,-e.r*.95,e.r,e.r*.65);ctx.fillStyle='#ffd040';ctx.beginPath();ctx.moveTo(-e.r*.55,-e.r*.95);ctx.lineTo(-e.r*.55,-e.r*1.35);ctx.lineTo(-e.r*.25,-e.r*1.1);ctx.lineTo(0,-e.r*1.45);ctx.lineTo(e.r*.25,-e.r*1.1);ctx.lineTo(e.r*.55,-e.r*1.35);ctx.lineTo(e.r*.55,-e.r*.95);ctx.closePath();ctx.fill();ctx.fillStyle='#ff2020';ctx.fillRect(-e.r*.35,-e.r*.8,4,4);ctx.fillRect(e.r*.15,-e.r*.8,4,4);}
else{ctx.fillStyle=c;ctx.fillRect(-e.r,-e.r,e.r*2,e.r*2);}
}
ctx.restore();
if(e.skillType&&!e.boss){ctx.save();const ready=Math.max(0,1-(e.skillCd/Math.max(1,e.skillBaseCd||4)));const rr=e.r+7;ctx.globalAlpha=e.skillFlash>0?.9:.18;ctx.strokeStyle=e.c;ctx.lineWidth=e.skillFlash>0?3:1.5;ctx.beginPath();ctx.arc(e.x,e.y,rr,-Math.PI/2,-Math.PI/2+Math.PI*2*ready);ctx.stroke();ctx.restore();}
const bw=e.boss?Math.max(70,e.r*2.5):40;if(!e.boss)drawHPBar(e.x,e.y-e.r-14,bw,Math.max(0,e.hp/e.maxHp),e.elite,e.boss);
if(e.boss){ctx.fillStyle='#ffd040';ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=2;ctx.strokeText(e.name,e.x,e.y-e.r-22);ctx.fillText(e.name,e.x,e.y-e.r-22);}
if(e.stun>0)drawStunStars(e);if(e.slow>0)drawSlowTint(e);}

function getSummonStyle(ch,type){
  const identity=((ch&&ch.name)||'')+' '+((ch&&ch.sub)||'')+' '+(type||'');
  if(/dragon|drake|wyrm|phoenix/.test(identity.toLowerCase()))return'dragon';
  if(/bird|falcon|eagle|harpy/.test(identity.toLowerCase()))return'avian';
  if(/engineer|robot|mech|tinker|turret/.test(identity.toLowerCase()))return'mechanical';
  if(/druid|forest|tree|treant|nature|grove/.test(identity.toLowerCase()))return'nature';
  if(/priest|paladin|angel|holy|light|sun/.test(identity.toLowerCase()))return'holy';
  if(/demon|hell|devil|infernal/.test(identity.toLowerCase()))return'infernal';
  if(/necromancer|undead|lich|death|skeleton|reaper|dead/.test(identity.toLowerCase()))return'undead';
  if(/mage|wizard|arcane|sorcerer|oracle|illusion/.test(identity.toLowerCase()))return'arcane';
  if(/beast|wolf|tamer|pack|hound/.test(identity.toLowerCase()))return'beast';
  if(type==='turret')return'mechanical';
  if(type==='skeleton')return'undead';
  return'arcane';
}
function summonShade(color,factor){
  if(!/^#[0-9a-f]{6}$/i.test(color||''))return factor<1?'#202536':'#fff0a0';
  const value=parseInt(color.slice(1),16),r=Math.min(255,Math.round(((value>>16)&255)*factor)),g=Math.min(255,Math.round(((value>>8)&255)*factor)),b=Math.min(255,Math.round((value&255)*factor));
  return'#'+[r,g,b].map(part=>part.toString(16).padStart(2,'0')).join('');
}
function drawSummonModel(a,style){
  const c=a.color||'#80d0ff',dark=summonShade(c,.42),light=summonShade(c,1.35),ink='#101522';
  if(style==='dragon'||a.type==='dragon'){
    pxRect(ctx,-21,-4,42,20,ink);pxRect(ctx,-19,-3,38,16,dark);pxRect(ctx,-17,0,30,10,c);pxRect(ctx,10,-13,15,14,ink);pxRect(ctx,12,-11,12,11,c);pxRect(ctx,20,-8,7,5,light);
    pxRect(ctx,-18,-13,16,10,ink);pxRect(ctx,-16,-12,13,8,dark);pxRect(ctx,-14,-10,8,5,c);pxRect(ctx,2,-14,5,6,light);pxRect(ctx,10,-15,5,7,light);
    pxRect(ctx,-15,13,7,8,ink);pxRect(ctx,7,13,7,8,ink);pxRect(ctx,-12,13,4,5,dark);pxRect(ctx,9,13,4,5,dark);pxRect(ctx,-28,1,10,4,dark);pxRect(ctx,-32,-3,6,5,light);
    pxRect(ctx,18,-9,3,3,'#fff0a0');pxRect(ctx,22,-7,2,2,ink);
  }else if(style==='avian'){
    pxRect(ctx,-23,-9,19,13,ink);pxRect(ctx,4,-9,19,13,ink);pxRect(ctx,-21,-7,16,9,dark);pxRect(ctx,6,-7,16,9,dark);
    for(let i=0;i<4;i++){pxRect(ctx,-19+i*4,-8-i%2*3,3,2,light);pxRect(ctx,7+i*4,-8-i%2*3,3,2,light);}
    pxRect(ctx,-12,-4,24,23,ink);pxRect(ctx,-10,-2,20,19,c);pxRect(ctx,-7,1,14,12,light);pxRect(ctx,8,-8,14,12,ink);pxRect(ctx,10,-6,11,9,c);pxRect(ctx,20,-3,8,4,'#ffd060');
    pxRect(ctx,-8,16,5,7,ink);pxRect(ctx,4,16,5,7,ink);pxRect(ctx,20,-7,3,3,'#fff0a0');
  }else if(style==='mechanical'||a.type==='turret'){
    pxRect(ctx,-18,-3,36,25,ink);pxRect(ctx,-15,0,30,18,dark);pxRect(ctx,-12,2,24,12,c);pxRect(ctx,-8,-14,16,14,ink);pxRect(ctx,-6,-12,12,10,'#a0b0c0');pxRect(ctx,-4,-9,8,4,c);pxRect(ctx,-2,-8,4,2,'#fff0a0');
    pxRect(ctx,-23,1,8,15,ink);pxRect(ctx,15,1,8,15,ink);pxRect(ctx,-20,4,5,9,light);pxRect(ctx,15,4,5,9,light);pxRect(ctx,-13,18,9,7,ink);pxRect(ctx,4,18,9,7,ink);
    pxRect(ctx,8,-11,16,4,ink);pxRect(ctx,19,-13,8,8,'#c8d8e8');pxRect(ctx,21,-11,4,4,light);pxRect(ctx,-11,6,4,4,'#ffe080');pxRect(ctx,7,6,4,4,'#ffe080');
  }else if(style==='nature'){
    pxRect(ctx,-17,5,11,19,ink);pxRect(ctx,6,5,11,19,ink);pxRect(ctx,-14,7,8,14,dark);pxRect(ctx,8,7,8,14,dark);
    pxRect(ctx,-20,-9,40,20,ink);pxRect(ctx,-17,-7,34,16,dark);pxRect(ctx,-14,-5,28,12,c);pxRect(ctx,-11,-16,22,13,ink);pxRect(ctx,-9,-14,18,11,'#3a7a3a');pxRect(ctx,-6,-12,12,8,light);
    pxRect(ctx,-4,-4,8,10,'#8a5a30');pxRect(ctx,-2,-2,4,6,'#ffd060');pxRect(ctx,-18,-12,5,5,light);pxRect(ctx,14,-15,5,5,light);pxRect(ctx,-22,1,5,5,'#a0ff80');pxRect(ctx,17,-1,5,5,'#a0ff80');
  }else if(style==='holy'){
    pxRect(ctx,-18,-1,36,22,ink);pxRect(ctx,-15,2,30,16,'#d8e8ff');pxRect(ctx,-11,4,22,11,c);pxRect(ctx,-9,-14,18,15,ink);pxRect(ctx,-7,-12,14,11,'#f0d0a0');
    pxRect(ctx,-22,0,8,17,'#fff0a0');pxRect(ctx,14,0,8,17,'#fff0a0');pxRect(ctx,-4,3,8,12,'#fff0a0');pxRect(ctx,-7,6,14,5,'#fff0a0');
    pxRect(ctx,-12,19,8,5,ink);pxRect(ctx,4,19,8,5,ink);pxRect(ctx,-12,-20,24,3,'#ffd060');pxRect(ctx,-8,-23,16,3,'#fff0a0');pxRect(ctx,-2,-22,4,4,'#fff');
    pxRect(ctx,-5,-7,3,3,'#5080c0');pxRect(ctx,3,-7,3,3,'#5080c0');
  }else if(style==='infernal'){
    pxRect(ctx,-20,-2,40,23,ink);pxRect(ctx,-17,1,34,17,dark);pxRect(ctx,-12,3,24,12,c);pxRect(ctx,-13,-13,26,16,ink);pxRect(ctx,-10,-11,20,12,c);
    pxRect(ctx,-12,-18,5,8,'#d03040');pxRect(ctx,-16,-23,5,8,'#d03040');pxRect(ctx,7,-18,5,8,'#d03040');pxRect(ctx,11,-23,5,8,'#d03040');
    pxRect(ctx,-7,-7,5,4,'#ff4050');pxRect(ctx,3,-7,5,4,'#ff4050');pxRect(ctx,-6,-6,2,2,'#fff0a0');pxRect(ctx,4,-6,2,2,'#fff0a0');
    pxRect(ctx,-12,17,8,7,ink);pxRect(ctx,4,17,8,7,ink);pxRect(ctx,14,10,13,4,dark);pxRect(ctx,24,6,6,5,'#d03040');pxRect(ctx,-3,2,6,6,light);
  }else if(style==='undead'){
    pxRect(ctx,-18,-1,36,24,ink);pxRect(ctx,-15,2,30,18,dark);pxRect(ctx,-11,-15,22,20,ink);pxRect(ctx,-9,-13,18,16,'#d8d0c0');pxRect(ctx,-7,-8,5,6,'#301050');pxRect(ctx,2,-8,5,6,'#301050');
    pxRect(ctx,-5,-7,2,4,c);pxRect(ctx,3,-7,2,4,c);pxRect(ctx,-5,1,10,3,'#8a8070');pxRect(ctx,-3,1,2,3,'#fff');pxRect(ctx,1,1,2,3,'#fff');
    pxRect(ctx,-13,4,26,3,'#e8e0d0');pxRect(ctx,-11,8,22,2,'#e8e0d0');pxRect(ctx,-8,11,16,2,'#e8e0d0');
    pxRect(ctx,15,-20,3,42,ink);pxRect(ctx,12,-24,10,7,c);pxRect(ctx,14,-22,6,3,'#fff0a0');pxRect(ctx,-13,20,9,5,ink);pxRect(ctx,4,20,9,5,ink);
  }else if(style==='beast'){
    pxRect(ctx,-19,-3,39,20,ink);pxRect(ctx,-16,0,32,14,dark);pxRect(ctx,-13,2,25,10,c);pxRect(ctx,-25,2,10,5,ink);pxRect(ctx,-30,-2,8,6,dark);pxRect(ctx,-32,-4,4,4,light);
    pxRect(ctx,7,-13,19,17,ink);pxRect(ctx,10,-11,15,13,c);pxRect(ctx,17,-8,11,8,light);pxRect(ctx,20,-5,9,5,dark);
    pxRect(ctx,9,-15,5,8,dark);pxRect(ctx,18,-15,5,8,dark);pxRect(ctx,11,-14,2,4,light);pxRect(ctx,20,-14,2,4,light);
    pxRect(ctx,-15,13,7,11,ink);pxRect(ctx,-3,13,7,11,ink);pxRect(ctx,10,12,7,12,ink);pxRect(ctx,-12,14,4,7,dark);pxRect(ctx,0,14,4,7,dark);pxRect(ctx,13,13,4,8,dark);
    pxRect(ctx,13,-8,4,3,'#fff0a0');pxRect(ctx,20,-8,4,3,'#fff0a0');pxRect(ctx,15,-7,2,2,ink);pxRect(ctx,22,-7,2,2,ink);
    pxRect(ctx,-8,1,16,3,light);pxRect(ctx,5,-1,5,8,'#ffd060');pxRect(ctx,7,1,3,3,'#fff0a0');
  }else{
    pxRect(ctx,-18,-5,36,28,ink);pxRect(ctx,-15,-2,30,22,dark);pxRect(ctx,-12,-11,24,18,ink);pxRect(ctx,-9,-8,18,14,c);pxRect(ctx,-6,-5,12,9,light);
    pxRect(ctx,-4,-3,3,3,'#fff');pxRect(ctx,3,-3,3,3,'#fff');pxRect(ctx,-3,2,6,3,dark);pxRect(ctx,-12,18,8,6,ink);pxRect(ctx,4,18,8,6,ink);
    pxRect(ctx,-23,-10,5,5,light);pxRect(ctx,18,-16,5,5,'#fff');pxRect(ctx,19,8,5,5,light);
  }
  const pulse=Math.floor((Math.sin(worldTime*5+a.phase)*.5+.5)*3);
  for(let i=0;i<4;i++){const angle=worldTime*1.8+i*Math.PI/2,rad=27+pulse;const x=Math.round(Math.cos(angle)*rad/2)*2,y=Math.round(Math.sin(angle)*rad*.55/2)*2;pxRect(ctx,x-2,y-2,4,4,i%2?light:'#fff0a0');}
}
function drawAlly(a){ctx.save();ctx.translate(Math.round(a.x),Math.round(a.y+a.bob));ctx.fillStyle='rgba(0,0,0,.38)';ctx.fillRect(-18,20,36,4);ctx.fillRect(-13,24,26,2);drawSummonModel(a,a.summonStyle||getSummonStyle(currentChar,a.type));const pct=Math.max(0,a.hp/a.maxHp);pxRect(ctx,-18,-31,36,4,'#101522');pxRect(ctx,-17,-30,34,2,'#45505f');pxRect(ctx,-17,-30,Math.round(34*pct),2,a.color||'#80d0ff');ctx.restore();}
function paletteAccent(theme){return theme==='snow'?'#eefaff':theme==='sky'?'#ffe98c':theme==='tech'?'#38c9dc':theme==='desert'?'#8a9a45':'#75c94d';}
function drawTree(t){
  const x=Math.round(t.x),y=Math.round(t.y),s=t.scale,theme=t.theme,p=t.palette,sway=Math.round(Math.sin(worldTime*.9+t.sway*.1)*1.5*s),cx=x+sway;
  ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(x-17*s,y+3,34*s,5*s);
  if(theme==='bamboo'){for(let i=-1;i<=1;i++){const h=(38+(i+1)*11)*s,tx=x+i*9*s;pxRect(ctx,tx-2*s,y-h,4*s,h,p.leaf);for(let j=1;j<4;j++)pxRect(ctx,tx-3*s,y-h+j*h/4,6*s,2*s,p.shade);pxRect(ctx,tx-12*s,y-h+8*s,12*s,3*s,p.leaf);pxRect(ctx,tx+2*s,y-h+16*s,13*s,3*s,p.leaf);}return;}
  if(theme==='mushroom'){pxRect(ctx,x-4*s,y-22*s,8*s,24*s,'#d9c49b');pxRect(ctx,x-2*s,y-19*s,4*s,18*s,'#f2e0b7');pxRect(ctx,x-22*s,y-35*s,44*s,16*s,'#8c356e');pxRect(ctx,x-18*s,y-42*s,36*s,9*s,'#bf4d91');pxRect(ctx,x-12*s,y-39*s,6*s,4*s,'#ffb7cf');pxRect(ctx,x+5*s,y-31*s,7*s,4*s,'#ffb7cf');return;}
  const dead=theme==='shadow'||theme==='lava';pxRect(ctx,x-5*s,y-28*s,10*s,31*s,dead?p.shade:'#60452e');
  if(dead){pxRect(ctx,x-18*s,y-38*s,5*s,18*s,p.shade);pxRect(ctx,x+13*s,y-42*s,5*s,18*s,p.shade);pxRect(ctx,x-26*s,y-45*s,12*s,5*s,p.leaf);pxRect(ctx,x+9*s,y-49*s,13*s,5*s,p.leaf);pxRect(ctx,x-8*s,y-55*s,17*s,7*s,p.shade);return;}
  pxRect(ctx,cx-28*s,y-45*s,56*s,20*s,p.shade);pxRect(ctx,cx-36*s,y-36*s,72*s,20*s,p.shade);pxRect(ctx,cx-29*s,y-53*s,58*s,21*s,p.leaf);pxRect(ctx,cx-18*s,y-64*s,38*s,17*s,paletteAccent(theme));pxRect(ctx,cx-20*s,y-29*s,42*s,10*s,p.leaf);pxRect(ctx,cx-24*s,y-46*s,14*s,7*s,paletteAccent(theme));pxRect(ctx,cx+9*s,y-38*s,18*s,8*s,paletteAccent(theme));pxRect(ctx,cx-7*s,y-59*s,7*s,5*s,'#d1e88a');
}
function drawRock(r){
  const x=Math.round(r.x),y=Math.round(r.y),s=r.s,p=r.palette,theme=r.theme;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x-s,y+s*.45,s*2,s*.45);
  pxRect(ctx,x-s,y-s*.2,s*2,s*1.1,p.shade);pxRect(ctx,x-s*.75,y-s*.7,s*1.5,s*.6,p.stone);pxRect(ctx,x-s*.4,y-s*.95,s*.8,s*.3,paletteAccent(theme));pxRect(ctx,x-s*.65,y+s*.2,s*.45,s*.2,p.shade);
  if(theme==='lava'){pxRect(ctx,x-s*.1,y-s*.2,2,s*.8,'#ff5a1f');pxRect(ctx,x+s*.25,y+s*.2,s*.45,2,'#ffb32c');}
  else if(theme==='snow')pxRect(ctx,x-s*.25,y-s*.75,s*.5,s*.3,'#fff');
  else if(theme==='water'){pxRect(ctx,x-s*.3,y-s*.2,s*.6,s*.8,'#28b9cb');pxRect(ctx,x-s*.6,y-s*.35,s*.25,s*.35,'#ff7a9a');}
  else if(theme==='tech')pxRect(ctx,x-s*.12,y-s*.4,2,s*.65,'#42e5f2');
}
function drawBiomeSurface(st){
  const theme=st.theme,name=st.mapName.toUpperCase();
  if(theme==='water'){
    ctx.save();
    if(/RIVER|SWAMP/.test(name)){
      ctx.fillStyle='#336044';ctx.fillRect(0,0,WORLD.w,WORLD.h);ctx.beginPath();ctx.moveTo(0,430);ctx.bezierCurveTo(400,330,520,760,930,610);ctx.bezierCurveTo(1200,510,1330,840,1600,740);ctx.strokeStyle='#b7a36b';ctx.lineWidth=250;ctx.stroke();ctx.strokeStyle='#1882a3';ctx.lineWidth=205;ctx.stroke();ctx.strokeStyle='rgba(133,236,232,.5)';ctx.lineWidth=3;ctx.stroke();
      if(/SWAMP/.test(name))for(let i=0;i<7;i++){const x=100+i*225,y=220+(i%3)*310;ctx.fillStyle='rgba(20,86,65,.75)';ctx.beginPath();ctx.ellipse(x,y,70,35,0,0,Math.PI*2);ctx.fill();}
    }else if(/SEA COAST|TURTLE ISLAND/.test(name)){
      ctx.fillStyle='#1688a7';ctx.fillRect(0,0,WORLD.w,WORLD.h);ctx.beginPath();ctx.moveTo(0,870);ctx.bezierCurveTo(360,780,500,930,820,845);ctx.bezierCurveTo(1120,755,1300,920,1600,820);ctx.lineTo(1600,1200);ctx.lineTo(0,1200);ctx.closePath();ctx.fillStyle='#cbb777';ctx.fill();
      if(/TURTLE/.test(name)){ctx.fillStyle='#58914c';ctx.beginPath();ctx.ellipse(820,520,310,220,-.12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#dbc786';ctx.lineWidth=26;ctx.stroke();}
    }else{ctx.fillStyle='#126b96';ctx.fillRect(0,0,WORLD.w,WORLD.h);for(let i=0;i<9;i++){const x=90+i*185,y=140+(i%4)*245;ctx.fillStyle=i%2?'#238aa3':'#196f8c';ctx.beginPath();ctx.ellipse(x,y,44+(i%3)*12,12,0,0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  }else if(theme==='lava'){
    ctx.save();ctx.lineCap='square';for(let i=0;i<4;i++){const x=160+i*420;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+80,230);ctx.lineTo(x-55,430);ctx.lineTo(x+70,660);ctx.lineTo(x-60,930);ctx.lineTo(x+20,1200);ctx.strokeStyle='#8b3423';ctx.lineWidth=74;ctx.stroke();ctx.strokeStyle='#ff5721';ctx.lineWidth=38;ctx.stroke();ctx.strokeStyle='#ffc43b';ctx.lineWidth=5;ctx.stroke();}ctx.restore();
  }else if(theme==='desert'){
    ctx.save();for(let i=0;i<7;i++){const y=110+i*165;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(390,y-105,610,y+105,1020,y-8);ctx.bezierCurveTo(1270,y-72,1440,y+48,1600,y-25);ctx.strokeStyle=i%2?'rgba(255,218,145,.22)':'rgba(120,74,34,.18)';ctx.lineWidth=22;ctx.stroke();}ctx.restore();
  }else if(theme==='snow'){
    ctx.save();for(let i=0;i<18;i++){const x=(i*307)%WORLD.w,y=(i*197+65)%WORLD.h;ctx.fillStyle='rgba(239,250,255,.26)';ctx.fillRect(x,y,94,20);ctx.fillRect(x+14,y-9,52,9);}ctx.restore();
  }else if(theme==='tech'){
    ctx.save();ctx.strokeStyle='rgba(74,205,230,.16)';ctx.lineWidth=2;for(let x=0;x<=WORLD.w;x+=96){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WORLD.h);ctx.stroke();}for(let y=0;y<=WORLD.h;y+=96){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WORLD.w,y);ctx.stroke();}ctx.restore();
  }else if(theme==='sky'){
    ctx.save();for(let i=0;i<8;i++){const x=(i*257+90)%WORLD.w,y=(i*173+80)%WORLD.h;ctx.fillStyle='rgba(238,246,255,.32)';ctx.fillRect(x,y,116,10);ctx.fillRect(x+20,y-10,72,10);ctx.fillRect(x+37,y+10,42,7);}ctx.restore();
  }else if(theme==='ruins'||theme==='rocky'){
    ctx.save();ctx.strokeStyle='rgba(16,23,31,.22)';ctx.lineWidth=3;for(let i=0;i<14;i++){const x=(i*193+80)%WORLD.w,y=(i*271+40)%WORLD.h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+20,y+14);ctx.lineTo(x+14,y+36);ctx.stroke();}ctx.restore();
  }
}
function drawStageTrail(st){
  const scene=st.scene.toLowerCase(),theme=st.theme;
  if(!/entry|path|village|camp|outpost|ruins|fortress|temple|hideout|pass|dunes|sand|castle|keep|palace|city|forest|grove|bamboo/.test(scene))return;
  const width=/pass|dunes|sand/.test(scene)?92:/village|camp|outpost|fortress|temple|castle|keep|palace|city|ruins/.test(scene)?68:52;
  ctx.save();ctx.lineCap='square';ctx.beginPath();ctx.moveTo(800,WORLD.h+120);ctx.bezierCurveTo(760,1080,970,930,810,690);ctx.bezierCurveTo(640,460,900,280,790,-120);ctx.strokeStyle=theme==='snow'?'#d8e6e8':theme==='desert'?'#e4bd79':theme==='ruins'?'#8b785e':'#8a704c';ctx.lineWidth=width+12;ctx.stroke();ctx.strokeStyle=theme==='snow'?'#a9bdc6':theme==='desert'?'#c19b60':theme==='ruins'?'#6f6555':'#6f5b3d';ctx.lineWidth=width;ctx.stroke();
  if(theme==='forest'||theme==='meadow'||theme==='bamboo'){ctx.strokeStyle='rgba(205,186,120,.42)';ctx.lineWidth=3;ctx.stroke();}
  for(let i=0;i<18;i++){const x=(i*173+scene.length*31)%WORLD.w,y=(i*229+stageIndex*37)%WORLD.h;ctx.fillStyle=i%2?'rgba(226,209,151,.28)':'rgba(53,49,37,.22)';ctx.fillRect(x,y,4+(i%3)*2,3);}
  ctx.restore();
}
function drawBiomeTiles(st,sx,sy,ex,ey){
  const textures={
    forest:['#244b2a','#2a542f','#315d33','#28512d'],meadow:['#65963d','#71a646','#79ad4c','#5f913a'],ruins:['#4c4e4c','#555651','#5d5c52','#44494b'],rocky:['#475b6e','#526479','#607281','#415668'],
    shadow:['#211a34','#2a2040','#302344','#1a172b'],mushroom:['#334335','#3d4a36','#4a4e37','#293a32'],water:['#146589','#176f92','#1b7897','#155d85'],snow:['#a7c9df','#b7d7e9','#92b9d7','#c5dce9'],
    lava:['#291d25','#332129','#432224','#201b26'],desert:['#c18b4f','#cc9956','#d4a460','#ba8146'],bamboo:['#32632f','#397035','#407a37','#305d2d'],sky:['#739bbd','#7fa8ca','#88b0ce','#678cb1'],tech:['#1d3854','#224260','#244a6a','#1a304b']
  };
  const theme=st.theme,colors=textures[theme]||textures.forest;
  for(let y=sy;y<ey;y+=32)for(let x=sx;x<ex;x+=32){
    const tx=Math.floor(x/32),ty=Math.floor(y/32);let hash=(Math.imul(tx+1,374761393)^Math.imul(ty+11,668265263)^Math.imul(stageIndex+7,1442695041))>>>0;hash=Math.imul(hash^(hash>>>16),0x7feb352d)>>>0;hash=Math.imul(hash^(hash>>>15),0x846ca68b)>>>0;hash^=hash>>>16;
    if(theme==='forest'||theme==='meadow'||theme==='bamboo'||theme==='mushroom'){
      if((hash>>>4)%3===0){ctx.fillStyle=colors[(hash>>>16)&3];ctx.globalAlpha=.28;ctx.fillRect(x+((hash>>>8)&19),y+((hash>>>13)&19),9+(hash&7),4+(hash&3));ctx.globalAlpha=1;}
      if((hash>>>7)%3===0){ctx.fillStyle=theme==='meadow'?'#d7d765':'#9ccc5c';ctx.globalAlpha=.38;ctx.fillRect(x+5+((hash>>>10)&15),y+6+((hash>>>17)&11),3,3);ctx.globalAlpha=1;}
    }else if(theme==='ruins'||theme==='rocky'){
      if((hash>>>5)%2===0){ctx.fillStyle='rgba(20,22,26,.28)';ctx.fillRect(x+7+((hash>>>12)&11),y+9+((hash>>>17)&9),11,2);ctx.fillRect(x+14+((hash>>>9)&7),y+11,2,7);}
      if((hash>>>8)%3===0){ctx.fillStyle=colors[(hash>>>16)&3];ctx.globalAlpha=.32;ctx.fillRect(x+3,y+4,6,2);ctx.globalAlpha=1;}
    }else if(theme==='water'){
      ctx.fillStyle='rgba(147,236,242,.42)';ctx.fillRect(x+((hash>>>8)&15),y+8+((hash>>>14)&13),10,2);if((hash>>>5)%2===0)ctx.fillRect(x+18,y+23,6,2);
    }else if(theme==='snow'){
      ctx.fillStyle='rgba(255,255,255,.65)';ctx.fillRect(x+((hash>>>8)&23),y+((hash>>>16)&23),3,3);if((hash>>>6)%3===0)ctx.fillRect(x+8,y+18,12,2);
    }else if(theme==='lava'){
      if((hash>>>6)%2===0){ctx.fillStyle='#f05220';ctx.fillRect(x+((hash>>>8)&20),y+((hash>>>14)&19),7,3);ctx.fillStyle='#ffb02e';ctx.fillRect(x+10,y+22,4,2);}
    }else if(theme==='desert'){
      ctx.fillStyle='rgba(255,228,165,.42)';ctx.fillRect(x+((hash>>>9)&19),y+12,9,2);if((hash>>>7)%2===0){ctx.fillStyle='rgba(121,78,43,.2)';ctx.fillRect(x+3,y+25,13,2);}
    }else if(theme==='sky'){
      if((hash>>>7)%4===0){ctx.fillStyle='rgba(238,248,255,.3)';ctx.fillRect(x+5,y+7,18,4);ctx.fillRect(x+10,y+3,9,4);}
    }else if(theme==='tech'){
      ctx.strokeStyle='rgba(78,208,229,.18)';ctx.lineWidth=1;ctx.strokeRect(x+1,y+1,30,30);if((hash>>>6)%4===0){ctx.fillStyle='rgba(60,221,240,.28)';ctx.fillRect(x+8,y+8,4,4);}
    }else if(theme==='shadow'&&(hash>>>8)%4===0){ctx.fillStyle='rgba(154,48,166,.26)';ctx.fillRect(x+8,y+9,4,4);ctx.fillRect(x+12,y+13,3,3);}
  }
}
function drawTerrainBits(){for(const b of terrainBits){const x=Math.round(b.x),y=Math.round(b.y),s=b.s;
  if(b.type==='grass'){pxRect(ctx,x,y-s,s,s*2,b.dark);pxRect(ctx,x-s,y-s*2,s,s*2,b.color);pxRect(ctx,x+s,y-s*1.5,s,s*1.5,b.color);}
  else if(b.type==='flower'){pxRect(ctx,x,y,s,s*2,b.dark);pxRect(ctx,x-s,y-s,s*3,s,b.color);pxRect(ctx,x,y-s*2,s,s,'#fff0a0');}
  else if(b.type==='crystal'){pxRect(ctx,x-s,y,s*3,s*3,b.dark);pxRect(ctx,x,y-s*3,s,s*4,b.color);pxRect(ctx,x+s,y-s*2,s,s*3,b.light);}
  else if(b.type==='mushroom'){pxRect(ctx,x,y,s,s*3,'#ead4a5');pxRect(ctx,x-s*2,y-s,s*5,s*2,b.color);pxRect(ctx,x-s,y-s*2,s*2,s,b.light);}
  else if(b.type==='reed'){pxRect(ctx,x,y-s*5,s,s*5,b.dark);pxRect(ctx,x-s*2,y-s*4,s*2,s*2,b.color);pxRect(ctx,x+s,y-s*5,s*2,s*2,b.color);}
  else if(b.type==='coral'){pxRect(ctx,x-s,y,s*2,s*4,b.dark);pxRect(ctx,x-s*3,y-s*2,s*2,s*2,b.color);pxRect(ctx,x+s,y-s*3,s*2,s*3,b.color);pxRect(ctx,x-s*4,y-s*3,s,s*2,b.light);}
  else if(b.type==='ember'){ctx.fillStyle=b.color;ctx.globalAlpha=.45;ctx.fillRect(x-s,y-s,s*2,s*2);ctx.globalAlpha=1;pxRect(ctx,x,y-s*2,s,s*2,b.light);}
  else if(b.type==='cactus'){pxRect(ctx,x-s,y-s*4,s*2,s*6,b.dark);pxRect(ctx,x-s*3,y-s*2,s*2,s*3,b.color);pxRect(ctx,x+s,y-s*3,s*2,s*3,b.color);pxRect(ctx,x-s,y-s*4,s*2,s,b.light);}
  else if(b.type==='cloud'){pxRect(ctx,x-s*3,y,s*8,s,b.light);pxRect(ctx,x-s*2,y-s,s*3,s,b.light);pxRect(ctx,x+s,y-s*2,s*3,s*2,b.light);}
  else if(b.type==='rubble'){pxRect(ctx,x-s,y,s*3,s*2,b.dark);pxRect(ctx,x,y-s,s*2,s,b.color);pxRect(ctx,x+s*2,y+s,s,s,b.light);}
}}
function drawLandmarks(){
  for(const item of landmarks){
    const {x,y,s,palette:p,type:rawType,theme}=item,type=rawType.toLowerCase(),wall=theme==='tech'?'#526b7b':p.stone,shade=p.shade,accent=paletteAccent(theme);
    ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(x-48*s,y+3,96*s,8*s);
    if(type==='entry'||type==='demongate'||type==='celestialgate'){
      pxRect(ctx,x-42*s,y-56*s,14*s,58*s,shade);pxRect(ctx,x+28*s,y-56*s,14*s,58*s,shade);pxRect(ctx,x-50*s,y-64*s,100*s,16*s,wall);pxRect(ctx,x-25*s,y-48*s,50*s,50*s,'#101a1d');pxRect(ctx,x-18*s,y-42*s,36*s,44*s,p.s2);pxRect(ctx,x-10*s,y-8*s,20*s,10*s,accent);pxRect(ctx,x-5*s,y-30*s,10*s,18*s,accent);
    }else if(/village|city/.test(type)){
      for(let i=-1;i<=1;i++){const hx=x+i*34*s,hh=(i===0?48:36)*s;pxRect(ctx,hx-15*s,y-hh,30*s,hh,wall);ctx.fillStyle=type==='deathcity'?'#352448':'#8e5040';ctx.beginPath();ctx.moveTo(hx-20*s,y-hh);ctx.lineTo(hx,y-hh-18*s);ctx.lineTo(hx+20*s,y-hh);ctx.closePath();ctx.fill();pxRect(ctx,hx-5*s,y-20*s,10*s,20*s,shade);pxRect(ctx,hx-11*s,y-hh+9*s,7*s,8*s,accent);pxRect(ctx,hx+5*s,y-hh+9*s,7*s,8*s,accent);}
    }else if(/camp|outpost|hideout|archerCamp|goblinOutpost|rogueHideout|ninjaHideout/.test(type)){
      pxRect(ctx,x-45*s,y-28*s,90*s,28*s,shade);pxRect(ctx,x-38*s,y-25*s,76*s,24*s,wall);
      for(let i=-1;i<=1;i++){const tx=x+i*28*s;ctx.fillStyle=i===0?'#a44c35':'#8b5938';ctx.beginPath();ctx.moveTo(tx-17*s,y);ctx.lineTo(tx,y-37*s);ctx.lineTo(tx+17*s,y);ctx.closePath();ctx.fill();pxRect(ctx,tx-3*s,y-14*s,6*s,14*s,'#211a1b');}
      pxRect(ctx,x-4*s,y+9*s,8*s,3*s,'#ff9b39');pxRect(ctx,x-2*s,y+5*s,4*s,4*s,'#ffe184');
    }else if(/fortress|castle|keep|palace|throne|temple|tower|sanctum|shrine|gate/.test(type)){
      const h=/tower/.test(type)?82:58,w=/fortress|castle|keep|palace|throne/.test(type)?104:84;
      pxRect(ctx,x-w*s/2-5*s,y-h*s-5*s,w*s+10*s,h*s+5*s,shade);pxRect(ctx,x-w*s/2,y-h*s,w*s,h*s,wall);
      for(const i of [-1,1]){const tx=x+i*w*s*.38;pxRect(ctx,tx-10*s,y-h*s-18*s,20*s,h*s+18*s,p.shade);pxRect(ctx,tx-13*s,y-h*s-23*s,26*s,8*s,wall);pxRect(ctx,tx-3*s,y-h*s-30*s,6*s,9*s,accent);}
      pxRect(ctx,x-12*s,y-35*s,24*s,35*s,p.s2);pxRect(ctx,x-7*s,y-29*s,14*s,29*s,shade);pxRect(ctx,x-4*s,y-h*s+10*s,8*s,8*s,accent);
      if(/temple|shrine/.test(type)){pxRect(ctx,x-50*s,y-8*s,100*s,8*s,accent);pxRect(ctx,x-34*s,y-16*s,68*s,8*s,wall);}
      if(type==='darkthrone'||type==='lightking'||type==='darkking'){pxRect(ctx,x-19*s,y-72*s,38*s,13*s,'#d4ad51');pxRect(ctx,x-4*s,y-88*s,8*s,16*s,'#ffd86a');}
    }else if(/cave|cavern|nest|lair|den|pit|depth|rift/.test(type)){
      pxRect(ctx,x-49*s,y-32*s,98*s,35*s,shade);pxRect(ctx,x-37*s,y-30*s,74*s,31*s,'#111725');pxRect(ctx,x-28*s,y-23*s,56*s,24*s,p.s2);pxRect(ctx,x-14*s,y-14*s,28*s,16*s,'#080d17');
      if(/nest|spider/.test(type)){ctx.strokeStyle='#dfc5e4';ctx.lineWidth=2*s;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x-34*s+i*13*s,y-27*s);ctx.lineTo(x+(i-2.5)*14*s,y-3*s);ctx.stroke();}}
      if(/dragon/.test(type)){pxRect(ctx,x-9*s,y-36*s,18*s,6*s,'#d84e27');pxRect(ctx,x-22*s,y-31*s,10*s,5*s,'#d84e27');pxRect(ctx,x+12*s,y-31*s,10*s,5*s,'#d84e27');}
      if(/hellhound|wolf|beast/.test(type)){pxRect(ctx,x-20*s,y-13*s,8*s,6*s,'#ff7048');pxRect(ctx,x+12*s,y-13*s,8*s,6*s,'#ff7048');}
    }else if(/crystal|ice|frost|snow|mountain|hill|pass|rocky/.test(type)){
      ctx.fillStyle=wall;ctx.beginPath();ctx.moveTo(x-58*s,y);ctx.lineTo(x-25*s,y-52*s);ctx.lineTo(x-6*s,y-28*s);ctx.lineTo(x+20*s,y-74*s);ctx.lineTo(x+61*s,y);ctx.closePath();ctx.fill();
      ctx.fillStyle=theme==='snow'?'#e8f8ff':theme==='lava'?'#a33c28':'#9edcf3';ctx.beginPath();ctx.moveTo(x-25*s,y-52*s);ctx.lineTo(x-6*s,y-28*s);ctx.lineTo(x-20*s,y-31*s);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x+20*s,y-74*s);ctx.lineTo(x+33*s,y-50*s);ctx.lineTo(x+18*s,y-55*s);ctx.closePath();ctx.fill();
      if(/crystal/.test(type)){for(let i=-1;i<=1;i++)pxRect(ctx,x+i*17*s,y-(35+Math.abs(i)*10)*s,8*s,(35+Math.abs(i)*10)*s,accent);}
    }else if(/tree|forest|grove|bamboo|meadow/.test(type)){
      if(/bamboo/.test(type)){for(let i=-2;i<=2;i++){pxRect(ctx,x+i*12*s-3*s,y-86*s,6*s,86*s,p.leaf);for(let k=1;k<5;k++)pxRect(ctx,x+i*12*s-5*s,y-k*17*s,10*s,2*s,accent);}}
      else if(/mushroom/.test(type)){for(let i=-1;i<=1;i++){const mx=x+i*32*s;pxRect(ctx,mx-5*s,y-45*s,10*s,45*s,'#e6d2a3');pxRect(ctx,mx-23*s,y-55*s,46*s,15*s,'#bd4b8d');pxRect(ctx,mx-15*s,y-60*s,30*s,8*s,'#ed75ad');}}
      else{pxRect(ctx,x-10*s,y-45*s,20*s,48*s,'#60452e');pxRect(ctx,x-35*s,y-77*s,70*s,39*s,p.shade);pxRect(ctx,x-28*s,y-91*s,56*s,36*s,p.leaf);pxRect(ctx,x-12*s,y-104*s,25*s,24*s,accent);}
      if(/ancienttree|forestqueen/.test(type)){pxRect(ctx,x-4*s,y-92*s,8*s,92*s,'#8b5b35');pxRect(ctx,x-53*s,y-112*s,106*s,24*s,p.leaf);pxRect(ctx,x-34*s,y-135*s,68*s,24*s,accent);}
    }else if(/sea|lake|river|swamp|reef|island|coral|jellyfish|hydra/.test(type)){
      pxRect(ctx,x-51*s,y-16*s,102*s,18*s,'#bdad72');pxRect(ctx,x-42*s,y-28*s,84*s,15*s,'#25899d');pxRect(ctx,x-31*s,y-21*s,62*s,4*s,'#a0ffff');
      if(/island|turtle/.test(type)){pxRect(ctx,x-30*s,y-48*s,60*s,23*s,'#548d49');pxRect(ctx,x-23*s,y-54*s,46*s,12*s,'#7bad53');for(let i=-2;i<=2;i++)pxRect(ctx,x+i*13*s,y+2*s,6*s,24*s,p.stone);}
      if(/coral|jellyfish/.test(type)){for(let i=-1;i<=1;i++){pxRect(ctx,x+i*22*s-3*s,y-64*s,6*s,42*s,i===0?'#e65d91':'#3fb9b5');pxRect(ctx,x+i*22*s-15*s,y-50*s,14*s,5*s,'#e65d91');}}
      if(/hydra|kraken|leviathan/.test(type)){ctx.strokeStyle=accent;ctx.lineWidth=8*s;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+(i-2)*15*s,y);ctx.quadraticCurveTo(x+(i-2)*30*s,y-45*s,x+(i-2)*24*s,y-78*s);ctx.stroke();}}
    }else if(/grave|tomb|necromancer|death|wraith/.test(type)){
      pxRect(ctx,x-42*s,y-20*s,84*s,23*s,shade);pxRect(ctx,x-32*s,y-38*s,64*s,19*s,wall);pxRect(ctx,x-18*s,y-62*s,36*s,27*s,p.shade);pxRect(ctx,x-7*s,y-53*s,14*s,18*s,accent);pxRect(ctx,x-55*s,y-6*s,14*s,22*s,wall);pxRect(ctx,x+41*s,y-6*s,14*s,22*s,wall);
    }else if(/factory|robot|drone|alien|mecha|lab|chrono/.test(type)){
      pxRect(ctx,x-52*s,y-44*s,104*s,46*s,shade);pxRect(ctx,x-45*s,y-37*s,90*s,38*s,wall);pxRect(ctx,x-30*s,y-59*s,18*s,23*s,p.shade);pxRect(ctx,x+10*s,y-68*s,14*s,31*s,p.shade);pxRect(ctx,x-18*s,y-23*s,36*s,24*s,'#182f47');pxRect(ctx,x-10*s,y-18*s,20*s,7*s,accent);
      for(let i=-2;i<=2;i++)pxRect(ctx,x+i*18*s,y-4*s,8*s,12*s,theme==='tech'?accent:wall);
    }else if(/sky|floating|cloud|harpy|storm|thunder|zeus/.test(type)){
      pxRect(ctx,x-48*s,y-25*s,96*s,15*s,'#d9e7ef');pxRect(ctx,x-30*s,y-39*s,60*s,15*s,'#eff7fa');pxRect(ctx,x-22*s,y-10*s,44*s,7*s,wall);
      if(/floating|island/.test(type)){ctx.fillStyle=p.stone;ctx.beginPath();ctx.moveTo(x-38*s,y-5*s);ctx.lineTo(x+38*s,y-5*s);ctx.lineTo(x+21*s,y+32*s);ctx.lineTo(x,y+48*s);ctx.lineTo(x-23*s,y+23*s);ctx.closePath();ctx.fill();}
      if(/storm|thunder|zeus/.test(type)){ctx.fillStyle='#ffe46a';ctx.beginPath();ctx.moveTo(x+12*s,y-67*s);ctx.lineTo(x-2*s,y-39*s);ctx.lineTo(x+9*s,y-39*s);ctx.lineTo(x-10*s,y-10*s);ctx.lineTo(x+3*s,y-34*s);ctx.lineTo(x-6*s,y-34*s);ctx.closePath();ctx.fill();}
    }else if(/volcano|lava|fire|demon|eclipse|void|shadow|dark/.test(type)){
      ctx.fillStyle=shade;ctx.beginPath();ctx.moveTo(x-53*s,y);ctx.lineTo(x-29*s,y-37*s);ctx.lineTo(x-7*s,y-26*s);ctx.lineTo(x+8*s,y-66*s);ctx.lineTo(x+28*s,y-31*s);ctx.lineTo(x+52*s,y);ctx.closePath();ctx.fill();pxRect(ctx,x-10*s,y-59*s,20*s,6*s,'#f45623');pxRect(ctx,x-4*s,y-53*s,8*s,17*s,'#ff9b2f');
      if(/rift|void|eclipse/.test(type)){ctx.strokeStyle=accent;ctx.lineWidth=4*s;ctx.beginPath();ctx.ellipse(x,y-35*s,27*s,39*s,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#12091d';ctx.beginPath();ctx.ellipse(x,y-35*s,19*s,31*s,0,0,Math.PI*2);ctx.fill();}
    }else{
      pxRect(ctx,x-43*s,y-29*s,86*s,31*s,shade);pxRect(ctx,x-34*s,y-24*s,68*s,25*s,wall);pxRect(ctx,x-9*s,y-21*s,18*s,22*s,p.s2);pxRect(ctx,x-4*s,y-15*s,8*s,15*s,accent);
    }
  }
}
function drawSlashArc(s){const alpha=s.life/s.maxLife,outerR=s.range*.9,segments=Math.max(8,Math.ceil(outerR*s.arc/5));ctx.save();ctx.translate(Math.round(s.x),Math.round(s.y));ctx.rotate(s.angle);for(let i=0;i<=segments;i++){const angle=-s.arc+(i/segments)*s.arc*2;const x=Math.round(Math.cos(angle)*outerR/2)*2,y=Math.round(Math.sin(angle)*outerR/2)*2;ctx.globalAlpha=alpha*.82;pxRect(ctx,x-4,y-3,8,6,s.color);if(i%2===0){ctx.globalAlpha=alpha;pxRect(ctx,x-2,y-1,4,2,'#ffffff');}}ctx.restore();ctx.globalAlpha=1;}
function drawRainArrow(a){if(a.delay>0)return;ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.PI/2);pxRect(ctx,-10,-1,18,2,'#6a4a20');ctx.fillStyle=a.color||'#2ee8d1';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(4,-3);ctx.lineTo(4,3);ctx.closePath();ctx.fill();ctx.fillRect(-12,-3,4,6);ctx.restore();ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle=a.color||'#2ec96a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.targetX,a.targetY,22,0,Math.PI*2);ctx.stroke();ctx.restore();}
function drawMeteor(m){if(m.delay>0)return;ctx.save();ctx.globalAlpha=.5;ctx.strokeStyle=m.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(m.targetX,m.targetY,m.R*(.7+.3*Math.sin(worldTime*8)),0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;pxRect(ctx,m.x-14,m.currentY-14,28,28,m.color);pxRect(ctx,m.x-8,m.currentY-8,16,16,'#ffd36a');pxRect(ctx,m.x-3,m.currentY-3,6,6,'#ffffff');ctx.restore();}
function drawAimLine(){if(!currentChar||!currentChar.ranged||!running||dying||!settings.showAimLine)return;if(!currentAimTarget||!currentChar.autoAim||!currentChar.autoAim.aimLine)return;const t=currentAimTarget;if(t.hp<=0)return;const cx=player.x,cy=player.y-4;ctx.save();ctx.globalAlpha=.45;ctx.strokeStyle=currentChar.color;ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.lineDashOffset=-worldTime*30;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.setLineDash([]);const pulse=1+Math.sin(worldTime*8)*.15;ctx.globalAlpha=.8;ctx.strokeStyle=currentChar.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,(t.r+8)*pulse,0,Math.PI*2);ctx.stroke();ctx.restore();}
function drawPlayer(){const alpha=(player.inv>0&&!dying)?.55:1;let stealthAlpha=1;if(player.invisible>0)stealthAlpha=.35+Math.sin(worldTime*10)*.15;ctx.save();ctx.translate(Math.round(player.x),Math.round(player.y+player.bob));ctx.globalAlpha=alpha*stealthAlpha;if(player.defendTimer>0){ctx.save();ctx.globalAlpha=alpha*.5;ctx.strokeStyle='#80b8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,4,30,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(80,150,255,.15)';ctx.fill();ctx.restore();}if(player.buffTimer>0){ctx.save();ctx.globalAlpha=alpha*.55;ctx.strokeStyle=player.buffColor||'#ffd36a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,4,24,0,Math.PI*2);ctx.stroke();ctx.restore();}drawHero(ctx,currentChar,player.dirX>=0?1:-1,player.attackAnim,{walkT:player.walkT,walking:player.manualMove,dashing:player.isDashing});ctx.restore();ctx.globalAlpha=1;}

const SKILL_VFX=[];
function addVfx(opts){const v=Object.assign({type:'ring',x:player.x,y:player.y,color:(currentChar&&currentChar.colorLight)||'#9ff',color2:'#ffffff',life:.6,maxLife:.6,age:0,r:120,r0:0,angle:0,len:220,width:32,rot:0,rotSpeed:0,cnt:6,delay:0,follow:false,seed:Math.random()*1000},opts);v.maxLife=v.life;SKILL_VFX.push(v);return v;}
function vfxForCharacter(ch,skill,isUlt){
  if(!ch)return;
  const arch=getArchetype(ch),color=skill.color||ch.colorLight||ch.color;
  const r=isUlt?132:72,life=isUlt?.72:.46;
  if(arch==='angel'||arch==='paladin'||arch==='royal'){
    addVfx({type:'rune',x:player.x,y:player.y,color,r:r*.72,life,rotSpeed:isUlt?1.5:1});
    addVfx({type:'star',x:player.x,y:player.y,color:'#ffe8a0',r:r*.86,life:life*.8,cnt:isUlt?12:8});
  }else if(arch==='undead'||arch==='ghost'||arch==='ninja'||arch==='demon'){
    addVfx({type:'rift',x:player.x,y:player.y,color,r:r*.78,life,rotSpeed:arch==='ninja'?5:2.5});
    addVfx({type:'drain',x:player.x,y:player.y,color,r:r*.62,life:life*.9,rotSpeed:arch==='undead'?4:-3});
  }else if(arch==='robot'||arch==='golem'){
    addVfx({type:'shieldHex',x:player.x,y:player.y,color,r:r*.7,life,rotSpeed:.8});
    addVfx({type:'ringBurst',x:player.x,y:player.y,color,r:r*.9,life:life*.85,cnt:isUlt?14:8});
  }else if(arch==='ranger'||arch==='beastmaster'||arch==='wolfrider'){
    addVfx({type:'rainStreak',x:player.x,y:player.y,color,r:r*.9,life,cnt:isUlt?12:7});
    addVfx({type:'sparkCol',x:player.x,y:player.y,color,r:r*.55,life:life*.8,cnt:6});
  }else if(arch==='summoner'||arch==='dragonrider'||arch==='phoenix'){
    addVfx({type:'summonPulse',x:player.x,y:player.y,color,r:r*.8,life});
    addVfx({type:'ringBurst',x:player.x,y:player.y,color,r:r*.85,life:life*.8,cnt:isUlt?14:8});
  }else if(arch==='mage'||arch==='icequeen'){
    addVfx({type:'rune',x:player.x,y:player.y,color,r:r*.72,life,rotSpeed:isUlt?2.4:1.5});
    addVfx({type:'star',x:player.x,y:player.y,color,r:r*.9,life:life*.8,cnt:isUlt?12:7});
  }else{
    const a=Math.atan2(player.dirY,player.dirX);
    addVfx({type:'slashStreaks',x:player.x,y:player.y,angle:a,color,r:r*.9,life:life*.75,cnt:isUlt?7:4});
    addVfx({type:'ringBurst',x:player.x,y:player.y,color,r:r*.72,life:life*.8,cnt:isUlt?12:7});
  }
}
function vfxForSkill(skill,isUlt){
  if(!skill)return;
  const m=skill.mech||skill.type;
  const col=skill.color||(currentChar.colorLight)||(currentChar.color);
  const col2='#ffffff';
  const x=player.x,y=player.y;
  const a=Math.atan2(player.dirY,player.dirX);
  addVfx({type:'summonPulse',x,y,color:col,r:90,life:.65});
  if(isUlt){
    screenFlash(.35);addShake(.6);
    addVfx({type:'shockwave',x,y,color:col,r:380,life:1.1});
    addVfx({type:'shockwave',x,y,color:col2,r:300,life:.85,delay:.08});
    addVfx({type:'rune',x,y,color:col,color2:'#fff',r:170,life:1.6,rotSpeed:3});
    addVfx({type:'rune',x,y,color:col2,r:130,life:1.4,rotSpeed:-2,delay:.1});
    addVfx({type:'star',x,y,color:col,r:240,life:1.0,cnt:20});
    addVfx({type:'ringBurst',x,y,color:col,r:230,life:.9,cnt:20});
    addVfx({type:'beam',x,y,angle:a,color:col,color2:col2,len:0,width:0,life:.5,vertical:true});
  }
  switch(m){
    case'cone':case'freezeCone':case'coneWind':case'groundLine':case'fireTrail':case'lineSlash':
      addVfx({type:'cone',x,y,angle:a,color:col,color2:'#fff',r:210,life:.45,width:1.15});
      addVfx({type:'cone',x,y,angle:a,color:col2,r:140,life:.28,width:.85,delay:.05});
      addVfx({type:'slashStreaks',x,y,angle:a,color:col,r:190,life:.4,cnt:5});
      break;
    case'nova':case'shockwave':case'burst':case'blizzard':case'epidemic':case'tidal':
      addVfx({type:'shockwave',x,y,color:col,r:290,life:.8});
      addVfx({type:'shockwave',x,y,color:col2,r:210,life:.6,delay:.1});
      addVfx({type:'star',x,y,color:col,r:150,life:.6,cnt:14});
      addVfx({type:'ringBurst',x,y,color:col,r:170,life:.7,cnt:16});
      break;
    case'beam':case'rail':case'pierce':case'multiPierce':case'pierceFire':
      addVfx({type:'beam',x,y,angle:a,color:col,color2:'#fff',len:680,width:46,life:.55});
      addVfx({type:'beam',x,y,angle:a,color:'#fff',color2:col,len:680,width:14,life:.5});
      addVfx({type:'flash',x:x+Math.cos(a)*300,y:y+Math.sin(a)*300,color:col,r:180,life:.4});
      break;
    case'blink':case'teleport':case'rift':case'portalStep':case'decoyTeleport':
      addVfx({type:'rift',x,y,color:col,r:120,life:.65,rotSpeed:5});
      addVfx({type:'rift',x:x+Math.cos(a)*160,y:y+Math.sin(a)*160,color:col2,r:100,life:.55,rotSpeed:-4});
      break;
    case'shield':case'fortify':case'curseShield':case'golemGuard':case'counter':
      addVfx({type:'shield',x,y,color:col,color2:'#fff',r:68,life:1.2,follow:true});
      addVfx({type:'shieldHex',x,y,color:col2,r:60,life:1.0,follow:true,delay:.1});
      break;
    case'rage':case'transform':case'buff':case'duelBuff':case'overdrive':case'lifestealForm':case'wolfForm':case'mutation':case'hunterBuff':case'focus':case'pirateBuff':case'scout':case'predict':
      addVfx({type:'aura',x,y,color:col,color2:col2,r:90,life:1.3,follow:true,rotSpeed:2.5});
      addVfx({type:'sparkCol',x,y,color:col,r:60,life:1.0,cnt:8,follow:true});
      break;
    case'drain':case'soulHarvest':case'bloodShot':
      addVfx({type:'drain',x,y,color:col,r:260,life:1.0,rotSpeed:4});
      addVfx({type:'vortex',x,y,color:col,r:220,life:.9,rotSpeed:-6});
      break;
    case'summon':case'turret':case'summonTitan':case'dragonSummon':case'demonLegion':case'pack':case'fairyStorm':case'snakeQueen':
      addVfx({type:'rune',x,y,color:col,color2:'#fff',r:140,life:1.4,rotSpeed:2});
      addVfx({type:'ringBurst',x,y,color:col,r:130,life:1.0,cnt:14});
      break;
    case'gravity':case'blackhole':case'vortex':case'pull':case'minePull':
      addVfx({type:'vortex',x,y,color:col,r:320,life:1.1,rotSpeed:6});
      addVfx({type:'vortex',x,y,color:col2,r:220,life:.9,rotSpeed:-4,delay:.08});
      break;
    case'combo':case'comboCone':case'spiral':case'orbit':
      addVfx({type:'spiral',x,y,color:col,r:220,life:.9,cnt:10,rotSpeed:6});
      addVfx({type:'slashStreaks',x,y,angle:a,color:col,r:180,life:.5,cnt:6});
      break;
    case'mine':case'trap':case'rootShot':case'coilTrap':case'root':
      addVfx({type:'rune',x:x+Math.cos(a)*90,y:y+Math.sin(a)*90,color:col,r:75,life:1.3,rotSpeed:-4});
      addVfx({type:'ringBurst',x:x+Math.cos(a)*90,y:y+Math.sin(a)*90,color:col2,r:70,life:.9,cnt:10});
      break;
    case'healZone':case'healNova':case'regen':case'grove':case'worldTree':
      addVfx({type:'heal',x,y,color:'#7dff9b',r:230,life:1.1});
      addVfx({type:'ring',x,y,color:'#a8ffb0',r:200,life:.9,r0:20});
      addVfx({type:'sparkCol',x,y,color:'#c8ffc8',r:60,life:1.0,cnt:10});
      break;
    case'dashImpact':case'charge':case'pierceDash':case'shieldDash':case'dragonDash':case'dive':case'skyDive':case'falconDive':
      addVfx({type:'dashTrail',x,y,angle:a,color:col,len:280,life:.5});
      addVfx({type:'dashTrail',x,y,angle:a,color:col2,len:180,life:.35,delay:.05});
      break;
    case'freeze':case'freezeField':case'timeFreeze':case'timeSlow':case'timeBurst':case'rewind':
      addVfx({type:'ring',x,y,color:'#a0e0ff',r:250,life:.8,r0:10});
      addVfx({type:'flash',x,y,color:'#e0f4ff',r:210,life:.5});
      addVfx({type:'clock',x,y,color:'#a0e0ff',r:160,life:1.0});
      break;
    case'mark':case'alphaMark':case'weakpoint':case'timerMark':case'soulBrand':case'link':
      addVfx({type:'rune',x,y,color:'#ff8cff',r:95,life:1.0,rotSpeed:4});
      addVfx({type:'rune',x,y,color:'#ffffff',r:65,life:.8,rotSpeed:-3,delay:.1});
      break;
    case'execute':case'sniper':case'decree':
      addVfx({type:'flash',x,y,color:'#ff4060',r:210,life:.5});
      addVfx({type:'star',x,y,color:col,r:200,life:.7,cnt:16});
      break;
    case'meteor':case'sunfire':case'astralMeteor':case'rain':case'lightningRain':case'airRain':case'rainLine':case'dragonRain':case'archerRain':case'railStorm':case'soulStorm':case'mirrorStorm':case'storm':
      addVfx({type:'flash',x,y,color:col,r:250,life:.4});
      addVfx({type:'rainStreak',x,y,color:col,r:260,life:.7,cnt:16});
      break;
    default:
      addVfx({type:'ring',x,y,color:col,r:200,life:.6,r0:10});
      addVfx({type:'star',x,y,color:col,r:130,life:.55,cnt:10});
  }
  vfxForCharacter(currentChar,skill,isUlt);
}
function updateSkillVfx(dt){for(let i=SKILL_VFX.length-1;i>=0;i--){const v=SKILL_VFX[i];if(v.delay>0){v.delay-=dt;continue;}v.age+=dt;v.life-=dt;if(v.follow){v.x=player.x;v.y=player.y;}v.rot+=v.rotSpeed*dt;if(v.life<=0)SKILL_VFX.splice(i,1);}if(SKILL_BANNER.life>0)SKILL_BANNER.life-=dt;}
function drawSkillVfx(){
  if(SKILL_VFX.length===0)return;
  ctx.save();
  for(const v of SKILL_VFX){
    if(v.delay>0)continue;
    const t=1-v.life/v.maxLife,a=Math.max(0,v.life/v.maxLife);
    ctx.save();ctx.translate(v.x,v.y);
    const pixelR=Math.max(24,Math.min(v.r||v.len||v.width||48,260))*(.55+t*.35);
    ctx.globalAlpha=a*.72;
    for(let i=0;i<8;i++){
      const ang=i*Math.PI/4+v.rot+t*1.8;
      const size=i%2?4:7;
      const px=Math.round(Math.cos(ang)*pixelR/4)*4;
      const py=Math.round(Math.sin(ang)*pixelR/4)*4;
      ctx.fillStyle=i%3===0?'#fff':v.color;
      ctx.fillRect(px-size/2,py-size/2,size,size);
    }
    if(v.type==='summonPulse'){
      const r=v.r*(0.3+t*0.7);ctx.globalAlpha=a*.5;
      ctx.strokeStyle=v.color;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<8;i++){
        const ang=i*Math.PI/4+t*4;const rx=Math.cos(ang)*r,ry=Math.sin(ang)*r;
        ctx.fillStyle=i%2?v.color:'#fff';
        ctx.fillRect(rx-2,ry-2,4,4);
      }
    }
    else if(v.type==='ring'||v.type==='shockwave'){
      const r=v.r0+(v.r-v.r0)*t;
      ctx.globalAlpha=a*.9;ctx.strokeStyle=v.color;ctx.lineWidth=Math.max(3,6*a);
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=a*.55;ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,3*a);
      ctx.beginPath();ctx.arc(0,0,r*.75,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=a*.85;
      const N=Math.max(10,Math.floor(r/10));
      for(let i=0;i<N;i++){const ang=(i/N)*Math.PI*2+t*4;
        ctx.fillStyle=i%3===0?'#fff':v.color;
        ctx.fillRect(Math.cos(ang)*r-2.5,Math.sin(ang)*r-2.5,5,5);}
      if(v.type==='shockwave'){
        ctx.globalAlpha=a*.45;ctx.strokeStyle=v.color;ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(0,0,r*1.15,0,Math.PI*2);ctx.stroke();
      }
    }
    else if(v.type==='star'){
      const r=v.r*(0.3+t*0.7);
      ctx.globalAlpha=a*.95;ctx.strokeStyle=v.color;ctx.lineWidth=3;
      for(let i=0;i<v.cnt;i++){
        const ang=(i/v.cnt)*Math.PI*2+v.rot;
        const inner=r*.35;
        ctx.beginPath();ctx.moveTo(Math.cos(ang)*inner,Math.sin(ang)*inner);
        ctx.lineTo(Math.cos(ang)*r,Math.sin(ang)*r);ctx.stroke();
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(Math.cos(ang)*r-3,Math.sin(ang)*r-3,6,6);
      }
      ctx.globalAlpha=a;
      ctx.fillStyle='#fff';ctx.fillRect(-5,-5,10,10);
      ctx.fillStyle=v.color;ctx.fillRect(-3,-3,6,6);
    }
    else if(v.type==='ringBurst'){
      ctx.globalAlpha=a;
      for(let i=0;i<v.cnt;i++){
        const ang=(i/v.cnt)*Math.PI*2+v.rot;
        const r=v.r*t;
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(Math.cos(ang)*r-3,Math.sin(ang)*r-3,6,6);
      }
    }
    else if(v.type==='beam'){
      ctx.globalAlpha=Math.min(1,a*1.6);ctx.rotate(v.angle);
      const w=v.width*(1+(1-t)*.35);
      ctx.fillStyle=v.color;ctx.fillRect(0,-w,v.len,w*2);
      ctx.fillStyle='#fff';ctx.fillRect(0,-w*.35,v.len,w*.7);
      ctx.globalAlpha=a*.9;ctx.fillStyle=v.color2||'#fff';
      const scanY=((worldTime*400)%(v.len));
      ctx.fillRect(scanY-30,-w,60,w*2);
    }
    else if(v.type==='flash'){
      const r=v.r*(0.5+t*0.8);ctx.globalAlpha=a*.85;
      for(let k=0;k<8;k++){
        const ang=k*Math.PI/4;
        ctx.save();ctx.rotate(ang);
        ctx.fillStyle=v.color;ctx.fillRect(0,-r*0.15,r,r*0.3);
        ctx.fillStyle='#fff';ctx.fillRect(0,-r*0.05,r,r*0.1);
        ctx.restore();
      }
      ctx.fillStyle=v.color;ctx.fillRect(-r*0.35,-r*0.35,r*0.7,r*0.7);
      ctx.fillStyle='#fff';ctx.fillRect(-r*0.18,-r*0.18,r*0.36,r*0.36);
    }
    else if(v.type==='rift'){
      ctx.globalAlpha=a;ctx.rotate(v.rot);const r=v.r*(0.3+t*0.95);
      ctx.fillStyle='#000';ctx.beginPath();ctx.arc(0,0,r*0.7,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=v.color;ctx.lineWidth=3;
      for(let i=0;i<8;i++){const ang=(i/8)*Math.PI*2;ctx.beginPath();ctx.arc(0,0,r*(0.4+i*0.08),ang,ang+2);ctx.stroke();}
      ctx.fillStyle=v.color;
      for(let i=0;i<6;i++){const ang=i*Math.PI/3+worldTime*4;
        ctx.fillRect(Math.cos(ang)*r-2,Math.sin(ang)*r-2,4,4);}
    }
    else if(v.type==='shield'){
      ctx.globalAlpha=a*.85;const r=v.r*(1+(1-a)*.15);
      ctx.fillStyle=v.color;ctx.beginPath();
      for(let i=0;i<6;i++){const ang=(i/6)*Math.PI*2-Math.PI/2+v.rot*.3;
        const x=Math.cos(ang)*r,y=Math.sin(ang)*r;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      ctx.closePath();ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      for(let i=0;i<6;i++){const ang=(i/6)*Math.PI*2+v.rot*.3;
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(Math.cos(ang)*r-2,Math.sin(ang)*r-2,4,4);}
    }
    else if(v.type==='shieldHex'){
      ctx.globalAlpha=a*.7;const r=v.r*(1+(1-a)*.2);
      ctx.strokeStyle=v.color;ctx.lineWidth=2;
      for(let i=0;i<6;i++){
        const x=Math.cos(i/6*Math.PI*2)*r;
        const y=Math.sin(i/6*Math.PI*2)*r;
        ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.stroke();
      }
    }
    else if(v.type==='aura'){
      const r=v.r*(0.9+0.1*Math.sin(worldTime*6));ctx.rotate(v.rot);
      ctx.globalAlpha=a*.85;
      for(let i=0;i<4;i++){
        const rr=r*(0.5+i*0.2);
        ctx.strokeStyle=i===0?'#fff':v.color;
        ctx.lineWidth=3-i*.4;
        ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
      }
      for(let i=0;i<10;i++){
        const ang=i*.628+worldTime*2;
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(Math.cos(ang)*r-2.5,Math.sin(ang)*r-2.5,5,5);
      }
    }
    else if(v.type==='drain'){
      ctx.rotate(v.rot);
      for(let i=0;i<28;i++){
        const ang=(i/28)*Math.PI*2+v.rot;
        const rr=v.r*(0.3+((i*3)%10)/10*0.7)*(1-t*0.55);
        ctx.globalAlpha=a*.95;
        ctx.fillStyle=i%3===0?'#fff':v.color;
        ctx.fillRect(Math.cos(ang)*rr-2.5,Math.sin(ang)*rr-2.5,5,5);
      }
      ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.fillRect(-4,-4,8,8);
    }
    else if(v.type==='rune'){
      ctx.rotate(v.rot);const r=v.r*(0.6+t*0.5);
      ctx.globalAlpha=a;ctx.strokeStyle=v.color;ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(0,0,r*0.75,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(0,0,r*0.4,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<12;i++){
        const ang=(i/12)*Math.PI*2;
        const x=Math.cos(ang)*r*0.88,y=Math.sin(ang)*r*0.88;
        ctx.save();ctx.translate(x,y);ctx.rotate(ang+Math.PI/2+v.rot);
        ctx.fillStyle=v.color2||'#fff';
        ctx.fillRect(-3,-7,6,14);
        ctx.fillRect(-7,-3,14,6);
        ctx.restore();
      }
    }
    else if(v.type==='vortex'){
      ctx.rotate(v.rot);
      for(let i=0;i<6;i++){
        const off=i*0.7+worldTime*1.2;
        ctx.globalAlpha=a*.9;
        ctx.strokeStyle=i%2===0?v.color:'#fff';
        ctx.lineWidth=3-i*.3;
        ctx.beginPath();
        for(let s=0;s<=30;s++){
          const st=s/30;const ang=off+st*5;
          const rr=v.r*st*(1-t*0.25);
          const x=Math.cos(ang)*rr,y=Math.sin(ang)*rr;
          if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    }
    else if(v.type==='spiral'){
      for(let i=0;i<v.cnt;i++){
        const baseAng=(i/v.cnt)*Math.PI*2+v.rot;
        ctx.globalAlpha=a*.95;
        ctx.strokeStyle=i%2===0?v.color:'#fff';
        ctx.lineWidth=3;
        ctx.beginPath();
        for(let s=0;s<=24;s++){
          const st=s/24;const ang=baseAng+st*2.5;
          const rr=v.r*st*(1-t*0.3);
          const x=Math.cos(ang)*rr,y=Math.sin(ang)*rr;
          if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    }
    else if(v.type==='heal'){
      const r=v.r*(0.4+t*0.7);ctx.globalAlpha=a*.85;
      ctx.fillStyle='rgba(120,255,150,.35)';
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
      for(let i=0;i<14;i++){
        const ang=i*.448+worldTime;
        const cx2=Math.cos(ang)*r*0.6;
        const cy2=Math.sin(ang)*r*0.6-((worldTime*90+i*40)%v.r);
        ctx.globalAlpha=a*.95;
        ctx.fillStyle='#7dff9b';
        ctx.fillRect(cx2-2,cy2-7,4,14);
        ctx.fillRect(cx2-7,cy2-2,14,4);
      }
    }
    else if(v.type==='dashTrail'){
      ctx.globalAlpha=a*.9;ctx.rotate(v.angle);
      ctx.fillStyle=v.color;ctx.fillRect(-v.len,-8,v.len,16);
      ctx.fillStyle='#fff';ctx.fillRect(-v.len,-3,v.len,6);
      for(let i=0;i<8;i++){
        const px=-v.len*(i/8);
        ctx.fillStyle=i%2?v.color2||'#fff':v.color;
        ctx.fillRect(px-3,-14,6,6);
        ctx.fillRect(px-3,8,6,6);
      }
    }
    else if(v.type==='cone'){
      ctx.globalAlpha=a*.8;ctx.rotate(v.angle);const arc=v.width||1.1;
      ctx.fillStyle=v.color;
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,v.r,-arc,arc);ctx.closePath();ctx.fill();
      ctx.globalAlpha=a;
      ctx.strokeStyle='#fff';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(-arc)*v.r,Math.sin(-arc)*v.r);
      ctx.moveTo(0,0);ctx.lineTo(Math.cos(arc)*v.r,Math.sin(arc)*v.r);ctx.stroke();
      for(let i=0;i<6;i++){
        const t2=i/5;
        const ang2=-arc+t2*arc*2;
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(Math.cos(ang2)*v.r*.9-2,Math.sin(ang2)*v.r*.9-2,4,4);
      }
    }
    else if(v.type==='slashStreaks'){
      ctx.globalAlpha=a*.85;ctx.rotate(v.angle);
      for(let i=0;i<v.cnt;i++){
        const off=(i-(v.cnt-1)/2);
        const y=off*10;
        const len=v.r*(0.6+((i*3)%5)/5*.4);
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(0,y-1.5,len,3);
        ctx.fillStyle=v.color;
        ctx.fillRect(0,y-1,len,2);
      }
    }
    else if(v.type==='sparkCol'){
      for(let i=0;i<v.cnt;i++){
        const ang=worldTime*4+i*Math.PI*2/v.cnt;
        const rr=v.r*(0.6+Math.sin(worldTime*6+i)*.4);
        ctx.globalAlpha=a*.9;
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(Math.cos(ang)*rr-2,Math.sin(ang)*rr-2,4,4);
      }
    }
    else if(v.type==='rainStreak'){
      ctx.globalAlpha=a*.8;
      for(let i=0;i<v.cnt;i++){
        const ang=(i/v.cnt)*Math.PI*2+worldTime*2;
        const rr=v.r*(0.3+t*0.7);
        const x=Math.cos(ang)*rr;
        const y=Math.sin(ang)*rr*.5 - (worldTime*80+i*30)%v.r;
        ctx.fillStyle=i%2?'#fff':v.color;
        ctx.fillRect(x-2,y,4,14);
      }
    }
    else if(v.type==='clock'){
      ctx.globalAlpha=a*.8;
      const r=v.r*(0.5+t*0.5);
      ctx.strokeStyle=v.color;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      const handAng=worldTime*2;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(handAng)*r*.8,Math.sin(handAng)*r*.8);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(handAng*2.4)*r*.6,Math.sin(handAng*2.4)*r*.6);ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

const SKILL_BANNER={text:'',sub:'',icon:'',color:'#fff',life:0,maxLife:0};
function spawnSkillBanner(skill,label){if(!skill)return;SKILL_BANNER.text=skill.name||'SKILL';SKILL_BANNER.sub=label||skill.slot||'SKILL';SKILL_BANNER.icon=skill.icon||'✨';SKILL_BANNER.color=skill.color||(currentChar&&currentChar.colorLight)||'#9ff';SKILL_BANNER.life=1.5;SKILL_BANNER.maxLife=1.5;}
function drawSkillBanner(){
  if(SKILL_BANNER.life<=0)return;
  const t=1-SKILL_BANNER.life/SKILL_BANNER.maxLife;
  const a=SKILL_BANNER.life/SKILL_BANNER.maxLife;
  const alpha=Math.min(1,a*2.5)*Math.min(1,(1-t)*5+.2);
  const cx=W/2,cy=112+(1-Math.min(1,t*3))*14;
  ctx.save();
  ctx.textAlign='center';ctx.textBaseline='middle';
  const barW=Math.min(W*.76,340),barH=42;
  ctx.globalAlpha=alpha*.7;
  ctx.fillStyle='rgba(0,0,0,.65)';
  ctx.fillRect(cx-barW/2-4,cy-barH/2-4,barW+8,barH+8);
  const grad=ctx.createLinearGradient(cx-barW/2,0,cx+barW/2,0);
  grad.addColorStop(0,'rgba(0,0,0,0)');
  grad.addColorStop(.2,SKILL_BANNER.color+'cc');
  grad.addColorStop(.5,SKILL_BANNER.color);
  grad.addColorStop(.8,SKILL_BANNER.color+'cc');
  grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=alpha*.6;
  ctx.fillStyle=grad;
  ctx.fillRect(cx-barW/2,cy-barH/2,barW,barH);
  ctx.globalAlpha=alpha;
  ctx.strokeStyle=SKILL_BANNER.color;ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(cx-barW/2,cy-barH/2);ctx.lineTo(cx+barW/2,cy-barH/2);
  ctx.moveTo(cx-barW/2,cy+barH/2);ctx.lineTo(cx+barW/2,cy+barH/2);
  ctx.stroke();
  ctx.globalAlpha=alpha;
  ctx.fillStyle='#fff';
  for(const [x,y] of [[cx-barW/2+5,cy-barH/2+5],[cx+barW/2-9,cy-barH/2+5],[cx-barW/2+5,cy+barH/2-9],[cx+barW/2-9,cy+barH/2-9]])ctx.fillRect(x,y,4,4);
  ctx.globalAlpha=alpha*.35;
  ctx.strokeStyle='#ffffff';ctx.lineWidth=1;
  const scanOff=(worldTime*160)%20;
  for(let i=-3;i<barW/20+3;i++){
    const x=cx-barW/2+i*20+scanOff;
    ctx.beginPath();
    ctx.moveTo(x,cy-barH/2);ctx.lineTo(x-14,cy+barH/2);
    ctx.stroke();
  }
  ctx.globalAlpha=alpha;
  ctx.font='900 22px system-ui';
  ctx.fillStyle=SKILL_BANNER.color;
  ctx.shadowColor=SKILL_BANNER.color;ctx.shadowBlur=9;
  ctx.fillText(SKILL_BANNER.icon,cx-barW*.34,cy);
  ctx.shadowBlur=0;
  ctx.font='900 16px system-ui';
  ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.95)';
  ctx.strokeText(SKILL_BANNER.text,cx+barW*.06,cy-4,barW*.55);
  const textGrad=ctx.createLinearGradient(0,cy-12,0,cy+7);
  textGrad.addColorStop(0,'#ffffff');
  textGrad.addColorStop(1,SKILL_BANNER.color);
  ctx.fillStyle=textGrad;
  ctx.fillText(SKILL_BANNER.text,cx+barW*.06,cy-4,barW*.55);
  ctx.font='900 8px system-ui';
  ctx.fillStyle=SKILL_BANNER.color;
  ctx.fillText(SKILL_BANNER.sub.toUpperCase(),cx+barW*.06,cy+12,barW*.55);
  ctx.globalAlpha=alpha*(1-t);
  ctx.strokeStyle=SKILL_BANNER.color;ctx.lineWidth=2.5;
  const lineW=32+t*120;
  ctx.beginPath();
  ctx.moveTo(cx-barW/2-lineW,cy);ctx.lineTo(cx-barW/2+20,cy);
  ctx.moveTo(cx+barW/2-20,cy);ctx.lineTo(cx+barW/2+lineW,cy);
  ctx.stroke();
  ctx.restore();
}


function drawPortal(){
  if(!portal) return;
  const t = (worldTime||0)*3 + (portal.phase||0);
  const R = portal.r;
  ctx.save();
  ctx.translate(Math.round(portal.x), Math.round(portal.y));
  const grad = ctx.createRadialGradient(0,0,4,0,0,R*1.6);
  grad.addColorStop(0,   'rgba(220,250,255,.95)');
  grad.addColorStop(.35, 'rgba(140,210,255,.75)');
  grad.addColorStop(.7,  'rgba(80,150,220,.35)');
  grad.addColorStop(1,   'rgba(40,80,160,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0,0,R*1.6,0,Math.PI*2); ctx.fill();
  for(let i=0;i<4;i++){
    const rr = R*(0.30 + i*0.20);
    const a  = t*0.55 + i*1.3;
    ctx.strokeStyle = `rgba(180,240,255,${0.75 - i*0.15})`;
    ctx.lineWidth   = 3 - i*0.5;
    ctx.beginPath();
    for(let s=0;s<=36;s++){
      const st  = s/36;
      const ang = a + st*Math.PI*2;
      const wob = 0.9 + Math.sin(t*2 + i)*0.1;
      const x = Math.cos(ang)*rr*wob;
      const y = Math.sin(ang)*rr*wob;
      if(s===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  const core = ctx.createRadialGradient(0,0,0,0,0,R*0.55);
  core.addColorStop(0,'#ffffff');
  core.addColorStop(.5,'rgba(190,240,255,.85)');
  core.addColorStop(1,'rgba(120,200,255,0)');
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(0,0,R*0.55,0,Math.PI*2); ctx.fill();
  for(let i=0;i<8;i++){
    const a  = t*1.4 + i*Math.PI/4;
    const rr = R*(0.75 + Math.sin(t*3 + i)*0.18);
    ctx.fillStyle = i%2 ? '#ffffff' : '#9bf3ff';
    ctx.fillRect(Math.cos(a)*rr-2, Math.sin(a)*rr-2, 4, 4);
  }
  ctx.globalAlpha = .55;
  ctx.strokeStyle = '#9bf3ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, R*0.4, R*1.05, R*0.35, 0, 0, Math.PI*2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ============================================================
// GAME DATA
// ============================================================

function drawMinimap(st){
  const mw=mini.width,mh=mini.height,scaleX=mw/WORLD.w,scaleY=mh/WORLD.h;
  mctx.save();mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,mw,mh);
  mctx.fillStyle=st.s2;mctx.fillRect(0,0,mw,mh);
  if(st.theme==='water'){
    mctx.fillStyle='#126b96';mctx.fillRect(0,0,mw,mh);
    if(/river|swamp/.test(st.scene)){mctx.strokeStyle='#9a895f';mctx.lineWidth=mh*.28;mctx.beginPath();mctx.moveTo(0,mh*.38);mctx.bezierCurveTo(mw*.3,mh*.2,mw*.55,mh*.78,mw,mh*.56);mctx.stroke();mctx.strokeStyle='#1882a3';mctx.lineWidth=mh*.21;mctx.stroke();}
    else{mctx.fillStyle='#cbb777';mctx.fillRect(0,mh*.76,mw,mh*.24);}
  }else if(st.theme==='lava'){
    mctx.strokeStyle='#ff5721';mctx.lineWidth=3;for(let i=0;i<4;i++){mctx.beginPath();mctx.moveTo(i*mw/3,0);mctx.lineTo(i*mw/3+8,mh*.45);mctx.lineTo(i*mw/3-4,mh);mctx.stroke();}
  }else if(st.theme==='desert'){
    mctx.strokeStyle='rgba(255,221,155,.55)';mctx.lineWidth=2;for(let i=0;i<5;i++){mctx.beginPath();mctx.moveTo(0,i*mh/5);mctx.quadraticCurveTo(mw*.5,i*mh/5-5,mw,i*mh/5+4);mctx.stroke();}
  }else if(st.theme==='tech'){
    mctx.strokeStyle='rgba(80,210,230,.22)';mctx.lineWidth=1;for(let x=0;x<mw;x+=12){mctx.beginPath();mctx.moveTo(x,0);mctx.lineTo(x,mh);mctx.stroke();}for(let y=0;y<mh;y+=12){mctx.beginPath();mctx.moveTo(0,y);mctx.lineTo(mw,y);mctx.stroke();}
  }
  for(const t of trees){mctx.fillStyle=t.theme==='snow'?'#b8eaff':t.theme==='shadow'?'#805b9b':t.theme==='desert'?'#82964b':t.palette.leaf;mctx.fillRect(Math.round(t.x*scaleX)-1,Math.round(t.y*scaleY)-1,3,3);}
  for(const r of rocks){mctx.fillStyle=r.theme==='lava'?'#ff7540':r.theme==='snow'?'#e7f7ff':r.palette.stone;mctx.fillRect(Math.round(r.x*scaleX),Math.round(r.y*scaleY),2,2);}
  for(const item of landmarks){mctx.fillStyle=st.theme==='tech'?'#50e5f0':st.theme==='lava'?'#ffbd4a':st.theme==='water'?'#ffe28b':'#d4c397';mctx.fillRect(Math.round(item.x*scaleX)-2,Math.round(item.y*scaleY)-2,5,5);}
  for(const e of enemies){const x=Math.round(e.x*scaleX),y=Math.round(e.y*scaleY);if(e.boss){mctx.fillStyle='#ff334d';mctx.fillRect(x-3,y-3,7,7);mctx.strokeStyle='#ffe27a';mctx.lineWidth=1;mctx.strokeRect(x-4.5,y-4.5,10,10);}else{mctx.fillStyle=e.elite?'#ffad4d':'#ffe1d1';mctx.fillRect(x-1,y-1,3,3);}}
  for(const a of allies){mctx.fillStyle='#5cf0e7';mctx.fillRect(Math.round(a.x*scaleX)-1,Math.round(a.y*scaleY)-1,3,3);}
  if(portal){mctx.strokeStyle='#72f5ff';mctx.lineWidth=2;mctx.beginPath();mctx.arc(portal.x*scaleX,portal.y*scaleY,4,0,Math.PI*2);mctx.stroke();}
  const px=player.x*scaleX,py=player.y*scaleY,dx=player.dirX,dy=player.dirY;
  mctx.fillStyle='#101a1c';mctx.beginPath();mctx.moveTo(px+dx*5,py+dy*5);mctx.lineTo(px-dy*3-dx*2,py+dx*3-dy*2);mctx.lineTo(px+dy*3-dx*2,py-dx*3-dy*2);mctx.closePath();mctx.fill();
  mctx.fillStyle='#fff';mctx.beginPath();mctx.moveTo(px+dx*4,py+dy*4);mctx.lineTo(px-dy*2-dx*2,py+dx*2-dy*2);mctx.lineTo(px+dy*2-dx*2,py-dx*2-dy*2);mctx.closePath();mctx.fill();
  const viewX=clamp(camX,0,WORLD.w)*scaleX,viewY=clamp(camY,0,WORLD.h)*scaleY,viewW=Math.min(W,WORLD.w)*scaleX,viewH=Math.min(H,WORLD.h)*scaleY;
  mctx.strokeStyle='rgba(255,255,255,.88)';mctx.lineWidth=1.5;mctx.strokeRect(viewX+.5,viewY+.5,Math.max(1,viewW-1),Math.max(1,viewH-1));
  mctx.strokeStyle='rgba(4,12,18,.95)';mctx.lineWidth=1;mctx.strokeRect(.5,.5,mw-1,mh-1);mctx.restore();
}
const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];
const DIFFICULTY_TIERS=[{start:1,end:10,id:'easy',name:'MUDAH',color:'#7dff9b',icon:'🌱',desc:'Pemanasan santai'},{start:11,end:25,id:'normal',name:'NORMAL',color:'#a9f3b0',icon:'⚔️',desc:'Pertarungan seimbang'},{start:26,end:45,id:'hard',name:'SULIT',color:'#ffd36a',icon:'🔥',desc:'Musuh lebih agresif'},{start:46,end:65,id:'veryhard',name:'SANGAT SULIT',color:'#ff9b3d',icon:'💥',desc:'Butuh strategi serius'},{start:66,end:85,id:'impossible',name:'IMPOSSIBLE',color:'#ff5050',icon:'☠️',desc:'Hampir mustahil'},{start:86,end:100,id:'god',name:'GOD',color:'#ff40ff',icon:'👑',desc:'Ujian para dewa'}];
function getDifficultyTier(stageIdx){const s=Math.min(100,Math.max(1,(stageIdx|0)+1));for(const t of DIFFICULTY_TIERS){if(s>=t.start&&s<=t.end){const sub=s-t.start+1;const label=ROMAN[sub-1]||String(sub);return Object.assign({},t,{sub,fullName:`${t.name} ${label}`});}}const last=DIFFICULTY_TIERS[DIFFICULTY_TIERS.length-1];return Object.assign({},last,{sub:1,fullName:last.name});}
function getStageDifficulty(stageIdx){const s=Math.min(100,Math.max(1,(stageIdx|0)+1));return 0.05+(s-1)*(0.95/99);}
function getStageDifficultyNorm(stageIdx){return (getStageDifficulty(stageIdx)-0.05)/0.95;}

const SHOP_ITEMS=[
{id:'potion',ico:'🧪',nm:'Potion',desc:'+1 potion (+35 HP instant)',price:20,type:'consumable',onBuy:()=>{potions+=1;}},
{id:'elixir',ico:'💊',nm:'Elixir',desc:'+20 max HP (permanent)',price:50,type:'upgrade',maxBuy:99,onBuy:()=>{maxHp+=20;hp+=20;}},
{id:'vitality',ico:'💪',nm:'Vitality',desc:'+50 max HP (permanent)',price:120,type:'upgrade',maxBuy:99,onBuy:()=>{maxHp+=50;hp+=50;}},
{id:'whetstone',ico:'⚔️',nm:'Whetstone',desc:'+2 ATK (permanent)',price:60,type:'upgrade',maxBuy:99,onBuy:()=>{atk+=2;}},
{id:'powercore',ico:'🔥',nm:'Power Core',desc:'+5 ATK (permanent)',price:150,type:'upgrade',maxBuy:99,onBuy:()=>{atk+=5;}},
{id:'boots',ico:'💨',nm:'Swift Boots',desc:'+15 Speed (permanent)',price:80,type:'upgrade',maxBuy:99,onBuy:()=>{player.speed+=15;}},
{id:'heal',ico:'❤️',nm:'Full Heal',desc:'Heal to full HP',price:40,type:'consumable',onBuy:()=>{hp=maxHp;}},
{id:'shield',ico:'🛡️',nm:'Shield Rune',desc:'+10% damage reduction',price:200,type:'upgrade',maxBuy:5,onBuy:()=>{player.shieldReduction=Math.min(0.85,(player.shieldReduction||0)+0.10);}}
];
let shopHistory={};let shopContext='free';

const canvas=document.getElementById('c');const ctx=canvas.getContext('2d',{alpha:false});
ctx.imageSmoothingEnabled=false;
const root=document.getElementById('game');
const mini=document.getElementById('mini');const mctx=mini.getContext('2d');mctx.imageSmoothingEnabled=false;
const WORLD={w:1600,h:1200};
let W=0,H=0,dpr=1,last=0;
let running=false,dying=false,deathTimer=0,timeScale=1;
let shake=0,flash=0,hitStop=0,worldTime=0;
let stageIndex=0,killsInStage=0,stageClearTimer=0;
let totalGold=0,potions=0,totalKills=0;
let level=1,xp=0,maxHp=100,hp=100,atk=12;
let comboCount=0,comboTimer=0;
let currentChar=null,enemyIdCounter=0,currentAimTarget=null;
const keys={};
const player={x:0,y:0,r:15,speed:170,attackCd:0,skillCd:0,dashCd:0,ultCd:0,dashTime:0,inv:0,dirX:1,dirY:0,bob:0,walkT:0,attackAnim:0,defendTimer:0,atkMult:1,speedMult:1,lifesteal:0,regen:0,dashDirX:1,dashDirY:0,isDashing:false,dashDmgMult:1,dashKnock:0,dashDistance:1,invisible:0,buffTimer:0,buffAtkMult:1,buffSpeedMult:1,buffColor:'#ffd36a',shieldReduction:.5,shieldReflect:0,manualMove:false,status:{poison:0,burn:0,freeze:0,shock:0,slow:0},statusDps:{poison:0,burn:0,shock:0}};
let warningZones=[];
const STATUS_META={poison:{color:'#7dff5b',icon:'☠️',label:'POISON'},burn:{color:'#ff7020',icon:'🔥',label:'BURN'},freeze:{color:'#a0e0ff',icon:'❄️',label:'FREEZE'},shock:{color:'#ffe060',icon:'⚡',label:'SHOCK'},slow:{color:'#80b8ff',icon:'🐢',label:'SLOW'}};
let enemies=[],projectiles=[],rainArrows=[],allies=[],meteors=[];
let particles=[],floating=[],dashGhosts=[],footprints=[],ripples=[],leaves=[],slashArcs=[];
let trees=[],rocks=[],terrainBits=[],landmarks=[];
let portal=null,camX=0,camY=0;
let paused=false,settingsReturnScreen='start';

function applyStatus(type,dur,dps){if(!player.status)return;player.status[type]=Math.max(player.status[type]||0,dur);if(dps!=null&&player.statusDps[type]!==undefined)player.statusDps[type]=Math.max(player.statusDps[type]||0,dps);const m=STATUS_META[type];if(m){floatText(player.x+rand(-8,8),player.y-42,m.icon+' '+m.label,m.color,true);burst(player.x,player.y,m.color,12,{spd:140,life:[.3,.6]});}}
function tickStatus(dt){for(const k of ['poison','burn','shock']){if(player.status[k]>0){const dps=player.statusDps[k]||0;if(dps>0)hp-=dps*dt;player.status[k]-=dt;if(player.status[k]<=0){player.status[k]=0;player.statusDps[k]=0;}if(Math.random()<0.6){const m=STATUS_META[k],a=Math.random()*Math.PI*2;particles.push({x:player.x+Math.cos(a)*rand(6,16),y:player.y+rand(-14,6),vx:Math.cos(a)*rand(-10,10),vy:k==='burn'?rand(-60,-30):rand(-30,-10),life:rand(.35,.7),color:m.color,size:rand(2,3.5),grav:k==='burn'?-30:20});}}}for(const k of ['freeze','slow']){if(player.status[k]>0){player.status[k]-=dt;if(player.status[k]<=0)player.status[k]=0;}}}
function drawPlayerStatus(){const st=player.status;if(!st)return;const t=worldTime;const order=['poison','burn','freeze','shock','slow'];let ri=0;for(const k of order){if(st[k]>0){const m=STATUS_META[k],r=26+ri*4,pulse=.6+.4*Math.sin(t*6+ri);ctx.save();ctx.globalAlpha=.5*pulse;ctx.strokeStyle=m.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(player.x,player.y-2,r,0,Math.PI*2);ctx.stroke();const cnt=k==='shock'?6:k==='burn'?5:4;for(let i=0;i<cnt;i++){const a=t*(k==='shock'?4:2)+i*(Math.PI*2/cnt);ctx.globalAlpha=.85;ctx.fillStyle=m.color;ctx.fillRect(player.x+Math.cos(a)*r-2,player.y-2+Math.sin(a)*r*.65-2,4,4);}ctx.restore();ri++;}}}
function updateWarningZones(dt){for(let i=warningZones.length-1;i>=0;i--){const w=warningZones[i];w.life-=dt;if(w.life<=0){if(w.onTrigger)w.onTrigger();triggerWarningZone(w);warningZones.splice(i,1);}}}
function drawWarningZones(){for(const w of warningZones){const t=1-w.life/w.maxLife,a=.35+.55*t;ctx.save();ctx.globalAlpha=a*.25;ctx.fillStyle=w.color||'#ff4040';ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=a;ctx.strokeStyle=w.color||'#ff4040';ctx.lineWidth=3;ctx.beginPath();ctx.arc(w.x,w.y,w.r*(0.4+0.6*t),0,Math.PI*2);ctx.stroke();const N=8;for(let i=0;i<N;i++){const ang=i*(Math.PI*2/N)+worldTime*2;ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.fillRect(w.x+Math.cos(ang)*w.r-2,w.y+Math.sin(ang)*w.r-2,4,4);}const pixelR=w.r*(.92+.04*Math.sin(worldTime*8));for(let i=0;i<12;i++){const ang=i*Math.PI/6-worldTime*.35;const px=Math.round((w.x+Math.cos(ang)*pixelR)/4)*4;const py=Math.round((w.y+Math.sin(ang)*pixelR)/4)*4;const size=i%3===0?7:4;ctx.globalAlpha=a*.85;ctx.fillStyle=i%3===0?'#fff':(w.color||'#ff4040');ctx.fillRect(px-size/2,py-size/2,size,size);}ctx.restore();}}
function triggerWarningZone(w){burst(w.x,w.y,w.color||'#ff4040',40,{spd:380,life:[.5,1.0]});for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,v=rand(200,500);particles.push({x:w.x,y:w.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.4,.9),color:i%3===0?'#fff':(w.color||'#ff4040'),size:rand(3,7),grav:120});}addShake(.5);screenFlash(.35);const d=Math.hypot(player.x-w.x,player.y-w.y);if(d<w.r+player.r&&player.inv<=0&&!dying){let dmg=w.dmg||20;if(player.defendTimer>0)dmg=Math.round(dmg*(1-(player.shieldReduction||.5)));hp-=dmg;player.inv=.6;floatText(player.x,player.y-30,'-'+dmg,'#ff4060');addShake(.3);}if(w.status)applyStatus(w.status.type,w.status.dur,w.status.dps);}

function rand(a,b){return a+Math.random()*(b-a)}
function randInt(a,b){return Math.floor(rand(a,b+1))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function pick(a){return a[randInt(0,a.length-1)]}
function weightedPick(items,weights){let r=Math.random(),s=0;for(let i=0;i<items.length;i++){s+=weights[i];if(r<=s)return items[i];}return items[items.length-1];}
function angleDiff(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
function findBestTarget(md,ch,op){md=md??600;ch=ch??Math.PI;op=op||{};const f=Math.atan2(player.dirY,player.dirX);let best=null,bs=-Infinity;for(const e of enemies){if(e.stun>0&&op.skipStunned)continue;const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);if(d>md||d<1)continue;const a=Math.atan2(dy,dx),diff=angleDiff(a,f);if(Math.abs(diff)>ch)continue;let s=100-d*.15;if(e.boss)s+=250;if(e.elite)s+=60;s-=Math.abs(diff)*50;if(e.hp<e.maxHp*.4)s+=25;if(s>bs){bs=s;best=e;}}return best;}
function predictAim(t,ps){const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy),time=d/ps;let tvx=0,tvy=0;if(t.ai==='chase'||t.ai==='erratic'){const td=Math.hypot(player.x-t.x,player.y-t.y)||1;tvx=(player.x-t.x)/td*t.spd;tvy=(player.y-t.y)/td*t.spd;}else if(t.ai==='pounce'&&t.charging>0){tvx=t.vx;tvy=t.vy;}if(t.strafeDir&&Math.hypot(tvx,tvy)>0){const n=Math.hypot(tvx,tvy),px=-tvy/n,py=tvx/n;tvx+=px*t.spd*.5*t.strafeDir;tvy+=py*t.spd*.5*t.strafeDir;}const ex=t.x+tvx*time,ey=t.y+tvy*time;return{x:ex,y:ey,angle:Math.atan2(ey-player.y,ex-player.x),dist:d};}

function resize(){const r=root.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=Math.max(320,r.width||window.innerWidth||320);H=Math.max(420,r.height||window.innerHeight||420);canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;updateCamera(1);}
addEventListener('resize',resize);
function updateCamera(dt){const tx=player.x+player.dirX*55-W/2,ty=player.y+player.dirY*55-H/2;if(dt>=1){camX=tx;camY=ty;}else{camX+=(tx-camX)*Math.min(1,dt*6);camY+=(ty-camY)*Math.min(1,dt*6);}if(W>=WORLD.w)camX=(WORLD.w-W)/2;else camX=clamp(camX,0,WORLD.w-W);if(H>=WORLD.h)camY=(WORLD.h-H)/2;else camY=clamp(camY,0,WORLD.h-H);}
function genWorld(){
  trees=[];rocks=[];leaves=[];terrainBits=[];landmarks=[];
  const st=STAGES[stageIndex],theme=st.theme,p=WORLD_PALETTES[theme],name=st.mapName.toUpperCase();
  let seed=Math.imul(stageIndex+1,2654435761)>>>0;
  const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const baseTreeCount={forest:40,meadow:24,ruins:12,rocky:9,shadow:24,mushroom:22,water:0,snow:15,lava:8,desert:6,bamboo:38,sky:8,tech:4}[theme]||16;
  const treeCount=baseTreeCount+(/forest|grove|wood|tree|bamboo|meadow|path/.test(st.scene)?14:0);
  const rockCount={forest:16,meadow:12,ruins:30,rocky:34,shadow:18,mushroom:14,water:11,snow:25,lava:27,desert:22,bamboo:13,sky:12,tech:23}[theme]||16;
  for(let i=0;i<treeCount;i++)trees.push({x:70+next()*(WORLD.w-140),y:180+next()*(WORLD.h-250),scale:.72+next()*.62,sway:next()*100,theme,palette:p});
  for(let i=0;i<rockCount;i++)rocks.push({x:40+next()*(WORLD.w-80),y:130+next()*(WORLD.h-190),s:7+next()*12,theme,palette:p});
  const detailTypes={forest:['grass','flower','grass'],meadow:['grass','flower','flower'],ruins:['rubble','grass'],rocky:['rubble','crystal'],shadow:['grass','rubble'],mushroom:['mushroom','flower'],water:['coral','reed'],snow:['crystal','snow'],lava:['ember','rubble'],desert:['cactus','rubble'],bamboo:['grass','reed'],sky:['cloud','crystal'],tech:['crystal','rubble']};
  const types=detailTypes[theme]||['grass'];
  const detailCount=theme==='forest'||theme==='meadow'||theme==='bamboo'||theme==='mushroom'?260:190;
  for(let i=0;i<detailCount;i++){
    const type=types[Math.floor(next()*types.length)];
    terrainBits.push({x:24+next()*(WORLD.w-48),y:95+next()*(WORLD.h-125),type,s:2+Math.floor(next()*2),color:theme==='mushroom'?(i%2?'#ed5da8':'#fa9857'):theme==='lava'?'#ff6428':theme==='snow'?'#b8eaff':theme==='water'?(i%2?'#ff6caa':'#44ded0'):theme==='desert'?'#82a14c':st.d,light:theme==='snow'?'#ffffff':theme==='water'?'#a1ffff':p.stone,dark:p.shade});
  }
  const settlement=/village|camp|outpost|fortress|hideout|castle|city|keep|palace|post|tower|temple|gate|ruins|sanctum|throne/.test(st.scene.toLowerCase());
  const landmarkCount=settlement?3:1+(stageIndex%2);
  for(let i=0;i<landmarkCount;i++)landmarks.push({x:160+next()*(WORLD.w-320),y:190+next()*470,s:.62+next()*.48,type:st.scene,theme,palette:p});
  const leafThemes=['forest','meadow','shadow','mushroom','bamboo'];
  if(leafThemes.includes(theme)){const colors=theme==='snow'?['#fff','#c7efff']:theme==='shadow'?['#66477c','#422c62']:[st.d,p.leaf];for(let i=0;i<24;i++)leaves.push({x:next()*WORLD.w,y:next()*WORLD.h,vx:rand(-20,-6),vy:rand(14,28),rot:rand(0,6.28),rotSpeed:rand(-2.5,2.5),size:rand(3,5.5),color:colors[i%colors.length]});}
}

function burst(x,y,color,n=10,opts){const mult=settings.particles;n=Math.round(n*mult);const spd=opts?.spd??100,life=opts?.life??[.25,.55];for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=rand(spd*.3,spd);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-spd*.3,life:rand(life[0],life[1]),color,size:Math.round(rand(2,5)),grav:opts?.grav??100});}}
function floatText(x,y,t,color='#fff',big=false){if(!settings.showDamage&&!big)return;floating.push({x,y,t,color,life:1,age:0,big});}
function screenFlash(a){flash=Math.max(flash,a);}
function hitStopNow(t){hitStop=Math.max(hitStop,t);}
function addShake(a){shake=Math.max(shake,a*settings.shake);}
function addSlashArc(x,y,angle,range,arc,color,life=.22){slashArcs.push({x,y,angle,range,arc,color,life,maxLife:life});}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,1400);}
function showCombo(n){const e=document.getElementById('combo');e.textContent='x'+n;e.style.opacity=1;e.style.transform='translate(-50%,-50%) scale(1.4)';setTimeout(()=>{e.style.transform='translate(-50%,-50%) scale(1)';},90);clearTimeout(showCombo.t);showCombo.t=setTimeout(()=>{e.style.opacity=0;},700);}
function hitEnemy(e,dmg,opts={}){if(e.invuln>0&&!opts.ignoreInvuln)return;if(e.uniqueMark&&e.uniqueMark.until>=worldTime){dmg+=e.uniqueMark.dmg||0;e.uniqueMark=null;floatText(e.x,e.y-40,'MARK BURST','#ff8cff',true);}e.hp-=dmg;e.hit=.14;e.squash=1.2;if(e.hp<=0)e.hp=0;floatText(e.x+rand(-6,6),e.y-26,'-'+Math.round(dmg),opts.color||'#ffd36b');burst(e.x,e.y-4,opts.fxColor||'#ffe08a',8,{spd:130});if(opts.knock){const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*opts.knock;e.y+=dy/d*opts.knock;}if(opts.stun)e.stun=Math.max(e.stun,opts.stun);if(opts.slow)e.slow=Math.max(e.slow,opts.slow);if(player.lifesteal>0&&dmg>0){const heal=dmg*player.lifesteal;hp=Math.min(maxHp,hp+heal);floatText(player.x,player.y-30,'+'+Math.round(heal),'#a8ff8b');}}
function applyPlayerDamage(e,dmg,opts={}){if(!e||e.hp<=0)return false;dmg=Number.isFinite(Number(dmg))?Number(dmg):0;if(dmg<=0)return false;hitEnemy(e,dmg,opts);return true;}
function cleanupDeadEnemies(){for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!Number.isFinite(e.hp))e.hp=0;if(e.hp<=0)killEnemy(i);}}

function attack(){if(!running||paused||player.attackCd>0||dying||stageClearTimer>0)return;const c=currentChar,baseCd=c.ranged?.30:.40;player.attackCd=baseCd;player.attackAnim=baseCd;const dmg=Math.round((atk+randInt(-2,3))*player.atkMult*player.buffAtkMult);
if(c.ranged){const aa=c.autoAim||{range:600,cone:.55,predict:true,homing:1};const ps=560,target=findBestTarget(aa.range,aa.cone);currentAimTarget=target;let angle;if(target){angle=aa.predict?predictAim(target,ps).angle:Math.atan2(target.y-player.y,target.x-player.x);player.dirX=Math.cos(angle);player.dirY=Math.sin(angle);}else angle=Math.atan2(player.dirY,player.dirX);projectiles.push({x:player.x+Math.cos(angle)*20,y:player.y+Math.sin(angle)*20,vx:Math.cos(angle)*ps,vy:Math.sin(angle)*ps,dmg,life:1.3,color:c.projColor||c.color,r:5,pierce:c.id==='beastmaster',hitIds:[],pat:'arrow',style:c.projStyle,homing:target?(aa.homing||0):0,targetId:target?target._id:null});addShake(.04);return;}
const wp=c.weapon;let range=72,arc=.9,knock=6;
if(wp==='greatsword'){range=82;arc=1.2;knock=8;}else if(wp==='shieldmace'){range=66;arc=1;knock=22;}else if(wp==='spear'){range=110;arc=.4;knock=10;}else if(wp==='dualdagger'){range=56;arc=.7;knock=2;}else if(wp==='magicsword'){range=76;arc=.9;knock=8;}else if(wp==='wraps'){range=60;arc=.8;knock=4;}
addSlashArc(player.x,player.y,Math.atan2(player.dirY,player.dirX),range,arc,c.color,.24);let hitAny=false;
for(const e of enemies){const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy)||1;if(d<range+e.r){const dot=(dx*player.dirX+dy*player.dirY)/d;if(dot>Math.cos(arc)){hitEnemy(e,dmg,{knock,stun:wp==='shieldmace'?.4:0});hitAny=true;}}}
if(hitAny){hitStopNow(.045);addShake(.14);screenFlash(.10);comboCount++;comboTimer=1.6;if(comboCount>=3)showCombo(comboCount);burst(player.x+player.dirX*26,player.y+player.dirY*26,'#fff',6,{spd:180,life:[.15,.3]});}else addShake(.03);}
function nearestEnemies(range=240){return enemies.filter(e=>dist(player,e)<range+e.r).sort((a,b)=>dist(player,a)-dist(player,b));}
function damageArea(R,dmg,color,opts={}){for(const e of enemies)if(dist(player,e)<R+e.r)hitEnemy(e,dmg,{knock:opts.knock||0,stun:opts.stun||0,slow:opts.slow||0,color:'#fff',fxColor:color});burst(player.x,player.y,color,Math.min(48,18+R/8),{spd:220});addShake(opts.shake||.18);screenFlash(opts.flash||.12);}
function lineDamage(angle,len,width,dmg,color){for(const e of enemies){const dx=e.x-player.x,dy=e.y-player.y,proj=dx*Math.cos(angle)+dy*Math.sin(angle),side=Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle));if(proj>0&&proj<len&&side<width+e.r)hitEnemy(e,dmg,{knock:8,color:'#fff',fxColor:color});}addSlashArc(player.x,player.y,angle,len,.08,color,.35);burst(player.x+Math.cos(angle)*len*.5,player.y+Math.sin(angle)*len*.5,color,20,{spd:180});addShake(.2);}

function castUniqueSkill(skill){const dmg=Math.round(atk*(skill.power||1)*player.buffAtkMult),m=skill.mech,color=skill.color||currentChar.colorLight||'#c080ff';const target=findBestTarget(skill.range||700,skill.cone||Math.PI);let a=target?predictAim(target,skill.speed||600).angle:Math.atan2(player.dirY,player.dirX);if(target){player.dirX=Math.cos(a);player.dirY=Math.sin(a);}const _isUlt=(skill===currentChar.ult);spawnSkillBanner(skill,_isUlt?'ULTIMATE':(skill.slot||'SKILL'));vfxForSkill(skill,_isUlt);if(_isUlt){player.inv=Math.max(player.inv,.6);hitStopNow(.06);}
switch(m){case'cone':damageArea(105,dmg,color,{knock:20});lineDamage(a,145,55,dmg,color);break;case'ground':damageArea(145,dmg*1.15,color,{knock:45,stun:.7,shake:.3});break;case'execute':{const e=target;if(e){hitEnemy(e,Math.max(dmg,e.hp<e.maxHp*.45?e.hp:dmg),{knock:30,fxColor:color});}break;}case'archerTriple':{for(let i=0;i<3;i++){const aa=a+(i-1)*.10;projectiles.push({x:player.x+Math.cos(aa)*24,y:player.y+Math.sin(aa)*24,vx:Math.cos(aa)*760,vy:Math.sin(aa)*760,dmg:Math.round(dmg*1.25),life:1.45,color,r:5,pierce:true,hitIds:[],pat:'arrow',style:'arrow',homing:.7,targetId:target?target._id:null});}break;}case'archerRain':{const list=nearestEnemies(620).slice(0,6);const points=list.length?list.map(e=>({x:e.x,y:e.y})):Array.from({length:4},()=>({x:player.x+rand(-170,170),y:player.y+rand(-130,130)}));points.forEach((pt,i)=>setTimeout(()=>{for(let j=0;j<3;j++){const x=pt.x+rand(-35,35),y=pt.y+rand(-35,35);rainArrows.push({x,y,targetX:x,targetY:y,speed:760,delay:j*.09,color,damage:Math.round(dmg*1.15),r:5});}},i*110));break;}case'pierce':case'multiPierce':{const count=m==='multiPierce'?5:1;for(let i=0;i<count;i++){const aa=a+(i-(count-1)/2)*.12;projectiles.push({x:player.x+Math.cos(aa)*20,y:player.y+Math.sin(aa)*20,vx:Math.cos(aa)*700,vy:Math.sin(aa)*700,dmg,life:1.5,color,r:5,pierce:true,hitIds:[],pat:'arrow',style:currentChar.projStyle});}break;}case'beam':lineDamage(a,520,18,dmg*1.5,color);screenFlash(.18);break;case'mine':setTimeout(()=>{damageArea(105,dmg*1.5,color,{knock:50,stun:1});},650);break;case'blink':{const ox=player.x,oy=player.y;player.x=clamp(player.x+player.dirX*180,25,WORLD.w-25);player.y=clamp(player.y+player.dirY*180,75,WORLD.h-25);player.inv=.5;burst(ox,oy,color,18,{spd:220});damageArea(75,dmg*1.4,color,{knock:35});break;}case'pack':case'fairyStorm':case'demonLegion':{const n=m==='pack'?3:m==='fairyStorm'?5:4;for(let i=0;i<n;i++)allies.push({type:'spirit',x:player.x+rand(-55,55),y:player.y+rand(-55,55),hp:55+(i*10),maxHp:55+(i*10),dmg:Math.round(dmg*.55),life:10,maxLife:10,attackCd:rand(.2,1),phase:rand(0,6),color,faceX:1,bob:0});burst(player.x,player.y,color,24,{spd:190});break;}case'mark':case'alphaMark':case'weakpoint':{if(target){target.uniqueMark={dmg:dmg*1.8,until:worldTime+5,color};floatText(target.x,target.y-25,'MARK','#ff8cff',true);}break;}case'turret':{allies.push({type:'turret',x:player.x+player.dirX*55,y:player.y+player.dirY*55,hp:100,maxHp:100,dmg:Math.round(dmg*.7),life:12,maxLife:12,attackCd:.2,phase:0,color,faceX:1,bob:0});burst(player.x,player.y,color,20,{spd:150});break;}case'runeSlash':case'soulSlash':case'lineSlash':{lineDamage(a,210,48,dmg*1.7,color);for(let i=0;i<3;i++)setTimeout(()=>lineDamage(a+rand(-.2,.2),160,35,dmg*.5,color),i*110);break;}case'comboCone':{for(let i=0;i<6;i++)setTimeout(()=>{const aa=a+(i%2?.22:-.22);lineDamage(aa,130,45,dmg*.55,color);},i*85);break;}case'counter':{player.defendTimer=1.4;player.shieldReduction=.05;player.shieldReflect=2.2;player.inv=.35;burst(player.x,player.y,color,24,{spd:180});break;}case'dashImpact':case'charge':case'pierceDash':case'dragonDash':{player.dashTime=.45;player.isDashing=true;player.dashDirX=player.dirX;player.dashDirY=player.dirY;player.inv=.5;player.dashDmgMult=2.2;player.dashKnock=35;break;}case'healZone':case'grove':case'worldTree':{const heal=Math.round(maxHp*(m==='worldTree'?.65:.35));hp=Math.min(maxHp,hp+heal);floatText(player.x,player.y-30,'+'+heal,'#7dff9b',true);player.buffTimer=4;player.buffAtkMult=1.2;player.regen=2;burst(player.x,player.y,color,35,{spd:150});break;}case'freeze':case'freezeField':case'timeFreeze':{for(const e of enemies)if(dist(player,e)<(m==='timeFreeze'?320:190)){e.stun=Math.max(e.stun,m==='timeFreeze'?3:2);e.slow=4;}damageArea(150,dmg,color,{stun:.3});break;}case'fortify':case'curseShield':case'shield':{player.defendTimer=skill.duration||5;player.shieldReduction=.35;player.shieldReflect=.9;burst(player.x,player.y,color,30,{spd:190});break;}case'rage':case'transform':case'buff':case'overdrive':case'lifestealForm':case'wolfForm':case'mutation':{player.buffTimer=skill.duration||7;player.buffAtkMult=skill.buff||1.7;player.buffSpeedMult=1.35;player.lifesteal=skill.lifeSteal||.18;player.buffColor=color;burst(player.x,player.y,color,32,{spd:220,life:[.4,.9]});screenFlash(.25);break;}case'bloodSlash':case'bloodShot':{damageArea(125,dmg,color,{knock:18});hp=Math.min(maxHp,hp+Math.round(dmg*.35));break;}case'dragonSummon':{for(let i=0;i<2;i++)allies.push({type:'dragon',x:player.x+rand(-65,65),y:player.y+rand(-65,65),hp:130,maxHp:130,dmg:Math.round(dmg*.85),life:12,maxLife:12,attackCd:.25,phase:rand(0,6),color,faceX:1,bob:0});break;}case'rift':{const ox=player.x,oy=player.y;if(target){player.x=clamp(target.x-player.dirX*70,25,WORLD.w-25);player.y=clamp(target.y-player.dirY*70,75,WORLD.h-25);}else{player.x=clamp(player.x+player.dirX*220,25,WORLD.w-25);player.y=clamp(player.y+player.dirY*220,75,WORLD.h-25);}player.inv=.65;burst(ox,oy,color,20,{spd:220});damageArea(105,dmg*1.55,color,{knock:50,stun:.7});break;}case'gravity':case'blackhole':case'vortex':case'pull':{const R=m==='blackhole'?300:230;for(const e of enemies){const d=dist(player,e);if(d<R&&!e.boss){const k=(1-d/R)*.5;e.x+=(player.x-e.x)*k;e.y+=(player.y-e.y)*k;e.slow=2;}}damageArea(R,dmg*.7,color,{knock:5});break;}case'shockwave':case'shockField':{damageArea(190,dmg*1.2,color,{knock:65,stun:1,shake:.4,flash:.2});break;}case'chain':{let cur=target,used=new Set();for(let i=0;i<6&&cur;i++){used.add(cur._id);hitEnemy(cur,dmg*(1-i*.08),{stun:.5,fxColor:color});cur=enemies.find(e=>!used.has(e._id)&&dist(cur,e)<190);}burst(player.x,player.y,color,25,{spd:260});break;}case'meteor':case'astralMeteor':{const count=m==='astralMeteor'?5:3;for(let i=0;i<count;i++)meteors.push({x:target?target.x+rand(-40,40):player.x+rand(-180,180),y:target?target.y+rand(-40,40):player.y+rand(-180,180),targetX:target?target.x:player.x,targetY:target?target.y:player.y,startY:-500,currentY:-500,dmg:dmg*1.8,R:90,delay:i*.18,color,landed:false});break;}case'lightningRain':case'airRain':case'rainLine':{for(let i=0;i<14;i++){const x=player.x+rand(-240,240),y=player.y+rand(-180,180);setTimeout(()=>{for(const e of enemies)if(Math.hypot(e.x-x,e.y-y)<45)hitEnemy(e,dmg,{stun:.4,fxColor:color});burst(x,y,color,8,{spd:120});},i*70);}break;}case'blizzard':case'eclipse':case'tidal':case'epidemic':{damageArea(260,dmg,color,{slow:4,knock:20});for(const e of enemies)e.slow=Math.max(e.slow,4);break;}case'siege':{for(let i=0;i<4;i++)setTimeout(()=>damageArea(80,dmg*(1+i*.15),color,{knock:45}),i*140);break;}case'pullShot':case'hook':{if(target&&!target.boss){target.x=player.x+player.dirX*90;target.y=player.y+player.dirY*90;hitEnemy(target,dmg,{stun:.8,fxColor:color});}break;}case'bleed':case'venomShot':case'acid':case'plagueShot':case'hellShot':case'waterShot':case'vineShot':{if(target){hitEnemy(target,dmg,{slow:3,fxColor:color});target.hp-=dmg*.45;floatText(target.x,target.y-36,'DOT','#ff6688');}break;}case'trap':case'rootShot':case'coilTrap':{setTimeout(()=>{for(const e of enemies)if(dist(player,e)<180){e.stun=Math.max(e.stun,2);e.slow=4;}damageArea(120,dmg,color,{knock:25});},450);break;}case'dive':case'skyDive':{player.dashTime=.35;player.isDashing=true;player.dashDirX=player.dirX;player.dashDirY=player.dirY;player.dashDmgMult=3;player.dashKnock=55;player.inv=.5;break;}case'focus':case'predict':case'oracleBurst':{player.buffTimer=5;player.buffAtkMult=1.5;player.buffSpeedMult=1.2;if(target)target.uniqueMark={dmg:dmg*2,until:worldTime+5,color};break;}case'rapidShot':case'randomShot':case'fairyShot':case'gustShot':case'starShot':case'rockShot':{for(let i=0;i<6;i++){const aa=a+rand(-.18,.18);projectiles.push({x:player.x,y:player.y,vx:Math.cos(aa)*620,vy:Math.sin(aa)*620,dmg:dmg*.65,life:1.2,color,r:4,pierce:false,pat:'orb',style:currentChar.projStyle,homing:1.2,targetId:target?target._id:null});}break;}case'roulette':case'chaos':case'adaptive':{const pool=['nova','heal','dash','storm'];const pickM=pick(pool);if(pickM==='nova')damageArea(190,dmg,color,{knock:35});else if(pickM==='heal'){hp=Math.min(maxHp,hp+maxHp*.3);burst(player.x,player.y,'#7dff9b',25,{spd:180});}else if(pickM==='dash'){player.inv=.8;player.dashTime=.4;player.isDashing=true;player.dashDirX=player.dirX;player.dashDirY=player.dirY;}else for(let i=0;i<7;i++)setTimeout(()=>damageArea(100,dmg,color),i*80);break;}case'mirror':case'decoy':case'decoyTeleport':{const ox=player.x,oy=player.y;allies.push({type:'clone',x:ox+player.dirX*45,y:oy+player.dirY*45,hp:70,maxHp:70,dmg:dmg*.7,life:8,maxLife:8,attackCd:.3,phase:0,color,faceX:1,bob:0});if(m==='decoyTeleport'){player.x=clamp(ox-player.dirX*130,25,WORLD.w-25);player.y=clamp(oy-player.dirY*130,75,WORLD.h-25);}break;}case'healNova':{const h=Math.round(maxHp*.45);hp=Math.min(maxHp,hp+h);floatText(player.x,player.y-30,'+'+h,'#7dff9b',true);damageArea(100,dmg*.5,color);break;}case'soulHarvest':case'drain':{let h=0;for(const e of enemies)if(dist(player,e)<220){hitEnemy(e,dmg,{fxColor:color});h+=dmg*.35;}hp=Math.min(maxHp,hp+h);break;}case'link':{const es=nearestEnemies(300).slice(0,4);for(const e of es){e.uniqueMark={dmg:dmg*1.3,until:worldTime+4,color};}break;}case'scout':{player.buffTimer=6;player.buffAtkMult=1.35;player.buffSpeedMult=1.3;break;}case'constellation':{for(let i=0;i<8;i++){const aa=i*Math.PI/4;const x=player.x+Math.cos(aa)*150,y=player.y+Math.sin(aa)*150;setTimeout(()=>{for(const e of enemies)if(Math.hypot(e.x-x,e.y-y)<60)hitEnemy(e,dmg,{stun:.5,fxColor:color});burst(x,y,color,8,{spd:100});},i*90);}break;}case'domain':{player.buffTimer=8;player.buffAtkMult=1.8;player.buffSpeedMult=1.25;damageArea(240,dmg*.8,color,{slow:3});break;}case'decree':{for(const e of enemies){e.stun=Math.max(e.stun,1);e.slow=2;if(e.hp<e.maxHp*.3)e.hp=0;}break;}case'dimensionBreak':case'eternal2':{damageArea(300,dmg*1.5,color,{knock:70,stun:1.5,shake:.6,flash:.35});for(const e of enemies)e.slow=4;break;}case'shieldDash':{player.defendTimer=1.2;player.shieldReduction=.3;player.dashTime=.4;player.isDashing=true;player.dashDirX=player.dirX;player.dashDirY=player.dirY;player.dashDmgMult=1.8;player.dashKnock=30;break;}case'root':{for(const e of enemies)if(dist(player,e)<210){e.stun=Math.max(e.stun,2);e.slow=4;}damageArea(120,dmg*.8,color,{knock:15});break;}case'burst':{for(let i=0;i<3;i++)setTimeout(()=>damageArea(120+i*45,dmg*(.75+i*.25),color,{knock:20}),i*120);break;}case'executeRain':case'rain':{for(let i=0;i<10;i++){const e=target||pick(enemies);const x=e?e.x+rand(-45,45):player.x+rand(-180,180),y=e?e.y+rand(-45,45):player.y+rand(-140,140);setTimeout(()=>{for(const q of enemies)if(Math.hypot(q.x-x,q.y-y)<42)hitEnemy(q,dmg,{fxColor:color});burst(x,y,color,8,{spd:130});},i*80);}break;}case'buffStorm':{player.buffTimer=6;player.buffAtkMult=1.45;player.buffSpeedMult=1.25;for(let i=0;i<8;i++)setTimeout(()=>damageArea(90,dmg*.45,color,{slow:1}),i*120);break;}case'armorCrush':{for(const e of enemies)if(dist(player,e)<190){e.hp-=dmg*1.4;e.atk*=.7;e.stun=Math.max(e.stun,.8);}damageArea(150,dmg*.5,color,{knock:35});break;}case'coneWind':{lineDamage(a,250,75,dmg,color);break;}case'rail':{lineDamage(a,650,10,dmg*2.4,color);screenFlash(.3);break;}case'chargeShot':{player.buffTimer=3;player.buffAtkMult=2.2;projectiles.push({x:player.x,y:player.y,vx:Math.cos(a)*1100,vy:Math.sin(a)*1100,dmg:dmg*2.5,life:1,color,r:9,pierce:true,pat:'orb',style:'rail'});break;}case'portalStep':{const ox=player.x,oy=player.y;player.x=clamp(player.x+player.dirX*240,25,WORLD.w-25);player.y=clamp(player.y+player.dirY*240,75,WORLD.h-25);player.inv=.7;burst(ox,oy,color,20,{spd:230});damageArea(90,dmg*1.5,color,{knock:45});break;}case'batCloud':{for(let i=0;i<8;i++){const aa=Math.random()*Math.PI*2;projectiles.push({x:player.x,y:player.y,vx:Math.cos(aa)*rand(180,420),vy:Math.sin(aa)*rand(180,420),dmg:dmg*.7,life:1.5,color,r:5,pierce:false,pat:'orb',style:'bat',homing:1.2,targetId:target?target._id:null});}hp=Math.min(maxHp,hp+dmg*.5);break;}case'multiShadow':{for(let i=0;i<7;i++){const aa=a+(i-3)*.16;projectiles.push({x:player.x,y:player.y,vx:Math.cos(aa)*650,vy:Math.sin(aa)*650,dmg:dmg*.75,life:1.3,color,r:4,pierce:true,pat:'orb',style:'shadow'});}break;}case'mutate':{player.buffTimer=6;player.buffAtkMult=1.8;player.buffSpeedMult=1.5;player.lifesteal=.3;damageArea(130,dmg*.8,color,{knock:25});break;}case'orbit':{for(let i=0;i<12;i++){const aa=i*Math.PI/6;const x=player.x+Math.cos(aa)*120,y=player.y+Math.sin(aa)*120;for(const e of enemies)if(Math.hypot(e.x-x,e.y-y)<35)hitEnemy(e,dmg*.8,{knock:12,fxColor:color});}break;}case'packCircle':{for(let i=0;i<8;i++){const aa=i*Math.PI/4;const x=player.x+Math.cos(aa)*170,y=player.y+Math.sin(aa)*170;for(const e of enemies)if(Math.hypot(e.x-x,e.y-y)<55)hitEnemy(e,dmg*.7,{knock:18,fxColor:color});}break;}case'poisonCloud':{for(let i=0;i<6;i++)setTimeout(()=>{for(const e of enemies)if(dist(player,e)<220)hitEnemy(e,dmg*.55,{slow:1,fxColor:color});burst(player.x+rand(-120,120),player.y+rand(-100,100),color,5,{spd:35});},i*250);break;}case'snakeQueen':{for(let i=0;i<5;i++)allies.push({type:'spirit',x:player.x+rand(-70,70),y:player.y+rand(-70,70),hp:80,maxHp:80,dmg:dmg*.8,life:12,maxLife:12,attackCd:.2,phase:rand(0,6),color,faceX:1,bob:0});damageArea(150,dmg,color,{slow:3});break;}case'soulShot':{if(target){hitEnemy(target,dmg*2,{fxColor:color});hp=Math.min(maxHp,hp+dmg*.25);}break;}case'sniper':{if(target){hitEnemy(target,dmg*3.5,{knock:45,fxColor:color});screenFlash(.35);addShake(.5);hitStopNow(.12);}break;}case'regen':{hp=Math.min(maxHp,hp+maxHp*.3);player.regen=4;player.buffTimer=6;burst(player.x,player.y,'#7dff9b',35,{spd:150});break;}case'sacrifice':{const cost=Math.min(hp-1,maxHp*.18);hp-=Math.max(0,cost);damageArea(280,dmg*2.2,color,{knock:70,stun:1,shake:.6});break;}default:damageArea(140,dmg,color,{knock:20});}}

function castSkill(skill){
  if(!running||dying||!skill||stageClearTimer>0)return;
  if(skill.unique){castUniqueSkill(skill);return;}
  const _isUlt=(skill===currentChar.ult);
  spawnSkillBanner(skill,_isUlt?'ULTIMATE':(skill===currentChar.sk1?'SKILL':skill===currentChar.sk2?'SKILL 2':'SKILL'));
  vfxForSkill(skill,_isUlt);
  if(_isUlt){player.inv=Math.max(player.inv,.6);hitStopNow(.06);}
  const c=currentChar,dmg=Math.round(atk*(skill.dmgMult??1)*player.buffAtkMult),t=skill.type;
  const aa=c.autoAim||{range:600,cone:Math.PI,predict:false};
  if(t==='nova'){const R=skill.R;for(const e of enemies)if(dist(player,e)<R+e.r)hitEnemy(e,dmg,{knock:skill.knock||0,stun:skill.stun||0,slow:skill.slow||0,color:'#ffd36b',fxColor:skill.color});addSlashArc(player.x,player.y,0,R,Math.PI,skill.color,.4);addShake(.32);screenFlash(.22);hitStopNow(.07);}
  else if(t==='multiNova'){let hit=0;const doHit=()=>{if(!running)return;addShake(.4);screenFlash(.3);const R=skill.R+hit*20;for(const e of enemies)if(dist(player,e)<R+e.r)hitEnemy(e,dmg,{knock:skill.knock||0,color:'#ff9080',fxColor:skill.color});hit++;if(hit<skill.hits)setTimeout(doHit,skill.gap);};doHit();}
  else if(t==='blast'){let angle;const target=findBestTarget(aa.range,aa.cone);if(target){angle=predictAim(target,480).angle;player.dirX=Math.cos(angle);player.dirY=Math.sin(angle);}else angle=Math.atan2(player.dirY,player.dirX);projectiles.push({x:player.x+Math.cos(angle)*20,y:player.y+Math.sin(angle)*20,vx:Math.cos(angle)*480,vy:Math.sin(angle)*480,dmg,life:1.2,color:skill.projColor||skill.color,r:7,pat:'orb',style:skill.projStyle||'orb',explodeR:skill.explodeR,explodeColor:skill.color,homing:target?(skill.homing||1):0,targetId:target?target._id:null});addShake(.08);}
  else if(t==='multi'){const target=findBestTarget(aa.range,.9),baseA=target?predictAim(target,520).angle:Math.atan2(player.dirY,player.dirX);if(target){player.dirX=Math.cos(baseA);player.dirY=Math.sin(baseA);}for(let i=-(skill.count-1)/2;i<=(skill.count-1)/2;i++){const a=baseA+i*skill.spread;projectiles.push({x:player.x+Math.cos(a)*20,y:player.y+Math.sin(a)*20,vx:Math.cos(a)*520,vy:Math.sin(a)*520,dmg,life:1.2,color:skill.color,r:5,pierce:false,pat:'arrow',style:c.projStyle,homing:skill.homing||0,targetId:target?target._id:null});}burst(player.x,player.y,skill.color,12,{spd:180});addShake(.12);}
  else if(t==='dash'){player.dashTime=skill.dur||.22;player.inv=skill.inv||.3;player.dashDirX=player.dirX;player.dashDirY=player.dirY;player.isDashing=true;player.dashDmgMult=skill.dmgMult||1;player.dashKnock=skill.knock||15;player.dashDistance=skill.distance||1;for(const e of enemies)e._dashHit=false;burst(player.x,player.y,skill.color,18,{spd:220,life:[.2,.4],grav:20});screenFlash(.12);addShake(.15);}
  else if(t==='backdash'){player.dashTime=.24;player.inv=skill.inv||.4;player.dashDirX=-player.dirX;player.dashDirY=-player.dirY;player.backstep=true;burst(player.x,player.y,skill.color,14,{spd:180});const target=findBestTarget(aa.range,1),baseA=target?predictAim(target,480).angle:Math.atan2(player.dirY,player.dirX);for(let i=0;i<skill.arrows;i++){const a=baseA+(i-(skill.arrows-1)/2)*.22;projectiles.push({x:player.x+Math.cos(a)*18,y:player.y+Math.sin(a)*18,vx:Math.cos(a)*480,vy:Math.sin(a)*480,dmg:Math.round(atk*skill.dmgMult),life:1.1,color:skill.color,r:4,pierce:false,pat:'arrow',style:c.projStyle,homing:skill.homing||0,targetId:target?target._id:null});}screenFlash(.08);}
  else if(t==='teleport'){const target=findBestTarget(500,Math.PI);if(target){const a=Math.atan2(target.y-player.y,target.x-player.x);player.dirX=Math.cos(a);player.dirY=Math.sin(a);}const dx=player.dirX,dy=player.dirY,fx=player.x,fy=player.y;player.x=clamp(player.x+dx*130,25,WORLD.w-25);player.y=clamp(player.y+dy*130,75,WORLD.h-25);player.inv=.4;burst(fx,fy,skill.color,20,{spd:200});burst(player.x,player.y,skill.color,20,{spd:200});for(const e of enemies)if(dist(player,e)<70+e.r)hitEnemy(e,Math.round(atk*skill.dmgMult),{color:'#ff8080',fxColor:skill.color,knock:20});screenFlash(.2);addShake(.18);}
  else if(t==='summon'){const count=skill.count||1;for(let i=0;i<count;i++){const a=(i/count)*Math.PI*2+worldTime;allies.push({type:skill.unit,x:player.x+Math.cos(a)*50,y:player.y+Math.sin(a)*50,hp:skill.hp,maxHp:skill.hp,dmg:skill.dmg,life:skill.life,maxLife:skill.life,attackCd:0,phase:rand(0,6),color:skill.color,faceX:1,bob:0});}burst(player.x,player.y,skill.color,20,{spd:180});screenFlash(.18);}
  else if(t==='drain'){const R=skill.R;let healed=0;for(const e of enemies)if(dist(player,e)<R+e.r){hitEnemy(e,dmg,{color:'#c060ff',fxColor:'#8040c0'});healed+=Math.round(dmg*.4);}if(healed>0){hp=Math.min(maxHp,hp+healed);floatText(player.x,player.y-30,'+'+healed,'#a8ff8b');}addShake(.2);screenFlash(.2);}
  else if(t==='meteor'){const sh=[...enemies].sort(()=>Math.random()-.5);for(let i=0;i<skill.count;i++){let tx,ty;if(i<sh.length){tx=sh[i].x+rand(-20,20);ty=sh[i].y+rand(-20,20);}else{tx=player.x+rand(-200,200);ty=player.y+rand(-200,200);}meteors.push({x:tx,y:ty,targetX:tx,targetY:ty,startY:ty-500,currentY:ty-500,dmg:Math.round(atk*skill.dmgMult*player.buffAtkMult),R:skill.R,delay:.4+i*.15,color:skill.color,landed:false});}}
  else if(t==='rain'){const se=[...enemies].sort((a,b)=>{const sa=(a.boss?200:0)+(a.elite?60:0)+Math.max(0,100-dist(player,a)*.1);const sb=(b.boss?200:0)+(b.elite?60:0)+Math.max(0,100-dist(player,b)*.1);return sb-sa;});for(let i=0;i<skill.count;i++){let tx,ty;if(i<se.length*2&&se.length>0){const e=se[i%se.length];tx=e.x+rand(-30,30);ty=e.y+rand(-30,30);}else{tx=player.x+rand(-skill.radius,skill.radius);ty=player.y+rand(-skill.radius,skill.radius);}rainArrows.push({x:tx+rand(-15,15),y:player.y-400-rand(0,200),targetX:tx,targetY:ty,dmg:Math.round(atk*skill.dmgMult*player.buffAtkMult),speed:700,delay:rand(0,.4),landed:false,color:skill.color});}addShake(.25);screenFlash(.2);}
  else if(t==='shield'){player.defendTimer=skill.dur;player.shieldReduction=Math.max(player.shieldReduction,skill.reduction||.6);player.shieldReflect=skill.reflect||0;burst(player.x,player.y,skill.color,22,{spd:180});screenFlash(.22);}
  else if(t==='rage'||t==='buff'){player.buffTimer=skill.dur;player.buffAtkMult=skill.atkMult||1;player.buffSpeedMult=skill.speedMult||1;player.buffColor=skill.color;if(skill.stealth)player.invisible=skill.dur;if(skill.lifesteal)player.lifesteal=skill.lifesteal;burst(player.x,player.y,skill.color,26,{spd:200,life:[.4,.8]});screenFlash(.25);}
  else if(t==='healBuff'){const heal=Math.round(maxHp*skill.heal);hp=Math.min(maxHp,hp+heal);floatText(player.x,player.y-30,'+'+heal+' HP','#7dff9b');player.buffTimer=skill.dur;player.buffAtkMult=skill.atkMult||1;player.buffSpeedMult=skill.speedMult||1;player.buffColor=skill.color;if(skill.regen)player.regen=skill.regen;burst(player.x,player.y,skill.color,30,{spd:180,life:[.5,1],grav:20});screenFlash(.3);}
  else if(t==='pull'){const R=skill.R;for(const e of enemies){const d=dist(player,e);if(d<R&&!e.boss){e.pull=.6;e.slow=Math.max(e.slow,skill.slowDur);}if(e.boss&&d<R)e.slow=Math.max(e.slow,skill.slowDur*.6);}addShake(.2);screenFlash(.18);}
  else if(t==='spiral'){let hit=0;const doHit=()=>{if(!running)return;const R=(skill.R/skill.hits)*(hit+1);for(const e of enemies)if(dist(player,e)<R+e.r&&!e._spiralHit){hitEnemy(e,Math.round(atk*skill.dmgMult*player.buffAtkMult),{knock:6,color:'#ffd36b',fxColor:skill.color});e._spiralHit=true;setTimeout(()=>e._spiralHit=false,200);}addSlashArc(player.x,player.y,Math.atan2(player.dirY,player.dirX),R,.6,skill.color,.2);hit++;if(hit<skill.hits)setTimeout(doHit,90);};doHit();addShake(.2);}
  else if(t==='combo'){let hit=0;const doHit=()=>{if(!running)return;const dirX=player.dirX,dirY=player.dirY,range=70;for(const e of enemies){const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy)||1;if(d<range+e.r){const dot=(dx*dirX+dy*dirY)/d;if(dot>.4)hitEnemy(e,Math.round(atk*skill.dmgMult*player.buffAtkMult),{knock:4,color:'#ffe080',fxColor:skill.color});}}addSlashArc(player.x,player.y,Math.atan2(dirY,dirX),range,.5,skill.color,.15);hit++;if(hit<skill.hits)setTimeout(doHit,80);};doHit();}
}
function skill1(){if(paused)return;if(player.skillCd<=0&&currentChar){player.skillCd=currentChar.sk1.cd;castSkill(currentChar.sk1);}}
function skill2(){if(paused)return;if(player.dashCd<=0&&currentChar){player.dashCd=currentChar.sk2.cd;castSkill(currentChar.sk2);}}
function ultimate(){if(paused)return;if(player.ultCd<=0&&currentChar){player.ultCd=currentChar.ult.cd;castSkill(currentChar.ult);}}

function getEnemySkillProfile(def,stage){const n=(def.n||'').toLowerCase(),v=(def.v||'').toLowerCase(),w=(def.w||'').toLowerCase(),p=(def.p||'').toLowerCase();const st=(stage.n||'').toLowerCase();if(/mage|sorcerer|witch|wizard|warlock/.test(n)||w==='staff')return'arcane';if(/archer|sniper|hunter|ranger/.test(n)||w==='bow')return'volley';if(/scorpion|snake|serpent|spore|toxic|poison|venom/.test(n+' '+v+' '+st))return'poison';if(/ice|frost|snow|blizzard|crystal/.test(n+' '+v+' '+st))return'frost';if(/fire|lava|magma|inferno|flame|volcano/.test(n+' '+v+' '+st))return'flame';if(/storm|thunder|tempest|lightning/.test(n+' '+v+' '+st))return'storm';if(/time|chronos/.test(n+' '+v+' '+st))return'time';if(/void|abyss|eldritch|shadow|dark/.test(n+' '+v+' '+st))return'void';if(/kraken|leviathan|whale|fish|jellyfish|sea|ocean|atlantis/.test(n+' '+v+' '+st))return'tide';if(/treant|spirit|pixie|fairy|sprite|bamboo|forest|world tree/.test(n+' '+v+' '+st))return'nature';if(/demon|hell|devil|succubus|hellhound/.test(n+' '+v+' '+st))return'hell';if(/assassin|ninja|rogue/.test(n+' '+v))return'blink';if(/golem|titan|colossus|guardian|knight|paladin/.test(n+' '+v))return'quake';if(/dragon|drake|wyrm|phoenix/.test(n+' '+v))return'dragon';if(w==='axe'||w==='club')return'smash';if(w==='spear'||w==='trident')return'pierce';if(w==='katana'||w==='dagger'||w==='sword')return'slash';if(p==='ghost'||p==='worm')return'phase';if(p==='bug'||p==='beast')return'pounce';return def.boss?'boss':'smash';}
function enemySkillDamage(e,mult=1){const norm=getStageDifficultyNorm(stageIndex);return Math.max(1,Math.round(e.atk*mult*(1+norm*2.0)));}
function enemyHitPlayer(dmg,color='#ff5069',inv=.45,shake=.14){if(player.inv>0||dying)return false;dmg=Math.round(dmg);hp-=dmg;player.inv=inv;floatText(player.x+rand(-6,6),player.y-30,'-'+dmg,color);burst(player.x,player.y,color,10,{spd:150});addShake(shake);screenFlash(.08);return true;}
function enemySkillEffect(e,d,dx,dy){if(e.skillCd>0||dying)return false;const a=Math.atan2(dy,dx),c=e.c;let used=true;const cd=Math.max(1.35,e.skillBaseCd*(1-getStageDifficultyNorm(stageIndex)*0.30));
switch(e.skillType){case'arcane':if(d<110||d>520){used=false;break;}e.skillCd=cd;for(let i=-1;i<=1;i++)enemyProjectile(e,a+i*.22,enemySkillDamage(e,i===0?1.05:.58),{speed:330+stageIndex*2,style:'magic',r:i===0?8:5,life:2,explodeR:e.elite?30:0,color:c});break;
case'volley':if(d<150||d>560){used=false;break;}e.skillCd=cd;for(let i=-2;i<=2;i++)enemyProjectile(e,a+i*.10,enemySkillDamage(e,i===0?1:.48),{speed:500,style:'arrow',pat:'arrow',r:4,life:1.6,color:c});break;
case'poison':if(d>360){used=false;break;}e.skillCd=cd+1;enemyProjectile(e,a,enemySkillDamage(e,.72),{speed:260,style:'poison',r:8,life:2.4,explodeR:32,color:'#7dff5b',explodeColor:'#7dff5b',status:{type:'poison',dur:4,dps:enemySkillDamage(e,.12)}});break;
case'frost':if(d>360){used=false;break;}e.skillCd=cd+1.2;enemyProjectile(e,a,enemySkillDamage(e,.65),{speed:250,style:'ice',r:10,life:2.2,explodeR:42,color:'#9ee8ff',explodeColor:'#9ee8ff',status:{type:'freeze',dur:1.8,dps:0}});break;
case'flame':if(d>320){used=false;break;}e.skillCd=cd;for(let i=-2;i<=2;i++)enemyProjectile(e,a+i*.12,enemySkillDamage(e,.55),{speed:360,style:'fire',r:6,life:1.7,explodeR:22,color:'#ff632f',explodeColor:'#ff9b3d',status:{type:'burn',dur:3,dps:enemySkillDamage(e,.1)}});break;
case'storm':if(d>430){used=false;break;}e.skillCd=cd+1;const sx=player.x+rand(-70,70),sy=player.y+rand(-70,70);setTimeout(()=>{if(!running||dying)return;if(Math.hypot(player.x-sx,player.y-sy)<48){enemyHitPlayer(enemySkillDamage(e,.95),'#fff080',.55,.22);applyStatus('shock',2.5,enemySkillDamage(e,.15));}burst(sx,sy,'#fff080',20,{spd:220});},420);break;
case'void':if(d>390){used=false;break;}e.skillCd=cd;for(let i=0;i<6;i++)enemyProjectile(e,a+i*Math.PI/3,enemySkillDamage(e,.48),{speed:280,style:'orb',r:7,life:2.1,color:'#a060ff',explodeR:18});break;
case'tide':if(d>330){used=false;break;}e.skillCd=cd+1;enemyProjectile(e,a,enemySkillDamage(e,.75),{speed:300,style:'water',r:11,life:2.2,explodeR:48,color:'#4fdcff'});break;
case'nature':if(d>300){used=false;break;}e.skillCd=cd+1;enemyProjectile(e,a,enemySkillDamage(e,.65),{speed:220,style:'root',r:8,life:2.4,explodeR:38,color:'#72e36b'});break;
case'hell':if(d>360){used=false;break;}e.skillCd=cd;enemyProjectile(e,a,enemySkillDamage(e,.9),{speed:390,style:'fire',r:7,life:1.8,explodeR:28,color:'#ff3b61'});break;
case'blink':if(d>300||d<70){used=false;break;}e.skillCd=cd+1;const ox=e.x,oy=e.y;e.x=clamp(player.x-dx/d*75,30,WORLD.w-30);e.y=clamp(player.y-dy/d*75,80,WORLD.h-30);burst(ox,oy,c,12,{spd:170});burst(e.x,e.y,c,16,{spd:180});enemyHitPlayer(enemySkillDamage(e,1.25),'#ff4d83',.6,.28);break;
case'quake':if(d>180){used=false;break;}e.skillCd=cd;burst(e.x,e.y,c,24,{spd:230});if(d<155)enemyHitPlayer(enemySkillDamage(e,1.4),'#ff704d',.65,.3);break;
case'dragon':if(d>500){used=false;break;}e.skillCd=cd;for(let i=-2;i<=2;i++)enemyProjectile(e,a+i*.11,enemySkillDamage(e,.72),{speed:360,style:'fire',r:7,life:2,explodeR:26,color:c});break;
case'pierce':if(d<90||d>330){used=false;break;}e.skillCd=cd;e.charging=.32;e.vx=dx/d*(470+stageIndex*2);e.vy=dy/d*(470+stageIndex*2);break;
case'slash':if(d>120){used=false;break;}e.skillCd=cd;if(d<110)enemyHitPlayer(enemySkillDamage(e,1.2),'#ff8060',.5,.2);break;
case'phase':if(d>330){used=false;break;}e.skillCd=cd+1;const px=e.x,py=e.y;e.x=clamp(player.x+rand(-150,150),30,WORLD.w-30);e.y=clamp(player.y+rand(-120,120),80,WORLD.h-30);burst(px,py,c,10,{spd:130});burst(e.x,e.y,c,16,{spd:160});break;
case'pounce':if(d>260){used=false;break;}e.skillCd=cd;e.charging=.30;e.vx=dx/d*(410+stageIndex*2);e.vy=dy/d*(410+stageIndex*2);break;
case'smash':if(d>155){used=false;break;}e.skillCd=cd;if(d<125)enemyHitPlayer(enemySkillDamage(e,1.35),'#ff704d',.6,.28);break;
case'boss':if(d>620){used=false;break;}e.skillCd=Math.max(2.1,cd*.8);for(let i=0;i<12;i++)enemyProjectile(e,a+i*Math.PI/6,enemySkillDamage(e,.55),{speed:260+stageIndex,style:'orb',r:7,life:2.5,color:c,explodeR:18});if(d<180)enemyHitPlayer(enemySkillDamage(e,1.25),'#ff3b6b',.6,.35);break;
default:used=false;}if(used)e.skillFlash=.28;return used;}
function getStageSpawnConfig(){const stageIdx=stageIndex,s=stageIdx+1,isFinal=stageIdx>=STAGES.length-1,tier=getDifficultyTier(stageIdx),norm=getStageDifficultyNorm(stageIdx);const targetKills=15;const cap=Math.min(8,3+Math.floor(norm*5));const initial=isFinal?1:Math.min(cap,2+Math.floor(norm*2));const interval=Math.max(0.7,1.8-norm*1.1);return{cap,initial,interval,targetKills,tier,diff:getStageDifficulty(stageIdx),st:STAGES[stageIdx]};}

function spawnEnemy(forceBoss=false,spawnOpts=null){const st=STAGES[stageIndex];let idx;const normalPool=st.pool||[];const spawnCfg=getStageSpawnConfig();const progress=spawnCfg.targetKills>0?killsInStage/spawnCfg.targetKills:0;let unlocked=normalPool.length;if(progress<.34)unlocked=Math.min(1,normalPool.length);else if(progress<.70)unlocked=Math.min(2,normalPool.length);const activePool=normalPool.slice(0,unlocked);if(spawnOpts&&spawnOpts.summoned)idx=normalPool.length?normalPool[0][0]:st.boss;else if(normalPool.length===0)idx=st.boss;else if(forceBoss&&st.boss!==undefined&&!enemies.some(e=>e.boss))idx=st.boss;else if(st.boss!==undefined&&!enemies.some(e=>e.boss)&&killsInStage>=spawnCfg.targetKills)idx=st.boss;else{const pool=activePool.length?activePool:normalPool.slice(0,1);idx=weightedPick(pool.map(p=>p[0]),pool.map(p=>p[1]));}
const def=ET[idx];if(!def)return;let x,y,tries=0;if(spawnOpts&&Number.isFinite(spawnOpts.overrideX)){x=spawnOpts.overrideX;y=spawnOpts.overrideY;}else do{x=rand(60,WORLD.w-60);y=rand(100,WORLD.h-60);tries++;}while(Math.hypot(x-player.x,y-player.y)<220&&tries<40);
const diffNorm=getStageDifficultyNorm(stageIndex);const eliteChance=Math.min(.45,st.elite+diffNorm*0.30);const isElite=!def.boss&&Math.random()<eliteChance;const hpM=isElite?1.8:1,sM=settings.difficulty;const hpScale=1+diffNorm*10.0,atkScale=1+diffNorm*7.0,spdScale=1+diffNorm*0.35;const role=def.w==='bow'?'ranged':def.w==='staff'?'mage':def.w==='spear'?'lancer':def.w==='axe'?'bruiser':(def.w==='dagger'||def.w==='katana')?'assassin':def.boss?'boss':(def.ai==='pounce'?'charger':'melee');const skillType=getEnemySkillProfile(def,st);const skillBaseCd=Math.max(2.0,4.2-stageIndex*.012)+(isElite?-0.5:0);
const newEnemy={_id:++enemyIdCounter,name:def.n,p:def.p,v:def.v,w:def.w,x,y,r:def.r,hp:def.hp*hpM*sM*hpScale,maxHp:def.hp*hpM*sM*hpScale,atk:def.atk*sM*atkScale,spd:def.spd*spdScale,xp:Math.round(def.xp*(isElite?2:1)*(1+diffNorm*3.5)),g:Math.round(def.g*(isElite?2:1)*(1+diffNorm*3.5)),phase:rand(0,6),hit:0,squash:0,attackCd:rand(.2,1.2),elite:isElite,boss:!!def.boss,pounceTimer:rand(1.5,3),charging:0,stun:0,slow:0,pull:0,c:def.c,cd:def.cd,ai:def.ai,sm:def.sm,role,skillType,skillBaseCd,skillCd:rand(1.2,3.2),skillFlash:0,summoned:!!(spawnOpts&&spawnOpts.summoned),strafeTimer:rand(.3,1),strafeDir:Math.random()<.5?-1:1,retreating:0,retreatTimer:rand(1,2),invuln:0};
if(def.boss)attachBossConfig(newEnemy,def);enemies.push(newEnemy);bestiaryDiscover(def);
if(def.boss){toast('👹 '+def.n.toUpperCase()+' MUNCUL!');screenFlash(.4);addShake(.45);spawnBossBanner(def.n.toUpperCase(),'⚠️ BOSS INCOMING','#ff3050','👹');}}
function enemyProjectile(e,angle,dmg,opts={}){const speed=opts.speed||360,style=opts.style||'orb',life=opts.life||1.7;projectiles.push({x:e.x+Math.cos(angle)*(e.r+8),y:e.y+Math.sin(angle)*(e.r+8),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,dmg,life,color:opts.color||e.c,r:opts.r||5,pat:opts.pat||'orb',style,fromEnemy:true,homing:opts.homing||0,targetPlayer:true,explodeR:opts.explodeR||0,explodeColor:opts.explodeColor||e.c,status:opts.status||null});burst(e.x+Math.cos(angle)*e.r,e.y+Math.sin(angle)*e.r,opts.color||e.c,4,{spd:90,life:[.15,.3]});}
function enemyAttack(e,d,dx,dy){const a=Math.atan2(dy,dx);if(e.role==='ranged'&&d>90&&d<520&&e.attackCd<=0){e.attackCd=Math.max(.65,1.45-e.sm*.35-stageIndex*.008);const lead=Math.min(.55,d/520),pa=Math.atan2(player.y+player.dirY*70*lead-e.y,player.x+player.dirX*70*lead-e.x);enemyProjectile(e,pa,e.atk*.95,{speed:470,style:'arrow',pat:'arrow',r:4,life:1.5});return;}
if(e.role==='mage'&&d>100&&d<470&&e.attackCd<=0){e.attackCd=Math.max(.9,1.9-e.sm*.4-stageIndex*.01);for(let i=-1;i<=1;i++)enemyProjectile(e,a+i*.13,e.atk*(i===0?1:.58),{speed:300+stageIndex*2,style:'magic',r:i===0?7:5,life:1.9,explodeR:e.elite?24:0});return;}
if(d<e.r+player.r+8&&e.attackCd<=0&&player.inv<=0&&!dying){let dmg=e.atk;if(player.defendTimer>0){const red=player.shieldReduction||.5;dmg=Math.round(dmg*(1-red));if(player.shieldReflect){e.hp-=Math.round(e.atk*player.shieldReflect);}}hp-=dmg;e.attackCd=Math.max(.42,e.elite?.62:.78);player.inv=.4;floatText(player.x+rand(-6,6),player.y-28,'-'+dmg,'#ff7182');burst(player.x,player.y,'#ff5069',10,{spd:150});addShake(.18);screenFlash(.14);hitStopNow(.05);}}

function killEnemy(idx){const e=enemies[idx];if(!e||e._dead)return;e._dead=true;const st=STAGES[stageIndex];if(e.summoned){enemies.splice(idx,1);return;}
const sc=getStageSpawnConfig();const wasBoss=!!e.boss;
if(!wasBoss&&killsInStage>=sc.targetKills){enemies.splice(idx,1);return;}
if(!wasBoss)killsInStage=Math.min(sc.targetKills,killsInStage+1);
totalKills++;bestiaryRecordDefeat(ET.find(d=>d.n===e.name));totalGold+=e.g;if(Math.random()<.16||e.elite)potions++;xp+=e.xp;
floatText(e.x,e.y-8,'+'+e.xp+' XP','#a8ff8b');floatText(e.x+8,e.y+10,'+'+e.g+'G','#ffd76b');
burst(e.x,e.y-4,e.c,wasBoss?70:20,{spd:wasBoss?340:200,life:[.3,.8]});
hitStopNow(wasBoss?.12:.07);addShake(wasBoss?.8:.16);screenFlash(wasBoss?.65:.08);
enemies.splice(idx,1);
if(xp>=100)levelUp();
if(!wasBoss&&killsInStage>=sc.targetKills){toast('⚠️ 15 MUSUH DIKALAHKAN! BOSS MUNCUL!');spawnBossBanner('BOSS CHALLENGE','KALAHKAN BOSS UNTUK MEMBUKA PORTAL','#ff3050','👹');screenFlash(.3);addShake(.35);if(st.boss!==undefined&&!enemies.some(q=>q.boss))spawnEnemy(true);}
if(wasBoss){const isLast=stageIndex>=STAGES.length-1;stageCleared=true;if(isLast){stageClearTimer=3;toast('👑 BOSS TERAKHIR DIKALAHKAN!');saveGame();}else{toast('👑 BOSS DIKALAHKAN! PORTAL TERBUKA!');screenFlash(.65);addShake(.65);const ang=Math.random()*Math.PI*2;portal={x:clamp(player.x+Math.cos(ang)*90,70,WORLD.w-70),y:clamp(player.y+Math.sin(ang)*90,110,WORLD.h-70),r:42,phase:0};saveGame();}}}
function levelUp(){level++;hp=maxHp;const bonus=30+level*20;totalGold+=bonus;xp-=100;toast('✨ LEVEL UP! Lv.'+level+' → +'+bonus+'G');floatText(player.x,player.y-40,'+'+bonus+' GOLD','#ffd36a',true);burst(player.x,player.y,'#ffd36a',40,{spd:220,life:[.4,.9],grav:60});screenFlash(.2);saveGame();}

function updateHud(){document.getElementById('hp').style.width=clamp(hp/maxHp*100,0,100)+'%';document.getElementById('xp').style.width=clamp(xp,0,100)+'%';document.getElementById('stats').textContent=`HP ${Math.ceil(hp)}/${maxHp} • XP ${xp}/100 • ATK ${Math.round(atk*player.atkMult*player.buffAtkMult)}`;document.getElementById('goldText').textContent=`💰 ${totalGold}`;document.getElementById('potionText').textContent=`🧪 ${potions}`;document.getElementById('kills').textContent=`${killsInStage} / ${getStageSpawnConfig().targetKills}`;document.getElementById('stageProg').textContent=`Stage ${stageIndex+1} / 100`;document.getElementById('stageName2').textContent=STAGES[stageIndex].mapName;const _tier=getDifficultyTier(stageIndex);const _tierEl=document.getElementById('diffTier');if(_tierEl){_tierEl.textContent=`${_tier.icon} ${_tier.fullName}`;_tierEl.style.color=_tier.color;}if(currentChar)document.getElementById('hudName').textContent=`${currentChar.icon} ${currentChar.name} • Lv. ${level}`;document.getElementById('hpBarLow').style.display=(running&&hp>0&&hp<maxHp*.35)?'block':'none';document.getElementById('skillBtn').classList.toggle('cooling',player.skillCd>0);document.getElementById('dashBtn').classList.toggle('cooling',player.dashCd>0);document.getElementById('ultBtn').classList.toggle('cooling',player.ultCd>0);document.getElementById('ultBtn').classList.toggle('ready',player.ultCd<=0&&running);const bc=document.getElementById('buffIcons');let html='';if(player.buffTimer>0)html+=`<div style="color:${player.buffColor||'#fff'}">⚡ ${player.buffTimer.toFixed(1)}s</div>`;if(player.defendTimer>0)html+=`<div style="color:#80b8ff">🛡️ ${player.defendTimer.toFixed(1)}s</div>`;if(player.invisible>0)html+=`<div style="color:#c080ff">👻 ${player.invisible.toFixed(1)}s</div>`;if(player.regen>0)html+=`<div style="color:#80ff80">💚 Regen</div>`;bc.innerHTML=html;}

function openShop(context){shopContext=context||'free';renderShop();showScreen('shopScreen');const nb=document.getElementById('shopNext');if(context==='poststage'){nb.style.display='block';nb.textContent='▶ LANJUT';}else nb.style.display='none';}
function closeShop(){hideAllScreens();if(shopContext==='poststage'){shopContext='free';if(stageIndex+1>=STAGES.length){running=false;clearSave();showScreen('win');}else{showStageIntro(stageIndex+1,()=>{startStage(stageIndex+1);running=true;});}}else if(running){}else showScreen('start');}
function buyItem(item){const bought=shopHistory[item.id]||0;if(item.maxBuy!==undefined&&bought>=item.maxBuy){toast('❌ Sudah maksimal!');return;}if(totalGold<item.price){toast('❌ Gold kurang!');return;}totalGold-=item.price;shopHistory[item.id]=bought+1;item.onBuy();toast('✅ '+item.nm+' dibeli!');updateHud();renderShop();saveGame();}
function renderShop(){document.getElementById('shopGold').textContent=totalGold;const grid=document.getElementById('shopGrid');grid.innerHTML='';SHOP_ITEMS.forEach(item=>{const bought=shopHistory[item.id]||0;const maxed=item.maxBuy!==undefined&&bought>=item.maxBuy;const cant=totalGold<item.price||maxed;const el=document.createElement('button');el.className='shopItem'+(maxed?' owned':'')+(cant&&!maxed?' cant':'');el.innerHTML=`${bought>0?`<div class="qtyTag">×${bought}</div>`:''}${maxed?`<div class="ownedTag">MAX</div>`:''}<div class="ico">${item.ico}</div><div class="nm">${item.nm}</div><div class="desc">${item.desc}</div><div class="price">💰 ${item.price}</div>`;if(!cant)el.onclick=()=>buyItem(item);grid.appendChild(el);});}

const SAVE_KEY='eclipse_rpg_save_v1';let stageSnapshot=null;let saveTick=8;let stageCleared=false;
function readSave(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const d=JSON.parse(raw);if(!d||!d.charId||!CHARACTERS[d.charId])return null;return d;}catch(e){return null;}}
function collectSave(stageOverride){if(!currentChar)return null;const si=(stageOverride!=null)?stageOverride:(stageCleared?Math.min(STAGES.length-1,stageIndex+1):stageIndex);return {v:1,ts:Date.now(),charId:currentChar.id||'fighter',stageIndex:clamp(si,0,STAGES.length-1),level,xp,maxHp,hp:Math.ceil(hp),atk,speed:player.speed,shieldReduction:player.shieldReduction,totalGold,potions,totalKills,shopHistory:Object.assign({},shopHistory)};}
function saveGame(stageOverride){if(!currentChar)return;const d=collectSave(stageOverride);if(!d)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch(e){}refreshContinueUI();}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}stageSnapshot=null;refreshContinueUI();}
function refreshContinueUI(){const btn=document.getElementById('toContinue');const info=document.getElementById('saveInfo');if(!btn)return;const d=readSave();if(!d){btn.style.display='none';if(info)info.style.display='none';return;}const ch=CHARACTERS[d.charId];const idx=clamp(d.stageIndex|0,0,STAGES.length-1);const st=STAGES[idx];btn.style.display='block';btn.textContent=`▶ LANJUTKAN — STAGE ${idx+1} / 100`;if(info){info.style.display='block';info.innerHTML=`${ch.icon} ${ch.name} • Lv.${d.level||1} • 💰 ${d.totalGold||0} • 🧪 ${d.potions||0}<br><span style="opacity:.75">${st.mapName}</span>`;}}
function continueGame(){const d=readSave();if(!d){toast('❌ Tidak ada simpanan');refreshContinueUI();return;}const ch=CHARACTERS[d.charId];currentChar=ch;currentChar.id=d.charId;selectedCharId=d.charId;level=Math.max(1,(d.level|0)||1);xp=clamp(d.xp|0,0,99);maxHp=Math.max(1,(d.maxHp|0)||ch.hp);const rawHp=(d.hp==null?maxHp:(d.hp|0));hp=clamp(Math.max(rawHp,Math.ceil(maxHp*0.5)),1,maxHp);atk=Math.max(1,(d.atk|0)||ch.atk);player.speed=(d.speed|0)||ch.speed;player.shieldReduction=(d.shieldReduction!=null)?d.shieldReduction:0.5;totalGold=Math.max(0,d.totalGold|0);potions=Math.max(0,d.potions|0);totalKills=Math.max(0,d.totalKills|0);shopHistory=d.shopHistory?Object.assign({},d.shopHistory):{};stageIndex=clamp(d.stageIndex|0,0,STAGES.length-1);dying=false;paused=false;timeScale=1;applyCharButtons();enterFullscreen();showStageIntro(stageIndex,()=>{startStage(stageIndex);running=true;toast('💾 Progress dimuat — Stage '+(stageIndex+1));});}

// ---------- draw() master ----------
function draw(){ctx.clearRect(0,0,W,H);const st=STAGES[stageIndex]||STAGES[0];ctx.save();if(shake>0){const s=Math.round(shake*14);ctx.translate(rand(-s,s)|0,rand(-s,s)|0);}ctx.translate(-Math.round(camX),-Math.round(camY));
const grad=ctx.createLinearGradient(0,camY,0,camY+H);grad.addColorStop(0,st.s1);grad.addColorStop(1,st.s2);ctx.fillStyle=grad;ctx.fillRect(camX,camY,W,H);
const TILE=32,sx=Math.floor(camX/TILE)*TILE,sy=Math.floor(camY/TILE)*TILE,ex=camX+W+TILE,ey=camY+H+TILE;
drawBiomeTiles(st,sx,sy,ex,ey);drawBiomeSurface(st);drawStageTrail(st);drawLandmarks();drawTerrainBits();
for(const f of footprints){const a=(f.life/f.maxLife)*.45;ctx.fillStyle=`rgba(30,20,10,${a})`;ctx.fillRect(Math.round(f.x-4),Math.round(f.y-2),8,4);}
for(const l of leaves){if(l.x<camX-20||l.x>camX+W+20||l.y<camY-20||l.y>camY+H+20)continue;ctx.fillStyle=l.color;ctx.globalAlpha=.85;ctx.fillRect(Math.round(l.x-2),Math.round(l.y-2),4,4);}
ctx.globalAlpha=1;
drawSkillVfx();drawWarningZones();drawPortal();drawPlayerStatus();
const draws=[];for(const t of trees)if(t.x>camX-60&&t.x<camX+W+60&&t.y>camY-140&&t.y<camY+H+60)draws.push({y:t.y,kind:'tree',ref:t});for(const r of rocks)if(r.x>camX-40&&r.x<camX+W+40&&r.y>camY-40&&r.y<camY+H+40)draws.push({y:r.y,kind:'rock',ref:r});for(const e of enemies)draws.push({y:e.y,kind:'enemy',ref:e});for(const a of allies)draws.push({y:a.y,kind:'ally',ref:a});for(const g of dashGhosts)draws.push({y:g.y,kind:'ghost',ref:g});draws.push({y:player.y,kind:'player',ref:player});draws.sort((a,b)=>a.y-b.y);
for(const d of draws){if(d.kind==='tree')drawTree(d.ref);else if(d.kind==='rock')drawRock(d.ref);else if(d.kind==='enemy')drawEnemy(d.ref);else if(d.kind==='ally')drawAlly(d.ref);else if(d.kind==='player')drawPlayer();else if(d.kind==='ghost'){const g=d.ref,ch=CHARACTERS[g.charId];ctx.save();ctx.globalAlpha=(g.life/g.maxLife)*.45;ctx.fillStyle=ch.color;ctx.fillRect(g.x-10,g.y-22,20,38);ctx.fillStyle=ch.colorLight;ctx.fillRect(g.x-9,g.y-19,18,17);ctx.restore();}}
drawAimLine();for(const s of slashArcs)drawSlashArc(s);for(const p of projectiles)drawProjectile(p);for(const a of rainArrows)drawRainArrow(a);for(const m of meteors)drawMeteor(m);
for(const p of particles){const a=clamp(p.life*2,0,1);ctx.globalAlpha=a;ctx.fillStyle=p.color;const s=Math.max(2,Math.round(p.size));ctx.fillRect(Math.round(p.x-s/2),Math.round(p.y-s/2),s,s);}
ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';
for(const f of floating){let sc=1;if(f.age<.14)sc=.4+(f.age/.14)*1.05;else if(f.age<.28)sc=1.45-((f.age-.14)/.14)*.45;const alpha=Math.min(1,f.life*1.4);ctx.globalAlpha=alpha;ctx.font=`900 ${f.big?17:14}px system-ui`;ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.strokeText(f.t,f.x,f.y);ctx.fillStyle=f.color;ctx.save();ctx.translate(f.x,f.y);ctx.scale(sc,sc);ctx.fillText(f.t,0,0);ctx.restore();}
ctx.globalAlpha=1;if(dying){const a=.35+(1-deathTimer)*.3;ctx.fillStyle=`rgba(120,0,10,${Math.min(.5,a)})`;ctx.fillRect(camX,camY,W,H);}if(flash>0){ctx.fillStyle=`rgba(255,255,255,${flash})`;ctx.fillRect(camX,camY,W,H);}ctx.restore();
drawBossHpBar();drawBossBanner();drawSkillBanner();
drawMinimap(st);}

let footTimer=0,footSide=1,ghostTimer=0;
function update(dt){
worldTime+=dt;updateSkillVfx(dt);tickStatus(dt);updateWarningZones(dt);
if(BOSS_BANNER.life>0)BOSS_BANNER.life-=dt;
let ax=0,ay=0;if(keys.w||keys.ArrowUp)ay--;if(keys.s||keys.ArrowDown)ay++;if(keys.a||keys.ArrowLeft)ax--;if(keys.d||keys.ArrowRight)ax++;ax+=joy.x;ay+=joy.y;
const m=Math.hypot(ax,ay);let mvx=0,mvy=0;if(m>.05){ax/=Math.max(1,m);ay/=Math.max(1,m);if(player.dashTime<=0){player.dirX=ax;player.dirY=ay;player.manualMove=true;}mvx=ax;mvy=ay;}else player.manualMove=false;
if(player.dashTime>0){mvx=player.dashDirX;mvy=player.dashDirY;if(player.dashDistance>1){mvx*=player.dashDistance;mvy*=player.dashDistance;}}
let spM=1;if(player.dashTime>0)spM=3.5;if(player.defendTimer>0)spM*=.5;if(player.status.freeze>0)spM*=.15;else if(player.status.slow>0)spM*=.55;spM*=player.speedMult*player.buffSpeedMult;
const speed=player.speed*spM;const pX=player.x,pY=player.y;
player.x=clamp(player.x+mvx*speed*dt,25,WORLD.w-25);player.y=clamp(player.y+mvy*speed*dt,75,WORLD.h-25);
if(player.dashTime>0&&player.isDashing){for(const e of enemies){const d=Math.hypot(e.x-player.x,e.y-player.y);if(d<player.r+e.r+8&&!e._dashHit){hitEnemy(e,Math.round(atk*player.dashDmgMult*player.buffAtkMult),{knock:player.dashKnock,color:'#ff8080',fxColor:currentChar.color});e._dashHit=true;}}}
const md=Math.hypot(player.x-pX,player.y-pY);if(md>.5){player.walkT+=md*.08;player.bob=Math.sin(player.walkT)*1.6;footTimer-=md;if(footTimer<=0){footTimer=20;footSide*=-1;const perpX=-player.dirY,perpY=player.dirX;footprints.push({x:player.x+perpX*6*footSide,y:player.y+12+perpY*2*footSide,life:3,maxLife:3});}}else player.bob*=.9;
player.attackCd=Math.max(0,player.attackCd-dt);player.skillCd=Math.max(0,player.skillCd-dt);player.dashCd=Math.max(0,player.dashCd-dt);player.ultCd=Math.max(0,player.ultCd-dt);
player.dashTime=Math.max(0,player.dashTime-dt);player.inv=Math.max(0,player.inv-dt);player.attackAnim=Math.max(0,player.attackAnim-dt);player.defendTimer=Math.max(0,player.defendTimer-dt);
if(player.buffTimer>0){player.buffTimer-=dt;if(player.buffTimer<=0){player.buffAtkMult=1;player.buffSpeedMult=1;player.lifesteal=0;}}
if(player.invisible>0)player.invisible-=dt;
if(player.regen>0){player.regen-=dt;hp=Math.min(maxHp,hp+1.5*dt);}
comboTimer=Math.max(0,comboTimer-dt);if(comboTimer===0&&comboCount!==0)comboCount=0;
if(player.dashTime===0)player.isDashing=false;
if(currentChar&&currentChar.ranged&&!player.manualMove&&running&&!portal){const aa=currentChar.autoAim||{range:600,cone:.55};const target=findBestTarget(aa.range,Math.PI);if(target){const angle=Math.atan2(target.y-player.y,target.x-player.x),curA=Math.atan2(player.dirY,player.dirX),diff=angleDiff(angle,curA),newA=curA+clamp(diff,-dt*5,dt*5);player.dirX=Math.cos(newA);player.dirY=Math.sin(newA);currentAimTarget=target;}else currentAimTarget=null;}
if(player.dashTime>0){ghostTimer-=dt;if(ghostTimer<=0){ghostTimer=.028;dashGhosts.push({x:player.x,y:player.y,dirX:player.dirX,life:.32,maxLife:.32,charId:currentChar.id});}}
for(let i=allies.length-1;i>=0;i--){const a=allies[i];a.life-=dt;if(a.life<=0||a.hp<=0){allies.splice(i,1);continue;}a.phase+=dt*3;a.bob=Math.sin(a.phase)*1.5;a.attackCd-=dt;let target=null,bestD=999;for(const e of enemies){const d=Math.hypot(e.x-a.x,e.y-a.y);let s=d;if(e.boss)s-=200;if(e.elite)s-=60;if(s<bestD){bestD=s;target=e;}}
if(a.type==='turret'){if(target&&bestD<220&&a.attackCd<=0){a.attackCd=.5;const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy)||1,time=d/450;const px=target.x+(target.ai==='chase'?(player.x-target.x)/d*target.spd*time:0);const py=target.y+(target.ai==='chase'?(player.y-target.y)/d*target.spd*time:0);const a2=Math.atan2(py-a.y,px-a.x);projectiles.push({x:a.x,y:a.y-10,vx:Math.cos(a2)*450,vy:Math.sin(a2)*450,dmg:a.dmg,life:.9,color:'#ffb060',r:4,pat:'orb',style:'orb',fromAlly:true});}}
else{if(target&&bestD<220){if(bestD>40){a.x+=(target.x-a.x)/bestD*110*dt;a.y+=(target.y-a.y)/bestD*110*dt;}else if(a.attackCd<=0){a.attackCd=.7;target.hp-=a.dmg;target.hit=.14;target.squash=1;floatText(target.x,target.y-26,'-'+a.dmg,'#a8ff8b');burst(target.x,target.y-4,a.color,6,{spd:150});}a.faceX=target.x>a.x?1:-1;}else{const dx=player.x-a.x,dy=player.y-a.y,d=Math.hypot(dx,dy)||1;if(d>60){a.x+=dx/d*80*dt;a.y+=dy/d*80*dt;}a.faceX=player.dirX>=0?1:-1;}}}
for(const e of enemies){
if(e.hp<=0){e.hit=0;continue;}
e.phase+=dt*3;e.hit=Math.max(0,e.hit-dt);e.squash=Math.max(0,e.squash-dt*5);e.skillFlash=Math.max(0,(e.skillFlash||0)-dt);
e.stun=Math.max(0,e.stun-dt);e.slow=Math.max(0,e.slow-dt);e.pull=Math.max(0,e.pull-dt);
if(e.pull>0){const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*220*dt;e.y+=dy/d*220*dt;}
if(e.invuln>0)e.invuln=Math.max(0,e.invuln-dt);
if(e.stun>0)continue;
e.attackCd-=dt;e.skillCd-=dt;
const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;
if(e.boss&&e.bossConfig){updateBossAI(e,dt,dx,dy,d);e.x=clamp(e.x,25,WORLD.w-25);e.y=clamp(e.y,75,WORLD.h-25);continue;}
const slowMult=e.slow>0?.4:1;
let mvx2=0,mvy2=0;
if(e.ai==='chase'){if(d<280&&d>35){mvx2=dx/d;mvy2=dy/d;}}
else if(e.ai==='erratic'){const perpX=-dy/d,perpY=dx/d,wob=Math.sin(e.phase*2)*.9;if(d<300&&d>35){mvx2=dx/d+perpX*wob;mvy2=dy/d+perpY*wob;}}
else if(e.ai==='pounce'){e.pounceTimer-=dt;if(e.charging>0){e.charging-=dt;mvx2=e.vx/e.spd;mvy2=e.vy/e.spd;}else{if(d<320&&d>50){mvx2=dx/d;mvy2=dy/d;}if(e.pounceTimer<=0&&d<250){e.pounceTimer=rand(2.2,3.5);e.charging=.35;e.vx=dx/d*360;e.vy=dy/d*360;}}}
if(mvx2===0&&mvy2===0&&!e.charging){if(e.role==='ranged'||e.role==='mage'){const desired=e.role==='mage'?250:300;if(d>desired+45){mvx2=dx/d;mvy2=dy/d;}else if(d<desired-55){mvx2=-dx/d;mvy2=-dy/d;}}else{if(d>e.r+player.r+10){mvx2=dx/d;mvy2=dy/d;}}}
const specialUsed=enemySkillEffect(e,d,dx,dy);
if(e.charging>0){e.charging-=dt;e.x+=e.vx*slowMult*dt;e.y+=e.vy*slowMult*dt;if(Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.r+12&&player.inv<=0&&!dying){const dmg=Math.round(e.atk*1.3);hp-=dmg;player.inv=.55;floatText(player.x,player.y-30,'-'+dmg,'#ff516d');addShake(.3);}}
else if(!specialUsed&&(e.role==='ranged'||e.role==='mage'||e.role==='lancer'||e.role==='assassin'||e.role==='bruiser'||e.role==='charger'))enemyAttack(e,d,dx,dy);
else if(d<e.r+player.r+8)enemyAttack(e,d,dx,dy);
if(e.charging<=0&&(mvx2!==0||mvy2!==0)){const mm=Math.hypot(mvx2,mvy2)||1;e.x+=mvx2/mm*e.spd*slowMult*dt;e.y+=mvy2/mm*e.spd*slowMult*dt;}
e.x=clamp(e.x,25,WORLD.w-25);e.y=clamp(e.y,75,WORLD.h-25);}
for(let i=enemies.length-1;i>=0;i--)if(enemies[i].hp<=0)killEnemy(i);
for(let i=projectiles.length-1;i>=0;i--){
const p=projectiles[i];
if(p.ignore&&p.orbit)continue;
if(p.homing&&p.targetId){const target=enemies.find(e=>e._id===p.targetId);if(target){const dx=target.x-p.x,dy=target.y-p.y,desA=Math.atan2(dy,dx),curA=Math.atan2(p.vy,p.vx),diff=angleDiff(desA,curA);const maxTurn=p.homing*dt,turn=clamp(diff,-maxTurn,maxTurn),newA=curA+turn,spd=Math.hypot(p.vx,p.vy);p.vx=Math.cos(newA)*spd;p.vy=Math.sin(newA)*spd;}else p.homing=0;}
p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
if(!p.fromAlly&&Math.random()<.55)particles.push({x:p.x+rand(-3,3),y:p.y+rand(-3,3),vx:rand(-10,10),vy:rand(-10,10),life:rand(.15,.35),color:p.color,size:rand(1.5,3),grav:0});
let dead=p.life<=0||p.x<0||p.x>WORLD.w||p.y<0||p.y>WORLD.h;
if(!dead&&p.fromEnemy){if(Math.hypot(p.x-player.x,p.y-player.y)<player.r+p.r&&player.inv<=0&&!dying){let dmg=p.dmg;if(player.defendTimer>0)dmg=Math.round(dmg*(1-(player.shieldReduction||.5)));hp-=dmg;player.inv=.35;floatText(player.x,player.y-28,'-'+Math.round(dmg),'#ff6b78');if(p.status)applyStatus(p.status.type,p.status.dur,p.status.dps);burst(player.x,player.y,p.color,8,{spd:120});addShake(.12);dead=true;if(p.explodeR){for(const q of enemies)if(Math.hypot(p.x-q.x,p.y-q.y)<p.explodeR+q.r)q.hp-=p.dmg*.35;}}}
else if(!dead&&!p.fromAlly){for(const e of enemies){if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r){if(p.hitIds&&p.hitIds.includes(e._id))continue;if(p.hitIds)p.hitIds.push(e._id);applyPlayerDamage(e,p.dmg,{color:'#ffd36b',fxColor:p.color});burst(p.x,p.y,p.color,6,{spd:150});hitStopNow(.03);if(p.explodeR){for(const e2 of enemies){if(e2===e)continue;if(Math.hypot(p.x-e2.x,p.y-e2.y)<p.explodeR+e2.r){e2.hp-=Math.round(p.dmg*.6);e2.hit=.14;floatText(e2.x,e2.y-26,'-'+Math.round(p.dmg*.6),'#ff8060');}}burst(p.x,p.y,p.explodeColor||p.color,20,{spd:260,life:[.3,.6]});addShake(.2);screenFlash(.18);}
if(p.bounce>0){p.bounce--;const next=enemies.filter(q=>q.hp>0&&(!p.hitIds||!p.hitIds.includes(q._id))).sort((q1,q2)=>Math.hypot(q1.x-p.x,q1.y-p.y)-Math.hypot(q2.x-p.x,q2.y-p.y))[0];if(next){const na=Math.atan2(next.y-p.y,next.x-p.x),spd=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*spd;p.vy=Math.sin(na)*spd;p.targetId=next._id;p.x+=Math.cos(na)*8;p.y+=Math.sin(na)*8;}else dead=true;}
else if(!p.pierce){dead=true;break;}}}}
else if(!dead&&p.fromAlly){for(const e of enemies){if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r){applyPlayerDamage(e,p.dmg,{color:'#ffb060',fxColor:p.color});burst(p.x,p.y,p.color,5,{spd:120});dead=true;break;}}}
if(dead){burst(p.x,p.y,p.color,5,{spd:80});projectiles.splice(i,1);}}
for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];if(!p._orb)continue;const orb=p.orbit,boss=enemies.find(e=>e._id===orb.boss);if(!boss||boss.hp<=0){projectiles.splice(i,1);continue;}orb.ang+=orb.speed*dt;orb.life-=dt;if(orb.life<=0){projectiles.splice(i,1);continue;}p.x=boss.x+Math.cos(orb.ang)*orb.R;p.y=boss.y+Math.sin(orb.ang)*orb.R;if(Math.hypot(p.x-player.x,p.y-player.y)<player.r+p.r&&player.inv<=0){hp-=p.dmg;player.inv=.5;floatText(player.x,player.y-30,'-'+p.dmg,'#ff80ff');addShake(.25);screenFlash(.15);}p.life=orb.life;}
cleanupDeadEnemies();
for(let i=rainArrows.length-1;i>=0;i--){const a=rainArrows[i];if(a.delay>0){a.delay-=dt;continue;}a.y+=a.speed*dt;if(a.y>=a.targetY){burst(a.targetX,a.targetY,a.color||'#2ec96a',10,{spd:180});for(const e of enemies)if(Math.hypot(a.targetX-e.x,a.targetY-e.y)<50)applyPlayerDamage(e,a.dmg,{color:'#a8ff8b',fxColor:a.color||'#2ec96a'});rainArrows.splice(i,1);}}
for(let i=meteors.length-1;i>=0;i--){const mm=meteors[i];if(mm.delay>0){mm.delay-=dt;continue;}mm.currentY+=700*dt;if(mm.currentY>=mm.targetY){for(const e of enemies)if(Math.hypot(mm.targetX-e.x,mm.targetY-e.y)<mm.R+e.r){applyPlayerDamage(e,mm.dmg,{color:'#ff9060',fxColor:mm.color||'#ff7040',knock:30});}for(let k=0;k<30;k++){const a2=rand(0,6.28),v=rand(100,300);particles.push({x:mm.targetX,y:mm.targetY,vx:Math.cos(a2)*v,vy:Math.sin(a2)*v-100,life:rand(.4,.8),color:k%3===0?'#ffd36a':mm.color,size:rand(3,6),grav:200});}addShake(.35);screenFlash(.3);meteors.splice(i,1);}}
for(const s of slashArcs)s.life-=dt;slashArcs=slashArcs.filter(s=>s.life>0);
for(const l of leaves){l.x+=(l.vx+Math.sin(worldTime*1.6+l.rot)*18)*dt;l.y+=l.vy*dt;l.rot+=l.rotSpeed*dt;if(l.y>WORLD.h+20){l.y=-20;l.x=rand(0,WORLD.w);}}
for(const f of footprints)f.life-=dt*.35;footprints=footprints.filter(f=>f.life>0);
for(const g of dashGhosts)g.life-=dt;dashGhosts=dashGhosts.filter(g=>g.life>0);
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.grav??100)*dt;p.vx*=.98;p.life-=dt;}particles=particles.filter(p=>p.life>0);
for(const f of floating){f.y-=30*dt;f.age+=dt;f.life-=dt;}floating=floating.filter(f=>f.life>0);
if(running&&!portal&&stageClearTimer<=0){const sc=getStageSpawnConfig();const normalEnemies=enemies.filter(e=>!e.summoned&&!e.boss).length;const aliveBoss=enemies.some(e=>e.boss);const aliveStageEnemies=enemies.filter(e=>!e.summoned).length;if(killsInStage<sc.targetKills&&normalEnemies<sc.cap&&aliveStageEnemies<sc.targetKills-killsInStage&&Math.random()<dt/sc.interval)spawnEnemy();else if(killsInStage>=sc.targetKills&&!aliveBoss&&(STAGES[stageIndex].boss!==undefined)&&Math.random()<dt*.8)spawnEnemy(true);}
if(stageClearTimer>0){stageClearTimer-=dt;if(stageClearTimer<=0&&stageIndex>=STAGES.length-1){running=false;clearSave();showScreen('win');}}
if(portal&&!dying){portal.phase+=dt*3;if(Math.random()<.7){const a=Math.random()*Math.PI*2,r=portal.r+rand(-12,20);particles.push({x:portal.x+Math.cos(a)*r,y:portal.y+Math.sin(a)*r,vx:-Math.cos(a)*60,vy:-Math.sin(a)*60,life:.9,color:Math.random()<.5?'#bff0ff':'#7ec8ff',size:rand(2,4),grav:0});}
const dx=player.x-portal.x,dy=player.y-portal.y;const d=Math.hypot(dx,dy);if(d<portal.r+player.r){burst(player.x,player.y,'#9bf3ff',40,{spd:380,life:[.4,.9]});screenFlash(.5);addShake(.35);portal=null;if(stageIndex>=STAGES.length-1){running=false;clearSave();showScreen('win');}else{const nextIdx=stageIndex+1;running=false;showStageIntro(nextIdx,()=>{startStage(nextIdx);running=true;});}}}
cleanupDeadEnemies();
if(hp<=0&&!dying){dying=true;deathTimer=1;timeScale=.25;addShake(.55);screenFlash(.5);}
if(dying){deathTimer-=dt/(timeScale||1);if(deathTimer<=0){dying=false;running=false;timeScale=1;if(stageSnapshot){try{localStorage.setItem(SAVE_KEY,JSON.stringify(stageSnapshot));}catch(e){}refreshContinueUI();}showScreen('death');}}
saveTick-=dt;if(saveTick<=0){saveTick=8;if(running&&!dying&&!paused&&stageClearTimer<=0&&!portal)saveGame();}
updateHud();}

function loop(t){if(!last)last=t;const rawDt=Math.min(.033,(t-last)/1000);last=t;
if(hitStop>0){hitStop-=rawDt;flash=Math.max(0,flash-rawDt*3);shake=Math.max(0,shake-rawDt*1.2);}
else{if(running&&!paused)update(rawDt*timeScale);flash=Math.max(0,flash-rawDt*3);shake=Math.max(0,shake-rawDt*1.1);updateCamera(paused?0:rawDt);}
draw();requestAnimationFrame(loop);}

addEventListener('keydown',e=>{keys[e.key]=true;if(e.code==='Space'){e.preventDefault();attack();}const k=e.key.toLowerCase();if(k==='q')skill1();if(k==='e')skill2();if(k==='r')ultimate();if(e.key==='Escape'){if(paused){document.getElementById('pauseResume').click();}else if(running&&!dying&&!document.querySelector('.screen.active')){document.getElementById('pauseBtn').click();}}});
addEventListener('keyup',e=>keys[e.key]=false);
const joy={x:0,y:0,active:false};
const joyEl=document.getElementById('joy'),stick=document.getElementById('stick');
function joyMove(e){if(!joy.active)return;const r=joyEl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=r.width*.29,d=Math.hypot(dx,dy)||1;if(d>max){dx=dx/d*max;dy=dy/d*max;}joy.x=dx/max;joy.y=dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;}
function joyEnd(){joy.active=false;joy.x=joy.y=0;stick.style.transform='translate(0,0)';}
joyEl.addEventListener('pointerdown',e=>{joy.active=true;try{joyEl.setPointerCapture(e.pointerId)}catch(_){}joyMove(e);});
joyEl.addEventListener('pointermove',joyMove);joyEl.addEventListener('pointerup',joyEnd);joyEl.addEventListener('pointercancel',joyEnd);
document.getElementById('attack').addEventListener('pointerdown',e=>{e.preventDefault();attack();});
document.getElementById('skillBtn').addEventListener('pointerdown',e=>{e.preventDefault();skill1();});
document.getElementById('dashBtn').addEventListener('pointerdown',e=>{e.preventDefault();skill2();});
document.getElementById('ultBtn').addEventListener('pointerdown',e=>{e.preventDefault();ultimate();});
document.getElementById('potionText').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!running||paused||potions<=0||hp>=maxHp)return;potions--;hp=Math.min(maxHp,hp+35);floatText(player.x,player.y-28,'+35 HP','#7dff9b');toast('🧪 Potion digunakan');burst(player.x,player.y,'#7dff9b',14,{spd:140});updateHud();});
document.getElementById('shopBtn').addEventListener('click',()=>{if(dying||!currentChar||paused)return;openShop('free');});
document.getElementById('shopClose').addEventListener('click',()=>closeShop());
document.getElementById('shopNext').addEventListener('click',()=>closeShop());
document.getElementById('pauseBtn').addEventListener('click',()=>{if(!running||dying||paused)return;paused=true;saveGame();showScreen('pauseScreen');});
document.getElementById('pauseResume').addEventListener('click',()=>{paused=false;hideAllScreens();});
document.getElementById('pauseRestart').addEventListener('click',()=>{paused=false;hp=maxHp;showStageIntro(stageIndex,()=>{startStage(stageIndex);running=true;});});
document.getElementById('pauseSettings').addEventListener('click',()=>{settingsReturnScreen='pauseScreen';renderSettingsUI();showScreen('settingsScreen');});
document.getElementById('pauseMenu').addEventListener('click',()=>{saveGame();paused=false;running=false;showScreen('start');});

function showScreen(id){document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));if(id)document.getElementById(id).classList.add('active');if(id==='start')refreshContinueUI();}
function hideAllScreens(){document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));}
function showStageIntro(idx,cb){const st=STAGES[idx];const tier=getDifficultyTier(idx);const pct=Math.round(getStageDifficulty(idx)*100);document.getElementById('siNum').textContent=`STAGE ${idx+1} / 100`;document.getElementById('siName').textContent=st.mapName;document.getElementById('siDesc').textContent=st.desc;const tEl=document.getElementById('siTier');if(tEl){tEl.textContent=`${tier.icon} ${tier.fullName} — ${tier.desc} (${pct}%)`;tEl.style.color=tier.color;}showScreen('stageIntro');setTimeout(()=>{hideAllScreens();cb&&cb();},2400);}
document.getElementById('toContinue').addEventListener('click',continueGame);
document.getElementById('toChar').addEventListener('click',()=>{if(readSave()&&!confirm('Mulai petualangan baru?\nProgress tersimpan akan tertimpa.'))return;buildCharCards();showScreen('charSel');});
document.getElementById('toHowto').addEventListener('click',()=>{const p=document.getElementById('howtoPanel');const open=p.style.display==='none'||!p.style.display;p.style.display=open?'block':'none';document.getElementById('toHowto').textContent=open?'📖 SEMBUNYIKAN':'📖 CARA BERMAIN';});
document.getElementById('toSettings').addEventListener('click',()=>{settingsReturnScreen='start';renderSettingsUI();showScreen('settingsScreen');});
document.getElementById('toAbout').addEventListener('click',()=>showScreen('aboutScreen'));
document.getElementById('settingsBack').addEventListener('click',()=>{showScreen(settingsReturnScreen||'start');settingsReturnScreen='start';});
document.getElementById('aboutBack').addEventListener('click',()=>showScreen('start'));
document.getElementById('resetSettings').addEventListener('click',()=>{settings={...DS};saveSettings();renderSettingsUI();toast('⚙️ Pengaturan di-reset');});

let currentCharCat='all';let selectedCharId=null;
document.querySelectorAll('#charTabs button').forEach(btn=>{btn.onclick=()=>{document.querySelectorAll('#charTabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');currentCharCat=btn.getAttribute('data-cat');buildCharCards();};});
function renderCharacterInfo(id){const ch=CHARACTERS[id];if(!ch)return;const box=document.getElementById('charInfo');const skills=[['SKILL 1',ch.sk1],['SKILL 2',ch.sk2],['ULTIMATE',ch.ult]];const role={melee:'⚔️ MELEE',magic:'🔮 MAGIC',ranged:'🏹 RANGED',special:'✨ SPECIAL',summoner:'🐉 SUMMONER',hybrid:'💫 HYBRID'}[ch.cat]||ch.cat;box.innerHTML=`<div class="charInfoHead"><div class="charInfoIcon">${ch.icon}</div><div><div class="charInfoName" style="color:${ch.color}">${ch.name}</div><div class="charInfoRole">${role}</div></div></div><div class="charInfoSub">${ch.sub}</div><div class="skillInfoGrid">${skills.map(([slot,sk])=>{const d=describeSkill(sk,slot);return `<div class="skillInfo"><div class="siTop"><span>${sk.icon}</span><span>${slot} · ${sk.name}</span></div><div class="siDesc">${d.desc}</div><span class="siCd">⏱️ Cooldown ${d.cd}s</span></div>`}).join('')}</div>`;}
function enterFullscreen(){const el=document.documentElement;try{if(!document.fullscreenElement&&el.requestFullscreen){const p=el.requestFullscreen({navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}}catch(e){}try{if(screen.orientation&&screen.orientation.lock){const p=screen.orientation.lock('landscape');if(p&&p.catch)p.catch(()=>{});}}catch(e){}}
function buildCharCards(){const cont=document.getElementById('charCards');const prevScroll=cont.scrollTop;cont.innerHTML='';const sel=selectedCharId||(currentChar?currentChar.id:'fighter');const entries=Object.entries(CHARACTERS).filter(([id,ch])=>{if(currentCharCat==='all')return true;return ch.cat===currentCharCat;});document.getElementById('charCount').textContent=Object.keys(CHARACTERS).length;
entries.forEach(([id,ch])=>{const card=document.createElement('button');card.className='card'+(id===sel?' sel':'');card.setAttribute('data-id',id);const catLabel={melee:'MELEE',magic:'MAGIC',ranged:'RANGED',special:'SPECIAL',summoner:'SUMMONER',hybrid:'HYBRID'}[ch.cat]||'';card.innerHTML=`<div class="clsTag cls-${ch.cat||'melee'}">${catLabel}</div><div class="previewWrap"><canvas class="preview" width="96" height="96"></canvas></div><div class="nm" style="color:${ch.color}">${ch.name}</div><div class="sub2">${ch.sub}</div><div class="stats2"><span>❤️${ch.hp}</span><span>⚔️${ch.atk}</span><span>💨${ch.speed}</span></div>`;card.onclick=()=>{selectedCharId=id;renderCharacterInfo(id);cont.querySelectorAll('.card').forEach(el=>el.classList.remove('sel'));card.classList.add('sel');};cont.appendChild(card);
const prev=card.querySelector('.preview'),pctx=prev.getContext('2d');pctx.imageSmoothingEnabled=false;pctx.clearRect(0,0,96,96);pctx.save();pctx.translate(48,68);pctx.scale(.82,.82);pctx.fillStyle='rgba(0,0,0,.35)';pctx.beginPath();pctx.ellipse(0,16,15,5,0,0,Math.PI*2);pctx.fill();drawHero(pctx,ch,1,0,{});pctx.restore();});
cont.scrollTop=prevScroll;renderCharacterInfo(sel);
document.getElementById('charNext').onclick=()=>{const id=selectedCharId||(currentChar?currentChar.id:'fighter');currentChar=CHARACTERS[id];currentChar.id=id;applyCharButtons();enterFullscreen();beginRun();};}
function applyCharButtons(){const c=currentChar;if(!c)return;document.getElementById('skillBtn').querySelector('.ico').textContent=c.sk1.icon;document.getElementById('skillBtn').querySelector('.lbl').textContent=c.sk1.name.slice(0,6);document.getElementById('dashBtn').querySelector('.ico').textContent=c.sk2.icon;document.getElementById('dashBtn').querySelector('.lbl').textContent=c.sk2.name.slice(0,6);document.getElementById('ultBtn').querySelector('.ico').textContent=c.ult.icon;document.getElementById('ultBtn').querySelector('.lbl').textContent=c.ult.name.slice(0,4);document.getElementById('attack').querySelector('.ico').textContent=c.icon;}
document.getElementById('charBack').addEventListener('click',()=>showScreen('start'));

function startStage(idx){stageIndex=idx;killsInStage=0;stageClearTimer=0;portal=null;enemies=[];projectiles=[];rainArrows=[];meteors=[];allies=[];particles=[];floating=[];dashGhosts=[];footprints=[];ripples=[];leaves=[];slashArcs=[];SKILL_VFX.length=0;currentAimTarget=null;warningZones=[];
player.x=WORLD.w/2;player.y=WORLD.h/2;player.inv=1.5;
player.attackCd=player.skillCd=player.dashCd=player.ultCd=0;
player.dashTime=player.defendTimer=player.attackAnim=0;
player.buffTimer=0;player.buffAtkMult=1;player.buffSpeedMult=1;
player.lifesteal=0;player.invisible=0;player.regen=0;player.isDashing=false;
if(player.status){player.status.poison=0;player.status.burn=0;player.status.freeze=0;player.status.shock=0;player.status.slow=0;}
genWorld();
const st=STAGES[idx];const spawnCfg=getStageSpawnConfig();
const initialCount=st.pool.length===0?1:Math.min(spawnCfg.cap,Math.max(1,spawnCfg.initial));
for(let i=0;i<initialCount;i++)spawnEnemy();
document.getElementById('zone').textContent=st.mapName;
stageCleared=false;
updateHud();updateCamera(1);
saveGame();
stageSnapshot=collectSave();}
function beginRun(){level=1;xp=0;maxHp=currentChar.hp;hp=maxHp;atk=currentChar.atk;player.speed=currentChar.speed;player.shieldReduction=0.5;totalGold=0;potions=0;totalKills=0;stageIndex=0;shopHistory={};genWorld();showStageIntro(0,()=>{startStage(0);running=true;});}
document.getElementById('retryStage').addEventListener('click',()=>{hp=maxHp;showStageIntro(stageIndex,()=>{startStage(stageIndex);running=true;});});
document.getElementById('toMenu').addEventListener('click',()=>{running=false;showScreen('start');});
document.getElementById('playAgain').addEventListener('click',()=>{clearSave();showScreen('start');});

loadSettings();
resize();
genWorld();
player.x=WORLD.w/2;player.y=WORLD.h/2;
currentChar=CHARACTERS.fighter;currentChar.id='fighter';
selectedCharId='fighter';
applyCharButtons();
updateCamera(1);
refreshContinueUI();
showScreen('start');
requestAnimationFrame(loop);
