let publishMode = 'normal';

function setMode(mode) {
    publishMode = mode;
    document.getElementById('modeNormal').classList.toggle('active', mode === 'normal');
    document.getElementById('modeAnon').classList.toggle('active', mode === 'anon');
    const catField = document.querySelector('.category-grid').closest('.pub-field');
    if (mode === 'anon') {
        catField.style.opacity = '0.4';
        catField.style.pointerEvents = 'none';
        selectedCat = '樹洞';
    } else {
        catField.style.opacity = '1';
        catField.style.pointerEvents = 'auto';
        selectedCat = '';
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
    }
}

/* ── 草稿 ── */
(function() {
    const editId = new URLSearchParams(location.search).get('editId');
    if (editId) return;
    const d = JSON.parse(localStorage.getItem('wh_draft') || 'null');
    if (!d) return;
    const hasContent = (d.title && d.title.trim()) ||
        (d.bodyHTML && d.bodyHTML.replace(/<[^>]*>/g,'').trim());
    if (!hasContent) return;
    const banner = document.getElementById('draftBanner');
    if (banner) banner.style.display = 'flex';
})();

function loadDraftConfirm() {
    const d = JSON.parse(localStorage.getItem('wh_draft') || 'null');
    if (!d) return;
    if (d.title) { const t = document.getElementById('titleInput'); t.value = d.title; autoResize(t); }
    if (d.bodyHTML) {
        const cleaned = d.bodyHTML.replace(/<div><br><\/div>/g, '').trim();
        if (cleaned) document.getElementById('bodyEditor').innerHTML = cleaned;
    } else if (d.body) {
        document.getElementById('bodyEditor').innerText = d.body;
    }
    if (d.cat) {
        selectedCat = d.cat;
        document.querySelectorAll('.cat-btn').forEach(b => {
            if (b.textContent.trim().replace('🔥 ','') === d.cat) b.classList.add('selected');
        });
    }
    if (d.tags && d.tags.length) { tags = d.tags; renderTags(); }
    // 從樹洞進入自動切換匿名模式
    if (new URLSearchParams(location.search).get('mode') === 'anon') {
        setMode('anon');
    }

    updateWordCount();
    const banner = document.getElementById('draftBanner');
    if (banner) banner.style.display = 'none';
    document.getElementById('draftDot').classList.add('saved');
    document.getElementById('statusText').textContent = '已載入草稿';
}

function discardDraft() {
    localStorage.removeItem('wh_draft');
    const banner = document.getElementById('draftBanner');
    if (banner) banner.style.display = 'none';
    document.getElementById('statusText').textContent = '尚未儲存';
}

/* ================================================================
   + 按钮逻辑
================================================================ */
let inlineToolsOpen = false;

function toggleInlineTools() {
    inlineToolsOpen = !inlineToolsOpen;
    document.getElementById('plusBtn').classList.toggle('open', inlineToolsOpen);
    document.getElementById('inlineTools').classList.toggle('show', inlineToolsOpen);
    document.querySelector('.plus-icon').style.display = inlineToolsOpen ? 'none' : 'inline';
    document.querySelector('.close-icon').style.display = inlineToolsOpen ? 'inline' : 'none';
}

function closeInlineTools() {
    inlineToolsOpen = false;
    const plusBtn = document.getElementById('plusBtn');
    plusBtn.classList.remove('open');
    document.getElementById('inlineTools').classList.remove('show');
    const plusIcon = plusBtn.querySelector('.plus-icon');
    const closeIcon = plusBtn.querySelector('.close-icon');
    if (plusIcon) plusIcon.style.display = 'inline';
    if (closeIcon) closeIcon.style.display = 'none';
}

function updatePlusBtnPosition(e) {
    if (e && (e.target.closest('#plusBtn') || e.target.closest('#inlineTools'))) return;
    const editor = document.getElementById('bodyEditor');
    const plusBtn = document.getElementById('plusBtn');
    const tools = document.getElementById('inlineTools');
    const wrap = document.getElementById('editorWrap');
    const wrapRect = wrap.getBoundingClientRect();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !editor.contains(sel.anchorNode)) return;
    let node = sel.anchorNode;
    if (node.nodeType === 3) node = node.parentNode;
    let block = node;
    while (block && block !== editor) {
        if (['P','DIV','H1','H2','BLOCKQUOTE','LI'].includes(block.tagName)) break;
        block = block.parentNode;
    }
    let top;
    if (block && block !== editor) {
        const rect = block.getBoundingClientRect();
        top = rect.top - wrapRect.top + (rect.height - 32) / 2;
    } else {
        top = 4;
    }
    plusBtn.style.top = Math.max(0, top) + 'px';
    tools.style.top = Math.max(0, top) + 'px';
    plusBtn.classList.add('visible');
}

document.getElementById('bodyEditor').addEventListener('click', updatePlusBtnPosition);
document.getElementById('bodyEditor').addEventListener('keyup', updatePlusBtnPosition);

document.addEventListener('click', e => {
    if (!e.target.closest('#plusBtn') && !e.target.closest('#inlineTools') && !e.target.closest('#bodyEditor')) {
        closeInlineTools();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const plusBtn = document.getElementById('plusBtn');
    plusBtn.classList.remove('open');
    plusBtn.classList.add('visible');
    plusBtn.style.top = '4px';
    document.getElementById('inlineTools').style.top = '4px';
    document.getElementById('inlineTools').classList.remove('show');
    document.querySelector('.plus-icon').style.display = 'inline';
    document.querySelector('.close-icon').style.display = 'none';
});

/* ── 格式工具栏 ── */
document.addEventListener('mouseup', () => {
    setTimeout(() => {
        const sel = window.getSelection();
        const tb = document.getElementById('formatToolbar');
        if (!sel || sel.isCollapsed || !sel.toString().trim()) { tb.classList.remove('show'); return; }
        const editor = document.getElementById('bodyEditor');
        if (!editor.contains(sel.anchorNode)) { tb.classList.remove('show'); return; }
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        tb.style.top = (rect.top + window.scrollY - 46) + 'px';
        tb.style.left = (rect.left + rect.width / 2) + 'px';
        tb.classList.add('show');
    }, 10);
});
document.addEventListener('mousedown', e => {
    if (!e.target.closest('#formatToolbar')) {
        document.getElementById('formatToolbar').classList.remove('show');
    }
});

function fmt(cmd, val) {
    document.getElementById('bodyEditor').focus();
    document.execCommand(cmd, false, val || null);
    closeInlineTools();
    updateWordCount();
    updateStatus();
}

function insertHR() {
    document.getElementById('bodyEditor').focus();
    document.execCommand('insertHTML', false, '<hr>');
    closeInlineTools();
    updateStatus();
}

/* ── 自动高度 ── */
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

/* ── 字数统计 ── */
function updateWordCount() {
    const editor = document.getElementById('bodyEditor');
    const text = editor.innerText || '';
    document.getElementById('wordCount').textContent = text.replace(/\s/g, '').length + ' 字';
    if (text.trim() === '') {
        editor.classList.add('empty');
    } else {
        editor.classList.remove('empty');
    }
}

/* ── 状态与自动保存 ── */
let saveTimer = null;
function updateStatus() {
    document.getElementById('draftDot').classList.remove('saved');
    document.getElementById('statusText').textContent = '尚未儲存';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autoSave, 2000);
}
function autoSave() {
    localStorage.setItem('wh_draft', JSON.stringify(getDraftData()));
    document.getElementById('draftDot').classList.add('saved');
    document.getElementById('statusText').textContent = '已自動儲存';
}
function getDraftData() {
    return {
        title: document.getElementById('titleInput').value,
        bodyHTML: document.getElementById('bodyEditor').innerHTML,
        cat: selectedCat,
        tags,
        savedAt: new Date().toISOString()
    };
}
function saveDraft() { autoSave(); showToast('草稿已儲存 ✓'); }

/* ================================================================
   MutationObserver（防扩展注入空div）
================================================================ */
let editorObserver = null;

function startObserver(editor) {
    editorObserver = new MutationObserver(() => {
        const text = editor.innerText.replace(/\s/g, '');
        if (text === '') {
            if (editor.innerHTML !== '') {
                editorObserver.disconnect();
                editor.innerHTML = '';
                editorObserver.observe(editor, { childList: true, subtree: true });
            }
        }
    });
    editorObserver.observe(editor, { childList: true, subtree: true });
}

function pauseObserver() {
    if (editorObserver) editorObserver.disconnect();
}

function resumeObserver(editor) {
    if (editorObserver) editorObserver.observe(editor, { childList: true, subtree: true });
}

/* ── 页面加载 ── */
window.addEventListener('load', () => {
    autoResize(document.getElementById('titleInput'));
    const editor = document.getElementById('bodyEditor');
    const editId = new URLSearchParams(location.search).get('editId');

    if (editId) {
        window.__editId = editId;
        document.getElementById('statusText').textContent = '載入中…';
        fetch('http://localhost:8080/api/articles/' + editId)
            .then(res => res.json())
            .then(data => {
                document.getElementById('titleInput').value = data.title || '';
                autoResize(document.getElementById('titleInput'));
                if (data.bodyHTML) {
                    editor.innerHTML = data.bodyHTML;
                } else if (data.content) {
                    editor.innerText = data.content;
                }
                selectedCat = data.category || '';
                document.querySelectorAll('.cat-btn').forEach(b => {
                    if (b.textContent.trim().replace('🔥 ','') === selectedCat) b.classList.add('selected');
                });
                if (data.tags) {
                    tags = data.tags.split(',').filter(t => t.trim());
                    renderTags();
                }


                updateWordCount();
                document.getElementById('statusText').textContent = '編輯模式';
                startObserver(editor);
            })
            .catch(() => showToast('載入文章失敗'));
    } else {
        editor.innerHTML = '';
        startObserver(editor);
    }

    editor.addEventListener('keydown', e => {
        const ignoredKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift','Control','Alt','Meta','Tab'];
        if (!ignoredKeys.includes(e.key)) closeInlineTools();
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
        if (e.key === 'Enter') {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            let node = sel.anchorNode;
            if (node.nodeType === 3) node = node.parentNode;
            const bq = node.closest && node.closest('blockquote');
            if (!bq) return;
            const lineText = (node.textContent || '').trim();
            if (lineText === '') {
                e.preventDefault();
                const emptyLine = node.nodeType === 3 ? node.parentNode : node;
                emptyLine.remove();
                document.execCommand('insertHTML', false, '</blockquote><p><br></p>');
            }
        }
    });

    updateWordCount();
});

/* ================================================================
   行内插图
================================================================ */
let savedRange = null;

document.getElementById('bodyEditor').addEventListener('blur', () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
});

function triggerInlineImg() {
    pauseObserver();
    const editor = document.getElementById('bodyEditor');
    editor.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
    closeInlineTools();
    setTimeout(() => document.getElementById('inlineImgInput').click(), 100);
}

function insertInlineImage(e) {
    const file = e.target.files[0];
    const editor = document.getElementById('bodyEditor');
    if (!file) { resumeObserver(editor); return; }
    const reader = new FileReader();
    reader.onload = ev => {
        editor.focus();
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        } else {
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        document.execCommand('insertHTML', false,
            `<img src="${ev.target.result}" style="width:100%;margin:24px 0;display:block;border-radius:2px;"><p><br></p>`
        );
        document.getElementById('inlineImgInput').value = '';
        updateStatus();
        resumeObserver(editor);
    };
    reader.readAsDataURL(file);
}

/* ================================================================
   图片点击工具条
================================================================ */
let selectedImg = null;

document.addEventListener('click', e => {
    const tb = document.getElementById('imgToolbar');
    if (e.target.tagName === 'IMG' && document.getElementById('bodyEditor').contains(e.target)) {
        if (selectedImg && selectedImg !== e.target) selectedImg.classList.remove('selected');
        selectedImg = e.target;
        selectedImg.classList.add('selected');
        const rect = selectedImg.getBoundingClientRect();
        tb.style.top = (rect.top - 44) + 'px';
        tb.style.left = rect.left + 'px';
        tb.classList.add('show');
        return;
    }
    if (e.target.closest('#imgToolbar')) return;
    if (selectedImg) { selectedImg.classList.remove('selected'); selectedImg = null; }
    tb.classList.remove('show');
});

function setImgSize(w) {
    if (selectedImg) { selectedImg.style.width = w; updateStatus(); }
}
function removeSelectedImg() {
    if (selectedImg) {
        selectedImg.remove();
        selectedImg = null;
        document.getElementById('imgToolbar').classList.remove('show');
        updateStatus();
    }
}

/* ================================================================
   视频插入
================================================================ */
function openVideoDialog() {
    closeInlineTools();
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
    document.getElementById('videoInput').value = '';
    document.getElementById('videoError').textContent = '';
    document.getElementById('videoOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('videoInput').focus(), 100);
}
function closeVideoDialog() {
    document.getElementById('videoOverlay').classList.remove('open');
    document.body.style.overflow = '';
}
function closeVideoOnOverlay(e) {
    if (e.target.id === 'videoOverlay') closeVideoDialog();
}

function getEmbedUrl(url) {
    let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/i);
    if (m) return 'https://player.bilibili.com/player.html?bvid=' + m[1] + '&autoplay=0';
    m = url.match(/bilibili\.com\/video\/av(\d+)/i);
    if (m) return 'https://player.bilibili.com/player.html?aid=' + m[1] + '&autoplay=0';
    if (url.includes('embed') || url.includes('player')) return url;
    return null;
}

function confirmInsertVideo() {
    const url = document.getElementById('videoInput').value.trim();
    const errEl = document.getElementById('videoError');
    if (!url) { errEl.textContent = '請輸入視頻連結'; return; }
    const embedUrl = getEmbedUrl(url);
    if (!embedUrl) { errEl.textContent = '無法識別此連結'; return; }
    const editor = document.getElementById('bodyEditor');
    pauseObserver();
    editor.focus();
    if (savedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
    }
    document.execCommand('insertHTML', false,
        `<div class="video-embed"><iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe></div><p><br></p>`
    );
    closeVideoDialog();
    updateStatus();
    resumeObserver(editor);
}

/* ── 分类 ── */
let selectedCat = '';
function selectCat(el, cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    selectedCat = cat;
}

/* ── Tags ── */
let tags = [];
const tagInput = document.getElementById('tagInput');
tagInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const v = this.value.trim();
        if (v && tags.length < 5 && !tags.includes(v)) { tags.push(v); renderTags(); this.value = ''; }
    }
    if (e.key === 'Backspace' && !this.value && tags.length) { tags.pop(); renderTags(); }
});
function renderTags() {
    document.getElementById('tagsWrap').querySelectorAll('.tag-pill').forEach(p => p.remove());
    tags.forEach((tag, i) => {
        const p = document.createElement('div');
        p.className = 'tag-pill';
        p.innerHTML = `<span>${tag}</span><button onclick="removeTag(${i})">×</button>`;
        document.getElementById('tagsWrap').insertBefore(p, tagInput);
    });
    tagInput.placeholder = tags.length >= 5 ? '' : '輸入標籤後按 Enter';
}
function removeTag(i) { tags.splice(i, 1); renderTags(); }

/* ── 发布 ── */
function openPublishPanel() {
    const isAnonMode = new URLSearchParams(location.search).get('mode') === 'anon';
    if (isAnonMode) {
        setMode('anon');
    } else {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        if (selectedCat) {
            document.querySelectorAll('.cat-btn').forEach(b => {
                if (b.textContent.trim().replace('🔥 ', '') === selectedCat) b.classList.add('selected');
            });
        }
    }

    const user = JSON.parse(sessionStorage.getItem('wh_user') || localStorage.getItem('wh_user') || '{}');
    const pennames = JSON.parse(localStorage.getItem('wh_pennames_' + user.email) || '[]');
    const select = document.getElementById('pennameSelect');
    if (select) {
        select.innerHTML = `<option value="${user.name || '用戶'}">${user.name || '用戶'}（預設暱稱）</option>`;
        pennames.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = p.name;
            select.appendChild(opt);
        });
    }
    const title = document.getElementById('titleInput').value.trim();
    const words = (document.getElementById('bodyEditor').innerText || '').replace(/\s/g, '').length;
    document.getElementById('previewTitle').textContent = title || '（請輸入標題）';
    document.getElementById('previewCat').textContent = selectedCat || '未選擇';
    document.getElementById('previewWords').textContent = words;
    document.getElementById('pubError').style.display = 'none';
    document.getElementById('publishPanel').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closePublishPanel() {
    document.getElementById('publishPanel').classList.remove('open');
    document.body.style.overflow = '';
}
function closeOnOverlay(e) {
    if (e.target.id === 'publishPanel') closePublishPanel();
}

function confirmPublish() {
    const title = document.getElementById('titleInput').value.trim();
    const bodyText = document.getElementById('bodyEditor').innerText.trim();
    const errEl = document.getElementById('pubError');

    if (!title) { errEl.textContent = '請輸入文章標題'; errEl.style.display = 'block'; return; }
    if (!bodyText || bodyText.length < 10) { errEl.textContent = '文章內容至少需要10個字'; errEl.style.display = 'block'; return; }
    if (!selectedCat) { errEl.textContent = '請選擇文章分類'; errEl.style.display = 'block'; return; }

    const user = JSON.parse(sessionStorage.getItem('wh_user') || localStorage.getItem('wh_user') || '{}');
    const isAnon = publishMode === 'anon';
    const pennameEl = document.getElementById('pennameSelect');

    // 提取第一张图作为封面，并从正文中移除避免重复显示
    const firstImg = document.getElementById('bodyEditor').querySelector('img');
    const coverImage = firstImg ? firstImg.src : '';

    const bodyHTML = document.getElementById('bodyEditor').innerHTML.trim();

    const article = {
        title,
        content: bodyText,
        bodyHTML,
        category: isAnon ? '樹洞' : selectedCat,
        tags: tags.join(','),
        authorName: isAnon ? '樹洞' : (pennameEl ? pennameEl.value : (user.name || '用戶')),
        authorEmail: isAnon ? '' : (user.email || ''),
        coverImage
    };

    const btn = document.querySelector('.btn-pub-confirm');
    btn.disabled = true;
    btn.textContent = '發佈中…';

    const editId = window.__editId;
    fetch('http://localhost:8080/api/articles' + (editId ? '/' + editId : ''), {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
    })
        .then(res => res.json())
        .then(() => {
            localStorage.removeItem('wh_draft');
            closePublishPanel();
            showToast('文章已儲存！即將返回…');
            setTimeout(() => {
                if (editId) {
                    window.location.href = 'article.html?id=' + editId;
                } else {
                    window.location.href = 'index.html?refresh=' + Date.now();
                }
            }, 2000);
        })
        .catch(() => {
            errEl.textContent = '發佈失敗，請重試';
            errEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = '確認發佈 →';
        });
}

/* ── Toast ── */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}