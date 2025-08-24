/* eslint-disable eol-last, no-trailing-spaces */
import { type RequestHandler } from 'express';
import { runWithContext } from 'src/utils/asyncLocalStorage.utils';

const contextMiddleware: RequestHandler = (_req, _res, next) => {
  runWithContext(() => {
    next();
  });
};

export default contextMiddleware;
