import { useEffect, useState } from 'react';
import {
  Loader2, Search, X, Crown, Ban, Unlock, MailCheck, KeyRound, Copy, Check, RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { formatDate } from '../lib/utils';

interface Usuario {
  id: string; nome: string; email: string; status_plano: string; trial_termina_em: string | null;
  premium_ate: string | null; bloqueado_em: string | null; motivo_bloqueio: string | null; observacao_admin: string | null;
  email_confirmado_em: string | null; ultimo_acesso_em: string | null; criado_em: string;
  whatsapp_status: string | null; whatsapp_telefone: string | null; ofertas_30d: number; ultima_oferta_em: string | null;
  assinatura_status: string | null; assinatura_proxima_cobranca: string | null;
  situacao: string; plano_ativo: boolean; is_admin: boolean;
}
interface Detalhe {
  usuario: Usuario;
  assinaturas: { id: string; nome_plano: string | null; valor: string | null; status_pagamento: string; next_payment_at: string | null; criado_em: string }[];
  acoes: { admin_email: string; acao: string; detalhes: Record<string, unknown>; criado_em: string }[];
  grupos: { papel: string; total: number }[];
}
interface Resumo {
  total: number; novos_7d: number; trial: number; trial_vencido: number; pago: number; cortesia: number;
  sem_plano: number; bloqueado: number; ofertas_7d: number; usuarios_ativos_7d: number;
}

const SITUACAO: Record<string, { r: string; cls: string }> = {
  admin: { r: 'Admin', cls: 'bg-gray-900 text-white' },
  pago: { r: 'Assinante', cls: 'badge-green' },
  cortesia: { r: 'Premium cortesia', cls: 'bg-amber-100 text-amber-800' },
  trial: { r: 'Teste', cls: 'bg-sky-100 text-sky-800' },
  trial_vencido: { r: 'Teste vencido', cls: 'badge-yellow' },
  sem_plano: { r: 'Sem plano', cls: 'badge-gray' },
  bloqueado: { r: 'Bloqueado', cls: 'badge-red' },
};
const STATUS_PLANO = [
  { v: 'trial', r: 'Teste' }, { v: 'ativo', r: 'Ativo (pago)' }, { v: 'pendente', r: 'Pendente' },
  { v: 'pausado', r: 'Pausado' }, { v: 'cancelado', r: 'Cancelado' }, { v: 'inativo', r: 'Inativo' },
];
const ACOES: Record<string, string> = {
  alterar_plano: 'Alterou o plano', bloquear: 'Bloqueou', desbloquear: 'Desbloqueou',
  confirmar_email: 'Confirmou o e-mail', enviar_redefinicao_senha: 'Enviou link de senha',
};

const data = (s: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR') : '—');
const WHATS: Record<string, string> = { open: 'Conectado', conectado: 'Conectado', close: 'Desconectado', connecting: 'Conectando' };
const vitalicio = (s: string | null) => !!s && new Date(s).getFullYear() > 2900;

function Selo({ s }: { s: string }) {
  const x = SITUACAO[s] || { r: s, cls: 'badge-gray' };
  return <span className={`badge whitespace-nowrap ${x.cls}`}>{x.r}</span>;
}

function Painel({ id, fechar, mudou }: { id: string; fechar: () => void; mudou: () => void }) {
  const [d, setD] = useState<Detalhe | null>(null);
  const [ocupado, setOcupado] = useState('');
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [link, setLink] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [dias, setDias] = useState(30);
  const [status, setStatus] = useState('');
  const [fimTeste, setFimTeste] = useState('');
  const [obs, setObs] = useState('');
  const [motivo, setMotivo] = useState('');

  async function carregar() {
    try {
      const r = await api<Detalhe>(`/admin/usuarios/${id}`);
      setD(r);
      setStatus(r.usuario.status_plano);
      setFimTeste(r.usuario.trial_termina_em ? r.usuario.trial_termina_em.slice(0, 10) : '');
      setObs(r.usuario.observacao_admin || '');
    } catch (e) { setErro((e as Error).message); }
  }
  useEffect(() => { setD(null); setMsg(''); setErro(''); setLink(''); carregar(); }, [id]);

  async function acao(nome: string, caminho: string, corpo: unknown, metodo = 'POST') {
    setOcupado(nome); setMsg(''); setErro('');
    try {
      const r = await api<{ mensagem?: string; link?: string }>(caminho, { method: metodo, body: JSON.stringify(corpo) });
      setMsg(r.mensagem || 'Feito.');
      if (r.link) setLink(r.link);
      await carregar(); mudou();
    } catch (e) { setErro((e as Error).message); }
    finally { setOcupado(''); }
  }
  const plano = (corpo: Record<string, unknown>, nome = 'plano') => acao(nome, `/admin/usuarios/${id}/plano`, corpo, 'PATCH');

  const u = d?.usuario;
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30" onClick={fechar}>
      <aside className="w-full max-w-lg h-full overflow-y-auto bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()} aria-label="Detalhes do usuário">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{u?.nome || '…'}</h2>
            <p className="text-sm text-gray-500 truncate">{u?.email}</p>
          </div>
          <button onClick={fechar} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Fechar"><X className="w-5 h-5" /></button>
        </div>

        {!u ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : (
          <div className="flex flex-col gap-5 text-sm">
            <Alert message={erro} />
            <Alert type="success" message={msg} />
            {link && (
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-2 text-xs">
                <span className="truncate flex-1">{link}</span>
                <button onClick={() => navigator.clipboard?.writeText(link).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1500); })} aria-label="Copiar link">
                  {copiado ? <Check className="w-4 h-4 text-brand-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <Selo s={u.situacao} />
              {u.plano_ativo ? <span className="text-xs text-brand-600">Pode enviar ofertas</span> : <span className="text-xs text-red-600">Sem acesso ao envio</span>}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <dt className="text-gray-400">Cadastro</dt><dd>{data(u.criado_em)}</dd>
              <dt className="text-gray-400">Último acesso</dt><dd>{u.ultimo_acesso_em ? formatDate(u.ultimo_acesso_em) : '—'}</dd>
              <dt className="text-gray-400">E-mail confirmado</dt><dd>{u.email_confirmado_em ? data(u.email_confirmado_em) : 'Não'}</dd>
              <dt className="text-gray-400">WhatsApp</dt><dd>{u.whatsapp_status ? `${WHATS[u.whatsapp_status] || u.whatsapp_status}${u.whatsapp_telefone ? ` · ${u.whatsapp_telefone}` : ''}` : 'Não conectado'}</dd>
              <dt className="text-gray-400">Grupos</dt><dd>{d.grupos.length ? d.grupos.map((g) => `${g.total} ${g.papel}`).join(', ') : '—'}</dd>
              <dt className="text-gray-400">Ofertas (30 dias)</dt><dd>{u.ofertas_30d.toLocaleString('pt-BR')}</dd>
              <dt className="text-gray-400">Status do plano</dt><dd>{u.status_plano}</dd>
              <dt className="text-gray-400">Fim do teste</dt><dd>{data(u.trial_termina_em)}</dd>
              <dt className="text-gray-400">Premium cortesia</dt><dd>{vitalicio(u.premium_ate) ? 'Vitalício' : data(u.premium_ate)}</dd>
              <dt className="text-gray-400">Mercado Pago</dt><dd>{u.assinatura_status || '—'}{u.assinatura_proxima_cobranca ? ` · próx. ${data(u.assinatura_proxima_cobranca)}` : ''}</dd>
            </dl>

            {!u.is_admin && (
              <section className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <h3 className="font-semibold flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" />Acesso premium</h3>
                <p className="text-xs text-gray-500">Libera o envio independente da assinatura. A cobrança do Mercado Pago não altera isso.</p>
                <div className="flex flex-wrap gap-2">
                  <input type="number" min={1} max={3650} value={dias} onChange={(e) => setDias(Number(e.target.value))} className="input w-20 py-1.5" aria-label="Dias" />
                  <button disabled={!!ocupado} onClick={() => plano({ premium_dias: dias }, 'premium')} className="btn btn-primary py-1.5">
                    {ocupado === 'premium' && <Loader2 className="w-4 h-4 animate-spin" />}+ {dias} dias
                  </button>
                  <button disabled={!!ocupado} onClick={() => plano({ premium_vitalicio: true }, 'vitalicio')} className="btn btn-outline py-1.5">Vitalício</button>
                  {u.premium_ate && <button disabled={!!ocupado} onClick={() => plano({ premium_ate: null }, 'remover')} className="btn btn-outline py-1.5 text-red-600">Remover</button>}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <h3 className="font-semibold">Assinatura</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs" htmlFor="st">Status</label>
                  <select id="st" value={status} onChange={(e) => setStatus(e.target.value)} className="input py-1.5">
                    {STATUS_PLANO.map((s) => <option key={s.v} value={s.v}>{s.r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs" htmlFor="ft">Fim do teste</label>
                  <input id="ft" type="date" value={fimTeste} onChange={(e) => setFimTeste(e.target.value)} className="input py-1.5" />
                </div>
              </div>
              <div>
                <label className="label text-xs" htmlFor="obs">Observação interna</label>
                <textarea id="obs" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} className="input" maxLength={1000} />
              </div>
              <div>
                <button disabled={!!ocupado} className="btn btn-outline py-1.5"
                  onClick={() => plano({
                    status_plano: status,
                    ...(fimTeste ? { trial_termina_em: `${fimTeste}T23:59:59-03:00` } : {}),
                    observacao: obs,
                  })}>
                  {ocupado === 'plano' && <Loader2 className="w-4 h-4 animate-spin" />}Salvar assinatura
                </button>
              </div>
              <p className="text-xs text-gray-400">Se o usuário tiver assinatura no Mercado Pago, o próximo aviso de pagamento pode trocar o status de novo.</p>
            </section>

            <section className="flex flex-col gap-2 border-t border-gray-100 pt-4">
              <h3 className="font-semibold">Conta</h3>
              <div className="flex flex-wrap gap-2">
                <button disabled={!!ocupado} onClick={() => acao('senha', `/admin/usuarios/${id}/redefinir-senha`, {})} className="btn btn-outline py-1.5">
                  {ocupado === 'senha' ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}Enviar link de senha
                </button>
                {!u.email_confirmado_em && (
                  <button disabled={!!ocupado} onClick={() => acao('email', `/admin/usuarios/${id}/confirmar-email`, {})} className="btn btn-outline py-1.5">
                    <MailCheck className="w-4 h-4" />Marcar e-mail confirmado
                  </button>
                )}
              </div>
              {!u.is_admin && (u.bloqueado_em ? (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-800 flex flex-col gap-2">
                  <p>Bloqueado em {formatDate(u.bloqueado_em)}{u.motivo_bloqueio ? `: ${u.motivo_bloqueio}` : ''}</p>
                  <button disabled={!!ocupado} onClick={() => acao('desbloquear', `/admin/usuarios/${id}/desbloquear`, {})} className="btn btn-outline py-1.5 bg-white self-start">
                    <Unlock className="w-4 h-4" />Desbloquear
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (opcional)" className="input py-1.5" aria-label="Motivo do bloqueio" />
                  <button disabled={!!ocupado} onClick={() => { if (window.confirm(`Bloquear ${u.email}? O envio de ofertas para na hora e a pessoa não consegue entrar.`)) acao('bloquear', `/admin/usuarios/${id}/bloquear`, { motivo }); }} className="btn btn-danger py-1.5 whitespace-nowrap">
                    <Ban className="w-4 h-4" />Bloquear
                  </button>
                </div>
              ))}
            </section>

            {d.assinaturas.length > 0 && (
              <section className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold mb-2">Pagamentos</h3>
                <ul className="text-xs flex flex-col gap-1">
                  {d.assinaturas.map((a) => (
                    <li key={a.id} className="flex gap-2">
                      <span className="text-gray-400 w-20">{data(a.criado_em)}</span>
                      <span className="flex-1">{a.nome_plano || 'Plano'}{a.valor ? ` · R$ ${a.valor}` : ''}</span>
                      <span className="text-gray-600">{a.status_pagamento}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {d.acoes.length > 0 && (
              <section className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold mb-2">Histórico do admin</h3>
                <ul className="text-xs flex flex-col gap-1.5">
                  {d.acoes.map((a, i) => (
                    <li key={i}>
                      <span className="text-gray-400">{formatDate(a.criado_em)}</span> · {ACOES[a.acao] || a.acao}
                      <span className="text-gray-400"> por {a.admin_email}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

export default function AdminUsuarios() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState<string | null>(null);

  async function carregar(p = page) {
    setLoading(true); setErro('');
    try {
      const q = new URLSearchParams({ page: String(p), limit: '25' });
      if (busca.trim()) q.set('busca', busca.trim());
      if (situacao) q.set('situacao', situacao);
      const [l, r] = await Promise.all([
        api<{ usuarios: Usuario[]; total: number }>(`/admin/usuarios?${q}`),
        api<{ resumo: Resumo }>('/admin/resumo'),
      ]);
      setLista(l.usuarios); setTotal(l.total); setResumo(r.resumo);
    } catch (e) { setErro((e as Error).message); }
    finally { setLoading(false); }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); carregar(1); }, [situacao]);

  const totalPages = Math.ceil(total / 25);
  const filtros: { k: string; r: string; n?: number }[] = [
    { k: '', r: 'Todos', n: resumo?.total },
    { k: 'pago', r: 'Assinantes', n: resumo?.pago },
    { k: 'cortesia', r: 'Cortesia', n: resumo?.cortesia },
    { k: 'trial', r: 'Em teste', n: resumo?.trial },
    { k: 'trial_vencido', r: 'Teste vencido', n: resumo?.trial_vencido },
    { k: 'sem_plano', r: 'Sem plano', n: resumo?.sem_plano },
    { k: 'bloqueado', r: 'Bloqueados', n: resumo?.bloqueado },
  ];

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle={resumo ? `${resumo.total} contas · ${resumo.novos_7d} novas em 7 dias · ${resumo.usuarios_ativos_7d} enviaram ofertas na semana` : 'Contas cadastradas na plataforma'}
        action={<button onClick={() => carregar()} className="btn btn-outline" aria-label="Atualizar"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>}
      />
      <Alert message={erro} />

      <div className="flex flex-wrap gap-2 mb-4">
        {filtros.map((f) => (
          <button key={f.k} onClick={() => setSituacao(f.k)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${situacao === f.k ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {f.r}{f.n !== undefined && <span className="ml-1.5 opacity-60 tabular-nums">{f.n}</span>}
          </button>
        ))}
      </div>

      <div className="card">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); carregar(1); }} className="relative mb-4 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail" className="input pl-9" aria-label="Buscar usuário" />
        </form>

        {loading && lista.length === 0 && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>}
        {!loading && lista.length === 0 && <p className="text-sm text-gray-400 text-center py-10">Nenhum usuário encontrado.</p>}

        {lista.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Usuário</th>
                  <th className="pb-2 font-medium">Situação</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Vence em</th>
                  <th className="pb-2 font-medium">WhatsApp</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Ofertas 30d</th>
                  <th className="pb-2 font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => {
                  const vence = u.situacao === 'cortesia' ? (vitalicio(u.premium_ate) ? 'Vitalício' : data(u.premium_ate))
                    : u.situacao === 'trial' || u.situacao === 'trial_vencido' ? data(u.trial_termina_em)
                    : u.situacao === 'pago' ? data(u.assinatura_proxima_cobranca) : '—';
                  return (
                    <tr key={u.id} onClick={() => setAberto(u.id)} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                      <td className="py-2.5 max-w-[240px]">
                        <p className="font-medium text-gray-900 truncate">{u.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}{!u.email_confirmado_em && <span className="text-amber-600"> · não confirmado</span>}</p>
                      </td>
                      <td className="py-2.5"><Selo s={u.situacao} /></td>
                      <td className="py-2.5 text-xs text-gray-600 whitespace-nowrap">{vence}</td>
                      <td className="py-2.5 text-xs">
                        {u.whatsapp_status === 'open' || u.whatsapp_status === 'conectado'
                          ? <span className="text-brand-600">Conectado</span>
                          : <span className="text-gray-400">{u.whatsapp_status ? (WHATS[u.whatsapp_status] || u.whatsapp_status) : '—'}</span>}
                      </td>
                      <td className="py-2.5 text-xs tabular-nums text-gray-700">{u.ofertas_30d.toLocaleString('pt-BR')}</td>
                      <td className="py-2.5 text-xs text-gray-500 whitespace-nowrap">{data(u.criado_em)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <button disabled={page <= 1} onClick={() => { setPage(page - 1); carregar(page - 1); }} className="btn btn-outline text-xs">← Anterior</button>
            <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); carregar(page + 1); }} className="btn btn-outline text-xs">Próxima →</button>
          </div>
        )}
      </div>

      {aberto && <Painel id={aberto} fechar={() => setAberto(null)} mudou={() => carregar()} />}
    </>
  );
}
