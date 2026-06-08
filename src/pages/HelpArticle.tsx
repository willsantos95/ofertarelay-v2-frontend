import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Smartphone, Link2, ShoppingBag,
  CalendarClock, Bot, ChevronRight,
} from 'lucide-react';

// ─── Tipagem ──────────────────────────────────────────────────────────────────

interface Secao {
  titulo: string;
  conteudo: React.ReactNode;
}

interface Artigo {
  titulo: string;
  subtitulo: string;
  icon: React.ElementType;
  cor: string;
  secoes: Secao[];
}

// ─── Conteúdo dos artigos ─────────────────────────────────────────────────────

const ARTIGOS: Record<string, Artigo> = {
  'primeiros-passos': {
    titulo: 'Primeiros Passos',
    subtitulo: 'Configure sua conta e faça o primeiro relay em 10 minutos',
    icon: Zap,
    cor: 'bg-brand-100 text-brand-600',
    secoes: [
      {
        titulo: 'O que é o OfertaRelay?',
        conteudo: (
          <p>
            O OfertaRelay automatiza o trabalho de afiliados de grupos de ofertas. Ele monitora grupos de
            WhatsApp de outros criadores, captura as mensagens de oferta automaticamente,{' '}
            <strong>substitui o link pelo seu próprio link de afiliado</strong> e repassa para os seus
            grupos destino — tudo sem você tocar em nada.
          </p>
        ),
      },
      {
        titulo: 'Passo 1 — Crie sua conta',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse o site do OfertaRelay e clique em <strong>Criar conta</strong></li>
            <li>Preencha nome, e-mail e senha</li>
            <li>Verifique seu e-mail (link de ativação)</li>
            <li>Faça login</li>
          </ol>
        ),
      },
      {
        titulo: 'Passo 2 — Conecte seu WhatsApp',
        conteudo: (
          <>
            <ol className="list-decimal list-inside space-y-2 mb-3">
              <li>No menu lateral, clique em <strong>WhatsApp</strong></li>
              <li>Clique em <strong>Criar instância</strong></li>
              <li>Escaneie o QR Code com o WhatsApp do número dedicado</li>
              <li>Aguarde o status mudar para <span className="text-green-600 font-medium">Conectado</span></li>
            </ol>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              ⚠️ <strong>Importante:</strong> Use um número de WhatsApp exclusivo para automação.
              Não use seu número pessoal.
            </div>
          </>
        ),
      },
      {
        titulo: 'Passo 3 — Configure seus grupos',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Vá em <strong>Grupos</strong> no menu</li>
            <li>Clique em <strong>Atualizar grupos</strong> para sincronizar a lista</li>
            <li>Marque os grupos que você quer <strong>monitorar</strong> como <code className="bg-gray-100 px-1 rounded">Origem</code></li>
            <li>Marque os grupos onde quer <strong>enviar</strong> as ofertas como <code className="bg-gray-100 px-1 rounded">Destino</code></li>
          </ol>
        ),
      },
      {
        titulo: 'Passo 4 — Configure credenciais de afiliado',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Vá em <strong>Afiliado → Configurações</strong></li>
            <li>Para Shopee: insira <strong>App ID</strong> e <strong>App Secret</strong> do Shopee Partner</li>
            <li>Para Mercado Livre: insira seu <strong>Affiliate ID</strong></li>
            <li>Clique em <strong>Testar</strong> para verificar as credenciais</li>
            <li>Salve</li>
          </ol>
        ),
      },
      {
        titulo: 'Passo 5 — Pronto!',
        conteudo: (
          <p>
            O relay está ativo automaticamente. Toda oferta que aparecer nos seus grupos de origem
            será repassada para os grupos destino com o seu link de afiliado. Acompanhe em{' '}
            <strong>Histórico → Relay Logs</strong>.
          </p>
        ),
      },
    ],
  },

  'conectar-whatsapp': {
    titulo: 'Conectando o WhatsApp',
    subtitulo: 'QR Code, instâncias e dicas para evitar banimento',
    icon: Smartphone,
    cor: 'bg-green-100 text-green-600',
    secoes: [
      {
        titulo: 'Por que precisa de um número dedicado?',
        conteudo: (
          <p>
            O OfertaRelay controla o WhatsApp via Evolution API, o que significa que o número precisa
            estar conectado ao sistema 24h. Use um chip dedicado exclusivamente para automação —
            não o seu número pessoal, para evitar perder o acesso à sua conta principal.
          </p>
        ),
      },
      {
        titulo: 'Criando a instância',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse <strong>WhatsApp</strong> no menu lateral</li>
            <li>Clique em <strong>Criar instância</strong></li>
            <li>Dê um nome (ex: "ofertarelay-principal")</li>
            <li>Escaneie o QR Code no aplicativo do WhatsApp do número dedicado</li>
            <li>Aguarde o status ficar <span className="text-green-600 font-medium">Conectado</span></li>
          </ol>
        ),
      },
      {
        titulo: 'Status da instância',
        conteudo: (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Significado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-3 py-2">🟢 Conectado</td><td className="px-3 py-2">Funcionando normalmente</td></tr>
                <tr><td className="px-3 py-2">🟡 Conectando</td><td className="px-3 py-2">Aguardando conexão</td></tr>
                <tr><td className="px-3 py-2">🔴 Desconectado</td><td className="px-3 py-2">Reconecte escaneando o QR Code</td></tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        titulo: 'Se a instância desconectar',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse <strong>WhatsApp</strong> no menu</li>
            <li>Clique em <strong>Reconectar</strong></li>
            <li>Escaneie o QR Code novamente com o celular dedicado</li>
          </ol>
        ),
      },
      {
        titulo: 'Dicas para evitar banimento',
        conteudo: (
          <ul className="space-y-2 text-sm">
            {[
              { ok: true,  txt: 'Use um número dedicado (não pessoal)' },
              { ok: true,  txt: 'Ative o agendamento com intervalos de 30-60 min entre envios' },
              { ok: true,  txt: 'Mantenha o conteúdo relevante e variado' },
              { ok: false, txt: 'Não envie mensagens em excesso num curto período' },
              { ok: false, txt: 'Não use o número para outras automações simultaneamente' },
            ].map((d) => (
              <li key={d.txt} className="flex items-start gap-2">
                <span className={d.ok ? 'text-green-500' : 'text-red-500'}>
                  {d.ok ? '✅' : '❌'}
                </span>
                {d.txt}
              </li>
            ))}
          </ul>
        ),
      },
    ],
  },

  'configurar-afiliado': {
    titulo: 'Configurando Afiliado',
    subtitulo: 'Shopee Partner API e Mercado Livre — credenciais e logs',
    icon: Link2,
    cor: 'bg-blue-100 text-blue-600',
    secoes: [
      {
        titulo: 'Shopee Partner API',
        conteudo: (
          <>
            <p className="mb-3">Para gerar links de afiliado da Shopee automaticamente, você precisa de um App no Shopee Open Platform.</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Acesse <a href="https://open.shopee.com" target="_blank" rel="noreferrer" className="text-brand-600 underline">open.shopee.com</a></li>
              <li>Crie uma conta de desenvolvedor</li>
              <li>Crie um novo App</li>
              <li>Copie o <strong>App ID</strong> e o <strong>App Secret</strong></li>
              <li>Em <strong>Afiliado → Configurações → Shopee</strong>, cole as credenciais</li>
              <li>Clique em <strong>Testar</strong> para validar</li>
            </ol>
          </>
        ),
      },
      {
        titulo: 'Mercado Livre',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse o programa de afiliados do ML em <a href="https://www.mercadolibre.com/afiliados" target="_blank" rel="noreferrer" className="text-brand-600 underline">mercadolibre.com/afiliados</a></li>
            <li>Cadastre-se ou faça login</li>
            <li>Copie o seu <strong>Publisher ID</strong> (Affiliate ID)</li>
            <li>Em <strong>Afiliado → Configurações → Mercado Livre</strong>, cole o ID</li>
            <li>Salve</li>
          </ol>
        ),
      },
      {
        titulo: 'Acompanhando os logs',
        conteudo: (
          <p>
            Em <strong>Afiliado → Logs</strong> você vê cada link gerado, a plataforma, o contexto
            (relay, envio manual ou sincronização), se foi sucesso ou falha, e um resumo com
            porcentagem de sucesso. Filtre por plataforma, status ou contexto.
          </p>
        ),
      },
      {
        titulo: 'Posso usar só uma plataforma?',
        conteudo: (
          <p>
            Sim. Configure apenas as plataformas que você usa. O sistema ignora automaticamente
            plataformas sem credenciais configuradas.
          </p>
        ),
      },
    ],
  },

  'sincronizar-ofertas': {
    titulo: 'Sincronizando Ofertas',
    subtitulo: 'Buscar ofertas manualmente do Shopee e do Mercado Livre',
    icon: ShoppingBag,
    cor: 'bg-orange-100 text-orange-600',
    secoes: [
      {
        titulo: 'O que é a sincronização manual?',
        conteudo: (
          <p>
            Além do relay automático, você pode buscar ofertas manualmente das plataformas para
            revisar antes de enviar, usar a legenda com IA ou agendar para envio posterior.
          </p>
        ),
      },
      {
        titulo: 'Sincronizando do Shopee',
        conteudo: (
          <>
            <p className="mb-2 text-sm text-gray-500">Requer App ID e App Secret configurados em Afiliado → Configurações.</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Acesse <strong>Ofertas</strong></li>
              <li>Clique em <strong>Sincronizar Shopee</strong></li>
              <li>O sistema busca as melhores ofertas do dia automaticamente</li>
              <li>As ofertas aparecem na listagem com imagem, preço e desconto</li>
            </ol>
          </>
        ),
      },
      {
        titulo: 'Sincronizando do Mercado Livre',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse <strong>Ofertas</strong></li>
            <li>Clique em <strong>Sincronizar Mercado Livre</strong></li>
            <li>Informe as URLs dos produtos que deseja adicionar (uma por linha)</li>
            <li>O sistema extrai título, preço e imagem automaticamente</li>
          </ol>
        ),
      },
      {
        titulo: 'Filtros e controle de status',
        conteudo: (
          <p>
            Filtre por plataforma, categoria ou status (pendentes / já enviadas por você).
            O status "enviado" é individual por usuário — se outro usuário enviar a mesma oferta,
            ela ainda aparecerá como pendente para você.
          </p>
        ),
      },
    ],
  },

  agendamento: {
    titulo: 'Agendamento',
    subtitulo: 'Envios automáticos com intervalos configuráveis',
    icon: CalendarClock,
    cor: 'bg-purple-100 text-purple-600',
    secoes: [
      {
        titulo: 'O que é o agendamento?',
        conteudo: (
          <p>
            O agendamento enfileira ofertas para envio automático em intervalos regulares, sem que
            você precise estar online. Ideal para manter seus grupos ativos e distribuir os envios
            ao longo do dia de forma natural.
          </p>
        ),
      },
      {
        titulo: 'Configurando o intervalo',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse <strong>Agendamento → Configurações</strong></li>
            <li>Defina o intervalo mínimo entre envios (1 a 1440 minutos)</li>
            <li>Recomendado: <strong>30-60 minutos</strong> para parecer natural</li>
            <li>Salve</li>
          </ol>
        ),
      },
      {
        titulo: 'Adicionando ofertas à fila',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse <strong>Agendamento</strong></li>
            <li>Clique em <strong>Adicionar ofertas</strong></li>
            <li>Selecione as ofertas da lista</li>
            <li>Opcionalmente, personalize a legenda de cada uma</li>
            <li>Confirme — as ofertas entram na fila</li>
          </ol>
        ),
      },
      {
        titulo: 'Frequência recomendada por audiência',
        conteudo: (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Audiência</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Intervalo sugerido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-3 py-2">Grupos pequenos (&lt;100 pessoas)</td><td className="px-3 py-2">30-60 min</td></tr>
                <tr><td className="px-3 py-2">Grupos médios (100-500 pessoas)</td><td className="px-3 py-2">1-2 horas</td></tr>
                <tr><td className="px-3 py-2">Grupos grandes (500+ pessoas)</td><td className="px-3 py-2">2-4 horas</td></tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        titulo: 'O que acontece se o WhatsApp desconectar?',
        conteudo: (
          <p>
            Os envios pausam automaticamente. Quando você reconectar, a fila retoma de onde parou.
          </p>
        ),
      },
    ],
  },

  'legenda-ia': {
    titulo: 'Legenda com IA',
    subtitulo: 'GPT-4o-mini reescrevendo suas legendas para mais engajamento',
    icon: Bot,
    cor: 'bg-pink-100 text-pink-600',
    secoes: [
      {
        titulo: 'O que é?',
        conteudo: (
          <p>
            A <strong>Legenda com IA</strong> usa o GPT-4o-mini da OpenAI para reescrever a legenda
            das suas ofertas com um tom mais informal, animado e persuasivo — como um amigo do grupo
            que achou uma baita promoção e quer avisar todo mundo.
          </p>
        ),
      },
      {
        titulo: 'Como usar',
        conteudo: (
          <ol className="list-decimal list-inside space-y-2">
            <li>Na tela de <strong>Ofertas</strong>, encontre uma oferta</li>
            <li>Clique em <strong>Melhorar legenda com IA</strong></li>
            <li>Aguarde alguns segundos</li>
            <li>A legenda aparece reescrita no campo de texto</li>
            <li>Edite se quiser e então envie ou agende</li>
          </ol>
        ),
      },
      {
        titulo: 'Exemplo de resultado',
        conteudo: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="text-xs font-medium text-gray-400 mb-2">ANTES</p>
              <p className="font-mono whitespace-pre-wrap text-gray-700 text-xs leading-relaxed">
                {`🛍️ *Fone Bluetooth JBL Tune 510BT*\n\n_Vendido na Shopee_\n\n💰 Por *R$ 189*\n🛒 https://shope.ee/xxxxx`}
              </p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 text-sm border border-brand-100">
              <p className="text-xs font-medium text-brand-400 mb-2">DEPOIS</p>
              <p className="font-mono whitespace-pre-wrap text-gray-700 text-xs leading-relaxed">
                {`🔥 Véi, achei ESSE fone JBL por R$ 189 na Shopee!\n\n_Tá na promoção agora_ — corre!\n\n🎧 JBL Tune 510BT · bateria de 40h\n🛒 https://shope.ee/xxxxx`}
              </p>
            </div>
          </div>
        ),
      },
      {
        titulo: 'O que a IA preserva obrigatoriamente',
        conteudo: (
          <ul className="space-y-1 text-sm">
            {[
              'O link de afiliado (exatamente igual, sem encurtar)',
              'O preço (sem inventar promoções)',
              'O nome do produto',
              'A plataforma de origem',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="text-green-500">✅</span> {t}
              </li>
            ))}
          </ul>
        ),
      },
    ],
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HelpArticle() {
  const { slug } = useParams<{ slug: string }>();
  const artigo = slug ? ARTIGOS[slug] : null;

  if (!artigo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-400 text-lg mb-4">Artigo não encontrado.</p>
        <Link to="/app/help" className="btn btn-primary">Voltar à Central de Ajuda</Link>
      </div>
    );
  }

  const Icon = artigo.icon;

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <Link to="/app/help" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Central de Ajuda
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">{artigo.titulo}</span>
      </div>

      {/* Header do artigo */}
      <div className="card mb-6 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${artigo.cor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{artigo.titulo}</h1>
          <p className="text-sm text-gray-500 mt-1">{artigo.subtitulo}</p>
        </div>
      </div>

      {/* Seções */}
      <div className="space-y-4">
        {artigo.secoes.map((secao, i) => (
          <div key={i} className="card">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-brand-600">
              {secao.titulo}
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed">
              {secao.conteudo}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-gray-100">
        <Link to="/app/help" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar à Central de Ajuda
        </Link>
        <span className="hidden sm:block text-gray-200">|</span>
        <p className="text-xs text-gray-400">
          Ainda tem dúvidas? Use o chat de suporte no canto inferior direito da tela.
        </p>
      </div>
    </>
  );
}
