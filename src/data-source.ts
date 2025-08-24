/* eslint-disable n/handle-callback-err */

import { DataSource } from 'typeorm';
import config from './config/config';
import { entitiesAndMigrations } from './entities-and-migrations';

console.log(entitiesAndMigrations.entities);
console.log(entitiesAndMigrations.migrations);

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  extra: {
    encrypt: true,
    trustServerCertificate: true,
    requestTimeout: 160000
  },
  migrationsRun: false,
  logging: false,
  entities: entitiesAndMigrations.entities ?? [],
  migrations: entitiesAndMigrations.migrations ?? []
});
