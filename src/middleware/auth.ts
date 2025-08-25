import { type NextFunction, type Request, type Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from 'src/config/config';
import ErrorResponse from './error';
import asyncHandler from './async';
import { setCurrentUser } from 'src/utils/asyncLocalStorage.utils';
import usersService from 'src/services/users.service';
export interface User {
  id: number | undefined | null;
  name: string;
  email: string | undefined | null;
}

// Extend the Express Request type to include the user property
export interface RequestWithUser extends Request {
  user?: User;
}

// Define a custom interface for the decoded JWT token
interface CustomJwtPayload extends JwtPayload {
  id: number;
  ip: string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
const { verify } = jwt;
export const protect = () =>
  asyncHandler(async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      next(new ErrorResponse('Not authorized to access this route', 401));
      return;
    }

    try {
      const decoded = verify(token, config.jwt.access_token.secret) as CustomJwtPayload;

      const user = await usersService.retrieve(decoded.id);

      if (!user || !user.name) {
        next(new ErrorResponse('Not authorized to access this route', 401));
        return;
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      setCurrentUser(req.user);

      next();
    } catch (err) {
      next(new ErrorResponse('Not authorized to access this route', 401));
    }
  });
