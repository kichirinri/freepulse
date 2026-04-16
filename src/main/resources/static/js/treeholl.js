/* ================================================================
 *  樹洞 Page
 * ================================================================ */

/* 登录状态 */
const user = JSON.parse(sessionStorage.getItem('wh_user') || localStorage.getItem('wh_user') || 'null');
if (user) {
    document.getElementById('stateGuest').style.display = 'none';
    const su = document.getElementById('stateUser');
    su.style.display = 'flex';
    document.getElementById('userAvatar').textContent = (user.name || '文')[0].toUpperCase();
}

/* 加载树洞文章 */
(function loadHoles() {
    fetch('http://localhost:8080/api/articles/category/%E6%A8%B9%E6%B4%9E')
        .then(r => r.json())
        .then(articles => {
            const feed = document.getElementById('holeFeed');
            const side = document.getElementById('holeSide');

            if (!articles.length) {
                feed.innerHTML = `
                    <div class="cat-empty">
                        樹洞還是空的<br>
                        <a href="#" onclick="openWriteModal()" style="color:var(--ink);text-decoration:underline;">成為第一個說話的人 →</a>
                    </div>`;
                return;
            }

            feed.innerHTML = '';
            articles.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

            articles.forEach(a => {
                const date = new Date(a.createdDate);
                const now = new Date();
                const diff = Math.floor((now - date) / 60000);
                const timeStr = diff < 60 ? diff + ' 分鐘前'
                    : diff < 1440 ? Math.floor(diff/60) + ' 小時前'
                        : Math.floor(diff/1440) + ' 天前';
                const words = (a.content||'').replace(/\s/g,'').length;
                const mins = Math.max(1, Math.round(words/300));
                const excerpt = (a.content||'').slice(0, 120);

                const el = document.createElement('div');
                el.className = 'art-text';
                el.style.cursor = 'pointer';
                el.innerHTML = `
                    <div class="art-text-top">
                        <span class="hole-anon-tag">🕳️ 匿名</span>
                        <span class="art-text-loc" style="margin-left:auto;font-size:13px;color:var(--ink4);">${timeStr}</span>
                    </div>
                    <div class="art-title" style="font-family:var(--serif);font-size:22px;font-weight:700;line-height:1.35;color:var(--ink);margin-bottom:8px;transition:color 0.15s;"
                         onmouseover="this.style.color='#c0392b'" onmouseout="this.style.color='var(--ink)'">${a.title}</div>
                    <div style="font-size:15px;color:var(--ink3);line-height:1.65;margin-bottom:12px;">${excerpt}…</div>
                    <div class="art-text-footer">
                        <span class="art-text-cat">樹洞</span>
                        <span class="art-text-date">${mins} 分鐘閱讀</span>
                        <div class="art-text-stats"><span class="art-text-stat">👍 ${a.likes||0}</span></div>
                    </div>
                `;
                el.onclick = () => window.location.href = 'article.html?id=' + a.id;
                feed.appendChild(el);
            });

            /* 侧栏热门 */
            const sorted = [...articles].sort((a,b) => (b.likes||0) - (a.likes||0)).slice(0, 5);
            let sideHTML = `<hr class="side-rule"><div class="side-title">樹洞 · 最多共鳴</div>`;
            sorted.forEach((a, i) => {
                const r = i===0?'r1':i===1?'r2':i===2?'r3':'';
                sideHTML += `
                    <div class="hot-list-item" style="cursor:pointer;" onclick="window.location.href='article.html?id=${a.id}'">
                        <div class="hot-list-num ${r}">${i+1}</div>
                        <div>
                            <div class="hot-list-text">${a.title}</div>
                            <div class="hot-list-heat">👍 ${a.likes||0}</div>
                        </div>
                    </div>
                `;
            });
            sideHTML += `
                <hr class="side-rule" style="margin-top:28px;">
                <div class="side-title">其他分類</div>
                ${['時事','文化','生活','海外','創作'].map(c => `
                    <div class="hot-list-item" style="cursor:pointer;padding:12px 0;"
                         onclick="window.location.href='category.html?cat=${encodeURIComponent(c)}'">
                        <div style="font-size:15px;font-weight:700;color:var(--ink2);font-family:var(--serif-zh);">${c}</div>
                    </div>
                `).join('')}
            `;
            side.innerHTML = sideHTML;
        })
        .catch(() => {
            document.getElementById('holeFeed').innerHTML =
                '<div class="cat-empty">暫時無法連線，請稍後再試</div>';
        });
})();

/* 弹窗 */function openWriteModal() {
    if (!user) {
        alert('請先登入才能投入樹洞');
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('writeModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeWriteModal() {
    document.getElementById('writeModal').classList.remove('open');
    document.body.style.overflow = '';
}
function closeOnOverlay(e) {
    if (e.target.id === 'writeModal') closeWriteModal();
}
function goWrite() {
    window.location.href = 'write.html?mode=anon';
}