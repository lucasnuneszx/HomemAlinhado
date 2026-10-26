import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/texto';
import { Cartao, Segmentado } from '@/components/ui';
import { Cores, Espaco, Raio, Tema } from '@/constants/tema';
import { feed, NOME_TURMA, turma, turmaComVoce } from '@/content/turma';
import { primeiroNome } from '@/lib/conta';
import { useConta } from '@/lib/conta-contexto';
import { useJornada } from '@/lib/jornada-contexto';
import { formatarTijolos } from '@/lib/pontos';

const abas = [
  { valor: 'hoje' as const, rotulo: 'Hoje' },
  { valor: 'ranking' as const, rotulo: 'Ranking' },
];

export default function Grupo() {
  const { fezHoje, tijolos, seq } = useJornada();
  const { usuario } = useConta();
  const [aba, setAba] = useState<'hoje' | 'ranking'>('hoje');

  const meuNome = usuario ? primeiroNome(usuario.nome) : 'Você';
  const minhaInicial = meuNome[0]?.toUpperCase() ?? 'V';
  const feitos = turma.filter((m) => (m.eu ? fezHoje : m.feito)).length;
  const classificacao = turmaComVoce(meuNome, tijolos, seq, fezHoje);
  const minhaPosicao = classificacao.findIndex((m) => m.eu) + 1;

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View>
          <Txt v="pequeno" cor="texto2">
            {NOME_TURMA} · {turma.length} homens
          </Txt>
          <Txt v="titulo1" familia="display">
            O grupo
          </Txt>
        </View>

        <Segmentado opcoes={abas} valor={aba} aoMudar={setAba} />

        {aba === 'hoje' ? (
          <>
            <Cartao>
              <Txt v="pequeno" cor="texto2">
                Fizeram o check-in hoje: {feitos} de {turma.length}
              </Txt>
              <View style={estilos.avatares}>
                {turma.map((m) => {
                  const ok = m.eu ? fezHoje : m.feito;
                  return (
                    <View key={m.nome} style={estilos.pessoa}>
                      <View style={[estilos.avatar, ok ? estilos.avatarFeito : estilos.avatarFalta]}>
                        <Txt v="corpo" familia="displayForte" cor={ok ? 'inversoTexto' : 'texto3'}>
                          {m.eu ? minhaInicial : m.inicial}
                        </Txt>
                      </View>
                      <Txt v="legenda" cor={ok ? 'texto2' : 'texto3'} numberOfLines={1}>
                        {m.eu ? meuNome : m.nome.split(' ')[0]}
                      </Txt>
                    </View>
                  );
                })}
              </View>
            </Cartao>

            {feed.map((p, i) => (
              <Cartao key={i} style={p.lider ? estilos.cartaoLider : undefined}>
                <View style={estilos.linhaPost}>
                  <View style={[estilos.avatarPequeno, p.lider && estilos.avatarFeito]}>
                    <Txt v="legenda" familia="displayForte" cor={p.lider ? 'inversoTexto' : 'texto'}>
                      {p.quem[0]}
                    </Txt>
                  </View>
                  <Txt v="pequeno" familia="corpoMedio" style={estilos.flex}>
                    {p.quem}
                  </Txt>
                  <Txt v="legenda" cor="texto2">
                    {p.papel}
                  </Txt>
                </View>
                <Txt v="corpo" cor="texto2" style={estilos.espaco}>
                  {p.texto}
                </Txt>
              </Cartao>
            ))}
          </>
        ) : (
          <>
            <Cartao>
              <Txt v="pequeno" cor="texto2">
                Sua posição
              </Txt>
              <View style={estilos.linhaPosicao}>
                <Txt v="display" familia="display">
                  {minhaPosicao}º
                </Txt>
                <View style={estilos.flex}>
                  <Txt v="corpo" familia="corpoMedio">
                    {formatarTijolos(tijolos)} tijolos
                  </Txt>
                  <Txt v="pequeno" cor="texto2">
                    {minhaPosicao === 1
                      ? 'Na frente da turma.'
                      : `Faltam ${formatarTijolos(classificacao[minhaPosicao - 2].tijolos - tijolos + 1)} para passar ${classificacao[minhaPosicao - 2].nome.split(' ')[0]}.`}
                  </Txt>
                </View>
              </View>
            </Cartao>

            <View style={estilos.tabela}>
              {classificacao.map((m, i) => (
                <View key={m.nome} style={[estilos.linhaRank, m.eu && estilos.linhaMinha]}>
                  <Txt v="corpo" familia="displayForte" cor={m.eu ? 'texto' : 'texto3'} style={estilos.posicao}>
                    {i + 1}
                  </Txt>
                  <View style={[estilos.avatarPequeno, m.eu && estilos.avatarFeito]}>
                    <Txt v="legenda" familia="displayForte" cor={m.eu ? 'inversoTexto' : 'texto2'}>
                      {m.inicial}
                    </Txt>
                  </View>
                  <View style={estilos.flex}>
                    <Txt v="pequeno" familia="corpoMedio" numberOfLines={1}>
                      {m.eu ? `${m.nome} (você)` : m.nome}
                    </Txt>
                    <Txt v="legenda" cor="texto3">
                      Sequência de {m.seq} {m.seq === 1 ? 'dia' : 'dias'}
                    </Txt>
                  </View>
                  <Txt v="pequeno" familia="displayForte">
                    {formatarTijolos(m.tijolos)}
                  </Txt>
                </View>
              ))}
            </View>

            <Txt v="legenda" cor="texto3" style={estilos.nota}>
              O ranking usa o tijolo acumulado, não o saldo. Resgatar recompensa não derruba
              ninguém de posição.
            </Txt>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  conteudo: { padding: Espaco.tres, gap: Espaco.tres, paddingBottom: Espaco.seis * 2, paddingTop: Espaco.dois },
  avatares: { flexDirection: 'row', gap: Espaco.dois, marginTop: Espaco.tres },
  pessoa: { alignItems: 'center', gap: Espaco.um, width: 56 },
  avatar: { width: 40, height: 40, borderRadius: Raio.retrato, alignItems: 'center', justifyContent: 'center' },
  avatarFeito: { backgroundColor: Cores.branco },
  avatarFalta: { borderWidth: StyleSheet.hairlineWidth, borderColor: Tema.borda },
  avatarPequeno: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
  },
  cartaoLider: { borderColor: Cores.branco },
  linhaPost: { flexDirection: 'row', alignItems: 'center', gap: Espaco.dois },
  flex: { flex: 1 },
  espaco: { marginTop: Espaco.dois },
  linhaPosicao: { flexDirection: 'row', alignItems: 'center', gap: Espaco.tres, marginTop: Espaco.dois },
  tabela: { gap: Espaco.um },
  linhaRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaco.dois,
    paddingVertical: Espaco.dois,
    paddingHorizontal: Espaco.tres,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    borderRadius: Raio.painel,
  },
  linhaMinha: { borderColor: Tema.borda },
  posicao: { width: 22, textAlign: 'center' },
  nota: { lineHeight: 16 },
});
