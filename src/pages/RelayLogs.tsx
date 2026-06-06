import { useEffect, useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { formatDate } from '../lib/utils';

const NICHOS = ['geral', 'pet', 'baby', 'fitness', 'home', 'electronics', 'fashion'];

interface Log {
  id: number;
  instance_name: string;
  origin_group_name: string | null;
  destination_group_name: string | null;
  store: string | null;
  niche: string | null;
  affiliate_url: string | null;
  status: string | null;
  relayed_at: string;
}
interface Stats { today: number; week: number; month: number; total: number }

export default function RelayLogs() {
  const [logs, setLogs]   = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(p = page, n = niche) {
    setLoading(true); setErro('');
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (n) params.set('niche', n);

      const [logsRes, statsRes] = await Promise.all([
        api<{ logs: Log[]; total: number }>(`/relay/logs?${params}`),
        stats === null ? api<{ stats: Stats }>('/relay/stats') : Promise.resolve(null),
      ]);

      setLogs(logsRes.logs || []);
      setTotal(logsRes.total || 0);
      if (statsRes) setStats((statsRes as { stats: Stats }).stats);
    } catch (e) { setErro((e as Error).message || 'Erro ao carregar histórico'); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(1, ''); }, []);

  const totalPages = Math.ceil(total / 50);

  function mudarNiche(v: string) { setNiche(v); setPage(1); carregar(1, v); }
  function mudarPage(p: number)  { setPage(p); carregar(p, niche); }

  return (
    <>
      <PageHeader
        title="Histórico de Relay"
        subtitle="Registros de ofertas relayadas com links de afiliado"
        action={
          <button onClick={() => carregar()} disabled={loading} className="btn btn-outline">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Hoje',  value: stats.today },
            { label: 'Semana', value: stats.week  },
            { label: 'Mês',   value: stats.month },
            { label: 'Total', value: stats.total },
          ].map((s) => (
            <div key={s.label} className="card text-center py-3">
              <p className="text-2xl font-extrabold text-gray-900">{s.value.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <Alert message={erro} />

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <h2 className="font-semibold text-gray-900 flex-1">Logs ({total.toLocaleString('pt-BR')})</h2>
          <select value={niche} onChange={(e) => mudarNiche(e.target.value)} className="input w-auto text-sm py-1.5">
            <option value="">Todos os nichos</option>
            {NICHOS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {loading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>}

        {!loading && logs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">
            Nenhum relay registrado ainda. O n8n registra aqui cada oferta enviada.
          </p>
        )}

        {!loading && logs.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-medium whitespace-nowrap">Data/hora</th>
                    <th className="pb-2 font-medium">Origem</th>
                    <th className="pb-2 font-medium">Destino</th>
                    <th className="pb-2 font-medium">Loja</th>
                    <th className="pb-2 font-medium">Nicho</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const ok = !log.status || log.status === 'success' || log.status === 'sucesso';
                    return (
                      <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="py-2.5 text-gray-500 whitespace-nowrap text-xs">{formatDate(log.relayed_at)}</td>
                        <td className="py-2.5 text-gray-700 max-w-[120px] truncate">{log.origin_group_name || '—'}</td>
                        <td className="py-2.5 text-gray-700 max-w-[120px] truncate">{log.destination_group_name || '—'}</td>
                        <td className="py-2.5">
                          {log.store
                            ? <span className="badge bg-indigo-50 text-indigo-700">{log.store}</span>
                            : <span className="text-gray-400">—</span>
                          }
                        </td>
                        <td className="py-2.5">
                          <span className="badge badge-green">{log.niche || 'geral'}</span>
                        </td>
                        <td className="py-2.5">
                          <span className={`badge ${ok ? 'badge-green' : 'badge-red'}`}>
                            {ok ? '✓ enviado' : '✗ erro'}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {log.affiliate_url
                            ? <a href={log.affiliate_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-xs">ver link</a>
                            : <span className="text-gray-400">—</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button disabled={page <= 1} onClick={() => mudarPage(page - 1)} className="btn btn-outline text-xs">← Anterior</button>
                <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => mudarPage(page + 1)} className="btn btn-outline text-xs">Próxima →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
