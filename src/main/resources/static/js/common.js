/* ================================================================
 *  common.js — 所有页面共用：下拉菜单 + 登录状态
 * ================================================================ */
(function injectDropdown() {
    if (document.getElementById('userDropdown')) return;
    const html = `
    <div id="userDropdown" class="user-dropdown-medium">
        <div class="udm-header">
            <div class="udm-avatar" id="dropdownAvatar">文</div>
            
        </div>
        <div class="udm-rule"></div>
        <div class="udm-item" onclick="window.location.href='myarticles.html'">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            我的主頁
        </div>
        <div class="udm-item" onclick="window.location.href='write.html'">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            寫作
        </div>
        <div class="udm-rule"></div>
        <div class="udm-item" onclick="window.location.href='settings.html'">
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

    const avatar = localStorage.getItem('wh_avatar_' + user.email);

    const ua = document.getElementById('userAvatar');
    if (ua) {
        if (avatar) {
            ua.style.backgroundImage = `url(${avatar})`;
            ua.style.backgroundSize = 'cover';
            ua.style.backgroundPosition = 'center';
            ua.textContent = '';
        } else {
            ua.textContent = initial;
            ua.style.backgroundImage = '';
        }
    }

    const da = document.getElementById('dropdownAvatar');
    if (da) {
        if (avatar) {
            da.style.backgroundImage = `url(${avatar})`;
            da.style.backgroundSize = 'cover';
            da.style.backgroundPosition = 'center';
            da.textContent = '';
        } else {
            da.textContent = initial;
            da.style.backgroundImage = '';
        }
    }

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
