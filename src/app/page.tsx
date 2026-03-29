"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, User, Bot, Loader2, LogOut, KeyRound, Copy, Check, Download, Eye, Code2 } from "lucide-react";
import Link from "next/link";
import { logout, CallChat } from "./actions/auth";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  type?: "text" | "html";
}

// ---------- HTML Code Block Component ----------
function HtmlCodeBlock({ html, onPreview }: { html: string; onPreview: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [html]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-website.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [html]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#3a3a3a] bg-[#1e1e1e] text-sm shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2a2a2a] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span className="text-neutral-300 font-medium text-xs">Generated Website · html</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Toggle Code/Hide */}
          <button
            onClick={() => setShowCode((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showCode ? "Ẩn code" : "Xem code"}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Đã sao chép" : "Sao chép"}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Tải xuống
          </button>

          {/* Preview */}
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 text-xs text-white font-medium px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 transition-colors ml-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Xem trước
          </button>
        </div>
      </div>

      {/* Code block */}
      {showCode && (
        <div className="overflow-auto max-h-72">
          <SyntaxHighlighter
            language="html"
            style={vscDarkPlus}
            wrapLines
            wrapLongLines
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.75rem",
              lineHeight: "1.6",
              background: "#1e1e1e",
            }}
          >
            {html}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

// ==================== Main Page ====================
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
        // API trả về { "data": "<html>..." }
        const html = responseData?.html || responseData?.data;
        const reply = responseData?.reply || responseData?.message || responseData?.content;
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
      {/* Sidebar */}
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
        <div className="border-t border-[#303030] p-3 relative group">
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

                {/* Content */}
                <div className={`flex flex-col ${msg.type === "html" ? "w-full max-w-[90%]" : "max-w-[85%]"} ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.type === "html" ? (
                    <HtmlCodeBlock
                      html={msg.content}
                      onPreview={() => openPreview(msg.content)}
                    />
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
