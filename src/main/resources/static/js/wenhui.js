/* ================================================================
 *  WenHui JavaScript
 *  Modules: topic panel · tag trim · globe · login · register · notice
 * ================================================================ */

/* Topic panel toggle */
function toggleTsPanel() {
  const p = document.getElementById('tsPanel');
  const b = document.getElementById('tsExpandBtn');
  p.classList.toggle('open');
  b.classList.toggle('open');
  if (p.classList.contains('open')) {
    setTimeout(() => {
      document.addEventListener('click', function h(e) {
        if (!document.querySelector('.topic-strip').contains(e.target)) {
          p.classList.remove('open');
          b.classList.remove('open');
          document.removeEventListener('click', h);
        }
      });
    }, 10);
  }
}

/* Topic panel tag toggle */
document.querySelectorAll('.ts-panel-tag').forEach(t => {
  t.addEventListener('click', () => t.classList.toggle('on'));
});

/* Overflow trim for ts-tags */
function trimTags() {
  const wrap = document.getElementById('tsTags');
  if (!wrap) return;
  const tags = wrap.querySelectorAll('.ts-tag');
  tags.forEach(t => t.style.display = '');
  let used = 0;
  tags.forEach(t => {
    used += t.offsetWidth;
    if (used > wrap.offsetWidth - 10) t.style.display = 'none';
  });
}
(function(){ setTimeout(trimTags, 300); })();
window.addEventListener('resize', trimTags);

/* Globe */
(function() {
  const canvas = document.getElementById('globeCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, R, rot = 0;

  const cities = [
    [35.68,139.69],[40.71,-74.00],[51.50,-0.12],[-33.86,151.20],
    [43.65,-79.38],[1.35,103.82],[48.85,2.35],[52.52,13.40],
    [34.05,-118.24],[-37.81,144.96],[49.28,-123.12],[22.28,114.16],
    [25.04,121.56],[37.57,126.98],[28.61,77.20],[39.90,116.40],[31.23,121.47]
  ];

  function gen(a,b,c,d,n){ const r=[];for(let i=0;i<n;i++)r.push([a+Math.random()*(b-a),c+Math.random()*(d-c)]);return r; }
  const land=[...gen(35,75,-170,-50,700),...gen(-55,12,-82,-32,400),...gen(35,70,-12,42,380),...gen(-38,36,-18,52,520),...gen(0,72,45,142,800),...gen(-44,-10,112,154,260)];

  function proj(lat,lng,r){
    const phi=lat*Math.PI/180, lam=lng*Math.PI/180+r;
    const cp=Math.cos(phi);
    return {x:cx+R*cp*Math.sin(lam), y:cy-R*Math.sin(phi), z:cp*Math.cos(lam)};
  }

  function resize(){
    W=canvas.width=canvas.offsetWidth;
    H=canvas.height=canvas.offsetHeight;
    cx=W/2; cy=H/2; R=Math.min(W,H)*0.40;
  }

  function draw(t){
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H));
    bg.addColorStop(0,'#0d1b2a'); bg.addColorStop(1,'#030810');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    for(let s=0;s<150;s++){
      ctx.fillStyle=`rgba(255,255,255,${0.2+0.4*Math.sin(t*.0008+s)})`;
      ctx.fillRect((s*157+83)%W,(s*91+47)%H,1,1);
    }

    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();

    const oc=ctx.createRadialGradient(cx-R*.3,cy-R*.3,0,cx,cy,R);
    oc.addColorStop(0,'#1a3a5c'); oc.addColorStop(1,'#061525');
    ctx.fillStyle=oc; ctx.fillRect(cx-R,cy-R,R*2,R*2);

    for(let la=-75;la<=75;la+=15){
      ctx.beginPath(); let f=true;
      for(let lo=-180;lo<=180;lo+=4){
        const p=proj(la,lo,rot);
        if(p.z<0){f=true;continue;}
        f?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); f=false;
      }
      ctx.strokeStyle='rgba(80,140,220,0.07)'; ctx.lineWidth=.5; ctx.stroke();
    }
    for(let lo=-180;lo<=180;lo+=15){
      ctx.beginPath(); let f=true;
      for(let la=-85;la<=85;la+=4){
        const p=proj(la,lo,rot);
        if(p.z<0){f=true;continue;}
        f?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); f=false;
      }
      ctx.strokeStyle='rgba(80,140,220,0.05)'; ctx.lineWidth=.5; ctx.stroke();
    }

    land.forEach(([la,lo])=>{
      const p=proj(la,lo,rot);
      if(p.z<0) return;
      ctx.fillStyle=`rgba(50,120,80,${.35*p.z+.1})`;
      ctx.fillRect(p.x-1,p.y-1,2,2);
    });

    for(let i=0;i<cities.length;i++){
      const a=proj(cities[i][0],cities[i][1],rot);
      if(a.z<0) continue;
      for(let j=i+1;j<cities.length;j+=2){
        const b=proj(cities[j][0],cities[j][1],rot);
        if(b.z<0) continue;
        const prog=(t*.00025+i*.13+j*.07)%1;
        const al=Math.sin(prog*Math.PI)*.2;
        if(al<.01) continue;
        const mx=(a.x+b.x)/2, my=(a.y+b.y)/2-R*.12;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.quadraticCurveTo(mx,my,b.x,b.y);
        ctx.strokeStyle=`rgba(160,210,255,${al})`; ctx.lineWidth=.7; ctx.stroke();
        const px=(1-prog)*(1-prog)*a.x+2*(1-prog)*prog*mx+prog*prog*b.x;
        const py=(1-prog)*(1-prog)*a.y+2*(1-prog)*prog*my+prog*prog*b.y;
        ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2);
        ctx.fillStyle=`rgba(200,230,255,${al*3})`; ctx.fill();
      }
    }
    ctx.restore();

    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle='rgba(100,160,255,0.25)'; ctx.lineWidth=1; ctx.stroke();

    cities.forEach(([la,lo])=>{
      const p=proj(la,lo,rot);
      if(p.z<.1) return;
      ctx.beginPath(); ctx.arc(p.x,p.y,2.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${p.z*.9})`; ctx.fill();
      const pr=3+8*((t*.002+la)%1);
      ctx.beginPath(); ctx.arc(p.x,p.y,pr,0,Math.PI*2);
      ctx.strokeStyle=`rgba(255,255,255,${Math.max(0,(1-(t*.002+la)%1))*p.z*.4})`;
      ctx.lineWidth=.8; ctx.stroke();
    });

    rot+=.0025;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ================================================================
 *  登入 / 註冊 / 歡迎提示
 * ================================================================ */

/* 模擬用户数据库 */
const DEFAULT_USERS = {
  'kichirinri@gmail.com': { email: 'kichirinri@gmail.com', pwd: '123456', name: '闻道' }
};
const DB = {
  users: Object.assign({}, DEFAULT_USERS, JSON.parse(localStorage.getItem('wh_users') || '{}')),
  save() { localStorage.setItem('wh_users', JSON.stringify(this.users)); },
  get(email) { return this.users[email.toLowerCase()] || null; },
  add(email, pwd, name) {
    this.users[email.toLowerCase()] = { email: email.toLowerCase(), pwd, name };
    this.save();
  }
};

/* 当前会话 */
let currentUser = JSON.parse(sessionStorage.getItem('wh_user') || 'null');
if (currentUser) renderLoggedIn(currentUser);

/* Modal 开关 */
function openLoginModal() {
  document.getElementById('loginModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab('login');
  resetCodeTimer();
}
function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('open');
  document.body.style.overflow = '';
  clearForms();
}
function closeOnOverlay(e, id) {
  if (e.target.id === id && id === 'loginModal') closeLoginModal();
}

/* Tab 切换 */
function switchTab(tab) {
  ['login','phone','register'].forEach(t => {
    const tabId  = t === 'login' ? 'tabLogin' : t === 'phone' ? 'tabPhone' : 'tabReg';
    const formId = t === 'login' ? 'formLogin' : t === 'phone' ? 'formPhone' : 'formReg';
    document.getElementById(tabId).classList.toggle('active', t === tab);
    document.getElementById(formId).classList.toggle('hidden', t !== tab);
  });
  clearForms();
  if (tab === 'phone') resetCodeTimer();
}

function clearForms() {
  ['loginEmail','loginPwd','regName','regEmail','regPwd','phoneNum','phoneCode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  ['loginError','regError','phoneError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

/* 郵件登入 */
function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pwd   = document.getElementById('loginPwd').value;
  const errEl = document.getElementById('loginError');
  const btn   = document.getElementById('btnLogin');
  if (!email || !pwd) { errEl.textContent = '請填寫電子郵件和密碼'; return; }
  btn.disabled = true; btn.textContent = '登入中…';
  setTimeout(() => {
    const user = DB.get(email);
    if (!user) {
      errEl.textContent = '此郵件尚未註冊，請先建立帳號';
      document.getElementById('loginEmail').classList.add('error');
      btn.disabled = false; btn.textContent = '登入文薈'; return;
    }
    if (user.pwd !== pwd) {
      errEl.textContent = '密碼錯誤，請重試';
      document.getElementById('loginPwd').classList.add('error');
      btn.disabled = false; btn.textContent = '登入文薈'; return;
    }
    onLoginSuccess(user);
  }, 600);
}

/* 郵件註冊 */
function doRegister() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pwd   = document.getElementById('regPwd').value;
  const errEl = document.getElementById('regError');
  const btn   = document.getElementById('btnReg');
  if (!name || !email || !pwd) { errEl.textContent = '請完整填寫所有欄位'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = '請輸入有效的電子郵件';
    document.getElementById('regEmail').classList.add('error'); return;
  }
  if (pwd.length < 8) {
    errEl.textContent = '密碼至少需要8位';
    document.getElementById('regPwd').classList.add('error'); return;
  }
  if (DB.get(email)) {
    errEl.textContent = '此郵件已被註冊，請直接登入';
    document.getElementById('regEmail').classList.add('error'); return;
  }
  btn.disabled = true; btn.textContent = '建立中…';
  setTimeout(() => {
    DB.add(email, pwd, name);
    onLoginSuccess({ email, name });
  }, 700);
}

/* 手機號驗證碼 */
let codeTimer = null;
let codeCountdown = 0;

function resetCodeTimer() {
  clearInterval(codeTimer);
  codeTimer = null; codeCountdown = 0;
  const btn = document.getElementById('btnSendCode');
  if (btn) { btn.disabled = false; btn.textContent = '發送驗證碼'; }
}

function sendCode() {
  const phone = document.getElementById('phoneNum').value.trim();
  const errEl = document.getElementById('phoneError');
  if (!phone || phone.length < 7) {
    errEl.textContent = '請輸入有效手機號碼';
    document.getElementById('phoneNum').classList.add('error'); return;
  }
  errEl.textContent = '';
  document.getElementById('phoneNum').classList.remove('error');
  const btn = document.getElementById('btnSendCode');
  btn.disabled = true; codeCountdown = 60;
  btn.textContent = codeCountdown + 's 後重發';
  codeTimer = setInterval(() => {
    codeCountdown--;
    if (codeCountdown <= 0) {
      clearInterval(codeTimer);
      btn.disabled = false; btn.textContent = '重新發送';
    } else {
      btn.textContent = codeCountdown + 's 後重發';
    }
  }, 1000);
}

function doPhoneLogin() {
  const prefix = document.getElementById('phonePrefix').value;
  const phone  = document.getElementById('phoneNum').value.trim();
  const code   = document.getElementById('phoneCode').value.trim();
  const errEl  = document.getElementById('phoneError');
  const btn    = document.getElementById('btnPhoneLogin');
  if (!phone) { errEl.textContent = '請輸入手機號碼'; return; }
  if (!code)  { errEl.textContent = '請輸入驗證碼'; return; }
  if (code !== '888888') {
    errEl.textContent = '驗證碼錯誤（演示模式請輸入 888888）';
    document.getElementById('phoneCode').classList.add('error'); return;
  }
  btn.disabled = true; btn.textContent = '驗證中…';
  setTimeout(() => {
    const key = 'phone:' + prefix + phone;
    let user = DB.get(key);
    if (!user) {
      DB.add(key, '888888', '文薈用戶' + phone.slice(-4));
      user = DB.get(key);
    }
    btn.disabled = false; btn.textContent = '登入 / 自動註冊';
    onLoginSuccess(user);
  }, 800);
}

/* 登入成功 */
function onLoginSuccess(user) {
  sessionStorage.setItem('wh_user', JSON.stringify(user));
  currentUser = user;
  closeLoginModal();
  renderLoggedIn(user);
  const key = 'wh_noticed_' + user.email;
  if (!localStorage.getItem(key)) {
    setTimeout(() => openNoticeModal(), 400);
    localStorage.setItem(key, '1');
  }
}

/* 渲染已登入 — 同時更新導航列和 Masthead 右上角 */
function renderLoggedIn(user) {
  const initial = (user.name || user.email || '文')[0].toUpperCase();

  /* 導航列（小頭像） */
  document.getElementById('stateGuest').style.display = 'none';
  const su = document.getElementById('stateUser');
  su.style.display = 'flex';
  document.getElementById('userAvatar').textContent = initial;
  document.getElementById('userMenuName').textContent = user.name || '用戶';
  document.getElementById('userMenuEmail').textContent = user.email || '';

  /* Masthead 右上角（大頭像 + 發文） */
  const mu = document.getElementById('mastheadUser');
  if (mu) {
    mu.classList.add('show');
    const lgAvatar = document.getElementById('userAvatarLg');
    if (lgAvatar) lgAvatar.textContent = initial;
  }
}

/* 登出 */
function doLogout() {
  sessionStorage.removeItem('wh_user');
  currentUser = null;

  /* 導航列恢復 */
  document.getElementById('stateUser').style.display = 'none';
  document.getElementById('stateGuest').style.display = 'flex';
  document.getElementById('userMenu').classList.remove('open');

  /* Masthead 隱藏 */
  const mu = document.getElementById('mastheadUser');
  if (mu) mu.classList.remove('show');
}

/* 用户菜单开关 */
function toggleUserMenu() {
  document.getElementById('userMenu').classList.toggle('open');
}
document.addEventListener('click', function(e) {
  const menu     = document.getElementById('userMenu');
  const avatar   = document.getElementById('userAvatar');
  const lgAvatar = document.getElementById('userAvatarLg');
  if (menu && !menu.contains(e.target) && e.target !== avatar && e.target !== lgAvatar) {
    menu.classList.remove('open');
  }
});

/* 欢迎提示 */
function openNoticeModal() {
  document.getElementById('noticeModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('noticeCheck').checked = false;
  document.getElementById('btnNoticeConfirm').disabled = true;
}
function toggleNoticeBtn() {
  document.getElementById('btnNoticeConfirm').disabled = !document.getElementById('noticeCheck').checked;
}
function confirmNotice() {
  document.getElementById('noticeModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* Enter 键提交 */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  if (!document.getElementById('loginModal').classList.contains('open')) return;
  const isEmail = !document.getElementById('formLogin').classList.contains('hidden');
  const isPhone = !document.getElementById('formPhone').classList.contains('hidden');
  const isReg   = !document.getElementById('formReg').classList.contains('hidden');
  if (isEmail) doLogin();
  else if (isPhone) doPhoneLogin();
  else if (isReg) doRegister();
});

/* ================================================================
 *  首页动态加载用户发表的文章
 * ================================================================ */
(function loadUserArticles() {
  const articles = JSON.parse(localStorage.getItem('wh_articles') || '[]');
  if (!articles.length) return;

  const page = document.querySelector('.page');
  if (!page) return;

  const section = document.createElement('div');
  section.id = 'userFeedSection';
  section.innerHTML = `
    <div class="divider-label" style="margin:32px 0 20px;">
      <span class="divider-label-text">最新發表</span>
    </div>
    <div class="grid-c">
      <div class="grid-c-main" id="userFeed"></div>
      <div class="grid-c-side" id="userFeedSide"></div>
    </div>
  `;
  page.appendChild(section);

  const feed = section.querySelector('#userFeed');
  const side = section.querySelector('#userFeedSide');

  /* 主列 — 最新10篇 */
  articles.slice(0, 10).forEach(a => {
    const date = new Date(a.publishedAt);
    const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
    const words = (a.body||'').replace(/\s/g,'').length;
    const mins = Math.max(1, Math.round(words / 300));
    const excerpt = (a.body||'').slice(0, 100);
    const isFire = a.cat === '煙火飄香';
    const initial = (a.author||'文')[0].toUpperCase();

    const el = document.createElement('div');
    el.className = 'art-text';
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <div class="art-text-top">
        <div class="art-text-avatar" style="background:linear-gradient(135deg,#667eea,#764ba2)">${initial}</div>
        <span class="art-text-author">${a.author || '文薈用戶'}</span>
        <span class="art-text-pub">· ${a.cat}</span>
        <span class="art-text-loc" style="margin-left:auto;font-size:11px;color:var(--ink4);">${dateStr}</span>
      </div>
      <div style="font-family:var(--serif);font-size:20px;font-weight:700;line-height:1.35;color:var(--ink);margin-bottom:8px;transition:color 0.15s;">${a.title}</div>
      <div style="font-size:14px;color:var(--ink3);line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:12px;">${excerpt}…</div>
      <div class="art-text-footer">
        <span class="art-text-cat ${isFire ? 'fire' : ''}">${a.cat}</span>
        <span class="art-text-date">${mins} 分鐘閱讀</span>
        <div class="art-text-stats"><span class="art-text-stat">👍 ${a.likes||0}</span></div>
      </div>
    `;
    el.addEventListener('mouseenter', () => el.querySelector('[style*="font-family:var(--serif)"]').style.color = 'var(--accent)');
    el.addEventListener('mouseleave', () => el.querySelector('[style*="font-family:var(--serif)"]').style.color = 'var(--ink)');
    el.onclick = () => window.location.href = 'article.html?id=' + a.id;
    feed.appendChild(el);
  });

  /* 侧栏 — 热门排行（按点赞排序） */
  const sorted = [...articles].sort((a,b) => (b.likes||0) - (a.likes||0)).slice(0, 5);
  let sideHTML = `
    <hr class="side-rule">
    <div class="side-title">用戶熱門文章</div>
  `;
  sorted.forEach((a, i) => {
    const r = i===0 ? 'r1' : i===1 ? 'r2' : i===2 ? 'r3' : '';
    sideHTML += `
      <div class="hot-list-item" style="cursor:pointer;" onclick="window.location.href='article.html?id=${a.id}'">
        <div class="hot-list-num ${r}">${i+1}</div>
        <div>
          <div class="hot-list-text">${a.title}</div>
          <div class="hot-list-heat">👍 ${a.likes||0} · ${a.cat}</div>
        </div>
      </div>
    `;
  });
  side.innerHTML = sideHTML;
})();
