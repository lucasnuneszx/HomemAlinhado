/**
 * Gera os ícones do app a partir da geometria do prumo.
 * Sem dependência externa: rasteriza o símbolo e escreve o PNG na mão.
 *
 * node scripts/gerar-icones.js
 */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const PRETO = [0, 0, 0];
const BRANCO = [255, 255, 255];

// ---------------------------------------------------------------- geometria

/** Amostra uma bézier cúbica em `n` pontos (sem incluir o primeiro). */
function cubica(p0, c1, c2, p1, n = 24) {
  const pontos = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pontos.push([
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
    ]);
  }
  return pontos;
}

/**
 * O prumo em coordenadas de -48 a 48, iguais às do componente `Prumo`.
 * Haste fina descendo do topo e a gota cheia embaixo.
 */
function formas(peso = 1) {
  const meiaHaste = 1.6 * peso;
  const haste = [
    [-meiaHaste, -48],
    [meiaHaste, -48],
    [meiaHaste, -6],
    [-meiaHaste, -6],
  ];

  const gota = [
    [-3, -6],
    [3, -6],
    ...cubica([3, -6], [16, 3], [21, 14], [19, 22]),
    [0, 47],
    [-19, 22],
    ...cubica([-19, 22], [-21, 14], [-16, 3], [-3, -6]),
  ];

  return [haste, gota];
}

/** Ponto dentro do polígono, por cruzamento de raio. */
function dentro(poligono, x, y) {
  let d = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [xi, yi] = poligono[i];
    const [xj, yj] = poligono[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}

// ------------------------------------------------------------- rasterização

/**
 * Desenha o prumo centrado. `escala` é a fração do lado que o símbolo ocupa.
 * Antisserrilhado por supersampling 4x4.
 */
function desenhar({ lado, escala, fundo, tinta, peso = 1, deslocamentoY = 0 }) {
  const poligonos = formas(peso);
  const pixels = Buffer.alloc(lado * lado * 4);
  const unidade = (lado * escala) / 96; // a arte tem 96 unidades de altura
  const centro = lado / 2;
  // A gota é pesada: centrar pela caixa deixa o símbolo baixo demais.
  const eixoY = centro - deslocamentoY * unidade;
  const amostras = 4;

  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      let cobertura = 0;
      for (let sy = 0; sy < amostras; sy++) {
        for (let sx = 0; sx < amostras; sx++) {
          const ax = (x + (sx + 0.5) / amostras - centro) / unidade;
          const ay = (y + (sy + 0.5) / amostras - eixoY) / unidade;
          if (poligonos.some((p) => dentro(p, ax, ay))) cobertura++;
        }
      }
      const a = cobertura / (amostras * amostras);
      const i = (y * lado + x) * 4;
      if (fundo) {
        pixels[i] = Math.round(fundo[0] + (tinta[0] - fundo[0]) * a);
        pixels[i + 1] = Math.round(fundo[1] + (tinta[1] - fundo[1]) * a);
        pixels[i + 2] = Math.round(fundo[2] + (tinta[2] - fundo[2]) * a);
        pixels[i + 3] = 255;
      } else {
        pixels[i] = tinta[0];
        pixels[i + 1] = tinta[1];
        pixels[i + 2] = tinta[2];
        pixels[i + 3] = Math.round(a * 255);
      }
    }
  }
  return pixels;
}

/** Quadrado chapado, sem símbolo. Serve de fundo do ícone adaptativo. */
function chapado({ lado, cor }) {
  const pixels = Buffer.alloc(lado * lado * 4);
  for (let i = 0; i < lado * lado; i++) {
    pixels[i * 4] = cor[0];
    pixels[i * 4 + 1] = cor[1];
    pixels[i * 4 + 2] = cor[2];
    pixels[i * 4 + 3] = 255;
  }
  return pixels;
}

// ---------------------------------------------------------------- saída PNG

function pedaco(tipo, dados) {
  const comprimento = Buffer.alloc(4);
  comprimento.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo) >>> 0);
  return Buffer.concat([comprimento, corpo, crc]);
}

const tabelaCrc = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = tabelaCrc[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

function png(pixels, lado) {
  const cru = Buffer.alloc(lado * (lado * 4 + 1));
  for (let y = 0; y < lado; y++) {
    cru[y * (lado * 4 + 1)] = 0; // filtro nenhum
    pixels.copy(cru, y * (lado * 4 + 1) + 1, y * lado * 4, (y + 1) * lado * 4);
  }
  const cabecalho = Buffer.alloc(13);
  cabecalho.writeUInt32BE(lado, 0);
  cabecalho.writeUInt32BE(lado, 4);
  cabecalho[8] = 8; // bits por canal
  cabecalho[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pedaco('IHDR', cabecalho),
    pedaco('IDAT', zlib.deflateSync(cru, { level: 9 })),
    pedaco('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------ arquivos

const destino = path.join(__dirname, '..', 'assets', 'images');

const arquivos = [
  // iOS: o quadrado é preto e o prumo branco ocupa pouco mais da metade.
  { nome: 'icon.png', lado: 1024, opcoes: { escala: 0.6, fundo: PRETO, tinta: BRANCO, peso: 1.6, deslocamentoY: 9 } },
  { nome: 'favicon.png', lado: 96, opcoes: { escala: 0.66, fundo: PRETO, tinta: BRANCO, peso: 2.4, deslocamentoY: 9 } },
  // Splash e abertura: prumo branco sobre fundo transparente.
  { nome: 'splash-icon.png', lado: 512, opcoes: { escala: 0.94, fundo: null, tinta: BRANCO, peso: 1.3, deslocamentoY: 0 } },
  // Android: a arte fica dentro da zona segura (66% do lado).
  { nome: 'android-icon-foreground.png', lado: 432, opcoes: { escala: 0.44, fundo: null, tinta: BRANCO, peso: 1.6, deslocamentoY: 9 } },
  { nome: 'android-icon-monochrome.png', lado: 432, opcoes: { escala: 0.44, fundo: null, tinta: BRANCO, peso: 1.6, deslocamentoY: 9 } },
];

for (const { nome, lado, opcoes } of arquivos) {
  const pixels = desenhar({ lado, ...opcoes });
  fs.writeFileSync(path.join(destino, nome), png(pixels, lado));
  console.log('escrito', nome, `${lado}x${lado}`);
}

const fundoAndroid = chapado({ lado: 432, cor: PRETO });
fs.writeFileSync(path.join(destino, 'android-icon-background.png'), png(fundoAndroid, 432));
console.log('escrito android-icon-background.png 432x432');

/**
 * O projeto nativo do iOS já existe e tem um AppDelegate ajustado à mão para o
 * ciclo de cenas do iOS 27. Rodar `expo prebuild` de novo sobrescreveria esse
 * arquivo, então os ícones do nativo são escritos direto no catálogo.
 */
const nativo = path.join(__dirname, '..', 'ios', 'HomemAlinhado', 'Images.xcassets');
if (fs.existsSync(nativo)) {
  const icone = desenhar({ lado: 1024, escala: 0.6, fundo: PRETO, tinta: BRANCO, peso: 1.6, deslocamentoY: 9 });
  fs.writeFileSync(path.join(nativo, 'AppIcon.appiconset', 'App-Icon-1024x1024@1x.png'), png(icone, 1024));
  console.log('escrito ios AppIcon 1024x1024');

  // A splash usa o logo com 72 pontos de largura (ver app.json).
  for (const [arquivo, lado] of [['image.png', 72], ['image@2x.png', 144], ['image@3x.png', 216]]) {
    const logo = desenhar({ lado, escala: 0.94, fundo: null, tinta: BRANCO, peso: 1.3 });
    fs.writeFileSync(path.join(nativo, 'SplashScreenLogo.imageset', arquivo), png(logo, lado));
    console.log('escrito ios SplashScreenLogo', arquivo, `${lado}x${lado}`);
  }
}
