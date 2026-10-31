import React, { useState } from 'react';
import { Camera, User, Phone, MapPin, FileText } from 'lucide-react';
import { Dialog, PrimaryButton, SecondaryButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  showToast,
}: EditProfileModalProps) {
  const { user, token, checkAuth } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState('(11) 98888-0000');
  const [bio, setBio] = useState('Amante de animais, moro em casa com quintal telado.');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview imediato
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload real para o MinIO via API
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('http://localhost:3333/api/v1/users/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('Foto atualizada no MinIO com sucesso! 📸', 'success');
      await checkAuth();
    } catch (err: any) {
      showToast(err.message || 'Erro ao enviar foto para o MinIO', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3333/api/v1/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          phone,
          bio,
          addressCity: city,
          addressState: state,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('Dados do perfil atualizados!', 'success');
      await checkAuth();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar dados', 'error');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Perfil"
      description="Atualize suas informações pessoais e foto de perfil."
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Upload de Avatar com Câmera */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8A65] to-[#FF7043] text-2xl font-bold text-white shadow-coral overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                fullName.charAt(0) || 'U'
              )}
            </div>

            <label className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md cursor-pointer hover:bg-primary-dark transition-colors">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </label>
          </div>
          <span className="mt-1.5 text-[10px] text-charcoal-muted">
            {isUploading ? 'Enviando foto ao MinIO...' : 'Toque no ícone para alterar'}
          </span>
        </div>

        <div>
          <label className="text-xs font-bold text-charcoal">Nome Completo</label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-3.5 text-charcoal-muted pointer-events-none">
              <User size={15} />
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-charcoal">Telefone / WhatsApp</label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-3.5 text-charcoal-muted pointer-events-none">
              <Phone size={15} />
            </span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-charcoal">Cidade</label>
            <div className="relative mt-1 flex items-center">
              <span className="absolute left-3 text-charcoal-muted pointer-events-none">
                <MapPin size={14} />
              </span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full rounded-2xl bg-white py-2.5 pl-8 pr-2 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal">Estado</label>
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
          <label className="text-xs font-bold text-charcoal">Sobre Mim (Biografia)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-2xl bg-white p-3 text-xs font-medium text-charcoal border border-gray-200 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <SecondaryButton variant="outline" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit">
            Salvar Alterações
          </PrimaryButton>
        </div>
      </form>
    </Dialog>
  );
}

export default EditProfileModal;

