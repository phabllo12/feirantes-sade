const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'feirantes.db'));

// Habilita CORS para permitir requisições do frontend
app.use(cors());

// Serve arquivos estáticos do frontend (como fotos, admin.html etc)
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint para retornar dados dos feirantes
app.get('/admin/feirantes', (req, res) => {
  db.all('SELECT * FROM feirantes', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});

