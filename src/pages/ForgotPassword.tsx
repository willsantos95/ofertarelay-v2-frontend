import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/auth/esqueci-senha', { method: 'POST', body: JSON.stringify({ email }) });
    } catch { /* silencioso — não revelar se email existe */ }
    finally { setLoading(false); setEnviado(true); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OfertaRelay</h1>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Esqueci minha senha</h2>

          {enviado ? (
            <div className="text-sm text-gray-600 mt-3">
              <p className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3">
                Se este email existir, você receberá as instruções de recuperação em breve.
              </p>
              <Link to="/login" className="block text-center text-brand-600 font-medium mt-5 hover:underline">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <div>
                <label className="label">Email da conta</label>
                <input
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary py-2.5">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar instruções'}
              </button>
              <Link to="/login" className="text-center text-sm text-gray-500 hover:text-gray-700">
                Voltar para o login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
