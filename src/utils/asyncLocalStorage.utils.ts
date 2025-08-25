import { AsyncLocalStorage, AsyncResource } from 'node:async_hooks';
import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export const setCurrentUser = (user: any) => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.set('user', user);
  }
};

export const getCurrentUser = () => {
  const store = asyncLocalStorage.getStore();
  return store ? store.get('user') : null;
};

export const bypassAuditor = () => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.set('bypassAuditor', true);
  }
};

export const isBypassedAuditor = () => {
  const store = asyncLocalStorage.getStore();
  return store ? store.get('bypassAuditor') : false;
};

export const runWithContext = (fn: () => void) => {
  asyncLocalStorage.run(new Map(), fn);
};

export function ensureAsyncContext(middleware: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    middleware(req, res, AsyncResource.bind(next));
  };
}
