
let publishMode = 'normal'; // 'normal' | 'anon'

function setMode(mode) {
    publishMode = mode;
    document.getElementById('modeNormal').classList.toggle('active', mode === 'normal');
    document.getElementById('modeAnon').classList.toggle('active', mode === 'anon');

    // 树洞模式隐藏分类选择
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
(function() {
    const d = JSON.parse(localStorage.getItem('wh_draft') || 'null');
    if (!d || (!d.title && !d.bodyHTML && !d.body)) return;
    const banner = document.getElementById('draftBanner');
    if (banner) banner.style.display = 'flex';
})();

function loadDraftConfirm() {
    const d = JSON.parse(localStorage.getItem('wh_draft') || 'null');
    if (!d) return;
    if (d.title) { const t = document.getElementById('titleInput'); t.value = d.title; autoResize(t); }
    if (d.bodyHTML) document.getElementById('bodyEditor').innerHTML = d.bodyHTML;
    else if (d.body) document.getElementById('bodyEditor').innerText = d.body;
    if (d.cat) { selectedCat = d.cat; document.querySelectorAll('.cat-btn').forEach(b => { if (b.textContent.trim().replace('🔥 ','')===d.cat||b.textContent.trim()===d.cat) b.classList.add('selected'); }); }
    if (d.tags && d.tags.length) { tags = d.tags; renderTags(); }
    updateWordCount();
    document.getElementById('draftBanner').style.display = 'none';
    document.getElementById('draftDot').classList.add('saved');
    document.getElementById('statusText').textContent = '已載入草稿';
}

function discardDraft() {
    localStorage.removeItem('wh_draft');
    document.getElementById('draftBanner').style.display = 'none';
    document.getElementById('statusText').textContent = '尚未儲存';
}
    /* ── + 按钮逻辑 ── */
    let plusBtnTop = 0;
    let inlineToolsOpen = false;

    function updatePlusBtn() {
    const editor = document.getElementById('bodyEditor');
    const plusBtn = document.getElementById('plusBtn');
    const tools = document.getElementById('inlineTools');
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) { plusBtn.classList.remove('visible'); return; }

    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    if (node.nodeType === 3) node = node.parentNode;

    // 找到光标所在的块级元素
    let block = node;
    while (block && block !== editor && !['P','DIV','H1','H2','BLOCKQUOTE','LI'].includes(block.tagName)) {
    block = block.parentNode;
}
    if (!block || block === editor) { plusBtn.classList.remove('visible'); return; }

    const text = block.innerText || block.textContent || '';
    if (text.trim() !== '') { plusBtn.classList.remove('visible'); closeInlineTools(); return; }

    const rect = block.getBoundingClientRect();
    const editorRect = editor.closest('.editor-wrap').getBoundingClientRect();
    plusBtnTop = rect.top - editorRect.top + (rect.height - 32) / 2;

    plusBtn.style.top = plusBtnTop + 'px';
    tools.style.top = plusBtnTop + 'px';
    plusBtn.classList.add('visible');
    if (inlineToolsOpen) tools.classList.add('show');
}

    function toggleInlineTools() {
    inlineToolsOpen = !inlineToolsOpen;
    const plusBtn = document.getElementById('plusBtn');
    const tools = document.getElementById('inlineTools');
    plusBtn.classList.toggle('open', inlineToolsOpen);
    tools.classList.toggle('show', inlineToolsOpen);
}

    function closeInlineTools() {
    inlineToolsOpen = false;
    document.getElementById('plusBtn').classList.remove('open');
    document.getElementById('inlineTools').classList.remove('show');
}

    document.getElementById('bodyEditor').addEventListener('keyup', e => {
        setTimeout(updatePlusBtn, 0);
    });
    document.getElementById('bodyEditor').addEventListener('click', updatePlusBtn);

    /* ── 格式工具栏（选中文字时显示）── */
    document.addEventListener('mouseup', () => {
    setTimeout(() => {
        const sel = window.getSelection();
        const tb = document.getElementById('formatToolbar');
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
            tb.classList.remove('show'); return;
        }
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

    /* ── format ── */
    function fmt(cmd, val) {
    document.getElementById('bodyEditor').focus();
    document.execCommand(cmd, false, val || null);
    closeInlineTools();
    updateWordCount(); updateStatus();
}

    function insertHR() {
    document.getElementById('bodyEditor').focus();
    document.execCommand('insertHTML', false, '<hr>');
    closeInlineTools(); updateStatus();
}

    /* ── 自动高度 ── */
    function autoResize(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
    window.addEventListener('load', () => autoResize(document.getElementById('titleInput')));

    /* ── 字数统计 ── */
    function updateWordCount() {
    const text = document.getElementById('bodyEditor').innerText || '';
    document.getElementById('wordCount').textContent = text.replace(/\s/g,'').length + ' 字';
}

    /* ── 状态 ── */
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
    return { title: document.getElementById('titleInput').value, bodyHTML: document.getElementById('bodyEditor').innerHTML, cat: selectedCat, tags, savedAt: new Date().toISOString() };
}
    function saveDraft() { autoSave(); showToast('草稿已儲存 ✓'); }

    /* ── 加载草稿 ── */
    (function() {
    const d = JSON.parse(localStorage.getItem('wh_draft') || 'null');
    if (!d) return;
    if (d.title) { const t = document.getElementById('titleInput'); t.value = d.title; autoResize(t); }
    if (d.bodyHTML) document.getElementById('bodyEditor').innerHTML = d.bodyHTML;
    else if (d.body) document.getElementById('bodyEditor').innerText = d.body;
    if (d.cat) { selectedCat = d.cat; document.querySelectorAll('.cat-btn').forEach(b => { if (b.textContent.trim().replace('🔥 ','')===d.cat||b.textContent.trim()===d.cat) b.classList.add('selected'); }); }
    if (d.tags && d.tags.length) { tags = d.tags; renderTags(); }
    updateWordCount();
    document.getElementById('draftDot').classList.add('saved');
    document.getElementById('statusText').textContent = '已載入草稿';
})();

    /* ── 封面图 ── */
    function handleCover(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { document.getElementById('coverImg').src = ev.target.result; document.getElementById('coverPreview').classList.add('has-image'); };
    reader.readAsDataURL(file);
}
    function removeCover(e) {
    e.stopPropagation();
    document.getElementById('coverImg').src = '';
    document.getElementById('coverPreview').classList.remove('has-image');
    document.getElementById('coverInput').value = '';
}

    /* ── 行内插图 ── */
    let savedRange = null;
    document.getElementById('bodyEditor').addEventListener('blur', () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
});
    function triggerInlineImg() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
    closeInlineTools();
    document.getElementById('inlineImgInput').click();
}
    function insertInlineImage(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
    const editor = document.getElementById('bodyEditor');
    editor.focus();
    if (savedRange) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); }
    document.execCommand('insertHTML', false, `<img src="${ev.target.result}" style="width:100%;margin:24px 0;display:block;border-radius:2px;">`);
    document.getElementById('inlineImgInput').value = '';
    updateStatus();
};
    reader.readAsDataURL(file);
}

    /* ── 图片点击工具条 ── */
    let selectedImg = null;
    document.getElementById('bodyEditor').addEventListener('click', e => {
    if (e.target.tagName === 'IMG') {
    if (selectedImg) selectedImg.classList.remove('selected');
    selectedImg = e.target;
    e.target.classList.add('selected');
    const rect = e.target.getBoundingClientRect();
    const tb = document.getElementById('imgToolbar');
    tb.style.top = (rect.top + window.scrollY - 44) + 'px';
    tb.style.left = rect.left + 'px';
    tb.classList.add('show');
}
});
    document.addEventListener('click', e => {
    if (e.target.tagName !== 'IMG' && !e.target.closest('#imgToolbar')) {
    if (selectedImg) selectedImg.classList.remove('selected');
    selectedImg = null;
    document.getElementById('imgToolbar').classList.remove('show');
}
});
    function setImgSize(w) { if (selectedImg) { selectedImg.style.width = w; updateStatus(); } }
    function removeSelectedImg() {
    if (selectedImg) { selectedImg.remove(); selectedImg = null; document.getElementById('imgToolbar').classList.remove('show'); updateStatus(); }
}

    /* ── 视频插入 ── */
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
    function closeVideoDialog() { document.getElementById('videoOverlay').classList.remove('open'); document.body.style.overflow = ''; }
    function closeVideoOnOverlay(e) { if (e.target.id === 'videoOverlay') closeVideoDialog(); }

    function getEmbedUrl(url) {
    // YouTube
    let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    // YouTube Shorts
    m = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    // Bilibili
    m = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/i);
    if (m) return 'https://player.bilibili.com/player.html?bvid=' + m[1] + '&autoplay=0';
    m = url.match(/bilibili\.com\/video\/av(\d+)/i);
    if (m) return 'https://player.bilibili.com/player.html?aid=' + m[1] + '&autoplay=0';
    // 已经是 embed URL
    if (url.includes('embed') || url.includes('player')) return url;
    return null;
}

    function confirmInsertVideo() {
    const url = document.getElementById('videoInput').value.trim();
    const errEl = document.getElementById('videoError');
    if (!url) { errEl.textContent = '請輸入視頻連結'; return; }
    const embedUrl = getEmbedUrl(url);
    if (!embedUrl) { errEl.textContent = '無法識別此連結，請確認是 YouTube 或 Bilibili 的連結'; return; }

    const editor = document.getElementById('bodyEditor');
    editor.focus();
    if (savedRange) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); }

    const html = `<div class="video-embed"><iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe></div>`;
    document.execCommand('insertHTML', false, html);
    closeVideoDialog();
    updateStatus();
}

    /* ── 分类 ── */
    let selectedCat = '';
    function selectCat(el, cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected'); selectedCat = cat;
}

    /* ── Tags ── */
    let tags = [];
    const tagInput = document.getElementById('tagInput');
    tagInput.addEventListener('keydown', function(e) {
    if (e.key==='Enter') { e.preventDefault(); const v=this.value.trim(); if(v&&tags.length<5&&!tags.includes(v)){tags.push(v);renderTags();this.value='';} }
    if (e.key==='Backspace'&&!this.value&&tags.length) { tags.pop(); renderTags(); }
});
    function renderTags() {
    document.getElementById('tagsWrap').querySelectorAll('.tag-pill').forEach(p=>p.remove());
    tags.forEach((tag,i)=>{ const p=document.createElement('div'); p.className='tag-pill'; p.innerHTML=`<span>${tag}</span><button onclick="removeTag(${i})">×</button>`; document.getElementById('tagsWrap').insertBefore(p,tagInput); });
    tagInput.placeholder = tags.length>=5?'':'輸入標籤後按 Enter';
}
    function removeTag(i) { tags.splice(i,1); renderTags(); }

    /* ── 发布 ── */
function openPublishPanel() {
    // 重置分类选中状态
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
    if (selectedCat) {
        document.querySelectorAll('.cat-btn').forEach(b => {
            if (b.textContent.trim().replace('🔥 ','') === selectedCat) b.classList.add('selected');
        });
    }

    // 初始化笔名下拉
    const user = JSON.parse(sessionStorage.getItem('wh_user') || '{}');

    // 其他原有逻辑
    const title = document.getElementById('titleInput').value.trim();
    const words = (document.getElementById('bodyEditor').innerText||'').replace(/\s/g,'').length;
    document.getElementById('previewTitle').textContent = title||'（請輸入標題）';
    document.getElementById('previewCat').textContent = selectedCat||'未選擇';
    document.getElementById('previewWords').textContent = words;
    document.getElementById('pubError').style.display='none';
    document.getElementById('publishPanel').classList.add('open');
    document.body.style.overflow='hidden';
}
    function closePublishPanel() { document.getElementById('publishPanel').classList.remove('open'); document.body.style.overflow=''; }
    function closeOnOverlay(e) { if(e.target.id==='publishPanel') closePublishPanel(); }

    function confirmPublish() {
    const title = document.getElementById('titleInput').value.trim();
    const bodyHTML = document.getElementById('bodyEditor').innerHTML.trim();
    const bodyText = document.getElementById('bodyEditor').innerText.trim();
    const errEl = document.getElementById('pubError');

    if (!title) { errEl.textContent='請輸入文章標題'; errEl.style.display='block'; return; }
    if (!bodyText || bodyText.length < 10) { errEl.textContent='文章內容至少需要10個字'; errEl.style.display='block'; return; }
    if (!selectedCat) { errEl.textContent='請選擇文章分類'; errEl.style.display='block'; return; }

        const user = JSON.parse(sessionStorage.getItem('wh_user') || '{}');
        const isAnon = publishMode === 'anon';

        const article = {
            title: title,
            content: bodyText,
            bodyHTML: bodyHTML,
            category: isAnon ? '樹洞' : selectedCat,
            tags: tags.join(','),
            authorName: isAnon ? '樹洞' : (document.getElementById('pennameSelect').value || user.name || '用戶'),
            authorEmail: isAnon ? '' : (user.email || '')
        };

    const btn = document.querySelector('.btn-pub-confirm');
    btn.disabled = true;
    btn.textContent = '發佈中…';

    fetch('http://localhost:8080/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
})
    .then(res => res.json())
    .then(data => {
    localStorage.removeItem('wh_draft');
    closePublishPanel();
        showToast('文章已發佈！即將返回首頁…');
        setTimeout(() => { window.location.href = 'index.html?refresh=' + Date.now(); }, 2000);
})
    .catch(err => {
    errEl.textContent = '發佈失敗，請重試';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '確認發佈 →';
});
}

    /* ── Toast ── */
    function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }