import { Router } from 'express';
import validate from 'src/middleware/validate';
import * as authController from 'src/controllers/auth.controller';
import { loginSchema } from 'src/validations/auth.validation';

const authRouter = Router();
authRouter.post('/login', validate(loginSchema), authController.handleLogin);
authRouter.get('/me', authController.getMe);

export default authRouter;
