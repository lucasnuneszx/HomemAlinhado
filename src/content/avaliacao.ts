/**
 * Auto-avaliação de entrada e de saída.
 *
 * O homem responde as mesmas nove perguntas no dia 1 e no dia 28. Sem isso a
 * jornada não tem antes e depois — e é o antes e depois que ele vai mostrar
 * para a mulher dele.
 *
 * [CONFIRMAR] As perguntas são uma base. O Rodrigo revisa a linguagem.
 */

export type Eixo = 'deus' | 'consigo' | 'casa';

export const nomeEixo: Record<Eixo, string> = {
  deus: 'Com Deus',
  consigo: 'Consigo',
  casa: 'Com a casa',
};

export type Pergunta = { eixo: Eixo; texto: string };

export const perguntas: Pergunta[] = [
  { eixo: 'deus', texto: 'Eu reservo um tempo com Deus antes de o dia começar.' },
  { eixo: 'deus', texto: 'Quando erro, eu volto rápido — não passo dias longe.' },
  { eixo: 'deus', texto: 'Minha fé aparece no que eu faço, não só no que eu falo.' },

  { eixo: 'consigo', texto: 'Eu cumpro o que combino comigo mesmo.' },
  { eixo: 'consigo', texto: 'Eu mando no celular, na comida e no impulso — não o contrário.' },
  { eixo: 'consigo', texto: 'Eu durmo e acordo no horário que eu escolhi.' },

  { eixo: 'casa', texto: 'Na minha casa sabem que podem contar com a minha palavra.' },
  { eixo: 'casa', texto: 'Eu lidero a fé da minha casa em vez de terceirizar.' },
  { eixo: 'casa', texto: 'Eu dou presença, não só sustento.' },
];

/** Escala de cinco passos. O valor bruto vai de 0 a 4. */
export const escala = ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'] as const;

export const TOTAL_PERGUNTAS = perguntas.length;

/** Média do eixo, convertida para a mesma régua de 0 a 10 do Índice. */
export function notaDoEixo(respostas: number[], eixo: Eixo): number {
  const indices = perguntas
    .map((p, i) => (p.eixo === eixo ? i : -1))
    .filter((i) => i >= 0);
  if (indices.length === 0) return 0;
  const soma = indices.reduce((s, i) => s + (respostas[i] ?? 0), 0);
  return Math.round((soma / indices.length) * 2.5 * 10) / 10;
}

export function notaGeral(respostas: number[]): number {
  const eixos: Eixo[] = ['deus', 'consigo', 'casa'];
  const soma = eixos.reduce((s, e) => s + notaDoEixo(respostas, e), 0);
  return Math.round((soma / eixos.length) * 10) / 10;
}
