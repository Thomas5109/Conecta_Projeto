CREATE TYPE status_conta AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO');
CREATE TYPE tipo_usr AS ENUM ('CLIENTE', 'ADMIN');
CREATE TYPE sexo_enum AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

CREATE TABLE usuario (
    -- Alterado para VARCHAR para suportar IDs gerados pelo WatermelonDB no frontend
    id_usuario VARCHAR(255) PRIMARY KEY, 
    CPF VARCHAR(11) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status_da_conta status_conta DEFAULT 'ATIVO',
    tipo_usuario tipo_usr DEFAULT 'CLIENTE',
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Colunas de Controle de Sincronização (WatermelonDB)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE usuario_cliente (
    id_cliente VARCHAR(255) PRIMARY KEY,
    id_usuario VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(25) NOT NULL,
    data_de_nascimento DATE NOT NULL,
    sexo sexo_enum NOT NULL,

    -- Colunas de Controle de Sincronização (WatermelonDB)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);