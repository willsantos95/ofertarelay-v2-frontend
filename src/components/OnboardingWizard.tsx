import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface WizardState {
  contaCriada: boolean;
  whatsappConectado: boolean;
  afiliadoConfigurado: boolean;
}

export default function OnboardingWizard() {
  const { usuario } = useAuth();
  const [state, setState] = useState<WizardState>({
    contaCriada: true,
    whatsappConectado: false,
    afiliadoConfigurado: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ sucesso: boolean; conectado?: boolean }>('/whatsapp/status').catch(() => ({ sucesso: false })),
      api<{ sucesso: boolean; setting?: { payload?: Record<string, unknown> } }>('/settings/affiliate').catch(() => ({ sucesso: false })),
    ]).then(([wa, aff]) => {
      const waConectado = (wa as { conectado?: boolean }).conectado === true;
      const affPayload  = (aff as { setting?: { payload?: Record<string, unknown> } }).setting?.payload || {};
      const temAfiliado = Object.values(affPayload).some((v) => {
        if (typeof v === 'object' && v !== null) {
          return Object.values(v as Record<string, string>).some((s) => s && s !== '***');
        }
        return false;
      });
      setState({ contaCriada: true, whatsappConectado: waConectado, afiliadoConfigurado: temAfiliado });
    }).finally(() => setLoading(false));
  }, [usuario]);

  const completo = state.contaCriada && state.whatsappConectado && state.afiliadoConfigurado;
  if (loading || completo) return null;

  const passos = [
    { label: 'Conta criada',          feito: state.contaCriada,          link: null },
    { label: 'Conectar WhatsApp',      feito: state.whatsappConectado,    link: '/whatsapp' },
    { label: 'Configurar afiliado',    feito: state.afiliadoConfigurado,  link: '/affiliate' },
  ];

  return (
    <div className="card border-brand-500/30 bg-brand-50/50 mb-6">
      <p className="text-sm font-semibold text-gray-800 mb-3">⚡ Configure em 3 passos</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {passos.map((p, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            {p.feito
              ? <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
              : <Circle className="w-5 h-5 text-gray-300 shrink-0" />
            }
            {p.link && !p.feito
              ? <Link to={p.link} className="text-sm text-brand-600 hover:underline font-medium">{p.label}</Link>
              : <span className={`text-sm ${p.feito ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}`}>{p.label}</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
