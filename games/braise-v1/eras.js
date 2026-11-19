/* =====================================================================
   Braise · the eight eras and the Deus mode.
   build.py inserts this file inside the game's closure (just before boot), so it can use
   and wrap the engine's functions directly. Each era reuses the era I gameplay (find the
   era's sacred fire, carry the Braise in the ember horn, keep a hearth alive for three
   nights) in a new world: its own ground, flora, landmarks, sacred fire and names.
   Mode Deus (5 quick taps on the title logo): invulnerable, every era unlocked, a
   teleportation power between the eras and to the places of the current era.
   ===================================================================== */
const ERA_KEY='braise_era_current',ERA_UNLOCK_KEY='braise_eras_unlocked',DEUS_KEY='braise_deus';
const lsGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
let eraIdx=0,deus=false;

/* ---------- small drawing kit for the landmarks (ink style of the game) ---------- */
const lmSprite=(w,h,fn)=>makeSprite(w,h,w/2,h-8,g=>{g.translate(w/2,h-8);fn(g);});
function inkCurve(g,p,lw,col){const path=()=>{g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length-1;i++){const mx=(p[i][0]+p[i+1][0])/2,my=(p[i][1]+p[i+1][1])/2;g.quadraticCurveTo(p[i][0],p[i][1],i===p.length-2?p[i+1][0]:mx,i===p.length-2?p[i+1][1]:my);}if(p.length===2)g.lineTo(p[1][0],p[1][1]);};g.lineCap='round';g.lineJoin='round';path();g.strokeStyle=INK;g.lineWidth=lw+4;g.stroke();path();g.strokeStyle=col;g.lineWidth=lw;g.stroke();}
const rect=(g,x,y,w,h,col,lw)=>{poly(g,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);fillInk(g,col,lw==null?2:lw);};
function arch(g,x,y,w,h,col){g.beginPath();g.moveTo(x,y);g.lineTo(x,y-h+w/2);g.arc(x+w/2,y-h+w/2,w/2,Math.PI,0);g.lineTo(x+w,y);g.closePath();fillInk(g,col,1.6);}
function bricks(g,x0,y0,x1,y1,sp,col){g.save();g.beginPath();g.rect(x0,y0,x1-x0,y1-y0);g.clip();g.strokeStyle=col;g.lineWidth=1;for(let y=y0,r=0;y<y1;y+=sp,r++){g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();for(let x=x0+(r%2?sp:0);x<x1;x+=sp*2){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+sp);g.stroke();}}g.restore();}

const LM={
 mammoth(g){ // mammoth skeleton half buried in the snow
  ell(g,0,-4,120,16);g.fillStyle='rgba(225,233,240,.9)';g.fill();
  for(let i=0;i<7;i++){const x=-70+i*20,h=50+Math.sin(i/6*Math.PI)*40;g.beginPath();g.moveTo(x,-6);g.quadraticCurveTo(x+14,-h,x+30,-h*.55);g.lineWidth=7;g.strokeStyle='#1b1612';g.stroke();g.lineWidth=4;g.strokeStyle='#e8dcc0';g.stroke();}
  inkLine(g,[[-80,-60],[-20,-92],[50,-70]],6,'#e8dcc0');
  ell(g,78,-58,22,17);fillInk(g,'#e8dcc0',2);ell(g,82,-60,5,4);g.fillStyle='#1b1612';g.fill();
  inkCurve(g,[[92,-48],[132,-30],[140,-70],[118,-92]],5,'#f1e6cc');inkCurve(g,[[86,-44],[116,-16],[128,-48],[110,-70]],4,'#f1e6cc');
 },
 menhir(g){poly(g,[[-20,0],[-24,-60],[-14,-128],[6,-140],[20,-100],[22,0]]);fillInk(g,'#8d8577',2.2);line(g,[[-8,-30],[-4,-100]],1.2,'#b5ac9c');for(const y of [-50,-80,-110]){g.strokeStyle='rgba(40,34,26,.5)';g.lineWidth=1;g.beginPath();g.arc(0,y,6,0,TAU);g.stroke();}},
 dolmen(g){rect(g,-62,-62,22,62,'#857d6e');rect(g,40,-60,22,60,'#857d6e');rect(g,-18,-56,30,56,'#6f685c');poly(g,[[-86,-58],[-70,-84],[70,-90],[88,-62],[60,-54],[-60,-52]]);fillInk(g,'#9a9282',2.4);poly(g,[[-40,0],[-40,-40],[30,-40],[30,0]]);g.fillStyle='rgba(20,16,12,.55)';g.fill();},
 hut(g){ell(g,0,-2,70,14);g.fillStyle='rgba(60,40,22,.4)';g.fill();rect(g,-56,-52,112,52,'#9a7a52');poly(g,[[-74,-46],[0,-128],[74,-46]]);fillInk(g,'#c6a25c',2.4);for(let i=-60;i<=60;i+=10)line(g,[[i,-48],[i*.2,-118]],1,'rgba(90,64,26,.6)');rect(g,-14,-40,28,40,'#3a2a1a');},
 pyramid(g){
  poly(g,[[-250,0],[0,-292],[250,0]]);fillInk(g,'#d6b578',2.6);poly(g,[[0,-292],[250,0],[40,0]]);g.fillStyle='rgba(120,84,40,.35)';g.fill();
  g.strokeStyle='rgba(110,80,40,.5)';g.lineWidth=1;for(let i=1;i<14;i++){const y=-i*21,k=1-i*21/292;g.beginPath();g.moveTo(-250*k,y);g.lineTo(250*k,y);g.stroke();}
  poly(g,[[-10,-292],[0,-300],[10,-292],[0,-282]]);fillInk(g,'#f1cf5e',1.4);rect(g,-16,-30,32,30,'#3b2c1a',1.6);
 },
 obelisk(g){poly(g,[[-16,0],[-11,-214],[0,-232],[11,-214],[16,0]]);fillInk(g,'#c9a46a',2.2);poly(g,[[-11,-214],[0,-232],[11,-214]]);fillInk(g,'#f1cf5e',1.4);g.fillStyle='rgba(80,56,28,.55)';for(let y=-196;y<-20;y+=16){g.fillRect(-5,y,3,7);g.fillRect(2,y+4,3,5);}rect(g,-26,-8,52,10,'#b2915c',1.6);},
 column(g,v){const h=v===1?96:170;rect(g,-24,-12,48,12,'#d8d0bd',1.8);rect(g,-17,-h,34,h-12,'#e6dfcc',1.8);for(const x of [-9,0,9])line(g,[[x,-h+4],[x,-16]],1,'rgba(120,110,90,.55)');if(v===1){poly(g,[[-17,-h],[-8,-h-10],[4,-h-4],[17,-h-12],[17,-h]]);fillInk(g,'#e6dfcc',1.6);}else{rect(g,-26,-h-14,52,14,'#d8d0bd',1.8);ell(g,-22,-h-6,6,5);fillInk(g,'#e6dfcc',1.2);ell(g,22,-h-6,6,5);fillInk(g,'#e6dfcc',1.2);}},
 temple(g){rect(g,-170,-22,340,22,'#d8d0bd',2);rect(g,-156,-36,312,14,'#e3dccb',1.8);for(let i=0;i<6;i++){const x=-140+i*56;rect(g,x-10,-170,20,134,'#efe9d9',1.6);line(g,[[x-3,-166],[x-3,-40]],1,'rgba(120,110,90,.5)');line(g,[[x+4,-166],[x+4,-40]],1,'rgba(120,110,90,.5)');}rect(g,-160,-188,320,18,'#e3dccb',1.8);poly(g,[[-168,-188],[0,-246],[168,-188]]);fillInk(g,'#ddd5c2',2);poly(g,[[-120,-194],[0,-234],[120,-194]]);g.fillStyle='rgba(150,130,100,.35)';g.fill();},
 aqueduct(g){rect(g,-210,-176,420,22,'#c9a982',2);for(let i=0;i<5;i++){const x=-210+i*84;rect(g,x,-154,18,154,'#bfa078',1.6);}for(let i=0;i<4;i++){const x=-192+i*84;g.save();g.beginPath();g.moveTo(x,-40);g.lineTo(x,-110);g.arc(x+33,-110,33,Math.PI,0);g.lineTo(x+66,-40);g.strokeStyle='#1b1612';g.lineWidth=2;g.stroke();g.restore();rect(g,x,-154,66,12,'#bfa078',1.4);}bricks(g,-210,-176,210,-154,8,'rgba(110,84,56,.45)');},
 cathedral(g){
  rect(g,-120,-170,240,170,'#a8a090',2.4);bricks(g,-120,-170,120,0,14,'rgba(70,64,54,.35)');
  for(const s of [-1,1]){const x=s*120-(s>0?60:0);rect(g,x,-260,60,260,'#b0a898',2.2);poly(g,[[x-4,-260],[x+30,-350],[x+64,-260]]);fillInk(g,'#5d6670',2);rect(g,x+22,-230,16,40,'#2a2630',1.4);}
  poly(g,[[-60,-170],[0,-220],[60,-170]]);fillInk(g,'#9a9282',2);ell(g,0,-128,26,26);fillInk(g,'#3c4a78',2);for(let i=0;i<8;i++){const a=i/8*TAU;line(g,[[0,-128],[Math.cos(a)*24,-128+Math.sin(a)*24]],1.4,'#d8b44a');}
  arch(g,-22,0,44,74,'#3a2a22');for(const x of [-96,72])arch(g,x,-30,24,70,'#34405e');
 },
 well(g){ell(g,0,-26,38,14);fillInk(g,'#8e8676',2);rect(g,-38,-26,76,26,'#8e8676',2);bricks(g,-38,-26,38,0,9,'rgba(50,44,36,.5)');ell(g,0,-26,30,10);g.fillStyle='#1d2a30';g.fill();line(g,[[-32,-26],[-32,-90]],5,'#5c4430');line(g,[[32,-26],[32,-90]],5,'#5c4430');poly(g,[[-46,-84],[0,-114],[46,-84]]);fillInk(g,'#8a4a32',2);line(g,[[0,-90],[0,-46]],1.2,'#2a2016');},
 house(g){rect(g,-66,-104,132,104,'#e2d6b8',2.2);for(const x of [-66,-22,22,66])line(g,[[x,-104],[x,0]],5,'#4a3220');line(g,[[-66,-52],[66,-52]],5,'#4a3220');line(g,[[-66,-104],[-22,-52]],4,'#4a3220');line(g,[[22,-52],[66,-104]],4,'#4a3220');poly(g,[[-80,-100],[0,-170],[80,-100]]);fillInk(g,'#8a4a32',2.4);rect(g,-10,-40,20,40,'#4a3220',1.4);rect(g,-52,-90,22,22,'#f1c766',1.4);},
 chimney(g){rect(g,-100,-120,140,120,'#8a4c38',2.4);bricks(g,-100,-120,40,0,10,'rgba(40,20,14,.45)');poly(g,[[-108,-120],[-30,-160],[48,-120]]);fillInk(g,'#4a4448',2);for(const x of [-84,-50,-16])rect(g,x,-96,22,30,'#f1c766',1.4);rect(g,50,-300,34,300,'#7a4232',2.2);bricks(g,50,-300,84,0,9,'rgba(40,20,14,.5)');rect(g,46,-308,42,10,'#5a3226',1.6);},
 lamp(g){rect(g,-10,-8,20,8,'#2b2a2e',1.4);line(g,[[0,-8],[0,-104]],4.5,'#2b2a2e');poly(g,[[-11,-104],[11,-104],[8,-128],[-8,-128]]);fillInk(g,'#f6d27a',1.6);poly(g,[[-13,-128],[0,-138],[13,-128]]);fillInk(g,'#2b2a2e',1.4);},
 tower(g){
  const L=[[-120,0],[-36,-200],[-14,-330],[0,-400]],R=L.map(([x,y])=>[-x,y]);
  for(const side of [L,R]){inkLine(g,side,7,'#6b5040');}
  for(let i=0;i<14;i++){const t=i/14,y=-t*360,k=lerp(120,10,Math.pow(t,.8));line(g,[[-k,y],[k,y-26]],1.4,'#7d5e4a');line(g,[[k,y],[-k,y-26]],1.4,'#7d5e4a');}
  rect(g,-60,-206,120,10,'#6b5040',1.6);rect(g,-24,-322,48,8,'#6b5040',1.4);g.save();g.beginPath();g.moveTo(-90,0);g.quadraticCurveTo(0,-150,90,0);g.strokeStyle='#1b1612';g.lineWidth=5;g.stroke();g.strokeStyle='#6b5040';g.lineWidth=3;g.stroke();g.restore();
 },
 monolith(g){poly(g,[[-26,0],[-22,-200],[22,-206],[26,0]]);fillInk(g,'#1a1826',2.2);for(const [y,w] of [[-40,14],[-90,18],[-140,10],[-180,16]]){line(g,[[-w,y],[w,y]],2,'#6ff3ff');}g.fillStyle='rgba(111,243,255,.25)';ell(g,0,-4,46,10);g.fill();},
 spire(g){for(const [x,h,w] of [[-40,220,30],[0,320,40],[42,180,26]]){poly(g,[[x-w,0],[x-w*.6,-h*.7],[x,-h],[x+w*.6,-h*.7],[x+w,0]]);fillInk(g,'#4b3f8a',2);poly(g,[[x,-h],[x+w*.6,-h*.7],[x+w,0],[x,0]]);g.fillStyle='rgba(150,240,255,.28)';g.fill();line(g,[[x,-h+10],[x,-12]],1.4,'#9ff3ff');}},
 dome(g){g.beginPath();g.moveTo(-120,0);g.arc(0,0,120,Math.PI,0);g.closePath();g.fillStyle='rgba(120,200,230,.35)';g.fill();ink(g,2.4);for(let i=1;i<6;i++){g.beginPath();g.ellipse(0,0,120*i/6,120,0,Math.PI,0);g.strokeStyle='rgba(160,240,255,.6)';g.lineWidth=1;g.stroke();}for(let i=1;i<4;i++){const y=-i*30;const k=Math.sqrt(1-(y/120)**2)*120;line(g,[[-k,y],[k,y]],1,'rgba(160,240,255,.6)');}rect(g,-130,-6,260,8,'#3a3456',1.6);}
};
const LM_DEF={
 mammoth:{name:'Squelette de mammouth',solid:40,sh:70,w:300,h:150},menhir:{name:'Menhir',solid:22,sh:26,w:70,h:160},dolmen:{name:'Dolmen',solid:50,sh:70,w:200,h:110},hut:{name:'Hutte',solid:56,sh:66,w:170,h:150},
 pyramid:{name:'Pyramide',solid:150,sh:0,w:520,h:320},obelisk:{name:'Obélisque',solid:22,sh:26,w:70,h:250},
 column:{name:'Colonne',solid:22,sh:26,w:70,h:200},temple:{name:'Temple',solid:120,sh:150,w:360,h:260},aqueduct:{name:'Aqueduc',solid:60,sh:0,w:440,h:190},
 cathedral:{name:'Cathédrale',solid:140,sh:0,w:400,h:370},well:{name:'Puits',solid:34,sh:40,w:110,h:130},house:{name:'Maison à colombages',solid:66,sh:80,w:180,h:180},
 chimney:{name:'Usine',solid:90,sh:0,w:220,h:320},lamp:{name:'Réverbère',solid:10,sh:10,w:40,h:150},tower:{name:'Tour de fer',solid:60,sh:0,w:260,h:420},
 monolith:{name:'Monolithe',solid:26,sh:30,w:80,h:220},spire:{name:'Tours de cristal',solid:60,sh:0,w:150,h:340},dome:{name:'Dôme de verre',solid:110,sh:0,w:270,h:140}
};
for(const t in LM_DEF)DEF[t]={name:LM_DEF[t].name,solid:LM_DEF[t].solid,sh:LM_DEF[t].sh};

/* ---------- era flora drawn from scratch ---------- */
function drawPalm(g,k,seed){const r=mulberry(seed),lean=(r()-.5)*40;const top=[lean,-150*k];inkCurve(g,[[0,0],[lean*.3,-70*k],top],7*k,'#8a6a42');for(let i=0;i<6;i++){const y=-i*24*k;line(g,[[lean*(i/6)*.6-5*k,y-10],[lean*(i/6)*.6+5*k,y-14]],1,'rgba(60,40,20,.6)');}
 for(let i=0;i<8;i++){const a=-Math.PI/2+(i/7-.5)*3.2,L=(60+r()*25)*k,ex=top[0]+Math.cos(a)*L,ey=top[1]+Math.sin(a)*L*.55+18*k;g.beginPath();g.moveTo(top[0],top[1]);g.quadraticCurveTo((top[0]+ex)/2,top[1]-18*k,ex,ey);g.quadraticCurveTo((top[0]+ex)/2,top[1]-4*k,top[0],top[1]+4*k);fillInk(g,i%2?'#5c7a3a':'#6f8c44',1.6);}
 ell(g,top[0],top[1]+6*k,9*k,7*k);fillInk(g,'#6e4a2a',1.4);}
function drawCypress(g,k,seed){const r=mulberry(seed),h=(170+r()*30)*k;line(g,[[0,0],[0,-16*k]],6*k,'#5a3e28');g.beginPath();g.moveTo(-18*k,-12*k);g.bezierCurveTo(-26*k,-h*.45,-10*k,-h*.8,0,-h);g.bezierCurveTo(10*k,-h*.8,26*k,-h*.45,18*k,-12*k);g.closePath();fillInk(g,'#2f4a2c',2);for(let i=0;i<14;i++){g.strokeStyle='rgba(120,150,90,.45)';g.lineWidth=1.2;g.beginPath();const y=-16*k-r()*h*.85,x=(r()-.5)*24*k;g.moveTo(x,y);g.lineTo(x+4*k,y-8*k);g.stroke();}}
function drawStonePine(g,k,seed){const r=mulberry(seed);inkCurve(g,[[0,0],[6*k,-80*k],[-4*k,-130*k]],6*k,'#6a4a30');for(let i=0;i<3;i++){ell(g,-4*k+(i-1)*40*k,-140*k-(i===1?14*k:0),56*k,22*k);fillInk(g,i===1?'#4f6a36':'#45602f',1.8);}for(let i=0;i<10;i++){g.fillStyle='rgba(140,170,100,.35)';ell(g,(r()-.5)*140*k,-140*k-(r()-.3)*30*k,8*k,3*k);g.fill();}}
function drawWheat(g,picked){for(let i=0;i<9;i++){const x=(i-4)*5,h=picked?14:44+(i%3)*8;line(g,[[x,0],[x+(i-4)*.6,-h]],1.4,'#b58a3a');if(!picked){ell(g,x+(i-4)*.6,-h-6,3.2,8,(i-4)*.05);fillInk(g,'#e2b74e',1);}}}
const treeSprite=(w,h,fn,k)=>makeSprite(w*k,h*k,w*k/2,h*k-10,g=>{g.translate(w*k/2,h*k-10);fn(g);});

/* ---------- pixel recolour of the flora sprites ---------- */
function recolor(spr,fn){if(!spr||!spr.c)return;const g=spr.c.getContext('2d');const im=g.getImageData(0,0,spr.c.width,spr.c.height),d=im.data,W0=spr.c.width,H0=spr.c.height;
 for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const p=i/4,fy=Math.floor(p/W0)/H0;const o=fn(d[i],d[i+1],d[i+2],fy);d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2];}g.putImageData(im,0,0);}
function eachSprite(v,fn){if(!v)return;if(Array.isArray(v))v.forEach(x=>eachSprite(x,fn));else fn(v);}
const lum=(r,g,b)=>.3*r+.59*g+.11*b;
const RC={
 snow:(r,g,b,fy)=>{const L=lum(r,g,b);if(L<45)return[r,g,b];const k=clamp(.62-fy*.55,0,.62)*(L>70?1:.4);const gr=L*.75+40;return[lerp(lerp(r,gr,.7),246,k),lerp(lerp(g,gr+4,.7),250,k),lerp(lerp(b,gr+14,.7),255,k)];},
 sand:(r,g,b)=>{const L=lum(r,g,b);return[lerp(r,L*1.12+18,.35),lerp(g,L*.98+8,.35),lerp(b,L*.7,.35)];},
 soot:(r,g,b)=>{const L=lum(r,g,b);return[lerp(r,L*.95,.55),lerp(g,L*.97,.55),lerp(b,L*1.02,.55)];},
 fertile:(r,g,b)=>[r*.92,Math.min(255,g*1.06),b*.9],
 alien:(r,g,b)=>{const L=lum(r,g,b)/255;if(L<.18)return[r*.6,g*.5,b*.9];const t=L;return[lerp(70,170,t)+(t>.75?(t-.75)*300:0),lerp(40,240,t*t),lerp(140,255,t)];}
};

/* ---------- the eras ---------- */
const BASE_NAMES={pine:'Acacia',oak:'Baobab',dead:'Arbre mort',boulder:'Rocher',tuft:"Touffe d'herbe",berry:'Buisson à baies',carrot:'Tubercule',reeds:'Papyrus',hole:'Pâturage',den:'Tanière de hyènes',sapling:'Jeune pousse',flower:'Fleur',mushroom:'Champignon rouge'};
const ERAS=[
 {n:'I',name:'L’Étincelle',place:'La savane',source:'l’acacia foudroyé',sourceName:'Acacia foudroyé',flora:'savanna',bcol:[[176,150,83],[132,128,70],[168,140,108],[98,116,81]],
  intro:'La foudre a laissé du feu. Il faut le capturer avant la nuit.',end:'Trois nuits. Une flamme. Ka transmet la Braise à sa lignée.'},
 {n:'II',name:'Le Grand Froid',place:'La toundra glacée',source:'le pin foudroyé',sourceName:'Pin foudroyé',flora:'temperate',rc:'snow',ground:'snow',
  bcol:[[222,228,232],[188,198,204],[150,158,170],[200,214,222]],
  names:{pine:'Pin enneigé',oak:'Chêne gelé',dead:'Arbre gelé',boulder:'Bloc de glace',tuft:'Herbe gelée',berry:'Buisson givré',carrot:'Racine',reeds:'Joncs gelés',hole:'Terrier',den:'Tanière des hyènes des cavernes'},
  mobs:{antelope:'Renne',hyena:'Hyène des cavernes',machairodont:'Smilodon',rabbit:'Lièvre variable'},
  lm:[['mammoth',[-700,420]],['mammoth',[900,-500]],['mammoth',[200,1100]]],
  intro:'Le monde s’est couvert de glace. Sans feu, personne ne passera l’hiver.',end:'Le grand froid n’a pas éteint la Braise. La lignée a traversé l’hiver.'},
 {n:'III',name:'La Graine',place:'Les premiers champs',source:'le foyer du village',sourceName:'Foyer du village',flora:'temperate',rc:'fertile',ground:'fields',srcDraw:'hearth',
  bcol:[[122,140,72],[92,108,60],[146,134,108],[100,116,86]],
  names:{pine:'Sapin',oak:'Chêne',dead:'Arbre mort',boulder:'Rocher',tuft:'Blé',berry:'Buisson à baies',carrot:'Carotte',reeds:'Roseaux',hole:'Terrier',den:'Tanière de loups'},
  mobs:{antelope:'Aurochs',hyena:'Loup',machairodont:'Ours des cavernes'},tuft:'wheat',
  lm:[['menhir',[260,-240]],['menhir',[330,-160]],['menhir',[-300,260]],['dolmen',[-620,-380]],['hut',[420,160]],['hut',[560,40]],['hut',[600,240]]],
  intro:'Les hommes sèment et restent. Le foyer du village doit brûler pour tous.',end:'Le blé a levé autour du foyer. La Braise devient le cœur du village.'},
 {n:'IV',name:'Le Soleil',place:'Les rives du Nil',source:'le brasier du temple',sourceName:'Brasier sacré',flora:'desert',rc:'sand',ground:'sand',srcDraw:'brazier',
  bcol:[[218,186,118],[178,164,96],[200,166,116],[124,144,86]],
  names:{pine:'Palmier',oak:'Palmier dattier',dead:'Arbre sec',boulder:'Bloc de grès',tuft:'Herbe sèche',berry:'Buisson de dattes',carrot:'Oignon',reeds:'Papyrus',hole:'Terrier',den:'Repaire des chacals'},
  mobs:{antelope:'Gazelle',hyena:'Chacal',machairodont:'Lion du désert',spider:'Scorpion'},
  lm:[['pyramid',[-900,-700]],['pyramid',[-380,-1050]],['obelisk',[260,-260]],['obelisk',[-160,-300]]],
  intro:'Le soleil règne sur le fleuve. Le brasier du temple garde sa flamme.',end:'Sous le soleil, la Braise brûle au sommet des pyramides.'},
 {n:'V',name:'La Cité',place:'Rome',source:'l’autel de Vesta',sourceName:'Autel de Vesta',flora:'mediterranean',rc:'sand',ground:'paved',srcDraw:'altar',
  bcol:[[170,160,98],[120,126,74],[192,182,160],[122,132,92]],
  names:{pine:'Cyprès',oak:'Pin parasol',dead:'Olivier mort',boulder:'Bloc de marbre',tuft:'Herbe',berry:'Vigne',carrot:'Poireau',reeds:'Roseaux du Tibre',hole:'Terrier',den:'Repaire des loups'},
  mobs:{antelope:'Chèvre',hyena:'Loup',machairodont:'Lion de l’arène'},
  lm:[['temple',[-520,-420]],['column',[220,-220]],['column',[300,-200],1],['column',[-240,240]],['aqueduct',[700,520]],['column',[-260,330],1]],
  intro:'Rome garde le feu de Vesta. S’il s’éteint, la cité tombe.',end:'Le feu de Vesta ne s’est pas éteint. La cité veille sur la Braise.'},
 {n:'VI',name:'Les Bâtisseurs',place:'Le temps des cathédrales',source:'le brasero du parvis',sourceName:'Brasero du parvis',flora:'temperate',ground:'meadow',srcDraw:'brazier',
  bcol:[[112,130,74],[72,90,56],[142,136,122],[88,100,82]],
  names:{pine:'Sapin',oak:'Chêne',dead:'Arbre mort',boulder:'Pierre de taille',tuft:'Herbe',berry:'Mûrier',carrot:'Navet',reeds:'Roseaux',hole:'Terrier',den:'Tanière de loups'},
  mobs:{antelope:'Cerf',hyena:'Loup',machairodont:'Bête du Gévaudan'},
  lm:[['cathedral',[-560,-520]],['house',[420,-260]],['house',[560,-120]],['well',[260,200]],['house',[-420,320]]],
  intro:'On bâtit des cathédrales pour des siècles. Le feu des bâtisseurs ne doit pas mourir.',end:'Les pierres montent vers le ciel. La Braise éclaire le chantier.'},
 {n:'VII',name:'La Vapeur',place:'Paris',source:'la fournaise de l’usine',sourceName:'Fournaise',flora:'temperate',rc:'soot',ground:'cobble',srcDraw:'furnace',
  bcol:[[98,104,86],[80,88,72],[126,122,116],[78,80,84]],
  names:{pine:'Platane',oak:'Marronnier',dead:'Arbre mort',boulder:'Tas de charbon',tuft:'Herbe',berry:'Buisson',carrot:'Navet',reeds:'Roseaux de la Seine',hole:'Terrier',den:'Repaire des chiens errants'},
  mobs:{antelope:'Cheval échappé',hyena:'Chien errant',machairodont:'Bête des égouts',rabbit:'Rat'},
  lm:[['tower',[-700,-620]],['chimney',[620,-420]],['chimney',[860,260]],['lamp',[160,-150]],['lamp',[-170,-160]],['lamp',[170,170]],['lamp',[-180,190]],['lamp',[420,0]],['lamp',[-430,20]]],
  intro:'La ville avale le charbon. La Braise doit survivre dans la vapeur.',end:'Dans la fumée des machines, la Braise brille encore.'},
 {n:'VIII',name:'Au-delà',place:'Un futur à inventer',source:'le cœur de plasma',sourceName:'Cœur de plasma',flora:'savanna',rc:'alien',ground:'grid',srcDraw:'plasma',
  bcol:[[60,52,96],[40,46,84],[78,74,104],[44,70,92]],
  names:{pine:'Arbre de cristal',oak:'Arbre-lumière',dead:'Tige morte',boulder:'Cristal',tuft:'Herbe luminescente',berry:'Buisson à perles',carrot:'Racine bleue',reeds:'Filaments',hole:'Terrier',den:'Nid des ombres'},
  mobs:{antelope:'Coureur des plaines',hyena:'Rôdeur',machairodont:'Gardien de l’ombre',rabbit:'Bondisseur'},
  lm:[['spire',[-640,-560]],['dome',[700,-380]],['monolith',[240,-240]],['monolith',[-240,250]],['monolith',[520,520]]],
  intro:'Au-delà des étoiles, une seule chose n’a pas changé : la Braise.',end:'La Braise a traversé tous les âges. Elle brille, au-delà.'}
];
const era=()=>ERAS[eraIdx];
const unlocked=()=>{const n=+lsGet(ERA_UNLOCK_KEY)||1;return clamp(n,1,ERAS.length);};
const unlock=n=>{if(n>unlocked())lsSet(ERA_UNLOCK_KEY,String(Math.min(n,ERAS.length)));};

/* ---------- applying an era's look ---------- */
function applyEraVisuals(i){
 eraIdx=clamp(i|0,0,ERAS.length-1);const E=era();
 buildSprites();const temperate={pine:S.pine,oak:S.oak,dead:S.dead,tuft:S.tuft,berry:S.berry,boulder:S.boulder,carrot:S.carrot,reeds:S.reeds};
 applySavannaSprites();
 if(E.flora==='temperate')Object.assign(S,temperate);
 if(E.flora==='desert'){S.pine=[.78,1,1.24].map(k=>[0,1,2].map(v=>treeSprite(170,200,g=>drawPalm(g,k,300+v*7),k)));S.oak=[0,1,2,3].map(v=>treeSprite(190,220,g=>{g.translate(-28,0);drawPalm(g,.9,410+v);g.translate(56,6);drawPalm(g,.75,470+v);},1));}
 if(E.flora==='mediterranean'){S.pine=[.78,1,1.24].map(k=>[0,1,2].map(v=>treeSprite(80,240,g=>drawCypress(g,k,520+v),k)));S.oak=[0,1,2,3].map(v=>treeSprite(200,190,g=>drawStonePine(g,1,610+v),1));}
 if(E.tuft==='wheat')S.tuft=[0,1].map(p=>makeSprite(70,70,35,62,g=>{g.translate(35,62);drawWheat(g,!!p);}));
 if(E.rc){const f=RC[E.rc];for(const k of ['pine','oak','dead','tuft','berry','sap','flower','reeds','carrot','boulder','stump','mush'])eachSprite(S[k],s=>recolor(s,f));}
 for(const k in LM_DEF){const L=LM_DEF[k];S['lm_'+k]=[0,1].map(v=>lmSprite(L.w,L.h,g=>LM[k](g,v)));}
 for(let b=1;b<=4;b++)BCOL[b]=E.bcol[b-1].slice();
 for(const k in BASE_NAMES)DEF[k].name=(E.names&&E.names[k])||BASE_NAMES[k];
 chunkCache.clear();
}

/* ---------- engine hooks ---------- */
const _setSpr=setSpr;
setSpr=function(e){if(LM_DEF[e.type]){e.spr=S['lm_'+e.type][e.v?1:0];return;}_setSpr(e);};

const _genWorld=genWorld;
genWorld=function(){
 _genWorld();
 const E=era();if(!E.lm)return;
 const natural=['pine','oak','dead','boulder','sapling','tuft','berry','carrot','flower','mushroom','reeds','hole','den'];
 for(const [type,[wx,wy],v] of E.lm){const L=LM_DEF[type],clear=L.solid+60;
  let spot=null;for(let t=0;t<40&&!spot;t++){const a=t*2.4,r=t*28,x=wx+Math.cos(a)*r,y=wy+Math.sin(a)*r;
   if(!isLand(x,y)||!isLand(x-L.w/2,y)||!isLand(x+L.w/2,y)||Math.hypot(x,y)<200)continue;
   if(t<30&&L.w>200&&biomeAt(x,y)===B_MARSH)continue;
   const room=Math.max(L.w/2,L.h/2)+(L.w>150?220:90);
   if(statics.some(e=>!e.dead&&(LM_DEF[e.type]||['cave','waterhole','campfire','firepit'].includes(e.type)||e.sourceFire||e.type==='carcass')&&Math.hypot(e.x-x,e.y-y)<room+(LM_DEF[e.type]?Math.max(LM_DEF[e.type].w,LM_DEF[e.type].h)/2:60)))continue;
   spot={x,y};}
  if(!spot)continue;
  for(const e of statics.slice())if(!e.dead&&natural.includes(e.type)&&Math.abs(e.x-spot.x)<L.w/2+30&&e.y>spot.y-L.h*.5&&e.y<spot.y+60)kill(e);
  mk(type,spot.x,spot.y,{v:v||0});}
};

const _genChunk=genChunk;
genChunk=function(cx,cy){
 const cv=_genChunk(cx,cy),E=era();if(!E.ground)return cv;
 const g=cv.getContext('2d'),rng=mulberry(chunkSeed(cx,cy)+911),x0=cx*CH,y0=cy*CH;
 const land=(px,py)=>{const x=x0+px,y=y0+py;return coastVal(x,y)<.95?biomeAt(x,y):0;};
 g.save();
 if(E.ground==='snow'){g.fillStyle='rgba(240,246,250,.16)';g.fillRect(0,0,CH,CH);for(let n=0;n<220;n++){const px=rng()*CH,py=rng()*CH;if(!land(px,py))continue;g.fillStyle=rng()<.5?'rgba(255,255,255,.7)':'rgba(150,175,200,.35)';ell(g,px,py,1+rng()*2.5,.8+rng());g.fill();}}
 else if(E.ground==='sand'){for(let n=0;n<120;n++){const px=rng()*CH,py=rng()*CH,b=land(px,py);if(!b||b===4)continue;g.strokeStyle=rng()<.5?'rgba(150,110,60,.35)':'rgba(250,226,170,.4)';g.lineWidth=1.2;g.beginPath();g.arc(px,py,10+rng()*18,Math.PI*1.1,Math.PI*1.9);g.stroke();}}
 else if(E.ground==='fields'){for(let n=0;n<4;n++){const px=rng()*CH,py=rng()*CH;if(land(px,py)!==1)continue;g.save();g.translate(px,py);g.rotate((rng()-.5)*.5);for(let i=0;i<9;i++){g.strokeStyle=i%2?'rgba(110,80,40,.38)':'rgba(214,180,90,.35)';g.lineWidth=4;g.beginPath();g.moveTo(-60,i*7-30);g.lineTo(60,i*7-30);g.stroke();}g.restore();}}
 else if(E.ground==='paved'||E.ground==='cobble'){const col=E.ground==='paved'?'rgba(225,215,190,.5)':'rgba(70,66,64,.45)';for(let n=0;n<260;n++){const px=rng()*CH,py=rng()*CH;if(land(px,py)!==3)continue;g.strokeStyle=col;g.lineWidth=1.1;g.strokeRect(px,py,8+rng()*8,5+rng()*4);}if(E.ground==='cobble'){g.fillStyle='rgba(40,38,40,.08)';g.fillRect(0,0,CH,CH);}}
 else if(E.ground==='meadow'){for(let n=0;n<60;n++){const px=rng()*CH,py=rng()*CH;if(land(px,py)!==1)continue;g.fillStyle=['rgba(240,230,180,.8)','rgba(200,120,170,.7)','rgba(250,250,250,.8)'][(rng()*3)|0];ell(g,px,py,1.8,1.8);g.fill();}}
 else if(E.ground==='grid'){g.strokeStyle='rgba(110,240,255,.13)';g.lineWidth=1;for(let i=0;i<=CH;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,CH);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(CH,i);g.stroke();}for(let n=0;n<70;n++){const px=rng()*CH,py=rng()*CH;if(!land(px,py))continue;g.fillStyle='rgba(160,250,255,.55)';ell(g,px,py,1.4,1.4);g.fill();}}
 g.restore();return cv;
};

/* the sacred fire of each era */
const _drawEnt=drawEnt;
drawEnt=function(e){
 if(!e.sourceFire||!era().srcDraw){_drawEnt(e);return;}
 const lit=e.fuel>0,k=era().srcDraw;ctx.save();ctx.translate(e.x,e.y);if(hoverEnt===e){ctx.shadowColor='#f4bb63';ctx.shadowBlur=8;}
 ctx.fillStyle='rgba(30,21,15,.22)';ell(ctx,0,-1,34,9);ctx.fill();let fy=-20,fs=.42;
 if(k==='hearth'){for(let i=0;i<10;i++){const a=i/10*TAU;ell(ctx,Math.cos(a)*30,Math.sin(a)*10-4,9,6);fillInk(ctx,'#8b8478',1.4);}fy=-6;fs=.5;}
 else if(k==='brazier'){for(const s of [-1,1])line(ctx,[[s*18,0],[s*8,-34]],3,'#3a2a1c');line(ctx,[[0,0],[0,-34]],3,'#3a2a1c');ctx.beginPath();ctx.moveTo(-28,-44);ctx.quadraticCurveTo(0,-20,28,-44);ctx.closePath();fillInk(ctx,'#a8743a',2);fy=-44;}
 else if(k==='altar'){poly(ctx,[[-30,0],[-26,-46],[26,-46],[30,0]]);fillInk(ctx,'#e6dfcc',2);ell(ctx,0,-48,32,9);fillInk(ctx,'#d8d0bd',1.8);line(ctx,[[-20,-26],[20,-26]],1.2,'rgba(120,110,90,.6)');fy=-50;}
 else if(k==='furnace'){poly(ctx,[[-34,0],[-34,-60],[34,-60],[34,0]]);fillInk(ctx,'#2e2a2c',2.2);rect(ctx,-14,-74,28,14,'#2e2a2c',1.6);line(ctx,[[0,-74],[0,-120]],8,'#2e2a2c');ctx.beginPath();ctx.arc(0,-24,16,Math.PI,0);ctx.lineTo(16,-10);ctx.lineTo(-16,-10);ctx.closePath();ctx.fillStyle=lit?'#f6a243':'#3a2a22';ctx.fill();ink(ctx,1.6);fy=-12;fs=.3;}
 else if(k==='plasma'){poly(ctx,[[-26,0],[-16,-40],[16,-40],[26,0]]);fillInk(ctx,'#2b2550',2);for(const s of [-1,1]){poly(ctx,[[s*14,-40],[s*24,-90],[s*8,-70]]);fillInk(ctx,'#7d6ad8',1.6);}ctx.globalCompositeOperation='lighter';const r=18+Math.sin(realTime*5)*3;const gr=ctx.createRadialGradient(0,-62,0,0,-62,r*2);gr.addColorStop(0,lit?'rgba(200,250,255,.9)':'rgba(80,90,120,.4)');gr.addColorStop(1,'rgba(80,200,255,0)');ctx.fillStyle=gr;ctx.fillRect(-r*2,-62-r*2,r*4,r*4);ctx.globalCompositeOperation='source-over';fy=-50;fs=.32;}
 ctx.restore();if(lit)drawFlames(e.x,e.y+fy,fs,e.x);
};

const _getAction=getAction;
getAction=function(e){const a=_getAction(e);if(!a||!e)return a;const E=era();
 if(e.sourceFire)a.name=E.sourceName;
 else if(e.kind&&E.mobs&&E.mobs[e.kind])a.name=E.mobs[e.kind];
 return a;};

const HY={1:['hyène des cavernes','hyènes des cavernes'],2:['loup','loups'],3:['chacal','chacals'],4:['loup','loups'],5:['loup','loups'],6:['chien errant','chiens errants'],7:['rôdeur','rôdeurs']};
const _say=say;
say=function(text,dur){if(eraIdx&&text==='La foudre a laissé du feu. Il faut le capturer avant la nuit.')text=era().intro;const h=HY[eraIdx];if(h&&typeof text==='string')text=text.replace(/([Hh])yènes/g,(m,c)=>(c==='H'?h[1][0].toUpperCase():h[1][0])+h[1].slice(1)).replace(/([Hh])yène/g,(m,c)=>(c==='H'?h[0][0].toUpperCase():h[0][0])+h[0].slice(1));_say(text,dur);};
const _hurtPlayer=hurtPlayer;
hurtPlayer=function(d,src,cause){if(deus)return;_hurtPlayer(d,src,cause);};

const _updWorld=updWorld;
updWorld=function(dt){
 _updWorld(dt);
 if(!era().lm)return;const night=phase()!=='day';
 for(const e of statics){if(e.dead||!LM_DEF[e.type])continue;
  if(e.type==='lamp'&&night)lights.push({x:e.x,y:e.y-118,r:230*(1+Math.sin(realTime*9+e.x)*.03),warm:.7});
  else if((e.type==='monolith'||e.type==='spire')&&night)lights.push({x:e.x,y:e.y-100,r:200,warm:.25});
  else if(e.type==='cathedral'&&night)lights.push({x:e.x,y:e.y-120,r:180,warm:.4});
  else if(e.type==='chimney'&&Math.abs(e.x-cam.x)<1400&&Math.abs(e.y-cam.y)<1000&&Math.random()<dt*4)part({k:'smoke',x:e.x+67+rnd(-6,6),y:e.y-4,z:rnd(300,312),vx:rnd(4,16)+wind()*16,vy:0,vz:rnd(26,44),ml:rnd(3,5),s:rnd(9,15)});
 }
};

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

function deusKit(){for(const [id,n] of [['spear',1],['torch',1],['axe',1],['pickaxe',1],['emberHorn',1],['log',20],['grass',20],['twigs',20],['flint',10],['rocks',20],['bone',6],['cmorsel',10]])if(!count(id))addItem(id,n,P.x,P.y);invDirty=true;}

const _newGame=newGame;
newGame=function(){
 _newGame();setEraGoals();lsSet(ERA_KEY,String(eraIdx));lsSet(DEUS_KEY,deus?'1':'0');
 dayBanner={text:'Ère '+era().n+' · '+era().name,t:0};
 if(deus){deusKit();showDeusButton(true);setTimeout(()=>say('Mode Deus : je traverse les âges. Touche ✦ pour te téléporter.',5),6500);}
 else showDeusButton(false);
 saveGame();
};

function startEra(i){
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
 const E=era(),next=ERAS[eraIdx+1];if(next)unlock(eraIdx+2);
 let el=document.getElementById('eraEnding');
 if(!el){el=document.createElement('div');el.className='ov';el.id='eraEnding';el.style.cssText='background:rgba(13,11,14,.88);z-index:25';gameEl.appendChild(el);}
 el.innerHTML='<h2>Ère '+E.n+' · '+E.name+'</h2><p>'+E.end+'</p>'+(next?'':'<p class="best">Tu as porté la Braise à travers les huit ères.</p>')+'<p class="best" id="eraSaveResult">Enregistrement de la fin du chapitre…</p>'
  +(next?'<button class="big" id="eraNext">Transmettre la Braise · Ère '+next.n+'</button>':'')+'<button class="big" id="eraRestart">'+(next?'Rejouer cette ère':'Recommencer depuis l’Étincelle')+'</button>';
 const nb=document.getElementById('eraNext');if(nb)nb.onclick=()=>{el.hidden=true;startEra(eraIdx+1);};
 document.getElementById('eraRestart').onclick=()=>{el.hidden=true;startEra(next?eraIdx:0);};
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
 const cv=caves.find(c=>!c.dead);if(cv)out.push(['La grotte',cv.x,cv.y+80]);
 const wh=waterholes.find(w=>!w.dead);if(wh)out.push(['Le point d’eau',wh.x,wh.y+110]);
 const seen={};for(const e of statics)if(!e.dead&&LM_DEF[e.type]&&e.type!=='lamp'){seen[e.type]=(seen[e.type]||0)+1;if(seen[e.type]>2)continue;out.push([DEF[e.type].name+(seen[e.type]>1?' ('+seen[e.type]+')':''),e.x,e.y+LM_DEF[e.type].solid*.55+40,LM_DEF[e.type].h>200]);}
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
 deusPanel.innerHTML='<h2>✦ Pouvoir de téléportation</h2><small>Voyager entre les ères</small><div class="row" id="dpEras">'+ERAS.map((E,i)=>'<button data-era="'+i+'" class="'+(i===eraIdx?'on':'')+'">'+E.n+' · '+E.name+'</button>').join('')+'</div>'
  +'<small id="deusTitle">Se téléporter dans l’ère '+era().n+' · '+era().place+'</small><div class="row" id="dpPlaces">'+places.map((p,i)=>'<button data-p="'+i+'">'+p[0]+'</button>').join('')+'</div><div class="row"><button id="dpClose">Fermer</button></div>';
 deusPanel.hidden=false;
 const close=()=>{deusPanel.hidden=true;if(paused)togglePause();const pz=document.getElementById('pause');if(pz)pz.hidden=true;};
 deusPanel.querySelector('#dpClose').onclick=close;
 deusPanel.querySelectorAll('[data-era]').forEach(b=>b.onclick=()=>{deusPanel.hidden=true;paused=false;const pz=document.getElementById('pause');if(pz)pz.hidden=true;startEra(+b.dataset.era);});
 deusPanel.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const p=places[+b.dataset.p];close();userZoom=p[3]?.7:1;teleport(p[1],p[2]);});
}

/* ---------- title: hidden Deus switch (5 quick taps on the logo) and the unlocked eras ---------- */
function decorateTitle(){
 const T=document.getElementById('title');if(!T||T.dataset.eras)return;T.dataset.eras='1';
 let n=0,t=0;
 T.addEventListener('pointerdown',e=>{const h=e.target.closest&&e.target.closest('#title h1');if(!h)return;const now=Date.now();n=now-t<1500?n+1:1;t=now;if(n>=5){n=0;revealDeus();}},true);
 const u=unlocked();
 if(u>1){const row=document.createElement('div');row.className='eraRow';row.style.cssText='display:flex;flex-wrap:wrap;gap:5px;justify-content:center;max-width:720px;margin-top:-6px';
  row.innerHTML=ERAS.slice(0,u).map((E,i)=>'<button style="font:12px Georgia,serif;padding:4px 9px;border-radius:8px;border:1px solid rgba(240,214,160,.55);background:'+(i===eraIdx?'rgba(190,110,40,.9)':'rgba(40,24,14,.8)')+';color:#f6e6c4" data-start-era="'+i+'">'+E.n+' · '+E.name+'</button>').join('');
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
 if(i){applyEraVisuals(i);genWorld();for(let a=-2;a<=1;a++)for(let b=-2;b<=1;b++)chunk(a,b,true);}
 setEraGoals();decorateTitle();
 window.BRAISE_ERAS={era:()=>eraIdx,start:startEra,deus:on=>{deus=!!on;showDeusButton(deus);if(deus)deusKit();},places:placesOfEra,teleport};
};
