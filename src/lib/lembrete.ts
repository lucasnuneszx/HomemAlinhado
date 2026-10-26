import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Lembrete diário no horário escolhido. É notificação local: não precisa de
 * servidor, funciona sem internet e é o que sustenta a sequência.
 */

const ID_CANAL = 'lembrete-diario';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export async function pedirPermissao(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export async function agendarLembrete(minutosDoDia: number): Promise<boolean> {
  const permitido = await pedirPermissao();
  if (!permitido) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ID_CANAL, {
      name: 'Lembrete diário',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Seu tempo de hoje',
      body: 'Dois minutos agora valem mais do que uma hora quando der vontade.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: Math.floor(minutosDoDia / 60),
      minute: minutosDoDia % 60,
      channelId: Platform.OS === 'android' ? ID_CANAL : undefined,
    },
  });
  return true;
}

export async function cancelarLembrete(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function formatarHora(minutos: number): string {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}
