import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import * as Contas from './conta';
import type { Usuario } from './conta';
import { migrarEstado } from './estado';

type Contexto = {
  usuario: Usuario | null;
  /** Escolheu "entrar depois": usa o app sem conta. */
  convidado: boolean;
  /** Falso enquanto a sessão está sendo lida do aparelho. */
  carregado: boolean;
  criarConta: (nome: string, email: string, senha: string) => Promise<Contas.Resultado<Usuario>>;
  entrar: (email: string, senha: string) => Promise<Contas.Resultado<Usuario>>;
  redefinirSenha: (email: string, senha: string) => Promise<Contas.Resultado<Usuario>>;
  entrarDepois: () => Promise<void>;
  renomear: (nome: string) => Promise<void>;
  sair: () => Promise<void>;
  apagarConta: () => Promise<void>;
};

const ContaContexto = createContext<Contexto | null>(null);

export function ProvedorConta({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [convidado, setConvidado] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let vivo = true;
    Promise.all([Contas.lerSessao(), Contas.lerConvidado()]).then(([u, c]) => {
      if (!vivo) return;
      setUsuario(u);
      setConvidado(c);
      setCarregado(true);
    });
    return () => {
      vivo = false;
    };
  }, []);

  /** Entrou de verdade: deixa de ser convidado. */
  const aplicar = useCallback(async (r: Contas.Resultado<Usuario>) => {
    if (!r.ok) return r;
    await Contas.definirConvidado(false);
    setConvidado(false);
    setUsuario(r.valor);
    return r;
  }, []);

  const criarConta = useCallback(
    async (nome: string, email: string, senha: string) => {
      const r = await Contas.criarConta(nome, email, senha);
      // O que ele fez como convidado vai junto para a conta nova.
      if (r.ok) await migrarEstado(null, r.valor.email);
      return aplicar(r);
    },
    [aplicar],
  );

  const entrar = useCallback(
    (email: string, senha: string) => Contas.entrar(email, senha).then(aplicar),
    [aplicar],
  );

  const redefinirSenha = useCallback(
    (email: string, senha: string) => Contas.redefinirSenha(email, senha).then(aplicar),
    [aplicar],
  );

  const entrarDepois = useCallback(async () => {
    await Contas.definirConvidado(true);
    setConvidado(true);
  }, []);

  const renomear = useCallback(
    async (nome: string) => {
      if (!usuario) return;
      const novo = await Contas.atualizarNome(usuario.email, nome);
      if (novo) setUsuario(novo);
    },
    [usuario],
  );

  const sair = useCallback(async () => {
    await Contas.sair();
    await Contas.definirConvidado(false);
    setUsuario(null);
    setConvidado(false);
  }, []);

  const apagarConta = useCallback(async () => {
    if (!usuario) return;
    await Contas.apagarConta(usuario.email);
    await Contas.definirConvidado(false);
    setUsuario(null);
    setConvidado(false);
  }, [usuario]);

  return (
    <ContaContexto
      value={{
        usuario,
        convidado,
        carregado,
        criarConta,
        entrar,
        redefinirSenha,
        entrarDepois,
        renomear,
        sair,
        apagarConta,
      }}>
      {children}
    </ContaContexto>
  );
}

export function useConta(): Contexto {
  const ctx = use(ContaContexto);
  if (!ctx) throw new Error('useConta precisa estar dentro de ProvedorConta');
  return ctx;
}
