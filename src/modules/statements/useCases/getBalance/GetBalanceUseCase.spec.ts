import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  })

  it('should be able to list a balance of a user', async () => {
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

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: 'some amount deposit',
      amount: 100,
      type: OperationType.WITHDRAW
    })

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string
    })

    expect(balance.balance).toBe(400)
    expect(balance.statement.length).toBe(2)
  })

  it('should be not be able to list the balance of a non-existing user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'non-existing-user'
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
