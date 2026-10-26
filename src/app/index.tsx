import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Abertura } from '@/components/abertura';
import { Tema } from '@/constants/tema';
import { useConta } from '@/lib/conta-contexto';

/**
 * A porta do app. Mostra a abertura e, quando ela termina, manda para a
 * jornada ou para a entrada. A leitura da sessão acontece em paralelo, então
 * na prática a espera é só a da animação.
 */
export default function Porta() {
  const { usuario, convidado, carregado } = useConta();
  const [liberado, setLiberado] = useState(false);
  const [animacaoTerminou, setAnimacaoTerminou] = useState(false);

  // A abertura só começa depois que a splash sai de cena, senão a animação
  // roda por baixo dela e o usuário perde o começo.
  useEffect(() => {
    let vivo = true;
    SplashScreen.hideAsync()
      .catch(() => {})
      .then(() => new Promise((seguir) => setTimeout(seguir, 120)))
      .then(() => {
        if (vivo) setLiberado(true);
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!animacaoTerminou || !carregado) return;
    router.replace(usuario || convidado ? '/hoje' : '/entrar');
  }, [animacaoTerminou, carregado, convidado, usuario]);

  if (!liberado) return <View style={{ flex: 1, backgroundColor: Tema.fundo }} />;

  return <Abertura aoTerminar={() => setAnimacaoTerminou(true)} />;
}
