# Homem Alinhado — app

App de iPhone do guia de 28 dias. Expo SDK 57, React Native 0.86, expo-router.

## Por que Expo e não Swift puro

O Android entra depois. Em Swift, o app Android seria escrito do zero de novo. Com Expo é a mesma base para os dois, e o widget continua sendo escrito em Swift, porque widget é nativo em qualquer caminho. O Expo também compila na nuvem pelo EAS, o que permite publicar sem depender desta máquina.

## Rodar

```bash
pnpm install
pnpm go           # Expo Go: abre no celular ou no simulador, sem compilar
pnpm ios          # build nativo, precisa do runtime do simulador instalado
```

`pnpm go` é o caminho do dia a dia: leia o QR com o Expo Go no iPhone, ou aperte `i`
para abrir no simulador. Tudo que o app faz hoje funciona no Expo Go. A única
diferença é a notificação: o lembrete local roda, mas o Expo Go avisa que não
suporta push remoto — o que o app não usa.

O projeto nativo fica em `ios/`, gerado por `npx expo prebuild`. Abra `ios/HomemAlinhado.xcworkspace` no Xcode, nunca o `.xcodeproj`.

Se o `pod install` falhar com erro de Unicode, rode com `LANG=en_US.UTF-8`.

**Não rode `expo prebuild` de novo sem cuidado.** O `ios/HomemAlinhado/AppDelegate.swift`
tem um ajuste feito à mão para o ciclo de cenas obrigatório no iOS 27. Prebuild
sobrescreve esse arquivo.

## Ícone e abertura

O ícone, a splash e o símbolo dentro do app saem todos da mesma geometria do prumo.
Os PNGs são gerados por script, sem Photoshop e sem dependência externa:

```bash
pnpm icones
```

O script escreve em `assets/images/` e também direto no catálogo do projeto nativo
(`ios/HomemAlinhado/Images.xcassets`), justamente para não precisar de prebuild.

## Metodologia

Tirada da YouVersion e adaptada ao guia:

- **Ritmo diário.** Todo dia tem uma leitura de um minuto. Segunda, quarta, sexta e domingo têm o check-in completo, de 5 a 10 minutos. Sem a leitura diária a sequência não existe, porque sequência só funciona com ação todo dia.
- **Sequência.** Dias seguidos concluídos, com marcos em 7, 14, 21 e 28. Não quebra enquanto o dia de hoje não fecha.
- **Lembrete.** Notificação local no horário escolhido. Não precisa de servidor.
- **Progresso visível.** Barra de 28 dias na tela Hoje e anel da sequência.
- **Grupo.** Quem já fez o check-in do dia aparece na turma. É o único recurso que exige banco e contas.

## Entrada

O app abre na porta (`src/app/index.tsx`): a linha do prumo desce, a gota assenta,
o nome abre aumentando o espaçamento entre as letras e um fio fecha embaixo. Toque
em qualquer lugar para pular. Quando termina, vai para a jornada se já houver sessão,
ou para a entrada se não houver.

A entrada (`src/app/entrar.tsx`) tem três modos na mesma tela: entrar, criar conta e
redefinir senha.

**A conta ainda é local.** `src/lib/conta.ts` guarda as contas no aparelho e nunca
grava a senha em texto puro. Não é autenticação de verdade — é a casca com a mesma
interface que o servidor vai expor, para que trocar por Supabase seja reescrever
aquele arquivo e mais nada. O progresso da jornada é gravado por conta
(`ha_estado_v1:<e-mail>`), então dois homens no mesmo aparelho não misturam sequência.

## A tela Hoje

É a primeira tela depois da entrada, e carrega o app inteiro:

1. **Cabeçalho** — data por extenso, saudação pelo horário com o primeiro nome,
   semana e dia da jornada, barra dos 28 dias.
2. **Seu prumo** — a balança (`src/components/balanca.tsx`). A linha pende do pino e
   assenta no ângulo que o Índice de Alinhamento manda: 10 é a vertical, 0 é o desvio
   máximo de 15°. O tracejado atrás é o prumo verdadeiro e o arco embaixo é a amplitude.
   Abaixo, a nota, o rótulo (Fora / Quase / No prumo) e os três eixos em barra. Sem
   nota registrada, a linha fica na vertical, apagada, com o caminho para o Índice.
3. **A ação do dia** — o cartão branco com a leitura ou o check-in.
4. **Sequência e a semana** — o anel com o marco e os sete pontos da semana atual.
5. **Texto de hoje** — versículo e reflexão.
6. **A turma** — quem já fez o check-in hoje; toca e vai para o Grupo.
7. **A jornada** — as quatro semanas com o progresso de cada uma.

**[CONFIRMAR] O conteúdo assume que o dia 1 cai numa segunda.** `tipoDoDia` marca
check-in na segunda, quarta, sexta e domingo contando a partir do dia 1, então quem
começa num sábado recebe o conteúdo de segunda no sábado. Ou a jornada passa a começar
sempre na segunda seguinte, ou os dias de check-in passam a seguir o dia real da semana.
É decisão do Rodrigo.

## Gamificação

A moeda é o **tijolo**, pela mesma imagem de Amós: cada dia no prumo é um tijolo, e
com eles o homem levanta a casa. Duas contas, de propósito:

- **acumulado** — tudo que já ganhou, nunca cai. É o que vale no ranking.
- **saldo** — acumulado menos o que gastou em recompensas.

Resgatar não derruba ninguém de posição. Ninguém deve hesitar em pegar o que
conquistou. Nada disso é guardado: tudo é derivado do estado em `src/lib/pontos.ts`,
então mudar uma regra recalcula o passado sozinho e o saldo nunca diverge do que a
pessoa fez.

Os níveis sobem pela construção: Alicerce → Fundamento → Coluna → Viga → Muro → Casa
no prumo.

**Inventário** (aba própria) mostra saldo, nível, a tabela de como se ganha tijolo, o
catálogo de recompensas e os doze selos. **Ranking** fica dentro do Grupo, num
alternador junto do feed.

**[CONFIRMAR] Valores, catálogo e nomes são uma proposta.** Tudo está em
`src/content/pontos.ts`, num arquivo só, para o Rodrigo ajustar sem mexer em tela.

## Antes e depois

Nove perguntas, três por eixo, respondidas numa escala de cinco passos. O homem
responde no dia 1 e de novo no dia 28 (`src/app/avaliacao.tsx`,
`src/content/avaliacao.ts`). Sem o retrato de entrada não existe comparação de saída —
por isso "Começar a jornada" leva para a avaliação, com um "Pular e começar direto"
discreto para quem não quiser.

O resultado usa a mesma régua de 0 a 10 do Índice, e o retrato final mostra o delta
por eixo.

## O "mas"

Todo homem que falha tem uma frase pronta, e ela começa com "mas". Quando um dia passa
sem ser feito, a Hoje abre um cartão branco pedindo o nome do obstáculo
(`src/app/mas.tsx`, `src/content/mas.ts`).

Sete motivos, cada um com uma resposta curta, um texto e um passo concreto. A resposta
do motivo grave é deliberadamente diferente das outras — tem semana em que a vida pesa
mesmo, e tratar isso como preguiça seria mentira. Nenhuma tela humilha.

Encarar vale tijolos. Depois dá para **repor** o dia: conta para os 28 e paga menos,
mas **não devolve a sequência** — `sequencia()` ignora os dias em `reposicoes`, senão a
sequência viraria mentira. O perfil acumula os "mas" e mostra qual se repete, que é o
ponto: no dia 28 ele vê que era sempre a mesma coisa.

## Estrutura

```
src/
  app/
    _layout.tsx          fontes, tema e provedores
    index.tsx            a porta: abertura e desvio para jornada ou entrada
    entrar.tsx           entrar, criar conta, redefinir senha
    (abas)/              Hoje, Índice, Grupo, Inventário, Perfil
    checkin.tsx          o check-in, em modal
    avaliacao.tsx        auto-avaliação de entrada e de saída
    mas.tsx              encarar um dia perdido
  components/
    abertura.tsx         a animação de abertura
    balanca.tsx          a balança do prumo e as barras dos eixos
    texto.tsx, ui.tsx    Txt, Campo, Segmentado e os blocos de interface
  constants/tema.ts      cores, tipografia, espaçamento
  content/
    jornada.ts           os 28 dias
    pontos.ts            tijolos, níveis e catálogo de recompensas
    avaliacao.ts         as nove perguntas do antes e depois
    mas.ts               os motivos e as respostas
    turma.ts             a turma de exemplo (Hoje, Grupo e ranking leem daqui)
  lib/
    conta.ts             contas, sessão e convidado (local, a trocar por Supabase)
    estado.ts            progresso, sequência, marcos, avaliações, "mas"
    pontos.ts            tijolos, saldo e níveis, tudo derivado do estado
    lembrete.ts          notificação local diária
```

O visual segue a landing: preto e branco absolutos, Cormorant Garamond para display e Inter para interface, cantos retos.

## O que falta

- **Autenticação de verdade.** A conta é local (ver acima). Com o Supabase ligado, o
  login passa a valer entre aparelhos e a compra de R$ 67 vira a chave de acesso.
- **Banco do grupo.** A turma, o feed e o ranking ainda são exemplo. É o único recurso
  do app que não funciona offline.
- **Entrega das recompensas.** O resgate registra e debita, mas ninguém recebe nada
  ainda. Precisa do servidor para disparar o e-mail com o material.
- **Widget.** Exige um alvo próprio no Xcode, em SwiftUI, e não roda no Expo Go: precisa
  de build nativo. Mostraria o texto do dia, a sequência e se o check-in de hoje saiu.
- **Conteúdo.** Os 28 dias usam a Almeida, de domínio público, com reflexões escritas como base. O Rodrigo precisa revisar e escolher a versão bíblica.
