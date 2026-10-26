import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraEixo } from '@/components/balanca';
import { Txt } from '@/components/texto';
import { Anel, Botao, Cartao, Divisor } from '@/components/ui';
import { Cores, Espaco, Raio, Tema } from '@/constants/tema';
import { nomeEixo, notaDoEixo, notaGeral, type Eixo } from '@/content/avaliacao';
import { TOTAL_DIAS } from '@/content/jornada';
import { motivoPorId } from '@/content/mas';
import { turmaComVoce } from '@/content/turma';
import { iniciais, primeiroNome } from '@/lib/conta';
import { useConta } from '@/lib/conta-contexto';
import { avaliacaoPor, proximoMarco } from '@/lib/estado';
import { useJornada } from '@/lib/jornada-contexto';
import { agendarLembrete, cancelarLembrete, formatarHora } from '@/lib/lembrete';
import { formatarTijolos, nivelDe, progressoNoNivel, proximoNivel } from '@/lib/pontos';

const horarios = [5 * 60, 5 * 60 + 30, 6 * 60, 6 * 60 + 30, 7 * 60, 21 * 60, 22 * 60];
const EIXOS: Eixo[] = ['deus', 'consigo', 'casa'];

export default function Perfil() {
  const { estado, seq, tijolos, saldo, definirLembrete, reiniciar } = useJornada();
  const { usuario, convidado, sair, apagarConta } = useConta();
  const [ocupado, setOcupado] = useState(false);

  const marco = proximoMarco(seq);
  const concluidos = estado.concluidos.length;
  const nivel = nivelDe(tijolos);
  const proximo = proximoNivel(tijolos);
  const progresso = progressoNoNivel(tijolos);

  const inicial = avaliacaoPor(estado, 'inicial');
  const final = avaliacaoPor(estado, 'final');
  const meuNome = usuario ? primeiroNome(usuario.nome) : 'Você';
  const posicao = turmaComVoce(meuNome, tijolos, seq, false).findIndex((m) => m.eu) + 1;

  // Qual "mas" mais se repete. É o que o dia 28 tem a mostrar.
  const contagemMas = estado.mas.reduce<Record<string, number>>((acc, m) => {
    acc[m.motivo] = (acc[m.motivo] ?? 0) + 1;
    return acc;
  }, {});
  const masOrdenados = Object.entries(contagemMas).sort((a, b) => b[1] - a[1]);

  async function alternarLembrete(ativo: boolean) {
    setOcupado(true);
    try {
      if (ativo) {
        const ok = await agendarLembrete(estado.lembrete.minutos);
        if (!ok) {
          Alert.alert('Permissão negada', 'Libere as notificações nos Ajustes para receber o lembrete.');
          return;
        }
      } else {
        await cancelarLembrete();
      }
      definirLembrete(ativo, estado.lembrete.minutos);
    } finally {
      setOcupado(false);
    }
  }

  async function mudarHorario(minutos: number) {
    definirLembrete(estado.lembrete.ativo, minutos);
    if (estado.lembrete.ativo) await agendarLembrete(minutos);
  }

  async function sairDaConta() {
    await cancelarLembrete();
    await sair();
    router.replace('/entrar');
  }

  function confirmarApagar() {
    Alert.alert(
      'Apagar a conta',
      'Isso apaga a conta e todo o progresso dela neste aparelho. Não dá para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            reiniciar();
            await cancelarLembrete();
            await apagarConta();
            router.replace('/entrar');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Txt v="titulo1" familia="display">
          Seu prumo
        </Txt>

        {/* Identidade */}
        {usuario ? (
          <Cartao>
            <View style={estilos.linha}>
              <View style={estilos.avatar}>
                <Txt v="corpo" familia="displayForte" cor="inversoTexto">
                  {iniciais(usuario.nome)}
                </Txt>
              </View>
              <View style={estilos.flex}>
                <Txt v="corpo" familia="corpoMedio" numberOfLines={1}>
                  {usuario.nome}
                </Txt>
                <Txt v="pequeno" cor="texto2" numberOfLines={1}>
                  {usuario.email}
                </Txt>
              </View>
            </View>

            <Divisor style={estilos.divisor} />

            <View style={estilos.linhaTopo}>
              <Txt v="corpo" familia="corpoMedio">
                {nivel.nome}
              </Txt>
              <Txt v="pequeno" cor="texto2">
                {formatarTijolos(tijolos)} tijolos · {posicao}º na turma
              </Txt>
            </View>
            <View style={estilos.trilho}>
              <View style={[estilos.preenchido, { width: `${progresso * 100}%` }]} />
            </View>
            <Txt v="legenda" cor="texto3" style={estilos.espacoMeio}>
              {proximo
                ? `Faltam ${formatarTijolos(proximo.apartir - tijolos)} tijolos para ${proximo.nome}.`
                : nivel.descricao}
            </Txt>
          </Cartao>
        ) : (
          <Cartao>
            <Txt v="corpo" familia="corpoMedio">
              Você está sem conta
            </Txt>
            <Txt v="pequeno" cor="texto2" style={estilos.espacoMeio}>
              Seu progresso está guardado só neste aparelho. Crie a conta e ele vai junto — e você
              entra na turma e no ranking.
            </Txt>
            <Botao
              titulo="Criar conta"
              onPress={() => router.push('/entrar?modo=criar')}
              style={estilos.espacoAcima}
            />
          </Cartao>
        )}

        {/* Números */}
        <View style={estilos.grade}>
          <Cartao style={estilos.celula}>
            <Anel valor={seq / marco} tamanho={44} traco={3}>
              <Txt v="pequeno" familia="displayForte">
                {seq}
              </Txt>
            </Anel>
            <Txt v="legenda" cor="texto2" style={estilos.centro}>
              Sequência
            </Txt>
          </Cartao>
          <Cartao style={estilos.celula}>
            <Txt v="titulo2" familia="display">
              {estado.melhorSeq}
            </Txt>
            <Txt v="legenda" cor="texto2" style={estilos.centro}>
              Melhor sequência
            </Txt>
          </Cartao>
          <Cartao style={estilos.celula}>
            <Txt v="titulo2" familia="display">
              {concluidos}
            </Txt>
            <Txt v="legenda" cor="texto2" style={estilos.centro}>
              de {TOTAL_DIAS} dias
            </Txt>
          </Cartao>
          <Cartao style={estilos.celula}>
            <Txt v="titulo2" familia="display">
              {formatarTijolos(saldo)}
            </Txt>
            <Txt v="legenda" cor="texto2" style={estilos.centro}>
              Saldo
            </Txt>
          </Cartao>
        </View>

        {/* Antes e depois */}
        <Cartao>
          <Txt v="pequeno" cor="texto2">
            Antes e depois
          </Txt>
          {!inicial ? (
            <>
              <Txt v="corpo" familia="display" style={estilos.espacoMeio}>
                Você ainda não fez o retrato do dia 1.
              </Txt>
              <Txt v="pequeno" cor="texto2" style={estilos.espacoMeio}>
                São nove perguntas. Sem elas, no dia 28 não existe comparação.
              </Txt>
              <Botao
                titulo="Fazer agora"
                variante="secundario"
                onPress={() => router.push('/avaliacao?tipo=inicial')}
                style={estilos.espacoAcima}
              />
            </>
          ) : (
            <>
              <View style={estilos.linhaNotas}>
                <View style={estilos.notaBloco}>
                  <Txt v="titulo1" familia="display">
                    {notaGeral(inicial.respostas).toFixed(1).replace('.', ',')}
                  </Txt>
                  <Txt v="legenda" cor="texto3">
                    Dia 1
                  </Txt>
                </View>
                <Txt v="titulo3" cor="texto3">
                  →
                </Txt>
                <View style={estilos.notaBloco}>
                  <Txt v="titulo1" familia="display" cor={final ? 'texto' : 'texto3'}>
                    {final ? notaGeral(final.respostas).toFixed(1).replace('.', ',') : '—'}
                  </Txt>
                  <Txt v="legenda" cor="texto3">
                    Dia {TOTAL_DIAS}
                  </Txt>
                </View>
              </View>

              <Divisor style={estilos.divisor} />

              <View style={estilos.eixos}>
                {EIXOS.map((eixo) => (
                  <BarraEixo
                    key={eixo}
                    nome={nomeEixo[eixo]}
                    valor={notaDoEixo((final ?? inicial).respostas, eixo)}
                  />
                ))}
              </View>

              {!final && concluidos >= TOTAL_DIAS ? (
                <Botao
                  titulo="Fazer o retrato do dia 28"
                  onPress={() => router.push('/avaliacao?tipo=final')}
                  style={estilos.espacoAcima}
                />
              ) : !final ? (
                <Txt v="legenda" cor="texto3" style={estilos.espacoAcima}>
                  O retrato final abre quando os 28 dias estiverem concluídos.
                </Txt>
              ) : null}
            </>
          )}
        </Cartao>

        {/* Os "mas" */}
        <Cartao>
          <View style={estilos.linhaTopo}>
            <Txt v="pequeno" cor="texto2">
              Seus &quot;mas&quot;
            </Txt>
            <Txt v="legenda" cor="texto3">
              {estado.mas.length} {estado.mas.length === 1 ? 'registro' : 'registros'}
            </Txt>
          </View>
          {masOrdenados.length === 0 ? (
            <Txt v="pequeno" cor="texto3" style={estilos.espacoMeio}>
              Nenhum dia perdido até agora. Quando acontecer, o motivo fica registrado aqui.
            </Txt>
          ) : (
            <View style={estilos.listaMas}>
              {masOrdenados.map(([id, n]) => {
                const motivo = motivoPorId(id);
                const maior = masOrdenados[0][1];
                return (
                  <View key={id} style={estilos.linhaMas}>
                    <Txt v="pequeno" cor="texto2" style={estilos.flex} numberOfLines={1}>
                      {motivo?.frase ?? id}
                    </Txt>
                    <View style={estilos.trilhoMas}>
                      <View style={[estilos.preenchido, { width: `${(n / maior) * 100}%` }]} />
                    </View>
                    <Txt v="pequeno" familia="displayForte" style={estilos.contagem}>
                      {n}
                    </Txt>
                  </View>
                );
              })}
              <Txt v="legenda" cor="texto3" style={estilos.espacoMeio}>
                O que mais se repete é o que precisa de plano, não de força de vontade.
              </Txt>
            </View>
          )}
        </Cartao>

        {/* Lembrete */}
        <Cartao>
          <View style={estilos.linhaTopo}>
            <View style={estilos.flex}>
              <Txt v="corpo" familia="corpoMedio">
                Lembrete diário
              </Txt>
              <Txt v="pequeno" cor="texto2">
                {estado.lembrete.ativo ? `Todo dia às ${formatarHora(estado.lembrete.minutos)}` : 'Desligado'}
              </Txt>
            </View>
            <Switch
              value={estado.lembrete.ativo}
              onValueChange={alternarLembrete}
              disabled={ocupado}
              trackColor={{ true: Cores.branco, false: Cores.cinza3 }}
              thumbColor={Cores.preto}
              ios_backgroundColor={Cores.cinza3}
            />
          </View>
          <View style={estilos.horarios}>
            {horarios.map((h) => (
              <Pressable
                key={h}
                onPress={() => mudarHorario(h)}
                style={[estilos.horario, estado.lembrete.minutos === h && estilos.horarioAtivo]}>
                <Txt v="pequeno" cor={estado.lembrete.minutos === h ? 'inversoTexto' : 'texto2'}>
                  {formatarHora(h)}
                </Txt>
              </Pressable>
            ))}
          </View>
        </Cartao>

        <Divisor />
        <View style={estilos.acoes}>
          <Pressable
            hitSlop={8}
            onPress={() =>
              Alert.alert('Recomeçar', 'Isso apaga o seu progresso, mas mantém a conta.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Apagar progresso', style: 'destructive', onPress: reiniciar },
              ])
            }>
            <Txt v="pequeno" cor="texto2">
              Recomeçar a jornada
            </Txt>
          </Pressable>

          {usuario ? (
            <>
              <Pressable
                hitSlop={8}
                onPress={() =>
                  Alert.alert('Sair', 'Seu progresso continua guardado nesta conta.', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sair', onPress: sairDaConta },
                  ])
                }>
                <Txt v="pequeno" cor="texto2">
                  Sair da conta
                </Txt>
              </Pressable>

              <Pressable hitSlop={8} onPress={confirmarApagar}>
                <Txt v="pequeno" style={estilos.perigo}>
                  Apagar a conta
                </Txt>
              </Pressable>
            </>
          ) : convidado ? (
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert('Voltar para a entrada', 'Seu progresso fica guardado neste aparelho.', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Voltar', onPress: sairDaConta },
                ])
              }>
              <Txt v="pequeno" cor="texto2">
                Voltar para a tela de entrada
              </Txt>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  conteudo: { padding: Espaco.tres, gap: Espaco.tres, paddingBottom: Espaco.seis * 2, paddingTop: Espaco.dois },
  linha: { flexDirection: 'row', alignItems: 'center', gap: Espaco.tres },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Espaco.tres },
  flex: { flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Raio.retrato,
    backgroundColor: Cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisor: { marginVertical: Espaco.tres },
  trilho: { height: 3, backgroundColor: Tema.borda, marginTop: Espaco.dois },
  preenchido: { height: '100%', backgroundColor: Cores.branco },
  espacoMeio: { marginTop: Espaco.dois },
  espacoAcima: { marginTop: Espaco.tres },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: Espaco.dois },
  celula: {
    width: '48.5%',
    alignItems: 'center',
    gap: Espaco.dois,
    paddingVertical: Espaco.tres,
  },
  centro: { textAlign: 'center' },
  linhaNotas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaco.quatro,
    marginTop: Espaco.tres,
  },
  notaBloco: { alignItems: 'center' },
  eixos: { gap: Espaco.dois },
  listaMas: { marginTop: Espaco.tres, gap: Espaco.dois },
  linhaMas: { flexDirection: 'row', alignItems: 'center', gap: Espaco.dois },
  trilhoMas: { width: 64, height: 2, backgroundColor: Tema.borda },
  contagem: { width: 20, textAlign: 'right' },
  horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: Espaco.um, marginTop: Espaco.tres },
  horario: {
    paddingHorizontal: Espaco.dois,
    paddingVertical: Espaco.um,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.selo,
  },
  horarioAtivo: { backgroundColor: Cores.branco, borderColor: Cores.branco },
  acoes: { gap: Espaco.tres },
  perigo: { color: Cores.erro },
});
