// GET /api/list?path=xxx
export async function onRequestGet(context) {
    const bucket = context.env.R2_BUCKET;
    const url = new URL(context.request.url);
    const prefix = url.searchParams.get('path') || '';

    const listed = await bucket.list({
        prefix: prefix,
        delimiter: '/',
    });

    const folders = (listed.delimitedPrefixes || []).map(p => ({
        name: p.replace(prefix, '').replace(/\/$/, ''),
        path: p,
    }));

    const files = listed.objects
        .filter(obj => obj.key !== prefix) // 排除目录本身的占位符
        .map(obj => ({
            key: obj.key,
            name: obj.key.replace(prefix, ''),
            size: obj.size,
            uploaded: obj.uploaded,
            type: obj.httpMetadata?.contentType || 'application/octet-stream',
        }));

    return Response.json({ folders, files });
}
