import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/texto';
import { Anel, Botao, Cartao, Divisor } from '@/components/ui';
import { Cores, Espaco, Tema } from '@/constants/tema';
import { formatarNota, indiceGeral, type NotaSemana } from '@/lib/estado';
import { useJornada } from '@/lib/jornada-contexto';

const eixos = [
  { chave: 'deus', nome: 'Com Deus' },
  { chave: 'consigo', nome: 'Consigo' },
  { chave: 'casa', nome: 'Com a casa' },
] as const;

export default function Indice() {
  const { estado, registrarNota } = useJornada();
  const notas = estado.notas;
  const ultima = notas.at(-1);
  const primeira = notas.at(0);
  const [rascunho, setRascunho] = useState<Record<string, number>>({ deus: 5, consigo: 5, casa: 5 });
  const [registrando, setRegistrando] = useState(false);

  const proximaSemana = (ultima?.semana ?? 0) + 1;

  function salvar() {
    registrarNota({
      semana: proximaSemana,
      deus: rascunho.deus,
      consigo: rascunho.consigo,
      casa: rascunho.casa,
    } as NotaSemana);
    setRegistrando(false);
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Txt v="titulo1" familia="display">
          Índice de Alinhamento
        </Txt>

        {ultima ? (
          <>
            <Cartao style={estilos.linha}>
              <View style={estilos.flex}>
                <Txt v="pequeno" cor="texto2">
                  Semana {ultima.semana}
                </Txt>
                <Txt v="display" familia="display">
                  {formatarNota(indiceGeral(ultima))}
                </Txt>
                {primeira && primeira !== ultima ? (
                  <Txt v="pequeno" cor="texto2">
                    Começou em {formatarNota(indiceGeral(primeira))}
                  </Txt>
                ) : null}
              </View>
              <Anel valor={indiceGeral(ultima) / 10} tamanho={72} traco={4}>
                <Txt v="pequeno" familia="displayForte">
                  {Math.round(indiceGeral(ultima) * 10)}%
                </Txt>
              </Anel>
            </Cartao>

            <Cartao>
              {eixos.map((e, i) => (
                <View key={e.chave}>
                  {i > 0 ? <Divisor style={estilos.divisorLista} /> : null}
                  <View style={estilos.linhaEixo}>
                    <Txt v="corpo" cor="texto2">
                      {e.nome}
                    </Txt>
                    <Txt v="corpo" familia="displayForte">
                      {formatarNota(ultima[e.chave])}
                    </Txt>
                  </View>
                  <View style={estilos.trilho}>
                    <View style={[estilos.preenchido, { width: `${ultima[e.chave] * 10}%` }]} />
                  </View>
                </View>
              ))}
            </Cartao>

            {notas.length > 1 ? (
              <Cartao>
                <Txt v="pequeno" cor="texto2">
                  Semana a semana
                </Txt>
                <View style={estilos.grafico}>
                  {notas.map((n) => (
                    <View key={n.semana} style={estilos.colunaGrafico}>
                      <View style={[estilos.barra, { height: Math.max(4, indiceGeral(n) * 9) }]} />
                      <Txt v="legenda" cor="texto2">
                        S{n.semana}
                      </Txt>
                    </View>
                  ))}
                </View>
              </Cartao>
            ) : null}
          </>
        ) : (
          <Cartao>
            <Txt v="lead" familia="display">
              Sua primeira nota sai no domingo.
            </Txt>
            <Txt v="corpo" cor="texto2" style={estilos.espaco}>
              Você dá uma nota de 0 a 10 para cada eixo. O app guarda e mostra a diferença do dia 1 para o dia 28.
            </Txt>
          </Cartao>
        )}

        {registrando ? (
          <Cartao>
            <Txt v="titulo3" familia="display">
              Semana {proximaSemana}
            </Txt>
            {eixos.map((e) => (
              <View key={e.chave} style={estilos.espaco}>
                <View style={estilos.linhaEixo}>
                  <Txt v="corpo">{e.nome}</Txt>
                  <Txt v="corpo" familia="displayForte">
                    {rascunho[e.chave]}
                  </Txt>
                </View>
                <View style={estilos.notas}>
                  {Array.from({ length: 11 }, (_, n) => (
                    <Pressable
                      key={n}
                      onPress={() => setRascunho((r) => ({ ...r, [e.chave]: n }))}
                      style={[estilos.nota, rascunho[e.chave] === n && estilos.notaAtiva]}
                      accessibilityLabel={`${e.nome}, nota ${n}`}>
                      <Txt v="legenda" cor={rascunho[e.chave] === n ? 'inversoTexto' : 'texto2'}>
                        {n}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            <Botao titulo="Salvar a nota da semana" onPress={salvar} style={estilos.espaco} />
          </Cartao>
        ) : (
          <Botao titulo={`Registrar a semana ${proximaSemana}`} variante="secundario" onPress={() => setRegistrando(true)} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  conteudo: { padding: Espaco.tres, gap: Espaco.tres, paddingBottom: Espaco.seis * 2, paddingTop: Espaco.dois },
  linha: { flexDirection: 'row', alignItems: 'center', gap: Espaco.tres },
  flex: { flex: 1 },
  linhaEixo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  trilho: { height: 2, backgroundColor: Cores.cinza3, marginTop: Espaco.dois },
  preenchido: { height: 2, backgroundColor: Cores.branco },
  divisorLista: { marginVertical: Espaco.tres },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', gap: Espaco.dois, marginTop: Espaco.tres, height: 110 },
  colunaGrafico: { flex: 1, alignItems: 'center', gap: Espaco.um },
  barra: { width: '100%', backgroundColor: Cores.branco, borderRadius: 2 },
  espaco: { marginTop: Espaco.tres },
  notas: { flexDirection: 'row', gap: Espaco.um, marginTop: Espaco.dois },
  nota: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: 3,
  },
  notaAtiva: { backgroundColor: Cores.branco, borderColor: Cores.branco },
});
