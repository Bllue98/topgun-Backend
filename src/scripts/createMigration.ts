import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const defaultMigrationPath = './src/migrations';

async function createMigration(migrationName: string): Promise<boolean> {
  const migrationFullPath = `${defaultMigrationPath}/${migrationName}`;
  console.log();

  try {
    const { stdout, stderr } = await execAsync(
      `npx typeorm-ts-node-esm migration:create ${migrationFullPath}`
    );

    console.log(stdout);
    if (stderr) {
      console.error('Error:', stderr);
    }
    return true;
  } catch (error) {
    console.error('Failed to create migration:', error);
    return false;
  }
}

const migrationName = process.argv[2];
console.log('name', migrationName);

if (!migrationName) {
  console.error('Please provide a name for the migration.');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

// eslint-disable-next-line promise/always-return
createMigration(migrationName)
  .then((output) => {
    // eslint-disable-next-line promise/always-return
    if (output) {
      console.log('Migration created successfully');
    }
  })
  .catch((error) => {
    console.error('Failed to create migration:', error);
  });
