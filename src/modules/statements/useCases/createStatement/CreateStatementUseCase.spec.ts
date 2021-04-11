import { OperationType } from "../../entities/Statement";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import auth from "../../../../config/auth";

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it('should be able to create a new deposit', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Nelson Oak',
      email: 'nelson@nelsonoak.dev',
      password: 'nelsonDevJS'
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: 'some amount deposit',
      amount: 500,
      type: OperationType.DEPOSIT
    })

    expect(statement).toHaveProperty('id')
  })

  it('should be able to create a new withdraw', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Nelson Oak',
      email: 'nelson@nelsonoak.dev',
      password: 'nelsonDevJS'
    })

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: 'some amount deposit',
      amount: 500,
      type: OperationType.DEPOSIT
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: 'some amount deposit',
      amount: 100,
      type: OperationType.WITHDRAW
    })

    expect(statement).toHaveProperty('id')
  })

  it('should be not be able to withdraw if the amount is greater than balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Nelson Oak',
      email: 'nelson@nelsonoak.dev',
      password: 'nelsonDevJS'
    })

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: 'some amount deposit',
      amount: 100,
      type: OperationType.DEPOSIT
    })

    await expect(
      createStatementUseCase.execute({
        user_id: user.id as string,
        description: 'some amount deposit',
        amount: 500,
        type: OperationType.WITHDRAW
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it('should be not be able to create a statement for a non-existing user', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: 'non-existing-user',
        description: 'some amount deposit',
        amount: 500,
        type: OperationType.WITHDRAW
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})
