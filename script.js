/* ===== CloudDrive 前端逻辑 ===== */

(function () {
    'use strict';

    // ===== 状态管理 =====
    const state = {
        currentPath: '',
        viewMode: 'grid', // 'grid' | 'list'
        loggedIn: false,
        username: '',
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

    function getFileIcon(name, type) {
        const ext = name.split('.').pop().toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'];
        const videoExts = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'];
        const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
        const codeExts = ['js', 'ts', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'toml', 'md', 'sh', 'bat'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];
        const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

        if (imageExts.includes(ext)) return '🖼️';
        if (videoExts.includes(ext)) return '🎬';
        if (audioExts.includes(ext)) return '🎵';
        if (codeExts.includes(ext)) return '💻';
        if (archiveExts.includes(ext)) return '📦';
        if (docExts.includes(ext)) return '📄';
        return '📄';
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
        const icons = { success: '✓', error: '✕', info: 'ℹ' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
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
        els.usernameInput.value = '';
        els.passwordInput.value = '';
    }

    function showAppPage() {
        els.loginPage.classList.add('hidden');
        els.appPage.classList.remove('hidden');
        els.userInfo.textContent = `👤 ${state.username}`;
        loadFiles();
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
        let html = '<a href="#" data-path="" class="breadcrumb-item">📁 根目录</a>';

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
              <button class="btn btn-icon context-menu-trigger" onclick="event.stopPropagation()">⋯</button>
              <div class="context-menu-dropdown hidden">
                <button class="context-menu-item" data-action="rename" data-key="${folder.path}" data-name="${folder.name}">✏️ 重命名</button>
                <button class="context-menu-item danger" data-action="delete" data-key="${folder.path}" data-name="${folder.name}">🗑️ 删除</button>
              </div>
            </div>
          </div>
          <span class="file-card-icon">📁</span>
          <span class="file-card-name">${folder.name}</span>
        </div>
      `;
        }

        // 渲染文件
        for (const file of files) {
            const icon = getFileIcon(file.name, file.type);
            html += `
        <div class="file-card" data-type="file" data-key="${file.key}" data-name="${file.name}">
          <div class="file-card-actions">
            <div class="context-menu">
              <button class="btn btn-icon context-menu-trigger" onclick="event.stopPropagation()">⋯</button>
              <div class="context-menu-dropdown hidden">
                <button class="context-menu-item" data-action="download" data-key="${file.key}">📥 下载</button>
                ${isPreviewable(file.name) ? `<button class="context-menu-item" data-action="preview" data-key="${file.key}" data-name="${file.name}">👁️ 预览</button>` : ''}
                <button class="context-menu-item" data-action="rename" data-key="${file.key}" data-name="${file.name}">✏️ 重命名</button>
                <button class="context-menu-item danger" data-action="delete" data-key="${file.key}" data-name="${file.name}">🗑️ 删除</button>
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
          <span class="col-name"><span>📁</span><span>${folder.name}</span></span>
          <span class="col-size">-</span>
          <span class="col-time">-</span>
          <span class="col-actions">
            <button class="btn btn-icon" data-action="rename" data-key="${folder.path}" data-name="${folder.name}" title="重命名">✏️</button>
            <button class="btn btn-icon" data-action="delete" data-key="${folder.path}" data-name="${folder.name}" title="删除">🗑️</button>
          </span>
        </div>
      `;
        }

        for (const file of files) {
            const icon = getFileIcon(file.name, file.type);
            html += `
        <div class="file-list-row" data-type="file" data-key="${file.key}" data-name="${file.name}">
          <span class="col-name"><span>${icon}</span><span>${file.name}</span></span>
          <span class="col-size">${formatSize(file.size)}</span>
          <span class="col-time">${formatTime(file.uploaded)}</span>
          <span class="col-actions">
            ${isPreviewable(file.name) ? `<button class="btn btn-icon" data-action="preview" data-key="${file.key}" data-name="${file.name}" title="预览">👁️</button>` : ''}
            <button class="btn btn-icon" data-action="download" data-key="${file.key}" title="下载">📥</button>
            <button class="btn btn-icon" data-action="rename" data-key="${file.key}" data-name="${file.name}" title="重命名">✏️</button>
            <button class="btn btn-icon" data-action="delete" data-key="${file.key}" data-name="${file.name}" title="删除">🗑️</button>
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
            uploadSingleFile(file);
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
                    el.querySelector('.upload-item-status').textContent = '✓ 完成';
                    el.querySelector('.upload-item-status').classList.add('success');
                } else {
                    el.querySelector('.progress-fill').classList.add('error');
                    el.querySelector('.upload-item-status').textContent = '✕ 失败';
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

        // 检查登录状态
        checkAuth();
    }

    // 启动
    init();
})();
