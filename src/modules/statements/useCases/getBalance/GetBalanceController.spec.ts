import request from 'supertest'
import { v4 as uuidV4 } from 'uuid'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app'
import { hash } from 'bcryptjs'

let connection: Connection

const user = {
  id: uuidV4(),
  email: 'nelson@nelsonoak.dev',
  password: 'nelsonDevJs',
  hashedPassword: '',
}

const otherUser = {
  id: uuidV4(),
  email: 'nelson.2@nelsonoak.dev',
  password: 'nelsonDevJs',
  hashedPassword: '',
}

const statementIds = [
  uuidV4(),
  uuidV4(),
  uuidV4(),
  uuidV4()
]

describe('Get Balance', () => {
  beforeAll(async () => {
    connection = await createConnection()

    user.hashedPassword = await hash(user.password, 8)

    await connection.runMigrations()

    await connection.query(`
      INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES ('${user.id}', 'Nelson Oak', '${user.email}', '${user.hashedPassword}', NOW(), NOW())
    `);

    await connection.query(`
      INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES ('${otherUser.id}', 'Nelson Oak', '${otherUser.email}', '${otherUser.hashedPassword}', NOW(), NOW())
    `);

    await connection.query(`
      INSERT INTO statements(id, user_id, description, amount, type, created_at, updated_at)
      VALUES ('${statementIds[0]}', '${user.id}', 'some deposit amount', 400, 'deposit', NOW(), NOW())
    `);

    await connection.query(`
      INSERT INTO statements(id, user_id, description, amount, type, created_at, updated_at)
      VALUES ('${statementIds[1]}', '${user.id}', 'some withdraw amount', 100, 'withdraw', NOW(), NOW())
    `);

    await connection.query(`
      INSERT INTO statements(id, user_id, sender_id, description, amount, type, created_at, updated_at)
      VALUES ('${statementIds[2]}', '${otherUser.id}', '${user.id}', 'some transfer amount', 200, 'transfer', NOW(), NOW())
    `);

    await connection.query(`
      INSERT INTO statements(id, user_id, sender_id, description, amount, type, created_at, updated_at)
      VALUES ('${statementIds[3]}', '${user.id}', '${otherUser.id}', 'some transfer amount', 500, 'transfer', NOW(), NOW())
    `);
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to get the balance', async () => {
    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = responseToken.body;

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(200)
    expect(response.body.statement.length).toBe(4)
    expect(response.body.balance).toBe(600)
  })

  it('should not be able to get the balance with a false token', async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer false-token`,
      })

    expect(response.status).toBe(401)

    expect(response.body.message).toEqual("JWT invalid token!")
  })

  it('should not be able to get the balance without a token', async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')

    expect(response.status).toBe(401)

    expect(response.body.message).toEqual("JWT token is missing!")
  })
})
