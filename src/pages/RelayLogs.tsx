import { useEffect, useState } from 'react';
import { RefreshCw, Loader2, Search } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { formatDate } from '../lib/utils';

interface Log {
  id: number;
  origem: string | null;
  origin_group_name: string | null;
  destination_group_name: string | null;
  store: string | null;
  niche: string | null;
  title: string | null;
  price: string | number | null;
  affiliate_url: string | null;
  status: string | null;
  reason: string | null;
  destinations_total: number | null;
  destinations_ok: number | null;
  duration_ms: number | null;
  relayed_at: string;
}

interface Resumo {
  dias: number;
  kpis: { entregues: number; falhas: number; descartadas: number; enviosGrupos: number; taxaSucesso: number | null; duracaoMediaMs: number | null };
  porDia: { dia: string; entregues: number; falhas: number }[];
  porLoja: { chave: string; total: number }[];
  porOrigem: { chave: string; total: number }[];
  porMotivo: { chave: string; total: number }[];
}

const STATUS: Record<string, { rotulo: string; cls: string }> = {
  success:      { rotulo: 'Enviada',        cls: 'badge-green' },
  sucesso:      { rotulo: 'Enviada',        cls: 'badge-green' },
  publicada:    { rotulo: 'Enviada',        cls: 'badge-green' },
  parcial:      { rotulo: 'Parcial',        cls: 'badge-yellow' },
  failed:       { rotulo: 'Falhou',         cls: 'badge-red' },
  falha_link:   { rotulo: 'Falha no link',  cls: 'badge-red' },
  falha_envio:  { rotulo: 'Falha no envio', cls: 'badge-red' },
  sem_destino:  { rotulo: 'Sem destino',    cls: 'badge-red' },
  duplicada:    { rotulo: 'Repetida',       cls: 'badge-gray' },
  limite_diario:{ rotulo: 'Limite do dia',  cls: 'badge-gray' },
  plano_inativo:{ rotulo: 'Plano inativo',  cls: 'badge-gray' },
};

const ORIGENS: Record<string, string> = { relay: 'Automático', manual: 'Manual', agendado: 'Agendado' };
const LOJAS: Record<string, string> = {
  shopee: 'Shopee', mercado_livre: 'Mercado Livre', mercadolivre: 'Mercado Livre', amazon: 'Amazon',
  magalu: 'Magalu', aliexpress: 'AliExpress',
};

function statusInfo(s: string | null) {
  return STATUS[s || 'success'] || { rotulo: s || '—', cls: 'badge-gray' };
}

function Kpi({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="card py-3">
      <p className="text-xs text-gray-500">{rotulo}</p>
      <p className="text-2xl font-extrabold text-gray-900 tabular-nums mt-0.5">{valor}</p>
      {detalhe && <p className="text-xs text-gray-400 mt-0.5">{detalhe}</p>}
    </div>
  );
}

function Barras({ titulo, itens, rotular }: { titulo: string; itens: { chave: string; total: number }[]; rotular?: (k: string) => string }) {
  const max = Math.max(1, ...itens.map((i) => i.total));
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{titulo}</h3>
      {itens.length === 0 && <p className="text-xs text-gray-400">Nada no período.</p>}
      <div className="flex flex-col gap-2">
        {itens.slice(0, 6).map((i) => (
          <div key={i.chave} className="text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 truncate">{rotular ? rotular(i.chave) : i.chave}</span>
              <span className="text-gray-500 tabular-nums">{i.total.toLocaleString('pt-BR')}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(i.total / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PorDia({ dados }: { dados: Resumo['porDia'] }) {
  const max = Math.max(1, ...dados.map((d) => d.entregues + d.falhas));
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Ofertas por dia</h3>
      {dados.length === 0 ? <p className="text-xs text-gray-400">Nada no período.</p> : (
        <div className="flex items-end gap-1 h-32" role="img" aria-label="Ofertas enviadas e com falha por dia">
          {dados.map((d) => (
            <div key={d.dia} className="flex-1 flex flex-col justify-end items-center gap-px min-w-0"
              title={`${d.dia.split('-').reverse().join('/')}: ${d.entregues} enviadas, ${d.falhas} falhas`}>
              {d.falhas > 0 && <div className="w-full rounded-t-sm bg-red-400" style={{ height: `${(d.falhas / max) * 100}%` }} />}
              <div className={`w-full bg-brand-500 ${d.falhas ? '' : 'rounded-t-sm'}`} style={{ height: `${(d.entregues / max) * 100}%` }} />
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />Enviadas</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" />Falhas</span>
      </div>
    </div>
  );
}

export default function RelayLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dias, setDias] = useState(7);
  const [status, setStatus] = useState('');
  const [origem, setOrigem] = useState('');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(p = page) {
    setLoading(true); setErro('');
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50', dias: String(dias) });
      if (status) params.set('status', status);
      if (origem) params.set('origem', origem);
      if (busca.trim()) params.set('busca', busca.trim());
      const [l, r] = await Promise.all([
        api<{ logs: Log[]; total: number }>(`/relay/logs?${params}`),
        api<Resumo>(`/relay/resumo?dias=${dias}`),
      ]);
      setLogs(l.logs || []);
      setTotal(l.total || 0);
      setResumo(r);
    } catch (e) { setErro((e as Error).message || 'Erro ao carregar histórico'); }
    finally { setLoading(false); }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); carregar(1); }, [dias, status, origem]);

  const totalPages = Math.ceil(total / 50);
  const k = resumo?.kpis;

  return (
    <>
      <PageHeader
        title="Histórico"
        subtitle="Cada oferta recebida, o que aconteceu com ela e para onde foi"
        action={
          <div className="flex gap-2">
            <select value={dias} onChange={(e) => setDias(Number(e.target.value))} className="input w-auto py-1.5" aria-label="Período">
              <option value={1}>Hoje</option>
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
            </select>
            <button onClick={() => carregar()} disabled={loading} className="btn btn-outline" aria-label="Atualizar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      <Alert message={erro} />

      {k && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Kpi rotulo="Ofertas enviadas" valor={k.entregues.toLocaleString('pt-BR')} detalhe={`${k.enviosGrupos.toLocaleString('pt-BR')} envios em grupos`} />
          <Kpi rotulo="Taxa de sucesso" valor={k.taxaSucesso === null ? '—' : `${k.taxaSucesso}%`} detalhe={`${k.falhas} com falha`} />
          <Kpi rotulo="Descartadas" valor={k.descartadas.toLocaleString('pt-BR')} detalhe="repetidas, limite ou sem link" />
          <Kpi rotulo="Tempo médio" valor={k.duracaoMediaMs === null ? '—' : `${(k.duracaoMediaMs / 1000).toFixed(1)} s`} detalhe="da chegada ao último grupo" />
        </div>
      )}

      {resumo && (
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr] mb-6">
          <PorDia dados={resumo.porDia} />
          <Barras titulo="Por loja" itens={resumo.porLoja} rotular={(c) => LOJAS[c] || c} />
          <Barras titulo="Não enviadas, por motivo" itens={resumo.porMotivo} rotular={(c) => statusInfo(c).rotulo} />
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <h2 className="font-semibold text-gray-900 flex-1 min-w-[120px]">Registros ({total.toLocaleString('pt-BR')})</h2>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); carregar(1); }} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto" className="input pl-9 py-1.5 w-44" aria-label="Buscar produto" />
          </form>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto py-1.5" aria-label="Status">
            <option value="">Todos os status</option>
            <option value="sucesso">Enviadas</option>
            <option value="falha">Com falha</option>
            <option value="duplicada">Repetidas</option>
            <option value="limite_diario">Limite do dia</option>
          </select>
          <select value={origem} onChange={(e) => setOrigem(e.target.value)} className="input w-auto py-1.5" aria-label="Origem">
            <option value="">Todas as origens</option>
            {Object.entries(ORIGENS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </div>

        {loading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>}

        {!loading && logs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">Nenhum registro no período.</p>
        )}

        {!loading && logs.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-medium whitespace-nowrap">Quando</th>
                    <th className="pb-2 font-medium">Produto</th>
                    <th className="pb-2 font-medium">Loja</th>
                    <th className="pb-2 font-medium">Origem</th>
                    <th className="pb-2 font-medium">Grupos</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const st = statusInfo(log.status);
                    return (
                      <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 align-top">
                        <td className="py-2.5 text-gray-500 whitespace-nowrap text-xs">{formatDate(log.relayed_at)}</td>
                        <td className="py-2.5 text-gray-800 max-w-[260px]">
                          <p className="truncate" title={log.title || ''}>{log.title || '—'}</p>
                          {log.price && <p className="text-xs text-gray-400">R$ {String(log.price)}</p>}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          {log.store ? <span className="badge bg-indigo-50 text-indigo-700">{LOJAS[log.store] || log.store}</span> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-2.5 text-xs text-gray-600 whitespace-nowrap">
                          {ORIGENS[log.origem || 'relay'] || log.origem}
                          {log.origin_group_name && <p className="text-gray-400 truncate max-w-[140px]">{log.origin_group_name}</p>}
                        </td>
                        <td className="py-2.5 text-xs text-gray-600 whitespace-nowrap tabular-nums">
                          {log.destinations_total != null ? `${log.destinations_ok ?? 0}/${log.destinations_total}` : (log.destination_group_name || '—')}
                        </td>
                        <td className="py-2.5">
                          <span className={`badge ${st.cls}`}>{st.rotulo}</span>
                          {log.reason && <p className="text-xs text-gray-400 mt-1 max-w-[200px]">{log.reason}</p>}
                        </td>
                        <td className="py-2.5">
                          {log.affiliate_url
                            ? <a href={log.affiliate_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-xs">abrir</a>
                            : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button disabled={page <= 1} onClick={() => { setPage(page - 1); carregar(page - 1); }} className="btn btn-outline text-xs">← Anterior</button>
                <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); carregar(page + 1); }} className="btn btn-outline text-xs">Próxima →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
