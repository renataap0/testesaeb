SHOW DATABASES;
USE atividadesaeb;

SHOW TABLES;
SELECT * FROM produtos;

INSERT INTO produtos (nome, quantidade, valor, categoria) VALUES
    ("Barra de Chocolate", 52, 8.00, "Alimento"),
    ("Picanha", 60, 75.00, "Acougue"),
    ("Barrinha de Cereal", 45, 2.00, "Alimento");

INSERT INTO movimentacoes (`date`, tipo, quantidade, produtos_idprodutos) VALUES
    ("2026-03-25", "Entrada", 15, 1),
    ("2026-02-14", "Saida", 10, 2),
    ("2026-05-03", "Entrada", 8, 3);
