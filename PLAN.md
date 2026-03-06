# Cloudflare R2 云盘 — 项目方案

## 一、项目概述

基于 **Cloudflare Pages** 构建个人云盘系统，使用 **Cloudflare R2** 作为存储后端，通过 Web 界面实现文件的上传、下载、浏览和管理。

---

## 二、技术选型：Cloudflare Pages

| 对比维度 | Pages | Worker |
|---|---|---|
| 前端托管 | ✅ 内置静态资源托管 | ❌ 需手动返回 HTML |
| 后端逻辑 | ✅ `functions/` 目录自动路由 | ✅ 原生支持 |
| R2 绑定 | ✅ 完整支持 | ✅ 完整支持 |
| 部署 | ✅ Git push 自动部署 | ⚠️ 需 `wrangler deploy` |
| 项目组织 | ✅ 前后端统一 | ⚠️ 前后端分离 |

**结论**：使用 **Cloudflare Pages**，前后端一体化，Git 推送自动部署。

---

## 三、核心功能

### 3.1 认证系统（GitHub OAuth）
- 使用 GitHub OAuth 登录
- 仅允许指定 GitHub 用户 ID 访问（通过环境变量配置白名单）
- 登录状态通过 Cookie/Session 维持
- 未登录自动跳转到 GitHub 授权页面

### 3.2 文件浏览
- 列表/网格视图展示文件和文件夹
- 显示文件名、大小、类型图标、修改时间
- 面包屑路径导航
- 文件夹层级浏览

### 3.3 文件上传
- 单文件/多文件上传
- 拖拽上传
- 上传进度条
- 上传到指定目录

### 3.4 文件下载
- 单文件直接下载

### 3.5 文件管理
- 新建文件夹
- 删除文件/文件夹
- 文件重命名

### 3.6 文件预览
- 图片在线预览
- 文本/代码文件在线预览
- 视频/音频播放

---

## 四、项目结构

```
Cloudfire-R2-Page/
├── index.html                # 主页面
├── style.css                 # 样式
├── script.js                 # 前端逻辑
├── functions/                # Pages Functions (后端 API)
│   ├── api/
│   │   ├── list.js           # GET  /api/list?path=xxx
│   │   ├── upload.js         # POST /api/upload
│   │   ├── download.js       # GET  /api/download?key=xxx
│   │   ├── delete.js         # POST /api/delete
│   │   ├── mkdir.js          # POST /api/mkdir
│   │   └── rename.js         # POST /api/rename
│   ├── auth/
│   │   ├── login.js          # GET  /auth/login → 跳转 GitHub OAuth
│   │   ├── callback.js       # GET  /auth/callback → 处理 GitHub 回调
│   │   └── logout.js         # GET  /auth/logout
│   └── _middleware.js        # 全局认证中间件
├── wrangler.toml             # R2 绑定 + 环境变量
├── _headers                  # HTTP 响应头
├── package.json
└── README.md
```

---

## 五、API 设计

### 认证（GitHub OAuth 流程）

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/auth/login` | 重定向到 GitHub 授权页 |
| `GET` | `/auth/callback` | 处理 GitHub OAuth 回调，验证用户身份，设置 Cookie |
| `GET` | `/auth/logout` | 清除登录状态 |

### 文件操作

| 方法 | 路径 | 说明 | 参数 |
|---|---|---|---|
| `GET` | `/api/list` | 列出文件 | Query: `path`（R2 前缀） |
| `POST` | `/api/upload` | 上传文件 | FormData: `file`, `path` |
| `GET` | `/api/download` | 下载文件 | Query: `key`（R2 key） |
| `POST` | `/api/delete` | 删除文件/夹 | Body: `{ key }` |
| `POST` | `/api/mkdir` | 新建文件夹 | Body: `{ path }` |
| `POST` | `/api/rename` | 重命名 | Body: `{ oldKey, newKey }` |

所有 `/api/*` 请求通过 `_middleware.js` 检查登录状态。

---

## 六、技术实现

### 6.1 R2 绑定 (`wrangler.toml`)
```toml
name = "cloudfire-r2-page"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "my-cloud-drive"  # 替换为你的 R2 Bucket 名
```

### 6.2 GitHub OAuth 流程
```
用户访问 → _middleware 检查 Cookie
  → 已登录 → 放行
  → 未登录 → 跳转 /auth/login
    → 重定向 GitHub OAuth
    → GitHub 回调 /auth/callback
    → 验证 GitHub 用户 ID 是否在白名单
    → 设置 HttpOnly Cookie（含加密 session）
    → 跳转回首页
```

### 6.3 环境变量

| 变量名 | 说明 | 示例 |
|---|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Iv1.xxxxxxxxxx` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `xxxxxxxxxxxxxxx` |
| `ALLOWED_USERS` | 允许的 GitHub 用户名（逗号分隔） | `user1,user2` |
| `SESSION_SECRET` | Session 加密密钥 | `random-secret-key` |

### 6.4 核心 API 示例

**文件列表：**
```js
// functions/api/list.js
export async function onRequestGet(context) {
  const bucket = context.env.R2_BUCKET;
  const url = new URL(context.request.url);
  const prefix = url.searchParams.get('path') || '';
  
  const listed = await bucket.list({
    prefix: prefix,
    delimiter: '/',
  });
  
  return Response.json({
    folders: listed.delimitedPrefixes,
    files: listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
    })),
  });
}
```

**文件上传：**
```js
// functions/api/upload.js
export async function onRequestPost(context) {
  const bucket = context.env.R2_BUCKET;
  const formData = await context.request.formData();
  const file = formData.get('file');
  const path = formData.get('path') || '';
  const key = path ? `${path}${file.name}` : file.name;
  
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  
  return Response.json({ success: true, key });
}
```

**文件下载：**
```js
// functions/api/download.js
export async function onRequestGet(context) {
  const bucket = context.env.R2_BUCKET;
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');
  
  const object = await bucket.get(key);
  if (!object) return new Response('Not Found', { status: 404 });
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Disposition',
    `attachment; filename="${encodeURIComponent(key.split('/').pop())}"`);
  
  return new Response(object.body, { headers });
}
```

### 6.5 前端设计方向
- 深色主题为主，现代化 Glass morphism 风格
- 文件图标根据类型匹配（📁📄🖼️🎵🎬📦）
- 拖拽上传带动画反馈
- 响应式布局适配移动端
- 面包屑路径导航

---

## 七、开发与测试

```bash
# 安装依赖
npm install wrangler --save-dev

# 本地启动（R2 模拟）
npx wrangler pages dev ./ --r2=R2_BUCKET

# 部署
git push  # Pages 自动部署
```

---

## 八、实施顺序

1. **初始化项目**：`wrangler.toml` + `package.json`
2. **后端 API**：先实现文件操作 API（list/upload/download/delete/mkdir/rename）
3. **GitHub 认证**：实现 OAuth 流程 + 中间件
4. **前端界面**：登录页 + 文件管理界面
5. **测试验证**：本地调试 + 部署测试
