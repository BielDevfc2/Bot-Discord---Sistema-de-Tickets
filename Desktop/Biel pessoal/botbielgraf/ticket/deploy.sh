#!/bin/bash
# Script de Deploy para Railway
# Uso: ./deploy.sh

echo "🚀 INICIANDO DEPLOY NO RAILWAY"
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado"
    echo "Execute este script a partir da raiz do projeto"
    exit 1
fi

echo "✅ Pasta correta detectada"
echo ""

# Verificar Git
if ! command -v git &> /dev/null; then
    echo "❌ Git não instalado"
    exit 1
fi

echo "📦 Verificando repositório Git..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Inicializando Git..."
    git init
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo "⚠️  .env não encontrado"
    echo "Copiando de .env.example..."
    cp .env.example .env
    echo "❌ Configure seu TOKEN e OWNER_ID em .env"
    exit 1
fi

echo "✅ Arquivo .env encontrado"
echo ""

# Adicionar alterações
echo "📝 Adicionando mudanças..."
git add .

# Verificar se há mudanças
if git diff-index --quiet HEAD --; then
    echo "ℹ️  Nenhuma mudança para fazer commit"
else
    echo "💾 Criando commit..."
    git commit -m "🚀 Deploy Railway - $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo ""
echo "✅ PRONTO PARA FAZER PUSH!"
echo ""
echo "Próximas etapas:"
echo "1. git push -u origin main"
echo "2. Vá para railway.app"
echo "3. Novo Projeto → Deploy from GitHub"
echo "4. Selecione: botbielgraf-ticket"
echo "5. Configure variáveis de ambiente"
echo ""
echo "Seu bot estará online em ~3 minutos!"
echo "🎉"
