import { useEffect, useState } from 'react';
import { Save, Loader2, Send } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

export default function TelegramSettings() {
  const [botToken, setBotToken] = useState('');
  const [chatIds, setChatIds]   = useState('');
  const [status, setStatus]     = useState<'active' | 'inactive'>('inactive');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [msg, setMsg]   = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    api<{ setting: { payload: { botToken?: string; chatIds?: string[]; status?: string } } }>('/settings/telegram')
      .then((r) => {
        const p = r.setting.payload;
        setBotToken(p.botToken || '');
        setChatIds(Array.isArray(p.chatIds) ? p.chatIds.join('\n') : '');
        setStatus((p.status as 'active' | 'inactive') || 'inactive');
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function parseChatIds(raw: string) {
    return raw.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  async function salvar() {
    setSaving(true); setMsg(''); setErro('');
    try {
      await api('/settings/telegram', {
        method: 'PUT',
        body: JSON.stringify({ botToken: botToken.trim(), chatIds: parseChatIds(chatIds), status }),
      });
      setMsg('Configuração do Telegram salva com sucesso!');
    } catch (e) { setErro((e as Error).message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  }

  async function testar() {
    if (!botToken.trim()) { setErro('Informe o Bot Token antes de testar.'); return; }
    const ids = parseChatIds(chatIds);
    if (ids.length === 0) { setErro('Informe ao menos um Chat ID.'); return; }
    setTesting(true); setMsg(''); setErro('');
    try {
      const r = await api<{ success: boolean; mensagem: string }>('/settings/telegram/test', {
        method: 'POST',
        body: JSON.stringify({ botToken: botToken.trim(), chatIds: ids }),
      });
      if (r.success) setMsg(r.mensagem);
      else setErro(r.mensagem);
    } catch (e) { setErro((e as Error).message || 'Erro ao testar conexão.'); }
    finally { setTesting(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <>
      <PageHeader title="Telegram" subtitle="Receba as ofertas relayadas em canais ou grupos do Telegram" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-5">Credenciais do Bot</h2>

          <Alert message={erro} />
          <Alert message={msg} type="success" />

          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Bot Token</label>
              <input
                type="password"
                className="input font-mono"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
              />
              <p className="text-xs text-gray-400 mt-1">Obtenha com o @BotFather no Telegram.</p>
            </div>

            <div>
              <label className="label">Chat IDs de destino</label>
              <textarea
                className="input font-mono text-xs resize-none"
                rows={5}
                value={chatIds}
                onChange={(e) => setChatIds(e.target.value)}
                placeholder={'@meucanal\n-100123456789\n@outrogrupo'}
              />
              <p className="text-xs text-gray-400 mt-1">Um por linha. Use @username ou ID numérico.</p>
            </div>

            <div>
              <label className="label">Status da integração</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Ativo — envia para o Telegram</option>
                <option value="inactive">Inativo — não envia</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={salvar} disabled={saving} className="btn btn-primary flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </button>
              <button onClick={testar} disabled={testing} className="btn btn-outline flex-1">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Testar
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Como configurar o bot</h2>
            <ol className="space-y-2 text-sm text-gray-600">
              {[
                'Abra o Telegram e pesquise por @BotFather.',
                'Envie /newbot e escolha um nome e username.',
                'O BotFather enviará o Bot Token — cole acima.',
                'Adicione o bot ao canal/grupo onde quer receber as ofertas.',
                'Promova o bot a Administrador do canal/grupo.',
                'Cole o Chat ID e clique em Testar.',
              ].map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-500 font-bold shrink-0">{i + 1}.</span> {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Como descobrir o Chat ID</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Canal público:</strong> use <code className="bg-gray-100 px-1 rounded">@username</code> do canal.</p>
              <p><strong>Grupo/canal privado:</strong> adicione <code className="bg-gray-100 px-1 rounded">@userinfobot</code> e envie qualquer mensagem — ele responde com o ID (ex: <code className="bg-gray-100 px-1 rounded">-100123456789</code>).</p>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h2 className="font-semibold text-gray-800 mb-2 text-sm">Como funciona</h2>
            <div className="text-xs text-gray-600 leading-relaxed">
              WhatsApp recebe a oferta<br />
              ↓ OfertaRelay gera o link de afiliado<br />
              ↓ Envia para os grupos WhatsApp destino<br />
              ↓ <strong>Envia também para os chats do Telegram</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
