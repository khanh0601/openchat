"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Code2 } from "lucide-react";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      router.push("/");
      return;
    }

    const savedHtml = sessionStorage.getItem(`generated-html-${id}`);
    if (savedHtml) {
      let cleanHtml = savedHtml;
      // Bỏ markdown block nếu có
      cleanHtml = cleanHtml.replace(/^```html\n?/, '').replace(/```\n?$/, '');
      // Nếu string còn chứa literal \n, \" (double-encoded) thì unescape
      if (cleanHtml.includes('\\n') || cleanHtml.includes('\\"')) {
        cleanHtml = cleanHtml
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
      setHtmlContent(cleanHtml);
    } else {
      alert("Không tìm thấy dữ liệu trang. Vui lòng tạo lại.");
      router.push("/");
    }
  }, [searchParams, router]);

  if (!htmlContent) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        Đang tải trang...
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-neutral-100 overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="h-14 bg-neutral-900 text-white flex items-center justify-between px-4 shrink-0 border-b border-neutral-800 shadow-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:text-brand transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Home
          </button>
          <div className="h-4 w-px bg-neutral-700"></div>
          <p className="text-sm text-neutral-400 flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Bản xem trước giao diện được tạo tự động
          </p>
        </div>

        <div>
          <button 
            onClick={() => {
              const blob = new Blob([htmlContent], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            }}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 font-medium py-1.5 px-4 rounded-lg text-sm transition"
          >
            Mở tab mới <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main iframe sandbox content */}
      <div className="flex-1 bg-white relative">
        <iframe
          title="Generated Website Preview"
          srcDoc={htmlContent}
          className="absolute inset-0 w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
