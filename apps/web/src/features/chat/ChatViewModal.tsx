import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Phone,
  Info,
  Send,
  Image,
  Check,
  CheckCheck,
  ShieldCheck,
  Paperclip,
  X,
  RefreshCw,
} from 'lucide-react';
import { chatService, ChatMessage, ConversationSummary } from './chatService';

interface ChatViewModalProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ChatViewModal: React.FC<ChatViewModalProps> = ({
  conversationId,
  isOpen,
  onClose,
  currentUserId,
  showToast,
}) => {
  const [conversation, setConversation] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carrega histórico e inicializa WebSocket
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    let isMounted = true;
    const socket = chatService.getSocket();

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await chatService.getConversationMessages(conversationId);
        if (isMounted) {
          setConversation(data.conversation);
          setMessages(data.messages);
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao carregar conversa.', 'error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHistory();
    chatService.joinRoom(conversationId);

    // Escuta novas mensagens em tempo real
    const onReceiveMessage = (newMsg: ChatMessage) => {
      if (newMsg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      }
    };

    const onTypingStart = (data: { conversationId: string; userName: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setIsTyping(true);
        setTypingUserName(data.userName);
      }
    };

    const onTypingStop = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setIsTyping(false);
      }
    };

    const onMessagesRead = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === currentUserId ? { ...msg, isRead: true } : msg))
        );
      }
    };

    socket.on('receive_message', onReceiveMessage);
    socket.on('user_typing_start', onTypingStart);
    socket.on('user_typing_stop', onTypingStop);
    socket.on('messages_read', onMessagesRead);

    return () => {
      isMounted = false;
      chatService.leaveRoom(conversationId);
      socket.off('receive_message', onReceiveMessage);
      socket.off('user_typing_start', onTypingStart);
      socket.off('user_typing_stop', onTypingStop);
      socket.off('messages_read', onMessagesRead);
    };
  }, [conversationId, isOpen, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    const userName =
      conversation?.adopterId === currentUserId
        ? conversation.adopter.profile?.fullName || 'Adotante'
        : conversation?.host.profile?.fullName || 'Protetor';

    chatService.emitTypingStart(conversationId, userName);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatService.emitTypingStop(conversationId);
    }, 1500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedAttachment) || isSending) return;

    setIsSending(true);
    let attachmentUrl: string | undefined = undefined;

    try {
      if (selectedAttachment) {
        const uploadRes = await chatService.uploadAttachment(selectedAttachment);
        attachmentUrl = uploadRes.url;
      }

      const content = inputText.trim() || 'Foto enviada';

      // Envia via Socket ou REST
      const socket = chatService.getSocket();
      if (socket.connected) {
        socket.emit('send_message', {
          conversationId,
          content,
          attachmentUrl,
        });
      } else {
        const sent = await chatService.sendMessageRest(conversationId, content, attachmentUrl);
        setMessages((prev) => [...prev, sent]);
      }

      setInputText('');
      setSelectedAttachment(null);
      setAttachmentPreview(null);
      chatService.emitTypingStop(conversationId);
      scrollToBottom();
    } catch (err: any) {
      showToast(err.message || 'Erro ao enviar mensagem.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  // Descobre dados do outro participante
  const isAdopter = conversation?.adopterId === currentUserId;
  const partnerName = isAdopter
    ? conversation?.host.profile?.fullName || conversation?.animal.organization?.name || 'Protetor'
    : conversation?.adopter.profile?.fullName || 'Adotante Interessado';

  const partnerRole = isAdopter
    ? conversation?.animal.organization?.name
      ? `ONG ${conversation.animal.organization.name} • Online`
      : 'Protetor Independente • Online'
    : 'Candidato a Adotante • Online';

  const partnerAvatar = isAdopter
    ? conversation?.host.profile?.avatarUrl
    : conversation?.adopter.profile?.avatarUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-3">
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-[430px] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#FAFAF8] shadow-2xl overflow-hidden relative"
      >
        {/* Top Header Bar */}
        <header className="h-16 px-4 bg-white/95 backdrop-blur-md border-b border-neutral-100 flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-full text-charcoal hover:bg-neutral-100 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              🐾
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-extrabold text-charcoal truncate">
                Chat da Adoção
              </h1>
              <span className="text-[10px] text-charcoal-muted truncate">
                {conversation?.animal.name ? `Sobre ${conversation.animal.name}` : 'Patinhas'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => showToast('Link de compartilhamento copiado!', 'info')}
              className="w-9 h-9 flex items-center justify-center rounded-full text-charcoal-muted hover:bg-neutral-100 transition-colors"
              title="Compartilhar"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full text-charcoal-muted hover:bg-neutral-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Container (Context Headers + Messages) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Top Pet Status Mini Card */}
          {conversation?.animal && (
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-neutral-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                  <img
                    src={conversation.animal.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                    alt={conversation.animal.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full ring-1 ring-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-charcoal truncate">
                      {conversation.animal.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {conversation.animal.breed || 'Pet'}
                    </span>
                  </div>
                  <span className="text-[10px] text-charcoal-muted truncate">
                    Protocolo #{conversation.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 whitespace-nowrap">
                Canal Oficial
              </span>
            </div>
          )}

          {/* Safety Trust Banner */}
          <div className="bg-secondary/10 rounded-2xl p-2.5 flex items-start gap-2 border border-secondary/20 text-xs">
            <ShieldCheck size={16} className="text-secondary mt-0.5 flex-shrink-0" />
            <div className="leading-snug text-charcoal">
              <span className="font-bold text-secondary text-[11px] block">Adoção Segura & 100% Gratuita</span>
              <p className="text-[10px] text-neutral-600 mt-0.5">
                Nunca realize transferências ou pagamentos de taxas. Tire dúvidas e combine o processo diretamente aqui.
              </p>
            </div>
          </div>

          {/* Chat Partner Header Card */}
          <div className="bg-white rounded-2xl p-2.5 flex items-center justify-between border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-primary text-xs">
                    {partnerName.charAt(0)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-charcoal truncate">{partnerName}</span>
                <span className="text-[10px] text-secondary flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                  {partnerRole}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => showToast(`Iniciando chamada para ${partnerName}...`, 'info')}
                className="w-8 h-8 rounded-full bg-neutral-100 text-charcoal flex items-center justify-center hover:bg-neutral-200 transition-colors"
                title="Ligar"
              >
                <Phone size={14} />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-center my-1">
              <span className="bg-neutral-200/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-charcoal-muted">
                Hoje
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6 text-charcoal-muted text-xs">
                <RefreshCw size={18} className="animate-spin text-primary mr-2" />
                Carregando mensagens...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-6 px-4 bg-white rounded-2xl border border-neutral-100 text-xs text-charcoal-muted">
                <p className="font-bold text-charcoal">Nenhuma mensagem ainda.</p>
                <p className="text-[11px] mt-0.5">
                  Dê o primeiro passo e envie uma mensagem com carinho para o responsável! 🐾
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const timeStr = new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                      isMe ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-primary to-[#FF8A65] text-white rounded-tr-sm'
                          : 'bg-white text-charcoal rounded-tl-sm border border-neutral-100'
                      }`}
                    >
                      {/* Imagem anexa caso exista */}
                      {msg.attachmentUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden max-h-48 bg-black/10">
                          <img
                            src={msg.attachmentUrl}
                            alt="Anexo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-charcoal-muted">
                      <span>{timeStr}</span>
                      {isMe && (
                        <span>
                          {msg.isRead ? (
                            <CheckCheck size={13} className="text-secondary inline" />
                          ) : (
                            <Check size={13} className="inline text-neutral-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Indicador de Digitação ("digitando...") */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-1.5 bg-white p-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-100 w-fit text-xs text-charcoal-muted"
                >
                  <span className="text-[11px]">{typingUserName || 'Alguém'} está digitando</span>
                  <div className="flex gap-1 items-center ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Preview de anexo antes do envio */}
        {attachmentPreview && (
          <div className="p-2.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img
                src={attachmentPreview}
                alt="Preview"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="text-xs font-semibold text-charcoal truncate max-w-[200px]">
                {selectedAttachment?.name}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedAttachment(null);
                setAttachmentPreview(null);
              }}
              className="p-1 text-charcoal-muted hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Bottom Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2 flex-shrink-0"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-neutral-100 text-charcoal-muted hover:text-primary hover:bg-neutral-200 flex items-center justify-center flex-shrink-0 transition-colors"
            title="Anexar Foto do Quintal / Comprovante"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem com amor..."
            className="flex-1 h-10 px-4 rounded-full bg-neutral-100 text-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedAttachment) || isSending}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30 hover:opacity-95 disabled:opacity-50 transition-all active:scale-95"
            aria-label="Enviar"
          >
            <Send size={16} className={isSending ? 'animate-spin' : ''} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

