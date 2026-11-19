/* New BRAISE assets by Codex, continuing Claude's ink drawing vocabulary. */
window.BraiseLandmarks=(()=>{
 const outline=(g,pts,col)=>{poly(g,pts);fillInk(g,col,2);};
 const rect=(g,x,y,w,h,col)=>{g.beginPath();g.rect(x,y,w,h);fillInk(g,col,1.7);};
 function pyramid(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);outline(g,[[-85,0],[0,-140],[70,0]],'#ba9660');outline(g,[[0,-140],[70,0],[15,0]],'#8e6945');g.save();poly(g,[[-85,0],[0,-140],[70,0]]);g.clip();g.strokeStyle='rgba(62,39,22,.38)';g.lineWidth=1;for(let yy=-126;yy<0;yy+=10){g.beginPath();g.moveTo(-90,yy);g.lineTo(90,yy);g.stroke();for(let xx=-90;xx<90;xx+=20){g.beginPath();g.moveTo(xx+(yy%20?10:0),yy);g.lineTo(xx+(yy%20?10:0),yy+10);g.stroke();}}g.restore();poly(g,[[-85,0],[0,-140],[70,0]]);ink(g,2);g.restore();}
 function giza(g){ell(g,0,3,155,13);g.fillStyle='#d2b983';g.fill();pyramid(g,-98,-8,.55);pyramid(g,68,-4,.72);pyramid(g,-15,5,1);}
 function colosseum(g){
   ell(g,0,5,139,19);g.fillStyle='#a69676';g.fill();
   const edge=()=>{g.beginPath();g.moveTo(-128,-100);g.bezierCurveTo(-65,-135,76,-133,128,-102);g.lineTo(128,-4);g.bezierCurveTo(65,26,-68,26,-128,-4);g.closePath();};
   shaded(g,edge,'#c2aa80',{hatch:[50,-120,130,15],hc:'rgba(55,40,23,.3)'});
   for(let floor=0;floor<3;floor++)for(let i=0;i<13;i++){const x=-119+i*19.6,curve=(x/128)**2*17,yy=-85+floor*31-curve;g.beginPath();g.moveTo(x,yy+21);g.lineTo(x,yy+7);g.bezierCurveTo(x,yy-3,x+12,yy-3,x+12,yy+7);g.lineTo(x+12,yy+21);g.closePath();fillInk(g,'#41372c',1.4);line(g,[[x-2,yy+24],[x-2,yy-7]],2,'#dac49b');}
   for(const yy of [-98,-64,-32,0]){g.beginPath();g.moveTo(-129,yy-13);g.bezierCurveTo(-62,yy+12,61,yy+12,129,yy-13);g.strokeStyle=INK;g.lineWidth=2;g.stroke();}
   g.beginPath();g.moveTo(-128,-100);g.bezierCurveTo(-65,-135,76,-133,128,-102);g.strokeStyle='#ead6b2';g.lineWidth=4;g.stroke();
   outline(g,[[-20,-116],[-20,-131],[-10,-130],[-10,-122],[3,-124],[3,-136],[13,-132],[13,-122],[29,-120],[29,-128],[40,-124],[40,-114]],'#c2aa80');
 }
 function notreDame(g){
   rect(g,-108,-150,72,150,'#ad9c7c');rect(g,36,-150,72,150,'#bba88a');rect(g,-38,-112,76,112,'#cbb696');
   for(const x of [-108,36]){rect(g,x-3,-158,78,8,'#cfbb98');for(let j=0;j<2;j++){const xx=x+12+j*29;g.beginPath();g.moveTo(xx,-120);g.lineTo(xx,-143);g.quadraticCurveTo(xx+10,-153,xx+20,-143);g.lineTo(xx+20,-120);g.closePath();fillInk(g,'#323536',1.6);for(let k=1;k<4;k++)line(g,[[xx+k*4,-120],[xx+k*4,-143]],1,'#9d917d');}}
   rect(g,-106,-111,212,8,'#d3c29f');rect(g,-106,-55,212,7,'#c5b48f');
   ell(g,0,-80,22,22);fillInk(g,'#333943',2.5);ell(g,0,-80,17,17);g.strokeStyle='#c8b793';g.lineWidth=2;g.stroke();for(let i=0;i<12;i++){const a=i*TAU/12;line(g,[[Math.cos(a)*5,-80+Math.sin(a)*5],[Math.cos(a)*18,-80+Math.sin(a)*18]],1.7,'#bba77e');}ell(g,0,-80,5,5);fillInk(g,'#8299a4',1);
   for(const x of [-67,0,67]){g.beginPath();g.moveTo(x-19,0);g.lineTo(x-19,-26);g.quadraticCurveTo(x-17,-37,x,-45);g.quadraticCurveTo(x+17,-37,x+19,-26);g.lineTo(x+19,0);g.closePath();fillInk(g,'#34312d',2);line(g,[[x,0],[x,-29]],1,'#97846b');}
   for(const x of [-107,-38,38,107])rect(g,x-3,-144,6,142,'#d1bd9b');
   for(let i=-4;i<=4;i++){const x=i*22;rect(g,x-5,-106,10,19,'#bbaa86');ell(g,x,-97,2,4);g.fillStyle='#615849';g.fill();}
 }
 function eiffel(g){
   const silhouette=[[-91,0],[-71,-28],[-39,-87],[-21,-152],[-10,-210],[-4,-225],[0,-230],[4,-225],[10,-210],[21,-152],[39,-87],[71,-28],[91,0],[57,0],[35,-47],[0,-67],[-35,-47],[-57,0]];
   outline(g,silhouette,'#8b7354');
   for(const side of [-1,1]){
     line(g,[[side*83,0],[side*51,-57],[side*30,-108],[side*15,-168],[side*5,-225]],3,'#3b3027');
     line(g,[[side*60,0],[side*31,-64],[side*18,-124],[side*8,-184],[0,-226]],2,'#dbc298');
     for(let i=0;i<13;i++){const yy=-8-i*16,w=4+Math.pow((230+yy)/230,2)*70,ww=4+Math.pow((214+yy)/230,2)*70;line(g,[[side*w,yy],[side*Math.max(2,ww*.5),yy-16]],1.4,'#342d25');line(g,[[side*w*.5,yy],[side*ww,yy-16]],1.4,'#342d25');}
   }
   rect(g,-52,-77,104,9,'#a18b66');rect(g,-27,-140,54,7,'#a18b66');rect(g,-10,-203,20,6,'#b59a6f');
   g.beginPath();g.moveTo(-57,0);g.bezierCurveTo(-43,-61,43,-61,57,0);ink(g,4);
   line(g,[[0,-228],[0,-244]],2,'#44392e');ell(g,0,-246,2,2);fillInk(g,'#b99b69',1);
 }
 return {giza,colosseum,notreDame,eiffel};
})();
(()=>{
 const section=document.createElement('section');section.style.cssText='max-width:1200px;margin:50px auto;padding:24px';section.innerHTML='<h2>Les lieux de la lignée</h2><p>Premières études de monuments ajoutées à la reprise. Les huit ères sont prévues ; ces décors ne sont pas encore intégrés au jeu.</p>';
 const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px';section.append(grid);
 for(const [id,title,note]of [['giza','Gizeh · les pyramides','Ère IV · Les Pierres du Soleil'],['colosseum','Rome · le Colisée','Ère V · La Cité'],['notreDame','Paris · Notre-Dame','Ère VI · Les Bâtisseurs'],['eiffel','Paris · la tour Eiffel','Ère VII · La Vapeur']]){const f=document.createElement('figure');f.style.cssText='margin:0;background:#ccb68e;color:#201914;padding:12px;border:2px solid #433523';const c=document.createElement('canvas');c.width=640;c.height=600;c.style.cssText='width:100%;height:auto';const cg=c.getContext('2d');cg.translate(320,535);cg.scale(1.7,1.7);BraiseLandmarks[id](cg);const caption=document.createElement('figcaption');caption.textContent=title+' — '+note;f.append(c,caption);grid.append(f);}document.body.append(section);
})();
