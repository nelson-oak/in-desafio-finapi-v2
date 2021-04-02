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

const statementId = uuidV4()

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
      INSERT INTO statements(id, user_id, description, amount, type, created_at, updated_at)
      VALUES ('${statementId}', '${user.id}', 'some deposit amount', 300, 'deposit', NOW(), NOW())
    `);
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to get an operation', async () => {
    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
  })

  it('should be able to get an operation', async () => {
    const nonExistingStatement = uuidV4()

    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${nonExistingStatement}`)
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toEqual('Statement not found')
  })

  it('should not be able to get an operation with a false token', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer false-token`,
      })

    expect(response.status).toBe(401)

    expect(response.body.message).toEqual("JWT invalid token!")
  })

  it('should not be able to get an operation without a token', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)

    expect(response.status).toBe(401)

    expect(response.body.message).toEqual("JWT token is missing!")
  })
})
