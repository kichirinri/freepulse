// /* ── 常量 ── */
// const MAX_PENNAMES = 5;
//
// /* ── 用户数据库 ── */
// const DEFAULT_USERS = {
//     'kichirinri@gmail.com': { email: 'kichirinri@gmail.com', pwd: '123456', name: '闻道' }
// };
// const DB = {
//     users: Object.assign({}, DEFAULT_USERS, JSON.parse(localStorage.getItem('wh_users') || '{}')),
//     save() { localStorage.setItem('wh_users', JSON.stringify(this.users)); },
//     get(email) { return this.users[email.toLowerCase()] || null; },
//     update(email, data) { Object.assign(this.users[email.toLowerCase()], data); this.save(); }
// };
//
// const currentUser = JSON.parse(sessionStorage.getItem('wh_user') || 'null');
// if (!currentUser) {
//     document.getElementById('noLogin').classList.add('show');
// } else {
//     document.getElementById('mainLayout').style.display = 'grid';
//     initPage();
// }
//
// function initPage() {
//     document.getElementById('inputName').value = currentUser.name || '';
//     document.getElementById('inputEmail').value = currentUser.email || '';
//     const avatar = localStorage.getItem('wh_avatar_' + currentUser.email);
//     if (avatar) showAvatarImg(avatar);
//     else document.getElementById('avatarInitial').textContent = (currentUser.name || '文')[0].toUpperCase();
//     renderPennameList();
// }
//
// function switchTab(tab, el) {
//     document.querySelectorAll('.settings-nav-item').forEach(e => e.classList.remove('active'));
//     document.querySelectorAll('.settings-section').forEach(e => e.classList.remove('active'));
//     el.classList.add('active');
//     document.getElementById('tab' + tab).classList.add('active');
//     if (tab === 'Penname') renderPennameList();
// }
//
// /* ================================================================
//    笔名管理
// ================================================================ */
// function getPennames() {
//     return JSON.parse(localStorage.getItem('wh_pennames_' + currentUser.email) || '[]');
// }
//
// function savePennames(list) {
//     localStorage.setItem('wh_pennames_' + currentUser.email, JSON.stringify(list));
// }
//
// function getPennameColor(i) {
//     const colors = [
//         'linear-gradient(135deg,#fa709a,#fee140)',
//         'linear-gradient(135deg,#4facfe,#00f2fe)',
//         'linear-gradient(135deg,#a18cd1,#fbc2eb)',
//         'linear-gradient(135deg,#30cfd0,#667eea)',
//         'linear-gradient(135deg,#f093fb,#f5576c)'
//     ];
//     return colors[i % colors.length];
// }
//
// function renderPennameList() {
//     const list = getPennames();
//     const container = document.getElementById('pennameList');
//     const limitEl = document.getElementById('pennameLimit');
//     const btnNew = document.getElementById('btnPennameNew');
//
//     limitEl.textContent = `已建立 ${list.length} / ${MAX_PENNAMES} 個筆名`;
//     btnNew.style.display = list.length >= MAX_PENNAMES ? 'none' : 'flex';
//
//     container.innerHTML = '';
//
//     // 预设笔名始终显示
//     const defaultItem = document.createElement('div');
//     defaultItem.className = 'penname-item';
//     defaultItem.innerHTML = `
//         <div class="penname-avatar">${(currentUser.name || '文')[0].toUpperCase()}</div>
//         <div class="penname-info">
//             <div class="penname-name">${currentUser.name || '用戶'}</div>
//             <div class="penname-note">帳號暱稱（預設）</div>
//         </div>
//         <span class="penname-default-badge">預設</span>
//     `;
//     container.appendChild(defaultItem);
//
//     if (!list.length) {
//         const emptyTip = document.createElement('div');
//         emptyTip.style.cssText = 'padding:20px;text-align:center;color:var(--ink4);font-size:13px;font-family:var(--sans);border:1px solid var(--rule-lt);margin-top:8px;';
//         emptyTip.textContent = '尚未建立其他筆名，點擊下方新增';
//         container.appendChild(emptyTip);
//         return;
//     }
//
//     list.forEach((p, i) => {
//         const item = document.createElement('div');
//         item.className = 'penname-item';
//         item.innerHTML = `
//             <div class="penname-avatar" style="background:${getPennameColor(i)}">${p.name[0].toUpperCase()}</div>
//             <div class="penname-info">
//                 <div class="penname-name">${p.name}</div>
//                 <div class="penname-note">${p.note || '無備註'}</div>
//             </div>
//             <div>
//                 <button class="btn-penname-delete" onclick="deletePenname(${i})">刪除</button>
//             </div>
//         `;
//         container.appendChild(item);
//     });
// }
//
// function showPennameForm() {
//     document.getElementById('pennameAddForm').style.display = 'block';
//     document.getElementById('btnPennameNew').style.display = 'none';
//     document.getElementById('inputPenname').focus();
// }
//
// function hidePennameForm() {
//     document.getElementById('pennameAddForm').style.display = 'none';
//     document.getElementById('inputPenname').value = '';
//     document.getElementById('inputPennameNote').value = '';
//     document.getElementById('pennameError').textContent = '';
//     const list = getPennames();
//     if (list.length < MAX_PENNAMES) {
//         document.getElementById('btnPennameNew').style.display = 'flex';
//     }
// }
//
// function addPenname() {
//     const name = document.getElementById('inputPenname').value.trim();
//     const note = document.getElementById('inputPennameNote').value.trim();
//     const errEl = document.getElementById('pennameError');
//     errEl.textContent = '';
//
//     if (!name) { errEl.textContent = '請輸入筆名'; return; }
//     if (name.length > 20) { errEl.textContent = '筆名不能超過20個字'; return; }
//
//     const list = getPennames();
//     if (list.length >= MAX_PENNAMES) { errEl.textContent = '最多只能建立 5 個筆名'; return; }
//     if (list.some(p => p.name === name)) { errEl.textContent = '此筆名已存在'; return; }
//     if (name === currentUser.name) { errEl.textContent = '與帳號暱稱相同，無需新增'; return; }
//
//     list.push({ name, note });
//     savePennames(list);
//     hidePennameForm();
//     renderPennameList();
//     showToast('筆名已新增 ✓');
// }
//
// function deletePenname(i) {
//     const list = getPennames();
//     list.splice(i, 1);
//     savePennames(list);
//     renderPennameList();
//     showToast('筆名已刪除');
// }
//
// /* ================================================================
//    头像裁剪
// ================================================================ */
// const CW = 400, CH = 320, CX = 200, CY = 160, CR = 120;
// let cropImg = new Image();
// let cropX = 0, cropY = 0, cropScale = 1;
// let isDragging = false, dragSX = 0, dragSY = 0, dragCX = 0, dragCY = 0;
//
// function openCropModal(e) {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (file.size > 5 * 1024 * 1024) { showToast('圖片大小不能超過 5MB'); return; }
//     const reader = new FileReader();
//     reader.onload = ev => {
//         cropImg = new Image();
//         cropImg.onload = () => {
//             const minScale = Math.max((CR * 2) / cropImg.width, (CR * 2) / cropImg.height) * 1.05;
//             cropScale = minScale;
//             cropX = CX - (cropImg.width * cropScale) / 2;
//             cropY = CY - (cropImg.height * cropScale) / 2;
//             document.getElementById('cropScale').value = Math.min(300, Math.round(cropScale * 100));
//             bindCropEvents();
//             drawCrop();
//             document.getElementById('cropOverlay').classList.add('open');
//             document.body.style.overflow = 'hidden';
//         };
//         cropImg.src = ev.target.result;
//     };
//     reader.readAsDataURL(file);
// }
//
// function bindCropEvents() {
//     const canvas = document.getElementById('cropCanvas');
//     canvas.onmousedown = e => { isDragging = true; dragSX = e.clientX; dragSY = e.clientY; dragCX = cropX; dragCY = cropY; };
//     document.onmousemove = e => { if (!isDragging) return; cropX = dragCX + (e.clientX - dragSX); cropY = dragCY + (e.clientY - dragSY); drawCrop(); };
//     document.onmouseup = () => { isDragging = false; };
//     canvas.ontouchstart = e => { isDragging = true; dragSX = e.touches[0].clientX; dragSY = e.touches[0].clientY; dragCX = cropX; dragCY = cropY; e.preventDefault(); };
//     canvas.ontouchmove = e => { if (!isDragging) return; cropX = dragCX + (e.touches[0].clientX - dragSX); cropY = dragCY + (e.touches[0].clientY - dragSY); drawCrop(); e.preventDefault(); };
//     canvas.ontouchend = () => { isDragging = false; };
//     document.getElementById('cropScale').oninput = function() {
//         const newScale = parseInt(this.value) / 100;
//         cropX = CX - (CX - cropX) * (newScale / cropScale);
//         cropY = CY - (CY - cropY) * (newScale / cropScale);
//         cropScale = newScale;
//         drawCrop();
//     };
// }
//
// function drawCrop() {
//     const ctx = document.getElementById('cropCanvas').getContext('2d');
//     ctx.clearRect(0, 0, CW, CH);
//     ctx.drawImage(cropImg, cropX, cropY, cropImg.width * cropScale, cropImg.height * cropScale);
// }
//
// function confirmCrop() {
//     const canvas = document.getElementById('cropCanvas');
//     const out = document.createElement('canvas');
//     out.width = out.height = CR * 2;
//     const octx = out.getContext('2d');
//     octx.beginPath();
//     octx.arc(CR, CR, CR, 0, Math.PI * 2);
//     octx.clip();
//     octx.drawImage(canvas, CX - CR, CY - CR, CR * 2, CR * 2, 0, 0, CR * 2, CR * 2);
//     const base64 = out.toDataURL('image/jpeg', 0.92);
//     localStorage.setItem('wh_avatar_' + currentUser.email, base64);
//     showAvatarImg(base64);
//     closeCropModal();
//     showToast('頭像已更新 ✓');
// }
//
// function closeCropModal() {
//     document.getElementById('cropOverlay').classList.remove('open');
//     document.body.style.overflow = '';
//     document.getElementById('avatarInput').value = '';
//     document.onmousemove = null;
//     document.onmouseup = null;
// }
//
// function showAvatarImg(src) {
//     const img = document.getElementById('avatarImg');
//     img.src = src; img.classList.add('show');
//     document.getElementById('avatarInitial').style.display = 'none';
//     document.getElementById('btnAvatarRemove').classList.add('show');
// }
//
// function removeAvatar() {
//     localStorage.removeItem('wh_avatar_' + currentUser.email);
//     const img = document.getElementById('avatarImg');
//     img.src = ''; img.classList.remove('show');
//     document.getElementById('avatarInitial').style.display = '';
//     document.getElementById('avatarInitial').textContent = (currentUser.name || '文')[0].toUpperCase();
//     document.getElementById('btnAvatarRemove').classList.remove('show');
//     document.getElementById('avatarInput').value = '';
//     showToast('已移除頭像');
// }
//
// /* ── 个人资料 ── */
// function saveProfile() {
//     const name = document.getElementById('inputName').value.trim();
//     const errEl = document.getElementById('nameError');
//     const sucEl = document.getElementById('profileSuccess');
//     errEl.textContent = ''; sucEl.textContent = '';
//     if (!name) { errEl.textContent = '暱稱不能為空'; return; }
//     if (name.length > 20) { errEl.textContent = '暱稱不能超過20個字'; return; }
//     DB.update(currentUser.email, { name });
//     currentUser.name = name;
//     sessionStorage.setItem('wh_user', JSON.stringify(currentUser));
//     const hasAvatar = localStorage.getItem('wh_avatar_' + currentUser.email);
//     if (!hasAvatar) document.getElementById('avatarInitial').textContent = name[0].toUpperCase();
//     fetch('http://localhost:8080/api/users/updateName', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: currentUser.email, name })
//     }).catch(() => {});
//     sucEl.textContent = '已儲存 ✓';
//     showToast('個人資料已更新 ✓');
//     setTimeout(() => sucEl.textContent = '', 3000);
// }
//
// /* ── 修改密码 ── */
// function savePassword() {
//     const oldPwd = document.getElementById('inputOldPwd').value;
//     const newPwd = document.getElementById('inputNewPwd').value;
//     const confirmPwd = document.getElementById('inputConfirmPwd').value;
//     const errEl = document.getElementById('pwdError');
//     const sucEl = document.getElementById('pwdSuccess');
//     errEl.textContent = ''; sucEl.textContent = '';
//     const user = DB.get(currentUser.email);
//     if (!user) { errEl.textContent = '用戶不存在'; return; }
//     if (user.pwd !== oldPwd) { errEl.textContent = '目前密碼錯誤'; return; }
//     if (newPwd.length < 8) { errEl.textContent = '新密碼至少需要8位'; return; }
//     if (newPwd !== confirmPwd) { errEl.textContent = '兩次密碼輸入不一致'; return; }
//     DB.update(currentUser.email, { pwd: newPwd });
//     ['inputOldPwd','inputNewPwd','inputConfirmPwd'].forEach(id => document.getElementById(id).value = '');
//     sucEl.textContent = '密碼已更新 ✓';
//     showToast('密碼已更新 ✓');
//     setTimeout(() => sucEl.textContent = '', 3000);
// }
//
// function showToast(msg) {
//     const t = document.getElementById('toast');
//     t.textContent = msg;
//     t.classList.add('show');
//     setTimeout(() => t.classList.remove('show'), 3000);
// }

/* ================================================================
   settings.js — 帳號設定頁邏輯
================================================================ */

const MAX_PENNAMES = 5;

/* ── 用戶資料庫（本地模擬）── */
const DEFAULT_USERS = {
    'kichirinri@gmail.com': { email: 'kichirinri@gmail.com', pwd: '123456', name: '闻道' }
};
const DB = {
    users: Object.assign({}, DEFAULT_USERS, JSON.parse(localStorage.getItem('wh_users') || '{}')),
    save() { localStorage.setItem('wh_users', JSON.stringify(this.users)); },
    get(email) { return this.users[email.toLowerCase()] || null; },
    update(email, data) { Object.assign(this.users[email.toLowerCase()], data); this.save(); }
};

/* ── 登入狀態：sessionStorage 優先，沒有就從 localStorage 補 ── */
const currentUser = JSON.parse(
    sessionStorage.getItem('wh_user') ||
    localStorage.getItem('wh_user') ||
    'null'
);

if (!currentUser) {
    document.getElementById('noLogin').classList.add('show');
} else {
    /* 補寫 sessionStorage，確保同分頁後續讀取正常 */
    sessionStorage.setItem('wh_user', JSON.stringify(currentUser));
    document.getElementById('mainLayout').style.display = 'grid';
    initPage();
}

function initPage() {
    document.getElementById('inputName').value = currentUser.name || '';
    document.getElementById('inputEmail').value = currentUser.email || '';
    const avatar = localStorage.getItem('wh_avatar_' + currentUser.email);
    if (avatar) showAvatarImg(avatar);
    else document.getElementById('avatarInitial').textContent = (currentUser.name || '文')[0].toUpperCase();
    renderPennameList();
}

function switchTab(tab, el) {
    document.querySelectorAll('.settings-nav-item').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.settings-section').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('tab' + tab).classList.add('active');
    if (tab === 'Penname') renderPennameList();
}

/* ================================================================
   筆名管理
================================================================ */
function getPennames() {
    return JSON.parse(localStorage.getItem('wh_pennames_' + currentUser.email) || '[]');
}

function savePennames(list) {
    localStorage.setItem('wh_pennames_' + currentUser.email, JSON.stringify(list));
}

function getPennameColor(i) {
    const colors = [
        'linear-gradient(135deg,#fa709a,#fee140)',
        'linear-gradient(135deg,#4facfe,#00f2fe)',
        'linear-gradient(135deg,#a18cd1,#fbc2eb)',
        'linear-gradient(135deg,#30cfd0,#667eea)',
        'linear-gradient(135deg,#f093fb,#f5576c)'
    ];
    return colors[i % colors.length];
}

function renderPennameList() {
    const list = getPennames();
    const container = document.getElementById('pennameList');
    const limitEl = document.getElementById('pennameLimit');
    const btnNew = document.getElementById('btnPennameNew');

    limitEl.textContent = `已建立 ${list.length} / ${MAX_PENNAMES} 個筆名`;
    btnNew.style.display = list.length >= MAX_PENNAMES ? 'none' : 'flex';

    container.innerHTML = '';

    /* 預設筆名 */
    const defaultItem = document.createElement('div');
    defaultItem.className = 'penname-item';
    defaultItem.innerHTML = `
        <div class="penname-avatar">${(currentUser.name || '文')[0].toUpperCase()}</div>
        <div class="penname-info">
            <div class="penname-name">${currentUser.name || '用戶'}</div>
            <div class="penname-note">帳號暱稱（預設）</div>
        </div>
        <span class="penname-default-badge">預設</span>
    `;
    container.appendChild(defaultItem);

    if (!list.length) {
        const emptyTip = document.createElement('div');
        emptyTip.style.cssText = 'padding:20px;text-align:center;color:var(--ink4);font-size:13px;font-family:var(--sans);border:1px solid var(--rule-lt);margin-top:8px;';
        emptyTip.textContent = '尚未建立其他筆名，點擊下方新增';
        container.appendChild(emptyTip);
        return;
    }

    list.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'penname-item';
        item.innerHTML = `
            <div class="penname-avatar" style="background:${getPennameColor(i)}">${p.name[0].toUpperCase()}</div>
            <div class="penname-info">
                <div class="penname-name">${p.name}</div>
                <div class="penname-note">${p.note || '無備註'}</div>
            </div>
            <div>
                <button class="btn-penname-delete" onclick="deletePenname(${i})">刪除</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function showPennameForm() {
    document.getElementById('pennameAddForm').style.display = 'block';
    document.getElementById('btnPennameNew').style.display = 'none';
    document.getElementById('inputPenname').focus();
}

function hidePennameForm() {
    document.getElementById('pennameAddForm').style.display = 'none';
    document.getElementById('inputPenname').value = '';
    document.getElementById('inputPennameNote').value = '';
    document.getElementById('pennameError').textContent = '';
    const list = getPennames();
    if (list.length < MAX_PENNAMES) {
        document.getElementById('btnPennameNew').style.display = 'flex';
    }
}

function addPenname() {
    const name = document.getElementById('inputPenname').value.trim();
    const note = document.getElementById('inputPennameNote').value.trim();
    const errEl = document.getElementById('pennameError');
    errEl.textContent = '';

    if (!name) { errEl.textContent = '請輸入筆名'; return; }
    if (name.length > 20) { errEl.textContent = '筆名不能超過20個字'; return; }

    const list = getPennames();
    if (list.length >= MAX_PENNAMES) { errEl.textContent = '最多只能建立 5 個筆名'; return; }
    if (list.some(p => p.name === name)) { errEl.textContent = '此筆名已存在'; return; }
    if (name === currentUser.name) { errEl.textContent = '與帳號暱稱相同，無需新增'; return; }

    list.push({ name, note });
    savePennames(list);
    hidePennameForm();
    renderPennameList();
    showToast('筆名已新增 ✓');
}

function deletePenname(i) {
    const list = getPennames();
    list.splice(i, 1);
    savePennames(list);
    renderPennameList();
    showToast('筆名已刪除');
}

/* ================================================================
   頭像裁剪
================================================================ */
const CW = 400, CH = 320, CX = 200, CY = 160, CR = 120;
let cropImg = new Image();
let cropX = 0, cropY = 0, cropScale = 1;
let isDragging = false, dragSX = 0, dragSY = 0, dragCX = 0, dragCY = 0;

function openCropModal(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('圖片大小不能超過 5MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
        cropImg = new Image();
        cropImg.onload = () => {
            const minScale = Math.max((CR * 2) / cropImg.width, (CR * 2) / cropImg.height) * 1.05;
            cropScale = minScale;
            cropX = CX - (cropImg.width * cropScale) / 2;
            cropY = CY - (cropImg.height * cropScale) / 2;
            document.getElementById('cropScale').value = Math.min(300, Math.round(cropScale * 100));
            bindCropEvents();
            drawCrop();
            document.getElementById('cropOverlay').classList.add('open');
            document.body.style.overflow = 'hidden';
        };
        cropImg.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function bindCropEvents() {
    const canvas = document.getElementById('cropCanvas');
    canvas.onmousedown = e => { isDragging = true; dragSX = e.clientX; dragSY = e.clientY; dragCX = cropX; dragCY = cropY; };
    document.onmousemove = e => { if (!isDragging) return; cropX = dragCX + (e.clientX - dragSX); cropY = dragCY + (e.clientY - dragSY); drawCrop(); };
    document.onmouseup = () => { isDragging = false; };
    canvas.ontouchstart = e => { isDragging = true; dragSX = e.touches[0].clientX; dragSY = e.touches[0].clientY; dragCX = cropX; dragCY = cropY; e.preventDefault(); };
    canvas.ontouchmove = e => { if (!isDragging) return; cropX = dragCX + (e.touches[0].clientX - dragSX); cropY = dragCY + (e.touches[0].clientY - dragSY); drawCrop(); e.preventDefault(); };
    canvas.ontouchend = () => { isDragging = false; };
    document.getElementById('cropScale').oninput = function () {
        const newScale = parseInt(this.value) / 100;
        cropX = CX - (CX - cropX) * (newScale / cropScale);
        cropY = CY - (CY - cropY) * (newScale / cropScale);
        cropScale = newScale;
        drawCrop();
    };
}

function drawCrop() {
    const ctx = document.getElementById('cropCanvas').getContext('2d');
    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(cropImg, cropX, cropY, cropImg.width * cropScale, cropImg.height * cropScale);
}

function confirmCrop() {
    const canvas = document.getElementById('cropCanvas');
    const out = document.createElement('canvas');
    out.width = out.height = CR * 2;
    const octx = out.getContext('2d');
    octx.beginPath();
    octx.arc(CR, CR, CR, 0, Math.PI * 2);
    octx.clip();
    octx.drawImage(canvas, CX - CR, CY - CR, CR * 2, CR * 2, 0, 0, CR * 2, CR * 2);
    const base64 = out.toDataURL('image/jpeg', 0.92);
    localStorage.setItem('wh_avatar_' + currentUser.email, base64);
    showAvatarImg(base64);
    closeCropModal();
    showToast('頭像已更新 ✓');
}

function closeCropModal() {
    document.getElementById('cropOverlay').classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('avatarInput').value = '';
    document.onmousemove = null;
    document.onmouseup = null;
}

function showAvatarImg(src) {
    const img = document.getElementById('avatarImg');
    img.src = src;
    img.classList.add('show');
    document.getElementById('avatarInitial').style.display = 'none';
    document.getElementById('btnAvatarRemove').classList.add('show');
}

function removeAvatar() {
    localStorage.removeItem('wh_avatar_' + currentUser.email);
    const img = document.getElementById('avatarImg');
    img.src = '';
    img.classList.remove('show');
    document.getElementById('avatarInitial').style.display = '';
    document.getElementById('avatarInitial').textContent = (currentUser.name || '文')[0].toUpperCase();
    document.getElementById('btnAvatarRemove').classList.remove('show');
    document.getElementById('avatarInput').value = '';
    showToast('已移除頭像');
}

/* ================================================================
   個人資料
================================================================ */
function saveProfile() {
    const name = document.getElementById('inputName').value.trim();
    const errEl = document.getElementById('nameError');
    const sucEl = document.getElementById('profileSuccess');
    errEl.textContent = '';
    sucEl.textContent = '';

    if (!name) { errEl.textContent = '暱稱不能為空'; return; }
    if (name.length > 20) { errEl.textContent = '暱稱不能超過20個字'; return; }

    DB.update(currentUser.email, { name });
    currentUser.name = name;
    sessionStorage.setItem('wh_user', JSON.stringify(currentUser));
    localStorage.setItem('wh_user', JSON.stringify(currentUser)); /* 同步寫 localStorage */

    const hasAvatar = localStorage.getItem('wh_avatar_' + currentUser.email);
    if (!hasAvatar) document.getElementById('avatarInitial').textContent = name[0].toUpperCase();

    fetch('http://localhost:8080/api/users/updateName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, name })
    }).catch(() => {});

    sucEl.textContent = '已儲存 ✓';
    showToast('個人資料已更新 ✓');
    setTimeout(() => sucEl.textContent = '', 3000);
}

/* ================================================================
   修改密碼
================================================================ */
function savePassword() {
    const oldPwd = document.getElementById('inputOldPwd').value;
    const newPwd = document.getElementById('inputNewPwd').value;
    const confirmPwd = document.getElementById('inputConfirmPwd').value;
    const errEl = document.getElementById('pwdError');
    const sucEl = document.getElementById('pwdSuccess');
    errEl.textContent = '';
    sucEl.textContent = '';

    const user = DB.get(currentUser.email);
    if (!user) { errEl.textContent = '用戶不存在'; return; }
    if (user.pwd !== oldPwd) { errEl.textContent = '目前密碼錯誤'; return; }
    if (newPwd.length < 8) { errEl.textContent = '新密碼至少需要8位'; return; }
    if (newPwd !== confirmPwd) { errEl.textContent = '兩次密碼輸入不一致'; return; }

    DB.update(currentUser.email, { pwd: newPwd });
    ['inputOldPwd', 'inputNewPwd', 'inputConfirmPwd'].forEach(id => document.getElementById(id).value = '');
    sucEl.textContent = '密碼已更新 ✓';
    showToast('密碼已更新 ✓');
    setTimeout(() => sucEl.textContent = '', 3000);
}

/* ================================================================
   Toast
================================================================ */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}