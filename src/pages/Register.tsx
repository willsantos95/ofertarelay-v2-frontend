import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';

const schema = z.object({
  nome:  z.string().min(1, 'Nome obrigatório').max(100),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});
type Form = z.infer<typeof schema>;

export default function Register() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Form) {
    setErro('');
    try {
      await registrar(data.nome, data.email, data.senha);
      navigate('/whatsapp');
    } catch (e) {
      setErro((e as Error).message || 'Erro ao criar conta');
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
          <p className="text-sm text-gray-500 mt-1">15 dias grátis para começar</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-5">Criar conta</h2>

          <Alert message={erro} />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label">Nome completo</label>
              <input {...register('nome')} className="input" placeholder="Seu nome" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="seu@email.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Senha</label>
              <input {...register('senha')} type="password" className="input" placeholder="Mínimo 6 caracteres" />
              {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary py-2.5 mt-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
