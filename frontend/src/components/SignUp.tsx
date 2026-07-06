// =========================================================
// components/SignUp.tsx
// Sign-up screen shown when there's no valid auth token.
// =========================================================

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Sparkles, Mail, Lock, UserPlus, User } from 'lucide-react';
import { registerAccount } from '../api';
import type { AuthResponse } from '../types';

interface Props {
  onSuccess: (auth: AuthResponse) => void;
  onSwitchToLogin: () => void;
  notify: (message: string, type?: 'success' | 'error') => void;
}

export default function SignUp({ onSuccess, onSwitchToLogin, notify }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      notify('Username must be at least 3 characters long.', 'error');
      return;
    }
    if (password.length < 6) {
      notify('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      notify('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const auth = await registerAccount(username.trim(), email.trim(), password);
      notify('Account created! Welcome to USeP Internship OJT Tracker.');
      onSuccess(auth);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not create account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf9f8]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-full bg-[#2a020b] flex items-center justify-center mb-5 shadow-lg">
            <Sparkles size={24} className="text-[#fdb813]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tighter text-[#1a0107]">
            USeP<span className="text-gray-400 font-normal">Internship</span>
          </h1>
          <p className="text-gray-500 mt-2 text-center">Create your OJT hours tracker account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.05)] border border-[#f0ebe1] space-y-6"
        >
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                minLength={3}
                autoFocus
                className="w-full p-5 pl-12 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent transition-all"
                placeholder="juandelacruz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                autoFocus
                className="w-full p-5 pl-12 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent transition-all"
                placeholder="you@usep.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full p-5 pl-12 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent transition-all"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                className="w-full p-5 pl-12 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent transition-all"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1a0107] hover:bg-[#3a0310] disabled:opacity-60 text-white py-5 rounded-full flex items-center justify-center gap-3 font-medium transition-all shadow-xl text-lg"
          >
            <UserPlus size={20} /> {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-gray-500 text-sm pt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#7a0016] font-bold hover:underline"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
