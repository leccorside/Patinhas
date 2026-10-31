import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

interface LoginViewProps {
  onSuccess?: () => void;
  onNavigateToRegister: () => void;
  onForgotPassword: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function LoginView({
  onSuccess,
  onNavigateToRegister,
  onForgotPassword,
  showToast,
}: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Preencha seu e-mail e senha', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3333/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha no login');
      }

      setUser(data.user, data.accessToken);
      showToast(`Bem-vindo de volta, ${data.user.fullName}! 🐾`, 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Erro ao conectar ao servidor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Preenchimento de teste com 1 clique
  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('Patinhas@2026');
  };

  return (
    <div className="flex flex-col py-2 px-1">
      {/* Cabeçalho de Boas-vindas */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-tertiary text-3xl shadow-sm mb-3">
          🐾
        </div>
        <h2 className="text-2xl font-extrabold text-charcoal">Bem-vindo de volta!</h2>
        <p className="mt-1 text-xs text-charcoal-muted">
          Entre na sua conta para acompanhar adoções e mensagens
        </p>
      </div>

      {/* Formulário de Login */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-charcoal">E-mail</label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-4 text-charcoal-muted pointer-events-none">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
              className="
                w-full
                rounded-2xl
                bg-white
                py-3.5
                pl-11
                pr-4
                text-sm
                font-medium
                text-charcoal
                placeholder-charcoal-muted
                shadow-card
                border
                border-gray-100
                focus:border-primary
                focus:outline-none
                focus:ring-2
                focus:ring-primary/20
              "
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-charcoal">Senha</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-bold text-primary hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="relative mt-1 flex items-center">
            <span className="absolute left-4 text-charcoal-muted pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha secreta"
              required
              className="
                w-full
                rounded-2xl
                bg-white
                py-3.5
                pl-11
                pr-11
                text-sm
                font-medium
                text-charcoal
                placeholder-charcoal-muted
                shadow-card
                border
                border-gray-100
                focus:border-primary
                focus:outline-none
                focus:ring-2
                focus:ring-primary/20
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-charcoal-muted hover:text-charcoal"
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <PrimaryButton type="submit" isLoading={isLoading} showArrow>
            Entrar na Conta
          </PrimaryButton>
        </div>
      </form>

      {/* Separador */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200/80" />
        </div>
        <span className="relative bg-background px-3 text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">
          Ou teste com 1 clique
        </span>
      </div>

      {/* Atalhos Rápidos para Teste */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleQuickLogin('lucas.adotante@gmail.com')}
          className="flex flex-col items-center justify-center rounded-2xl bg-white p-2.5 text-center shadow-card border border-gray-100 hover:border-primary/40 active:scale-95 transition-all"
        >
          <span className="text-base">🧑‍💼</span>
          <span className="mt-1 text-[10px] font-bold text-charcoal">Adotante</span>
          <span className="text-[9px] text-charcoal-muted">Lucas</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin('contato@patinhasdeluz.org')}
          className="flex flex-col items-center justify-center rounded-2xl bg-white p-2.5 text-center shadow-card border border-gray-100 hover:border-primary/40 active:scale-95 transition-all"
        >
          <span className="text-base">🏢</span>
          <span className="mt-1 text-[10px] font-bold text-charcoal">ONG Líder</span>
          <span className="text-[9px] text-charcoal-muted">Patinhas Luz</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin('admin@patinhas.org')}
          className="flex flex-col items-center justify-center rounded-2xl bg-white p-2.5 text-center shadow-card border border-gray-100 hover:border-primary/40 active:scale-95 transition-all"
        >
          <span className="text-base">👑</span>
          <span className="mt-1 text-[10px] font-bold text-charcoal">Admin</span>
          <span className="text-[9px] text-charcoal-muted">Master</span>
        </button>
      </div>

      {/* Link de Cadastro */}
      <div className="mt-8 text-center">
        <p className="text-xs text-charcoal-muted">
          Ainda não tem uma conta?{' '}
          <button
            onClick={onNavigateToRegister}
            className="font-bold text-primary hover:underline"
          >
            Cadastre-se gratuitamente
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginView;

