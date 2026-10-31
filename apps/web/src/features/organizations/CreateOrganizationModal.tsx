import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Dialog, PrimaryButton, SecondaryButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSuccess?: () => void;
}

export function CreateOrganizationModal({
  isOpen,
  onClose,
  showToast,
  onSuccess,
}: CreateOrganizationModalProps) {
  const { token, checkAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !city || !state) {
      showToast('Preencha os campos obrigatórios da ONG', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3333/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          tradeName,
          cnpj: cnpj || undefined,
          email,
          phone,
          addressCity: city,
          addressState: state,
          bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('ONG cadastrada com sucesso! 🏢🐾', 'success');
      await checkAuth();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erro ao cadastrar organização', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar ONG ou Abrigo"
      description="Crie o perfil institucional para gerenciar animais, equipe e adoções."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="text-xs font-bold text-charcoal">Razão Social / Nome da ONG *</label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-3.5 text-charcoal-muted pointer-events-none">
              <Building2 size={15} />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Associação Protetora dos Animais"
              required
              className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-charcoal">Nome Fantasia (Como é conhecida)</label>
          <input
            type="text"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            placeholder="Ex: Patinhas do Bem"
            className="mt-1 w-full rounded-2xl bg-white py-2.5 px-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-charcoal">CNPJ (Opcional)</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
              className="mt-1 w-full rounded-2xl bg-white py-2.5 px-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal">Telefone / Whats</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98888-0000"
              className="mt-1 w-full rounded-2xl bg-white py-2.5 px-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-charcoal">E-mail Institucional *</label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-3.5 text-charcoal-muted pointer-events-none">
              <Mail size={15} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@ong.org"
              required
              className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-charcoal">Cidade *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="mt-1 w-full rounded-2xl bg-white py-2.5 px-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal">Estado *</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              maxLength={2}
              required
              className="mt-1 w-full rounded-2xl bg-white py-2.5 px-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none uppercase"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-charcoal">Sobre a Instituição</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Conte a história do abrigo e sua atuação..."
            className="mt-1 w-full rounded-2xl bg-white p-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <SecondaryButton variant="outline" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" isLoading={isLoading}>
            Finalizar Cadastro
          </PrimaryButton>
        </div>
      </form>
    </Dialog>
  );
}

export default CreateOrganizationModal;

