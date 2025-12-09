Tractomaq – Sistema de Controle de Estoque, Agenda e Orçamentos

Desenvolvido por João Vitor de Carvalho
Matrícula: 2024008566
Curso: Ciência da Computação

______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

📘 Descrição do Projeto

O Tractomaq é um sistema web completo criado com o objetivo de integrar conhecimentos de Programação II, Banco de Dados e Engenharia de Software, atendendo plenamente às exigências do Trabalho Integrador.
A aplicação permite o gerenciamento de:

    -Estoque de produtos
    -Agendamentos de serviços
    -Orçamentos com múltiplos itens
    -Dashboard dinâmico com análise de dados

Possui dois perfis de acesso:
  
    -Administrador: acesso a todos os dados e recursos do sistema
    -Usuário comum: acesso restrito aos seus próprios registros

O sistema foi construído seguindo boas práticas de organização, modularização e separação entre frontend e backend.
______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

🎯 Objetivo do Sistema

O objetivo principal é fornecer uma aplicação funcional e organizada que:

    -Integre frontend e backend de forma real
    -Utilize banco de dados relacional
    -Implemente autenticação e autorização
    -Ofereça operações CRUD completas
    -Exiba dados dinâmicos em um dashboard
    -Siga boas práticas de desenvolvimento profissional

O projeto também tem como finalidade demonstrar o uso aplicado de:

    -APIs REST
    -React para interfaces modernas
    -Node.js com Express no backend
    -Sequelize como ORM
    -Integração com PostgreSQL
______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

⚙️ Tecnologias Utilizadas:
🖥️ Frontend

    -React (Vite)
    -JavaScript ES6+
    -Axios
    -React Router DOM
    -Chart.js + react-chartjs-2
    -CSS3 (responsivo)

🛠️ Backend

    -Node.js
    -Express.js
    -Sequelize ORM
    -JWT (Json Web Token)
    -Bcrypt.js
    -Cors
    -Dotenv
______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

🗄️ Banco de Dados
  -PostgreSQL

🚀 Instruções de Instalação
Abaixo está o passo a passo para rodar todo o projeto localmente.

  -📦 1. Clonar o repositório
  
    git clone https://github.com/JoaoVdeCarvalho/tractomaq.git
    cd tractomaq

🛠️ 2. Configurar o Backend
  -Entre na pasta:
  
    cd backend
    
  -Instalar dependências:
  
    npm install
    
  -Criar arquivo .env:
  
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASS=suasenha
    DB_NAME=tractomaq
    DB_PORT=5432
    JWT_SECRET=segredo

  -Rodar o backend:
  
    node server.js

  -O servidor iniciará em:
  
    http://localhost:3001

🖥️ 3. Configurar o Frontend

  -Abra outra janela do terminal e vá para:
  
    cd frontend

  -Instalar dependências:
  
    npm install
  
  -Iniciar servidor:
  
    npm run dev

  -O frontend abrirá em:
  
    http://localhost:5173

🔑 Credenciais de Acesso

  Administrador
  
      Email: admin@gmail.com
      Senha: 123 
      
  Usuário padrão
  
  Criado automaticamente no primeiro acesso:
  
      Email: tractomaq@gmail.com
      Senha: 123456
