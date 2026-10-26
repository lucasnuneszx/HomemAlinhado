/**
 * [CONFIRMAR] Turma e feed de exemplo. É o único conteúdo do app que depende
 * de servidor: quando o banco entrar, isso vira consulta. Fica aqui porque as
 * telas Hoje e Grupo mostram a mesma turma.
 */

export type Membro = {
  nome: string;
  inicial: string;
  feito: boolean;
  /** Tijolos acumulados. Para "você" o app usa o valor real. */
  tijolos: number;
  seq: number;
  eu?: boolean;
};

export const turma: Membro[] = [
  { nome: 'Você', inicial: 'V', feito: true, tijolos: 0, seq: 0, eu: true },
  { nome: 'Marcos A.', inicial: 'M', feito: true, tijolos: 385, seq: 9 },
  { nome: 'André L.', inicial: 'A', feito: true, tijolos: 310, seq: 9 },
  { nome: 'Paulo R.', inicial: 'P', feito: false, tijolos: 145, seq: 2 },
  { nome: 'Felipe M.', inicial: 'F', feito: false, tijolos: 95, seq: 0 },
];

/** A turma com os números reais de quem está usando o app. */
export function turmaComVoce(meuNome: string, meusTijolos: number, minhaSeq: number, fizHoje: boolean) {
  return turma
    .map((m) =>
      m.eu
        ? {
            ...m,
            nome: meuNome,
            inicial: meuNome[0]?.toUpperCase() ?? 'V',
            tijolos: meusTijolos,
            seq: minhaSeq,
            feito: fizHoje,
          }
        : m,
    )
    .sort((a, b) => b.tijolos - a.tijolos);
}

export const NOME_TURMA = 'Turma 03';

export const feed = [
  {
    quem: 'Rodrigo Souza',
    papel: 'Líder',
    texto: 'Semana 2 começa hoje. Base é rotina, não vontade. Quem já fez o check-in?',
    lider: true,
  },
  { quem: 'Marcos A.', papel: 'Dia 9', texto: 'Check-in feito. Orei com meus filhos antes de dormir.' },
  { quem: 'André L.', papel: 'Dia 9', texto: 'Primeira vez que passo de uma semana sem falhar.' },
];
