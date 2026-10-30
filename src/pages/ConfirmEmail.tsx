import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Zap, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { usuario, recarregar } = useAuth();
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'erro'>(token ? 'carregando' : 'erro');
  const [mensagem, setMensagem] = useState(token ? '' : 'Link inválido.');
  const enviado = useRef(false);

  useEffect(() => {
    if (!token || enviado.current) return;
    enviado.current = true;
    api<{ mensagem: string }>('/auth/confirmar-email', { method: 'POST', body: JSON.stringify({ token }) }, false)
      .then(() => { setEstado('ok'); recarregar().catch(() => undefined); })
      .catch((e) => { setEstado('erro'); setMensagem((e as Error).message); });
  }, [token, recarregar]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OfertaRelay</h1>
        </div>
        <div className="card text-center py-8">
          {estado === 'carregando' && <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />}
          {estado === 'ok' && (
            <>
              <CheckCircle2 className="w-10 h-10 text-brand-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold">E-mail confirmado</h2>
              <p className="text-sm text-gray-500 mt-1">Tudo certo com a sua conta.</p>
              <Link to={usuario ? '/app' : '/login'} className="btn btn-primary mt-6">
                {usuario ? 'Abrir o painel' : 'Entrar'}
              </Link>
            </>
          )}
          {estado === 'erro' && (
            <>
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold">Não deu para confirmar</h2>
              <p className="text-sm text-gray-500 mt-1">{mensagem || 'Este link expirou ou já foi usado.'}</p>
              <p className="text-sm text-gray-500 mt-3">Entre na sua conta para pedir um novo link.</p>
              <Link to={usuario ? '/app' : '/login'} className="btn btn-outline mt-6">
                {usuario ? 'Abrir o painel' : 'Entrar'}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
