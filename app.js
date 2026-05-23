const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS='ttd_static_v8';
const defaults={settings:{password:'1234',org:'香港聖公會福利協會有限公司',host:'香港聖公會 聖匠堂長者地區中心',memberLabel:'會員編號',cats:['小組活動','講座','義工活動','戶外活動','健康活動','認知訓練','社交活動','運動活動','社區宣傳','其他']},active:'home',volunteer:false,event:{name:'樂齡同行情緒支援小組',category:'小組活動',date:'2026-06-27',time:'09:30-12:30',place:'聖匠堂長者地區中心',sessions:['2026-06-27','2026-07-04','2026-07-11'],outdoor:true,hasMember:true,participants:[{name:'陳大文',phone:'91234567',member:'M001',emergencyName:'陳太',emergencyPhone:'91230000'},{name:'李小美',phone:'62345678',member:'M002',emergencyName:'李先生',emergencyPhone:'62340000'},{name:'黃浩然',phone:'66440924',member:'M0132',emergencyName:'黃太',emergencyPhone:'66440000'}],attendance:{}},records:[],leave:{person:'',leaveAt:'',applicantName:'',witnessName:'',staffName:'',applicantDate:new Date().toISOString().slice(0,10),witnessDate:new Date().toISOString().slice(0,10),staffDate:new Date().toISOString().slice(0,10),sigs:{}}};
let state=load();
// v8.5 migration: remove old demo applicant name from departure declaration to avoid generated documents always showing 陳大文
if(!state.version || state.version < '8.5'){
  state.version='8.5';
  if(state.leave){
    if(state.leave.person==='陳大文') state.leave.person='';
    if(state.leave.applicantName==='陳大文') state.leave.applicantName='';
    state.leave.leaveAt = state.leave.leaveAt==='活動完結前自行離隊' ? '' : (state.leave.leaveAt||'');
  }
  save();
}function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(LS)||'{}')}}catch{return structuredClone(defaults)}}function save(){localStorage.setItem(LS,JSON.stringify(state))}function esc(s=''){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}function fmt(d){if(!d)return'';let x=new Date(d);return isNaN(x)?d:`${x.getMonth()+1}/${x.getDate()}`}function toast(t){let n=document.createElement('div');n.className='pill';n.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:200;background:#172033;color:#fff';n.textContent=t;document.body.append(n);setTimeout(()=>n.remove(),1800)}
function parseRows(text,hasMember=false){return text.split(/\n+/).map(l=>l.trim()).filter(Boolean).map(l=>{let p=l.includes('\t')?l.split('\t'):l.includes(',')?l.split(','):l.split(/\s+/);p=p.map(x=>x.trim()).filter(Boolean);return {name:p[0]||'',phone:p[1]||'',member:hasMember?(p[2]||''):''}}).filter(x=>x.name)}
function parseEmer(text){return text.split(/\n+/).map(l=>l.trim()).filter(Boolean).map(l=>{let p=l.includes('\t')?l.split('\t'):l.includes(',')?l.split(','):l.split(/\s+/);p=p.map(x=>x.trim()).filter(Boolean);return {name:p[0]||'',emergencyName:p[1]||'',emergencyPhone:p[2]||''}})}
function setPage(p){if(state.volunteer&&p!=='attendance'){toast('義工協助模式已鎖定頁面');return}state.active=p;save();render()}
function nav(){let items=[['home','🏠','首頁'],['attendance','✅','出席'],['records','🗂️','簽到'],['leave','✍️','離隊'],['stats','📊','統計'],['settings','⚙️','設定']];return `<nav class="nav">${items.map(i=>`<button onclick="setPage('${i[0]}')" class="${state.active===i[0]?'active':''}"><span class="ico">${i[1]}</span><span>${i[2]}</span></button>`).join('')}</nav>`}
function layout(content){$('#app').innerHTML=`<div class="app ${state.volunteer?'hideVolunteer':''}"><div class="shell"><div class="hero"><div class="duck">🦆</div><div><h1>Tick Tick Duck</h1><div class="sub">快速管理活動出席、簽到及戶外活動紀錄</div></div></div>${content}</div></div>${state.volunteer?'':nav()}`}
function home(){let e=state.event,s=state.settings;layout(`<div class="card"><h2>建立活動</h2><div class="grid grid2"><div class="field"><label>活動名稱</label><input id="name" value="${esc(e.name)}"></div><div class="field"><label>活動類別</label><select id="category">${s.cats.map(c=>`<option ${e.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="field"><label>活動日期</label><input id="date" type="date" value="${e.date}"></div><div class="field"><label>活動時間</label><input id="time" value="${esc(e.time)}"></div><div class="field"><label>活動地點</label><input id="place" value="${esc(e.place)}"></div><div class="field"><label>活動節數日期（一行一個）</label><textarea id="sessions">${e.sessions.join('\n')}</textarea></div></div><div class="row"><label class="pill"><input id="outdoor" type="checkbox" ${e.outdoor?'checked':''}> 是否外出活動</label><label class="pill"><input id="hasMember" type="checkbox" ${e.hasMember?'checked':''}> 有${esc(s.memberLabel)}／學生編號</label></div></div><div class="card"><h2>批量輸入參加者</h2><p class="muted">支援 Excel 直接貼上：姓名　電話　${esc(s.memberLabel)}</p><div class="field"><textarea id="plist" placeholder="陳大文 91234567 M001&#10;李小美 62345678 M002"></textarea></div><div class="row"><button class="btn primary" onclick="applyParticipants()">匯入參加者</button><span class="pill">現有 ${e.participants.length} 人</span></div></div><div class="card"><h2>緊急聯絡人</h2><p class="muted">外出活動適用：參加者姓名　緊急聯絡人　電話</p><div class="field"><textarea id="elist" placeholder="陳大文 陳太 91230000"></textarea></div><button class="btn" onclick="applyEmergency()">配對緊急聯絡人</button></div><button class="btn primary" onclick="saveHome()">儲存活動資料</button>`);}
window.saveHome=function(){let e=state.event;e.name=$('#name').value;e.category=$('#category').value;e.date=$('#date').value;e.time=$('#time').value;e.place=$('#place').value;e.sessions=$('#sessions').value.split(/\n+/).map(x=>x.trim()).filter(Boolean);e.outdoor=$('#outdoor').checked;e.hasMember=$('#hasMember').checked;save();toast('已儲存')}
window.applyParticipants=function(){state.event.participants=parseRows($('#plist').value,$('#hasMember').checked);saveHome();render();toast('已匯入參加者')}
window.applyEmergency=function(){let rows=parseEmer($('#elist').value),miss=[];rows.forEach(r=>{let p=state.event.participants.find(x=>x.name===r.name);if(p){p.emergencyName=r.emergencyName;p.emergencyPhone=r.emergencyPhone}else miss.push(r.name)});save();toast(miss.length?`未能配對：${miss.join('、')}`:'已配對')}
function matchScore(p,q){if(!q)return 0;let hay=[p.name,p.phone,p.member,p.emergencyName,p.emergencyPhone].join(' ').toLowerCase();q=q.toLowerCase();if(hay.includes(q))return 2;return [...q].every(ch=>hay.includes(ch))?1:0}

let searchTimer=null;
window.ttdSearchComposing=false;
function normSearch(s=''){return String(s).toLowerCase().replace(/\s+/g,'').trim()}
function rowScore(text,q){text=normSearch(text);q=normSearch(q);if(!q)return 0;if(text.includes(q))return 3;return [...q].every(ch=>text.includes(ch))?1:0}
window.applyAttendanceSearchNow=function(value){
  const q = (value !== undefined && value !== null) ? value : (sessionStorage.getItem('ttd_q') || '');
  sessionStorage.setItem('ttd_q', q);
  const tbody=document.querySelector('.att tbody');
  const input=document.getElementById('q');
  const result=document.getElementById('qResult');
  if(!tbody) return;
  const rows=[...tbody.querySelectorAll('tr')];
  rows.forEach((tr,idx)=>{
    const score=rowScore(tr.dataset.search||'', q);
    tr.dataset.score=score;
    tr.classList.toggle('hit', !!q && score>0);
    tr.classList.toggle('dim', !!q && score===0);
    tr.style.display='';
  });
  rows.sort((a,b)=>{
    if(q){
      const diff=(Number(b.dataset.score)||0)-(Number(a.dataset.score)||0);
      if(diff) return diff;
    }
    return (Number(a.dataset.index)||0)-(Number(b.dataset.index)||0);
  }).forEach(tr=>tbody.appendChild(tr));
  if(result){
    const matched=q?rows.filter(r=>Number(r.dataset.score)>0).length:rows.length;
    result.textContent=q?`找到 ${matched} / ${rows.length} 位參加者，符合項目已排到最前`:`共 ${rows.length} 位參加者`;
  }
  if(input && document.activeElement!==input){
    // 不強制 focus，避免手機鍵盤及速成輸入法跳動
  }
}
window.updateAttendanceSearch=function(value, force=false, ev=null){
  sessionStorage.setItem('ttd_q', value || '');
  if(!force && (window.ttdSearchComposing || ev?.isComposing)) return;
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>applyAttendanceSearchNow(value), force ? 0 : 120);
}
window.clearAttendanceSearch=function(){
  sessionStorage.setItem('ttd_q','');
  const q=document.getElementById('q');
  if(q){q.value='';q.focus({preventScroll:true});}
  applyAttendanceSearchNow('');
}
function attendance(){let e=state.event,q=sessionStorage.getItem('ttd_q')||'';let list=e.participants.map((p,i)=>({...p,_i:i}));layout(`<div class="search"><div class="card"><div class="row"><span class="pill">${esc(e.name)}</span><span class="pill">${esc(e.category)}</span><span class="pill">${esc(e.place)}</span></div><div class="row" style="margin-top:10px"><input id="q" placeholder="快速搜尋姓名／電話／${esc(state.settings.memberLabel)}／緊急聯絡人" value="${esc(q)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="search" oncompositionstart="window.ttdSearchComposing=true" oncompositionend="window.ttdSearchComposing=false; updateAttendanceSearch(this.value,true,event)" oninput="updateAttendanceSearch(this.value,false,event)" style="flex:1;min-height:52px;border:1px solid var(--line);border-radius:16px;padding:12px;font-size:16px;ime-mode:active;"><button class="btn mini" onclick="clearAttendanceSearch()">清除</button><span id="qResult" class="pill">共 ${e.participants.length} 位參加者</span></div><div class="row" style="margin-top:10px"><button class="btn ${state.volunteer?'warn':'green'}" onclick="toggleVolunteer()">${state.volunteer?'解除義工協助模式':'啟動義工協助模式'}</button>${state.volunteer?'':`<button class="btn primary private" onclick="confirmRecord()">確認並生成簽到紀錄</button><button class="btn private" onclick="openPreview('attendance')">預覽/匯出</button>`}</div></div></div><div class="tableWrap"><table class="att"><thead><tr><th class="sticky">參加者</th>${e.hasMember?`<th>${esc(state.settings.memberLabel)}</th>`:''}<th class="private">電話</th>${e.outdoor?'<th>緊急聯絡</th>':''}${e.sessions.map(d=>`<th>${fmt(d)}</th>`).join('')}</tr></thead><tbody>${list.map((p,idx)=>{let searchText=[p.name,p.phone,p.member,p.emergencyName,p.emergencyPhone].filter(Boolean).join(' ');return `<tr data-index="${idx}" data-search="${esc(searchText)}"><td class="sticky"><b>${esc(p.name)}</b></td>${e.hasMember?`<td>${esc(p.member||'')}</td>`:''}<td class="private phone"><button class="btn mini" onclick="this.nextElementSibling.hidden=!this.nextElementSibling.hidden">👁</button><span hidden>${esc(p.phone||'')}</span><span>••••••</span></td>${e.outdoor?`<td>${esc(p.emergencyName||'')}<br><span class="phone">${esc(p.emergencyPhone||'')}</span></td>`:''}${e.sessions.map((d,si)=>{let k=p._i+'_'+si,v=e.attendance[k]||'';return `<td><button class="cellBtn ${v==='○'?'present':v==='X'?'absent':''}" onclick="cycle('${k}',this,event)">${v}</button></td>`}).join('')}</tr>`}).join('')}</tbody></table></div>`);requestAnimationFrame(()=>applyAttendanceSearchNow(q))}
window.cycle=function(k,btn,ev){
  if(ev){ev.preventDefault();ev.stopPropagation();}
  const wrap=btn?btn.closest('.tableWrap'):null;
  const sx=wrap?wrap.scrollLeft:0, sy=wrap?wrap.scrollTop:0;
  let a=state.event.attendance;
  a[k]=a[k]==='○'?'X':a[k]==='X'?'':'○';
  save();
  if(btn){
    btn.textContent=a[k]||'';
    btn.classList.remove('present','absent');
    if(a[k]==='○') btn.classList.add('present');
    if(a[k]==='X') btn.classList.add('absent');
    if(wrap){requestAnimationFrame(()=>{wrap.scrollLeft=sx;wrap.scrollTop=sy;});}
  }
}
window.toggleVolunteer=function(){if(!state.volunteer){state.volunteer=true;state.active='attendance';save();render();return}let p=prompt('請輸入管理密碼');if(p===state.settings.password){state.volunteer=false;save();render();toast('已解除')}else toast('密碼錯誤')}
window.confirmRecord=function(){state.records.unshift({id:Date.now(),created:new Date().toISOString(),event:structuredClone(state.event)});save();state.active='records';render();toast('已生成簽到紀錄')}
function records(){layout(`<div class="card"><h2>活動簽到紀錄</h2>${state.records.length?'':'<p class="muted">未有紀錄</p>'}</div>${state.records.map(r=>{let e=r.event,total=e.participants.length,att=Object.values(e.attendance||{}).filter(v=>v==='○').length;return `<div class="card"><h2>${esc(e.name)}</h2><p class="muted">${esc(e.category)}｜${esc(e.place)}｜${new Date(r.created).toLocaleString()}</p><div class="row"><span class="pill">參加 ${total}</span><span class="pill">出席 ${att}</span></div><div class="row" style="margin-top:10px"><button class="btn" onclick="openPreview('record',${r.id})">查看／匯出</button><button class="btn warn" onclick="delRecord(${r.id})">刪除</button></div></div>`}).join('')}`)}
window.delRecord=id=>{if(confirm('確定刪除？')){state.records=state.records.filter(r=>r.id!==id);save();render()}}
function leave(){let l=state.leave,e=state.event;let options=(e.participants||[]).map(p=>`<option value="${esc(p.name)}" ${l.person===p.name?'selected':''}>${esc(p.name)}</option>`).join('');layout(`<div class="card"><h2>戶外活動離隊聲明</h2><p class="muted">請先選擇或輸入申請人姓名，預覽文件會即時使用此姓名，不會再自動套用示範姓名。</p><div class="grid grid2"><div class="field"><label>從參加者選擇</label><select id="personSelect" onchange="document.getElementById('person').value=this.value"><option value="">請選擇參加者</option>${options}</select></div><div class="field"><label>申請人姓名</label><input id="person" placeholder="請輸入申請人姓名" value="${esc(l.person||'')}"></div><div class="field"><label>離隊時間／地點</label><input id="leaveAt" placeholder="例如：下午3時於中心門口" value="${esc(l.leaveAt||'')}"></div><div class="field"><label>主辦單位</label><input id="host" value="${esc(state.settings.host)}"></div></div></div>${['applicant','witness','staff'].map((id,i)=>sigBlock(id,['申請人','見證人','負責人'][i])).join('')}<div class="row"><button class="btn primary" onclick="saveLeave();openPreview('leave')">文件預覽／匯出</button><button class="btn" onclick="saveLeave()">儲存</button></div>`);initPads()}
function sigBlock(id,title){let l=state.leave;return `<div class="card"><h2>${title}簽署</h2><canvas class="sigPad" id="pad_${id}"></canvas><div class="grid grid2"><div class="field"><label>${title}姓名</label><input id="${id}Name" value="${esc(l[id+'Name']||'')}"></div><div class="field"><label>日期</label><input id="${id}Date" type="date" value="${esc(l[id+'Date']||new Date().toISOString().slice(0,10))}"></div></div><div class="row"><button class="btn" onclick="saveSig('${id}')">儲存簽名</button><button class="btn warn" onclick="clearSig('${id}')">清除簽名</button></div></div>`}
let pads={};function initPads(){['applicant','witness','staff'].forEach(id=>{let c=$('#pad_'+id);if(!c)return;let ctx=c.getContext('2d'),draw=false;function resize(){c.width=c.clientWidth*2;c.height=c.clientHeight*2;ctx.scale(2,2);ctx.lineWidth=3;ctx.lineCap='round';ctx.strokeStyle='#111'}resize();let pos=e=>{let r=c.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return {x:t.clientX-r.left,y:t.clientY-r.top}};c.onpointerdown=e=>{draw=true;let p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};c.onpointermove=e=>{if(!draw)return;let p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};c.onpointerup=()=>draw=false;pads[id]=c})}
window.saveSig=id=>{state.leave.sigs[id]=pads[id].toDataURL('image/png');saveLeave();toast('簽名已同步至文件')};window.clearSig=id=>{let c=pads[id],ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);delete state.leave.sigs[id];save()}
window.saveLeave=function(){let l=state.leave;l.person=$('#person')?.value||l.person;l.leaveAt=$('#leaveAt')?.value||l.leaveAt;state.settings.host=$('#host')?.value||state.settings.host;['applicant','witness','staff'].forEach(id=>{l[id+'Name']=$('#'+id+'Name')?.value||'';l[id+'Date']=$('#'+id+'Date')?.value||''});save();toast('已儲存')}
function getStatsFilters(){
  try{return JSON.parse(sessionStorage.getItem('ttd_stats_filters')||'{}')}catch{return {}}
}
function setStatsFilters(next){
  sessionStorage.setItem('ttd_stats_filters', JSON.stringify(next||{}));
}
function eventInDateRange(e,filters){
  const dates=(e.sessions&&e.sessions.length?e.sessions:[e.date]).filter(Boolean);
  if(!dates.length) return true;
  const start=filters.start||'';
  const end=filters.end||'';
  return dates.some(d=>(!start||d>=start)&&(!end||d<=end));
}
function getFilteredStatEvents(){
  const filters=getStatsFilters();
  const base=state.records.length?state.records.map(r=>r.event):[state.event];
  return base.filter(e=>{
    const okCat=!filters.category||filters.category==='全部類別'||e.category===filters.category;
    return okCat && eventInDateRange(e,filters);
  });
}
function countEventAttendance(e){
  const sessions=e.sessions||[];
  const participants=e.participants||[];
  const totalSlots=Math.max(1,participants.length)*Math.max(1,sessions.length||1);
  const present=Object.values(e.attendance||{}).filter(v=>v==='○').length;
  return {present,totalSlots};
}
window.updateStatsFilter=function(key,value){
  const filters=getStatsFilters();
  filters[key]=value||'';
  setStatsFilters(filters);
  render();
}
window.quickStatsRange=function(type){
  const now=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  let start=new Date(now), end=new Date(now);
  if(type==='7'){start.setDate(now.getDate()-6)}
  if(type==='30'){start.setDate(now.getDate()-29)}
  if(type==='month'){start=new Date(now.getFullYear(),now.getMonth(),1)}
  if(type==='lastMonth'){start=new Date(now.getFullYear(),now.getMonth()-1,1);end=new Date(now.getFullYear(),now.getMonth(),0)}
  if(type==='year'){start=new Date(now.getFullYear(),0,1)}
  const filters=getStatsFilters();
  filters.start=iso(start);filters.end=iso(end);
  setStatsFilters(filters);
  render();
}
window.clearStatsFilters=function(){
  setStatsFilters({});
  render();
}
function stats(){
  const filters=getStatsFilters();
  const recs=getFilteredStatEvents();
  const totalActs=recs.length;
  const present=recs.reduce((s,e)=>s+countEventAttendance(e).present,0);
  const people={};
  recs.forEach(e=>(e.participants||[]).forEach((p,i)=>{
    let key=p.member||p.name||('P'+i);
    people[key]??={name:p.name||'',member:p.member||'',count:0,present:0};
    people[key].count++;
    let any=(e.sessions||['']).some((_,si)=>(e.attendance||{})[i+'_'+si]==='○');
    if(any)people[key].present++;
  }));
  let allPeople=Object.values(people);
  let repeatRate=allPeople.length?Math.round(allPeople.filter(p=>p.count>1).length/allPeople.length*100):0;
  let ranked=allPeople.sort((a,b)=>b.count-a.count||b.present-a.present).slice(0,10);
  let catSummary={};
  recs.forEach(e=>{
    const c=e.category||'未分類';
    catSummary[c]??={cat:c,events:0,present:0,participants:0};
    catSummary[c].events++;
    catSummary[c].present+=countEventAttendance(e).present;
    catSummary[c].participants+=(e.participants||[]).length;
  });
  layout(`<div class="card stats-filter-card"><h2>活動統計</h2><p class="hint">選擇日期或類別後會即時更新下方統計；如沒有已確認簽到紀錄，會先以目前活動作示範統計。</p><div class="grid grid2"><div class="field"><label>開始日期</label><input id="statStart" type="date" value="${esc(filters.start||'')}" onchange="updateStatsFilter('start',this.value)" oninput="updateStatsFilter('start',this.value)"></div><div class="field"><label>結束日期</label><input id="statEnd" type="date" value="${esc(filters.end||'')}" onchange="updateStatsFilter('end',this.value)" oninput="updateStatsFilter('end',this.value)"></div><div class="field"><label>活動類別</label><select id="statCategory" onchange="updateStatsFilter('category',this.value)"><option ${(!filters.category||filters.category==='全部類別')?'selected':''}>全部類別</option>${state.settings.cats.map(c=>`<option value="${esc(c)}" ${filters.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="field"><label>快速日期</label><div class="row"><button class="btn mini" onclick="quickStatsRange('7')">最近7日</button><button class="btn mini" onclick="quickStatsRange('30')">最近30日</button><button class="btn mini" onclick="quickStatsRange('month')">本月</button><button class="btn mini" onclick="quickStatsRange('lastMonth')">上月</button><button class="btn mini" onclick="quickStatsRange('year')">今年</button></div></div></div><div class="row" style="margin-top:10px"><button class="btn" onclick="clearStatsFilters()">清除篩選</button><button class="btn" onclick="exportCSV()">匯出 Excel/CSV</button><button class="btn" onclick="openPreview('stats')">匯出 PDF</button><span class="pill">目前顯示 ${totalActs} 個活動</span></div></div><div class="kpis compact-kpis"><div class="kpi"><span>活動數目</span><b>${totalActs}</b></div><div class="kpi"><span>活動出席人數</span><b>${present}</b></div><div class="kpi"><span>重複參與率</span><b>${repeatRate}%</b></div></div><div class="card"><h2>類別統計</h2>${Object.values(catSummary).length?Object.values(catSummary).map(c=>`<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:10px 0"><b>${esc(c.cat)}</b><span>${c.events} 個活動｜${c.participants} 參加人次｜${c.present} 出席人次</span></div>`).join(''):'<p class="muted">暫時沒有符合篩選的活動。</p>'}</div><div class="card"><h2>活躍參加者 TOP 10</h2>${ranked.length?ranked.map((p,i)=>`<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:10px 0"><b>${i<3?'🏆 ':''}${i+1}. ${esc(p.name)}</b><span>${esc(p.member||'--')}｜${p.count} 次參與｜${p.present} 次出席</span></div>`).join(''):'<p class="muted">暫時沒有參加者資料。</p>'}</div><div class="card"><h2>活動項目統計</h2>${recs.length?recs.map(e=>{let total=(e.participants||[]).length,att=countEventAttendance(e).present,rate=total?Math.round(att/Math.max(1,total)*100):0;return `<p><b>${esc(e.name)}</b>｜${esc(e.category||'未分類')}｜參加 ${total}｜出席 ${att}｜出席率 ${rate}%</p><div class="bar"><span style="width:${Math.min(rate,100)}%"></span></div>`}).join(''):'<p class="muted">沒有符合日期／類別的活動。</p>'}</div>`)
}
window.exportCSV=function(){
  let lines=['活動名稱,類別,參加人數,出席人數,出席率'];
  getFilteredStatEvents().forEach(e=>{
    let total=(e.participants||[]).length,att=countEventAttendance(e).present;
    lines.push([e.name||'',e.category||'',total,att,total?Math.round(att/Math.max(1,total)*100)+'%':'0%'].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
  });
  let blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
  let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='活動統計.csv';a.click()
}
function settings(){let s=state.settings;layout(`<div class="card"><h2>設定</h2><div class="grid grid2"><div class="field"><label>管理密碼</label><input id="pw" type="password" value="${esc(s.password)}"></div><div class="field"><label>機構名稱</label><input id="org" value="${esc(s.org)}"></div><div class="field"><label>主辦單位</label><input id="hostset" value="${esc(s.host)}"></div><div class="field"><label>會員編號欄位名稱</label><input id="memberLabel" value="${esc(s.memberLabel)}"></div></div><button class="btn primary" onclick="saveSettings()">儲存設定</button></div><div class="card"><h2>活動類別管理</h2><div id="cats">${s.cats.map((c,i)=>`<div class="row" style="margin:6px 0"><input value="${esc(c)}" data-cat="${i}" style="flex:1;min-height:46px;border:1px solid var(--line);border-radius:14px;padding:10px"><button class="btn warn mini" onclick="removeCat(${i})">刪除</button></div>`).join('')}</div><div class="row"><input id="newcat" placeholder="新增類別" style="flex:1;min-height:48px;border:1px solid var(--line);border-radius:14px;padding:10px"><button class="btn" onclick="addCat()">新增</button></div></div><div class="card"><h2>備份</h2><div class="row"><button class="btn" onclick="backup()">匯出 JSON</button><label class="btn">匯入 JSON<input type="file" accept=".json" hidden onchange="importJSON(this.files[0])"></label><button class="btn warn" onclick="clearAll()">清除全部資料</button></div></div>`)}
window.saveSettings=function(){let s=state.settings;s.password=$('#pw').value;s.org=$('#org').value;s.host=$('#hostset').value;s.memberLabel=$('#memberLabel').value;$$('[data-cat]').forEach(i=>s.cats[+i.dataset.cat]=i.value.trim());s.cats=[...new Set(s.cats.filter(Boolean))];save();render();toast('設定已儲存')};window.addCat=()=>{let v=$('#newcat').value.trim();if(v&&!state.settings.cats.includes(v)){state.settings.cats.push(v);save();render()}};window.removeCat=i=>{let c=state.settings.cats[i];if(state.records.some(r=>r.event.category===c)||state.event.category===c){toast('已有活動使用此類別');return}state.settings.cats.splice(i,1);save();render()};window.backup=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='tick-tick-duck-backup.json';a.click()};window.importJSON=f=>{let r=new FileReader();r.onload=()=>{state=JSON.parse(r.result);save();render()};r.readAsText(f)};window.clearAll=()=>{if(prompt('輸入管理密碼')===state.settings.password&&confirm('確定清除？')){let set=state.settings;state=structuredClone(defaults);state.settings=set;save();render()}}
function attendanceDoc(e=state.event){return `<div class="doc"><h2>${esc(state.settings.org)}</h2><h2>活動出席紀錄</h2><p>活動：${esc(e.name)}　類別：${esc(e.category)}　地點：${esc(e.place)}　時間：${esc(e.time)}</p><table><thead><tr><th>姓名</th>${e.hasMember?`<th>${esc(state.settings.memberLabel)}</th>`:''}<th>電話</th>${e.outdoor?'<th>緊急聯絡</th>':''}${e.sessions.map(d=>`<th>${fmt(d)}</th>`).join('')}</tr></thead><tbody>${e.participants.map((p,i)=>`<tr><td>${esc(p.name)}</td>${e.hasMember?`<td>${esc(p.member||'')}</td>`:''}<td>••••••</td>${e.outdoor?`<td>${esc(p.emergencyName||'')} ${esc(p.emergencyPhone||'')}</td>`:''}${e.sessions.map((_,si)=>`<td>${e.attendance[i+'_'+si]||''}</td>`).join('')}</tr>`).join('')}</tbody></table><p>生成日期：${new Date().toLocaleString()}</p></div>`}
function splitDateParts(value){
  let d=value||'';
  if(/^\d{4}-\d{2}-\d{2}$/.test(d)){let [y,m,day]=d.split('-');return {y,m:String(Number(m)),d:String(Number(day))}}
  return {y:'____',m:'____',d:'____'}
}
function genText(text, fallback=''){
  const v=String(text||'').trim();
  return `<span class="genRed">${esc(v||fallback)}</span>`
}
function genLine(text, cls='', fallback=''){
  const v=String(text||'').trim();
  return `<span class="redLine ${cls}">${esc(v||fallback)}</span>`
}
function signatureRows(id,title){
  let l=state.leave;
  let sig=l.sigs[id]?`<img src="${l.sigs[id]}" alt="${title}簽署">`:'';
  return `<div class="bottomSignCard">
    <div class="bottomSignTitle">${title}</div>
    <div class="bottomSignRow"><span>${title}簽署：</span><div class="bottomSignLine bottomSignImage">${sig}</div></div>
    <div class="bottomSignRow"><span>${title}姓名：</span><div class="bottomSignLine">${esc(l[id+'Name']||'')}</div></div>
    <div class="bottomSignRow"><span>日期：</span><div class="bottomSignLine">${esc(l[id+'Date']||'')}</div></div>
  </div>`
}
function leaveDoc(){
  let l=state.leave,e=state.event,s=state.settings;
  let applicant=(l.person||l.applicantName||'').trim();
  let parts=splitDateParts(e.date);
  let host=s.host||'香港聖公會 聖匠堂長者地區中心';
  let leaveTime=(l.leaveAt||'活動完結前自行離隊').trim();
  return `<div class="doc portrait leaveOfficial onePageLeave">
    <div class="leaveHeader">
      <div class="orgTitle">${esc(s.org||'香港聖公會福利協會有限公司')}</div>
      <div class="leaveTitle">戶外活動離隊聲明</div>
    </div>

    <div class="leaveBody newLeaveBody">
      <p class="paraLine">本人${genLine(applicant,'applicantRed','申請人姓名')}參加由（${genLine(host,'hostRed','機構名稱')}）的以下活動並自願要求</p>
      <p class="paraLine">於活動完結前自行離隊，本人亦明白離隊後之個人安全將由本人負責，概</p>
      <p class="paraLine">與中心無關。</p>

      <div class="fieldBlock">
        <div class="fieldLine"><span class="fieldLabel">舉行日期:</span><span class="dateParts">${genText(parts.y,'年份')} 年　${genText(parts.m,'月份')} 月　${genText(parts.d,'日期')} 日</span></div>
        <div class="fieldLine"><span class="fieldLabel">離隊時間:</span>${genLine(leaveTime,'timeRed','離隊時間')}</div>
        <div class="fieldLine"><span class="fieldLabel">活動名稱:</span>${genLine(e.name,'activityRed','活動名稱')}</div>
      </div>
    </div>

    <div class="signaturePanelBottom">
      ${signatureRows('applicant','申請人')}
      ${signatureRows('witness','見證人')}
      ${signatureRows('staff','負責人')}
    </div>

    <div class="leaveFooter">
      <div class="footerLeft">
        <div>表格編號：F/ECS/033</div>
        <div>發行人　：長者中心綜隊</div>
        <div>發行日期：1-11-2018</div>
        <div>版本　　：1</div>
      </div>
      <div class="footerRight">第1頁，共1頁</div>
    </div>
  </div>`
}
function statsDoc(){return `<div class="doc"><h2>${esc(state.settings.org)}</h2><h2>活動統計報告</h2>${$('.kpis')?.outerHTML||''}${$('.card:nth-of-type(3)')?.outerHTML||''}</div>`}
window.openPreview=function(type,id){let html='';if(type==='attendance')html=attendanceDoc();if(type==='record')html=attendanceDoc(state.records.find(r=>r.id===id)?.event||state.event);if(type==='leave'){saveLeave();html=leaveDoc()}if(type==='stats')html=statsDoc();let o=document.createElement('div');o.className='previewOverlay';o.innerHTML=`<div class="previewTools"><button class="btn" onclick="window.print()">下載 PDF（列印儲存）</button><button class="btn" onclick="downloadHTML()">下載 HTML</button><button class="btn" onclick="shareText()">WhatsApp 分享</button><button class="btn warn" onclick="this.closest('.previewOverlay').remove()">關閉</button><span class="muted">已先轉為完整文件預覽，確認後才輸出。</span></div><div class="previewScroll"><div id="previewTarget">${html}</div></div>`;document.body.append(o)}
window.downloadHTML=function(){let blob=new Blob([$('#previewTarget').innerHTML],{type:'text/html'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tick-tick-duck-document.html';a.click()};window.shareText=function(){let text=`Tick Tick Duck 文件：${state.event.name}`;if(navigator.share)navigator.share({text});else location.href='https://wa.me/?text='+encodeURIComponent(text)}
function render(){let p=state.active;({home,attendance,records,leave,stats,settings}[p]||home)()}render();
