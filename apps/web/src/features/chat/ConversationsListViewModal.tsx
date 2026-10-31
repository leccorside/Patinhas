import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  X,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { chatService, ConversationSummary } from './chatService';

interface ConversationsListViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (convId: string) => void;
  currentUserId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ConversationsListViewModal: React.FC<ConversationsListViewModalProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  currentUserId,
  showToast,
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await chatService.getUserConversations();
      setConversations(data);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar conversas.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-[430px] h-[92vh] max-h-[92vh] flex flex-col bg-[#FAFAF8] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="h-16 px-5 bg-white border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              <MessageCircle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-charcoal">Minhas Conversas</h2>
              <p className="text-[11px] text-charcoal-muted">Chat direto com abrigos e adotantes</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={loadConversations}
              className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-muted hover:bg-neutral-100"
              title="Atualizar"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-primary' : ''} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-muted hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-charcoal-muted text-xs">
              <RefreshCw size={24} className="animate-spin text-primary mb-2" />
              Carregando suas mensagens...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-2">
                💬
              </div>
              <h3 className="text-sm font-bold text-charcoal">Nenhuma conversa iniciada</h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed max-w-[240px]">
                Inicie uma conversa através da página do pet ou da sua solicitação de adoção.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isAdopter = conv.adopterId === currentUserId;
              const partner = isAdopter ? conv.host : conv.adopter;
              const partnerName =
                partner?.profile?.fullName ||
                conv.animal.organization?.name ||
                'Responsável pelo Pet';

              const lastMsg = conv.messages?.[0];
              const timeStr = lastMsg?.createdAt
                ? new Date(lastMsg.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })
                : new Date(conv.lastMessageAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  });

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                  }}
                  className="w-full text-left bg-white p-3.5 rounded-2xl border border-neutral-100 hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                    <img
                      src={
                        conv.animal.photos?.[0]?.url ||
                        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'
                      }
                      alt={conv.animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full ring-1 ring-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-charcoal truncate">
                        {conv.animal.name}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {timeStr}
                      </span>
                    </div>

                    <p className="text-[11px] text-secondary font-semibold truncate mt-0.5">
                      {partnerName}
                    </p>

                    <p className="text-[11px] text-charcoal-muted truncate mt-0.5">
                      {lastMsg ? lastMsg.content : 'Conversa aberta. Diga olá! 🐾'}
                    </p>
                  </div>

                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

