import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, username: user } = await api.login(username, password);
      saveSession(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary mesh-gradient">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-accent-purple" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-accent-purple animate-pulse-ring" />
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-[0.3em] text-gradient">THEO</h1>
          </div>
          <p className="text-[10px] text-text-muted font-mono tracking-widest uppercase">Neural Control Panel</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-purple/30 to-transparent" />

          <h2 className="text-sm font-semibold text-text-secondary mb-5 tracking-wide">Acesso ao Painel</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-muted uppercase tracking-widest font-mono">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                autoFocus
                required
                className="bg-bg-primary border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20 transition-all font-mono"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-muted uppercase tracking-widest font-mono">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-bg-primary border border-white/[0.06] rounded-xl px-4 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-2.5 text-xs text-error font-mono">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/20 hover:border-accent-purple/40 text-accent-purple rounded-xl px-4 py-2.5 text-sm font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-text-muted/40 font-mono mt-4 tracking-wider">
          THEO NEURAL CONTROL v1.0
        </p>
      </div>
    </div>
  );
}
