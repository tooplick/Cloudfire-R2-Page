// GET /api/download?key=xxx
export async function onRequestGet(context) {
    const bucket = context.env.R2_BUCKET;
    const url = new URL(context.request.url);
    const key = url.searchParams.get('key');

    if (!key) {
        return Response.json({ error: '缺少 key 参数' }, { status: 400 });
    }

    const object = await bucket.get(key);
    if (!object) {
        return new Response('文件不存在', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    // 判断是否为预览请求
    const preview = url.searchParams.get('preview');
    if (preview) {
        // 预览模式：inline 显示
        headers.set('Content-Disposition', 'inline');
    } else {
        // 下载模式
        const filename = key.split('/').pop();
        headers.set('Content-Disposition',
            `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    }

    return new Response(object.body, { headers });
}
