import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import {
  Zap, Smartphone, Link2, MessageCircle, ChevronDown,
  BookOpen, Youtube, ShoppingBag, CalendarClock,
  Bot, ExternalLink, Instagram, CheckCircle2, ArrowRight,
} from 'lucide-react';

// ─── FAQ ─────────────────────────────────────────────────────────────────────
// Perguntas pensadas para quem nunca usou a ferramenta antes.

const FAQ = [
  {
    q: '🤔 Preciso saber de tecnologia para usar o OfertaRelay?',
    r: 'Não! O OfertaRelay foi feito para qualquer pessoa usar. Se você sabe usar o WhatsApp e navegar na internet, já é suficiente. Os guias aqui explicam cada passo com imagens e linguagem simples.',
  },
  {
    q: '📱 Posso usar meu número de WhatsApp normal?',
    r: 'Não recomendamos. Você vai precisar de um número separado, exclusivo para o OfertaRelay — pode ser um chip novo de qualquer operadora (inclusive chip de R$ 5 que você ativa). Isso protege o seu número pessoal de qualquer problema.',
  },
  {
    q: '💰 O que é um "link de afiliado"?',
    r: 'Pensa assim: quando você compartilha um produto da Shopee ou do Mercado Livre com um link normal, a loja não sabe que foi você quem indicou. O link de afiliado é um link especial com o seu nome nele — aí quando alguém compra, a loja sabe que foi você e te paga uma comissão. O OfertaRelay coloca automaticamente o SEU link em cada oferta que você envia.',
  },
  {
    q: '😴 Preciso ficar o dia todo no computador?',
    r: 'Não. O OfertaRelay roda sozinho no servidor, 24 horas por dia, 7 dias por semana. Você configura uma vez e ele trabalha enquanto você dorme, viaja ou faz outra coisa. Só precisa garantir que o WhatsApp esteja conectado.',
  },
  {
    q: '🚫 Minha conta do WhatsApp pode ser banida?',
    r: 'O risco é baixo se você seguir as boas práticas: use um número dedicado (nunca o pessoal), ative o agendamento com pelo menos 30-60 minutos entre cada envio e não mande spam. Veja o guia "Conectando o WhatsApp" para dicas detalhadas de segurança.',
  },
  {
    q: '🔧 O que acontece se eu errar alguma configuração?',
    r: 'Nada de grave! Você pode corrigir qualquer configuração a qualquer hora. O sistema não apaga seus dados nem para de funcionar por causa de um campo errado. Você vai ver uma mensagem de erro te dizendo o que ajustar.',
  },
  {
    q: '⏱️ Quanto tempo leva para configurar tudo?',
    r: 'Em média 15 a 20 minutos para a configuração inicial. O passo que demora mais é criar a conta de afiliado na Shopee (porque é em outro site). Se você seguir os guias passo a passo aqui, não vai ter dificuldade.',
  },
  {
    q: '🤑 Quanto tempo leva para começar a ganhar dinheiro?',
    r: 'Logo que a configuração estiver pronta e as ofertas começarem a ser enviadas para os seus grupos. O dinheiro depende do tamanho dos seus grupos e de quantas pessoas compram — mas já no primeiro dia você já está gerando links de afiliado.',
  },
  {
    q: '📦 Quais lojas funcionam com o OfertaRelay?',
    r: 'Hoje o sistema gera links de afiliado para Shopee e Mercado Livre. O relay funciona com qualquer mensagem de oferta que tiver link, mas só vai substituir pelo seu link se for dessas duas plataformas.',
  },
  {
    q: '📡 E se o WhatsApp desconectar?',
    r: 'O relay pausa automaticamente. Para voltar, basta abrir o menu WhatsApp no OfertaRelay, clicar em "Reconectar" e escanear o QR Code de novo com o celular do número dedicado. É como parear um fone Bluetooth — dois minutinhos e volta a funcionar.',
  },
  {
    q: '📲 E se eu não tiver grupos de WhatsApp ainda?',
    r: 'Você vai precisar de grupos para enviar as ofertas. Comece entrando em grupos de oferta de outros criadores (para monitorar) e crie pelo menos um grupo seu (para receber as ofertas). Tem muito conteúdo no YouTube ensinando como criar e crescer grupos de oferta.',
  },
  {
    q: '💳 Preciso pagar alguma coisa além do plano mensal?',
    r: 'Não. O plano de R$ 49,90/mês cobre tudo. As APIs da Shopee e do Mercado Livre são gratuitas para afiliados. O único custo extra possível é o chip do número dedicado de WhatsApp.',
  },
  {
    q: '❌ Posso cancelar quando quiser?',
    r: 'Sim, sem multa e sem burocracia. Vá em Faturamento e cancele quando quiser. O acesso fica ativo até o fim do período já pago.',
  },
  {
    q: '🤖 O que é a "Legenda com IA"?',
    r: 'É uma função que reescreve automaticamente o texto que vai junto com a oferta. Em vez de um texto genérico, a IA cria uma mensagem mais animada e persuasiva — como se fosse um amigo avisando "olha essa promoção!". Você pode usar ou não, é opcional.',
  },
  {
    q: '📅 O que é o "Agendamento"?',
    r: 'É uma fila de envios automáticos. Você seleciona várias ofertas e diz "quero enviar uma a cada 1 hora". O sistema manda sozinho, na ordem certa, sem você precisar fazer nada. Ótimo para manter seus grupos sempre ativos.',
  },
];

// ─── Guias ────────────────────────────────────────────────────────────────────

const GUIAS = [
  {
    icon: Zap,
    cor: 'bg-brand-100 text-brand-600',
    titulo: 'Como começar do zero',
    desc: 'Criando conta e fazendo a primeira configuração — em 15 minutos.',
    slug: 'primeiros-passos',
    tempo: '15 min',
  },
  {
    icon: Smartphone,
    cor: 'bg-green-100 text-green-600',
    titulo: 'Conectando o WhatsApp',
    desc: 'Usando um número dedicado, escaneando o QR Code e evitando problemas.',
    slug: 'conectar-whatsapp',
    tempo: '5 min',
  },
  {
    icon: Link2,
    cor: 'bg-blue-100 text-blue-600',
    titulo: 'Configurando seus links de afiliado',
    desc: 'Como criar sua conta na Shopee e no Mercado Livre como afiliado.',
    slug: 'configurar-afiliado',
    tempo: '10 min',
  },
  {
    icon: ShoppingBag,
    cor: 'bg-orange-100 text-orange-600',
    titulo: 'Buscando ofertas manualmente',
    desc: 'Como trazer ofertas da Shopee e do Mercado Livre para a plataforma.',
    slug: 'sincronizar-ofertas',
    tempo: '5 min',
  },
  {
    icon: CalendarClock,
    cor: 'bg-purple-100 text-purple-600',
    titulo: 'Programando envios automáticos',
    desc: 'Como deixar o sistema enviando ofertas sozinho, de hora em hora.',
    slug: 'agendamento',
    tempo: '5 min',
  },
  {
    icon: Bot,
    cor: 'bg-pink-100 text-pink-600',
    titulo: 'Melhorando textos com IA',
    desc: 'Como fazer a IA reescrever as mensagens das suas ofertas.',
    slug: 'legenda-ia',
    tempo: '3 min',
  },
];

const VIDEOS = [
  {
    titulo: 'O que é o OfertaRelay e como ele funciona',
    duracao: '8 min',
    plataforma: 'YouTube',
    link: '#',
  },
  {
    titulo: 'Configuração completa do zero — tutorial ao vivo',
    duracao: '14 min',
    plataforma: 'YouTube',
    link: '#',
  },
  {
    titulo: 'Veja o relay funcionando em 45 segundos',
    duracao: '45 seg',
    plataforma: 'Reels/TikTok',
    link: '#',
  },
];

// ─── Componente FAQ ───────────────────────────────────────────────────────────

function FaqItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full text-left py-4 flex items-start justify-between gap-3"
      >
        <span className="font-medium text-gray-800 text-sm leading-relaxed">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed pb-4 -mt-1">
          {r}
        </p>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function Help() {
  return (
    <>
      <PageHeader
        title="Central de Ajuda"
        subtitle="Tudo que você precisa para configurar e usar o OfertaRelay"
      />

      {/* Por onde começar — checklist visual */}
      <div className="card mb-6 bg-gradient-to-br from-brand-50 to-white border-brand-100">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">Por onde começar?</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Se você acabou de criar sua conta, siga essa ordem. Cada passo leva menos de 5 minutos.
        </p>
        <div className="space-y-2">
          {[
            { n: 1, txt: 'Conectar um número de WhatsApp dedicado',   slug: 'conectar-whatsapp',    cor: 'bg-green-500' },
            { n: 2, txt: 'Definir seus grupos de origem e destino',   slug: 'primeiros-passos',     cor: 'bg-brand-500' },
            { n: 3, txt: 'Criar sua conta de afiliado (Shopee / ML)', slug: 'configurar-afiliado',  cor: 'bg-blue-500' },
            { n: 4, txt: 'Pronto! O relay já está funcionando',       slug: null,                   cor: 'bg-gray-400' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full ${s.cor} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                {s.n}
              </div>
              {s.slug ? (
                <Link
                  to={`/app/help/${s.slug}`}
                  className="text-sm text-brand-700 font-medium hover:underline flex items-center gap-1"
                >
                  {s.txt} <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <span className="text-sm text-gray-500">{s.txt} 🎉</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Como funciona — explicação simples */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Como o OfertaRelay funciona?</h2>
        <p className="text-sm text-gray-500 mb-5">
          Imagina que você tem um assistente 24h que fica de olho nos grupos de oferta de outros criadores.
          Quando aparece uma promoção boa, ele pega, coloca <strong>o seu link</strong> e manda para os
          seus grupos. Tudo automático, enquanto você faz outra coisa.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              emoji: '👀',
              cor: 'bg-green-100',
              titulo: '1. Fica de olho',
              desc: 'Monitora grupos de outros criadores de ofertas que você entrou como membro.',
            },
            {
              emoji: '🔗',
              cor: 'bg-blue-100',
              titulo: '2. Troca o link',
              desc: 'Substitui o link da oferta pelo SEU link de afiliado — você recebe a comissão.',
            },
            {
              emoji: '✍️',
              cor: 'bg-purple-100',
              titulo: '3. Prepara a mensagem',
              desc: 'Formata o texto com o nome do produto, preço e o seu link.',
            },
            {
              emoji: '📤',
              cor: 'bg-brand-100',
              titulo: '4. Envia para você',
              desc: 'Manda a oferta para todos os seus grupos de WhatsApp e Telegram.',
            },
          ].map((s) => (
            <div key={s.titulo} className="flex flex-col items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.cor}`}>
                {s.emoji}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{s.titulo}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guias */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">Guias passo a passo</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Cada guia explica uma parte da configuração de forma simples, com instruções visuais.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIAS.map((g) => (
            <Link
              key={g.slug}
              to={`/app/help/${g.slug}`}
              className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${g.cor}`}>
                <g.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800 text-sm group-hover:text-brand-700 leading-tight">{g.titulo}</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{g.desc}</p>
                <p className="text-xs text-brand-500 mt-1 font-medium">⏱ {g.tempo}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Vídeos */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Youtube className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold text-gray-900">Prefere assistir a um vídeo?</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Veja tutoriais em vídeo mostrando tudo na prática.
        </p>
        <div className="space-y-3">
          {VIDEOS.map((v) => (
            <a
              key={v.titulo}
              href={v.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
            >
              <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                {v.plataforma === 'YouTube'
                  ? <Youtube className="w-5 h-5 text-red-400" />
                  : <Instagram className="w-5 h-5 text-pink-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm group-hover:text-brand-700 leading-tight">{v.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.plataforma} · {v.duracao}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-brand-400 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Dúvidas frequentes</h2>
        <p className="text-sm text-gray-500 mb-5">
          Clique em qualquer pergunta para ver a resposta.
        </p>
        <div>
          {FAQ.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} r={faq.r} />
          ))}
        </div>
      </div>

      {/* Suporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-brand-50 to-purple-50 border-brand-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Assistente de suporte</h2>
              <p className="text-sm text-gray-600 mt-1">
                Viu o ícone de chat no canto inferior direito da tela? É um assistente inteligente
                que responde qualquer dúvida sobre o OfertaRelay — a qualquer hora, em segundos.
                É só digitar sua pergunta!
              </p>
              <p className="text-xs text-brand-600 mt-2 font-medium">💬 Disponível 24h — sem espera</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Precisa de ajuda humana?</h2>
              <p className="text-sm text-gray-600 mt-1">
                Se a dúvida for sobre pagamento, ou se você estiver com algum problema que não
                consegue resolver, fale com a nossa equipe pelo WhatsApp.
              </p>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary mt-3 text-sm inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
