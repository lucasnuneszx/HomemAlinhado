import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import { useConta } from './conta-contexto';
import {
  apagarEstado,
  diaAtual,
  diasPerdidos,
  estadoInicial,
  feitoHoje,
  gravarEstado,
  lerEstado,
  sequencia,
  type Estado,
  type NotaSemana,
} from './estado';
import { nivelDe, tijolosAcumulados, tijolosSaldo } from './pontos';

type Contexto = {
  estado: Estado;
  carregado: boolean;
  dia: number;
  seq: number;
  fezHoje: boolean;
  /** Dias que passaram sem serem feitos e sem um "mas" registrado. */
  perdidos: number[];
  tijolos: number;
  saldo: number;
  nivel: string;
  comecar: () => void;
  concluirDia: (dia: number, respostas?: string[], reposicao?: boolean) => void;
  registrarNota: (nota: NotaSemana) => void;
  registrarAvaliacao: (tipo: 'inicial' | 'final', respostas: number[]) => void;
  registrarMas: (dia: number, motivo: string, texto?: string) => void;
  resgatar: (id: string, custo: number) => boolean;
  definirLembrete: (ativo: boolean, minutos: number) => void;
  reiniciar: () => void;
  /** Troca o estado inteiro. Só a rota de demonstração usa. */
  substituir: (estado: Estado) => void;
};

const JornadaContexto = createContext<Contexto | null>(null);

export function ProvedorJornada({ children }: { children: ReactNode }) {
  const { usuario, carregado: contaCarregada } = useConta();
  const escopo = usuario?.email ?? null;
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  // De qual escopo o estado em memória veio. `undefined` é "de nenhum ainda",
  // o que também cobre a conta anônima (escopo null).
  const [escopoCarregado, setEscopoCarregado] = useState<string | null | undefined>(undefined);
  const carregado = contaCarregada && escopoCarregado === escopo;

  // Trocou de conta (ou saiu): recarrega o progresso daquele escopo.
  useEffect(() => {
    if (!contaCarregada) return;
    let vivo = true;
    lerEstado(escopo).then((e) => {
      if (!vivo) return;
      setEstado(e);
      setEscopoCarregado(escopo);
    });
    return () => {
      vivo = false;
    };
  }, [contaCarregada, escopo]);

  const atualizar = useCallback(
    (muda: (anterior: Estado) => Estado) => {
      setEstado((anterior) => {
        const novo = muda(anterior);
        void gravarEstado(novo, escopo);
        return novo;
      });
    },
    [escopo],
  );

  const comecar = useCallback(() => {
    atualizar((e) => (e.inicio ? e : { ...e, inicio: new Date().toISOString() }));
  }, [atualizar]);

  const concluirDia = useCallback(
    (dia: number, respostas?: string[], reposicao = false) => {
      atualizar((e) => {
        const novo: Estado = {
          ...e,
          inicio: e.inicio ?? new Date().toISOString(),
          concluidos: e.concluidos.includes(dia)
            ? e.concluidos
            : [...e.concluidos, dia].sort((a, b) => a - b),
          reposicoes:
            reposicao && !e.reposicoes.includes(dia) ? [...e.reposicoes, dia] : e.reposicoes,
          respostas: respostas ? { ...e.respostas, [dia]: respostas } : e.respostas,
        };
        // A melhor sequência é história: sobe e não desce.
        return { ...novo, melhorSeq: Math.max(novo.melhorSeq, sequencia(novo)) };
      });
    },
    [atualizar],
  );

  const registrarAvaliacao = useCallback(
    (tipo: 'inicial' | 'final', respostas: number[]) => {
      atualizar((e) => ({
        ...e,
        avaliacoes: [
          ...e.avaliacoes.filter((a) => a.tipo !== tipo),
          { tipo, respostas, em: new Date().toISOString() },
        ],
      }));
    },
    [atualizar],
  );

  const registrarMas = useCallback(
    (dia: number, motivo: string, texto?: string) => {
      atualizar((e) => ({
        ...e,
        mas: e.mas.some((m) => m.dia === dia)
          ? e.mas
          : [...e.mas, { dia, motivo, texto, em: new Date().toISOString() }],
      }));
    },
    [atualizar],
  );

  const registrarNota = useCallback(
    (nota: NotaSemana) => {
      atualizar((e) => ({
        ...e,
        notas: [...e.notas.filter((n) => n.semana !== nota.semana), nota].sort((a, b) => a.semana - b.semana),
      }));
    },
    [atualizar],
  );

  /** Devolve falso quando o saldo não cobre. O componente avisa. */
  const resgatar = useCallback(
    (id: string, custo: number) => {
      if (tijolosSaldo(estado) < custo || estado.resgates.includes(id)) return false;
      atualizar((e) => ({ ...e, resgates: [...e.resgates, id], gastos: e.gastos + custo }));
      return true;
    },
    [atualizar, estado],
  );

  const definirLembrete = useCallback(
    (ativo: boolean, minutos: number) => {
      atualizar((e) => ({ ...e, lembrete: { ativo, minutos } }));
    },
    [atualizar],
  );

  const substituir = useCallback(
    (novo: Estado) => {
      atualizar(() => novo);
    },
    [atualizar],
  );

  const reiniciar = useCallback(() => {
    void apagarEstado(escopo);
    setEstado(estadoInicial);
  }, [escopo]);

  return (
    <JornadaContexto
      value={{
        estado,
        carregado,
        dia: diaAtual(estado),
        seq: sequencia(estado),
        fezHoje: feitoHoje(estado),
        perdidos: diasPerdidos(estado),
        tijolos: tijolosAcumulados(estado),
        saldo: tijolosSaldo(estado),
        nivel: nivelDe(tijolosAcumulados(estado)).nome,
        comecar,
        concluirDia,
        registrarNota,
        registrarAvaliacao,
        registrarMas,
        resgatar,
        definirLembrete,
        reiniciar,
        substituir,
      }}>
      {children}
    </JornadaContexto>
  );
}

export function useJornada(): Contexto {
  const ctx = use(JornadaContexto);
  if (!ctx) throw new Error('useJornada precisa estar dentro de ProvedorJornada');
  return ctx;
}
