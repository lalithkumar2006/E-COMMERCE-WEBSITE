import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Enter email, 2: Set new password
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubmitting(true);
      const res = await api.forgotPassword(email);
      addToast(res.message, 'success');
      setStep(2);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.resetPassword({ email, newPassword });
      addToast(res.message, 'success');
      setStep(3);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Recovery</h1>
          <p className="text-xs text-slate-500">Reset your AuraStore account password</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Checking...' : 'Continue to Reset Password'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enter New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Your password has been reset successfully!</p>
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Sign In with New Password
            </Link>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
