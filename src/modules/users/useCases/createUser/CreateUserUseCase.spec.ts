import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let createUsersUseCase: CreateUserUseCase

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUsersUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to create a new user', async () => {
    const user = await createUsersUseCase.execute({
      name: 'Nelson Oak',
      email: 'nelson@nelsonoak.dev',
      password: 'nelsonDevJS'
    })

    expect(user).toHaveProperty('id');
  })

  it('should not be able to create a user with an email from another', async () => {
      await createUsersUseCase.execute({
        name: 'Nelson Oak',
        email: 'nelson@nelsonoak.dev',
        password: 'nelsonDevJS'
      })

    await expect(
      createUsersUseCase.execute({
        name: 'Another Nelson Oak',
        email: 'nelson@nelsonoak.dev',
        password: 'anotherNelsonDevJS'
      })
    ).rejects.toBeInstanceOf(CreateUserError)
  })
})
