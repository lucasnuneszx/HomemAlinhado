import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Txt } from './texto';
import { Cores, Tema } from '@/constants/tema';

/**
 * A balança do prumo.
 *
 * Não é enfeite: é o instrumento. A linha pende do pino e assenta no ângulo
 * que o seu Índice de Alinhamento manda — 10 é a vertical, 0 é o desvio
 * máximo. O tracejado atrás é o prumo verdadeiro, e o arco embaixo é a
 * amplitude. Ela balança uma vez e para, como um prumo de pedreiro.
 */

const ANGULO_MAXIMO = 15;
const ALTURA = 168;
const LARGURA = 168;
const TOPO = 22;
const COMPRIMENTO = 108;

export function anguloDoIndice(indice: number): number {
  const limitado = Math.max(0, Math.min(10, indice));
  return ((10 - limitado) / 10) * ANGULO_MAXIMO;
}

export function rotuloDoIndice(indice: number): string {
  if (indice >= 8) return 'No prumo';
  if (indice >= 5) return 'Quase no prumo';
  return 'Fora do prumo';
}

/** Ponto na circunferência do arco, em graus a partir da vertical. */
function ponto(graus: number, raio: number) {
  const r = (graus * Math.PI) / 180;
  return { x: LARGURA / 2 + raio * Math.sin(r), y: TOPO + raio * Math.cos(r) };
}

export function BalancaPrumo({ indice }: { indice: number | null }) {
  const alvo = indice === null ? 0 : anguloDoIndice(indice);
  const [angulo] = useState(() => new Animated.Value(ANGULO_MAXIMO + 7));

  useEffect(() => {
    const animacao = Animated.spring(angulo, {
      toValue: alvo,
      friction: 4.2,
      tension: 26,
      useNativeDriver: true,
    });
    animacao.start();
    return () => animacao.stop();
  }, [alvo, angulo]);

  const esquerda = ponto(-ANGULO_MAXIMO, COMPRIMENTO + 12);
  const direita = ponto(ANGULO_MAXIMO, COMPRIMENTO + 12);
  const meio = ponto(0, COMPRIMENTO + 12);

  return (
    <View style={estilos.caixa}>
      <Svg width={LARGURA} height={ALTURA} style={StyleSheet.absoluteFill}>
        {/* A viga de onde o prumo pende. */}
        <Line
          x1={LARGURA / 2 - 44}
          y1={TOPO}
          x2={LARGURA / 2 + 44}
          y2={TOPO}
          stroke={Cores.cinza3}
          strokeWidth={1}
        />
        {/* O prumo verdadeiro: a vertical de referência. */}
        <Line
          x1={LARGURA / 2}
          y1={TOPO}
          x2={LARGURA / 2}
          y2={TOPO + COMPRIMENTO + 18}
          stroke={Cores.cinza3}
          strokeWidth={1}
          strokeDasharray="2 5"
        />
        {/* A amplitude. */}
        <Path
          d={`M ${esquerda.x} ${esquerda.y} A ${COMPRIMENTO + 12} ${COMPRIMENTO + 12} 0 0 0 ${direita.x} ${direita.y}`}
          stroke={Cores.cinza3}
          strokeWidth={1}
          fill="none"
        />
        {[esquerda, meio, direita].map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === 1 ? 2 : 1.5} fill={Cores.cinza3} />
        ))}
        <Circle cx={LARGURA / 2} cy={TOPO} r={2.5} fill={Cores.branco} />
      </Svg>

      <Animated.View
        style={[
          estilos.pendulo,
          {
            opacity: indice === null ? 0.45 : 1,
            transform: [
              {
                rotate: angulo.interpolate({
                  inputRange: [-30, 30],
                  outputRange: ['-30deg', '30deg'],
                }),
              },
            ],
          },
        ]}>
        <Svg width={30} height={COMPRIMENTO} viewBox={`-15 0 30 ${COMPRIMENTO}`}>
          <Line x1={0} y1={0} x2={0} y2={COMPRIMENTO - 34} stroke={Cores.branco} strokeWidth={1.2} />
          <Path
            d={`M -2 ${COMPRIMENTO - 34} L 2 ${COMPRIMENTO - 34} C 10 ${COMPRIMENTO - 28} 13 ${COMPRIMENTO - 21} 12 ${COMPRIMENTO - 16} L 0 ${COMPRIMENTO} L -12 ${COMPRIMENTO - 16} C -13 ${COMPRIMENTO - 21} -10 ${COMPRIMENTO - 28} -2 ${COMPRIMENTO - 34} Z`}
            fill={Cores.branco}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

/** Barra fina de 0 a 10. Usada nos três eixos. */
export function BarraEixo({ nome, valor }: { nome: string; valor: number }) {
  return (
    <View style={estilos.eixo}>
      <Txt v="pequeno" cor="texto2" style={estilos.eixoNome}>
        {nome}
      </Txt>
      <View style={estilos.trilho}>
        <View style={[estilos.preenchido, { width: `${Math.max(0, Math.min(10, valor)) * 10}%` }]} />
      </View>
      <Txt v="pequeno" familia="displayForte" style={estilos.eixoValor}>
        {valor.toFixed(1).replace('.', ',')}
      </Txt>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    width: LARGURA,
    height: ALTURA,
    alignItems: 'center',
  },
  pendulo: {
    position: 'absolute',
    top: TOPO,
    left: (LARGURA - 30) / 2,
    transformOrigin: 'top center',
  },
  eixo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eixoNome: {
    width: 78,
  },
  eixoValor: {
    width: 28,
    textAlign: 'right',
  },
  trilho: {
    flex: 1,
    height: 2,
    backgroundColor: Tema.borda,
  },
  preenchido: {
    height: 2,
    backgroundColor: Cores.branco,
  },
});
