CREATE TYPE status_conta AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO');
CREATE TYPE tipo_usr AS ENUM ('CLIENTE', 'ADMIN');
CREATE TYPE sexo_enum AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    CPF VARCHAR(11) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status_da_conta status_conta DEFAULT 'ATIVO',
    data_cadastro DATA NOT NULL DEFAULT CURRENT_DATE,
    tipo_usuario tipo_usr DEFAULT 'CLIENTE',
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE UsuarioCliente (
    id_cliente SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(25) NOT NULL,
    data_de_nascimento DATE NOT NULL,
    sexo sexo_enum NOT NULL,

    CONSTRAINT fk_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);