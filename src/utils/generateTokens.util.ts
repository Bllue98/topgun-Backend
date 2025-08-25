import { sign, type SignOptions } from 'jsonwebtoken';
import config from 'src/config/config';
import { type TypedRequest } from 'src/types';

/**
 * This functions generates a valid access token
 *
 * @param {number | string} userId - The user id of the user that owns this jwt
 * @returns Returns a valid access token
 */
export const createAccessToken = (userId: number, req: TypedRequest): string => {
  const remoteIp = req.headers['x-forwarded-for'] ?? req.ip;

  const payload = {
    id: userId,
    ip: remoteIp
  };

  const expiresInOption = (config.jwt.access_token.expire ?? '15m') as unknown as NonNullable<SignOptions['expiresIn']>;

  const options: SignOptions = {
    expiresIn: expiresInOption,
    algorithm: 'HS256'
  };

  return sign(payload, config.jwt.access_token.secret, options);
};

/**
 * This functions generates a  valid reset token

 * @param {number | string} userId - The user id of the user that owns this jwt
 * @returns Returns a valid reset token
 */

export const createResetToken = (userId: number | string): string => {
  const expiresInOption = (config.jwt.access_token.expire ?? '15m') as unknown as NonNullable<SignOptions['expiresIn']>;
  const options: SignOptions = { expiresIn: expiresInOption };
  return sign({ id: userId }, config.jwt.access_token.secret, options);
};
