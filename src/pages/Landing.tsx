import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ShoppingBag, Send, BrainCircuit, CalendarClock, Link2,
  CheckCircle2, ChevronDown, ArrowRight, Star, Smartphone,
  BarChart3, Shield, Clock, TrendingUp, MessageCircle, Repeat2,
  BadgeCheck,
} from 'lucide-react';

/* ─── helpers ─── */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
      {children}
    </span>
  );
}

function Check({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-700">
      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
      {text}
    </li>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {q}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

/* ─── main ─── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* ── Navbar ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="w-5 h-5 text-green-500" />
            <span>OfertaRelay</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#funcionalidades" className="hover:text-gray-900 transition-colors">Funcionalidades</a>
            <a href="#como-funciona"   className="hover:text-gray-900 transition-colors">Como funciona</a>
            <a href="#preco"           className="hover:text-gray-900 transition-colors">Preço</a>
            <a href="#faq"             className="hover:text-gray-900 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors">Entrar</Link>
            <Link to="/register" className="text-sm font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-xl transition-colors">
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white pt-20 pb-24 px-4">
        {/* Decoração de fundo */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-green-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute top-40 -left-24 w-[400px] h-[400px] bg-emerald-100 rounded-full opacity-30 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Chip><Zap className="w-3.5 h-3.5" /> Automatize • Venda mais • Ganhe mais</Chip>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
            Envie ofertas de afiliado<br />
            <span className="text-green-500">no automático</span> para<br className="hidden sm:block" /> WhatsApp e Telegram
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sincronize produtos do <strong>Shopee</strong> e <strong>Mercado Livre</strong>, gere seus links de afiliado,
            deixe a IA criar legendas irresistíveis e programe a fila de envios — tudo em um só lugar.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Quero começar agora <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#como-funciona"
              className="flex items-center gap-2 border border-gray-200 text-gray-700 font-medium text-base px-6 py-4 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Ver como funciona
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Sem fidelidade · Cancele quando quiser · Apenas <strong className="text-gray-600">R$ 49,90/mês</strong>
          </p>
        </div>

        {/* Mock visual */}
        <div className="relative max-w-5xl mx-auto mt-16 px-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-gray-400 font-mono">app.ofertarelay.com · Ofertas</span>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MOCK_CARDS.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-2">
                  <div className={`h-24 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <span className="text-3xl">{c.emoji}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{c.nome}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-green-600">{c.preco}</span>
                    <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">{c.desc}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full font-medium">{c.plat}</span>
                    <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> link ok
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Barra de plataformas ──────────────────────── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">Integrado com</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm"><span className="text-2xl">🟠</span> Shopee</div>
            <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm"><span className="text-2xl">🟡</span> Mercado Livre</div>
            <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm"><span className="text-2xl">💬</span> WhatsApp</div>
            <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm"><span className="text-2xl">✈️</span> Telegram</div>
            <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm"><span className="text-2xl">🤖</span> OpenAI GPT-4o</div>
          </div>
        </div>
      </section>

      {/* ── Problema ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Chip>O problema</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Você ainda faz tudo no manual?
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              Cada hora que você gasta copiando links e formatando mensagens é uma hora que seus concorrentes
              estão vendendo mais com automação.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {PROBLEMAS.map((p) => (
              <div key={p.titulo} className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <span className="text-2xl">{p.emoji}</span>
                <h3 className="mt-2 font-semibold text-gray-800 text-sm">{p.titulo}</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ───────────────────────────── */}
      <section id="funcionalidades" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Chip>Funcionalidades</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Tudo que você precisa em um só lugar</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              De sincronizar produtos a disparar mensagens com link de afiliado único, o OfertaRelay faz
              o trabalho pesado enquanto você foca em crescer.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
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

      {/* ── Como funciona ─────────────────────────────── */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Chip>Como funciona</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Em 3 passos simples</h2>
          </div>
          <div className="relative">
            {/* linha conectando os steps (desktop) */}
            <div aria-hidden className="hidden sm:block absolute top-8 left-[calc(16.66%+8px)] right-[calc(16.66%+8px)] h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200" />
            <div className="grid sm:grid-cols-3 gap-8">
              {STEPS.map((s, i) => (
                <div key={s.titulo} className="flex flex-col items-center text-center">
                  <div className="relative w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-green-200 mb-4">
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

      {/* ── Depoimentos ───────────────────────────────── */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Chip><Star className="w-3.5 h-3.5 fill-green-600" /> Depoimentos</Chip>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Afiliados que já automatizaram</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.nome} className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">"{t.texto}"</p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
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

      {/* ── Preço ─────────────────────────────────────── */}
      <section id="preco" className="py-24 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <Chip>Preço</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Simples e sem surpresas</h2>
            <p className="mt-3 text-gray-500">Um plano único com acesso a tudo. Sem limites escondidos.</p>
          </div>

          <div className="relative bg-white rounded-3xl border-2 border-green-500 shadow-2xl shadow-green-100 overflow-hidden">
            {/* Badge popular */}
            <div className="absolute top-0 right-0">
              <div className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                MAIS POPULAR
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-extrabold text-gray-900">OfertaRelay Pro</h3>
              </div>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-lg text-gray-400 line-through">R$ 97</span>
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">–49%</span>
              </div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-6xl font-extrabold text-gray-900">R$ 49</span>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">,90</span>
                  <span className="block text-sm text-gray-400">/mês</span>
                </div>
              </div>

              <Link
                to="/register"
                className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0 mb-6"
              >
                Começar agora — R$ 49,90/mês
              </Link>

              <ul className="flex flex-col gap-3">
                {PLANO_ITEMS.map((i) => <Check key={i} text={i} />)}
              </ul>

              <p className="mt-6 text-xs text-center text-gray-400">
                Sem fidelidade. Cancele quando quiser. Cobrança mensal recorrente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Chip>FAQ</Chip>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Perguntas frequentes</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => <Faq key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-green-200 relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
            </div>
            <Zap className="w-10 h-10 text-white/90 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pronto para vender mais no automático?
            </h2>
            <p className="mt-4 text-green-100 text-lg max-w-xl mx-auto">
              Junte-se aos afiliados que já usam o OfertaRelay para disparar centenas de ofertas por dia — sem esforço manual.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 mt-8 bg-white text-green-600 hover:bg-green-50 font-extrabold text-lg px-10 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Criar minha conta agora <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-green-200 text-sm">R$ 49,90/mês · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Zap className="w-5 h-5 text-green-500" />
            OfertaRelay
          </div>
          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} OfertaRelay. Todos os direitos reservados.
          </p>
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
const MOCK_CARDS = [
  { bg: 'bg-orange-50',  emoji: '📱', nome: 'Smartphone Samsung Galaxy A55',      preco: 'R$ 1.299', desc: '-30%', plat: 'Shopee'  },
  { bg: 'bg-yellow-50',  emoji: '🎧', nome: 'Fone Bluetooth JBL Tune 520BT',       preco: 'R$ 189',   desc: '-25%', plat: 'ML'      },
  { bg: 'bg-green-50',   emoji: '💻', nome: 'Notebook Acer Aspire 15 Core i5',     preco: 'R$ 2.499', desc: '-18%', plat: 'Shopee'  },
  { bg: 'bg-blue-50',    emoji: '⌨️', nome: 'Teclado Mecânico Redragon Kumara',    preco: 'R$ 229',   desc: '-40%', plat: 'ML'      },
  { bg: 'bg: purple-50', emoji: '📷', nome: 'Câmera de Segurança Wi-Fi Intelbras', preco: 'R$ 159',   desc: '-22%', plat: 'Shopee'  },
  { bg: 'bg-pink-50',    emoji: '🖨️', nome: 'Impressora HP DeskJet 2874',          preco: 'R$ 399',   desc: '-15%', plat: 'ML'      },
  { bg: 'bg-amber-50',   emoji: '🎮', nome: 'Controle Xbox Sem Fio Carbon Black',  preco: 'R$ 349',   desc: '-20%', plat: 'ML'      },
  { bg: 'bg-teal-50',    emoji: '⌚', nome: 'Smartwatch Xiaomi Band 8 NFC',        preco: 'R$ 249',   desc: '-35%', plat: 'Shopee'  },
];

const PROBLEMAS = [
  { emoji: '😩', titulo: 'Copia e cola infinito', desc: 'Buscar produto, copiar link, gerar afiliado, formatar mensagem... manualmente para cada oferta, todo dia.' },
  { emoji: '💸', titulo: 'Link errado = comissão perdida', desc: 'Sem automação é fácil esquecer de trocar o link de afiliado ou usar o link de outra pessoa por engano.' },
  { emoji: '📉', titulo: 'Horários ruins de disparo', desc: 'Postar oferta na hora errada derruba o engajamento do grupo e a taxa de conversão cai pela metade.' },
];

const FEATURES = [
  {
    icon: Repeat2,      iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',
    titulo: 'Sincronização automática',
    desc:   'Importe ofertas do Shopee (Flash Sale + busca por palavras-chave) e Mercado Livre com um clique. Deduplicação automática.',
  },
  {
    icon: Link2,        iconBg: 'bg-green-50',   iconColor: 'text-green-500',
    titulo: 'Link de afiliado único',
    desc:   'Na hora do envio, o sistema gera o link de afiliado com as suas credenciais — nunca com as de outro usuário.',
  },
  {
    icon: BrainCircuit, iconBg: 'bg-violet-50',  iconColor: 'text-violet-500',
    titulo: 'Legendas com IA',
    desc:   'GPT-4o reescreve a legenda para ser mais persuasiva, mantendo preço e link intactos. Copie ou envie diretamente.',
  },
  {
    icon: CalendarClock,iconBg: 'bg-amber-50',   iconColor: 'text-amber-500',
    titulo: 'Fila de agendamento',
    desc:   'Monte uma fila de ofertas, defina o intervalo entre envios e deixe o sistema disparar um a um no ritmo que você escolher.',
  },
  {
    icon: MessageCircle,iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',
    titulo: 'WhatsApp + Telegram',
    desc:   'Envie para grupos do WhatsApp (via Evolution API) e canais do Telegram. Escolha por grupo na hora do envio.',
  },
  {
    icon: BarChart3,    iconBg: 'bg-rose-50',    iconColor: 'text-rose-500',
    titulo: 'Logs e auditoria',
    desc:   'Acompanhe cada link gerado: taxa de sucesso, tempo de resposta das APIs e histórico completo por plataforma.',
  },
];

const STEPS = [
  {
    titulo: 'Configure suas credenciais',
    desc:   'Cadastre suas contas de afiliado do Shopee e Mercado Livre. Conecte seu WhatsApp e Telegram em minutos.',
  },
  {
    titulo: 'Sincronize os produtos',
    desc:   'Com um clique buscamos as melhores ofertas ativas nas plataformas e populamos sua vitrine com links prontos.',
  },
  {
    titulo: 'Envie ou agende',
    desc:   'Selecione as ofertas, melhore as legendas com IA e dispare agora ou agende uma fila automática com intervalo personalizado.',
  },
];

const TESTIMONIALS = [
  {
    nome: 'Rafael M.',
    cargo: 'Afiliado Shopee + ML · SP',
    texto: 'Antes perdia 2h por dia gerando links e formatando mensagem. Hoje configuro a fila em 10 minutos e o OfertaRelay faz o resto. Minha comissão mensal dobrou.',
  },
  {
    nome: 'Juliana S.',
    cargo: 'Criadora de grupos de ofertas · RJ',
    texto: 'A função de IA nas legendas é incrível. As mensagens ficaram muito mais chamativas e percebi um aumento claro no número de cliques dos meus grupos.',
  },
  {
    nome: 'Carlos A.',
    cargo: 'Gestor de tráfego · MG',
    texto: 'O agendamento com intervalo automático salvou minha vida. Não preciso mais ficar na frente do computador esperando a hora de postar cada oferta.',
  },
];

const PLANO_ITEMS = [
  'Sincronização ilimitada de ofertas (Shopee + ML)',
  'Link de afiliado único por usuário em cada envio',
  'Legendas melhoradas por IA (GPT-4o-mini)',
  'Fila de agendamento com intervalo personalizável',
  'Envio para grupos do WhatsApp via Evolution API',
  'Envio para canais/grupos do Telegram',
  'Dashboard com histórico de envios',
  'Logs de links afiliados com taxa de sucesso',
  'Suporte via WhatsApp',
  'Atualizações inclusas',
];

const FAQS = [
  {
    q: 'Preciso de conta de afiliado própria para usar?',
    a: 'Sim. O OfertaRelay utiliza as suas credenciais de afiliado (App ID/Secret da Shopee e Tag/Cookies do Mercado Livre) para gerar os links com a sua comissão. Você precisa ter conta aprovada nos programas de afiliados de cada plataforma.',
  },
  {
    q: 'Como funciona o envio pelo WhatsApp?',
    a: 'Usamos a Evolution API, que conecta um número de WhatsApp via QR code. Não há risco de ban quando utilizado de forma responsável — o sistema respeita os intervalos que você configurar entre os envios.',
  },
  {
    q: 'Posso usar com mais de um grupo ao mesmo tempo?',
    a: 'Sim! Você cadastra todos os seus grupos de WhatsApp e canais de Telegram e escolhe para quais enviar no momento do disparo — individualmente ou em lote.',
  },
  {
    q: 'A IA altera o preço ou o link na legenda?',
    a: 'Não. O modelo recebe instruções explícitas para manter o preço e o link intactos. Ele apenas melhora o texto, adiciona emojis estratégicos e deixa a mensagem mais persuasiva.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem burocracia. Não há fidelidade mínima. Basta cancelar antes da próxima cobrança e seu acesso se encerra ao final do período pago.',
  },
  {
    q: 'O preço vai aumentar?',
    a: 'O valor de R$ 49,90/mês é garantido para quem assinar durante o período de lançamento. Quem entrar agora trava esse preço enquanto mantiver a assinatura ativa.',
  },
];
