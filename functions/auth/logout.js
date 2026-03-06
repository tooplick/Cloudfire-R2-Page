// GET /auth/logout — 清除登录状态
export async function onRequestGet() {
    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
        },
    });
}
