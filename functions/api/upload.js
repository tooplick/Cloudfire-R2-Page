// POST /api/upload — FormData: file, path
export async function onRequestPost(context) {
    const bucket = context.env.R2_BUCKET;
    const formData = await context.request.formData();
    const file = formData.get('file');
    const path = formData.get('path') || '';

    if (!file || !file.name) {
        return Response.json({ error: '未选择文件' }, { status: 400 });
    }

    const key = path ? `${path}${file.name}` : file.name;

    await bucket.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });

    return Response.json({ success: true, key });
}
