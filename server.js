const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API funcionando'
  });
});

app.get('/produtos', async (req, res) => {
    try {
      const [produtos] = await pool.execute(
        'SELECT * FROM produtos ORDER BY id ASC'
      );
  
      res.status(200).json(produtos);
    } catch (erro) {
      console.error('Erro ao listar produtos:', erro);
  
      res.status(500).json({
        erro: 'Erro ao listar produtos'
      });
    }
  });
  
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});