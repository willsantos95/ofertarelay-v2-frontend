import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Smartphone, Link2, ShoppingBag,
  CalendarClock, Bot, ChevronRight, ArrowRight,
  AlertTriangle, Lightbulb, CheckCircle2,
} from 'lucide-react';

// ─── Blocos de conteúdo reutilizáveis ────────────────────────────────────────

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 my-3">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 leading-relaxed">{children}</p>
    </div>
  );
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 my-3">
      <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      <p className="text-sm text-blue-800 leading-relaxed">{children}</p>
    </div>
  );
}

function Sucesso({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl p-3 my-3">
      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
      <p className="text-sm text-green-800 leading-relaxed">{children}</p>
    </div>
  );
}

function Passo({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
          {n}
        </div>
        <div className="w-px flex-1 bg-gray-200" />
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <p className="font-semibold text-gray-800 text-sm mb-2">{titulo}</p>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card mb-4">
      <h2 className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">{titulo}</h2>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

// ─── Conteúdo dos artigos ─────────────────────────────────────────────────────

interface Artigo {
  titulo: string;
  subtitulo: string;
  icon: React.ElementType;
  cor: string;
  proximoSlug?: string;
  proximoTitulo?: string;
  conteudo: React.ReactNode;
}

const ARTIGOS: Record<string, Artigo> = {

  // ── Primeiros Passos ──────────────────────────────────────────────────────
  'primeiros-passos': {
    titulo: 'Como começar do zero',
    subtitulo: 'Siga esses passos na ordem e você estará pronto em 15 minutos',
    icon: Zap,
    cor: 'bg-brand-100 text-brand-600',
    proximoSlug: 'conectar-whatsapp',
    proximoTitulo: 'Conectando o WhatsApp',
    conteudo: (
      <>
        <Secao titulo="Antes de começar — o que você vai precisar">
          <ul className="space-y-2">
            <li className="flex gap-2"><span>📱</span><span>Um celular ou computador com acesso à internet</span></li>
            <li className="flex gap-2"><span>📞</span><span>Um número de WhatsApp <strong>dedicado</strong> (não pode ser o seu número pessoal — pode ser um chip novo de qualquer operadora)</span></li>
            <li className="flex gap-2"><span>👥</span><span>Pelo menos um grupo de WhatsApp de outros criadores que você já faz parte (para monitorar)</span></li>
            <li className="flex gap-2"><span>📢</span><span>Pelo menos um grupo seu para enviar as ofertas</span></li>
          </ul>
          <Dica>Ainda não tem grupos? Você pode criar um grupo de teste com você mesmo por enquanto, só para ver funcionando.</Dica>
        </Secao>

        <Secao titulo="Passo a passo">
          <div className="space-y-0">
            <Passo n={1} titulo="Crie sua conta no OfertaRelay">
              <p>Clique em <strong>Criar conta</strong> na tela de login, preencha seu nome, e-mail e senha e confirme.</p>
              <p>Você receberá um e-mail de confirmação — clique no link dentro dele para ativar sua conta.</p>
              <Dica>Não achou o e-mail? Verifique a pasta de Spam ou Promoções.</Dica>
            </Passo>

            <Passo n={2} titulo="Conecte o número de WhatsApp dedicado">
              <p>No menu lateral, clique em <strong>WhatsApp</strong>. Depois clique em <strong>"Criar instância"</strong>.</p>
              <p>Vai aparecer um <strong>QR Code</strong> na tela — é aquele quadradinho cheio de bolinhas. Você precisa escanear ele com o celular do número dedicado.</p>
              <p>No WhatsApp desse celular: toque em <strong>Menu → Dispositivos conectados → Conectar dispositivo</strong> e aponte a câmera para o QR Code da tela.</p>
              <Sucesso>Quando funcionar, o status vai mudar para "Conectado" com um círculo verde.</Sucesso>
              <p>Não sabe como fazer isso? Veja o guia completo em <Link to="/app/help/conectar-whatsapp" className="text-brand-600 underline">Conectando o WhatsApp</Link>.</p>
            </Passo>

            <Passo n={3} titulo="Configure seus grupos de origem e destino">
              <p>Clique em <strong>Grupos</strong> no menu lateral. Depois clique em <strong>"Atualizar grupos"</strong> — o sistema vai buscar todos os grupos do WhatsApp conectado.</p>
              <p>Agora você vai ver a lista de grupos. Para cada um, você precisa dizer se ele é:</p>
              <ul className="mt-2 space-y-1 ml-2">
                <li>🔵 <strong>Origem</strong> — grupos de outros criadores que você quer monitorar</li>
                <li>🟢 <strong>Destino</strong> — seus próprios grupos para onde as ofertas vão</li>
                <li>⬜ <strong>Nenhum</strong> — grupos que você não quer usar</li>
              </ul>
              <Aviso>Coloque como "Destino" apenas grupos que são seus. Não coloque grupos de outras pessoas como destino — você vai enviar mensagens lá sem permissão.</Aviso>
            </Passo>

            <Passo n={4} titulo="Configure suas credenciais de afiliado">
              <p>Clique em <strong>Afiliado → Configurações</strong> no menu lateral.</p>
              <p>Aqui você vai colocar as informações da sua conta de afiliado da Shopee e/ou do Mercado Livre. Sem isso, o sistema não consegue gerar os seus links.</p>
              <p>Não sabe como pegar essas credenciais? Veja o guia <Link to="/app/help/configurar-afiliado" className="text-brand-600 underline">Configurando seus links de afiliado</Link>.</p>
            </Passo>

            <Passo n={5} titulo="Pronto! O relay está ativo">
              <p>Com tudo configurado, o OfertaRelay já começa a funcionar automaticamente.</p>
              <p>Quando alguém postar uma oferta em um dos seus grupos de origem, em segundos a oferta vai chegar nos seus grupos de destino — com o seu link de afiliado.</p>
              <Sucesso>Para ver o que está acontecendo, clique em <strong>Histórico → Relay Logs</strong>. Lá você vê cada oferta que foi processada.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="Deu algum problema?">
          <div className="space-y-3">
            {[
              { p: 'Não recebi o e-mail de confirmação', r: 'Verifique a pasta de Spam, Promoções ou Lixo eletrônico. Se não achar, tente cadastrar novamente com o mesmo e-mail.' },
              { p: 'O QR Code expirou antes de eu escanear', r: 'Não tem problema — clique em "Gerar novo QR Code" e tente de novo. O QR Code expira em alguns minutos.' },
              { p: 'Não apareceram meus grupos ao clicar em Atualizar', r: 'Verifique se o WhatsApp está com o status "Conectado" (círculo verde). Se não estiver, reconecte primeiro.' },
              { p: 'O grupo que quero monitorar não aparece na lista', r: 'Certifique-se de que o número dedicado é membro desse grupo no WhatsApp. O OfertaRelay só lista grupos onde o número está.' },
            ].map((item) => (
              <div key={item.p} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800 text-sm">❓ {item.p}</p>
                <p className="text-gray-600 text-sm mt-1">{item.r}</p>
              </div>
            ))}
          </div>
        </Secao>
      </>
    ),
  },

  // ── Conectar WhatsApp ─────────────────────────────────────────────────────
  'conectar-whatsapp': {
    titulo: 'Conectando o WhatsApp',
    subtitulo: 'Como parear um número dedicado e manter a conexão ativa',
    icon: Smartphone,
    cor: 'bg-green-100 text-green-600',
    proximoSlug: 'configurar-afiliado',
    proximoTitulo: 'Configurando seus links de afiliado',
    conteudo: (
      <>
        <Secao titulo="Por que precisa de um número separado?">
          <p>O OfertaRelay precisa ficar conectado ao WhatsApp <strong>24 horas por dia</strong>. Se você usar o seu número pessoal, vai precisar deixar o celular sempre ligado e conectado ao sistema — o que é impraticável e arriscado (pode perder o acesso à sua conta pessoal).</p>
          <p className="mt-2">Com um número dedicado, você usa um chip barato só para isso. Se algo der errado, não afeta em nada o seu WhatsApp pessoal.</p>
          <Dica>Chips de operadoras como Claro, Tim ou Vivo ficam entre R$10 e R$30. Você não precisa de nenhum plano — só precisa ativar o número para ter acesso ao WhatsApp.</Dica>
        </Secao>

        <Secao titulo="Como conectar o WhatsApp — passo a passo">
          <div className="space-y-0">
            <Passo n={1} titulo='Abra a tela de WhatsApp no OfertaRelay'>
              <p>No menu lateral esquerdo, clique em <strong>WhatsApp</strong>.</p>
            </Passo>

            <Passo n={2} titulo="Crie uma nova instância">
              <p>Clique no botão <strong>"Criar instância"</strong>.</p>
              <p>Dê um nome para essa conexão (pode ser "principal", "oferta1" — qualquer nome).</p>
              <p>Um <strong>QR Code</strong> vai aparecer na tela — é aquele código quadrado cheio de bolinhas pretas e brancas.</p>
              <Aviso>Você tem cerca de 1 minuto para escanear o QR Code antes dele expirar. Se expirar, clique em "Gerar novo QR Code".</Aviso>
            </Passo>

            <Passo n={3} titulo="Abra o WhatsApp no celular do número dedicado">
              <p>Pega o celular que tem o número dedicado instalado.</p>
              <p>Abra o WhatsApp e toque no ícone de <strong>três pontinhos</strong> (Android) ou em <strong>Configurações</strong> (iPhone).</p>
              <p>Toque em <strong>"Dispositivos conectados"</strong> → <strong>"Conectar dispositivo"</strong>.</p>
              <p>A câmera vai abrir. Aponte para o QR Code que está na tela do computador.</p>
              <Sucesso>Se tudo deu certo, na tela do OfertaRelay vai aparecer o status <strong>"Conectado"</strong> com um círculo verde. Isso pode levar até 30 segundos.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="Como saber se está funcionando">
          <p>Olhe o status da instância na tela de WhatsApp:</p>
          <div className="mt-3 space-y-2">
            <div className="flex gap-3 p-2 rounded-lg bg-green-50 border border-green-100">
              <span>🟢</span>
              <div><p className="font-medium text-sm text-green-800">Conectado</p><p className="text-xs text-green-700">Perfeito! O relay está ativo.</p></div>
            </div>
            <div className="flex gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-100">
              <span>🟡</span>
              <div><p className="font-medium text-sm text-yellow-800">Conectando</p><p className="text-xs text-yellow-700">Aguarde alguns segundos, está sincronizando.</p></div>
            </div>
            <div className="flex gap-3 p-2 rounded-lg bg-red-50 border border-red-100">
              <span>🔴</span>
              <div><p className="font-medium text-sm text-red-800">Desconectado</p><p className="text-xs text-red-700">Precisa reconectar. Veja o passo abaixo.</p></div>
            </div>
          </div>
        </Secao>

        <Secao titulo="E se o WhatsApp desconectar?">
          <p>Isso pode acontecer de vez em quando — é normal. O WhatsApp às vezes desconecta dispositivos automaticamente.</p>
          <p className="mt-2">Para reconectar:</p>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Clique em <strong>WhatsApp</strong> no menu</li>
            <li>Clique em <strong>"Reconectar"</strong> na instância</li>
            <li>Escaneie o QR Code novamente com o celular do número dedicado</li>
          </ol>
          <Dica>Se você perceber que as ofertas pararam de chegar, verifique primeiro se o WhatsApp está conectado — essa é a causa mais comum.</Dica>
        </Secao>

        <Secao titulo="Dicas para não ser banido">
          <p>O WhatsApp pode bloquear números que enviam muitas mensagens em pouco tempo. Aqui está o que você deve fazer (e não fazer):</p>
          <div className="mt-3 space-y-2">
            {[
              { ok: true,  txt: 'Use um número dedicado, nunca o seu pessoal' },
              { ok: true,  txt: 'Configure intervalos de pelo menos 30 minutos entre envios no Agendamento' },
              { ok: true,  txt: 'Mantenha o conteúdo variado e relevante para os grupos' },
              { ok: false, txt: 'Não envie mais de 10-15 mensagens por hora' },
              { ok: false, txt: 'Não use o mesmo número em outras ferramentas de automação ao mesmo tempo' },
              { ok: false, txt: 'Não envie a mesma mensagem repetida várias vezes' },
            ].map((d) => (
              <div key={d.txt} className={`flex gap-2 p-2 rounded-lg text-sm ${d.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <span>{d.ok ? '✅' : '❌'}</span>
                <span>{d.txt}</span>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo="Deu algum problema?">
          <div className="space-y-3">
            {[
              { p: 'O QR Code sumiu antes de eu escanear', r: 'Clique em "Gerar novo QR Code". Você tem cerca de 1 minuto para escanear.' },
              { p: 'Escaneei mas não mudou para Conectado', r: 'Espere 30 segundos e recarregue a página. Se continuar assim, tente gerar um novo QR Code.' },
              { p: 'O WhatsApp fica desconectando todo dia', r: 'Verifique se há instabilidade na internet do celular dedicado. Uma conexão Wi-Fi estável ajuda muito.' },
              { p: 'Apareceu a mensagem "instância já existe"', r: 'Você já criou uma instância antes. Não precisa criar de novo — só reconecte a existente.' },
            ].map((item) => (
              <div key={item.p} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800 text-sm">❓ {item.p}</p>
                <p className="text-gray-600 text-sm mt-1">{item.r}</p>
              </div>
            ))}
          </div>
        </Secao>
      </>
    ),
  },

  // ── Afiliado ──────────────────────────────────────────────────────────────
  'configurar-afiliado': {
    titulo: 'Configurando seus links de afiliado',
    subtitulo: 'Como criar sua conta de afiliado na Shopee e no Mercado Livre',
    icon: Link2,
    cor: 'bg-blue-100 text-blue-600',
    proximoSlug: 'sincronizar-ofertas',
    proximoTitulo: 'Buscando ofertas manualmente',
    conteudo: (
      <>
        <Secao titulo="O que é isso e por que preciso fazer?">
          <p>Para ganhar comissão quando alguém compra pelo link que você compartilhou, você precisa ser um <strong>afiliado oficial</strong> da loja.</p>
          <p className="mt-2">Pensa assim: você se cadastra como afiliado da Shopee e eles te dão um "código especial" que vai no link. Quando alguém compra usando aquele link, a Shopee vê que foi você quem indicou e deposita a comissão na sua conta.</p>
          <p className="mt-2">O OfertaRelay precisa dessas informações para colocar automaticamente o seu código em todos os links das ofertas.</p>
          <Dica>Você pode configurar Shopee, Mercado Livre, ou os dois. Configure pelo menos um para o relay funcionar com links de afiliado.</Dica>
        </Secao>

        <Secao titulo="Configurando a Shopee — passo a passo">
          <div className="space-y-0">
            <Passo n={1} titulo="Crie uma conta no Shopee Open Platform">
              <p>Abra uma nova aba no navegador e acesse: <a href="https://open.shopee.com" target="_blank" rel="noreferrer" className="text-brand-600 underline font-medium">open.shopee.com</a></p>
              <p>Clique em <strong>"Sign Up"</strong> (Cadastrar) e crie uma conta. Se já tem conta Shopee, pode entrar com ela.</p>
            </Passo>

            <Passo n={2} titulo="Crie um aplicativo">
              <p>Depois de entrar, clique em <strong>"My Apps"</strong> → <strong>"Create App"</strong>.</p>
              <p>Preencha o nome do app (pode colocar "OfertaRelay") e confirme.</p>
              <p>Vai aparecer uma página com as informações do app.</p>
            </Passo>

            <Passo n={3} titulo='Copie o "App ID" e o "App Secret"'>
              <p>Você vai ver dois campos importantes:</p>
              <ul className="mt-1 space-y-1">
                <li>📋 <strong>App ID</strong> — um número (ex: 1234567)</li>
                <li>🔑 <strong>App Secret</strong> — uma sequência longa de letras e números</li>
              </ul>
              <p className="mt-2">Copie os dois — você vai precisar colar no OfertaRelay.</p>
              <Aviso>Nunca compartilhe o App Secret com ninguém. É como a senha da sua conta de afiliado.</Aviso>
            </Passo>

            <Passo n={4} titulo="Cole as credenciais no OfertaRelay">
              <p>Volte para o OfertaRelay e clique em <strong>Afiliado → Configurações</strong>.</p>
              <p>Na aba <strong>Shopee</strong>, cole o App ID e o App Secret nos campos indicados.</p>
              <p>Clique em <strong>"Testar"</strong> — se aparecer ✅, está correto!</p>
              <p>Clique em <strong>"Salvar"</strong>.</p>
              <Sucesso>Pronto! O OfertaRelay já pode gerar seus links de afiliado da Shopee automaticamente.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="Configurando o Mercado Livre — passo a passo">
          <div className="space-y-0">
            <Passo n={1} titulo="Acesse o programa de afiliados do ML">
              <p>Abra uma nova aba e acesse: <a href="https://www.mercadolibre.com/afiliados" target="_blank" rel="noreferrer" className="text-brand-600 underline font-medium">mercadolibre.com/afiliados</a></p>
              <p>Entre com sua conta do Mercado Livre. Se não tiver, crie uma (é gratuito).</p>
            </Passo>

            <Passo n={2} titulo="Encontre seu Publisher ID">
              <p>Após entrar, procure por <strong>Publisher ID</strong> ou <strong>ID de Afiliado</strong> no seu painel.</p>
              <p>É um número como "12345678". Copie ele.</p>
            </Passo>

            <Passo n={3} titulo="Cole no OfertaRelay">
              <p>No OfertaRelay, vá em <strong>Afiliado → Configurações → Mercado Livre</strong>.</p>
              <p>Cole o Publisher ID no campo indicado e clique em <strong>"Salvar"</strong>.</p>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="Deu algum problema?">
          <div className="space-y-3">
            {[
              { p: 'Cliquei em Testar e apareceu erro', r: 'Verifique se copiou o App ID e App Secret corretamente — sem espaços extras no começo ou no fim. Tente copiar novamente diretamente do Shopee Open Platform.' },
              { p: 'Não achei o App Secret no Shopee', r: 'Ele aparece na página de detalhes do app. Se não aparecer, procure por "Manage Apps" → clique no app que criou → "App Information".' },
              { p: 'Não encontrei o Publisher ID do ML', r: 'Dentro do painel de afiliados, procure em "Minha conta" ou "Perfil". Também pode aparecer como "ID do Publisher".' },
              { p: 'O botão Testar fica carregando mas não responde', r: 'Verifique sua conexão com a internet. Se o problema continuar, entre em contato com o suporte.' },
            ].map((item) => (
              <div key={item.p} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800 text-sm">❓ {item.p}</p>
                <p className="text-gray-600 text-sm mt-1">{item.r}</p>
              </div>
            ))}
          </div>
        </Secao>
      </>
    ),
  },

  // ── Sincronizar Ofertas ───────────────────────────────────────────────────
  'sincronizar-ofertas': {
    titulo: 'Buscando ofertas manualmente',
    subtitulo: 'Como trazer ofertas da Shopee e do Mercado Livre para revisar e enviar',
    icon: ShoppingBag,
    cor: 'bg-orange-100 text-orange-600',
    proximoSlug: 'agendamento',
    proximoTitulo: 'Programando envios automáticos',
    conteudo: (
      <>
        <Secao titulo="O que é isso?">
          <p>Além do relay automático (que fica de olho nos grupos de outros criadores), você também pode <strong>buscar ofertas manualmente</strong> das plataformas e enviar quando quiser.</p>
          <p className="mt-2">É útil quando você quer:</p>
          <ul className="mt-2 space-y-1">
            <li>📋 Ver as ofertas antes de enviar</li>
            <li>✍️ Personalizar o texto de cada oferta</li>
            <li>🤖 Usar a IA para melhorar as mensagens</li>
            <li>📅 Agendar envios para momentos específicos</li>
          </ul>
        </Secao>

        <Secao titulo="Buscando ofertas da Shopee">
          <Aviso>Você precisa ter as credenciais da Shopee configuradas primeiro. Veja o guia <Link to="/app/help/configurar-afiliado" className="text-brand-600 underline">Configurando seus links de afiliado</Link>.</Aviso>
          <div className="space-y-0 mt-3">
            <Passo n={1} titulo="Abra a tela de Ofertas">
              <p>Clique em <strong>Ofertas</strong> no menu lateral.</p>
            </Passo>
            <Passo n={2} titulo="Clique em Sincronizar Shopee">
              <p>Clique no botão <strong>"Sincronizar Shopee"</strong>.</p>
              <p>O sistema vai buscar as melhores promoções do dia automaticamente. Pode levar alguns segundos.</p>
            </Passo>
            <Passo n={3} titulo="As ofertas vão aparecer na lista">
              <p>Cada oferta aparece com a foto do produto, nome, preço e desconto.</p>
              <Sucesso>Pronto! Agora você pode enviar manualmente, usar a IA ou agendar cada oferta.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="Buscando ofertas do Mercado Livre">
          <p>Para o Mercado Livre, você mesmo escolhe os produtos — o sistema extrai as informações automaticamente.</p>
          <div className="space-y-0 mt-3">
            <Passo n={1} titulo="Abra a tela de Ofertas e clique em Sincronizar ML">
              <p>Clique em <strong>Ofertas → Sincronizar Mercado Livre</strong>.</p>
            </Passo>
            <Passo n={2} titulo="Cole os links dos produtos">
              <p>Uma janela vai aparecer pedindo os links dos produtos.</p>
              <p>Abra o Mercado Livre numa aba separada, encontre um produto que você quer divulgar, copie a URL da página e cole aqui — um link por linha.</p>
              <Dica>Você pode colar vários links de uma vez, cada um numa linha. Exemplo:<br /><code className="bg-gray-100 px-1 rounded text-xs">https://www.mercadolivre.com.br/produto-1<br />https://www.mercadolivre.com.br/produto-2</code></Dica>
            </Passo>
            <Passo n={3} titulo="Confirme e aguarde">
              <p>Clique em <strong>Confirmar</strong>. O sistema vai extrair o nome, preço e foto de cada produto automaticamente.</p>
              <Sucesso>As ofertas aparecem na lista em alguns segundos.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="O que fazer com as ofertas depois?">
          <p>Em cada oferta na lista você pode:</p>
          <div className="mt-3 space-y-2">
            {[
              { emoji: '📤', acao: 'Enviar agora', desc: 'Manda imediatamente para seus grupos de WhatsApp ou Telegram' },
              { emoji: '🤖', acao: 'Melhorar com IA', desc: 'A IA reescreve o texto para ficar mais persuasivo e informal' },
              { emoji: '📅', acao: 'Agendar', desc: 'Entra na fila para ser enviada automaticamente depois' },
              { emoji: '🔗', acao: 'Gerar link afiliado', desc: 'Gera ou atualiza seu link de afiliado para aquele produto' },
              { emoji: '✅', acao: 'Marcar como enviada', desc: 'Para você controlar o que já foi enviado' },
            ].map((a) => (
              <div key={a.acao} className="flex gap-3 p-2 bg-gray-50 rounded-xl">
                <span className="text-lg">{a.emoji}</span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{a.acao}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo="Deu algum problema?">
          <div className="space-y-3">
            {[
              { p: 'A sincronização da Shopee não trouxe nenhuma oferta', r: 'Verifique se as credenciais da Shopee estão configuradas corretamente em Afiliado → Configurações. Clique em "Testar" para confirmar.' },
              { p: 'O link do ML não foi reconhecido', r: 'Certifique-se de que é um link completo do produto (começa com "https://www.mercadolivre.com.br/..."). Links de busca não funcionam, só links de produto específico.' },
              { p: 'A foto do produto não apareceu', r: 'Alguns produtos do ML não têm foto pública disponível. Isso é normal — o produto ainda funciona para envio.' },
            ].map((item) => (
              <div key={item.p} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800 text-sm">❓ {item.p}</p>
                <p className="text-gray-600 text-sm mt-1">{item.r}</p>
              </div>
            ))}
          </div>
        </Secao>
      </>
    ),
  },

  // ── Agendamento ───────────────────────────────────────────────────────────
  agendamento: {
    titulo: 'Programando envios automáticos',
    subtitulo: 'Como deixar o sistema enviando ofertas sozinho, no horário certo',
    icon: CalendarClock,
    cor: 'bg-purple-100 text-purple-600',
    proximoSlug: 'legenda-ia',
    proximoTitulo: 'Melhorando textos com IA',
    conteudo: (
      <>
        <Secao titulo="O que é o agendamento?">
          <p>Pensa assim: você tem 20 ofertas que quer enviar para seus grupos ao longo do dia. Sem o agendamento, você precisaria ficar lembrando de entrar e enviar manualmente.</p>
          <p className="mt-2">Com o agendamento, você adiciona as 20 ofertas de uma vez e diz <em>"manda uma a cada hora"</em>. O sistema faz o resto — você fica livre para fazer outra coisa.</p>
          <Dica>O agendamento é ótimo para manter seus grupos sempre ativos, mesmo quando você está dormindo ou trabalhando em outra coisa.</Dica>
        </Secao>

        <Secao titulo="Configurando o intervalo entre envios">
          <div className="space-y-0">
            <Passo n={1} titulo="Abra as configurações do agendamento">
              <p>Clique em <strong>Agendamento</strong> no menu, depois em <strong>Configurações</strong>.</p>
            </Passo>
            <Passo n={2} titulo="Defina o intervalo">
              <p>No campo <strong>"Intervalo entre envios"</strong>, coloque o número de minutos que você quer esperar entre um envio e o próximo.</p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex gap-2 p-2 bg-gray-50 rounded-lg"><span>💡</span><span><strong>30 minutos</strong> — bom ponto de partida, parece natural</span></div>
                <div className="flex gap-2 p-2 bg-gray-50 rounded-lg"><span>💡</span><span><strong>60 minutos</strong> — recomendado para grupos maiores</span></div>
                <div className="flex gap-2 p-2 bg-gray-50 rounded-lg"><span>⚠️</span><span><strong>Menos de 10 minutos</strong> — cuidado, pode parecer spam</span></div>
              </div>
            </Passo>
            <Passo n={3} titulo="Salve">
              <p>Clique em <strong>Salvar</strong>.</p>
              <Sucesso>Configuração salva! Agora é só adicionar ofertas à fila.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="Adicionando ofertas à fila">
          <div className="space-y-0">
            <Passo n={1} titulo="Abra o Agendamento">
              <p>Clique em <strong>Agendamento</strong> no menu e depois em <strong>"Adicionar ofertas"</strong>.</p>
            </Passo>
            <Passo n={2} titulo="Selecione as ofertas">
              <p>Vai aparecer a lista das suas ofertas. Marque as que você quer incluir na fila.</p>
            </Passo>
            <Passo n={3} titulo="Confirme">
              <p>Clique em <strong>Adicionar à fila</strong>. As ofertas entram na fila na ordem que você selecionou.</p>
              <Sucesso>A partir de agora o sistema envia uma oferta por vez, esperando o intervalo configurado entre cada envio.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="Como acompanhar a fila">
          <p>Na tela de Agendamento você vê cada oferta com o status:</p>
          <div className="mt-3 space-y-2">
            <div className="flex gap-3 p-2 bg-yellow-50 rounded-xl border border-yellow-100 text-sm">
              <span>⏳</span><span><strong>Pendente</strong> — aguardando para ser enviada</span>
            </div>
            <div className="flex gap-3 p-2 bg-green-50 rounded-xl border border-green-100 text-sm">
              <span>✅</span><span><strong>Enviado</strong> — já foi enviado com sucesso</span>
            </div>
            <div className="flex gap-3 p-2 bg-red-50 rounded-xl border border-red-100 text-sm">
              <span>❌</span><span><strong>Erro</strong> — não foi possível enviar. Verifique se o WhatsApp está conectado.</span>
            </div>
          </div>
        </Secao>

        <Secao titulo="Deu algum problema?">
          <div className="space-y-3">
            {[
              { p: 'As ofertas ficam como "Pendente" e nunca são enviadas', r: 'Verifique se o WhatsApp está conectado (status verde). Sem WhatsApp conectado, os envios não acontecem.' },
              { p: 'Quero remover uma oferta da fila antes de ser enviada', r: 'Na tela de Agendamento, clique no ícone de lixeira ao lado do item que quer remover.' },
              { p: 'Quero limpar a fila toda de uma vez', r: 'Em Agendamento, clique em "Limpar fila" e confirme. Isso remove todos os itens pendentes.' },
              { p: 'Posso mudar o intervalo depois de ter itens na fila?', r: 'Sim. A mudança de intervalo vale a partir do próximo envio.' },
            ].map((item) => (
              <div key={item.p} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800 text-sm">❓ {item.p}</p>
                <p className="text-gray-600 text-sm mt-1">{item.r}</p>
              </div>
            ))}
          </div>
        </Secao>
      </>
    ),
  },

  // ── Legenda com IA ────────────────────────────────────────────────────────
  'legenda-ia': {
    titulo: 'Melhorando textos com IA',
    subtitulo: 'Como fazer a inteligência artificial reescrever suas mensagens de oferta',
    icon: Bot,
    cor: 'bg-pink-100 text-pink-600',
    conteudo: (
      <>
        <Secao titulo="O que é isso?">
          <p>Toda oferta tem um texto padrão — o nome do produto, o preço e o link. Esse texto funciona, mas pode parecer frio ou robótico.</p>
          <p className="mt-2">A função de <strong>Legenda com IA</strong> pega esse texto e reescreve de um jeito mais animado, informal e persuasivo — como se você mesmo tivesse escrito para um amigo:</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-400 mb-2">ANTES (texto padrão)</p>
              <p className="font-mono text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{`🛍️ *Fone JBL Tune 510BT*

_Vendido na Shopee_

💰 Por *R$ 189*
🛒 https://shope.ee/xxxxx`}</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <p className="text-xs font-semibold text-brand-400 mb-2">DEPOIS (com IA)</p>
              <p className="font-mono text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{`🔥 Véi, achei esse JBL por R$ 189!

_Promoção na Shopee_ — corre antes de acabar!

🎧 40h de bateria · som incrível
🛒 https://shope.ee/xxxxx`}</p>
            </div>
          </div>
          <Dica>O link e o preço são sempre mantidos exatamente iguais — a IA só muda o texto ao redor.</Dica>
        </Secao>

        <Secao titulo="Como usar — passo a passo">
          <div className="space-y-0">
            <Passo n={1} titulo="Abra a tela de Ofertas">
              <p>Clique em <strong>Ofertas</strong> no menu lateral.</p>
            </Passo>
            <Passo n={2} titulo="Clique em Melhorar com IA">
              <p>Em qualquer oferta da lista, clique no botão <strong>"Melhorar legenda com IA"</strong> (ícone de estrela ou varinha mágica).</p>
            </Passo>
            <Passo n={3} titulo="Aguarde alguns segundos">
              <p>A IA processa em 3-5 segundos. O texto vai aparecer reescrito no campo de legenda.</p>
            </Passo>
            <Passo n={4} titulo="Revise e use">
              <p>Você pode usar o texto como está ou editar antes de enviar. Nada é salvo automaticamente — você precisa enviar ou agendar a oferta para usar a nova legenda.</p>
              <Sucesso>Pronto! Sua mensagem ficou muito mais natural e persuasiva.</Sucesso>
            </Passo>
          </div>
        </Secao>

        <Secao titulo="O que a IA nunca vai mudar">
          <p>A IA segue regras rígidas para não inventar nada sobre o produto:</p>
          <ul className="mt-3 space-y-2">
            {[
              'O link de afiliado — fica 100% igual, sem nenhuma alteração',
              'O preço — sem inventar descontos ou promoções que não existem',
              'O nome do produto — sem adicionar características falsas',
            ].map((t) => (
              <li key={t} className="flex gap-2 text-sm">
                <span className="text-green-500 shrink-0">✅</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Secao>

        <Secao titulo="Deu algum problema?">
          <div className="space-y-3">
            {[
              { p: 'O botão de IA não aparece', r: 'A função de IA precisa estar ativada no servidor. Se não aparecer, entre em contato com o suporte.' },
              { p: 'O resultado ficou estranho ou errado', r: 'Tente clicar em Melhorar com IA novamente — a IA gera um resultado diferente a cada vez. Se não gostar, edite manualmente o texto.' },
              { p: 'Apareceu a mensagem "Legenda obrigatória"', r: 'A oferta precisa ter pelo menos um texto de legenda antes de melhorar com IA. Clique em "Gerar legenda padrão" primeiro.' },
            ].map((item) => (
              <div key={item.p} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-800 text-sm">❓ {item.p}</p>
                <p className="text-gray-600 text-sm mt-1">{item.r}</p>
              </div>
            ))}
          </div>
        </Secao>
      </>
    ),
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HelpArticle() {
  const { slug } = useParams<{ slug: string }>();
  const artigo = slug ? ARTIGOS[slug] : null;

  if (!artigo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <p className="text-5xl">🔍</p>
        <p className="text-gray-500 text-base">Artigo não encontrado.</p>
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
        <span className="text-gray-600 font-medium">{artigo.titulo}</span>
      </div>

      {/* Header do artigo */}
      <div className="card mb-4 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${artigo.cor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{artigo.titulo}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{artigo.subtitulo}</p>
        </div>
      </div>

      {/* Conteúdo do artigo */}
      {artigo.conteudo}

      {/* Próximo passo */}
      {artigo.proximoSlug && (
        <div className="card bg-brand-50 border-brand-200 mt-2">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-2">Próximo passo</p>
          <Link
            to={`/app/help/${artigo.proximoSlug}`}
            className="flex items-center justify-between gap-2 group"
          >
            <p className="font-medium text-brand-700 group-hover:underline">{artigo.proximoTitulo}</p>
            <ArrowRight className="w-4 h-4 text-brand-500 shrink-0" />
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-gray-100">
        <Link to="/app/help" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar à Central de Ajuda
        </Link>
        <span className="hidden sm:block text-gray-200">|</span>
        <p className="text-xs text-gray-400">
          Ainda tem dúvidas? Clique no ícone de chat no canto inferior direito da tela.
        </p>
      </div>
    </>
  );
}
