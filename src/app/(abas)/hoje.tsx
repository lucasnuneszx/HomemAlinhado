import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalancaPrumo, BarraEixo, rotuloDoIndice } from '@/components/balanca';
import { Txt } from '@/components/texto';
import { Anel, BarraDias, Botao, Cartao, CartaoForte, Divisor } from '@/components/ui';
import { Cores, Espaco, Raio, Tema } from '@/constants/tema';
import { diaPorNumero, minutosTipo, rotuloTipo, semanas, TOTAL_DIAS } from '@/content/jornada';
import { motivoPorId } from '@/content/mas';
import { PONTOS } from '@/content/pontos';
import { NOME_TURMA, turma } from '@/content/turma';
import { primeiroNome } from '@/lib/conta';
import { useConta } from '@/lib/conta-contexto';
import { avaliacaoPor, indiceGeral, proximoMarco } from '@/lib/estado';
import { useJornada } from '@/lib/jornada-contexto';
import { formatarTijolos, nivelDe } from '@/lib/pontos';

const LETRAS_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function dataDeHoje(): string {
  try {
    const texto = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  } catch {
    return '';
  }
}

export default function Hoje() {
  const { estado, carregado, dia, seq, fezHoje, perdidos, tijolos, comecar } = useJornada();
  const { usuario } = useConta();

  if (!carregado) return <View style={estilos.tela} />;

  const conteudoDoDia = diaPorNumero(dia);
  const semana = semanas[conteudoDoDia.semana - 1];
  const marco = proximoMarco(seq);
  const comecou = Boolean(estado.inicio);
  const concluidos = estado.concluidos.length;
  const nome = usuario ? primeiroNome(usuario.nome) : null;

  const ultimaNota = estado.notas.at(-1);
  const indice = ultimaNota ? indiceGeral(ultimaNota) : null;

  // Os sete dias da semana em que ele está.
  const inicioDaSemana = (conteudoDoDia.semana - 1) * 7 + 1;
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => inicioDaSemana + i);

  const fizeramHoje = turma.filter((m) => (m.eu ? fezHoje : m.feito)).length;

  const avaliacaoFinal = avaliacaoPor(estado, 'final');
  const terminou = concluidos >= TOTAL_DIAS;
  // O dia perdido mais recente é o que vale cobrar. Um de cada vez.
  const diaPerdido = perdidos.at(-1) ?? null;
  const ultimoMas = estado.mas.at(-1);

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={estilos.cabecalho}>
          <Txt v="pequeno" cor="texto3">
            {dataDeHoje()}
          </Txt>
          <Txt v="titulo1" familia="display" style={estilos.saudacao}>
            {nome ? `${saudacao()}, ${nome}.` : `${saudacao()}.`}
          </Txt>
          <View style={estilos.linhaMeta}>
            <Txt v="pequeno" cor="texto2">
              Semana {semana.n} · {semana.nome}
            </Txt>
            <Txt v="pequeno" cor="texto3">
              ·
            </Txt>
            <Txt v="pequeno" cor="texto2">
              {comecou ? `Dia ${dia} de ${TOTAL_DIAS}` : 'Ainda não começou'}
            </Txt>
          </View>
          <BarraDias total={TOTAL_DIAS} concluidos={concluidos} />
          <View style={estilos.linhaMeta}>
            <Txt v="legenda" cor="texto3">
              {nivelDe(tijolos).nome}
            </Txt>
            <Txt v="legenda" cor="texto3">
              ·
            </Txt>
            <Txt v="legenda" cor="texto3">
              {formatarTijolos(tijolos)} tijolos
            </Txt>
          </View>
        </View>

        {/* O "mas": um dia caiu e ainda não foi encarado */}
        {diaPerdido !== null ? (
          <CartaoForte>
            <Txt v="pequeno" cor="inversoTexto" style={estilos.opaco}>
              Dia {diaPerdido} · perdido
            </Txt>
            <Txt v="titulo3" familia="display" cor="inversoTexto" style={estilos.espacoMeio}>
              Todo homem tem um &quot;mas&quot;.
            </Txt>
            <Txt v="pequeno" cor="inversoTexto" style={[estilos.opaco, estilos.espacoMeio]}>
              Diga qual foi o seu. Leva um minuto e vale {PONTOS.mas} tijolos.
            </Txt>
            <View style={estilos.espacoAcima}>
              <Botao
                titulo="Encarar"
                variante="escuro"
                onPress={() => router.push(`/mas?dia=${diaPerdido}`)}
              />
            </View>
          </CartaoForte>
        ) : null}

        {/* O retrato final, quando os 28 dias fecharam */}
        {terminou && !avaliacaoFinal ? (
          <CartaoForte>
            <Txt v="pequeno" cor="inversoTexto" style={estilos.opaco}>
              Vinte e oito dias
            </Txt>
            <Txt v="titulo3" familia="display" cor="inversoTexto" style={estilos.espacoMeio}>
              Agora mede de novo.
            </Txt>
            <Txt v="pequeno" cor="inversoTexto" style={[estilos.opaco, estilos.espacoMeio]}>
              As mesmas nove perguntas do dia 1. O antes e depois em número.
            </Txt>
            <View style={estilos.espacoAcima}>
              <Botao
                titulo="Fazer o retrato final"
                variante="escuro"
                onPress={() => router.push('/avaliacao?tipo=final')}
              />
            </View>
          </CartaoForte>
        ) : null}

        {/* O prumo: o instrumento da casa */}
        <Cartao style={estilos.prumoCartao}>
          <View style={estilos.prumoTopo}>
            <Txt v="pequeno" cor="texto2">
              Seu prumo
            </Txt>
            {ultimaNota ? (
              <Txt v="legenda" cor="texto3">
                Semana {ultimaNota.semana}
              </Txt>
            ) : null}
          </View>

          <BalancaPrumo indice={indice} />

          {indice !== null && ultimaNota ? (
            <>
              <View style={estilos.prumoNumero}>
                <Txt v="display" familia="display">
                  {indice.toFixed(1).replace('.', ',')}
                </Txt>
                <Txt v="corpo" cor="texto2" style={estilos.prumoRotulo}>
                  {rotuloDoIndice(indice)}
                </Txt>
              </View>
              <Divisor style={estilos.divisorLargo} />
              <View style={estilos.eixos}>
                <BarraEixo nome="Com Deus" valor={ultimaNota.deus} />
                <BarraEixo nome="Consigo" valor={ultimaNota.consigo} />
                <BarraEixo nome="Com a casa" valor={ultimaNota.casa} />
              </View>
            </>
          ) : (
            <View style={estilos.prumoVazio}>
              <Txt v="corpo" familia="display" style={estilos.centro}>
                Ainda não medimos o seu prumo.
              </Txt>
              <Txt v="pequeno" cor="texto2" style={estilos.centro}>
                No domingo você dá uma nota para cada eixo e a linha acha o lugar dela.
              </Txt>
              <Botao
                titulo="Registrar agora"
                variante="secundario"
                onPress={() => router.push('/indice')}
                style={estilos.botaoLargo}
              />
            </View>
          )}
        </Cartao>

        {/* A ação do dia */}
        {!comecou ? (
          <Cartao>
            <Txt v="lead" familia="display">
              Vinte e oito dias começam com uma medida.
            </Txt>
            <Txt v="corpo" cor="texto2" style={estilos.espacoAcima}>
              Antes do dia 1, nove perguntas. É o retrato de onde você está hoje — sem ele, no dia
              28 não existe comparação.
            </Txt>
            <Botao
              titulo="Fazer o retrato do dia 1"
              onPress={() => router.push('/avaliacao?tipo=inicial')}
              style={estilos.espacoAcima}
            />
            <Pressable onPress={comecar} hitSlop={8} style={estilos.pular}>
              <Txt v="pequeno" cor="texto3">
                Pular e começar direto
              </Txt>
            </Pressable>
          </Cartao>
        ) : fezHoje ? (
          <Cartao>
            <Txt v="pequeno" cor="texto2">
              {rotuloTipo[conteudoDoDia.tipo]} · concluído
            </Txt>
            <Txt v="titulo3" familia="display" style={estilos.espacoMeio}>
              Feito. Volte amanhã.
            </Txt>
            <Txt v="corpo" cor="texto2" style={estilos.espacoMeio}>
              {conteudoDoDia.reflexao}
            </Txt>
          </Cartao>
        ) : (
          <CartaoForte>
            <Txt v="pequeno" cor="inversoTexto" style={estilos.opaco}>
              {rotuloTipo[conteudoDoDia.tipo]} · {minutosTipo[conteudoDoDia.tipo]} min
            </Txt>
            <Txt v="titulo3" familia="display" cor="inversoTexto" style={estilos.espacoMeio}>
              {conteudoDoDia.titulo}
            </Txt>
            <Txt v="pequeno" cor="inversoTexto" style={[estilos.opaco, estilos.espacoMeio]}>
              {conteudoDoDia.referencia}
            </Txt>
            <View style={estilos.espacoAcima}>
              <Botao
                titulo={conteudoDoDia.tipo === 'leitura' ? 'Ler agora' : 'Fazer o check-in'}
                variante="escuro"
                onPress={() => router.push(`/checkin?dia=${dia}`)}
              />
              <Txt v="legenda" cor="inversoTexto" style={[estilos.opaco, estilos.centro, estilos.espacoMeio]}>
                +{conteudoDoDia.tipo === 'leitura' ? PONTOS.leitura : PONTOS.checkin} tijolos
              </Txt>
            </View>
          </CartaoForte>
        )}

        {/* Sequência e a semana */}
        {comecou ? (
          <Cartao>
            <View style={estilos.linha}>
              <Anel valor={seq / marco} tamanho={56}>
                <Txt v="pequeno" familia="displayForte">
                  {seq}
                </Txt>
              </Anel>
              <View style={estilos.flex}>
                <Txt v="corpo" familia="corpoMedio">
                  {seq === 0
                    ? 'Sua sequência começa hoje'
                    : `Sequência de ${seq} ${seq === 1 ? 'dia' : 'dias'}`}
                </Txt>
                <Txt v="pequeno" cor="texto2">
                  {seq === 0
                    ? 'Faça o primeiro check-in.'
                    : seq >= TOTAL_DIAS
                      ? 'Vinte e oito dias sem falhar.'
                      : `Faltam ${marco - seq} para o marco de ${marco}.`}
                </Txt>
              </View>
            </View>

            <Divisor style={estilos.divisorLargo} />

            <View style={estilos.semana}>
              {diasDaSemana.map((d, i) => {
                const feito = estado.concluidos.includes(d);
                const ehHoje = d === dia;
                const futuro = d > dia;
                return (
                  <View key={d} style={estilos.diaSemana}>
                    <Txt v="legenda" cor={ehHoje ? 'texto' : 'texto3'}>
                      {LETRAS_SEMANA[i]}
                    </Txt>
                    <View
                      style={[
                        estilos.ponto,
                        feito && estilos.pontoFeito,
                        ehHoje && !feito && estilos.pontoHoje,
                        futuro && estilos.pontoFuturo,
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </Cartao>
        ) : null}

        {/* O texto de hoje */}
        <Cartao>
          <Txt v="pequeno" cor="texto2">
            Texto de hoje
          </Txt>
          <Txt v="titulo3" familia="display" style={estilos.espacoMeio}>
            {conteudoDoDia.referencia}
          </Txt>
          <Txt v="corpo" familia="displayItalico" style={estilos.espacoMeio}>
            {conteudoDoDia.texto}
          </Txt>
          <Divisor style={estilos.divisorLargo} />
          <Txt v="pequeno" cor="texto2">
            {conteudoDoDia.reflexao}
          </Txt>
        </Cartao>

        {/* O último "mas" encarado */}
        {ultimoMas && diaPerdido === null ? (
          <Cartao>
            <Txt v="pequeno" cor="texto2">
              Seu último &quot;mas&quot;
            </Txt>
            <Txt v="corpo" familia="display" style={estilos.espacoMeio}>
              {motivoPorId(ultimoMas.motivo)?.frase ?? ultimoMas.texto}
            </Txt>
            <Txt v="pequeno" cor="texto2" style={estilos.espacoMeio}>
              {motivoPorId(ultimoMas.motivo)?.acao}
            </Txt>
          </Cartao>
        ) : null}

        {/* A turma */}
        <Pressable onPress={() => router.push('/grupo')}>
          {({ pressed }) => (
            <Cartao style={pressed ? estilos.pressionado : undefined}>
              <View style={estilos.prumoTopo}>
                <Txt v="pequeno" cor="texto2">
                  {NOME_TURMA}
                </Txt>
                <Txt v="legenda" cor="texto3">
                  {fizeramHoje} de {turma.length} hoje
                </Txt>
              </View>
              <View style={estilos.avatares}>
                {turma.map((m) => {
                  const ok = m.eu ? fezHoje : m.feito;
                  return (
                    <View
                      key={m.nome}
                      style={[estilos.avatar, ok ? estilos.avatarFeito : estilos.avatarFalta]}>
                      <Txt v="pequeno" familia="displayForte" cor={ok ? 'inversoTexto' : 'texto3'}>
                        {m.eu ? (nome?.[0]?.toUpperCase() ?? 'V') : m.inicial}
                      </Txt>
                    </View>
                  );
                })}
              </View>
            </Cartao>
          )}
        </Pressable>

        {/* As quatro semanas */}
        <View style={estilos.jornada}>
          <Txt v="titulo3" familia="display">
            A jornada
          </Txt>
          {semanas.map((s) => {
            const feitosNaSemana = estado.concluidos.filter(
              (d) => d > (s.n - 1) * 7 && d <= s.n * 7,
            ).length;
            const atual = s.n === conteudoDoDia.semana;
            return (
              <View key={s.n} style={[estilos.semanaLinha, atual && estilos.semanaAtual]}>
                <Txt v="corpo" familia="displayForte" cor={atual ? 'texto' : 'texto3'} style={estilos.semanaN}>
                  {s.n}
                </Txt>
                <View style={estilos.flex}>
                  <Txt v="corpo" familia="corpoMedio" cor={atual ? 'texto' : 'texto2'}>
                    {s.nome}
                  </Txt>
                  <Txt v="legenda" cor="texto3">
                    {s.foco}
                  </Txt>
                </View>
                <Txt v="pequeno" cor={feitosNaSemana === 7 ? 'texto' : 'texto3'}>
                  {feitosNaSemana}/7
                </Txt>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  conteudo: { padding: Espaco.tres, gap: Espaco.tres, paddingBottom: Espaco.seis * 2 },
  cabecalho: { gap: Espaco.dois, paddingTop: Espaco.dois },
  saudacao: { marginTop: -2 },
  linhaMeta: { flexDirection: 'row', alignItems: 'center', gap: Espaco.dois },
  prumoCartao: { alignItems: 'center', paddingVertical: Espaco.quatro },
  prumoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  prumoNumero: { alignItems: 'center', marginTop: Espaco.dois },
  prumoRotulo: { marginTop: Espaco.um, letterSpacing: 0.4 },
  prumoVazio: { alignItems: 'center', gap: Espaco.dois, marginTop: Espaco.tres },
  divisorLargo: { alignSelf: 'stretch', marginVertical: Espaco.tres },
  eixos: { alignSelf: 'stretch', gap: Espaco.dois },
  centro: { textAlign: 'center' },
  pular: { alignSelf: 'center', marginTop: Espaco.tres },
  botaoLargo: { alignSelf: 'stretch', marginTop: Espaco.dois },
  linha: { flexDirection: 'row', alignItems: 'center', gap: Espaco.tres },
  flex: { flex: 1 },
  espacoAcima: { marginTop: Espaco.tres },
  espacoMeio: { marginTop: Espaco.dois },
  opaco: { opacity: 0.6 },
  semana: { flexDirection: 'row', justifyContent: 'space-between' },
  diaSemana: { alignItems: 'center', gap: Espaco.dois, width: 34 },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
  },
  pontoFeito: { backgroundColor: Cores.branco, borderColor: Cores.branco },
  pontoHoje: { borderColor: Cores.branco, borderWidth: 1.5 },
  pontoFuturo: { opacity: 0.5 },
  pressionado: { opacity: 0.7 },
  avatares: { flexDirection: 'row', gap: Espaco.dois, marginTop: Espaco.tres },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Raio.retrato,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFeito: { backgroundColor: Cores.branco },
  avatarFalta: { borderWidth: StyleSheet.hairlineWidth, borderColor: Tema.borda },
  jornada: { gap: Espaco.dois, marginTop: Espaco.dois },
  semanaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaco.tres,
    paddingVertical: Espaco.dois,
    paddingHorizontal: Espaco.tres,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    borderRadius: Raio.painel,
  },
  semanaAtual: { borderColor: Tema.borda },
  semanaN: { width: 18, textAlign: 'center' },
});
