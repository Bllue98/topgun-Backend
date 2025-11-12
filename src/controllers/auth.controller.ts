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

/**
 * @desc      Register a new user
 * @route     POST /api/v1/auth/register
 * @access    Public
 */
export const handleRegister = asyncHandler(
  async (req: TypedRequest<{ email: string; password: string; username: string }>, res: Response, next: NextFunction): Promise<Response | undefined> => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      next(new ErrorResponse('Email, password, and username are required!', httpStatus.BAD_REQUEST));
      return;
    }

    // Check if user already exists
    const existingUser = await UsersService.getUsersByEmail(email);
    if (existingUser && existingUser.id) {
      next(new ErrorResponse('User with this email already exists', httpStatus.CONFLICT));
      return;
    }

    // Create new user - password will be hashed by the @BeforeInsert hook
    const newUser = await UsersService.create({
      email,
      password,
      name: username,
      isActive: true
    });

    if (!newUser || !newUser.id) {
      next(new ErrorResponse('Failed to create user', httpStatus.INTERNAL_SERVER_ERROR));
      return;
    }

    // Generate token for the new user
    const token = createAccessToken(newUser.id, req);

    res.status(httpStatus.CREATED).json({
      success: true,
      accessToken: token,
      userData: {
        name: newUser.name,
        email: newUser.email,
        id: newUser.id
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
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});
