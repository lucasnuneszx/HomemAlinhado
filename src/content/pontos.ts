/**
 * Tijolos: a moeda da jornada.
 *
 * A metáfora é a mesma de Amós — o muro levantado a prumo. Cada dia no prumo é
 * um tijolo, e com eles o homem levanta a casa. Duas contas saem daqui:
 *
 * - **acumulado**: tudo que ele já ganhou. Nunca cai. É o que vale no ranking.
 * - **saldo**: acumulado menos o que ele gastou em recompensas.
 *
 * Gastar não derruba a posição dele na turma. É de propósito: ninguém deve
 * hesitar em resgatar o que já conquistou.
 *
 * [CONFIRMAR] Os valores e as recompensas são uma proposta. O Rodrigo decide
 * quanto vale cada coisa e o que entra no catálogo.
 */

export const PONTOS = {
  /** Leitura curta de um minuto. */
  leitura: 10,
  /** Check-in completo: segunda, quarta, sexta e domingo. */
  checkin: 25,
  /** Nota semanal do Índice de Alinhamento. */
  indice: 40,
  /** Encarar um "mas" em vez de fingir que não aconteceu. */
  mas: 15,
  /** Repor um dia perdido. Vale menos do que fazer no dia. */
  reposicao: 5,
  avaliacaoInicial: 30,
  avaliacaoFinal: 60,
} as const;

/** Bônus pagos uma vez, quando a melhor sequência alcança o marco. */
export const MARCOS_BONUS = [
  { dias: 7, bonus: 50 },
  { dias: 14, bonus: 100 },
  { dias: 21, bonus: 150 },
  { dias: 28, bonus: 250 },
] as const;

/**
 * Níveis. A escada é a da construção: do alicerce até a casa de pé.
 * O total máximo possível na jornada fica perto de 1.400 tijolos.
 */
export type Nivel = { nome: string; apartir: number; descricao: string };

export const niveis: Nivel[] = [
  { nome: 'Alicerce', apartir: 0, descricao: 'Você cavou. Agora é levantar.' },
  { nome: 'Fundamento', apartir: 150, descricao: 'A base está firme.' },
  { nome: 'Coluna', apartir: 400, descricao: 'Já tem o que sustenta peso.' },
  { nome: 'Viga', apartir: 750, descricao: 'O que você levanta cobre outros.' },
  { nome: 'Muro', apartir: 1100, descricao: 'A casa tem contorno.' },
  { nome: 'Casa no prumo', apartir: 1500, descricao: 'De pé, e no prumo.' },
];

export type Recompensa = {
  id: string;
  nome: string;
  descricao: string;
  custo: number;
  entrega: string;
};

/** [CONFIRMAR] Catálogo de exemplo. São produtos do Rodrigo. */
export const recompensas: Recompensa[] = [
  {
    id: 'oracao-familia',
    nome: 'Guia de oração em família',
    descricao: 'Um roteiro curto para orar com a sua casa sem constrangimento.',
    custo: 150,
    entrega: 'PDF por e-mail',
  },
  {
    id: 'aula-conversa-dificil',
    nome: 'Aula: a conversa que você está adiando',
    descricao: 'Como abrir o assunto com a sua mulher sem virar briga.',
    custo: 350,
    entrega: 'Aula gravada, 28 minutos',
  },
  {
    id: 'encontro-turma',
    nome: 'Encontro ao vivo com o Rodrigo',
    descricao: 'Uma hora de perguntas abertas, só para quem chegou até aqui.',
    custo: 700,
    entrega: 'Convite para a próxima data',
  },
  {
    id: 'desconto-proximo',
    nome: 'Desconto no próximo produto',
    descricao: 'Vale para o próximo lançamento do Homem Alinhado.',
    custo: 1000,
    entrega: 'Cupom por e-mail',
  },
];

export function recompensaPorId(id: string): Recompensa | undefined {
  return recompensas.find((r) => r.id === id);
}
