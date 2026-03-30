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
    })
    .catch(() => {
        document.getElementById('artContainer').style.display = 'none';
        document.getElementById('notFound').classList.add('show');
    });

/* ── 渲染文章 ── */
function renderArticle() {
    document.title = article.title + ' · Scribe';

    /* 封面 */
    if (article.coverImage) {
        const img = document.getElementById('artCover');
        img.src = article.coverImage;
        img.classList.add('show');
    }

    /* 分类 */
    const catEl = document.getElementById('artCat');
    catEl.textContent = article.category;
    if (article.category === '煙火飄香') catEl.classList.add('fire');

    /* 标签 */
    const tagsEl = document.getElementById('artTags');
    if (article.tags) {
        article.tags.split(',').forEach(t => {
            if (!t.trim()) return;
            const span = document.createElement('span');
            span.className = 'art-tag';
            span.textContent = '#' + t.trim();
            tagsEl.appendChild(span);
        });
    }

    /* 标题 */
    document.getElementById('artTitle').textContent = article.title;

    /* 作者 */
    const initial = (article.authorName || '文')[0].toUpperCase();
    document.getElementById('artAuthorAvatar').textContent = initial;
    document.getElementById('artAuthorName').textContent = article.authorName;

    /* 日期 */
    const date = new Date(article.createdDate);
    document.getElementById('artDate').textContent =
        date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日';

    /* 阅读时间 */
    const words = (article.content || '').replace(/\s/g,'').length;
    const mins = Math.max(1, Math.round(words / 300));
    document.getElementById('artReadTime').textContent = '約 ' + mins + ' 分鐘閱讀';

    /* 正文 */
    const bodyEl = document.getElementById('artBody');
    if (article.bodyHTML) {
        bodyEl.innerHTML = article.bodyHTML;
    } else {
        bodyEl.textContent = article.content;
    }

    /* 点赞 */
    document.getElementById('likeCount').textContent = article.likes || 0;
    const likedKey = 'liked_' + article.id;
    if (localStorage.getItem(likedKey)) {
        document.getElementById('likeBtn').classList.add('liked');
    }

    /* 版权 */
    const url = location.href;
    document.getElementById('artCopyright').innerHTML =
        '© ' + article.authorName + ' · Scribe<br>' +
        '<span style="font-size:11px;word-break:break-all;">' + url + '</span>';

    /* 水印预览 */
    document.getElementById('wmPreviewText').textContent =
        '© ' + article.authorName + ' · ' + url;

    /* 作者工具栏 */
    if (isAuthor) {
        document.getElementById('authorToolbar').classList.add('show');
    }

    /* 禁止读者复制 */
    if (!isAuthor) {
        document.body.classList.add('no-copy');
    }

    /* 增加浏览数 */
    fetch('http://localhost:8080/api/articles/' + article.id + '/view', { method: 'POST' });
}

/* ── 点赞 ── */
function toggleLike() {
    if (!article) return;
    const key = 'liked_' + article.id;
    const btn = document.getElementById('likeBtn');

    if (localStorage.getItem(key)) {
        // 取消点赞（前端只处理，后端暂不支持取消）
        article.likes = Math.max(0, (article.likes || 0) - 1);
        localStorage.removeItem(key);
        btn.classList.remove('liked');
        document.getElementById('likeCount').textContent = article.likes;
    } else {
        fetch('http://localhost:8080/api/articles/' + article.id + '/like', { method: 'POST' })
            .then(res => res.json())
            .then(updated => {
                article.likes = updated.likes;
                localStorage.setItem(key, '1');
                btn.classList.add('liked');
                document.getElementById('likeCount').textContent = article.likes;
            });
    }
}

/* ── 复制文章（仅作者）── */
function copyArticle() {
    if (!isAuthor) return;
    const text = article.title + '\n\n' + article.content;
    navigator.clipboard.writeText(text).then(() => {
        showToast('文章內容已複製到剪貼板 ✓');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('文章內容已複製到剪貼板 ✓');
    });
}

/* ── 读者复制拦截 ── */
document.addEventListener('copy', function(e) {
    if (!isAuthor) { e.preventDefault(); showCopyBlock(); }
});
document.addEventListener('contextmenu', function(e) {
    if (!isAuthor) { e.preventDefault(); showCopyBlock(); }
});
function showCopyBlock() {
    const t = document.getElementById('copyBlockToast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── PDF 下载 ── */
let wmChoice = 'yes';

function openPdfDialog() {
    document.getElementById('pdfDialog').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closePdfDialog() {
    document.getElementById('pdfDialog').classList.remove('open');
    document.body.style.overflow = '';
}
function closePdfOnOverlay(e) {
    if (e.target.id === 'pdfDialog') closePdfDialog();
}
function selectWm(choice) {
    wmChoice = choice;
    document.getElementById('wmOpt1').classList.toggle('selected', choice === 'yes');
    document.getElementById('wmOpt2').classList.toggle('selected', choice === 'no');
    document.getElementById('wmYes').checked = choice === 'yes';
    document.getElementById('wmNo').checked  = choice === 'no';
    document.getElementById('wmPreview').style.display = choice === 'yes' ? 'block' : 'none';
}

function downloadPDF() {
    if (!article) return;
    closePdfDialog();
    const url = 'http://localhost:8080/api/articles/' + article.id + '/pdf';
    window.location.href = url;
    showToast('PDF 下載中…');
}



/* ── 删除文章 ── */
function openDeleteDialog() {
    document.getElementById('deleteDialog').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeDeleteDialog() {
    document.getElementById('deleteDialog').classList.remove('open');
    document.body.style.overflow = '';
}
function closeDeleteOnOverlay(e) {
    if (e.target.id === 'deleteDialog') closeDeleteDialog();
}
function confirmDelete() {
    fetch('http://localhost:8080/api/articles/' + article.id, { method: 'DELETE' })
        .then(() => {
            closeDeleteDialog();
            showToast('文章已刪除，即將返回首頁…');
            setTimeout(() => { window.location.href = 'wenhui.html'; }, 2000);
        })
        .catch(() => showToast('刪除失敗，請重試'));
}

/* ── Toast ── */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}