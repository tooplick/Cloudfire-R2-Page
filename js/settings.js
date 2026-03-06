/* ===== 设置页面逻辑 ===== */
(function () {
    'use strict';

    const $ = (sel) => document.querySelector(sel);

    // ===== Toast 通知 =====
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        };
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
        $('#toast-container').appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== API =====
    async function api(path, options = {}) {
        const resp = await fetch(path, options);
        if (resp.status === 401) {
            window.location.href = '/';
            throw new Error('未登录');
        }
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || `请求失败 (${resp.status})`);
        return data;
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // ===== 设置状态 =====
    let settings = {
        max_file_size: 104857600,
        chunk_size: 5242880,
        chunk_enabled: true,
        chunk_threshold: 10485760,
        max_storage_size: 1073741824,
    };

    // ===== 加载设置 =====
    async function loadSettings() {
        try {
            const data = await api('/api/settings');
            if (data.settings) {
                settings = {
                    max_file_size: parseInt(data.settings.max_file_size) || 104857600,
                    chunk_size: parseInt(data.settings.chunk_size) || 5242880,
                    chunk_enabled: data.settings.chunk_enabled === 'true',
                    chunk_threshold: parseInt(data.settings.chunk_threshold) || 10485760,
                    max_storage_size: parseInt(data.settings.max_storage_size) || 1073741824,
                };
            }
            populateForm();
        } catch {
            populateForm();
        }
    }

    // ===== 填充表单 =====
    function populateForm() {
        // 单文件大小
        const fileSizeUnit = settings.max_file_size >= 1073741824 ? 1073741824 : 1048576;
        $('#set-max-file-size').value = (settings.max_file_size / fileSizeUnit).toFixed(fileSizeUnit === 1073741824 ? 1 : 0);
        $('#set-max-file-size-unit').value = fileSizeUnit;

        // 总存储空间
        const storageUnit = settings.max_storage_size >= 1099511627776 ? 1099511627776 : 1073741824;
        $('#set-max-storage-size').value = (settings.max_storage_size / storageUnit).toFixed(1);
        $('#set-max-storage-size-unit').value = storageUnit;

        // 分片上传
        $('#set-chunk-enabled').checked = settings.chunk_enabled;
        $('#set-chunk-threshold').value = Math.round(settings.chunk_threshold / 1048576);
        $('#set-chunk-size').value = Math.round(settings.chunk_size / 1048576);

        updateChunkState();
    }

    function updateChunkState() {
        const enabled = $('#set-chunk-enabled').checked;
        const el = $('#chunk-settings');
        if (enabled) {
            el.classList.remove('disabled');
        } else {
            el.classList.add('disabled');
        }
    }

    function collectForm() {
        const fileSizeUnit = parseInt($('#set-max-file-size-unit').value);
        const fileSizeVal = parseFloat($('#set-max-file-size').value) || 100;
        const storageUnit = parseInt($('#set-max-storage-size-unit').value);
        const storageVal = parseFloat($('#set-max-storage-size').value) || 1;

        return {
            max_file_size: String(Math.round(fileSizeVal * fileSizeUnit)),
            max_storage_size: String(Math.round(storageVal * storageUnit)),
            chunk_enabled: String($('#set-chunk-enabled').checked),
            chunk_threshold: String((parseInt($('#set-chunk-threshold').value) || 10) * 1048576),
            chunk_size: String(Math.max(5, parseInt($('#set-chunk-size').value) || 5) * 1048576),
        };
    }

    // ===== 保存设置 =====
    async function handleSave() {
        const data = collectForm();
        try {
            const resp = await api('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: data }),
            });
            if (resp.settings) {
                settings = {
                    max_file_size: parseInt(resp.settings.max_file_size) || 104857600,
                    chunk_size: parseInt(resp.settings.chunk_size) || 5242880,
                    chunk_enabled: resp.settings.chunk_enabled === 'true',
                    chunk_threshold: parseInt(resp.settings.chunk_threshold) || 10485760,
                    max_storage_size: parseInt(resp.settings.max_storage_size) || 1073741824,
                };
            }
            showToast('设置已保存', 'success');
        } catch (err) {
            showToast('保存失败: ' + err.message, 'error');
        }
    }

    // ===== 重置默认 =====
    async function handleReset() {
        const defaults = {
            max_file_size: '104857600',
            chunk_size: '5242880',
            chunk_enabled: 'true',
            chunk_threshold: '10485760',
            max_storage_size: '1073741824',
        };
        try {
            await api('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: defaults }),
            });
            settings = {
                max_file_size: 104857600,
                chunk_size: 5242880,
                chunk_enabled: true,
                chunk_threshold: 10485760,
                max_storage_size: 1073741824,
            };
            populateForm();
            loadStorageUsage();
            showToast('已恢复默认设置', 'success');
        } catch (err) {
            showToast('重置失败: ' + err.message, 'error');
        }
    }

    // ===== 存储用量 =====
    async function loadStorageUsage() {
        try {
            const data = await api('/api/storage');
            const used = data.storage.usedSize;
            const fileCount = data.storage.fileCount;
            const limit = settings.max_storage_size;

            $('#storage-used').textContent = `已用 ${formatSize(used)}`;
            $('#storage-detail').textContent = `${fileCount} 个文件`;

            if (limit > 0) {
                const pct = Math.min((used / limit) * 100, 100);
                $('#storage-total').textContent = `共 ${formatSize(limit)}`;
                const fill = $('#storage-bar-fill');
                fill.style.width = pct.toFixed(1) + '%';
                fill.classList.remove('warning', 'danger');
                if (pct > 90) fill.classList.add('danger');
                else if (pct > 70) fill.classList.add('warning');
            } else {
                $('#storage-total').textContent = '不限制';
                $('#storage-bar-fill').style.width = '0%';
            }
        } catch {
            $('#storage-used').textContent = '无法获取';
        }
    }

    // ===== 检查登录状态 =====
    async function checkAuth() {
        try {
            const data = await api('/auth/login');
            if (data.loggedIn) {
                const userSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                $('#user-info').innerHTML = `${userSvg} ${data.username}`;
                loadSettings().then(() => loadStorageUsage());
            } else {
                window.location.href = '/';
            }
        } catch {
            window.location.href = '/';
        }
    }

    // ===== 初始化 =====
    function init() {
        $('#settings-save').addEventListener('click', handleSave);
        $('#settings-reset').addEventListener('click', handleReset);
        $('#set-chunk-enabled').addEventListener('change', updateChunkState);
        checkAuth();
    }

    init();
})();
