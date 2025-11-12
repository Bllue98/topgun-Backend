import { Router } from 'express';
import validate from 'src/middleware/validate';
import * as authController from 'src/controllers/auth.controller';
import { loginSchema, signupSchema } from 'src/validations/auth.validation';
import { protect } from 'src/middleware/auth';

const authRouter = Router();
authRouter.post('/login', validate(loginSchema), authController.handleLogin);
authRouter.post('/register', validate(signupSchema), authController.handleRegister);
authRouter.get('/me', protect(), authController.getMe);

export default authRouter;
