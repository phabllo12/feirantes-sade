const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const tokensPath = path.join(__dirname, 'tokens.txt');
const qrCodesDir = path.join(__dirname, 'qr_codes_feirantes_sade');

// Lê os tokens do arquivo tokens.txt
const tokens = fs.readFileSync(tokensPath, 'utf-8')
  .split('\n')
  .map(t => t.trim())
  .filter(Boolean);

if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir);
}

async function generateQRCode(token) {
  // Link do formulário usando seu túnel ngrok público
  const url = `https://234be5016cb7.ngrok-free.app/formulario.html?token=${encodeURIComponent(token)}`;
  
  // Nome do arquivo PNG para o QR Code
  const fileName = token.replace(/[^a-zA-Z0-9_-]/g, '') + '.png';
  const filePath = path.join(qrCodesDir, fileName);

  try {
    await QRCode.toFile(filePath, url, {
      color: {
        dark: '#000000',  // Cor preta para o QR
        light: '#FFFFFF'  // Fundo branco
      }
    });
    console.log(`QR Code criado: ${filePath}`);
  } catch (err) {
    console.error(`Erro ao gerar QR Code para token ${token}`, err);
  }
}

(async () => {
  for (const token of tokens) {
    await generateQRCode(token);
  }
  console.log('Todos os QR Codes foram gerados.');
})();
