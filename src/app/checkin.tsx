import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/texto';
import { Botao, Divisor } from '@/components/ui';
import { Cores, Espaco, Fontes, Raio, Tema, Texto } from '@/constants/tema';
import { diaPorNumero, minutosTipo, rotuloTipo, tipoDoDia } from '@/content/jornada';
import { PONTOS } from '@/content/pontos';
import { useJornada } from '@/lib/jornada-contexto';
import { useAlturaTeclado } from '@/lib/teclado';

export default function Checkin() {
  const { dia: diaParam, repor } = useLocalSearchParams<{ dia?: string; repor?: string }>();
  const { dia: diaHoje, concluirDia } = useJornada();
  const dia = Number(diaParam) || diaHoje;
  const reposicao = repor === '1';
  const tijolos = reposicao
    ? PONTOS.reposicao
    : tipoDoDia(dia) === 'leitura'
      ? PONTOS.leitura
      : PONTOS.checkin;
  const conteudo = diaPorNumero(dia);
  const perguntas = conteudo.perguntas ?? [];

  const teclado = useAlturaTeclado();
  const { bottom } = useSafeAreaInsets();
  // O teclado cobre a área segura de baixo: só o que passa dela precisa de espaço.
  const folgaTeclado = Math.max(0, teclado - bottom);

  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<string[]>(() => perguntas.map(() => ''));

  const totalPassos = perguntas.length + 1; // o texto conta como primeiro passo
  const noTexto = passo === 0;
  const ultimo = passo === totalPassos - 1;

  function avancar() {
    void Haptics.selectionAsync();
    if (ultimo) {
      concluirDia(dia, respostas, reposicao);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
      return;
    }
    setPasso((p) => p + 1);
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <View style={[estilos.flex, { paddingBottom: folgaTeclado }]}>
        <View style={estilos.topo}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Fechar">
            <Txt v="corpo" cor="texto2">
              Fechar
            </Txt>
          </Pressable>
          <Txt v="pequeno" cor="texto2">
            {reposicao
              ? `Repondo o dia ${dia}`
              : `${rotuloTipo[conteudo.tipo]} · ${minutosTipo[conteudo.tipo]} min`}
          </Txt>
        </View>

        <View style={estilos.progresso}>
          {Array.from({ length: totalPassos }, (_, i) => (
            <View key={i} style={[estilos.tracoPasso, i <= passo ? estilos.tracoCheio : estilos.tracoVazio]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          {noTexto ? (
            <View style={estilos.bloco}>
              <Txt v="pequeno" cor="texto2">
                {conteudo.referencia}
              </Txt>
              <Txt v="titulo2" familia="displayItalico">
                {conteudo.texto}
              </Txt>
              <Divisor style={estilos.divisor} />
              <Txt v="lead" cor="texto2">
                {conteudo.reflexao}
              </Txt>
            </View>
          ) : (
            <View style={estilos.bloco}>
              <Txt v="pequeno" cor="texto2">
                Pergunta {passo} de {perguntas.length}
              </Txt>
              <Txt v="titulo2" familia="display">
                {perguntas[passo - 1]}
              </Txt>
              <TextInput
                value={respostas[passo - 1]}
                onChangeText={(t) => setRespostas((r) => r.map((v, i) => (i === passo - 1 ? t : v)))}
                placeholder="Escreva uma linha"
                placeholderTextColor={Cores.cinza1}
                multiline
                style={estilos.campo}
                autoFocus
              />
            </View>
          )}
        </ScrollView>

        <View style={estilos.rodape}>
          <Botao titulo={ultimo ? 'Concluir check-in' : 'Continuar'} onPress={avancar} />
          {ultimo ? (
            <Txt v="legenda" cor="texto3" style={estilos.nota}>
              +{tijolos} tijolos
            </Txt>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  flex: { flex: 1 },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Espaco.tres,
    paddingVertical: Espaco.dois,
  },
  progresso: { flexDirection: 'row', gap: 3, paddingHorizontal: Espaco.tres },
  tracoPasso: { flex: 1, height: 2, borderRadius: 1 },
  tracoCheio: { backgroundColor: Cores.branco },
  tracoVazio: { backgroundColor: Cores.cinza3 },
  conteudo: { padding: Espaco.tres, paddingTop: Espaco.cinco },
  bloco: { gap: Espaco.tres },
  divisor: { marginVertical: Espaco.dois },
  campo: {
    minHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.campo,
    padding: Espaco.tres,
    color: Tema.texto,
    fontFamily: Fontes.corpo,
    fontSize: Texto.corpo.fontSize,
    lineHeight: Texto.corpo.lineHeight,
    textAlignVertical: 'top',
  },
  rodape: { padding: Espaco.tres, gap: Espaco.dois },
  nota: { textAlign: 'center' },
});
