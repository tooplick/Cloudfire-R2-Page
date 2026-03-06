// POST /api/mkdir — Body: { path }
export async function onRequestPost(context) {
    const bucket = context.env.R2_BUCKET;
    const body = await context.request.json();
    let path = body.path;

    if (!path) {
        return Response.json({ error: '缺少 path 参数' }, { status: 400 });
    }

    // 确保路径以 / 结尾
    if (!path.endsWith('/')) {
        path += '/';
    }

    // 创建一个空对象作为文件夹占位符
    await bucket.put(path, new Uint8Array(0), {
        httpMetadata: { contentType: 'application/x-directory' },
    });

    return Response.json({ success: true, path });
}
