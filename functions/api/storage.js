// GET /api/storage — 统计 R2 已用空间
export async function onRequestGet(context) {
    const bucket = context.env.R2_BUCKET;

    let totalSize = 0;
    let totalFiles = 0;
    let cursor;

    do {
        const listed = await bucket.list({ cursor, limit: 500 });
        for (const obj of listed.objects) {
            totalSize += obj.size;
            totalFiles++;
        }
        cursor = listed.truncated ? listed.cursor : null;
    } while (cursor);

    return Response.json({
        success: true,
        storage: {
            usedSize: totalSize,
            fileCount: totalFiles,
        },
    });
}
