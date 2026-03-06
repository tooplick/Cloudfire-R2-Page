// POST /auth/login — Body: { username, password }
export async function onRequestPost(context) {
    const { username, password } = await context.request.json();
    const validUser = context.env.AUTH_USERNAME;
    const validPass = context.env.AUTH_PASSWORD;
    const sessionSecret = context.env.SESSION_SECRET || 'default-secret-change-me';

    if (!username || !password) {
        return Response.json({ error: '请输入用户名和密码' }, { status: 400 });
    }

    if (username !== validUser || password !== validPass) {
        return Response.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // 生成简单的 session token（基于 HMAC）
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(sessionSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const timestamp = Date.now();
    const data = `${username}:${timestamp}`;
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const token = btoa(data + ':' + arrayBufferToHex(signature));

    return Response.json({ success: true }, {
        headers: {
            'Set-Cookie': `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
        },
    });
}

// GET /auth/login — 检查登录状态
export async function onRequestGet(context) {
    // 中间件已验证，到达此处说明已登录
    const sessionData = context.data?.session;
    if (sessionData) {
        return Response.json({ loggedIn: true, username: sessionData.username });
    }
    return Response.json({ loggedIn: false });
}

function arrayBufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
