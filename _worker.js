export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/news") {
      const topic = url.searchParams.get('q') || 'آخر الأخبار';
      
      // منطق التخصيص الذكي للمصادر
      let sources = "";
      if (topic.includes("gold") || topic.includes("ذهب") || topic.includes("اقتصاد")) {
        sources = " (site:reuters.com OR site:bloomberg.com OR site:investing.com OR site:kitco.com)";
      } else {
        sources = " (site:aljazeera.net OR site:reuters.com OR site:apnews.com OR site:bbc.com)";
      }

      const fullQuery = encodeURIComponent(topic + sources);
      const rssUrl = `https://news.google.com/rss/search?q=${fullQuery}&hl=ar&gl=SA&ceid=SA:ar`;

      try {
        const response = await fetch(rssUrl);
        const xmlData = await response.text();
        return new Response(xmlData, {
          headers: { "content-type": "application/xml;charset=UTF-8", "Access-Control-Allow-Origin": "*" },
        });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
