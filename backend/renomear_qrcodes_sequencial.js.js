const fs = require('fs');
const path = require('path');

const qrCodesDir = path.join(__dirname, 'qr_codes_feirantes_sade');

async function renameFilesSequentially() {
  try {
    const files = fs.readdirSync(qrCodesDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
      console.log('Pasta de QR Codes está vazia.');
      return;
    }

    // 1. Renomear para nomes temporários para evitar conflito
    for (let i = 0; i < files.length; i++) {
      const oldPath = path.join(qrCodesDir, files[i]);
      const tempPath = path.join(qrCodesDir, `temp_${i + 1}.png`);
      fs.renameSync(oldPath, tempPath);
    }

    // 2. Renomear de temporário para sequencial 1.png, 2.png, ...
    const tempFiles = fs.readdirSync(qrCodesDir).filter(f => f.startsWith('temp_'));
    tempFiles.sort(); // garante a ordem

    for (let i = 0; i < tempFiles.length; i++) {
      const tempPath = path.join(qrCodesDir, tempFiles[i]);
      const finalPath = path.join(qrCodesDir, `${i + 1}.png`);
      fs.renameSync(tempPath, finalPath);
      console.log(`Renomeado: ${tempFiles[i]} -> ${i + 1}.png`);
    }

    console.log('Renomeação concluída. Sequência de 1 a', tempFiles.length);
  } catch (err) {
    console.error('Erro ao renomear arquivos:', err);
  }
}

renameFilesSequentially();
