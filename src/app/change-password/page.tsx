"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { changePassword } from "../actions/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.new_password !== form.confirm_password) {
      setError("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (form.new_password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    const result = await changePassword(form.old_password, form.new_password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
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
            <Lock className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Đổi mật khẩu</h1>
          <p className="text-sm text-neutral-400 mt-2 text-center">
            Nhập mật khẩu cũ và mật khẩu mới để cập nhật
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Đổi mật khẩu thành công! Đang chuyển về trang chủ...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="password"
                name="old_password"
                required
                placeholder="••••••••"
                value={form.old_password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
              />
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-4">
            {/* New password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="password"
                  name="new_password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.new_password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-brand focus:border-brand text-sm text-white transition placeholder:text-neutral-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-yellow-400 text-neutral-900 font-semibold py-2.5 px-4 rounded-lg transition mt-2 disabled:opacity-70"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
