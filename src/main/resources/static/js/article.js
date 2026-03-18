/* ============================================================
   article.js — 文章渲染、操作功能 文薈 WenHui
   ============================================================ */

function renderArticles(articles) {
  const container = document.getElementById('article-list');
  if (!articles || articles.length === 0) {
    container.innerHTML = `<div class="loading">${T.no_article[currentLang]}</div>`;
    return;
  }
  container.innerHTML = articles.map((a, i) => {
    const isWarm = a.category === '煙火飄香';
    const cardClass = isWarm ? 'yanhu-card' : 'article-card';
    const badge = i === 0
      ? (isWarm ? '<div class="warm-badge">🔥 煙火飄香</div>' : '<div class="featured-badge">精選推薦</div>')
      : (isWarm ? '<div class="warm-badge">🔥 煙火飄香</div>' : '');
    const avatarClass = isWarm ? 'author-avatar warm-av' : 'author-avatar';
    const titleClass = isWarm ? 'article-title warm-title' : 'article-title';
    const tagClass = isWarm ? 'tag-warm' : 'tag';
    const tipClass = isWarm ? 'btn-tip warm-tip' : 'btn-tip';

    return `
      <div class="${cardClass}">
        ${badge}
        <div class="article-meta">
          <div class="${avatarClass}">${a.authorName ? a.authorName.charAt(0) : '匿'}</div>
          <span class="author-name">${a.authorName || '匿名'}（${a.authorLocation || '海外'}）</span>
          <span class="article-date">${a.createdDate || ''}</span>
        </div>
        <div class="${titleClass}" onclick="viewArticle(${a.id})">${a.title}</div>
        <div class="article-excerpt">${a.content ? a.content.substring(0, 120) + '……' : ''}</div>
        <div class="article-footer">
          <span class="${tagClass}">${a.category || '未分類'}</span>
          <div class="article-views">
            <span>👁 ${a.views || 0}</span>
            <span>💬 ${a.comments || 0}</span>
          </div>
          <div class="article-actions">
            <button class="btn-pdf" onclick="downloadPdf(${a.id},'${a.title}')">⬇ PDF</button>
            <button class="${tipClass}" onclick="tipAuthor(${a.id})">❤ 打賞</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderHotList(articles) {
  const container = document.getElementById('hot-list');
  if (!articles || articles.length === 0) {
    container.innerHTML = `<div class="loading">${T.no_data[currentLang]}</div>`;
    return;
  }

  container.innerHTML = articles.slice(0, 5).map((a, i) => {
    const isWarm = a.category === '煙火飄香';
    const titleStyle = isWarm ? 'style="color:var(--warm2);"' : '';
    const prefix = isWarm ? '🔥 ' : '';
    return `
      <div class="hot-item" onclick="viewArticle(${a.id})">
        <div class="hot-num ${i < 2 ? 'top' : ''}">0${i + 1}</div>
        <div class="hot-title" ${titleStyle}>${prefix}${a.title}</div>
      </div>`;
  }).join('');
}

function renderYanhuRecent(articles) {
  const container = document.getElementById('yanhu-recent');
  if (!container) return;
  const warmArticles = articles.filter(a => a.category === '煙火飄香').slice(0, 4);
  if (warmArticles.length === 0) {
    container.innerHTML = '<div class="loading">暫無內容</div>';
    return;
  }
  container.innerHTML = warmArticles.map(a => `
    <div class="yanhu-recent-item" onclick="viewArticle(${a.id})">
      ${a.title}
    </div>`).join('');
}

function viewArticle(id) {
  API.addView(id);
  alert('文章詳情頁開發中，敬請期待！');
}

function downloadPdf(id, title) {
  alert(`PDF下載功能開發中：《${title}》`);
}

async function tipAuthor(id) {
  await API.addLike(id);
  alert('感謝您的打賞！❤');
}

function switchTab(el, type) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  loadArticles(type);
}

async function filterCategory(category) {
  try {
    const articles = await API.getByCategory(category);
    renderArticles(articles);
  } catch(e) {
    console.error(e);
  }
}

function showWrite() {
  document.getElementById('write-modal').style.display = 'flex';
}

function hideWrite() {
  document.getElementById('write-modal').style.display = 'none';
}

async function submitArticle() {
  const data = {
    title:          document.getElementById('w-title').value,
    category:       document.getElementById('w-category').value,
    authorName:     document.getElementById('w-author').value,
    authorLocation: document.getElementById('w-location').value,
    content:        document.getElementById('w-content').value,
    createdDate:    new Date().toLocaleDateString('zh-TW'),
    views: 0, likes: 0, comments: 0
  };
  if (!data.title || !data.content) {
    alert('請填寫標題和內容！');
    return;
  }
  await API.createArticle(data);
  hideWrite();
  alert('文章發表成功！');
  loadArticles('latest');
}

function showLogin() { alert('登入功能開發中！'); }
function showAuthors() { alert('作家專欄開發中！'); }
function toggleLang() { alert('多語言切換開發中！'); }
