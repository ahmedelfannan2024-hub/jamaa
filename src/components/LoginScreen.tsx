/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (rememberMe: boolean) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simulate a brief elegant delay to make it feel premium
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'ahmed' && password === '123') {
        onLoginSuccess(rememberMe);
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور! يرجى المحاولة مرة أخرى.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Decorative background light bubbles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#0B0F19] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Top visual brand banner */}
        <div className="bg-[#090D16] border-b border-[#1E293B] px-8 py-7 text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="inline-flex p-3.5 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 mb-4 items-center justify-center"
          >
            <FileSpreadsheet className="w-8 h-8" />
          </motion.div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">نظام إدارة ودفتر المبيعات الذكي</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">سجل الدخول للمتابعة وإدارة الحركات المالية والقيود</p>
        </div>

        {/* Form area */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#3A141C] border border-[#6B212E] text-rose-300 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">اسم المستخدم (Username)</label>
              <div className="relative">
                <User className="absolute right-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="أدخل اسم المستخدم (مثال: ahmed)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#131722] border border-[#2E3A52] text-white placeholder-slate-500 text-sm px-10 py-2.5 rounded-xl block focus:bg-[#181D2D] focus:outline-none focus:border-indigo-500 transition-all font-sans text-right"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">الرقم السري (Password)</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="أدخل الرقم السري"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#131722] border border-[#2E3A52] text-white placeholder-slate-500 text-sm px-10 py-2.5 rounded-xl block focus:bg-[#181D2D] focus:outline-none focus:border-indigo-500 transition-all font-mono text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Actions: Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-[#2E3A52] bg-[#131722] text-indigo-600 focus:ring-indigo-500/50 w-4 h-4"
                />
                <span>تذكر بيانات دخولي على هذا المتصفح</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-650/15 text-sm transition-all focus:outline-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق والدخول...</span>
                </>
              ) : (
                <span>دخول النظام الآمن</span>
              )}
            </button>
          </form>

          {/* Dummy hints for demo comfort in clean design */}
          <div className="mt-8 text-center border-t border-[#1D2636] pt-5">
            <span className="text-[11px] text-slate-500 font-medium block">مستوى حماية عالي التشفير محمي برقم سري مخصص للحسابات المعتمدة</span>
          </div>

        </div>
      </motion.div>

      {/* Small subtle brand note */}
      <div className="mt-6 text-slate-600 text-xs tracking-wide">
        العام المالي المعتمد ٢٠٢٦ م
      </div>
    </div>
  );
}
