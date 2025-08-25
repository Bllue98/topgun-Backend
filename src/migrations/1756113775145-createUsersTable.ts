import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1756113775145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE [dbo].[users] (
        [id] BIGINT IDENTITY(1,1) NOT NULL,
        [email] NVARCHAR(255) NOT NULL,
        [password] NVARCHAR(255) NOT NULL,
        [name] NVARCHAR(255) NULL,
        [is_active] BIT NOT NULL CONSTRAINT [DF_users_is_active] DEFAULT 1,
        [created_at] DATETIME2(3) NOT NULL CONSTRAINT [DF_users_created_at] DEFAULT SYSUTCDATETIME(),
        [updated_at] DATETIME2(3) NOT NULL CONSTRAINT [DF_users_updated_at] DEFAULT SYSUTCDATETIME(),
        CONSTRAINT [PK_users_id] PRIMARY KEY ([id])
      );
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_users_email' AND object_id = OBJECT_ID('dbo.users'))
      CREATE UNIQUE INDEX [UQ_users_email] ON [dbo].[users] ([email]);
    `);

    // keep updated_at in sync on updates (matches v1 pattern)
    await queryRunner.query(`
      IF OBJECT_ID('dbo.users_set_updated_at', 'TR') IS NULL
      EXEC('CREATE TRIGGER [dbo].[users_set_updated_at]
        ON [dbo].[users]
        AFTER UPDATE
        AS
        BEGIN
          SET NOCOUNT ON;
          UPDATE u
            SET [updated_at] = SYSUTCDATETIME()
          FROM [dbo].[users] u
          JOIN inserted i ON i.[id] = u.[id];
        END');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID('dbo.users_set_updated_at', 'TR') IS NOT NULL
      DROP TRIGGER [dbo].[users_set_updated_at];
    `);

    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_users_email' AND object_id = OBJECT_ID('dbo.users'))
      DROP INDEX [UQ_users_email] ON [dbo].[users];
    `);

    await queryRunner.query(`
      IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
      DROP TABLE [dbo].[users];
    `);
  }
}
