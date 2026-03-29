"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { register } from "../actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    account: "",
    password: "",
    confirmPassword: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    const result = await register(
      form.account,
      form.password,
      form.email,
      form.first_name,
      form.last_name
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(result.error || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-panel border-panel-border border p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand/10 p-4 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</h1>
          <p className="text-sm text-neutral-400 mt-2 text-center">
            Hệ thống tạo website tự động với ChatGPT
          </p>
        </div>

        {/* Success state */}
        {success && (
          <div className="mb-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Đăng ký thành công! Đang chuyển đến trang đăng nhập...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          {/* First name + Last name */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Họ</label>
              <input
                type="text"
                name="last_name"
                required
                placeholder="Nguyễn"
                value={form.last_name}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Tên</label>
              <input
                type="text"
                name="first_name"
                required
                placeholder="Văn A"
                value={form.first_name}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Tên đăng nhập (Account)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="text"
                name="account"
                required
                placeholder="esim123456"
                value={form.account}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Xác nhận mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-yellow-400 text-neutral-900 font-semibold py-2.5 px-4 rounded-lg transition mt-2 disabled:opacity-70"
          >
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-5">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-brand hover:underline font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
