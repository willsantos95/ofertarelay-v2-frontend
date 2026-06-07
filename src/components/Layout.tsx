import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Smartphone, Users, Link2, Send,
  CreditCard, ClipboardList, HelpCircle, LogOut, Zap, ShoppingBag, CalendarClock,
} from 'lucide-react';

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/whatsapp',    icon: Smartphone,      label: 'WhatsApp'    },
  { to: '/groups',      icon: Users,            label: 'Grupos'      },
  { to: '/ofertas',     icon: ShoppingBag,      label: 'Ofertas'     },
  { to: '/agendamento', icon: CalendarClock,    label: 'Agendamento' },
  { to: '/affiliate',   icon: Link2,            label: 'Afiliado'    },
  { to: '/telegram',    icon: Send,             label: 'Telegram'    },
  { to: '/billing',     icon: CreditCard,       label: 'Faturamento' },
  { to: '/relay-logs',  icon: ClipboardList,    label: 'Histórico'   },
  { to: '/help',        icon: HelpCircle,       label: 'Ajuda'       },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-100 p-4 gap-1">
        <div className="flex items-center gap-2 px-3 py-3 mb-3">
          <Zap className="w-6 h-6 text-brand-500" />
          <span className="font-bold text-gray-900 text-lg">OfertaRelay</span>
        </div>

        {NAV.map((n) => <NavItem key={n.to} {...n} />)}

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
          <Outlet />
        </main>

        {/* Nav mobile inferior */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around px-2 py-2 z-10">
          {NAV.slice(0, 6).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
        </nav>
      </div>
    </div>
  );
}
