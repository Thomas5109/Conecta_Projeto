#!/usr/bin/env bash

set -e

echo "===================================="
echo " Configuração do Projeto Saúde"
echo "===================================="

echo ""
echo "Verificando Node.js..."

if ! command -v node &> /dev/null
then
    echo "ERRO: Node.js não está instalado."
    echo "Instale o Node.js 24 LTS."
    exit 1
fi

echo "Node.js:"
node -v

echo ""
echo "npm:"
npm -v

echo ""
echo "Verificando Docker..."

if ! command -v docker &> /dev/null
then
    echo "ERRO: Docker não está instalado."
    exit 1
fi

echo "Docker:"
docker --version

echo ""
echo "Instalando dependências do projeto..."

npm ci

echo ""
echo "Subindo PostgreSQL..."

docker compose up -d

echo ""
echo "===================================="
echo " Ambiente configurado!"
echo "===================================="

echo ""
echo "API:"
echo "  npm run dev:api"

echo ""
echo "React Native:"
echo "  npm run dev:mobile"

echo ""
echo "PostgreSQL:"
echo "  npm run db:logs"