import { useEffect, useState } from 'react';
import { RefreshCw, Save, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

const NICHOS = ['geral', 'pet', 'baby', 'fitness', 'home', 'electronics', 'fashion'];

interface GrupoCache {
  group_jid: string;
  group_name: string;
  participants_count: number | null;
  is_origin: boolean;
  is_destination: boolean;
  nicho: string;
}

interface GrupoSalvar {
  groupJid: string;
  nome: string;
  nicho: string;
}

export default function Groups() {
  const [grupos, setGrupos]       = useState<GrupoCache[]>([]);
  const [origem, setOrigem]       = useState<Map<string, string>>(new Map()); // jid → nicho
  const [destino, setDestino]     = useState<Map<string, string>>(new Map()); // jid → nicho
  const [syncing, setSyncing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]   = useState('');
  const [erro, setErro] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      const r = await api<{ sucesso: boolean; grupos: GrupoCache[] }>('/whatsapp/grupos/cache');
      const lista = r.grupos || [];
      setGrupos(lista);

      // Pré-selecionar grupos já configurados
      const novaOrigem  = new Map<string, string>();
      const novoDestino = new Map<string, string>();
      lista.forEach((g) => {
        if (g.is_origin)      novaOrigem.set(g.group_jid, g.nicho || 'geral');
        if (g.is_destination) novoDestino.set(g.group_jid, g.nicho || 'geral');
      });
      setOrigem(novaOrigem);
      setDestino(novoDestino);
    } catch (e) {
      setErro((e as Error).message || 'Erro ao carregar grupos');
    } finally { setLoading(false); }
  }

  async function sincronizar() {
    setSyncing(true); setErro(''); setMsg('');
    try {
      const r = await api<{ job: { id: string } }>('/whatsapp/grupos/sincronizar', { method: 'POST' });
      const jobId = r.job.id;

      await new Promise<void>((resolve) => {
        const iv = setInterval(async () => {
          try {
            const s = await api<{ job: { status: string } }>(`/whatsapp/grupos/status-sync?jobId=${jobId}`);
            if (s.job.status === 'concluido' || s.job.status === 'erro') { clearInterval(iv); resolve(); }
          } catch { clearInterval(iv); resolve(); }
        }, 3000);
        setTimeout(() => { clearInterval(iv); resolve(); }, 120000);
      });

      await carregar();
      setMsg('Grupos sincronizados com sucesso!');
    } catch (e) {
      setErro((e as Error).message || 'Erro ao sincronizar');
    } finally { setSyncing(false); }
  }

  async function salvar() {
    if (origem.size === 0)  { setErro('Selecione ao menos 1 grupo de origem.');  return; }
    if (destino.size === 0) { setErro('Selecione ao menos 1 grupo de destino.'); return; }

    setSaving(true); setErro(''); setMsg('');
    try {
      const nomeGrupo = (jid: string) => grupos.find((g) => g.group_jid === jid)?.group_name || jid;

      const gruposOrigem: GrupoSalvar[]  = Array.from(origem.entries()).map(([jid, nicho]) => ({ groupJid: jid, nome: nomeGrupo(jid), nicho }));
      const gruposDestino: GrupoSalvar[] = Array.from(destino.entries()).map(([jid, nicho]) => ({ groupJid: jid, nome: nomeGrupo(jid), nicho }));

      await api('/whatsapp/grupos/salvar', {
        method: 'POST',
        body: JSON.stringify({ gruposOrigem, gruposDestino }),
      });
      setMsg('Configuração salva com sucesso!');
      await carregar();
    } catch (e) {
      setErro((e as Error).message || 'Erro ao salvar');
    } finally { setSaving(false); }
  }

  function toggleOrigem(jid: string) {
    setOrigem((prev) => { const m = new Map(prev); m.has(jid) ? m.delete(jid) : m.set(jid, 'geral'); return m; });
  }
  function toggleDestino(jid: string) {
    setDestino((prev) => { const m = new Map(prev); m.has(jid) ? m.delete(jid) : m.set(jid, 'geral'); return m; });
  }
  function setNichoOrigem(jid: string, nicho: string) {
    setOrigem((prev) => { const m = new Map(prev); m.set(jid, nicho); return m; });
  }
  function setNichoDestino(jid: string, nicho: string) {
    setDestino((prev) => { const m = new Map(prev); m.set(jid, nicho); return m; });
  }

  useEffect(() => { carregar(); }, []);

  return (
    <>
      <PageHeader
        title="Grupos"
        subtitle="Defina quais grupos serão monitorados e para onde as ofertas serão enviadas"
        action={
          <div className="flex gap-2">
            <button onClick={sincronizar} disabled={syncing} className="btn btn-outline">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button onClick={salvar} disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        }
      />

      <Alert message={erro} />
      <Alert message={msg} type="success" />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : grupos.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-sm mb-2">Nenhum grupo encontrado no cache.</p>
          <p className="text-gray-400 text-xs mb-4">Certifique-se que o WhatsApp está conectado e clique em "Sincronizar".</p>
          <button onClick={sincronizar} disabled={syncing} className="btn btn-primary mx-auto">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizar grupos agora
          </button>
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 mb-4">{grupos.length} grupo{grupos.length !== 1 ? 's' : ''} encontrado{grupos.length !== 1 ? 's' : ''}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ColunaGrupos
              titulo="Grupos de Origem"
              descricao="Monitorados para capturar ofertas"
              grupos={grupos}
              selecionados={origem}
              onToggle={toggleOrigem}
              onNicho={setNichoOrigem}
              cor="blue"
            />
            <ColunaGrupos
              titulo="Grupos de Destino"
              descricao="Receberão as ofertas relayadas"
              grupos={grupos}
              selecionados={destino}
              onToggle={toggleDestino}
              onNicho={setNichoDestino}
              cor="green"
            />
          </div>
        </>
      )}
    </>
  );
}

function ColunaGrupos({ titulo, descricao, grupos, selecionados, onToggle, onNicho, cor }: {
  titulo: string; descricao: string;
  grupos: GrupoCache[];
  selecionados: Map<string, string>;
  onToggle: (jid: string) => void;
  onNicho: (jid: string, n: string) => void;
  cor: 'blue' | 'green';
}) {
  const badgeCor = cor === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700';
  const count = selecionados.size;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">{titulo}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{descricao}</p>
        </div>
        {count > 0 && (
          <span className={`badge ${badgeCor}`}>{count} selecionado{count > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {grupos.map((g) => {
          const ativo = selecionados.has(g.group_jid);
          const nicho = selecionados.get(g.group_jid) || 'geral';
          return (
            <div
              key={g.group_jid}
              onClick={() => onToggle(g.group_jid)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                ativo ? 'border-brand-300 bg-brand-50' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={ativo}
                readOnly
                className="accent-brand-500 w-4 h-4 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {g.group_name || 'Grupo sem nome'}
                </p>
                {g.participants_count != null && (
                  <p className="text-xs text-gray-400">{g.participants_count} participantes</p>
                )}
              </div>
              {ativo && (
                <select
                  value={nicho}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onNicho(g.group_jid, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white shrink-0"
                >
                  {NICHOS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
