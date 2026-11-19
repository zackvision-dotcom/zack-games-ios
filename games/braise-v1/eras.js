/* =====================================================================
   Braise · the eight eras of the lineage and the Deus mode.
   build.py inserts this file inside the game's closure (just before boot), so it can wrap the
   engine's functions. The canon comes from the project's bible and "Les lieux de la lignée"
   (games/braise-v1/ref): one heir, one real place and one landmark per era.
   Each built era brings its OWN art (eras/eraN-art.js → BRAISE_ERA_ART[i]): heir, fauna, flora,
   places, ground, plus a map layout here. Eras not built yet are listed but cannot be entered.
   Mode Deus (5 quick taps on the title logo): invulnerable, all built eras open, teleportation
   between the eras and to the places of the current era.
   ===================================================================== */
const ERA_KEY='braise_era_current',ERA_UNLOCK_KEY='braise_eras_unlocked',DEUS_KEY='braise_deus';
const lsGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
let eraIdx=0,deus=false;
const KA_DRAW=BRAISE_ART.drawKa;

const ERAS=[
 {n:'I',name:'L’Étincelle',place:'Les gorges d’Olduvai',heir:'Ka',ready:true,source:'l’acacia foudroyé',sourceName:'Acacia foudroyé',
  intro:'La foudre a laissé du feu. Il faut le capturer avant la nuit.',end:'Trois nuits. Une flamme. Ka transmet la Braise à sa lignée.'},
 {n:'II',name:'Le Grand Froid',place:'La vallée de la Vézère',heir:'Néa',ready:true,source:'le foyer du clan',sourceName:'Foyer du clan',
  names:{pine:'Pin sylvestre',oak:'Bouleau',dead:'Mélèze brisé',boulder:'Bloc de calcaire',tuft:'Touffe de la steppe',berry:'Airelles',carrot:'Bistorte',reeds:'Laîche gelée',sapling:'Saule nain',flower:'Fleur de la toundra',hole:'Terrier',den:'Tanière des loups',cave:'Abri sous roche',waterhole:'Mare gelée',carcass:'Carcasse de renne',mushroom:'Champignon'},
  mobs:{antelope:'Renne',hyena:'Loup',machairodont:'Lion des cavernes',rabbit:'Lièvre variable'},beasts:['loup','loups'],
  layout:[['lascaux',[-560,-760]],['cliff',[980,-560],0],['cliff',[1420,-300],1],['cliff',[-1260,360],2],['cliff',[-1560,620],3],['cliff',[420,1260],4],['cliff',[-260,1420],5],['tent',[-320,210]],['tent',[330,230],1]],
  intro:'Le froid a tout recouvert. Le foyer du clan garde la dernière flamme.',end:'Le Grand Froid n’a pas éteint la Braise. Néa a peint la mémoire de la lignée sur la paroi.'},
 {n:'III',name:'La Graine',place:'Stonehenge',heir:'Oro'},
 {n:'IV',name:'Le Bronze',place:'Le plateau de Gizeh',heir:'Bryn'},
 {n:'V',name:'L’Empire',place:'Rome · Le Colisée',heir:'—'},
 {n:'VI',name:'La Cathédrale',place:'Paris · Notre-Dame, 1250',heir:'—'},
 {n:'VII',name:'La Vapeur',place:'Paris · 1889',heir:'Ada'},
 {n:'VIII',name:'Le Signal',place:'Nouvelle Babel',heir:'Aïon'}
];
const era=()=>ERAS[eraIdx];
const ART=()=>eraIdx&&window.BRAISE_ERA_ART?BRAISE_ERA_ART[eraIdx]:null;
const ready=i=>!!ERAS[i].ready&&(i===0||!!(window.BRAISE_ERA_ART&&BRAISE_ERA_ART[i]));
const unlocked=()=>{const n=+lsGet(ERA_UNLOCK_KEY)||1;return clamp(n,1,ERAS.length);};
const unlock=n=>{if(n>unlocked())lsSet(ERA_UNLOCK_KEY,String(Math.min(n,ERAS.length)));};

/* ---------- landmarks: large set pieces with a rectangular footprint ---------- */
const landmarkArt=id=>(window.BraiseLandmarkSets||[]).find(l=>l.id===id);
const LMT={
 lascaux:{name:'Paroi peinte de Lascaux',w:880,h:290,foot:[-412,-40,412,8],draw:(g)=>{const L=landmarkArt('lascaux');if(L)L.draw(g,0);}},
 cliff:{name:'Falaise calcaire',w:560,h:236,foot:[-258,-40,258,6],draw:(g,v)=>ART().places.cliff(g,v)},
 tent:{name:'Tente de peaux',w:170,h:214,foot:[-64,-26,64,6],draw:(g)=>ART().places.tent(g)}
};
const BASE_NAMES={};for(const k in DEF)BASE_NAMES[k]=DEF[k].name;
for(const t in LMT)DEF[t]={name:LMT[t].name,sh:0};
const lmList=()=>statics.filter(e=>!e.dead&&LMT[e.type]);
function inFoot(e,x,y,r){const f=LMT[e.type].foot;return x>e.x+f[0]-r&&x<e.x+f[2]+r&&y>e.y+f[1]-r&&y<e.y+f[3]+r;}

/* ---------- applying an era's look ---------- */
const sprite=(w,h,fn)=>makeSprite(w,h,w/2,h-10,g=>{g.translate(w/2,h-10);fn(g);});
function applyEraVisuals(i){
 eraIdx=clamp(i|0,0,ERAS.length-1);if(!ready(eraIdx))eraIdx=0;
 buildSprites();applySavannaSprites();
 for(const k in BASE_NAMES)DEF[k].name=BASE_NAMES[k];
 BRAISE_ART.drawKa=KA_DRAW;
 const A=ART(),E=era();
 if(A){
  const F=A.flora,Pl=A.places;
  S.pine=[.78,1,1.24].map(k=>[0,1,2].map(v=>sprite(170*k,270*k,g=>F.pine(g,k,101+v*13))));
  S.oak=[0,1,2,3].map(v=>sprite(130,236,g=>F.oak(g,v)));
  S.dead=[0,1,2].map(v=>sprite(90,200,g=>F.dead(g,v)));
  S.tuft=[0,1].map(p=>sprite(76,74,g=>F.tuft(g,!!p)));
  S.berry=[0,1,2].map(v=>[0,1].map(p=>sprite(90,56,g=>F.berry(g,!!p,v))));
  S.boulder=[0,1,2].map(v=>[0,1,2].map(st=>sprite(116,90,g=>F.boulder(g,v,st))));
  S.carrot=sprite(40,52,g=>F.carrot(g));S.reeds=[0,1,2].map(v=>sprite(76,84,g=>F.reeds(g,v)));
  S.flower=[0,1,2,3,4].map(v=>sprite(30,40,g=>F.flower(g,v)));
  S.sap=[0,1].map(p=>sprite(70,60,g=>F.sapling(g,!!p)));
  S.cave=makeSprite(330,240,165,228,g=>{g.translate(165,228);Pl.cave(g);});
  S.waterhole=makeSprite(230,90,115,45,g=>{g.translate(115,45);g.scale(1.34,1.34);Pl.waterhole(g);});
  S.den=makeSprite(150,110,75,98,g=>{g.translate(75,98);Pl.den(g);});
  S.carcass=makeSprite(150,80,75,65,g=>{g.translate(75,65);Pl.carcass(g);});
  for(let b=1;b<=4;b++)BCOL[b]=A.bcol[b-1].slice();
  if(E.names)for(const k in E.names)if(DEF[k])DEF[k].name=E.names[k];
  BRAISE_ART.drawKa=A.heir;
  for(const t in LMT)if(t!=='lascaux'||landmarkArt('lascaux'))S['lm_'+t]=[0,1,2,3,4,5].map(v=>makeSprite(LMT[t].w,LMT[t].h,LMT[t].w/2,LMT[t].h-14,g=>{g.translate(LMT[t].w/2,LMT[t].h-14);LMT[t].draw(g,v);}));
 }
 chunkCache.clear();
}

/* ---------- engine hooks ---------- */
const _setSpr=setSpr;
setSpr=function(e){if(LMT[e.type]){e.spr=(S['lm_'+e.type]||[])[e.v||0]||null;return;}_setSpr(e);};

const _pushCaveWalls=pushCaveWalls;
pushCaveWalls=function(m,r){_pushCaveWalls(m,r);
 for(const e of statics){if(e.dead||!LMT[e.type]||Math.abs(e.x-m.x)>520||Math.abs(e.y-m.y)>120)continue;if(!inFoot(e,m.x,m.y,r))continue;
  const f=LMT[e.type].foot,x0=e.x+f[0]-r,x1=e.x+f[2]+r,y0=e.y+f[1]-r,y1=e.y+f[3]+r,d=[m.x-x0,x1-m.x,m.y-y0,y1-m.y],k=d.indexOf(Math.min(...d));
  if(k===0)m.x=x0;else if(k===1)m.x=x1;else if(k===2)m.y=y0;else m.y=y1;}
};
const _placeValid=placeValid;
placeValid=function(x,y,id){return _placeValid(x,y,id)&&!lmList().some(e=>inFoot(e,x,y,24));};

const _genWorld=genWorld;
genWorld=function(){
 _genWorld();
 const E=era();if(!E.layout||!ART())return;
 const natural=['pine','oak','dead','boulder','sapling','tuft','berry','carrot','flower','mushroom','reeds','hole','den','item'];
 for(const [type,[wx,wy],v] of E.layout){const L=LMT[type],f=L.foot;let spot=null;
  for(let t=0;t<48&&!spot;t++){const a=t*2.4,rr=t*30,x=wx+Math.cos(a)*rr,y=wy+Math.sin(a)*rr;
   if(!isLand(x+f[0],y)||!isLand(x+f[2],y)||!isLand(x,y-L.h*.5)||!isLand(x,y+60)||Math.hypot(x,y)<260)continue;
   const busy=statics.some(e=>!e.dead&&(LMT[e.type]?Math.abs(e.x-x)<(LMT[e.type].w+L.w)/2+40&&Math.abs(e.y-y)<(LMT[e.type].h+L.h)/2:(['cave','waterhole','campfire','firepit','carcass'].includes(e.type)||e.sourceFire)&&Math.abs(e.x-x)<L.w/2+180&&e.y>y-L.h-120&&e.y<y+220));
   if(!busy)spot={x,y};}
  if(!spot)continue;
  for(const e of statics.slice())if(!e.dead&&natural.includes(e.type)&&e.x>spot.x+f[0]-70&&e.x<spot.x+f[2]+70&&e.y>spot.y-L.h*.7&&e.y<spot.y+(type==='lascaux'?300:120))kill(e);
  mk(type,spot.x,spot.y,{v:v||0});}
 for(const d of dens)if(!d.dead&&lmList().some(e=>inFoot(e,d.x,d.y,60)))kill(d);
};

const _genChunk=genChunk;
genChunk=function(cx,cy){
 const cv=_genChunk(cx,cy),A=ART();if(!A||!A.ground)return cv;
 const g=cv.getContext('2d'),x0=cx*CH,y0=cy*CH;
 const land=(px,py)=>{const x=x0+px,y=y0+py;return coastVal(x,y)<.95?biomeAt(x,y):0;};
 g.save();A.ground(g,{x0,y0,CH,land,fbm,seed,rng:mulberry(chunkSeed(cx,cy)+911)});g.restore();return cv;
};

/* the era's own source of fire */
const _drawEnt=drawEnt;
drawEnt=function(e){
 const A=ART();if(!e.sourceFire||!A){_drawEnt(e);return;}
 const lit=e.fuel>0;ctx.save();ctx.translate(e.x,e.y);if(hoverEnt===e){ctx.shadowColor='#f4bb63';ctx.shadowBlur=8;}
 A.places.source(ctx,lit);ctx.restore();if(lit)drawFlames(e.x,e.y-10,.46,e.x);
};
/* the era's own animals, in the same roles (grazing herd, night pack, last-night predator) */
const _drawSavannaMob=drawSavannaMob;
drawSavannaMob=function(m,dy){
 const A=ART();if(!A){_drawSavannaMob(m,dy);return;}
 ctx.save();ctx.translate(m.x,m.y);ctx.scale(m.face||1,1);
 if(dy){ctx.rotate(dy*1.8);ctx.scale(1,1-dy*.65);}
 const opts={moving:m.moving,speed:m.speed||0,state:m.state,attack:m.atk||0,time:realTime};
 if(m.kind==='machairodont'){ctx.scale(1.45,1.45);A.mobs.machairodont(ctx,m.walk||0,opts);}else if(m.kind==='antelope')A.mobs.antelope(ctx,m.walk||0,opts);else A.mobs.hyena(ctx,m.walk||0,m.state==='stalk'||m.atk>0,opts);
 ctx.restore();
};

const _getAction=getAction;
getAction=function(e){const a=_getAction(e);if(!a||!e)return a;const E=era();
 if(e.sourceFire)a.name=E.sourceName;
 else if(e.kind&&E.mobs&&E.mobs[e.kind])a.name=E.mobs[e.kind];
 return a;};

const _say=say;
say=function(text,dur){
 if(eraIdx&&typeof text==='string'){const E=era();
  if(text===ERAS[0].intro)text=E.intro;
  const h=E.beasts;if(h)text=text.replace(/([Hh])yènes/g,(m,c)=>(c==='H'?h[1][0].toUpperCase():h[1][0])+h[1].slice(1)).replace(/([Hh])yène/g,(m,c)=>(c==='H'?h[0][0].toUpperCase():h[0][0])+h[0].slice(1));
  text=text.replace(/\bKa\b/g,E.heir);}
 _say(text,dur);};
const _hurtPlayer=hurtPlayer;
hurtPlayer=function(d,src,cause){if(deus)return;_hurtPlayer(d,src,cause);};

const _eraUpdate=eraUpdate;
eraUpdate=function(dt,prev){
 if(deus&&mode==='play'&&!P.dead){P.hp=P.maxHp;P.hunger=P.maxHunger;P.san=P.maxSan;P.darkT=0;if(eraState.captured)eraState.ember=180;}
 _eraUpdate(dt,prev);
 const badge=document.getElementById('emberStatus');
 if(badge&&!eraState.won)badge.textContent=(deus?'✦ Deus · ':'')+'Ère '+era().n+' · '+(shelterAt(P)?'À l’abri · ':'')+(eraState.captured?'Braise : '+Math.ceil(eraState.ember)+' s · Nuits '+eraState.nights+'/3':'Capturer le feu : '+era().source);
};

function setEraGoals(){const E=era();
 goals.splice(0,goals.length,
  {t:'Trouver deux os sur une carcasse',ok:()=>count('bone')>=2||P.stats.crafted.emberHorn},
  {t:'Fabriquer la corne à braise',ok:()=>P.stats.crafted.emberHorn},
  {t:'Capturer le feu : '+E.source,ok:()=>P.stats.captured},
  {t:'Construire et alimenter un foyer',ok:()=>P.stats.placedFire},
  {t:'Tenir face au prédateur de la dernière nuit',ok:()=>['repelled','defeated','survived'].includes(eraState.encounter)||eraState.won},
  {t:'Garder la Braise pendant trois nuits',ok:()=>eraState.nights>=3});
 renderGoals();
}

function deusKit(){for(const [id,n] of [['spear',1],['torch',1],['axe',1],['pickaxe',1],['emberHorn',1],['log',20],['grass',20],['twigs',20],['flint',10],['rocks',20],['bone',6],['cmorsel',10]])if(ITEMS[id]&&!count(id))addItem(id,n,P.x,P.y);invDirty=true;}

const _newGame=newGame;
newGame=function(){
 _newGame();setEraGoals();lsSet(ERA_KEY,String(eraIdx));lsSet(DEUS_KEY,deus?'1':'0');
 dayBanner={text:'Ère '+era().n+' · '+era().name,t:0};
 if(deus){deusKit();showDeusButton(true);setTimeout(()=>say('Mode Deus : je traverse les âges. Touche ✦ pour te téléporter.',5),6500);}
 else showDeusButton(false);
 saveGame();
};

function startEra(i){
 if(!ready(i))return;
 flash=1;sfx.ignite();
 applyEraVisuals(i);
 const t=document.getElementById('title');if(t)t.hidden=true;
 const end=document.getElementById('eraEnding');if(end)end.hidden=true;
 audioInit();if(AU.c&&AU.c.state==='suspended')AU.c.resume();
 newGame();
}

const _loadGame=loadGame;
loadGame=function(){
 const i=+lsGet(ERA_KEY)||0;if(i!==eraIdx)applyEraVisuals(i);
 deus=lsGet(DEUS_KEY)==='1';
 const ok=_loadGame();
 if(ok){setEraGoals();showDeusButton(deus);}
 return ok;
};

showEraEnding=function(){
 const E=era(),nextI=eraIdx+1,next=ERAS[nextI],open=next&&ready(nextI);if(next)unlock(nextI+1);
 let el=document.getElementById('eraEnding');
 if(!el){el=document.createElement('div');el.className='ov';el.id='eraEnding';el.style.cssText='background:rgba(13,11,14,.88);z-index:25';gameEl.appendChild(el);}
 el.innerHTML='<h2>Ère '+E.n+' · '+E.name+'</h2><p>'+E.end+'</p>'+(next&&!open?'<p class="best">L’ère '+next.n+' · '+next.name+' arrive dans une prochaine mise à jour.</p>':'')+(next?'':'<p class="best">Tu as porté la Braise à travers les huit ères.</p>')+'<p class="best" id="eraSaveResult">Enregistrement de la fin du chapitre…</p>'
  +(open?'<button class="big" id="eraNext">Transmettre la Braise · Ère '+next.n+'</button>':'')+'<button class="big" id="eraRestart">'+(open?'Rejouer cette ère':'Rejouer cette ère')+'</button>';
 const nb=document.getElementById('eraNext');if(nb)nb.onclick=()=>{el.hidden=true;startEra(nextI);};
 document.getElementById('eraRestart').onclick=()=>{el.hidden=true;startEra(eraIdx);};
 el.hidden=false;
};

/* ---------- Mode Deus: the teleportation power ---------- */
const deusCss=document.createElement('style');deusCss.textContent=`
#deusBtn{position:absolute;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));z-index:30;width:48px;height:48px;border-radius:50%;border:2px solid rgba(250,226,150,.85);background:radial-gradient(circle at 40% 35%,rgba(255,214,120,.95),rgba(150,70,20,.95));color:#2a1406;font:700 26px/1 Georgia,serif;box-shadow:0 0 18px rgba(255,190,90,.7);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#deusBtn[hidden]{display:none}
#deusPanel{position:absolute;inset:0;z-index:35;background:rgba(10,8,14,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;box-sizing:border-box;color:#f4e2bc;font-family:Georgia,serif;overflow:auto}
#deusPanel[hidden]{display:none}
#deusPanel h2{margin:0;font-size:20px;letter-spacing:.08em;color:#ffd98a}
#deusPanel .row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:760px}
#deusPanel button{border:1px solid rgba(250,220,150,.6);background:rgba(60,34,18,.9);color:#f6e6c4;border-radius:10px;padding:8px 12px;font:14px Georgia,serif;touch-action:manipulation}
#deusPanel button.on{background:rgba(190,110,40,.95);color:#1d0f05}
#deusPanel button:disabled{opacity:.38}
#deusPanel small{opacity:.7}
#deusTitle{margin-top:6px}`;
document.head.appendChild(deusCss);
let deusBtn=null,deusPanel=null;
function showDeusButton(on){
 if(!deusBtn){deusBtn=document.createElement('button');deusBtn.id='deusBtn';deusBtn.type='button';deusBtn.textContent='✦';deusBtn.title='Pouvoir de téléportation';deusBtn.setAttribute('aria-label','Pouvoir de téléportation');
  deusBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();openDeusPanel();});gameEl.appendChild(deusBtn);}
 deusBtn.hidden=!on;
}
function placesOfEra(){
 const out=[['Le campement',0,-30]];
 const src=statics.find(e=>e.sourceFire&&!e.dead);if(src)out.push([era().sourceName,src.x+90,src.y+40]);
 const cv=caves.find(c=>!c.dead);if(cv)out.push([DEF.cave.name,cv.x,cv.y+80]);
 const wh=waterholes.find(w=>!w.dead);if(wh)out.push([DEF.waterhole.name,wh.x,wh.y+110]);
 const seen={};for(const e of lmList()){if(e.type==='tent')continue;seen[e.type]=(seen[e.type]||0)+1;if(seen[e.type]>2)continue;out.push([DEF[e.type].name+(seen[e.type]>1?' ('+seen[e.type]+')':''),e.x,e.y+LMT[e.type].foot[3]+70,LMT[e.type].h>200]);}
 const den=dens.find(d=>!d.dead&&d.hyenaHome);if(den)out.push([DEF.den.name,den.x+160,den.y+60]);
 return out;
}
function teleport(x,y){
 burst('spark',P.x,P.y,40,26,{});flash=1;sfx.ignite();
 P.x=x;P.y=y;P.target=null;P.moveTo=null;P.moving=false;P.vx=P.vy=0;cam.x=x;cam.y=y-30;
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)chunk(Math.floor(x/CH)+i,Math.floor(y/CH)+j,true);
 burst('spark',x,y,40,26,{});
}
function openDeusPanel(){
 if(!deusPanel){deusPanel=document.createElement('div');deusPanel.id='deusPanel';gameEl.appendChild(deusPanel);}
 if(!paused&&mode==='play')togglePause();const pz=document.getElementById('pause');if(pz)pz.hidden=true;
 const places=placesOfEra();
 deusPanel.innerHTML='<h2>✦ Pouvoir de téléportation</h2><small>Voyager entre les ères</small><div class="row" id="dpEras">'+ERAS.map((E,i)=>'<button data-era="'+i+'" class="'+(i===eraIdx?'on':'')+'"'+(ready(i)?'':' disabled')+'>'+E.n+' · '+E.name+(ready(i)?'':' · bientôt')+'</button>').join('')+'</div>'
  +'<small id="deusTitle">Se téléporter · Ère '+era().n+' · '+era().place+'</small><div class="row" id="dpPlaces">'+places.map((p,i)=>'<button data-p="'+i+'">'+p[0]+'</button>').join('')+'</div><div class="row"><button id="dpClose">Fermer</button></div>';
 deusPanel.hidden=false;
 const close=()=>{deusPanel.hidden=true;if(paused)togglePause();const pz=document.getElementById('pause');if(pz)pz.hidden=true;};
 deusPanel.querySelector('#dpClose').onclick=close;
 deusPanel.querySelectorAll('[data-era]').forEach(b=>b.onclick=()=>{if(b.disabled)return;deusPanel.hidden=true;paused=false;const pz=document.getElementById('pause');if(pz)pz.hidden=true;startEra(+b.dataset.era);});
 deusPanel.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const p=places[+b.dataset.p];close();userZoom=p[3]?.7:1;teleport(p[1],p[2]);});
}

/* ---------- title: hidden Deus switch (5 quick taps on the logo) and the unlocked eras ---------- */
function decorateTitle(){
 const T=document.getElementById('title');if(!T||T.dataset.eras)return;T.dataset.eras='1';
 let n=0,t=0;
 T.addEventListener('pointerdown',e=>{const h=e.target.closest&&e.target.closest('#title h1');if(!h)return;const now=Date.now();n=now-t<1500?n+1:1;t=now;if(n>=5){n=0;revealDeus();}},true);
 const open=ERAS.map((E,i)=>i).filter(i=>i<unlocked()&&ready(i));
 if(open.length>1){const row=document.createElement('div');row.className='eraRow';row.style.cssText='display:flex;flex-wrap:wrap;gap:5px;justify-content:center;max-width:720px;margin-top:-6px';
  row.innerHTML=open.map(i=>'<button style="font:12px Georgia,serif;padding:4px 9px;border-radius:8px;border:1px solid rgba(240,214,160,.55);background:'+(i===eraIdx?'rgba(190,110,40,.9)':'rgba(40,24,14,.8)')+';color:#f6e6c4" data-start-era="'+i+'">'+ERAS[i].n+' · '+ERAS[i].name+'</button>').join('');
  row.querySelectorAll('[data-start-era]').forEach(b=>b.onclick=()=>{deus=false;startEra(+b.dataset.startEra);});
  T.appendChild(row);}
}
function revealDeus(){
 const T=document.getElementById('title');if(!T||document.getElementById('btnDeus'))return;
 const b=document.createElement('button');b.className='big';b.id='btnDeus';b.textContent='✦ Mode Deus · voyager entre les ères';b.style.cssText='background:linear-gradient(#f6c45e,#b8661e);color:#1d0f05';
 b.onclick=()=>{deus=true;unlock(ERAS.length);startEra(eraIdx);};
 const st=document.getElementById('btnStart');if(st)st.insertAdjacentElement('afterend',b);else T.appendChild(b);sfx.ignite();
}

const _boot=boot;
boot=function(){
 _boot();
 const i=+lsGet(ERA_KEY)||0;
 if(i&&ready(i)){applyEraVisuals(i);genWorld();for(let a=-2;a<=1;a++)for(let b=-2;b<=1;b++)chunk(a,b,true);}
 setEraGoals();decorateTitle();
 window.BRAISE_ERAS={era:()=>eraIdx,start:startEra,deus:on=>{deus=!!on;showDeusButton(deus);if(deus)deusKit();},places:placesOfEra,teleport};
};
