import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
@Unique(['email'])
export class User {
  // BIGINT IDENTITY — TypeORM returns it as string in JS
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'nvarchar', length: 255 })
  email: string;

  @Column({ type: 'nvarchar', length: 255, select: false })
  password: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  name?: string | null;

  @Column({ name: 'is_active', type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn({
    type: 'datetime2',
    name: 'created_at',
    precision: 3,
    default: () => 'SYSUTCDATETIME()'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime2',
    name: 'updated_at',
    precision: 3,
    default: () => 'SYSUTCDATETIME()'
  })
  updatedAt: Date;
}
