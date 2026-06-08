import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, CheckCircle2, ChevronDown, ArrowRight, ArrowDown, Star,
  Eye, Link2, Send, BrainCircuit, CalendarClock,
  BarChart3, ShoppingBag, ArrowDownRight, Repeat2, MessageCircle,
} from 'lucide-react';

/* ─── utilitários ─── */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
      {children}
    </span>
  );
}

function Check({ text, sub }: { text: string; sub?: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
      <span className="text-sm text-gray-700">
        {text}
        {sub && <span className="block text-xs text-gray-400 mt-0.5">{sub}</span>}
      </span>
    </li>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {q}
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

/* ─── balão WhatsApp ─── */
function WaBubble({
  avatar, cor, grupo, nome, texto, link, linkLabel, monitorado = false,
}: {
  avatar: string; cor: string; grupo: string; nome: string;
  texto: string; link?: string; linkLabel?: string; monitorado?: boolean;
}) {
  return (
    <div className={`rounded-xl text-xs overflow-hidden ${monitorado ? 'ring-2 ring-green-400 shadow-md' : 'border border-gray-100 shadow-sm'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${cor}`}>
        <span className="text-sm">{avatar}</span>
        <span className="font-semibold text-white text-[11px] truncate">{grupo}</span>
        {monitorado && (
          <span className="ml-auto shrink-0 flex items-center gap-1 bg-white/25 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
            <Zap className="w-2 h-2" /> ativo
          </span>
        )}
      </div>
      <div className="bg-white px-3 py-2">
        <p className="text-[10px] font-semibold text-green-600 mb-0.5">{nome}</p>
        <p className="text-gray-700 leading-snug text-[11px]">{texto}</p>
        {link && (
          <p className={`mt-1 font-mono text-[9px] break-all leading-snug ${linkLabel ? 'text-green-600 font-semibold' : 'text-blue-400'}`}>
            {link}
            {linkLabel && (
              <span className="ml-1 bg-green-100 text-green-700 px-1 py-0.5 rounded text-[9px] font-bold not-italic">{linkLabel}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">

      {/* ── Navbar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2 font-bold text-lg shrink-0">
            <Zap className="w-5 h-5 text-green-500" />
            <span>OfertaRelay</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#relay"           className="hover:text-gray-900 transition-colors">O Relay</a>
            <a href="#funcionalidades" className="hover:text-gray-900 transition-colors">Funcionalidades</a>
            <a href="#como-funciona"   className="hover:text-gray-900 transition-colors">Como funciona</a>
            <a href="#preco"           className="hover:text-gray-900 transition-colors">Preço</a>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/login"    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors hidden sm:block">Entrar</Link>
            <Link to="/register" className="text-sm font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors shadow-sm">
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white pt-16 pb-20 px-4">
        {/* decoração */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-green-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute top-48 -left-24 w-[350px] h-[350px] bg-emerald-100 rounded-full opacity-30 blur-3xl" />
        </div>

        {/* texto central */}
        <div className="relative max-w-3xl mx-auto text-center">
          <Chip><Zap className="w-3 h-3" /> Relay automático de ofertas · 24h por dia</Chip>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
            Seus grupos ganham ofertas{' '}
            <span className="text-green-500">com o seu link de afiliado</span>{' '}
            no automático
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            O OfertaRelay monitora grupos de promoções do WhatsApp, captura cada link de{' '}
            <strong>Shopee</strong> e <strong>Mercado Livre</strong>, substitui pelo{' '}
            <strong>seu link de afiliado</strong> e repassa para os seus grupos — sem você mover um dedo.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5"
            >
              Quero automatizar agora <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#relay"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium px-6 py-4 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Ver como funciona
            </a>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            Sem fidelidade · Cancele quando quiser · <strong className="text-gray-600">R$ 49,90/mês</strong>
          </p>
        </div>

        {/* ── Diagrama de fluxo ── */}
        <div className="relative max-w-5xl mx-auto mt-14">

          {/* Desktop: 3 colunas com setas entre elas */}
          <div className="hidden md:grid md:grid-cols-[1fr_56px_1fr_56px_1fr] gap-0 items-start">

            {/* col 1 — origem */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Grupos monitorados</p>
              <div className="space-y-2">
                <WaBubble avatar="🔥" cor="bg-orange-400" grupo="Promoções do Dia" nome="Bot Shopee" monitorado
                  texto="🛒 Fone JBL Tune 520BT - só hoje!" link="shopee.com.br/produto/123456" />
                <WaBubble avatar="⚡" cor="bg-yellow-500" grupo="Oferta Flash ML" nome="Bot ML" monitorado
                  texto="📦 Notebook Acer i5 — 18% OFF" link="produto.mercadolivre.com.br/MLB-99" />
              </div>
            </div>

            {/* seta 1 */}
            <div className="flex flex-col items-center justify-center pt-8 gap-2">
              <ArrowRight className="w-5 h-5 text-gray-300" />
              <div className="bg-green-500 rounded-xl p-2.5 shadow-lg shadow-green-200">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] text-green-700 font-bold bg-green-50 border border-green-200 rounded-lg px-1.5 py-0.5 text-center leading-tight">
                troca<br />link ✓
              </span>
              <ArrowRight className="w-5 h-5 text-gray-300" />
            </div>

            {/* col 2 — WhatsApp destino */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Seus grupos WhatsApp</p>
              <div className="space-y-2">
                <WaBubble avatar="💚" cor="bg-green-600" grupo="Meu Canal de Ofertas" nome="OfertaRelay"
                  texto="🛒 Fone JBL Tune 520BT - só hoje!" link="s.shopee.com.br/xSEU_LINK" linkLabel="seu link" />
                <WaBubble avatar="💚" cor="bg-green-600" grupo="Meu Canal de Ofertas" nome="OfertaRelay"
                  texto="📦 Notebook Acer i5 — 18% OFF" link="meli.la/xSEU_LINK" linkLabel="seu link" />
              </div>
            </div>

            {/* seta 2 */}
            <div className="flex flex-col items-center justify-center pt-8 gap-2">
              <ArrowRight className="w-5 h-5 text-gray-300" />
              <div className="bg-blue-400 rounded-xl p-2.5 shadow-lg shadow-blue-100">
                <Send className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] text-blue-600 font-bold bg-blue-50 border border-blue-200 rounded-lg px-1.5 py-0.5 text-center leading-tight">
                também<br />Telegram
              </span>
              <ArrowRight className="w-5 h-5 text-gray-300" />
            </div>

            {/* col 3 — Telegram destino */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Canal Telegram</p>
              <div className="space-y-2">
                <WaBubble avatar="✈️" cor="bg-blue-500" grupo="Meu Canal Ofertas" nome="OfertaRelay"
                  texto="🛒 Fone JBL Tune 520BT - só hoje!" link="s.shopee.com.br/xSEU_LINK" linkLabel="seu link" />
                <WaBubble avatar="✈️" cor="bg-blue-500" grupo="Meu Canal Ofertas" nome="OfertaRelay"
                  texto="📦 Notebook Acer i5 — 18% OFF" link="meli.la/xSEU_LINK" linkLabel="seu link" />
              </div>
            </div>
          </div>

          {/* Mobile: fluxo vertical simplificado */}
          <div className="md:hidden flex flex-col items-center gap-3 max-w-sm mx-auto">
            <div className="w-full">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Grupos monitorados</p>
              <WaBubble avatar="🔥" cor="bg-orange-400" grupo="Promoções do Dia" nome="Bot Shopee" monitorado
                texto="🛒 Fone JBL Tune 520BT - só hoje!" link="shopee.com.br/produto/123456" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowDown className="w-4 h-4 text-gray-300" />
              <div className="flex items-center gap-2 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-green-200">
                <Zap className="w-4 h-4" /> OfertaRelay · troca link ✓
              </div>
              <ArrowDown className="w-4 h-4 text-gray-300" />
            </div>
            <div className="w-full">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Seus grupos</p>
              <WaBubble avatar="💚" cor="bg-green-600" grupo="Meu Canal de Ofertas" nome="OfertaRelay"
                texto="🛒 Fone JBL Tune 520BT - só hoje!" link="s.shopee.com.br/xSEU_LINK" linkLabel="seu link" />
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Tudo isso acontece automaticamente, 24h por dia — enquanto você dorme 😴
          </p>
        </div>
      </section>

      {/* ── Integrações ─────────────────────────── */}
      <section className="py-8 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-5">Integrado com</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[['🟠','Shopee'],['🟡','Mercado Livre'],['💬','WhatsApp'],['✈️','Telegram'],['🤖','OpenAI GPT-4o']].map(([e,l]) => (
              <div key={l} className="flex items-center gap-2 text-gray-600 font-semibold text-sm">
                <span className="text-xl">{e}</span>{l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problema ────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Chip>O problema</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Você tá deixando dinheiro na mesa
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl mx-auto">
              Cada oferta que passa em um grupo sem o seu link de afiliado é comissão indo para o bolso de outra pessoa.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {PROBLEMAS.map(p => (
              <div key={p.titulo} className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <span className="text-2xl">{p.emoji}</span>
                <h3 className="mt-2 font-semibold text-gray-800 text-sm">{p.titulo}</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O Relay ─────────────────────────────── */}
      <section id="relay" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Chip><Zap className="w-3.5 h-3.5" /> A funcionalidade principal</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Relay automático de grupos com troca de link
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Configure quais grupos monitorar. O OfertaRelay fica de olho 24h — quando detecta
              um link do Shopee ou Mercado Livre, gera o seu link de afiliado e repassa a mensagem
              para os seus grupos no WhatsApp e Telegram.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {RELAY_DETAILS.map(r => (
              <div key={r.titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${r.iconBg}`}>
                  <r.icon className={`w-5 h-5 ${r.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{r.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          {/* Fluxo em 4 passos — FIXO */}
          <div className="bg-white rounded-2xl border border-green-200 p-6">
            <p className="text-xs font-bold tracking-widest text-green-600 uppercase mb-6 text-center">
              Fluxo de uma oferta relayada
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
              {FLUXO_STEPS.map((s, i) => (
                <div key={s.n} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                  <div className="flex flex-col items-center text-center w-28">
                    <div className="w-9 h-9 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center mb-2 shadow-sm shadow-green-200 shrink-0">
                      {s.n}
                    </div>
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{s.t}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{s.s}</p>
                  </div>
                  {i < FLUXO_STEPS.length - 1 && (
                    <>
                      <ArrowRight className="hidden sm:block w-5 h-5 text-green-300 mx-3 shrink-0" />
                      <ArrowDown className="sm:hidden w-4 h-4 text-green-300 shrink-0" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Funcionalidades extras ──────────────── */}
      <section id="funcionalidades" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Chip>Além do relay</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Tudo para maximizar suas comissões</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              O relay é o coração, mas o OfertaRelay vai muito além — busca manual de ofertas,
              IA para turbinar legendas e fila de agendamento para escalar ainda mais.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────── */}
      <section id="como-funciona" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Chip>Como funciona</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Configure uma vez, ganhe para sempre</h2>
          </div>
          <div className="relative">
            <div aria-hidden className="hidden sm:block absolute top-8 left-[calc(16.66%+8px)] right-[calc(16.66%+8px)] h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200" />
            <div className="grid sm:grid-cols-3 gap-10">
              {STEPS.map((s, i) => (
                <div key={s.titulo} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-green-200 mb-5">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────── */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Chip><Star className="w-3.5 h-3.5 fill-green-600" /> Depoimentos</Chip>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Afiliados que já automatizaram</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.nome} className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm flex flex-col">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">"{t.texto}"</p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.nome[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{t.nome}</p>
                    <p className="text-xs text-gray-400">{t.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preço ───────────────────────────────── */}
      <section id="preco" className="py-24 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <Chip>Preço</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Um plano. Tudo incluso.</h2>
            <p className="mt-3 text-gray-500">Sem limite de grupos, sem cobrança por volume.</p>
          </div>

          <div className="relative bg-white rounded-3xl border-2 border-green-500 shadow-2xl shadow-green-100 overflow-hidden">
            <div className="absolute top-0 right-0">
              <div className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">LANÇAMENTO</div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-extrabold text-gray-900">OfertaRelay Pro</h3>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg text-gray-400 line-through">R$ 97</span>
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">–49%</span>
              </div>
              <div className="flex items-end gap-1 mb-7">
                <span className="text-6xl font-extrabold text-gray-900 leading-none">R$ 49</span>
                <div className="pb-1.5">
                  <span className="text-2xl font-bold text-gray-900">,90</span>
                  <span className="block text-sm text-gray-400 leading-none">/mês</span>
                </div>
              </div>

              <Link
                to="/register"
                className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 mb-7"
              >
                Começar agora — R$ 49,90/mês
              </Link>

              <ul className="flex flex-col gap-3">
                {PLANO_ITEMS.map(item => <Check key={item.text} text={item.text} sub={item.sub} />)}
              </ul>

              <p className="mt-7 text-xs text-center text-gray-400">
                Sem fidelidade. Cancele quando quiser. Cobrança mensal recorrente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Chip>FAQ</Chip>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Perguntas frequentes</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(f => <Faq key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-green-200 relative overflow-hidden text-center">
            <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
            </div>
            <Zap className="w-10 h-10 text-white/90 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pare de perder comissões por descuido
            </h2>
            <p className="mt-4 text-green-100 text-lg max-w-xl mx-auto leading-relaxed">
              Configure o relay uma vez e deixe o OfertaRelay trabalhar enquanto você dorme.
              Cada oferta que passa nos grupos monitorados já vai com o seu link.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 mt-8 bg-white text-green-600 hover:bg-green-50 font-extrabold text-lg px-10 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
            >
              Criar minha conta agora <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-green-200 text-sm">R$ 49,90/mês · Sem fidelidade · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Zap className="w-5 h-5 text-green-500" />
            OfertaRelay
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} OfertaRelay. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link to="/login"    className="hover:text-gray-700 transition-colors">Entrar</Link>
            <Link to="/register" className="hover:text-gray-700 transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

/* ─── dados ─── */
const PROBLEMAS = [
  { emoji: '😴', titulo: 'Grupos postam enquanto você dorme',      desc: 'Os melhores horários de oferta são de madrugada. Sem automação, você perde as melhores conversões.' },
  { emoji: '💸', titulo: 'Link original = comissão de outro',      desc: 'Quando você repassa uma oferta com link original, a comissão vai para o afiliado que o criou — não você.' },
  { emoji: '😩', titulo: 'Escalar no manual é impossível',          desc: 'Copiar link, gerar afiliado, formatar, enviar para cada grupo... você não consegue monitorar dezenas de grupos sozinho.' },
];

const FLUXO_STEPS = [
  { n: '1', t: 'Oferta chega no grupo monitorado', s: 'link original de outro afiliado' },
  { n: '2', t: 'OfertaRelay detecta o link',       s: 'Shopee ou Mercado Livre' },
  { n: '3', t: 'Gera seu link de afiliado',         s: 'com suas credenciais' },
  { n: '4', t: 'Encaminha para seus grupos',        s: 'WhatsApp + Telegram' },
];

const RELAY_DETAILS = [
  {
    icon: Eye, iconBg: 'bg-blue-50', iconColor: 'text-blue-500',
    titulo: 'Monitoramento 24/7 de grupos',
    desc: 'Cadastre os grupos de WhatsApp de promoções que deseja monitorar. O OfertaRelay fica conectado e captura automaticamente cada mensagem com link de produto.',
  },
  {
    icon: Link2, iconBg: 'bg-green-50', iconColor: 'text-green-500',
    titulo: 'Troca automática do link de afiliado',
    desc: 'Ao detectar um link do Shopee ou Mercado Livre, o sistema gera instantaneamente o seu link de afiliado personalizado — com a sua tag e comissão.',
  },
  {
    icon: Repeat2, iconBg: 'bg-violet-50', iconColor: 'text-violet-500',
    titulo: 'Reenvio para seus grupos de destino',
    desc: 'A mensagem original é encaminhada para os seus grupos do WhatsApp e canais do Telegram, já com o seu link — mantendo foto, texto e preço intactos.',
  },
  {
    icon: ArrowDownRight, iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
    titulo: 'Cópia manual de ofertas avulsas',
    desc: 'Também é possível copiar manualmente uma oferta de qualquer grupo e disparar com o seu link — sem precisar do relay contínuo.',
  },
];

const FEATURES = [
  {
    icon: ShoppingBag, iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
    titulo: 'Busca de ofertas Shopee + ML',
    desc: 'Além do relay, sincronize produtos direto das APIs — Flash Sale, categorias, palavras-chave — e monte uma vitrine para disparar manualmente.',
  },
  {
    icon: BrainCircuit, iconBg: 'bg-violet-50', iconColor: 'text-violet-500',
    titulo: 'Legendas melhoradas por IA',
    desc: 'GPT-4o reescreve o texto da oferta com um toque coloquial e persuasivo antes do disparo. Preço e link permanecem intactos.',
  },
  {
    icon: CalendarClock, iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
    titulo: 'Fila de agendamento',
    desc: 'Monte uma fila de ofertas para envio espaçado. Configure o intervalo em minutos e o OfertaRelay dispara uma a uma no ritmo ideal.',
  },
  {
    icon: MessageCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',
    titulo: 'WhatsApp + Telegram simultâneos',
    desc: 'Configure grupos de WhatsApp e canais/grupos do Telegram. Cada disparo vai para todos os destinos de uma só vez.',
  },
  {
    icon: BarChart3, iconBg: 'bg-rose-50', iconColor: 'text-rose-500',
    titulo: 'Histórico e logs de links',
    desc: 'Consulte cada link gerado: taxa de sucesso, tempo de resposta e contexto. Auditoria completa da sua operação de afiliado.',
  },
  {
    icon: Send, iconBg: 'bg-blue-50', iconColor: 'text-blue-500',
    titulo: 'Envio manual com um clique',
    desc: 'Encontrou uma oferta boa? Abra o modal, veja a legenda com o seu link já gerado, edite se quiser e dispare na hora.',
  },
];

const STEPS = [
  {
    titulo: 'Conecte e configure',
    desc: 'Conecte seu WhatsApp via QR code. Adicione os grupos que quer monitorar (origem) e os seus grupos de destino. Configure suas credenciais de afiliado.',
  },
  {
    titulo: 'Ative o relay',
    desc: 'Com um botão, o OfertaRelay começa a monitorar. Cada oferta detectada vira um disparo automático com o seu link de afiliado.',
  },
  {
    titulo: 'Acompanhe e escale',
    desc: 'Veja o histórico de envios e adicione novos grupos de origem a qualquer momento para ampliar o volume sem esforço extra.',
  },
];

const TESTIMONIALS = [
  {
    nome: 'Rafael M.',
    cargo: 'Afiliado Shopee + ML · SP',
    texto: 'Entrei em 12 grupos de promoções e o relay troca o link automaticamente em cada oferta. Hoje minha comissão mensal triplicou sem eu fazer absolutamente nada.',
  },
  {
    nome: 'Juliana S.',
    cargo: 'Criadora de grupos de ofertas · RJ',
    texto: 'Antes ficava acordada até meia-noite para pegar as Flash Sales. Agora o OfertaRelay faz isso enquanto eu durmo. Simplesmente incrível.',
  },
  {
    nome: 'Carlos A.',
    cargo: 'Gestor de tráfego · MG',
    texto: 'O diferencial é a troca do link ser instantânea. A oferta chega no grupo de origem e em segundos já está nos meus 8 grupos com meu link de afiliado.',
  },
];

const PLANO_ITEMS = [
  { text: 'Relay automático de grupos WhatsApp',          sub: 'monitoramento 24/7 com troca de link' },
  { text: 'Grupos de origem e destino ilimitados',        sub: 'monitore quantos grupos quiser' },
  { text: 'Link de afiliado único por usuário',           sub: 'Shopee + Mercado Livre' },
  { text: 'Encaminhamento para Telegram',                 sub: 'canais e grupos simultaneamente' },
  { text: 'Cópia manual de ofertas avulsas',              sub: 'sem precisar do relay contínuo' },
  { text: 'Busca de ofertas via API (Shopee + ML)',        sub: 'Flash Sale, categorias, palavras-chave' },
  { text: 'Legendas melhoradas por IA (GPT-4o-mini)',     sub: 'texto persuasivo e informal no automático' },
  { text: 'Fila de agendamento com intervalo livre',      sub: 'drip de disparos espaçados' },
  { text: 'Histórico de envios + logs de links',          sub: 'auditoria completa' },
  { text: 'Suporte via WhatsApp + atualizações inclusas', sub: undefined },
];

const FAQS = [
  {
    q: 'O que exatamente o relay faz?',
    a: 'Você define grupos do WhatsApp para monitorar (ex: grupos de promoções que você participa). Quando alguém posta uma oferta com link do Shopee ou Mercado Livre, o OfertaRelay detecta automaticamente, gera o seu link de afiliado e encaminha a mensagem para os seus grupos — com foto, texto e preço originais, mas com o seu link.',
  },
  {
    q: 'Preciso deixar o computador ligado?',
    a: 'Não. O OfertaRelay roda na nuvem. Uma vez configurado, o relay funciona 24h por dia mesmo com seu computador desligado.',
  },
  {
    q: 'Preciso de conta de afiliado própria?',
    a: 'Sim. O sistema usa suas credenciais (App ID/Secret da Shopee, Tag+Cookies do Mercado Livre) para gerar os links com a sua comissão. Você precisa ter conta aprovada nos programas de afiliados.',
  },
  {
    q: 'Corre risco de ban no WhatsApp?',
    a: 'O OfertaRelay usa a Evolution API. O risco é minimizado quando usado de forma responsável — respeitando os intervalos entre mensagens e sem fazer spam.',
  },
  {
    q: 'Posso monitorar quantos grupos quiser?',
    a: 'Sim. O plano não tem limite de grupos de origem nem de destino. Você pode escalar para dezenas de grupos monitorados e múltiplos grupos de destino.',
  },
  {
    q: 'O preço vai aumentar?',
    a: 'O valor de R$ 49,90/mês é o preço de lançamento. Quem assinar agora trava esse preço enquanto mantiver a assinatura ativa.',
  },
];
