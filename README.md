
![GymPoint](https://raw.githubusercontent.com/lcelso/gympoint/master/backend/src/app/views/emails/logo.png)

# GYMPOINT
Este é um desafio proposto criar uma aplicação backend/frontend/mobile para uma academia.
Contempla o CRUD completo da informações de usuários, planos da academia, vinculação do usuário com o plano utilizado, check-in, e pedidos de ajuda de uma academia fictícia.

## Stack utilizada:

Express, Postgres, Mongodb, Redis, Docker, Sentry e Youch, alguns detalhes abaixo:

* Linting com Eslint nos padrões AirBnB
* Prettier
* Sucrase (transpiler rápido)
* Dev server com Nodemon
* Criação de Rotas com ExpressJs
* Base de Dados com Docker Local e Postgres
* Sequelize nos models e migrations
* MongoDb
* Encriptação de senhas com bcryptjs
* Autenticação de usuário com JWT (JsonWebToken)
* Tudo rodando localmente em containers no Docker
* Processamento de datas com date-fns
* Envio de emails e notificações com nodemailer/MailTrap
* Templates de emails com handlebars
* Filas de processamento com Bee-Queue e Redis
* Tratamento de Exceções em ambiente de desenvolvimento com Sentry e Youch
* Variaveis de ambiente com dotenv

Para rodar
Em primeiro lugar certifique-se de ter instalado em sua máquina as seguintes dependências:

* NodeJs
* Yarn
* Docker e/ou Dbs Postgres, MongoDb e Redis
* Uma conta no Mailtrap ou outro email tester
* Uma conta no Sentry.io para tratamento de exceções

Instalação
`yarn ou npm install`

Ambiente Dev 
`yarn dev ou npm run dev`

Ao mesmo tempo você deve abrir outro terminal e digitar o comando para rodar a fila de jobs para envio de notificações:
`yarn queue ou npm run queue`


A aplicação não rodou? Está faltando alguma informação? Precisa de um profissional com o meu perfil? Tem um convite para meetup, hackaton ou bootcamp? celsodesign@gmail.com
