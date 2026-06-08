import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const { entrar } = useAuth();
  const navigate   = useNavigate();
  const [erro, setErro] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Form) {
    setErro('');
    try {
      await entrar(data.email, data.senha);
      navigate('/app');
    } catch (e) {
      setErro((e as Error).message || 'Email ou senha inválidos');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OfertaRelay</h1>
          <p className="text-sm text-gray-500 mt-1">Automatize suas ofertas</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-5">Entrar na sua conta</h2>

          <Alert message={erro} />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="seu@email.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Senha</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <input {...register('senha')} type="password" className="input" placeholder="••••••••" />
              {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary py-2.5 mt-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Não tem conta?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
