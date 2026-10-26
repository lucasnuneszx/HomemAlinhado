import { Text, type TextProps, StyleSheet } from 'react-native';

import { Fontes, Tema, Texto as Escala } from '@/constants/tema';

type Variante = keyof typeof Escala;
type Cor = 'texto' | 'texto2' | 'texto3' | 'inversoTexto';

export type TxtProps = TextProps & {
  /** Tamanho na escala tipográfica. */
  v?: Variante;
  /** Família: display usa Cormorant, corpo usa Inter. */
  familia?: 'display' | 'displayForte' | 'displayItalico' | 'corpo' | 'corpoMedio';
  cor?: Cor;
};

/** Texto do app. Display para títulos e números, corpo para interface. */
export function Txt({ v = 'corpo', familia = 'corpo', cor = 'texto', style, ...rest }: TxtProps) {
  return (
    <Text
      style={[
        Escala[v],
        { fontFamily: Fontes[familia], color: Tema[cor] },
        familia.startsWith('display') && styles.display,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    letterSpacing: -0.5,
  },
});
