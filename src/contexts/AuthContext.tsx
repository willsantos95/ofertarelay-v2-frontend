import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, ErroNaoAutorizado } from '../lib/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  chave_api: string;
  status_plano: 'trial' | 'ativo' | 'cancelado' | 'suspenso';
  trial_termina_em: string;
}

interface AuthCtx {
  usuario: Usuario | null;
  carregando: boolean;
  entrar:    (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair:      () => void;
  recarregar: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario]     = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function recarregar() {
    try {
      // redirecionar401=false para não causar loop na verificação inicial
      const data = await api<{ usuario: Usuario }>('/auth/me', undefined, false);
      setUsuario(data.usuario);
    } catch (e) {
      if (e instanceof ErroNaoAutorizado) {
        setUsuario(null); // não logado — normal na tela de login
      } else {
        setUsuario(null);
      }
    }
  }

  useEffect(() => {
    recarregar().finally(() => setCarregando(false));
  }, []);

  async function entrar(email: string, senha: string) {
    const data = await api<{ usuario: Usuario }>('/auth/entrar', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    setUsuario(data.usuario);
  }

  async function registrar(nome: string, email: string, senha: string) {
    const data = await api<{ usuario: Usuario }>('/auth/registrar', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });
    setUsuario(data.usuario);
  }

  function sair() {
    setUsuario(null);
    // Cookie HttpOnly é removido pelo backend — só redirecionar
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, registrar, sair, recarregar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
