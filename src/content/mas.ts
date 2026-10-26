/**
 * O "mas".
 *
 * Todo homem que falha tem uma frase pronta, e ela começa com "mas". O app não
 * finge que o dia perdido não existiu nem manda ele se sentir culpado: pede o
 * nome do obstáculo e devolve uma resposta curta com um texto.
 *
 * Nenhuma resposta humilha. A do motivo grave é deliberadamente diferente das
 * outras — tem semana em que a vida pesa mesmo, e tratar isso como preguiça
 * seria mentira.
 *
 * [CONFIRMAR] As respostas são o tom que eu entendi da marca. O Rodrigo revisa.
 */

export type Motivo = {
  id: string;
  frase: string;
  resposta: string;
  referencia: string;
  texto: string;
  /** O passo concreto para hoje. */
  acao: string;
  /** Liga o lembrete diário direto da tela. */
  sugereLembrete?: boolean;
  /** Muda o tom: nada de cobrança. */
  grave?: boolean;
};

export const motivos: Motivo[] = [
  {
    id: 'tempo',
    frase: 'Mas eu não tive tempo.',
    resposta:
      'Você não teve falta de tempo. Teve falta de decisão sobre o tempo. Dois minutos existiam em algum lugar do seu dia.',
    referencia: 'Efésios 5:15-16',
    texto: 'Andai com prudência, remindo o tempo, porquanto os dias são maus.',
    acao: 'Escolha agora a hora fixa de amanhã e deixe o lembrete ligado.',
    sugereLembrete: true,
  },
  {
    id: 'cansaco',
    frase: 'Mas eu estava cansado.',
    resposta:
      'Cansaço é real, e não é desculpa nem crime. Cansaço não desfaz compromisso — adia. Hoje você repõe.',
    referencia: 'Gálatas 6:9',
    texto: 'E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.',
    acao: 'Faça o dia de hoje antes de deitar. Mesmo curto.',
  },
  {
    id: 'atipico',
    frase: 'Mas foi um dia atípico.',
    resposta:
      'Todo dia é atípico para quem espera o dia típico. A rotina não é o dia perfeito: é o que sobrevive ao dia torto.',
    referencia: 'Eclesiastes 11:4',
    texto: 'Quem observa o vento nunca semeará, e o que olha para as nuvens nunca segará.',
    acao: 'Defina o mínimo que você faz mesmo nos dias ruins.',
  },
  {
    id: 'esqueci',
    frase: 'Mas eu esqueci.',
    resposta:
      'Esquecer é sintoma, não causa. O que a gente decide de verdade a gente ancora em algum lugar — num horário, num lugar, num aviso.',
    referencia: 'Provérbios 4:26',
    texto: 'Pondera a vereda de teus pés, e todos os teus caminhos sejam bem ordenados.',
    acao: 'Ligue o lembrete e ancore na hora em que você já está de pé.',
    sugereLembrete: true,
  },
  {
    id: 'vontade',
    frase: 'Mas eu não estava com vontade.',
    resposta:
      'Vontade é passageira. Prumo é decisão. O homem que só age quando sente vira refém do humor da semana.',
    referencia: '1 Coríntios 9:27',
    texto: 'Antes subjugo o meu corpo, e o reduzo à servidão.',
    acao: 'Comece pelo texto do dia, mesmo sem vontade. Sete linhas.',
  },
  {
    id: 'grave',
    frase: 'Mas aconteceu uma coisa séria.',
    resposta:
      'Então não era falta de disciplina. Tem semana em que a vida pesa, e Deus não cobra o que você não tinha para dar. Levante de onde parou, sem dívida.',
    referencia: 'Salmos 34:18',
    texto: 'Perto está o Senhor dos que têm o coração quebrantado.',
    acao: 'Volte no dia de hoje. O que passou fica para trás.',
    grave: true,
  },
  {
    id: 'outro',
    frase: 'Foi outra coisa.',
    resposta:
      'Dar nome ao que atrapalhou já é metade do conserto. O que você escreveu fica guardado no seu perfil, e no dia 28 você vai ver se era sempre a mesma coisa.',
    referencia: 'Lucas 8:17',
    texto: 'Porque nada há oculto que não haja de manifestar-se.',
    acao: 'Retome hoje. O padrão só aparece para quem anota.',
  },
];

export function motivoPorId(id: string): Motivo | undefined {
  return motivos.find((m) => m.id === id);
}
