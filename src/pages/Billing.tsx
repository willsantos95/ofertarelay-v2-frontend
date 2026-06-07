import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, RefreshCw, Loader2, ExternalLink, Zap } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

const PLAN_NAME   = import.meta.env.VITE_PLAN_NAME   || 'OfertaRelay Pro';
const PLAN_AMOUNT = import.meta.env.VITE_PLAN_AMOUNT  || '199';

type BillingUser = { id: string; name: string; email: string; plan_status: string };
type Subscription = {
  id: string; provider: string; provider_subscription_id: string;
  plan_name: string; amount: number; currency: string; status: string;
  checkout_url?: string | null; next_payment_at?: string | null;
  cancelled_at?: string | null; created_at?: string;
};
type BillingData = { user: BillingUser | null; subscription: Subscription | null };

function getStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    trial: 'Teste grátis', ativo: 'Ativa', active: 'Ativa', authorized: 'Ativa',
    pendente: 'Aguardando pagamento', pending: 'Aguardando pagamento',
    pausado: 'Pausada', paused: 'Pausada',
    cancelado: 'Cancelada', cancelled: 'Cancelada',
    past_due: 'Pagamento pendente',
  };
  return labels[status || ''] || status || 'Sem assinatura';
}

function getStatusColor(status?: string | null) {
  if (['ativo', 'active', 'authorized', 'trial'].includes(status || '')) return 'text-green-600';
  if (['pendente', 'pending', 'pausado', 'paused', 'past_due'].includes(status || '')) return 'text-amber-600';
  return 'text-red-500';
}

function formatMoney(value?: number | null) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Billing() {
  const location = useLocation();
  const sucesso  = location.pathname === '/billing/success';

  const [billing, setBilling]               = useState<BillingData | null>(null);
  const [loading, setLoading]               = useState(false);
  const [criandoCheckout, setCriandoCheckout] = useState(false);
  const [sincronizando, setSincronizando]   = useState(false);
  const [msg, setMsg]   = useState('');
  const [erro, setErro] = useState('');

  async function carregar() {
    setLoading(true); setMsg(''); setErro('');
    try {
      const data = await api<BillingData>('/billing/me');
      setBilling(data);
    } catch (e) { setErro((e as Error).message || 'Erro ao carregar assinatura.'); }
    finally { setLoading(false); }
  }

  async function assinar() {
    setCriandoCheckout(true); setMsg(''); setErro('');
    try {
      const data = await api<{ checkoutUrl: string }>('/billing/checkout', { method: 'POST' });
      if (!data.checkoutUrl) throw new Error('Checkout não retornou URL de pagamento.');
      window.location.href = data.checkoutUrl;
    } catch (e) { setErro((e as Error).message || 'Erro ao iniciar checkout.'); }
    finally { setCriandoCheckout(false); }
  }

  async function sincronizar() {
    setSincronizando(true); setMsg(''); setErro('');
    try {
      const data = await api<{ planStatus: string }>('/billing/sync', { method: 'POST' });
      setMsg(`Assinatura sincronizada. Status: ${getStatusLabel(data.planStatus)}`);
      await carregar();
    } catch (e) { setErro((e as Error).message || 'Erro ao sincronizar.'); }
    finally { setSincronizando(false); }
  }

  useEffect(() => { carregar(); }, []);

  if (sucesso) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CheckCircle2 className="w-16 h-16 text-brand-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900">Assinatura confirmada!</h1>
      <p className="text-gray-500 mt-2 mb-6">Seu plano está ativo. Aproveite o relay ilimitado!</p>
      <button onClick={carregar} className="btn btn-primary">Ir para o painel</button>
    </div>
  );

  const user         = billing?.user || null;
  const subscription = billing?.subscription || null;
  const planStatus   = user?.plan_status || 'inactive';

  return (
    <>
      <PageHeader title="Assinatura" subtitle="Gerencie o plano mensal da sua automação." />

      <Alert message={erro} />
      <Alert message={msg} type="success" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card do plano */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{PLAN_NAME}</h2>
              <p className="text-xs text-gray-500">Automação de relay de ofertas 24h</p>
            </div>
          </div>

          <div className="mb-5">
            <span className="text-4xl font-extrabold text-gray-900">R${PLAN_AMOUNT}</span>
            <span className="text-gray-400 ml-1">/mês</span>
          </div>

          <div className="mb-6 p-3 bg-gray-50 rounded-xl text-sm space-y-1">
            <p>
              Status do plano:{' '}
              <strong className={getStatusColor(planStatus)}>
                {getStatusLabel(planStatus)}
              </strong>
            </p>
            {user?.email && (
              <p className="text-gray-500">Conta: <strong className="text-gray-700">{user.email}</strong></p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={assinar} disabled={criandoCheckout} className="btn btn-primary py-2.5">
              {criandoCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              {criandoCheckout ? 'Gerando checkout...' : 'Assinar agora'}
            </button>
            <button onClick={carregar} disabled={loading} className="btn btn-outline">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Card de status da cobrança */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Status da cobrança</h2>

          {!subscription ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Nenhuma assinatura criada ainda.<br />
              Clique em "Assinar agora" para começar.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plano</span>
                <span className="font-medium">{subscription.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valor</span>
                <span className="font-medium">{formatMoney(subscription.amount)}/mês</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status gateway</span>
                <span className={`font-semibold ${getStatusColor(subscription.status)}`}>
                  {getStatusLabel(subscription.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Próximo pagamento</span>
                <span className="font-medium">{formatDate(subscription.next_payment_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Criada em</span>
                <span className="font-medium">{formatDate(subscription.created_at)}</span>
              </div>
              {subscription.provider_subscription_id && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    ID: <code className="font-mono">{subscription.provider_subscription_id}</code>
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                {subscription.checkout_url && (
                  <a href={subscription.checkout_url} target="_blank" rel="noreferrer"
                    className="btn btn-primary text-xs flex-1">
                    <ExternalLink className="w-3 h-3" />
                    Abrir checkout
                  </a>
                )}
                <button onClick={sincronizar} disabled={sincronizando}
                  className="btn btn-outline text-xs flex-1">
                  {sincronizando ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* O que está incluso */}
      <div className="card mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">O que está incluso</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { titulo: 'WhatsApp conectado', desc: 'Instância conectada via Evolution API, operando 24h.' },
            { titulo: 'Grupos por nicho',   desc: 'Configure grupos de origem e destino com filtragem por nicho.' },
            { titulo: 'Automação n8n',      desc: 'Integração completa com seu fluxo n8n via API.' },
          ].map((item) => (
            <div key={item.titulo} className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-800 text-sm">{item.titulo}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
