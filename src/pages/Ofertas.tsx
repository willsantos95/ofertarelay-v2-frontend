import { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw, Loader2, ExternalLink, Tag, ChevronLeft, ChevronRight,
  ShoppingBag, Store, Send, X, CheckSquare, Square, MessageCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

// ─── Interfaces ───────────────────────────────────────────────────

interface Oferta {
  id: string;
  item_id: string;
  nome: string;
  preco: number;
  preco_original: number | null;
  desconto_pct: number | null;
  imagem_url: string | null;
  link_produto: string | null;
  link_afiliado: string | null;
  comissao: number | null;
  taxa_comissao: number | null;
  categoria_id: number | null;
  categoria_nome: string;
  plataforma: 'shopee' | 'mercadolivre';
  status: 'pendente' | 'enviado';
  criado_em: string;
}

interface Categoria { id: number; nome: string; total: number; plataforma?: string; }
interface Paginacao  { total: number; pagina: number; limite: number; totalPaginas: number; }
interface GrupoDestino { id: string; group_jid: string; nome: string; papel: string; nicho: string; }
interface TelegramConfig { botToken: string; chatIds: string[]; status: string; }

const LIMITE = 24;

// ─── Helpers ──────────────────────────────────────────────────────

function formatPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatComissao(v: number) { return `${(v * 100).toFixed(0)}%`; }

function gerarLegenda(o: Oferta): string {
  const plat = o.plataforma === 'shopee' ? 'Shopee' : 'Mercado Livre';
  const prep = o.plataforma === 'shopee' ? 'na' : 'no';
  const link = o.link_afiliado || o.link_produto || '';

  // parseFloat garante que NUMERIC do PostgreSQL (retornado como string) seja tratado como número
  const preco = parseFloat(String(o.preco));
  const precoStr = preco % 1 === 0
    ? `R$ ${preco.toFixed(0)}`
    : formatPreco(preco);

  if (o.desconto_pct) {
    return `🔥 *${o.nome}*\n\n_Vendido ${prep} ${plat}_ · *-${o.desconto_pct}% OFF*\n\n💰 Por *${precoStr}*\n🛒 ${link}`;
  }
  return `🛍️ *${o.nome}*\n\n_Vendido ${prep} ${plat}_\n\n💰 Por *${precoStr}*\n🛒 ${link}`;
}

// ─── Página principal ─────────────────────────────────────────────

export default function Ofertas() {
  const [ofertas, setOfertas]       = useState<Oferta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [paginacao, setPaginacao]   = useState<Paginacao | null>(null);
  const [pagina, setPagina]             = useState(1);
  const [catFiltro, setCatFiltro]       = useState<number | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<string>('');
  const [platFiltro, setPlatFiltro]     = useState<string>('');

  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [syncingML, setSyncingML] = useState(false);
  const [msg, setMsg]             = useState('');
  const [erro, setErro]           = useState('');

  // Modal de envio
  const [modalOferta, setModalOferta] = useState<Oferta | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina: String(pagina), limite: String(LIMITE) });
      if (catFiltro)    params.set('categoria', String(catFiltro));
      if (statusFiltro) params.set('status', statusFiltro);
      if (platFiltro)   params.set('plataforma', platFiltro);

      const [resOfertas, resCats] = await Promise.all([
        api<{ sucesso: boolean; ofertas: Oferta[]; paginacao: Paginacao }>(`/ofertas?${params}`),
        api<{ sucesso: boolean; categorias: Categoria[] }>('/ofertas/categorias'),
      ]);
      setOfertas(resOfertas.ofertas || []);
      setPaginacao(resOfertas.paginacao);
      setCategorias(resCats.categorias || []);
    } catch (e) {
      setErro((e as Error).message || 'Erro ao carregar ofertas');
    } finally { setLoading(false); }
  }, [pagina, catFiltro, statusFiltro, platFiltro]);

  async function sincronizar() {
    setSyncing(true); setErro(''); setMsg('');
    try {
      const r = await api<{ sucesso: boolean; totalNovos: number }>('/ofertas/sincronizar', { method: 'POST' });
      setMsg(`Shopee: ${r.totalNovos} novas ofertas adicionadas.`);
      setPagina(1); await carregar();
    } catch (e) { setErro((e as Error).message || 'Erro ao sincronizar Shopee'); }
    finally { setSyncing(false); }
  }

  async function sincronizarML() {
    setSyncingML(true); setErro(''); setMsg('');
    try {
      const r = await api<{ sucesso: boolean; totalNovos: number }>('/ofertas/sincronizar/mercadolivre', { method: 'POST' });
      setMsg(`Mercado Livre: ${r.totalNovos} novas ofertas adicionadas.`);
      setPagina(1); await carregar();
    } catch (e) { setErro((e as Error).message || 'Erro ao sincronizar Mercado Livre'); }
    finally { setSyncingML(false); }
  }

  function mudarPagina(nova: number) {
    if (!paginacao || nova < 1 || nova > paginacao.totalPaginas) return;
    setPagina(nova);
  }
  function mudarCategoria(id: number | null) { setCatFiltro(id); setPagina(1); }
  function mudarStatus(s: string)             { setStatusFiltro(s); setPagina(1); }
  function mudarPlat(p: string)               { setPlatFiltro(p);  setPagina(1); }

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <>
      <PageHeader
        title="Ofertas"
        subtitle="Ofertas disponíveis para enviar nos grupos de WhatsApp"
        action={
          <div className="flex gap-2">
            <button onClick={sincronizar} disabled={syncing} className="btn btn-outline">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? 'Sincronizando...' : 'Shopee'}
            </button>
            <button onClick={sincronizarML} disabled={syncingML} className="btn btn-primary">
              {syncingML ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
              {syncingML ? 'Sincronizando...' : 'Mercado Livre'}
            </button>
          </div>
        }
      />

      <Alert message={erro} />
      <Alert message={msg} type="success" />

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => mudarCategoria(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!catFiltro ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Todas
          </button>
          {categorias.map((c) => (
            <button key={`${c.nome}-${c.plataforma || ''}`} onClick={() => mudarCategoria(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${catFiltro === c.id ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.nome} <span className="opacity-70">({c.total})</span>
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {[['', '🛍️ Todas'], ['shopee', '🟠 Shopee'], ['mercadolivre', '🟡 Mercado Livre']].map(([val, label]) => (
            <button key={val} onClick={() => mudarPlat(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${platFiltro === val ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1.5">
          {[['', 'Todos'], ['pendente', 'Pendentes'], ['enviado', 'Enviados']].map(([val, label]) => (
            <button key={val} onClick={() => mudarStatus(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFiltro === val ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {paginacao && (
        <p className="text-xs text-gray-400 mb-4">
          {paginacao.total} oferta{paginacao.total !== 1 ? 's' : ''} encontrada{paginacao.total !== 1 ? 's' : ''}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : ofertas.length === 0 ? (
        <div className="card text-center py-16">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Nenhuma oferta encontrada.</p>
          <p className="text-gray-400 text-xs mb-5">Configure suas credenciais e clique em Sincronizar.</p>
          <button onClick={sincronizar} disabled={syncing} className="btn btn-primary mx-auto">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizar agora
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ofertas.map((o) => (
              <OfertaCard
                key={o.id}
                oferta={o}
                onAtualizou={carregar}
                onEnviar={() => setModalOferta(o)}
              />
            ))}
          </div>

          {paginacao && paginacao.totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => mudarPagina(pagina - 1)} disabled={pagina <= 1}
                className="btn btn-outline py-1.5 px-3 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">{pagina} / {paginacao.totalPaginas}</span>
              <button onClick={() => mudarPagina(pagina + 1)} disabled={pagina >= paginacao.totalPaginas}
                className="btn btn-outline py-1.5 px-3 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de envio */}
      {modalOferta && (
        <EnviarOfertaModal
          oferta={modalOferta}
          onFechar={() => setModalOferta(null)}
          onEnviou={() => { setModalOferta(null); carregar(); }}
        />
      )}
    </>
  );
}

// ─── Card de oferta ───────────────────────────────────────────────

function OfertaCard({ oferta: o, onAtualizou, onEnviar }: {
  oferta: Oferta; onAtualizou: () => void; onEnviar: () => void;
}) {
  const [updating, setUpdating] = useState(false);

  async function marcarEnviado() {
    setUpdating(true);
    try {
      await api(`/ofertas/${o.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: o.status === 'enviado' ? 'pendente' : 'enviado' }),
      });
      onAtualizou();
    } catch { /* ignora */ } finally { setUpdating(false); }
  }

  return (
    <div className="card p-0 overflow-hidden flex flex-col group">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {o.imagem_url ? (
          <img src={o.imagem_url} alt={o.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {o.taxa_comissao != null && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {formatComissao(o.taxa_comissao)} comissão
          </span>
        )}
        {o.desconto_pct != null && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{o.desconto_pct}% OFF
          </span>
        )}
        <span className={`absolute top-2 left-2 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
          o.plataforma === 'shopee' ? 'bg-orange-500' : 'bg-yellow-600'
        }`}>
          {o.plataforma === 'shopee' ? 'Shopee' : 'ML'}
        </span>
        {o.status === 'enviado' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">✓ Enviado</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Tag className="w-3 h-3" />{o.categoria_nome}
        </p>
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug flex-1">{o.nome}</p>

        {o.preco_original != null && (
          <p className="text-xs text-gray-400 line-through">{formatPreco(o.preco_original)}</p>
        )}
        <p className="text-lg font-bold text-brand-600">{formatPreco(o.preco)}</p>

        <div className="flex gap-1.5 mt-1">
          {o.link_afiliado && (
            <a href={o.link_afiliado} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline shrink-0">
              <ExternalLink className="w-3 h-3" />Ver
            </a>
          )}

          {/* Botão enviar WhatsApp */}
          <button onClick={onEnviar}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors shrink-0">
            <Send className="w-3 h-3" />
            Enviar
          </button>

          <button onClick={marcarEnviado} disabled={updating}
            className={`ml-auto text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
              o.status === 'enviado'
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}>
            {updating ? '...' : o.status === 'enviado' ? 'Reativar' : 'Pendente'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de envio para WhatsApp ────────────────────────────────

function EnviarOfertaModal({ oferta, onFechar, onEnviou }: {
  oferta: Oferta; onFechar: () => void; onEnviou: () => void;
}) {
  const [legenda, setLegenda]           = useState(() => gerarLegenda(oferta));
  // WhatsApp
  const [grupos, setGrupos]             = useState<GrupoDestino[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  // Telegram
  const [telegram, setTelegram]         = useState<TelegramConfig | null>(null);
  const [enviarTelegram, setEnviarTelegram] = useState(false);
  // Estado geral
  const [carregando, setCarregando]     = useState(true);
  const [gerandoLink, setGerandoLink]   = useState(false);
  const [avisoLink, setAvisoLink]       = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [resultado, setResultado]       = useState<{ wa: number; tg: number; erros: string[] } | null>(null);

  useEffect(() => {
    // 1. Grupos WhatsApp de destino
    const carregarGrupos = api<{ sucesso: boolean; grupos: GrupoDestino[] }>('/whatsapp/grupos')
      .then((r) => {
        const destino = (r.grupos || []).filter((g) => g.papel === 'destino');
        setGrupos(destino);
        setSelecionados(new Set(destino.map((g) => g.group_jid)));
      })
      .catch(() => {});

    // 2. Configurações Telegram
    const carregarTelegram = api<{ sucesso: boolean; setting: { payload: TelegramConfig } }>('/settings/telegram')
      .then((r) => {
        const cfg = r.setting?.payload;
        if (cfg?.status === 'active' && cfg.chatIds?.length > 0) {
          setTelegram(cfg);
          setEnviarTelegram(true); // pré-selecionar se ativo
        }
      })
      .catch(() => {});

    // 3. Para ML: gerar link de afiliado em paralelo
    const gerarLink = oferta.plataforma === 'mercadolivre'
      ? (async () => {
          setGerandoLink(true);
          try {
            const r = await api<{ sucesso: boolean; linkAfiliado: string | null }>(
              `/ofertas/${oferta.id}/gerar-link-afiliado`, { method: 'POST' }
            );
            if (r.sucesso && r.linkAfiliado) {
              setLegenda((prev) => {
                const linkAtual = oferta.link_afiliado || oferta.link_produto || '';
                return linkAtual ? prev.replace(linkAtual, r.linkAfiliado!) : prev;
              });
            } else {
              setAvisoLink('Não foi possível gerar o link de afiliado. Verifique os cookies do ML.');
            }
          } catch {
            setAvisoLink('Erro ao gerar link de afiliado ML.');
          } finally {
            setGerandoLink(false);
          }
        })()
      : Promise.resolve();

    Promise.all([carregarGrupos, carregarTelegram, gerarLink]).finally(() => setCarregando(false));
  }, [oferta]);

  function toggleGrupo(jid: string) {
    setSelecionados((prev) => {
      const s = new Set(prev);
      s.has(jid) ? s.delete(jid) : s.add(jid);
      return s;
    });
  }

  function toggleTodos() {
    if (selecionados.size === grupos.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(grupos.map((g) => g.group_jid)));
    }
  }

  const temDestino = selecionados.size > 0 || enviarTelegram;

  async function enviar() {
    if (!temDestino) return;
    setEnviando(true); setResultado(null);

    let waEnviados = 0;
    let tgEnviados = 0;
    const todosErros: string[] = [];

    // Enviar WhatsApp (se houver grupos selecionados)
    if (selecionados.size > 0) {
      try {
        const r = await api<{ sucesso: boolean; enviados: number; erros: string[] }>(
          `/ofertas/${oferta.id}/enviar-whatsapp`,
          { method: 'POST', body: JSON.stringify({ legenda, grupos: [...selecionados] }) }
        );
        waEnviados = r.enviados || 0;
        if (r.erros?.length) todosErros.push(...r.erros.map(e => `WA: ${e}`));
      } catch (e) {
        todosErros.push(`WhatsApp: ${(e as Error).message}`);
      }
    }

    // Enviar Telegram (se marcado)
    if (enviarTelegram && telegram) {
      try {
        const r = await api<{ sucesso: boolean; enviados: number; erros: string[] }>(
          `/ofertas/${oferta.id}/enviar-telegram`,
          { method: 'POST', body: JSON.stringify({ legenda }) }
        );
        tgEnviados = r.enviados || 0;
        if (r.erros?.length) todosErros.push(...r.erros.map(e => `TG: ${e}`));
      } catch (e) {
        todosErros.push(`Telegram: ${(e as Error).message}`);
      }
    }

    setResultado({ wa: waEnviados, tg: tgEnviados, erros: todosErros });
    if (waEnviados > 0 || tgEnviados > 0) setTimeout(onEnviou, 1800);
    setEnviando(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-green-600" />
            Enviar para WhatsApp
          </h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Preview do produto */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            {oferta.imagem_url ? (
              <img src={oferta.imagem_url} alt={oferta.nome}
                className="w-16 h-16 object-cover rounded-lg shrink-0" />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{oferta.nome}</p>
              <p className="text-base font-bold text-brand-600 mt-1">{formatPreco(oferta.preco)}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white ${
                oferta.plataforma === 'shopee' ? 'bg-orange-500' : 'bg-yellow-600'
              }`}>
                {oferta.plataforma === 'shopee' ? 'Shopee' : 'Mercado Livre'}
              </span>
            </div>
          </div>

          {/* Legenda editável */}
          <div>
            <label className="label flex items-center gap-2">
              Legenda
              <span className="text-gray-400 font-normal">(editável)</span>
              {gerandoLink && (
                <span className="flex items-center gap-1 text-xs text-brand-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Gerando link de afiliado...
                </span>
              )}
            </label>
            <textarea
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              rows={6}
              className="input font-mono text-xs resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use *texto* para negrito e _texto_ para itálico no WhatsApp.
            </p>
            {avisoLink && (
              <p className="text-xs text-amber-600 mt-1">⚠️ {avisoLink}</p>
            )}
          </div>

          {/* WhatsApp — grupos de destino */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-green-600" /> WhatsApp
              </label>
              {grupos.length > 0 && (
                <button onClick={toggleTodos} className="text-xs text-brand-600 hover:underline">
                  {selecionados.size === grupos.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              )}
            </div>

            {carregando ? (
              <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
            ) : grupos.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                Nenhum grupo de destino configurado. Configure na página <strong>Grupos</strong>.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {grupos.map((g) => {
                  const sel = selecionados.has(g.group_jid);
                  return (
                    <button key={g.group_jid} onClick={() => toggleGrupo(g.group_jid)}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                        sel ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:bg-gray-50'
                      }`}>
                      {sel
                        ? <CheckSquare className="w-4 h-4 text-green-600 shrink-0" />
                        : <Square className="w-4 h-4 text-gray-300 shrink-0" />}
                      <span className="text-sm text-gray-700 truncate">{g.nome || g.group_jid}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Telegram — exibir apenas se configurado e ativo */}
          {telegram && (
            <div>
              <button
                onClick={() => setEnviarTelegram((v) => !v)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  enviarTelegram ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                }`}>
                {enviarTelegram
                  ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                  : <Square className="w-4 h-4 text-gray-300 shrink-0" />}
                <MessageCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Telegram</p>
                  <p className="text-xs text-gray-500">
                    {telegram.chatIds.length} canal{telegram.chatIds.length !== 1 ? 'is' : ''} configurado{telegram.chatIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Resultado */}
          {resultado && (
            <div className={`rounded-xl px-3 py-2 text-sm ${
              resultado.wa > 0 || resultado.tg > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {resultado.wa > 0 && <p>✓ WhatsApp: {resultado.wa} grupo{resultado.wa > 1 ? 's' : ''}</p>}
              {resultado.tg > 0 && <p>✓ Telegram: {resultado.tg} canal{resultado.tg > 1 ? 'is' : ''}</p>}
              {resultado.wa === 0 && resultado.tg === 0 && <p>Erro ao enviar.</p>}
              {resultado.erros.length > 0 && (
                <ul className="mt-1 text-xs opacity-70 list-disc list-inside">
                  {resultado.erros.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onFechar} className="btn btn-outline flex-1">Cancelar</button>
          <button
            onClick={enviar}
            disabled={enviando || !temDestino || carregando}
            className="btn btn-primary flex-1 bg-green-600 hover:bg-green-700 border-green-600 disabled:opacity-40"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {enviando ? 'Enviando...' : (() => {
              const partes = [];
              if (selecionados.size > 0) partes.push(`${selecionados.size} grupo${selecionados.size > 1 ? 's' : ''} WA`);
              if (enviarTelegram && telegram) partes.push('Telegram');
              return partes.length > 0 ? `Enviar → ${partes.join(' + ')}` : 'Selecione um destino';
            })()}
          </button>
        </div>
      </div>
    </div>
  );
}
