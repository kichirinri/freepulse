/* ================================================================
 *  WenHui JavaScript
 *  Modules: topic panel · tag trim · globe · login · register · notice
 * ================================================================ */

/* Topic panel toggle */
function goCategory(cat) {
  console.log('goCategory called:', cat);
  window.location.href = 'category.html?cat=' + encodeURIComponent(cat);

}

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

/* Banner Slider */
let currentSlide = 0;
let sliderTimer = null;

function goSlide(n) {
  const slides = document.querySelectorAll('.banner-slide');
  const dots   = document.querySelectorAll('.banner-dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}
function nextSlide() { goSlide(currentSlide + 1); resetTimer(); }
function prevSlide() { goSlide(currentSlide - 1); resetTimer(); }
function resetTimer() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goSlide(currentSlide + 1), 5000);
}
resetTimer();

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
  const tabMap = { login: 'tabLogin', register: 'tabReg' };
  const formMap = { login: 'formLogin', register: 'formReg', forgot: 'formForgot' };

  // 切换tab高亮（只处理有tab元素的）
  Object.keys(tabMap).forEach(t => {
    document.getElementById(tabMap[t]).classList.toggle('active', t === tab);
  });

  // 切换表单显示
  Object.keys(formMap).forEach(t => {
    document.getElementById(formMap[t]).classList.toggle('hidden', t !== tab);
  });

  clearForms();
}

function showForgotPwd() {
  Object.keys({login:'tabLogin',register:'tabReg'}).forEach(t => {
    document.getElementById(t==='login'?'tabLogin':'tabReg').classList.remove('active');
  });
  ['formLogin','formReg'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('formForgot').classList.remove('hidden');
  clearForms();
}

function doForgotPwd() {
  const email = document.getElementById('forgotEmail').value.trim();
  const errEl = document.getElementById('forgotError');
  const sucEl = document.getElementById('forgotSuccess');
  const btn   = document.getElementById('btnForgot');
  errEl.textContent = ''; sucEl.textContent = '';
  if (!email) { errEl.textContent = '請輸入電子郵件'; return; }
  if (!DB.get(email)) { errEl.textContent = '此郵件尚未註冊'; return; }
  btn.disabled = true; btn.textContent = '發送中…';
  setTimeout(() => {
    sucEl.textContent = '重設連結已發送，請檢查郵箱（演示模式）';
    btn.disabled = false; btn.textContent = '發送重設連結';
  }, 800);
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

/* 当前会话 */
let currentUser = JSON.parse(sessionStorage.getItem('wh_user') || 'null');
if (currentUser) renderLoggedIn(currentUser);

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
 *  首页动态文章加载 + 分类过滤
 * ================================================================ */
let allArticles = [];

(function loadUserArticles() {
  fetch('http://localhost:8080/api/articles')
      .then(res => res.json())
      .then(articles => {
        allArticles = articles;
        renderFeed(articles);
      })
      .catch(err => console.log('載入文章失敗', err));
})();

function renderFeed(articles) {
  // 找到或创建动态区块
  let section = document.getElementById('userFeedSection');
  if (!section) {
    section = document.createElement('div');
    section.id = 'userFeedSection';
    section.innerHTML = `
      <div class="divider-label" style="margin:32px 0 20px;">
        <span class="divider-label-text" id="feedLabel">最新發表</span>
      </div>
      <div class="grid-c">
        <div class="grid-c-main" id="userFeed"></div>
        <div class="grid-c-side" id="userFeedSide"></div>
      </div>
    `;
    document.querySelector('.page').appendChild(section);
  }

  const feed = document.getElementById('userFeed');
  const side = document.getElementById('userFeedSide');
  feed.innerHTML = '';

  if (!articles.length) {
    feed.innerHTML = '<div style="padding:60px 0;text-align:center;color:var(--ink4);font-size:15px;">此分類暫無文章</div>';
    side.innerHTML = '';
    return;
  }

  articles.slice(0, 10).forEach(a => {
    const date = new Date(a.createdDate);
    const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
    const words = (a.content||'').replace(/\s/g,'').length;
    const mins = Math.max(1, Math.round(words/300));
    const excerpt = (a.content||'').slice(0, 100);
    const isFire = a.category === '煙火飄香';
    const initial = (a.authorName||'文')[0].toUpperCase();

    const el = document.createElement('div');
    el.className = 'art-text';
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <div class="art-text-top">
        <div class="art-text-avatar" style="background:linear-gradient(135deg,#667eea,#764ba2)">${initial}</div>
        <span class="art-text-author">${a.authorName || '用戶'}</span>
        <span class="art-text-pub">· ${a.category}</span>
        <span class="art-text-loc" style="margin-left:auto;font-size:13px;color:var(--ink4);">${dateStr}</span>
      </div>
      <div class="art-title" style="font-family:var(--serif);font-size:20px;font-weight:700;line-height:1.35;color:var(--ink);margin-bottom:8px;transition:color 0.15s;"
           onmouseover="this.style.color='#c0392b'" onmouseout="this.style.color='var(--ink)'">${a.title}</div>
      <div style="font-size:15px;color:var(--ink3);line-height:1.65;margin-bottom:12px;">${excerpt}…</div>
      <div class="art-text-footer">
        <span class="art-text-cat ${isFire?'fire':''}">${a.category}</span>
        <span class="art-text-date">${mins} 分鐘閱讀</span>
        <div class="art-text-stats"><span class="art-text-stat">👍 ${a.likes||0}</span></div>
      </div>
    `;
    el.onclick = () => window.location.href = 'article.html?id=' + a.id;
    feed.appendChild(el);
  });

  // 侧栏热门
  const sorted = [...articles].sort((a,b) => (b.likes||0) - (a.likes||0)).slice(0, 5);
  let sideHTML = `<hr class="side-rule"><div class="side-title">熱門文章</div>`;
  sorted.forEach((a, i) => {
    const r = i===0?'r1':i===1?'r2':i===2?'r3':'';
    sideHTML += `
      <div class="hot-list-item" style="cursor:pointer;" onclick="window.location.href='article.html?id=${a.id}'">
        <div class="hot-list-num ${r}">${i+1}</div>
        <div>
          <div class="hot-list-text">${a.title}</div>
          <div class="hot-list-heat">👍 ${a.likes||0} · ${a.category}</div>
        </div>
      </div>
    `;
  });
  side.innerHTML = sideHTML;
}

function filterByTopic(topic, el) {
  // 更新导航active状态
  document.querySelectorAll('.nav-topic').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  // 更新feed标签
  const label = document.getElementById('feedLabel');
  if (label) label.textContent = topic === '熱門' ? '最新發表' : topic;

  if (topic === '熱門') {
    const sorted = [...allArticles].sort((a, b) => (b.likes||0) - (a.likes||0));
    if (label) label.textContent = '熱門文章';
    renderFeed(sorted);
    return;
  }

  // 按分类过滤
  fetch(`http://localhost:8080/api/articles/category/${encodeURIComponent(topic)}`)
      .then(res => res.json())
      .then(articles => renderFeed(articles))
      .catch(() => {
        // 前端降级过滤
        const filtered = allArticles.filter(a => a.category === topic);
        renderFeed(filtered);
      });
}
/* 搜索功能 */
function toggleSearch() {
  document.getElementById('searchOverlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchInput').focus(), 100);
}

function closeSearch() {
  document.getElementById('searchOverlay').style.display = 'none';
  document.body.style.overflow = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResultList').innerHTML = '';
}

function doSearch() {
  const keyword = document.getElementById('searchInput').value.trim();
  if (!keyword) return;

  const list = document.getElementById('searchResultList');
  list.innerHTML = '<div style="color:var(--ink4);font-size:14px;padding:20px 0;">搜尋中…</div>';

  fetch('http://localhost:8080/api/articles/search?keyword=' + encodeURIComponent(keyword))
      .then(res => res.json())
      .then(articles => {
        if (!articles.length) {
          list.innerHTML = `<div style="text-align:center;padding:80px;color:var(--ink4);font-size:16px;">沒有找到「${keyword}」相關文章</div>`;
          return;
        }

        list.innerHTML = `<div style="font-size:13px;color:var(--ink4);margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid var(--rule);">找到 ${articles.length} 篇相關文章</div>`;

        articles.forEach(a => {
          const date = new Date(a.createdDate);
          const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
          const excerpt = (a.content || '').slice(0, 120);
          const hl = s => s.replace(new RegExp(keyword, 'gi'), m => `<mark style="background:#fff3cd;padding:0 2px;">${m}</mark>`);

          const el = document.createElement('div');
          el.style.cssText = 'padding:24px 0;border-bottom:1px solid var(--rule-lt);cursor:pointer;';
          el.innerHTML = `
          <div style="font-size:12px;color:var(--ink4);margin-bottom:8px;">${a.category} · ${a.authorName} · ${dateStr}</div>
          <div style="font-family:var(--serif);font-size:22px;font-weight:700;color:var(--ink);margin-bottom:8px;line-height:1.3;">${hl(a.title)}</div>
          <div style="font-size:15px;color:var(--ink3);line-height:1.7;">${hl(excerpt)}…</div>
          <div style="font-size:13px;color:var(--ink4);margin-top:10px;">👍 ${a.likes||0} · ${Math.max(1,Math.round((a.content||'').length/300))} 分鐘閱讀</div>
        `;
          el.onmouseenter = () => el.style.opacity = '0.7';
          el.onmouseleave = () => el.style.opacity = '1';
          el.onclick = () => { closeSearch(); window.location.href = 'article.html?id=' + a.id; };
          list.appendChild(el);
        });
      })
      .catch(() => {
        list.innerHTML = '<div style="text-align:center;padding:80px;color:var(--ink4);">搜尋失敗，請確認服務器運行中</div>';
      });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
});