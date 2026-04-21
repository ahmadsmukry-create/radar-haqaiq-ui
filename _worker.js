export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. محرك جلب الأخبار (العناكب)
    if (url.pathname === "/api/news") {
      const topic = url.searchParams.get('q') || 'آخر الأخبار';
      let sources = topic.includes("gold") || topic.includes("ذهب") ? 
        " (site:reuters.com OR site:investing.com OR site:kitco.com)" : 
        " (site:aljazeera.net OR site:bbc.com OR site:apnews.com)";
      
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic + sources)}&hl=ar&gl=SA&ceid=SA:ar`;
      const response = await fetch(rssUrl);
      const xmlData = await response.text();
      return new Response(xmlData, { headers: { "content-type": "application/xml;charset=UTF-8", "Access-Control-Allow-Origin": "*" } });
    }

    // 2. محرك التحليل الذكي 
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const { message, context, radarType } = await request.json();
      
      const systemPrompt = `أنت محلل أزمات في "رادار الحقائق". نوع الرادار الحالي: ${radarType}. 
      استخدم المعطيات التالية فقط للإجابة بوضوح واختصار: ${context}. 
      إذا سُئلت عن شيء غير موجود في المعطيات، اعتذر بمهنية لتجنب التضليل. لا تخمن أبداً.`;

      // 🚨 التحديث هنا: تم ربط المحرك بـ Gemini 2.5 Flash
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nسؤال الزائر: ${message}` }] }]
        })
      });

      const data = await geminiResponse.json();
      return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    return env.ASSETS.fetch(request);
  },
};
