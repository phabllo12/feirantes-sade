// backend/index.js
const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Pasta para salvar uploads
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Config Multer para upload de imagens
const upload = multer({
  dest: uploadFolder,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas'));
    }
    cb(null, true);
  }
});

// Banco SQLite
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'), err => {
  if (err) console.error('Erro DB:', err.message);
  else console.log('Banco aberto');
});

// Criar tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS feirantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE,
  nome TEXT,
  rgcpf TEXT,
  nascimento TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  escolaridade TEXT,
  empreendedor_popular TEXT,
  ambulante TEXT,
  banca_feira TEXT,
  banca_alugada TEXT,
  numero_banca TEXT,
  feiras_livres TEXT,
  possui_cnpj TEXT,
  cnpj_numero TEXT,
  nome_fantasia TEXT,
  ramo_atividade TEXT,
  tempo_atividade TEXT,
  local_atividade TEXT,
  interesse_cursos TEXT,
  foto TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend (ajuste o caminho conforme seu projeto)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(uploadFolder));

// Ler tokens de arquivo JSON
const tokensPath = path.join(__dirname, 'tokens.json');
let tokens = {};
if (fs.existsSync(tokensPath)) {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
} else {
  console.warn('Arquivo tokens.json não encontrado!');
}

function salvarTokens() {
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
}

// Rota POST para cadastro (upload foto e dados)
app.post('/api/cadastro', upload.single('foto'), (req, res) => {
  const {
    token,
    nome,
    rgcpf,
    nascimento,
    endereco,
    telefone,
    email,
    escolaridade,
    empreendedor_popular,
    ambulante,
    banca_feira,
    banca_alugada,
    numero_banca,
    feiras_livres,
    possui_cnpj,
    cnpj_numero,
    nome_fantasia,
    ramo_atividade,
    tempo_atividade,
    local_atividade,
    interesse_cursos
  } = req.body;

  console.log('Data nascimento recebida:', nascimento);

  // Verificação token
  if (!token || !tokens[token]) {
    return res.status(400).json({ erro: 'Token inválido ou não fornecido' });
  }
  if (tokens[token].usado) {
    return res.status(400).json({ erro: 'Token já usado' });
  }

  if (!req.file) {
    return res.status(400).json({ erro: 'Foto obrigatória' });
  }

  // Validar formato da data nascimento (YYYY-MM-DD)
  if (!nascimento || !/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) {
    return res.status(400).json({ erro: 'Data de nascimento deve estar no formato YYYY-MM-DD' });
  }

  // Inserir no banco
  const foto = req.file.filename;

  const sql = `INSERT INTO feirantes (
    token, nome, rgcpf, nascimento, endereco, telefone, email, escolaridade,
    empreendedor_popular, ambulante, banca_feira, banca_alugada,
    numero_banca, feiras_livres, possui_cnpj, cnpj_numero, nome_fantasia,
    ramo_atividade, tempo_atividade, local_atividade, interesse_cursos, foto
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    token, nome, rgcpf, nascimento, endereco, telefone, email, escolaridade,
    empreendedor_popular || 'não', ambulante || 'não', banca_feira || 'não', banca_alugada || 'não',
    numero_banca, feiras_livres, possui_cnpj, cnpj_numero, nome_fantasia,
    ramo_atividade, tempo_atividade, local_atividade, interesse_cursos || 'não', foto
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao salvar no banco' });
    }

    tokens[token].usado = true;
    salvarTokens();

    res.json({ mensagem: 'Cadastro realizado com sucesso!' });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
