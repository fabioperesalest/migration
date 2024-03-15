@echo off

:: Criar diretório src
mkdir src

:: Identificar o sistema operacional
:: As verificações do sistema operacional no Windows não são necessárias,
:: mas podem ser úteis se você tiver outras ações específicas do sistema operacional.
move logs ./src
move modules ./src
rmdir /s /q ".git"


:: Solicitar o link do novo repositório
echo Insira o link do seu novo repositório:
set /p repoURL=

:: Inicializar o repositório git e realizar commits e push
git init
git add .
git commit -m "setup my environment"
git remote add origin %repoURL%
git branch -M main
git push -u origin main

:: Instalar dependências do npm
npm install

echo Ready to use! :D
