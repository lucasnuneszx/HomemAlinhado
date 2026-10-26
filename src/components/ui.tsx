import { forwardRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewProps,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Txt } from './texto';
import { Cores, Espaco, Fontes, Raio, Tema, Texto } from '@/constants/tema';

/** Painel com borda fina. A superfície padrão do app. */
export function Cartao({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.cartao, style]} {...rest}>
      {children}
    </View>
  );
}

/** Painel invertido: branco sobre preto. Usado no que exige ação. */
export function CartaoForte({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.cartaoForte, style]} {...rest}>
      {children}
    </View>
  );
}

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  style,
}: {
  titulo: string;
  onPress?: () => void;
  /** `escuro` é o primário invertido, para usar dentro de um cartão branco. */
  variante?: 'primario' | 'secundario' | 'escuro';
  carregando?: boolean;
  desabilitado?: boolean;
  style?: ViewProps['style'];
}) {
  const primario = variante === 'primario';
  const escuro = variante === 'escuro';
  const inerte = desabilitado || carregando;
  return (
    <Pressable
      onPress={inerte ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: inerte, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        primario ? styles.botaoPrimario : escuro ? styles.botaoEscuro : styles.botaoSecundario,
        pressed && styles.pressionado,
        desabilitado && styles.inerte,
        style,
      ]}>
      {carregando ? (
        <ActivityIndicator color={primario ? Cores.preto : Cores.branco} />
      ) : (
        <Txt v="corpo" familia="corpoMedio" cor={primario ? 'inversoTexto' : 'texto'}>
          {titulo}
        </Txt>
      )}
    </Pressable>
  );
}

/**
 * Campo de formulário: rótulo pequeno, linha fina e o erro logo abaixo.
 * Em foco a borda fica branca — é o único sinal de estado que o preto e
 * branco permite, e é o que faz o formulário parecer vivo.
 */
export const Campo = forwardRef<
  TextInput,
  TextInputProps & { rotulo: string; erro?: string | null; segredo?: boolean }
>(function Campo({ rotulo, erro, segredo = false, style, onFocus, onBlur, ...rest }, ref) {
  const [focado, setFocado] = useState(false);
  const [revelado, setRevelado] = useState(false);

  return (
    <View style={styles.campoBloco}>
      <Txt v="legenda" cor={focado ? 'texto' : 'texto2'} style={styles.campoRotulo}>
        {rotulo.toUpperCase()}
      </Txt>
      <View>
        <TextInput
          ref={ref}
          placeholderTextColor={Cores.cinza1}
          selectionColor={Cores.branco}
          secureTextEntry={segredo && !revelado}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          style={[
            styles.campo,
            segredo && styles.campoComBotao,
            focado && styles.campoFocado,
            erro ? styles.campoErrado : null,
            style,
          ]}
          {...rest}
        />
        {segredo ? (
          <Pressable
            onPress={() => setRevelado((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revelado ? 'Ocultar a senha' : 'Mostrar a senha'}
            style={styles.campoBotao}>
            <Txt v="legenda" cor="texto2" style={styles.campoRotulo}>
              {revelado ? 'OCULTAR' : 'MOSTRAR'}
            </Txt>
          </Pressable>
        ) : null}
      </View>
      {erro ? (
        <Txt v="legenda" style={styles.campoErro}>
          {erro}
        </Txt>
      ) : null}
    </View>
  );
});

/** Alternador de duas opções. Fios finos, a ativa fica branca. */
export function Segmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: readonly { valor: T; rotulo: string }[];
  valor: T;
  aoMudar: (v: T) => void;
}) {
  return (
    <View style={styles.segmentado}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => aoMudar(o.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
            style={[styles.segmento, ativo && styles.segmentoAtivo]}>
            <Txt v="pequeno" familia="corpoMedio" cor={ativo ? 'inversoTexto' : 'texto2'}>
              {o.rotulo}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Anel de progresso. Sem cor: branco sobre cinza. */
export function Anel({
  valor,
  tamanho = 56,
  traco = 3,
  children,
}: {
  valor: number;
  tamanho?: number;
  traco?: number;
  children?: ReactNode;
}) {
  const r = (tamanho - traco) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: tamanho, height: tamanho }}>
      <Svg width={tamanho} height={tamanho}>
        <Circle cx={tamanho / 2} cy={tamanho / 2} r={r} stroke={Cores.cinza3} strokeWidth={traco} fill="none" />
        <Circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          stroke={Cores.branco}
          strokeWidth={traco}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, valor)))}
          transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
        />
      </Svg>
      {children ? <View style={[StyleSheet.absoluteFill, styles.centro]}>{children}</View> : null}
    </View>
  );
}

/** Barra dos 28 dias. Cada traço é um dia. */
export function BarraDias({ total, concluidos }: { total: number; concluidos: number }) {
  return (
    <View style={styles.barra} accessibilityLabel={`${concluidos} de ${total} dias concluídos`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.traco, i < concluidos ? styles.tracoCheio : styles.tracoVazio]} />
      ))}
    </View>
  );
}

/** O símbolo do prumo. Só geometria, sem fonte. */
export function Prumo({ tamanho = 24, cor = Cores.branco }: { tamanho?: number; cor?: string }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="-48 -48 96 96">
      <Rect x={-1} y={-48} width={2} height={42} fill={cor} />
      <Path d="M-3 -6 L3 -6 C16 3 21 14 19 22 L0 47 L-19 22 C-21 14 -16 3 -3 -6 Z" fill={cor} />
    </Svg>
  );
}

export function Divisor({ style }: { style?: ViewProps['style'] }) {
  return <View style={[styles.divisor, style]} />;
}

const styles = StyleSheet.create({
  cartao: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.painel,
    padding: Espaco.tres,
  },
  cartaoForte: {
    backgroundColor: Tema.inversoFundo,
    borderRadius: Raio.painel,
    padding: Espaco.tres,
  },
  botao: {
    height: 52,
    borderRadius: Raio.botao,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Espaco.quatro,
  },
  botaoPrimario: {
    backgroundColor: Tema.inversoFundo,
  },
  botaoSecundario: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.texto,
  },
  botaoEscuro: {
    backgroundColor: Cores.preto,
  },
  pressionado: {
    opacity: 0.75,
  },
  inerte: {
    opacity: 0.4,
  },
  campoBloco: {
    gap: Espaco.um,
  },
  campoRotulo: {
    letterSpacing: 1.2,
  },
  campo: {
    height: 52,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.campo,
    paddingHorizontal: Espaco.tres,
    color: Tema.texto,
    fontFamily: Fontes.corpo,
    fontSize: Texto.corpo.fontSize,
  },
  campoComBotao: {
    paddingRight: 86,
  },
  campoFocado: {
    borderColor: Cores.branco,
  },
  campoErrado: {
    borderColor: Cores.erro,
  },
  campoBotao: {
    position: 'absolute',
    right: Espaco.tres,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  campoErro: {
    color: Cores.erro,
  },
  segmentado: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.campo,
    padding: 3,
    gap: 3,
  },
  segmento: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Raio.selo,
  },
  segmentoAtivo: {
    backgroundColor: Cores.branco,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  barra: {
    flexDirection: 'row',
    gap: 2,
  },
  traco: {
    flex: 1,
    height: 3,
    borderRadius: 1,
  },
  tracoCheio: {
    backgroundColor: Cores.branco,
  },
  tracoVazio: {
    backgroundColor: Cores.cinza3,
  },
  divisor: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Tema.borda,
  },
});
