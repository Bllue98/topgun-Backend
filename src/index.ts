import 'reflect-metadata';
import path from 'node:path';
import express from 'express';

import { AppDataSource } from './data-source';
import app from './app';
import config from './config/config';
import logger from './middleware/logger';
import { runSeeds } from './run-seeds';

(async () => {
  await AppDataSource.initialize();

  logger.info('Connecting Datasource');

  if (!AppDataSource.isInitialized) {
    logger.error('Datasource didnt initialize');
    process.exit(1);
  }

  logger.info('Running migrations');
  await AppDataSource.runMigrations({ transaction: 'each' });
  logger.info('Migrations ran');

  await runSeeds();

  const server = app.listen(config.server.port, () => {
    logger.info(`Server is running on Port: ${config.server.port}`);
  });

  if (config.nodeEnv === 'production') {
    const staticPath = path.join(process.cwd(), 'out');
    app.use(express.static(staticPath, { extensions: ['html'] }));
    app.get('*', (req, res) => {
      if (req.method !== 'GET' || req.path.includes('.')) return res.status(404).end();
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Closing server.');
    server.close((err) => {
      if (err) {
        logger.error(err);
        process.exit(1);
      } else {
        logger.info('Server closed. Exiting process now.');
        process.exit(0);
      }
    });
  });
})().catch((err) => {
  logger.error(err);
});
