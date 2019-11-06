import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentsController from './app/controllers/StudentsController';
import PlansController from './app/controllers/PlansController';
import FileController from './app/controllers/FileController';
import EnrollmentsController from './app/controllers/EnrollmentsController';
import CheckinsController from './app/controllers/CheckinsController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.post('/students/:studentId/checkins', CheckinsController.store);

routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.put('/users', UserController.update);
routes.delete('/users', UserController.delete);

routes.post('/students', StudentsController.store);
routes.get('/students', StudentsController.index);
routes.put('/students/:studentId', StudentsController.update);
routes.delete('/students/:studentId', StudentsController.delete);

routes.get('/plans', PlansController.index);
routes.post('/plans', PlansController.store);
routes.put('/plans/:planId', PlansController.update);
routes.delete('/plans/:planId', PlansController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/enrollments', EnrollmentsController.store);
routes.get('/enrollments', EnrollmentsController.index);
routes.put('/enrollments/:enrollmentId', EnrollmentsController.update);
routes.delete('/enrollments/:enrollmentId', EnrollmentsController.delete);

module.exports = routes;
