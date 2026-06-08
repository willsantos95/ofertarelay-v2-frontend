import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import {
  Zap, Smartphone, Link2, Send, MessageCircle, ChevronDown,
  BookOpen, Youtube, Instagram, ShoppingBag, CalendarClock,
  Bot, ExternalLink,
} from 'lucide-react';

const FAQ = [
  {
    q: 'O WhatsApp pode ser banido?',
    r: 'Use um número dedicado à automação (nunca seu número pessoal). Ative o agendamento com intervalos razoáveis (30-60 min entre envios). O sistema foi projetado para funcionar dentro dos limites normais de uso.',
  },
  {
    q: 'Quanto tempo demora para configurar?',
    r: 'Em média 10 minutos: criar conta, escanear QR Code do WhatsApp, configurar credenciais de afiliado da Shopee/ML e definir os grupos de origem e destino.',
  },
  {
    q: 'Como funciona o relay de grupos?',
    r: 'Você configura grupos de outros criadores como "Origem" e os seus grupos como "Destino". Toda oferta que aparecer nos grupos de origem é automaticamente repassada para os seus grupos, com o seu link de afiliado substituído. Funciona 24h no servidor.',
  },
  {
    q: 'O relay funciona quando meu celular está desligado?',
    r: 'Sim. O relay roda no servidor, não no seu celular. Funciona 24 horas por dia, 7 dias por semana, independentemente do seu dispositivo.',
  },
  {
    q: 'Posso ter mais de um grupo destino?',
    r: 'Sim, sem limite de grupos destino. Todas as ofertas relayadas serão enviadas para todos os grupos marcados como destino.',
  },
  {
    q: 'O status "enviado" de uma oferta é compartilhado entre usuários?',
    r: 'Não. O controle de enviado é individual por usuário. Se outro usuário enviar a mesma oferta, ela ainda aparecerá como pendente para você.',
  },
  {
    q: 'O Telegram é obrigatório?',
    r: 'Não. A integração com Telegram é opcional. Se não configurar, as ofertas vão apenas para os grupos WhatsApp destino.',
  },
  {
    q: 'Como obtenho as credenciais da Shopee?',
    r: 'Acesse open.shopee.com, crie uma conta de desenvolvedor, crie um App e copie o App ID e App Secret. Configure em Afiliado → Configurações.',
  },
  {
    q: 'O que é a legenda com IA?',
    r: 'É uma função que usa inteligência artificial (GPT-4o-mini) para reescrever a legenda da oferta com um tom mais informal e persuasivo, como se fosse um amigo avisando sobre uma boa promoção. O link de afiliado e o preço são sempre preservados.',
  },
  {
    q: 'Como funciona o agendamento?',
    r: 'Você enfileira ofertas para envio automático com um intervalo configurável entre cada envio (mínimo 1 minuto, máximo 24 horas). Ideal para manter seus grupos ativos sem esforço manual.',
  },
];

const GUIAS = [
  {
    icon: Zap,
    cor: 'bg-brand-100 text-brand-600',
    titulo: 'Primeiros Passos',
    desc: 'Criando conta, conectando WhatsApp e fazendo o primeiro relay.',
    slug: 'primeiros-passos',
  },
  {
    icon: Smartphone,
    cor: 'bg-green-100 text-green-600',
    titulo: 'Conectando WhatsApp',
    desc: 'Criando instância, escaneando QR Code e dicas de segurança.',
    slug: 'conectar-whatsapp',
  },
  {
    icon: Link2,
    cor: 'bg-blue-100 text-blue-600',
    titulo: 'Configurando Afiliado',
    desc: 'Credenciais Shopee Partner API e Mercado Livre.',
    slug: 'configurar-afiliado',
  },
  {
    icon: ShoppingBag,
    cor: 'bg-orange-100 text-orange-600',
    titulo: 'Sincronizando Ofertas',
    desc: 'Shopee API, URLs do ML e filtros de listagem.',
    slug: 'sincronizar-ofertas',
  },
  {
    icon: CalendarClock,
    cor: 'bg-purple-100 text-purple-600',
    titulo: 'Agendamento',
    desc: 'Configurando fila de envios automáticos e intervalos.',
    slug: 'agendamento',
  },
  {
    icon: Bot,
    cor: 'bg-pink-100 text-pink-600',
    titulo: 'Legenda com IA',
    desc: 'Usando GPT para legendas mais persuasivas.',
    slug: 'legenda-ia',
  },
];

const VIDEOS = [
  {
    titulo: 'O que é o OfertaRelay e como ele fatura por você',
    duracao: '8 min',
    plataforma: 'YouTube',
    thumb: null,
    link: '#',
  },
  {
    titulo: 'Tutorial completo: configurando do zero',
    duracao: '14 min',
    plataforma: 'YouTube',
    thumb: null,
    link: '#',
  },
  {
    titulo: 'Como o relay funciona na prática',
    duracao: '45 seg',
    plataforma: 'Reels/TikTok',
    thumb: null,
    link: '#',
  },
];

function FaqItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((p) => !p)}
      className="w-full text-left border-b border-gray-100 last:border-0 pb-4 last:pb-0"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-gray-800 text-sm">{q}</p>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{r}</p>}
    </button>
  );
}

export default function Help() {
  return (
    <>
      <PageHeader
        title="Central de Ajuda"
        subtitle="Guias, vídeos e respostas para tudo sobre o OfertaRelay"
      />

      {/* Como funciona o relay */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-5">Como funciona o relay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Smartphone,
              cor: 'bg-green-100 text-green-600',
              titulo: '1. Monitora origem',
              desc: 'O bot fica online nos grupos de origem e detecta mensagens com links de ofertas.',
            },
            {
              icon: Link2,
              cor: 'bg-blue-100 text-blue-600',
              titulo: '2. Gera link afiliado',
              desc: 'Cada link detectado é convertido automaticamente para o seu link de afiliado.',
            },
            {
              icon: Zap,
              cor: 'bg-purple-100 text-purple-600',
              titulo: '3. Formata a mensagem',
              desc: 'A oferta é formatada com título, preço e seu link afiliado, pronta para envio.',
            },
            {
              icon: Send,
              cor: 'bg-brand-100 text-brand-600',
              titulo: '4. Envia destinos',
              desc: 'A mensagem é enviada para todos os grupos WhatsApp e canais Telegram configurados.',
            },
          ].map((s) => (
            <div key={s.titulo} className="flex flex-col items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.cor}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{s.titulo}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guias de documentação */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">Guias passo a passo</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIAS.map((g) => (
            <Link
              key={g.titulo}
              to={`/app/help/${g.slug}`}
              className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${g.cor}`}>
                <g.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm group-hover:text-brand-700">{g.titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Vídeos */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Youtube className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold text-gray-900">Vídeos tutoriais</h2>
        </div>
        <div className="space-y-3">
          {VIDEOS.map((v) => (
            <a
              key={v.titulo}
              href={v.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
            >
              <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                {v.plataforma === 'YouTube' ? (
                  <Youtube className="w-6 h-6 text-red-400" />
                ) : (
                  <Instagram className="w-6 h-6 text-pink-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm group-hover:text-brand-700 truncate">{v.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {v.plataforma} · {v.duracao}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-brand-400 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-5">Perguntas frequentes</h2>
        <div className="space-y-4">
          {FAQ.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} r={faq.r} />
          ))}
        </div>
      </div>

      {/* Chat e suporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Chat IA */}
        <div className="card bg-gradient-to-br from-brand-50 to-purple-50 border-brand-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Chat de suporte com IA</h2>
              <p className="text-sm text-gray-600 mt-1">
                Clique no ícone de chat no canto inferior direito da tela para falar com nosso
                assistente inteligente. Ele responde dúvidas sobre configuração, relay, afiliado e
                muito mais — a qualquer hora.
              </p>
              <p className="text-xs text-brand-600 mt-2 font-medium">💬 Disponível 24h/7 dias</p>
            </div>
          </div>
        </div>

        {/* Suporte humano */}
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Suporte humano</h2>
              <p className="text-sm text-gray-600 mt-1">
                Para questões complexas, cobrança ou problemas técnicos, fale com nossa equipe pelo
                WhatsApp. Atendimento de segunda a sexta, das 9h às 18h.
              </p>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary mt-3 text-sm inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
