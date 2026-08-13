import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="animate-slide-up">
      <Link to="/login" className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
            <CheckCircle2 className="h-8 w-8 text-success-600" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Check your inbox</h1>
          <p className="mt-2 text-sm text-ink-500">
            We've sent a password reset link to your email address. The link will expire in 30 minutes.
          </p>
          <button onClick={() => setSent(false)} className="mt-6 text-sm font-medium text-brand-600 hover:text-brand-700">
            Try a different email
          </button>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-ink-900">Reset password</h1>
          <p className="mt-1.5 text-sm text-ink-500">Enter your email and we'll send you a reset link</p>

          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input required type="email" placeholder="you@example.com" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
            </div>

            <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-600 active:scale-[0.98]">
              Send reset link
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
