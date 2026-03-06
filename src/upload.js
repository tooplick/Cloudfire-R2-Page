import { api } from './api'

/**
 * 云盘大文件分片上传核心逻辑
 * @param {File} file 文件对象
 * @param {string} currentPath 当前上传路径 
 * @param {Object} settings 系统配置信息 (chunk_size 等)
 * @param {Function} onProgress 进度回调 (percentage: number, statusText: string)
 * @returns {Promise} 
 */
export async function uploadChunkedFile(file, currentPath, settings, onProgress) {
    const key = currentPath ? `${currentPath}${file.name}` : file.name
    const chunkSize = settings.chunk_size || 5242880
    const totalChunks = Math.ceil(file.size / chunkSize)

    onProgress(0, `初始化上传 0/${totalChunks}`)

    try {
        // 1. 初始化分片上传
        const initResp = await fetch('/api/upload-chunk?action=init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
        })
        const initData = await initResp.json()
        if (!initData.success) throw new Error(initData.error || '初始化失败')

        const { uploadId } = initData
        const parts = []

        // 2. 上传每个分片
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize
            const end = Math.min(start + chunkSize, file.size)
            const chunk = file.slice(start, end)
            const partNumber = i + 1

            const partResp = await fetch(
                `/api/upload-chunk?action=upload&uploadId=${encodeURIComponent(uploadId)}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`,
                { method: 'POST', body: chunk }
            )
            const partData = await partResp.json()
            if (!partData.success) throw new Error(partData.error || `分片 ${partNumber} 上传失败`)

            parts.push(partData.part)

            // 汇报进度
            const pct = Math.round((partNumber / totalChunks) * 100)
            onProgress(pct, `上传中 ${partNumber}/${totalChunks}`)
        }

        // 3. 完成分片上传
        onProgress(100, `合并分片中...`)
        const completeResp = await fetch('/api/upload-chunk?action=complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, uploadId, parts }),
        })
        const completeData = await completeResp.json()
        if (!completeData.success) throw new Error(completeData.error || '合并失败')

        onProgress(100, `上传成功`)
        return true
    } catch (err) {
        onProgress(0, `失败: ${err.message}`)
        throw err
    }
}

/**
 * 原生单文件直传
 */
export function uploadSingleFile(file, currentPath, onProgress) {
    return new Promise((resolve, reject) => {
        onProgress(0, '上传准备中')
        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', currentPath)

        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100)
                onProgress(pct, `上传中 ${pct}%`)
            }
        })

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                onProgress(100, '上传完成')
                resolve()
            } else {
                const errStr = `上传失败 (${xhr.status})`
                onProgress(0, errStr)
                reject(new Error(errStr))
            }
        })

        xhr.addEventListener('error', () => {
            onProgress(0, '传输错误')
            reject(new Error('传输错误'))
        })

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
    })
}
