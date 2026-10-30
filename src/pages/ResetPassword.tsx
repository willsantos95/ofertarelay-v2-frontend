import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import Alert from '../components/Alert';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [ver, setVer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [feito, setFeito] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (senha !== confirmar) { setErro('As senhas não conferem.'); return; }
    setLoading(true);
    try {
      await api('/auth/redefinir-senha', { method: 'POST', body: JSON.stringify({ token, senha }) }, false);
      setFeito(true);
    } catch (e) {
      setErro((e as Error).message || 'Não foi possível alterar a senha.');
    } finally { setLoading(false); }
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
          <h2 className="text-lg font-semibold mb-2">Criar nova senha</h2>

          {!token ? (
            <div className="text-sm text-gray-600 mt-3">
              <Alert message="Link inválido. Peça um novo na tela de recuperação." />
              <Link to="/forgot-password" className="block text-center text-brand-600 font-medium mt-2 hover:underline">
                Pedir novo link
              </Link>
            </div>
          ) : feito ? (
            <div className="text-sm text-gray-600 mt-3">
              <Alert type="success" message="Senha alterada. Entre com a nova senha." />
              <Link to="/login" className="btn btn-primary w-full py-2.5 mt-2">Ir para o login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <Alert message={erro} />
              <div>
                <label className="label">Nova senha</label>
                <div className="relative">
                  <input
                    type={ver ? 'text' : 'password'}
                    className="input pr-10"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setVer(!ver)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}>
                    {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Repita a nova senha</label>
                <input
                  type={ver ? 'text' : 'password'}
                  className="input"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary py-2.5">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar nova senha'}
              </button>
              {erro.includes('expirou') && (
                <Link to="/forgot-password" className="text-center text-sm text-brand-600 hover:underline">Pedir novo link</Link>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
