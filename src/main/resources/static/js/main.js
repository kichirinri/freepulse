/* ============================================================
   main.js — 頁面初始化 文薈 WenHui
   ============================================================ */
/* ============================================================
   多語言翻譯系統
   ============================================================ */

const LANGS = ['zh-Hant', 'zh-Hans', 'en', 'ja', 'ko', 'fr', 'de'];

const LANG_LABELS = {
  'zh-Hant': '繁體',
  'zh-Hans': '简体',
  'en':      'EN',
  'ja':      '日本語',
  'ko':      '한국어',
  'fr':      'FR',
  'de':      'DE'
};

let currentLang = 'zh-Hant';

const T = {

  logo_main: {
    'zh-Hant': '文<span>薈</span>',
    'zh-Hans': '文<span>荟</span>',
    'en': 'Wen<span>Hui</span>',
    'ja': '文<span>薈</span>',
    'ko': '문<span>예</span>'
  },

  logo_en: {
    'zh-Hant': 'WenHui',
    'zh-Hans': 'WenHui',
    'en': 'WenHui Platform',
    'ja': 'ウェンフェイ',
    'ko': '웬후이'
  },

  // LOGO
  logo_slogan:  { 'zh-Hant':'文武薈萃 · 人文匯聚', 'zh-Hans':'文武荟萃 · 人文汇聚', 'en':'Where Culture Meets', 'ja':'文武薈萃', 'ko':'문무회취', 'fr':'Culture & Pensée', 'de':'Kultur & Denken' },

// 关于栏底部
  about_server: { 'zh-Hant':'🌐 服務器：美國 · 德國', 'zh-Hans':'🌐 服务器：美国 · 德国', 'en':'🌐 Servers: US · Germany', 'ja':'🌐 サーバー：米国・独国', 'ko':'🌐 서버: 미국·독일', 'fr':'🌐 Serveurs: USA · Allemagne', 'de':'🌐 Server: USA · Deutschland' },
  about_free:   { 'zh-Hant':'🔒 言論自由，不受管控', 'zh-Hans':'🔒 言论自由，不受管控', 'en':'🔒 Free speech, uncensored', 'ja':'🔒 言論の自由', 'ko':'🔒 언론의 자유', 'fr':'🔒 Liberté d\'expression', 'de':'🔒 Redefreiheit' },
  about_ban:    { 'zh-Hant':'🚫 人身攻擊IP永久封禁', 'zh-Hans':'🚫 人身攻击IP永久封禁', 'en':'🚫 Personal attacks permanently banned', 'ja':'🚫 人身攻撃IP永久BAN', 'ko':'🚫 인신공격 IP 영구차단', 'fr':'🚫 Attaques personnelles bannies', 'de':'🚫 Persönliche Angriffe verboten' },

// 暫無內容
  no_content:   { 'zh-Hant':'暫無內容', 'zh-Hans':'暂无内容', 'en':'No content yet', 'ja':'コンテンツなし', 'ko':'내용 없음', 'fr':'Pas de contenu', 'de':'Kein Inhalt' },

// 标签
  tag_shishi:   { 'zh-Hant':'# 時事', 'zh-Hans':'# 时事', 'en':'# Affairs', 'ja':'# 時事', 'ko':'# 시사', 'fr':'# Actu', 'de':'# Aktuell' },
  tag_zhexue:   { 'zh-Hant':'# 哲學', 'zh-Hans':'# 哲学', 'en':'# Philosophy', 'ja':'# 哲学', 'ko':'# 철학', 'fr':'# Philo', 'de':'# Philosophie' },
  tag_lishi:    { 'zh-Hant':'# 歷史', 'zh-Hans':'# 历史', 'en':'# History', 'ja':'# 歴史', 'ko':'# 역사', 'fr':'# Histoire', 'de':'# Geschichte' },
  tag_shici:    { 'zh-Hant':'# 詩詞', 'zh-Hans':'# 诗词', 'en':'# Poetry', 'ja':'# 詩歌', 'ko':'# 시가', 'fr':'# Poésie', 'de':'# Poesie' },
  tag_shenghuo: { 'zh-Hant':'# 生活', 'zh-Hans':'# 生活', 'en':'# Life', 'ja':'# 生活', 'ko':'# 생활', 'fr':'# Vie', 'de':'# Leben' },
  tag_ganqing:  { 'zh-Hant':'# 感情', 'zh-Hans':'# 感情', 'en':'# Feelings', 'ja':'# 感情', 'ko':'# 감정', 'fr':'# Sentiments', 'de':'# Gefühle' },
  tag_shendu:   { 'zh-Hant':'# 深度', 'zh-Hans':'# 深度', 'en':'# In-Depth', 'ja':'# 深度', 'ko':'# 심층', 'fr':'# Approfondi', 'de':'# Tiefgang' },
  tag_haiwai:   { 'zh-Hant':'# 海外華人', 'zh-Hans':'# 海外华人', 'en':'# Diaspora', 'ja':'# 海外華人', 'ko':'# 해외화인', 'fr':'# Diaspora', 'de':'# Diaspora' },


  // 導航
  nav_shishi:   { 'zh-Hant':'時事評論', 'zh-Hans':'时事评论', 'en':'Current Affairs', 'ja':'時事評論', 'ko':'시사평론', 'fr':'Actualités', 'de':'Aktuelles' },
  nav_zhexue:   { 'zh-Hant':'哲學思想', 'zh-Hans':'哲学思想', 'en':'Philosophy',       'ja':'哲学思想', 'ko':'철학사상', 'fr':'Philosophie', 'de':'Philosophie' },
  nav_lishi:    { 'zh-Hant':'歷史鏡鑑', 'zh-Hans':'历史镜鉴', 'en':'History',          'ja':'歴史',     'ko':'역사',     'fr':'Histoire',    'de':'Geschichte' },
  nav_shici:    { 'zh-Hant':'詩詞歌賦', 'zh-Hans':'诗词歌赋', 'en':'Poetry',           'ja':'詩歌',     'ko':'시가',     'fr':'Poésie',      'de':'Poesie' },
  nav_shendu:   { 'zh-Hant':'深度文章', 'zh-Hans':'深度文章', 'en':'In-Depth',         'ja':'深度記事', 'ko':'심층기사', 'fr':'Approfondi',  'de':'Vertiefung' },
  nav_yanhu:    { 'zh-Hant':'🔥 煙火飄香', 'zh-Hans':'🔥 烟火飘香', 'en':'🔥 Daily Life', 'ja':'🔥 日常',  'ko':'🔥 일상',  'fr':'🔥 Quotidien','de':'🔥 Alltag' },
  nav_zuojia:   { 'zh-Hant':'作家專欄', 'zh-Hans':'作家专栏', 'en':'Authors',          'ja':'作家コラム','ko':'작가칼럼', 'fr':'Auteurs',     'de':'Autoren' },

  // 按鈕
  btn_login:    { 'zh-Hant':'登入', 'zh-Hans':'登录', 'en':'Login',   'ja':'ログイン', 'ko':'로그인', 'fr':'Connexion', 'de':'Anmelden' },
  btn_write:    { 'zh-Hant':'✦ 投稿', 'zh-Hans':'✦ 投稿', 'en':'✦ Write', 'ja':'✦ 投稿', 'ko':'✦ 투고', 'fr':'✦ Écrire', 'de':'✦ Schreiben' },

  // Feed標籤
  tab_all:      { 'zh-Hant':'全部', 'zh-Hans':'全部', 'en':'All',      'ja':'すべて', 'ko':'전체',   'fr':'Tout',     'de':'Alle' },
  tab_serious:  { 'zh-Hant':'嚴肅創作', 'zh-Hans':'严肃创作', 'en':'Serious', 'ja':'シリアス', 'ko':'진지한글', 'fr':'Sérieux', 'de':'Ernsthaft' },
  tab_yanhu:    { 'zh-Hant':'煙火飄香', 'zh-Hans':'烟火飘香', 'en':'Daily Life', 'ja':'日常',  'ko':'일상',    'fr':'Quotidien', 'de':'Alltag' },
  tab_hot:      { 'zh-Hant':'熱門', 'zh-Hans':'热门', 'en':'Hot',      'ja':'人気',   'ko':'인기',   'fr':'Tendance', 'de':'Beliebt' },

  // 側邊欄
  sidebar_hot:  { 'zh-Hant':'熱門文章', 'zh-Hans':'热门文章', 'en':'Trending', 'ja':'人気記事', 'ko':'인기글', 'fr':'Tendances', 'de':'Beliebt' },
  sidebar_tags: { 'zh-Hant':'話題標籤', 'zh-Hans':'话题标签', 'en':'Topics',   'ja':'タグ',     'ko':'태그',   'fr':'Sujets',    'de':'Themen' },
  sidebar_about:{ 'zh-Hant':'關於文薈', 'zh-Hans':'关于文荟', 'en':'About',    'ja':'概要',     'ko':'소개',   'fr':'À Propos',  'de':'Über Uns' },
  sidebar_yanhu:{ 'zh-Hant':'煙火飄香 · 近期', 'zh-Hans':'烟火飘香 · 近期', 'en':'Daily Life · Recent', 'ja':'日常 · 最近', 'ko':'일상 · 최근', 'fr':'Quotidien · Récent', 'de':'Alltag · Aktuell' },

  // 空白提示
  no_article:   { 'zh-Hant':'暫無文章', 'zh-Hans':'暂无文章', 'en':'No articles yet', 'ja':'記事なし', 'ko':'글 없음', 'fr':'Pas d\'articles', 'de':'Keine Artikel' },
  no_data:      { 'zh-Hant':'暫無數據', 'zh-Hans':'暂无数据', 'en':'No data',         'ja':'データなし', 'ko':'데이터 없음', 'fr':'Pas de données', 'de':'Keine Daten' },
  loading:      { 'zh-Hant':'載入中...', 'zh-Hans':'加载中...', 'en':'Loading...', 'ja':'読込中...', 'ko':'로딩중...', 'fr':'Chargement...', 'de':'Laden...' },

  // 文章操作
  btn_pdf:      { 'zh-Hant':'⬇ PDF', 'zh-Hans':'⬇ PDF', 'en':'⬇ PDF', 'ja':'⬇ PDF', 'ko':'⬇ PDF', 'fr':'⬇ PDF', 'de':'⬇ PDF' },
  btn_tip:      { 'zh-Hant':'❤ 打賞', 'zh-Hans':'❤ 打赏', 'en':'❤ Support', 'ja':'❤ 支援', 'ko':'❤ 후원', 'fr':'❤ Soutien', 'de':'❤ Spenden' },
  featured:     { 'zh-Hant':'精選推薦', 'zh-Hans':'精选推荐', 'en':'Featured', 'ja':'おすすめ', 'ko':'추천', 'fr':'Sélection', 'de':'Empfohlen' },
  yanhu_badge:  { 'zh-Hant':'🔥 煙火飄香', 'zh-Hans':'🔥 烟火飘香', 'en':'🔥 Daily Life', 'ja':'🔥 日常', 'ko':'🔥 일상', 'fr':'🔥 Quotidien', 'de':'🔥 Alltag' },

  // 投稿彈窗
  modal_title:  { 'zh-Hant':'✦ 投稿文章', 'zh-Hans':'✦ 投稿文章', 'en':'✦ Submit Article', 'ja':'✦ 投稿', 'ko':'✦ 투고', 'fr':'✦ Soumettre', 'de':'✦ Einreichen' },
  lbl_title:    { 'zh-Hant':'標題', 'zh-Hans':'标题', 'en':'Title',    'ja':'タイトル', 'ko':'제목',   'fr':'Titre',    'de':'Titel' },
  lbl_category: { 'zh-Hant':'分類', 'zh-Hans':'分类', 'en':'Category', 'ja':'カテゴリ', 'ko':'분류',   'fr':'Catégorie','de':'Kategorie' },
  lbl_author:   { 'zh-Hant':'作者名', 'zh-Hans':'作者名', 'en':'Author', 'ja':'著者名', 'ko':'작성자', 'fr':'Auteur',   'de':'Autor' },
  lbl_location: { 'zh-Hant':'旅居地點', 'zh-Hans':'旅居地点', 'en':'Location', 'ja':'居住地', 'ko':'거주지', 'fr':'Localisation', 'de':'Standort' },
  lbl_content:  { 'zh-Hant':'內容', 'zh-Hans':'内容', 'en':'Content',  'ja':'内容',     'ko':'내용',   'fr':'Contenu',  'de':'Inhalt' },
  btn_cancel:   { 'zh-Hant':'取消', 'zh-Hans':'取消', 'en':'Cancel',   'ja':'キャンセル','ko':'취소',  'fr':'Annuler',  'de':'Abbrechen' },
  btn_submit:   { 'zh-Hant':'發表文章', 'zh-Hans':'发表文章', 'en':'Publish', 'ja':'投稿する', 'ko':'게시하기', 'fr':'Publier', 'de':'Veröffentlichen' },

  // 關於
  about_text:   {
    'zh-Hant': '文薈，文武薈萃之地。嚴肅思想與煙火生活，在這裡共存。',
    'zh-Hans': '文荟，文武荟萃之地。严肃思想与烟火生活，在这里共存。',
    'en':      'WenHui — where serious thought meets everyday life.',
    'ja':      '文薈 — 厳粛な思想と日常生活が共存する場所。',
    'ko':      '문회 — 진지한 사상과 일상이 공존하는 공간.',
    'fr':      'WenHui — où la pensée sérieuse rencontre la vie quotidienne.',
    'de':      'WenHui — wo ernsthafte Gedanken auf den Alltag treffen.'
  },
};

// 套用語言
function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // 1. 更新語言切換按鈕文字
  updateLangBtn();

  // 2. 導航欄翻譯
  const navLinks = document.querySelectorAll('.nav-links a');
  const navKeys = ['nav_shishi','nav_zhexue','nav_lishi','nav_shici','nav_shendu','nav_yanhu','nav_zuojia'];
  navLinks.forEach((a, i) => { if(T[navKeys[i]]) a.textContent = T[navKeys[i]][lang]; });

  // --- Logo 部分翻譯修正 ---
  const logoMain = document.querySelector('.logo-main');
  const logoEn = document.querySelector('.logo-en');
  const logoSlogan = document.querySelector('.logo-slogan');

  // 這裡用 innerHTML 是因為 logo-main 裡面有個 <span>薈</span>
  if (logoMain && T.logo_main) {
    // 使用 innerHTML 是為了保留 "薈" 字上面的 <span> 樣式
    logoMain.innerHTML = T.logo_main[lang];
  }

  // 4. 按鈕翻譯
  const loginBtn = document.querySelector('.btn-login');
  const writeBtn = document.querySelector('.btn-write');
  if(loginBtn) loginBtn.textContent = T.btn_login[lang];
  if(writeBtn) writeBtn.textContent = T.btn_write[lang];

  // 5. Feed 標籤頁
  const tabs = document.querySelectorAll('.tab');
  const tabKeys = ['tab_all','tab_serious','tab_yanhu','tab_hot'];
  tabs.forEach((t, i) => { if(T[tabKeys[i]]) t.textContent = T[tabKeys[i]][lang]; });

  // 6. 側邊欄標題
  const sidebarTitles = document.querySelectorAll('.sidebar-title');
  const sidebarKeys = ['sidebar_hot','sidebar_yanhu','sidebar_tags','sidebar_about'];
  sidebarTitles.forEach((t, i) => { if(T[sidebarKeys[i]]) t.textContent = T[sidebarKeys[i]][lang]; });

  // 7. 標籤雲翻譯
  const tagCloud = document.querySelectorAll('.tag-cloud span');
  const tagKeys = ['tag_shishi','tag_zhexue','tag_lishi','tag_shici','tag_shenghuo','tag_ganqing','tag_shendu','tag_haiwai'];
  tagCloud.forEach((t, i) => { if(T[tagKeys[i]]) t.textContent = T[tagKeys[i]][lang]; });

  // 8. 關於文字與底部資訊 (修正重點：使用 innerHTML 處理換行)
  const aboutText = document.querySelector('.about-text');
  if(aboutText) aboutText.textContent = T.about_text[lang];

  const aboutInfo = document.querySelector('.about-info');
  if(aboutInfo) {
    // 這裡直接將三行翻譯組合起來，並保留圖標和換行
    aboutInfo.innerHTML = `
      🌐 ${T.about_server[lang]}<br>
      🔒 ${T.about_free[lang]}<br>
      🚫 ${T.about_ban[lang]}
    `;
  }

  // 9. 最後執行：重新渲染動態內容
  loadArticles('latest');
  loadHotList();
}

// 更新語言下拉按鈕
function updateLangBtn() {
  const btn = document.querySelector('.lang-btn');
  if(btn) btn.textContent = LANG_LABELS[currentLang];
}

// 切換語言（顯示下拉選單）
function toggleLang() {
  const existing = document.getElementById('lang-dropdown');
  if(existing) { existing.remove(); return; }

  const dropdown = document.createElement('div');
  dropdown.id = 'lang-dropdown';
  dropdown.style.cssText = `
    position:fixed;top:64px;right:160px;
    background:#fff;border:1px solid rgba(0,0,0,0.15);
    z-index:999;min-width:120px;
    box-shadow:0 4px 16px rgba(0,0,0,0.1);
  `;

  LANGS.forEach(lang => {
    const item = document.createElement('div');
    item.textContent = LANG_LABELS[lang];
    item.style.cssText = `
      padding:10px 20px;font-size:14px;cursor:pointer;
      color:${lang === currentLang ? '#2456a4' : '#333'};
      font-weight:${lang === currentLang ? '500' : '400'};
      transition:background .15s;
      font-family:'Noto Sans TC',sans-serif;
    `;
    item.onmouseover = () => item.style.background = '#f7f7f5';
    item.onmouseout  = () => item.style.background = '';
    item.onclick = () => { applyLang(lang); dropdown.remove(); };
    dropdown.appendChild(item);
  });



  document.body.appendChild(dropdown);
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if(!dropdown.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 100);
}
async function loadArticles(type = 'latest') {
  const container = document.getElementById('article-list');
  container.innerHTML = '<div class="loading">載入中...</div>';
  try {
    let articles;
    if (type === 'hot') {
      articles = await API.getHotArticles();
    } else if (type === 'yanhu') {
      articles = await API.getByCategory('煙火飄香');
    } else if (type === 'serious') {
      const all = await API.getArticles();
      articles = all.filter(a => a.category !== '煙火飄香');
    } else {
      articles = await API.getArticles();
    }
    renderArticles(articles);
  } catch (e) {
    container.innerHTML = '<div class="loading">載入失敗，請稍後再試</div>';
    console.error(e);
  }
}

async function loadHotList() {
  try {
    const articles = await API.getHotArticles();
    renderHotList(articles);
    renderYanhuRecent(articles);
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadArticles('latest');
  loadHotList();
});
