import { useEffect, useState } from 'react';
import { Loader2, Save, Send } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { formatDate } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface Config {
  ativo: boolean; host: string; porta: number; seguro: boolean; usuario: string; senha: string; senhaDefinida?: boolean;
  remetenteNome: string; remetenteEmail: string; responderPara: string; urlApp: string;
}
interface LogEmail { para: string; tipo: string; status: string; erro: string | null; criado_em: string }

const TIPOS: Record<string, string> = {
  redefinir_senha: 'Redefinir senha', confirmar_email: 'Confirmar e-mail', boas_vindas: 'Boas-vindas',
  senha_alterada: 'Senha alterada', teste: 'Teste',
};

export default function AdminEmail() {
  const { usuario } = useAuth();
  const [c, setC] = useState<Config | null>(null);
  const [ultimos, setUltimos] = useState<LogEmail[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [para, setPara] = useState(usuario?.email || '');
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const r = await api<{ config: Config; ultimos: LogEmail[] }>('/admin/email');
      setC(r.config); setUltimos(r.ultimos || []);
    } catch (e) { setErro((e as Error).message); }
  }
  useEffect(() => { carregar(); }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!c) return;
    setSalvando(true); setMsg(''); setErro('');
    try {
      const r = await api<{ config: Config }>('/admin/email', { method: 'PUT', body: JSON.stringify(c) });
      setC(r.config); setMsg('Configuração salva.');
    } catch (e) { setErro((e as Error).message); }
    finally { setSalvando(false); }
  }

  async function testar() {
    if (!c) return;
    setTestando(true); setMsg(''); setErro('');
    try {
      const r = await api<{ sucesso: boolean; mensagem?: string; etapa?: string; erro?: { mensagem: string } }>(
        '/admin/email/testar', { method: 'POST', body: JSON.stringify({ ...c, para }) }
      );
      if (r.sucesso) setMsg(`${r.mensagem} Confira a caixa de entrada e o spam.`);
      else setErro(`${r.etapa === 'conexao' ? 'Falha ao conectar' : 'Falha ao enviar'}: ${r.erro?.mensagem}`);
      carregar();
    } catch (e) { setErro((e as Error).message); }
    finally { setTestando(false); }
  }

  if (!c) return <div className="flex justify-center py-16">{erro ? <Alert message={erro} /> : <Loader2 className="w-6 h-6 animate-spin text-gray-400" />}</div>;

  const set = (k: keyof Config) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setC({ ...c, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value });

  return (
    <>
      <PageHeader title="Servidor de e-mail" subtitle="Usado para redefinir senha, confirmar cadastro e avisos da plataforma" />
      <Alert message={erro} />
      <Alert type="success" message={msg} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        <form onSubmit={salvar} className="card flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={c.ativo} onChange={set('ativo')} className="w-4 h-4 accent-brand-500" />
            Enviar e-mails pela plataforma
          </label>

          <div className="grid sm:grid-cols-[1fr_110px] gap-3">
            <div>
              <label className="label" htmlFor="host">Servidor SMTP (saída)</label>
              <input id="host" className="input" placeholder="smtp.hostinger.com" value={c.host} onChange={set('host')} required />
            </div>
            <div>
              <label className="label" htmlFor="porta">Porta</label>
              <input id="porta" type="number" className="input" value={c.porta} onChange={set('porta')} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={c.seguro} onChange={set('seguro')} className="w-4 h-4 accent-brand-500" />
            SSL/TLS (porta 465). Desmarque para STARTTLS na porta 587.
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="usuario">Usuário (e-mail)</label>
              <input id="usuario" className="input" placeholder="contato@ofertarelay.com.br" autoComplete="off" value={c.usuario} onChange={set('usuario')} />
            </div>
            <div>
              <label className="label" htmlFor="senha">Senha</label>
              <input id="senha" type="password" className="input" autoComplete="new-password"
                placeholder={c.senhaDefinida ? 'Mantida. Digite para trocar' : ''}
                value={c.senha === '********' ? '' : c.senha}
                onChange={(e) => setC({ ...c, senha: e.target.value || (c.senhaDefinida ? '********' : '') })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="rnome">Nome do remetente</label>
              <input id="rnome" className="input" value={c.remetenteNome} onChange={set('remetenteNome')} />
            </div>
            <div>
              <label className="label" htmlFor="remail">E-mail do remetente</label>
              <input id="remail" type="email" className="input" placeholder="Igual ao usuário" value={c.remetenteEmail} onChange={set('remetenteEmail')} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="resp">Responder para (opcional)</label>
              <input id="resp" type="email" className="input" value={c.responderPara} onChange={set('responderPara')} />
            </div>
            <div>
              <label className="label" htmlFor="url">Endereço do painel</label>
              <input id="url" className="input" placeholder="https://ofertarelay.com.br" value={c.urlApp} onChange={set('urlApp')} />
              <p className="text-xs text-gray-400 mt-1">Base dos links enviados nos e-mails.</p>
            </div>
          </div>

          <div>
            <button type="submit" disabled={salvando} className="btn btn-primary">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-6">
          <div className="card flex flex-col gap-3">
            <h2 className="font-semibold text-gray-900">Testar</h2>
            <p className="text-xs text-gray-500">Testa o que está na tela, mesmo antes de salvar.</p>
            <input type="email" className="input" value={para} onChange={(e) => setPara(e.target.value)} aria-label="Enviar teste para" />
            <button type="button" onClick={testar} disabled={testando} className="btn btn-outline">
              {testando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Enviar e-mail de teste
            </button>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Últimos envios</h2>
            {ultimos.length === 0 && <p className="text-xs text-gray-400">Nenhum e-mail enviado ainda.</p>}
            <ul className="flex flex-col gap-2 text-xs">
              {ultimos.map((u, i) => (
                <li key={i} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${u.status === 'enviado' ? 'badge-green' : 'badge-red'}`}>{u.status === 'enviado' ? 'Enviado' : 'Falhou'}</span>
                    <span className="text-gray-700 truncate flex-1">{TIPOS[u.tipo] || u.tipo}</span>
                    <span className="text-gray-400 whitespace-nowrap">{formatDate(u.criado_em)}</span>
                  </div>
                  <span className="text-gray-500 truncate">{u.para}</span>
                  {u.erro && <span className="text-red-600">{u.erro}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
