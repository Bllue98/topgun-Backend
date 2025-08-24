import { type NextFunction, type Request, type Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from 'src/config/config';
import employeeService from 'src/services/manager-portal/employee.service';
import ErrorResponse from './error';
import asyncHandler from './async';
import { setCurrentUser } from 'src/utils/asyncLocalStorage.utils';
import { type TPermission } from 'shared/constants';
export interface User {
  employeeNo: number | undefined | null;
  name: string;
  email: string | undefined | null;
  teamNo: number | undefined | null;
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
// @ts-expect-error
const { verify } = jwt;
export const protect = (requiredPermissions: TPermission[]) =>
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
      //  some pc's could have rotating ip addresses, so we can't check for ip address
      // const remoteIp = req.headers['x-forwarded-for'] ?? req.ip;
      // if (decoded.ip !== remoteIp && config.node_env === 'production') {
      //   next(new ErrorResponse('IP address mismatch', 401));
      // }

      const user = await employeeService.getEmployeeEssentialInfoByEmployeeNo(decoded.id);

      if (!user || !user.name) {
        next(new ErrorResponse('Not authorized to access this route', 401));
        return;
      }
      if (requiredPermissions && requiredPermissions.length > 0 && user.employeeNo) {
        const userPermissions = await employeeService.hasRequiredPermissions(user.employeeNo, requiredPermissions);

        if (!userPermissions) {
          next(new ErrorResponse('User does not have the required permissions to access this route', 401));
          return;
        }
      }

      req.user = {
        employeeNo: user.employeeNo,
        name: user.name,
        email: user.email,
        teamNo: user.teamNo
      };

      setCurrentUser(req.user);

      next();
    } catch (err) {
      next(new ErrorResponse('Not authorized to access this route', 401));
    }
  });
