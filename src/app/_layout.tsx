import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  useFonts,
} from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Tema } from '@/constants/tema';
import { ProvedorConta } from '@/lib/conta-contexto';
import { ProvedorJornada } from '@/lib/jornada-contexto';

SplashScreen.preventAutoHideAsync();

export default function Raiz() {
  const [fontesProntas] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  // Rede de segurança: quem esconde a splash é a porta (src/app/index.tsx),
  // para a abertura não rodar por baixo dela. Se por algum motivo a porta não
  // montar, a splash sai sozinha alguns instantes depois das fontes.
  useEffect(() => {
    if (!fontesProntas) return;
    const relogio = setTimeout(() => void SplashScreen.hideAsync().catch(() => {}), 2500);
    return () => clearTimeout(relogio);
  }, [fontesProntas]);

  if (!fontesProntas) return <View style={{ flex: 1, backgroundColor: Tema.fundo }} />;

  return (
    <ProvedorConta>
      <ProvedorJornada>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Tema.fundo },
          }}>
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="entrar" options={{ animation: 'fade' }} />
          <Stack.Screen name="(abas)" options={{ animation: 'fade' }} />
          <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
          <Stack.Screen name="avaliacao" options={{ presentation: 'modal' }} />
          <Stack.Screen name="mas" options={{ presentation: 'modal' }} />
        </Stack>
      </ProvedorJornada>
    </ProvedorConta>
  );
}
