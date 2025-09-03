import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Rarity } from './Rarity';
import { Cost } from './Cost';
import { Effect } from './Effect';
import { Requirement } from './Requirement';
import { Tag } from './Tag';

@Index('IX_Talent_Rarity', ['rarityId'], {})
@Index('PK__Talent__3213E83F582F2133', ['id'], { unique: true })
@Entity({ name: 'talents' })
export class Talent {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('nvarchar', { name: 'name', length: 200 })
  name?: string;

  @Column('nvarchar', { name: 'description', nullable: true })
  description?: string | null;

  @Column('datetime2', { name: 'created_at', default: () => 'sysutcdatetime()' })
  createdAt?: Date;

  @Column('datetime2', { name: 'updated_at', default: () => 'sysutcdatetime()' })
  updatedAt?: Date;

  @Column('bit', { name: 'is_key_talent', default: () => '(0)' })
  isKeyTalent?: boolean;

  @Column('nvarchar', { name: 'category', nullable: true, length: 100 })
  category?: string | null;

  @Column('int', { name: 'cooldown', default: () => '(0)' })
  cooldown?: number;

  @Column('int', { name: 'rank', default: () => '(1)' })
  rank?: number;

  @Column('int', { name: 'max_rank', default: () => '(1)' })
  maxRank?: number;

  @Column('uniqueidentifier', { name: 'rarity_id', nullable: true })
  rarityId?: string | null;

  @ManyToOne(() => Rarity, (rarity) => rarity.talents)
  @JoinColumn([{ name: 'rarity_id', referencedColumnName: 'id' }])
  rarity?: Rarity;

  @ManyToMany(() => Cost, (cost) => cost.talents)
  @JoinTable({
    name: 'talent_costs',
    joinColumns: [{ name: 'talent_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'cost_id', referencedColumnName: 'id' }],
    schema: 'dbo'
  })
  costs?: Cost[];

  @ManyToMany(() => Effect, (effect) => effect.talents)
  @JoinTable({
    name: 'talent_effects',
    joinColumns: [{ name: 'talent_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'effect_id', referencedColumnName: 'id' }],
    schema: 'dbo'
  })
  effects?: Effect[];

  @ManyToMany(() => Requirement, (requirement) => requirement.talents)
  @JoinTable({
    name: 'talent_requirements',
    joinColumns: [{ name: 'talent_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'requirement_id', referencedColumnName: 'id' }],
    schema: 'dbo'
  })
  requirements?: Requirement[];

  @ManyToMany(() => Tag, (tag) => tag.talents)
  @JoinTable({
    name: 'talent_tags',
    joinColumns: [{ name: 'talent_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'tag_id', referencedColumnName: 'id' }],
    schema: 'dbo'
  })
  tags?: Tag[];
}
