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
function fresh(){return {v:1,onboarded:false,step:0,audit:{},sex:null,baseline:{perWeek:10,eur:3},
  goal:{type:'tauko',days:30,dryPerWeek:3,maxPerWeek:7,start:today()},log:{},badges:{},demo:false}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===1)return s}catch(e){}return fresh()}
let S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let persistAsked=false;
function askPersist(){if(persistAsked)return;persistAsked=true;try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}}
let installEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(S.onboarded&&ui.tab==='settings')render()});
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const ui={tab:'today',day:today(),editing:false,draft:null,feedback:null,anim:null,showTags:false,confirmReset:false,backup:'',restoreMsg:'',restore:''};

/* laskenta */
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

/* grafiikka */
const DROP_PATH='M50 4C50 4 14 46 14 70a36 36 0 0 0 72 0C86 46 50 4 50 4Z';
function drop(mood,cls){
  const eyes={
    happy:'<circle class="drop-eye" cx="38" cy="66" r="4.5"/><circle class="drop-eye" cx="62" cy="66" r="4.5"/>',
    cheer:'<path class="drop-mouth" d="M32 66q6-7 12 0M56 66q6-7 12 0"/>',
    calm:'<circle class="drop-eye" cx="38" cy="67" r="4"/><circle class="drop-eye" cx="62" cy="67" r="4"/>',
    care:'<circle class="drop-eye" cx="38" cy="68" r="4"/><circle class="drop-eye" cx="62" cy="68" r="4"/><path class="drop-mouth" style="stroke-width:2.6" d="M32 58l10 3M68 58l-10 3"/>'
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
const back=()=>'<button class="btn ghost" data-a="prev">← Takaisin</button>';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const stepper=(act,val,lbl,step)=>'<div class="stepper"><button data-a="'+act+'" data-v="-'+step+'" aria-label="Vähemmän">−</button><output class="num">'+val+'</output><button data-a="'+act+'" data-v="'+step+'" aria-label="Enemmän">+</button></div>'+(lbl?'<p class="small muted center" style="text-align:center">'+lbl+'</p>':'');

/* aloitus */
const estBaseline=()=>{const f=[0,.25,.75,2.5,5][S.audit.q1||0],t=[1.5,3.5,5.5,8,11][S.audit.q2||0];return Math.round(f*t)};
const STEPS=['welcome','q0','q1','q2','sex','result','baseline','goal'];
function renderOnboarding(){
  const step=STEPS[S.step]||'welcome';let h=topbar();
  if(step!=='welcome')h+='<div class="progress" aria-hidden="true"><i style="width:'+Math.round(S.step/(STEPS.length-1)*100)+'%"></i></div>';
  if(step==='welcome'){
    h+='<div class="stack-lg center" style="padding-top:20px"><div class="big-drop">'+drop('happy','bob')+'</div>'+
      '<div class="stack center"><h1>Moi, olen Tippa!</h1><p class="muted" style="max-width:32ch">Autan sinua pitämään kirjaa juomisesta. Tauko vai vähentäminen, sinä päätät.</p></div>'+
      '<div class="row" style="justify-content:center;gap:8px"><span class="chip">Maksuton</span><span class="chip">Anonyymi</span><span class="chip">Tiedot vain sinulla</span></div>'+
      '<div class="stack" style="width:100%"><button class="btn block" data-a="next">Aloitetaan</button><button class="btn secondary block" data-a="demo">Kurkista esimerkkiin</button></div>'+
      '<p class="small muted">A-klinikkasäätiön prototyyppi. Ei korvaa ammattilaisen arviota.</p></div>';
  }else if(step[0]==='q'){
    const i=+step[1],q=Q[i],cur=S.audit['q'+(i+1)];
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Pikatesti '+(i+1)+' / 3</span><h2>'+q.q+'</h2>'+(q.hint?'<p class="small muted">'+q.hint+'</p>':'')+'</div><div class="stack">'+
      q.o.map((o,j)=>'<button class="opt'+(cur===j?' sel':'')+'" data-a="ans" data-q="'+(i+1)+'" data-v="'+j+'">'+o+'</button>').join('')+'</div>'+back()+'</div>';
  }else if(step==='sex'){
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Vielä yksi</span><h2>Kumpaa riskirajaa käytetään?</h2><p class="small muted">Alkoholi vaikuttaa kehoon eri tavoin, joten rajat eroavat hieman. Tieto pysyy vain tällä laitteella.</p></div><div class="stack">'+
      [['mies','Miehen raja',''],['nainen','Naisen raja',''],['muu','En halua kertoa','Käytetään tiukempaa rajaa']].map(o=>'<button class="opt'+(S.sex===o[0]?' sel':'')+'" data-a="sex" data-v="'+o[0]+'">'+o[1]+(o[2]?'<span>'+o[2]+'</span>':'')+'</button>').join('')+'</div>'+back()+'</div>';
  }else if(step==='result'){
    const sc=auditScore(),lv=level();
    const txt=['Juomisesi on matalan riskin tasolla. Seuranta auttaa pitämään sen siellä.',
      'Juomisesi on riskitasolla. Hyvä uutinen: pienikin vähennys pienentää riskiä, ja moni onnistuu omin keinoin.',
      'Juomisesi on selvästi riskitasolla. Seuranta on hyvä alku, ja ammattilaisen kanssa kannattaa myös jutella. Apua-sivulta löydät vaihtoehtoja.'][lv];
    h+='<div class="stack-lg center"><div class="big-drop" style="width:110px">'+drop(lv===0?'happy':lv===1?'calm':'care','bob')+'</div>'+
      '<div class="stack center"><span class="level l'+lv+'">'+LEVELS[lv]+'</span><h2>'+sc+' / 12 pistettä</h2><p style="max-width:34ch">'+txt+'</p></div>'+
      '<p class="small muted" style="max-width:36ch">Testi on AUDIT-C. Se antaa suuntaa, mutta ei ole diagnoosi. Riskiraja sinulle: '+threshold()+' pistettä.</p>'+
      '<button class="btn block" data-a="next">Jatketaan</button>'+back()+'</div>';
  }else if(step==='baseline'){
    if(!S._bInit){S.baseline.perWeek=estBaseline();S._bInit=true}
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Lähtötaso</span><h2>Paljonko juot tavallisella viikolla?</h2><p class="small muted">Arvioin vastaustesi perusteella. Korjaa, jos ei osu.</p></div>'+
      '<div class="card stack">'+stepper('bw',S.baseline.perWeek,'annosta viikossa',1)+'</div>'+
      '<div class="card stack">'+stepper('eur',fmt(S.baseline.eur,1)+' €','keskihinta per annos (kauppa 2–3 €, baari 7–9 €)',0.5)+'</div>'+
      '<button class="btn block" data-a="next">Jatketaan</button>'+back()+'</div>';
  }else if(step==='goal'){
    const g=S.goal;
    h+='<div class="stack-lg"><div class="stack"><span class="eyebrow">Tavoite</span><h2>Mitä kokeillaan?</h2><p class="small muted">Voit vaihtaa milloin vain.</p></div><div class="stack">'+
      '<button class="opt'+(g.type==='tauko'?' sel':'')+'" data-a="gtype" data-v="tauko">Pidän tauon<span>Selkeä alkoholiton jakso</span></button>'+
      '<button class="opt'+(g.type==='vahenna'?' sel':'')+'" data-a="gtype" data-v="vahenna">Vähennän<span>Omat viikkotavoitteet</span></button></div>';
    if(g.type==='tauko'){
      h+='<div class="card stack"><span class="eyebrow center" style="text-align:center">Tauon pituus</span><div class="tags" style="justify-content:center">'+[7,14,30,60].map(n=>'<button class="tag'+(g.days===n?' sel':'')+'" data-a="gdays" data-v="'+n+'">'+n+' päivää</button>').join('')+'</div></div>';
    }else{
      if(!S._gInit){g.maxPerWeek=Math.round(S.baseline.perWeek*0.7);S._gInit=true}
      h+='<div class="card stack">'+stepper('gdry',g.dryPerWeek,'kuivaa päivää viikossa',1)+'</div><div class="card stack">'+stepper('gmax',g.maxPerWeek,'annosta viikossa enintään (nyt '+S.baseline.perWeek+')',1)+'</div>';
    }
    h+='<button class="btn block" data-a="finish">Valmista!</button>'+back()+'</div>';
  }
  return h;
}

/* tänään */
function greeting(){
  const d=ui.day,e=S.log[d],isToday=d===today(),st=stats();
  if(ui.feedback&&ui.feedback.d===d&&e)return ui.feedback;
  if(!e)return {mood:'happy',h:isToday?'Moi! Miten tänään menee?':'Miten '+WD[parse(d).getDay()]+'na meni?',t:isToday?'Kirjaa päivä, kun se on ohi. Vie pari sekuntia.':'Voit kirjata myös menneitä päiviä.'};
  if(e.dry)return {mood:'cheer',h:'Kuiva päivä!',t:'Kuivia päiviä on kertynyt '+st.dry+'.'};
  return {mood:'calm',h:'Kirjattu',t:'Kiva, että kirjasit. Rehellinen kirjanpito on tärkein osa tätä.'};
}
function feedbackFor(d){
  const e=S.log[d],st=stats();
  if(e.dry){const l=[['Ei tippaakaan!','Kuivia päiviä on nyt '+st.dry+'.'],['Hienoa!','Säästössä jo '+fmt(st.eur)+' €, se on '+equiv(st.eur)+'.'],['Jes!','Kuivia päiviä '+st.dry+'. Uni kiittää.']];
    const p=st.eur>=4?l[st.dry%l.length]:l[0];return {d,mood:'cheer',h:p[0],t:p[1]}}
  const a=annos(e);let t;
  if(S.goal.type==='tauko')t='Lipsahdus ei pyyhi mitään pois: '+st.dry+' kuivaa päivää on yhä tallessa. Jatketaan huomenna.';
  else{const w=weekData(weekStart(d));t=w.a<=S.goal.maxPerWeek?'Viikolla '+fmt(w.a,1)+' / '+S.goal.maxPerWeek+' annosta. Olet tavoitteessa.':'Viikon tavoite ylittyi. Ei haittaa, nyt tiedät missä se on vaikeaa. Uusi viikko alkaa maanantaina.'}
  if(a>=6)return {d,mood:'care',warm:true,h:'Kiitos, että kirjasit',t:t+' Kuusi annosta tai enemmän kerralla lisää tapaturmien riskiä. Jos tällaisia kertoja on usein, Apua-sivulla on vaihtoehtoja.'};
  return {d,mood:'calm',warm:true,h:'Kirjattu',t};
}
function renderToday(){
  const d=ui.day,e=S.log[d],ws=weekStart(today()),g=greeting();
  const anim=ui.anim==='jump'?'jump':'bob';ui.anim=null;
  let h=topbar()+'<div class="stack-lg">';
  h+='<div class="mascot-wrap"><div class="mascot"><div class="drop">'+drop(g.mood,anim)+'</div><div class="bubble'+(g.warm?' warm':'')+'" role="status"><b>'+g.h+'</b>'+g.t+'</div></div>'+
    (anim==='jump'?'<div class="splash" aria-hidden="true">'+[[-30,-30],[30,-34],[-40,4],[42,0],[0,-46]].map(p=>'<i style="--dx:'+p[0]+'px;--dy:'+p[1]+'px"></i>').join('')+'</div>':'')+'</div>';
  h+='<div class="week" role="group" aria-label="Valitse päivä">';
  for(let i=0;i<7;i++){const dd=addDays(ws,i),fut=dd>today();
    h+='<button class="day'+(dd===d?' sel':'')+'" data-a="day" data-v="'+dd+'"'+(fut?' disabled':'')+' aria-label="'+longDate(dd)+'"><span class="dn">'+DN[i]+'</span><span class="dd">'+parse(dd).getDate()+'</span>'+miniDrop(kind(S.log[dd]))+'</button>'}
  h+='</div>';
  if(!e||ui.editing){
    const dr=ui.draft;
    if(!dr){h+='<div class="choice"><button class="btn water" data-a="logdry">Ei tippaakaan<small>kuiva päivä</small></button><button class="btn secondary" data-a="startdrink">Join<small>kirjaa annokset</small></button></div>'}
    else{
      const a=DRINKS.reduce((s,x)=>s+(dr.drinks[x.id]||0)*x.a,0);
      h+='<div class="card stack"><div class="row between"><h3>Mitä joit?</h3><span class="small muted">Napauta lisätäksesi</span></div><div class="tiles">'+
        DRINKS.map(x=>{const c=dr.drinks[x.id]||0;return '<div class="stack" style="gap:2px;align-items:center"><button class="tile'+(c?' on':'')+'" style="width:100%" data-a="dq" data-id="'+x.id+'" data-v="1" aria-label="Lisää '+x.name+'">'+(c?'<span class="cnt">'+c+'</span>':'')+'<svg viewBox="0 0 24 24">'+ICON[x.id]+'</svg>'+x.name+'<small>'+x.size+'</small></button>'+(c?'<button class="minus" data-a="dq" data-id="'+x.id+'" data-v="-1" aria-label="Vähennä '+x.name+'">− poista</button>':'<span class="minus" aria-hidden="true">&nbsp;</span>')+'</div>'}).join('')+
        '</div><div class="row between"><span class="muted">Yhteensä</span><span class="total num">'+fmt(a,1)+' annosta</span></div>';
      if(a>0){h+=ui.showTags?'<div class="stack" style="gap:8px"><span class="eyebrow">Mikä tilanne?</span><div class="tags">'+TRIGGERS.map(t=>'<button class="tag'+(dr.tags.includes(t)?' sel':'')+'" data-a="tag" data-v="'+t+'">'+t+'</button>').join('')+'</div></div>'
        :'<button class="btn ghost" style="align-self:flex-start" data-a="showtags">+ Lisää tilanne (vapaaehtoinen)</button>'}
      h+='<div class="row"><button class="btn" style="flex:1" data-a="savedrink"'+(a>0?'':' disabled')+'>Tallenna</button><button class="btn secondary" data-a="canceldrink">Peru</button></div></div>';
    }
  }else{
    h+='<div class="card row between"><div class="row">'+miniDrop(kind(e),'width:22px;height:24px')+'<div><b>'+(e.dry?'Kuiva päivä':fmt(annos(e),1)+' annosta')+'</b>'+(e.tags&&e.tags.length?'<div class="small muted">'+e.tags.join(', ')+'</div>':'')+'</div></div><button class="btn ghost" data-a="edit">Muuta</button></div>';
  }
  h+=goalCard();
  return h+'</div>';
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

/* kertynyt */
function renderProgress(){
  const st=stats();let h=topbar()+'<div class="stack-lg"><h1 style="font-size:1.8rem;margin-top:8px">Kertynyt</h1>';
  h+='<div class="stats"><div class="stat wide">'+drop('cheer')+'<div><div class="v">'+st.dry+'</div><div class="l">kuivaa päivää</div></div></div>'+
    '<div class="stat"><div class="v">'+fmt(st.eur)+' €</div><div class="l">säästössä, '+equiv(st.eur)+'</div></div><div class="stat"><div class="v">'+fmt(st.saved)+'</div><div class="l">annosta vähemmän</div></div></div>';
  const ws=addDays(weekStart(today()),-28);
  h+='<div class="card stack"><h3>Viisi viikkoa</h3><div class="cal">'+DN.map(x=>'<span class="h">'+x+'</span>').join('');
  for(let i=0;i<35;i++){const d=addDays(ws,i);const k=d>today()?'future':kind(S.log[d]);h+=calDrop(k,longDate(d)+': '+({dry:'kuiva',drink:'joi',heavy:'6+ annosta',none:'ei kirjausta',future:'tulossa'})[k])}
  h+='</div><div class="legend"><span><i style="background:var(--c-dry)"></i>Kuiva</span><span><i style="background:var(--c-drink)"></i>Joi</span><span><i style="background:var(--c-heavy)"></i>6+ annosta</span><span><i style="background:var(--c-none)"></i>Ei kirjausta</span></div></div>';
  if(S.goal.type==='vahenna')h+='<div class="card stack"><h3>Annokset viikoittain</h3>'+chart()+'<div class="legend"><span><i style="background:var(--drop)"></i>Annokset</span><span><i style="background:var(--muted)"></i>Lähtötaso</span><span><i style="background:var(--sun)"></i>Tavoite</span></div></div>';
  const got=BADGES.filter(b=>S.badges[b.id]).length;
  h+='<div class="stack"><div class="row between"><h3>Merkit</h3><span class="muted small num">'+got+' / '+BADGES.length+'</span></div><div class="badges">'+BADGES.map(b=>'<div class="badge'+(S.badges[b.id]?' got':'')+'"><div class="b'+(b.m.length>3?' long':'')+'">'+b.m+'</div><div class="t">'+b.t+'</div><div class="s">'+b.s+'</div></div>').join('')+'</div></div>';
  const cnt={};Object.values(S.log).forEach(e=>(e.tags||[]).forEach(t=>cnt[t]=(cnt[t]||0)+1));
  const tops=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(tops.length){const mx=tops[0][1];h+='<div class="card stack"><h3>Tavallisimmat tilanteet</h3>'+tops.map(([t,n])=>'<div class="stack" style="gap:4px"><div class="row between small"><span>'+t+'</span><span class="num muted">'+n+'×</span></div><div class="bar"><i style="width:'+n/mx*100+'%;background:var(--sun)"></i></div></div>').join('')+'<p class="small muted">Kun tunnet tilanteesi, niihin voi varautua etukäteen.</p></div>'}
  h+='<p class="small muted">Säästöt verrattuna lähtötasoon ('+S.baseline.perWeek+' annosta viikossa, '+fmt(S.baseline.eur,1)+' € per annos). Lisäksi noin '+fmt(st.kcal)+' kcal vähemmän.</p>';
  return h+'</div>';
}
function chart(){
  const W=320,H=140,pl=24,pb=20,pt=8,weeks=[],ws0=weekStart(today());
  for(let i=7;i>=0;i--){const ws=addDays(ws0,-7*i);weeks.push({ws,...weekData(ws)})}
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
  const lv=level(),since=addDays(today(),-27),heavy=Object.entries(S.log).filter(([d,e])=>d>=since&&annos(e)>=6).length;
  const tier=(lv===2||heavy>=4)?2:(lv===1||heavy>=2)?1:0;
  const rec=[{h:'Jatka samaan malliin',p:'Tilanteesi näyttää hyvältä. Seuranta auttaa huomaamaan, jos tottumukset alkavat muuttua.'},
    {h:'Omahoidosta voi olla apua',p:'Moni vähentää omin keinoin, ja tuki helpottaa. Kokeile maksutonta omahoito-ohjelmaa tai ota asia puheeksi työterveydessä tai terveysasemalla.'},
    {h:'Juttele ammattilaisen kanssa',p:'Tilanteesta kannattaa keskustella ammattilaisen kanssa. Se ei sido sinua hoitoon. Lyhytkin keskustelu auttaa löytämään sopivan tuen.'}][tier];
  const why=[];if(lv>0)why.push('pikatesti '+auditScore()+' pistettä');if(heavy>0)why.push(heavy+' kertaa 6+ annosta viimeisen 4 viikon aikana');
  let h=topbar()+'<div class="stack-lg"><h1 style="font-size:1.8rem;margin-top:8px">Apua</h1>';
  h+='<div class="mascot"><div class="drop" style="width:64px">'+drop('calm')+'</div><div class="bubble" style="margin-bottom:12px"><b>'+rec.h+'</b>'+rec.p+(why.length?'<div class="small muted" style="margin-top:6px">Perusteena '+why.join(' ja ')+'.</div>':'')+'</div></div>';
  const items=[
    {t:'Päihdelinkki',d:'Tietoa, testejä ja palveluhaku omalta alueeltasi.',u:'https://paihdelinkki.fi',show:true},
    {t:'Mielenterveystalo',d:'Maksuttomia, anonyymejä omahoito-ohjelmia, myös alkoholin vähentämiseen.',u:'https://www.mielenterveystalo.fi',show:tier>=1},
    {t:'Työterveys tai terveysasema',d:'Alkoholin voi ottaa puheeksi tavallisella vastaanotolla.',show:tier>=1},
    {t:'Päivystysapu',d:'Neuvoa kiireelliseen tilanteeseen, esimerkiksi vieroitusoireisiin.',ph:'116 117',show:true},
    {t:'Hätänumero',d:'Kun henki tai terveys on välittömässä vaarassa.',ph:'112',show:true}].filter(x=>x.show);
  h+='<div class="card">'+items.map(x=>'<div class="help"><b>'+x.t+'</b><span class="small muted">'+x.d+'</span>'+(x.ph?'<span class="phone num">'+x.ph+'</span>':'')+(x.u?'<a href="'+x.u+'" target="_blank" rel="noopener">Avaa ↗</a>':'')+'</div>').join('')+'</div>';
  h+='<button class="btn secondary block" data-a="retest">Tee pikatesti uudelleen</button>';
  h+='<p class="small muted">Prototyypissä suositus määräytyy pikatestin ja 6+ annoksen kertojen mukaan. Tuotannossa linkkien avaukset mitattaisiin anonyymisti.</p>';
  return h+'</div>';
}

/* asetukset */
function renderSettings(){
  const g=S.goal;let h=topbar()+'<div class="stack-lg"><h1 style="font-size:1.8rem;margin-top:8px">Asetukset</h1>';
  h+='<div class="card stack"><h3>Tavoite</h3><div class="tags"><button class="tag'+(g.type==='tauko'?' sel':'')+'" data-a="sgtype" data-v="tauko">Tauko</button><button class="tag'+(g.type==='vahenna'?' sel':'')+'" data-a="sgtype" data-v="vahenna">Vähennän</button></div>';
  if(g.type==='tauko')h+='<div class="tags">'+[7,14,30,60].map(n=>'<button class="tag'+(g.days===n?' sel':'')+'" data-a="gdays" data-v="'+n+'">'+n+' pv</button>').join('')+'</div><p class="small muted">Jakso alkoi '+longDate(g.start)+'.</p><button class="btn secondary" data-a="restart">Aloita uusi jakso tänään</button>';
  else h+=stepper('gdry',g.dryPerWeek,'kuivaa päivää viikossa',1)+stepper('gmax',g.maxPerWeek,'annosta viikossa enintään',1);
  h+='</div><div class="card stack"><h3>Lähtötaso</h3>'+stepper('bw',S.baseline.perWeek,'annosta viikossa',1)+stepper('eur',fmt(S.baseline.eur,1)+' €','per annos',0.5)+'</div>';
  if(!isStandalone()){h+='<div class="card stack"><h3>Lisää kotinäytölle</h3><p class="small">Tippa toimii kuin sovellus, ja tietosi säilyvät paremmin, kun lisäät sen kotinäytölle.</p>'+(installEvt?'<button class="btn" data-a="install">Lisää kotinäytölle</button>':isIOS()?'<ol class="install-steps small"><li>Napauta Safarin Jaa-painiketta.</li><li>Valitse <b>Lisää Koti-valikkoon</b>.</li></ol>':'<p class="small muted">Avaa selaimen valikko ja valitse <b>Asenna sovellus</b> tai <b>Lisää aloitusnäyttöön</b>.</p>')+'</div>'}
  h+='<div class="card stack"><h3>Tietosi</h3><p class="small">Tippa ei kysy nimeä eikä sähköpostia. Kirjaukset ovat vain tämän laitteen selaimessa.</p><p class="small muted">Selain voi poistaa tiedot, jos tyhjennät sen tai palvelu on pitkään käyttämättä (etenkin iPhonella). Ota siis välillä varmuuskopio.</p>'+
    '<button class="btn secondary" data-a="mkbackup">Luo varmuuskopiokoodi</button>'+(ui.backup?'<textarea id="backup-out" readonly>'+ui.backup+'</textarea><button class="btn ghost" style="align-self:flex-start" data-a="copy">Kopioi koodi</button>':'')+
    '<label class="small" for="restore-in"><b>Palauta koodista</b></label><textarea id="restore-in" placeholder="Liitä koodi tähän">'+ui.restore+'</textarea><button class="btn secondary" data-a="restore">Palauta</button>'+(ui.restoreMsg?'<p class="small" role="status">'+ui.restoreMsg+'</p>':'')+'</div>';
  h+='<div class="card stack"><h3>Aloita alusta</h3>'+(ui.confirmReset?'<p class="small">Kaikki kirjaukset, tavoitteet ja merkit poistetaan tältä laitteelta. Tätä ei voi perua.</p><div class="row"><button class="btn danger" data-a="reset">Poista kaikki</button><button class="btn secondary" data-a="noreset">Peru</button></div>'
    :'<button class="btn secondary" data-a="askreset">Poista kaikki tiedot</button>')+'</div>';
  return h+'</div>';
}

/* esimerkki */
function loadDemo(){
  S=fresh();S.demo=true;S.onboarded=true;S.audit={q1:3,q2:1,q3:2};S.sex='mies';
  S.baseline={perWeek:16,eur:3.5};S.goal={type:'vahenna',days:30,dryPerWeek:4,maxPerWeek:8,start:addDays(today(),-41)};
  let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  for(let i=41;i>=1;i--){const d=addDays(today(),-i),wd=(parse(d).getDay()+6)%7,early=i>28;
    const drink=wd>=4?rnd()<(early?.9:.6):rnd()<(early?.45:.15);
    if(!drink){S.log[d]={dry:true};continue}
    const drinks={},n=wd>=4?(early?2+Math.floor(rnd()*3):1+Math.floor(rnd()*2)):1+Math.floor(rnd()*2);
    drinks[wd>=4?(rnd()<.5?'tuoppi':'viini'):'olut']=n;if(i===9)drinks.shotti=3;
    const tags=[wd>=4?'Seura':(rnd()<.5?'Rentoutuminen':'Tapa')];if(rnd()<.3)tags.push('Stressi');
    S.log[d]={dry:false,drinks,tags}}
  checkBadges();save();ui.tab='today';ui.day=today();ui.feedback=null;
}

/* piirto ja tapahtumat */
function render(){
  let h;
  if(!S.onboarded)h=renderOnboarding();
  else h=({today:renderToday,progress:renderProgress,help:renderHelp,settings:renderSettings})[ui.tab]()+
    '<nav class="tabs" aria-label="Päävalikko"><div class="in">'+[['today','Tänään','today'],['progress','Kertynyt','prog'],['help','Apua','help'],['settings','Asetukset','set']].map(t=>'<button class="'+(ui.tab===t[0]?'on':'')+'" data-a="tab" data-v="'+t[0]+'"'+(ui.tab===t[0]?' aria-current="page"':'')+'>'+NAV[t[2]]+t[1]+'</button>').join('')+'</div></nav>';
  $('#app').innerHTML=h;
}
function afterSave(d){
  askPersist();
  ui.feedback=feedbackFor(d);const nb=checkBadges();
  if(nb.length){const b=BADGES.find(x=>x.id===nb[nb.length-1]);setTimeout(()=>toast('<span class="b">'+b.m+'</span><span>Uusi merkki: '+b.t+'</span>'),500)}
}
document.addEventListener('input',e=>{if(e.target.id==='restore-in')ui.restore=e.target.value});
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,v=el.dataset.v;
  switch(a){
    case 'next':S.step++;break;
    case 'prev':S.step=Math.max(0,S.step-1);if((STEPS[S.step]==='q2'||STEPS[S.step]==='q1')&&S.audit.q1===0)S.step=STEPS.indexOf('q0');break;
    case 'demo':loadDemo();break;
    case 'ans':S.audit['q'+el.dataset.q]=+v;S.step++;if(el.dataset.q==='1'&&+v===0){S.audit.q2=0;S.audit.q3=0;S.step=STEPS.indexOf('sex')}break;
    case 'sex':S.sex=v;S.step++;break;
    case 'bw':S.baseline.perWeek=clamp(S.baseline.perWeek+(+v),0,100);break;
    case 'eur':S.baseline.eur=clamp(S.baseline.eur+(+v),0.5,20);break;
    case 'gtype':S.goal.type=v;break;
    case 'gdays':S.goal.days=+v;break;
    case 'gdry':S.goal.dryPerWeek=clamp(S.goal.dryPerWeek+(+v),0,7);break;
    case 'gmax':S.goal.maxPerWeek=clamp(S.goal.maxPerWeek+(+v),0,60);break;
    case 'finish':S.goal.start=today();S.onboarded=true;ui.tab='today';break;
    case 'tab':ui.tab=v;ui.confirmReset=false;window.scrollTo(0,0);break;
    case 'day':ui.day=v;ui.editing=false;ui.draft=null;ui.feedback=null;break;
    case 'logdry':S.log[ui.day]={dry:true};ui.editing=false;ui.draft=null;ui.anim='jump';afterSave(ui.day);break;
    case 'startdrink':{const e=S.log[ui.day];ui.showTags=!!(e&&e.tags&&e.tags.length);ui.draft={drinks:Object.assign({},e&&!e.dry?e.drinks:{}),tags:(e&&e.tags||[]).slice()};break}
    case 'dq':ui.draft.drinks[el.dataset.id]=clamp((ui.draft.drinks[el.dataset.id]||0)+(+v),0,30);break;
    case 'showtags':ui.showTags=true;break;
    case 'tag':{const t=ui.draft.tags,i=t.indexOf(v);i<0?t.push(v):t.splice(i,1);break}
    case 'savedrink':S.log[ui.day]={dry:false,drinks:ui.draft.drinks,tags:ui.draft.tags};ui.draft=null;ui.editing=false;afterSave(ui.day);break;
    case 'canceldrink':ui.draft=null;break;
    case 'edit':ui.editing=true;ui.draft=null;ui.feedback=null;break;
    case 'retest':S.onboarded=false;S.step=1;S._bInit=true;S._gInit=true;S._retest=true;break;
    case 'sgtype':S.goal.type=v;if(v==='tauko')S.goal.start=today();break;
    case 'restart':S.goal.start=today();toast('Uusi jakso alkoi tänään');break;
    case 'mkbackup':ui.backup=btoa(unescape(encodeURIComponent(JSON.stringify(S))));break;
    case 'copy':{const t=$('#backup-out'),done=()=>toast('Koodi kopioitu');if(navigator.clipboard)navigator.clipboard.writeText(ui.backup).then(done,()=>t.select());else t.select();return}
    case 'restore':try{const s=JSON.parse(decodeURIComponent(escape(atob(ui.restore.trim()))));if(s.v!==1||!s.log)throw 0;S=s;ui.restoreMsg='Tiedot palautettu.';ui.restore=''}catch(e){ui.restoreMsg='Koodia ei voitu lukea. Tarkista, että liitit koko koodin.'}break;
    case 'install':if(installEvt){installEvt.prompt();installEvt.userChoice.finally(()=>{installEvt=null;render()})}return;
    case 'askreset':ui.confirmReset=true;break;
    case 'noreset':ui.confirmReset=false;break;
    case 'reset':S=fresh();ui.confirmReset=false;ui.backup='';ui.feedback=null;ui.tab='today';break;
  }
  if(S._retest&&!S.onboarded&&STEPS[S.step]==='baseline'){S.onboarded=true;delete S._retest;ui.tab='help'}
  save();render();
});
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
