import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Danh sách reply giả lập xoay vòng để demo
const MOCK_REPLIES = [
  "Chào bạn! Tôi đã nhận được tin nhắn của bạn. Đây là phản hồi giả lập từ hệ thống demo. Bạn có thể tiếp tục chat thử nghiệm.",
  "Cảm ơn bạn đã nhắn tin! Hệ thống đang chạy ở chế độ demo. Khi kết nối API thật, phản hồi sẽ được xử lý bởi AI.",
  "Tin nhắn của bạn đã được nhận. Đây là mock response để kiểm tra giao diện chat. API thật sẽ trả về nội dung website được tạo tự động.",
  "OK! Tôi hiểu yêu cầu của bạn. Trong môi trường production, hệ thống sẽ kết nối AI để tạo website theo chủ đề bạn nhập.",
];

let mockIndex = 0;

export async function POST(req: Request) {
  try {
    const { topic, username, password } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "No chat input provided." }, { status: 400 });
    }

    // NẾU CÓ EXTERNAL API → forward sang BE thật
    const externalApiUrl = process.env.EXTERNAL_CHAT_API_URL;
    if (externalApiUrl) {
      const response = await fetch(externalApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat: topic, username, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from external API");
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // NẾU CÓ OPENAI KEY → dùng OpenAI tạo HTML
    const keyToUse = process.env.OPENAI_API_KEY;
    if (keyToUse) {
      const openai = new OpenAI({ apiKey: keyToUse });

      const systemPrompt = `
        Bạn là một Web Developer AI.
        Người dùng đang gõ: "${topic}".
        Họ đang đăng nhập hệ thống mẹ bằng username: "${username}" và password: "${password}".
        
        Hãy viết 1 trang HTML tĩnh duy nhất (phong cách Tailwind qua CDN đẹp mắt).
        Trang web này phải KHỚP với chủ đề người dùng gõ (ví dụ Đặt vé máy bay, Mua sắm...).
        QUAN TRỌNG: Giao diện bên trong HTML này MẶC ĐỊNH phải CÓ 1 Form đăng nhập!
        Bằng JavaScript, Form đăng nhập này chỉ Chấp nhận đúng tài khoản "${username}" và pass "${password}". 
        Khi ng dùng nhập đúng Form trên web mới -> Javascript hiển thị: "Xin chào ${username}! Đăng nhập thành công, dưới đây là giá vé/dữ liệu của bạn...".
        Chỉ xuất ra nội dung mã HTML, KHÔNG bọc trong markdown tick (\`\`\`html).
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.7,
      });

      let generatedHtml = response.choices[0].message?.content || "";
      generatedHtml = generatedHtml.replace(/^```html\n?/, "").replace(/```\n?$/, "");
      return NextResponse.json({ html: generatedHtml });
    }

    // ==========================================
    // MOCK FALLBACK — Trả về text reply để demo UI
    // ==========================================
    await new Promise((r) => setTimeout(r, 600)); // Giả lập độ trễ mạng

    const reply = `[Demo] Bạn vừa gửi: "${topic}"\n\n${MOCK_REPLIES[mockIndex % MOCK_REPLIES.length]}`;
    mockIndex++;

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
