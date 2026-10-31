export interface AppNotification {
  id: string;
  userId: string;
  type:
    | 'NEW_MESSAGE'
    | 'NEW_APPLICATION'
    | 'APPLICATION_APPROVED'
    | 'APPLICATION_REJECTED'
    | 'INTERVIEW_SCHEDULED'
    | 'FAVORITE_ADOPTED'
    | 'NEW_NEARBY_ANIMAL'
    | 'PET_LOST_ALERT'
    | 'EVENT_REMINDER'
    | 'POST_ADOPTION_CHECKLIST'
    | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  body: string;
  actionUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailMessages: boolean;
  pushMessages: boolean;
  emailStatusChange: boolean;
  pushStatusChange: boolean;
  emailRecommendations: boolean;
  pushRecommendations: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const notificationsService = {
  /**
   * Listar notificações do usuário
   */
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch('/api/v1/notifications', {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },

  /**
   * Marcar uma notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    await fetch('/api/v1/notifications/read-all', {
      method: 'POST',
      credentials: 'include',
    });
  },

  /**
   * Buscar preferências
   */
  async getPreferences(): Promise<NotificationPreferences | null> {
    const res = await fetch('/api/v1/notifications/preferences', {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  },

  /**
   * Atualizar preferências
   */
  async updatePreferences(data: Partial<NotificationPreferences>): Promise<void> {
    await fetch('/api/v1/notifications/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  /**
   * Solicitar permissão e inscrever navegador no Web Push
   */
  async subscribeToWebPush(): Promise<{ success: boolean; message: string }> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Notificações Web Push não são suportadas neste navegador.');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão de notificações não concedida pelo usuário.');
    }

    // Registra Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Obtém chave VAPID pública da API
    const keyRes = await fetch('/api/v1/notifications/push/public-key');
    const { publicKey } = await keyRes.json();

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Inscreve no push manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Envia inscrição para a API
    const subJSON = subscription.toJSON();
    const res = await fetch('/api/v1/notifications/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subJSON.keys?.p256dh,
          auth: subJSON.keys?.auth,
        },
        userAgent: navigator.userAgent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao salvar inscrição push no servidor.');
    }

    return {
      success: true,
      message: 'Notificações ativadas com sucesso! 🐾',
    };
  },
};
