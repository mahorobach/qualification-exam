/**
 * Cloudflare Pages Function — Gemini API proxy
 *
 * APIキーはCloudflare Dashboardの環境変数（Secret）として設定する。
 * Dashboard > Pages > プロジェクト > Settings > Environment variables
 * 変数名: GEMINI_API_KEY
 *
 * クライアントからは /api/gemini に POST するだけでよい。
 * APIキーはサーバーサイドのみで保持し、レスポンスをそのまま返す。
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'GEMINI_API_KEY が設定されていません', code: 500 } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { message: 'リクエストボディが不正です', code: 400 } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const geminiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
    apiKey;

  const upstream = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
