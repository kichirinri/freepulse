const currentUser = JSON.parse(sessionStorage.getItem('wh_user') || 'null');

if (!currentUser) {
    document.getElementById('noLogin').classList.add('show');
} else {
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('pageSubText').textContent = currentUser.name + ' 的創作空間';
    loadArticles();
}

let allMyArticles = [];
let deleteTargetId = null;

function loadArticles() {
    fetch('http://localhost:8080/api/articles/my/' + encodeURIComponent(currentUser.email))
        .then(res => res.json())
        .then(all => {
            allMyArticles = all;

            const totalLikes = allMyArticles.reduce((s, a) => s + (a.likes || 0), 0);
            const totalWords = allMyArticles.reduce((s, a) => s + (a.content || '').replace(/\s/g,'').length, 0);
            document.getElementById('statTotal').textContent = allMyArticles.length;
            document.getElementById('statLikes').textContent = totalLikes;
            document.getElementById('statWords').textContent = totalWords > 9999 ?
                (totalWords/10000).toFixed(1) + '萬' : totalWords;

            const tabs = document.getElementById('filterTabs');
            const cats = [...new Set(allMyArticles.map(a => a.category))];
            tabs.innerHTML = '<div class="filter-tab active" onclick="filterArticles(\'all\', this)">全部</div>';
            cats.forEach(cat => {
                const tab = document.createElement('div');
                tab.className = 'filter-tab';
                tab.textContent = cat;
                tab.onclick = function() { filterArticles(cat, this); };
                tabs.appendChild(tab);
            });

            // 獲讚文章tab
                        const likedByOthersTab = document.createElement('div');
                        likedByOthersTab.className = 'filter-tab';
                        likedByOthersTab.textContent = '獲讚文章';
                        likedByOthersTab.onclick = function() { showLikedByOthers(this); };
                        tabs.appendChild(likedByOthersTab);

            // 已讚tab始终在最后
                        const likedTab = document.createElement('div');
                        likedTab.className = 'filter-tab';
                        likedTab.textContent = '已讚文章';
                        likedTab.onclick = function() { showLiked(this); };
                        tabs.appendChild(likedTab);

            // 检测URL参数，自动切换到已讚tab
            if (new URLSearchParams(location.search).get('tab') === 'liked') {
                showLiked(likedTab);
            } else {
                renderList(allMyArticles);
            }
        })
        .catch(err => {
            console.log('載入失敗', err);
            showToast('載入文章失敗，請確認服務器運行中');
        });
}

function filterArticles(cat, tabEl) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    if (cat === 'all') {
        renderList(allMyArticles);
    } else {
        renderList(allMyArticles.filter(a => a.category === cat));
    }
}

function renderList(articles, isLiked = false) {
    const list = document.getElementById('articleList');
    const empty = document.getElementById('emptyState');
    list.innerHTML = '';

    if (!articles.length) {
        empty.classList.add('show');
        document.querySelector('.empty-title').textContent = isLiked ? '還沒有點讚的文章' : '還沒有文章';
        document.querySelector('.empty-sub').textContent = isLiked ? '去閱讀文章，點讚後會出現在這裡' : '開始寫作，讓你的聲音傳遍世界每個角落';
        return;
    }
    empty.classList.remove('show');

    articles.forEach(a => {
        const date = new Date(a.createdDate);
        const dateStr = date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日';
        const words = (a.content || '').replace(/\s/g,'').length;
        const excerpt = (a.content || '').slice(0, 80);
                const tags = a.tags ? a.tags.split(',').filter(t => t.trim()) : [];

        const actions = isLiked
            ? `<button class="btn-article-action" onclick="viewArticle(${a.id})">查看</button>`
            : `<button class="btn-article-action" onclick="viewArticle(${a.id})">查看</button>
               <button class="btn-article-action delete" onclick="openDelete(${a.id}, '${a.title.replace(/'/g,"\\'")}')">刪除</button>`;

        const row = document.createElement('div');
        row.className = 'article-row';
        row.innerHTML = `
            <div class="article-row-cover">📄</div>
            <div class="article-row-body">
                <div class="article-row-meta">
                    <span class="article-row-cat ${isFire ? 'fire' : ''}">${a.category}</span>
                    <span class="article-row-date">${dateStr}</span>
                    ${isLiked ? `<span style="font-size:11px;color:#aaa;margin-left:8px;">by ${a.authorName || '用戶'}</span>` : ''}
                </div>
                <div class="article-row-title">${a.title}</div>
                <div class="article-row-excerpt">${excerpt}…</div>
                <div class="article-row-stats">
                    <span>👍 ${a.likes || 0}</span>
                    <span>${words} 字</span>
                    ${tags.map(t => `<span>#${t.trim()}</span>`).join('')}
                </div>
            </div>
            <div class="article-row-actions" onclick="event.stopPropagation()">
                ${actions}
            </div>`;
        row.addEventListener('click', () => viewArticle(a.id));
        list.appendChild(row);
    });
}

function showLiked(tabEl) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');

    const likedIds = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('liked_')) {
            likedIds.push(key.replace('liked_', ''));
        }
    }

    if (!likedIds.length) {
        renderList([], true);
        return;
    }

    document.getElementById('articleList').innerHTML =
        '<div style="padding:20px 0;color:var(--ink4);font-size:13px;">載入中…</div>';
    document.getElementById('emptyState').classList.remove('show');

    Promise.all(
        likedIds.map(id =>
            fetch('http://localhost:8080/api/articles/' + id)
                .then(res => res.json())
                .catch(() => null)
        )
    ).then(articles => {
        renderList(articles.filter(a => a && a.id), true);
    });
}

function viewArticle(id) {
    window.location.href = 'article.html?id=' + id;
}

function openDelete(id, title) {
    deleteTargetId = id;
    document.getElementById('deleteTargetTitle').textContent = title;
    document.getElementById('deleteOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeDelete() {
    document.getElementById('deleteOverlay').classList.remove('open');
    document.body.style.overflow = '';
    deleteTargetId = null;
}
function closeDeleteOnOverlay(e) {
    if (e.target.id === 'deleteOverlay') closeDelete();
}
function confirmDelete() {
    fetch('http://localhost:8080/api/articles/' + deleteTargetId, { method: 'DELETE' })
        .then(() => {
            closeDelete();
            showToast('文章已刪除 ✓');
            loadArticles();
        })
        .catch(() => showToast('刪除失敗，請重試'));
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
function showLikedByOthers(tabEl) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    // 从自己的文章里筛选出有被点赞的，按点赞数降序
    const liked = [...allMyArticles]
        .filter(a => (a.likes || 0) > 0)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0));
    renderList(liked);
}