import AsyncStorage from '@react-native-async-storage/async-storage';

import { TOTAL_DIAS } from '@/content/jornada';

const CHAVE = 'ha_estado_v1';

/**
 * O progresso é guardado por conta: dois homens no mesmo aparelho não misturam
 * sequência. Sem conta (nunca acontece no fluxo normal) cai na chave antiga.
 */
function chaveDe(escopo?: string | null): string {
  return escopo ? `${CHAVE}:${escopo}` : CHAVE;
}

export type NotaSemana = { semana: number; deus: number; consigo: number; casa: number };

export type Avaliacao = {
  tipo: 'inicial' | 'final';
  em: string;
  /** Uma resposta de 0 a 4 por pergunta. */
  respostas: number[];
};

export type RegistroMas = {
  dia: number;
  motivo: string;
  texto?: string;
  em: string;
};

export type Estado = {
  /** Data ISO do dia 1. Null quando a jornada ainda não começou. */
  inicio: string | null;
  /** Dias concluídos, em número de 1 a 28. */
  concluidos: number[];
  /** Dias concluídos fora do dia. Contam para os 28, não para a sequência. */
  reposicoes: number[];
  /** Respostas do check-in, por dia. */
  respostas: Record<number, string[]>;
  /** Índice de Alinhamento registrado no domingo. */
  notas: NotaSemana[];
  /** Lembrete diário. Hora em minutos desde a meia-noite. */
  lembrete: { ativo: boolean; minutos: number };
  /** Auto-avaliação de entrada e de saída. */
  avaliacoes: Avaliacao[];
  /** Os "mas" que ele já encarou. */
  mas: RegistroMas[];
  /** Recompensas resgatadas. */
  resgates: string[];
  /** Tijolos já gastos em recompensas. */
  gastos: number;
  /** A maior sequência que ele já teve. Não cai quando ele falha. */
  melhorSeq: number;
};

export const estadoInicial: Estado = {
  inicio: null,
  concluidos: [],
  reposicoes: [],
  respostas: {},
  notas: [],
  lembrete: { ativo: false, minutos: 6 * 60 },
  avaliacoes: [],
  mas: [],
  resgates: [],
  gastos: 0,
  melhorSeq: 0,
};

export async function lerEstado(escopo?: string | null): Promise<Estado> {
  try {
    const cru = await AsyncStorage.getItem(chaveDe(escopo));
    if (!cru) return estadoInicial;
    const lido = JSON.parse(cru) as Partial<Estado>;
    return {
      ...estadoInicial,
      ...lido,
      concluidos: Array.isArray(lido.concluidos) ? lido.concluidos.filter((d) => d >= 1 && d <= TOTAL_DIAS) : [],
      reposicoes: Array.isArray(lido.reposicoes) ? lido.reposicoes : [],
      respostas: lido.respostas ?? {},
      notas: Array.isArray(lido.notas) ? lido.notas : [],
      lembrete: { ...estadoInicial.lembrete, ...lido.lembrete },
      avaliacoes: Array.isArray(lido.avaliacoes) ? lido.avaliacoes : [],
      mas: Array.isArray(lido.mas) ? lido.mas : [],
      resgates: Array.isArray(lido.resgates) ? lido.resgates : [],
      gastos: typeof lido.gastos === 'number' ? lido.gastos : 0,
      melhorSeq: typeof lido.melhorSeq === 'number' ? lido.melhorSeq : 0,
    };
  } catch {
    return estadoInicial;
  }
}

export async function gravarEstado(estado: Estado, escopo?: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(chaveDe(escopo), JSON.stringify(estado));
  } catch {
    // Sem armazenamento: o app continua funcionando na sessão.
  }
}

/** Meia-noite local, para comparar dias sem o horário atrapalhar. */
function meiaNoite(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function diasDesde(inicioISO: string): number {
  const inicio = meiaNoite(new Date(inicioISO));
  const hoje = meiaNoite(new Date());
  return Math.round((hoje - inicio) / 86400000);
}

/** Dia da jornada em que a pessoa está hoje, de 1 a 28. */
export function diaAtual(estado: Estado): number {
  if (!estado.inicio) return 1;
  return Math.max(1, Math.min(TOTAL_DIAS, diasDesde(estado.inicio) + 1));
}

/**
 * Sequência: dias seguidos concluídos, contados de trás para frente a partir de hoje.
 * Não quebra se o dia de hoje ainda não foi feito, só para de contar em ontem.
 *
 * Dia reposto não entra: repor mantém a jornada de pé, mas não desfaz a falha.
 */
export function sequencia(estado: Estado): number {
  const reposto = new Set(estado.reposicoes);
  const feitos = new Set(estado.concluidos.filter((d) => !reposto.has(d)));
  const hoje = diaAtual(estado);
  const comecoEm = feitos.has(hoje) ? hoje : hoje - 1;
  let n = 0;
  for (let d = comecoEm; d >= 1; d--) {
    if (!feitos.has(d)) break;
    n++;
  }
  return n;
}

/** Próximo marco de sequência: 7, 14, 21 ou 28. */
export function proximoMarco(seq: number): number {
  return [7, 14, 21, 28].find((m) => m > seq) ?? TOTAL_DIAS;
}

/**
 * Leva o progresso de um escopo para outro. Usado quando o convidado cria
 * conta: os dias que ele já fez não podem sumir. Não sobrescreve um destino
 * que já tenha progresso.
 */
export async function migrarEstado(de: string | null, para: string): Promise<void> {
  const origem = await lerEstado(de);
  if (!origem.inicio && origem.concluidos.length === 0) return;
  const destino = await lerEstado(para);
  if (destino.inicio || destino.concluidos.length > 0) return;
  await gravarEstado(origem, para);
  await apagarEstado(de);
}

export async function apagarEstado(escopo?: string | null): Promise<void> {
  try {
    await AsyncStorage.removeItem(chaveDe(escopo));
  } catch {
    // Nada a fazer.
  }
}

export function feitoHoje(estado: Estado): boolean {
  return estado.concluidos.includes(diaAtual(estado));
}

/** Dias que já passaram e ficaram para trás, sem um "mas" registrado. */
export function diasPerdidos(estado: Estado): number[] {
  if (!estado.inicio) return [];
  const hoje = diaAtual(estado);
  const feitos = new Set(estado.concluidos);
  const explicados = new Set(estado.mas.map((m) => m.dia));
  const perdidos: number[] = [];
  for (let d = 1; d < hoje; d++) {
    if (!feitos.has(d) && !explicados.has(d)) perdidos.push(d);
  }
  return perdidos;
}

export function avaliacaoPor(estado: Estado, tipo: 'inicial' | 'final'): Avaliacao | undefined {
  return estado.avaliacoes.find((a) => a.tipo === tipo);
}

export function indiceGeral(nota: NotaSemana): number {
  return Math.round(((nota.deus + nota.consigo + nota.casa) / 3) * 10) / 10;
}

export function formatarNota(n: number): string {
  return n.toFixed(1).replace('.', ',');
}
