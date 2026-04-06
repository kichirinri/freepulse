/* ── 读取文章 ── */
const params = new URLSearchParams(location.search);
const articleId = parseInt(params.get('id'));
const currentUser = JSON.parse(sessionStorage.getItem('wh_user') || 'null');
let isAuthor = false;
let article = null;

fetch('http://localhost:8080/api/articles/' + articleId)
    .then(res => res.json())
    .then(data => {
        if (!data || !data.id) {
            document.getElementById('artContainer').style.display = 'none';
            document.getElementById('notFound').classList.add('show');
            return;
        }
        article = data;
        isAuthor = currentUser && currentUser.email === article.authorEmail;
        renderArticle();
        loadSidebar();
        loadRecommend();
    })
    .catch(() => {
        document.getElementById('artContainer').style.display = 'none';
        document.getElementById('notFound').classList.add('show');
    });

/* ── 渲染文章 ── */
function renderArticle() {
    document.title = article.title + ' · Scribe';
    if (article.coverImage) {
        const img = document.getElementById('artCover');
        img.src = article.coverImage; img.classList.add('show');
    }
    const catEl = document.getElementById('artCat');
    catEl.textContent = article.category;
    if (article.category === '煙火飄香') catEl.classList.add('fire');

    const tagsEl = document.getElementById('artTags');
    if (article.tags) {
        article.tags.split(',').forEach(t => {
            if (!t.trim()) return;
            const span = document.createElement('span');
            span.className = 'art-tag'; span.textContent = '#' + t.trim();
            tagsEl.appendChild(span);
        });
    }
    document.getElementById('artTitle').textContent = article.title;
    const initial = (article.authorName || '文')[0].toUpperCase();
    document.getElementById('artAuthorAvatar').textContent = initial;
    document.getElementById('artAuthorName').textContent = article.authorName;
    const date = new Date(article.createdDate);
    document.getElementById('artDate').textContent =
        date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日';
    const words = (article.content || '').replace(/\s/g,'').length;
    const mins = Math.max(1, Math.round(words / 300));
    document.getElementById('artReadTime').textContent = '約 ' + mins + ' 分鐘閱讀';
    const bodyEl = document.getElementById('artBody');
    if (article.bodyHTML) bodyEl.innerHTML = article.bodyHTML;
    else bodyEl.textContent = article.content;
    document.getElementById('likeCount').textContent = article.likes || 0;
    if (localStorage.getItem('liked_' + article.id)) document.getElementById('likeBtn').classList.add('liked');
    const url = location.href;
    document.getElementById('artCopyright').innerHTML =
        '© ' + article.authorName + ' · Scribe<br>' +
        '<span style="font-size:11px;word-break:break-all;">' + url + '</span>';
    document.getElementById('wmPreviewText').textContent = '© ' + article.authorName + ' · ' + url;
    if (isAuthor) document.getElementById('authorToolbar').classList.add('show');
    if (!isAuthor) document.body.classList.add('no-copy');
    fetch('http://localhost:8080/api/articles/' + article.id + '/view', { method: 'POST' });
}

/* ── 右侧边栏 ── */
function loadSidebar() {
    const initial = (article.authorName || '文')[0].toUpperCase();
    document.getElementById('sideAvatar').textContent = initial;
    document.getElementById('sideName').textContent = article.authorName;
    if (article.authorEmail) {
        fetch('http://localhost:8080/api/articles/my/' + encodeURIComponent(article.authorEmail))
            .then(r => r.json())
            .then(arts => { document.getElementById('sideStats').textContent = '已發表 ' + arts.length + ' 篇文章'; })
            .catch(() => {});
    }
    fetch('http://localhost:8080/api/articles/category/' + encodeURIComponent(article.category))
        .then(r => r.json())
        .then(arts => {
            const others = arts.filter(a => a.id !== article.id)
                .sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
            if (!others.length) return;
            const card = document.getElementById('sideHotCard');
            card.style.display = 'block';
            document.getElementById('sideHotLabel').textContent = article.category + ' · 熱門';
            const list = document.getElementById('sideHotList');
            others.forEach((a, i) => {
                const item = document.createElement('div');
                item.className = 'art-side-hot-item';
                item.onclick = () => window.location.href = 'article.html?id=' + a.id;
                item.innerHTML = `<div class="art-side-hot-num">${i+1}</div><div><div class="art-side-hot-title">${a.title}</div><div class="art-side-hot-meta">👍 ${a.likes||0} · ${a.authorName||'用戶'}</div></div>`;
                list.appendChild(item);
            });
        }).catch(() => {});
}

/* ── 底部推荐 ── */
function loadRecommend() {
    fetch('http://localhost:8080/api/articles/category/' + encodeURIComponent(article.category))
        .then(r => r.json())
        .then(arts => {
            const others = arts.filter(a => a.id !== article.id)
                .sort(() => Math.random() - 0.5).slice(0, 4);
            if (!others.length) return;
            document.getElementById('artRecommend').style.display = 'block';
            const list = document.getElementById('artRecommendList');
            others.forEach((a, i) => {
                const date = new Date(a.createdDate);
                const dateStr = (date.getMonth()+1) + '月' + date.getDate() + '日';
                const item = document.createElement('div');
                item.className = 'art-rec-item';
                item.onclick = () => window.location.href = 'article.html?id=' + a.id;
                item.innerHTML = `<div class="art-rec-num">0${i+1}</div><div class="art-rec-body"><div class="art-rec-cat">${a.category}</div><div class="art-rec-title">${a.title}</div><div class="art-rec-meta">${a.authorName||'用戶'} · ${dateStr} · 👍 ${a.likes||0}</div></div>`;
                list.appendChild(item);
            });
        }).catch(() => {});
}

/* ── 点赞 ── */
function toggleLike() {
    if (!article) return;
    const key = 'liked_' + article.id;
    const btn = document.getElementById('likeBtn');
    if (localStorage.getItem(key)) {
        article.likes = Math.max(0, (article.likes || 0) - 1);
        localStorage.removeItem(key); btn.classList.remove('liked');
        document.getElementById('likeCount').textContent = article.likes;
    } else {
        fetch('http://localhost:8080/api/articles/' + article.id + '/like', { method: 'POST' })
            .then(res => res.json())
            .then(updated => {
                article.likes = updated.likes;
                localStorage.setItem(key, '1'); btn.classList.add('liked');
                document.getElementById('likeCount').textContent = article.likes;
            });
    }
}

/* ── 分享 ── */
function copyLink() {
    const btn = document.getElementById('btnCopyLink');
    navigator.clipboard.writeText(location.href).then(() => {
        if (btn) {
            btn.textContent = '已複製 ✓'; btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> 複製連結`; btn.classList.remove('copied'); }, 2000);
        }
        showToast('連結已複製 ✓');
    }).catch(() => { const ta = document.createElement('textarea'); ta.value = location.href; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast('連結已複製 ✓'); });
}
function showQRCode() { document.getElementById('qrOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; document.getElementById('qrImg').src = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(location.href); }
function closeQR(e) { if (e.target.id === 'qrOverlay') closeQRDirect(); }
function closeQRDirect() { document.getElementById('qrOverlay').classList.remove('open'); document.body.style.overflow = ''; }

/* ── 复制文章 ── */
function copyArticle() {
    if (!isAuthor) return;
    const text = article.title + '\n\n' + article.content;
    navigator.clipboard.writeText(text).then(() => showToast('文章內容已複製 ✓')).catch(() => { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast('文章內容已複製 ✓'); });
}

/* ── 读者复制拦截 ── */
document.addEventListener('copy', e => { if (!isAuthor) { e.preventDefault(); showCopyBlock(); } });
document.addEventListener('contextmenu', e => { if (!isAuthor) { e.preventDefault(); showCopyBlock(); } });
function showCopyBlock() { const t = document.getElementById('copyBlockToast'); t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); }

/* ── PDF ── */
let wmChoice = 'yes';
function openPdfDialog() { document.getElementById('pdfDialog').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closePdfDialog() { document.getElementById('pdfDialog').classList.remove('open'); document.body.style.overflow = ''; }
function closePdfOnOverlay(e) { if (e.target.id === 'pdfDialog') closePdfDialog(); }
function selectWm(choice) {
    wmChoice = choice;
    document.getElementById('wmOpt1').classList.toggle('selected', choice === 'yes');
    document.getElementById('wmOpt2').classList.toggle('selected', choice === 'no');
    document.getElementById('wmYes').checked = choice === 'yes';
    document.getElementById('wmNo').checked = choice === 'no';
    document.getElementById('wmPreview').style.display = choice === 'yes' ? 'block' : 'none';
}
function downloadPDF() {
    if (!article) return; closePdfDialog();
    window.location.href = 'http://localhost:8080/api/articles/' + article.id + '/pdf?watermark=' + (wmChoice === 'yes' ? 'true' : 'false');
    showToast('PDF 下載中…');
}

/* ================================================================
   圖片下載 — Canvas生成，隨機背景
================================================================ */
let imgWmChoice = 'yes';
let imgThemeChoice = 'random';

// 背景主题配置
const THEMES = {
    light: {
        bg: ['#ffffff', '#f8f6f3'],
        text: '#111111', sub: '#666666', accent: '#c0392b',
        border: '#d0c9c0', logo: '#111111'
    },
    dark: {
        bg: ['#0d0d0d', '#1a1a2e'],
        text: '#f0f0f0', sub: '#aaaaaa', accent: '#e8622a',
        border: '#333333', logo: '#f0f0f0'
    },
    paper: {
        bg: ['#f5f0e8', '#ede6d6'],
        text: '#2c1810', sub: '#7a5c3a', accent: '#8b3a2a',
        border: '#c4a882', logo: '#2c1810'
    },
    gradient: [
        { bg: ['#667eea', '#764ba2'], text: '#ffffff', sub: 'rgba(255,255,255,0.8)', accent: '#FFD54F', border: 'rgba(255,255,255,0.3)', logo: '#ffffff' },
        { bg: ['#f093fb', '#f5576c'], text: '#ffffff', sub: 'rgba(255,255,255,0.8)', accent: '#FFD54F', border: 'rgba(255,255,255,0.3)', logo: '#ffffff' },
        { bg: ['#4facfe', '#00f2fe'], text: '#ffffff', sub: 'rgba(255,255,255,0.85)', accent: '#fff176', border: 'rgba(255,255,255,0.3)', logo: '#ffffff' },
        { bg: ['#43e97b', '#38f9d7'], text: '#1a3a2a', sub: '#2d5a40', accent: '#c0392b', border: 'rgba(0,0,0,0.15)', logo: '#1a3a2a' },
        { bg: ['#fa709a', '#fee140'], text: '#2c1810', sub: '#7a4a20', accent: '#c0392b', border: 'rgba(0,0,0,0.15)', logo: '#2c1810' },
    ],
    ink: {
        bg: ['#1a237e', '#283593'],
        text: '#e8eaf6', sub: '#9fa8da', accent: '#FFD54F',
        border: '#3949ab', logo: '#e8eaf6'
    }
};

function getTheme() {
    let t = imgThemeChoice;
    if (t === 'random') {
        const all = ['light', 'dark', 'paper', 'gradient', 'ink'];
        t = all[Math.floor(Math.random() * all.length)];
    }
    if (t === 'gradient') {
        const arr = THEMES.gradient;
        return arr[Math.floor(Math.random() * arr.length)];
    }
    return THEMES[t] || THEMES.light;
}

function openImgDialog() { document.getElementById('imgDialog').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeImgDialog() { document.getElementById('imgDialog').classList.remove('open'); document.body.style.overflow = ''; }
function closeImgOnOverlay(e) { if (e.target.id === 'imgDialog') closeImgDialog(); }

function selectImgWm(choice) {
    imgWmChoice = choice;
    document.getElementById('imgWmOpt1').classList.toggle('selected', choice === 'yes');
    document.getElementById('imgWmOpt2').classList.toggle('selected', choice === 'no');
    document.getElementById('imgWmYes').checked = choice === 'yes';
    document.getElementById('imgWmNo').checked = choice === 'no';
}

function selectTheme(el, theme) {
    document.querySelectorAll('.img-theme-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    imgThemeChoice = theme;
}

function downloadImage() {
    if (!article) return;
    closeImgDialog();
    showToast('圖片生成中…');

    const theme = getTheme();
    const W = 800;
    const PADDING = 56;
    const contentW = W - PADDING * 2;

    // 先计算高度
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 字体设置
    const titleFont = 'bold 32px serif';
    const bodyFont = '16px serif';
    const metaFont = '13px sans-serif';

    // 计算标题高度
    ctx.font = titleFont;
    const titleLines = wrapText(ctx, article.title, contentW);

    // 计算正文高度（最多显示前400字）
    ctx.font = bodyFont;
    const bodyText = (article.content || '').slice(0, 400) + (article.content.length > 400 ? '…' : '');
    const bodyLines = wrapText(ctx, bodyText, contentW);

    // 计算总高度
    const headerH = 80;
    const titleH = titleLines.length * 44 + 20;
    const metaH = 60;
    const bodyH = Math.min(bodyLines.length, 12) * 28 + 20;
    const footerH = imgWmChoice === 'yes' ? 80 : 60;
    const separatorH = 24;
    const totalH = headerH + titleH + metaH + separatorH + bodyH + footerH + 40;

    canvas.width = W;
    canvas.height = totalH;

    // 绘制背景渐变
    const grad = ctx.createLinearGradient(0, 0, W, totalH);
    grad.addColorStop(0, theme.bg[0]);
    grad.addColorStop(1, theme.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, totalH);

    // 随机噪点（让每张图不同）
    const noise = Math.floor(Math.random() * 1000);
    for (let i = 0; i < 200; i++) {
        const x = (Math.sin(i * 9.7 + noise) * 0.5 + 0.5) * W;
        const y = (Math.cos(i * 7.3 + noise) * 0.5 + 0.5) * totalH;
        ctx.fillStyle = 'rgba(255,255,255,0.015)';
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
    }

    let y = 0;

    // 顶部Logo栏
    ctx.fillStyle = theme.border;
    ctx.fillRect(0, 0, W, 1);
    y = 24;
    ctx.font = 'bold 18px serif';
    ctx.fillStyle = theme.logo;
    ctx.fillText('Scribe', PADDING, y + 20);

    // 分类标签
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = theme.accent;
    const catText = article.category.toUpperCase();
    const catW = ctx.measureText(catText).width + 20;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(W - PADDING - catW, y + 8, catW, 22);
    ctx.fillText(catText, W - PADDING - catW + 10, y + 23);

    y += headerH;

    // 标题
    ctx.font = titleFont;
    ctx.fillStyle = theme.text;
    titleLines.forEach(line => {
        ctx.fillText(line, PADDING, y);
        y += 44;
    });
    y += 16;

    // 分割线
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, y); ctx.lineTo(W - PADDING, y);
    ctx.stroke();
    y += 24;

    // 作者 & 日期
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = theme.text;
    ctx.fillText(article.authorName || '用戶', PADDING, y);
    const date = new Date(article.createdDate);
    const dateStr = date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日';
    ctx.font = '13px sans-serif';
    ctx.fillStyle = theme.sub;
    ctx.fillText(dateStr + '  ·  ' + article.category, PADDING, y + 22);
    y += metaH;

    // 正文
    ctx.font = bodyFont;
    ctx.fillStyle = theme.sub;
    const maxBodyLines = Math.min(bodyLines.length, 12);
    for (let i = 0; i < maxBodyLines; i++) {
        ctx.fillText(bodyLines[i], PADDING, y);
        y += 28;
    }
    if (bodyLines.length > 12) {
        ctx.fillStyle = theme.accent;
        ctx.fillText('閱讀全文 →', PADDING, y);
        y += 28;
    }
    y += 16;

    // 底部分割线
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, y); ctx.lineTo(W - PADDING, y);
    ctx.stroke();
    y += 20;

    // 水印 / 来源
    if (imgWmChoice === 'yes') {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = theme.sub;
        ctx.fillText('© ' + (article.authorName || '用戶') + ' · Scribe', PADDING, y);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = theme.border;
        const shortUrl = location.href.length > 60 ? location.href.slice(0, 57) + '...' : location.href;
        ctx.fillText(shortUrl, PADDING, y + 18);
    } else {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = theme.sub;
        ctx.fillText('Scribe · 全球華人寫作平台', PADDING, y);
    }

    // 下载
    const link = document.createElement('a');
    link.download = 'scribe-' + article.id + '-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('圖片已下載 ✓');
}

// 文字换行辅助
function wrapText(ctx, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split('\n');
    paragraphs.forEach(para => {
        if (!para.trim()) { lines.push(''); return; }
        let line = '';
        for (let i = 0; i < para.length; i++) {
            const testLine = line + para[i];
            if (ctx.measureText(testLine).width > maxWidth && line) {
                lines.push(line); line = para[i];
            } else { line = testLine; }
        }
        if (line) lines.push(line);
    });
    return lines;
}

/* ── PDF ── */
let wmChoice = 'yes';
function openPdfDialog() { document.getElementById('pdfDialog').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closePdfDialog() { document.getElementById('pdfDialog').classList.remove('open'); document.body.style.overflow = ''; }
function closePdfOnOverlay(e) { if (e.target.id === 'pdfDialog') closePdfDialog(); }
function selectWm(choice) {
    wmChoice = choice;
    document.getElementById('wmOpt1').classList.toggle('selected', choice === 'yes');
    document.getElementById('wmOpt2').classList.toggle('selected', choice === 'no');
    document.getElementById('wmYes').checked = choice === 'yes';
    document.getElementById('wmNo').checked = choice === 'no';
    document.getElementById('wmPreview').style.display = choice === 'yes' ? 'block' : 'none';
}
function downloadPDF() {
    if (!article) return; closePdfDialog();
    window.location.href = 'http://localhost:8080/api/articles/' + article.id + '/pdf?watermark=' + (wmChoice === 'yes' ? 'true' : 'false');
    showToast('PDF 下載中…');
}

/* ── 删除 ── */
function openDeleteDialog() { document.getElementById('deleteDialog').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeDeleteDialog() { document.getElementById('deleteDialog').classList.remove('open'); document.body.style.overflow = ''; }
function closeDeleteOnOverlay(e) { if (e.target.id === 'deleteDialog') closeDeleteDialog(); }
function confirmDelete() {
    fetch('http://localhost:8080/api/articles/' + article.id, { method: 'DELETE' })
        .then(() => { closeDeleteDialog(); showToast('文章已刪除，即將返回首頁…'); setTimeout(() => { window.location.href = 'index.html'; }, 2000); })
        .catch(() => showToast('刪除失敗，請重試'));
}

/* ── Toast ── */
function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
