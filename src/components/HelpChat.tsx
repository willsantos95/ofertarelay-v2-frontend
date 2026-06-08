import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';

interface Mensagem {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  ts: Date;
}

interface HistoricoItem {
  role: 'user' | 'assistant';
  content: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SUGESTOES = [
  'Como conectar meu WhatsApp?',
  'Como funciona o relay de grupos?',
  'Como configurar minhas credenciais de afiliado?',
  'Como usar a legenda com IA?',
];

function gerarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatarHora(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function HelpChat() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 'intro',
      role: 'assistant',
      content: 'Oi! 👋 Sou o assistente do OfertaRelay. Pode me perguntar qualquer coisa sobre a plataforma — configuração, relay, afiliado, agendamento... é só falar!',
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [disponivel, setDisponivel] = useState(true);
  const [pontoPulsante, setPontoPulsante] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verifica disponibilidade do chat.
  // Só esconde o widget se a API responder explicitamente { disponivel: false }.
  // Em caso de erro de rede (backend fora, CORS), mantém visível — o usuário
  // verá o erro 503 ao tentar enviar a primeira mensagem.
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/ajuda/status`)
      .then((r) => r.json())
      .then((d: { disponivel?: boolean }) => {
        if (d.disponivel === false) setDisponivel(false);
      })
      .catch(() => { /* mantém disponivel=true */ });
  }, []);

  // Para o ponto pulsante após abrir uma vez
  useEffect(() => {
    if (aberto) setPontoPulsante(false);
  }, [aberto]);

  // Auto-scroll para o fim
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, carregando]);

  // Focus no input ao abrir
  useEffect(() => {
    if (aberto) setTimeout(() => inputRef.current?.focus(), 100);
  }, [aberto]);

  const historico = (): HistoricoItem[] =>
    mensagens
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  async function enviar(texto: string) {
    if (!texto.trim() || carregando) return;

    const msgUsuario: Mensagem = {
      id: gerarId(),
      role: 'user',
      content: texto.trim(),
      ts: new Date(),
    };
    setMensagens((prev) => [...prev, msgUsuario]);
    setInput('');
    setCarregando(true);

    try {
      const resp = await fetch(`${API_BASE}/api/v1/ajuda/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mensagem: texto.trim(),
          historico: historico(),
        }),
      });

      const data = await resp.json() as { sucesso?: boolean; resposta?: string; erro?: { mensagem?: string } };

      if (data.sucesso && data.resposta) {
        setMensagens((prev) => [
          ...prev,
          { id: gerarId(), role: 'assistant', content: data.resposta!, ts: new Date() },
        ]);
      } else {
        throw new Error(data.erro?.mensagem || 'Resposta inválida');
      }
    } catch (err) {
      setMensagens((prev) => [
        ...prev,
        {
          id: gerarId(),
          role: 'error',
          content: 'Não consegui processar sua mensagem agora. Tente novamente ou fale com o suporte via WhatsApp.',
          ts: new Date(),
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(input);
    }
  }

  if (!disponivel) return null;

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto((p) => !p)}
        aria-label="Abrir chat de suporte"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          aberto
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-brand-500 hover:bg-brand-600'
        }`}
      >
        {aberto ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {pontoPulsante && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white" />
            )}
          </>
        )}
      </button>

      {/* Painel do chat */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 overflow-hidden ${
          aberto ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="bg-brand-500 px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Assistente OfertaRelay</p>
            <p className="text-white/70 text-xs">Responde sobre a plataforma</p>
          </div>
          <div className="w-2 h-2 bg-green-300 rounded-full" title="Online" />
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
          {mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  m.role === 'user'
                    ? 'bg-brand-500'
                    : m.role === 'error'
                    ? 'bg-red-100'
                    : 'bg-gray-200'
                }`}
              >
                {m.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : m.role === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>

              {/* Balão */}
              <div
                className={`max-w-[76%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : m.role === 'error'
                    ? 'bg-red-50 text-red-700 rounded-tl-sm border border-red-100'
                    : 'bg-white text-gray-800 shadow-sm rounded-tl-sm border border-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    m.role === 'user' ? 'text-white/60 text-right' : 'text-gray-400'
                  }`}
                >
                  {formatarHora(m.ts)}
                </p>
              </div>
            </div>
          ))}

          {/* Indicador de digitação */}
          {carregando && (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Sugestões rápidas — só aparecem na abertura */}
        {mensagens.length === 1 && !carregando && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5 shrink-0">
            {SUGESTOES.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="text-xs bg-white border border-gray-200 text-gray-700 rounded-full px-2.5 py-1 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida..."
            disabled={carregando}
            maxLength={1000}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50 transition-all"
          />
          <button
            onClick={() => enviar(input)}
            disabled={!input.trim() || carregando}
            aria-label="Enviar mensagem"
            className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {carregando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
