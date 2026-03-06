import { ElMessage } from 'element-plus'

/**
 * 封装与后端的 API 请求
 */
export async function api(path, options = {}) {
    try {
        const resp = await fetch(path, options)

        // 登录鉴权失败
        if (resp.status === 401) {
            throw new Error('未登录')
        }

        // 检查响应类型（针对 D1 未初始化或 worker 挂了返回 HTML 错误页的情况）
        const ct = resp.headers.get('Content-Type') || ''
        if (!ct.includes('application/json')) {
            throw new Error(`服务端错误 (${resp.status})`)
        }

        const data = await resp.json()
        if (!resp.ok) {
            throw new Error(data.error || `请求失败 (${resp.status})`)
        }

        return data
    } catch (err) {
        if (err.message !== '未登录') {
            ElMessage.error(err.message)
        }
        throw err
    }
}
