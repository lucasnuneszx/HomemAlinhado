import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Conta do homem, guardada no aparelho.
 *
 * [CONFIRMAR] Enquanto o banco não está ligado, a conta vive só aqui. A interface
 * deste arquivo é a mesma que o servidor vai expor, então trocar por Supabase
 * significa reescrever as quatro funções abaixo e nada mais no app.
 */

const CHAVE_CONTAS = 'ha_contas_v1';
const CHAVE_SESSAO = 'ha_sessao_v1';
const CHAVE_CONVIDADO = 'ha_convidado_v1';

export type Conta = {
  nome: string;
  email: string;
  /** Resumo da senha. Nunca guardamos o texto puro. */
  resumo: string;
  criadaEm: string;
};

export type Usuario = Omit<Conta, 'resumo'>;

export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

/**
 * Resumo da senha. Não é criptografia: é o suficiente para não deixar a senha
 * em texto puro no armazenamento do aparelho enquanto a autenticação de
 * verdade não sobe. Quando o servidor entrar, quem valida a senha é ele.
 */
function resumir(senha: string, email: string): string {
  const semente = `${email.toLowerCase()}::${senha}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < semente.length; i++) {
    const c = semente.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul((b + c) ^ (a >>> 7), 0x85ebca6b) >>> 0;
  }
  return `${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`;
}

function publico(conta: Conta): Usuario {
  return { nome: conta.nome, email: conta.email, criadaEm: conta.criadaEm };
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// -------------------------------------------------------------- validação

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarNome(nome: string): string | null {
  const limpo = nome.trim();
  if (limpo.length < 2) return 'Escreva o seu nome.';
  if (!limpo.includes(' ')) return 'Escreva nome e sobrenome.';
  return null;
}

export function validarEmail(email: string): string | null {
  if (!FORMATO_EMAIL.test(email.trim())) return 'Esse e-mail não parece certo.';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (senha.length < 6) return 'A senha precisa de pelo menos 6 caracteres.';
  return null;
}

// ----------------------------------------------------------- armazenamento

async function lerContas(): Promise<Conta[]> {
  try {
    const cru = await AsyncStorage.getItem(CHAVE_CONTAS);
    if (!cru) return [];
    const lido = JSON.parse(cru);
    return Array.isArray(lido) ? (lido as Conta[]) : [];
  } catch {
    return [];
  }
}

async function gravarContas(contas: Conta[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
  } catch {
    // Sem armazenamento: a conta vale só para esta sessão.
  }
}

/** Quem está logado agora, ou null. */
export async function lerSessao(): Promise<Usuario | null> {
  try {
    const email = await AsyncStorage.getItem(CHAVE_SESSAO);
    if (!email) return null;
    const conta = (await lerContas()).find((c) => c.email === email);
    return conta ? publico(conta) : null;
  } catch {
    return null;
  }
}

async function abrirSessao(conta: Conta): Promise<Usuario> {
  try {
    await AsyncStorage.setItem(CHAVE_SESSAO, conta.email);
  } catch {
    // Segue logado só nesta sessão.
  }
  return publico(conta);
}

export async function criarConta(
  nome: string,
  email: string,
  senha: string,
): Promise<Resultado<Usuario>> {
  const chave = normalizarEmail(email);
  const contas = await lerContas();
  if (contas.some((c) => c.email === chave)) {
    return { ok: false, erro: 'Já existe uma conta com esse e-mail. Entre com ela.' };
  }
  const conta: Conta = {
    nome: nome.trim(),
    email: chave,
    resumo: resumir(senha, chave),
    criadaEm: new Date().toISOString(),
  };
  await gravarContas([...contas, conta]);
  return { ok: true, valor: await abrirSessao(conta) };
}

export async function entrar(email: string, senha: string): Promise<Resultado<Usuario>> {
  const chave = normalizarEmail(email);
  const conta = (await lerContas()).find((c) => c.email === chave);
  if (!conta) return { ok: false, erro: 'Não encontramos uma conta com esse e-mail.' };
  if (conta.resumo !== resumir(senha, chave)) return { ok: false, erro: 'Senha incorreta.' };
  return { ok: true, valor: await abrirSessao(conta) };
}

/**
 * Troca a senha de uma conta deste aparelho. Enquanto não há servidor, quem
 * tem o aparelho e sabe o e-mail redefine. Com o banco ligado, isso vira
 * link por e-mail.
 */
export async function redefinirSenha(email: string, senha: string): Promise<Resultado<Usuario>> {
  const chave = normalizarEmail(email);
  const contas = await lerContas();
  const conta = contas.find((c) => c.email === chave);
  if (!conta) return { ok: false, erro: 'Não encontramos uma conta com esse e-mail neste aparelho.' };
  const atualizada: Conta = { ...conta, resumo: resumir(senha, chave) };
  await gravarContas(contas.map((c) => (c.email === chave ? atualizada : c)));
  return { ok: true, valor: await abrirSessao(atualizada) };
}

/**
 * Convidado: quem escolheu "entrar depois". Não tem conta, o progresso fica
 * na chave sem escopo do aparelho e migra para a conta quando ele criar uma.
 */
export async function lerConvidado(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CHAVE_CONVIDADO)) === '1';
  } catch {
    return false;
  }
}

export async function definirConvidado(ativo: boolean): Promise<void> {
  try {
    if (ativo) await AsyncStorage.setItem(CHAVE_CONVIDADO, '1');
    else await AsyncStorage.removeItem(CHAVE_CONVIDADO);
  } catch {
    // Sem armazenamento: vale só para esta sessão.
  }
}

export async function sair(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // Nada a fazer.
  }
}

export async function atualizarNome(email: string, nome: string): Promise<Usuario | null> {
  const contas = await lerContas();
  const conta = contas.find((c) => c.email === email);
  if (!conta) return null;
  const atualizada: Conta = { ...conta, nome: nome.trim() };
  await gravarContas(contas.map((c) => (c.email === email ? atualizada : c)));
  return publico(atualizada);
}

export async function apagarConta(email: string): Promise<void> {
  const contas = await lerContas();
  await gravarContas(contas.filter((c) => c.email !== email));
  await sair();
}
