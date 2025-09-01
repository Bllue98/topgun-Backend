import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cost } from './Cost';
import { Effect } from './Effect';
import { Requirement } from './Requirement';
import { Tag } from './Tag';
import { Rarity } from './Rarity';

@Index('idx_talent_name', ['name'], {})
@Index('PK__talents__3213E83F1F279FEC', ['id'], { unique: true })
@Entity('talents')
export class Talent {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('varchar', { name: 'name', length: 255 })
  name?: string;

  @Column('nvarchar', { name: 'description', nullable: true })
  description?: string | null;

  @Column('bit', { name: 'is_key_talent', default: () => '(0)' })
  isKeyTalent?: boolean;

  @Column('varchar', { name: 'category', nullable: true, length: 255 })
  category?: string | null;

  @Column('int', { name: 'cooldown', default: () => '(0)' })
  cooldown?: number;

  @Column('int', { name: 'rank', default: () => '(1)' })
  rank?: number;

  @Column('int', { name: 'max_rank', default: () => '(1)' })
  maxRank?: number;

  @OneToMany(() => Cost, (cost) => cost.talent)
  cost?: Cost[];

  @OneToMany(() => Effect, (effect) => effect.talent)
  effects?: Effect[];

  @OneToMany(() => Requirement, (requirement) => requirement.talent)
  requirements?: Requirement[];

  @OneToMany(() => Tag, (tag) => tag.talent)
  talentTags?: Tag[];

  @ManyToOne(() => Rarity, (rarity) => rarity.talents)
  @JoinColumn([{ name: 'rarity_id', referencedColumnName: 'id' }])
  rarity?: Rarity;
}
