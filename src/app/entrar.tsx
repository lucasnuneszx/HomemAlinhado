import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/texto';
import { Botao, Campo, Divisor, Prumo, Segmentado } from '@/components/ui';
import { Cores, Espaco, Tema } from '@/constants/tema';
import { validarEmail, validarNome, validarSenha } from '@/lib/conta';
import { useConta } from '@/lib/conta-contexto';

type Modo = 'entrar' | 'criar' | 'recuperar';

const textos: Record<Modo, { titulo: string; abertura: string; acao: string }> = {
  entrar: {
    titulo: 'Bom te ver de novo.',
    abertura: 'Sua sequência e o seu Índice continuam de onde você parou.',
    acao: 'Entrar',
  },
  criar: {
    titulo: 'Vinte e oito dias começam aqui.',
    abertura: 'A conta guarda a sua sequência, o seu Índice e o seu lugar na turma.',
    acao: 'Criar conta e começar',
  },
  recuperar: {
    titulo: 'Vamos destravar.',
    abertura: 'Confirme o e-mail da sua conta e escolha uma senha nova.',
    acao: 'Salvar nova senha',
  },
};

const abas = [
  { valor: 'entrar' as const, rotulo: 'Entrar' },
  { valor: 'criar' as const, rotulo: 'Criar conta' },
];

export default function Entrar() {
  const { criarConta, entrar, redefinirSenha, entrarDepois, convidado } = useConta();
  // Quem chega pelo Perfil já quer criar conta: `/entrar?modo=criar`.
  const { modo: modoInicial } = useLocalSearchParams<{ modo?: string }>();
  const [modo, setModo] = useState<Modo>(modoInicial === 'criar' ? 'criar' : 'entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ nome?: string; email?: string; senha?: string; geral?: string }>({});
  const [ocupado, setOcupado] = useState(false);

  const campoEmail = useRef<TextInput>(null);
  const campoSenha = useRef<TextInput>(null);

  // Entrada suave, no mesmo tempo da abertura.
  const [entrada] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animacao = Animated.timing(entrada, {
      toValue: 1,
      duration: 520,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    });
    animacao.start();
    return () => animacao.stop();
  }, [entrada]);

  const t = textos[modo];

  function trocarModo(novo: Modo) {
    void Haptics.selectionAsync();
    setModo(novo);
    setErros({});
    setSenha('');
  }

  async function enviar() {
    const proximos: typeof erros = {};
    if (modo === 'criar') proximos.nome = validarNome(nome) ?? undefined;
    proximos.email = validarEmail(email) ?? undefined;
    proximos.senha = validarSenha(senha) ?? undefined;

    if (proximos.nome || proximos.email || proximos.senha) {
      setErros(proximos);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setErros({});
    setOcupado(true);
    try {
      const r =
        modo === 'criar'
          ? await criarConta(nome, email, senha)
          : modo === 'entrar'
            ? await entrar(email, senha)
            : await redefinirSenha(email, senha);

      if (!r.ok) {
        setErros({ geral: r.erro });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/hoje');
    } finally {
      setOcupado(false);
    }
  }

  async function seguirSemConta() {
    void Haptics.selectionAsync();
    await entrarDepois();
    router.replace('/hoje');
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              estilos.corpo,
              {
                opacity: entrada,
                transform: [
                  { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                ],
              },
            ]}>
            <View style={estilos.marca}>
              <Prumo tamanho={20} />
              <Txt v="legenda" cor="texto2" style={estilos.nomeMarca}>
                HOMEM ALINHADO
              </Txt>
            </View>

            <View style={estilos.cabecalho}>
              <Txt v="titulo1" familia="display">
                {t.titulo}
              </Txt>
              <Txt v="corpo" cor="texto2">
                {t.abertura}
              </Txt>
            </View>

            <Divisor />

            {modo === 'recuperar' ? null : (
              <Segmentado opcoes={abas} valor={modo} aoMudar={trocarModo} />
            )}

            <View style={estilos.campos}>
              {modo === 'criar' ? (
                <Campo
                  rotulo="Nome completo"
                  erro={erros.nome}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Como o grupo vai te chamar"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  onSubmitEditing={() => campoEmail.current?.focus()}
                />
              ) : null}

              <Campo
                ref={campoEmail}
                rotulo="E-mail"
                erro={erros.email}
                value={email}
                onChangeText={setEmail}
                placeholder="voce@email.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => campoSenha.current?.focus()}
              />

              <Campo
                ref={campoSenha}
                segredo
                rotulo={modo === 'recuperar' ? 'Nova senha' : 'Senha'}
                erro={erros.senha}
                value={senha}
                onChangeText={setSenha}
                placeholder="Pelo menos 6 caracteres"
                autoCapitalize="none"
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                textContentType={modo === 'entrar' ? 'password' : 'newPassword'}
                returnKeyType="go"
                onSubmitEditing={enviar}
              />

              {erros.geral ? (
                <View style={estilos.aviso}>
                  <Txt v="pequeno" style={estilos.textoErro}>
                    {erros.geral}
                  </Txt>
                </View>
              ) : null}
            </View>

            <View style={estilos.acoes}>
              <Botao titulo={t.acao} onPress={enviar} carregando={ocupado} />

              {/* Criar conta não tem senha a recuperar. */}
              {modo === 'criar' ? null : (
                <Pressable
                  hitSlop={8}
                  style={estilos.centro}
                  onPress={() => trocarModo(modo === 'recuperar' ? 'entrar' : 'recuperar')}>
                  <Txt v="pequeno" cor="texto2">
                    {modo === 'recuperar' ? 'Voltar para a entrada' : 'Esqueci a senha'}
                  </Txt>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {modo === 'recuperar' ? null : (
            <View style={estilos.rodape}>
              <Divisor />
              <Botao
                titulo={convidado ? 'Continuar sem conta' : 'Entrar depois'}
                variante="secundario"
                onPress={seguirSemConta}
              />
              <Txt v="legenda" cor="texto3" style={estilos.nota}>
                Você começa hoje mesmo e cria a conta quando quiser. O que já tiver feito vai junto.
              </Txt>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Tema.fundo },
  flex: { flex: 1 },
  conteudo: {
    padding: Espaco.tres,
    paddingTop: Espaco.quatro,
    paddingBottom: Espaco.quatro,
    flexGrow: 1,
  },
  corpo: { gap: Espaco.quatro },
  marca: { flexDirection: 'row', alignItems: 'center', gap: Espaco.dois },
  nomeMarca: { letterSpacing: 2 },
  cabecalho: { gap: Espaco.dois },
  campos: { gap: Espaco.tres },
  aviso: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Cores.erro,
    borderRadius: 4,
    padding: Espaco.dois,
  },
  textoErro: { color: Cores.erro },
  acoes: { gap: Espaco.tres },
  centro: { alignSelf: 'center' },
  rodape: { marginTop: 'auto', paddingTop: Espaco.cinco, gap: Espaco.tres },
  nota: { textAlign: 'center', paddingHorizontal: Espaco.dois },
});
