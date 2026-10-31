import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  X,
  Heart,
  MessageCircle,
  Video,
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { notificationsService, AppNotification } from './notificationsService';

interface NotificationsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (actionUrl: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const NotificationsViewModal: React.FC<NotificationsViewModalProps> = ({
  isOpen,
  onClose,
  onActionClick,
  showToast,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'adoptions' | 'matches' | 'messages'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      if ('Notification' in window) {
        setPushPermission(Notification.permission);
      }
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('Todas as notificações foram marcadas como lidas!', 'success');
    } catch {
      showToast('Erro ao marcar notificações.', 'error');
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignora erro silencioso
    }
  };

  const handleEnablePush = async () => {
    setIsSubscribingPush(true);
    try {
      const res = await notificationsService.subscribeToWebPush();
      setPushPermission('granted');
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Não foi possível ativar as notificações push.', 'error');
    } finally {
      setIsSubscribingPush(false);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filtragem
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'adoptions') {
      return [
        'NEW_APPLICATION',
        'APPLICATION_APPROVED',
        'APPLICATION_REJECTED',
        'INTERVIEW_SCHEDULED',
        'FAVORITE_ADOPTED',
      ].includes(n.type);
    }
    if (filter === 'matches') {
      return ['NEW_NEARBY_ANIMAL', 'PET_LOST_ALERT'].includes(n.type);
    }
    if (filter === 'messages') {
      return n.type === 'NEW_MESSAGE';
    }
    return true;
  });

  // Categorização Hoje vs Anteriores
  const today = new Date().toDateString();
  const todayList = filteredNotifications.filter(
    (n) => new Date(n.createdAt).toDateString() === today
  );
  const earlierList = filteredNotifications.filter(
    (n) => new Date(n.createdAt).toDateString() !== today
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-[430px] h-[92vh] max-h-[92vh] flex flex-col bg-[#FAFAF8] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Header Bar */}
        <div className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-charcoal">Notificações</h1>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold text-[11px]">
                {unreadCount} novas
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-primary text-xs font-bold hover:underline"
              >
                <CheckCheck size={15} />
                <span>Ler todas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-muted hover:bg-neutral-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="bg-white px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-neutral-100 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              filter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] opacity-80">({notifications.length})</span>
          </button>

          <button
            onClick={() => setFilter('adoptions')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              filter === 'adoptions'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Adoções</span>
          </button>

          <button
            onClick={() => setFilter('matches')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              filter === 'matches'
                ? 'bg-secondary text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Pets & Match</span>
          </button>

          <button
            onClick={() => setFilter('messages')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              filter === 'messages'
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <MessageCircle size={13} />
            <span>Mensagens</span>
          </button>
        </div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Opt-in Banner de Web Push se não autorizado ainda */}
          {pushPermission === 'default' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-amber-50 to-secondary/10 border border-primary/20 flex items-start gap-3 shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-primary/30">
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-charcoal">
                  Ativar Notificações no Celular? 📲
                </h4>
                <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                  Receba avisos instantâneos quando seu pedido de adoção avançar ou quando a ONG enviar uma mensagem.
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEnablePush}
                    disabled={isSubscribingPush}
                    className="px-3 py-1.5 rounded-full bg-primary text-white font-bold text-xs hover:opacity-95 shadow-sm active:scale-95 transition-all"
                  >
                    {isSubscribingPush ? 'Ativando...' : 'Permitir Notificações'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-charcoal-muted text-xs">
              <RefreshCw size={24} className="animate-spin text-primary mb-2" />
              Carregando notificações...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-2xl mb-2">
                🔕
              </div>
              <h3 className="text-sm font-bold text-charcoal">Tudo limpo por aqui!</h3>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed max-w-[240px]">
                Você não possui notificações pendentes nesta categoria.
              </p>
            </div>
          ) : (
            <>
              {/* Seção Hoje */}
              {todayList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h3 className="text-xs font-extrabold text-charcoal">Hoje</h3>
                  </div>

                  {todayList.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      onRead={() => handleMarkSingleRead(notif.id)}
                      onActionClick={onActionClick}
                    />
                  ))}
                </div>
              )}

              {/* Seção Anteriores */}
              {earlierList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    <h3 className="text-xs font-extrabold text-neutral-600">Anteriores</h3>
                  </div>

                  {earlierList.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      onRead={() => handleMarkSingleRead(notif.id)}
                      onActionClick={onActionClick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface NotificationItemProps {
  notif: AppNotification;
  onRead: () => void;
  onActionClick?: (url: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notif, onRead, onActionClick }) => {
  const getIconAndStyle = (type: string) => {
    switch (type) {
      case 'INTERVIEW_SCHEDULED':
        return {
          icon: <Video size={16} className="text-primary" />,
          bg: 'bg-primary/10',
          badgeText: 'Entrevista',
        };
      case 'APPLICATION_APPROVED':
        return {
          icon: <Heart size={16} className="text-emerald-600 fill-emerald-600" />,
          bg: 'bg-emerald-50',
          badgeText: 'Aprovado 🎉',
        };
      case 'NEW_MESSAGE':
        return {
          icon: <MessageCircle size={16} className="text-secondary" />,
          bg: 'bg-secondary/15',
          badgeText: 'Mensagem',
        };
      case 'NEW_NEARBY_ANIMAL':
        return {
          icon: <Sparkles size={16} className="text-amber-600" />,
          bg: 'bg-amber-50',
          badgeText: 'Novo Pet Próximo',
        };
      default:
        return {
          icon: <Bell size={16} className="text-primary" />,
          bg: 'bg-neutral-100',
          badgeText: 'Aviso',
        };
    }
  };

  const styleInfo = getIconAndStyle(notif.type);
  const timeFormatted = new Date(notif.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      onClick={onRead}
      className={`p-3.5 rounded-2xl border transition-all relative ${
        notif.isRead
          ? 'bg-white border-neutral-100 hover:border-neutral-200'
          : 'bg-white border-primary/20 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${styleInfo.bg}`}
        >
          {styleInfo.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {styleInfo.badgeText}
            </span>
            <span className="text-[10px] text-neutral-400">{timeFormatted}</span>
          </div>

          <h4 className="text-xs font-bold text-charcoal leading-tight mt-1">{notif.title}</h4>
          <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">{notif.body}</p>

          {notif.actionUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead();
                if (onActionClick && notif.actionUrl) {
                  onActionClick(notif.actionUrl);
                }
              }}
              className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <span>Ver detalhes</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {/* Ponto indicador de não lida */}
        {!notif.isRead && (
          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1 shadow-sm" />
        )}
      </div>
    </article>
  );
};
