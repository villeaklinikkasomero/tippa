(function(){
const KEY='tippa.v1';
const ICON={
  olut:'<path d="M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z"/><path d="M8 13h8"/>',
  tuoppi:'<path d="M5 5h10v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M15 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M5 9h10"/>',
  lonkero:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M7 7h10M7 17h10"/>',
  viini:'<path d="M7 3h10c0 5-2 8-5 8s-5-3-5-8z"/><path d="M12 11v8M8 21h8M7.5 6h9"/>',
  pullo:'<path d="M10 2h4v5c2 1 3 3 3 5v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9c0-2 1-4 3-5z"/><path d="M7 14h10"/>',
  shotti:'<path d="M7 6h10l-1.5 14h-7z"/><path d="M7.6 11h8.8"/>'
};
const DRINKS=[
  {id:'olut',name:'Olut',size:'0,33 l',a:1},
  {id:'tuoppi',name:'Tuoppi',size:'0,5 l',a:1.5},
  {id:'lonkero',name:'Lonkero',size:'0,33 l',a:1.2},
  {id:'viini',name:'Viinilasi',size:'12 cl',a:1},
  {id:'pullo',name:'Viinipullo',size:'0,75 l',a:6},
  {id:'shotti',name:'Shotti',size:'4 cl',a:1}
];
const TRIGGERS=['Seura','Stressi','Rentoutuminen','Tapa','Huono olo','Ruoka','Muu'];
/* Alkoholi: AUDIT-C */
const Q=[
  {q:'Kuinka usein juot alkoholia?',o:['En koskaan','Kerran kuussa tai harvemmin','2–4 kertaa kuussa','2–3 kertaa viikossa','4 kertaa viikossa tai useammin']},
  {q:'Montako annosta juot tavallisesti kerralla?',o:['1–2','3–4','5–6','7–9','10 tai enemmän'],hint:'Yksi annos = pullo keskiolutta, lasi viiniä tai 4 cl väkevää.'},
  {q:'Kuinka usein juot kerralla kuusi annosta tai enemmän?',o:['En koskaan','Harvemmin kuin kerran kuussa','Kerran kuussa','Kerran viikossa','Päivittäin tai melkein']}
];
const BADGES=[
  {id:'dry1',m:'1',t:'Hyvä alku',s:'Ensimmäinen kuiva päivä'},
  {id:'dry7',m:'7',t:'Viikon verran',s:'7 kuivaa päivää'},
  {id:'dry14',m:'14',t:'Kaksi viikkoa',s:'14 kuivaa päivää'},
  {id:'dry30',m:'30',t:'Kuun mittainen',s:'30 kuivaa päivää'},
  {id:'log7',m:'7×',t:'Ahkera kirjaaja',s:'7 päivää kirjattu'},
  {id:'back',m:'↺',t:'Takaisin raiteille',s:'Kuiva päivä juomapäivän jälkeen'},
  {id:'eur20',m:'20€',t:'Pizzarahat',s:'20 € säästössä'},
  {id:'eur100',m:'100€',t:'Satanen',s:'100 € säästössä'},
  {id:'goal',m:'✓',t:'Tavoite taputeltu',s:'Tavoite saavutettu'}
];
/* Muut päihteet: ASSIST-rakenne (WHO), sama pisteytys kaikille aineille */
const SUBS=[
  {id:'kannabis',n:'Kannabis',ex:'marihuana, hasis',p:'kannabista',g:'kannabiksen'},
  {id:'stim',n:'Stimulantit',ex:'amfetamiini, kokaiini, ekstaasi',p:'stimulantteja',g:'stimulanttien'},
  {id:'opioid',n:'Opioidit',ex:'heroiini, buprenorfiini, oksikodoni',p:'opioideja',g:'opioidien'},
  {id:'laake',n:'Rauhoittavat tai unilääkkeet',ex:'ilman reseptiä tai ohjetta suurempina annoksina',p:'rauhoittavia lääkkeitä tai unilääkkeitä',g:'rauhoittavien lääkkeiden tai unilääkkeiden'},
  {id:'hallu',n:'Hallusinogeenit',ex:'LSD, sienet',p:'hallusinogeeneja',g:'hallusinogeenien'},
  {id:'muu',n:'Muu aine',ex:'esimerkiksi GHB tai ketamiini',p:'muuta ainetta',g:'aineen'}
];
const sub=id=>SUBS.find(s=>s.id===id);
const F5=['En kertaakaan','Kerran tai kahdesti','Kuukausittain','Viikoittain','Päivittäin tai lähes päivittäin'];
const F5b=['Ei kertaakaan'].concat(F5.slice(1));
const Y3=['Ei koskaan','Kyllä, viimeisen 3 kuukauden aikana','Kyllä, mutta ei viimeisen 3 kuukauden aikana'];
const AQ=[
  {q:s=>'Kuinka usein olet käyttänyt '+s.p+' viimeksi kuluneiden kolmen kuukauden aikana?',o:F5,p:[0,2,3,4,6]},
  {q:s=>'Kuinka usein sinulla on viimeksi kuluneiden kolmen kuukauden aikana ollut voimakas halu tai pakottava tarve käyttää '+s.p+'?',o:F5b,p:[0,3,4,5,6]},
  {q:s=>'Kuinka usein sinulle on viimeksi kuluneiden kolmen kuukauden aikana aiheutunut terveydellisiä, sosiaalisia, oikeudellisia tai taloudellisia ongelmia '+s.g+' käytöstä?',o:F5b,p:[0,4,5,6,7]},
  {q:s=>'Kuinka usein viimeksi kuluneiden kolmen kuukauden aikana et ole '+s.g+' käytön vuoksi saanut tehtyä jotain, mikä tavallisesti kuuluu tehtäviisi?',o:F5b,p:[0,5,6,7,8]},
  {q:s=>'Onko ystäväsi, sukulaisesi tai kukaan muu koskaan ilmaissut olevansa huolissaan '+s.g+' käytöstäsi?',o:Y3,p:[0,6,3]},
  {q:s=>'Oletko koskaan yrittänyt vähentää '+s.g+' käyttöäsi ja epäonnistunut siinä?',o:Y3,p:[0,6,3]}
];
const DBADGES=[
  {id:'dry1',m:'1',t:'Selvä alku',s:'Ensimmäinen selvä päivä'},
  {id:'dry7',m:'7',t:'Viikon verran',s:'7 selvää päivää'},
  {id:'dry14',m:'14',t:'Kaksi viikkoa',s:'14 selvää päivää'},
  {id:'dry30',m:'30',t:'Kuun mittainen',s:'30 selvää päivää'},
  {id:'log7',m:'7×',t:'Ahkera kirjaaja',s:'7 päivää kirjattu'},
  {id:'back',m:'↺',t:'Takaisin raiteille',s:'Selvä päivä käyttöpäivän jälkeen'},
  {id:'goal',m:'✓',t:'Tavoite taputeltu',s:'Tavoite saavutettu'}
];

/* päivämäärät */
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const diffDays=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const weekStart=s=>{const d=parse(s);d.setDate(d.getDate()-(d.getDay()+6)%7);return ymd(d)};
const DN=['ma','ti','ke','to','pe','la','su'];
const MONTHS=['tammikuuta','helmikuuta','maaliskuuta','huhtikuuta','toukokuuta','kesäkuuta','heinäkuuta','elokuuta','syyskuuta','lokakuuta','marraskuuta','joulukuuta'];
const WD=['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'];
const longDate=s=>{const d=parse(s);return WD[d.getDay()]+' '+d.getDate()+'. '+MONTHS[d.getMonth()]};
const fmt=(n,dec=0)=>n.toLocaleString('fi-FI',{maximumFractionDigits:dec});

/* tila */
function freshD(){return {subs:[],assist:{},baseline:{days:3,eur:10},goal:{type:'tauko',days:30,maxDays:2,start:today()},log:{},badges:{}}}
function fresh(){return {v:2,onboarded:false,step:0,track:{alcohol:true,drugs:false},audit:{},sex:null,baseline:{perWeek:10,eur:3},
  goal:{type:'tauko',days:30,dryPerWeek:3,maxPerWeek:7,start:today()},log:{},badges:{},d:freshD(),demo:false}}
function migrate(s){if(!s)return null;if(s.v===1){s.v=2;s.track={alcohol:true,drugs:false};s.d=freshD()}return s.v===2&&s.log?s:null}
function load(){try{const s=migrate(JSON.parse(localStorage.getItem(KEY)));if(s)return s}catch(e){}return fresh()}
let S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let installEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(S.onboarded&&ui.tab==='settings')render()});
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let persistAsked=false;
function askPersist(){if(persistAsked)return;persistAsked=true;try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}catch(e){}}
const ui={tab:'today',side:'alcohol',day:today(),editing:false,draft:null,feedback:null,anim:null,showTags:false,confirmReset:false,confirmResetD:false,backup:'',restoreMsg:'',restore:''};
const both=()=>S.track.alcohol&&S.track.drugs;
function fixSide(){if(ui.side==='alcohol'&&!S.track.alcohol)ui.side='drugs';if(ui.side==='drugs'&&!S.track.drugs)ui.side='alcohol'}

/* laskenta: alkoholi */
const annos=e=>!e||e.dry?0:DRINKS.reduce((s,d)=>s+(e.drinks&&e.drinks[d.id]||0)*d.a,0);
const kind=e=>!e?'none':e.dry?'dry':annos(e)>=6?'heavy':'drink';
const auditScore=()=>{const a=S.audit;return a.q1===0?0:(a.q1||0)+(a.q2||0)+(a.q3||0)};
const threshold=()=>S.sex==='mies'?6:5;
const level=()=>{const s=auditScore();return s>=8?2:s>=threshold()?1:0};
const LEVELS=['Matala riski','Kohonnut riski','Korkea riski'];
function stats(){const es=Object.values(S.log);const logged=es.length,dry=es.filter(e=>e.dry).length,total=es.reduce((s,e)=>s+annos(e),0);
  const saved=Math.max(0,S.baseline.perWeek/7*logged-total);return {logged,dry,total,saved,eur:saved*S.baseline.eur,kcal:saved*84}}
function weekData(ws){let dry=0,a=0,n=0;for(let i=0;i<7;i++){const e=S.log[addDays(ws,i)];if(e){n++;if(e.dry)dry++;a+=annos(e)}}return{dry,a,n}}
function taukoData(){const g=S.goal,idx=Math.min(g.days,Math.max(1,diffDays(g.start,today())+1));let dry=0;
  for(let i=0;i<g.days;i++){const e=S.log[addDays(g.start,i)];if(e&&e.dry)dry++}return{idx,dry}}
function equiv(eur){if(eur>=12){const n=Math.floor(eur/12);return 'noin '+n+' pizza'+(n===1?'':'a')}if(eur>=4){const n=Math.floor(eur/4);return 'noin '+n+' kahvi'+(n===1?'':'a')+' kahvilassa'}return 'ensimmäiset eurot'}
function checkBadges(){
  const st=stats(),out=[],give=id=>{if(!S.badges[id]){S.badges[id]=today();out.push(id)}};
  if(st.dry>=1)give('dry1');if(st.dry>=7)give('dry7');if(st.dry>=14)give('dry14');if(st.dry>=30)give('dry30');
  if(st.logged>=7)give('log7');if(st.eur>=20)give('eur20');if(st.eur>=100)give('eur100');
  for(const [d,e] of Object.entries(S.log)){if(!e.dry){const n=S.log[addDays(d,1)];if(n&&n.dry){give('back');break}}}
  if(S.goal.type==='tauko'){if(taukoData().dry>=S.goal.days)give('goal')}
  else{const ok=x=>x.dry>=S.goal.dryPerWeek&&x.a<=S.goal.maxPerWeek;const w=weekData(weekStart(today())),p=weekData(addDays(weekStart(today()),-7));
    if(ok(w)||(p.n>=5&&ok(p)))give('goal')}
  return out;
}
/* laskenta: muut päihteet */
const drankOn=d=>S.track.alcohol&&S.log[d]&&!S.log[d].dry;
const usedOn=d=>S.track.drugs&&S.d.log[d]&&!S.d.log[d].clean;
function dkind(d){const e=S.d.log[d];if(!e)return 'none';if(e.clean)return 'dry';return ((e.subs||[]).length>1||drankOn(d))?'heavy':'drink'}
function dstats(){const es=Object.values(S.d.log);const logged=es.length,clean=es.filter(e=>e.clean).length,used=logged-clean;
  const saved=Math.max(0,S.d.baseline.days/7*logged-used);return {logged,clean,used,saved,eur:saved*S.d.baseline.eur}}
function dweek(ws){let clean=0,used=0,n=0;for(let i=0;i<7;i++){const e=S.d.log[addDays(ws,i)];if(e){n++;e.clean?clean++:used++}}return{clean,used,n}}
function dtauko(){const g=S.d.goal,idx=Math.min(g.days,Math.max(1,diffDays(g.start,today())+1));let clean=0;
  for(let i=0;i<g.days;i++){const e=S.d.log[addDays(g.start,i)];if(e&&e.clean)clean++}return{idx,clean}}
function assistScore(id){const a=S.d.assist[id];if(!a||a.skipped||a[0]==null)return null;let s=0;
  AQ.forEach((q,i)=>{if(a[i]!=null&&!(a[0]===0&&i>=1&&i<=3))s+=q.p[a[i]]});return s}
const assistLevel=s=>s==null?null:s>=27?2:s>=4?1:0;
function dlevel(){let m=-1;S.d.subs.forEach(id=>{const l=assistLevel(assistScore(id));if(l!=null&&l>m)m=l});return m}
function checkDBadges(){
  const st=dstats(),out=[],B=S.d.badges,give=id=>{if(!B[id]){B[id]=today();out.push(id)}};
  if(st.clean>=1)give('dry1');if(st.clean>=7)give('dry7');if(st.clean>=14)give('dry14');if(st.clean>=30)give('dry30');if(st.logged>=7)give('log7');
  for(const [d,e] of Object.entries(S.d.log)){if(!e.clean){const n=S.d.log[addDays(d,1)];if(n&&n.clean){give('back');break}}}
  if(S.d.goal.type==='tauko'){if(dtauko().clean>=S.d.goal.days)give('goal')}
  else{const w=dweek(weekStart(today())),p=dweek(addDays(weekStart(today()),-7));if((w.n>=5&&w.used<=S.d.goal.maxDays)||(p.n>=5&&p.used<=S.d.goal.maxDays))give('goal')}
  return out;
}

/* grafiikka */
const DROP_PATH='M50 4C50 4 14 46 14 70a36 36 0 0 0 72 0C86 46 50 4 50 4Z';
function drop(mood,cls){
  const eyes={
    happy:'<circle class="drop-eye" cx="38" cy="66" r="4.5"/><circle class="drop-eye" cx="62" cy="66" r="4.5"/>',
    cheer:'<path class="drop-mouth" d="M32 66q6-7 12 0M56 66q6-7 12 0"/>',
    calm:'<circle class="drop-eye" cx="38" cy="67" r="4"/><circle class="drop-eye" cx="62" cy="67" r="4"/>',
    care:'<circle class="drop-eye" cx="38" cy="68" r="4"/><circle class="drop-eye" cx="62" cy="68" r="4"/><path class="drop-mouth" style="stroke-width:2.6" d="M32 61l10-4M68 61l-10-4"/>'
  }[mood];
  const mouth={happy:'<path class="drop-mouth" d="M41 80q9 9 18 0"/>',cheer:'<path d="M38 78q12 16 24 0z" fill="#14303A"/>',
    calm:'<path class="drop-mouth" d="M43 82q7 4 14 0"/>',care:'<path class="drop-mouth" d="M43 84h14"/>'}[mood];
  return '<svg viewBox="0 0 100 110" class="'+(cls||'')+'" aria-hidden="true"><path class="drop-c" d="'+DROP_PATH+'"/><ellipse class="drop-hl" cx="34" cy="52" rx="6" ry="10" transform="rotate(25 34 52)"/>'+eyes+mouth+'<circle class="drop-cheek" cx="28" cy="78" r="6"/><circle class="drop-cheek" cx="72" cy="78" r="6"/></svg>';
}
const miniDrop=(k,st)=>'<svg viewBox="0 0 100 110" class="mini-drop '+k+'"'+(st?' style="'+st+'"':'')+' aria-hidden="true"><path d="'+DROP_PATH+'"/></svg>';
const calDrop=(k,t)=>'<svg viewBox="0 0 100 110" class="'+k+'" role="img" aria-label="'+t+'"><path d="'+DROP_PATH+'" stroke-width="6"/></svg>';
const NAV={
  today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z"/></svg>',
  prog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 20V12M12 20V5M19 20v-6"/></svg>',
  help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 20s-8-4.5-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.5 12 20 12 20z"/></svg>',
  set:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>'
};

/* apu */
const $=s=>document.querySelector(s);
let toastTimer;
function toast(html){const t=$('#toast');t.innerHTML='<div class="toast" role="status">'+html+'</div>';t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true},3800)}
const topbar=()=>'<div class="top"><div class="logo"><svg viewBox="0 0 100 110" aria-hidden="true"><path class="drop-c" d="'+DROP_PATH+'"/></svg>Tippa</div><div class="row">'+(S.demo?'<span class="chip sun">Esimerkki</span>':'')+'<span class="chip">Prototyyppi</span></div></div>';
const sideSwitch=()=>both()?'<div class="seg" role="tablist" aria-label="Valitse seuranta"><button role="tab" aria-selected="'+(ui.side==='alcohol')+'" class="'+(ui.side==='alcohol'?'on':'')+'" data-a="side" data-v="alcohol">Alkoholi</button><button role="tab" aria-selected="'+(ui.side==='drugs')+'" class="'+(ui.side==='drugs'?'on':'')+'" data-a="side" data-v="drugs">Muut päihteet</button></div>':'';
const back=()=>'<button class="btn ghost" data-a="prev">← Takaisin</button>';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
/* Tuntupalaute: Android käyttää värinää, iPhonen Safari (iOS 18+) antaa kevyen napautuksen piilotetun kytkimen kautta */
let hapticEl=null;
function haptic(){try{if(navigator.vibrate){navigator.vibrate(10);return}
  if(!hapticEl){const l=document.createElement('label');l.setAttribute('aria-hidden','true');l.style.cssText='position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';const i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');i.tabIndex=-1;l.appendChild(i);document.body.appendChild(l);hapticEl=l}
  hapticEl.click()}catch(e){}}
const HAPTIC=['tab','side','logdry','savedrink','dq','finish','ans','dans','logclean','saveuse','usub','install'];
const stepper=(act,val,lbl,step)=>'<div class="stepper"><button data-a="'+act+'" data-v="-'+step+'" aria-label="Vähemmän">−</button><output class="num">'+val+'</output><button data-a="'+act+'" data-v="'+step+'" aria-label="Enemmän">+</button></div>'+(lbl?'<p class="small muted" style="text-align:center">'+lbl+'</p>':'');
const weekStrip=kf=>{const ws=weekStart(today());let h='<div class="week" role="group" aria-label="Valitse päivä">';
  for(let i=0;i<7;i++){const dd=addDays(ws,i),fut=dd>today();
    h+='<button class="day'+(dd===ui.day?' sel':'')+'" data-a="day" data-v="'+dd+'"'+(fut?' disabled':'')+' aria-label="'+longDate(dd)+'"><span class="dn">'+DN[i]+'</span><span class="dd">'+parse(dd).getDate()+'</span>'+miniDrop(kf(dd))+'</button>'}
  return h+'</div>'};
const mascotBox=(g,anim)=>'<div class="mascot-wrap"><div class="mascot"><div class="drop">'+drop(g.mood,anim)+'</div><div class="bubble'+(g.warm?' warm':'')+'" role="status"><b>'+g.h+'</b>'+g.t+'</div></div>'+
  (anim==='jump'?'<div class="splash" aria-hidden="true">'+[[-30,-30],[30,-34],[-40,4],[42,0],[0,-46]].map(p=>'<i style="--dx:'+p[0]+'px;--dy:'+p[1]+'px"></i>').join('')+'</div>':'')+'</div>';
const badgeGrid=(list,got)=>{const n=list.filter(b=>got[b.id]).length;return '<div class="stack"><div class="row between"><h3>Merkit</h3><span class="muted small num">'+n+' / '+list.length+'</span></div><div class="badges">'+list.map(b=>'<div class="badge'+(got[b.id]?' got':'')+'"><div class="b'+(b.m.length>3?' long':'')+'">'+b.m+'</div><div class="t">'+b.t+'</div><div class="s">'+b.s+'</div></div>').join('')+'</div></div>'};
const situations=log=>{const cnt={};Object.values(log).forEach(e=>(e.tags||[]).forEach(t=>cnt[t]=(cnt[t]||0)+1));const tops=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(!tops.length)return '';const mx=tops[0][1];return '<div class="card stack"><h3>Tavallisimmat tilanteet</h3>'+tops.map(([t,n])=>'<div class="stack" style="gap:4px"><div class="row between small"><span>'+t+'</span><span class="num muted">'+n+'×</span></div><div class="bar"><i style="width:'+n/mx*100+'%;background:var(--sun)"></i></div></div>').join('')+'<p class="small muted">Kun tunnet tilanteesi, niihin voi varautua etukäteen.</p></div>'};
const tagPicker=dr=>ui.showTags?'<div class="stack" style="gap:8px"><span class="eyebrow">Mikä tilanne?</span><div class="tags">'+TRIGGERS.map(t=>'<button class="tag'+(dr.tags.includes(t)?' sel':'')+'" data-a="tag" data-v="'+t+'">'+t+'</button>').join('')+'</div></div>'
  :'<button class="btn ghost" style="align-self:flex-start" data-a="showtags">+ Lisää tilanne (vapaaehtoinen)</button>';

/* aloitus */
const estBaseline=()=>{const f=[0,.25,.75,2.5,5][S.audit.q1||0],t=[1.5,3.5,5.5,8,11][S.audit.q2||0];return Math.round(f*t)};
function steps(){
  const a=[{k:'welcome'},{k:'choose'}];
  if(S.track.alcohol)a.push({k:'aq',i:0},{k:'aq',i:1},{k:'aq',i:2},{k:'sex'},{k:'result'});
  if(S.track.drugs&&S.d.subs.length){S.d.subs.forEach(id=>{for(let i=0;i<AQ.length;i++)a.push({k:'dq',s:id,i})});a.push({k:'dresult'})}
  if(S.track.alcohol)a.push({k:'baseline'},{k:'goal'});
  if(S.track.drugs)a.push({k:'dbaseline'},{k:'dgoal'});
  return a;
}
function skipStep(st){if(!st)return false;
  if(st.k==='aq'&&st.i>0&&S.audit.q1===0)return true;
  if(st.k==='dq'){const a=S.d.assist[st.s];if(a&&a.skipped)return true;if(st.i>=1&&st.i<=3&&a&&a[0]===0)return true}
  return false}
function go(dir){const L=steps();do{S.step+=dir}while(S.step>0&&S.step<L.length-1&&skipStep(L[S.step]));S.step=clamp(S.step,0,L.length-1)}
const SETUP_KINDS=['baseline','goal','dbaseline','dgoal'];
function nextBtn(label){const L=steps();return S.step>=L.length-1?'<button class="btn block" data-a="finish">Valmista!</button>':'<button class="btn block" data-a="next">'+(label||'Jatketaan')+'</button>'}
function renderOnboarding(){
  const L=steps(),st=L[S.step]||L[0];let h=topbar();
  if(st.k!=='welcome')h+='<div class="progress" aria-hidden="true"><i style="width:'+Math.round(S.step/(L.length-1)*100)+'%"></i></div>';
  if(st.k==='welcome'){
    h+='<div class="stack-lg center" style="padding-top:20px"><div class="big-drop">'+drop('happy','bob')+'</div>'+
      '<div class="stack center"><h1>Moi, olen Tippa!</h1><p class="muted" style="max-width:32ch">Autan sinua pitämään kirjaa alkoholin ja muiden päihteiden käytöstä. Tauko vai vähentäminen, sinä päätät.</p></div>'+
      '<div class="row" style="justify-content:center;gap:8px"><span class="chip">Maksuton</span><span class="chip">Anonyymi</span><span class="chip">Tiedot vain sinulla</span></div>'+
      '<div class="stack" style="width:100%"><button class="btn block" data-a="next">Aloitetaan</button><button class="btn secondary block" data-a="demo">Kurkista esimerkkiin</button></div>'+
      '<p class="small muted">A-klinikkasäätiön prototyyppi. Ei korvaa ammattilaisen arviota.</p></div>';
  }else if(st.k==='choose'){
    const t=S.track,ok=(t.alcohol||t.drugs)&&(!t.drugs||S.d.subs.length);
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Aluksi</span><h2>Mitä haluat seurata?</h2><p class="small muted">Voit valita molemmat. Ne pidetään sovelluksessa erillään, ja voit muuttaa valintaa myöhemmin.</p></div><div class="stack">'+
      '<button class="opt'+(t.alcohol?' sel':'')+'" data-a="track" data-v="alcohol" aria-pressed="'+t.alcohol+'">Alkoholi<span>Annokset, kuivat päivät ja säästöt</span></button>'+
      '<button class="opt'+(t.drugs?' sel':'')+'" data-a="track" data-v="drugs" aria-pressed="'+t.drugs+'">Muut päihteet<span>Kannabis, huumeet ja lääkkeiden väärinkäyttö</span></button></div>';
    if(t.drugs)h+='<div class="card stack"><span class="eyebrow">Mitä aineita? Valitse yksi tai useampi</span><div class="stack" style="gap:8px">'+SUBS.map(s=>'<button class="opt'+(S.d.subs.includes(s.id)?' sel':'')+'" data-a="sub" data-v="'+s.id+'" aria-pressed="'+S.d.subs.includes(s.id)+'">'+s.n+'<span>'+s.ex+'</span></button>').join('')+'</div>'+
      '<p class="small muted">Kirjaukset jäävät vain tälle laitteelle, eikä niitä lähetetä minnekään.</p></div>';
    h+='<button class="btn block" data-a="next"'+(ok?'':' disabled')+'>Jatketaan</button>'+back()+'</div>';
  }else if(st.k==='aq'){
    const q=Q[st.i],cur=S.audit['q'+(st.i+1)];
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Alkoholi · kysymys '+(st.i+1)+' / 3</span><h2>'+q.q+'</h2>'+(q.hint?'<p class="small muted">'+q.hint+'</p>':'')+'</div><div class="stack">'+
      q.o.map((o,j)=>'<button class="opt'+(cur===j?' sel':'')+'" data-a="ans" data-q="'+(st.i+1)+'" data-v="'+j+'">'+o+'</button>').join('')+'</div>'+back()+'</div>';
  }else if(st.k==='sex'){
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Alkoholi · vielä yksi</span><h2>Kumpaa riskirajaa käytetään?</h2><p class="small muted">Alkoholi vaikuttaa kehoon eri tavoin, joten rajat eroavat hieman. Tieto pysyy vain tällä laitteella.</p></div><div class="stack">'+
      [['mies','Miehen raja',''],['nainen','Naisen raja',''],['muu','En halua kertoa','Käytetään tiukempaa rajaa']].map(o=>'<button class="opt'+(S.sex===o[0]?' sel':'')+'" data-a="sex" data-v="'+o[0]+'">'+o[1]+(o[2]?'<span>'+o[2]+'</span>':'')+'</button>').join('')+'</div>'+back()+'</div>';
  }else if(st.k==='result'){
    const sc=auditScore(),lv=level();
    const txt=['Juomisesi on matalan riskin tasolla. Seuranta auttaa pitämään sen siellä.',
      'Juomisesi on riskitasolla. Hyvä uutinen: pienikin vähennys pienentää riskiä, ja moni onnistuu omin keinoin.',
      'Juomisesi on selvästi riskitasolla. Seuranta on hyvä alku, ja ammattilaisen kanssa kannattaa myös jutella. Apua-sivulta löydät vaihtoehtoja.'][lv];
    h+='<div class="stack-lg center"><div class="big-drop" style="width:110px">'+drop(lv===0?'happy':lv===1?'calm':'care','bob')+'</div>'+
      '<div class="stack center"><span class="eyebrow">Alkoholi</span><span class="level l'+lv+'">'+LEVELS[lv]+'</span><h2>'+sc+' / 12 pistettä</h2><p style="max-width:34ch">'+txt+'</p></div>'+
      '<p class="small muted" style="max-width:36ch">Testi on AUDIT-C. Se antaa suuntaa, mutta ei ole diagnoosi. Riskiraja sinulle: '+threshold()+' pistettä.</p>'+nextBtn()+back()+'</div>';
  }else if(st.k==='dq'){
    const s=sub(st.s),q=AQ[st.i],a=S.d.assist[st.s]||{},cur=a[st.i];
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">'+s.n+' · kysymys '+(st.i+1)+' / '+AQ.length+'</span><h2>'+q.q(s)+'</h2></div><div class="stack">'+
      q.o.map((o,j)=>'<button class="opt'+(cur===j?' sel':'')+'" data-a="dans" data-s="'+st.s+'" data-i="'+st.i+'" data-v="'+j+'">'+o+'</button>').join('')+'</div>'+
      '<div class="row between">'+back()+'<button class="btn ghost" data-a="dskip" data-s="'+st.s+'">Ohita tämä testi</button></div></div>';
  }else if(st.k==='dresult'){
    const lv=dlevel();
    const txt={'-1':'Ohitit testin. Voit tehdä sen myöhemmin Apua-sivulta.',
      0:'Käyttösi on testin perusteella matalan riskin tasolla. Seuranta auttaa huomaamaan, jos tilanne muuttuu.',
      1:'Käyttöösi liittyy kohtalainen riski haitoille. Jo pienet muutokset vähentävät haittoja, ja tukea on saatavilla.',
      2:'Käyttöösi liittyy suuri riski haitoille ja riippuvuudelle. Ammattilaisen kanssa kannattaa jutella. Apua-sivulta löydät vaihtoehtoja.'}[lv];
    h+='<div class="stack-lg center"><div class="big-drop" style="width:110px">'+drop(lv<=0?'happy':lv===1?'calm':'care','bob')+'</div>'+
      '<div class="stack center"><span class="eyebrow">Muut päihteet</span><p style="max-width:34ch">'+txt+'</p></div>'+
      '<div class="card stack" style="width:100%;text-align:left">'+S.d.subs.map(id=>{const sc=assistScore(id),l=assistLevel(sc);return '<div class="row between"><b>'+sub(id).n+'</b>'+(l==null?'<span class="chip">Ohitettu</span>':'<span class="row" style="gap:8px"><span class="small muted num">'+sc+' p</span><span class="level l'+l+'">'+LEVELS[l]+'</span></span>')+'</div>'}).join('')+'</div>'+
      '<p class="small muted" style="max-width:36ch">Testi perustuu WHO:n ASSIST-kyselyyn. Riskirajat ovat 4 ja 27 pistettä. Tulos antaa suuntaa, mutta ei ole diagnoosi.</p>'+nextBtn()+back()+'</div>';
  }else if(st.k==='baseline'){
    if(!S._bInit){S.baseline.perWeek=estBaseline();S._bInit=true}
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Alkoholi · lähtötaso</span><h2>Paljonko juot tavallisella viikolla?</h2><p class="small muted">Arvioin vastaustesi perusteella. Korjaa, jos ei osu.</p></div>'+
      '<div class="card stack">'+stepper('bw',S.baseline.perWeek,'annosta viikossa',1)+'</div>'+
      '<div class="card stack">'+stepper('eur',fmt(S.baseline.eur,1)+' €','keskihinta per annos (kauppa 2–3 €, baari 7–9 €)',0.5)+'</div>'+nextBtn()+back()+'</div>';
  }else if(st.k==='goal'){
    const g=S.goal;
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Alkoholi · tavoite</span><h2>Mitä kokeillaan?</h2><p class="small muted">Voit vaihtaa milloin vain.</p></div><div class="stack">'+
      '<button class="opt'+(g.type==='tauko'?' sel':'')+'" data-a="gtype" data-v="tauko">Pidän tauon<span>Selkeä alkoholiton jakso</span></button>'+
      '<button class="opt'+(g.type==='vahenna'?' sel':'')+'" data-a="gtype" data-v="vahenna">Vähennän<span>Omat viikkotavoitteet</span></button></div>';
    if(g.type==='tauko')h+='<div class="card stack"><span class="eyebrow" style="text-align:center">Tauon pituus</span><div class="tags" style="justify-content:center">'+[7,14,30,60].map(n=>'<button class="tag'+(g.days===n?' sel':'')+'" data-a="gdays" data-v="'+n+'">'+n+' päivää</button>').join('')+'</div></div>';
    else{if(!S._gInit){g.maxPerWeek=Math.round(S.baseline.perWeek*0.7);S._gInit=true}
      h+='<div class="card stack">'+stepper('gdry',g.dryPerWeek,'kuivaa päivää viikossa',1)+'</div><div class="card stack">'+stepper('gmax',g.maxPerWeek,'annosta viikossa enintään (nyt '+S.baseline.perWeek+')',1)+'</div>'}
    h+=nextBtn()+back()+'</div>';
  }else if(st.k==='dbaseline'){
    if(!S._dbInit){let m=0;S.d.subs.forEach(id=>{const a=S.d.assist[id];if(a&&a[0]!=null)m=Math.max(m,[0,0,1,2,6][a[0]])});S.d.baseline.days=m;S._dbInit=true}
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Muut päihteet · lähtötaso</span><h2>Monenako päivänä viikossa käytät tavallisesti?</h2><p class="small muted">Arvio vastaustesi perusteella. Korjaa, jos ei osu.</p></div>'+
      '<div class="card stack">'+stepper('dbd',S.d.baseline.days,'käyttöpäivää viikossa',1)+'</div>'+
      '<div class="card stack">'+stepper('deur',fmt(S.d.baseline.eur)+' €','kulut keskimäärin per käyttöpäivä (0 = ei säästölaskuria)',5)+'</div>'+nextBtn()+back()+'</div>';
  }else if(st.k==='dgoal'){
    const g=S.d.goal;
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Muut päihteet · tavoite</span><h2>Mitä kokeillaan?</h2><p class="small muted">Voit vaihtaa milloin vain.</p></div><div class="stack">'+
      '<button class="opt'+(g.type==='tauko'?' sel':'')+'" data-a="dgtype" data-v="tauko">Pidän tauon<span>Selkeä jakso ilman käyttöä</span></button>'+
      '<button class="opt'+(g.type==='vahenna'?' sel':'')+'" data-a="dgtype" data-v="vahenna">Vähennän<span>Vähemmän käyttöpäiviä viikossa</span></button></div>';
    if(g.type==='tauko')h+='<div class="card stack"><span class="eyebrow" style="text-align:center">Tauon pituus</span><div class="tags" style="justify-content:center">'+[7,14,30,60].map(n=>'<button class="tag'+(g.days===n?' sel':'')+'" data-a="dgdays" data-v="'+n+'">'+n+' päivää</button>').join('')+'</div></div>';
    else{if(!S._dgInit){g.maxDays=Math.max(0,S.d.baseline.days-1);S._dgInit=true}
      h+='<div class="card stack">'+stepper('dgmax',g.maxDays,'käyttöpäivää viikossa enintään (nyt '+S.d.baseline.days+')',1)+'</div>'}
    h+=nextBtn()+back()+'</div>';
  }
  return h;
}

/* tänään: alkoholi */
function greeting(){
  const d=ui.day,e=S.log[d],st=stats();
  if(ui.feedback&&ui.feedback.d===d&&ui.feedback.side==='alcohol'&&e)return ui.feedback;
  if(!e)return {mood:'happy',h:d===today()?'Moi! Miten tänään menee?':'Miten '+WD[parse(d).getDay()]+'na meni?',t:d===today()?'Kirjaa päivä, kun se on ohi. Vie pari sekuntia.':'Voit kirjata myös menneitä päiviä.'};
  if(e.dry)return {mood:'cheer',h:'Kuiva päivä!',t:'Kuivia päiviä on kertynyt '+st.dry+'.'};
  return {mood:'calm',h:'Kirjattu',t:'Kiva, että kirjasit. Rehellinen kirjanpito on tärkein osa tätä.'};
}
const MIX='Alkoholin ja muiden päihteiden yhdistäminen lisää yliannostuksen ja muiden haittojen riskiä.';
function feedbackFor(d){
  const e=S.log[d],st=stats();
  if(e.dry){const l=[['Ei tippaakaan!','Kuivia päiviä on nyt '+st.dry+'.'],['Hienoa!','Säästössä jo '+fmt(st.eur)+' €, se on '+equiv(st.eur)+'.'],['Jes!','Kuivia päiviä '+st.dry+'. Uni kiittää.']];
    const p=st.eur>=4?l[st.dry%l.length]:l[0];return {d,side:'alcohol',mood:'cheer',h:p[0],t:p[1]}}
  const a=annos(e);let t;
  if(S.goal.type==='tauko')t='Lipsahdus ei pyyhi mitään pois: '+st.dry+' kuivaa päivää on yhä tallessa. Jatketaan huomenna.';
  else{const w=weekData(weekStart(d));t=w.a<=S.goal.maxPerWeek?'Viikolla '+fmt(w.a,1)+' / '+S.goal.maxPerWeek+' annosta. Olet tavoitteessa.':'Viikon tavoite ylittyi. Ei haittaa, nyt tiedät missä se on vaikeaa. Uusi viikko alkaa maanantaina.'}
  if(usedOn(d))return {d,side:'alcohol',mood:'care',warm:true,h:'Kiitos, että kirjasit',t:t+' '+MIX};
  if(a>=6)return {d,side:'alcohol',mood:'care',warm:true,h:'Kiitos, että kirjasit',t:t+' Kuusi annosta tai enemmän kerralla lisää tapaturmien riskiä. Jos tällaisia kertoja on usein, Apua-sivulla on vaihtoehtoja.'};
  return {d,side:'alcohol',mood:'calm',warm:true,h:'Kirjattu',t};
}
function renderToday(){
  const d=ui.day,e=S.log[d],g=greeting(),anim=ui.anim==='jump'?'jump':'bob';ui.anim=null;
  let h=mascotBox(g,anim)+weekStrip(dd=>kind(S.log[dd]));
  if(!e||ui.editing){
    const dr=ui.draft;
    if(!dr)h+='<div class="choice"><button class="btn water" data-a="logdry">Ei tippaakaan<small>kuiva päivä</small></button><button class="btn secondary" data-a="startdrink">Join<small>kirjaa annokset</small></button></div>';
    else{
      const a=DRINKS.reduce((s,x)=>s+(dr.drinks[x.id]||0)*x.a,0);
      h+='<div class="card stack"><div class="row between"><h3>Mitä joit?</h3><span class="small muted">Napauta lisätäksesi</span></div><div class="tiles">'+
        DRINKS.map(x=>{const c=dr.drinks[x.id]||0;return '<div class="stack" style="gap:2px;align-items:center"><button class="tile'+(c?' on':'')+'" style="width:100%" data-a="dq" data-id="'+x.id+'" data-v="1" aria-label="Lisää '+x.name+'">'+(c?'<span class="cnt">'+c+'</span>':'')+'<svg viewBox="0 0 24 24">'+ICON[x.id]+'</svg>'+x.name+'<small>'+x.size+'</small></button>'+(c?'<button class="minus" data-a="dq" data-id="'+x.id+'" data-v="-1" aria-label="Vähennä '+x.name+'">− poista</button>':'<span class="minus" aria-hidden="true">&nbsp;</span>')+'</div>'}).join('')+
        '</div><div class="row between"><span class="muted">Yhteensä</span><span class="total num">'+fmt(a,1)+' annosta</span></div>';
      if(a>0)h+=tagPicker(dr);
      h+='<div class="row"><button class="btn" style="flex:1" data-a="savedrink"'+(a>0?'':' disabled')+'>Tallenna</button><button class="btn secondary" data-a="canceldraft">Peru</button></div></div>';
    }
  }else h+='<div class="card row between"><div class="row">'+miniDrop(kind(e),'width:22px;height:24px')+'<div><b>'+(e.dry?'Kuiva päivä':fmt(annos(e),1)+' annosta')+'</b>'+(e.tags&&e.tags.length?'<div class="small muted">'+e.tags.join(', ')+'</div>':'')+'</div></div><button class="btn ghost" data-a="edit">Muuta</button></div>';
  return h+goalCard();
}
function goalCard(){
  const g=S.goal;let h='<div class="card stack" style="gap:10px">';
  if(g.type==='tauko'){const t=taukoData();
    h+='<div class="row between"><h3>'+g.days+' päivän tauko</h3><span class="small muted num">päivä '+t.idx+' / '+g.days+'</span></div><div class="bar"><i style="width:'+Math.min(100,t.dry/g.days*100)+'%"></i></div><p class="small muted"><b class="num" style="color:var(--ink)">'+t.dry+'</b> kuivaa päivää. Jokainen lasketaan, vaikka välissä olisi juomapäiviä.</p>';
  }else{const w=weekData(weekStart(today()));
    h+='<h3>Tämä viikko</h3><div class="row between small"><span>Kuivat päivät</span><span class="num"><b>'+w.dry+'</b> / '+g.dryPerWeek+'</span></div><div class="bar"><i style="width:'+Math.min(100,w.dry/Math.max(1,g.dryPerWeek)*100)+'%"></i></div>'+
      '<div class="row between small"><span>Annokset</span><span class="num"><b>'+fmt(w.a,1)+'</b> / max '+g.maxPerWeek+'</span></div><div class="bar'+(w.a>g.maxPerWeek?' over':'')+'"><i style="width:'+Math.min(100,w.a/Math.max(1,g.maxPerWeek)*100)+'%"></i></div>';
  }
  return h+'</div>';
}

/* tänään: muut päihteet */
function greetingD(){
  const d=ui.day,e=S.d.log[d],st=dstats();
  if(ui.feedback&&ui.feedback.d===d&&ui.feedback.side==='drugs'&&e)return ui.feedback;
  if(!e)return {mood:'happy',h:d===today()?'Miten tänään menee?':'Miten '+WD[parse(d).getDay()]+'na meni?',t:d===today()?'Kirjaa päivä, kun se on ohi. Kirjaukset näkyvät vain sinulle.':'Voit kirjata myös menneitä päiviä.'};
  if(e.clean)return {mood:'cheer',h:'Selvä päivä!',t:'Selviä päiviä on kertynyt '+st.clean+'.'};
  return {mood:'calm',h:'Kirjattu',t:'Kiitos, että kirjasit. Rehellinen kirjanpito auttaa huomaamaan, mikä toimii.'};
}
function feedbackForD(d){
  const e=S.d.log[d],st=dstats();
  if(e.clean){const l=[['Selvä päivä!','Selviä päiviä on nyt '+st.clean+'.'],['Hienoa!','Jokainen selvä päivä antaa keholle ja mielelle tilaa palautua.'],['Jes!','Selviä päiviä '+st.clean+'. Hyvää työtä.']];
    return {d,side:'drugs',mood:'cheer',h:l[st.clean%l.length][0],t:l[st.clean%l.length][1]}}
  const subs=e.subs||[];let t;
  if(S.d.goal.type==='tauko')t='Käyttöpäivä ei pyyhi mitään pois: '+st.clean+' selvää päivää on yhä tallessa. Jatketaan huomenna.';
  else{const w=dweek(weekStart(d));t=w.used<=S.d.goal.maxDays?'Tällä viikolla '+w.used+' / '+S.d.goal.maxDays+' käyttöpäivää. Olet tavoitteessa.':'Viikon tavoite ylittyi. Nyt tiedät, missä se on vaikeaa. Uusi viikko alkaa maanantaina.'}
  const extra=[];
  if(subs.length>1||drankOn(d))extra.push(subs.length>1?'Eri aineiden yhdistäminen lisää yliannostuksen ja muiden haittojen riskiä.':MIX);
  if(subs.includes('opioid')||subs.includes('laake'))extra.push('Älä käytä yksin. Jos joku ei herää tai hengittää hitaasti, soita 112.');
  return {d,side:'drugs',mood:extra.length?'care':'calm',warm:true,h:extra.length?'Kiitos, että kirjasit':'Kirjattu',t:t+(extra.length?' '+extra.join(' '):'')};
}
function renderTodayD(){
  const d=ui.day,e=S.d.log[d],g=greetingD(),anim=ui.anim==='jump'?'jump':'bob';ui.anim=null;
  let h=mascotBox(g,anim)+weekStrip(dkind);
  if(!e||ui.editing){
    const dr=ui.draft;
    if(!dr)h+='<div class="choice"><button class="btn water" data-a="logclean">Selvä päivä<small>ei käyttöä</small></button><button class="btn secondary" data-a="startuse">Käytin<small>kirjaa mitä</small></button></div>';
    else{
      h+='<div class="card stack"><h3>Mitä käytit?</h3><div class="stack" style="gap:8px">'+S.d.subs.map(id=>'<button class="opt'+(dr.subs.includes(id)?' sel':'')+'" data-a="usub" data-v="'+id+'" aria-pressed="'+dr.subs.includes(id)+'">'+sub(id).n+'</button>').join('')+'</div>';
      if(dr.subs.length)h+=tagPicker(dr);
      h+='<div class="row"><button class="btn" style="flex:1" data-a="saveuse"'+(dr.subs.length?'':' disabled')+'>Tallenna</button><button class="btn secondary" data-a="canceldraft">Peru</button></div></div>';
    }
  }else h+='<div class="card row between"><div class="row">'+miniDrop(dkind(d),'width:22px;height:24px')+'<div><b>'+(e.clean?'Selvä päivä':e.subs.map(id=>sub(id).n).join(', '))+'</b>'+(e.tags&&e.tags.length?'<div class="small muted">'+e.tags.join(', ')+'</div>':'')+'</div></div><button class="btn ghost" data-a="edit">Muuta</button></div>';
  return h+goalCardD();
}
function goalCardD(){
  const g=S.d.goal;let h='<div class="card stack" style="gap:10px">';
  if(g.type==='tauko'){const t=dtauko();
    h+='<div class="row between"><h3>'+g.days+' päivän tauko</h3><span class="small muted num">päivä '+t.idx+' / '+g.days+'</span></div><div class="bar"><i style="width:'+Math.min(100,t.clean/g.days*100)+'%"></i></div><p class="small muted"><b class="num" style="color:var(--ink)">'+t.clean+'</b> selvää päivää. Jokainen lasketaan, vaikka välissä olisi käyttöpäiviä.</p>';
  }else{const w=dweek(weekStart(today()));
    h+='<h3>Tämä viikko</h3><div class="row between small"><span>Käyttöpäivät</span><span class="num"><b>'+w.used+'</b> / max '+g.maxDays+'</span></div><div class="bar'+(w.used>g.maxDays?' over':'')+'"><i style="width:'+Math.min(100,w.used/Math.max(1,g.maxDays)*100)+'%"></i></div><p class="small muted">Selviä päiviä tällä viikolla: <b class="num" style="color:var(--ink)">'+w.clean+'</b></p>';
  }
  return h+'</div>';
}

/* kertynyt */
function calendar(kf,labels){
  const ws=addDays(weekStart(today()),-28);let h='<div class="card stack"><h3>Viisi viikkoa</h3><div class="cal">'+DN.map(x=>'<span class="h">'+x+'</span>').join('');
  for(let i=0;i<35;i++){const d=addDays(ws,i);const k=d>today()?'future':kf(d);h+=calDrop(k,longDate(d)+': '+(labels[k]||'tulossa'))}
  return h+'</div><div class="legend"><span><i style="background:var(--c-dry)"></i>'+labels.dry+'</span><span><i style="background:var(--c-drink)"></i>'+labels.drink+'</span><span><i style="background:var(--c-heavy)"></i>'+labels.heavy+'</span><span><i style="background:var(--c-none)"></i>'+labels.none+'</span></div></div>';
}
function renderProgress(){
  const st=stats();
  let h='<div class="stats"><div class="stat wide">'+drop('cheer')+'<div><div class="v">'+st.dry+'</div><div class="l">kuivaa päivää</div></div></div>'+
    '<div class="stat"><div class="v">'+fmt(st.eur)+' €</div><div class="l">säästössä, '+equiv(st.eur)+'</div></div><div class="stat"><div class="v">'+fmt(st.saved)+'</div><div class="l">annosta vähemmän</div></div></div>';
  h+=calendar(d=>kind(S.log[d]),{dry:'Kuiva',drink:'Joi',heavy:'6+ annosta',none:'Ei kirjausta'});
  if(S.goal.type==='vahenna')h+='<div class="card stack"><h3>Annokset viikoittain</h3>'+chart()+'<div class="legend"><span><i style="background:var(--drop)"></i>Annokset</span><span><i style="background:var(--muted)"></i>Lähtötaso</span><span><i style="background:var(--sun)"></i>Tavoite</span></div></div>';
  h+=badgeGrid(BADGES,S.badges)+situations(S.log);
  h+='<p class="small muted">Säästöt verrattuna lähtötasoon ('+S.baseline.perWeek+' annosta viikossa, '+fmt(S.baseline.eur,1)+' € per annos). Lisäksi noin '+fmt(st.kcal)+' kcal vähemmän.</p>';
  return h;
}
function renderProgressD(){
  const st=dstats(),showEur=S.d.baseline.eur>0;
  let h='<div class="stats"><div class="stat wide">'+drop('cheer')+'<div><div class="v">'+st.clean+'</div><div class="l">selvää päivää</div></div></div>'+
    (showEur?'<div class="stat"><div class="v">'+fmt(st.eur)+' €</div><div class="l">säästössä, '+equiv(st.eur)+'</div></div>':'')+
    '<div class="stat"'+(showEur?'':' style="grid-column:1/-1"')+'><div class="v">'+fmt(st.saved)+'</div><div class="l">käyttöpäivää vähemmän</div></div></div>';
  h+=calendar(dkind,{dry:'Selvä',drink:'Käytti',heavy:'Sekakäyttö',none:'Ei kirjausta'});
  h+=badgeGrid(DBADGES,S.d.badges)+situations(S.d.log);
  h+='<p class="small muted">Vertailu lähtötasoon: '+S.d.baseline.days+' käyttöpäivää viikossa'+(showEur?', '+fmt(S.d.baseline.eur)+' € per käyttöpäivä':'')+'. Sekakäyttö tarkoittaa useampaa ainetta tai alkoholia samana päivänä.</p>';
  return h;
}
function chart(){
  const W=320,H=140,pl=24,pb=20,pt=8,weeks=[],ws0=weekStart(today());
  for(let i=7;i>=0;i--){const ws=addDays(ws0,-7*i);weeks.push(Object.assign({ws},weekData(ws)))}
  const base=S.baseline.perWeek,goal=S.goal.maxPerWeek,mx=Math.max(4,base,goal,...weeks.map(w=>w.a)),step=mx>20?10:5,top=Math.ceil(mx/step)*step;
  const y=v=>pt+(H-pt-pb)*(1-v/top),bw=(W-pl)/8;
  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Annokset viikoittain, 8 viikkoa">';
  for(let v=0;v<=top;v+=step)s+='<line x1="'+pl+'" x2="'+W+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="var(--line)"/><text x="'+(pl-6)+'" y="'+(y(v)+3)+'" text-anchor="end">'+v+'</text>';
  weeks.forEach((w,i)=>{const x=pl+i*bw+bw*.18;s+='<rect x="'+x+'" y="'+y(w.a)+'" width="'+bw*.64+'" height="'+Math.max(0,y(0)-y(w.a))+'" rx="6" fill="var(--drop)"/>';
    const d=parse(w.ws);s+='<text x="'+(x+bw*.32)+'" y="'+(H-5)+'" text-anchor="middle">'+d.getDate()+'.'+(d.getMonth()+1)+'.</text>'});
  s+='<line x1="'+pl+'" x2="'+W+'" y1="'+y(base)+'" y2="'+y(base)+'" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="'+pl+'" x2="'+W+'" y1="'+y(goal)+'" y2="'+y(goal)+'" stroke="var(--sun)" stroke-width="2.5"/>';
  return s+'</svg>';
}

/* apua */
function renderHelp(){
  const since=addDays(today(),-27),why=[];let tier=0;
  if(S.track.alcohol){const lv=level(),heavy=Object.entries(S.log).filter(([d,e])=>d>=since&&annos(e)>=6).length;
    tier=Math.max(tier,(lv===2||heavy>=4)?2:(lv===1||heavy>=2)?1:0);
    if(lv>0)why.push('alkoholin pikatesti '+auditScore()+' pistettä');if(heavy>0)why.push(heavy+' kertaa 6+ annosta 4 viikossa');}
  if(S.track.drugs){const lv=dlevel(),recent=Object.keys(S.d.log).filter(d=>d>=since);
    const mixed=recent.filter(d=>dkind(d)==='heavy').length,used=recent.filter(d=>!S.d.log[d].clean).length;
    tier=Math.max(tier,lv===2?2:(lv===1||mixed>=2||used>=16)?1:0);
    S.d.subs.forEach(id=>{const s=assistScore(id);if(assistLevel(s)>0)why.push(sub(id).n.toLowerCase()+': testi '+s+' pistettä')});
    if(mixed>0)why.push(mixed+' sekakäyttöpäivää 4 viikossa');}
  const rec=[{h:'Jatka samaan malliin',p:'Tilanteesi näyttää hyvältä. Seuranta auttaa huomaamaan, jos tottumukset alkavat muuttua.'},
    {h:'Omahoidosta voi olla apua',p:'Moni vähentää omin keinoin, ja tuki helpottaa. Kokeile maksutonta omahoito-ohjelmaa tai ota asia puheeksi työterveydessä tai terveysasemalla.'},
    {h:'Juttele ammattilaisen kanssa',p:'Tilanteesta kannattaa keskustella ammattilaisen kanssa. Se ei sido sinua hoitoon. Lyhytkin keskustelu auttaa löytämään sopivan tuen.'}][tier];
  let h='<h1 style="font-size:1.8rem;margin-top:8px">Apua</h1>';
  h+='<div class="mascot"><div class="drop" style="width:64px">'+drop('calm')+'</div><div class="bubble" style="margin-bottom:12px"><b>'+rec.h+'</b>'+rec.p+(why.length?'<div class="small muted" style="margin-top:6px">Perusteena '+why.join(', ')+'.</div>':'')+'</div></div>';
  const items=[
    {t:'Päihdelinkki',d:'Tietoa, testejä ja palveluhaku omalta alueeltasi.',u:'https://paihdelinkki.fi',show:true},
    {t:'Mielenterveystalo',d:'Maksuttomia, anonyymejä omahoito-ohjelmia.',u:'https://www.mielenterveystalo.fi',show:tier>=1},
    {t:'Työterveys tai terveysasema',d:'Päihteiden käytön voi ottaa puheeksi tavallisella vastaanotolla.',show:tier>=1},
    {t:'Terveysneuvontapisteet',d:'Haittoja vähentävää neuvontaa ja välineitä ilman nimeä. Löydät lähimmän Päihdelinkin palveluhausta.',show:S.track.drugs},
    {t:'Myrkytystietokeskus',d:'Neuvoa myrkytyksiin ja yliannostuksiin ympäri vuorokauden.',ph:'0800 147 111',show:S.track.drugs},
    {t:'Päivystysapu',d:'Neuvoa kiireelliseen tilanteeseen, esimerkiksi vieroitusoireisiin.',ph:'116 117',show:true},
    {t:'Hätänumero',d:'Kun henki tai terveys on välittömässä vaarassa, esimerkiksi jos joku ei herää.',ph:'112',show:true}].filter(x=>x.show);
  h+='<div class="card">'+items.map(x=>'<div class="help"><b>'+x.t+'</b><span class="small muted">'+x.d+'</span>'+(x.ph?'<span class="phone num">'+x.ph+'</span>':'')+(x.u?'<a href="'+x.u+'" target="_blank" rel="noopener">Avaa ↗</a>':'')+'</div>').join('')+'</div>';
  h+='<button class="btn secondary block" data-a="retest">Tee testit uudelleen</button>';
  h+='<p class="small muted">Prototyypissä suositus määräytyy testien ja kirjausten mukaan. Tuotannossa linkkien avaukset mitattaisiin anonyymisti.</p>';
  return h;
}

/* asetukset */
function renderSettings(){
  const g=S.goal,t=S.track;let h='<h1 style="font-size:1.8rem;margin-top:8px">Asetukset</h1>';
  h+='<div class="card stack"><h3>Mitä seuraat</h3><div class="tags"><button class="tag'+(t.alcohol?' sel':'')+'" data-a="strack" data-v="alcohol" aria-pressed="'+t.alcohol+'">Alkoholi</button><button class="tag'+(t.drugs?' sel':'')+'" data-a="strack" data-v="drugs" aria-pressed="'+t.drugs+'">Muut päihteet</button></div>';
  if(t.drugs)h+='<span class="eyebrow">Aineet</span><div class="tags">'+SUBS.map(s=>'<button class="tag'+(S.d.subs.includes(s.id)?' sel':'')+'" data-a="ssub" data-v="'+s.id+'" aria-pressed="'+S.d.subs.includes(s.id)+'">'+s.n+'</button>').join('')+'</div>';
  h+='<p class="small muted">Piilotetun seurannan tiedot säilyvät, kunnes poistat ne.</p></div>';
  if(t.alcohol){
    h+='<div class="card stack"><h3>Alkoholi: tavoite</h3><div class="tags"><button class="tag'+(g.type==='tauko'?' sel':'')+'" data-a="sgtype" data-v="tauko">Tauko</button><button class="tag'+(g.type==='vahenna'?' sel':'')+'" data-a="sgtype" data-v="vahenna">Vähennän</button></div>';
    if(g.type==='tauko')h+='<div class="tags">'+[7,14,30,60].map(n=>'<button class="tag'+(g.days===n?' sel':'')+'" data-a="gdays" data-v="'+n+'">'+n+' pv</button>').join('')+'</div><p class="small muted">Jakso alkoi '+longDate(g.start)+'.</p><button class="btn secondary" data-a="restart">Aloita uusi jakso tänään</button>';
    else h+=stepper('gdry',g.dryPerWeek,'kuivaa päivää viikossa',1)+stepper('gmax',g.maxPerWeek,'annosta viikossa enintään',1);
    h+='</div><div class="card stack"><h3>Alkoholi: lähtötaso</h3>'+stepper('bw',S.baseline.perWeek,'annosta viikossa',1)+stepper('eur',fmt(S.baseline.eur,1)+' €','per annos',0.5)+'</div>';
  }
  if(t.drugs){const dg=S.d.goal;
    h+='<div class="card stack"><h3>Muut päihteet: tavoite</h3><div class="tags"><button class="tag'+(dg.type==='tauko'?' sel':'')+'" data-a="sdgtype" data-v="tauko">Tauko</button><button class="tag'+(dg.type==='vahenna'?' sel':'')+'" data-a="sdgtype" data-v="vahenna">Vähennän</button></div>';
    if(dg.type==='tauko')h+='<div class="tags">'+[7,14,30,60].map(n=>'<button class="tag'+(dg.days===n?' sel':'')+'" data-a="dgdays" data-v="'+n+'">'+n+' pv</button>').join('')+'</div><p class="small muted">Jakso alkoi '+longDate(dg.start)+'.</p><button class="btn secondary" data-a="drestart">Aloita uusi jakso tänään</button>';
    else h+=stepper('dgmax',dg.maxDays,'käyttöpäivää viikossa enintään',1);
    h+='</div><div class="card stack"><h3>Muut päihteet: lähtötaso</h3>'+stepper('dbd',S.d.baseline.days,'käyttöpäivää viikossa',1)+stepper('deur',fmt(S.d.baseline.eur)+' €','per käyttöpäivä',5)+'</div>';
  }
  if(!isStandalone()){h+='<div class="card stack"><h3>Lisää kotinäytölle</h3><p class="small">Tippa toimii kuin sovellus, ja tietosi säilyvät paremmin, kun lisäät sen kotinäytölle.</p>'+(installEvt?'<button class="btn" data-a="install">Lisää kotinäytölle</button>':isIOS()?'<ol class="install-steps small"><li>Napauta Safarin Jaa-painiketta.</li><li>Valitse <b>Lisää Koti-valikkoon</b>.</li></ol>':'<p class="small muted">Avaa selaimen valikko ja valitse <b>Asenna sovellus</b> tai <b>Lisää aloitusnäyttöön</b>.</p>')+'</div>'}
  h+='<div class="card stack"><h3>Tietosi</h3><p class="small">Tippa ei kysy nimeä eikä sähköpostia. Kaikki kirjaukset ovat vain tämän laitteen selaimessa, eikä niitä lähetetä minnekään.</p><p class="small muted">Selain voi poistaa tiedot, jos tyhjennät sen tai palvelu on pitkään käyttämättä (etenkin iPhonella). Ota siis välillä varmuuskopio. Jos joku muu käyttää samaa laitetta, hän voi nähdä kirjauksesi.</p>'+
    '<button class="btn secondary" data-a="mkbackup">Luo varmuuskopiokoodi</button>'+(ui.backup?'<textarea id="backup-out" readonly>'+ui.backup+'</textarea><button class="btn ghost" style="align-self:flex-start" data-a="copy">Kopioi koodi</button>':'')+
    '<label class="small" for="restore-in"><b>Palauta koodista</b></label><textarea id="restore-in" placeholder="Liitä koodi tähän">'+ui.restore+'</textarea><button class="btn secondary" data-a="restore">Palauta</button>'+(ui.restoreMsg?'<p class="small" role="status">'+ui.restoreMsg+'</p>':'')+'</div>';
  if(Object.keys(S.d.log).length)h+='<div class="card stack"><h3>Poista muiden päihteiden kirjaukset</h3>'+(ui.confirmResetD?'<p class="small">Muiden päihteiden kirjaukset ja merkit poistetaan. Alkoholin tiedot säilyvät.</p><div class="row"><button class="btn danger" data-a="resetd">Poista</button><button class="btn secondary" data-a="noresetd">Peru</button></div>':'<button class="btn secondary" data-a="askresetd">Poista muiden päihteiden kirjaukset</button>')+'</div>';
  h+='<div class="card stack"><h3>Aloita alusta</h3>'+(ui.confirmReset?'<p class="small">Kaikki kirjaukset, tavoitteet ja merkit poistetaan tältä laitteelta. Tätä ei voi perua.</p><div class="row"><button class="btn danger" data-a="reset">Poista kaikki</button><button class="btn secondary" data-a="noreset">Peru</button></div>'
    :'<button class="btn secondary" data-a="askreset">Poista kaikki tiedot</button>')+'</div>';
  return h;
}

/* esimerkki */
function loadDemo(){
  S=fresh();S.demo=true;S.onboarded=true;S.track={alcohol:true,drugs:true};S.audit={q1:3,q2:1,q3:2};S.sex='mies';
  S.baseline={perWeek:16,eur:3.5};S.goal={type:'vahenna',days:30,dryPerWeek:4,maxPerWeek:8,start:addDays(today(),-41)};
  S.d.subs=['kannabis'];S.d.assist={kannabis:{0:3,1:2,2:0,3:1,4:1,5:0}};S.d.baseline={days:3,eur:10};S.d.goal={type:'vahenna',days:30,maxDays:1,start:addDays(today(),-41)};
  let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  for(let i=41;i>=1;i--){const d=addDays(today(),-i),wd=(parse(d).getDay()+6)%7,early=i>28;
    const drink=wd>=4?rnd()<(early?.9:.6):rnd()<(early?.45:.15);
    if(!drink)S.log[d]={dry:true};
    else{const drinks={},n=wd>=4?(early?2+Math.floor(rnd()*3):1+Math.floor(rnd()*2)):1+Math.floor(rnd()*2);
      drinks[wd>=4?(rnd()<.5?'tuoppi':'viini'):'olut']=n;if(i===9)drinks.shotti=3;
      const tags=[wd>=4?'Seura':(rnd()<.5?'Rentoutuminen':'Tapa')];if(rnd()<.3)tags.push('Stressi');
      S.log[d]={dry:false,drinks,tags}}
    const use=rnd()<(early?(wd>=4?.6:.3):(wd>=4?.3:.08));
    S.d.log[d]=use?{clean:false,subs:['kannabis'],tags:[rnd()<.5?'Rentoutuminen':'Huono olo']}:{clean:true}}
  checkBadges();checkDBadges();save();ui.tab='today';ui.side='alcohol';ui.day=today();ui.feedback=null;
}

/* piirto ja tapahtumat */
function render(){
  let h;
  if(!S.onboarded)h=renderOnboarding();
  else{
    fixSide();const dr=ui.side==='drugs';
    const body=ui.tab==='today'?(dr?renderTodayD():renderToday()):ui.tab==='progress'?'<h1 style="font-size:1.8rem;margin-top:8px">Kertynyt</h1>'+(dr?renderProgressD():renderProgress()):ui.tab==='help'?renderHelp():renderSettings();
    h=topbar()+'<div class="stack-lg">'+((ui.tab==='today'||ui.tab==='progress')?sideSwitch():'')+body+'</div>'+
      '<nav class="tabs" aria-label="Päävalikko"><div class="in">'+[['today','Tänään','today'],['progress','Kertynyt','prog'],['help','Apua','help'],['settings','Asetukset','set']].map(t=>'<button class="'+(ui.tab===t[0]?'on':'')+'" data-a="tab" data-v="'+t[0]+'"'+(ui.tab===t[0]?' aria-current="page"':'')+'>'+NAV[t[2]]+t[1]+'</button>').join('')+'</div></nav>';
  }
  $('#app').innerHTML=h;
}
function badgeToast(list,ids){if(!ids.length)return;const b=list.find(x=>x.id===ids[ids.length-1]);setTimeout(()=>toast('<span class="b">'+b.m+'</span><span>Uusi merkki: '+b.t+'</span>'),500)}
function afterSave(d){askPersist();ui.feedback=feedbackFor(d);badgeToast(BADGES,checkBadges())}
function afterSaveD(d){askPersist();ui.feedback=feedbackForD(d);badgeToast(DBADGES,checkDBadges())}
const toggle=(arr,v)=>{const i=arr.indexOf(v);i<0?arr.push(v):arr.splice(i,1)};
function finishOnboarding(){const t=today();if(!S._retest){S.goal.start=t;S.d.goal.start=t}S.onboarded=true;ui.tab=S._retest?'help':'today';delete S._retest;fixSide()}
document.addEventListener('input',e=>{if(e.target.id==='restore-in')ui.restore=e.target.value});
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,v=el.dataset.v;
  if(HAPTIC.includes(a))haptic();
  switch(a){
    case 'next':go(1);break;
    case 'prev':go(-1);break;
    case 'demo':loadDemo();break;
    case 'track':S.track[v]=!S.track[v];break;
    case 'sub':toggle(S.d.subs,v);break;
    case 'ans':S.audit['q'+el.dataset.q]=+v;if(el.dataset.q==='1'&&+v===0){S.audit.q2=0;S.audit.q3=0}go(1);break;
    case 'sex':S.sex=v;go(1);break;
    case 'dans':{const s=el.dataset.s;S.d.assist[s]=S.d.assist[s]||{};delete S.d.assist[s].skipped;S.d.assist[s][+el.dataset.i]=+v;go(1);break}
    case 'dskip':S.d.assist[el.dataset.s]=Object.assign(S.d.assist[el.dataset.s]||{},{skipped:true});go(1);break;
    case 'bw':S.baseline.perWeek=clamp(S.baseline.perWeek+(+v),0,100);break;
    case 'eur':S.baseline.eur=clamp(S.baseline.eur+(+v),0.5,20);break;
    case 'gtype':S.goal.type=v;break;
    case 'gdays':S.goal.days=+v;break;
    case 'gdry':S.goal.dryPerWeek=clamp(S.goal.dryPerWeek+(+v),0,7);break;
    case 'gmax':S.goal.maxPerWeek=clamp(S.goal.maxPerWeek+(+v),0,60);break;
    case 'dbd':S.d.baseline.days=clamp(S.d.baseline.days+(+v),0,7);break;
    case 'deur':S.d.baseline.eur=clamp(S.d.baseline.eur+(+v),0,500);break;
    case 'dgtype':S.d.goal.type=v;break;
    case 'dgdays':S.d.goal.days=+v;break;
    case 'dgmax':S.d.goal.maxDays=clamp(S.d.goal.maxDays+(+v),0,7);break;
    case 'finish':finishOnboarding();break;
    case 'tab':ui.tab=v;ui.confirmReset=false;ui.confirmResetD=false;window.scrollTo(0,0);break;
    case 'side':ui.side=v;ui.editing=false;ui.draft=null;ui.feedback=null;break;
    case 'day':ui.day=v;ui.editing=false;ui.draft=null;ui.feedback=null;break;
    case 'logdry':S.log[ui.day]={dry:true};ui.editing=false;ui.draft=null;ui.anim='jump';afterSave(ui.day);break;
    case 'startdrink':{const e=S.log[ui.day];ui.showTags=!!(e&&e.tags&&e.tags.length);ui.draft={drinks:Object.assign({},e&&!e.dry?e.drinks:{}),tags:(e&&e.tags||[]).slice()};break}
    case 'dq':ui.draft.drinks[el.dataset.id]=clamp((ui.draft.drinks[el.dataset.id]||0)+(+v),0,30);break;
    case 'showtags':ui.showTags=true;break;
    case 'tag':toggle(ui.draft.tags,v);break;
    case 'savedrink':S.log[ui.day]={dry:false,drinks:ui.draft.drinks,tags:ui.draft.tags};ui.draft=null;ui.editing=false;afterSave(ui.day);break;
    case 'logclean':S.d.log[ui.day]={clean:true};ui.editing=false;ui.draft=null;ui.anim='jump';afterSaveD(ui.day);break;
    case 'startuse':{const e=S.d.log[ui.day];ui.showTags=!!(e&&e.tags&&e.tags.length);ui.draft={subs:e&&!e.clean?e.subs.slice():(S.d.subs.length===1?[S.d.subs[0]]:[]),tags:(e&&e.tags||[]).slice()};break}
    case 'usub':toggle(ui.draft.subs,v);break;
    case 'saveuse':S.d.log[ui.day]={clean:false,subs:ui.draft.subs,tags:ui.draft.tags};ui.draft=null;ui.editing=false;afterSaveD(ui.day);break;
    case 'canceldraft':ui.draft=null;break;
    case 'edit':ui.editing=true;ui.draft=null;ui.feedback=null;break;
    case 'retest':S.onboarded=false;S._retest=true;S._bInit=S._gInit=S._dbInit=S._dgInit=true;Object.values(S.d.assist).forEach(x=>delete x.skipped);S.step=2;break;
    case 'strack':{const o=v==='alcohol'?'drugs':'alcohol';if(S.track[v]&&!S.track[o])break;S.track[v]=!S.track[v];if(v==='drugs'&&S.track.drugs&&!S.d.subs.length)S.d.subs.push('kannabis');break}
    case 'ssub':if(!(S.d.subs.length===1&&S.d.subs[0]===v))toggle(S.d.subs,v);break;
    case 'sgtype':S.goal.type=v;if(v==='tauko')S.goal.start=today();break;
    case 'sdgtype':S.d.goal.type=v;if(v==='tauko')S.d.goal.start=today();break;
    case 'restart':S.goal.start=today();toast('Uusi jakso alkoi tänään');break;
    case 'drestart':S.d.goal.start=today();toast('Uusi jakso alkoi tänään');break;
    case 'mkbackup':ui.backup=btoa(unescape(encodeURIComponent(JSON.stringify(S))));break;
    case 'copy':{const t=$('#backup-out'),done=()=>toast('Koodi kopioitu');if(navigator.clipboard)navigator.clipboard.writeText(ui.backup).then(done,()=>t.select());else t.select();return}
    case 'restore':try{const s=migrate(JSON.parse(decodeURIComponent(escape(atob(ui.restore.trim())))));if(!s)throw 0;S=s;ui.restoreMsg='Tiedot palautettu.';ui.restore=''}catch(e){ui.restoreMsg='Koodia ei voitu lukea. Tarkista, että liitit koko koodin.'}break;
    case 'askresetd':ui.confirmResetD=true;break;
    case 'noresetd':ui.confirmResetD=false;break;
    case 'resetd':S.d.log={};S.d.badges={};ui.confirmResetD=false;toast('Muiden päihteiden kirjaukset poistettu');break;
    case 'install':if(installEvt){installEvt.prompt();installEvt.userChoice.finally(()=>{installEvt=null;render()})}return;
    case 'askreset':ui.confirmReset=true;break;
    case 'noreset':ui.confirmReset=false;break;
    case 'reset':S=fresh();ui.confirmReset=false;ui.backup='';ui.feedback=null;ui.tab='today';break;
  }
  if(S._retest&&!S.onboarded){const st=steps()[S.step];if(st&&SETUP_KINDS.includes(st.k))finishOnboarding()}
  save();render();
});
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
