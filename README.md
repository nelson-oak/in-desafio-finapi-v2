# FinAPI (Versão Com Testes) - Desafios Principal 4 e Complementar 4A

Desafio com o intuito de fixar a prática de testes unitários e de integração

## Entidades

| Entidades | Atributos |
| - | - |
| users | id, name, email, password, created_at, updated_at |
| statements | id, user_id, description, amount, type, created_at, updated_at |

## Requisitos

- [x] Deve ser possível criar um usuário
- [x] Deve ser possível autenticar um usuário
- [x] Deve ser possível listar o perfil de um usuário
- [x] Deve ser possível buscar o extrato bancário do cliente
- [x] Deve ser possível realizar um depósito
- [x] Deve ser possível realizar um saque
- [x] Deve ser possível listar os dados de uma operação por ID

## Regras de negócio

- [x] Não deve ser possível criar um usuário com um email já cadastrado
- [x] Não deve ser possível autenticar um usuário com email ou senha incorretos
- [x] Não deve ser possível listar um perfil de um usuário que não existe
- [x] Não deve ser possível sacar se o saldo for insuficiente
- [x] Não deve ser possível listar o saldo de um usuário que não existe
- [x] Não deve ser possível listar uma operação de um usuário que não existe
- [x] Não deve ser possível listar uma operação que não existe


## Recursos

- Express
- Typeorm
- Postgres
- Jest
- Supertest

## Iniciando o projeto

Após clonar o projeto, é necessário atualizar as dependências e executar as migrations.

### Comandos para baixar dependências, executar migrations e iniciar a aplicação

```bash
yarn
yarn typorm migration:run
yarn dev
```

Comandos para testar a aplicação (necessita de um banco de dados de teste *finapi_test*)

```bash
yarn test
```
