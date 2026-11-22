require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const itensRoutes = require('./routes/itens.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Torna as fotos acessíveis pelo navegador: http://localhost:3000/uploads/arquivo.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/itens', itensRoutes);

// Rota auxiliar: o Angular vai usar para preencher o <select> de categorias
const pool = require('./config/db');
app.get('/api/categorias', async (req, res) => {
  try {
    const [categorias] = await pool.query('SELECT * FROM categorias ORDER BY nome');
    res.json(categorias);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar categorias' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});