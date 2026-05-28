SHOW DATABASES;
USE renatinhavw;

SHOW TABLES;
SELECT * FROM produtos;

INSERT INTO produtos (nome, quantidade, valor_unidade, categoria) VALUES
	("Barra de Chocolate", 52, 8.00, "Alimento"),
    ("Picanha", 60, 75.00, "Açougue"),
    ("Barrinha de Cereal", 45, 2.00, "Alimento");
    

INSERT INTO movimentacoes (dt, tipo, quantidade, id_produtos) VALUES
	("2026-03-25", "Entrada", 15, 1),
    ("2026-02-14", "Saída", 10, 2),
    ("2026-05-03", "Entrada", 8, 3);