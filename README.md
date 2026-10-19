# Conecta_Projeto

## Projeto

Stack:

- React Native / Expo
- TypeScript
- Fastify
- Node.js
- PostgreSQL
- Docker

---

## Requisitos obrigatórios

Antes de clonar o projeto, o computador precisa ter:

- Git
- Node.js 24 LTS
- Docker Desktop
- Android Studio
- Android SDK
- JDK compatível com o ambiente React Native/Android

---

## Node.js

Este projeto utiliza Node.js 24 LTS.

A versão pode ser conferida com:

```
node -v
```
## Arquitetura do Projeto

```
projeto-saude/
│
├── apps/
│   ├── mobile/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── ...
│   │
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       └── ...
│
├── database/
│   └── init/
│
├── docs/
│
├── scripts/
│   └── setup.sh
│
├── .env.example
├── .gitignore
├── .nvmrc
├── docker-compose.yml
├── package.json
├── package-lock.json
└── REQUISITOS.md
```

## Instalação das dependências

Depois de clonar o projeto:

```
git clone https://github.com/Thomas5109/Conecta_Projeto.git
cd projeto-saude
```
Instale todas as dependências:
```
npm ci
```

## Para subir um Banco de dados em Docker

Suba o PostgreSQL no terminal da raiz do projeto:
```
docker compose up -d
```

Verifique:
```
docker compose ps
```

Para visualizar os logs:
```
npm run db:logs
```

## Backend
Execute no terminal da raiz do projeto:
```
npm run dev:api
```
API:
```
http://localhost:3000
```

## Frontend
Execute no terminal da raiz do projeto:
```
npm run dev:mobile
```
Para Android:
```
npm --workspace apps/mobile run android
```