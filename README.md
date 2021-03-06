
## **Recursos utilizados**
- **Servidor da API:** [NodeJS](https://nodejs.org/en/ "NodeJS") na versão **v10.17.0**
- **Gerenciador de pacotes:** [Yarn](https://classic.yarnpkg.com/en/ "Yarn").
- **Banco de dados:** [MariaDB](https://mariadb.org/ "MariaDB") usado como banco de dados relacional.
- **Gerenciador de container:** [Docker](https://www.docker.com/ "Docker") com o servidor do banco MariaDB.

------------

## Instalando a aplicação
Baixe o repositório numa pasta de sua preferência e digite o seguinte comando.
$ git clone https://github.com/daniloas80/desafio-anestech.git

### Preparando o back-end com o Docker
1. Abra o terminal e instale o *conteiner* para o banco de dados MariaDB conforme abaixo. Se preferir, use outros nomes para os *conteiner* logo depois da flag  `--name`.

**MariaDB**
	```
	$ docker run --name anestech -e MYSQL_ROOT_PASSWORD=anestech2020 -p 3309:3306 -d mariadb
	```
  1. Inicialize o *container* no Docker via terminal:
	```
	$ docker start anestech
	```

  1. Use uma GUI para banco de dados SQL de sua preferência (TablePlus, DBeaver, Valentina Studio ou outro) e crie um banco de dados MariaDB com o nome `dbanestech` e encoding `UTF-8`. Use `root` como nome de usuário e `anestech2020` como senha.

### Estruturando o banco de dados MariaDB da aplicação (*running migrations*)
Com o terminal aberto no `<diretório escolhido>` escolhido da aplicação, execute o seguinte comando:
```javascript
$ yarn install
$ yarn sequelize db:migrate
```

### Populando o banco de dados (*running seeds*)
Existem dois arquivos na pasta `src/database/seeds` para popular o banco de dados. O primeiro arquivo cria o cadastro do cargo administrador, visto que todos os usuários deverão ter um cargo, mas somente o administrador poderá realizar as operações CRUD para a funcionalidade de cargos e cadastro de usuários. O segundo arquivo cria um usuário administrador que pode se autenticar no sistema usando e-mail e senha (`admin@anestech.com.br` e `123456` respectivamente).

Com o terminal aberto no diretório `<diretório escolhido>`, execute o seguinte comando:
```javascript
$ yarn sequelize db:seed:all
```

###### Agora a aplicação está pronta para testar!

------------
## Testando a aplicação

### Iniciando o servidor (Anestech API)
No terminal, inicie o servidor com o comando:
```bash
$ yarn start
```
A seguinte mensagem deve aparecer:
```
yarn run v<número da versão do yarn>
warning ../../../package.json: No license field
$ nodemon src/server.js
[nodemon] <número da versão do nodemon>
[nodemon] to restart at any time, enter `rs`
[nodemon] watching dir(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node -r sucrase/register src/server.js`
```
Use a REST API Client de sua preferência, mas se for usuário do [Insomnia](https://insomnia.rest/ "Insomnia"), você poderá importar o [workspace] da pasta do Insomnia que eu criei para rodar os teste da aplicação.
