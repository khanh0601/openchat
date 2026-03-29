"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { login } from "../actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Gọi server action lưu token bằng HTTPOnly cookie
    const result = await login(account, password);

    if (result.success && result.user) {
      // Lưu lại thông tin qua localStorage
      localStorage.setItem("user_username", result.user.email || account);
      localStorage.setItem("user_id", result.user.id?.toString() || "");
      localStorage.setItem("user_password", password); 
      
      router.push("/");
    } else {
      setError(result.error || "Có lỗi xảy ra, vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-panel border-panel-border border p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand/10 p-4 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Đăng nhập tài khoản</h1>
          <p className="text-sm text-neutral-400 mt-2 text-center">
            Hệ thống tạo website tự động với ChatGPT
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">
              Tên đăng nhập (Account)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand sm:text-sm text-white transition placeholder:text-neutral-500"
                placeholder="Nhập account (vd: esim123)"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand sm:text-sm text-white transition placeholder:text-neutral-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-yellow-400 text-neutral-900 font-semibold py-2.5 px-4 rounded-lg transition mt-6 disabled:opacity-70"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-5">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-brand hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>

    </div>
  );
}
