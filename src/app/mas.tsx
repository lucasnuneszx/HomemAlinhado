import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/texto';
import { Botao, Cartao, Divisor } from '@/components/ui';
import { Cores, Espaco, Fontes, Raio, Tema, Texto } from '@/constants/tema';
import { motivos, type Motivo } from '@/content/mas';
import { PONTOS } from '@/content/pontos';
import { useJornada } from '@/lib/jornada-contexto';
import { agendarLembrete } from '@/lib/lembrete';

/**
 * O "mas".
 *
 * Ele perdeu um dia. Em vez de esconder o buraco na barra dos 28, o app pede o
 * nome do obstáculo e devolve uma resposta. Nenhuma tela aqui chama ninguém de
 * preguiçoso: o objetivo é que o padrão fique visível no dia 28.
 */
export default function Mas() {
  const { dia: diaParam } = useLocalSearchParams<{ dia?: string }>();
  const dia = Number(diaParam) || 1;
  const { estado, registrarMas, definirLembrete } = useJornada();

  const [escolhido, setEscolhido] = useState<Motivo | null>(null);
  const [texto, setTexto] = useState('');
  const [registrado, setRegistrado] = useState(false);

  function escolher(m: Motivo) {
    void Haptics.selectionAsync();
    setEscolhido(m);
  }

  function confirmar() {
    if (!escolhido) return;
    registrarMas(dia, escolhido.id, texto.trim() || undefined);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRegistrado(true);
  }

  async function ligarLembrete() {
    const ok = await agendarLembrete(estado.lembrete.minutos);
    if (ok) definirLembrete(true, estado.lembrete.minutos);
    void Haptics.selectionAsync();
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
          Dia {dia}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        {!escolhido ? (
          <>
            <Txt v="titulo2" familia="display">
              Você perdeu o dia {dia}.
            </Txt>
            <Txt v="corpo" cor="texto2">
              Todo homem tem um &quot;mas&quot;. Diga qual foi o seu — sem rodeio, e sem se
              castigar.
            </Txt>
            <View style={estilos.lista}>
              {motivos.map((m) => (
                <Pressable key={m.id} onPress={() => escolher(m)} style={estilos.opcao}>
                  <Txt v="corpo">{m.frase}</Txt>
                </Pressable>
              ))}
            </View>
          </>
        ) : !registrado ? (
          <>
            <Txt v="pequeno" cor="texto2">
              {escolhido.frase}
            </Txt>
            <Txt v="titulo2" familia="display">
              {escolhido.resposta}
            </Txt>

            <Cartao>
              <Txt v="pequeno" cor="texto2">
                {escolhido.referencia}
              </Txt>
              <Txt v="corpo" familia="displayItalico" style={estilos.espacoMeio}>
                {escolhido.texto}
              </Txt>
            </Cartao>

            {escolhido.id === 'outro' ? (
              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder="Escreva em uma linha o que entrou na frente"
                placeholderTextColor={Cores.cinza1}
                multiline
                style={estilos.campo}
              />
            ) : null}

            <Cartao>
              <Txt v="pequeno" cor="texto2">
                E agora
              </Txt>
              <Txt v="corpo" style={estilos.espacoMeio}>
                {escolhido.acao}
              </Txt>
              {escolhido.sugereLembrete && !estado.lembrete.ativo ? (
                <Botao
                  titulo="Ligar o lembrete diário"
                  variante="secundario"
                  onPress={ligarLembrete}
                  style={estilos.espacoAcima}
                />
              ) : null}
            </Cartao>

            <Botao titulo="Encarei. Seguir." onPress={confirmar} />
            <Pressable onPress={() => setEscolhido(null)} hitSlop={8} style={estilos.centro}>
              <Txt v="pequeno" cor="texto2">
                Não foi esse o motivo
              </Txt>
            </Pressable>
          </>
        ) : (
          <>
            <Txt v="titulo2" familia="display">
              Registrado.
            </Txt>
            <Txt v="corpo" cor="texto2">
              O dia {dia} fica marcado como perdido — isso não se apaga, e não precisa. No dia 28
              você vai ver se era sempre o mesmo &quot;mas&quot;.
            </Txt>

            <Cartao>
              <Txt v="pequeno" cor="texto2">
                Tijolos por encarar
              </Txt>
              <Txt v="titulo2" familia="display" style={estilos.espacoMeio}>
                +{PONTOS.mas}
              </Txt>
            </Cartao>

            <Divisor />

            <Botao
              titulo={`Repor o dia ${dia} agora`}
              variante="secundario"
              onPress={() => router.replace(`/checkin?dia=${dia}&repor=1`)}
            />
            <Txt v="legenda" cor="texto3" style={estilos.nota}>
              Repor conta para os 28 dias e vale {PONTOS.reposicao} tijolos. Não devolve a
              sequência: aquela foi embora no dia em que passou.
            </Txt>

            <Botao titulo="Voltar para hoje" onPress={() => router.back()} />
          </>
        )}
      </ScrollView>
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
  conteudo: { padding: Espaco.tres, paddingTop: Espaco.quatro, gap: Espaco.tres, paddingBottom: Espaco.seis },
  lista: { gap: Espaco.dois, marginTop: Espaco.dois },
  opcao: {
    paddingVertical: Espaco.tres,
    paddingHorizontal: Espaco.tres,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.campo,
  },
  espacoMeio: { marginTop: Espaco.dois },
  espacoAcima: { marginTop: Espaco.tres },
  centro: { alignSelf: 'center' },
  nota: { textAlign: 'center' },
  campo: {
    minHeight: 90,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tema.borda,
    borderRadius: Raio.campo,
    padding: Espaco.tres,
    color: Tema.texto,
    fontFamily: Fontes.corpo,
    fontSize: Texto.corpo.fontSize,
    lineHeight: Texto.corpo.lineHeight,
    textAlignVertical: 'top',
  },
});
