import { MigrationInterface, QueryRunner } from 'typeorm';
import bcrypt from 'bcryptjs';

export class SeeedUsers1756113876330 implements MigrationInterface {
  transaction = true;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = [
      { email: 'admin@example.com', name: 'Admin User', is_active: 1 },
      { email: 'jane.doe@example.com', name: 'Jane Doe', is_active: 1 },
      { email: 'john.smith@example.com', name: 'John Smith', is_active: 1 }
    ];

    for (const user of users) {
      const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
      await queryRunner.manager.insert('users', {
        email: user.email,
        password: passwordHash,
        name: user.name,
        is_active: user.is_active
      });
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op for seed rollback
  }
}
