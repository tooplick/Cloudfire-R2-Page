// POST /api/share — 创建分享链接 { key, name, expiresIn? }
// GET  /api/share — 列出所有分享链接
// DELETE /api/share — 删除分享链接 { id }

import { ensureTables } from './_db.js';

function generateId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const arr = new Uint8Array(12);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => chars[b % chars.length]).join('');
}

export async function onRequestPost(context) {
    const db = context.env.DB;
    try {
        await ensureTables(db);
        const { key, name, expiresIn } = await context.request.json();

        if (!key || !name) {
            return Response.json({ error: '缺少文件参数' }, { status: 400 });
        }

        const id = generateId();
        let expiresAt = null;
        if (expiresIn && expiresIn > 0) {
            expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        }

        await db.prepare(
            'INSERT INTO shares (id, file_key, file_name, expires_at) VALUES (?, ?, ?, ?)'
        ).bind(id, key, name, expiresAt).run();

        const url = new URL(context.request.url);
        const shareUrl = `${url.origin}/s/${id}`;

        return Response.json({ success: true, id, url: shareUrl });
    } catch (err) {
        return Response.json({ error: '创建分享失败: ' + err.message }, { status: 500 });
    }
}

export async function onRequestGet(context) {
    const db = context.env.DB;
    try {
        await ensureTables(db);
        const result = await db.prepare(
            'SELECT id, file_key, file_name, created_at, expires_at, download_count FROM shares ORDER BY created_at DESC'
        ).all();

        return Response.json({ success: true, shares: result.results || [] });
    } catch (err) {
        return Response.json({ success: true, shares: [] });
    }
}

export async function onRequestDelete(context) {
    const db = context.env.DB;
    try {
        await ensureTables(db);
        const { id } = await context.request.json();

        if (!id) {
            return Response.json({ error: '缺少 id' }, { status: 400 });
        }

        await db.prepare('DELETE FROM shares WHERE id = ?').bind(id).run();
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: '删除失败: ' + err.message }, { status: 500 });
    }
}
