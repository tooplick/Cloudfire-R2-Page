// POST /api/delete — Body: { key } 或 { keys: [...] }
export async function onRequestPost(context) {
    const bucket = context.env.R2_BUCKET;
    const body = await context.request.json();

    // 支持单个删除和批量删除
    const keys = body.keys || (body.key ? [body.key] : []);

    if (keys.length === 0) {
        return Response.json({ error: '缺少 key 参数' }, { status: 400 });
    }

    const results = [];

    for (const key of keys) {
        // 如果是文件夹（以 / 结尾），递归删除所有子文件
        if (key.endsWith('/')) {
            let cursor;
            do {
                const listed = await bucket.list({ prefix: key, cursor });
                if (listed.objects.length > 0) {
                    await bucket.delete(listed.objects.map(o => o.key));
                }
                cursor = listed.truncated ? listed.cursor : null;
            } while (cursor);
            // 删除文件夹占位符本身
            await bucket.delete(key);
        } else {
            await bucket.delete(key);
        }
        results.push(key);
    }

    return Response.json({ success: true, deleted: results });
}
