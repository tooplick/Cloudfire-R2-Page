// POST /api/rename — Body: { oldKey, newKey }
export async function onRequestPost(context) {
    const bucket = context.env.R2_BUCKET;
    const body = await context.request.json();
    const { oldKey, newKey } = body;

    if (!oldKey || !newKey) {
        return Response.json({ error: '缺少 oldKey 或 newKey 参数' }, { status: 400 });
    }

    // 如果是文件夹（以 / 结尾），需要递归重命名所有子文件
    if (oldKey.endsWith('/')) {
        let cursor;
        do {
            const listed = await bucket.list({ prefix: oldKey, cursor });
            for (const obj of listed.objects) {
                const newObjKey = obj.key.replace(oldKey, newKey);
                const srcObj = await bucket.get(obj.key);
                if (srcObj) {
                    const headers = {};
                    if (srcObj.httpMetadata) {
                        headers.httpMetadata = srcObj.httpMetadata;
                    }
                    await bucket.put(newObjKey, srcObj.body, headers);
                    await bucket.delete(obj.key);
                }
            }
            cursor = listed.truncated ? listed.cursor : null;
        } while (cursor);
    } else {
        // 单文件重命名：复制到新 key，删除旧 key
        const srcObj = await bucket.get(oldKey);
        if (!srcObj) {
            return Response.json({ error: '源文件不存在' }, { status: 404 });
        }

        const putOptions = {};
        if (srcObj.httpMetadata) {
            putOptions.httpMetadata = srcObj.httpMetadata;
        }
        await bucket.put(newKey, srcObj.body, putOptions);
        await bucket.delete(oldKey);
    }

    return Response.json({ success: true, oldKey, newKey });
}
