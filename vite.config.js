import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        // 我们的页面会用 wrangler dev 启动后端的 :8788
        // 如果用 vite 启动前端，我们需要配置 proxy 将 /api 和 /auth 请求代理给后端
        proxy: {
            '^/(api|auth|s)/.*': {
                target: 'http://localhost:8788',
                changeOrigin: true
            }
        }
    }
})
