#!/bin/sh
echo "Verificando instalação de dependências..."

# Remove node_modules se existir
if [ -d "node_modules" ]; then
    echo "Limpando node_modules antigo..."
    rm -rf node_modules
fi

# Remove package-lock se existir
if [ -f "package-lock.json" ]; then
    echo "Removendo package-lock.json..."
    rm package-lock.json
fi

# Instala as dependências
echo "Instalando dependências..."
npm install --force

# Verifica se a instalação foi bem sucedida
if [ $? -eq 0 ]; then
    echo "Dependências instaladas com sucesso!"
    echo "Iniciando o bot..."
    node src/index.js
else
    echo "Erro ao instalar dependências!"
    exit 1
fi
