export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // إذا طلب الزائر الرابط الذي يبدأ بـ /api/news
    if (url.pathname === "/api/news") {
      const query = url.searchParams.get('q') || 'آخر الأخبار';
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ar&gl=SA&ceid=SA:ar`;

      try {
        const response = await fetch(rssUrl);
        const xmlData = await response.text();
        return new Response(xmlData, {
          headers: { 
            "content-type": "application/xml;charset=UTF-8",
            "Access-Control-Allow-Origin": "*" 
          },
        });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }

    // إذا لم يطلب API، قم بعرض صفحة index.html العادية
    return env.ASSETS.fetch(request);
  },
};
