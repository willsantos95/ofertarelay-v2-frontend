import { useEffect, useRef, useState } from 'react';
import { Smartphone, RefreshCw, Loader2, CheckCircle2, XCircle, QrCode } from 'lucide-react';
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
  const [telefone, setTelefone] = useState('');
  const [fase, setFase]         = useState<Status>('idle');
  const [qrcode, setQrcode]     = useState('');
  const [pareamento, setPareamento] = useState('');
  const [instancia, setInstancia]   = useState<{ nome: string; telefone: string } | null>(null);
  const [msg, setMsg]  = useState('');
  const [erro, setErro] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function pararPolling() {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }

  useEffect(() => {
    api<StatusResp>('/whatsapp/status').then((r) => {
      if (r.conectado) { setFase('conectado'); setInstancia(r.instancia || null); }
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
    if (!/^\d{10,15}$/.test(telefone)) {
      setErro('Digite apenas números (10 a 15 dígitos)');
      return;
    }
    setErro(''); setMsg(''); setFase('loading');
    try {
      const r = await api<ConnectResp>('/whatsapp/conectar', {
        method: 'POST',
        body: JSON.stringify({ telefone }),
      });
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
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-green-800">Conectado</p>
                <p className="text-green-700 mt-0.5">Número: <strong>{instancia.telefone}</strong></p>
                <p className="text-green-600 text-xs mt-0.5 truncate">{instancia.nome}</p>
              </div>
            </div>
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
            </div>
          )}

          {/* Formulário */}
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
            </div>
          )}

          {fase === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Gerando QR code...</span>
            </div>
          )}

          {fase === 'conectado' && (
            <button
              onClick={() => { setFase('idle'); setMsg(''); setInstancia(null); pararPolling(); }}
              className="btn btn-outline w-full mt-3 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reconectar com outro número
            </button>
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
        </div>
      </div>
    </>
  );
}
