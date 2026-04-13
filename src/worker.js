/**
 * Cloudflare Workers + Static Assets
 *
 * /api/gemini への POST は Gemini API プロキシとして処理。
 * それ以外はすべて静的ファイルを配信。
 *
 * APIキーは Cloudflare Dashboard の Environment Variables (Secret) に設定。
 * 変数名: GEMINI_API_KEY
 */
export default {
  async fetch(request, env) {
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
    return env.ASSETS.fetch(request);
  },
};
