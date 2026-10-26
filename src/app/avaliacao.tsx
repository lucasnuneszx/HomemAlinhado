import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraEixo } from '@/components/balanca';
import { Txt } from '@/components/texto';
import { Botao, Cartao, Divisor } from '@/components/ui';
import { Cores, Espaco, Raio, Tema } from '@/constants/tema';
import {
  escala,
  nomeEixo,
  notaDoEixo,
  notaGeral,
  perguntas,
  TOTAL_PERGUNTAS,
  type Eixo,
} from '@/content/avaliacao';
import { PONTOS } from '@/content/pontos';
import { avaliacaoPor } from '@/lib/estado';
import { useJornada } from '@/lib/jornada-contexto';

const EIXOS: Eixo[] = ['deus', 'consigo', 'casa'];

/**
 * Auto-avaliação de entrada e de saída. Uma pergunta por vez: é mais lento de
 * passar e muito mais honesto de responder do que uma lista de nove.
 */
export default function Avaliacao() {
  const { tipo: tipoParam } = useLocalSearchParams<{ tipo?: string }>();
  const tipo: 'inicial' | 'final' = tipoParam === 'final' ? 'final' : 'inicial';
  const { estado, registrarAvaliacao, comecar } = useJornada();

  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<number[]>(() => perguntas.map(() => -1));
  const [concluida, setConcluida] = useState(false);

  const anterior = tipo === 'final' ? avaliacaoPor(estado, 'inicial') : undefined;
  const pergunta = perguntas[passo];
  const respondida = respostas[passo] >= 0;

  function responder(valor: number) {
    void Haptics.selectionAsync();
    setRespostas((r) => r.map((v, i) => (i === passo ? valor : v)));
    if (passo < TOTAL_PERGUNTAS - 1) {
      setTimeout(() => setPasso((p) => p + 1), 160);
    }
  }

  function finalizar() {
    registrarAvaliacao(tipo, respostas);
    if (tipo === 'inicial') comecar();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConcluida(true);
  }

  if (concluida) {
    const geral = notaGeral(respostas);
    return (
      <SafeAreaView style={estilos.tela}>
        <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
          <Txt v="pequeno" cor="texto2">
            {tipo === 'inicial' ? 'Retrato do dia 1' : 'Retrato do dia 28'}
          </Txt>
          <Txt v="display" familia="display">
            {geral.toFixed(1).replace('.', ',')}
          </Txt>
          <Txt v="corpo" cor="texto2">
            {tipo === 'inicial'
              ? 'Este é o seu ponto de partida. Guarde o número: no dia 28 você mede de novo.'
              : 'Compare com o dia 1. O que mudou está aqui, em número.'}
          </Txt>

          <Cartao style={estilos.cartaoEixos}>
            {EIXOS.map((eixo) => {
              const agora = notaDoEixo(respostas, eixo);
              const antes = anterior ? notaDoEixo(anterior.respostas, eixo) : null;
              const delta = antes === null ? null : Math.round((agora - antes) * 10) / 10;
              return (
                <View key={eixo} style={estilos.eixoLinha}>
                  <BarraEixo nome={nomeEixo[eixo]} valor={agora} />
                  {delta !== null ? (
                    <Txt v="legenda" cor={delta >= 0 ? 'texto' : 'texto3'} style={estilos.delta}>
                      {delta > 0 ? `+${delta.toFixed(1).replace('.', ',')}` : delta.toFixed(1).replace('.', ',')}
                    </Txt>
                  ) : null}
                </View>
              );
            })}
          </Cartao>

          <Cartao>
            <Txt v="pequeno" cor="texto2">
              Tijolos
            </Txt>
            <Txt v="titulo2" familia="display" style={estilos.espacoMeio}>
              +{tipo === 'inicial' ? PONTOS.avaliacaoInicial : PONTOS.avaliacaoFinal}
            </Txt>
          </Cartao>

          <Botao
            titulo={tipo === 'inicial' ? 'Começar o dia 1' : 'Ver o meu prumo'}
            onPress={() => router.back()}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <View style={estilos.topo}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Txt v="corpo" cor="texto2">
            Fechar
          </Txt>
        </Pressable>
        <Txt v="pequeno" cor="texto2">
          {passo + 1} de {TOTAL_PERGUNTAS}
        </Txt>
      </View>

      <View style={estilos.progresso}>
        {perguntas.map((_, i) => (
          <View
            key={i}
            style={[estilos.traco, respostas[i] >= 0 ? estilos.tracoCheio : estilos.tracoVazio]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={estilos.conteudoPergunta} showsVerticalScrollIndicator={false}>
        <Txt v="pequeno" cor="texto2">
          {nomeEixo[pergunta.eixo]}
        </Txt>
        <Txt v="titulo2" familia="display" style={estilos.pergunta}>
          {pergunta.texto}
        </Txt>

        <View style={estilos.opcoes}>
          {escala.map((rotulo, valor) => {
            const marcada = respostas[passo] === valor;
            return (
              <Pressable
                key={rotulo}
                onPress={() => responder(valor)}
                style={[estilos.opcao, marcada && estilos.opcaoMarcada]}>
                <Txt v="corpo" cor={marcada ? 'inversoTexto' : 'texto'}>
                  {rotulo}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={estilos.rodape}>
        <Divisor />
        <View style={estilos.navegacao}>
          <Pressable
            onPress={() => setPasso((p) => Math.max(0, p - 1))}
            disabled={passo === 0}
            hitSlop={8}>
            <Txt v="pequeno" cor={passo === 0 ? 'texto3' : 'texto2'}>
              Voltar
            </Txt>
          </Pressable>

          {passo === TOTAL_PERGUNTAS - 1 ? (
            <Botao
              titulo="Ver o meu retrato"
              onPress={finalizar}
              desabilitado={respostas.some((r) => r < 0)}
              style={estilos.botaoFinal}
            />
          ) : (
            <Pressable
              onPress={() => setPasso((p) => Math.min(TOTAL_PERGUNTAS - 1, p + 1))}
              disabled={!respondida}
              hitSlop={8}>
              <Txt v="pequeno" cor={respondida ? 'texto' : 'texto3'} familia="corpoMedio">
                Avançar
              </Txt>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Espaco.tres,
    paddingVertical: Espaco.dois,
  },
  progresso: { flexDirection: 'row', gap: 3, paddingHorizontal: Espaco.tres },
  traco: { flex: 1, height: 2, borderRadius: 1 },
  tracoCheio: { backgroundColor: Cores.branco },
  tracoVazio: { backgroundColor: Cores.cinza3 },
  conteudoPergunta: { padding: Espaco.tres, paddingTop: Espaco.cinco, gap: Espaco.dois },
  pergunta: { marginBottom: Espaco.tres },
  opcoes: { gap: Espaco.dois },
  opcao: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: Espaco.tres,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.campo,
  },
  opcaoMarcada: { backgroundColor: Cores.branco, borderColor: Cores.branco },
  rodape: { padding: Espaco.tres, gap: Espaco.tres },
  navegacao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Espaco.tres },
  botaoFinal: { flex: 1 },
  conteudo: { padding: Espaco.tres, paddingTop: Espaco.cinco, gap: Espaco.tres },
  cartaoEixos: { gap: Espaco.tres },
  eixoLinha: { flexDirection: 'row', alignItems: 'center', gap: Espaco.dois },
  delta: { width: 34, textAlign: 'right' },
  espacoMeio: { marginTop: Espaco.dois },
});
