import { useEffect, useRef, useState } from 'react';
import { Smartphone, RefreshCw, Loader2, CheckCircle2, QrCode, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

type Status = 'idle' | 'loading' | 'qr' | 'conectado' | 'erro';

interface ConnectResp {
  instancia?: { nome: string; telefone: string; status: string; qrcode?: string; codigoPareamento?: string };
}
interface StatusResp {
  conectado: boolean;
  status: string;
  instancia?: { nome: string; telefone: string };
}

export default function WhatsAppSettings() {
  const [telefone, setTelefone]     = useState('');
  const [fase, setFase]             = useState<Status>('idle');
  const [qrcode, setQrcode]         = useState('');
  const [pareamento, setPareamento] = useState('');
  const [instancia, setInstancia]   = useState<{ nome: string; telefone: string } | null>(null);
  const [msg, setMsg]   = useState('');
  const [erro, setErro] = useState('');
  const [desconectando, setDesconectando] = useState(false);
  const [excluindo, setExcluindo]         = useState(false);
  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function pararPolling() {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }

  useEffect(() => {
    api<StatusResp>('/whatsapp/status').then((r) => {
      if (r.conectado) { setFase('conectado'); setInstancia(r.instancia || null); }
      else if (r.status !== 'nao_criado') {
        // Existe instância mas não está conectada — mostrar estado idle para reconectar
        setInstancia(r.instancia || null);
      }
    }).catch(() => {});
    return () => pararPolling();
  }, []);

  function iniciarPolling() {
    pollingRef.current = setInterval(async () => {
      try {
        const r = await api<StatusResp>('/whatsapp/status');
        if (r.conectado) {
          pararPolling();
          setFase('conectado');
          setInstancia(r.instancia || null);
          setMsg('WhatsApp conectado com sucesso!');
        }
      } catch { /* continua tentando */ }
    }, 8000);
  }

  async function conectar() {
    if (!/^\d{10,15}$/.test(telefone)) { setErro('Digite apenas números (10 a 15 dígitos)'); return; }
    setErro(''); setMsg(''); setFase('loading');
    try {
      const r = await api<ConnectResp>('/whatsapp/conectar', { method: 'POST', body: JSON.stringify({ telefone }) });
      const inst = r.instancia;
      if (inst?.qrcode) {
        const qr = inst.qrcode.startsWith('data:') ? inst.qrcode : `data:image/png;base64,${inst.qrcode}`;
        setQrcode(qr);
        setPareamento(inst.codigoPareamento || '');
        setFase('qr');
        iniciarPolling();
      } else {
        setFase('erro'); setErro('Não foi possível gerar o QR code. Tente novamente.');
      }
    } catch (e) {
      setFase('erro');
      setErro((e as Error).message || 'Erro ao conectar. Tente novamente.');
    }
  }

  async function desconectar() {
    setDesconectando(true); setErro(''); setMsg('');
    try {
      await api('/whatsapp/desconectar', { method: 'POST' });
      pararPolling();
      setFase('idle');
      setQrcode('');
      setPareamento('');
      setMsg('WhatsApp desconectado com sucesso.');
    } catch (e) {
      setErro((e as Error).message || 'Erro ao desconectar.');
    } finally { setDesconectando(false); }
  }

  async function excluirDados() {
    setExcluindo(true); setErro(''); setMsg('');
    try {
      await api('/whatsapp/excluir', { method: 'POST' });
      pararPolling();
      setFase('idle');
      setInstancia(null);
      setQrcode('');
      setPareamento('');
      setTelefone('');
      setConfirmExcluir(false);
      setMsg('Dados do WhatsApp removidos com sucesso.');
    } catch (e) {
      setErro((e as Error).message || 'Erro ao excluir dados.');
    } finally { setExcluindo(false); }
  }

  return (
    <>
      <PageHeader title="WhatsApp" subtitle="Conecte seu número para iniciar o relay automático de ofertas" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de conexão */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Conexão</h2>
              <p className="text-xs text-gray-500">Escaneie o QR code com seu WhatsApp</p>
            </div>
          </div>

          <Alert message={erro} />
          <Alert message={msg} type="success" />

          {/* Status conectado */}
          {fase === 'conectado' && instancia && (
            <>
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-800">Conectado</p>
                  <p className="text-green-700 mt-0.5">Número: <strong>{instancia.telefone}</strong></p>
                  <p className="text-green-600 text-xs mt-0.5 truncate">{instancia.nome}</p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setFase('idle'); setMsg(''); pararPolling(); }}
                  className="btn btn-outline w-full"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reconectar com outro número
                </button>

                <button
                  onClick={desconectar}
                  disabled={desconectando}
                  className="btn btn-outline w-full text-amber-700 border-amber-200 hover:bg-amber-50"
                >
                  {desconectando ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  {desconectando ? 'Desconectando...' : 'Desconectar WhatsApp'}
                </button>

                <button
                  onClick={() => setConfirmExcluir(true)}
                  className="btn btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir dados do WhatsApp
                </button>
              </div>
            </>
          )}

          {/* QR code */}
          {fase === 'qr' && (
            <div className="flex flex-col items-center gap-3 my-4">
              <div className="border-2 border-gray-200 rounded-2xl p-3 bg-white">
                <img src={qrcode} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
              </div>
              {pareamento && (
                <p className="text-sm text-gray-600">
                  Código de pareamento: <strong className="font-mono tracking-widest">{pareamento}</strong>
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguardando scan...
              </div>
              <button onClick={() => { pararPolling(); setFase('idle'); }} className="btn btn-outline text-sm">
                Cancelar
              </button>
            </div>
          )}

          {/* Formulário de conexão */}
          {(fase === 'idle' || fase === 'erro') && (
            <div className="flex flex-col gap-3 mt-2">
              <div>
                <label className="label">Número de telefone</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="14999999999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ''))}
                  maxLength={15}
                />
                <p className="text-xs text-gray-400 mt-1">Apenas dígitos, sem espaços ou traços</p>
              </div>
              <button onClick={conectar} className="btn btn-primary py-2.5">
                <QrCode className="w-4 h-4" />
                Gerar QR code
              </button>

              {instancia && (
                <button
                  onClick={() => setConfirmExcluir(true)}
                  className="btn btn-outline w-full text-red-600 border-red-200 hover:bg-red-50 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir dados do WhatsApp
                </button>
              )}
            </div>
          )}

          {fase === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Gerando QR code...</span>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Como conectar</h2>
          <ol className="space-y-4 text-sm text-gray-600">
            {[
              'Digite o número do WhatsApp que deseja conectar.',
              'Clique em "Gerar QR code" e aguarde a imagem aparecer.',
              'Abra o WhatsApp no celular → Dispositivos conectados → Conectar dispositivo.',
              'Escaneie o QR code com a câmera do celular.',
              'Aguarde a confirmação de conexão — pode levar alguns segundos.',
            ].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 leading-relaxed">
            <strong>Atenção:</strong> Use um número dedicado para a automação. O WhatsApp conectado ficará ativo enquanto o relay estiver rodando.
          </div>

          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 leading-relaxed space-y-2">
            <p><strong>Desconectar:</strong> encerra a sessão mas mantém os dados e grupos configurados.</p>
            <p><strong>Excluir dados:</strong> remove a instância completamente, incluindo grupos configurados. Use quando quiser recomeçar do zero.</p>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmExcluir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="font-semibold text-gray-900">Excluir dados do WhatsApp?</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Esta ação irá remover a instância da Evolution API e apagar todos os grupos configurados. <strong>Não é possível desfazer.</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmExcluir(false)}
                disabled={excluindo}
                className="btn btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={excluirDados}
                disabled={excluindo}
                className="btn btn-danger flex-1"
              >
                {excluindo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
