import logger from 'src/middleware/logger';
import { SeedingDataSource } from 'src/seed-data-source';

export const runSeeds = async () => {
  await SeedingDataSource.initialize();

  logger.info('Seeding database');

  const queryRunner = SeedingDataSource.createQueryRunner();

  let transactionStartedByUs = false;
  try {
    for (const migration of SeedingDataSource.migrations) {
      if (migration.transaction && !queryRunner.isTransactionActive) {
        await queryRunner.beforeMigration();
        await queryRunner.startTransaction();
        transactionStartedByUs = true;
      }

      await migration
        .up(queryRunner)
        .catch((error) => {
          // informative log about migration failure
          logger.error(`Seed "${migration.name ?? migration.constructor.name}" failed, error: ${error?.message}`);
          throw error;
        })
        .then(async () => {
          // commit transaction if we started it
          if (migration.transaction && transactionStartedByUs) {
            await queryRunner.commitTransaction();
            await queryRunner.afterMigration();
          }

          return;
        })
        .then(() => {
          // informative log about migration success
          logger.info(`Seed ${migration.name ?? migration.constructor.name} has been executed successfully.`);

          return;
        });
    }
  } catch (err) {
    if (transactionStartedByUs) {
      try {
        // we throw original error even if rollback thrown an error
        await queryRunner.rollbackTransaction();
      } catch (rollbackError) {}
    }

    throw err;
  } finally {
    await queryRunner.release();
  }

  logger.info('Database seeded');

  await SeedingDataSource.destroy();
};
