# GYMPOINT
Este é um desafio proposto criar uma aplicação backend/frontend/mobile para cadastro e atualização de informações de usuários, check-in, 
e pedidos de ajuda de uma academia fictícia, utilizando os conceitos ensinados no módulo de NodeJs.

* Linting com Eslint nos padrões AirBnB
* Prettier
* Sucrase (transpiler rápido)
* Dev served with Nodemon
* Criação de Rotas com ExpressJs
* Base de Dados com Docker Local e Postgres
* Sequelize nos models e migrations
* MongoDb
* Encriptação de senhas com bcryptjs
* Autenticação de usuário com JWT (JsonWebToken)
* Tudo rodando localmente em containers no Docker
* Processamento de datas com date-fns
* Envio de emails e notificações com nodemailer
* Teste com MailTrap
* Templates de emails com handle-bars
* Filas de processamento com Bee-Queue e redis
* Tratamento de Exceções em ambiente de desenvolvimento com Sentry e Youch
* Variaveis de ambiente com dotenv

Para rodar
Em primeiro lugar certifique-se de ter instalado em sua máquina e contas em serviços de terceiros:

* NodeJs
* Yarn
* Docker e/ou Dbs Postgres, MongoDb e Redis
* Uma conta no Mailtrap ou outro email tester para Node
* Uma conta no Sentry.io para tratamento de exceções
* yarn install ou npm install

Ambiente Dev (apenas este por enquanto)
yarn dev ou npm run dev

Ao mesmo tempo você deve abrir outro terminal e digitar o comando para rodar a fila de jobs para envio de notificações:

yarn queue ou npm run queue

A aplicação não rodou? Está faltando alguma informação? Precisa de um profissional com o meu perfil? Tem um convite para meetup, hackaton ou bootcamp? celsodesign@gmail.com
