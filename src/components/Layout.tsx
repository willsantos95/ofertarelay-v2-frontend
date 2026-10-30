import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Smartphone, Users, Link2, Send,
  CreditCard, ClipboardList, HelpCircle, LogOut, Zap, ShoppingBag, CalendarClock,
  MessageSquareText, LayoutTemplate, ShieldCheck, Mail, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { diasRestantes } from '../lib/utils';
import HelpChat from './HelpChat';

const NAV = [
  { to: '/app',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/app/whatsapp',   icon: Smartphone,      label: 'WhatsApp'    },
  { to: '/app/groups',     icon: Users,            label: 'Grupos'      },
  { to: '/app/ofertas',    icon: ShoppingBag,      label: 'Ofertas'     },
  { to: '/app/agendamento',icon: CalendarClock,    label: 'Agendamento' },
  { to: '/app/mensagens',  icon: MessageSquareText, label: 'Mensagens'  },
  { to: '/app/pagina',     icon: LayoutTemplate,   label: 'Página'      },
  { to: '/app/affiliate',  icon: Link2,            label: 'Afiliado'    },
  { to: '/app/telegram',   icon: Send,             label: 'Telegram'    },
  { to: '/app/billing',    icon: CreditCard,       label: 'Faturamento' },
  { to: '/app/relay-logs', icon: ClipboardList,    label: 'Histórico'   },
  { to: '/app/help',       icon: HelpCircle,       label: 'Ajuda'       },
];

const NAV_ADMIN = [
  { to: '/app/admin/usuarios', icon: ShieldCheck, label: 'Usuários' },
  { to: '/app/admin/email',    icon: Mail,        label: 'E-mail'   },
];

/** Avisos no topo: e-mail não confirmado e plano vencendo/vencido. */
function Avisos() {
  const { usuario } = useAuth();
  const [reenvio, setReenvio] = useState<'' | 'enviando' | string>('');
  if (!usuario || usuario.is_admin) return null;

  const avisos: React.ReactNode[] = [];

  if (usuario.plano_ativo === false) {
    avisos.push(
      <div key="plano" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center gap-2">
        <span className="flex-1">
          {usuario.bloqueio_plano
            ? 'Seu período de teste terminou. Os envios de ofertas estão pausados até você assinar.'
            : 'Seu período de teste terminou. Assine para continuar usando o OfertaRelay.'}
        </span>
        <NavLink to="/app/billing" className="btn btn-primary py-1.5">Assinar</NavLink>
      </div>
    );
  } else if (usuario.status_plano === 'trial' && usuario.trial_termina_em && !usuario.premium_ate) {
    const d = diasRestantes(usuario.trial_termina_em);
    if (d <= 3) avisos.push(
      <div key="trial" className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex flex-wrap items-center gap-2">
        <span className="flex-1">{d <= 0 ? 'Seu teste termina hoje.' : `Seu teste termina em ${d} dia${d > 1 ? 's' : ''}.`}</span>
        <NavLink to="/app/billing" className="btn btn-outline py-1.5 bg-white">Ver planos</NavLink>
      </div>
    );
  }

  if (usuario.email_confirmado === false) {
    avisos.push(
      <div key="email" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 flex flex-wrap items-center gap-2">
        <span className="flex-1">
          {reenvio && reenvio !== 'enviando' ? reenvio : `Confirme seu e-mail (${usuario.email}) para recuperar a senha quando precisar.`}
        </span>
        {!reenvio && (
          <button className="btn btn-outline py-1.5" onClick={async () => {
            setReenvio('enviando');
            try {
              const r = await api<{ mensagem: string }>('/auth/reenviar-confirmacao', { method: 'POST' });
              setReenvio(r.mensagem);
            } catch (e) { setReenvio((e as Error).message); }
          }}>Reenviar e-mail</button>
        )}
      </div>
    );
  }

  return avisos.length ? <div className="flex flex-col gap-2 mb-6">{avisos}</div> : null;
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-500 text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [mais, setMais] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-100 p-4 gap-1">
        <div className="flex items-center gap-2 px-3 py-3 mb-3">
          <Zap className="w-6 h-6 text-brand-500" />
          <span className="font-bold text-gray-900 text-lg">OfertaRelay</span>
        </div>

        {NAV.map((n) => <NavItem key={n.to} {...n} />)}

        {usuario?.is_admin && (
          <>
            <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Admin</p>
            {NAV_ADMIN.map((n) => <NavItem key={n.to} {...n} />)}
          </>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-900 truncate">{usuario?.nome}</p>
            <p className="text-xs text-gray-400 truncate">{usuario?.email}</p>
          </div>
          <button
            onClick={sair}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-gray-900">OfertaRelay</span>
          </div>
          <button onClick={sair} className="text-gray-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <Avisos />
          <Outlet />
        </main>

        {/* Nav mobile inferior */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around px-2 py-2 z-10">
          {NAV.slice(0, 4).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              onClick={() => navigate(to)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                  isActive ? 'text-brand-500' : 'text-gray-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </NavLink>
          ))}
          <button onClick={() => setMais(true)} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs text-gray-400">
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Mais</span>
          </button>
        </nav>

        {/* Menu completo no celular */}
        {mais && (
          <div className="lg:hidden fixed inset-0 z-20 bg-black/30" onClick={() => setMais(false)}>
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Menu</span>
                <button onClick={() => setMais(false)} className="p-1 text-gray-400" aria-label="Fechar"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-col gap-1" onClick={() => setMais(false)}>
                {NAV.map((n) => <NavItem key={n.to} {...n} />)}
                {usuario?.is_admin && (
                  <>
                    <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Admin</p>
                    {NAV_ADMIN.map((n) => <NavItem key={n.to} {...n} />)}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Widget de chat de suporte flutuante */}
      <HelpChat />
    </div>
  );
}
