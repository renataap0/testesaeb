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
  if (erro) {
    console.error("Erro ao conectar com o banco de dados:", erro);
    return;
  }

  console.log("Conectado ao banco de dados MySQL!");
});

app.get("/", (req, res) => {
  res.send("API de estoque funcionando!");
});

app.get("/produtos", (req, res) => {
  const sql = "SELECT * FROM produtos";

  db.query(sql, (erro, resultados) => {
    if (erro) {
      return res.status(500).json({
        mensagem: "Erro ao buscar produtos",
        erro: erro
      });
    }

    res.status(200).json(resultados);
  });
});

app.post("/produtos", (req, res) => {
  const { nome, quantidade, valor_unidade, categoria } = req.body || {};

  if (!nome || quantidade === undefined || valor_unidade === undefined || !categoria) {
    return res.status(400).json({
      mensagem: "Envie nome, quantidade, valor_unidade e categoria no corpo da requisição."
    });
  }

  const sql = `
    INSERT INTO produtos (nome, quantidade, valor_unidade, categoria)
    VALUES (?, ?, ?, ?)
  `;

  const valores = [nome, quantidade, valor_unidade, categoria];

  db.query(sql, valores, (erro, resultado) => {
    if (erro) {
      return res.status(500).json({
        mensagem: "Erro ao cadastrar produto.",
        erro: erro
      });
    }

    res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto: {
        id: resultado.insertId,
        nome,
        quantidade,
        valor_unidade,
        categoria
      }
    });
  });
});

app.post("/entrada", (req, res) => {
  const { id_produtos, quantidade } = req.body;

  if (!id_produtos || !quantidade || quantidade <= 0) {
    return res.status(400).json({ mensagem: "Dados inválidos" });
  }

  const sqlMovimentacao = `
    INSERT INTO movimentacoes (dt, tipo, quantidade, id_produtos)
    VALUES (NOW(), 'Entrada', ?, ?)
  `;

  db.query(sqlMovimentacao, [quantidade, id_produtos], (erro) => {
    if (erro) {
      return res.status(500).json({ mensagem: "Erro ao registrar entrada", erro });
    }

    const sqlProduto = `
      UPDATE produtos 
      SET quantidade = quantidade + ? 
      WHERE id = ?
    `;

    db.query(sqlProduto, [quantidade, id_produtos], (erro) => {
      if (erro) {
        return res.status(500).json({ mensagem: "Erro ao atualizar estoque", erro });
      }

      res.status(201).json({ mensagem: "Entrada registrada com sucesso!" });
    });
  });
});

app.get("/valor-total-categorias", (req, res) => {
  const sql = `
    SELECT 
      categoria,
      SUM(quantidade * valor_unidade) AS valor_total
    FROM produtos
    GROUP BY categoria
  `;

  db.query(sql, (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ mensagem: "Erro ao buscar valores", erro });
    }

    res.json(resultado);
  });
});

app.get("/saidas", (req, res) => {
  const sql = `
    SELECT 
      movimentacoes.id,
      movimentacoes.dt,
      movimentacoes.tipo,
      movimentacoes.quantidade,
      produtos.nome,
      produtos.categoria
    FROM movimentacoes
    INNER JOIN produtos 
    ON movimentacoes.id_produtos = produtos.id
    WHERE movimentacoes.tipo = 'Saída'
    ORDER BY movimentacoes.dt DESC
  `;

  db.query(sql, (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ mensagem: "Erro ao listar saídas", erro });
    }

    res.json(resultado);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});