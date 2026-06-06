import PageHeader from '../components/PageHeader';
import { Zap, Smartphone, Link2, Send, MessageCircle } from 'lucide-react';

const FAQ = [
  { q: 'O WhatsApp pode ser banido?', r: 'Use um número dedicado à automação. Evite enviar conteúdo em excesso. O sistema foi projetado para funcionar dentro dos limites normais de uso.' },
  { q: 'Quanto tempo demora para configurar?', r: 'Em média 10 minutos: criar conta, conectar WhatsApp, configurar credenciais de afiliado e selecionar os grupos.' },
  { q: 'Quais lojas são suportadas?', r: 'Amazon, Shopee, Mercado Livre, Magalu e AliExpress. A automação processa apenas as lojas com credenciais configuradas.' },
  { q: 'O relay funciona 24h?', r: 'Sim. O n8n fica monitorando os grupos de origem continuamente. Enquanto o WhatsApp estiver conectado, o relay está ativo.' },
  { q: 'Posso ter mais de um grupo destino?', r: 'Sim, sem limite de grupos destino. Todas as ofertas serão replicadas para todos os grupos marcados como destino.' },
  { q: 'O Telegram é obrigatório?', r: 'Não. A integração com Telegram é opcional. Se não configurar, as ofertas vão apenas para os grupos WhatsApp destino.' },
];

export default function Help() {
  return (
    <>
      <PageHeader title="Ajuda" subtitle="Como funciona o OfertaRelay e respostas para dúvidas frequentes" />

      {/* Como funciona */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-5">Como funciona o relay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Smartphone, cor: 'bg-green-100 text-green-600', titulo: '1. WhatsApp monitora', desc: 'O bot fica online nos grupos de origem e detecta mensagens com links de ofertas.' },
            { icon: Link2,      cor: 'bg-blue-100 text-blue-600',   titulo: '2. Gera link afiliado', desc: 'Cada link detectado é convertido automaticamente para o link de afiliado da sua conta.' },
            { icon: Zap,        cor: 'bg-purple-100 text-purple-600', titulo: '3. Formata a mensagem', desc: 'A oferta é formatada com título, preço e link afiliado, pronta para envio.' },
            { icon: Send,       cor: 'bg-brand-100 text-brand-600',  titulo: '4. Envia destinos', desc: 'A mensagem é enviada para todos os grupos WhatsApp e canais Telegram configurados.' },
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

      {/* FAQ */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-5">Perguntas frequentes</h2>
        <div className="space-y-4">
          {FAQ.map((faq) => (
            <div key={faq.q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <p className="font-medium text-gray-800 text-sm">{faq.q}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{faq.r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suporte */}
      <div className="card bg-brand-50 border-brand-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Precisa de ajuda?</h2>
            <p className="text-sm text-gray-600 mt-1">Entre em contato com o suporte pelo WhatsApp. Atendemos de segunda a sexta, das 9h às 18h.</p>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-3 text-sm"
            >
              Falar com suporte
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
