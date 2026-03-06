# Cloudfire R2 Page

基于 **Cloudflare Pages**, **R2**, **D1** 和 **Vue 3 + Element Plus** 构建的轻量级无服务器云盘系统。

## ✨ 特性

- **Serverless 架构**: 前后端全部部署在 Cloudflare Pages / Functions，零服务器成本，免去服务器维护烦恼。
- **现代化前端**: 基于 Vue 3 Composition API, Vite 开发，结合 Element Plus 打造了操作流畅、体验优秀的类本地文件管理器界面。
- **超大文件分片上传**: 支持前端直传 R2。当文件超过设定阈值时，自动调用 R2 的 Multipart Upload API，稳定上传 GB 级超大文件。
- **后台存储控制**: 可以通过 D1 数据库配置单文件大小限制、总存储容量限制，以及触发分片上传的参数。
- **拖拽上传**: 提供拖拽上传交互区与上传任务列表，方便追踪进度。
- **文件夹全生命周期**: 支持新建文件夹、文件浏览、重命名、删除、基础预览以及生成临时分享链接等网盘基础功能。

## 🚀 部署指南

### 1. 准备 Cloudflare 资源
在开始部署前，你需要在 Cloudflare Dashboard 中创建以下资源：
- **R2 存储桶**: 创建一个存储桶（如 `cloudfire-r2-data`）。
- **D1 数据库**: 创建一个 D1 数据库用来存储系统设置（如 `cloudfire-config`）。
- 从 D1 设置页面获取对应的 `database_id`。

### 2. 克隆项目与配置
```bash
git clone https://github.com/your-username/Cloudfire-R2-Page.git
cd Cloudfire-R2-Page
npm install
```

打开项目根目录下的 `wrangler.toml` 文件并修改绑定：
```toml
name = "cloudfire-r2-page"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "你的_R2_存储桶名称"

[[d1_databases]]
binding = "DB"
database_name = "你的_D1_数据库名称"
database_id = "你的_D1_database_id"
```

### 3. 配置 D1 数据库表

利用 Wrangler 在你的 D1 数据库中初始化数据表配置：
```bash
npx wrangler d1 execute DB --file=./schema.sql --remote
```
*(注意替换 DB 为你在 `wrangler.toml` 中配置的绑定名)*

### 4. 设置环境变量
进入项目在 Cloudflare Pages 的设置面板（**Settings** -> **Environment variables**），配置以下生产环境变量：
- `AUTH_USERNAME`: 管理员登录账号
- `AUTH_PASSWORD`: 管理员登录密码
- `SESSION_SECRET`: 极具复杂度的长字符串，用于对 Session Token 进行加密使用。

### 5. 一键部署
你可以连接 Github 让 Cloudflare Pages 自动部署，或者使用命令行进行推送：
构建前端：
```bash
npm run build
```
部署到 Cloudflare Pages：
```bash
npx wrangler pages deploy dist
```

## 💻 本地开发指南

由于 Cloudflare Pages Functions 的特性，本地开发推荐使用 Wrangler CLI 搭配模拟的 R2 和 D1 环境。

```bash
# 1. 运行 Vite 前端项目预构建 (观察打包是否正常)
npm run build

# 2. 启动 Wrangler 模拟环境
npx wrangler pages dev dist
```

当 `wrangler dev` 启动后，终端会打印出一个本地域名，例如 `http://localhost:8788`，浏览器直接访问该链接即可进行全栈本地调试（注意本地调试使用的 R2 和 D1 都是 Wrangler 虚构的模拟环境，不会产生计费，也不会影响线上数据）。

## 🗂 项目结构

```
Cloudfire-R2-Page/
├── functions/             # Cloudflare Pages API 后端路由 (Serverless Functions)
│   ├── _middleware.js     # 全局请求拦截与 Session 鉴权校验逻辑
│   ├── api/               # 业务接口: /api/list, /api/mkdir, /api/upload-chunk 等
│   └── auth/              # 权限接口: 登录鉴权，颁发 Session
├── src/                   # Vue 3 前端源码
│   ├── api.js             # axios/fetch 接口封装与通用错误拦截
│   ├── upload.js          # R2 直传与分片上传核心逻辑抽象
│   ├── views/             # 页面组件 (HomeView, SettingsView)
│   └── components/        # 公共组件 (LoginOverlay)
├── _legacy_vanilla/       # 老旧的 Vanilla/原生 JS/HTML 历史备份代码
├── schema.sql             # 系统配置 D1 数据库初始化表结构
└── wrangler.toml          # Cloudflare 资源绑定与环境配置
```

## 协议
MIT License
