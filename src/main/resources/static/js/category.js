const CAT_CONFIG = {
    '時事': {
        sub: ['全部','社會','財經','國際','軍事','法律','教育'],
        desc: '時事 · 社會 · 財經 · 國際視野',
        img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&q=80'
    },
    '文化': {
        sub: ['全部','歷史','哲學','讀書','藝術','詩詞','科普'],
        desc: '歷史 · 哲學 · 藝術 · 思想深度',
        img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&q=80'
    },
    '生活': {
        sub: ['全部','美食','旅遊','健康','情感','婚戀','育兒'],
        desc: '美食 · 旅遊 · 健康 · 生活美學',
        img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1400&q=80'
    },
    '海外': {
        sub: ['全部','移民','同城','留學'],
        desc: '移民 · 同城 · 海外華人生活',
        img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=80'
    },
    '創作': {
        sub: ['全部','小說','散文','詩詞','隨筆'],
        desc: '小說 · 散文 · 詩詞 · 自由創作',
        img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&q=80'
    },
    '樹洞': {
        sub: ['全部'],
        desc: '匿名發聲 · 不顯示任何作者資訊 · 說出真心話',
        img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1400&q=80'
    }
};

const CAT_TO_BACKEND = {
    '時事': ['時事','社會','財經','國際','軍事','法律','教育'],
    '文化': ['歷史','哲學','讀書','藝術','詩詞','科普','文化'],
    '生活': ['生活','美食','旅遊','健康','情感','婚戀','育兒','美妝','家居'],
    '海外': ['海外','移民','同城'],
    '創作': ['創作','小說','散文','隨筆','詩詞'],
    '樹洞': ['樹洞']
};

let currentCat = '';
let currentSub = '全部';
let allCatArticles = [];

(function init() {
    const params = new URLSearchParams(window.location.search);
    currentCat = decodeURIComponent(params.get('cat') || '時事');

    const config = CAT_CONFIG[currentCat] || { sub: ['全部'], desc: '', img: '' };

    document.title = currentCat + ' · Scribe';
    document.getElementById('catTitle').textContent = currentCat;
    document.getElementById('catHeaderImg').src = config.img;
    document.getElementById('catDesc').textContent = config.desc;

    document.querySelectorAll('.nav-topic').forEach(t => {
        if (t.textContent.trim() === currentCat) t.classList.add('active');
    });

    renderSubBar(config.sub);
    loadArticles();

    const user = JSON.parse(sessionStorage.getItem('wh_user') || 'null');
    if (user) {
        document.getElementById('stateGuest').style.display = 'none';
        document.getElementById('stateUser').style.display = 'flex';
        document.getElementById('userAvatar').textContent = (user.name || '文')[0].toUpperCase();
    }
})();

function renderSubBar(subs) {
    const bar = document.getElementById('catSubBar');
    bar.innerHTML = '';
    subs.forEach(s => {
        const el = document.createElement('div');
        el.className = 'cat-sub-tag' + (s === '全部' ? ' active' : '');
        el.textContent = s;
        el.onclick = () => filterSub(s, el);
        bar.appendChild(el);
    });
}

function filterSub(sub, el) {
    currentSub = sub;
    document.querySelectorAll('.cat-sub-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    if (sub === '全部') { renderArticles(allCatArticles); return; }
    const filtered = allCatArticles.filter(a => a.category === sub);
    renderArticles(filtered);
}

function goCategory(cat) {
    window.location.href = 'category.html?cat=' + encodeURIComponent(cat);
}

function loadArticles() {
    const backends = CAT_TO_BACKEND[currentCat] || [currentCat];
    Promise.all(
        backends.map(cat =>
            fetch(`http://localhost:8080/api/articles/category/${encodeURIComponent(cat)}`)
                .then(r => r.json()).catch(() => [])
        )
    ).then(results => {
        allCatArticles = results.flat();
        allCatArticles.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        renderArticles(allCatArticles);
        renderSide(allCatArticles);
    });
}

function renderArticles(articles) {
    const feed = document.getElementById('catFeed');
    feed.innerHTML = '';

    if (!articles.length) {
        feed.innerHTML = '<div class="cat-empty">此分類暫無文章<br><a href="write.html" style="color:var(--ink);text-decoration:underline;">成為第一個寫作者 →</a></div>';
        return;
    }

    const colors = ['#667eea,#764ba2','#fa709a,#fee140','#4facfe,#00f2fe','#a18cd1,#fbc2eb','#30cfd0,#667eea'];

    articles.forEach(a => {
        const date = new Date(a.createdDate);
        const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
        const words = (a.content||'').replace(/\s/g,'').length;
        const mins = Math.max(1, Math.round(words/300));
        const excerpt = (a.content||'').slice(0, 120);
        const isAnon = a.category === '樹洞';
        const initial = (a.authorName||'文')[0].toUpperCase();
        const color = colors[a.id % colors.length];

        const el = document.createElement('div');
        el.className = 'art-text';
        el.style.cursor = 'pointer';
        el.innerHTML = `
      <div class="art-text-top">
        ${isAnon
            ? `<span style="font-size:11px;letter-spacing:1px;color:var(--ink4);border:1px solid var(--rule);padding:2px 8px;border-radius:2px;">🕳️ 匿名</span>`
            : `<div class="art-text-avatar" style="background:linear-gradient(135deg,${color})">${initial}</div>
             <span class="art-text-author">${a.authorName || '用戶'}</span>
             <span class="art-text-pub">· ${a.category}</span>`
        }
        <span class="art-text-loc" style="margin-left:auto;font-size:13px;color:var(--ink4);">${dateStr}</span>
      </div>
      <div class="art-title" style="font-family:var(--serif);font-size:22px;font-weight:700;line-height:1.35;color:var(--ink);margin-bottom:8px;transition:color 0.15s;"
           onmouseover="this.style.color='#c0392b'" onmouseout="this.style.color='var(--ink)'">${a.title}</div>
      <div style="font-size:15px;color:var(--ink3);line-height:1.65;margin-bottom:12px;">${excerpt}…</div>
      <div class="art-text-footer">
        <span class="art-text-cat">${a.category}</span>
        <span class="art-text-date">${mins} 分鐘閱讀</span>
        <div class="art-text-stats"><span class="art-text-stat">👍 ${a.likes||0}</span></div>
      </div>
    `;
        el.onclick = () => window.location.href = 'article.html?id=' + a.id;
        feed.appendChild(el);
    });
}

function renderSide(articles) {
    const side = document.getElementById('catSide');
    const sorted = [...articles].sort((a,b) => (b.likes||0) - (a.likes||0)).slice(0, 7);
    let html = `<hr class="side-rule"><div class="side-title">${currentCat} · 熱門</div>`;
    sorted.forEach((a, i) => {
        const r = i===0?'r1':i===1?'r2':i===2?'r3':'';
        html += `
      <div class="hot-list-item" style="cursor:pointer;" onclick="window.location.href='article.html?id=${a.id}'">
        <div class="hot-list-num ${r}">${i+1}</div>
        <div>
          <div class="hot-list-text">${a.title}</div>
          <div class="hot-list-heat">👍 ${a.likes||0} · ${a.category}</div>
        </div>
      </div>
    `;
    });
    html += `<hr class="side-rule" style="margin-top:28px;"><div class="side-title">其他分類</div>`;
    ['時事','文化','生活','海外','創作','樹洞'].filter(c => c !== currentCat).forEach(c => {
        html += `
      <div class="hot-list-item" style="cursor:pointer;padding:12px 0;" onclick="${c==='樹洞'?'window.location.href=\'treeholl.html\'':'goCategory(\''+c+'\')'}">
        <div style="font-size:15px;font-weight:700;color:var(--ink2);font-family:var(--serif-zh);">${c==='樹洞'?'🕳️ '+c:c}</div>
      </div>
    `;
    });
    side.innerHTML = html;
}