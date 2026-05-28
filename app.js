const express = require('express');
require('dotenv').config();

const produtosRouter = require('./routes/produtos');
const estoqueRouter = require('./routes/estoque');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API funcionando' });
});

app.use('/produtos', produtosRouter);
app.use('/estoque', estoqueRouter);

module.exports = app;

