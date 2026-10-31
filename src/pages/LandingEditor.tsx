import { useEffect, useRef, useState } from 'react';
import {
  Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Copy, Check, ImagePlus, Download, Eye, MousePointerClick,
} from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

type Tipo = 'whatsapp_grupo' | 'whatsapp_canal' | 'telegram' | 'instagram' | 'link';

interface Botao { id?: string; rotulo: string; url: string; tipo: Tipo; ativo: boolean; cliques?: number }
interface Landing {
  id?: string; slug: string; titulo: string; descricao: string; cor: string; publicada: boolean;
  tem_imagem?: boolean; imagem_atualizada_em?: string | null; visitas?: number; botoes: Botao[];
}
interface Convite { groupJid: string; nome: string; link: string | null; erro: string | null }

const TIPOS: { v: Tipo; r: string; prefixo: string }[] = [
  { v: 'whatsapp_grupo', r: 'Grupo de WhatsApp', prefixo: 'https://chat.whatsapp.com/' },
  { v: 'whatsapp_canal', r: 'Canal de WhatsApp', prefixo: 'https://whatsapp.com/channel/' },
  { v: 'telegram', r: 'Telegram', prefixo: 'https://t.me/' },
  { v: 'instagram', r: 'Instagram', prefixo: 'https://instagram.com/' },
  { v: 'link', r: 'Outro link', prefixo: 'https://' },
];
const CORES = ['#16a34a', '#0ea5e9', '#7c3aed', '#e11d48', '#ea580c', '#a16207', '#111827'];
const VAZIA: Landing = { slug: '', titulo: '', descricao: '', cor: '#16a34a', publicada: true, botoes: [] };

function corTexto(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#111111' : '#ffffff';
}

function slugify(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function lerComoDataUrl(arquivo: Blob): Promise<string> {
  return new Promise((ok, falha) => {
    const fr = new FileReader();
    fr.onload = () => ok(String(fr.result));
    fr.onerror = () => falha(new Error('Não foi possível ler a imagem.'));
    fr.readAsDataURL(arquivo);
  });
}

/**
 * Reduz a foto no navegador antes de enviar: no máximo 800 px no lado maior, em JPEG.
 * A foto aparece com 112 px na página, então 800 px sobra, e o envio fica com ~100 KB
 * em vez de vários MB. GIF vai como está (para manter a animação), se for pequeno.
 */
async function prepararImagem(arquivo: File): Promise<string> {
  if (arquivo.type === 'image/gif') {
    if (arquivo.size > 1.5 * 1024 * 1024) throw new Error('GIF muito grande (máximo 1,5 MB). Use uma foto PNG ou JPG.');
    return lerComoDataUrl(arquivo);
  }
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, falha) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => falha(new Error('Não foi possível abrir a imagem.'));
      i.src = url;
    });
    const LADO = 800;
    const escala = Math.min(1, LADO / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * escala));
    const h = Math.max(1, Math.round(img.naturalHeight * escala));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return lerComoDataUrl(arquivo);
    ctx.fillStyle = '#ffffff';            // fundo branco para PNG transparente virar JPEG
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function LandingEditor() {
  const [l, setL] = useState<Landing>(VAZIA);
  const [existe, setExiste] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [slugInfo, setSlugInfo] = useState<{ ok: boolean; texto: string } | null>(null);
  const [imgVersao, setImgVersao] = useState(0);
  const [enviandoImg, setEnviandoImg] = useState(false);
  const [convites, setConvites] = useState<Convite[] | null>(null);
  const [buscandoConvites, setBuscandoConvites] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const inputImg = useRef<HTMLInputElement>(null);
  const slugSalvo = useRef('');

  const origem = window.location.origin;
  const endereco = `${origem}/${l.slug || 'seu-grupo'}`;

  useEffect(() => {
    api<{ landing: Landing | null }>('/landing')
      .then((r) => {
        if (r.landing) { setL(r.landing); setExiste(true); slugSalvo.current = r.landing.slug; setImgVersao(Date.now()); }
      })
      .catch((e) => setErro((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  // Verifica o endereço enquanto digita
  useEffect(() => {
    if (!l.slug || l.slug === slugSalvo.current) { setSlugInfo(null); return; }
    const t = setTimeout(() => {
      api<{ disponivel: boolean; motivo: string | null }>(`/landing/slug-disponivel?slug=${encodeURIComponent(l.slug)}`)
        .then((r) => setSlugInfo({ ok: r.disponivel, texto: r.disponivel ? 'Endereço disponível' : (r.motivo || 'Indisponível') }))
        .catch(() => setSlugInfo(null));
    }, 400);
    return () => clearTimeout(t);
  }, [l.slug]);

  function setBotao(i: number, b: Partial<Botao>) {
    setL({ ...l, botoes: l.botoes.map((x, j) => (j === i ? { ...x, ...b } : x)) });
  }
  function mover(i: number, d: -1 | 1) {
    const b = [...l.botoes];
    const j = i + d;
    if (j < 0 || j >= b.length) return;
    [b[i], b[j]] = [b[j], b[i]];
    setL({ ...l, botoes: b });
  }
  function adicionar(b?: Partial<Botao>) {
    if (l.botoes.length >= 8) return;
    setL({ ...l, botoes: [...l.botoes, { rotulo: 'Entrar no grupo', url: '', tipo: 'whatsapp_grupo', ativo: true, ...b }] });
  }

  async function salvar(e?: React.FormEvent) {
    e?.preventDefault();
    setSalvando(true); setMsg(''); setErro('');
    try {
      const r = await api<{ landing: Landing }>('/landing', {
        method: 'PUT',
        body: JSON.stringify({ ...l, botoes: l.botoes.map(({ cliques: _c, ...b }) => b) }),
      });
      setL(r.landing); setExiste(true); slugSalvo.current = r.landing.slug; setSlugInfo(null);
      setMsg(r.landing.publicada ? 'Página salva e no ar.' : 'Página salva. Ela está despublicada.');
    } catch (e) { setErro((e as Error).message); }
    finally { setSalvando(false); }
  }

  async function enviarImagem(arquivo: File) {
    setErro('');
    if (!existe) { setErro('Salve a página uma vez antes de enviar a imagem.'); return; }
    if (!/^image\/(png|jpeg|webp|gif)$/.test(arquivo.type)) { setErro('Use PNG, JPG, WEBP ou GIF.'); return; }
    if (arquivo.size > 15 * 1024 * 1024) { setErro('A imagem deve ter no máximo 15 MB.'); return; }
    setEnviandoImg(true);
    try {
      const dataUrl = await prepararImagem(arquivo);
      const r = await api<{ landing: Landing }>('/landing/imagem', { method: 'PUT', body: JSON.stringify({ dataUrl }) });
      setL({ ...l, tem_imagem: r.landing.tem_imagem });
      setImgVersao(Date.now());
    } catch (e) {
      const msg = (e as Error).message;
      setErro(/413/.test(msg) ? 'A imagem ficou grande demais. Tente outra menor.' : msg);
    }
    finally { setEnviandoImg(false); if (inputImg.current) inputImg.current.value = ''; }
  }

  async function removerImagem() {
    try {
      await api('/landing/imagem', { method: 'DELETE' });
      setL({ ...l, tem_imagem: false });
    } catch (e) { setErro((e as Error).message); }
  }

  async function buscarConvites() {
    setBuscandoConvites(true); setErro('');
    try {
      const r = await api<{ grupos: Convite[] }>('/landing/convites');
      setConvites(r.grupos);
    } catch (e) { setErro((e as Error).message); }
    finally { setBuscandoConvites(false); }
  }

  function copiar() {
    navigator.clipboard?.writeText(endereco).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1500); });
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  const fg = corTexto(l.cor);
  const imagemSrc = l.tem_imagem ? `/api/v1/landing/imagem?v=${imgVersao}` : '';
  const totalCliques = l.botoes.reduce((s, b) => s + (b.cliques || 0), 0);

  return (
    <>
      <PageHeader
        title="Página dos grupos"
        subtitle="Um link para a bio com a foto, o nome e os botões para entrar nos seus grupos"
        action={existe && l.publicada ? (
          <a href={`/${slugSalvo.current}`} target="_blank" rel="noreferrer" className="btn btn-outline">
            <ExternalLink className="w-4 h-4" /> Abrir
          </a>
        ) : undefined}
      />
      <Alert message={erro} />
      <Alert type="success" message={msg} />

      {existe && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="card py-3"><p className="text-xs text-gray-500 flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Visitas</p><p className="text-2xl font-extrabold tabular-nums">{(l.visitas || 0).toLocaleString('pt-BR')}</p></div>
          <div className="card py-3"><p className="text-xs text-gray-500 flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" />Cliques nos botões</p><p className="text-2xl font-extrabold tabular-nums">{totalCliques.toLocaleString('pt-BR')}</p></div>
          <div className="card py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500">Seu link</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-medium truncate flex-1">{endereco.replace(/^https?:\/\//, '')}</p>
              <button type="button" onClick={copiar} className="text-gray-400 hover:text-gray-700" aria-label="Copiar link">
                {copiado ? <Check className="w-4 h-4 text-brand-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={salvar} className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        <div className="flex flex-col gap-6">
          <div className="card flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900">Perfil</h2>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 grid place-items-center text-2xl font-bold border border-gray-100"
                style={{ background: l.cor, color: fg }}>
                {imagemSrc ? <img src={imagemSrc} alt="" className="w-full h-full object-cover" /> : (l.titulo || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-wrap gap-2">
                <input ref={inputImg} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
                  onChange={(e) => e.target.files?.[0] && enviarImagem(e.target.files[0])} />
                <button type="button" onClick={() => inputImg.current?.click()} disabled={enviandoImg} className="btn btn-outline">
                  {enviandoImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {l.tem_imagem ? 'Trocar imagem' : 'Enviar imagem'}
                </button>
                {l.tem_imagem && <button type="button" onClick={removerImagem} className="btn btn-outline text-red-600">Remover</button>}
                <p className="text-xs text-gray-400 w-full">Quadrada de preferência. A foto é reduzida automaticamente. Também aparece na prévia quando o link é compartilhado.</p>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="titulo">Nome do grupo</label>
              <input id="titulo" className="input" maxLength={80} placeholder="Capivara Ofertas" required
                value={l.titulo}
                onChange={(e) => setL({ ...l, titulo: e.target.value, slug: existe || l.slug !== slugify(l.titulo) ? l.slug : slugify(e.target.value) })} />
            </div>

            <div>
              <label className="label" htmlFor="slug">Endereço</label>
              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                <span className="pl-3 text-sm text-gray-400 whitespace-nowrap">{origem.replace(/^https?:\/\//, '')}/</span>
                <input id="slug" className="flex-1 min-w-0 bg-transparent px-1 py-2 text-sm" placeholder="capivaraofertas" required
                  value={l.slug} onChange={(e) => setL({ ...l, slug: slugify(e.target.value) })} />
              </div>
              {slugInfo && <p className={`text-xs mt-1 ${slugInfo.ok ? 'text-brand-600' : 'text-red-600'}`}>{slugInfo.texto}</p>}
              {existe && l.slug !== slugSalvo.current && <p className="text-xs text-yellow-700 mt-1">Ao trocar o endereço, o link antigo deixa de funcionar.</p>}
            </div>

            <div>
              <label className="label" htmlFor="desc">Descrição</label>
              <textarea id="desc" rows={2} maxLength={300} className="input" placeholder="As melhores promoções da internet, todo dia, no seu WhatsApp."
                value={l.descricao} onChange={(e) => setL({ ...l, descricao: e.target.value })} />
            </div>

            <div>
              <span className="label">Cor dos botões</span>
              <div className="flex flex-wrap items-center gap-2">
                {CORES.map((c) => (
                  <button key={c} type="button" onClick={() => setL({ ...l, cor: c })} aria-label={`Cor ${c}`}
                    className={`w-8 h-8 rounded-full border-2 ${l.cor === c ? 'border-gray-900' : 'border-white shadow'}`} style={{ background: c }} />
                ))}
                <input type="color" value={l.cor} onChange={(e) => setL({ ...l, cor: e.target.value })} className="w-8 h-8 rounded-full cursor-pointer" aria-label="Outra cor" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={l.publicada} onChange={(e) => setL({ ...l, publicada: e.target.checked })} className="w-4 h-4 accent-brand-500" />
              Página no ar
            </label>
          </div>

          <div className="card flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-gray-900 flex-1">Botões ({l.botoes.length}/8)</h2>
              <button type="button" onClick={buscarConvites} disabled={buscandoConvites} className="btn btn-outline text-xs">
                {buscandoConvites ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Trazer meus grupos
              </button>
              <button type="button" onClick={() => adicionar()} disabled={l.botoes.length >= 8} className="btn btn-outline text-xs">
                <Plus className="w-4 h-4" /> Botão
              </button>
            </div>

            {convites && (
              <div className="rounded-xl bg-gray-50 p-3 text-sm">
                {convites.length === 0 && <p className="text-gray-500">Nenhum grupo de destino cadastrado.</p>}
                {convites.map((c) => (
                  <div key={c.groupJid} className="flex items-center gap-2 py-1.5">
                    <span className="flex-1 truncate">{c.nome}</span>
                    {c.link ? (
                      <button type="button" className="btn btn-outline text-xs py-1"
                        disabled={l.botoes.some((b) => b.url === c.link) || l.botoes.length >= 8}
                        onClick={() => adicionar({ rotulo: `Entrar no ${c.nome}`.slice(0, 60), url: c.link!, tipo: 'whatsapp_grupo' })}>
                        {l.botoes.some((b) => b.url === c.link) ? 'Adicionado' : 'Adicionar'}
                      </button>
                    ) : <span className="text-xs text-gray-400">{c.erro}</span>}
                  </div>
                ))}
              </div>
            )}

            {l.botoes.length === 0 && <p className="text-sm text-gray-400">Adicione o link de convite de cada grupo.</p>}

            {l.botoes.map((b, i) => (
              <div key={b.id || `novo-${i}`} className={`rounded-xl border p-3 flex flex-col gap-2 ${b.ativo ? 'border-gray-200' : 'border-dashed border-gray-200 opacity-60'}`}>
                <div className="flex gap-2">
                  <select value={b.tipo} onChange={(e) => setBotao(i, { tipo: e.target.value as Tipo })} className="input w-auto py-1.5" aria-label="Tipo">
                    {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.r}</option>)}
                  </select>
                  <input className="input py-1.5" maxLength={60} placeholder="Texto do botão" value={b.rotulo}
                    onChange={(e) => setBotao(i, { rotulo: e.target.value })} aria-label="Texto do botão" />
                </div>
                <input className="input py-1.5" placeholder={TIPOS.find((t) => t.v === b.tipo)?.prefixo} value={b.url}
                  onChange={(e) => setBotao(i, { url: e.target.value.trim() })} aria-label="Link" />
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <label className="flex items-center gap-1.5 mr-auto">
                    <input type="checkbox" checked={b.ativo} onChange={(e) => setBotao(i, { ativo: e.target.checked })} className="accent-brand-500" />
                    Visível
                    {b.cliques ? <span className="text-gray-400">· {b.cliques.toLocaleString('pt-BR')} cliques</span> : null}
                  </label>
                  <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="p-1.5 hover:text-gray-900 disabled:opacity-30" aria-label="Subir"><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" onClick={() => mover(i, 1)} disabled={i === l.botoes.length - 1} className="p-1.5 hover:text-gray-900 disabled:opacity-30" aria-label="Descer"><ArrowDown className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setL({ ...l, botoes: l.botoes.filter((_, j) => j !== i) })} className="p-1.5 hover:text-red-600" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">
              Os botões passam pelo seu link, então dá para trocar o grupo de destino (quando um lotar, por exemplo) sem mudar o link da bio.
            </p>
          </div>

          <div>
            <button type="submit" disabled={salvando || (slugInfo !== null && !slugInfo.ok)} className="btn btn-primary">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {existe ? 'Salvar' : 'Criar página'}
            </button>
          </div>
        </div>

        {/* Prévia */}
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-medium text-gray-400 mb-2">Prévia</p>
          <div className="rounded-[28px] border-8 border-gray-900 overflow-hidden bg-stone-100 mx-auto max-w-[320px]"
            style={{ backgroundImage: `linear-gradient(180deg, ${l.cor}38 0, #f5f5f4 220px)` }}>
            <div className="px-5 pt-10 pb-8 text-center min-h-[520px]">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden grid place-items-center text-3xl font-bold border-4 border-white shadow"
                style={{ background: l.cor, color: fg }}>
                {imagemSrc ? <img src={imagemSrc} alt="" className="w-full h-full object-cover" /> : (l.titulo || '?').slice(0, 1).toUpperCase()}
              </div>
              <p className="font-bold text-lg text-gray-900">{l.titulo || 'Nome do grupo'}</p>
              <p className="text-sm text-gray-600 mt-1 mb-6">{l.descricao || 'Entre no grupo e receba as melhores ofertas.'}</p>
              <div className="flex flex-col gap-2.5">
                {l.botoes.filter((b) => b.ativo).map((b, i) => (
                  <div key={i} className="rounded-xl py-3 px-4 text-sm font-semibold shadow-sm" style={{ background: l.cor, color: fg }}>
                    {b.rotulo || 'Botão'}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">É grátis, e você pode sair quando quiser.</p>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
