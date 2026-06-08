import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import WhatsAppSettings from './pages/WhatsAppSettings';
import Groups from './pages/Groups';
import AffiliateSettings from './pages/AffiliateSettings';
import AfiliadoLogs from './pages/AfiliadoLogs';
import TelegramSettings from './pages/TelegramSettings';
import Billing from './pages/Billing';
import RelayLogs from './pages/RelayLogs';
import Ofertas from './pages/Ofertas';
import Agendamento from './pages/Agendamento';
import Help from './pages/Help';

export default function App() {
  const { usuario, carregando } = useAuth();

  if (carregando) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      {/* Landing page pública */}
      <Route path="/landing"        element={<Landing />} />

      {/* Rotas públicas */}
      <Route path="/login"          element={usuario ? <Navigate to="/app" replace /> : <Login />} />
      <Route path="/register"       element={usuario ? <Navigate to="/app" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Rota raiz: app se logado, landing se não logado */}
      <Route path="/" element={usuario ? <Navigate to="/app" replace /> : <Landing />} />

      {/* Rotas autenticadas sob /app */}
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index                element={<Dashboard />} />
        <Route path="whatsapp"      element={<WhatsAppSettings />} />
        <Route path="groups"        element={<Groups />} />
        <Route path="affiliate"     element={<AffiliateSettings />} />
        <Route path="affiliate/logs" element={<AfiliadoLogs />} />
        <Route path="telegram"      element={<TelegramSettings />} />
        <Route path="billing"       element={<Billing />} />
        <Route path="billing/success" element={<Billing />} />
        <Route path="relay-logs"    element={<RelayLogs />} />
        <Route path="ofertas"       element={<Ofertas />} />
        <Route path="agendamento"   element={<Agendamento />} />
        <Route path="help"          element={<Help />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
