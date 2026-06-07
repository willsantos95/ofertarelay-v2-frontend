import { useEffect, useState, useCallback } from 'react';
import {
  Loader2, Play, Pause, Save, Trash2, CheckSquare, Square, MessageCircle,
  Clock, CheckCircle2, AlertCircle, ShoppingBag, RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

interface Config {
  intervalo_min: number;
  ativo: boolean;
  grupos: string[];
  enviar_telegram: boolean;
  proximo_envio_em: string | null;
}
interface ItemFila {
  id: string; oferta_id: string; legenda: string;
  status: 'pendente' | 'enviado' | 'erro';
  enviado_em: string | null; erro: string | null; criado_em: string;
  nome: string; preco: number; imagem_url: string | null; plataforma: string;
}
interface GrupoDestino { id: string; group_jid: string; nome: string; papel: string; }
interface TelegramConfig { chatIds: string[]; status: string; }

function formatPreco(v: number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Agendamento() {
  const [config, setConfig]     = useState<Config>({ intervalo_min: 7, ativo: false, grupos: [], enviar_telegram: false, proximo_envio_em: null });
  const [grupos, setGrupos]     = useState<GrupoDestino[]>([]);
  const [telegram, setTelegram] = useState<TelegramConfig | null>(null);
  const [itens, setItens]       = useState<ItemFila[]>([]);
  const [contagem, setContagem] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]   = useState('');
  const [erro, setErro] = useState('');

  const carregarItens = useCallback(async () => {
    try {
      const r = await api<{ sucesso: boolean; itens: ItemFila[]; contagem: { status: string; total: string }[] }>('/agendamento/itens');
      setItens(r.itens || []);
      const c: Record<string, number> = {};
      (r.contagem || []).forEach((x) => { c[x.status] = parseInt(x.total); });
      setContagem(c);
    } catch { /* silencioso no refresh */ }
  }, []);

  const carregarTudo = useCallback(async () => {
    setLoading(true);
    try {
      const [rCfg, rGr, rTg] = await Promise.all([
        api<{ sucesso: boolean; config: Config }>('/agendamento/config'),
        api<{ sucesso: boolean; grupos: GrupoDestino[] }>('/whatsapp/grupos'),
        api<{ sucesso: boolean; setting: { payload: TelegramConfig } }>('/settings/telegram').catch(() => null),
      ]);
      setConfig({ ...rCfg.config, grupos: rCfg.config.grupos || [] });
      setGrupos((rGr.grupos || []).filter((g) => g.papel === 'destino'));
      const tg = rTg?.setting?.payload;
      if (tg?.status === 'active' && tg.chatIds?.length) setTelegram(tg);
      await carregarItens();
    } catch (e) {
      setErro((e as Error).message || 'Erro ao carregar agendamento');
    } finally { setLoading(false); }
  }, [carregarItens]);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  // Auto-refresh da fila a cada 20s
  useEffect(() => {
    const t = setInterval(() => { carregarItens(); }, 20000);
    return () => clearInterval(t);
  }, [carregarItens]);

  async function salvar(cfg: Config) {
    setSaving(true); setErro(''); setMsg('');
    try {
      const r = await api<{ sucesso: boolean; config: Config }>('/agendamento/config', {
        method: 'PUT',
        body: JSON.stringify({
          intervalo_min:   cfg.intervalo_min,
          ativo:           cfg.ativo,
          grupos:          cfg.grupos,
          enviar_telegram: cfg.enviar_telegram,
        }),
      });
      setConfig({ ...r.config, grupos: r.config.grupos || [] });
      setMsg(cfg.ativo ? 'Envio agendado ativado.' : 'Configuração salva.');
    } catch (e) { setErro((e as Error).message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  }

  function toggleGrupo(jid: string) {
    setConfig((prev) => {
      const tem = prev.grupos.includes(jid);
      return { ...prev, grupos: tem ? prev.grupos.filter((g) => g !== jid) : [...prev.grupos, jid] };
    });
  }

  async function removerItem(id: string) {
    try { await api(`/agendamento/itens/${id}`, { method: 'DELETE' }); await carregarItens(); }
    catch (e) { setErro((e as Error).message); }
  }

  async function limparFila(status?: string) {
    const label = status === 'enviado' ? 'enviadas' : 'TODAS as ofertas da fila';
    if (!window.confirm(`Remover ${label}?`)) return;
    try {
      await api(`/agendamento/itens${status ? `?status=${status}` : ''}`, { method: 'DELETE' });
      await carregarItens();
    } catch (e) { setErro((e as Error).message); }
  }

  const pendentes = contagem['pendente'] || 0;
  const enviados  = contagem['enviado'] || 0;
  const erros     = contagem['erro'] || 0;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <>
      <PageHeader
        title="Agendamento de Ofertas"
        subtitle="Envie as ofertas da fila automaticamente, uma a cada intervalo definido"
        action={
          <button
            onClick={() => salvar({ ...config, ativo: !config.ativo })}
            disabled={saving}
            className={`btn ${config.ativo ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' : 'btn-primary bg-green-600 hover:bg-green-700 border-green-600'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : config.ativo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {config.ativo ? 'Pausar envio' : 'Iniciar envio'}
          </button>
        }
      />

      <Alert message={erro} />
      <Alert message={msg} type="success" />

      {/* Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className={`card text-center ${config.ativo ? 'ring-2 ring-green-400' : ''}`}>
          <p className="text-xs text-gray-400 mb-1">Status</p>
          <p className={`font-semibold ${config.ativo ? 'text-green-600' : 'text-gray-500'}`}>
            {config.ativo ? '● Ativo' : '○ Pausado'}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Na fila</p>
          <p className="font-semibold text-amber-600">{pendentes}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Enviadas</p>
          <p className="font-semibold text-green-600">{enviados}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Com erro</p>
          <p className="font-semibold text-red-600">{erros}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração */}
        <div className="card lg:col-span-1 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">Configuração</h3>

          <div className="mb-4">
            <label className="label">Intervalo entre envios (minutos)</label>
            <input type="number" min={1} max={1440} className="input"
              value={config.intervalo_min}
              onChange={(e) => setConfig({ ...config, intervalo_min: parseInt(e.target.value) || 1 })} />
            <p className="text-xs text-gray-400 mt-1">Uma oferta a cada {config.intervalo_min} min.</p>
          </div>

          <div className="mb-4">
            <label className="label">Grupos de destino (WhatsApp)</label>
            {grupos.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                Nenhum grupo de destino. Configure na página Grupos.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {grupos.map((g) => {
                  const sel = config.grupos.includes(g.group_jid);
                  return (
                    <button key={g.group_jid} onClick={() => toggleGrupo(g.group_jid)}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                        sel ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:bg-gray-50'
                      }`}>
                      {sel ? <CheckSquare className="w-4 h-4 text-green-600 shrink-0" /> : <Square className="w-4 h-4 text-gray-300 shrink-0" />}
                      <span className="text-sm text-gray-700 truncate">{g.nome || g.group_jid}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {telegram && (
            <div className="mb-4">
              <label className="label">Telegram</label>
              <button onClick={() => setConfig({ ...config, enviar_telegram: !config.enviar_telegram })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  config.enviar_telegram ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                }`}>
                {config.enviar_telegram ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" /> : <Square className="w-4 h-4 text-gray-300 shrink-0" />}
                <MessageCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-sm text-gray-700">Enviar também no Telegram</span>
              </button>
            </div>
          )}

          <button onClick={() => salvar(config)} disabled={saving} className="btn btn-outline w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar configuração
          </button>
        </div>

        {/* Fila */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Fila de envio</h3>
            <div className="flex gap-2">
              <button onClick={carregarItens} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Atualizar
              </button>
              {enviados > 0 && (
                <button onClick={() => limparFila('enviado')} className="text-xs text-gray-500 hover:text-gray-700">
                  Limpar enviadas
                </button>
              )}
              {itens.length > 0 && (
                <button onClick={() => limparFila()} className="text-xs text-red-500 hover:text-red-700">
                  Limpar fila
                </button>
              )}
            </div>
          </div>

          {itens.length === 0 ? (
            <div className="card text-center py-14">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-1">A fila está vazia.</p>
              <p className="text-gray-400 text-xs">Selecione ofertas na página Ofertas e clique em "Adicionar à fila".</p>
            </div>
          ) : (
            <div className="space-y-2">
              {itens.map((it) => (
                <div key={it.id} className="card p-3 flex items-center gap-3">
                  {it.imagem_url ? (
                    <img src={it.imagem_url} alt={it.nome} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{it.nome}</p>
                    <p className="text-sm font-bold text-brand-600">{formatPreco(it.preco)}</p>
                    {it.status === 'erro' && it.erro && (
                      <p className="text-[11px] text-red-500 line-clamp-1">{it.erro}</p>
                    )}
                  </div>
                  <StatusBadge status={it.status} />
                  <button onClick={() => removerItem(it.id)} className="text-gray-300 hover:text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: 'pendente' | 'enviado' | 'erro' }) {
  if (status === 'enviado')
    return <span className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /> Enviada</span>;
  if (status === 'erro')
    return <span className="flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full shrink-0"><AlertCircle className="w-3.5 h-3.5" /> Erro</span>;
  return <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full shrink-0"><Clock className="w-3.5 h-3.5" /> Na fila</span>;
}
