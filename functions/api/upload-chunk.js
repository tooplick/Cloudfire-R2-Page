// POST /api/upload-chunk — 分片上传
// action=init: 创建 multipart upload
// action=upload: 上传单个分片
// action=complete: 合并完成

export async function onRequestPost(context) {
    const bucket = context.env.R2_BUCKET;
    const url = new URL(context.request.url);
    const action = url.searchParams.get('action');

    if (action === 'init') {
        // 初始化分片上传
        const { key, contentType } = await context.request.json();
        if (!key) {
            return Response.json({ error: '缺少 key 参数' }, { status: 400 });
        }

        const multipart = await bucket.createMultipartUpload(key, {
            httpMetadata: { contentType: contentType || 'application/octet-stream' },
        });

        return Response.json({
            success: true,
            uploadId: multipart.uploadId,
            key: multipart.key,
        });
    }

    if (action === 'upload') {
        // 上传单个分片
        const partNumber = parseInt(url.searchParams.get('partNumber'));
        const uploadId = url.searchParams.get('uploadId');
        const key = url.searchParams.get('key');

        if (!uploadId || !key || isNaN(partNumber)) {
            return Response.json({ error: '缺少分片参数' }, { status: 400 });
        }

        const multipart = bucket.resumeMultipartUpload(key, uploadId);
        const part = await multipart.uploadPart(partNumber, context.request.body);

        return Response.json({
            success: true,
            part: {
                partNumber: part.partNumber,
                etag: part.etag,
            },
        });
    }

    if (action === 'complete') {
        // 完成分片上传
        const { key, uploadId, parts } = await context.request.json();

        if (!key || !uploadId || !parts) {
            return Response.json({ error: '缺少完成参数' }, { status: 400 });
        }

        const multipart = bucket.resumeMultipartUpload(key, uploadId);
        await multipart.complete(parts);

        return Response.json({ success: true, key });
    }

    if (action === 'abort') {
        // 中止分片上传
        const { key, uploadId } = await context.request.json();

        if (!key || !uploadId) {
            return Response.json({ error: '缺少参数' }, { status: 400 });
        }

        const multipart = bucket.resumeMultipartUpload(key, uploadId);
        await multipart.abort();

        return Response.json({ success: true });
    }

    return Response.json({ error: '未知操作' }, { status: 400 });
}
