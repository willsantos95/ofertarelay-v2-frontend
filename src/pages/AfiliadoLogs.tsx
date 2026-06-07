import { useEffect, useState, useCallback } from 'react';
import {
  Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

interface LogItem {
  id: string;
  plataforma: 'shopee' | 'mercadolivre';
  contexto: 'envio' | 'sincronizacao' | 'manual';
  url_origem: string;
  url_gerada: string | null;
  sucesso: boolean;
  erro: string | null;
  duracao_ms: number | null;
  criado_em: string;
}
interface Resumo { plataforma: string; sucessos: string; erros: string; avg_ms: string | null; }
interface Paginacao { total: number; pagina: number; limite: number; totalPaginas: number; }

const FILTROS_PLAT = [['', 'Todas'], ['shopee', '🟠 Shopee'], ['mercadolivre', '🟡 ML']];
const FILTROS_RES  = [['', 'Todos'], ['true', '✓ Sucesso'], ['false', '✗ Erro']];
const FILTROS_CTX  = [['', 'Todos'], ['envio', 'Envio'], ['sincronizacao', 'Sync'], ['manual', 'Manual']];

export default function AfiliadoLogs() {
  const [logs, setLogs]         = useState<LogItem[]>([]);
  const [resumo, setResumo]     = useState<Resumo[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [pagina, setPagina]     = useState(1);
  const [platFiltro, setPlatFiltro] = useState('');
  const [sucFiltro,  setSucFiltro]  = useState('');
  const [ctxFiltro,  setCtxFiltro]  = useState('');
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState('');
  const [limpando, setLimpando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ pagina: String(pagina), limite: '50' });
      if (platFiltro) qs.set('plataforma', platFiltro);
      if (sucFiltro !== '') qs.set('sucesso', sucFiltro);
      if (ctxFiltro) qs.set('contexto', ctxFiltro);
      const r = await api<{ sucesso: boolean; logs: LogItem[]; resumo: Resumo[]; paginacao: Paginacao }>(`/afiliado/logs?${qs}`);
      setLogs(r.logs || []);
      setResumo(r.resumo || []);
      setPaginacao(r.paginacao);
    } catch (e) {
      setErro((e as Error).message || 'Erro ao carregar logs');
    } finally { setLoading(false); }
  }, [pagina, platFiltro, sucFiltro, ctxFiltro]);

  useEffect(() => { carregar(); }, [carregar]);

  function mudar<T>(setter: (v: T) => void, v: T) { setter(v); setPagina(1); }

  async function limpar() {
    if (!window.confirm('Limpar logs com mais de 30 dias?')) return;
    setLimpando(true);
    try {
      const r = await api<{ sucesso: boolean; removidos: number }>('/afiliado/logs?dias=30', { method: 'DELETE' });
      setErro('');
      if (r.removidos > 0) await carregar();
    } catch (e) { setErro((e as Error).message); }
    finally { setLimpando(false); }
  }

  return (
    <>
      <PageHeader
        title="Logs — Links de Afiliado"
        subtitle="Histórico de criação de links (Shopee + Mercado Livre)"
        action={
          <div className="flex gap-2">
            <button onClick={carregar} disabled={loading} className="btn btn-outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Atualizar
            </button>
            <button onClick={limpar} disabled={limpando} className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50">
              {limpando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Limpar &gt;30 dias
            </button>
          </div>
        }
      />

      <Alert message={erro} />

      {/* Cards de resumo */}
      {resumo.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {resumo.map((r) => {
            const total = parseInt(r.sucessos) + parseInt(r.erros);
            const pct   = total > 0 ? Math.round((parseInt(r.sucessos) / total) * 100) : 0;
            const label = r.plataforma === 'shopee' ? '🟠 Shopee' : '🟡 Mercado Livre';
            return (
              <div key={r.plataforma} className="card">
                <p className="text-xs text-gray-400 mb-2">{label}</p>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-800">{pct}%</span>
                  <span className="text-xs text-gray-400 mb-1">sucesso</span>
                </div>
                <p className="text-xs text-gray-500">
                  <span className="text-green-600 font-medium">{r.sucessos} ok</span>
                  {' · '}
                  <span className="text-red-500 font-medium">{r.erros} erros</span>
                  {r.avg_ms && ` · ~${r.avg_ms}ms`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterGroup label="Plataforma" opts={FILTROS_PLAT} val={platFiltro} onChange={(v) => mudar(setPlatFiltro, v)} />
        <FilterGroup label="Resultado"  opts={FILTROS_RES}  val={sucFiltro}  onChange={(v) => mudar(setSucFiltro, v)} />
        <FilterGroup label="Contexto"   opts={FILTROS_CTX}  val={ctxFiltro}  onChange={(v) => mudar(setCtxFiltro, v)} />
        {paginacao && (
          <span className="ml-auto text-xs text-gray-400 self-center">
            {paginacao.total} registro{paginacao.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-14 text-gray-400 text-sm">
          Nenhum log encontrado.
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Plataforma</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Contexto</th>
                  <th className="px-4 py-3 text-left">URL origem</th>
                  <th className="px-4 py-3 text-left">Link gerado</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">ms</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={l.id} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(l.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {l.plataforma === 'shopee' ? '🟠 Shopee' : '🟡 ML'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell capitalize">{l.contexto}</td>
                    <td className="px-4 py-2.5 max-w-[180px]">
                      <span className="text-xs text-gray-500 truncate block" title={l.url_origem}>
                        {l.url_origem.replace(/^https?:\/\//, '').slice(0, 40)}{l.url_origem.length > 45 ? '…' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 max-w-[160px]">
                      {l.url_gerada ? (
                        <a href={l.url_gerada} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline truncate block" title={l.url_gerada}>
                          {l.url_gerada}
                        </a>
                      ) : l.erro ? (
                        <span className="text-xs text-red-500 truncate block" title={l.erro}>{l.erro.slice(0, 50)}{l.erro.length > 50 ? '…' : ''}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {l.sucesso
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        : <XCircle      className="w-4 h-4 text-red-400 mx-auto" />}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-gray-400 hidden lg:table-cell">
                      {l.duracao_ms != null ? (
                        <span className={`flex items-center justify-end gap-1 ${l.duracao_ms > 5000 ? 'text-amber-500' : ''}`}>
                          <Clock className="w-3 h-3" />{l.duracao_ms}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginacao && paginacao.totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina <= 1} className="btn btn-outline py-1.5 px-3 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">{pagina} / {paginacao.totalPaginas}</span>
              <button onClick={() => setPagina((p) => Math.min(paginacao.totalPaginas, p + 1))} disabled={pagina >= paginacao.totalPaginas} className="btn btn-outline py-1.5 px-3 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function FilterGroup({ label, opts, val, onChange }: {
  label: string; opts: string[][]; val: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 shrink-0">{label}:</span>
      {opts.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${val === v ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {l}
        </button>
      ))}
    </div>
  );
}
