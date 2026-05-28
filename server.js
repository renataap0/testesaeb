const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((erro) => {
  if (erro) return console.log("Erro ao conectar:", erro);
  console.log("Banco conectado!");
});

const erroBanco = (res, erro) => {
  res.status(500).json({ erro: erro.message });
};

app.get("/", (req, res) => {
  res.send("API funcionando!");
});

app.get("/produtos", (req, res) => {
  db.query("SELECT * FROM produtos", (erro, resultado) => {
    if (erro) return erroBanco(res, erro);
    res.json(resultado);
  });
});

app.post("/produtos", (req, res) => {
  const { nome, quantidade, valor_unidade, categoria } = req.body || {};

  if (!nome || quantidade == null || valor_unidade == null || !categoria) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  const sql = `
    INSERT INTO produtos (nome, quantidade, valor_unidade, categoria)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [nome, quantidade, valor_unidade, categoria], (erro, resultado) => {
    if (erro) return erroBanco(res, erro);

    res.status(201).json({
      mensagem: "Produto cadastrado!",
      id: resultado.insertId
    });
  });
});

app.post("/entrada", (req, res) => {
  const { id_produtos, quantidade } = req.body || {};

  if (!id_produtos || !quantidade || quantidade <= 0) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  const sqlEntrada = `
    INSERT INTO movimentacoes (dt, tipo, quantidade, id_produtos)
    VALUES (NOW(), 'Entrada', ?, ?)
  `;

  db.query(sqlEntrada, [quantidade, id_produtos], (erro) => {
    if (erro) return erroBanco(res, erro);

    const sqlAtualizar = `
      UPDATE produtos
      SET quantidade = quantidade + ?
      WHERE id = ?
    `;

    db.query(sqlAtualizar, [quantidade, id_produtos], (erro) => {
      if (erro) return erroBanco(res, erro);

      res.status(201).json({ mensagem: "Entrada registrada!" });
    });
  });
});

app.get("/valor-total-categorias", (req, res) => {
  const sql = `
    SELECT categoria, SUM(quantidade * valor_unidade) AS valor_total
    FROM produtos
    GROUP BY categoria
  `;

  db.query(sql, (erro, resultado) => {
    if (erro) return erroBanco(res, erro);
    res.json(resultado);
  });
});

app.get("/saidas", (req, res) => {
  const sql = `
    SELECT m.id, m.dt, m.tipo, m.quantidade, p.nome, p.categoria
    FROM movimentacoes m
    JOIN produtos p ON m.id_produtos = p.id
    WHERE m.tipo = 'Saída'
    ORDER BY m.dt DESC
  `;

  db.query(sql, (erro, resultado) => {
    if (erro) return erroBanco(res, erro);
    res.json(resultado);
  });
});

app.get("/produtos/limites", (req, res) => {
  const sql = `
    SELECT 
      id,
      nome,
      quantidade,
      CASE
        WHEN quantidade <= 0 THEN 'Limite mínimo'
        WHEN quantidade >= 100 THEN 'Limite máximo'
        ELSE 'Normal'
      END AS situacao,
      quantidade AS percentual_nivel
    FROM produtos
    ORDER BY quantidade ASC
  `;

  db.query(sql, (erro, resultado) => {
    if (erro) return erroBanco(res, erro);
    res.json(resultado);
  });
});

app.get("/movimentacoes/periodo", (req, res) => {
  const { dataInicial, dataFinal } = req.query;

  if (!dataInicial || !dataFinal) {
    return res.status(400).json({ erro: "Informe dataInicial e dataFinal" });
  }

  const sql = `
    SELECT
      p.nome AS nome_produto,
      'unidade' AS unidade_medida,
      SUM(CASE WHEN m.tipo = 'Entrada' THEN m.quantidade ELSE 0 END) AS total_entradas,
      SUM(CASE WHEN m.tipo = 'Saída' THEN m.quantidade ELSE 0 END) AS total_saidas,
      SUM(CASE WHEN m.tipo = 'Entrada' THEN m.quantidade ELSE -m.quantidade END) AS saldo_periodo,
      SUM(CASE WHEN m.tipo = 'Entrada' THEN m.quantidade * p.valor_unidade ELSE 0 END) AS valor_entradas,
      SUM(CASE WHEN m.tipo = 'Saída' THEN m.quantidade * p.valor_unidade ELSE 0 END) AS valor_saidas
    FROM movimentacoes m
    JOIN produtos p ON m.id_produtos = p.id
    WHERE m.dt >= ? AND m.dt <= ?
    GROUP BY p.id, p.nome
    ORDER BY p.nome
  `;

  db.query(sql, [dataInicial, dataFinal], (erro, resultado) => {
    if (erro) return erroBanco(res, erro);
    res.json(resultado);
  });
});

app.get("/produtos/maior-saida", (req, res) => {
  const { dataInicial, dataFinal } = req.query;

  if (!dataInicial || !dataFinal) {
    return res.status(400).json({ erro: "Informe dataInicial e dataFinal" });
  }

  const sql = `
    SELECT
      p.nome AS nome_produto,
      SUM(m.quantidade) AS quantidade_total_saida,
      SUM(m.quantidade * p.valor_unidade) AS valor_total_saidas
    FROM movimentacoes m
    JOIN produtos p ON m.id_produtos = p.id
    WHERE m.tipo = 'Saída'
    AND m.dt >= ? AND m.dt <= ?
    GROUP BY p.id, p.nome
    ORDER BY quantidade_total_saida DESC
  `;

  db.query(sql, [dataInicial, dataFinal], (erro, resultado) => {
    if (erro) return erroBanco(res, erro);
    res.json(resultado);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});