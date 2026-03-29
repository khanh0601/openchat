"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, User, Bot, Loader2, Code2, Play, LogOut, KeyRound } from "lucide-react";
import Link from "next/link";
import { logout, CallChat } from "./actions/auth";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  type?: "text" | "html"; // html type means we can render the website output in an iframe
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Xin chào! Bạn muốn tạo website về chủ đề gì ngày hôm nay?",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Middleware đã kiểm tra token rồi, chỉ cần lấy thông tin hiển thị
    const stored = localStorage.getItem("user_username");
    setUsername(stored || "");
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("user_username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_password");
    router.push("/login");
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await CallChat(userMsg.content);

      if (result.success) {
        const responseData = result.data;
        const html = responseData?.html;
        const reply = responseData?.reply || responseData?.message || responseData?.content || JSON.stringify(responseData);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "bot",
            content: html || reply || "Thành công",
            type: html ? "html" : "text",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "bot", content: `Lỗi: ${result.error}` },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "bot", content: `Lỗi kết nối: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (html: string) => {
    const id = Date.now().toString();
    sessionStorage.setItem(`generated-html-${id}`, html);
    window.open(`/preview?id=${id}`, "_blank");
  };

  return (
    <div className="flex h-screen bg-[#212121] text-neutral-200 font-sans">
      {/* Sidebar (Optional styling to look like ChatGPT) */}
      <div className="w-64 bg-[#171717] flex-shrink-0 hidden md:flex flex-col border-r border-[#303030]">
        <div className="p-4">
          <button className="w-full flex items-center justify-start gap-3 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-sm py-2 px-3 rounded-lg transition-colors">
            <span className="text-xl">+</span> Tạo chat mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 text-sm text-[#888]">
          <p className="mb-2 font-semibold text-xs tracking-wider uppercase">Lịch sử</p>
          <div className="py-2 px-3 hover:bg-[#2f2f2f] rounded-lg cursor-pointer truncate">Website Đặt vé máy bay</div>
        </div>
        {/* User menu - hover để hiện dropdown */}
        <div className="border-t border-[#303030] p-3 relative group">
          {/* Dropdown menu - hiện khi hover vào khu vực user */}
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-[#2f2f2f] border border-[#444] rounded-xl overflow-hidden shadow-lg
            opacity-0 translate-y-1 pointer-events-none
            group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
            transition-all duration-150 ease-out z-50"
          >
            <Link
              href="/change-password"
              className="flex items-center gap-2.5 text-sm text-neutral-300 hover:bg-[#3f3f3f] px-4 py-2.5 transition-colors"
            >
              <KeyRound className="w-4 h-4 shrink-0 text-neutral-400" />
              Đổi mật khẩu
            </Link>
            <div className="border-t border-[#3f3f3f]" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 text-sm text-red-400 hover:bg-[#3f3f3f] px-4 py-2.5 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Đăng xuất
            </button>
          </div>

          {/* User row - hover vào đây để hiện menu trên */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#2f2f2f] cursor-pointer transition-colors text-sm text-neutral-400">
            <User className="w-6 h-6 bg-neutral-700 rounded-full p-0.5 shrink-0" />
            <span className="truncate flex-1">{username || "User"}</span>
            <svg className="w-4 h-4 shrink-0 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#212121] relative">
        {/* Header (mobile) */}
        <div className="md:hidden h-12 flex items-center justify-center border-b border-[#303030] shrink-0 font-medium">
          Chat Hệ thống
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-3xl mx-auto w-full pt-8 pb-32 px-4 flex flex-col gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-neutral-600" : "bg-emerald-600"}`}>
                  {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>

                {/* Content Bubble */}
                <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.type === "html" ? (
                    <div className="bg-[#2f2f2f] rounded-xl border border-[#404040] p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-brand font-medium pb-2 border-b border-[#404040]">
                        <Code2 className="w-5 h-5" /> Mã nguồn Website đã được tạo
                      </div>
                      <p className="text-sm text-neutral-400">Website đã được biên dịch thành công dựa theo yêu cầu của bạn, bao gồm các cấu hình đăng nhập được áp dụng.</p>
                      <button
                        onClick={() => openPreview(msg.content)}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg mt-2 transition"
                      >
                        <Play className="w-4 h-4 fill-white" /> Khởi chạy và xem trước (Sandbox)
                      </button>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-[#2f2f2f] text-white" : "text-neutral-200"}`}>
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 flex-row">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start bg-transparent">
                  <div className="p-3">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-10">
          <div className="max-w-3xl mx-auto px-4 pb-6">
            <form onSubmit={handleSend} className="relative flex items-end overflow-hidden bg-[#2f2f2f] rounded-3xl border border-[#444] focus-within:border-[#666] transition-colors p-2 shadow-lg">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập chủ đề website hoặc chat tại đây..."
                className="w-full max-h-48 min-h-[44px] bg-transparent border-none focus:outline-none focus:ring-0 text-white p-3 pr-12 resize-none text-sm placeholder:text-neutral-500"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 disabled:opacity-50 disabled:bg-[#444] disabled:text-[#888] transition-all"
              >
                <Send className="w-4 h-4 mr-0.5 mt-0.5" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
