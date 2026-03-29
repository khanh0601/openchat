import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  try {
    const { topic, apiKey } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Thiếu thông tin chủ đề (topic)" }, { status: 400 });
    }

    const keyToUse = apiKey || process.env.OPENAI_API_KEY;

    if (!keyToUse) {
      return NextResponse.json({ error: "Thiếu OpenAI API Key." }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: keyToUse,
    });

    const systemPrompt = `
Bạn là một Web Developer chuyên nghiệp.
Người dùng sẽ cung cấp một chủ đề. Nhiệm vụ của bạn là tạo ra MỘT file HTML duy nhất chứa toàn bộ giao diện cho website đó.
Yêu cầu bắt buộc:
1. Website PHẢI bao gồm giao diện Đăng nhập (username, password) theo yêu cầu của người dùng.
2. Thiết kế đẹp, hiện đại, sử dụng Tailwind CSS qua CDN (<script src="https://cdn.tailwindcss.com"></script>).
3. KHÔNG sử dụng Markdown tick (như \`\`\`html). Chỉ xuất ra nội dung HTML thuần túy.
4. Có một chút JavaScript cơ bản bên trong thẻ <script> để mô phỏng tính năng (VD: bấm đăng nhập hiện thông báo hoặc đổi giao diện).
5. Trả về đúng mã HTML, không giải thích gì thêm.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-3.5-turbo or gpt-4o-mini for speed and cost effectiveness
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Chủ đề của website là: ${topic}. Hãy tạo mã HTML tương ứng.` },
      ],
      temperature: 0.7,
    });

    const generatedHtml = response.choices[0].message?.content || "";

    // Ideally, we store this HTML in a Database and return an ID.
    // Since this is a demo, we can either return the HTML directly or store it in an in-memory Map.
    // For simplicity, let's just return the HTML directly and let the client handle it, OR
    // we can return it as an ID if we store it globally.
    // Since Vercel serverless functions shouldn't use global memory, we will just return the HTML in the response.

    return NextResponse.json({ html: generatedHtml, id: Date.now() });
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
