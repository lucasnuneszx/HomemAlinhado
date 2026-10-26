# Homem Alinhado — app

App de iPhone do guia de 28 dias: leitura diária, check-in, sequência, Índice de Alinhamento, avaliação de entrada e saída, gamificação com tijolos e grupo.

## Stack

Expo SDK 57, React Native 0.86, expo-router (abas nativas), TypeScript, AsyncStorage, expo-notifications. Gerenciador: pnpm.

## Rodar localmente

```bash
pnpm install
pnpm go       # Expo Go, sem compilar
pnpm ios      # build nativo (Xcode + simulador)
pnpm lint
npx tsc --noEmit
```

No Expo Go tudo funciona, inclusive o lembrete local. O aviso sobre push remoto pode ser ignorado: o app não usa push.

A rota `/demo` (só em desenvolvimento) coloca a conta atual no dia 8 com dados de exemplo: `exp://<ip>:8081/--/demo`.

## Projeto nativo

O `ios/` foi gerado por `npx expo prebuild` e está versionado. Abra `ios/HomemAlinhado.xcworkspace` no Xcode, não o `.xcodeproj`. `ios/Pods` e `ios/build` ficam fora do git; rode `pod install` em `ios/` (com `LANG=en_US.UTF-8` se der erro de Unicode).

Não rode `expo prebuild` de novo sem cuidado: o `AppDelegate.swift` tem um ajuste manual para o ciclo de vida por cenas do iOS 27, e o prebuild sobrescreve esse arquivo.

Ícone e splash são gerados pelo `pnpm icones` (`scripts/gerar-icones.js`), que escreve em `assets/images/` e direto no `Images.xcassets` do iOS.

## Variáveis de ambiente

Nenhuma por enquanto. Conta e progresso ficam no aparelho.

## Estrutura

```
src/
  app/            rotas (expo-router)
    (abas)/       Hoje, Índice, Grupo, Inventário, Perfil
    index.tsx     abertura e redirecionamento
    entrar.tsx    login, cadastro e redefinição de senha
    checkin.tsx   check-in (modal)
    avaliacao.tsx avaliação de entrada e saída
    mas.tsx       registro de dia perdido
  components/     abertura, balança do prumo, texto e blocos de interface
  constants/      tema (cores, tipografia, espaçamento)
  content/        conteúdo editável: jornada, pontos, avaliação, "mas", turma
  lib/            conta, estado da jornada, pontos, lembrete, contextos
```

Regras que valem saber:

- O progresso é salvo por conta (`ha_estado_v1:<e-mail>`). Convidado usa a chave sem escopo e migra ao criar conta.
- Tijolos, saldo e nível são sempre derivados do estado (`src/lib/pontos.ts`), nunca gravados.
- Dia reposto conta para os 28, mas não para a sequência.

## Pendências

- Autenticação real e banco (Supabase). Hoje a conta é local; `src/lib/conta.ts` já tem a interface que o servidor vai expor.
- Turma, feed e ranking ainda usam dados de exemplo (`src/content/turma.ts`).
- Entrega das recompensas resgatadas depende do servidor.
- Widget de iOS (alvo SwiftUI próprio, exige build nativo).
- Conteúdo, valores de pontos e catálogo marcados com `[CONFIRMAR]` dependem de revisão do Rodrigo, incluindo a regra de que o dia 1 cai numa segunda.
