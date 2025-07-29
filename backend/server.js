const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'feirantes.db'));

// Habilita CORS para o frontend
app.use(cors());

// Serve arquivos estáticos do frontend (como fotos, admin.html etc)
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuração multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // pasta uploads dentro do backend
  },
  filename: (req, file, cb) => {
    // Usa timestamp + extensão original para evitar conflitos
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// Token esperado para validação (coloque seu token real aqui)
const TOKEN_ESPERADO = 'SEU_TOKEN_AQUI';

// Middleware para validar token na rota /api/cadastro
app.use('/api/cadastro', (req, res, next) => {
  const tokenRecebido = req.query.token || req.headers['authorization'];
  if (!tokenRecebido || tokenRecebido !== TOKEN_ESPERADO) {
    return res.status(401).json({ error: 'Token válido ou não fornecido' });
  }
  next();
});

// Endpoint POST para cadastro com upload de foto
app.post('/api/cadastro', upload.single('foto'), (req, res) => {
  const {
    nome,
    cpf,
    nascimento,
    numero_box,
    produto,
    telefone,
  } = req.body;

  if (!nome || !cpf || !nascimento || !numero_box || !produto || !telefone) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const foto = req.file ? req.file.filename : null;

  const sql = `INSERT INTO feirantes
    (nome, cpf, nascimento, numero_box, produto, telefone, foto)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [nome, cpf, nascimento, numero_box, produto, telefone, foto], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar no banco.' });
    }
    res.json({ message: 'Cadastro realizado com sucesso!' });
  });
});

// Endpoint para retornar dados dos feirantes (admin)
app.get('/admin/feirantes', (req, res) => {
  db.all('SELECT * FROM feirantes ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
