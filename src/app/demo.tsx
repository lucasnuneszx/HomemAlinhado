import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Tema } from '@/constants/tema';
import type { Estado } from '@/lib/estado';
import { useJornada } from '@/lib/jornada-contexto';

/**
 * Só em desenvolvimento. Coloca a conta atual no dia 8 da jornada, com uma
 * semana feita, um dia perdido e reposto, o Índice da semana 1 e o retrato do
 * dia 1. Serve para apresentar o app e gravar vídeo sem esperar oito dias.
 *
 * Abrir: exp://<ip>:8081/--/demo
 */
function estadoDeDemonstracao(): Estado {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 7);
  inicio.setHours(9, 0, 0, 0);
  const em = inicio.toISOString();

  return {
    inicio: em,
    concluidos: [1, 2, 3, 4, 5, 6, 7],
    reposicoes: [3],
    respostas: {},
    notas: [{ semana: 1, deus: 7, consigo: 4, casa: 6 }],
    lembrete: { ativo: true, minutos: 6 * 60 },
    avaliacoes: [{ tipo: 'inicial', em, respostas: [2, 1, 3, 0, 1, 2, 3, 2, 2] }],
    mas: [{ dia: 3, motivo: 'tempo', em }],
    resgates: [],
    gastos: 0,
    melhorSeq: 4,
  };
}

export default function Demo() {
  const { carregado, substituir } = useJornada();

  useEffect(() => {
    if (!__DEV__ || !carregado) return;
    substituir(estadoDeDemonstracao());
    router.replace('/hoje');
  }, [carregado, substituir]);

  if (!__DEV__) return <Redirect href="/" />;
  return <View style={{ flex: 1, backgroundColor: Tema.fundo }} />;
}
