import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import { diasRestantes } from '../lib/utils';

const CHECKOUT_URL = import.meta.env.VITE_CHECKOUT_URL || '#';

export default function Billing() {
  const { usuario, recarregar } = useAuth();
  const location = useLocation();
  const sucesso  = location.pathname === '/billing/success';
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { recarregar().finally(() => setLoaded(true)); }, []);

  if (!loaded || !usuario) return (
    <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  );

  if (sucesso) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CheckCircle2 className="w-16 h-16 text-brand-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900">Assinatura confirmada!</h1>
      <p className="text-gray-500 mt-2">Seu plano Pro está ativo. Aproveite o relay ilimitado!</p>
      <Link to="/" className="btn btn-primary mt-6">Ir para o Dashboard</Link>
    </div>
  );

  const { status_plano, trial_termina_em } = usuario;
  const dias = diasRestantes(trial_termina_em);

  return (
    <>
      <PageHeader title="Faturamento" subtitle="Gerencie seu plano e assinatura" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card do plano atual */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-5">Plano atual</h2>

          {status_plano === 'trial' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <span className="badge badge-yellow text-sm">Trial</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {dias > 0 ? `Expira em ${dias} dia${dias > 1 ? 's' : ''}` : 'Trial expirado'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Após o período de trial, suas automações serão pausadas. Assine para continuar.
              </p>
              <a href={CHECKOUT_URL} target="_blank" rel="noreferrer" className="btn btn-primary w-full py-3">
                <ExternalLink className="w-4 h-4" />
                Assinar OfertaRelay Pro — R$199/mês
              </a>
            </div>
          )}

          {status_plano === 'ativo' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-brand-500" />
                <div>
                  <span className="badge badge-green text-sm">Pro Ativo</span>
                  <p className="text-sm text-gray-600 mt-1">Próxima cobrança em {new Date(trial_termina_em).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Seu plano está ativo. Obrigado por assinar!</p>
              <a href={CHECKOUT_URL} target="_blank" rel="noreferrer" className="btn btn-outline w-full">
                Gerenciar assinatura
              </a>
            </div>
          )}

          {(status_plano === 'cancelado' || status_plano === 'suspenso') && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <span className="badge badge-red text-sm">Suspenso</span>
                  <p className="text-sm text-red-600 mt-1">Seu acesso foi suspenso</p>
                </div>
              </div>
              <a href={CHECKOUT_URL} target="_blank" rel="noreferrer" className="btn btn-primary w-full py-3">
                <ExternalLink className="w-4 h-4" />
                Reativar assinatura
              </a>
            </div>
          )}
        </div>

        {/* Benefícios */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">O que está incluído no Pro</h2>
          <ul className="space-y-3">
            {[
              'Automação funcionando 24h por dia',
              'Recebe e reenvia ofertas automaticamente',
              'Links de afiliado para Shopee, Amazon, ML, Magalu e AliExpress',
              'Grupos ilimitados de origem e destino',
              'Integração com Telegram',
              'Histórico completo de relays',
              'Suporte e manutenção inclusos',
            ].map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          {status_plano !== 'ativo' && (
            <a href={CHECKOUT_URL} target="_blank" rel="noreferrer" className="btn btn-primary w-full mt-6 py-3">
              <ExternalLink className="w-4 h-4" />
              Assinar agora — R$199/mês
            </a>
          )}
        </div>
      </div>
    </>
  );
}
