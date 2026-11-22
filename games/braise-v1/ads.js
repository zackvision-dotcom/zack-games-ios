/* AdMob, iOS app only (ios/Ads/NativeAds.swift, handler "ads"). build.py braise puts this file inside the game's closure.
   Ads never show during play: an optional "revive" video on the death screen (once per run), an interstitial when the
   player leaves the death screen or an era ending (at most one every 3 minutes, never in the first 3 minutes),
   and "Choix publicitaires" in the pause menu reopens Google's consent form.
   First use: Google consent form (UMP, if required) then Apple's tracking prompt (ATT) then the SDK. */
(function(){
const NADS=()=>window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.ads;
if(!NADS())return;
const nads=op=>NADS().postMessage({op}).catch(()=>false);
const GAP=180e3;
let inited=null,lastAd=Date.now(),revivedRun=false;
function ready(){if(!inited)inited=nads('init');return inited;}
async function interstitial(){
 if(Date.now()-lastAd<GAP)return;
 await ready();lastAd=Date.now();
 const was=paused;paused=true;try{await nads('interstitial');}finally{paused=was;last=performance.now();}
}
// first touch on the title screen: consent (UMP) then ATT then the SDK, before any game starts
document.addEventListener('pointerup',()=>{ready();},{once:true,capture:true});

// death screen: "Renaître (vidéo)", once per run
const dead=$('#dead'),retry=$('#btnRetry');
const rv=document.createElement('button');rv.className='big';rv.id='btnRevive';rv.textContent='Renaître (vidéo)';
rv.style.marginBottom='10px';retry.parentNode.insertBefore(rv,retry);
new MutationObserver(()=>{if(!dead.hidden)rv.hidden=revivedRun;}).observe(dead,{attributes:true,attributeFilter:['hidden']});
rv.addEventListener('click',async()=>{
 if(rv.disabled)return;rv.disabled=true;
 try{
  await ready();
  const ok=(await nads('rewarded'))===true;
  if(!ok||mode!=='dead')return;
  revivedRun=true;lastAd=Date.now();
  // keep the predators that killed Ka at a distance: they come back, but not on top of him
  for(const m of mobs){const d=Math.hypot(m.x-P.x,m.y-P.y);if(m.kind==='hyena'&&d<520){const k=(620+Math.random()*120)/Math.max(d,1);m.x=P.x+(m.x-P.x||1)*k;m.y=P.y+(m.y-P.y)*k;if('atk'in m)m.atk=0;m.target=null;}}
  Object.assign(P,{dead:false,deadT:0,hp:Math.max(P.hp,90),hunger:Math.max(P.hunger,75),target:null,moveTo:null,moving:false,anim:null,speech:null});
  dead.hidden=true;mode='play';paused=false;hideHud(false);invDirty=true;last=performance.now();
  say('Pas encore. La Braise attend.',3.5);
 }finally{rv.disabled=false;}
});
// leaving the death screen: interstitial, then the new run
retry.addEventListener('click',()=>{revivedRun=false;interstitial();});
// era ending (next era / replay): interstitial between two eras
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#eraNext,#eraRestart');if(b){revivedRun=false;interstitial();}},true);

// pause menu: "Choix publicitaires" (Google consent form / privacy options)
const pz=$('#pause'),resume=$('#btnResume');
const ch=document.createElement('button');ch.id='btnAdChoices';ch.textContent='Choix publicitaires';
ch.style.cssText='margin-top:12px;background:none;border:1px solid rgba(244,210,146,.45);color:#f4d292;font:14px Georgia,serif;padding:7px 14px;border-radius:8px';
resume.parentNode.insertBefore(ch,resume.nextSibling);
ch.addEventListener('click',async()=>{await ready();nads('consentForm');});
})();
