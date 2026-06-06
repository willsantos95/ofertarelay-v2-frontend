import { useEffect, useState } from 'react';
import { RefreshCw, Save, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

const NICHOS = ['geral', 'pet', 'baby', 'fitness', 'home', 'electronics', 'fashion'];

interface Grupo {
  id: string;
  group_jid: string;
  group_nome?: string;
  group_name?: string;
  participantes?: number;
  nome?: string;
  papel?: 'origem' | 'destino';
  nicho?: string;
}
interface GrupoSelecionado { groupJid: string; nome: string; nicho: string; papel: 'origem' | 'destino' }

export default function Groups() {
  const [gruposCache, setGruposCache]     = useState<Grupo[]>([]);
  const [gruposSalvos, setGruposSalvos]   = useState<Grupo[]>([]);
  const [selecionados, setSelecionados]   = useState<Map<string, GrupoSelecionado>>(new Map());
  const [syncing, setSyncing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]   = useState('');
  const [erro, setErro] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      const [cache, salvos] = await Promise.allSettled([
        api<{ grupos: Grupo[] }>('/whatsapp/grupos'),
        api<{ grupos: Grupo[] }>('/whatsapp/grupos'),
      ]);
      if (salvos.status === 'fulfilled') {
        const gs = salvos.value.grupos;
        setGruposSalvos(gs);
        const map = new Map<string, GrupoSelecionado>();
        gs.forEach((g) => {
          map.set(g.group_jid, {
            groupJid: g.group_jid,
            nome: g.nome || '',
            nicho: g.nicho || 'geral',
            papel: (g.papel as 'origem' | 'destino') || 'origem',
          });
        });
        setSelecionados(map);
      }
    } finally { setLoading(false); }
  }

  async function sincronizar() {
    setSyncing(true); setErro(''); setMsg('');
    try {
      const r = await api<{ job: { id: string } }>('/whatsapp/grupos/sincronizar', { method: 'POST' });
      const jobId = r.job.id;
      // polling do job
      await new Promise<void>((resolve) => {
        const iv = setInterval(async () => {
          try {
            const s = await api<{ job: { status: string; salvos?: number } }>(`/whatsapp/grupos/status-sync?jobId=${jobId}`);
            if (s.job.status === 'concluido') { clearInterval(iv); resolve(); }
            if (s.job.status === 'erro')      { clearInterval(iv); resolve(); }
          } catch { clearInterval(iv); resolve(); }
        }, 3000);
        setTimeout(() => { clearInterval(iv); resolve(); }, 120000);
      });

      // Recarregar grupos do cache
      const cache = await api<{ rows?: Grupo[]; grupos?: Grupo[] }>('/whatsapp/grupos');
      const lista = (cache as { grupos?: Grupo[] }).grupos || [];
      setGruposCache(lista);
      setMsg(`Sincronização concluída! ${lista.length} grupos encontrados.`);
    } catch (e) {
      setErro((e as Error).message || 'Erro ao sincronizar');
    } finally { setSyncing(false); }
  }

  async function salvar() {
    const lista = Array.from(selecionados.values());
    const origem  = lista.filter((g) => g.papel === 'origem');
    const destino = lista.filter((g) => g.papel === 'destino');

    if (origem.length === 0)  { setErro('Selecione ao menos 1 grupo de origem.'); return; }
    if (destino.length === 0) { setErro('Selecione ao menos 1 grupo de destino.'); return; }

    setSaving(true); setErro(''); setMsg('');
    try {
      await api('/whatsapp/grupos/salvar', {
        method: 'POST',
        body: JSON.stringify({ gruposOrigem: origem, gruposDestino: destino }),
      });
      setMsg('Configuração salva com sucesso!');
      await carregar();
    } catch (e) {
      setErro((e as Error).message || 'Erro ao salvar');
    } finally { setSaving(false); }
  }

  function toggleGrupo(grupo: Grupo, papel: 'origem' | 'destino') {
    const jid = grupo.group_jid;
    const nome = grupo.group_name || grupo.group_nome || grupo.nome || '';
    setSelecionados((prev) => {
      const next = new Map(prev);
      const atual = next.get(jid);
      if (atual?.papel === papel) { next.delete(jid); }
      else { next.set(jid, { groupJid: jid, nome, nicho: atual?.nicho || 'geral', papel }); }
      return next;
    });
  }

  function setNicho(jid: string, nicho: string) {
    setSelecionados((prev) => {
      const next = new Map(prev);
      const atual = next.get(jid);
      if (atual) next.set(jid, { ...atual, nicho });
      return next;
    });
  }

  useEffect(() => { carregar(); }, []);

  const grupos = gruposCache.length > 0 ? gruposCache : gruposSalvos;
  const origem  = Array.from(selecionados.values()).filter((g) => g.papel === 'origem');
  const destino = Array.from(selecionados.values()).filter((g) => g.papel === 'destino');

  return (
    <>
      <PageHeader
        title="Grupos"
        subtitle="Defina quais grupos serão monitorados e para onde as ofertas serão enviadas"
        action={
          <div className="flex gap-2">
            <button onClick={sincronizar} disabled={syncing} className="btn btn-outline">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sincronizar
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
          <p className="text-gray-500 text-sm">Nenhum grupo encontrado.</p>
          <p className="text-gray-400 text-xs mt-1">Certifique-se que o WhatsApp está conectado e clique em "Sincronizar".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GrupoColuna
            titulo="Grupos de Origem"
            descricao="Grupos que serão monitorados para capturar ofertas"
            papel="origem"
            grupos={grupos}
            selecionados={selecionados}
            onToggle={toggleGrupo}
            onNicho={setNicho}
            count={origem.length}
          />
          <GrupoColuna
            titulo="Grupos de Destino"
            descricao="Grupos que receberão as ofertas relayadas"
            papel="destino"
            grupos={grupos}
            selecionados={selecionados}
            onToggle={toggleGrupo}
            onNicho={setNicho}
            count={destino.length}
          />
        </div>
      )}
    </>
  );
}

function GrupoColuna({ titulo, descricao, papel, grupos, selecionados, onToggle, onNicho, count }: {
  titulo: string; descricao: string; papel: 'origem' | 'destino';
  grupos: Grupo[]; selecionados: Map<string, GrupoSelecionado>;
  onToggle: (g: Grupo, p: 'origem' | 'destino') => void;
  onNicho: (jid: string, n: string) => void;
  count: number;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">{titulo}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{descricao}</p>
        </div>
        {count > 0 && <span className="badge badge-green">{count} selecionado{count > 1 ? 's' : ''}</span>}
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {grupos.map((g) => {
          const jid = g.group_jid;
          const sel = selecionados.get(jid);
          const ativo = sel?.papel === papel;
          const nome  = g.group_name || g.group_nome || g.nome || 'Grupo sem nome';
          return (
            <div key={jid} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
              ativo ? 'border-brand-300 bg-brand-50' : 'border-gray-100 hover:bg-gray-50'
            }`} onClick={() => onToggle(g, papel)}>
              <input type="checkbox" checked={ativo} readOnly className="accent-brand-500 w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{nome}</p>
                {g.participantes != null && (
                  <p className="text-xs text-gray-400">{g.participantes} participantes</p>
                )}
              </div>
              {ativo && (
                <select
                  value={sel?.nicho || 'geral'}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onNicho(jid, e.target.value)}
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
