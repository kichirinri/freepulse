/* ================================================================
 *  common.js — 所有页面共用：下拉菜单 + 登录状态
 * ================================================================ */
// 自动注入下拉菜单HTML
(function injectDropdown() {
    if (document.getElementById('userDropdown')) return; // 已存在就跳过
    const html = `
    <div id="userDropdown" class="user-dropdown-medium">
        <div class="udm-header">
            <div class="udm-avatar" id="dropdownAvatar">文</div>
            <div class="udm-info">
                <div class="udm-name" id="dropdownName">用戶</div>
                <div class="udm-view">查看主頁</div>
            </div>
        </div>
        <div class="udm-rule"></div>
        <div class="udm-item" onclick="window.location.href='myarticles.html'">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            我的文章
        </div>
        <div class="udm-item" onclick="window.location.href='myarticles.html?tab=liked'">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            已讚文章
        </div>
        <div class="udm-item" onclick="window.location.href='write.html'">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            寫作
        </div>
        <div class="udm-rule"></div>
        <div class="udm-item">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
            帳號設定
        </div>
        <div class="udm-rule"></div>
        <div class="udm-logout-block">
            <div class="udm-item udm-item-logout" onclick="doLogout()">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                登出
            </div>
            <div class="udm-email" id="dropdownEmail"></div>
        </div>
        <div class="udm-footer">
            <span>關於</span><span>服務條款</span><span>隱私政策</span>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
})();

function toggleUserMenu() {
    const menu   = document.getElementById('userDropdown');
    const avatar = document.getElementById('userAvatar');
    if (!menu || !avatar) return;
    if (menu.classList.contains('open')) { menu.classList.remove('open'); return; }
    const rect = avatar.getBoundingClientRect();
    menu.style.top   = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.style.left  = 'auto';
    menu.classList.add('open');
}

document.addEventListener('click', function(e) {
    const menu   = document.getElementById('userDropdown');
    const avatar = document.getElementById('userAvatar');
    if (!menu || !avatar) return;
    if (!menu.contains(e.target) && !avatar.contains(e.target)) menu.classList.remove('open');
});

window.addEventListener('scroll', function() {
    const menu = document.getElementById('userDropdown');
    if (menu && menu.classList.contains('open')) menu.classList.remove('open');
});

function renderUserState() {
    const user = JSON.parse(sessionStorage.getItem('wh_user') || 'null');
    if (!user) return;
    const initial = (user.name || user.email || '文')[0].toUpperCase();
    const sg = document.getElementById('stateGuest');
    const su = document.getElementById('stateUser');
    if (sg) sg.style.display = 'none';
    if (su) su.style.display = 'flex';
    const ua = document.getElementById('userAvatar');
    if (ua) ua.textContent = initial;
    const da = document.getElementById('dropdownAvatar');
    if (da) da.textContent = initial;
    const dn = document.getElementById('dropdownName');
    if (dn) dn.textContent = user.name || '用戶';
    const de = document.getElementById('dropdownEmail');
    if (de) de.textContent = user.email || '';
}

function doLogout() {
    sessionStorage.removeItem('wh_user');
    const su   = document.getElementById('stateUser');
    const sg   = document.getElementById('stateGuest');
    const menu = document.getElementById('userDropdown');
    if (su)   su.style.display = 'none';
    if (sg)   sg.style.display = 'flex';
    if (menu) menu.classList.remove('open');
}

renderUserState();
