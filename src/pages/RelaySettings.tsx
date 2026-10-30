import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

interface ConfigRelay {
  cabecalho: string;
  rodape: string;
  intervaloEnvioSeg: number;
  limiteDiario: number;
  janelaDedupHoras: number;
}

const PADRAO: ConfigRelay = { cabecalho: '', rodape: '', intervaloEnvioSeg: 5, limiteDiario: 0, janelaDedupHoras: 12 };

export default function RelaySettings() {
  const [cfg, setCfg] = useState<ConfigRelay>(PADRAO);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    api<{ setting: { payload: ConfigRelay } }>('/settings/relay')
      .then((r) => setCfg({ ...PADRAO, ...r.setting.payload }))
      .catch((e) => setErro((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true); setMsg(''); setErro('');
    try {
      const r = await api<{ mensagem: string; setting: { payload: ConfigRelay } }>('/settings/relay', {
        method: 'PUT', body: JSON.stringify(cfg),
      });
      setCfg(r.setting.payload);
      setMsg('Configurações salvas. O fluxo usa os novos valores na próxima oferta.');
    } catch (e) { setErro((e as Error).message); }
    finally { setSalvando(false); }
  }

  const num = (k: keyof ConfigRelay) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCfg({ ...cfg, [k]: e.target.value === '' ? 0 : Number(e.target.value) });

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <>
      <PageHeader title="Mensagens e envio" subtitle="Como as ofertas aparecem nos seus grupos e o ritmo dos envios" />
      <Alert message={erro} />
      <Alert type="success" message={msg} />

      <form onSubmit={salvar} className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <div className="flex flex-col gap-6">
          <div className="card flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900">Texto da mensagem</h2>
            <div>
              <label className="label" htmlFor="cab">Cabeçalho</label>
              <textarea id="cab" rows={2} maxLength={300} className="input" placeholder="🦫 CAPIVARA OFERTAS"
                value={cfg.cabecalho} onChange={(e) => setCfg({ ...cfg, cabecalho: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">Aparece antes de cada oferta. Deixe vazio para não usar.</p>
            </div>
            <div>
              <label className="label" htmlFor="rod">Rodapé</label>
              <textarea id="rod" rows={3} maxLength={500} className="input" placeholder="Convide amigos: ofertarelay.com.br/capivaraofertas"
                value={cfg.rodape} onChange={(e) => setCfg({ ...cfg, rodape: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">Aparece depois do link. Bom lugar para o link da sua página de grupos.</p>
            </div>
          </div>

          <div className="card flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900">Ritmo de envio</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="int">Intervalo entre grupos</label>
                <div className="flex items-center gap-2">
                  <input id="int" type="number" min={1} max={120} className="input" value={cfg.intervaloEnvioSeg} onChange={num('intervaloEnvioSeg')} />
                  <span className="text-sm text-gray-500">seg</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">De 1 a 120. Pausas maiores reduzem o risco de bloqueio.</p>
              </div>
              <div>
                <label className="label" htmlFor="lim">Limite por dia</label>
                <input id="lim" type="number" min={0} max={1000} className="input" value={cfg.limiteDiario} onChange={num('limiteDiario')} />
                <p className="text-xs text-gray-400 mt-1">Ofertas por dia. 0 = sem limite.</p>
              </div>
              <div>
                <label className="label" htmlFor="dup">Não repetir por</label>
                <div className="flex items-center gap-2">
                  <input id="dup" type="number" min={0} max={168} className="input" value={cfg.janelaDedupHoras} onChange={num('janelaDedupHoras')} />
                  <span className="text-sm text-gray-500">horas</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">A mesma oferta não é enviada de novo nesse período.</p>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={salvando} className="btn btn-primary">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </div>

        <div className="card lg:sticky lg:top-8">
          <p className="text-xs font-medium text-gray-400 mb-3">Prévia</p>
          <div className="rounded-xl bg-[#e7f6e1] p-3 text-sm text-gray-800 whitespace-pre-wrap break-words">
            {cfg.cabecalho && <p className="font-semibold mb-2">{cfg.cabecalho}</p>}
            <p>🔥 Fone Bluetooth com cancelamento de ruído</p>
            <p className="mt-1">💰 <s className="text-gray-500">R$ 199,90</s> por <b>R$ 89,90</b></p>
            <p className="mt-1 text-blue-700 underline">https://s.shopee.com.br/exemplo</p>
            {cfg.rodape && <p className="mt-2 text-gray-600">{cfg.rodape}</p>}
          </div>
        </div>
      </form>
    </>
  );
}
