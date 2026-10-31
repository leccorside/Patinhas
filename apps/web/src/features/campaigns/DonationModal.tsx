import React, { useState } from 'react';
import { X, Heart, Copy, Check, Sparkles } from 'lucide-react';
import { Campaign, campaignsService } from './campaignsService';

interface DonationModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDonated: (updated: Campaign) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  campaign,
  onClose,
  onDonated,
}) => {
  const [amount, setAmount] = useState<number>(50);
  const [donorName, setDonorName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const pixKey = campaign.pixKey || 'pix@patinhasdeluz.org';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmDonation = async () => {
    if (amount < 5) return;
    setLoading(true);
    try {
      const res = await campaignsService.registerDonation(
        campaign.id,
        amount,
        donorName.trim() || undefined,
      );
      setSuccess(true);
      setTimeout(() => {
        onDonated(res.campaign);
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar doação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Apoiar Campanha</h3>
              <p className="text-xs text-gray-600 truncate max-w-[260px]">{campaign.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Doação Confirmada!</h4>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Muito obrigado pelo seu carinho e generosidade. Você acabou de salvar e transformar um destino animal! 🐾
              </p>
            </div>
          ) : (
            <>
              {/* Valores Rápidos */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Escolha o valor da contribuição
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 100, 250].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        amount === val
                          ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-xs'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor customizado */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ou digite outro valor (R$)
                </label>
                <input
                  type="number"
                  min="5"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>

              {/* Nome do doador */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seu nome ou recado carinhoso (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mariana com carinho pro Bento"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>

              {/* Box Chave PIX da ONG */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Chave PIX da Organização:</span>
                  <span className="font-semibold text-gray-700">Aleatória / E-mail</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixKey}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-700 focus:outline-hidden"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 text-center">
                  Abra seu app bancário, transfira via PIX e clique abaixo para confirmar seu apoio na plataforma.
                </p>
              </div>

              {/* Botão de confirmação */}
              <button
                onClick={handleConfirmDonation}
                disabled={loading || amount < 5}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Heart className="w-4 h-4 fill-white" />
                {loading ? 'Confirmando...' : `Confirmar Apoio de R$ ${amount}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
