import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import OnboardingWizard from '../components/OnboardingWizard';

interface DashboardData {
  instance: { instance_name: string; phone: string; status: string } | null;
  summary: { total_groups: number; origin_groups: number; destination_groups: number };
  originGroups: { id: string; group_name: string; group_jid: string; niche: string }[];
  destinationGroups: { id: string; group_name: string; group_jid: string; niche: string }[];
}
interface Stats { today: number; week: number; month: number; total: number }

export default function Dashboard() {
  const { usuario } = useAuth();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');

  async function carregar() {
    setLoading(true); setErro('');
    try {
      const [dash, st] = await Promise.allSettled([
        api<DashboardData>('/whatsapp/dashboard'),
        api<{ stats: Stats }>('/relay/stats'),
      ]);
      if (dash.status === 'fulfilled') setData(dash.value);
      if (st.status   === 'fulfilled') setStats(st.value.stats);
      if (dash.status === 'rejected')  setErro(dash.reason?.message || 'Erro ao carregar');
    } finally { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  const inst = data?.instance;
  const statusConectado = (s?: string) =>
    s === 'connected' || s === 'open' || s === 'conectado';
  const desconectado = inst && !statusConectado(inst.status);

  return (
    <>
      <PageHeader
        title={`Olá, ${usuario?.nome?.split(' ')[0]}!`}
        subtitle="Acompanhe sua automação de ofertas"
        action={
          <button onClick={carregar} disabled={loading} className="btn btn-outline">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        }
      />

      <OnboardingWizard />

      {desconectado && (
        <div className="flex items-start justify-between gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">WhatsApp desconectado</p>
              <p className="text-xs text-red-600 mt-0.5">O relay está pausado. Reconecte para retomar.</p>
            </div>
          </div>
          <Link to="/whatsapp" className="btn btn-danger text-xs shrink-0">Reconectar</Link>
        </div>
      )}

      <Alert message={erro} />

      {/* Stats de relay */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Hoje',     value: stats.today },
            { label: 'Semana',   value: stats.week  },
            { label: 'Mês',      value: stats.month },
            { label: 'Total',    value: stats.total },
          ].map((s) => (
            <div key={s.label} className="card text-center py-4">
              <p className="text-3xl font-extrabold text-brand-500">{s.value.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status WhatsApp */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Status do WhatsApp</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : inst ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 text-sm space-y-1">
              <p><span className="text-gray-500">Instância:</span> <span className="font-medium">{inst.instance_name}</span></p>
              <p><span className="text-gray-500">Número:</span> <span className="font-medium">{inst.phone}</span></p>
              <p>
                <span className="text-gray-500">Status:</span>{' '}
                <span className={`font-semibold ${statusConectado(inst.status) ? 'text-green-600' : 'text-red-500'}`}>
                  ● {statusConectado(inst.status) ? 'Conectado' : 'Desconectado'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm"><span className="text-gray-500">Grupos de origem:</span> <strong>{data?.summary.origin_groups}</strong></p>
              <p className="text-sm ml-4"><span className="text-gray-500">Destino:</span> <strong>{data?.summary.destination_groups}</strong></p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Nenhuma instância conectada ainda.</p>
            <Link to="/whatsapp" className="btn btn-primary text-xs">Conectar agora</Link>
          </div>
        )}
      </div>

      {/* Tabelas de grupos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GruposTable titulo="Grupos monitorados (origem)" grupos={data?.originGroups ?? []} loading={loading} cor="blue" />
        <GruposTable titulo="Grupos de destino" grupos={data?.destinationGroups ?? []} loading={loading} cor="green" />
      </div>
    </>
  );
}

function GruposTable({ titulo, grupos, loading, cor }: {
  titulo: string;
  grupos: { id: string; group_name: string; group_jid: string; niche: string }[];
  loading: boolean;
  cor: 'blue' | 'green';
}) {
  const bg = cor === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700';
  return (
    <div className="card">
      <h2 className="font-semibold text-gray-800 mb-3">{titulo}</h2>
      {loading ? <p className="text-sm text-gray-400">Carregando...</p>
      : grupos.length === 0 ? <p className="text-sm text-gray-400">Nenhum grupo configurado.</p>
      : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="pb-2 font-medium">Grupo</th>
              <th className="pb-2 font-medium">Nicho</th>
            </tr></thead>
            <tbody>
              {grupos.map((g) => (
                <tr key={g.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 font-medium text-gray-800 truncate max-w-[160px]">{g.group_name || 'Sem nome'}</td>
                  <td className="py-2">
                    <span className={`badge ${bg}`}>{g.niche || 'geral'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
