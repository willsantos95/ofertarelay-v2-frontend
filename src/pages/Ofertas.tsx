import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Loader2, ExternalLink, Tag, ChevronLeft, ChevronRight, ShoppingBag, Store } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

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

interface Categoria {
  id: number;
  nome: string;
  total: number;
}

interface Paginacao {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

const LIMITE = 24;

function formatPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatComissao(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function Ofertas() {
  const [ofertas, setOfertas]       = useState<Oferta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [paginacao, setPaginacao]   = useState<Paginacao | null>(null);
  const [pagina, setPagina]             = useState(1);
  const [catFiltro, setCatFiltro]       = useState<number | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<string>('');
  const [platFiltro, setPlatFiltro]     = useState<string>('');
  const [syncingML, setSyncingML]       = useState(false);

  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [erro, setErro]         = useState('');

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
    } finally {
      setLoading(false);
    }
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

  useEffect(() => { carregar(); }, [carregar]);

  function mudarPagina(nova: number) {
    if (!paginacao) return;
    if (nova < 1 || nova > paginacao.totalPaginas) return;
    setPagina(nova);
  }

  function mudarCategoria(id: number | null) {
    setCatFiltro(id);
    setPagina(1);
  }

  function mudarStatus(s: string) { setStatusFiltro(s); setPagina(1); }
  function mudarPlat(p: string)   { setPlatFiltro(p);  setPagina(1); }

  return (
    <>
      <PageHeader
        title="Ofertas"
        subtitle="Ofertas da Shopee disponíveis para enviar nos grupos de WhatsApp"
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
        {/* Filtro categoria */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => mudarCategoria(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              catFiltro === null ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => mudarCategoria(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                catFiltro === c.id ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.nome} <span className="opacity-70">({c.total})</span>
            </button>
          ))}
        </div>

        {/* Filtro plataforma */}
        <div className="flex gap-1.5">
          {[['', '🛍️ Todas'], ['shopee', '🟠 Shopee'], ['mercadolivre', '🟡 Mercado Livre']].map(([val, label]) => (
            <button key={val} onClick={() => mudarPlat(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                platFiltro === val ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{label}</button>
          ))}
        </div>

        {/* Filtro status */}
        <div className="ml-auto flex gap-1.5">
          {[['', 'Todos'], ['pendente', 'Pendentes'], ['enviado', 'Enviados']].map(([val, label]) => (
            <button key={val} onClick={() => mudarStatus(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFiltro === val ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {paginacao && (
        <p className="text-xs text-gray-400 mb-4">
          {paginacao.total} oferta{paginacao.total !== 1 ? 's' : ''} encontrada{paginacao.total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : ofertas.length === 0 ? (
        <div className="card text-center py-16">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Nenhuma oferta encontrada.</p>
          <p className="text-gray-400 text-xs mb-5">
            Configure SHOPEE_APP_ID e SHOPEE_SECRET e clique em "Sincronizar Shopee".
          </p>
          <button onClick={sincronizar} disabled={syncing} className="btn btn-primary mx-auto">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizar agora
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ofertas.map((o) => (
              <OfertaCard key={o.id} oferta={o} onAtualizou={carregar} />
            ))}
          </div>

          {/* Paginação */}
          {paginacao && paginacao.totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => mudarPagina(pagina - 1)}
                disabled={pagina <= 1}
                className="btn btn-outline py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {pagina} / {paginacao.totalPaginas}
              </span>
              <button
                onClick={() => mudarPagina(pagina + 1)}
                disabled={pagina >= paginacao.totalPaginas}
                className="btn btn-outline py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function OfertaCard({ oferta: o, onAtualizou }: { oferta: Oferta; onAtualizou: () => void }) {
  const [updating, setUpdating] = useState(false);

  async function marcarEnviado() {
    setUpdating(true);
    try {
      await api(`/ofertas/${o.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: o.status === 'enviado' ? 'pendente' : 'enviado' }),
      });
      onAtualizou();
    } catch { /* ignora */ } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="card p-0 overflow-hidden flex flex-col group">
      {/* Imagem */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {o.imagem_url ? (
          <img
            src={o.imagem_url}
            alt={o.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Badge comissão (Shopee) ou desconto (ML) */}
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
        {/* Badge plataforma */}
        <span className={`absolute top-2 left-2 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
          o.plataforma === 'shopee' ? 'bg-orange-500' : 'bg-yellow-500'
        }`}>
          {o.plataforma === 'shopee' ? 'Shopee' : 'ML'}
        </span>

        {/* Badge status */}
        {o.status === 'enviado' && (
          <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            Enviado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {o.categoria_nome}
        </p>

        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug flex-1">
          {o.nome}
        </p>

        {o.preco_original != null && (
          <p className="text-xs text-gray-400 line-through">{formatPreco(o.preco_original)}</p>
        )}
        <p className="text-lg font-bold text-brand-600">{formatPreco(o.preco)}</p>

        {/* Ações */}
        <div className="flex gap-2 mt-1">
          {o.link_afiliado && (
            <a
              href={o.link_afiliado}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Ver oferta
            </a>
          )}
          <button
            onClick={marcarEnviado}
            disabled={updating}
            className={`ml-auto text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
              o.status === 'enviado'
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {updating ? '...' : o.status === 'enviado' ? 'Reativar' : 'Marcar enviado'}
          </button>
        </div>
      </div>
    </div>
  );
}
