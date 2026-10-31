import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { Dialog, PrimaryButton, SecondaryButton } from '../../components';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  showToast,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3333/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setIsSent(true);
      showToast('Solicitação processada com sucesso!', 'success');
    } catch {
      showToast('Erro ao solicitar recuperação', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSent(false);
    setEmail('');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isSent ? 'Verifique seu e-mail' : 'Recuperar Senha'}
      description={
        isSent
          ? 'Enviamos as instruções para a sua caixa de entrada.'
          : 'Digite o e-mail cadastrado para receber o link de redefinição.'
      }
    >
      {isSent ? (
        <div className="text-center py-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle size={28} />
          </div>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Caso o e-mail <strong>{email}</strong> esteja cadastrado, você receberá um link válido por 1 hora.
          </p>

          <div className="mt-5">
            <PrimaryButton onClick={handleClose}>
              Entendi
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-charcoal">E-mail Cadastrado</label>
            <div className="relative mt-1 flex items-center">
              <span className="absolute left-3.5 text-charcoal-muted pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                className="w-full rounded-2xl bg-white py-3 pl-10 pr-4 text-sm font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <SecondaryButton variant="outline" onClick={handleClose}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" isLoading={isLoading}>
              Enviar Link
            </PrimaryButton>
          </div>
        </form>
      )}
    </Dialog>
  );
}

export default ForgotPasswordModal;

