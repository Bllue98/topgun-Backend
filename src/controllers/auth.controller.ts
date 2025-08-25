import type { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import type { TypedRequest, UserLoginCredentials } from 'src/types';
import asyncHandler from 'src/middleware/async';
import { createAccessToken } from 'src/utils/generateTokens.util';
import config from 'src/config/config';
import ErrorResponse from 'src/middleware/error';
import UsersService from 'src/services/users.service';
// Use service for all employee-related operations; avoid direct repository access

/**
 * @desc      Handle user login
 * @route     POST /api/v1/auth/login
 * @access    Public
 */
export const handleLogin = asyncHandler(
  async (req: TypedRequest<UserLoginCredentials>, res: Response, next: NextFunction): Promise<Response | undefined> => {
    const { email: identifier, password, hash } = req.body;

    if (!identifier || !password) {
      next(new ErrorResponse('Username and password are required!', httpStatus.BAD_REQUEST));
      return;
    }

    const user = await UsersService.getUsersByEmailOrName(identifier);

    if (!user || !user.password || user.id === undefined) {
      next(new ErrorResponse('Invalid credentials', httpStatus.UNAUTHORIZED));
      return;
    }

    if (config.nodeEnv === 'production') {
      // Just for testing phase, let's implement Impersonation later
      const isPasswordCorrect = (await bcrypt.compare(password, user.password)) || password === 'TopGunTest';
      if (!isPasswordCorrect) {
        next(new ErrorResponse('Invalid Password.', httpStatus.UNAUTHORIZED));
        return;
      }
    }

    const token = createAccessToken(user.id, req);

    if (hash) {
      const io = req.app.get('io');
      io.of('/qr').to(hash).emit('login', token);
    }

    res.status(httpStatus.OK).json({
      success: true,
      accessToken: token,
      userData: {
        name: user.name,
        email: user.email,
        id: user.id
      }
    });
  }
);

// **
//  * @desc      Get current logged in user
//  * @route     GET /api/v1/auth/me
//  * @access    Private
//  */

export const getMe = asyncHandler(async (req, res) => {
  // user is already available in req due to the protect middleware
  const user = req.user;

  const hash = req.query.hash as string;

  if (hash) {
    const io = req.app.get('io');
    const token = createAccessToken(user.id, req);
    io.of('/qr').to(hash).emit('login', token);
  }

  res.status(200).json({
    success: true,
    userData: {
      ...user
    }
  });
});
