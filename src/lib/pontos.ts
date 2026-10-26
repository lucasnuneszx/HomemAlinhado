import { tipoDoDia, TOTAL_DIAS } from '@/content/jornada';
import { MARCOS_BONUS, niveis, PONTOS, type Nivel } from '@/content/pontos';

import type { Estado } from './estado';

/**
 * Tudo aqui é derivado do estado, nunca guardado. Assim o saldo não tem como
 * divergir do que a pessoa realmente fez, e mudar uma regra de pontuação
 * recalcula o passado sozinho.
 */

export function tijolosAcumulados(estado: Estado): number {
  const reposto = new Set(estado.reposicoes);
  let total = 0;

  for (const dia of estado.concluidos) {
    if (reposto.has(dia)) {
      total += PONTOS.reposicao;
      continue;
    }
    total += tipoDoDia(dia) === 'leitura' ? PONTOS.leitura : PONTOS.checkin;
  }

  total += estado.notas.length * PONTOS.indice;
  total += estado.mas.length * PONTOS.mas;
  total += estado.avaliacoes.filter((a) => a.tipo === 'inicial').length * PONTOS.avaliacaoInicial;
  total += estado.avaliacoes.filter((a) => a.tipo === 'final').length * PONTOS.avaliacaoFinal;

  for (const marco of MARCOS_BONUS) {
    if (estado.melhorSeq >= marco.dias) total += marco.bonus;
  }

  return total;
}

export function tijolosSaldo(estado: Estado): number {
  return Math.max(0, tijolosAcumulados(estado) - estado.gastos);
}

export function nivelDe(acumulado: number): Nivel {
  return [...niveis].reverse().find((n) => acumulado >= n.apartir) ?? niveis[0];
}

export function proximoNivel(acumulado: number): Nivel | null {
  return niveis.find((n) => n.apartir > acumulado) ?? null;
}

/** Fração de 0 a 1 entre o nível atual e o próximo. */
export function progressoNoNivel(acumulado: number): number {
  const atual = nivelDe(acumulado);
  const proximo = proximoNivel(acumulado);
  if (!proximo) return 1;
  const faixa = proximo.apartir - atual.apartir;
  if (faixa <= 0) return 1;
  return Math.max(0, Math.min(1, (acumulado - atual.apartir) / faixa));
}

/** Quanto ainda dá para ganhar até o fim da jornada. Serve para dimensionar o catálogo. */
export function tetoDaJornada(): number {
  let total = 0;
  for (let d = 1; d <= TOTAL_DIAS; d++) {
    total += tipoDoDia(d) === 'leitura' ? PONTOS.leitura : PONTOS.checkin;
  }
  total += 4 * PONTOS.indice;
  total += PONTOS.avaliacaoInicial + PONTOS.avaliacaoFinal;
  total += MARCOS_BONUS.reduce((s, m) => s + m.bonus, 0);
  return total;
}

export function formatarTijolos(n: number): string {
  return n.toLocaleString('pt-BR');
}
