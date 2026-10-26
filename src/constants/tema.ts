/**
 * Homem Alinhado — tema do app.
 * O app é a área "de dentro": preto, como definido na landing.
 * Preto e branco absolutos. Cinzas só para texto secundário, bordas e superfícies.
 */

export const Cores = {
  preto: '#000000',
  branco: '#ffffff',
  cinza1: '#6e6e6e',
  cinza2: '#b8b8b8',
  cinza3: '#2a2a2a',
  cinza4: '#141414',
  sucesso: '#a6c9b0',
  erro: '#e3a19b',
} as const;

export const Tema = {
  fundo: Cores.preto,
  superficie: Cores.cinza4,
  texto: Cores.branco,
  texto2: Cores.cinza2,
  texto3: Cores.cinza1,
  borda: Cores.cinza3,
  inversoFundo: Cores.branco,
  inversoTexto: Cores.preto,
} as const;

/** Cormorant Garamond para display, Inter para interface. As mesmas da landing. */
export const Fontes = {
  display: 'CormorantGaramond_500Medium',
  displayForte: 'CormorantGaramond_600SemiBold',
  displayItalico: 'CormorantGaramond_500Medium_Italic',
  corpo: 'Inter_400Regular',
  corpoMedio: 'Inter_500Medium',
} as const;

/** Escala com saltos reais, adaptada para a tela do celular. */
export const Texto = {
  display: { fontSize: 44, lineHeight: 44 },
  titulo1: { fontSize: 32, lineHeight: 34 },
  titulo2: { fontSize: 26, lineHeight: 28 },
  titulo3: { fontSize: 20, lineHeight: 24 },
  lead: { fontSize: 17, lineHeight: 25 },
  corpo: { fontSize: 15, lineHeight: 23 },
  pequeno: { fontSize: 13, lineHeight: 19 },
  legenda: { fontSize: 11, lineHeight: 15 },
} as const;

export const Espaco = {
  meio: 2,
  um: 4,
  dois: 8,
  tres: 16,
  quatro: 24,
  cinco: 32,
  seis: 48,
} as const;

/** Cantos retos, como na landing. */
export const Raio = {
  botao: 4,
  campo: 4,
  selo: 3,
  painel: 8,
  retrato: 12,
} as const;
