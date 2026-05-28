DROP DATABASE IF EXISTS renatinhavw;
CREATE DATABASE renatinhavw;
USE renatinhavw;

CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(250) NOT NULL,
    quantidade INT NOT NULL,
    valor_unidade DECIMAL NOT NULL,
    categoria VARCHAR (250) NOT NULL
);

CREATE TABLE movimentacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dt DATETIME NOT NULL,
    tipo ENUM('Entrada', 'Saída') NOT NULL,
    quantidade INT NOT NULL,
    id_produtos INT NOT NULL,
    FOREIGN KEY (id_produtos) REFERENCES produtos(id)
);

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