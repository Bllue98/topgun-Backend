import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1756115000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add [role] column with default 'client' and backfill existing rows using WITH VALUES
    await queryRunner.query(`
      IF COL_LENGTH('dbo.users', 'role') IS NULL
      BEGIN
        ALTER TABLE [dbo].[users]
          ADD [role] NVARCHAR(50) NOT NULL CONSTRAINT [DF_users_role] DEFAULT N'client' WITH VALUES;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop default constraint if exists, then drop column
    await queryRunner.query(`
      IF COL_LENGTH('dbo.users', 'role') IS NOT NULL
      BEGIN
        DECLARE @constraintName SYSNAME;
        SELECT @constraintName = dc.name
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
        INNER JOIN sys.tables t ON t.object_id = dc.parent_object_id
        WHERE t.name = 'users' AND c.name = 'role';

        IF @constraintName IS NOT NULL
        BEGIN
          EXEC('ALTER TABLE [dbo].[users] DROP CONSTRAINT [' + @constraintName + ']');
        END

        ALTER TABLE [dbo].[users] DROP COLUMN [role];
      END
    `);
  }
}
