import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectTo = typeof location.state === 'object' && location.state && 'from' in location.state
    ? String(location.state.from)
    : '/';

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Credenciais invalidas.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_30%),linear-gradient(180deg,_#eff6ff_0%,_#ffffff_100%)] p-6">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">Acesso</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">Entrar</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Faça login para acessar a área autenticada de upload e listagem de arquivos.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block" htmlFor="login-email">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              aria-label="Email"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-600"
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block" htmlFor="login-password">
            <span className="mb-2 block text-sm font-medium text-slate-700">Senha</span>
            <input
              aria-label="Senha"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-600"
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            className="w-full rounded-2xl bg-teal-700 px-4 py-3 text-base font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-400"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
