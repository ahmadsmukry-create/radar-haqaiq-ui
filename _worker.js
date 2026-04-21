export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. محرك جلب الأخبار (تم فك القيود لتشمل كل شبكة الأخبار العالمية)
    if (url.pathname === "/api/news") {
      const topic = url.searchParams.get('q') || 'آخر الأخبار';
      
      // نرسل مصطلح البحث لجوجل نيوز ليجلب أقوى الأخبار المرتبطة به باللغة العربية
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=ar&gl=SA&ceid=SA:ar`;
      
      const response = await fetch(rssUrl);
      const xmlData = await response.text();
      return new Response(xmlData, { headers: { "content-type": "application/xml;charset=UTF-8", "Access-Control-Allow-Origin": "*" } });
    }

    // 2. محرك التحليل الذكي (Gemini 2.5 Flash)
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const { message, context, radarType } = await request.json();
      
      // دستور عسكري صارم يمنع الهلوسة نهائياً
      const systemPrompt = `أنت نظام آلي صارم لـ "رادار الحقائق". 
      ممنوع منعاً باتاً استخدام معلوماتك المسبقة أو ذكرياتك التدريبية للرد.
      اعتمد حصراً وبشكل كامل على هذه العناوين الإخبارية الحية: [ ${context} ].
      إذا كانت العناوين لا تحتوي على إجابة واضحة لسؤال المستخدم (مثلاً يسأل عن الذهب والعناوين تتحدث عن شيء آخر)، يجب أن ترد بهذا النص الحرفي فقط: "عذراً، لم يلتقط الرادار تحديثات حية مطابقة لطلبك الآن." لا تخمن، لا تعتذر طويلاً، ولا تذكر تواريخ قديمة.`;

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
