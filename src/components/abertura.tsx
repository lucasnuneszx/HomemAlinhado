import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Txt } from './texto';
import { Cores, Espaco, Fontes, Tema } from '@/constants/tema';

/**
 * Abertura do app.
 *
 * O prumo é desenhado de cima para baixo: primeiro a linha desce, depois a
 * gota assenta. Só então o nome abre, aumentando o espaçamento entre as
 * letras, um fio fino fecha embaixo e a frase da marca aparece. Nada de brilho
 * nem de cor: o efeito é o mesmo gesto do símbolo, o de achar a vertical.
 *
 * Toque em qualquer lugar para pular.
 */

const ALTURA = 136;
const LARGURA = 64;
const PROPORCAO_HASTE = 42 / 96; // a haste vai de -48 a -6 na arte
const ALTURA_HASTE = ALTURA * PROPORCAO_HASTE;
const ALTURA_GOTA = ALTURA - ALTURA_HASTE;

export function Abertura({ aoTerminar }: { aoTerminar: () => void }) {
  // Um valor por parte da animação, criados uma única vez.
  const [{ haste, gota, nome, espacamento, fio, frase, saida }] = useState(() => ({
    haste: new Animated.Value(0),
    gota: new Animated.Value(0),
    nome: new Animated.Value(0),
    espacamento: new Animated.Value(0),
    fio: new Animated.Value(0),
    frase: new Animated.Value(0),
    saida: new Animated.Value(0),
  }));

  const terminou = useRef(false);
  const terminar = useRef(aoTerminar);

  useEffect(() => {
    terminar.current = aoTerminar;
  }, [aoTerminar]);

  const terminarUmaVez = useCallback(() => {
    if (terminou.current) return;
    terminou.current = true;
    terminar.current();
  }, []);

  useEffect(() => {
    const suave = Easing.bezier(0.16, 1, 0.3, 1);

    const animacao = Animated.parallel([
      Animated.timing(haste, {
        toValue: 1,
        duration: 640,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(gota, {
        toValue: 1,
        delay: 460,
        duration: 560,
        easing: suave,
        useNativeDriver: true,
      }),
      Animated.timing(nome, {
        toValue: 1,
        delay: 880,
        duration: 760,
        easing: suave,
        useNativeDriver: true,
      }),
      // letterSpacing não roda na thread nativa: fica no driver de JS.
      Animated.timing(espacamento, {
        toValue: 1,
        delay: 880,
        duration: 900,
        easing: suave,
        useNativeDriver: false,
      }),
      Animated.timing(fio, {
        toValue: 1,
        delay: 1120,
        duration: 780,
        easing: suave,
        useNativeDriver: true,
      }),
      Animated.timing(frase, {
        toValue: 1,
        delay: 1700,
        duration: 900,
        easing: suave,
        useNativeDriver: true,
      }),
      Animated.timing(saida, {
        toValue: 1,
        delay: 3700,
        duration: 480,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animacao.start(({ finished }) => {
      if (finished) terminarUmaVez();
    });

    return () => animacao.stop();
  }, [espacamento, fio, frase, gota, haste, nome, saida, terminarUmaVez]);

  return (
    <Pressable style={estilos.tela} onPress={terminarUmaVez} accessibilityLabel="Homem Alinhado">
      <Animated.View style={[estilos.centro, { opacity: Animated.subtract(1, saida) }]}>
        <View style={estilos.prumo}>
          <Animated.View
            style={[
              estilos.haste,
              {
                transform: [
                  {
                    translateY: haste.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-ALTURA_HASTE / 2, 0],
                    }),
                  },
                  { scaleY: haste },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              estilos.gota,
              {
                opacity: gota,
                transform: [
                  {
                    translateY: gota.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-14, 0],
                    }),
                  },
                  {
                    scaleY: gota.interpolate({
                      inputRange: [0, 0.68, 1],
                      outputRange: [0.72, 1.04, 1],
                    }),
                  },
                ],
              },
            ]}>
            <Svg width={LARGURA} height={ALTURA_GOTA} viewBox="-24 -6 48 53">
              <Path
                d="M-3 -6 L3 -6 C16 3 21 14 19 22 L0 47 L-19 22 C-21 14 -16 3 -3 -6 Z"
                fill={Cores.branco}
              />
            </Svg>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            opacity: nome,
            transform: [
              { translateY: nome.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            ],
          }}>
          <Animated.Text
            style={[
              estilos.nome,
              {
                letterSpacing: espacamento.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 8],
                }),
              },
            ]}>
            HOMEM ALINHADO
          </Animated.Text>
        </Animated.View>

        <Animated.View style={[estilos.fio, { transform: [{ scaleX: fio }] }]} />

        <Animated.View
          style={[
            estilos.frase,
            {
              opacity: frase,
              transform: [
                { translateY: frase.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
              ],
            },
          ]}>
          <Txt v="lead" familia="display" cor="texto2" style={estilos.fraseTexto}>
            Uma casa só fica de pé
          </Txt>
          <Txt v="lead" familia="display" style={estilos.fraseTexto}>
            quando o homem está no prumo.
          </Txt>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Tema.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
    alignItems: 'center',
  },
  prumo: {
    height: ALTURA,
    width: LARGURA,
    alignItems: 'center',
  },
  haste: {
    width: 1.5,
    height: ALTURA_HASTE,
    backgroundColor: Cores.branco,
  },
  gota: {
    height: ALTURA_GOTA,
  },
  nome: {
    marginTop: 30,
    // O espaçamento empurra a última letra: o recuo devolve o centro óptico.
    marginLeft: 8,
    fontFamily: Fontes.corpoMedio,
    fontSize: 13,
    lineHeight: 16,
    color: Cores.branco,
  },
  fio: {
    marginTop: 18,
    width: 104,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Cores.cinza2,
  },
  frase: {
    marginTop: Espaco.quatro,
    paddingHorizontal: Espaco.quatro,
  },
  fraseTexto: {
    textAlign: 'center',
  },
});
