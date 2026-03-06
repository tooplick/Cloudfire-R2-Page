// 全局认证中间件
// 保护所有 /api/* 路由，/auth/login POST 和静态资源放行

function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        cookies[name] = rest.join('=');
    });
    return cookies;
}

async function verifySession(token, sessionSecret) {
    try {
        const decoded = atob(token);
        const lastColon = decoded.lastIndexOf(':');
        const data = decoded.substring(0, lastColon);
        const providedSig = decoded.substring(lastColon + 1);

        const [username, timestamp] = data.split(':');

        // 检查 token 是否过期（7 天）
        const age = Date.now() - parseInt(timestamp);
        if (age > 7 * 24 * 60 * 60 * 1000) {
            return null;
        }

        // 验证签名
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(sessionSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const sigBytes = new Uint8Array(providedSig.match(/.{2}/g).map(b => parseInt(b, 16)));
        const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));

        if (valid) {
            return { username, timestamp: parseInt(timestamp) };
        }
        return null;
    } catch {
        return null;
    }
}

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname;

    // 静态资源和登录页面直接放行
    if (
        path === '/' ||
        path === '/index.html' ||
        path === '/style.css' ||
        path === '/script.js' ||
        path.startsWith('/assets/')
    ) {
        return context.next();
    }

    // 登录接口放行（POST /auth/login）
    if (path === '/auth/login' && context.request.method === 'POST') {
        return context.next();
    }

    // 退出登录接口放行
    if (path === '/auth/logout') {
        return context.next();
    }

    // 其他所有请求需要认证
    const cookies = parseCookies(context.request.headers.get('Cookie'));
    const sessionToken = cookies.session;

    if (!sessionToken) {
        return Response.json({ error: '未登录', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const sessionSecret = context.env.SESSION_SECRET || 'default-secret-change-me';
    const session = await verifySession(sessionToken, sessionSecret);

    if (!session) {
        return Response.json({ error: '登录已过期', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 将 session 信息传递给后续处理
    context.data = context.data || {};
    context.data.session = session;

    // 检查登录状态的 GET /auth/login 也需要 session
    return context.next();
}
