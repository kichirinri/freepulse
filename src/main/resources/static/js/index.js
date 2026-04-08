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
            const sorted = [...articles].sort((a,b) => (b.likes||0)-(a.likes||0));
            const colors = ['#4facfe,#00f2fe','#fa709a,#fee140','#a18cd1,#fbc2eb','#30cfd0,#667eea','#43e97b,#38f9d7'];

            renderFeed(articles);

            // 边栏：今日头条
            const leadEl = document.getElementById('sidebarLead');
            if (leadEl && sorted[0]) {
                const top = sorted[0];
                const date = new Date(top.createdDate);
                const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
                leadEl.innerHTML = `
                <div style="cursor:pointer;" onclick="window.location.href='article.html?id=${top.id}'">
                    <div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:1px;margin-bottom:6px;">${top.category}</div>
                    <div style="font-family:var(--serif);font-size:17px;font-weight:700;line-height:1.35;color:#111;margin-bottom:8px;">${top.title}</div>
                    <div style="font-size:13px;color:#777;line-height:1.6;">${(top.content||'').slice(0,60)}…</div>
                    <div style="font-size:12px;color:#aaa;margin-top:8px;">${top.authorName} · ${dateStr} · 👍 ${top.likes||0}</div>
                </div>`;
            }



            // 边栏：树洞最新3条
            const treehollEl = document.getElementById('sidebarTreeholl');
            if (treehollEl) {
                const treehollPosts = articles.filter(a => a.category === '樹洞').slice(0, 3);
                if (!treehollPosts.length) {
                    treehollEl.innerHTML = '<div style="font-size:13px;color:#aaa;">暫無樹洞內容</div>';
                } else {
                    treehollEl.innerHTML = treehollPosts.map(a => {
                        const date = new Date(a.createdDate);
                        const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
                        return `<div class="sidebar-treeholl-item" onclick="window.location.href='article.html?id=${a.id}'">
                            <div class="sidebar-treeholl-title">${a.title}</div>
                            <div class="sidebar-treeholl-meta">${a.authorName} · ${dateStr} · 👍 ${a.likes||0}</div>
                        </div>`;
                    }).join('');
                }
            }

            // 边栏：推荐作者（点赞数最高的前4位不重复作者）
            const authorsEl = document.getElementById('sidebarAuthors');
            if (authorsEl) {
                const seen = new Set();
                const topAuthors = [];
                [...articles].sort((a,b) => (b.likes||0)-(a.likes||0)).forEach(a => {
                    if (!seen.has(a.authorName)) {
                        seen.add(a.authorName);
                        topAuthors.push(a);
                    }
                });
                const colors = ['#4facfe,#00f2fe','#fa709a,#fee140','#a18cd1,#fbc2eb','#43e97b,#38f9d7'];
                authorsEl.innerHTML = topAuthors.slice(0, 4).map((a, i) => {
                    const initial = (a.authorName||'文')[0].toUpperCase();
                    const color = colors[i % colors.length];
                    return `<div class="sidebar-author-item">
                        <div class="sidebar-author-avatar" style="background:linear-gradient(135deg,${color})">${initial}</div>
                        <div>
                            <div class="sidebar-author-name">${a.authorName}</div>
                            <div class="sidebar-author-desc">${a.category} · 👍 ${a.likes||0}</div>
                        </div>
                    </div>`;
                }).join('');
            }

            // 边栏：最近热读（点赞最多前5篇）
            const hotEl = document.getElementById('sidebarHot');
            if (hotEl) {
                const hotList = [...articles].sort((a,b) => (b.likes||0)-(a.likes||0)).slice(0, 5);
                hotEl.innerHTML = hotList.map((a, i) => `
                    <div class="sidebar-hot-item" onclick="window.location.href='article.html?id=${a.id}'">
                        <div class="sidebar-hot-num">${i+1}</div>
                        <div>
                            <div class="sidebar-hot-title">${a.title}</div>
                            <div class="sidebar-hot-meta">${a.authorName} · 👍 ${a.likes||0}</div>
                        </div>
                    </div>`).join('');
            }
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


const colors = ['#4facfe,#00f2fe','#fa709a,#fee140','#a18cd1,#fbc2eb','#30cfd0,#667eea','#43e97b,#38f9d7'];

const SEARCH_HISTORY_KEY = 'scribe_search_history';

function getSearchHistory() {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
}

function saveSearchHistory(keyword) {
    let history = getSearchHistory();
    history = [keyword, ...history.filter(k => k !== keyword)].slice(0, 8);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function showNavDropdown() {
    const input = document.getElementById('navSearchInput');
    if (input.value.trim()) { onNavInput(input.value); return; }
    const history = getSearchHistory();
    const dd = document.getElementById('navSearchDropdown');
    if (!history.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = `
        <div class="nav-dd-section">
            <div class="nav-dd-label" style="display:flex;justify-content:space-between;align-items:center;">
                <span>搜尋歷史</span>
                <span style="font-size:11px;color:#aaa;cursor:pointer;font-weight:400;text-transform:none;letter-spacing:0;" onclick="clearSearchHistory()">清除歷史</span>
            </div>
            ${history.map(k => `
                <div class="nav-dd-item" onclick="pickHistory('${k}')">
                    <div class="nav-dd-icon">🕐</div>
                    <span>${k}</span>
                </div>`).join('')}
        </div>`;
    dd.style.display = 'block';
}

function onNavInput(val) {
    toggleNavClear(val);
    const dd = document.getElementById('navSearchDropdown');
    if (!val.trim()) { showNavDropdown(); return; }
    const filtered = allArticles.filter(a =>
        a.title.includes(val) || (a.authorName||'').includes(val)
    ).slice(0, 6);
    if (!filtered.length) {
        dd.innerHTML = `<div style="padding:20px 16px;font-size:14px;color:#aaa;">沒有找到相關結果</div>`;
    } else {
        dd.innerHTML = `<div class="nav-dd-section">
            <div class="nav-dd-label">搜尋結果</div>
            ${filtered.map(a => `<div class="nav-dd-item" onclick="window.location.href='article.html?id=${a.id}'">
                <div class="nav-dd-icon">📄</div>
                <div><div style="font-weight:600;">${a.title}</div><div style="font-size:12px;color:#aaa;">${a.authorName}</div></div>
            </div>`).join('')}
        </div>`;
    }
    dd.style.display = 'block';
}

function doNavSearch(keyword) {
    if (!keyword.trim()) return;
    saveSearchHistory(keyword.trim());
    document.getElementById('navSearchDropdown').style.display = 'none';
    const filtered = allArticles.filter(a =>
        a.title.includes(keyword) ||
        (a.content||'').includes(keyword) ||
        (a.authorName||'').includes(keyword)
    );
    renderFeed(filtered.length ? filtered : allArticles);
}

function toggleNavClear(val) {
    document.getElementById('navSearchClear').style.display = val ? 'inline' : 'none';
}

function clearNavSearch() {
    const input = document.getElementById('navSearchInput');
    input.value = '';
    document.getElementById('navSearchClear').style.display = 'none';
    document.getElementById('navSearchDropdown').style.display = 'none';
    renderFeed(allArticles);
    input.focus();
}

function pickHistory(keyword) {
    document.getElementById('navSearchInput').value = keyword;
    doNavSearch(keyword);
}

function clearSearchHistory() {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    document.getElementById('navSearchDropdown').style.display = 'none';
}



// 点击外部关闭下拉
document.addEventListener('click', e => {
    if (!document.getElementById('navSearchWrap')?.contains(e.target)) {
        const dd = document.getElementById('navSearchDropdown');
        if (dd) dd.style.display = 'none';
    }
});

window.addEventListener('load', () => {
    const input = document.getElementById('navSearchInput');
    if (input) { input.value = ''; setTimeout(() => { input.value = ''; }, 300); }
});