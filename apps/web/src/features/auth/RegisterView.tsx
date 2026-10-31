import React, { useState } from 'react';
import { User, Mail, Lock, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { PrimaryButton } from '../../components';

interface RegisterViewProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function RegisterView({
  onSuccess,
  onNavigateToLogin,
  showToast,
}: RegisterViewProps) {
  const [role, setRole] = useState<'ADOPTER' | 'PROTECTOR' | 'SHELTER_MEMBER'>('ADOPTER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      showToast('Você deve concordar com os Termos de Uso e Privacidade', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3333/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          city,
          state,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha ao realizar cadastro');
      }

      setRegisteredSuccess(true);
      showToast('Cadastro realizado com sucesso! Verifique seu e-mail.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erro ao cadastrar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center px-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
          <CheckCircle size={40} />
        </div>
        <h3 className="text-2xl font-extrabold text-charcoal">Conta Criada!</h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-muted max-w-[320px]">
          Enviamos uma mensagem de ativação para <strong>{email}</strong>.
        </p>

        <div className="mt-5 rounded-2xl bg-tertiary p-4 text-xs text-[#641800] border border-[#FFE0B2]">
          <p className="font-bold">Dica de Desenvolvimento Local:</p>
          <p className="mt-1">
            Abra o Mailpit em <strong>http://localhost:8026</strong> para visualizar o e-mail de confirmação enviado.
          </p>
        </div>

        <div className="mt-6 w-full">
          <PrimaryButton onClick={onNavigateToLogin}>
            Ir para o Login
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-2 px-1">
      {/* Cabeçalho */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-extrabold text-charcoal">Crie sua Conta</h2>
        <p className="mt-1 text-xs text-charcoal-muted">
          Faça parte da maior rede de adoção responsável
        </p>
      </div>

      {/* Seletor de Perfil */}
      <div className="mb-4">
        <label className="text-xs font-bold text-charcoal">Eu sou:</label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRole('ADOPTER')}
            className={`flex flex-col items-center justify-center rounded-2xl p-2.5 text-center border transition-all ${
              role === 'ADOPTER'
                ? 'bg-primary text-white border-primary shadow-coral'
                : 'bg-white text-charcoal border-gray-200'
            }`}
          >
            <span className="text-base">🏡</span>
            <span className="mt-1 text-[11px] font-bold">Adotante</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('PROTECTOR')}
            className={`flex flex-col items-center justify-center rounded-2xl p-2.5 text-center border transition-all ${
              role === 'PROTECTOR'
                ? 'bg-primary text-white border-primary shadow-coral'
                : 'bg-white text-charcoal border-gray-200'
            }`}
          >
            <span className="text-base">🐕</span>
            <span className="mt-1 text-[11px] font-bold">Protetor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('SHELTER_MEMBER')}
            className={`flex flex-col items-center justify-center rounded-2xl p-2.5 text-center border transition-all ${
              role === 'SHELTER_MEMBER'
                ? 'bg-primary text-white border-primary shadow-coral'
                : 'bg-white text-charcoal border-gray-200'
            }`}
          >
            <span className="text-base">🏢</span>
            <span className="mt-1 text-[11px] font-bold">ONG</span>
          </button>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold text-charcoal">Nome Completo</label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-4 text-charcoal-muted pointer-events-none">
              <User size={16} />
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Como quer ser chamado"
              required
              className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium text-charcoal shadow-card border border-gray-100 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

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
              className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium text-charcoal shadow-card border border-gray-100 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-charcoal">Senha (mínimo 6 caracteres)</label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-4 text-charcoal-muted pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm font-medium text-charcoal shadow-card border border-gray-100 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-charcoal">Cidade</label>
            <div className="relative mt-1 flex items-center">
              <span className="absolute left-3.5 text-charcoal-muted pointer-events-none">
                <MapPin size={15} />
              </span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                required
                className="w-full rounded-2xl bg-white py-3 pl-10 pr-3 text-sm font-medium text-charcoal shadow-card border border-gray-100 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal">Estado</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="SP"
              maxLength={2}
              required
              className="mt-1 w-full rounded-2xl bg-white py-3 px-4 text-sm font-medium text-charcoal shadow-card border border-gray-100 focus:border-primary focus:outline-none uppercase"
            />
          </div>
        </div>

        {/* Checkbox Termos de Uso / LGPD */}
        <label className="mt-3 flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary border-gray-300"
          />
          <span className="text-[11px] text-charcoal-muted leading-tight">
            Li e concordo com os <strong>Termos de Uso</strong> e autorizo o tratamento de dados pessoais conforme a <strong>LGPD</strong>.
          </span>
        </label>

        <div className="pt-2">
          <PrimaryButton type="submit" isLoading={isLoading} showArrow>
            Criar Minha Conta
          </PrimaryButton>
        </div>
      </form>

      {/* Link para Login */}
      <div className="mt-6 text-center">
        <p className="text-xs text-charcoal-muted">
          Já possui cadastro?{' '}
          <button
            onClick={onNavigateToLogin}
            className="font-bold text-primary hover:underline"
          >
            Faça login aqui
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterView;

