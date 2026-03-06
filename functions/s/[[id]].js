// GET /s/:id — 公开下载分享文件（无需登录）

import { ensureTables } from '../api/_db.js';

export async function onRequest(context) {
    const db = context.env.DB;
    const bucket = context.env.R2_BUCKET;
    const url = new URL(context.request.url);

    // 提取分享 ID: /s/xxxxx
    const id = url.pathname.replace('/s/', '').replace(/\/$/, '');

    if (!id) {
        return new Response('无效的分享链接', { status: 400 });
    }

    try {
        await ensureTables(db);

        // 查询分享记录
        const share = await db.prepare(
            'SELECT id, file_key, file_name, expires_at, download_count FROM shares WHERE id = ?'
        ).bind(id).first();

        if (!share) {
            return new Response('分享链接不存在或已被删除', { status: 404 });
        }

        // 检查过期
        if (share.expires_at && new Date(share.expires_at) < new Date()) {
            return new Response('分享链接已过期', { status: 410 });
        }

        // 获取文件
        const object = await bucket.get(share.file_key);
        if (!object) {
            return new Response('文件不存在', { status: 404 });
        }

        // 更新下载计数
        await db.prepare(
            'UPDATE shares SET download_count = download_count + 1 WHERE id = ?'
        ).bind(id).run();

        // 返回文件
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        const filename = share.file_name;
        headers.set('Content-Disposition',
            `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);

        return new Response(object.body, { headers });
    } catch (err) {
        return new Response('服务错误: ' + err.message, { status: 500 });
    }
}
