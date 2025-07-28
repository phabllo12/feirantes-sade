// backend/gerar_tokens.js

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const TOTAL_TOKENS = 600; // Agora 600 tokens para feirantes
const OUTPUT_DIR = path.join(__dirname, 'qr_codes_feirantes_sade');
const BASE_URL = 'https://seusite.com/formulario?token='; // Altere para sua URL real

function gerarTokenUnico() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += letras.charAt(Math.floor(Math.random() * letras.length));
    if (i === 3) token += '-';
  }
  return token;
}

// Limpa pasta e arquivo antigos antes de gerar novos tokens
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
if (fs.existsSync(path.join(__dirname, 'tokens.txt'))) {
  fs.unlinkSync(path.join(__dirname, 'tokens.txt'));
}

fs.mkdirSync(OUTPUT_DIR);

const tokens = [];

(async () => {
  for (let i = 0; i < TOTAL_TOKENS; i++) {
    const token = gerarTokenUnico();
    tokens.push(token);

    const url = `${BASE_URL}${token}`;
    const nomeArquivo = path.join(OUTPUT_DIR, `${token}.png`);

    await QRCode.toFile(nomeArquivo, url, {
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log(`QR Code gerado: ${nomeArquivo}`);
  }

  fs.writeFileSync(path.join(__dirname, 'tokens.txt'), tokens.join('\n'));
  console.log(`\n✅ ${TOTAL_TOKENS} tokens gerados e salvos em tokens.txt`);
})();
