import * as Haptics from 'expo-haptics';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/texto';
import { Cartao, Divisor, Prumo } from '@/components/ui';
import { Cores, Espaco, Raio, Tema } from '@/constants/tema';
import { semanas, TOTAL_DIAS } from '@/content/jornada';
import { MARCOS_BONUS, PONTOS, recompensas } from '@/content/pontos';
import { avaliacaoPor } from '@/lib/estado';
import { useJornada } from '@/lib/jornada-contexto';
import { formatarTijolos, nivelDe, progressoNoNivel, proximoNivel } from '@/lib/pontos';

/**
 * Inventário: o que ele acumulou e o que pode trocar por isso.
 *
 * Duas contas separadas de propósito. O acumulado é história e vale no ranking;
 * o saldo é o que dá para gastar. Resgatar não derruba ninguém na turma.
 */
export default function Inventario() {
  const { estado, tijolos, saldo, resgatar } = useJornada();

  const nivel = nivelDe(tijolos);
  const proximo = proximoNivel(tijolos);
  const progresso = progressoNoNivel(tijolos);
  const concluidos = estado.concluidos.length;

  const selos = [
    ...semanas.map((s) => ({
      nome: s.nome,
      descricao: `Semana ${s.n}`,
      ganho: concluidos >= s.n * 7,
    })),
    ...MARCOS_BONUS.map((m) => ({
      nome: `${m.dias} dias`,
      descricao: 'Sem falhar',
      ganho: estado.melhorSeq >= m.dias,
    })),
    {
      nome: 'Retrato',
      descricao: 'Avaliação inicial',
      ganho: Boolean(avaliacaoPor(estado, 'inicial')),
    },
    {
      nome: 'Encarou',
      descricao: 'Primeiro "mas"',
      ganho: estado.mas.length > 0,
    },
    {
      nome: 'Medida',
      descricao: 'Primeiro Índice',
      ganho: estado.notas.length > 0,
    },
    {
      nome: 'Fechou',
      descricao: 'Avaliação final',
      ganho: Boolean(avaliacaoPor(estado, 'final')),
    },
  ];

  const ganhos = selos.filter((s) => s.ganho).length;

  function pedirResgate(id: string, nome: string, custo: number) {
    Alert.alert('Resgatar', `Trocar ${custo} tijolos por "${nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Resgatar',
        onPress: () => {
          const ok = resgatar(id, custo);
          if (ok) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Resgatado', 'Você recebe por e-mail em até 24 horas.');
          } else {
            Alert.alert('Saldo insuficiente', 'Continue a jornada e volte aqui.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Txt v="titulo1" familia="display">
          Inventário
        </Txt>

        {/* Saldo e nível */}
        <Cartao>
          <View style={estilos.linhaTopo}>
            <View>
              <Txt v="pequeno" cor="texto2">
                Saldo
              </Txt>
              <View style={estilos.linhaSaldo}>
                <Txt v="display" familia="display">
                  {formatarTijolos(saldo)}
                </Txt>
                <Txt v="pequeno" cor="texto2" style={estilos.unidade}>
                  tijolos
                </Txt>
              </View>
            </View>
            <View style={estilos.direita}>
              <Txt v="pequeno" cor="texto2">
                Acumulado
              </Txt>
              <Txt v="titulo3" familia="displayForte">
                {formatarTijolos(tijolos)}
              </Txt>
            </View>
          </View>

          <Divisor style={estilos.divisor} />

          <View style={estilos.linhaTopo}>
            <Txt v="corpo" familia="corpoMedio">
              {nivel.nome}
            </Txt>
            <Txt v="legenda" cor="texto3">
              {proximo ? `Faltam ${formatarTijolos(proximo.apartir - tijolos)} para ${proximo.nome}` : 'Último nível'}
            </Txt>
          </View>
          <View style={estilos.trilho}>
            <View style={[estilos.preenchido, { width: `${progresso * 100}%` }]} />
          </View>
          <Txt v="legenda" cor="texto3" style={estilos.espacoMeio}>
            {nivel.descricao}
          </Txt>
        </Cartao>

        {/* Como ganhar */}
        <Cartao>
          <Txt v="pequeno" cor="texto2">
            Como se ganha tijolo
          </Txt>
          <View style={estilos.regras}>
            {[
              ['Leitura do dia', PONTOS.leitura],
              ['Check-in completo', PONTOS.checkin],
              ['Índice da semana', PONTOS.indice],
              ['Encarar um "mas"', PONTOS.mas],
              ['Repor um dia perdido', PONTOS.reposicao],
              ['Avaliação inicial', PONTOS.avaliacaoInicial],
              ['Avaliação final', PONTOS.avaliacaoFinal],
            ].map(([nome, valor]) => (
              <View key={String(nome)} style={estilos.regra}>
                <Txt v="pequeno" cor="texto2" style={estilos.flex}>
                  {nome}
                </Txt>
                <Txt v="pequeno" familia="displayForte">
                  +{valor}
                </Txt>
              </View>
            ))}
            {MARCOS_BONUS.map((m) => (
              <View key={m.dias} style={estilos.regra}>
                <Txt v="pequeno" cor="texto2" style={estilos.flex}>
                  Marco de {m.dias} dias
                </Txt>
                <Txt v="pequeno" familia="displayForte">
                  +{m.bonus}
                </Txt>
              </View>
            ))}
          </View>
        </Cartao>

        {/* Recompensas */}
        <View style={estilos.secao}>
          <Txt v="titulo3" familia="display">
            Recompensas
          </Txt>
          {recompensas.map((r) => {
            const resgatada = estado.resgates.includes(r.id);
            const podeResgatar = saldo >= r.custo;
            return (
              <Pressable
                key={r.id}
                disabled={resgatada}
                onPress={() => pedirResgate(r.id, r.nome, r.custo)}>
                {({ pressed }) => (
                  <Cartao
                    style={[
                      estilos.recompensa,
                      resgatada && estilos.recompensaResgatada,
                      !resgatada && !podeResgatar && estilos.recompensaBloqueada,
                      pressed && !resgatada && estilos.pressionado,
                    ]}>
                    <View style={estilos.linhaTopo}>
                      <Txt v="corpo" familia="corpoMedio" style={estilos.flex}>
                        {r.nome}
                      </Txt>
                      <Txt v="pequeno" familia="displayForte" cor={podeResgatar ? 'texto' : 'texto3'}>
                        {formatarTijolos(r.custo)}
                      </Txt>
                    </View>
                    <Txt v="pequeno" cor="texto2" style={estilos.espacoMeio}>
                      {r.descricao}
                    </Txt>
                    <Txt v="legenda" cor="texto3" style={estilos.espacoMeio}>
                      {resgatada ? `Resgatado · ${r.entrega}` : r.entrega}
                    </Txt>
                    {!resgatada && !podeResgatar ? (
                      <View style={estilos.trilhoFino}>
                        <View
                          style={[estilos.preenchido, { width: `${Math.min(1, saldo / r.custo) * 100}%` }]}
                        />
                      </View>
                    ) : null}
                  </Cartao>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selos */}
        <View style={estilos.secao}>
          <View style={estilos.linhaTopo}>
            <Txt v="titulo3" familia="display">
              Selos
            </Txt>
            <Txt v="pequeno" cor="texto2">
              {ganhos} de {selos.length}
            </Txt>
          </View>
          <View style={estilos.selos}>
            {selos.map((s) => (
              <View key={s.nome} style={[estilos.selo, !s.ganho && estilos.seloApagado]}>
                <View style={[estilos.medalha, s.ganho && estilos.medalhaGanha]}>
                  <Prumo tamanho={14} cor={s.ganho ? Cores.preto : Cores.cinza1} />
                </View>
                <Txt v="legenda" familia="corpoMedio" cor={s.ganho ? 'texto' : 'texto3'} numberOfLines={1}>
                  {s.nome}
                </Txt>
                <Txt v="legenda" cor="texto3" numberOfLines={1} style={estilos.centro}>
                  {s.descricao}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        <Txt v="legenda" cor="texto3" style={estilos.rodape}>
          {concluidos} de {TOTAL_DIAS} dias concluídos.
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  conteudo: { padding: Espaco.tres, gap: Espaco.tres, paddingBottom: Espaco.seis * 2, paddingTop: Espaco.dois },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Espaco.tres },
  linhaSaldo: { flexDirection: 'row', alignItems: 'baseline', gap: Espaco.dois },
  unidade: { marginBottom: 4 },
  direita: { alignItems: 'flex-end' },
  divisor: { marginVertical: Espaco.tres },
  trilho: { height: 3, backgroundColor: Tema.borda, marginTop: Espaco.dois },
  trilhoFino: { height: 2, backgroundColor: Tema.borda, marginTop: Espaco.tres },
  preenchido: { height: '100%', backgroundColor: Cores.branco },
  espacoMeio: { marginTop: Espaco.dois },
  regras: { marginTop: Espaco.tres, gap: Espaco.dois },
  regra: { flexDirection: 'row', alignItems: 'center', gap: Espaco.tres },
  flex: { flex: 1 },
  secao: { gap: Espaco.dois, marginTop: Espaco.dois },
  recompensa: {},
  recompensaResgatada: { borderColor: Cores.branco },
  recompensaBloqueada: { opacity: 0.6 },
  pressionado: { opacity: 0.7 },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: Espaco.dois },
  selo: {
    width: '31.5%',
    alignItems: 'center',
    gap: Espaco.um,
    paddingVertical: Espaco.tres,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.painel,
  },
  seloApagado: { opacity: 0.5 },
  medalha: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    marginBottom: Espaco.um,
  },
  medalhaGanha: { backgroundColor: Cores.branco, borderColor: Cores.branco },
  centro: { textAlign: 'center' },
  rodape: { textAlign: 'center', marginTop: Espaco.tres },
});
