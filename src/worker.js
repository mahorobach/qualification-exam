/**
 * Cloudflare Workers + Static Assets
 *
 * /api/gemini への POST は Gemini API プロキシとして処理。
 * それ以外はすべて静的ファイルを配信。
 *
 * APIキーは Cloudflare Dashboard の Environment Variables (Secret) に設定。
 * 変数名: GEMINI_API_KEY
 */
const CANONICAL_HOST = 'qualifications.app';

/**
 * 本番ドメイン上でのみ: www → apex、ディレクトリURL（末尾 /）→ index.html
 * （workers.dev プレビューではスキップ）
 */
function canonicalRedirects(request) {
  const url = new URL(request.url);
  const host = url.hostname;
  const isProd =
    host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;
  if (!isProd) return null;

  if (host === `www.${CANONICAL_HOST}`) {
    const dest = `https://${CANONICAL_HOST}${url.pathname}${url.search}`;
    return Response.redirect(dest, 301);
  }

  if (
    url.pathname !== '/' &&
    url.pathname.endsWith('/') &&
    !url.pathname.startsWith('/api/')
  ) {
    const destPath = url.pathname.replace(/\/+$/, '') + '/index.html';
    const dest = `https://${CANONICAL_HOST}${destPath}${url.search}`;
    return Response.redirect(dest, 301);
  }

  return null;
}

export default {
  async fetch(request, env) {
    const redirect = canonicalRedirects(request);
    if (redirect) return redirect;

    const url = new URL(request.url);

    // Gemini API プロキシ
    if (url.pathname === '/api/gemini' && request.method === 'POST') {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'GEMINI_API_KEY が設定されていません' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(
          JSON.stringify({ error: 'リクエストボディが不正です' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // quiz.html から {prompt: "..."} 形式で来る場合は Gemini 形式に変換
      const geminiBody = body.prompt
        ? {
            contents: [{ role: 'user', parts: [{ text: body.prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }
        : body;

      const geminiUrl =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
        apiKey;

      const upstream = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      });

      const data = await upstream.json();

      // text フィールドを抽出して返す（quiz.html が data.text を参照するため）
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        '回答を取得できませんでした。';

      return new Response(JSON.stringify({ text }), {
        status: upstream.ok ? 200 : upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 静的ファイルの配信
    if (!env.ASSETS?.fetch) {
      return new Response(
        'ASSETS binding がありません（本番デプロイまたは wrangler dev で確認してください）',
        { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }
    return env.ASSETS.fetch(request);
  },
};
