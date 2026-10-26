/**
 * A jornada de 28 dias.
 *
 * Ritmo: todo dia tem uma leitura curta de 1 minuto, que alimenta a sequência.
 * Segunda, quarta, sexta e domingo têm o check-in completo, de 5 a 10 minutos.
 *
 * [CONFIRMAR] Versículos na Almeida, de domínio público. Trocar pela versão
 * que o Rodrigo escolher. As reflexões são uma base para ele revisar.
 */

export type TipoDia = 'leitura' | 'direcao' | 'ajuste' | 'gratidao' | 'preparacao';

export type Dia = {
  dia: number;
  semana: 1 | 2 | 3 | 4;
  tipo: TipoDia;
  titulo: string;
  referencia: string;
  texto: string;
  reflexao: string;
  perguntas?: string[];
};

export const semanas = [
  { n: 1, nome: 'Prumo', foco: 'Alinhar a vertical com Deus', base: 'Amós 7:7-8' },
  { n: 2, nome: 'Base', foco: 'Disciplina e rotina', base: 'Provérbios 24:30-34' },
  { n: 3, nome: 'Aliança', foco: 'O casamento', base: 'Efésios 5:25' },
  { n: 4, nome: 'Herança', foco: 'Filhos e liderança da casa', base: 'Josué 24:15' },
] as const;

export const rotuloTipo: Record<TipoDia, string> = {
  leitura: 'Leitura do dia',
  direcao: 'Direção',
  ajuste: 'Ajuste',
  gratidao: 'Gratidão',
  preparacao: 'Preparação',
};

export const minutosTipo: Record<TipoDia, number> = {
  leitura: 1,
  direcao: 7,
  ajuste: 7,
  gratidao: 5,
  preparacao: 10,
};

/** Segunda, quarta, sexta e domingo são check-in. Os outros três dias são leitura curta. */
export function tipoDoDia(dia: number): TipoDia {
  const posicao = dia % 7;
  if (posicao === 1) return 'direcao';
  if (posicao === 3) return 'ajuste';
  if (posicao === 5) return 'gratidao';
  if (posicao === 0) return 'preparacao';
  return 'leitura';
}

const perguntasPorTipo: Record<Exclude<TipoDia, 'leitura'>, string[]> = {
  direcao: [
    'Qual é a sua prioridade com Deus nesta semana?',
    'O que você vai fazer, e em que dia?',
    'O que pode atrapalhar, e como você se protege disso?',
  ],
  ajuste: [
    'O que saiu do caminho desde segunda?',
    'O que causou isso: cansaço, distração ou falta de plano?',
    'O que você corrige até sexta?',
  ],
  gratidao: [
    'O que Deus fez nesta semana que você quase não viu?',
    'Quem você precisa agradecer e ainda não agradeceu?',
    'Uma coisa que deu certo e você quer repetir.',
  ],
  preparacao: [
    'Onde você esteve no prumo nesta semana?',
    'Onde você saiu do prumo?',
    'Qual é o próximo passo, na semana que vem?',
  ],
};

const conteudo: { titulo: string; referencia: string; texto: string; reflexao: string }[] = [
  { titulo: 'O prumo na mão de Deus', referencia: 'Amós 7:7-8', texto: 'Eis que o Senhor estava sobre um muro levantado a prumo, e tinha um prumo na sua mão.', reflexao: 'Parede torta não se conserta com tinta. Se conserta voltando ao prumo. Hoje você mede, não se justifica.' },
  { titulo: 'Onde você busca primeiro', referencia: 'Mateus 6:33', texto: 'Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.', reflexao: 'Primeiro não é uma ordem de importância. É uma ordem de horário.' },
  { titulo: 'Antes do barulho', referencia: 'Marcos 1:35', texto: 'E, levantando-se de manhã, muito cedo, saiu e foi para um lugar deserto, e ali orava.', reflexao: 'Se Ele precisou de um lugar deserto, você também precisa. O seu pode ser o carro, a cozinha às seis, o banho.' },
  { titulo: 'Constância, não intensidade', referencia: 'Lucas 9:23', texto: 'Se alguém quer vir após mim, negue-se a si mesmo, e tome cada dia a sua cruz, e siga-me.', reflexao: 'Cada dia. Não quando der vontade, não quando a semana estiver boa.' },
  { titulo: 'Lâmpada para os pés', referencia: 'Salmos 119:105', texto: 'Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.', reflexao: 'Lâmpada para os pés ilumina o próximo passo, não a estrada inteira. Dá para andar assim.' },
  { titulo: 'Não só ouvinte', referencia: 'Tiago 1:22', texto: 'Sede cumpridores da palavra, e não somente ouvintes, enganando-vos a vós mesmos.', reflexao: 'Saber mais sem viver o que já sabe é o jeito mais educado de não obedecer.' },
  { titulo: 'O que a semana mostrou', referencia: 'Salmos 139:23-24', texto: 'Sonda-me, ó Deus, e conhece o meu coração; prova-me, e conhece os meus pensamentos.', reflexao: 'Hoje você registra a sua primeira nota. Não é prova. É o ponto de partida.' },

  { titulo: 'O campo do preguiçoso', referencia: 'Provérbios 24:30-31', texto: 'Passei pelo campo do preguiçoso, e eis que estava todo cheio de cardos.', reflexao: 'Ninguém planta cardo. Cardo é o que nasce quando não se planta nada.' },
  { titulo: 'Um pouco de sono', referencia: 'Provérbios 24:33-34', texto: 'Um pouco de sono, um pouco tosquenejando, um pouco encruzando as mãos para dormir. Assim sobrevirá a tua pobreza como um ladrão.', reflexao: 'A queda nunca é de uma vez. É um pouco, repetido.' },
  { titulo: 'Cidade sem muro', referencia: 'Provérbios 25:28', texto: 'Como a cidade derribada, que não tem muros, assim é o homem que não pode conter o seu espírito.', reflexao: 'Cidade sem muro não é invadida por ser fraca. É invadida por estar aberta.' },
  { titulo: 'O corpo debaixo de ordem', referencia: '1 Coríntios 9:27', texto: 'Antes subjugo o meu corpo, e o reduzo à servidão.', reflexao: 'O corpo é bom servo e péssimo patrão. Hoje é dia de saber quem manda.' },
  { titulo: 'O que você faz escondido', referencia: 'Lucas 8:17', texto: 'Porque nada há oculto que não haja de manifestar-se.', reflexao: 'O homem que você é sozinho no celular é o homem que você é.' },
  { titulo: 'Redimindo o tempo', referencia: 'Efésios 5:15-16', texto: 'Andai com prudência, remindo o tempo, porquanto os dias são maus.', reflexao: 'Você não tem falta de tempo. Tem falta de decisão sobre o tempo.' },
  { titulo: 'Fundamento na rocha', referencia: 'Mateus 7:24-25', texto: 'Compará-lo-ei ao homem prudente, que edificou a sua casa sobre a rocha.', reflexao: 'A chuva cai nas duas casas. A diferença aparece só no dia da chuva.' },

  { titulo: 'Como Cristo amou', referencia: 'Efésios 5:25', texto: 'Vós, maridos, amai vossas mulheres, como também Cristo amou a igreja, e a si mesmo se entregou por ela.', reflexao: 'A medida não é o quanto ela merece. A medida é Cristo.' },
  { titulo: 'Uma só carne', referencia: 'Gênesis 2:24', texto: 'Portanto deixará o homem o seu pai e a sua mãe, e apegar-se-á à sua mulher, e serão ambos uma carne.', reflexao: 'Deixar, apegar, tornar-se um. Nessa ordem. Muita casa trava no primeiro verbo.' },
  { titulo: 'Habitar com entendimento', referencia: '1 Pedro 3:7', texto: 'Vós, maridos, coabitai com elas com entendimento.', reflexao: 'Entendimento é estudo. Você conhece a sua mulher de hoje ou a de dez anos atrás?' },
  { titulo: 'A resposta branda', referencia: 'Provérbios 15:1', texto: 'A resposta branda desvia o furor, mas a palavra dura suscita a ira.', reflexao: 'Ganhar a discussão e perder a noite não é vitória.' },
  { titulo: 'O amor na prática', referencia: '1 Coríntios 13:4-5', texto: 'O amor é sofredor, é benigno; não se porta com indecência, não busca os seus interesses.', reflexao: 'Troque a palavra amor pelo seu nome e leia de novo. Ainda é verdade?' },
  { titulo: 'Não durma irado', referencia: 'Efésios 4:26', texto: 'Não se ponha o sol sobre a vossa ira.', reflexao: 'Prazo de validade da mágoa: o pôr do sol. Depois disso ela cria raiz.' },
  { titulo: 'Cordão de três dobras', referencia: 'Eclesiastes 4:12', texto: 'E, se alguém prevalecer contra um, os dois lhe resistirão; e o cordão de três dobras não se quebra depressa.', reflexao: 'Você, ela e Deus. Hoje é dia de orar junto, não por ela.' },

  { titulo: 'Eu e a minha casa', referencia: 'Josué 24:15', texto: 'Porém eu e a minha casa serviremos ao Senhor.', reflexao: 'Josué não perguntou. Ele declarou. Liderança começa numa frase dita em voz alta.' },
  { titulo: 'Ensina com a vida', referencia: 'Deuteronômio 6:6-7', texto: 'E estas palavras estarão no teu coração; e as intimarás a teus filhos, e delas falarás assentado em tua casa.', reflexao: 'Assentado em casa, andando pelo caminho. Não é aula. É convivência.' },
  { titulo: 'O caminho do filho', referencia: 'Provérbios 22:6', texto: 'Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele.', reflexao: 'Instruir é mostrar o caminho andando nele primeiro.' },
  { titulo: 'Não provoque', referencia: 'Efésios 6:4', texto: 'E vós, pais, não provoqueis à ira a vossos filhos, mas criai-os na doutrina e admoestação do Senhor.', reflexao: 'Firmeza sem afeto vira revolta. Afeto sem firmeza vira bagunça.' },
  { titulo: 'Herança de geração', referencia: 'Provérbios 13:22', texto: 'O homem de bem deixa uma herança aos filhos de seus filhos.', reflexao: 'A herança que dura não está na conta. Está no exemplo que eles repetem sem perceber.' },
  { titulo: 'Quem provê e quem cuida', referencia: '1 Timóteo 5:8', texto: 'Mas, se alguém não tem cuidado dos seus, é pior do que o infiel.', reflexao: 'Prover é mais do que dinheiro. É presença, direção e proteção.' },
  { titulo: 'O homem no prumo', referencia: 'Salmos 1:3', texto: 'Será como a árvore plantada junto a ribeiros de águas, a qual dá o seu fruto na estação própria.', reflexao: 'Vinte e oito dias não fazem uma árvore. Fazem uma raiz. Agora é continuar.' },
];

export const dias: Dia[] = conteudo.map((c, i) => {
  const dia = i + 1;
  const tipo = tipoDoDia(dia);
  return {
    dia,
    semana: (Math.floor(i / 7) + 1) as 1 | 2 | 3 | 4,
    tipo,
    ...c,
    perguntas: tipo === 'leitura' ? undefined : perguntasPorTipo[tipo],
  };
});

export const TOTAL_DIAS = dias.length;

export function diaPorNumero(n: number): Dia {
  return dias[Math.max(0, Math.min(TOTAL_DIAS - 1, n - 1))];
}
