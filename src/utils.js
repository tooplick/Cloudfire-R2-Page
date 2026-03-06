/**
 * 格式化文件大小
 */
export function formatSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 格式化时间
 */
export function formatTime(dateStr) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 获取文件图标名称
 */
export function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase()
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp']
    const videoExts = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv']
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']
    const codeExts = ['js', 'ts', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'toml', 'md', 'sh', 'bat']
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']

    if (imageExts.includes(ext)) return 'Picture'
    if (videoExts.includes(ext)) return 'VideoCamera'
    if (audioExts.includes(ext)) return 'Headset'
    if (codeExts.includes(ext)) return 'DataBoard'
    if (archiveExts.includes(ext)) return 'Box'
    if (docExts.includes(ext)) return 'Document'
    return 'Files'
}

/**
 * 检查是否支持预览
 */
export function isPreviewable(name) {
    const ext = name.split('.').pop().toLowerCase()
    const previewExts = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp',
        'mp4', 'webm', 'mov',
        'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',
        'txt', 'md', 'json', 'js', 'ts', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h',
        'css', 'html', 'xml', 'yaml', 'yml', 'toml', 'sh', 'bat', 'log', 'csv',
    ]
    return previewExts.includes(ext)
}

/**
 * 获取预览类型
 */
export function getPreviewType(name) {
    const ext = name.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) return 'audio'
    return 'text'
}
