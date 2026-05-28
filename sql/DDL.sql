DROP DATABASE IF EXISTS renatinhavw;
CREATE DATABASE renatinhavw;
USE renatinhavw;

CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(250) NOT NULL,
    quantidade INT NOT NULL,
    valor_unidade DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(250) NOT NULL
);

CREATE TABLE movimentacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dt DATETIME NOT NULL,
    tipo ENUM('Entrada', 'Saída') NOT NULL,
    quantidade INT NOT NULL,
    id_produtos INT NOT NULL,
    FOREIGN KEY (id_produtos) REFERENCES produtos(id)
);

INSERT INTO produtos (nome, quantidade, valor_unidade, categoria) VALUES
    ("Barra de Chocolate", 52, 8.00, "Alimento"),
    ("Picanha", 60, 75.00, "Açougue"),
    ("Barrinha de Cereal", 45, 2.00, "Alimento");

INSERT INTO movimentacoes (dt, tipo, quantidade, id_produtos) VALUES
    ("2026-03-25", "Entrada", 15, 1),
    ("2026-02-14", "Saída", 10, 2),
    ("2026-05-03", "Entrada", 8, 3);

CREATE OR REPLACE VIEW vw_estoque AS
SELECT
    id,
    nome,
    quantidade,
    valor_unidade,
    categoria,
    quantidade * valor_unidade AS valor_total
FROM produtos;

SELECT * FROM vw_estoque;

ALTER TABLE produtos
ADD COLUMN unidade_medida VARCHAR(50) DEFAULT 'unidade';