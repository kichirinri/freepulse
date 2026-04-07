/* ================================================================
 *  WenHui JavaScript  v6
 * ================================================================ */

function goCategory(cat) {
    window.location.href = 'category.html?cat=' + encodeURIComponent(cat);
}

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
 *  用户数据库
 * ================================================================ */
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

/* ================================================================
 *  Login Modal
 * ================================================================ */
function openLoginModal() {
    document.getElementById('loginModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    switchTab('login');
}
function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('open');
    document.body.style.overflow = '';
    clearForms();
}
function closeOnOverlay(e, id) {
    if (e.target.id === id && id === 'loginModal') closeLoginModal();
}
function switchTab(tab) {
    const tabMap  = { login: 'tabLogin', register: 'tabReg' };
    const formMap = { login: 'formLogin', register: 'formReg', forgot: 'formForgot' };
    Object.keys(tabMap).forEach(t => {
        document.getElementById(tabMap[t]).classList.toggle('active', t === tab);
    });
    Object.keys(formMap).forEach(t => {
        document.getElementById(formMap[t]).classList.toggle('hidden', t !== tab);
    });
    clearForms();
}
function showForgotPwd() {
    ['tabLogin','tabReg'].forEach(id => document.getElementById(id).classList.remove('active'));
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
    ['loginEmail','loginPwd','regName','regEmail','regPwd'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.classList.remove('error'); }
    });
    ['loginError','regError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}
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
            btn.disabled = false; btn.textContent = '登入Scribe'; return;
        }
        if (user.pwd !== pwd) {
            errEl.textContent = '密碼錯誤，請重試';
            document.getElementById('loginPwd').classList.add('error');
            btn.disabled = false; btn.textContent = '登入Scribe'; return;
        }
        onLoginSuccess(user);
    }, 600);
}
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
let currentUser = null;
function onLoginSuccess(user) {
    sessionStorage.setItem('wh_user', JSON.stringify(user));
    currentUser = user;
    closeLoginModal();
    renderUserState();
    const key = 'wh_noticed_' + user.email;
    if (!localStorage.getItem(key)) {
        setTimeout(() => openNoticeModal(), 400);
        localStorage.setItem(key, '1');
    }
}

/* ================================================================
 *  欢迎提示
 * ================================================================ */
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
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const modal = document.getElementById('loginModal');
    if (!modal || !modal.classList.contains('open')) return;
    const isLogin = !document.getElementById('formLogin').classList.contains('hidden');
    const isReg   = !document.getElementById('formReg').classList.contains('hidden');
    if (isLogin) doLogin();
    else if (isReg) doRegister();
});

/* ================================================================
 *  首页动态文章加载
 * ================================================================ */
let allArticles = [];

(function loadUserArticles() {
    fetch('http://localhost:8080/api/articles')
        .then(res => res.json())
        .then(articles => {
            allArticles = articles;

            // 今日頭條：点赞最多
            const sorted = [...articles].sort((a,b) => (b.likes||0)-(a.likes||0));
            const top = sorted[0];
            if (top) {
                const date = new Date(top.createdDate);
                const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
                document.getElementById('leadCat').textContent = top.category;
                document.getElementById('leadTitle').textContent = top.title;
                document.getElementById('leadDek').textContent = (top.content||'').slice(0,100) + '…';
                document.getElementById('leadMeta').innerHTML =
                    `<span>${top.authorName}</span><span>·</span><span>${dateStr}</span><span>·</span><span>👍 ${top.likes||0}</span>`;
                document.getElementById('leadCard').onclick = () => window.location.href = 'article.html?id=' + top.id;
            }

            // 最多閱讀（2-5名）
            const hot4El = document.getElementById('hot4List');
            hot4El.innerHTML = '';
            sorted.slice(1, 5).forEach(a => {
                const div = document.createElement('div');
                div.className = 'art-mid';
                div.style.cursor = 'pointer';
                div.onclick = () => window.location.href = 'article.html?id=' + a.id;
                div.innerHTML = `
                    <span class="sec-label" style="font-size:9px;margin-bottom:4px;">${a.category}</span>
                    <div class="art-title">${a.title}</div>
                    <div class="art-meta"><span>${a.authorName}</span><span>·</span><span>👍 ${a.likes||0}</span></div>`;
                hot4El.appendChild(div);
            });

            // 最新文章
            renderFeed(articles);
        })
        .catch(err => console.log('載入文章失敗', err));
})();

function renderFeed(articles) {
    const el = document.getElementById('latestList');
    if (!el) return;
    el.innerHTML = '';
    if (!articles.length) {
        el.innerHTML = '<div style="padding:60px 0;text-align:center;color:var(--ink4);font-size:15px;">此分類暫無文章</div>';
        return;
    }
    const colors = ['#4facfe,#00f2fe','#fa709a,#fee140','#a18cd1,#fbc2eb','#30cfd0,#667eea','#43e97b,#38f9d7'];
    articles.slice(0, 20).forEach(a => {
        const date = new Date(a.createdDate);
        const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
        const mins = Math.max(1, Math.round((a.content||'').replace(/\s/g,'').length / 300));
        const excerpt = (a.content||'').slice(0, 100);
        const isFire = a.category === '煙火飄香';
        const initial = (a.authorName||'文')[0].toUpperCase();
        const color = colors[a.id % colors.length];
        const div = document.createElement('div');
        div.className = 'art-text';
        div.style.cursor = 'pointer';
        div.onclick = () => window.location.href = 'article.html?id=' + a.id;
        div.innerHTML = `
            <div class="art-text-top">
                <div class="art-text-avatar" style="background:linear-gradient(135deg,${color})">${initial}</div>
                <span class="art-text-author">${a.authorName||'用戶'}</span>
                <span class="art-text-pub">· ${a.category}</span>
                <span class="art-text-loc" style="margin-left:auto;font-size:13px;color:var(--ink4);">${dateStr}</span>
            </div>
            <div class="art-title" style="font-family:var(--serif);font-size:20px;font-weight:700;line-height:1.35;color:var(--ink);margin-bottom:8px;">${a.title}</div>
            <div style="font-size:15px;color:var(--ink3);line-height:1.65;margin-bottom:12px;">${excerpt}…</div>
            <div class="art-text-footer">
                <span class="art-text-cat ${isFire?'fire':''}">${a.category}</span>
                <span class="art-text-date">${mins} 分鐘閱讀</span>
                <div class="art-text-stats"><span class="art-text-stat">👍 ${a.likes||0}</span></div>
            </div>`;
        el.appendChild(div);
    });
}

function filterByTopic(topic, el) {
    document.querySelectorAll('.nav-topic').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    if (topic === '熱門') {
        renderFeed([...allArticles].sort((a,b) => (b.likes||0)-(a.likes||0)));
        return;
    }
    fetch(`http://localhost:8080/api/articles/category/${encodeURIComponent(topic)}`)
        .then(res => res.json())
        .then(articles => renderFeed(articles))
        .catch(() => renderFeed(allArticles.filter(a => a.category === topic)));
}

/* ================================================================
 *  搜索
 * ================================================================ */
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
                const excerpt = (a.content||'').slice(0,120);
                const hl = s => s.replace(new RegExp(keyword,'gi'), m => `<mark style="background:#fff3cd;padding:0 2px;">${m}</mark>`);
                const el = document.createElement('div');
                el.style.cssText = 'padding:24px 0;border-bottom:1px solid var(--rule-lt);cursor:pointer;';
                el.innerHTML = `
                    <div style="font-size:12px;color:var(--ink4);margin-bottom:8px;">${a.category} · ${a.authorName} · ${dateStr}</div>
                    <div style="font-family:var(--serif);font-size:22px;font-weight:700;color:var(--ink);margin-bottom:8px;line-height:1.3;">${hl(a.title)}</div>
                    <div style="font-size:15px;color:var(--ink3);line-height:1.7;">${hl(excerpt)}…</div>
                    <div style="font-size:13px;color:var(--ink4);margin-top:10px;">👍 ${a.likes||0} · ${Math.max(1,Math.round((a.content||'').length/300))} 分鐘閱讀</div>`;
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });