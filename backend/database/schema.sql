-- Cria o banco com suporte a acentos e emojis
CREATE DATABASE IF NOT EXISTS perdeu_achou
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE perdeu_achou;

-- Funcionários do apoio (quem gerencia o sistema)
CREATE TABLE funcionarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categorias dos objetos
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE
);

-- Itens encontrados
CREATE TABLE itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id INT NOT NULL,
  local_encontrado VARCHAR(100) NOT NULL,
  data_encontrado DATE NOT NULL,
  foto VARCHAR(255),
  situacao ENUM('disponivel', 'devolvido') NOT NULL DEFAULT 'disponivel',
  cadastrado_por INT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (cadastrado_por) REFERENCES funcionarios(id)
);

-- Registro de devoluções
CREATE TABLE devolucoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL UNIQUE,
  nome_retirante VARCHAR(100) NOT NULL,
  data_devolucao DATE NOT NULL,
  registrado_por INT,
  FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES funcionarios(id)
);

-- Categorias iniciais
INSERT INTO categorias (nome) VALUES
  ('Mochila/Bolsa'), ('Garrafa/Marmita'), ('Roupa/Agasalho'),
  ('Material escolar'), ('Eletrônico'), ('Chave'),
  ('Documento/Cartão'), ('Outros');