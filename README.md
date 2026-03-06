# ☁️ CloudDrive

基于 **Cloudflare Pages + R2** 的个人云盘系统，支持文件上传、下载、浏览、预览和管理。

## ✨ 功能

- 🔐 用户名密码登录（环境变量配置）
- 📂 文件/文件夹浏览（列表/网格视图）
- 📤 文件上传（支持拖拽 + 多文件 + 进度条）
- 📥 文件下载
- 👁️ 文件预览（图片/视频/音频/文本代码）
- 📁 新建文件夹
- ✏️ 文件重命名
- 🗑️ 文件/文件夹删除（递归）
- 🍞 面包屑路径导航
- 🌙 深色玻璃态 UI，响应式适配移动端

## 📁 项目结构

```
Cloudfire-R2-Page/
├── index.html                 # 主页面
├── style.css                  # 样式（深色玻璃态主题）
├── script.js                  # 前端逻辑
├── functions/                 # Pages Functions（后端 API）
│   ├── _middleware.js         # 全局认证中间件
│   ├── api/
│   │   ├── list.js            # GET  /api/list?path=xxx
│   │   ├── upload.js          # POST /api/upload
│   │   ├── download.js        # GET  /api/download?key=xxx
│   │   ├── delete.js          # POST /api/delete
│   │   ├── mkdir.js           # POST /api/mkdir
│   │   └── rename.js          # POST /api/rename
│   └── auth/
│       ├── login.js           # POST /auth/login
│       └── logout.js          # GET  /auth/logout
├── wrangler.toml              # R2 绑定配置
├── package.json
└── _headers                   # HTTP 安全响应头
```

## 🚀 部署

### 1. 创建 R2 Bucket

在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 中创建一个 R2 存储桶，并修改 `wrangler.toml` 中的 `bucket_name`：

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "你的桶名称"
```

### 2. 配置环境变量

在 Cloudflare Pages 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例 |
|---|---|---|
| `AUTH_USERNAME` | 登录用户名 | `admin` |
| `AUTH_PASSWORD` | 登录密码 | `your-password` |
| `SESSION_SECRET` | Session 加密密钥 | `随机字符串` |

### 3. 部署

连接 GitHub 仓库到 Cloudflare Pages，推送即自动部署：

```bash
git push
```

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（需配置环境变量）
$env:AUTH_USERNAME='admin'
$env:AUTH_PASSWORD='admin123'
$env:SESSION_SECRET='test-secret'
npm run dev
```

## 📝 License

[MIT](LICENSE)