const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const pastaSaida = path.join(__dirname, 'qr_codes_feirantes_sade');
const baseUrl = 'https://feirantes-sade.onrender.com/formulario.html';
const totalQRCodes = 600;

// Cria pasta se não existir
if (!fs.existsSync(pastaSaida)) {
  fs.mkdirSync(pastaSaida);
}

(async () => {
  for (let i = 1; i <= totalQRCodes; i++) {
    const token = `${i.toString().padStart(3, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const urlComToken = `${baseUrl}?token=${token}`;
    const caminho = path.join(pastaSaida, `${i}.png`);

    try {
      await QRCode.toFile(caminho, urlComToken);
      console.log(`QR Code ${i} gerado: ${urlComToken}`);
    } catch (err) {
      console.error(`Erro ao gerar QR Code ${i}:`, err);
    }
  }
})();
