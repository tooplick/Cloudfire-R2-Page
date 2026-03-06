// GET /api/settings — 读取所有配置
// POST /api/settings — 批量更新配置

import { ensureTables } from './_db.js';

const DEFAULT_SETTINGS = {
    max_file_size: '104857600',       // 100MB
    chunk_size: '5242880',            // 5MB
    chunk_enabled: 'true',
    chunk_threshold: '10485760',      // 10MB
    max_storage_size: '1073741824',   // 1GB
};

async function getAllSettings(db) {
    const result = await db.prepare('SELECT key, value FROM settings').all();
    const settings = { ...DEFAULT_SETTINGS };
    if (result.results) {
        for (const row of result.results) {
            settings[row.key] = row.value;
        }
    }
    return settings;
}

export async function onRequestGet(context) {
    const db = context.env.DB;
    try {
        await ensureTables(db);
        const settings = await getAllSettings(db);
        return Response.json({ success: true, settings });
    } catch (err) {
        // 如果 D1 不可用或表不存在，返回默认值
        return Response.json({ success: true, settings: DEFAULT_SETTINGS });
    }
}

export async function onRequestPost(context) {
    const db = context.env.DB;
    try {
        await ensureTables(db);
        const body = await context.request.json();
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return Response.json({ error: '无效的设置数据' }, { status: 400 });
        }

        // 只允许更新已知的配置键
        const allowedKeys = Object.keys(DEFAULT_SETTINGS);
        const updates = [];

        for (const [key, value] of Object.entries(settings)) {
            if (allowedKeys.includes(key)) {
                updates.push(
                    db.prepare(
                        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
                     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
                    ).bind(key, String(value))
                );
            }
        }

        if (updates.length > 0) {
            await db.batch(updates);
        }

        const current = await getAllSettings(db);
        return Response.json({ success: true, settings: current });
    } catch (err) {
        return Response.json({ error: '保存失败: ' + err.message }, { status: 500 });
    }
}
