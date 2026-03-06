// POST /api/upload — FormData: file, path
import { ensureTables } from './_db.js';

export async function onRequestPost(context) {
    const bucket = context.env.R2_BUCKET;
    const db = context.env.DB;

    // 读取配置限制
    let maxFileSize = 104857600; // 默认 100MB
    let maxStorageSize = 1073741824; // 默认 1GB
    try {
        await ensureTables(db);
        const result = await db.prepare(
            "SELECT key, value FROM settings WHERE key IN ('max_file_size', 'max_storage_size')"
        ).all();
        if (result.results) {
            for (const row of result.results) {
                if (row.key === 'max_file_size') maxFileSize = parseInt(row.value);
                if (row.key === 'max_storage_size') maxStorageSize = parseInt(row.value);
            }
        }
    } catch {
        // D1 不可用时使用默认值
    }

    const formData = await context.request.formData();
    const file = formData.get('file');
    const path = formData.get('path') || '';

    if (!file || !file.name) {
        return Response.json({ error: '未选择文件' }, { status: 400 });
    }

    // 单文件大小限制
    if (file.size > maxFileSize) {
        const limitMB = (maxFileSize / 1024 / 1024).toFixed(0);
        return Response.json(
            { error: `文件大小超出限制（最大 ${limitMB} MB）` },
            { status: 413 }
        );
    }

    // 总存储空间限制
    if (maxStorageSize > 0) {
        let totalSize = 0;
        let cursor;
        do {
            const listed = await bucket.list({ cursor, limit: 500 });
            for (const obj of listed.objects) {
                totalSize += obj.size;
            }
            cursor = listed.truncated ? listed.cursor : null;
        } while (cursor);

        if (totalSize + file.size > maxStorageSize) {
            const limitGB = (maxStorageSize / 1024 / 1024 / 1024).toFixed(1);
            return Response.json(
                { error: `存储空间不足（总空间限制 ${limitGB} GB）` },
                { status: 413 }
            );
        }
    }

    const key = path ? `${path}${file.name}` : file.name;

    await bucket.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });

    return Response.json({ success: true, key });
}
