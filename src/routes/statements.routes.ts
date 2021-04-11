import { Router } from 'express';

import { CreateStatementController } from '../modules/statements/useCases/createStatement/CreateStatementController';
import { GetBalanceController } from '../modules/statements/useCases/getBalance/GetBalanceController';
import { GetStatementOperationController } from '../modules/statements/useCases/getStatementOperation/GetStatementOperationController';
import { TransferBetweenAccountsController } from '../modules/statements/useCases/transferBetweenAccounts/TransferBetweenAccountsController';
import { ensureAuthenticated } from '../shared/infra/http/middlwares/ensureAuthenticated';

const statementRouter = Router();
const getBalanceController = new GetBalanceController();
const createStatementController = new CreateStatementController();
const transferBetweenAccountsController = new TransferBetweenAccountsController();
const getStatementOperationController = new GetStatementOperationController();

statementRouter.use(ensureAuthenticated);

statementRouter.get('/balance', getBalanceController.execute);
statementRouter.post('/deposit', createStatementController.execute);
statementRouter.post('/withdraw', createStatementController.execute);
statementRouter.post('/transfer/:user_id', transferBetweenAccountsController.execute);
statementRouter.get('/:statement_id', getStatementOperationController.execute);

export { statementRouter };
