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

const statementId = uuidV4()

describe('Transfer Between Accounts', () => {
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
      VALUES ('${statementId}', '${user.id}', 'some deposit amount', 500, 'deposit', NOW(), NOW())
    `);
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to transfer an amount to an user', async () => {
    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${otherUser.id}`)
      .send({
        description: 'some transfer test',
        amount: 100
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
  })

  it('should not be able to transfer to a non-existing user', async () => {
    const nonExistingUser = uuidV4()

    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${nonExistingUser}`)
      .send({
        description: 'some transfer test',
        amount: 100
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(404)

    expect(response.body.message).toEqual("Recipient user not found!")
  })

  it('should not be able to transfer if the recipient is the same as the user', async () => {
    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .send({
        description: 'some transfer test',
        amount: 100
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(400)

    expect(response.body.message).toEqual("Sender and recipient can not be the same user!")
  })

  it('should not be able to transfer if the amount is greater than balance', async () => {
    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${otherUser.id}`)
      .send({
        description: 'some transfer test',
        amount: 600
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(400)

    expect(response.body.message).toEqual("Insufficient funds for a transfer!")
  })

  it('should not be able to transfer with a false token', async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${otherUser.id}`)
      .send({
        description: 'some transfer test',
        amount: 100
      })
      .set({
        Authorization: `Bearer false-token`,
      })

    expect(response.status).toBe(401)

    expect(response.body.message).toEqual("JWT invalid token!")
  })

  it('should not be able to transfer without a token', async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${otherUser.id}`)
      .send({
        description: 'some transfer test',
        amount: 100
      })

    expect(response.status).toBe(401)

    expect(response.body.message).toEqual("JWT token is missing!")
  })
})
