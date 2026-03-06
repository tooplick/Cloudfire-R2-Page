/* ===== CloudDrive 前端逻辑 ===== */

(function () {
    'use strict';

    // ===== SVG 图标 =====
    const SVG = {
        folder: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
        folderLg: '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
        file: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
        fileLg: '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
        image: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
        imageLg: '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
        video: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
        videoLg: '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
        music: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        musicLg: '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        code: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        codeLg: '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        archive: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
        archiveLg: '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
        download: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        eye: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
        edit: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',
        trash: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
        more: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
        user: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        folderRoot: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
        check: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
        x: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        share: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    };

    // ===== 状态管理 =====
    const state = {
        currentPath: '',
        viewMode: 'grid', // 'grid' | 'list'
        loggedIn: false,
        username: '',
        settings: {
            max_file_size: 104857600,
            chunk_size: 5242880,
            chunk_enabled: true,
            chunk_threshold: 10485760,
            max_storage_size: 1073741824,
        },
    };

    // ===== DOM 元素 =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const els = {
        loginPage: $('#login-page'),
        appPage: $('#app-page'),
        loginForm: $('#login-form'),
        loginBtn: $('#login-btn'),
        loginError: $('#login-error'),
        usernameInput: $('#username'),
        passwordInput: $('#password'),
        logoutBtn: $('#logout-btn'),
        userInfo: $('#user-info'),
        breadcrumb: $('#breadcrumb'),
        btnUpload: $('#btn-upload'),
        btnNewFolder: $('#btn-new-folder'),
        btnGridView: $('#btn-grid-view'),
        btnListView: $('#btn-list-view'),
        fileInput: $('#file-input'),
        fileGrid: $('#file-grid'),
        fileListTable: $('#file-list-table'),
        fileListBody: $('#file-list-body'),
        loading: $('#loading'),
        emptyState: $('#empty-state'),
        dropZone: $('#drop-zone'),
        uploadProgress: $('#upload-progress'),
        uploadList: $('#upload-list'),
        btnCloseProgress: $('#btn-close-progress'),
        previewModal: $('#preview-modal'),
        previewTitle: $('#preview-title'),
        previewBody: $('#preview-body'),
        previewClose: $('#preview-close'),
        inputModal: $('#input-modal'),
        inputModalTitle: $('#input-modal-title'),
        inputModalValue: $('#input-modal-value'),
        inputModalClose: $('#input-modal-close'),
        inputModalCancel: $('#input-modal-cancel'),
        inputModalConfirm: $('#input-modal-confirm'),
        confirmModal: $('#confirm-modal'),
        confirmModalMsg: $('#confirm-modal-msg'),
        confirmModalClose: $('#confirm-modal-close'),
        confirmModalCancel: $('#confirm-modal-cancel'),
        confirmModalOk: $('#confirm-modal-ok'),
        toastContainer: $('#toast-container'),
    };

    // ===== 工具函数 =====
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatTime(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function getFileIcon(name, type, large) {
        const ext = name.split('.').pop().toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'];
        const videoExts = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'];
        const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
        const codeExts = ['js', 'ts', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'toml', 'md', 'sh', 'bat'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];
        const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

        if (imageExts.includes(ext)) return large ? SVG.imageLg : SVG.image;
        if (videoExts.includes(ext)) return large ? SVG.videoLg : SVG.video;
        if (audioExts.includes(ext)) return large ? SVG.musicLg : SVG.music;
        if (codeExts.includes(ext)) return large ? SVG.codeLg : SVG.code;
        if (archiveExts.includes(ext)) return large ? SVG.archiveLg : SVG.archive;
        if (docExts.includes(ext)) return large ? SVG.fileLg : SVG.file;
        return large ? SVG.fileLg : SVG.file;
    }

    function isPreviewable(name) {
        const ext = name.split('.').pop().toLowerCase();
        const previewExts = [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp',
            'mp4', 'webm', 'mov',
            'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',
            'txt', 'md', 'json', 'js', 'ts', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h',
            'css', 'html', 'xml', 'yaml', 'yml', 'toml', 'sh', 'bat', 'log', 'csv',
        ];
        return previewExts.includes(ext);
    }

    function getPreviewType(name) {
        const ext = name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
        if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) return 'audio';
        return 'text';
    }

    // ===== Toast 通知 =====
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: SVG.check, error: SVG.x, info: SVG.info };
        toast.innerHTML = `<span class="toast-icon">${icons[type] || SVG.info}</span><span>${message}</span>`;
        els.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== API 请求 =====
    async function api(path, options = {}) {
        try {
            const resp = await fetch(path, options);
            if (resp.status === 401) {
                showLoginPage();
                throw new Error('未登录');
            }
            const ct = resp.headers.get('Content-Type') || '';
            if (!ct.includes('application/json')) {
                throw new Error(`服务端错误 (${resp.status})`);
            }
            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || `请求失败 (${resp.status})`);
            }
            return data;
        } catch (err) {
            if (err.message !== '未登录') {
                showToast(err.message, 'error');
            }
            throw err;
        }
    }

    // ===== 认证 =====
    async function checkAuth() {
        try {
            const data = await api('/auth/login');
            if (data.loggedIn) {
                state.loggedIn = true;
                state.username = data.username;
                showAppPage();
            } else {
                showLoginPage();
            }
        } catch {
            showLoginPage();
        }
    }

    function showLoginPage() {
        state.loggedIn = false;
        els.loginPage.classList.remove('hidden');
        els.appPage.classList.add('hidden');
        els.loginError.classList.add('hidden');
        // 恢复记住的密码
        loadRememberedCredentials();
    }

    function showAppPage() {
        els.loginPage.classList.add('hidden');
        els.appPage.classList.remove('hidden');
        els.userInfo.innerHTML = `${SVG.user} ${state.username}`;
        loadSettings().then(() => loadFiles());
    }

    async function handleLogin(e) {
        e.preventDefault();
        const username = els.usernameInput.value.trim();
        const password = els.passwordInput.value;

        if (!username || !password) return;

        els.loginBtn.disabled = true;
        els.loginBtn.querySelector('.btn-text').classList.add('hidden');
        els.loginBtn.querySelector('.btn-loading').classList.remove('hidden');
        els.loginError.classList.add('hidden');

        try {
            await api('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            // 处理记住密码
            const rememberEl = document.getElementById('remember-password');
            if (rememberEl && rememberEl.checked) {
                localStorage.setItem('cd_remember', '1');
                localStorage.setItem('cd_username', username);
                localStorage.setItem('cd_password', btoa(password));
            } else {
                localStorage.removeItem('cd_remember');
                localStorage.removeItem('cd_username');
                localStorage.removeItem('cd_password');
            }
            state.loggedIn = true;
            state.username = username;
            showAppPage();
        } catch (err) {
            els.loginError.textContent = err.message || '登录失败';
            els.loginError.classList.remove('hidden');
        } finally {
            els.loginBtn.disabled = false;
            els.loginBtn.querySelector('.btn-text').classList.remove('hidden');
            els.loginBtn.querySelector('.btn-loading').classList.add('hidden');
        }
    }

    function loadRememberedCredentials() {
        const remembered = localStorage.getItem('cd_remember');
        const rememberEl = document.getElementById('remember-password');
        if (remembered === '1' && rememberEl) {
            const savedUser = localStorage.getItem('cd_username') || '';
            const savedPass = localStorage.getItem('cd_password');
            els.usernameInput.value = savedUser;
            els.passwordInput.value = savedPass ? atob(savedPass) : '';
            rememberEl.checked = true;
        } else {
            els.usernameInput.value = '';
            els.passwordInput.value = '';
            if (rememberEl) rememberEl.checked = false;
        }
    }

    async function handleLogout() {
        try {
            await fetch('/auth/logout');
        } catch { }
        showLoginPage();
    }

    // ===== 文件列表 =====
    async function loadFiles(path) {
        if (path !== undefined) state.currentPath = path;

        els.loading.classList.remove('hidden');
        els.fileGrid.classList.add('hidden');
        els.fileListTable.classList.add('hidden');
        els.emptyState.classList.add('hidden');

        try {
            const data = await api(`/api/list?path=${encodeURIComponent(state.currentPath)}`);
            renderBreadcrumb();
            renderFiles(data.folders, data.files);
        } catch {
            // err already handled by api()
        } finally {
            els.loading.classList.add('hidden');
        }
    }

    function renderBreadcrumb() {
        const parts = state.currentPath.split('/').filter(Boolean);
        let html = `<a href="#" data-path="" class="breadcrumb-item">${SVG.folderRoot} 根目录</a>`;

        let accumulated = '';
        for (const part of parts) {
            accumulated += part + '/';
            html += `<span class="breadcrumb-separator">›</span>`;
            html += `<a href="#" data-path="${accumulated}" class="breadcrumb-item">${part}</a>`;
        }

        els.breadcrumb.innerHTML = html;

        els.breadcrumb.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                loadFiles(item.dataset.path);
            });
        });
    }

    function renderFiles(folders, files) {
        const isEmpty = folders.length === 0 && files.length === 0;
        if (isEmpty) {
            els.emptyState.classList.remove('hidden');
            return;
        }

        if (state.viewMode === 'grid') {
            renderGridView(folders, files);
        } else {
            renderListView(folders, files);
        }
    }

    function renderGridView(folders, files) {
        els.fileGrid.classList.remove('hidden');
        els.fileListTable.classList.add('hidden');

        let html = '';

        // 渲染文件夹
        for (const folder of folders) {
            html += `
        <div class="file-card" data-type="folder" data-path="${folder.path}" data-name="${folder.name}">
          <div class="file-card-actions">
            <div class="context-menu">
              <button class="btn btn-icon context-menu-trigger" onclick="event.stopPropagation()">${SVG.more}</button>
              <div class="context-menu-dropdown hidden">
                <button class="context-menu-item" data-action="rename" data-key="${folder.path}" data-name="${folder.name}">${SVG.edit} 重命名</button>
                <button class="context-menu-item danger" data-action="delete" data-key="${folder.path}" data-name="${folder.name}">${SVG.trash} 删除</button>
              </div>
            </div>
          </div>
          <span class="file-card-icon">${SVG.folderLg}</span>
          <span class="file-card-name">${folder.name}</span>
        </div>
      `;
        }

        // 渲染文件
        for (const file of files) {
            const icon = getFileIcon(file.name, file.type, true);
            html += `
        <div class="file-card" data-type="file" data-key="${file.key}" data-name="${file.name}">
          <div class="file-card-actions">
            <div class="context-menu">
              <button class="btn btn-icon context-menu-trigger" onclick="event.stopPropagation()">${SVG.more}</button>
              <div class="context-menu-dropdown hidden">
                <button class="context-menu-item" data-action="download" data-key="${file.key}">${SVG.download} 下载</button>
                <button class="context-menu-item" data-action="share" data-key="${file.key}" data-name="${file.name}">${SVG.share} 分享链接</button>
                ${isPreviewable(file.name) ? `<button class="context-menu-item" data-action="preview" data-key="${file.key}" data-name="${file.name}">${SVG.eye} 预览</button>` : ''}
                <button class="context-menu-item" data-action="rename" data-key="${file.key}" data-name="${file.name}">${SVG.edit} 重命名</button>
                <button class="context-menu-item danger" data-action="delete" data-key="${file.key}" data-name="${file.name}">${SVG.trash} 删除</button>
              </div>
            </div>
          </div>
          <span class="file-card-icon">${icon}</span>
          <span class="file-card-name">${file.name}</span>
          <span class="file-card-meta">${formatSize(file.size)}</span>
        </div>
      `;
        }

        els.fileGrid.innerHTML = html;
        bindFileCardEvents();
    }

    function renderListView(folders, files) {
        els.fileGrid.classList.add('hidden');
        els.fileListTable.classList.remove('hidden');

        let html = '';

        for (const folder of folders) {
            html += `
        <div class="file-list-row" data-type="folder" data-path="${folder.path}" data-name="${folder.name}">
          <span class="col-name"><span>${SVG.folder}</span><span>${folder.name}</span></span>
          <span class="col-size">-</span>
          <span class="col-time">-</span>
          <span class="col-actions">
            <button class="btn btn-icon" data-action="rename" data-key="${folder.path}" data-name="${folder.name}" title="重命名">${SVG.edit}</button>
            <button class="btn btn-icon" data-action="delete" data-key="${folder.path}" data-name="${folder.name}" title="删除">${SVG.trash}</button>
          </span>
        </div>
      `;
        }

        for (const file of files) {
            const icon = getFileIcon(file.name, file.type, false);
            html += `
        <div class="file-list-row" data-type="file" data-key="${file.key}" data-name="${file.name}">
          <span class="col-name"><span>${icon}</span><span>${file.name}</span></span>
          <span class="col-size">${formatSize(file.size)}</span>
          <span class="col-time">${formatTime(file.uploaded)}</span>
          <span class="col-actions">
            ${isPreviewable(file.name) ? `<button class="btn btn-icon" data-action="preview" data-key="${file.key}" data-name="${file.name}" title="预览">${SVG.eye}</button>` : ''}
            <button class="btn btn-icon" data-action="download" data-key="${file.key}" title="下载">${SVG.download}</button>
            <button class="btn btn-icon" data-action="share" data-key="${file.key}" data-name="${file.name}" title="分享">${SVG.share}</button>
            <button class="btn btn-icon" data-action="rename" data-key="${file.key}" data-name="${file.name}" title="重命名">${SVG.edit}</button>
            <button class="btn btn-icon" data-action="delete" data-key="${file.key}" data-name="${file.name}" title="删除">${SVG.trash}</button>
          </span>
        </div>
      `;
        }

        els.fileListBody.innerHTML = html;
        bindListRowEvents();
    }

    // ===== 事件绑定 =====
    function bindFileCardEvents() {
        // 点击文件卡片
        els.fileGrid.querySelectorAll('.file-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.file-card-actions')) return;
                const type = card.dataset.type;
                if (type === 'folder') {
                    loadFiles(card.dataset.path);
                } else {
                    const name = card.dataset.name;
                    if (isPreviewable(name)) {
                        previewFile(card.dataset.key, name);
                    } else {
                        downloadFile(card.dataset.key);
                    }
                }
            });
        });

        // 上下文菜单
        bindContextMenus();
        bindActionButtons();
    }

    function bindListRowEvents() {
        els.fileListBody.querySelectorAll('.file-list-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.col-actions')) return;
                const type = row.dataset.type;
                if (type === 'folder') {
                    loadFiles(row.dataset.path);
                } else {
                    const name = row.dataset.name;
                    if (isPreviewable(name)) {
                        previewFile(row.dataset.key, name);
                    } else {
                        downloadFile(row.dataset.key);
                    }
                }
            });
        });

        bindActionButtons();
    }

    function bindContextMenus() {
        document.querySelectorAll('.context-menu-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // 关闭其他菜单
                document.querySelectorAll('.context-menu-dropdown').forEach(d => d.classList.add('hidden'));
                const dropdown = trigger.nextElementSibling;
                dropdown.classList.toggle('hidden');
            });
        });

        // 点击外部关闭菜单
        document.addEventListener('click', () => {
            document.querySelectorAll('.context-menu-dropdown').forEach(d => d.classList.add('hidden'));
        });
    }

    function bindActionButtons() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const key = btn.dataset.key;
                const name = btn.dataset.name;

                // 关闭上下文菜单
                document.querySelectorAll('.context-menu-dropdown').forEach(d => d.classList.add('hidden'));

                switch (action) {
                    case 'download': downloadFile(key); break;
                    case 'preview': previewFile(key, name); break;
                    case 'rename': showRenameDialog(key, name); break;
                    case 'delete': showDeleteConfirm(key, name); break;
                    case 'share': shareFile(key, name); break;
                }
            });
        });
    }

    // ===== 文件操作 =====
    function downloadFile(key) {
        const a = document.createElement('a');
        a.href = `/api/download?key=${encodeURIComponent(key)}`;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function shareFile(key, name) {
        try {
            const data = await api('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, name }),
            });
            if (data.url) {
                await navigator.clipboard.writeText(data.url);
                showToast('分享链接已复制到剪贴板', 'success');
            }
        } catch (err) {
            showToast('创建分享失败: ' + err.message, 'error');
        }
    }

    async function previewFile(key, name) {
        const type = getPreviewType(name);
        els.previewTitle.textContent = name;
        els.previewBody.innerHTML = '<div class="loading"><div class="spinner-lg"></div></div>';
        els.previewModal.classList.remove('hidden');

        const url = `/api/download?key=${encodeURIComponent(key)}&preview=1`;

        if (type === 'image') {
            els.previewBody.innerHTML = `<img src="${url}" class="preview-image" alt="${name}">`;
        } else if (type === 'video') {
            els.previewBody.innerHTML = `<video src="${url}" class="preview-video" controls autoplay></video>`;
        } else if (type === 'audio') {
            els.previewBody.innerHTML = `<audio src="${url}" class="preview-audio" controls autoplay></audio>`;
        } else {
            try {
                const resp = await fetch(url);
                const text = await resp.text();
                const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                els.previewBody.innerHTML = `<pre class="preview-text">${escaped}</pre>`;
            } catch {
                els.previewBody.innerHTML = '<p style="text-align:center;color:var(--text-muted)">无法预览此文件</p>';
            }
        }
    }

    function showRenameDialog(key, name) {
        const isFolder = key.endsWith('/');
        els.inputModalTitle.textContent = '重命名';
        els.inputModalValue.value = name;
        els.inputModal.classList.remove('hidden');
        els.inputModalValue.focus();
        els.inputModalValue.select();

        const handleConfirm = async () => {
            const newName = els.inputModalValue.value.trim();
            if (!newName || newName === name) {
                els.inputModal.classList.add('hidden');
                cleanup();
                return;
            }

            let newKey;
            if (isFolder) {
                const parentPath = key.slice(0, key.slice(0, -1).lastIndexOf('/') + 1);
                newKey = parentPath + newName + '/';
            } else {
                const parentPath = key.slice(0, key.lastIndexOf('/') + 1);
                newKey = parentPath + newName;
            }

            try {
                await api('/api/rename', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldKey: key, newKey }),
                });
                showToast('重命名成功', 'success');
                loadFiles();
            } catch { }
            els.inputModal.classList.add('hidden');
            cleanup();
        };

        const cleanup = () => {
            els.inputModalConfirm.removeEventListener('click', handleConfirm);
            els.inputModalValue.removeEventListener('keydown', handleKeydown);
        };

        const handleKeydown = (e) => {
            if (e.key === 'Enter') handleConfirm();
        };

        els.inputModalConfirm.addEventListener('click', handleConfirm);
        els.inputModalValue.addEventListener('keydown', handleKeydown);
    }

    function showNewFolderDialog() {
        els.inputModalTitle.textContent = '新建文件夹';
        els.inputModalValue.value = '';
        els.inputModal.classList.remove('hidden');
        els.inputModalValue.focus();

        const handleConfirm = async () => {
            const name = els.inputModalValue.value.trim();
            if (!name) {
                els.inputModal.classList.add('hidden');
                cleanup();
                return;
            }

            const path = state.currentPath + name;
            try {
                await api('/api/mkdir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path }),
                });
                showToast('文件夹创建成功', 'success');
                loadFiles();
            } catch { }
            els.inputModal.classList.add('hidden');
            cleanup();
        };

        const cleanup = () => {
            els.inputModalConfirm.removeEventListener('click', handleConfirm);
            els.inputModalValue.removeEventListener('keydown', handleKeydown);
        };

        const handleKeydown = (e) => {
            if (e.key === 'Enter') handleConfirm();
        };

        els.inputModalConfirm.addEventListener('click', handleConfirm);
        els.inputModalValue.addEventListener('keydown', handleKeydown);
    }

    function showDeleteConfirm(key, name) {
        els.confirmModalMsg.textContent = `确定要删除 "${name}" 吗？此操作不可撤销。`;
        els.confirmModal.classList.remove('hidden');

        const handleOk = async () => {
            try {
                await api('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key }),
                });
                showToast('删除成功', 'success');
                loadFiles();
            } catch { }
            els.confirmModal.classList.add('hidden');
            cleanup();
        };

        const cleanup = () => {
            els.confirmModalOk.removeEventListener('click', handleOk);
        };

        els.confirmModalOk.addEventListener('click', handleOk);
    }

    // ===== 文件上传 =====
    function uploadFiles(fileList) {
        if (fileList.length === 0) return;

        els.uploadProgress.classList.remove('hidden');

        for (const file of fileList) {
            // 前端校验文件大小
            if (file.size > state.settings.max_file_size) {
                const limitMB = (state.settings.max_file_size / 1024 / 1024).toFixed(0);
                showToast(`文件 "${file.name}" 超出大小限制（最大 ${limitMB} MB）`, 'error');
                continue;
            }

            // 判断是否使用分片上传
            if (state.settings.chunk_enabled && file.size > state.settings.chunk_threshold) {
                uploadChunkedFile(file);
            } else {
                uploadSingleFile(file);
            }
        }
    }

    function uploadSingleFile(file) {
        const itemId = 'upload-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

        const itemHtml = `
      <div class="upload-item" id="${itemId}">
        <div class="upload-item-info">
          <span class="upload-item-name" title="${file.name}">${file.name}</span>
          <span class="upload-item-status">上传中...</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
      </div>
    `;
        els.uploadList.insertAdjacentHTML('beforeend', itemHtml);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', state.currentPath);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                const el = document.getElementById(itemId);
                if (el) {
                    el.querySelector('.progress-fill').style.width = pct + '%';
                    el.querySelector('.upload-item-status').textContent = pct + '%';
                }
            }
        });

        xhr.addEventListener('load', () => {
            const el = document.getElementById(itemId);
            if (el) {
                if (xhr.status === 200) {
                    el.querySelector('.progress-fill').style.width = '100%';
                    el.querySelector('.progress-fill').classList.add('complete');
                    el.querySelector('.upload-item-status').innerHTML = `${SVG.check} 完成`;
                    el.querySelector('.upload-item-status').classList.add('success');
                } else {
                    el.querySelector('.progress-fill').classList.add('error');
                    el.querySelector('.upload-item-status').innerHTML = `${SVG.x} 失败`;
                    el.querySelector('.upload-item-status').classList.add('error');
                }
            }
            loadFiles();
        });

        xhr.addEventListener('error', () => {
            const el = document.getElementById(itemId);
            if (el) {
                el.querySelector('.progress-fill').classList.add('error');
                el.querySelector('.upload-item-status').textContent = '✕ 失败';
                el.querySelector('.upload-item-status').classList.add('error');
            }
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    }

    // ===== 分片上传 =====
    async function uploadChunkedFile(file) {
        const itemId = 'upload-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        const key = state.currentPath ? `${state.currentPath}${file.name}` : file.name;
        const chunkSize = state.settings.chunk_size;
        const totalChunks = Math.ceil(file.size / chunkSize);

        const itemHtml = `
      <div class="upload-item" id="${itemId}">
        <div class="upload-item-info">
          <span class="upload-item-name" title="${file.name}">${file.name}</span>
          <span class="upload-item-status">分片上传中... 0/${totalChunks}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
      </div>
    `;
        els.uploadList.insertAdjacentHTML('beforeend', itemHtml);

        try {
            // 1. 初始化分片上传
            const initResp = await fetch('/api/upload-chunk?action=init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
            });
            const initData = await initResp.json();
            if (!initData.success) throw new Error(initData.error || '初始化失败');

            const { uploadId } = initData;
            const parts = [];

            // 2. 上传每个分片
            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                const partNumber = i + 1;

                const partResp = await fetch(
                    `/api/upload-chunk?action=upload&uploadId=${encodeURIComponent(uploadId)}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`,
                    { method: 'POST', body: chunk }
                );
                const partData = await partResp.json();
                if (!partData.success) throw new Error(partData.error || `分片 ${partNumber} 上传失败`);

                parts.push(partData.part);

                // 更新进度
                const el = document.getElementById(itemId);
                if (el) {
                    const pct = Math.round((partNumber / totalChunks) * 100);
                    el.querySelector('.progress-fill').style.width = pct + '%';
                    el.querySelector('.upload-item-status').textContent = `分片上传中... ${partNumber}/${totalChunks}`;
                }
            }

            // 3. 完成分片上传
            const completeResp = await fetch('/api/upload-chunk?action=complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, uploadId, parts }),
            });
            const completeData = await completeResp.json();
            if (!completeData.success) throw new Error(completeData.error || '合并失败');

            const el = document.getElementById(itemId);
            if (el) {
                el.querySelector('.progress-fill').style.width = '100%';
                el.querySelector('.progress-fill').classList.add('complete');
                el.querySelector('.upload-item-status').innerHTML = `${SVG.check} 完成`;
                el.querySelector('.upload-item-status').classList.add('success');
            }
            loadFiles();
        } catch (err) {
            const el = document.getElementById(itemId);
            if (el) {
                el.querySelector('.progress-fill').classList.add('error');
                el.querySelector('.upload-item-status').innerHTML = `${SVG.x} ${err.message}`;
                el.querySelector('.upload-item-status').classList.add('error');
            }
            showToast(`上传失败: ${err.message}`, 'error');
        }
    }

    // ===== 视图切换 =====
    function switchView(mode) {
        state.viewMode = mode;
        if (mode === 'grid') {
            els.btnGridView.classList.add('active');
            els.btnListView.classList.remove('active');
        } else {
            els.btnGridView.classList.remove('active');
            els.btnListView.classList.add('active');
        }
        loadFiles();
    }

    // ===== 拖拽上传 =====
    let dragCounter = 0;

    function setupDragDrop() {
        const body = document.body;

        body.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (!state.loggedIn) return;
            dragCounter++;
            if (dragCounter === 1) {
                els.dropZone.classList.remove('hidden');
            }
        });

        body.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
                els.dropZone.classList.add('hidden');
            }
        });

        body.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        body.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            els.dropZone.classList.add('hidden');
            if (!state.loggedIn) return;
            if (e.dataTransfer.files.length > 0) {
                uploadFiles(e.dataTransfer.files);
            }
        });
    }

    // ===== 模态框关闭 =====
    function setupModals() {
        // 预览模态框
        els.previewClose.addEventListener('click', () => els.previewModal.classList.add('hidden'));
        els.previewModal.querySelector('.modal-overlay').addEventListener('click', () => els.previewModal.classList.add('hidden'));

        // 输入模态框
        const closeInput = () => els.inputModal.classList.add('hidden');
        els.inputModalClose.addEventListener('click', closeInput);
        els.inputModalCancel.addEventListener('click', closeInput);
        els.inputModal.querySelector('.modal-overlay').addEventListener('click', closeInput);

        // 确认模态框
        const closeConfirm = () => els.confirmModal.classList.add('hidden');
        els.confirmModalClose.addEventListener('click', closeConfirm);
        els.confirmModalCancel.addEventListener('click', closeConfirm);
        els.confirmModal.querySelector('.modal-overlay').addEventListener('click', closeConfirm);

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                els.previewModal.classList.add('hidden');
                els.inputModal.classList.add('hidden');
                els.confirmModal.classList.add('hidden');
            }
        });
    }

    // ===== 初始化 =====
    function init() {
        // 登录表单
        els.loginForm.addEventListener('submit', handleLogin);

        // 退出登录
        els.logoutBtn.addEventListener('click', handleLogout);

        // 上传按钮
        els.btnUpload.addEventListener('click', () => els.fileInput.click());
        els.fileInput.addEventListener('change', () => {
            if (els.fileInput.files.length > 0) {
                uploadFiles(els.fileInput.files);
                els.fileInput.value = '';
            }
        });

        // 新建文件夹
        els.btnNewFolder.addEventListener('click', showNewFolderDialog);

        // 视图切换
        els.btnGridView.addEventListener('click', () => switchView('grid'));
        els.btnListView.addEventListener('click', () => switchView('list'));

        // 关闭上传进度
        els.btnCloseProgress.addEventListener('click', () => {
            els.uploadProgress.classList.add('hidden');
            els.uploadList.innerHTML = '';
        });

        // 拖拽上传
        setupDragDrop();

        // 模态框
        setupModals();

        // 恢复记住的密码
        loadRememberedCredentials();

        // 检查登录状态
        checkAuth();
    }

    // ===== 设置管理 =====
    async function loadSettings() {
        try {
            const data = await api('/api/settings');
            if (data.settings) {
                state.settings = {
                    max_file_size: parseInt(data.settings.max_file_size) || 104857600,
                    chunk_size: parseInt(data.settings.chunk_size) || 5242880,
                    chunk_enabled: data.settings.chunk_enabled === 'true',
                    chunk_threshold: parseInt(data.settings.chunk_threshold) || 10485760,
                    max_storage_size: parseInt(data.settings.max_storage_size) || 1073741824,
                };
            }
        } catch {
            // 使用默认值
        }
    }

    // 启动
    init();
})();
