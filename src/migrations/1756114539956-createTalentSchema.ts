import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTalentSchema1756114539956 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // rarities
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='rarities' AND xtype='U')
      CREATE TABLE [dbo].[rarities] (
        [id] BIGINT IDENTITY(1,1) NOT NULL,
        [tier] NVARCHAR(20) NOT NULL,
        [weight] FLOAT NOT NULL CONSTRAINT [DF_rarities_weight] DEFAULT 1,
        [color] NVARCHAR(7) NULL,
        CONSTRAINT [PK_rarities_id] PRIMARY KEY ([id]),
        CONSTRAINT [CK_rarities_tier] CHECK ([tier] IN (N'common', N'rare', N'legendary')),
        CONSTRAINT [CK_rarities_weight] CHECK ([weight] >= 0),
        CONSTRAINT [CK_rarities_color_hex] CHECK ([color] IS NULL OR [color] LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]')
      );
    `);

    // talents
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='talents' AND xtype='U')
      CREATE TABLE [dbo].[talents] (
        [id] BIGINT IDENTITY(1,1) NOT NULL,
        [name] NVARCHAR(200) NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [created_at] DATETIME2(3) NOT NULL CONSTRAINT [DF_talents_created_at] DEFAULT SYSUTCDATETIME(),
        [updated_at] DATETIME2(3) NOT NULL CONSTRAINT [DF_talents_updated_at] DEFAULT SYSUTCDATETIME(),
        [is_key_talent] BIT NOT NULL CONSTRAINT [DF_talents_is_key_talent] DEFAULT 0,
        [category] NVARCHAR(100) NULL,
        [cooldown] INT NOT NULL CONSTRAINT [DF_talents_cooldown] DEFAULT 0,
        [rank] INT NOT NULL CONSTRAINT [DF_talents_rank] DEFAULT 1,
        [max_rank] INT NOT NULL CONSTRAINT [DF_talents_max_rank] DEFAULT 1,
        [rarity_id] BIGINT NULL,
        CONSTRAINT [PK_talents_id] PRIMARY KEY ([id]),
        CONSTRAINT [CK_talents_cooldown_nonneg] CHECK ([cooldown] >= 0),
        CONSTRAINT [CK_talents_rank_pos] CHECK ([rank] > 0),
        CONSTRAINT [CK_talents_max_rank_pos] CHECK ([max_rank] > 0),
        CONSTRAINT [CK_talents_rank_vs_max] CHECK ([rank] <= [max_rank])
      );
    `);

    // talents foreign key to rarities
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talents_rarities' AND parent_object_id = OBJECT_ID('dbo.talents')
      )
      ALTER TABLE [dbo].[talents]
      ADD CONSTRAINT [fk_talents_rarities]
      FOREIGN KEY ([rarity_id]) REFERENCES [dbo].[rarities]([id]);
    `);

    // trigger to keep updated_at current on updates
    await queryRunner.query(`
      IF OBJECT_ID('dbo.talents_set_updated_at', 'TR') IS NULL
      EXEC('CREATE TRIGGER [dbo].[talents_set_updated_at]
        ON [dbo].[talents]
        AFTER UPDATE
        AS
        BEGIN
          SET NOCOUNT ON;
          UPDATE t
            SET [updated_at] = SYSUTCDATETIME()
          FROM [dbo].[talents] t
          JOIN inserted i ON i.[id] = t.[id];
        END');
    `);

    // helpful index on rarity
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talents_rarity_id' AND object_id = OBJECT_ID('dbo.talents'))
      CREATE INDEX [ix_talents_rarity_id] ON [dbo].[talents] ([rarity_id]);
    `);

    // tags
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tags' AND xtype='U')
      CREATE TABLE [dbo].[tags] (
        [id] BIGINT IDENTITY(1,1) NOT NULL,
        [tag] NVARCHAR(100) NOT NULL,
        CONSTRAINT [PK_tags_id] PRIMARY KEY ([id])
      );
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_tags_tag' AND object_id = OBJECT_ID('dbo.tags'))
      CREATE UNIQUE INDEX [UQ_tags_tag] ON [dbo].[tags] ([tag]);
    `);

    // costs
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='costs' AND xtype='U')
      CREATE TABLE [dbo].[costs] (
        [id] BIGINT IDENTITY(1,1) NOT NULL,
        [kind] NVARCHAR(20) NOT NULL,
        [resource] NVARCHAR(20) NOT NULL,
        [amount] FLOAT NULL,
        [max_uses] INT NULL,
        CONSTRAINT [PK_costs_id] PRIMARY KEY ([id]),
        CONSTRAINT [CK_costs_kind_resource_only] CHECK ([kind] = N'resource'),
        CONSTRAINT [CK_costs_resource_enum] CHECK ([resource] IN (N'ether', N'stamina', N'none')),
        CONSTRAINT [CK_costs_amount_pos_or_null] CHECK ([amount] IS NULL OR [amount] > 0),
        CONSTRAINT [CK_costs_max_uses_pos_or_null] CHECK ([max_uses] IS NULL OR [max_uses] > 0),
        CONSTRAINT [ck_costs_stamina_no_max_uses] CHECK (NOT ([resource] = N'stamina' AND [max_uses] IS NOT NULL)),
        CONSTRAINT [ck_costs_none_no_amount] CHECK (NOT ([resource] = N'none' AND [amount] IS NOT NULL))
      );
    `);

    // requirements
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='requirements' AND xtype='U')
      CREATE TABLE [dbo].[requirements] (
        [id] BIGINT IDENTITY(1,1) NOT NULL,
        [kind] NVARCHAR(20) NOT NULL,
        [data] NVARCHAR(MAX) NOT NULL,
        CONSTRAINT [PK_requirements_id] PRIMARY KEY ([id]),
        CONSTRAINT [CK_requirements_kind_enum] CHECK ([kind] IN (N'level', N'stat', N'talent', N'tag', N'class')),
        CONSTRAINT [CK_requirements_data_json] CHECK (ISJSON([data]) = 1)
      );
    `);

    // effects
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='effects' AND xtype='U')
      CREATE TABLE [dbo].[effects] (
        [id] BIGINT IDENTITY(1,1) NOT NULL,
        [kind] NVARCHAR(20) NOT NULL,
        [duration_type] NVARCHAR(20) NOT NULL,
        [duration_amount] FLOAT NULL,
        [data] NVARCHAR(MAX) NOT NULL,
        CONSTRAINT [PK_effects_id] PRIMARY KEY ([id]),
        CONSTRAINT [CK_effects_kind_enum] CHECK ([kind] IN (N'stat-mod', N'damage', N'heal')),
        CONSTRAINT [CK_effects_duration_type_enum] CHECK ([duration_type] IN (N'instant', N'turns', N'seconds')),
        CONSTRAINT [CK_effects_data_json] CHECK (ISJSON([data]) = 1),
        CONSTRAINT [ck_effects_duration_rule] CHECK (
          ([duration_type] = N'instant' AND [duration_amount] IS NULL) OR
          ([duration_type] IN (N'turns', N'seconds') AND [duration_amount] IS NOT NULL AND [duration_amount] > 0)
        )
      );
    `);

    // m:n junctions
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='talent_tags' AND xtype='U')
      CREATE TABLE [dbo].[talent_tags] (
        [talent_id] BIGINT NOT NULL,
        [tag_id] BIGINT NOT NULL,
        CONSTRAINT [pk_talent_tags] PRIMARY KEY ([talent_id], [tag_id])
      );
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_tags_talents' AND parent_object_id = OBJECT_ID('dbo.talent_tags')
      )
      ALTER TABLE [dbo].[talent_tags]
      ADD CONSTRAINT [fk_talent_tags_talents] FOREIGN KEY ([talent_id]) REFERENCES [dbo].[talents]([id]) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_tags_tags' AND parent_object_id = OBJECT_ID('dbo.talent_tags')
      )
      ALTER TABLE [dbo].[talent_tags]
      ADD CONSTRAINT [fk_talent_tags_tags] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[tags]([id]) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='talent_costs' AND xtype='U')
      CREATE TABLE [dbo].[talent_costs] (
        [talent_id] BIGINT NOT NULL,
        [cost_id] BIGINT NOT NULL,
        CONSTRAINT [pk_talent_costs] PRIMARY KEY ([talent_id], [cost_id])
      );
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_costs_talents' AND parent_object_id = OBJECT_ID('dbo.talent_costs')
      )
      ALTER TABLE [dbo].[talent_costs]
      ADD CONSTRAINT [fk_talent_costs_talents] FOREIGN KEY ([talent_id]) REFERENCES [dbo].[talents]([id]) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_costs_costs' AND parent_object_id = OBJECT_ID('dbo.talent_costs')
      )
      ALTER TABLE [dbo].[talent_costs]
      ADD CONSTRAINT [fk_talent_costs_costs] FOREIGN KEY ([cost_id]) REFERENCES [dbo].[costs]([id]) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talent_costs_cost_id' AND object_id = OBJECT_ID('dbo.talent_costs'))
      CREATE INDEX [ix_talent_costs_cost_id] ON [dbo].[talent_costs] ([cost_id]);
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='talent_requirements' AND xtype='U')
      CREATE TABLE [dbo].[talent_requirements] (
        [talent_id] BIGINT NOT NULL,
        [requirement_id] BIGINT NOT NULL,
        CONSTRAINT [pk_talent_requirements] PRIMARY KEY ([talent_id], [requirement_id])
      );
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_requirements_talents' AND parent_object_id = OBJECT_ID('dbo.talent_requirements')
      )
      ALTER TABLE [dbo].[talent_requirements]
      ADD CONSTRAINT [fk_talent_requirements_talents] FOREIGN KEY ([talent_id]) REFERENCES [dbo].[talents]([id]) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_requirements_requirements' AND parent_object_id = OBJECT_ID('dbo.talent_requirements')
      )
      ALTER TABLE [dbo].[talent_requirements]
      ADD CONSTRAINT [fk_talent_requirements_requirements] FOREIGN KEY ([requirement_id]) REFERENCES [dbo].[requirements]([id]) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talent_requirements_requirement_id' AND object_id = OBJECT_ID('dbo.talent_requirements'))
      CREATE INDEX [ix_talent_requirements_requirement_id] ON [dbo].[talent_requirements] ([requirement_id]);
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='talent_effects' AND xtype='U')
      CREATE TABLE [dbo].[talent_effects] (
        [talent_id] BIGINT NOT NULL,
        [effect_id] BIGINT NOT NULL,
        CONSTRAINT [pk_talent_effects] PRIMARY KEY ([talent_id], [effect_id])
      );
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_effects_talents' AND parent_object_id = OBJECT_ID('dbo.talent_effects')
      )
      ALTER TABLE [dbo].[talent_effects]
      ADD CONSTRAINT [fk_talent_effects_talents] FOREIGN KEY ([talent_id]) REFERENCES [dbo].[talents]([id]) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_talent_effects_effects' AND parent_object_id = OBJECT_ID('dbo.talent_effects')
      )
      ALTER TABLE [dbo].[talent_effects]
      ADD CONSTRAINT [fk_talent_effects_effects] FOREIGN KEY ([effect_id]) REFERENCES [dbo].[effects]([id]) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talent_effects_effect_id' AND object_id = OBJECT_ID('dbo.talent_effects'))
      CREATE INDEX [ix_talent_effects_effect_id] ON [dbo].[talent_effects] ([effect_id]);
    `);

    // seed convenience rarity
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM [dbo].[rarities] WHERE [tier] = N'common')
      INSERT INTO [dbo].[rarities] ([tier], [weight], [color]) VALUES (N'common', 1, NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop trigger
    await queryRunner.query(`
      IF OBJECT_ID('dbo.talents_set_updated_at', 'TR') IS NOT NULL
      DROP TRIGGER [dbo].[talents_set_updated_at];
    `);

    // drop indexes on junctions
    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talent_effects_effect_id' AND object_id = OBJECT_ID('dbo.talent_effects'))
      DROP INDEX [ix_talent_effects_effect_id] ON [dbo].[talent_effects];
    `);
    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talent_requirements_requirement_id' AND object_id = OBJECT_ID('dbo.talent_requirements'))
      DROP INDEX [ix_talent_requirements_requirement_id] ON [dbo].[talent_requirements];
    `);
    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talent_costs_cost_id' AND object_id = OBJECT_ID('dbo.talent_costs'))
      DROP INDEX [ix_talent_costs_cost_id] ON [dbo].[talent_costs];
    `);

    // drop junction tables (FKs drop with tables)
    await queryRunner.query(`
      IF OBJECT_ID('dbo.talent_effects', 'U') IS NOT NULL
      DROP TABLE [dbo].[talent_effects];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.talent_requirements', 'U') IS NOT NULL
      DROP TABLE [dbo].[talent_requirements];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.talent_costs', 'U') IS NOT NULL
      DROP TABLE [dbo].[talent_costs];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.talent_tags', 'U') IS NOT NULL
      DROP TABLE [dbo].[talent_tags];
    `);

    // drop unique/indexes on base tables
    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_tags_tag' AND object_id = OBJECT_ID('dbo.tags'))
      DROP INDEX [UQ_tags_tag] ON [dbo].[tags];
    `);
    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_talents_rarity_id' AND object_id = OBJECT_ID('dbo.talents'))
      DROP INDEX [ix_talents_rarity_id] ON [dbo].[talents];
    `);

    // drop base tables (order respects FKs)
    await queryRunner.query(`
      IF OBJECT_ID('dbo.effects', 'U') IS NOT NULL
      DROP TABLE [dbo].[effects];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.requirements', 'U') IS NOT NULL
      DROP TABLE [dbo].[requirements];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.costs', 'U') IS NOT NULL
      DROP TABLE [dbo].[costs];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.tags', 'U') IS NOT NULL
      DROP TABLE [dbo].[tags];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.talents', 'U') IS NOT NULL
      DROP TABLE [dbo].[talents];
    `);
    await queryRunner.query(`
      IF OBJECT_ID('dbo.rarities', 'U') IS NOT NULL
      DROP TABLE [dbo].[rarities];
    `);
  }
}
