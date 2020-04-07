import Router from 'express';

import SessionController from './app/controllers/SessionController';
import DepartmentController from './app/controllers/DepartmentController';

import authMiddleware from './app/middlewares/auth';
import restricted from './app/middlewares/permissions';

const routes = new Router();

routes.get('/', (req, res) => {
  res.send('Bem-vindo ao gestor de tarefas da Anestech');
});

routes.post('/sessions', SessionController.store);
// definindo a regra de autenticação de forma global
// todas as rotas que vier após o middleware passará pela verificação de autenticação
// rotas com o middleware 'restricted' significa que será verificado se o usuário
// poderá acessar a rota ou não.
routes.use(authMiddleware);
// rotas para manipulação de departamentos
routes.get('/departments', restricted, DepartmentController.index);
routes.post('/departments', restricted, DepartmentController.store);
routes.put('/departments/:id', restricted, DepartmentController.update);
routes.delete('/departments/:id', restricted, DepartmentController.delete);

export default routes;
